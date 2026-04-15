/**
 * Amazon Product Advertising API 5.0 — SearchItems (+ иҳтиёрий GetVariations).
 * Пакет: `amazon-paapi` (PA-API SDK устидан wrapper).
 *
 * Муҳит: AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG
 * Ихтиёрий: AMAZON_MARKETPLACE (default www.amazon.com)
 *
 * Эслатма: SearchItems бита сўровда ондтадан ортиқ қайтармайди (Amazon чегараси).
 */

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
/** @type {{ SearchItems: Function, GetVariations: Function }} */
const amazonPaapi = require("amazon-paapi");

function getCommonParameters() {
  const accessKey = process.env.AMAZON_ACCESS_KEY?.trim();
  const secretKey = process.env.AMAZON_SECRET_KEY?.trim();
  const partnerTag = process.env.AMAZON_PARTNER_TAG?.trim();
  const marketplace = process.env.AMAZON_MARKETPLACE?.trim() || "www.amazon.com";

  if (!accessKey || !secretKey || !partnerTag) {
    const err = new Error(
      "Amazon PA-API is not configured. Set AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, and AMAZON_PARTNER_TAG in .env"
    );
    err.statusCode = 503;
    throw err;
  }

  return {
    AccessKey: accessKey,
    SecretKey: secretKey,
    PartnerTag: partnerTag,
    PartnerType: "Associates",
    Marketplace: marketplace,
  };
}

/** АҚШ: нарх сўммаси — минимал валюта бирлиги (цент); body да доллар қабул қиламиз */
function dollarsToMinorUnits(usd) {
  const n = Number(usd);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.round(n * 100);
}

function extractTitle(item) {
  return String(item?.ItemInfo?.Title?.DisplayValue || "").toLowerCase();
}

function extractPriceAmount(item) {
  const p = item?.Offers?.Listings?.[0]?.Price;
  if (p?.Amount != null) return Number(p.Amount);
  const disp = p?.DisplayAmount;
  if (typeof disp === "string") {
    const m = disp.replace(/[^0-9.]/g, "");
    const v = parseFloat(m);
    return Number.isFinite(v) ? v : null;
  }
  return null;
}

/**
 * @param {object} product
 * @param {string} [userSize]
 */
export function matchSize(product, userSize) {
  if (!userSize) return true;
  const title = extractTitle(product);
  const u = String(userSize).trim().toUpperCase();
  const sizeMap = {
    XS: ["xs", "extra small", "x-small"],
    S: ["size s", " small", "s,", "s)", "s "],
    M: ["size m", "medium", "m,", "m)", "m "],
    L: ["size l", "large", "l,", "l)", "l "],
    XL: ["xl", "x-large", "extra large"],
    XXL: ["xxl", "2xl", "2x"],
  };
  const aliases = sizeMap[u] || [u.toLowerCase()];
  return aliases.some((a) => title.includes(a));
}

/**
 * @param {object} product
 * @param {string} [color]
 */
export function matchColor(product, color) {
  if (!color) return true;
  return extractTitle(product).includes(String(color).trim().toLowerCase());
}

/**
 * @param {object} product
 * @param {{ size?: string, color?: string, style?: string, budget?: number }} user
 */
export function calculateFitScore(product, user) {
  let score = 50;

  const price = extractPriceAmount(product);
  const budget = user.budget != null ? Number(user.budget) : null;

  if (price != null && Number.isFinite(budget) && budget > 0) {
    const ratio = price / budget;
    if (ratio > 1) score -= 40;
    else if (ratio > 0.85) score -= 15;
    else if (ratio < 0.6) score += 15;
  }

  const title = extractTitle(product);
  const words = String(user.style || "")
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);
  let hits = 0;
  for (const w of words) {
    if (title.includes(w)) hits++;
  }
  score += Math.min(30, hits * 8);

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * @param {object} body
 */
