/**
 * AliExpress Open Platform — `aliexpress.affiliate.product.query` (MD5 имзо).
 *
 * Сервер .env: ALIEXPRESS_APP_KEY, ALIEXPRESS_APP_SECRET
 * Affiliate API учун одатда шунда: ALIEXPRESS_APP_SIGNATURE, ALIEXPRESS_TRACKING_ID
 * Ихтиёрий: ALIEXPRESS_SYNC_URL (default https://api-sg.aliexpress.com/sync)
 */

import crypto from "crypto";

const DEFAULT_SYNC_URL = "https://api-sg.aliexpress.com/sync";

const DEFAULT_FIELDS =
  "product_title,product_id,product_main_image_url,product_video_url,original_price,sale_price,discount,sale_count,commission_rate,evaluate_score,evaluate_rate,target_sale_price,target_original_price,product_detail_url,promotion_link";

/** @type {Record<string, string>} */
const SORT_MAP = {
  price_asc: "SALE_PRICE_ASC",
  price_desc: "SALE_PRICE_DESC",
  sale_desc: "LAST_VOLUME_DESC",
  volume_desc: "LAST_VOLUME_DESC",
  best_match: "LAST_VOLUME_DESC",
  match: "LAST_VOLUME_DESC",
};

function requireAliExpressCredentials() {
  const appKey = process.env.ALIEXPRESS_APP_KEY?.trim();
  const appSecret = process.env.ALIEXPRESS_APP_SECRET?.trim();
  if (!appKey || !appSecret) {
    const err = new Error(
      "AliExpress is not configured. Set ALIEXPRESS_APP_KEY and ALIEXPRESS_APP_SECRET in .env"
    );
    err.statusCode = 503;
    throw err;
  }
  const appSignature = process.env.ALIEXPRESS_APP_SIGNATURE?.trim();
  const trackingId = process.env.ALIEXPRESS_TRACKING_ID?.trim();
  return { appKey, appSecret, appSignature, trackingId };
}

/**
 * Top API MD5: upper(MD5(secret + key1val1key2val2… + secret))
 * @param {Record<string, string | number | boolean>} params
 * @param {string} secret
 */
export function generateAliExpressSign(params, secret) {
  const sortedKeys = Object.keys(params)
    .filter((k) => k !== "sign")
    .sort();
  const signStr = sortedKeys.map((key) => `${key}${params[key]}`).join("");
  return crypto
    .createHash("md5")
    .update(secret + signStr + secret, "utf8")
    .digest("hex")
    .toUpperCase();
}

/** Body да доллар; API `min_sale_price` / `max_sale_price` — тийин (cent). */
function dollarsToCents(usd) {
  const n = Number(usd);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.round(n * 100);
}

function parseMaybeNumber(v) {
  if (v == null || v === "") return null;
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/**
 * @param {object} product — formatted row
 * @param {{ keywords?: string, maxPrice?: number }} user
 */
export function calculateAliExpressScore(product, user) {
  let score = 70;

  const price = product?.price != null ? Number(product.price) : null;
  const maxPrice = user?.maxPrice != null ? Number(user.maxPrice) : null;

  if (Number.isFinite(price) && Number.isFinite(maxPrice) && maxPrice > 0) {
    if (price > maxPrice) score -= 40;
    else if (price > maxPrice * 0.95) score -= 12;
    else if (price < maxPrice * 0.5) score += 12;
  }

  const saleCount = product?.saleCount != null ? Number(product.saleCount) : null;
  if (Number.isFinite(saleCount)) {
    if (saleCount > 1000) score += 15;
    else if (saleCount > 100) score += 8;
  }

  const rating = product?.rating != null ? Number(product.rating) : null;
  if (Number.isFinite(rating)) {
    const stars = rating > 10 ? Math.min(100, rating) / 20 : rating;
    score += Math.min(20, stars * 4);
  }

  const title = String(product?.title || "").toLowerCase();
  const kw = String(user?.keywords || "")
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1);
  let hits = 0;
  for (const w of kw) {
    if (title.includes(w)) hits++;
  }
  score += Math.min(25, hits * 5);

  return Math.min(100, Math.max(0, Math.round(score)));
}

function extractProductRows(data) {
  const result =
    data?.aliexpress_affiliate_product_query_response?.resp_result?.result;
  if (!result?.products) return { products: [], total: 0 };

  const block = result.products;
  let list = [];
  if (Array.isArray(block)) list = block;
  else if (block.product) {
    list = Array.isArray(block.product) ? block.product : [block.product];
  }

  const total =
    result.total_record_count != null
      ? Number(result.total_record_count)
      : list.length;

  return { products: list, total: Number.isFinite(total) ? total : list.length };
}

/**
 * @param {object} body
 */
