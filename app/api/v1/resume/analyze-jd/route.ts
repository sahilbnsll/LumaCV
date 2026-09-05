import { NextRequest, NextResponse } from 'next/server';
import { generateStream, collectStream, extractJsonObjectFromAssistantText } from '@/lib/llm-client';
import { promises as fs } from 'fs';
import path from 'path';
import { ratelimit } from '@/lib/rate-limit';
import { jsonrepair } from 'jsonrepair';
import { extractUserApiKeys, hasCustomKeys } from '@/lib/ai-keys';
import { requireUser } from '@/lib/auth';
import { z } from 'zod';

export const maxDuration = 60;

const AnalyzeJDRequestSchema = z.object({
    jd: z.string().min(10, 'Job description is too short'),
});

export async function POST(req: NextRequest) {
    const userKeys = extractUserApiKeys(req);
    const usingCustomKeys = hasCustomKeys(userKeys);

    if (!usingCustomKeys) {
        const auth = await requireUser();
        if (auth.response) return auth.response;

        const ip = req.ip ?? '127.0.0.1';
        const { success } = await ratelimit.limit(ip);
        if (!success) {
            return new NextResponse('Too many requests. Please try again later or configure your own AI key.', { status: 429 });
        }
    }

    try {
        const body = await req.json();
        const validated = AnalyzeJDRequestSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validated.error.format() },
                { status: 400 }
            );
        }

        const { jd } = validated.data;

        const promptTemplate = await fs.readFile(
            path.join(process.cwd(), 'prompts', 'jd-analyze.txt'),
            'utf-8'
        );
        const prompt = promptTemplate.replace('{{JD_TEXT}}', jd.substring(0, 12000));

        console.log(`[AnalyzeJD] Starting JD analysis (BYOK: ${usingCustomKeys})...`);
        const { textStream, model } = await generateStream(prompt, undefined, 'light', {
            maxTokens: 1500,
            userKeys,
        });

        console.log(`[AnalyzeJD] Connected via ${model}, collecting stream...`);
        const rawText = await collectStream(textStream);
        console.log(`[AnalyzeJD] Stream complete (${rawText.length} chars)`);

        const jsonText = extractJsonObjectFromAssistantText(rawText);
        let parsed: unknown;
        try {
            parsed = JSON.parse(jsonText);
        } catch {
            const repaired = jsonrepair(jsonText);
            parsed = JSON.parse(repaired);
        }

        return NextResponse.json(parsed);

    } catch (error: unknown) {
        console.error('[AnalyzeJD] Error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to analyze job description', details: message },
            { status: 500 }
        );
    }
}
