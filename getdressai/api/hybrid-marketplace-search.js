/**
 * Amazon + eBay + AliExpress — параллель қидирув, умумий фильтр ва totalFitScore.
 *
 * POST body: камида `keywords` ёки `style` (қидириш учун); иҳтиёрий `measurements`,
 * `budget` ({ min, max }), `size`, `color`, `preferredBrands`, `sources` (масалан `["amazon","ebay"]`).
 */

import { matchColor, matchSize, runAmazonSearch } from "./amazon-search.js";
import { runEbaySearch } from "./ebay-search.js";
import { runAliExpressSearch } from "./aliexpress-search.js";

/** @param {string} title */
function wrapTitleForMatch(title) {
  return { ItemInfo: { Title: { DisplayValue: String(title ?? "") } } };
}

/** @param {string} title */
function matchTitleSize(title, userSize) {
  if (!userSize) return true;
  return matchSize(wrapTitleForMatch(title), userSize);
}

/** @param {string} title */
function matchTitleColor(title, color) {
  if (!color) return true;
  return matchColor(wrapTitleForMatch(title), color);
}

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

/**
 * @param {string} title
 * @param {string} userSize
 */
function isCloseTitleSize(title, userSize) {
  const u = String(userSize).trim().toUpperCase();
  const idx = SIZE_ORDER.indexOf(u);
  if (idx < 0) return false;
  const neighbors = [SIZE_ORDER[idx - 1], SIZE_ORDER[idx + 1]].filter(Boolean);
  return neighbors.some((n) => matchTitleSize(title, n));
}

/**
 * @param {object} item — Amazon PA-API item
 */
function extractAmazonPrice(item) {
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
 * @param {object} item
 */
function normalizeAmazon(item) {
  const title = item?.ItemInfo?.Title?.DisplayValue || "";
  const price = extractAmazonPrice(item);
  const brand =
    item?.ItemInfo?.ByLineInfo?.Brand?.DisplayValue ||
    item?.ItemInfo?.ByLineInfo?.Manufacturer?.DisplayValue ||
    undefined;
  return {
    marketplace: "amazon",
    sourceId: item?.ASIN,
    title,
    price: price != null && Number.isFinite(price) ? price : null,
    currency: item?.Offers?.Listings?.[0]?.Price?.Currency || "USD",
    brand: brand ? String(brand) : undefined,
    image: item?.Images?.Primary?.Medium?.URL,
    affiliateUrl: item?.affiliateUrl,
    fitScore: item?.fitScore,
  };
}

/**
 * @param {object} p — runEbaySearch product row
 */
function normalizeEbay(p) {
  const price = p?.price != null ? Number(p.price) : null;
  return {
    marketplace: "ebay",
    sourceId: p?.id,
    title: p?.title || "",
    price: Number.isFinite(price) ? price : null,
    currency: p?.currency,
    image: p?.image,
    brand: undefined,
    affiliateUrl: p?.affiliateUrl || p?.itemUrl,
    fitScore: p?.fitScore,
  };
}

/**
 * @param {object} p — runAliExpressSearch product row
 */
function normalizeAliexpress(p) {
  const price = p?.price != null ? Number(p.price) : null;
  return {
    marketplace: "aliexpress",
    sourceId: p?.id != null ? String(p.id) : undefined,
    title: p?.title || "",
    price: Number.isFinite(price) ? price : null,
    currency: undefined,
    image: p?.image,
    brand: undefined,
    affiliateUrl: p?.affiliateUrl,
    fitScore: p?.fitScore,
    rating: p?.rating != null ? Number(p.rating) : undefined,
    saleCount: p?.saleCount != null ? Number(p.saleCount) : undefined,
  };
}

/**
 * @param {string} title
 * @param {string} styleKeywords
 */
export function calculateStyleMatch(title, styleKeywords) {
  const titleLower = String(title || "").toLowerCase();
  const keywords = String(styleKeywords || "")
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1);
  if (!keywords.length) return 1;
  let matches = 0;
  for (const kw of keywords) {
    if (titleLower.includes(kw)) matches++;
  }
  return Math.min(1, matches / Math.max(1, keywords.length));
}

/**
 * @param {object} product — normalized row
 * @param {object} user — measurements, style, budget, size
 */
