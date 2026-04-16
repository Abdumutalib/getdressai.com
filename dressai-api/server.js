require("dotenv").config();

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");
const { handleStripeTrial } = require("./api/stripe-trial.js");
const { handleCancelTrial } = require("./api/cancel-trial.js");
const { handleUserSubscriptionStatus } = require("./api/user-subscription-status.js");
const { handleUserQuota } = require("./api/user-quota.js");
const { handlePaddleWebhook } = require("./api/paddle-webhook.js");
const { getPaddle } = require("./api/paddle-client.js");
const { createRateLimiter } = require("./lib/rate-limit.js");

const app = express();
app.set("trust proxy", 1);
const port = Number(process.env.PORT) || 3000;
const usersFilePath = path.join(__dirname, "data", "users.json");
const jwtSecret = process.env.JWT_SECRET || "dev-only-secret-change-me";
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const stripePriceId = process.env.STRIPE_PRO_PRICE_ID || "";
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const supabaseAdmin =
  supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;
const redisRateLimitUrl =
  process.env.RATE_LIMIT_REDIS_URL?.trim() || process.env.REDIS_URL?.trim() || "";

function parseNumEnv(key, fallback) {
  const raw = process.env[key];
  if (raw == null || String(raw).trim() === "") {
    return fallback;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function parseCsvEnv(key, fallback = []) {
  const raw = process.env[key];
  if (raw == null || String(raw).trim() === "") {
    return fallback;
  }
  return String(raw)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function getRateLimitKey(req) {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const digest = crypto.createHash("sha1").update(token).digest("hex").slice(0, 16);
      return `bearer:${digest}`;
    }
  }

  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.trim()) {
    return `ip:${xff.split(",")[0].trim()}`;
  }

  return `ip:${req.ip || req.socket?.remoteAddress || "unknown"}`;
}

/** Сайт/илова учун кўрсатиладиган тўлов сиёсати (Stripe checkout алоҳида). */
function getBillingPublicConfig() {
  const yearlyPreferred =
    String(process.env.BILLING_YEARLY_PREFERRED ?? "true").toLowerCase() !== "false";
  return {
    yearlyPreferred,
    includedGenerationsPerMonth: parseNumEnv("BILLING_INCLUDED_GENERATIONS_PER_MONTH", 20),
    overageUsdPerGeneration: parseNumEnv("BILLING_OVERAGE_USD_PER_GEN", 0.2),
    recommendedDepositUsd: parseNumEnv("BILLING_RECOMMENDED_DEPOSIT_USD", 10),
  };
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required in the environment.");
}

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not set. Using a development fallback secret.");
}

if (process.env.NODE_ENV === "production") {
  const j = process.env.JWT_SECRET?.trim();
  if (!j || j === "dev-only-secret-change-me") {
    throw new Error(
      "NODE_ENV=production requires a strong JWT_SECRET (not the dev placeholder)."
    );
  }
}

const globalLimiterSkipPaths = new Set(
  parseCsvEnv("GLOBAL_RATE_LIMIT_SKIP_PATHS", ["/health", "/config"])
);

