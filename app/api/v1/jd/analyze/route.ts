import { NextRequest, NextResponse } from 'next/server';
import { generateStream, collectStream, extractJsonObjectFromAssistantText } from '@/lib/llm-client';
import { AnalyzeJDRequestSchema } from '@/lib/resume-schema';
import { normalizeAnalyzeJDFromLLM } from '@/lib/normalize-jd';
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
        const validatedInput = AnalyzeJDRequestSchema.safeParse(body);

        if (!validatedInput.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validatedInput.error.format() },
                { status: 400 }
            );
        }

        const { jd } = validatedInput.data;

        const promptTemplate = await fs.readFile(
            path.join(process.cwd(), 'prompts', 'jd-analyze.txt'),
            'utf-8'
        );

        const prompt = promptTemplate.replace('{{JD_TEXT}}', jd);

        console.log('[JD Analyze] Starting streaming analysis...');
        const { textStream, model } = await generateStream(prompt, undefined, 'light', { maxTokens: 2000 });
        console.log(`[JD Analyze] Connected via ${model}, collecting stream...`);

        // Collect the full stream, then parse + normalize server-side
        const rawText = await collectStream(textStream);
        console.log(`[JD Analyze] Stream complete (${rawText.length} chars)`);

        const jsonText = extractJsonObjectFromAssistantText(rawText);
        const raw = JSON.parse(jsonText);
        const analysisData = normalizeAnalyzeJDFromLLM(raw);

        return NextResponse.json(analysisData);

    } catch (error: unknown) {
        console.error('JD Analysis Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            { error: 'Failed to analyze job description', details: errorMessage },
            { status: 500 }
        );
    }
}
