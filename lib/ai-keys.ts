/**
 * Client & server helper for Bring-Your-Own-Key (BYOK) AI provider keys and custom model selection.
 * Keys and preferences are stored locally in the browser and transmitted via encrypted headers.
 */

export interface UserApiKeys {
    gemini?: string;
    openai?: string;
    anthropic?: string;
    groq?: string;

    preferredProvider?: 'gemini' | 'openai' | 'anthropic' | 'groq';
    geminiModel?: string;
    openaiModel?: string;
    anthropicModel?: string;
    groqModel?: string;
}

export const PROVIDER_AVAILABLE_MODELS: Record<'gemini' | 'openai' | 'anthropic' | 'groq', string[]> = {
    gemini: [
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-flash-latest',
        'gemini-2.5-flash-lite',
    ],
    openai: [
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-turbo',
        'o3-mini',
    ],
    anthropic: [
        'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022',
        'claude-3-opus-20240229',
    ],
    groq: [
        'qwen/qwen3.6-27b',
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'openai/gpt-oss-120b',
    ],
};

const STORAGE_KEY = 'lumacv_user_ai_keys';

/**
 * Retrieve user keys from browser localStorage (client-side only).
 */
export function getUserApiKeys(): UserApiKeys {
    if (typeof window === 'undefined') return {};
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return {};
        return JSON.parse(stored) as UserApiKeys;
    } catch {
        return {};
    }
}

/**
 * Save user keys and model selections to browser localStorage.
 */
export function saveUserApiKeys(keys: UserApiKeys): void {
    if (typeof window === 'undefined') return;
    try {
        const cleaned: UserApiKeys = {};
        if (keys.gemini?.trim()) cleaned.gemini = keys.gemini.trim();
        if (keys.openai?.trim()) cleaned.openai = keys.openai.trim();
        if (keys.anthropic?.trim()) cleaned.anthropic = keys.anthropic.trim();
        if (keys.groq?.trim()) cleaned.groq = keys.groq.trim();

        if (keys.preferredProvider) cleaned.preferredProvider = keys.preferredProvider;
        if (keys.geminiModel?.trim()) cleaned.geminiModel = keys.geminiModel.trim();
        if (keys.openaiModel?.trim()) cleaned.openaiModel = keys.openaiModel.trim();
        if (keys.anthropicModel?.trim()) cleaned.anthropicModel = keys.anthropicModel.trim();
        if (keys.groqModel?.trim()) cleaned.groqModel = keys.groqModel.trim();

        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    } catch (e) {
        console.error('Failed to save AI keys to localStorage:', e);
    }
}

/**
 * Clear all stored keys.
 */
export function clearUserApiKeys(): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error('Failed to clear AI keys:', e);
    }
}

/**
 * Check if at least one custom key is configured.
 */
export function hasCustomKeys(keys?: UserApiKeys): boolean {
    const k = keys || getUserApiKeys();
    return Boolean(k.gemini || k.openai || k.anthropic || k.groq);
}

/**
 * Count how many custom keys are configured.
 */
export function countConfiguredKeys(keys?: UserApiKeys): number {
    const k = keys || getUserApiKeys();
    let count = 0;
    if (k.gemini) count++;
    if (k.openai) count++;
    if (k.anthropic) count++;
    if (k.groq) count++;
    return count;
}

/**
 * Construct request headers carrying user keys and chosen model preferences.
 */
export function getCustomKeyHeaders(keys?: UserApiKeys): Record<string, string> {
    const k = keys || getUserApiKeys();
    const headers: Record<string, string> = {};

    if (k.gemini) headers['x-user-gemini-key'] = k.gemini;
    if (k.openai) headers['x-user-openai-key'] = k.openai;
    if (k.anthropic) headers['x-user-anthropic-key'] = k.anthropic;
    if (k.groq) headers['x-user-groq-key'] = k.groq;

    if (k.preferredProvider) headers['x-user-preferred-provider'] = k.preferredProvider;
    if (k.geminiModel) headers['x-user-gemini-model'] = k.geminiModel;
    if (k.openaiModel) headers['x-user-openai-model'] = k.openaiModel;
    if (k.anthropicModel) headers['x-user-anthropic-model'] = k.anthropicModel;
    if (k.groqModel) headers['x-user-groq-model'] = k.groqModel;

    return headers;
}

/**
 * Server-side helper to extract user keys and model preferences from incoming request headers.
 */
export function extractUserApiKeys(req: Request): UserApiKeys {
    const keys: UserApiKeys = {};

    const gemini = req.headers.get('x-user-gemini-key');
    const openai = req.headers.get('x-user-openai-key');
    const anthropic = req.headers.get('x-user-anthropic-key');
    const groq = req.headers.get('x-user-groq-key');

    if (gemini?.trim()) keys.gemini = gemini.trim();
    if (openai?.trim()) keys.openai = openai.trim();
    if (anthropic?.trim()) keys.anthropic = anthropic.trim();
    if (groq?.trim()) keys.groq = groq.trim();

    // Only accept model preferences if the user actually supplied their own key for that provider!
    // Free users without their own key are strictly restricted to the platform defaults.
    if (keys.gemini && req.headers.get('x-user-gemini-model')) {
        keys.geminiModel = req.headers.get('x-user-gemini-model')!.trim();
    }
    if (keys.openai && req.headers.get('x-user-openai-model')) {
        keys.openaiModel = req.headers.get('x-user-openai-model')!.trim();
    }
    if (keys.anthropic && req.headers.get('x-user-anthropic-model')) {
        keys.anthropicModel = req.headers.get('x-user-anthropic-model')!.trim();
    }
    if (keys.groq && req.headers.get('x-user-groq-model')) {
        keys.groqModel = req.headers.get('x-user-groq-model')!.trim();
    }

    const preferred = req.headers.get('x-user-preferred-provider') as UserApiKeys['preferredProvider'];
    if (preferred && keys[preferred]) {
        keys.preferredProvider = preferred;
    }

    return keys;
}
