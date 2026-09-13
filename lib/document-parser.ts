import { extractTextFromPdf } from './pdf-parser';

export async function extractTextFromFile(file: File): Promise<string> {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
        return extractTextFromPdf(file);
    }

    if (
        fileName.endsWith('.docx') ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
        if (typeof window === 'undefined') {
            throw new Error('DOCX extraction can only run in the browser');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mammoth = (await import('mammoth')) as any;
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return (result.value || '').trim();
    }

    if (fileName.endsWith('.txt') || fileName.endsWith('.md') || file.type.startsWith('text/')) {
        return (await file.text()).trim();
    }

    throw new Error('Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx).');
}
