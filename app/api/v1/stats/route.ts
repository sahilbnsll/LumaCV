import { NextResponse } from 'next/server';
import { getSystemStats } from '@/lib/stats-service';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const stats = await getSystemStats();
        return NextResponse.json(stats, {
            headers: {
                'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=15',
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
