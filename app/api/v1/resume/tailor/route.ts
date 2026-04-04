import { NextRequest, NextResponse } from 'next/server';
import { generateStream, collectStream, extractJsonObjectFromAssistantText } from '@/lib/llm-client';
import { GenerateResumeRequestSchema, GenerateResumeResponseSchema, ResumeData } from '@/lib/resume-schema';
import { normalizeResumeFromLLM } from '@/lib/normalize-resume';
import { generateLatex } from '@/lib/latex-generator';
import { promises as fs } from 'fs';
import path from 'path';
import { ratelimit } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const ip = req.ip ?? "127.0.0.1";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
        return new NextResponse('Too many requests. Please try again later.', { status: 429 });
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

        const { resumeData, jdKeywords, template } = validatedInput.data;

        // Load prompt
        const promptTemplate = await fs.readFile(path.join(process.cwd(), 'prompts', 'resume-tailor.txt'), 'utf-8');

        const prompt = promptTemplate
            .replace('{{USER_RESUME_JSON}}', JSON.stringify(resumeData))
            .replace('{{JD_KEYWORDS}}', JSON.stringify(jdKeywords));

        let tailoredResume: ResumeData;
        try {
            console.log('[Tailor] Starting streaming tailor...');
            const { textStream, model } = await generateStream(prompt, undefined, 'heavy', { maxTokens: 4000 });
            console.log(`[Tailor] Connected via ${model}, collecting stream...`);

            const rawText = await collectStream(textStream);
            console.log(`[Tailor] Stream complete (${rawText.length} chars)`);

            const jsonText = extractJsonObjectFromAssistantText(rawText);
            const raw = JSON.parse(jsonText);
            tailoredResume = normalizeResumeFromLLM(raw);
        } catch (llmError: unknown) {
            console.error('LLM Tailoring Failed:', llmError);
            tailoredResume = resumeData;
        }

        // Generate LaTeX
        const latexCode = generateLatex(tailoredResume, template);

        const responseData = {
            tailoredResume,
            latexCode,
            confidenceScore: tailoredResume.confidenceScore || 0,
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
