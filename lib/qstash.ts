function cleanEnvValue(value: string | undefined): string | null {
    if (!value) return null;
    return value.trim().replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '') || null;
}

function isLoopbackDestination(url: string): boolean {
    try {
        const u = new URL(url);
        const h = u.hostname.toLowerCase();
        return h === 'localhost' || h === '127.0.0.1' || h === '::1';
    } catch {
        return false;
    }
}

export async function enqueueCompileJob(payload: object, delaySeconds = 0) {
    const token = cleanEnvValue(process.env.QSTASH_TOKEN);
    const qstashBaseUrl = (cleanEnvValue(process.env.QSTASH_URL) || 'https://qstash.upstash.io').replace(/\/$/, '');
    const appUrlRaw = cleanEnvValue(process.env.APP_BASE_URL) || cleanEnvValue(process.env.NEXT_PUBLIC_APP_URL) || cleanEnvValue(process.env.VERCEL_URL);
    const workerSecret = cleanEnvValue(process.env.COMPILE_WORKER_SECRET);

    if (!token || !appUrlRaw || !workerSecret) {
        throw new Error('QStash is not fully configured');
    }

    const normalizedBase = appUrlRaw.startsWith('http') ? appUrlRaw : `https://${appUrlRaw}`;
    const targetUrl = `${normalizedBase.replace(/\/$/, '')}/api/v1/internal/compile-worker`;
    if (isLoopbackDestination(targetUrl)) {
        throw new Error(
            'QStash cannot publish to localhost/loopback destinations. Set APP_BASE_URL to your public Vercel URL (or use a tunnel), or unset QSTASH_TOKEN for local dev to fall back to direct compile.'
        );
    }

    // QStash expects the destination URL passed raw in the path:
    //   /v2/publish/https://example.com
    // Encoding the destination causes QStash to treat it as a literal string (no scheme), returning:
    //   "invalid destination url: endpoint has invalid scheme"
    const response = await fetch(`${qstashBaseUrl}/v2/publish/${targetUrl}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Upstash-Delay': `${delaySeconds}s`,
            // QStash does not forward arbitrary publish-request headers by default.
            // Use Upstash-Forward-* so the destination receives x-worker-secret.
            'Upstash-Forward-X-Worker-Secret': workerSecret,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const text = (await response.text()).slice(0, 500) || `HTTP ${response.status}`;
        const hint =
            response.status === 401 || text.toLowerCase().includes('unable to authenticate')
                ? ' (QStash auth failed: double-check QSTASH_TOKEN from Upstash QStash console)'
                : '';
        throw new Error(`${text}${hint}`.trim());
    }

    return response.json().catch(() => ({}));
}
