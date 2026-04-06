import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, LanguageModel } from 'ai';

// ============================================================================
// Model Chains — easily configurable
// ============================================================================

/** Complex JSON tasks: resume parsing, tailoring */
const OPENROUTER_HEAVY_MODELS = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemma-3-27b-it:free',
    'google/gemini-2.5-flash-free',
    'deepseek/deepseek-r1:free',
    'huggingfaceh4/zephyr-7b-beta:free'
];

/** Fast tasks: JD analysis, keyword extraction */
const OPENROUTER_LIGHT_MODELS = [
    'meta-llama/llama-3.2-3b-instruct:free',
    'google/gemma-3-12b-it:free',
    'qwen/qwen3-coder:free',
    'microsoft/phi-3-mini-128k-instruct:free',
    'huggingfaceh4/zephyr-7b-beta:free',
    'mistralai/mistral-7b-instruct:free'
];

/** Native Gemini Models via Google AI Studio */
const GEMINI_MODELS = [
    'gemini-flash-latest',
    'gemini-3-flash-preview',
    'gemini-3.1-flash-lite-preview',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.5-pro'
];

export type TaskType = 'heavy' | 'light';

// ============================================================================
// JSON extraction utility
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

function getProviderConfigurations(taskType: TaskType): Array<{
    provider: (modelId: string) => LanguageModel,
    models: string[],
    name: string
}> {
    const configs = [];

    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
        const google = createGoogleGenerativeAI({ apiKey: geminiKey });
        configs.push({
            provider: google,
            models: GEMINI_MODELS,
            name: 'GeminiNative'
        });
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (openrouterKey) {
        const openrouter = createOpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: openrouterKey,
            headers: {
                'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                'X-Title': 'LumaAI',
            },
        });
        configs.push({
            provider: openrouter,
            models: taskType === 'heavy' ? OPENROUTER_HEAVY_MODELS : OPENROUTER_LIGHT_MODELS,
            name: 'OpenRouter'
        });
    }

    if (configs.length === 0) {
        throw new Error('No AI provider configured. Set GEMINI_API_KEY or OPENROUTER_API_KEY in Environment Variables.');
    }

    return configs;
}

// ============================================================================
// Streaming Generation with Dual-Chain Failover
// ============================================================================

/**
 * Stream text from provider with multi-model failover.
 * Uses the Vercel AI SDK `streamText()` under the hood.
 *
 * CRITICAL: 15-second timeout per model via AbortController.
 *
 * @param prompt - The prompt to send
 * @param systemPrompt - Optional system prompt
 * @param taskType - 'heavy' for complex JSON tasks, 'light' for fast extraction
 * @param options - Additional options (maxTokens, external abortSignal)
 */
export async function generateStream(
    prompt: string,
    systemPrompt: string | undefined,
    taskType: TaskType,
    options: { maxTokens?: number; abortSignal?: AbortSignal } = {}
) {
    const configs = getProviderConfigurations(taskType);
    const maxOutputTokens = options.maxTokens || 4000;
    const errors: string[] = [];

    for (const config of configs) {
        const { provider, models, name: providerName } = config;

        for (const modelId of models) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.log(`[${providerName}] ${modelId} timed out after 15s, failing over...`);
                controller.abort();
            }, 15000);

            // Combine external abort with per-model timeout
            if (options.abortSignal) {
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

                // We need to verify the stream actually starts producing data.
                // streamText() returns synchronously, so we must await the first chunk
                // to confirm the model is responding before clearing the timeout.
                const reader = result.textStream.getReader();
                const firstChunk = await reader.read();

                // Model responded — clear the timeout
                clearTimeout(timeoutId);

                if (firstChunk.done) {
                    throw new Error('Empty stream');
                }

                console.log(`[${providerName}] Stream connected via ${modelId}`);

                // Create a new ReadableStream that yields the first chunk + remaining chunks
                const fullStream = new ReadableStream<string>({
                    async start(streamController) {
                        // Yield the first chunk we already read
                        streamController.enqueue(firstChunk.value);

                        // Continue reading the rest
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

                return { textStream: fullStream, model: modelId };
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

// ============================================================================
// Helper: collect full stream into a string (for server-side use)
// ============================================================================

export async function collectStream(stream: ReadableStream<string>): Promise<string> {
    const reader = stream.getReader();
    let result = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += value;
    }
    return result;
}
