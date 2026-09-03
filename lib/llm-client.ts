import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { UserApiKeys } from './ai-keys';


// ============================================================================
// Official Models (Configured from console.groq.com, aistudio.google.com, platform.openai.com, console.anthropic.com)
// ============================================================================

/** 
 * Groq Active Models
 */
const GROQ_HEAVY_MODELS = [
    'qwen/qwen3.6-27b',
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-120b'
];

const GROQ_LIGHT_MODELS = [
    'qwen/qwen3.6-27b',
    'openai/gpt-oss-20b'
];

/** 
 * Google Gemini Active Models
 */
const GEMINI_HEAVY_MODELS = [
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash'
];

const GEMINI_LIGHT_MODELS = [
    'gemini-2.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-2.5-flash'
];

/**
 * OpenAI Active Models (BYOK)
 */
const OPENAI_HEAVY_MODELS = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo'
];

const OPENAI_LIGHT_MODELS = [
    'gpt-4o-mini',
    'gpt-4o'
];

/**
 * Anthropic Active Models (BYOK)
 */
const ANTHROPIC_HEAVY_MODELS = [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022'
];

const ANTHROPIC_LIGHT_MODELS = [
    'claude-3-5-haiku-20241022',
    'claude-3-5-sonnet-20241022'
];

export type TaskType = 'heavy' | 'light';


// ============================================================================
// JSON Extraction Utility
// ============================================================================

/**
 * Models may return JSON wrapped in markdown fences or with leading/trailing prose.
 */
