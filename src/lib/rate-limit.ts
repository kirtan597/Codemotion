import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// In-memory fallback token bucket for local dev or when Upstash credentials are absent
interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const memoryBuckets = new Map<string, TokenBucket>();

const MEMORY_CONFIG = {
  maxTokens: 10,
  refillRate: 1, // tokens per minute
  refillInterval: 60000, // 1 minute in ms
};

function memoryCheck(identifier: string): boolean {
  const now = Date.now();
  let bucket = memoryBuckets.get(identifier);

  if (!bucket) {
    bucket = {
      tokens: MEMORY_CONFIG.maxTokens,
      lastRefill: now,
    };
    memoryBuckets.set(identifier, bucket);
  }

  const timePassed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor(timePassed / MEMORY_CONFIG.refillInterval) * MEMORY_CONFIG.refillRate;

  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(MEMORY_CONFIG.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens--;
    return true;
  }

  return false;
}

// Lazy-initialize Upstash Ratelimit when env vars are available
let upstashRatelimit: Ratelimit | null = null;

function getUpstashRatelimit(): Ratelimit | null {
  if (upstashRatelimit) return upstashRatelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    const redis = new Redis({ url, token });
    upstashRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: 'codemotion:ratelimit',
    });
    return upstashRatelimit;
  }

  return null;
}

/**
 * Checks rate limit for a given identifier (e.g., client IP).
 * Uses Upstash Redis in production; falls back to in-memory bucket locally.
 */
export async function checkRateLimit(identifier: string): Promise<boolean> {
  const limiter = getUpstashRatelimit();

  if (limiter) {
    try {
      const { success } = await limiter.limit(identifier);
      return success;
    } catch (err) {
      console.warn('Upstash rate limit check failed, falling back to in-memory:', err);
      return memoryCheck(identifier);
    }
  }

  return memoryCheck(identifier);
}
