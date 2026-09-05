import { Redis } from '@upstash/redis';

export type PreviewJobStatus = 'queued' | 'compiling' | 'ready' | 'failed';

export type PdfCacheRecord = {
    status: 'ready';
    url: string;
    // Object path inside the bucket (e.g. "compiled/<hash>.pdf"). Used to re-sign
    // without recompiling when a signed URL expires or was cached incorrectly.
    path?: string;
    userId: string;
    createdAt: string;
};

export type JobStateRecord = {
    status: PreviewJobStatus;
    attempts: number;
    userId: string;
    lastError?: string;
    provider?: string;
    logs?: Array<{ provider: string; ok: boolean; cycle: number; status?: number; details?: string }>;
    createdAt: string;
    updatedAt: string;
};

function getRedis() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null;
    return new Redis({ url, token });
}

const PDF_TTL_SECONDS = 60 * 60 * 12;
const JOB_TTL_SECONDS = 60 * 30;
const LOCK_TTL_SECONDS = 60;
const CIRCUIT_TTL_SECONDS = 90;

function isLoopbackBaseUrl(raw: string | undefined): boolean {
    if (!raw) return true;
    const value = raw.trim().replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');
    // Covers localhost, 127.0.0.1, and IPv6 loopback.
    return /(^|\/\/)(localhost|127\.0\.0\.1|\[::1\]|::1)(:|\/|$)/i.test(value);
}

export function isPreviewInfraConfigured() {
    const baseUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
    // QStash cannot deliver to localhost/loopback. In local dev, fall back to direct compile.
    if (isLoopbackBaseUrl(baseUrl)) return false;
    return Boolean(
        process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN &&
        process.env.QSTASH_TOKEN &&
        process.env.SUPABASE_URL &&
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
}

export async function getPdfCache(hash: string): Promise<PdfCacheRecord | null> {
    const redis = getRedis();
    if (!redis) return null;
    return (await redis.get<PdfCacheRecord>(`pdf:${hash}`)) ?? null;
}

export async function setPdfCache(hash: string, record: PdfCacheRecord) {
    const redis = getRedis();
    if (!redis) return;
    await redis.set(`pdf:${hash}`, record, { ex: PDF_TTL_SECONDS });
}

export async function getJobState(hash: string): Promise<JobStateRecord | null> {
    const redis = getRedis();
    if (!redis) return null;
    return (await redis.get<JobStateRecord>(`job:${hash}`)) ?? null;
}

export async function setJobState(hash: string, record: JobStateRecord) {
    const redis = getRedis();
    if (!redis) return;
    await redis.set(`job:${hash}`, record, { ex: JOB_TTL_SECONDS });
}

export async function acquireCompileLock(hash: string) {
    const redis = getRedis();
    if (!redis) return true;
    const result = await redis.set(`lock:${hash}`, '1', { nx: true, ex: LOCK_TTL_SECONDS });
    return result === 'OK';
}

export async function releaseCompileLock(hash: string) {
    const redis = getRedis();
    if (!redis) return;
    await redis.del(`lock:${hash}`);
}

export async function isProviderCircuitOpen(providerKey: string): Promise<boolean> {
    const redis = getRedis();
    if (!redis) return false;
    const value = await redis.get(`circuit:${providerKey}`);
    return Boolean(value);
}

export async function openProviderCircuit(providerKey: string, reason: string) {
    const redis = getRedis();
    if (!redis) return;
    await redis.set(`circuit:${providerKey}`, reason, { ex: CIRCUIT_TTL_SECONDS });
}

export async function incrementProviderMetric(providerKey: string, field: 'success' | 'failure' | 'skipped') {
    const redis = getRedis();
    if (!redis) return;
    const day = new Date().toISOString().slice(0, 10);
    await redis.hincrby(`provider-stats:${day}:${providerKey}`, field, 1);
}
