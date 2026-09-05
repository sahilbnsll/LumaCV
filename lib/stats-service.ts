import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

interface SystemStats {
    resumesCompiled: number;
    bulletsTailored: number;
    activeTemplates: number;
    factCheckAccuracy: number;
}

const STATS_FILE = path.join(process.cwd(), 'data', 'system-stats.json');

function getRedis(): Redis | null {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null;
    return new Redis({ url, token });
}

function readLocalStats(): { resumesCompiled: number; bulletsTailored: number } {
    try {
        if (fs.existsSync(STATS_FILE)) {
            const data = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
            return {
                resumesCompiled: Number(data.resumesCompiled) || 0,
                bulletsTailored: Number(data.bulletsTailored) || 0,
            };
        }
    } catch {
        // Ignore read errors
    }
    return { resumesCompiled: 0, bulletsTailored: 0 };
}

function writeLocalStats(stats: { resumesCompiled: number; bulletsTailored: number }) {
    try {
        const dir = path.dirname(STATS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
    } catch {
        // Ignore write errors in serverless read-only contexts
    }
}

export async function getSystemStats(): Promise<SystemStats> {
    const redis = getRedis();
    if (redis) {
        try {
            const [compiled, tailored] = await Promise.all([
                redis.get<number>('global:resumes_compiled'),
                redis.get<number>('global:bullets_tailored'),
            ]);
            return {
                resumesCompiled: Number(compiled) || 0,
                bulletsTailored: Number(tailored) || 0,
                activeTemplates: 48,
                factCheckAccuracy: 100,
            };
        } catch {
            // Fallback to local
        }
    }

    const local = readLocalStats();
    return {
        resumesCompiled: local.resumesCompiled,
        bulletsTailored: local.bulletsTailored,
        activeTemplates: 48,
        factCheckAccuracy: 100,
    };
}

export async function recordResumeCompiled(): Promise<number> {
    const redis = getRedis();
    if (redis) {
        try {
            return await redis.incr('global:resumes_compiled');
        } catch {
            // Fallback to local
        }
    }

    const local = readLocalStats();
    local.resumesCompiled += 1;
    writeLocalStats(local);
    return local.resumesCompiled;
}

export async function recordBulletTailored(count: number = 1): Promise<number> {
    const redis = getRedis();
    if (redis) {
        try {
            return await redis.incrby('global:bullets_tailored', count);
        } catch {
            // Fallback to local
        }
    }

    const local = readLocalStats();
    local.bulletsTailored += count;
    writeLocalStats(local);
    return local.bulletsTailored;
}