const globalLimiter = createRateLimiter({
  windowMs: parseNumEnv("GLOBAL_RATE_LIMIT_WINDOW_MS", 60_000),
  max: parseNumEnv("GLOBAL_RATE_LIMIT_MAX", 6000),
  keyFn: getRateLimitKey,
  skipFn: (req) => globalLimiterSkipPaths.has(req.path),
  redisUrl: redisRateLimitUrl,
  keyPrefix: "global",
});
const authRouteLimiter = createRateLimiter({
  windowMs: parseNumEnv("AUTH_RATE_LIMIT_WINDOW_MS", 15 * 60_000),
  max: parseNumEnv("AUTH_RATE_LIMIT_MAX", 40),
  keyFn: getRateLimitKey,
  redisUrl: redisRateLimitUrl,
  keyPrefix: "auth",
});
const marketplaceProxyLimiter = createRateLimiter({
  windowMs: parseNumEnv("MARKETPLACE_RATE_LIMIT_WINDOW_MS", 60_000),
  max: parseNumEnv("MARKETPLACE_RATE_LIMIT_MAX", 60),
  keyFn: getRateLimitKey,
  redisUrl: redisRateLimitUrl,
  keyPrefix: "marketplace",
});
const heavyProxyLimiter = createRateLimiter({
  windowMs: parseNumEnv("HEAVY_RATE_LIMIT_WINDOW_MS", 60_000),
  max: parseNumEnv("HEAVY_RATE_LIMIT_MAX", 20),
  keyFn: getRateLimitKey,
  redisUrl: redisRateLimitUrl,
  keyPrefix: "heavy",
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

const corsAllowed = process.env.ALLOWED_ORIGIN?.trim();
app.use(
  cors({
    origin: corsAllowed && corsAllowed !== "*" ? corsAllowed : true,
    credentials: Boolean(corsAllowed && corsAllowed !== "*"),
  })
);

async function processSuccessfulCheckoutSession(session) {
  const userId = session.metadata?.userId || session.client_reference_id;

  if (!userId) {
    return null;
  }

  return updateUser(userId, (currentUser) => ({
    plan: "pro",
    stripeCustomerEmail: session.customer_details?.email || currentUser.email,
    lastCheckoutSessionId: session.id,
    lastPaymentStatus: session.payment_status || "paid",
  }));
}

app.post("/billing/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({
      error: "Stripe webhook is not configured.",
    });
  }

  const signature = req.headers["stripe-signature"];

  if (typeof signature !== "string" || signature.trim() === "") {
    return res.status(400).json({
      error: "Missing Stripe signature header.",
    });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).json({
      error: "Invalid Stripe webhook signature.",
      details: error.message,
    });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await processSuccessfulCheckoutSession(event.data.object);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handling failed:", error);

    return res.status(500).json({
      error: "Failed to process Stripe webhook.",
      details: error.message,
    });
  }
});

app.post("/billing/paddle-webhook", express.raw({ type: "application/json" }), async (req, res) => {
  return handlePaddleWebhook(req, res, {
    paddle: getPaddle(),
    supabaseAdmin,
  });
});

app.use(express.json({ limit: "1mb" }));
app.use(globalLimiter);

const PLAN_CONFIG = {
  free: {
    chatModel: "gpt-4.1-mini",
    imageModel: "gpt-image-1",
    imageSize: "1024x1024",
    imageQuality: "low",
  },
  pro: {
    chatModel: "gpt-4.1",
    imageModel: "gpt-image-1",
    imageSize: "1536x1024",
    imageQuality: "high",
  },
};

const PLAN_IMAGE_LIMITS = {
  free: 1,
  pro: Infinity,
};

const imageGenerationUsage = new Map();

function ensureUserStore() {
  const directory = path.dirname(usersFilePath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, "[]\n", "utf8");
  }
}

function readUsers() {
  ensureUserStore();

  try {
    const content = fs.readFileSync(usersFilePath, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  ensureUserStore();
  fs.writeFileSync(usersFilePath, `${JSON.stringify(users, null, 2)}\n`, "utf8");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function createUserId() {
  return crypto.randomUUID();
}

function signAuthToken(user) {
  return jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: "30d" });
}

function getUserById(userId) {
  return readUsers().find((user) => user.id === userId) || null;
}

function getUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  return readUsers().find((user) => normalizeEmail(user.email) === normalizedEmail) || null;
}

function updateUser(userId, updater) {
  const users = readUsers();
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    return null;
  }

  const currentUser = users[userIndex];
  const nextUser = {
    ...currentUser,
    ...updater(currentUser),
    updatedAt: new Date().toISOString(),
  };

  users[userIndex] = nextUser;
  writeUsers(users);
  return nextUser;
}

function getUserUsageCount(user) {
  return Number(user?.imageGenerationCount) || 0;
}

function getUserRemainingImageGenerations(user) {
  const normalizedPlan = normalizePlan(user?.plan);
  const limit = PLAN_IMAGE_LIMITS[normalizedPlan];

  if (!Number.isFinite(limit)) {
    return null;
  }

  return Math.max(limit - getUserUsageCount(user), 0);
}