export function calculateTotalFitScore(product, user) {
  let score = 0;

  const size = user.measurements?.recommendedSize || user.size;
  if (size) {
    const t = String(product.title || "");
    if (matchTitleSize(t, size)) score += 30;
    else if (isCloseTitleSize(t, size)) score += 15;
  } else {
    score += 12;
  }

  if (user.style) {
    score += calculateStyleMatch(product.title, user.style) * 25;
  } else {
    score += 8;
  }

  const maxB = user.budget?.max != null ? Number(user.budget.max) : null;
  if (maxB != null && Number.isFinite(maxB) && maxB > 0) {
    const price = product.price != null ? Number(product.price) : null;
    if (Number.isFinite(price)) {
      const priceRatio = price / maxB;
      if (priceRatio <= 1) score += 25 * (1 - priceRatio * 0.5);
      else score += 25 * Math.max(0, 1 - (priceRatio - 1) * 2);
    }
  } else {
    score += 10;
  }

  const rating = product.rating != null ? Number(product.rating) : null;
  if (Number.isFinite(rating)) {
    const stars = rating > 10 ? Math.min(100, rating) / 20 : rating;
    score += Math.min(10, stars * 2);
  }

  if (product.saleCount != null && Number(product.saleCount) > 500) score += 10;

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * @param {object} product
 * @param {string} [style]
 */
function matchStyle(product, style) {
  if (!style) return true;
  return calculateStyleMatch(product.title, style) > 0;
}

/**
 * @param {object} product
 * @param {string[]} [preferred]
 */
function matchPreferredBrand(product, preferred) {
  if (!preferred?.length) return true;
  const b = product.brand ? String(product.brand).trim() : "";
  if (!b) return true;
  const lower = b.toLowerCase();
  return preferred.some((p) => String(p).trim().toLowerCase() === lower);
}

/**
 * @param {object} userData
 */
function buildKeywords(userData) {
  const k = String(userData.keywords ?? "").trim();
  if (k) return k;
  return String(userData.style ?? "").trim();
}

/**
 * @param {object} userData
 */
function buildSearchBodies(userData) {
  const keywords = buildKeywords(userData);
  const size = userData.measurements?.recommendedSize || userData.size;
  const color = userData.color ? String(userData.color).trim() : "";
  const maxPrice = userData.budget?.max != null ? Number(userData.budget.max) : undefined;
  const minPrice = userData.budget?.min != null ? Number(userData.budget.min) : undefined;

  const itemCount = Math.min(
    10,
    Math.max(1, Number(userData.amazonItemCount) || Number(userData.itemCountPerMarketplace) || 10)
  );
  const ebayLimit = Math.min(
    200,
    Math.max(1, Number(userData.ebayLimit) || Number(userData.limitPerMarketplace) || 30)
  );
  const aliPageSize = Math.min(
    50,
    Math.max(1, Number(userData.aliexpressPageSize) || Number(userData.pageSize) || 20)
  );

  const amazonBody = {
    keywords,
    maxPrice,
    minPrice,
    size,
    color,
    brands: userData.preferredBrands,
    itemCount,
    searchIndex: userData.searchIndex || "Apparel",
    expandVariations: Boolean(userData.expandVariations),
  };

  const ebayBody = {
    keywords,
    maxPrice,
    minPrice,
    size,
    color,
    brand: userData.brand,
    limit: ebayLimit,
    categoryIds: userData.categoryIds,
  };

  const aliBody = {
    keywords,
    maxPrice,
    minPrice,
    pageNo: userData.pageNo || 1,
    pageSize: aliPageSize,
    sort: userData.aliexpressSort || userData.sort,
  };

  return { keywords, size, color, amazonBody, ebayBody, aliBody };
}

/**
 * @param {object} userData
 */
export async function runHybridMarketplaceSearch(userData) {
  const kw = buildKeywords(userData);
  if (!kw) {
    const err = new Error("keywords or style is required");
    err.statusCode = 400;
    throw err;
  }

  const sources = Array.isArray(userData.sources) && userData.sources.length
    ? userData.sources.map((s) => String(s).toLowerCase())
    : ["amazon", "ebay", "aliexpress"];

  const wantAmazon = sources.includes("amazon");
  const wantEbay = sources.includes("ebay");
  const wantAli = sources.includes("aliexpress") || sources.includes("ali");

  if (!wantAmazon && !wantEbay && !wantAli) {
    const err = new Error("sources must include at least one of: amazon, ebay, aliexpress");
    err.statusCode = 400;
    throw err;
  }

  const { amazonBody, ebayBody, aliBody, color: colorFilter } = buildSearchBodies(userData);

  /** @type {{ marketplace: string, error: string }[]} */
  const marketplaceErrors = [];

  const tasks = [];

  if (wantAmazon) {
    tasks.push(
      runAmazonSearch(amazonBody)
        .then((r) => ({ name: "amazon", result: r }))
        .catch((e) => {
          marketplaceErrors.push({ marketplace: "amazon", error: e.message || "Amazon failed" });
          return { name: "amazon", result: { success: false, products: [] } };
        })
    );
  }

  if (wantEbay) {
    tasks.push(
      runEbaySearch(ebayBody)
        .then((r) => ({ name: "ebay", result: r }))
        .catch((e) => {
          marketplaceErrors.push({ marketplace: "ebay", error: e.message || "eBay failed" });
          return { name: "ebay", result: { success: false, products: [] } };
        })
    );
  }

  if (wantAli) {
    tasks.push(
      runAliExpressSearch(aliBody)
        .then((r) => ({ name: "aliexpress", result: r }))
        .catch((e) => {
          marketplaceErrors.push({
            marketplace: "aliexpress",
            error: e.message || "AliExpress failed",
          });
          return { name: "aliexpress", result: { success: false, products: [] } };
        })
    );
  }

  const settled = await Promise.all(tasks);

  const allProducts = settled.flatMap((row) => {
    const products = row.result?.products || [];
    if (row.name === "amazon") return products.map(normalizeAmazon);
    if (row.name === "ebay") return products.map(normalizeEbay);
    if (row.name === "aliexpress") return products.map(normalizeAliexpress);
    return [];
  });

  const effectiveSize = userData.measurements?.recommendedSize || userData.size;
  const minB = userData.budget?.min != null ? Number(userData.budget.min) : null;
  const maxB = userData.budget?.max != null ? Number(userData.budget.max) : null;

  const filteredProducts = allProducts.filter((product) => {
    if (effectiveSize && !matchTitleSize(product.title, effectiveSize)) return false;
    if (colorFilter && !matchTitleColor(product.title, colorFilter)) return false;
    const price = product.price != null ? Number(product.price) : null;
    if (maxB != null && Number.isFinite(maxB) && Number.isFinite(price) && price > maxB) return false;
    if (minB != null && Number.isFinite(minB) && Number.isFinite(price) && price < minB) return false;
    if (userData.style && !matchStyle(product, userData.style)) return false;
    if (!matchPreferredBrand(product, userData.preferredBrands)) return false;
    return true;
  });

  const scoredProducts = filteredProducts.map((product) => ({
    ...product,
    totalFitScore: calculateTotalFitScore(product, userData),
  }));

  const sortedProducts = scoredProducts.sort((a, b) => b.totalFitScore - a.totalFitScore);

  const top = sortedProducts.slice(0, Math.min(200, Number(userData.topN) || 50));

  const groupedByMarketplace = { amazon: [], ebay: [], aliexpress: [] };
  for (const p of sortedProducts) {
    const m = p.marketplace;
    if (m === "amazon") groupedByMarketplace.amazon.push(p);
    else if (m === "ebay") groupedByMarketplace.ebay.push(p);
    else if (m === "aliexpress") groupedByMarketplace.aliexpress.push(p);
  }

  return {
    success: true,
    totalCount: sortedProducts.length,
    products: top,
    grouped: groupedByMarketplace,
    marketplaceErrors: marketplaceErrors.length ? marketplaceErrors : undefined,
    userCriteria: {
      size: effectiveSize,
      style: userData.style,
      budget: userData.budget,
      keywords: kw,
    },
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
    const result = await runHybridMarketplaceSearch(body);
    return sendJson(200, result);
  } catch (err) {
    const code = err.statusCode || 500;
    console.error("Hybrid marketplace search error:", err);
    return sendJson(code, {
      success: false,
      error: err.message || "Hybrid marketplace search failed",
    });
  }
}
