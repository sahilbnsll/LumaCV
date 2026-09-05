import { NextRequest, NextResponse } from 'next/server';
import { generateStream, collectStream, extractJsonObjectFromAssistantText } from '@/lib/llm-client';
import { GenerateResumeRequestSchema, GenerateResumeResponseSchema, ResumeData } from '@/lib/resume-schema';
import { normalizeResumeFromLLM } from '@/lib/normalize-resume';
import { generateTypst } from '@/lib/typst-generator';
import { promises as fs } from 'fs';
import path from 'path';
import { ratelimit } from '@/lib/rate-limit';
import { jsonrepair } from 'jsonrepair';
import { validateAndCleanTailoredResume } from '@/lib/fact-validator';
import { extractUserApiKeys, hasCustomKeys } from '@/lib/ai-keys';
import { requireUser } from '@/lib/auth';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const userKeys = extractUserApiKeys(req);
    const usingCustomKeys = hasCustomKeys(userKeys);

    if (!usingCustomKeys) {
        const auth = await requireUser();
        if (auth.response) return auth.response;

        const ip = req.ip ?? "127.0.0.1";
        const { success } = await ratelimit.limit(ip);

        if (!success) {
            return new NextResponse('Too many requests. Please try again later or configure your own AI key.', { status: 429 });
        }
    }

    try {
        const body = await req.json();
        const validatedInput = GenerateResumeRequestSchema.safeParse(body);

        if (!validatedInput.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validatedInput.error.format() },
                { status: 400 }
            );
        }

        const { resumeData, jdKeywords, template, theme } = validatedInput.data;

        // Load prompt
        const promptTemplate = await fs.readFile(path.join(process.cwd(), 'prompts', 'resume-tailor.txt'), 'utf-8');

        const prompt = promptTemplate
            .replace('{{USER_RESUME_JSON}}', JSON.stringify(resumeData))
            .replace('{{JD_KEYWORDS}}', JSON.stringify(jdKeywords));

        let tailoredResume: ResumeData;
        try {
            console.log(`[Tailor] Starting streaming tailor (BYOK: ${usingCustomKeys})...`);
            const { textStream, model } = await generateStream(prompt, undefined, 'heavy', { 
                maxTokens: 6000,
                userKeys
            });

            console.log(`[Tailor] Connected via ${model}, collecting stream...`);

            const rawText = await collectStream(textStream);
            console.log(`[Tailor] Stream complete (${rawText.length} chars)`);

            const jsonText = extractJsonObjectFromAssistantText(rawText);
            let raw: unknown;
            try {
                raw = JSON.parse(jsonText);
            } catch {
                const repaired = jsonrepair(jsonText);
                raw = JSON.parse(repaired);
            }
            tailoredResume = normalizeResumeFromLLM(raw);
        } catch (llmError: unknown) {
            console.error('LLM Tailoring Failed:', llmError);
            tailoredResume = resumeData;
        }

        // Run post-generation AI Fact Validation against ground truth source evidence
        const factCheck = validateAndCleanTailoredResume(resumeData, tailoredResume);
        tailoredResume = factCheck.cleanedResume;

        // Generate Typst
        const typstCode = generateTypst(tailoredResume, template, theme);

        const responseData = {
            tailoredResume,
            typstCode,
            confidenceScore: tailoredResume.confidenceScore || 0,
            factCheckReport: {
                passed: factCheck.passed,
                issuesCount: factCheck.issues.length,
                preservedMetricsCount: factCheck.preservedMetricsCount,
                verifiedEmployersCount: factCheck.verifiedEmployersCount,
            },
        };




        const validatedOutput = GenerateResumeResponseSchema.safeParse(responseData);
        if (!validatedOutput.success) {
            console.error('Final output validation failed:', validatedOutput.error);
            return NextResponse.json({ error: 'Generated invalid resume structure. Please try again.' }, { status: 500 });
        }

        return NextResponse.json(validatedOutput.data);

    } catch (error: unknown) {
        console.error('API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            { error: 'Internal Server Error', details: errorMessage },
            { status: 500 }
        );
    }
}
