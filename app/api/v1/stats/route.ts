import { NextResponse } from 'next/server';
import { getSystemStats } from '@/lib/stats-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const stats = await getSystemStats();
        return NextResponse.json(stats, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'CDN-Cache-Control': 'no-store',
                'Vercel-CDN-Cache-Control': 'no-store',
            },
        });
    } catch {
        return NextResponse.json({
            resumesCompiled: 0,
            bulletsTailored: 0,
            activeTemplates: 48,
            factCheckAccuracy: 100,
        });
    }
}