function buildPublicUser(user) {
  if (!user) {
    return null;
  }
  // Фақат хавфсиз майдонлар, ҳеч қачон email, stripe маълумотлари, парол, referral_source чиқарилмайди
  return {
    id: user.id,
    name: user.name,
    plan: normalizePlan(user.plan),
    imageGenerationCount: getUserUsageCount(user),
    remainingGenerations: getUserRemainingImageGenerations(user),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function isValidRedirectUrl(value) {
  try {
    const parsed = new URL(String(value || ""));
    return Boolean(parsed.protocol);
  } catch {
    return false;
  }
}

function appendSessionIdPlaceholder(url) {
  const parsed = new URL(url);
  parsed.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
  return parsed.toString();
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization;

  if (typeof authHeader !== "string") {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

function attachUserIfPresent(req, res, next) {
  const token = getBearerToken(req);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = getUserById(payload.sub);

    if (!user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

function requireAuth(req, res, next) {
  // JWT орқали аниқлаш, user’ни req.user’га қўйиш
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header." });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = getUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }
    req.user = user;
    // Permission: фақат ўз user маълумотини кўришга рухсат
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

function resolvePlan(req, requestedPlan) {
  if (req.user) {
    return normalizePlan(req.user.plan);
  }

  return normalizePlan(requestedPlan);
}

function normalizePlan(plan) {
  return String(plan || "free").trim().toLowerCase() === "pro" ? "pro" : "free";
}

function getPlanConfig(plan) {
  return PLAN_CONFIG[normalizePlan(plan)];
}

function getClientIdentifier(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim() !== "") {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "unknown-client";
}

function getImageUsageKey(req, plan) {
  return `${normalizePlan(plan)}:${getClientIdentifier(req)}`;
}

function getRemainingImageGenerations(req, plan) {
  if (req.user) {
    return getUserRemainingImageGenerations(req.user);
  }

  const normalizedPlan = normalizePlan(plan);
  const limit = PLAN_IMAGE_LIMITS[normalizedPlan];

  if (!Number.isFinite(limit)) {
    return null;
  }

  const usageKey = getImageUsageKey(req, normalizedPlan);
  const usedCount = imageGenerationUsage.get(usageKey) || 0;
  return Math.max(limit - usedCount, 0);
}

function consumeImageGeneration(req, plan) {
  if (req.user) {
    if (normalizePlan(plan) === "pro") {
      return req.user;
    }

    const updatedUser = updateUser(req.user.id, (currentUser) => ({
      imageGenerationCount: getUserUsageCount(currentUser) + 1,
    }));

    req.user = updatedUser;
    return updatedUser;
  }

  const usageKey = getImageUsageKey(req, plan);
  const usedCount = imageGenerationUsage.get(usageKey) || 0;

  imageGenerationUsage.set(usageKey, usedCount + 1);
  return null;
}

function addAffiliateTag(productUrl) {
  if (!productUrl || !process.env.AFFILIATE_TAG) {
    return productUrl;
  }

  try {
    const url = new URL(productUrl);
    url.searchParams.set("tag", process.env.AFFILIATE_TAG);
    return url.toString();
  } catch {
    return productUrl;
  }
}

function validateRequiredFields(payload, fields) {
  const missing = fields.filter((field) => {
    const value = payload[field];
    return typeof value !== "string" || value.trim() === "";
  });

  return missing;
}

function buildAnalyzePrompt({ gender, style, occasion }) {
  return [
    "You are a fashion styling assistant for an ecommerce app.",
    "Return only valid JSON.",
    "Recommend a complete outfit based on the provided profile.",
    "The JSON response must use this shape:",
    JSON.stringify(
      {
        summary: "Short stylist explanation",
        outfit: {
          top: "...",
          bottom: "...",
          footwear: "...",
          outerwear: "...",
          accessories: ["..."],
        },
        colors: ["..."],
        stylingTips: ["..."],
        products: [
          {
            name: "...",
            category: "...",
            url: "https://example.com/product",
          },
        ],
      },
      null,
      2
    ),
    `User profile: gender=${gender}, style=${style}, occasion=${occasion}`,
  ].join("\n");
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function marketplaceUpstreamHeaders() {
  const headers = { "Content-Type": "application/json" };
  const key = process.env.MARKETPLACE_UPSTREAM_API_KEY?.trim();
  if (key) headers.Authorization = `Bearer ${key}`;
  return headers;
}

/**
 * Amazon PA-API search — getdressai `POST /api/amazon-search` ёки бошқа URL.
 * Mobil ilova: EXPO_PUBLIC_API_URL + `/v1/amazon-search`
 */
app.post(
  "/v1/amazon-search",
  marketplaceProxyLimiter,
  async (req, res) => {
    const upstream = process.env.AMAZON_PA_API_UPSTREAM_URL?.trim();
    if (!upstream) {
      return res.status(503).json({
        success: false,
        error:
          "AMAZON_PA_API_UPSTREAM_URL is not set. Example: http://127.0.0.1:8787 (getdressai npm run dev with PA-API keys).",
      });
    }
    const base = upstream.replace(/\/$/, "");
    const url = base.endsWith("/api/amazon-search")
      ? base
      : `${base}/api/amazon-search`;
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: marketplaceUpstreamHeaders(),
        body: JSON.stringify(req.body),
      });
      const text = await r.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        return res.status(502).json({
          success: false,
          error: "Invalid JSON from Amazon search upstream.",
        });
      }
      return res.status(r.status).json(json);
    } catch (e) {
      return res.status(502).json({
        success: false,
        error: e.message || "Amazon search upstream unreachable.",
      });
    }
  }
);

/**
 * eBay Browse search — getdressai `POST /api/ebay-search` ёки бошқа URL.
 * Mobil ilova: EXPO_PUBLIC_API_URL + `/v1/ebay-search`
 */
app.post(
  "/v1/ebay-search",
  marketplaceProxyLimiter,
  async (req, res) => {
    const upstream = process.env.EBAY_BROWSE_UPSTREAM_URL?.trim();
    if (!upstream) {
      return res.status(503).json({
        success: false,
        error:
          "EBAY_BROWSE_UPSTREAM_URL is not set. Example: http://127.0.0.1:8787 (getdressai npm run dev with eBay keys).",
      });
    }
    const base = upstream.replace(/\/$/, "");
    const url = base.endsWith("/api/ebay-search")
      ? base
      : `${base}/api/ebay-search`;
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: marketplaceUpstreamHeaders(),
        body: JSON.stringify(req.body),
      });
      const text = await r.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        return res.status(502).json({
          success: false,
          error: "Invalid JSON from eBay search upstream.",
        });
      }
      return res.status(r.status).json(json);
    } catch (e) {
      return res.status(502).json({
        success: false,
        error: e.message || "eBay search upstream unreachable.",
      });
    }
  }
);

