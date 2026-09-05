import { promises as fs } from 'fs';
import path from 'path';

const promptMemoryCache = new Map<string, string>();

/**
 * Loads a prompt template from disk on first call and caches it in memory.
 * Completely eliminates redundant filesystem I/O on repeated AI streaming calls.
 */
export async function getPromptTemplate(filename: 'jd-analyze.txt' | 'resume-parse.txt' | 'resume-tailor.txt'): Promise<string> {
    const cached = promptMemoryCache.get(filename);
    if (cached) return cached;

    const fullPath = path.join(process.cwd(), 'prompts', filename);
    const content = await fs.readFile(fullPath, 'utf-8');
    promptMemoryCache.set(filename, content);
    return content;
}
