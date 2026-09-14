// pdfjs-dist's bundle calls the very new Promise.withResolvers() API
// (Safari 17.4+ / iOS 17.4+, Chrome 119+, Firefox 121+). On an older mobile
// browser it's simply undefined, and calling it throws a cryptic minified
// "undefined is not a function" with no indication of what actually failed,
// exactly the symptom reported on mobile while desktop worked fine. This
// polyfill is a no-op wherever the native API already exists.
function ensurePromiseWithResolversPolyfill(): void {
    if (typeof Promise === 'undefined') return;
    const P = Promise as unknown as { withResolvers?: () => unknown };
    if (typeof P.withResolvers === 'function') return;
    P.withResolvers = function withResolvers<T>() {
        let resolve!: (value: T | PromiseLike<T>) => void;
        let reject!: (reason?: unknown) => void;
        const promise = new Promise<T>((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}

export async function extractTextFromPdf(file: File): Promise<string> {
    if (typeof window === 'undefined') {
        throw new Error('PDF extraction can only run in the browser');
    }

    ensurePromiseWithResolversPolyfill();

    // Use the pre-built bundle directly to avoid Next.js chunk-path 404s
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs') as any;

    // Same-origin worker (see public/pdf.worker.min.mjs), avoids protocol/CSP issues with //cdn URLs
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();

    let pdf;
    try {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        pdf = await loadingTask.promise;
    } catch (err) {
        throw new Error(
            `Could not open this PDF (${err instanceof Error ? err.message : 'unknown error'}). It may be corrupted, password-protected, or in a format this browser can't parse.`,
        );
    }

    let fullText = '';
    const extractedUrls: string[] = [];
    let pagesFailed = 0;

    for (let i = 1; i <= pdf.numPages; i++) {
        // Extraction is isolated per page: a single malformed page (bad font
        // encoding, corrupt content stream, etc.) should not abort the whole
        // document, skip it and keep the text we could recover.
        try {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: unknown) =>
                    typeof item === 'object' && item !== null && 'str' in item && typeof (item as { str: unknown }).str === 'string'
                        ? (item as { str: string }).str
                        : '',
                )
                .join(' ');

            fullText += pageText.trim() + '\n\n';

            // Extract hyperlink URLs from PDF annotations
            try {
                const annotations = await page.getAnnotations();
                for (const annot of annotations) {
                    if (annot.subtype === 'Link' && annot.url) {
                        extractedUrls.push(annot.url);
                    }
                }
            } catch {
                // Annotation extraction is best-effort
            }
        } catch {
            pagesFailed += 1;
        }
    }

    if (pagesFailed === pdf.numPages) {
        throw new Error(
            'This PDF could not be read on this device. Try re-exporting it (e.g. "Print to PDF" from a desktop browser) or upload a .docx instead.',
        );
    }

    // Append extracted URLs so the LLM can see LinkedIn/GitHub/Portfolio links
    if (extractedUrls.length > 0) {
        const unique = [...new Set(extractedUrls)];
        fullText += '\n[Extracted URLs from PDF]: ' + unique.join(' , ') + '\n';
    }

    // Collapse horizontal whitespace but keep line breaks so the LLM sees structure
    const result = fullText
        .split('\n')
        .map((line) => line.replace(/[ \t]+/g, ' ').trim())
        .filter((line) => line.length > 0)
        .join('\n')
        .trim();

    if (!result) {
        throw new Error(
            'No extractable text found in this PDF, it may be a scanned image rather than real text. Try a text-based export or a .docx instead.',
        );
    }

    return result;
}

export async function renderPdfThumbnail(file: File): Promise<{ thumbnailUrl: string; pageCount: number } | null> {
    if (typeof window === 'undefined') return null;

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfjsLib = (await import('pdfjs-dist/build/pdf.min.mjs')) as any;
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        if (pdf.numPages < 1) return null;

        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return null;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.88);

        return {
            thumbnailUrl,
            pageCount: pdf.numPages,
        };
    } catch (err) {
        console.warn('[pdf-parser] Failed to render PDF thumbnail:', err);
        return null;
    }
}