/**
 * AliExpress Affiliate — getdressai `POST /api/aliexpress-search` ёки бошқа URL.
 * Mobil ilova: EXPO_PUBLIC_API_URL + `/v1/aliexpress-search`
 */
app.post(
  "/v1/aliexpress-search",
  marketplaceProxyLimiter,
  async (req, res) => {
    const upstream = process.env.ALIEXPRESS_AFFILIATE_UPSTREAM_URL?.trim();
    if (!upstream) {
      return res.status(503).json({
        success: false,
        error:
          "ALIEXPRESS_AFFILIATE_UPSTREAM_URL is not set. Example: http://127.0.0.1:8787 (getdressai npm run dev with AliExpress keys).",
      });
    }
    const base = upstream.replace(/\/$/, "");
    const url = base.endsWith("/api/aliexpress-search")
      ? base
      : `${base}/api/aliexpress-search`;
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: marketplaceUpstreamHeaders(),
        body: JSON.stringify(req.body),
      });
      const text = await r.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        return res.status(502).json({
          success: false,
          error: "Invalid JSON from AliExpress search upstream.",
        });
      }
      return res.status(r.status).json(json);
    } catch (e) {
      return res.status(502).json({
        success: false,
        error: e.message || "AliExpress search upstream unreachable.",
      });
    }
  }
);

/**
 * Hybrid marketplace — getdressai `POST /api/hybrid-marketplace-search`.
 * Mobil ilova: EXPO_PUBLIC_API_URL + `/v1/hybrid-marketplace-search`
 */
app.post(
  "/v1/hybrid-marketplace-search",
  marketplaceProxyLimiter,
  async (req, res) => {
    const upstream = process.env.HYBRID_MARKETPLACE_UPSTREAM_URL?.trim();
    if (!upstream) {
      return res.status(503).json({
        success: false,
        error:
          "HYBRID_MARKETPLACE_UPSTREAM_URL is not set. Example: http://127.0.0.1:8787 (getdressai npm run dev with marketplace keys).",
      });
    }
    const base = upstream.replace(/\/$/, "");
    const url = base.endsWith("/api/hybrid-marketplace-search")
      ? base
      : `${base}/api/hybrid-marketplace-search`;
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: marketplaceUpstreamHeaders(),
        body: JSON.stringify(req.body),
      });
      const text = await r.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        return res.status(502).json({
          success: false,
          error: "Invalid JSON from hybrid marketplace upstream.",
        });
      }
      return res.status(r.status).json(json);
    } catch (e) {
      return res.status(502).json({
        success: false,
        error: e.message || "Hybrid marketplace upstream unreachable.",
      });
    }
  }
);

