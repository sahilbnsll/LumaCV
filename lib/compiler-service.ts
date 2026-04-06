import { incrementProviderMetric, openProviderCircuit, isProviderCircuitOpen } from './resume-preview-store';

export type CompileAttempt = {
    provider: string;
    ok: boolean;
    cycle: number;
    status?: number;
    retryable?: boolean;
    details?: string;
};

export type ProviderResult = {
    provider: string;
    pdfBuffer: ArrayBuffer;
};

export class ProviderError extends Error {
    status?: number;
    retryable: boolean;
    constructor(message: string, opts?: { status?: number; retryable?: boolean }) {
        super(message);
        this.name = 'ProviderError';
        this.status = opts?.status;
        this.retryable = opts?.retryable ?? true;
    }
}

const REQUEST_TIMEOUT_MS = 16000;

async function readErrorText(response: Response): Promise<string> {
    const text = await response.text();
    return text.slice(0, 600) || `HTTP ${response.status}`;
}

function isRetryableStatus(status: number): boolean {
    return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}

async function fetchWithProviderErrors(url: string, init: RequestInit): Promise<Response> {
    try {
        const response = await fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
        if (!response.ok) {
            const errorText = await readErrorText(response);
            console.log(
                JSON.stringify({
                    msg: 'latex_provider_http_error',
                    url,
                    status: response.status,
                    retryable: isRetryableStatus(response.status),
                    error: errorText.slice(0, 180),
                })
            );
            throw new ProviderError(errorText, {
                status: response.status,
                retryable: isRetryableStatus(response.status),
            });
        }
        return response;
    } catch (error) {
        if (error instanceof ProviderError) throw error;
        throw new ProviderError(error instanceof Error ? error.message : 'Unknown provider error', { retryable: true });
    }
}

async function compileViaYtoTech(latexCode: string, compiler: 'pdflatex' | 'xelatex'): Promise<ProviderResult> {
    const response = await fetchWithProviderErrors('https://latex.ytotech.com/builds/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            compiler,
            resources: [{ main: true, content: latexCode }],
        }),
    });

    return {
        provider: `latex.ytotech.com (${compiler})`,
        pdfBuffer: await response.arrayBuffer(),
    };
}

async function compileViaLatexOnline(host: string, latexCode: string): Promise<ProviderResult> {
    const encoded = encodeURIComponent(latexCode);
    if (encoded.length > 14000) {
        throw new ProviderError('Payload too large for GET-based latex-online fallback', { retryable: false });
    }

    const response = await fetchWithProviderErrors(`${host}/compile?text=${encoded}`, { method: 'GET' });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('pdf')) {
        throw new ProviderError((await response.text()).slice(0, 600) || 'Provider did not return a PDF', {
            retryable: false,
        });
    }

    return {
        provider: `${host}/compile`,
        pdfBuffer: await response.arrayBuffer(),
    };
}

const providers: Array<{ name: string; key: string; run: (latexCode: string) => Promise<ProviderResult> }> = [
    { name: 'latex.ytotech.com (pdflatex)', key: 'ytotech-pdflatex', run: (latexCode) => compileViaYtoTech(latexCode, 'pdflatex') },
    { name: 'latex.ytotech.com (xelatex)', key: 'ytotech-xelatex', run: (latexCode) => compileViaYtoTech(latexCode, 'xelatex') },
    { name: 'latexonline.cc/compile', key: 'latexonline-cc', run: (latexCode) => compileViaLatexOnline('https://latexonline.cc', latexCode) },
    { name: 'latex.odin.study/compile', key: 'latex-odin-study', run: (latexCode) => compileViaLatexOnline('https://latex.odin.study', latexCode) },
    { name: 'ltxonline.hvoss.org/compile', key: 'ltxonline-hvoss', run: (latexCode) => compileViaLatexOnline('https://ltxonline.hvoss.org', latexCode) },
];

export async function compileLatexProviderCycle(latexCode: string, cycle = 1): Promise<{
    result?: ProviderResult;
    attempts: CompileAttempt[];
    sawRetryableFailure: boolean;
}> {
    const attempts: CompileAttempt[] = [];
    let sawRetryableFailure = false;

    for (const provider of providers) {
        if (await isProviderCircuitOpen(provider.key)) {
            await incrementProviderMetric(provider.key, 'skipped');
            attempts.push({
                provider: provider.name,
                ok: false,
                cycle,
                retryable: true,
                details: 'Skipped due to open circuit breaker',
            });
            sawRetryableFailure = true;
            continue;
        }

        try {
            const result = await provider.run(latexCode);
            await incrementProviderMetric(provider.key, 'success');
            attempts.push({ provider: result.provider, ok: true, cycle });
            return { result, attempts, sawRetryableFailure };
        } catch (error) {
            const providerError =
                error instanceof ProviderError
                    ? error
                    : new ProviderError(error instanceof Error ? error.message : 'Unknown compile error');

            if (providerError.retryable) {
                sawRetryableFailure = true;
                await openProviderCircuit(provider.key, providerError.message);
            }
            await incrementProviderMetric(provider.key, 'failure');

            attempts.push({
                provider: provider.name,
                ok: false,
                cycle,
                status: providerError.status,
                retryable: providerError.retryable,
                details: providerError.message,
            });
        }
    }

    return { attempts, sawRetryableFailure };
}