export async function runAmazonSearch(body) {
  const common = getCommonParameters();
  const partnerTag = common.PartnerTag;

  const keywords = String(body?.keywords ?? "").trim();
  if (!keywords) {
    const err = new Error("keywords is required");
    err.statusCode = 400;
    throw err;
  }

  const searchIndex = String(body?.searchIndex || "Apparel").trim() || "Apparel";
  const itemCount = Math.min(10, Math.max(1, Number(body?.itemCount) || 10));
  const expandVariations = Boolean(body?.expandVariations);
  const maxVariationFetches = Math.min(5, Math.max(0, Number(body?.maxVariationFetches) || 3));

  const minMinor = dollarsToMinorUnits(body?.minPrice);
  const maxMinor = dollarsToMinorUnits(body?.maxPrice);

  /** @type {Record<string, unknown>} */
  const requestParameters = {
    Keywords: keywords,
    SearchIndex: searchIndex,
    ItemCount: itemCount,
    Availability: "Available",
    Resources: [
      "ItemInfo.Title",
      "ItemInfo.Classifications",
      "ItemInfo.ByLineInfo",
      "Offers.Listings.Price",
      "Images.Primary.Medium",
      "VariationSummary.VariationDimension",
    ],
  };

  if (body?.brands) {
    const b = Array.isArray(body.brands) ? body.brands[0] : body.brands;
    if (b) requestParameters.Brand = String(b).trim();
  }
  if (minMinor != null) requestParameters.MinPrice = minMinor;
  if (maxMinor != null) requestParameters.MaxPrice = maxMinor;

  const searchResponse = await amazonPaapi.SearchItems(common, requestParameters);
  const rawItems = searchResponse?.SearchResult?.Items || [];

  const size = body?.size ? String(body.size).trim() : "";
  const color = body?.color ? String(body.color).trim() : "";
  const budget = body?.maxPrice != null ? Number(body.maxPrice) : undefined;

  /** @type {object[]} */
  let candidates = [];

  let variationCalls = 0;
  for (const item of rawItems) {
    if (
      expandVariations &&
      item?.ASIN &&
      item?.VariationSummary?.VariationDimension &&
      variationCalls < maxVariationFetches
    ) {
      variationCalls += 1;
      try {
        const varResp = await amazonPaapi.GetVariations(common, {
          ASIN: item.ASIN,
          Resources: [
            "ItemInfo.Title",
            "ItemInfo.ByLineInfo",
            "Offers.Listings.Price",
            "Images.Primary.Medium",
            "VariationSummary.VariationDimension",
          ],
        });
        const vars = varResp?.VariationsResult?.Items || [];
        const matched = vars.filter(
          (v) => matchSize(v, size) && matchColor(v, color)
        );
        if (matched.length) {
          candidates.push(...matched);
        } else {
          candidates.push(item);
        }
      } catch {
        candidates.push(item);
      }
    } else {
      if (matchSize(item, size) && matchColor(item, color)) {
        candidates.push(item);
      }
    }
  }

  if (!candidates.length) {
    candidates = rawItems.filter((item) => matchSize(item, size) && matchColor(item, color));
  }
  if (!candidates.length) {
    candidates = [...rawItems];
  }

  const userPrefs = {
    size,
    color,
    style: keywords,
    budget: Number.isFinite(budget) ? budget : undefined,
  };

  const products = candidates
    .map((item) => {
      const asin = item?.ASIN;
      const fitScore = calculateFitScore(item, userPrefs);
      const affiliateUrl = asin
        ? `https://www.amazon.com/dp/${encodeURIComponent(asin)}?tag=${encodeURIComponent(partnerTag)}`
        : undefined;
      return { ...item, fitScore, affiliateUrl };
    })
    .sort((a, b) => (b.fitScore || 0) - (a.fitScore || 0));

  return {
    success: true,
    products,
    total: products.length,
  };
}

/**
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
    const result = await runAmazonSearch(body);
    return sendJson(200, result);
  } catch (err) {
    const code = err.statusCode || 500;
    console.error("Amazon PA-API search error:", err);
    return sendJson(code, { success: false, error: err.message || "Amazon search failed" });
  }
}