app.post(
  "/v1/hybrid-vton",
  heavyProxyLimiter,
  express.json({ limit: "32mb" }),
  async (req, res) => {
    const upstream = process.env.HYBRID_VTON_SERVICE_URL?.trim();
    if (!upstream) {
      return res.status(503).json({
        success: false,
        error:
          "HYBRID_VTON_SERVICE_URL is not set. Point it to your GetdressAI VTON server (e.g. http://127.0.0.1:8787).",
      });
    }
    const base = upstream.replace(/\/$/, "");
    const url = base.endsWith("/api/hybrid-vton") ? base : `${base}/api/hybrid-vton`;
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: marketplaceUpstreamHeaders(),
        body: JSON.stringify(req.body),
      });
      const text = await r.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        return res.status(502).json({
          success: false,
          error: "Invalid JSON from VTON upstream.",
        });
      }
      return res.status(r.status).json(json);
    } catch (e) {
      return res.status(502).json({
        success: false,
        error: e.message || "VTON upstream unreachable.",
      });
    }
  }
);

app.use(attachUserIfPresent);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/config", (req, res) => {
  const ao = process.env.ALLOWED_ORIGIN?.trim();
  res.json({
    authEnabled: true,
    paymentEnabled: Boolean(stripe && stripePriceId),
    paymentProvider: stripe && stripePriceId ? "stripe" : null,
    hybridVtonProxy: Boolean(process.env.HYBRID_VTON_SERVICE_URL?.trim()),
    amazonSearchProxy: Boolean(process.env.AMAZON_PA_API_UPSTREAM_URL?.trim()),
    ebaySearchProxy: Boolean(process.env.EBAY_BROWSE_UPSTREAM_URL?.trim()),
    aliexpressSearchProxy: Boolean(process.env.ALIEXPRESS_AFFILIATE_UPSTREAM_URL?.trim()),
    hybridMarketplaceProxy: Boolean(process.env.HYBRID_MARKETPLACE_UPSTREAM_URL?.trim()),
    stripeTrialEnabled: Boolean(
      stripe &&
        supabaseAdmin &&
        (process.env.STRIPE_MONTHLY_PRICE_ID?.trim() || stripePriceId)
    ),
    paddleWebhookEnabled: Boolean(
      process.env.PADDLE_API_KEY?.trim() &&
        process.env.PADDLE_WEBHOOK_SECRET?.trim() &&
        supabaseAdmin
    ),
    rateLimiting: true,
    corsRestricted: Boolean(ao && ao !== "*"),
    marketplaceUpstreamKeyConfigured: Boolean(process.env.MARKETPLACE_UPSTREAM_API_KEY?.trim()),
    billing: getBillingPublicConfig(),
  });
});

app.post("/auth/register", authRouteLimiter, async (req, res) => {
  const { email, password, name, referral } = req.body || {};
  const missingFields = validateRequiredFields(req.body || {}, ["email", "password", "name"]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: "Missing required fields.",
      missingFields,
    });
  }

  if (String(password).length < 8) {
    return res.status(400).json({
      error: "Password must be at least 8 characters long.",
    });
  }

  if (getUserByEmail(email)) {
    return res.status(409).json({
      error: "An account with this email already exists.",
    });
  }

  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(String(password), 10);
  // Referral tracking: referral_source ва бонус
  let referral_source = null;
  let bonus = 0;
  if (referral && typeof referral === 'string') {
    referral_source = referral;
    // Referral бўйича бонус: referral_source топилса, унга ва янги user’га бонус бериш
    const users = readUsers();
    const refUser = users.find(u => u.id === referral || u.email === referral);
    if (refUser) {
      refUser.imageGenerationCount = (refUser.imageGenerationCount || 0) + 3; // Referral’чига 3 бонус
      bonus = 3; // Янги user’га ҳам 3 бонус
      writeUsers(users);
    }
  }
  const user = {
    id: createUserId(),
    name: String(name).trim(),
    email: normalizeEmail(email),
    passwordHash,
    plan: "free",
    imageGenerationCount: bonus, // Referral бўлса, бонус билан
    referral_source,
    createdAt: now,
    updatedAt: now,
    stripeCustomerEmail: null,
    lastCheckoutSessionId: null,
  };

  const users = readUsers();
  users.push(user);
  writeUsers(users);

  return res.status(201).json({
    token: signAuthToken(user),
    user: buildPublicUser(user),
  });
});

