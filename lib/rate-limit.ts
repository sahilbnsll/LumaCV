import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Define a common interface or type for the limiter to ensure type safety
interface RateLimiter {
  limit: (identifier: string) => Promise<{ success: boolean; limit: number; remaining: number; reset: number; pending: Promise<unknown> }>;
}

let ratelimit: RateLimiter;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "15 m"),
    analytics: true,
    prefix: "@upstash/ratelimit",
  });
} else {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set, rate limiting disabled."
    );
  }
  ratelimit = {
    limit: async () => ({
      success: true,
      limit: 100,
      remaining: 100,
      reset: 0,
      pending: Promise.resolve(),
    }),
  };
}

/**
 * In-memory sliding-window limiter for the Typst compile endpoint.
 *
 * The compile route is a synchronous, self-hosted, sub-50ms operation (spawn
 * a local Typst process, no external API call) — it fires on every debounced
 * edit (color swatch, template swap, a single keystroke), so it needs basic
 * abuse protection, not the network-backed Upstash limiter built for slow,
 * costly, externally-metered calls (LLM providers etc). Routing it through
 * Redis added a real round trip to every keystroke and made live preview
 * feel sluggish for no real benefit, since a runaway compile loop is
 * self-limited by local CPU/process-spawn cost anyway. This limiter never
 * leaves the process, so it adds ~0ms and needs no Redis/Upstash config.
 * It's per-serverless-instance rather than globally consistent, which is an
 * acceptable trade for a same-origin, compute-bound, non-monetary endpoint.
 */
const COMPILE_WINDOW_MS = 60_000;
const COMPILE_MAX_REQUESTS = 90;
const compileHits = new Map<string, number[]>();

function pruneCompileHits() {
  if (compileHits.size < 500) return;
  const cutoff = Date.now() - COMPILE_WINDOW_MS;
  for (const [key, timestamps] of compileHits) {
    const kept = timestamps.filter((t) => t > cutoff);
    if (kept.length === 0) compileHits.delete(key);
    else compileHits.set(key, kept);
  }
}

const compileRatelimit: RateLimiter = {
  limit: async (identifier: string) => {
    const now = Date.now();
    const cutoff = now - COMPILE_WINDOW_MS;
    const existing = (compileHits.get(identifier) || []).filter((t) => t > cutoff);
    existing.push(now);
    compileHits.set(identifier, existing);
    pruneCompileHits();

    const remaining = Math.max(0, COMPILE_MAX_REQUESTS - existing.length);
    return {
      success: existing.length <= COMPILE_MAX_REQUESTS,
      limit: COMPILE_MAX_REQUESTS,
      remaining,
      reset: cutoff + COMPILE_WINDOW_MS,
      pending: Promise.resolve(),
    };
  },
};

export { ratelimit, compileRatelimit };
