import "server-only";

/**
 * Generic per-key rate limit, in-memory and best-effort.
 *
 * Originally written just for `POST /api/orders`; generalised here so admin
 * login can reuse the exact same mechanism instead of a second copy of the
 * same 20 lines. Both are the same shape of problem: one unauthenticated
 * write endpoint, keyed by IP.
 *
 * Deliberately in-memory, not Redis/Upstash: this app runs on Vercel, where
 * serverless instances are not guaranteed to share memory, so this is a
 * best-effort throttle, not a hard guarantee — see GAP-011 in
 * docs/ai-memory/gaps.md, opened when this was orders-only and unchanged by
 * generalising it to a second caller.
 */
export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

const buckets = new Map<string, number[]>();

/** Bounds memory when this runs long enough to accumulate stale keys. */
function sweep(now: number, windowMs: number) {
  for (const [key, timestamps] of buckets) {
    const recent = timestamps.filter((t) => now - t < windowMs);
    if (recent.length === 0) buckets.delete(key);
    else buckets.set(key, recent);
  }
}

let requestsSinceSweep = 0;

/**
 * `key` should combine a namespace and the caller's identity, e.g.
 * `"orders:" + ip` and `"admin-login:" + ip` — two different endpoints must
 * never share a bucket, or one endpoint's traffic could exhaust the other's
 * allowance.
 */
export function checkRateLimit(
  key: string,
  { windowMs, max }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();

  requestsSinceSweep += 1;
  if (requestsSinceSweep >= 200) {
    sweep(now, windowMs);
    requestsSinceSweep = 0;
  }

  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  const [oldest] = timestamps;
  if (oldest !== undefined && timestamps.length >= max) {
    const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  return { allowed: true };
}

/** Best-effort client IP from proxy headers; Vercel sets x-forwarded-for. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const [first] = forwarded?.split(",") ?? [];
  return first?.trim() || "unknown";
}
