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
    'qwen/qwen3.6-plus:free',
];

/** Fast tasks: JD analysis, keyword extraction */
const OPENROUTER_LIGHT_MODELS = [
    'meta-llama/llama-3.2-3b-instruct:free',
    'google/gemma-3-12b-it:free',
    'qwen/qwen3-coder:free',
];

/** Native Gemini Models via Google AI Studio */
const GEMINI_MODELS = [
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash'
];

export type TaskType = 'heavy' | 'light';

// ============================================================================
// JSON extraction utility
// ============================================================================

/**
 * Models may return JSON wrapped in markdown fences or with leading/trailing prose.
 */
export function extractJsonObjectFromAssistantText(text: string): string {
    const trimmed = text.trim();
    const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```/im);
    if (fenced?.[1]) {
        return fenced[1].trim();
    }
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
        return trimmed.slice(start, end + 1);
    }
    return trimmed;
}

// ============================================================================
// Provider Configuration
// ============================================================================

function getProviderConfiguration(taskType: TaskType): { 
    provider: (modelId: string) => LanguageModel, 
    models: string[], 
    name: string 
} {
    if (process.env.GEMINI_API_KEY) {
        const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
        return {
            provider: google,
            models: GEMINI_MODELS,
            name: 'GeminiNative'
        };
    }

    if (process.env.OPENROUTER_API_KEY) {
        const openrouter = createOpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: process.env.OPENROUTER_API_KEY,
            headers: {
                'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                'X-Title': 'LumaAI',
            },
        });
        return {
            provider: openrouter,
            models: taskType === 'heavy' ? OPENROUTER_HEAVY_MODELS : OPENROUTER_LIGHT_MODELS,
            name: 'OpenRouter'
        };
    }

    throw new Error('No AI provider configured. Set GEMINI_API_KEY or OPENROUTER_API_KEY in Environment Variables.');
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
    const { provider, models, name: providerName } = getProviderConfiguration(taskType);
    const maxOutputTokens = options.maxTokens || 4000;
    const errors: string[] = [];

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
            errors.push(`${modelId}: ${msg.slice(0, 200)}`);
        }
    }

    throw new Error(`[${providerName}] All models exhausted. Attempts: ${errors.join(' | ')}`);
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
