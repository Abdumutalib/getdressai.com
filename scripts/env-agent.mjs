import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const DESKTOP_DEFAULT = "C:\\Users\\DELCOM\\Desktop\\getdressai-production-secrets";
const args = new Set(process.argv.slice(2));
const shouldPrefillDesktop = args.has("--prefill-desktop");
const desktopArg = process.argv.find((arg) => arg.startsWith("--desktop="));
const desktopDir = desktopArg ? desktopArg.slice("--desktop=".length) : DESKTOP_DEFAULT;

function parseEnvFile(filePath) {
  const out = {};
  if (!existsSync(filePath)) return out;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[match[1]] = value;
  }
  return out;
}

function stringifyEnvFile(envMap, order) {
  return `${order.map((key) => `${key}=${envMap[key] ?? ""}`).join("\n")}\n`;
}

function maskValue(value) {
  if (!value) return "";
  if (value.length <= 10) return "set";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function readTextIfExists(filePath) {
  if (!existsSync(filePath)) return "";
  return readFileSync(filePath, "utf8");
}

function collectEnvNamesFromFiles(filePaths) {
  const cmdPattern = /\bprocess\.env\.([A-Z0-9_]+)\b/g;
  const barePattern = /\b(NEXT_PUBLIC_[A-Z0-9_]+|EXPO_PUBLIC_[A-Z0-9_]+)\b/g;
  const names = new Set();

  for (const filePath of filePaths) {
    const text = readTextIfExists(filePath);
    for (const match of text.matchAll(cmdPattern)) {
      names.add(match[1]);
    }
    for (const match of text.matchAll(barePattern)) {
      names.add(match[1]);
    }
  }

  return [...names].sort();
}

function gatherProjectFiles(baseDir) {
  const output = [];
  const skipDirs = new Set(["node_modules", ".git", ".next", ".expo", "dist", "out", ".vercel"]);

  function walk(currentPath) {
    if (!existsSync(currentPath)) return;
    const entries = readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);
      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) walk(fullPath);
        continue;
      }
      if (/\.(js|jsx|ts|tsx|mjs|cjs|json|md)$/i.test(entry.name)) {
        output.push(fullPath);
      }
    }
  }

  walk(baseDir);
  return output;
}

const sourceEnvFiles = {
  root: resolve(root, ".env"),
  rootProduction: resolve(root, ".env.production"),
  web: resolve(root, "getdressai", ".env"),
  webProduction: resolve(root, "getdressai", ".env.production"),
  api: resolve(root, "dressai-api", ".env"),
  apiProduction: resolve(root, "dressai-api", ".env.production"),
  mobile: resolve(root, "mobile", ".env"),
  mobileProduction: resolve(root, "mobile", ".env.production"),
};

const envSources = Object.fromEntries(
  Object.entries(sourceEnvFiles).map(([name, filePath]) => [name, parseEnvFile(filePath)])
);

