import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';

const ExportTypSchema = z.object({
    typstCode: z.string().min(1).max(500000),
    filename: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 2 * 1024 * 1024) {
        return NextResponse.json({ error: 'Payload too large. Maximum allowed size is 2MB.' }, { status: 413 });
    }

    const auth = await requireUser();
    if (auth.response) return auth.response;

    const body = await req.json().catch(() => null);
    const parsed = ExportTypSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }

    const filename = (parsed.data.filename || 'resume').replace(/[^a-zA-Z0-9-_]+/g, '-');
    return new NextResponse(parsed.data.typstCode, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}.typ"`,
            'Cache-Control': 'no-store',
        },
    });
}