app.post("/auth/login", authRouteLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  const missingFields = validateRequiredFields(req.body || {}, ["email", "password"]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: "Missing required fields.",
      missingFields,
    });
  }

  const user = getUserByEmail(email);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const passwordMatches = await bcrypt.compare(String(password), user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  return res.json({
    token: signAuthToken(user),
    user: buildPublicUser(user),
  });
});

app.get("/auth/me", requireAuth, (req, res) => {
  return res.json({
    user: buildPublicUser(req.user),
    paymentEnabled: Boolean(stripe && stripePriceId),
  });
});

/** Supabase `subscriptions` + `user_quotas` — trial / premium ҳолати (JWT). */
app.get("/v1/user-subscription-status", requireAuth, async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(503).json({
      error: "Supabase is not configured.",
      details: "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  return handleUserSubscriptionStatus(req, res, {
    supabase: supabaseAdmin,
    userId: req.user.id,
  });
});

/** `user_quotas` + RPC `reset_daily_quotas` / `check_expired_trials` (JWT). */
app.get("/v1/user-quota", requireAuth, async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(503).json({
      error: "Supabase is not configured.",
      details: "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  return handleUserQuota(req, res, {
    supabase: supabaseAdmin,
    userId: req.user.id,
  });
});

/**
 * Supabase `subscriptions` / `user_quotas` + Stripe 3-day trial (monthly price).
 * Auth: JWT — body ичида user_id ишончсиз; req.user ишлатилади.
 */
app.post("/v1/stripe-trial", requireAuth, async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      error: "Payments are not configured.",
      details: "Set STRIPE_SECRET_KEY.",
    });
  }

  if (!supabaseAdmin) {
    return res.status(503).json({
      error: "Supabase is not configured.",
      details: "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  const monthlyPriceId =
    process.env.STRIPE_MONTHLY_PRICE_ID?.trim() || stripePriceId || "";

  if (!monthlyPriceId) {
    return res.status(503).json({
      error: "Stripe price is not configured.",
      details: "Set STRIPE_MONTHLY_PRICE_ID or STRIPE_PRO_PRICE_ID.",
    });
  }

  return handleStripeTrial(req, res, {
    stripe,
    supabase: supabaseAdmin,
    monthlyPriceId,
    userId: req.user.id,
    userEmail: req.user.email,
  });
});

/**
 * Stripe подписка: `cancel_at_period_end` + Supabase янгилаш.
 * Body: `{ "subscription_id": "sub_..." }` — ихтиёрий; бўлмаса базадаги `stripe_subscription_id` ишлатилади.
 */
app.post("/v1/cancel-trial", requireAuth, async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      error: "Payments are not configured.",
      details: "Set STRIPE_SECRET_KEY.",
    });
  }

  if (!supabaseAdmin) {
    return res.status(503).json({
      error: "Supabase is not configured.",
      details: "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  return handleCancelTrial(req, res, {
    stripe,
    supabase: supabaseAdmin,
    userId: req.user.id,
  });
});

app.post("/billing/create-checkout-session", requireAuth, async (req, res) => {
  if (!stripe || !stripePriceId) {
    return res.status(503).json({
      error: "Payments are not configured.",
      details: "Set STRIPE_SECRET_KEY and STRIPE_PRO_PRICE_ID in the backend environment.",
    });
  }

  const { successUrl, cancelUrl } = req.body || {};

  if (!isValidRedirectUrl(successUrl) || !isValidRedirectUrl(cancelUrl)) {
    return res.status(400).json({
      error: "Valid successUrl and cancelUrl are required.",
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: appendSessionIdPlaceholder(successUrl),
      cancel_url: cancelUrl,
      customer_email: req.user.email,
      client_reference_id: req.user.id,
      metadata: {
        userId: req.user.id,
        plan: "pro",
      },
    });

    const updatedUser = updateUser(req.user.id, () => ({
      stripeCustomerEmail: req.user.email,
      lastCheckoutSessionId: session.id,
    }));

    req.user = updatedUser;

    return res.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Stripe checkout session failed:", error);

    return res.status(500).json({
      error: "Failed to create checkout session.",
      details: error.message,
    });
  }
});

