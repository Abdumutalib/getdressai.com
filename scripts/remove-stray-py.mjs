import { execFileSync, execSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const list = execSync("git ls-files", { cwd: root, encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean);
const bad = list.find((l) => l.endsWith("Python.py") && !l.startsWith("auto-caption"));
if (!bad) {
  console.log("No stray Python.py");
  process.exit(0);
}
const full = join(root, bad);
if (existsSync(full)) unlinkSync(full);
execFileSync("git", ["rm", "--cached", "--", bad], { cwd: root, stdio: "inherit" });
console.log("Removed from index:", bad);
