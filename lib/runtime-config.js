function parseList(value) {
  return String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function buildAllowedOrigins() {
  const explicitOrigins = parseList(process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN);

  if (explicitOrigins.length > 0) {
    return explicitOrigins;
  }

  if (process.env.RENDER_EXTERNAL_URL) {
    return [String(process.env.RENDER_EXTERNAL_URL).trim()].filter(Boolean);
  }

  return [];
}

function getRuntimeConfig() {
  const nodeEnv = process.env.NODE_ENV || "development";
  const isProduction = nodeEnv === "production";

  if (isProduction && !process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be set in production.");
  }

  const requestedDriver = String(process.env.USER_STORE_DRIVER || "").trim().toLowerCase();
  const hasSupabaseConfig = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  const userStoreDriver = requestedDriver || (hasSupabaseConfig ? "supabase" : "file");

  if (!["file", "supabase"].includes(userStoreDriver)) {
    throw new Error('USER_STORE_DRIVER must be either "file" or "supabase".');
  }

  if (userStoreDriver === "supabase" && !hasSupabaseConfig) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required when USER_STORE_DRIVER=supabase.");
  }

  if (isProduction && userStoreDriver === "file") {
    throw new Error("File-based user storage is disabled in production. Configure Supabase/PostgreSQL credentials instead.");
  }

  const allowedOrigins = buildAllowedOrigins();

  if (isProduction && allowedOrigins.length === 0) {
    throw new Error("ALLOWED_ORIGIN or ALLOWED_ORIGINS must be configured in production.");
  }

  return {
    nodeEnv,
    isProduction,
    port: Number(process.env.PORT) || 3000,
    jwtSecret: process.env.JWT_SECRET || "dev-only-secret-change-me",
    openAiApiKey: process.env.OPENAI_API_KEY,
    openAiEnabled: Boolean(process.env.OPENAI_API_KEY),
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "",
    allowedOrigins,
    userStoreDriver,
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    supabaseUsersTable: process.env.SUPABASE_USERS_TABLE || "app_users",
    supabaseShopTable: process.env.SUPABASE_SHOP_TABLE || "app_shop_products",
    adminEmails: parseList(process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL),
    affiliateTag: process.env.AFFILIATE_TAG || "",
  };
}

function createCorsOriginDelegate(runtimeConfig) {
  if (!runtimeConfig.isProduction && runtimeConfig.allowedOrigins.length === 0) {
    return "*";
  }

  const allowedOriginSet = new Set(runtimeConfig.allowedOrigins);

  return (origin, callback) => {
    if (!origin || allowedOriginSet.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin is not allowed by CORS."));
  };
}

module.exports = {
  createCorsOriginDelegate,
  getRuntimeConfig,
};