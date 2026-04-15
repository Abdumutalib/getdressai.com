/**
 * Vercel Fluid / Node application scan expects app|index|server|main at the repo root
 * when a root package.json exists. The real site is static HTML under getdressai/
 * (see vercel.json: outputDirectory, installCommand). This file is only a probe placeholder.
 */
module.exports = {};
