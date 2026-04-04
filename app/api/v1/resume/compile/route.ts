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

        // Use latex.ytotech.com POST API (latexonline.cc only supports GET with query params)
        console.log('Sending to latex.ytotech.com...');
        const response = await fetch('https://latex.ytotech.com/builds/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                compiler: 'pdflatex',
                resources: [
                    {
                        main: true,
                        content: latexCode,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`LaTeX Compilation Failed: ${errorText.substring(0, 500)}`);
        }

        const pdfBuffer = await response.arrayBuffer();

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
