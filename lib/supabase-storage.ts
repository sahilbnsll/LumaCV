type ResumeRowStatus = 'queued' | 'compiling' | 'ready' | 'failed';

export class SupabaseStorageError extends Error {
    status?: number;
    constructor(message: string, opts?: { status?: number }) {
        super(message);
        this.name = 'SupabaseStorageError';
        this.status = opts?.status;
    }
}

function safeJwtIssuer(jwt: string): string | null {
    const parts = jwt.split('.');
    if (parts.length !== 3) return null;
    try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        if (payload && typeof payload.iss === 'string') return payload.iss;
    } catch {
        // ignore
    }
    return null;
}

function addSupabaseAuthHint(message: string, cfg: { url: string; serviceKey: string }) {
    const issuer = safeJwtIssuer(cfg.serviceKey);
    const host = (() => {
        try {
            return new URL(cfg.url).host;
        } catch {
            return cfg.url;
        }
    })();
    const issuerHost = issuer
        ? (() => {
              try {
                  return new URL(issuer).host;
              } catch {
                  return issuer;
              }
          })()
        : null;

    const mismatch = issuerHost && host && issuerHost !== host;
    const lines = [
        message,
        '',
        'Supabase auth hint:',
        `- SUPABASE_URL host: ${host}`,
        issuer ? `- Key issuer (iss): ${issuer}` : '- Key issuer (iss): unavailable (not a JWT?)',
        mismatch ? '- MISMATCH: key issuer host does not match SUPABASE_URL host' : null,
        '- Ensure SUPABASE_SERVICE_ROLE_KEY is the service_role key for this exact Supabase project.',
    ].filter(Boolean);

    return lines.join('\n');
}

function getConfig() {
    const urlRaw = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKeyRaw = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucketRaw = process.env.SUPABASE_RESUMES_BUCKET || 'resumes';
    if (!urlRaw || !serviceKeyRaw) return null;

    const url = urlRaw.trim().replace(/\/$/, '');
    // Vercel env pastes sometimes include surrounding quotes or whitespace.
    const serviceKey = serviceKeyRaw.trim().replace(/^"+|"+$/g, '');
    // Bucket is frequently pasted with quotes or accidental whitespace in Vercel UI.
    const bucket = bucketRaw.trim().replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');
    return { url, serviceKey, bucket };
}

function headers(contentType = 'application/json') {
    const cfg = getConfig();
    if (!cfg) throw new Error('Supabase is not configured');
    return {
        Authorization: `Bearer ${cfg.serviceKey}`,
        apikey: cfg.serviceKey,
        'Content-Type': contentType,
    };
}

function normalizeStoragePath(input: string) {
    const raw = (input || '').trim().replace(/^\/+/, '');
    // Defensive: never allow directory traversal.
    if (!raw || raw.includes('..')) throw new Error(`Invalid storage path: ${input}`);
    return raw.replace(/\/{2,}/g, '/');
}

export async function uploadPdfToSupabase(hash: string, pdfBuffer: ArrayBuffer) {
    const cfg = getConfig();
    if (!cfg) throw new Error('Supabase is not configured');
    const path = normalizeStoragePath(`compiled/${hash}.pdf`);
    const response = await fetch(`${cfg.url}/storage/v1/object/${cfg.bucket}/${path}`, {
        method: 'POST',
        headers: {
            ...headers('application/pdf'),
            'x-upsert': 'true',
        },
        body: Buffer.from(pdfBuffer),
    });

    if (!response.ok) {
        const raw = (await response.text()).slice(0, 800) || 'Failed to upload PDF to Supabase';
        const msg = response.status === 401 || response.status === 403 ? addSupabaseAuthHint(raw, cfg) : raw;
        throw new SupabaseStorageError(msg, { status: response.status });
    }

    return { path };
}

export async function createSignedPdfUrl(path: string, expiresIn = 60 * 60 * 6) {
    const cfg = getConfig();
    if (!cfg) throw new Error('Supabase is not configured');
    const normalizedPath = normalizeStoragePath(path);

    const response = await fetch(`${cfg.url}/storage/v1/object/sign/${cfg.bucket}/${normalizedPath}`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ expiresIn }),
    });

    if (!response.ok) {
        const raw = (await response.text()).slice(0, 800) || 'Failed to create signed URL';
        const msg = response.status === 401 || response.status === 403 ? addSupabaseAuthHint(raw, cfg) : raw;
        throw new SupabaseStorageError(msg, { status: response.status });
    }

    const json = await response.json();
    const signed = json.signedURL || json.signedUrl;
    if (!signed || typeof signed !== 'string') {
        throw new Error('Signed URL missing from Supabase response');
    }

    if (signed.startsWith('http')) return signed;

    // Ensure we return an absolute URL with a valid Supabase Storage path.
    let pathname = signed;
    if (!pathname.startsWith('/')) pathname = '/' + pathname;
    if (!pathname.startsWith('/storage/v1/')) {
        if (pathname.startsWith('/object/')) {
            pathname = '/storage/v1' + pathname;
        }
    }

    const absolute = new URL(pathname, cfg.url).toString();
    if (!absolute.includes('/storage/v1/object/')) {
        throw new Error(`Signed URL is not a storage object URL: ${absolute}`);
    }
    return absolute;
}

export async function upsertResumeRecord(input: {
    contentHash: string;
    typst?: string;
    pdfUrl?: string;
    status: ResumeRowStatus;
    attempts: number;
}) {
    const cfg = getConfig();
    if (!cfg) return;

    const docSource = input.typst ?? '';
    await fetch(`${cfg.url}/rest/v1/resumes?on_conflict=content_hash`, {
        method: 'POST',
        headers: {
            ...headers(),
            Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({
            content_hash: input.contentHash,
            typst: docSource,
            pdf_url: input.pdfUrl ?? null,
            status: input.status,
            attempts: input.attempts,
            updated_at: new Date().toISOString(),
        }),
    });
}


