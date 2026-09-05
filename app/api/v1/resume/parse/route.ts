import { NextRequest, NextResponse } from 'next/server';
import { generateStream, collectStream, extractJsonObjectFromAssistantText } from '@/lib/llm-client';
import { ParseResumeRequestSchema } from '@/lib/resume-schema';
import { normalizeResumeFromLLM } from '@/lib/normalize-resume';
import { getPromptTemplate } from '@/lib/prompt-cache';
import { ratelimit } from '@/lib/rate-limit';
import { jsonrepair } from 'jsonrepair';
import { extractUserApiKeys, hasCustomKeys } from '@/lib/ai-keys';
import { requireUser } from '@/lib/auth';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 2 * 1024 * 1024) {
        return NextResponse.json({ error: 'Payload too large. Maximum allowed size is 2MB.' }, { status: 413 });
    }

    // Strictly enforce authentication for all resume operations
    const auth = await requireUser();
    if (auth.response) return auth.response;

    const userKeys = extractUserApiKeys(req);
    const usingCustomKeys = hasCustomKeys(userKeys);

    if (!usingCustomKeys) {
        const ip = req.ip ?? "127.0.0.1";
        const { success } = await ratelimit.limit(ip);
        if (!success) {
            return new NextResponse('Too many requests. Please try again later or configure your own AI key.', { status: 429 });
        }
    }

    try {
        const body = await req.json();
        const validatedInput = ParseResumeRequestSchema.safeParse(body);

        if (!validatedInput.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validatedInput.error.format() },
                { status: 400 }
            );
        }

        const { extractedText } = validatedInput.data;

        const promptTemplate = await getPromptTemplate('resume-parse.txt');
        const prompt = promptTemplate.replace('{{EXTRACTED_TEXT}}', extractedText.substring(0, 20000));

        console.log(`[Parse] Starting streaming parse (BYOK: ${usingCustomKeys})...`);
        const { textStream, model } = await generateStream(prompt, undefined, 'heavy', { 
            maxTokens: 8000,
            userKeys
        });

        console.log(`[Parse] Connected via ${model}, collecting stream...`);

        // Collect the full stream, then parse + normalize server-side
        const rawText = await collectStream(textStream);
        console.log(`[Parse] Stream complete (${rawText.length} chars)`);

        const jsonText = extractJsonObjectFromAssistantText(rawText);
        let raw: unknown;
        try {
            raw = JSON.parse(jsonText);
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.warn('[Parse] JSON.parse failed, attempting jsonrepair:', msg);
            const repaired = jsonrepair(jsonText);
            raw = JSON.parse(repaired);
        }
        const resumeData = normalizeResumeFromLLM(raw);


        return NextResponse.json(resumeData);


    } catch (error: unknown) {
        console.error('Parse Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            { error: 'Failed to parse resume', details: errorMessage },
            { status: 500 }
        );
    }
}
