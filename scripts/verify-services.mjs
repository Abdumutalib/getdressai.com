/**
 * Ixtiyoriy HTTP tekshiruvlari: dressai-api /health (+ /config), getdressai dev-server.
 *
 * Ishlatish (репо ildizi):
 *   node scripts/verify-services.mjs
 *   node scripts/verify-services.mjs --live          # API HTTP (ECONNREFUSED → ogohlantirish, exit 0)
 *   node scripts/verify-services.mjs --live --web    # + getdressai :8787
 *   node scripts/verify-services.mjs --live --strict # API йўқ бўлса exit 1
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const args = new Set(process.argv.slice(2));
const live = args.has("--live");
const web = args.has("--web");
const strict = args.has("--strict");

function parseEnvFile(filePath) {
  const out = {};
  if (!existsSync(filePath)) return out;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

async function fetchOk(url, label) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 4000);
  try {
    const r = await fetch(url, { signal: ac.signal });
    clearTimeout(t);
    if (!r.ok) {
      console.error(`[verify-services] ${label}: HTTP ${r.status} ${url}`);
      return false;
    }
    return true;
  } catch (e) {
    clearTimeout(t);
    const msg = e.cause?.code || e.code || e.message;
    if (msg === "ECONNREFUSED" || e.name === "AbortError") {
      console.warn(`[verify-services] ${label}: unreachable (${msg}) ${url}`);
      return null;
    }
    console.error(`[verify-services] ${label}: ${e.message}`);
    return false;
  }
}

const apiEnv = parseEnvFile(join(root, "dressai-api", ".env"));
const webEnv = parseEnvFile(join(root, "getdressai", ".env"));
const apiPort = Number(apiEnv.PORT || process.env.PORT || 3000) || 3000;
const apiBase = (process.env.DRESSAI_VERIFY_API_URL || `http://127.0.0.1:${apiPort}`).replace(/\/$/, "");
const webPort = Number(process.env.GETDRESSAI_VERIFY_PORT || 8787);
const webBase = (process.env.GETDRESSAI_VERIFY_URL || `http://127.0.0.1:${webPort}`).replace(/\/$/, "");

let exitCode = 0;

if (live) {
  const h = await fetchOk(`${apiBase}/health`, "dressai-api");
  if (h === false) exitCode = 1;
  if (h === null && strict) exitCode = 1;
  if (h) {
    const c = await fetchOk(`${apiBase}/config`, "dressai-api /config");
    if (c === false) exitCode = 1;
    if (c) {
      try {
        const r = await fetch(`${apiBase}/config`);
        const j = await r.json();
        if (typeof j.authEnabled !== "boolean") {
          console.warn("[verify-services] /config: unexpected JSON shape");
        }
      } catch {
        /* already checked status */
      }
    }
  }
}

if (live && web) {
  const g = await fetchOk(`${webBase}/`, "getdressai");
  if (g === false) exitCode = 1;
  if (g === null && strict) exitCode = 1;
}

if (!live) {
  console.log(
    "[verify-services] Tarmoq текшириви ўтказилмади. API + веб учун: node scripts/verify-services.mjs --live --web"
  );
}

const hasWebUrl = Boolean(webEnv.SUPABASE_URL?.trim());
const hasApiKey = Boolean(apiEnv.OPENAI_API_KEY?.trim());
if (!hasWebUrl) {
  console.warn("[verify-services] getdressai/.env: SUPABASE_URL бўш — логин/магазин ишламаслиги мумкин.");
}
if (!hasApiKey) {
  console.warn("[verify-services] dressai-api/.env: OPENAI_API_KEY бўш — /analyze ишламаслиги мумкин.");
}

process.exit(exitCode);
