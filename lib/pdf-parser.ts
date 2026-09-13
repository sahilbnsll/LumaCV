export async function extractTextFromPdf(file: File): Promise<string> {
    if (typeof window === 'undefined') {
        throw new Error('PDF extraction can only run in the browser');
    }

    // Use the pre-built bundle directly to avoid Next.js chunk-path 404s
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs') as any;

    // Same-origin worker (see public/pdf.worker.min.mjs) — avoids protocol/CSP issues with //cdn URLs
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';
    const extractedUrls: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
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
    }

    // Append extracted URLs so the LLM can see LinkedIn/GitHub/Portfolio links
    if (extractedUrls.length > 0) {
        const unique = [...new Set(extractedUrls)];
        fullText += '\n[Extracted URLs from PDF]: ' + unique.join(' , ') + '\n';
    }

    // Collapse horizontal whitespace but keep line breaks so the LLM sees structure
    return fullText
        .split('\n')
        .map((line) => line.replace(/[ \t]+/g, ' ').trim())
        .filter((line) => line.length > 0)
        .join('\n')
        .trim();
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
