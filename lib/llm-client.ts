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
 * (llama-3.1-70b-versatile and mixtral-8x7b-32768 have been decommissioned by
 * Groq — replaced with the current lineup, matching what's proven working in
 * the sibling Portfolio project's own multi-provider chat route.)
 */
const GROQ_HEAVY_MODELS = [
    // allam-2-7b deliberately excluded here — it hard-rejects any max_tokens
    // over 4096, which is too small for the combined resume+JD-keywords+ATS-
    // summary payload heavy tasks send; it stays in the light pool below where
    // its cap is never an issue.
    'groq/compound-mini',
    'groq/compound',
    'qwen/qwen3.8-27b',
    'qwen/qwen3.6-27b',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
];

const GROQ_LIGHT_MODELS = [
    'qwen/qwen3.6-27b',
    'openai/gpt-oss-20b',
    'groq/compound-mini',
    'allam-2-7b',
];

/**
 * Google Gemini Active Models
 * (gemini-2.0-flash and gemini-1.5-pro have been retired by Google.
 * gemini-flash-latest is a rolling alias so it won't go stale the same way.)
 */
const GEMINI_HEAVY_MODELS = [
    'gemini-2.5-flash',
    'gemini-flash-latest',
];

const GEMINI_LIGHT_MODELS = [
    'gemini-2.5-flash-lite-preview-06-17',
    'gemini-2.5-flash',
    'gemini-flash-latest',
];

/**
 * Mistral AI Active Models — OpenAI-compatible endpoint (api.mistral.ai/v1).
 */
const MISTRAL_HEAVY_MODELS = [
    'codestral-latest',
    'ministral-14b-latest',
    'open-mistral-nemo',
];

const MISTRAL_LIGHT_MODELS = [
    'ministral-8b-latest',
    'ministral-3b-latest',
    'open-mistral-nemo',
];

/**
 * OpenRouter Active Models — free-tier models via OpenAI-compatible endpoint.
 */
const OPENROUTER_HEAVY_MODELS = [
    'nvidia/nemotron-3-super-120b-a12b:free',
    'nvidia/nemotron-3.5-lightning:free',
    'poolside/laguna-s-2.1:free',
];

const OPENROUTER_LIGHT_MODELS = [
    'nvidia/nemotron-3.5-lightning:free',
    'poolside/laguna-s-2.1:free',
];

/**
 * GitHub Models Active Models — OpenAI-compatible endpoint (models.github.ai).
 */
const GITHUB_MODELS_HEAVY_MODELS = [
    'gpt-4o-mini',
    'Meta-Llama-3.1-8B-Instruct',
];

const GITHUB_MODELS_LIGHT_MODELS = [
    'Phi-3.5-mini-instruct',
    'gpt-4o-mini',
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
            // Groq's OpenAI-compatible endpoint only implements Chat Completions —
            // calling the provider directly (or .languageModel/.responses) defaults
            // to the newer Responses API, which Groq doesn't support and which was
            // making every Groq model fail with a generic "not found" error.
            provider: (modelId: string) => userGroq.chat(modelId),
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
    // Groq goes first: it's LPU-accelerated and consistently the fastest chain
    // member by a wide margin (often sub-second first-token, vs several
    // seconds for Gemini/OpenAI-class hosted inference). Most users have no
    // BYOK key, so this ordering is what the majority of real requests pay —
    // trying the slowest-typical provider first was adding real, avoidable
    // latency to the common case even when nothing failed over at all.
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey && !userKeys?.groq) {
        const groq = createOpenAI({
            baseURL: 'https://api.groq.com/openai/v1',
            apiKey: groqKey,
        });
        configs.push({
            // See BYOK-Groq comment above — Groq only supports Chat Completions.
            provider: (modelId: string) => groq.chat(modelId),
            models: taskType === 'heavy' ? GROQ_HEAVY_MODELS : GROQ_LIGHT_MODELS,
            name: 'System-Groq (Default)'
        });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && !userKeys?.gemini) {
        const google = createGoogleGenerativeAI({ apiKey: geminiKey });
        configs.push({
            provider: google,
            models: taskType === 'heavy' ? GEMINI_HEAVY_MODELS : GEMINI_LIGHT_MODELS,
            name: 'System-Gemini (Default)'
        });
    }

    // Mistral, OpenRouter, and GitHub Models are all OpenAI-compatible endpoints —
    // same .chat() requirement as Groq (see comment above). System-only for now,
    // matching how the sibling Portfolio project's chat route configures them
    // (plain env vars, no BYOK plumbing for these three).
    const mistralKey = process.env.MISTRAL_API_KEY;
    if (mistralKey) {
        const mistral = createOpenAI({ baseURL: 'https://api.mistral.ai/v1', apiKey: mistralKey });
        configs.push({
            provider: (modelId: string) => mistral.chat(modelId),
            models: taskType === 'heavy' ? MISTRAL_HEAVY_MODELS : MISTRAL_LIGHT_MODELS,
            name: 'System-Mistral (Default)'
        });
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey) {
        const openRouter = createOpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: openRouterKey,
            headers: {
                'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://lumacv.sahilbansal.net',
                'X-Title': 'LumaCV',
            },
        });
        configs.push({
            provider: (modelId: string) => openRouter.chat(modelId),
            models: taskType === 'heavy' ? OPENROUTER_HEAVY_MODELS : OPENROUTER_LIGHT_MODELS,
            name: 'System-OpenRouter (Default)'
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

    const githubModelsKey = process.env.GITHUB_MODELS_TOKEN || process.env.GITHUB_TOKEN;
    if (githubModelsKey) {
        const githubModels = createOpenAI({ baseURL: 'https://models.github.ai/inference', apiKey: githubModelsKey });
        configs.push({
            provider: (modelId: string) => githubModels.chat(modelId),
            models: taskType === 'heavy' ? GITHUB_MODELS_HEAVY_MODELS : GITHUB_MODELS_LIGHT_MODELS,
            name: 'System-GitHubModels (Default)'
        });
    }

    if (configs.length === 0) {
        throw new Error('No AI provider configured. Please provide your own API key (Gemini, OpenAI, Anthropic, or Groq) in Settings, or configure a system API key (Gemini, Groq, Mistral, OpenRouter, OpenAI, or GitHub Models).');
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
    options?: {
        maxTokens?: number;
        abortSignal?: AbortSignal;
        userKeys?: UserApiKeys;
        maxAttempts?: number;
        // Without this, failover only triggers on hard errors (network failure,
        // timeout, empty stream) — a model that streams back syntactically fine
        // but substantively useless content (e.g. `{}` from a weak fallback
        // model under load) looks like a "success" and failover stops there.
        // When provided, the full stream is collected up front and validated
        // before committing to this model; a failed validation is treated the
        // same as any other failure and the loop moves to the next model.
        validate?: (fullText: string) => boolean;
    }
): Promise<{ textStream: ReadableStream<string>; model: string }> {
    const providerConfigs = getProviderConfigurations(taskType, options?.userKeys);

    const maxOutputTokens = options?.maxTokens || 4000;
    const errors: string[] = [];
    // No cap by default: on genuine failure this should fail over across every
    // configured provider (Gemini -> Groq -> Mistral -> OpenRouter -> OpenAI ->
    // GitHub Models) — that resilience is the whole point of configuring 5+
    // providers. The "many AI API requests" complaint this used to guard
    // against was actually the *pipeline* re-triggering itself on every
    // success (a useEffect dependency bug in step3-processing.tsx, now fixed
    // at the source) — not legitimate model failover depth. Callers that truly
    // want a shallow, fast-fail chain can still pass `maxAttempts` explicitly.
    const maxAttempts = options?.maxAttempts ?? Infinity;
    let attempts = 0;

    outer: for (const config of providerConfigs) {
        const { provider, models, name: providerName } = config;

        for (const modelId of models) {
            if (attempts >= maxAttempts) break outer;
            attempts++;
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
                    // The AI SDK's own default retry-with-exponential-backoff (3
                    // attempts) fights our failover loop: on a quota-exhausted or
                    // rate-limited model it can burn 30-90s retrying the SAME dead
                    // model before giving control back to us. Our outer loop already
                    // provides retry/failover across every configured model and
                    // provider, so let a single failure here fail over immediately.
                    maxRetries: 0,
                });

                // Consume the first chunk to verify the stream is alive
                // and catch SDK-level errors (e.g. "model output must contain
                // either output text or tool calls") before we commit.
                let firstChunk: ReadableStreamReadResult<string>;
                try {
                    const reader0 = result.textStream.getReader();
                    firstChunk = await reader0.read();
                    reader0.releaseLock();
                } catch (sdkErr) {
                    // SDK threw synchronously on empty / invalid output
                    throw sdkErr;
                }

                clearTimeout(timeoutId);

                if (firstChunk.done || !firstChunk.value) {
                    throw new Error('Empty stream — model returned no output');
                }

                console.log(`[${providerName}] Stream connected via ${modelId}`);

                if (options?.validate) {
                    // Content-quality gate: collect the rest of the stream now so we
                    // can judge the full output before committing to this model.
                    let fullText = firstChunk.value as string;
                    const reader = result.textStream.getReader();
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        fullText += value;
                    }

                    if (!options.validate(fullText)) {
                        throw new Error('Model returned unusable/empty content');
                    }

                    const collectedStream = new ReadableStream<string>({
                        start(streamController) {
                            streamController.enqueue(fullText);
                            streamController.close();
                        },
                    });

                    return { textStream: collectedStream, model: `${providerName}/${modelId}` };
                }

                // Re-create a clean reader for the caller
                const fullStream = new ReadableStream<string>({
                    async start(streamController) {
                        streamController.enqueue(firstChunk.value as string);
                        const reader = result.textStream.getReader();
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
                // Treat empty-output SDK errors the same as any other failover
                const isEmptyOutputError = msg.toLowerCase().includes('model output') ||
                    msg.toLowerCase().includes('empty stream') ||
                    msg.toLowerCase().includes('no object generated') ||
                    msg.toLowerCase().includes('unusable');
                if (isEmptyOutputError) {
                    console.log(`[${providerName}] ${modelId} returned empty output, failing over...`);
                } else {
                    console.log(`[${providerName}] ${modelId} failed: ${msg.slice(0, 100)}, failing over...`);
                }
                errors.push(`${providerName}:${modelId}: ${msg.slice(0, 200)}`);
            }
        }
    }

    throw new Error(`AI request failed after ${errors.length} attempt(s): ${errors.join(' | ')}`);
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
