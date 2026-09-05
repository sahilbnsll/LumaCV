import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 10;

function isAuthorized(req: NextRequest) {
    const expected = process.env.COMPILE_WORKER_SECRET;
    const got = req.headers.get('x-worker-secret');
    return Boolean(expected && got && got === expected);
}

export async function GET(req: NextRequest) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;
    const bucket = process.env.SUPABASE_RESUMES_BUCKET ?? 'resumes';

    const result: {
        supabase: {
            configured: boolean;
            url: string | null;
            bucket: string;
            storageAuthOk: boolean | null;
            storageStatus: number | null;
            storageBody: string | null;
        };
    } = {
        supabase: {
            configured: Boolean(supabaseUrl && serviceKey),
            url: supabaseUrl,
            bucket,
            storageAuthOk: null as null | boolean,
            storageStatus: null as null | number,
            storageBody: null as null | string,
        },
    };

    if (!supabaseUrl || !serviceKey) {
        return NextResponse.json(result);
    }

    // Minimal auth check: list buckets (requires valid key).
    try {
        const r = await fetch(`${supabaseUrl.replace(/\/$/, '')}/storage/v1/bucket`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${serviceKey}`,
                apikey: serviceKey,
            },
            signal: AbortSignal.timeout(8000),
        });
        result.supabase.storageStatus = r.status;
        const body = await r.text();
        result.supabase.storageBody = body.slice(0, 600);
        result.supabase.storageAuthOk = r.ok;
    } catch (e) {
        result.supabase.storageAuthOk = false;
        result.supabase.storageBody = e instanceof Error ? e.message : 'Request failed';
    }

    return NextResponse.json(result);
}
