/**
 * Оддий ойна бўйича rate limit (Redis йўқ — бitta процесс учун).
 * @param {{ windowMs?: number, max?: number, keyFn?: (req: import('express').Request) => string }} opts
 */
function createRateLimiter(opts = {}) {
  const windowMs = Number(opts.windowMs) > 0 ? Number(opts.windowMs) : 60_000;
  const max = Number(opts.max) > 0 ? Number(opts.max) : 100;
  const keyFn =
    opts.keyFn ||
    ((req) => {
      const xff = req.headers["x-forwarded-for"];
      if (typeof xff === "string" && xff.trim()) {
        return xff.split(",")[0].trim();
      }
      return req.ip || req.socket?.remoteAddress || "unknown";
    });

  /** @type {Map<string, { count: number, windowStart: number }>} */
  const buckets = new Map();

  return function rateLimit(req, res, next) {
    const key = keyFn(req);
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || now - b.windowStart >= windowMs) {
      b = { count: 0, windowStart: now };
      buckets.set(key, b);
    }
    b.count += 1;
    const remaining = Math.max(0, max - b.count);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    if (b.count > max) {
      const retry = Math.ceil((b.windowStart + windowMs - now) / 1000);
      res.setHeader("Retry-After", String(Math.max(1, retry)));
      return res.status(429).json({
        error: "Too many requests.",
        retryAfterSeconds: Math.max(1, retry),
      });
    }
    next();
  };
}

module.exports = { createRateLimiter };
