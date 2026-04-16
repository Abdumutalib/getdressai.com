#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");

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
      (val.startsWith("\"") && val.endsWith("\"")) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = val;
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(relPath) {
  const from = path.join(ROOT, relPath);
  const to = path.join(DIST, relPath);
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
}

function copyDir(relPath) {
  fs.cpSync(path.join(ROOT, relPath), path.join(DIST, relPath), { recursive: true });
}

function writeFile(relPath, content) {
  const to = path.join(DIST, relPath);
  ensureDir(path.dirname(to));
  fs.writeFileSync(to, content, "utf8");
}

function injectIndexHtml(html) {
  let h = html;
  const supabaseUrl = process.env.SUPABASE_URL?.trim() ?? "";
  const supabaseAnon = process.env.SUPABASE_ANON_KEY?.trim() ?? "";
  const hybridVtonUrl = process.env.GETDRESSAI_HYBRID_VTON_URL?.trim() ?? "";
  const amazonTag =
    process.env.AMAZON_PARTNER_TAG?.trim() ??
    process.env.GETDRESSAI_AMAZON_PARTNER_TAG?.trim() ??
    "";
  h = h.replace('"PASTE_YOUR_SUPABASE_URL"', JSON.stringify(supabaseUrl));
  h = h.replace('"PASTE_YOUR_SUPABASE_ANON_KEY"', JSON.stringify(supabaseAnon));
  h = h.replace(
    '"GETDRESSAI_HYBRID_VTON_URL_PLACEHOLDER"',
    JSON.stringify(hybridVtonUrl)
  );
  h = h.replace(
    '"GETDRESSAI_AMAZON_PARTNER_TAG_PLACEHOLDER"',
    JSON.stringify(amazonTag)
  );
  return h;
}

function injectPremiumHtml(html) {
  let h = html;
  const api = process.env.DRESSAI_API_URL?.trim() ?? "";
  const paddleToken = process.env.PADDLE_CLIENT_SIDE_TOKEN?.trim() ?? "";
  const paddleEnv = (process.env.PADDLE_ENVIRONMENT?.trim() || "sandbox").toLowerCase();
  const paddlePrice = process.env.PADDLE_PRICE_TOPUP_10_USD?.trim() ?? "";
  const publicOrigin = process.env.GETDRESSAI_PUBLIC_ORIGIN?.trim() ?? "";
  const normalizedOrigin = publicOrigin.replace(/\/$/, "");
  const successUrl = normalizedOrigin ? `${normalizedOrigin}/public/premium.html?paddle=ok` : "";
  const cancelUrl = normalizedOrigin ? `${normalizedOrigin}/public/premium.html?paddle=cancel` : "";
  h = h.replace('"DRESSAI_API_URL_PLACEHOLDER"', JSON.stringify(api));
  h = h.replace('"PADDLE_CLIENT_SIDE_TOKEN_PLACEHOLDER"', JSON.stringify(paddleToken));
  h = h.replace(
    '"PADDLE_ENVIRONMENT_PLACEHOLDER"',
    JSON.stringify(paddleEnv === "production" ? "production" : "sandbox")
  );
  h = h.replace('"PADDLE_PRICE_ID_PLACEHOLDER"', JSON.stringify(paddlePrice));
  h = h.replace('"PADDLE_SUCCESS_URL_PLACEHOLDER"', JSON.stringify(successUrl));
  h = h.replace('"PADDLE_CANCEL_URL_PLACEHOLDER"', JSON.stringify(cancelUrl));
  return h;
}

loadDotEnv();
fs.rmSync(DIST, { recursive: true, force: true });
ensureDir(DIST);

for (const relPath of [
  "app.js",
  "i18n.js",
  "index.cjs",
  "locales.js",
  "script.js",
  "server.cjs",
  "server.js",
  "simple-app.js",
  "simple.html",
  "style.css"
]) {
  copyFile(relPath);
}

for (const relPath of ["offline", "public", "src"]) {
  copyDir(relPath);
}

writeFile("index.html", injectIndexHtml(fs.readFileSync(path.join(ROOT, "index.html"), "utf8")));
writeFile(
  "public/premium.html",
  injectPremiumHtml(fs.readFileSync(path.join(ROOT, "public", "premium.html"), "utf8"))
);

console.log(`[build-static] wrote ${DIST}`);
