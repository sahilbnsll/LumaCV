import { NextRequest, NextResponse } from 'next/server';
import { generateStream, collectStream, extractJsonObjectFromAssistantText } from '@/lib/llm-client';
import { ParseResumeRequestSchema } from '@/lib/resume-schema';
import { normalizeResumeFromLLM } from '@/lib/normalize-resume';
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
        const validatedInput = ParseResumeRequestSchema.safeParse(body);

        if (!validatedInput.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validatedInput.error.format() },
                { status: 400 }
            );
        }

        const { extractedText } = validatedInput.data;

        const promptTemplate = await fs.readFile(path.join(process.cwd(), 'prompts', 'resume-parse.txt'), 'utf-8');
        const prompt = promptTemplate.replace('{{EXTRACTED_TEXT}}', extractedText.substring(0, 20000));

        console.log('[Parse] Starting streaming parse...');
        const { textStream, model } = await generateStream(prompt, undefined, 'heavy', { maxTokens: 4000 });
        console.log(`[Parse] Connected via ${model}, collecting stream...`);

        // Collect the full stream, then parse + normalize server-side
        const rawText = await collectStream(textStream);
        console.log(`[Parse] Stream complete (${rawText.length} chars)`);

        const jsonText = extractJsonObjectFromAssistantText(rawText);
        const raw = JSON.parse(jsonText);
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
