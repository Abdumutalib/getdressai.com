/**
 * Rate limiter with optional Redis backend and in-memory fallback.
 * @param {{
 *  windowMs?: number,
 *  max?: number,
 *  keyFn?: (req: import('express').Request) => string,
 *  skipFn?: (req: import('express').Request) => boolean,
 *  redisUrl?: string,
 *  keyPrefix?: string
 * }} opts
 */
function createRateLimiter(opts = {}) {
  const windowMs = Number(opts.windowMs) > 0 ? Number(opts.windowMs) : 60_000;
  const max = Number(opts.max) > 0 ? Number(opts.max) : 100;
  const skipFn = typeof opts.skipFn === "function" ? opts.skipFn : null;
  const redisUrl = String(opts.redisUrl || "").trim();
  const keyPrefix = String(opts.keyPrefix || "global").trim() || "global";

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
  let lastSweepAt = Date.now();
  const sweepInterval = Math.max(windowMs * 2, 60_000);

  let redisExecPromise = null;

  function sweepMemoryBuckets(now) {
    if (now - lastSweepAt < sweepInterval) {
      return;
    }
    lastSweepAt = now;
    for (const [bucketKey, bucket] of buckets.entries()) {
      if (now - bucket.windowStart >= windowMs) {
        buckets.delete(bucketKey);
      }
    }
  }

  function incrementMemory(key, now) {
    sweepMemoryBuckets(now);
    let b = buckets.get(key);
    if (!b || now - b.windowStart >= windowMs) {
      b = { count: 0, windowStart: now };
      buckets.set(key, b);
    }
    b.count += 1;
    const retryMs = Math.max(1, b.windowStart + windowMs - now);
    return { count: b.count, retryMs, store: "memory" };
  }

  function getRedisExecutor() {
    if (!redisUrl) {
      return Promise.resolve(null);
    }

    if (redisExecPromise) {
      return redisExecPromise;
    }

    redisExecPromise = (async () => {
      let createClient;
      try {
        ({ createClient } = require("redis"));
      } catch {
        return null;
      }

      const client = createClient({ url: redisUrl });
      client.on("error", () => {});
      await client.connect();

      return async function execRateLimit(redisKey, ttlWindowMs) {
        const result = await client.eval(
          `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
return {current, ttl}
          `,
          {
            keys: [redisKey],
            arguments: [String(ttlWindowMs)],
          }
        );

        const count = Array.isArray(result) ? Number(result[0]) : Number(result);
        const ttlMs = Array.isArray(result) ? Number(result[1]) : 0;
        return {
          count: Number.isFinite(count) ? count : 1,
          retryMs: Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : ttlWindowMs,
          store: "redis",
        };
      };
    })().catch(() => null);

    return redisExecPromise;
  }

  return function rateLimit(req, res, next) {
    if (skipFn && skipFn(req)) {
      return next();
    }

    const baseKey = keyFn(req);
    const now = Date.now();

    Promise.resolve()
      .then(async () => {
        const redisExec = await getRedisExecutor();
        if (redisExec) {
          try {
            return await redisExec(`rl:${keyPrefix}:${baseKey}`, windowMs);
          } catch {
            return incrementMemory(baseKey, now);
          }
        }
        return incrementMemory(baseKey, now);
      })
      .then(({ count, retryMs }) => {
        const remaining = Math.max(0, max - count);
        res.setHeader("X-RateLimit-Limit", String(max));
        res.setHeader("X-RateLimit-Remaining", String(remaining));

        if (count > max) {
          const retryAfterSeconds = Math.max(1, Math.ceil(retryMs / 1000));
          res.setHeader("Retry-After", String(retryAfterSeconds));
          return res.status(429).json({
            error: "Too many requests.",
            retryAfterSeconds,
          });
        }

        return next();
      })
      .catch(next);
  };
}

module.exports = { createRateLimiter };
