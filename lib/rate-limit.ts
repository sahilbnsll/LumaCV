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

export { ratelimit };
