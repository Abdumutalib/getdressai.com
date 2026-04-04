// ...existing code...
// ...existing code...
// --- Shop catalog ---
const shopProducts = require("./data/shop-catalog");

// --- AI outfit генерация endpoint ---
// Бу код express, app, openai, ва бошқа конфиглардан кейин қўйилиши керак!

// ...existing code...

// Файл охирида (app, express, openai, ва барча конфиглардан кейин):
// ...existing code...
// Файлнинг энг охирида (app.listen’дан олдин):

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
const { createCorsOriginDelegate, getRuntimeConfig } = require("./lib/runtime-config");
const { createShopStore } = require("./lib/shop-store");
const { createUserStore } = require("./lib/user-store");

const runtimeConfig = getRuntimeConfig();
const app = express();
const port = runtimeConfig.port;
const usersFilePath = path.join(__dirname, "data", "users.json");
const webDistPath = path.join(__dirname, "dressai-web", "dist");
const webIndexPath = path.join(webDistPath, "index.html");
const jwtSecret = runtimeConfig.jwtSecret;
const userStore = createUserStore({
  driver: runtimeConfig.userStoreDriver,
  usersFilePath,
  supabaseUrl: runtimeConfig.supabaseUrl,
  supabaseServiceRoleKey: runtimeConfig.supabaseServiceRoleKey,
  tableName: runtimeConfig.supabaseUsersTable,
});
const shopStore = createShopStore({
  fallbackProducts: shopProducts,
  supabaseUrl: runtimeConfig.supabaseUrl,
  supabaseServiceRoleKey: runtimeConfig.supabaseServiceRoleKey,
  tableName: runtimeConfig.supabaseShopTable,
});
const adminEmailSet = new Set(
  runtimeConfig.adminEmails.map((entry) => normalizeEmail(entry))
);
const stripe = runtimeConfig.stripeSecretKey ? new Stripe(runtimeConfig.stripeSecretKey) : null;
const stripePriceId = runtimeConfig.stripePriceId;

if (!runtimeConfig.isProduction && !process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not set. Using a development fallback secret.");
}

const openai = runtimeConfig.openAiEnabled
  ? new OpenAI({
      apiKey: runtimeConfig.openAiApiKey,
    })
  : null;

