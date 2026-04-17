#!/usr/bin/env node
/**
 * Local static server + /api/outfit → OpenRouter, Groq, OpenAI, or Ollama (AI_PROVIDER=ollama).
 *
 *   Loads getdressai/.env if present (does not override existing process.env).
 *   Optional: SUPABASE_URL + SUPABASE_ANON_KEY in .env → injected into served index.html.
 *
 *   $env:OPENROUTER_API_KEY="sk-or-..."   # or OPENAI_API_KEY / GROQ + AI_PROVIDER
 *   npm run dev
 *
 * Open http://127.0.0.1:8787
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateChatCompletionsBody } from "../api/validate-chat.js";
import { resolveProvider } from "../api/lib/resolve-provider.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PORT = Number(process.env.PORT) || 8787;

function loadDotEnv() {
  const p = path.join(ROOT, ".env");
  if (!fs.existsSync(p)) return;
  const text = fs.readFileSync(p, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = val;
  }
}

loadDotEnv();

const RATE_WINDOW_MS = Number(process.env.GETDRESSAI_RATE_LIMIT_WINDOW_MS) || 60_000;
const RATE_MAX_GENERAL = Number(process.env.GETDRESSAI_RATE_LIMIT_MAX) || 120;
const RATE_MAX_MARKETPLACE = Number(process.env.GETDRESSAI_MARKETPLACE_RATE_LIMIT_MAX) || 45;
/** @type {Map<string, { count: number, windowStart: number }>} */
const rateBuckets = new Map();

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.trim()) {
    return xff.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "local";
}

function isMarketplacePath(pathname) {
  return (
    pathname === "/api/amazon-search" ||
    pathname === "/api/ebay-search" ||
    pathname === "/api/aliexpress-search" ||
    pathname === "/api/hybrid-marketplace-search"
  );
}

function allowRateLimit(req, pathname) {
  const max = isMarketplacePath(pathname) ? RATE_MAX_MARKETPLACE : RATE_MAX_GENERAL;
  const ip = getClientIp(req);
  const now = Date.now();
  const key = `${ip}:${isMarketplacePath(pathname) ? "m" : "g"}`;
  let b = rateBuckets.get(key);
  if (!b || now - b.windowStart >= RATE_WINDOW_MS) {
    b = { count: 0, windowStart: now };
    rateBuckets.set(key, b);
  }
  b.count += 1;
  return b.count <= max;
}

const MARKETPLACE_API_PATHS = new Set([
  "/api/amazon-search",
  "/api/ebay-search",
  "/api/aliexpress-search",
  "/api/hybrid-marketplace-search",
]);

function assertMarketplaceApiKey(req, res, pathname) {
  if (!MARKETPLACE_API_PATHS.has(pathname)) return true;
  const secret = process.env.GETDRESSAI_MARKETPLACE_API_KEY?.trim();
  if (!secret) return true;
  const auth = req.headers["authorization"] || req.headers["Authorization"];
  const xkey = req.headers["x-api-key"] || req.headers["X-API-Key"];
  let token = "";
  if (typeof auth === "string" && auth.toLowerCase().startsWith("bearer ")) {
    token = auth.slice(7).trim();
  } else if (typeof xkey === "string") {
    token = xkey.trim();
  }
  if (token !== secret) {
    sendApiJson(res, 401, {
      error:
        "Invalid or missing API key for marketplace routes. Send Authorization: Bearer <key> or X-API-Key (must match GETDRESSAI_MARKETPLACE_API_KEY).",
    });
    return false;
  }
  return true;
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function baseApiJsonHeaders() {
  const allow = process.env.GETDRESSAI_ALLOWED_ORIGIN?.trim();
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": allow && allow !== "*" ? allow : "*",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
}

async function readPostJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    return null;
  }
}

function sendApiJson(res, status, data) {
  res.writeHead(status, baseApiJsonHeaders());
  res.end(JSON.stringify(data));
}

/**
 * @param {string} modulePath — relative to this file (e.g. ../api/amazon-search.js)
 * @param {string} exportName
 * @param {string} errLabel
 */
async function runMarketplaceRoute(req, res, modulePath, exportName, errLabel) {
  const body = await readPostJson(req);
  if (body === null) {
    sendApiJson(res, 400, { error: "Invalid JSON body" });
    return;
  }
  try {
    const mod = await import(modulePath);
    const result = await mod[exportName](body);
    sendApiJson(res, 200, result);
  } catch (e) {
    const code = e.statusCode || 500;
    sendApiJson(res, code, { success: false, error: e.message || errLabel });
  }
}