function firstNonEmpty(keys, sourceNames) {
  for (const key of keys) {
    for (const sourceName of sourceNames) {
      const value = envSources[sourceName]?.[key];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
  }
  return "";
}

const targets = [
  {
    id: "root-web",
    label: "Root Web",
    desktopFile: join(desktopDir, "01-root-web", ".env.production"),
    reportFile: join(root, "reports", "env-agent-root-web.env"),
    sourcePriority: ["rootProduction", "root", "webProduction", "web"],
    vars: [
      "NEXT_PUBLIC_APP_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_URL",
      "SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "PADDLE_ENVIRONMENT",
      "PADDLE_API_KEY",
      "PADDLE_WEBHOOK_SECRET",
      "PADDLE_PRICE_STARTER",
      "PADDLE_PRICE_POPULAR",
      "PADDLE_PRICE_PRO",
      "PADDLE_PRICE_CREDIT_PACK",
      "NEXT_PUBLIC_PADDLE_CLIENT_TOKEN",
      "RESEND_API_KEY",
      "POSTHOG_PERSONAL_API_KEY",
      "NEXT_PUBLIC_POSTHOG_KEY",
      "NEXT_PUBLIC_POSTHOG_HOST",
      "MARKETPLACE_API_URL",
      "MARKETPLACE_API_KEY",
      "ADMIN_EMAIL",
      "DRESSAI_API_URL",
    ],
  },
  {
    id: "dressai-api",
    label: "DressAI API",
    desktopFile: join(desktopDir, "02-dressai-api", ".env.production"),
    reportFile: join(root, "reports", "env-agent-dressai-api.env"),
    sourcePriority: ["apiProduction", "api", "rootProduction", "root", "webProduction", "web"],
    vars: [
      "PORT",
      "NODE_ENV",
      "ALLOWED_ORIGIN",
      "CORS_ORIGIN",
      "JWT_SECRET",
      "DATA_ENCRYPTION_KEY",
      "DATABASE_URL",
      "OPENAI_API_KEY",
      "OPENAI_MODEL",
      "OPENAI_WHISPER_MODEL",
      "ENABLE_VOICE_TRANSCRIPTION",
      "MAX_AUDIO_SIZE",
      "SMOKE_EMAIL",
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "PADDLE_API_KEY",
      "PADDLE_ENVIRONMENT",
      "PADDLE_WEBHOOK_SECRET",
      "PADDLE_PRODUCT_ID",
      "BILLING_YEARLY_PREFERRED",
      "BILLING_INCLUDED_GENERATIONS_PER_MONTH",
      "BILLING_OVERAGE_USD_PER_GEN",
      "BILLING_RECOMMENDED_DEPOSIT_USD",
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "STRIPE_PRICE_ID_7_99",
      "AFFILIATE_TAG",
      "MARKETPLACE_UPSTREAM_API_KEY",
      "HYBRID_MARKETPLACE_UPSTREAM_URL",
      "HYBRID_VTON_SERVICE_URL",
      "AMAZON_PA_API_UPSTREAM_URL",
      "EBAY_BROWSE_UPSTREAM_URL",
      "ALIEXPRESS_AFFILIATE_UPSTREAM_URL",
      "AMAZON_ACCESS_KEY",
      "AMAZON_SECRET_KEY",
      "AMAZON_PARTNER_TAG",
      "EBAY_APP_ID",
      "EBAY_CERT_ID",
      "EBAY_DEV_ID",
      "EBAY_RUNAME",
      "EBAY_USE_SANDBOX",
      "EBAY_MARKETPLACE_ID",
      "EBAY_OAUTH_SCOPE",
      "EBAY_PRICE_CURRENCY",
      "RATE_LIMIT_REDIS_URL",
      "REDIS_URL",
      "GLOBAL_RATE_LIMIT_SKIP_PATHS",
      "GLOBAL_RATE_LIMIT_WINDOW_MS",
      "GLOBAL_RATE_LIMIT_MAX",
      "AUTH_RATE_LIMIT_WINDOW_MS",
      "AUTH_RATE_LIMIT_MAX",
      "MARKETPLACE_RATE_LIMIT_WINDOW_MS",
      "MARKETPLACE_RATE_LIMIT_MAX",
      "HEAVY_RATE_LIMIT_WINDOW_MS",
      "HEAVY_RATE_LIMIT_MAX",
    ],
  },
  {
    id: "mobile-expo",
    label: "Mobile Expo",
    desktopFile: join(desktopDir, "03-mobile-expo", ".env.production"),
    reportFile: join(root, "reports", "env-agent-mobile-expo.env"),
    sourcePriority: ["mobileProduction", "mobile", "rootProduction", "root"],
    vars: [
      "EXPO_PUBLIC_API_URL",
      "EXPO_PUBLIC_APP_ORIGIN",
      "EXPO_PUBLIC_SUPABASE_URL",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_URL",
      "SUPABASE_ANON_KEY",
    ],
  },
];

function buildTargetEnv(target) {
  const envMap = {};
  for (const key of target.vars) {
    envMap[key] = firstNonEmpty([key], target.sourcePriority);
  }
  return envMap;
}

function ensureDirFor(filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
}

const allProjectFiles = gatherProjectFiles(root);
const usedVars = collectEnvNamesFromFiles(allProjectFiles);
const reportLines = [
  "# Env Agent Report",
  "",
  `Generated at: ${new Date().toISOString()}`,
  "",
  "## What this agent can do",
  "",
  "- Read existing `.env` files in this repo.",
  "- Prefill known values into target production templates.",
  "- Show which variables are still missing and must be obtained from your provider accounts.",
  "- It does not fetch private secrets from the internet or third-party dashboards.",
  "",
  "## Variables seen in code",
  "",
  ...usedVars.map((name) => `- ${name}`),
  "",
];

for (const target of targets) {
  const envMap = buildTargetEnv(target);
  const missing = target.vars.filter((key) => !envMap[key]);
  ensureDirFor(target.reportFile);
  writeFileSync(target.reportFile, stringifyEnvFile(envMap, target.vars), "utf8");

  if (shouldPrefillDesktop && existsSync(dirname(target.desktopFile))) {
    ensureDirFor(target.desktopFile);
    writeFileSync(target.desktopFile, stringifyEnvFile(envMap, target.vars), "utf8");
  }

  reportLines.push(`## ${target.label}`);
  reportLines.push("");
  reportLines.push(`Template: \`${target.reportFile}\``);
  if (shouldPrefillDesktop) {
    reportLines.push(`Desktop sync: \`${target.desktopFile}\``);
  }
  reportLines.push("");
  reportLines.push("Filled values:");
  reportLines.push(
    ...target.vars
      .filter((key) => envMap[key])
      .map((key) => `- ${key} = ${maskValue(envMap[key])}`)
  );
  reportLines.push("");
  reportLines.push("Still missing:");
  reportLines.push(...missing.map((key) => `- ${key}`));
  reportLines.push("");
}

const reportPath = join(root, "reports", "env-agent-report.md");
ensureDirFor(reportPath);
writeFileSync(reportPath, `${reportLines.join("\n")}\n`, "utf8");

console.log(`[env-agent] Report written: ${reportPath}`);
for (const target of targets) {
  console.log(`[env-agent] Template written: ${target.reportFile}`);
}
if (shouldPrefillDesktop) {
  console.log(`[env-agent] Desktop templates synced: ${desktopDir}`);
}