app.use(
  cors({
    origin: createCorsOriginDelegate(runtimeConfig),
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
  if (!stripe || !runtimeConfig.stripeWebhookSecret) {
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
    event = stripe.webhooks.constructEvent(req.body, signature, runtimeConfig.stripeWebhookSecret);
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

app.use(express.json({ limit: "1mb" }));

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

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function createUserId() {
  return crypto.randomUUID();
}

function signAuthToken(user) {
  return jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: "30d" });
}

async function readUsers() {
  return userStore.listUsers();
}

async function getUserById(userId) {
  return userStore.getUserById(userId);
}

async function getUserByEmail(email) {
  return userStore.getUserByEmail(email);
}

async function createUser(user) {
  return userStore.createUser(user);
}

async function updateUser(userId, updater) {
  return userStore.updateUser(userId, updater);
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

function isAdminUser(user) {
  if (!user) {
    return false;
  }

  if (String(user.role || "").trim().toLowerCase() === "admin") {
    return true;
  }

  return adminEmailSet.has(normalizeEmail(user.email));
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
    isAdmin: isAdminUser(user),
    imageGenerationCount: getUserUsageCount(user),
    remainingGenerations: getUserRemainingImageGenerations(user),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function buildAdminUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: normalizePlan(user.plan),
    isAdmin: isAdminUser(user),
    imageGenerationCount: getUserUsageCount(user),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastPaymentStatus: user.lastPaymentStatus || null,
  };
}

async function buildAdminStats() {
  const users = await readUsers();
  const totalUsers = users.length;
  const proUsers = users.filter((user) => normalizePlan(user.plan) === "pro").length;
  const freeUsers = totalUsers - proUsers;
  const adminUsers = users.filter((user) => isAdminUser(user)).length;
  const totalImageGenerations = users.reduce((sum, user) => sum + getUserUsageCount(user), 0);
  const recentUsers = users.filter((user) => {
    if (!user.createdAt) {
      return false;
    }

    return Date.now() - new Date(user.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  return {
    totalUsers,
    proUsers,
    freeUsers,
    adminUsers,
    recentUsers,
    totalImageGenerations,
    paymentEnabled: Boolean(stripe && stripePriceId),
    webEnabled: fs.existsSync(webDistPath),
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

async function attachUserIfPresent(req, res, next) {
  const token = getBearerToken(req);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await getUserById(payload.sub);

    if (!user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

async function requireAuth(req, res, next) {
  // JWT орқали аниқлаш, user’ни req.user’га қўйиш
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header." });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await getUserById(payload.sub);
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

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required." });
  }

  if (!isAdminUser(req.user)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  return next();
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

function ensureAiEnabled(res) {
  if (openai) {
    return true;
  }

  res.status(503).json({
    error: "AI features are not configured.",
    details: "Set OPENAI_API_KEY to enable analyze and image generation endpoints.",
  });

  return false;
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

async function consumeImageGeneration(req, plan) {
  if (req.user) {
    if (normalizePlan(plan) === "pro") {
      return req.user;
    }

    const updatedUser = await updateUser(req.user.id, (currentUser) => ({
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

function sanitizeShopProductPayload(input) {
  return {
    name: String(input?.name || "").trim(),
    brand: String(input?.brand || "").trim(),
    store: String(input?.store || input?.brand || "").trim(),
    category: String(input?.category || "").trim(),
    description: String(input?.description || "").trim(),
    image: String(input?.image || "").trim(),
    link: String(input?.link || "").trim(),
    sortOrder: Number(input?.sortOrder) || 0,
  };
}

function validateShopProductPayload(payload) {
  const missingFields = ["name", "brand", "store", "category", "image", "link"].filter((field) => {
    const value = payload[field];
    return typeof value !== "string" || value.trim() === "";
  });

  if (missingFields.length > 0) {
    return { missingFields };
  }

  if (!isValidRedirectUrl(payload.link)) {
    return { error: "Product link must be a valid URL." };
  }

  if (!isValidRedirectUrl(payload.image)) {
    return { error: "Product image must be a valid URL." };
  }

  return null;
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

app.use(attachUserIfPresent);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    pid: process.pid,
    port,
    environment: runtimeConfig.nodeEnv,
  });
});

app.get("/config", (req, res) => {
  const shopDiagnostics = shopStore.getDiagnostics();

  res.json({
    pid: process.pid,
    port,
    authEnabled: true,
    paymentEnabled: Boolean(stripe && stripePriceId),
    paymentProvider: stripe && stripePriceId ? "stripe" : null,
    aiEnabled: runtimeConfig.openAiEnabled,
    webEnabled: fs.existsSync(webDistPath),
    adminEnabled: adminEmailSet.size > 0,
    storageDriver: userStore.mode,
    supabaseEnabled: userStore.isSupabaseEnabled,
    shopCatalog: shopDiagnostics,
    environment: runtimeConfig.nodeEnv,
  });
});

app.post("/auth/register", async (req, res) => {
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

  if (await getUserByEmail(email)) {
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
    const users = await readUsers();
    const refUser = users.find(u => u.id === referral || u.email === referral);
    if (refUser) {
      await updateUser(refUser.id, (currentUser) => ({
        imageGenerationCount: (currentUser.imageGenerationCount || 0) + 3,
      }));
      bonus = 3; // Янги user’га ҳам 3 бонус
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

  await createUser(user);

  return res.status(201).json({
    token: signAuthToken(user),
    user: buildPublicUser(user),
  });
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  const missingFields = validateRequiredFields(req.body || {}, ["email", "password"]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: "Missing required fields.",
      missingFields,
    });
  }

  const user = await getUserByEmail(email);

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

app.get("/admin/stats", requireAuth, requireAdmin, (req, res) => {
  return buildAdminStats().then((stats) => res.json({
    stats,
  })).catch((error) => res.status(500).json({
    error: "Failed to load admin stats.",
    details: error.message,
  }));
});

app.get("/admin/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = (await readUsers())
      .map((user) => buildAdminUser(user))
      .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());

    return res.json({ users });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to load admin users.",
      details: error.message,
    });
  }
});

app.get("/admin/shop-products", requireAuth, requireAdmin, async (req, res) => {
  try {
    const products = await shopStore.listProducts();

    return res.json({
      products,
      diagnostics: shopStore.getDiagnostics(),
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to load admin shop catalog.",
      details: error.message,
    });
  }
});

app.post("/admin/shop-products", requireAuth, requireAdmin, async (req, res) => {
  const payload = sanitizeShopProductPayload(req.body || {});
  const validation = validateShopProductPayload(payload);

  if (validation?.missingFields) {
    return res.status(400).json({
      error: "Missing required product fields.",
      missingFields: validation.missingFields,
    });
  }

  if (validation?.error) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const product = await shopStore.createProduct(payload);
    return res.status(201).json({ product });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to create catalog product.",
      details: error.message,
    });
  }
});

app.put("/admin/shop-products/:id", requireAuth, requireAdmin, async (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: "A valid numeric product id is required." });
  }

  const payload = sanitizeShopProductPayload(req.body || {});
  const validation = validateShopProductPayload(payload);

  if (validation?.missingFields) {
    return res.status(400).json({
      error: "Missing required product fields.",
      missingFields: validation.missingFields,
    });
  }

  if (validation?.error) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const product = await shopStore.updateProduct(productId, payload);

    if (!product) {
      return res.status(404).json({ error: "Catalog product not found." });
    }

    return res.json({ product });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to update catalog product.",
      details: error.message,
    });
  }
});

app.delete("/admin/shop-products/:id", requireAuth, requireAdmin, async (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: "A valid numeric product id is required." });
  }

  try {
    const deleted = await shopStore.deleteProduct(productId);

    if (!deleted) {
      return res.status(404).json({ error: "Catalog product not found." });
    }

    return res.json({ success: true, deletedId: productId });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to delete catalog product.",
      details: error.message,
    });
  }
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

    const updatedUser = await updateUser(req.user.id, () => ({
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
  if (!ensureAiEnabled(res)) {
    return;
  }

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
  if (!ensureAiEnabled(res)) {
    return;
  }

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

    await consumeImageGeneration(req, normalizedPlan);

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

// --- AI outfit генерация endpoint ---
app.post("/generate", async (req, res) => {
  if (!ensureAiEnabled(res)) {
    return;
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image URL provided" });
    }

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `Change outfit of person in this image: ${image}`
    });

    res.json({
      success: true,
      result: response.data[0].url
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/shop", async (req, res) => {
  try {
    const products = await shopStore.listProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({
      error: "Failed to load shop catalog.",
      details: error.message,
    });
  }
});

if (!fs.existsSync(webDistPath)) {
  app.get("/", (req, res) => {
    res.json({
      name: "DressAI Backend",
      status: "ok",
      storageDriver: userStore.mode,
      shopCatalog: shopStore.getDiagnostics(),
      message: "Build the web frontend with `npm run web:build` to serve the website from this backend.",
      routes: ["/health", "/config", "/auth/register", "/auth/login", "/analyze", "/image", "/shop"],
    });
  });
}

if (fs.existsSync(webDistPath)) {
  app.use(express.static(webDistPath));

  app.get("*", (req, res, next) => {
    if (req.accepts("html")) {
      return res.sendFile(webIndexPath);
    }

    return next();
  });
}

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`DressAI server running on ${port} using ${userStore.mode} storage.`);
});

server.on("error", (error) => {
  if (error && error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Run \`npm run port:3000\` to inspect the owner, stop the existing process, or set a different PORT value.`);
    process.exit(1);
    return;
  }

  console.error("Failed to start DressAI server:", error);
  process.exit(1);
});