async function proxyAi(req, res) {
  const p = resolveProvider();
  if (!p) {
    sendApiJson(res, 500, {
      error:
        "Set OPENROUTER_API_KEY, GROQ_API_KEY, OPENAI_API_KEY, or AI_PROVIDER=ollama (Ollama running locally).",
    });
    return;
  }

  const target = {
    url: p.url,
    apiKey: p.apiKey,
    openrouter: p.kind === "openrouter",
  };

  const parsedBody = await readPostJson(req);
  if (parsedBody === null) {
    sendApiJson(res, 400, { error: "Invalid JSON body" });
    return;
  }
  const vErr = validateChatCompletionsBody(parsedBody);
  if (vErr) {
    sendApiJson(res, 400, { error: "Bad request", details: vErr });
    return;
  }

  const headers = { "Content-Type": "application/json" };
  if (target.apiKey) {
    headers.Authorization = `Bearer ${target.apiKey}`;
  }
  if (target.openrouter) {
    headers["HTTP-Referer"] =
      process.env.OPENROUTER_SITE_URL || "https://localhost";
    headers["X-Title"] = process.env.OPENROUTER_APP_NAME || "GetdressAI";
  }

  const upstream = await fetch(target.url, {
    method: "POST",
    headers,
    body: JSON.stringify(parsedBody),
  });

  const text = await upstream.text();
  res.writeHead(upstream.status, {
    ...baseApiJsonHeaders(),
    "X-GetdressAI-Provider": p.kind,
  });
  res.end(text);
}

function injectSupabaseIntoIndexHtml(html) {
  let h = html;
  const su = process.env.SUPABASE_URL?.trim() ?? "";
  const sak = process.env.SUPABASE_ANON_KEY?.trim() ?? "";
  const hvton = process.env.GETDRESSAI_HYBRID_VTON_URL?.trim() ?? "";
  const amazonTag =
    process.env.AMAZON_PARTNER_TAG?.trim() ??
    process.env.GETDRESSAI_AMAZON_PARTNER_TAG?.trim() ??
    "";
  // Ҳар доим алмаштириш: бўш .env да `PASTE_YOUR...` қолмасин (Supabase «нотўғри URL» хатоси).
  h = h.replace('"PASTE_YOUR_SUPABASE_URL"', JSON.stringify(su));
  h = h.replace('"PASTE_YOUR_SUPABASE_ANON_KEY"', JSON.stringify(sak));
  h = h.replace('"GETDRESSAI_HYBRID_VTON_URL_PLACEHOLDER"', JSON.stringify(hvton));
  h = h.replace('"GETDRESSAI_AMAZON_PARTNER_TAG_PLACEHOLDER"', JSON.stringify(amazonTag));
  return h;
}

/** `public/premium.html` — dressai-api URL + Stripe + Paddle (client-side token). */
function injectPremiumHtml(html) {
  let h = html;
  const api = process.env.DRESSAI_API_URL?.trim() ?? "http://127.0.0.1:3000";
  const paddleToken = process.env.PADDLE_CLIENT_SIDE_TOKEN?.trim() ?? "";
  const paddleEnv = (process.env.PADDLE_ENVIRONMENT?.trim() || "sandbox").toLowerCase();
  const paddlePrice = process.env.PADDLE_PRICE_TOPUP_10_USD?.trim() ?? "";
  const publicOrigin =
    process.env.GETDRESSAI_PUBLIC_ORIGIN?.trim() || "http://127.0.0.1:8787";
  const successU = `${publicOrigin.replace(/\/$/, "")}/public/premium.html?paddle=ok`;
  const cancelU = `${publicOrigin.replace(/\/$/, "")}/public/premium.html?paddle=cancel`;
  h = h.replace('"DRESSAI_API_URL_PLACEHOLDER"', JSON.stringify(api));
  h = h.replace('"PADDLE_CLIENT_SIDE_TOKEN_PLACEHOLDER"', JSON.stringify(paddleToken));
  h = h.replace(
    '"PADDLE_ENVIRONMENT_PLACEHOLDER"',
    JSON.stringify(paddleEnv === "production" ? "production" : "sandbox")
  );
  h = h.replace('"PADDLE_PRICE_ID_PLACEHOLDER"', JSON.stringify(paddlePrice));
  h = h.replace('"PADDLE_SUCCESS_URL_PLACEHOLDER"', JSON.stringify(successU));
  h = h.replace('"PADDLE_CANCEL_URL_PLACEHOLDER"', JSON.stringify(cancelU));
  return h;
}

