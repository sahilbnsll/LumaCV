import { NextRequest, NextResponse } from 'next/server';
import { CompileLatexRequestSchema } from '@/lib/resume-schema';
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
        const validatedInput = CompileLatexRequestSchema.safeParse(body);

        if (!validatedInput.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validatedInput.error.format() },
                { status: 400 }
            );
        }

        const { latexCode } = validatedInput.data;

        // Use latex.ytotech.com POST API with exponential backoff for 429 errors
        let pdfBuffer: ArrayBuffer | null = null;
        let lastError = null;
        const maxRetries = 3;
        const baseDelayMs = 1500;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            console.log(`[Compile API] Attempt ${attempt}/${maxRetries} sending to latex.ytotech.com...`);
            
            try {
                const response = await fetch('https://latex.ytotech.com/builds/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        compiler: 'pdflatex',
                        resources: [{ main: true, content: latexCode }],
                    }),
                });

                if (response.ok) {
                    pdfBuffer = await response.arrayBuffer();
                    break; // Success, exit retry loop
                }

                const errorText = await response.text();
                
                // If it's a 429 Rate Limit, we want to wait and retry
                if (response.status === 429 && attempt < maxRetries) {
                    const delay = baseDelayMs * Math.pow(2, attempt - 1);
                    console.warn(`[Compile API] Rate limited (429). Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                // If it's a LaTeX compilation error (syntax error in TeX), retrying won't help
                throw new Error(`LaTeX Compilation Failed (Status ${response.status}): ${errorText.substring(0, 500)}`);
                
            } catch (error) {
                lastError = error;
                // If network error, we want to retry
                if (attempt < maxRetries) {
                    const delay = baseDelayMs * Math.pow(2, attempt - 1);
                    console.warn(`[Compile API] Network error: ${error instanceof Error ? error.message : 'Unknown'}. Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        if (!pdfBuffer) {
            throw lastError || new Error("Failed to compile LaTeX after multiple attempts");
        }

        // Return as PDF stream
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="resume.pdf"',
            },
        });

    } catch (error: unknown) {
        console.error('Compile Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            { error: 'Failed to compile PDF', details: errorMessage },
            { status: 500 }
        );
    }
}
