import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashTextServer } from '@/lib/content-hash';
import { enqueueCompileJob } from '@/lib/qstash';
import { requireUser } from '@/lib/auth';
import { createSignedPdfUrl } from '@/lib/supabase-storage';
import {
    getJobState,
    getPdfCache,
    isPreviewInfraConfigured,
    setJobState,
    setPdfCache,
} from '@/lib/resume-preview-store';

export const maxDuration = 10;

const RenderRequestSchema = z.object({
    latexCode: z.string().min(1),
});

function normalizeBucketName(raw: string | undefined) {
    return (raw || 'resumes').trim().replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');
}

function isLikelySignedPdfUrl(url: unknown, opts: { bucket: string; hash: string }) {
    if (typeof url !== 'string') return false;
    if (!url.startsWith('http')) return false;
    if (!url.includes('/storage/v1/object/sign/')) return false;
    if (!url.includes(`/${opts.bucket}/`)) return false;
    if (!url.includes(`compiled/${opts.hash}.pdf`)) return false;
    if (!url.includes('token=')) return false;
    return true;
}

async function refreshSignedUrlIfNeeded(input: {
    hash: string;
    userId: string;
    cachedUrl?: string;
    cachedPath?: string;
}) {
    const bucket = normalizeBucketName(process.env.SUPABASE_RESUMES_BUCKET);
    if (isLikelySignedPdfUrl(input.cachedUrl, { bucket, hash: input.hash })) return input.cachedUrl as string;
    const path = (input.cachedPath || `compiled/${input.hash}.pdf`).replace(/^\/+/, '');
    const url = await createSignedPdfUrl(path, 60 * 60 * 6);
    const now = new Date().toISOString();
    await setPdfCache(input.hash, { status: 'ready', url, path, userId: input.userId, createdAt: now });
    return url;
}

export async function POST(req: NextRequest) {
        const auth = await requireUser();
        if (auth.response) return auth.response;
        const user = auth.user!;

    if (!isPreviewInfraConfigured()) {
        return NextResponse.json(
            { status: 'unsupported', details: 'Async preview infra is not configured. Falling back to direct compile.' },
            { status: 200 }
        );
    }

    try {
        const body = await req.json();
        const parsed = RenderRequestSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
        }

        const { latexCode } = parsed.data;
        const compileHash = await hashTextServer(latexCode);

        const cached = await getPdfCache(compileHash);
        if (cached?.status === 'ready' && cached.userId === user.id) {
            try {
                const url = await refreshSignedUrlIfNeeded({
                    hash: compileHash,
                    userId: user.id,
                    cachedUrl: cached.url,
                    cachedPath: cached.path,
                });
                return NextResponse.json({ status: 'ready', hash: compileHash, url });
            } catch {
                // If re-signing fails (misconfigured infra), fall through to job creation.
            }
        }

        const existingJob = await getJobState(compileHash);
        if (existingJob && existingJob.userId === user.id) {
            return NextResponse.json({ status: existingJob.status, hash: compileHash, attempts: existingJob.attempts, error: existingJob.lastError ?? null });
        }

        const now = new Date().toISOString();
        await setJobState(compileHash, {
            status: 'queued',
            attempts: 0,
            userId: user.id,
            createdAt: now,
            updatedAt: now,
        });

        await enqueueCompileJob({ compileHash, latexCode, cycle: 1, userId: user.id });

        return NextResponse.json({ status: 'queued', hash: compileHash });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const isQStashAuth =
            message.toLowerCase().includes('qstash') ||
            message.toLowerCase().includes('unable to authenticate') ||
            message.toLowerCase().includes('invalid token');

        return NextResponse.json(
            {
                error: 'Failed to start render job',
                details: message,
                hint: isQStashAuth ? 'Check QSTASH_TOKEN (Upstash QStash project token) and redeploy/restart dev server.' : undefined,
            },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    const auth = await requireUser();
    if (auth.response) return auth.response;
    const user = auth.user!;

    if (!isPreviewInfraConfigured()) {
        return NextResponse.json({ status: 'unsupported' }, { status: 200 });
    }

    const hash = req.nextUrl.searchParams.get('hash');
    if (!hash) {
        return NextResponse.json({ error: 'Missing hash' }, { status: 400 });
    }

    const cached = await getPdfCache(hash);
    if (cached?.status === 'ready' && cached.userId === user.id) {
        try {
            const url = await refreshSignedUrlIfNeeded({
                hash,
                userId: user.id,
                cachedUrl: cached.url,
                cachedPath: cached.path,
            });
            return NextResponse.json({ status: 'ready', hash, url });
        } catch {
            // If signing fails, return the cached URL anyway (may be expired), plus a hint.
            return NextResponse.json({ status: 'ready', hash, url: cached.url, warning: 'Could not refresh signed URL' });
        }
    }

    const job = await getJobState(hash);
    if (!job || job.userId !== user.id) {
        return NextResponse.json({ status: 'missing', hash }, { status: 404 });
    }

    return NextResponse.json({
        status: job.status,
        hash,
        attempts: job.attempts,
        error: job.lastError ?? null,
        provider: job.provider ?? null,
    });
}
