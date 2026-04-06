import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';

const ExportTexSchema = z.object({
    latexCode: z.string().min(1),
    filename: z.string().optional(),
});

export async function POST(req: NextRequest) {
    const auth = await requireUser();
    if (auth.response) return auth.response;

    const body = await req.json().catch(() => null);
    const parsed = ExportTexSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }

    const filename = (parsed.data.filename || 'resume').replace(/[^a-zA-Z0-9-_]+/g, '-');
    return new NextResponse(parsed.data.latexCode, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}.tex"`,
            'Cache-Control': 'no-store',
        },
    });
}
