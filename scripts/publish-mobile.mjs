/**
 * Expo илова (mobile/) — EAS Build. Алдинги: `npm i -g eas-cli` ва `eas login`
 *
 * npm run publish:mobile -- --platform android --profile production
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mobileDir = join(__dirname, "..", "mobile");
const pass = process.argv.slice(2);
const args = pass.length ? pass : ["build", "--platform", "all", "--profile", "production"];

console.log(`[publish:mobile] cd mobile && npx eas-cli ${args.join(" ")}`);
const r = spawnSync("npx", ["eas-cli", ...args], { stdio: "inherit", shell: true, cwd: mobileDir });
process.exit(r.status ?? 1);
