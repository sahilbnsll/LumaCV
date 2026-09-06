import { NextRequest, NextResponse } from 'next/server';
import { analyzeJobDescription } from '@/lib/jd-analysis';
import { AnalyzeJDRequestSchema } from '@/lib/resume-schema';
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
        const analysisData = await analyzeJobDescription(jd, userKeys);
        return NextResponse.json(analysisData);
    } catch (error: unknown) {
        console.error('JD Analysis Route Error:', error);
        return NextResponse.json(
            { error: 'Server error processing request' },
            { status: 500 }
        );
    }
}
