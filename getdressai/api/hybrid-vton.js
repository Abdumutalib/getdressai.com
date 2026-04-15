/**
 * Hybrid virtual try-on — FASHN VTON (kiyim) + OmniTry (aksessuarlar) + FastFit (in-memory cache).
 *
 * Production-da Python va modellar серверда ўрнатилган бўлиши керак. Мисол учун:
 *   FASHN_VTON_RUN_PY=/opt/fashn-vton-1.5/run.py
 *   OMNITRY_RUN_PY=/opt/omnitry/run_infer.py   (ixtiyoriy)
 *
 * Vercel serverless: export default handler
 * Local: import { runHybridVton } from "./hybrid-vton.js"
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

const execFileAsync = promisify(execFile);

/** @typedef {{ image: string, type: string }} GarmentInput */

class FastFitCache {
  constructor() {
    /** @type {Map<string, unknown>} */
    this.cache = new Map();
  }

  /**
   * @param {string} personImageBase64
   * @param {string} garmentImageBase64
   */
  getCacheKey(personImageBase64, garmentImageBase64) {
    const h = crypto.createHash("sha256");
    h.update(personImageBase64 || "");
    h.update("|");
    h.update(garmentImageBase64 || "");
    return h.digest("hex");
  }

  /**
   * Demo stub: real FastFit would return encoded tensors; here we only cache a marker.
   * @param {string} personImageBase64
   * @param {string} garmentImageBase64
   */
  async cacheReferenceFeatures(personImageBase64, garmentImageBase64) {
    const cacheKey = this.getCacheKey(personImageBase64, garmentImageBase64);
    if (this.cache.has(cacheKey)) {
      return { cached: true, key: cacheKey, features: this.cache.get(cacheKey) };
    }
    const features = {
      stub: true,
      message:
        "Set FASTFIT_ENCODE_PY or wire real FastFit encode_reference; cache key ready for reuse.",
    };
    this.cache.set(cacheKey, features);
    setTimeout(() => this.cache.delete(cacheKey), 3_600_000);
    return { cached: false, key: cacheKey, features };
  }
}

/**
 * data:image/...;base64,... yoki тўғридан-тўғри base64
 * @param {string} raw
 * @returns {string}
 */
function stripDataUrlBase64(raw) {
  const s = String(raw || "").trim();
  const m = /^data:image\/[a-z0-9.+-]+;base64,(.+)$/i.exec(s);
  return m ? m[1] : s;
}

/**
 * @param {string} base64
 * @param {string} destPath
 */
async function writeBase64File(base64, destPath) {
  const buf = Buffer.from(stripDataUrlBase64(base64), "base64");
  await fsp.writeFile(destPath, buf);
}

/**
 * @param {string} filePath
 * @returns {string}
 */
function readFileBase64(filePath) {
  return fs.readFileSync(filePath).toString("base64");
}

/**
 * FASHN VTON — kiyim (upper / lower / dress)
 * @param {string} personImagePath
 * @param {string} garmentImagePath
 * @param {string} garmentType
 * @param {string} outputPath
 */
async function fashnVTON(personImagePath, garmentImagePath, garmentType, outputPath) {
  const script = process.env.FASHN_VTON_RUN_PY?.trim();
  if (!script || !fs.existsSync(script)) {
    throw new Error(
      "FASHN_VTON_RUN_PY is not set or file missing. Point it to fashn run.py on the inference server."
    );
  }
  const py = process.env.PYTHON || "python";
  await execFileAsync(
    py,
    [script, "--person", personImagePath, "--garment", garmentImagePath, "--category", garmentType, "--output", outputPath],
    { maxBuffer: 64 * 1024 * 1024, windowsHide: true }
  );
  if (!fs.existsSync(outputPath)) {
    throw new Error(`FASHN VTON did not write output: ${outputPath}`);
  }
  return readFileBase64(outputPath);
}

/**
 * OmniTry — aksessuarlar (alohida Python скрипт орқали; inline `python -c` билан кавслар синчилади)
 * @param {string} personImagePath
 * @param {string} objectImagePath
 * @param {string} objectType
 * @param {string} outputPath
 */
async function omniTryVTON(personImagePath, objectImagePath, objectType, outputPath) {
  const script = process.env.OMNITRY_RUN_PY?.trim();
  if (!script || !fs.existsSync(script)) {
    throw new Error(
      "OMNITRY_RUN_PY is not set or file missing. Provide a small Python entry that loads OmniTryPipeline and saves the result."
    );
  }
  const py = process.env.PYTHON || "python";
  await execFileAsync(
    py,
    [script, "--person", personImagePath, "--object", objectImagePath, "--type", objectType, "--output", outputPath],
    { maxBuffer: 64 * 1024 * 1024, windowsHide: true }
  );
  if (!fs.existsSync(outputPath)) {
    throw new Error(`OmniTry did not write output: ${outputPath}`);
  }
  return readFileBase64(outputPath);
}

