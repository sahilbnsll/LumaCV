import { NextRequest, NextResponse } from 'next/server';
import { generateStream, collectStream, extractJsonObjectFromAssistantText } from '@/lib/llm-client';
import { ParseResumeRequestSchema } from '@/lib/resume-schema';
import { normalizeResumeFromLLM } from '@/lib/normalize-resume';
import type { ResumeData } from '@/lib/resume-schema';
import { buildParsePrompt } from '@/lib/prompts';
import { ratelimit } from '@/lib/rate-limit';
import { jsonrepair } from 'jsonrepair';
import { extractUserApiKeys, hasCustomKeys } from '@/lib/ai-keys';
import { requireUser } from '@/lib/auth';

export const maxDuration = 60;

/**
 * The model can return syntactically valid (or jsonrepair-salvageable) JSON
 * that is still substantively empty, e.g. a weaker fallback model returning
 * `{}` under load. normalizeResumeFromLLM's per-field defaults ('Your Name',
 * empty arrays) would otherwise mask that as usable output. Returns null when
 * the parsed content isn't usable, so the caller can fail over to the next
 * model instead of accepting a blank resume.
 */
function tryParseResume(rawText: string): ResumeData | null {
    const jsonText = extractJsonObjectFromAssistantText(rawText);
    let raw: unknown;
    try {
        raw = JSON.parse(jsonText);
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn('[Parse] JSON.parse failed, attempting jsonrepair:', msg);
        try {
            raw = JSON.parse(jsonrepair(jsonText));
        } catch {
            return null;
        }
    }

    const resumeData = normalizeResumeFromLLM(raw);
    const hasContactInfo = Boolean(
        resumeData.personalInfo.email || resumeData.personalInfo.phone || resumeData.personalInfo.linkedin
    );
    const hasRealName = resumeData.personalInfo.name !== 'Your Name';
    const hasContent = resumeData.experience.length > 0 || resumeData.education.length > 0 || resumeData.skills.length > 0;

    if (!hasRealName && !hasContactInfo && !hasContent) {
        console.warn('[Parse] Model returned an empty/unusable resume structure:', JSON.stringify(raw).slice(0, 500));
        return null;
    }

    return resumeData;
}

export async function POST(req: NextRequest) {
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 2 * 1024 * 1024) {
        return NextResponse.json({ error: 'Payload too large. Maximum allowed size is 2MB.' }, { status: 413 });
    }

    // Check authentication; allow guest tryout if within IP rate limit
    const auth = await requireUser();
    const isGuest = !!auth.response;

    const userKeys = extractUserApiKeys(req);
    const usingCustomKeys = hasCustomKeys(userKeys);

    if (!usingCustomKeys) {
        const ip = req.ip ?? "127.0.0.1";
        const rateLimitKey = isGuest ? `parse_guest_${ip}` : `parse_user_${auth.user?.id || ip}`;
        const { success } = await ratelimit.limit(rateLimitKey);
        if (!success) {
            return new NextResponse('Too many parse requests. Please try again later or configure your own AI key.', { status: 429 });
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
        const cleanExtractedText = extractedText.substring(0, 20000);

        const prompt = buildParsePrompt(cleanExtractedText);

        console.log(`[Parse] Starting streaming parse (BYOK: ${usingCustomKeys})...`);
        const { textStream, model } = await generateStream(prompt, undefined, 'heavy', {
            // See tailor route: shrinking this to fit weaker models' limits
            // truncates real responses mid-JSON instead of failing over cleanly.
            // Full resumes with many sections genuinely need this headroom.
            maxTokens: 8000,
            userKeys,
            // Gate failover on actual content quality, not just "did a model
            // respond", a weak fallback model returning an empty/near-empty
            // structure now fails over to the next provider/model instead of
            // being accepted as a 200 success.
            validate: (fullText) => tryParseResume(fullText) !== null,
        });

        console.log(`[Parse] Connected via ${model}, collecting stream...`);

        const rawText = await collectStream(textStream);
        console.log(`[Parse] Stream complete (${rawText.length} chars)`);

        const resumeData = tryParseResume(rawText);
        if (!resumeData) {
            return NextResponse.json(
                { error: 'Could not read this resume', details: 'The AI could not extract any usable content from this PDF. It may be scanned/image-based, password-protected, or every configured AI provider returned an incomplete response, try again or enter your details manually.' },
                { status: 422 }
            );
        }

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