app.get("/billing/confirm", requireAuth, async (req, res) => {
  if (!stripe || !stripePriceId) {
    return res.status(503).json({
      error: "Payments are not configured.",
    });
  }

  const sessionId = String(req.query.session_id || "").trim();

  if (!sessionId) {
    return res.status(400).json({
      error: "session_id is required.",
    });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const sessionUserId = session.metadata?.userId || session.client_reference_id;

    if (sessionUserId !== req.user.id) {
      return res.status(403).json({
        error: "This checkout session does not belong to the current user.",
      });
    }

    if (session.payment_status !== "paid") {
      return res.status(409).json({
        error: "Payment is not completed yet.",
        paymentStatus: session.payment_status,
      });
    }

    const updatedUser = await processSuccessfulCheckoutSession(session);

    req.user = updatedUser;

    return res.json({
      user: buildPublicUser(updatedUser),
      paymentStatus: session.payment_status,
    });
  } catch (error) {
    console.error("Stripe session confirmation failed:", error);

    return res.status(500).json({
      error: "Failed to confirm payment.",
      details: error.message,
    });
  }
});

app.post("/analyze", async (req, res) => {
  const { gender, style, occasion, plan } = req.body || {};
  const missingFields = validateRequiredFields(req.body || {}, ["gender", "style", "occasion"]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: "Missing required fields.",
      missingFields,
    });
  }

  const normalizedPlan = resolvePlan(req, plan);
  const planConfig = getPlanConfig(normalizedPlan);

  try {
    const completion = await openai.chat.completions.create({
      model: planConfig.chatModel,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You create practical outfit recommendations as strict JSON.",
        },
        {
          role: "user",
          content: buildAnalyzePrompt({ gender, style, occasion }),
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content;
    const parsed = typeof content === "string" ? safeJsonParse(content) : null;

    if (!parsed) {
      return res.status(502).json({
        error: "The AI response could not be parsed as JSON.",
      });
    }

    const products = Array.isArray(parsed.products) ? parsed.products : [];
    const enrichedProducts = products.map((product) => ({
      ...product,
      affiliateUrl: addAffiliateTag(product.url),
    }));

    return res.json({
      plan: normalizedPlan,
      model: planConfig.chatModel,
      user: buildPublicUser(req.user),
      recommendations: {
        ...parsed,
        products: enrichedProducts,
      },
    });
  } catch (error) {
    console.error("Analyze request failed:", error);

    return res.status(500).json({
      error: "Failed to analyze outfit request.",
      details: error.message,
    });
  }
});

app.post("/image", async (req, res) => {
  const { prompt, plan } = req.body || {};
  const missingFields = validateRequiredFields(req.body || {}, ["prompt"]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: "Missing required fields.",
      missingFields,
    });
  }

  const normalizedPlan = resolvePlan(req, plan);
  const planConfig = getPlanConfig(normalizedPlan);
  const remainingGenerations = getRemainingImageGenerations(req, normalizedPlan);

  if (remainingGenerations === 0) {
    return res.status(403).json({
      error: "Free plan limit reached.",
      details: "Free users can generate 1 image. Upgrade to Pro for unlimited generations.",
      plan: normalizedPlan,
      remainingGenerations,
    });
  }

  try {
    const imageResponse = await openai.images.generate({
      model: planConfig.imageModel,
      prompt,
      size: planConfig.imageSize,
      quality: planConfig.imageQuality,
    });

    const image = imageResponse.data?.[0] || null;

    if (!image) {
      return res.status(502).json({
        error: "The AI image response did not contain an image.",
      });
    }

    consumeImageGeneration(req, normalizedPlan);

    return res.json({
      plan: normalizedPlan,
      model: planConfig.imageModel,
      size: planConfig.imageSize,
      quality: planConfig.imageQuality,
      remainingGenerations: getRemainingImageGenerations(req, normalizedPlan),
      user: buildPublicUser(req.user),
      image,
    });
  } catch (error) {
    console.error("Image request failed:", error);

    return res.status(500).json({
      error: "Failed to generate image.",
      details: error.message,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.listen(port, "0.0.0.0", () => {
  console.log("🚀 Server running");
});
