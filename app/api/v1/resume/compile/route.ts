import { NextRequest, NextResponse } from 'next/server';
import { CompileResumeRequestSchema } from '@/lib/resume-schema';
import { hashTextServer } from '@/lib/content-hash';
import { compileTypst } from '@/lib/compiler-service';
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
        const validatedInput = CompileResumeRequestSchema.safeParse(body);

        if (!validatedInput.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validatedInput.error.format() },
                { status: 400 }
            );
        }

        const { resumeData, template, theme, typstCode } = validatedInput.data;
        const codeForHash = typstCode || JSON.stringify(resumeData || '') + (template || '') + (theme || '');
        const compileHash = await hashTextServer(codeForHash);

        const result = await compileTypst({
            resumeData,
            template,
            theme,
            typstCode,
        });


        return new NextResponse(result.pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="resume.pdf"',
                'Cache-Control': 'private, max-age=300, stale-while-revalidate=600',
                ETag: `"${compileHash}"`,
                'X-Compile-Provider': result.provider,
                'X-Compile-Hash': compileHash,
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