export async function runAliExpressSearch(body) {
  const { appKey, appSecret, appSignature, trackingId } = requireAliExpressCredentials();

  const keywordsRaw = String(body?.keywords ?? "").trim();
  if (!keywordsRaw) {
    const err = new Error("keywords is required");
    err.statusCode = 400;
    throw err;
  }

  const pageNo = Math.max(1, Number(body?.pageNo) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(body?.pageSize) || 20));
  const sortKey = body?.sort != null ? String(body.sort).trim() : "";
  const minCents = body?.minPrice != null ? dollarsToCents(body.minPrice) : undefined;
  const maxCents = body?.maxPrice != null ? dollarsToCents(body.maxPrice) : undefined;

  const targetCurrency =
    String(body?.target_currency || process.env.ALIEXPRESS_TARGET_CURRENCY || "USD").trim() ||
    "USD";
  const targetLanguage =
    String(body?.target_language || process.env.ALIEXPRESS_TARGET_LANGUAGE || "EN").trim() ||
    "EN";
  const shipTo =
    String(body?.ship_to_country || process.env.ALIEXPRESS_SHIP_TO_COUNTRY || "US").trim() ||
    "US";

  const fields = String(body?.fields || process.env.ALIEXPRESS_PRODUCT_FIELDS || DEFAULT_FIELDS);

  /** @type {Record<string, string | number>} */
  const apiParams = {
    app_key: appKey,
    timestamp: Date.now(),
    sign_method: "md5",
    method: "aliexpress.affiliate.product.query",
    v: String(process.env.ALIEXPRESS_API_VERSION || "2.0"),
    format: "json",
    fields,
    keywords: keywordsRaw,
    page_no: pageNo,
    page_size: pageSize,
    target_currency: targetCurrency,
    target_language: targetLanguage,
    ship_to_country: shipTo,
  };

  if (appSignature) apiParams.app_signature = appSignature;
  if (trackingId) apiParams.tracking_id = trackingId;

  if (minCents != null) apiParams.min_sale_price = minCents;
  if (maxCents != null) apiParams.max_sale_price = maxCents;

  const mappedSort = sortKey && SORT_MAP[sortKey] ? SORT_MAP[sortKey] : null;
  if (mappedSort) {
    apiParams.sort = mappedSort;
  } else if (sortKey && /^[A-Z0-9_]+$/.test(sortKey)) {
    apiParams.sort = sortKey;
  }

  const stringParams = {};
  for (const [k, v] of Object.entries(apiParams)) {
    if (v === undefined || v === null || v === "") continue;
    stringParams[k] = String(v);
  }

  stringParams.sign = generateAliExpressSign(stringParams, appSecret);

  const syncUrl = process.env.ALIEXPRESS_SYNC_URL?.trim() || DEFAULT_SYNC_URL;
  const queryString = new URLSearchParams(stringParams).toString();
  const response = await fetch(`${syncUrl}?${queryString}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const data = await response.json().catch(() => ({}));

  if (data?.error_response) {
    const er = data.error_response;
    const msg =
      er.sub_msg ||
      er.msg ||
      er.message ||
      String(er.code || "AliExpress API error");
    const err = new Error(msg);
    err.statusCode = response.ok ? 502 : response.status >= 400 ? response.status : 502;
    throw err;
  }

  if (!response.ok) {
    const err = new Error(data?.message || response.statusText || "AliExpress HTTP error");
    err.statusCode = response.status >= 400 && response.status < 500 ? response.status : 502;
    throw err;
  }

  const respResult = data?.aliexpress_affiliate_product_query_response?.resp_result;
  const respCode = respResult?.resp_code;
  if (respCode != null && Number(respCode) !== 200) {
    const err = new Error(
      String(respResult?.resp_msg || `AliExpress resp_code=${respCode}`)
    );
    err.statusCode = 502;
    throw err;
  }

  const { products: rawList, total } = extractProductRows(data);

  const maxPriceUser = body?.maxPrice != null ? Number(body.maxPrice) : undefined;

  const formattedProducts = rawList.map((product) => {
    const id = product.product_id;
    const price =
      parseMaybeNumber(product.target_sale_price) ??
      parseMaybeNumber(product.sale_price) ??
      parseMaybeNumber(product.app_sale_price);
    const originalPrice =
      parseMaybeNumber(product.target_original_price) ??
      parseMaybeNumber(product.original_price);

    const saleCount = parseMaybeNumber(product.sale_count);
    const rating =
      parseMaybeNumber(product.evaluate_score) ??
      parseMaybeNumber(product.evaluate_rate);

    const affiliateUrl =
      String(product.promotion_link || product.product_detail_url || "").trim() ||
      `https://www.aliexpress.com/item/${id}.html`;

    return {
      id,
      title: product.product_title,
      price,
      originalPrice,
      image: product.product_main_image_url,
      saleCount,
      commission: product.commission_rate,
      rating,
      affiliateUrl,
    };
  });

  const userCtx = {
    keywords: keywordsRaw,
    maxPrice: Number.isFinite(maxPriceUser) ? maxPriceUser : undefined,
  };

  const scoredProducts = formattedProducts
    .map((p) => ({
      ...p,
      fitScore: calculateAliExpressScore(p, userCtx),
    }))
    .sort((a, b) => b.fitScore - a.fitScore);

  return {
    success: true,
    products: scoredProducts,
    total,
    pageNo,
    pageSize,
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
    const result = await runAliExpressSearch(body);
    return sendJson(200, result);
  } catch (err) {
    const code = err.statusCode || 500;
    console.error("AliExpress search error:", err);
    return sendJson(code, {
      success: false,
      error: err.message || "AliExpress search failed",
    });
  }
}
