// Simple in-memory token bucket rate limiter
// NOTE: For production, use Redis/Upstash for distributed rate limiting

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, TokenBucket>();

const RATE_LIMIT_CONFIG = {
  maxTokens: 10,
  refillRate: 1, // tokens per minute
  refillInterval: 60000, // 1 minute in ms
};

function refillBucket(bucket: TokenBucket): void {
  const now = Date.now();
  const timePassed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor(timePassed / RATE_LIMIT_CONFIG.refillInterval) * RATE_LIMIT_CONFIG.refillRate;
  
  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(RATE_LIMIT_CONFIG.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }
}

export function checkRateLimit(identifier: string): boolean {
  let bucket = buckets.get(identifier);
  
  if (!bucket) {
    bucket = {
      tokens: RATE_LIMIT_CONFIG.maxTokens,
      lastRefill: Date.now(),
    };
    buckets.set(identifier, bucket);
  }
  
  refillBucket(bucket);
  
  if (bucket.tokens > 0) {
    bucket.tokens--;
    return true;
  }
  
  return false;
}

// Cleanup old buckets periodically to prevent memory leak
setInterval(() => {
  const now = Date.now();
  const maxAge = 3600000; // 1 hour
  
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.lastRefill > maxAge) {
      buckets.delete(key);
    }
  }
}, 600000); // Run every 10 minutes
