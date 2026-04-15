/**
 * GetdressAI (getdressai/) — Vercel CLI орқали deploy. Алдинги: `npx vercel login`
 *
 * npm run publish:web -- --prod
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webDir = join(__dirname, "..", "getdressai");
const pass = process.argv.slice(2);

console.log(`[publish:web] cd getdressai && npx vercel ${pass.join(" ")}`.trim());
const r = spawnSync("npx", ["vercel", ...pass], { stdio: "inherit", shell: true, cwd: webDir });
process.exit(r.status ?? 1);