export function extractJsonObjectFromAssistantText(text: string): string {
    let trimmed = text.trim();

    // Try to match a complete markdown block first
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/im);
    if (fenced?.[1]) {
        return fenced[1].trim();
    }

    // Clean up partial markdown fences for truncated streams
    if (trimmed.startsWith('```')) {
        trimmed = trimmed.replace(/^```[a-zA-Z]*\n?/, '');
    }
    if (trimmed.endsWith('```')) {
        trimmed = trimmed.replace(/\n?```$/, '');
    }
    trimmed = trimmed.trim();

    // Fallback: extract from first brace/bracket to last brace/bracket
    const startBrace = trimmed.indexOf('{');
    const startBracket = trimmed.indexOf('[');
    let start = -1;
    if (startBrace >= 0 && startBracket >= 0) start = Math.min(startBrace, startBracket);
    else if (startBrace >= 0) start = startBrace;
    else if (startBracket >= 0) start = startBracket;

    const endBrace = trimmed.lastIndexOf('}');
    const endBracket = trimmed.lastIndexOf(']');
    let end = -1;
    if (endBrace >= 0 && endBracket >= 0) end = Math.max(endBrace, endBracket);
    else if (endBrace >= 0) end = endBrace;
    else if (endBracket >= 0) end = endBracket;

    if (start >= 0 && end > start) {
        return trimmed.slice(start, end + 1);
    }

    if (start >= 0) {
        return trimmed.slice(start);
    }

    return trimmed;
}

// ============================================================================
// Provider Configuration
// ============================================================================

function getProviderConfigurations(taskType: TaskType, userKeys?: UserApiKeys): Array<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider: (modelId: string) => any,
    models: string[],
    name: string
}> {
    const configs = [];

    // Prioritize user's own custom keys (BYOK) if provided
    if (userKeys?.gemini) {
        const userGoogle = createGoogleGenerativeAI({ apiKey: userKeys.gemini });
        const defaultPool = taskType === 'heavy' ? GEMINI_HEAVY_MODELS : GEMINI_LIGHT_MODELS;
        const models = userKeys.geminiModel
            ? [userKeys.geminiModel, ...defaultPool.filter(m => m !== userKeys.geminiModel)]
            : defaultPool;

        configs.push({
            provider: userGoogle,
            models,
            name: `BYOK-Gemini (${userKeys.geminiModel || 'Default'})`
        });
    }

    if (userKeys?.openai) {
        const userOpenAI = createOpenAI({ apiKey: userKeys.openai });
        const defaultPool = taskType === 'heavy' ? OPENAI_HEAVY_MODELS : OPENAI_LIGHT_MODELS;
        const models = userKeys.openaiModel
            ? [userKeys.openaiModel, ...defaultPool.filter(m => m !== userKeys.openaiModel)]
            : defaultPool;

        configs.push({
            provider: userOpenAI,
            models,
            name: `BYOK-OpenAI (${userKeys.openaiModel || 'Default'})`
        });
    }

    if (userKeys?.anthropic) {
        const userAnthropic = createAnthropic({ apiKey: userKeys.anthropic });
        const defaultPool = taskType === 'heavy' ? ANTHROPIC_HEAVY_MODELS : ANTHROPIC_LIGHT_MODELS;
        const models = userKeys.anthropicModel
            ? [userKeys.anthropicModel, ...defaultPool.filter(m => m !== userKeys.anthropicModel)]
            : defaultPool;

        configs.push({
            provider: userAnthropic,
            models,
            name: `BYOK-Anthropic (${userKeys.anthropicModel || 'Default'})`
        });
    }

    if (userKeys?.groq) {
        const userGroq = createOpenAI({
            baseURL: 'https://api.groq.com/openai/v1',
            apiKey: userKeys.groq,
        });
        const defaultPool = taskType === 'heavy' ? GROQ_HEAVY_MODELS : GROQ_LIGHT_MODELS;
        const models = userKeys.groqModel
            ? [userKeys.groqModel, ...defaultPool.filter(m => m !== userKeys.groqModel)]
            : defaultPool;

        configs.push({
            provider: userGroq,
            models,
            name: `BYOK-Groq (${userKeys.groqModel || 'Default'})`
        });
    }

    // If user specified a preferred provider, move it to the very top
    if (userKeys?.preferredProvider) {
        const prefIdx = configs.findIndex(c => c.name.toLowerCase().includes(userKeys.preferredProvider!));
        if (prefIdx > 0) {
            const [preferred] = configs.splice(prefIdx, 1);
            configs.unshift(preferred);
        }
    }

    // Platform default system fallbacks (STRICT: Free users without keys can ONLY use system default models)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && !userKeys?.gemini) {
        const google = createGoogleGenerativeAI({ apiKey: geminiKey });
        configs.push({
            provider: google,
            models: taskType === 'heavy' ? GEMINI_HEAVY_MODELS : GEMINI_LIGHT_MODELS,
            name: 'System-Gemini (Default)'
        });
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey && !userKeys?.groq) {
        const groq = createOpenAI({
            baseURL: 'https://api.groq.com/openai/v1',
            apiKey: groqKey,
        });
        configs.push({
            provider: groq,
            models: taskType === 'heavy' ? GROQ_HEAVY_MODELS : GROQ_LIGHT_MODELS,
            name: 'System-Groq (Default)'
        });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && !userKeys?.openai) {
        const sysOpenAI = createOpenAI({ apiKey: openaiKey });
        configs.push({
            provider: sysOpenAI,
            models: taskType === 'heavy' ? OPENAI_HEAVY_MODELS : OPENAI_LIGHT_MODELS,
            name: 'System-OpenAI (Default)'
        });
    }

    if (configs.length === 0) {
        throw new Error('No AI provider configured. Please provide your own API key (Gemini, OpenAI, Anthropic, or Groq) in Settings, or configure system API keys.');
    }

    return configs;
}


// ============================================================================
// Streaming Generation with Failover
// ============================================================================

/**
 * Robust streaming generation across Gemini, OpenAI, Anthropic, and Groq model chains with 15s timeout failover.
 */
export async function generateStream(
    prompt: string,
    systemPrompt?: string,
    taskType: TaskType = 'heavy',
    options?: { maxTokens?: number; abortSignal?: AbortSignal; userKeys?: UserApiKeys }
): Promise<{ textStream: ReadableStream<string>; model: string }> {
    const providerConfigs = getProviderConfigurations(taskType, options?.userKeys);

    const maxOutputTokens = options?.maxTokens || 4000;
    const errors: string[] = [];

    for (const config of providerConfigs) {
        const { provider, models, name: providerName } = config;

        for (const modelId of models) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.log(`[${providerName}] ${modelId} timed out after 15s, failing over...`);
                controller.abort();
            }, 15000);

            if (options?.abortSignal) {
                options.abortSignal.addEventListener('abort', () => controller.abort());
            }

            try {
                console.log(`[${providerName}] Attempting ${modelId}...`);

                const result = streamText({
                    model: provider(modelId),
                    prompt,
                    system: systemPrompt,
                    maxOutputTokens,
                    temperature: 0.2,
                    topP: 0.8,
                    abortSignal: controller.signal,
                });

                const reader = result.textStream.getReader();
                const firstChunk = await reader.read();

                clearTimeout(timeoutId);

                if (firstChunk.done) {
                    throw new Error('Empty stream');
                }

                console.log(`[${providerName}] Stream connected via ${modelId}`);

                const fullStream = new ReadableStream<string>({
                    async start(streamController) {
                        streamController.enqueue(firstChunk.value);
                        try {
                            while (true) {
                                const { done, value } = await reader.read();
                                if (done) break;
                                streamController.enqueue(value);
                            }
                            streamController.close();
                        } catch (e) {
                            streamController.error(e);
                        }
                    },
                });

                return { textStream: fullStream, model: `${providerName}/${modelId}` };
            } catch (e) {
                clearTimeout(timeoutId);
                const msg = e instanceof Error ? e.message : String(e);
                console.log(`[${providerName}] ${modelId} failed: ${msg.slice(0, 100)}, failing over...`);
                errors.push(`${providerName}:${modelId}: ${msg.slice(0, 200)}`);
            }
        }
    }

    throw new Error(`All providers and models exhausted. Attempts: ${errors.join(' | ')}`);
}

/**
 * Helper to collect an entire stream into a single string.
 */
export async function collectStream(stream: ReadableStream<string>): Promise<string> {
    const reader = stream.getReader();
    let accumulated = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += value;
    }
    return accumulated;
}
