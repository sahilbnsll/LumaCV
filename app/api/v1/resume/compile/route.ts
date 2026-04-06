import { NextRequest, NextResponse } from 'next/server';
import { CompileLatexRequestSchema } from '@/lib/resume-schema';
import { hashTextServer } from '@/lib/content-hash';
import { compileLatexProviderCycle } from '@/lib/compiler-service';
import { requireUser } from '@/lib/auth';

export const maxDuration = 60;

const MAX_CYCLES = 3;
const BASE_BACKOFF_MS = 700;

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getBackoffMs(cycle: number): number {
    return BASE_BACKOFF_MS * 2 ** Math.max(0, cycle - 1);
}

export async function POST(req: NextRequest) {
    try {
        const auth = await requireUser();
        if (auth.response) return auth.response;

        const body = await req.json();
        const validatedInput = CompileLatexRequestSchema.safeParse(body);

        if (!validatedInput.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validatedInput.error.format() },
                { status: 400 }
            );
        }

        const { latexCode } = validatedInput.data;
        const compileHash = await hashTextServer(latexCode);
        const attempts = [];

        for (let cycle = 1; cycle <= MAX_CYCLES; cycle += 1) {
            const { result, attempts: cycleAttempts, sawRetryableFailure } = await compileLatexProviderCycle(latexCode, cycle);
            attempts.push(...cycleAttempts);

            if (result) {
                return new NextResponse(result.pdfBuffer, {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': 'inline; filename="resume.pdf"',
                        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600',
                        ETag: `"${compileHash}"`,
                        'X-Compile-Provider': result.provider,
                        'X-Compile-Cycle': String(cycle),
                        'X-Compile-Attempts': String(attempts.length),
                        'X-Compile-Hash': compileHash,
                    },
                });
            }

            if (cycle < MAX_CYCLES && sawRetryableFailure) {
                await sleep(getBackoffMs(cycle));
            } else {
                break;
            }
        }

        return NextResponse.json(
            {
                error: 'Failed to compile PDF',
                details: 'All compile providers failed after retries.',
                attempts,
            },
            { status: 502 }
        );
    } catch (error: unknown) {
        console.error('Compile Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            { error: 'Failed to compile PDF', details: errorMessage },
            { status: 500 }
        );
    }
}