const FASHN_TYPES = new Set(["upper", "lower", "dress"]);

/**
 * @param {{
 *   personImageBase64: string,
 *   garments?: GarmentInput[],
 *   accessories?: GarmentInput[],
 *   useFastCache?: boolean
 * }} body
 */
export async function runHybridVton(body) {
  const personImageBase64 = body?.personImageBase64;
  const garments = Array.isArray(body?.garments) ? body.garments : [];
  const accessories = Array.isArray(body?.accessories) ? body.accessories : [];
  const useFastCache = body?.useFastCache !== false;

  if (!personImageBase64 || typeof personImageBase64 !== "string") {
    const err = new Error("personImageBase64 is required");
    err.statusCode = 400;
    throw err;
  }

  const tmpRoot = await fsp.mkdtemp(path.join(os.tmpdir(), "hybrid-vton-"));
  const layers = [];
  const fastCache = new FastFitCache();

  let currentPersonPath = path.join(tmpRoot, "person_0.png");
  await writeBase64File(personImageBase64, currentPersonPath);

  /** @param {string} imageField */
  const garmentPathFor = (imageField, idx, kind) => {
    const p = path.join(tmpRoot, `${kind}_${idx}.png`);
    return writeBase64File(imageField, p).then(() => p);
  };

  try {
    let step = 0;

    for (let i = 0; i < garments.length; i++) {
      const g = garments[i];
      if (!g?.image || !g?.type) {
        const err = new Error(`garments[${i}] must have image and type`);
        err.statusCode = 400;
        throw err;
      }

      const garmentPath = await garmentPathFor(g.image, i, "garment");
      const outPath = path.join(tmpRoot, `out_${++step}.png`);

      let garmentResultBase64;

      if (FASHN_TYPES.has(String(g.type).toLowerCase())) {
        garmentResultBase64 = await fashnVTON(currentPersonPath, garmentPath, String(g.type).toLowerCase(), outPath);
      } else {
        garmentResultBase64 = await omniTryVTON(currentPersonPath, garmentPath, String(g.type), outPath);
      }

      if (useFastCache) {
        const pB64 = readFileBase64(currentPersonPath);
        const gB64 = stripDataUrlBase64(g.image);
        await fastCache.cacheReferenceFeatures(pB64, gB64);
      }

      await fsp.copyFile(outPath, currentPersonPath);
      layers.push({ type: g.type, kind: "garment", result: garmentResultBase64 });
    }

    for (let i = 0; i < accessories.length; i++) {
      const a = accessories[i];
      if (!a?.image || !a?.type) {
        const err = new Error(`accessories[${i}] must have image and type`);
        err.statusCode = 400;
        throw err;
      }

      const objPath = await garmentPathFor(a.image, i, "accessory");
      const outPath = path.join(tmpRoot, `out_${++step}.png`);

      const accessoryResult = await omniTryVTON(currentPersonPath, objPath, String(a.type), outPath);
      await fsp.copyFile(outPath, currentPersonPath);
      layers.push({ type: a.type, kind: "accessory", result: accessoryResult });
    }

    const finalBase64 = readFileBase64(currentPersonPath);

    return {
      success: true,
      resultImage: finalBase64,
      layers,
      metadata: {
        garmentsProcessed: garments.length,
        accessoriesProcessed: accessories.length,
        cacheUsed: useFastCache,
        tmpRoot,
      },
    };
  } finally {
    await fsp.rm(tmpRoot, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * Vercel (req.body JSON) ёки Connect-style handler.
 * Oddiy node:http да `req.body` йўқ — у ерда фақат `runHybridVton` чақиринг.
 * @param {import("http").IncomingMessage & { body?: unknown }} req
 * @param {import("http").ServerResponse & { status?: (c: number) => { json: (o: unknown) => void } }} res
 */
export default async function handler(req, res) {
  const sendJson = (code, obj) => {
    if (typeof res.status === "function" && typeof res.status(code).json === "function") {
      return res.status(code).json(obj);
    }
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify(obj));
  };

  if (req.method !== "POST") {
    res.setHeader?.("Allow", "POST");
    return sendJson(405, { error: "Method not allowed" });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};

  try {
    const result = await runHybridVton(body);
    if (result.metadata && "tmpRoot" in result.metadata) {
      delete result.metadata.tmpRoot;
    }
    return sendJson(200, result);
  } catch (err) {
    const code = err.statusCode || 500;
    console.error("Hybrid VTON error:", err);
    return sendJson(code, { error: err.message || "Hybrid VTON failed" });
  }
}
