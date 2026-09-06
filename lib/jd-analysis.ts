import { generateStream, collectStream, extractJsonObjectFromAssistantText } from '@/lib/llm-client';
import { getPromptTemplate } from '@/lib/prompt-cache';
import { jsonrepair } from 'jsonrepair';
import { normalizeAnalyzeJDFromLLM } from '@/lib/normalize-jd';
import type { AnalyzeJDResponse } from '@/lib/resume-schema';
import type { UserApiKeys } from '@/lib/ai-keys';

/**
 * Executes robust, normalized extraction of required skills, preferred qualifications,
 * key responsibilities, and industry buzzwords from an unstructured job description.
 */
export async function analyzeJobDescription(
    jdText: string,
    userKeys?: UserApiKeys
): Promise<AnalyzeJDResponse> {
    const cleanJd = jdText.trim().substring(0, 14000);
    const promptTemplate = await getPromptTemplate('jd-analyze.txt');
    const prompt = promptTemplate.replace('{{JD_TEXT}}', cleanJd);

    console.log(`[AnalyzeJD-Core] Dispatching job analysis to LLM pipeline...`);
    const { textStream, model } = await generateStream(prompt, undefined, 'light', {
        maxTokens: 1800,
        userKeys,
    });

    console.log(`[AnalyzeJD-Core] Connected via ${model}, collecting stream...`);
    const rawText = await collectStream(textStream);
    console.log(`[AnalyzeJD-Core] Stream complete (${rawText.length} chars)`);

    const jsonText = extractJsonObjectFromAssistantText(rawText);
    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonText);
    } catch {
        const repaired = jsonrepair(jsonText);
        parsed = JSON.parse(repaired);
    }

    return normalizeAnalyzeJDFromLLM(parsed);
}
