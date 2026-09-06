import { NextRequest, NextResponse } from 'next/server';
import { analyzeJobDescription } from '@/lib/jd-analysis';
import { ratelimit } from '@/lib/rate-limit';
import { extractUserApiKeys, hasCustomKeys } from '@/lib/ai-keys';
import { requireUser } from '@/lib/auth';
import { z } from 'zod';

export const maxDuration = 60;

const AnalyzeJDRequestSchema = z.object({
    jd: z.string().min(10, 'Job description is too short'),
});

export async function POST(req: NextRequest) {
    // Strictly enforce authentication for all resume operations
    const auth = await requireUser();
    if (auth.response) return auth.response;

    const userKeys = extractUserApiKeys(req);
    const usingCustomKeys = hasCustomKeys(userKeys);

    if (!usingCustomKeys) {
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
        const result = await analyzeJobDescription(jd, userKeys);
        return NextResponse.json(result);

    } catch (error: unknown) {
        console.error('[AnalyzeJD] Error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to analyze job description', details: message },
            { status: 500 }
        );
    }
}
