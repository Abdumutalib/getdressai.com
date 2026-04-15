import { execFileSync, execSync } from "node:child_process";
import { existsSync, readdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rootFiles = readdirSync(root);
const bad = rootFiles.find((n) => n.endsWith(".py") && !n.startsWith("."));
if (!bad) {
  console.log("No root .py file");
  process.exit(0);
}
const full = join(root, bad);
if (existsSync(full)) unlinkSync(full);
try {
  execFileSync("git", ["rm", "--cached", "--", bad], { cwd: root, stdio: "inherit" });
} catch {
  /* not tracked */
}
console.log("Removed:", bad);
