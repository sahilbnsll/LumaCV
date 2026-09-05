import { NextRequest, NextResponse } from 'next/server';
import { generateStream, collectStream, extractJsonObjectFromAssistantText } from '@/lib/llm-client';
import { AnalyzeJDRequestSchema } from '@/lib/resume-schema';
import { normalizeAnalyzeJDFromLLM } from '@/lib/normalize-jd';
import { promises as fs } from 'fs';
import path from 'path';
import { ratelimit } from '@/lib/rate-limit';
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

        const MAX_RETRIES = 2;
        let lastError: unknown = null;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                console.log(`[JD Analyze] Attempt ${attempt}/${MAX_RETRIES} starting streaming analysis (BYOK: ${usingCustomKeys})...`);
                // Use the new generateStream with our models
                const { textStream, model } = await generateStream(prompt, undefined, 'light', { 
                    maxTokens: 2000,
                    userKeys 
                });

                console.log(`[JD Analyze] Connected via ${model}, collecting stream...`);

                const rawText = await collectStream(textStream);
                console.log(`[JD Analyze] Stream complete (${rawText.length} chars)`);

                const jsonText = extractJsonObjectFromAssistantText(rawText);
                
                // If it's completely empty, throw so we can retry
                if (!jsonText || jsonText.trim() === '') {
                    throw new Error('LLM returned empty JSON text');
                }

                const raw = JSON.parse(jsonText);
                const analysisData = normalizeAnalyzeJDFromLLM(raw);

                return NextResponse.json(analysisData);
            } catch (error: unknown) {
                console.warn(`[JD Analyze] Attempt ${attempt} failed:`, error instanceof Error ? error.message : String(error));
                lastError = error;
                // Wait briefly before retrying if we haven't exhausted attempts
                if (attempt < MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            }
        }

        console.error('JD Analysis Exhausted Retries:', lastError);
        const errorMessage = lastError instanceof Error ? lastError.message : 'An unknown error occurred';
        return NextResponse.json(
            { error: 'Failed to analyze job description after retries', details: errorMessage },
            { status: 500 }
        );

    } catch (error: unknown) {
        console.error('JD Analysis Route Error:', error);
        return NextResponse.json(
            { error: 'Server error processing request' },
            { status: 500 }
        );
    }
}
