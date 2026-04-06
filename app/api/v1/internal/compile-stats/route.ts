import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const maxDuration = 10;

function getRedis() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null;
    return new Redis({ url, token });
}

export async function GET(req: NextRequest) {
    const secret = process.env.COMPILE_WORKER_SECRET;
    if (secret && req.headers.get('x-worker-secret') !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const redis = getRedis();
    if (!redis) {
        return NextResponse.json({ error: 'Redis not configured' }, { status: 503 });
    }

    const day = req.nextUrl.searchParams.get('day') || new Date().toISOString().slice(0, 10);
    const keys = await redis.keys(`provider-stats:${day}:*`);
    const stats: Record<string, unknown> = {};
    for (const key of keys) {
        stats[key.replace(`provider-stats:${day}:`, '')] = await redis.hgetall(key);
    }

    return NextResponse.json({ day, stats });
}
