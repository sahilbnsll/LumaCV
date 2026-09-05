import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { compileTypstProviderCycle } from '@/lib/compiler-service';
import { Receiver } from '@upstash/qstash';
import { enqueueCompileJob } from '@/lib/qstash';
import {
    acquireCompileLock,
    getPdfCache,
    releaseCompileLock,
    setJobState,
    setPdfCache,
} from '@/lib/resume-preview-store';
import { createSignedPdfUrl, uploadPdfToSupabase, upsertResumeRecord, SupabaseStorageError } from '@/lib/supabase-storage';

export const maxDuration = 10;

const WorkerSchema = z.object({
    compileHash: z.string().min(10),
    typstCode: z.string().optional(),
    cycle: z.number().int().min(1).max(3).default(1),
    userId: z.string().min(1),
});



export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const signature = req.headers.get('upstash-signature');
    const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
    const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;
    const workerSecret = process.env.COMPILE_WORKER_SECRET;
    const forwardedSecret = req.headers.get('x-worker-secret');

    if (currentSigningKey && nextSigningKey && signature) {
        const receiver = new Receiver({ currentSigningKey, nextSigningKey });
        try {
            await receiver.verify({
                body: rawBody,
                signature,
                url: req.url,
                upstashRegion: req.headers.get('upstash-region') ?? undefined,
            });
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid QStash signature', details: error instanceof Error ? error.message : 'Unknown error' },
                { status: 401 }
            );
        }
    } else if (workerSecret && forwardedSecret !== workerSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (() => {
        try {
            return JSON.parse(rawBody || 'null');
        } catch {
            return null;
        }
    })();
    const parsed = WorkerSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid payload', details: parsed.error.format() }, { status: 400 });
    }

    const { compileHash, cycle, userId } = parsed.data;
    const typstCode = parsed.data.typstCode || '';

    const locked = await acquireCompileLock(compileHash);
    if (!locked) {
        return NextResponse.json({ ok: true, status: 'locked' }, { status: 202 });
    }

    const nowIso = () => new Date().toISOString();
    const isSupabaseAuthError = (message: string) =>
        message.toLowerCase().includes('unable to authenticate') ||
        message.toLowerCase().includes('invalid token') ||
        message.toLowerCase().includes('jwt') ||
        message.toLowerCase().includes('apikey');

    try {
        const cached = await getPdfCache(compileHash);
        const cachedUrlOk =
            typeof cached?.url === 'string' &&
            cached.url.startsWith('http') &&
            cached.url.includes('/storage/v1/object/') &&
            cached.url.includes('token=');
        if (cached?.status === 'ready' && cached.userId === userId && cachedUrlOk) {
            return NextResponse.json({ ok: true, status: 'ready', url: cached.url });
        }

        await setJobState(compileHash, {
            status: 'compiling',
            attempts: cycle,
            userId,
            logs: [],
            createdAt: nowIso(),
            updatedAt: nowIso(),
        });

        const { result, attempts, sawRetryableFailure } = await compileTypstProviderCycle(typstCode, cycle);


        if (result) {
            try {
                console.log(
                    JSON.stringify({
                        msg: 'compile_worker_upload_start',
                        compileHash,
                        cycle,
                        userId,
                        provider: result.provider,
                    })
                );
                const { path } = await uploadPdfToSupabase(compileHash, result.pdfBuffer);
                const signedUrl = await createSignedPdfUrl(path, 60 * 60 * 6);
                const now = nowIso();

                await setPdfCache(compileHash, {
                    status: 'ready',
                    url: signedUrl,
                    path,
                    userId,
                    createdAt: now,
                });

                await setJobState(compileHash, {
                    status: 'ready',
                    attempts: cycle,
                    userId,
                    provider: result.provider,
                    logs: attempts.map(({ provider, ok, cycle, status, details }) => ({ provider, ok, cycle, status, details })),
                    createdAt: now,
                    updatedAt: now,
                });

                await upsertResumeRecord({
                    contentHash: compileHash,
                    typst: typstCode,
                    pdfUrl: signedUrl,
                    status: 'ready',
                    attempts: cycle,
                });

                console.log(
                    JSON.stringify({
                        msg: 'compile_worker_upload_done',
                        compileHash,
                        cycle,
                        userId,
                        provider: result.provider,
                    })
                );
                return NextResponse.json({ ok: true, status: 'ready', url: signedUrl, provider: result.provider });
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to upload/sign PDF';
                const isAuth = isSupabaseAuthError(message);
                const status = error instanceof SupabaseStorageError ? error.status : undefined;
                const lastError = isAuth
                    ? 'Supabase Storage auth failed. Check `SUPABASE_SERVICE_ROLE_KEY` in Vercel env vars (must be the service_role key, not anon).'
                    : `Failed to store PDF: ${message}`;

                console.error(
                    JSON.stringify({
                        msg: 'compile_worker_storage_error',
                        compileHash,
                        cycle,
                        userId,
                        status,
                        isAuth,
                        error: message,
                    })
                );

                await setJobState(compileHash, {
                    status: 'failed',
                    attempts: cycle,
                    userId,
                    lastError,
                    logs: attempts.map(({ provider, ok, cycle, status, details }) => ({ provider, ok, cycle, status, details })),
                    createdAt: nowIso(),
                    updatedAt: nowIso(),
                });
                await upsertResumeRecord({
                    contentHash: compileHash,
                    typst: typstCode,
                    status: 'failed',
                    attempts: cycle,
                });

                // Do not retry when storage auth is misconfigured.
                return NextResponse.json({ ok: false, status: 'failed', error: lastError }, { status: 500 });
            }
        }

        const lastError = attempts.filter((a) => !a.ok).slice(-1)[0]?.details ?? 'Compile failed';
        if (cycle < 3 && sawRetryableFailure) {
            await setJobState(compileHash, {
                status: 'queued',
                attempts: cycle,
                userId,
                lastError,
                logs: attempts.map(({ provider, ok, cycle, status, details }) => ({ provider, ok, cycle, status, details })),
                createdAt: nowIso(),
                updatedAt: nowIso(),
            });
            await upsertResumeRecord({
                contentHash: compileHash,
                typst: typstCode,
                status: 'queued',
                attempts: cycle,
            });
            await enqueueCompileJob({ compileHash, typstCode, cycle: cycle + 1, userId }, 2 ** cycle * 5);
            return NextResponse.json({ ok: true, status: 'queued', nextCycle: cycle + 1 }, { status: 202 });
        }

        await setJobState(compileHash, {
            status: 'failed',
            attempts: cycle,
            userId,
            lastError,
            logs: attempts.map(({ provider, ok, cycle, status, details }) => ({ provider, ok, cycle, status, details })),
            createdAt: nowIso(),
            updatedAt: nowIso(),
        });
        await upsertResumeRecord({
            contentHash: compileHash,
            typst: typstCode,
            status: 'failed',
            attempts: cycle,
        });

        return NextResponse.json({ ok: false, status: 'failed', error: lastError }, { status: 500 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Worker failed';
        console.error(
            JSON.stringify({
                msg: 'compile_worker_unhandled_error',
                compileHash,
                cycle,
                userId,
                error: message,
            })
        );
        // Avoid leaving the job in "compiling" forever.
        await setJobState(compileHash, {
            status: 'failed',
            attempts: cycle,
            userId,
            lastError: message,
            createdAt: nowIso(),
            updatedAt: nowIso(),
        });
        await upsertResumeRecord({
            contentHash: compileHash,
            typst: typstCode,
            status: 'failed',
            attempts: cycle,
        });

        return NextResponse.json({ ok: false, status: 'failed', error: message }, { status: 500 });
    } finally {
        await releaseCompileLock(compileHash);
    }
}