function serveStatic(urlPath, res) {
  let rel =
    urlPath === "/" || urlPath === "" ? "index.html" : urlPath.replace(/^\//, "");
  rel = path.normalize(rel).replace(/^(\.\.(\/|\\|$))+/, "");
  let filePath = path.join(ROOT, rel);
  const resolvedRoot = path.resolve(ROOT);
  const resolvedFile = path.resolve(filePath);
  const relativeToRoot = path.relative(resolvedRoot, resolvedFile);
  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  if (fs.existsSync(resolvedFile) && fs.statSync(resolvedFile).isDirectory()) {
    filePath = path.join(resolvedFile, "index.html");
  } else {
    filePath = resolvedFile;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  const ext = path.extname(filePath);
  const ct = MIME[ext] || "application/octet-stream";
  if (path.basename(filePath) === "index.html" && ext === ".html") {
    const body = injectSupabaseIntoIndexHtml(
      fs.readFileSync(filePath, "utf8")
    );
    res.writeHead(200, { "Content-Type": ct });
    res.end(body);
    return;
  }
  if (path.basename(filePath) === "premium.html" && ext === ".html") {
    const body = injectPremiumHtml(fs.readFileSync(filePath, "utf8"));
    res.writeHead(200, { "Content-Type": ct });
    res.end(body);
    return;
  }
  res.writeHead(200, { "Content-Type": ct });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url || "/", `http://127.0.0.1`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      ...baseApiJsonHeaders(),
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    });
    res.end();
    return;
  }

  if (u.pathname.startsWith("/api/")) {
    if (req.method === "POST") {
      if (!allowRateLimit(req, u.pathname)) {
        sendApiJson(res, 429, {
          error: "Too many requests.",
          retryAfterSeconds: Math.ceil(RATE_WINDOW_MS / 1000),
        });
        return;
      }
      if (!assertMarketplaceApiKey(req, res, u.pathname)) {
        return;
      }
    }
    if (u.pathname === "/api/outfit" && req.method === "POST") {
      await proxyAi(req, res);
      return;
    }
    if (u.pathname === "/api/hybrid-vton" && req.method === "POST") {
      const body = await readPostJson(req);
      if (body === null) {
        sendApiJson(res, 400, { error: "Invalid JSON body" });
        return;
      }
      try {
        const { runHybridVton } = await import("../api/hybrid-vton.js");
        const result = await runHybridVton(body);
        if (result.metadata && "tmpRoot" in result.metadata) {
          delete result.metadata.tmpRoot;
        }
        sendApiJson(res, 200, result);
      } catch (e) {
        sendApiJson(res, e.statusCode || 500, {
          error: e.message || "Hybrid VTON failed",
        });
      }
      return;
    }
    if (u.pathname === "/api/amazon-search" && req.method === "POST") {
      await runMarketplaceRoute(
        req,
        res,
        "../api/amazon-search.js",
        "runAmazonSearch",
        "Amazon search failed"
      );
      return;
    }
    if (u.pathname === "/api/ebay-search" && req.method === "POST") {
      await runMarketplaceRoute(
        req,
        res,
        "../api/ebay-search.js",
        "runEbaySearch",
        "eBay search failed"
      );
      return;
    }
    if (u.pathname === "/api/aliexpress-search" && req.method === "POST") {
      await runMarketplaceRoute(
        req,
        res,
        "../api/aliexpress-search.js",
        "runAliExpressSearch",
        "AliExpress search failed"
      );
      return;
    }
    if (u.pathname === "/api/hybrid-marketplace-search" && req.method === "POST") {
      await runMarketplaceRoute(
        req,
        res,
        "../api/hybrid-marketplace-search.js",
        "runHybridMarketplaceSearch",
        "Hybrid marketplace search failed"
      );
      return;
    }
    sendApiJson(res, 404, { error: "API route not found" });
    return;
  }

  if (req.method === "GET") {
    serveStatic(u.pathname, res);
    return;
  }

  res.writeHead(405);
  res.end("Method not allowed");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`GetdressAI dev → http://127.0.0.1:${PORT}`);
  console.log(
    "AI proxy → POST /api/outfit (cloud keys or AI_PROVIDER=ollama)"
  );
  console.log(
    "Hybrid VTON → POST /api/hybrid-vton (FASHN_VTON_RUN_PY + optional OMNITRY_RUN_PY)"
  );
  console.log(
    "Amazon PA-API → POST /api/amazon-search (AMAZON_ACCESS_KEY + AMAZON_SECRET_KEY + AMAZON_PARTNER_TAG)"
  );
  console.log(
    "eBay Browse API → POST /api/ebay-search (EBAY_APP_ID + EBAY_CERT_ID)"
  );
  console.log(
    "AliExpress Affiliate → POST /api/aliexpress-search (ALIEXPRESS_APP_KEY + ALIEXPRESS_APP_SECRET + …)"
  );
  console.log(
    "Hybrid marketplace → POST /api/hybrid-marketplace-search (Amazon + eBay + AliExpress keys)"
  );
  if (!process.env.SUPABASE_URL?.trim() || !process.env.SUPABASE_ANON_KEY?.trim()) {
    console.log(
      "Tip: add SUPABASE_URL + SUPABASE_ANON_KEY to .env to skip editing index.html"
    );
  }
});
