/**
 * eBay Browse API — item_summary/search (client_credentials OAuth).
 *
 * .env: EBAY_APP_ID, EBAY_CERT_ID (Client Secret), иҳтиёрий EBAY_DEV_ID
 * Ихтиёрий: EBAY_USE_SANDBOX=true, EBAY_MARKETPLACE_ID=EBAY_US, EBAY_OAUTH_SCOPE
 */

let cachedToken = null;
let cachedTokenExpiry = 0;

function getApiRoot() {
  const sandbox = String(process.env.EBAY_USE_SANDBOX || "").toLowerCase() === "true";
  return sandbox ? "https://api.sandbox.ebay.com" : "https://api.ebay.com";
}

function getIdentityTokenUrl() {
  return `${getApiRoot()}/identity/v1/oauth2/token`;
}

function requireEbayCredentials() {
  const appId = process.env.EBAY_APP_ID?.trim();
  const certId = process.env.EBAY_CERT_ID?.trim();
  if (!appId || !certId) {
    const err = new Error(
      "eBay is not configured. Set EBAY_APP_ID and EBAY_CERT_ID (Client Secret) in .env"
    );
    err.statusCode = 503;
    throw err;
  }
  return { appId, certId };
}

async function getApplicationAccessToken() {
  if (cachedToken && Date.now() < cachedTokenExpiry) {
    return cachedToken;
  }

  const { appId, certId } = requireEbayCredentials();
  const scope =
    process.env.EBAY_OAUTH_SCOPE?.trim() || "https://api.ebay.com/oauth/api_scope";

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope,
  });

  const basic = Buffer.from(`${appId}:${certId}`).toString("base64");

  const res = await fetch(getIdentityTokenUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: body.toString(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error_description || data.error || res.statusText || "OAuth token failed";
    const err = new Error(msg);
    err.statusCode = res.status === 401 ? 401 : 502;
    throw err;
  }

  const accessToken = data.access_token;
  const expiresIn = Number(data.expires_in) || 7200;
  if (!accessToken) {
    const err = new Error("No access_token in eBay OAuth response");
    err.statusCode = 502;
    throw err;
  }

  cachedToken = accessToken;
  cachedTokenExpiry = Date.now() + Math.max(60, expiresIn - 120) * 1000;
  return accessToken;
}

/**
 * @param {object} item — eBay itemSummary
 * @param {{ keywords?: string, maxPrice?: number }} user
 */
export function calculateEBayFitScore(item, user) {
  let score = 70;

  const price = parseFloat(item?.price?.value);
  const maxPrice = user?.maxPrice != null ? Number(user.maxPrice) : null;

  if (Number.isFinite(price) && Number.isFinite(maxPrice) && maxPrice > 0) {
    if (price > maxPrice) score -= 40;
    else if (price > maxPrice * 0.9) score -= 12;
    else if (price < maxPrice * 0.5) score += 12;
  }

  const title = String(item?.title || "").toLowerCase();
  const kw = String(user?.keywords || "")
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1);
  let matches = 0;
  for (const w of kw) {
    if (title.includes(w)) matches++;
  }
  score += Math.min(30, matches * 6);

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * @param {object} body
 */
export async function runEbaySearch(body) {
  const keywordsRaw = String(body?.keywords ?? "").trim();
  if (!keywordsRaw) {
    const err = new Error("keywords is required");
    err.statusCode = 400;
    throw err;
  }

  const brand = body?.brand ? String(body.brand).trim() : "";
  const color = body?.color ? String(body.color).trim() : "";
  const size = body?.size ? String(body.size).trim() : "";
  const extra = [brand, color, size].filter(Boolean).join(" ");
  const q = extra ? `${keywordsRaw} ${extra}`.trim() : keywordsRaw;

  const minPrice = body?.minPrice != null ? Number(body.minPrice) : 0;
  const maxPrice = body?.maxPrice != null ? Number(body.maxPrice) : 500;
  const currency = String(body?.currency || process.env.EBAY_PRICE_CURRENCY || "USD").trim() || "USD";
  const limit = Math.min(200, Math.max(1, Number(body?.limit) || 50));

  const categoryIds = body?.categoryIds;
  const marketplaceId =
    process.env.EBAY_MARKETPLACE_ID?.trim() || "EBAY_US";

  const root = getApiRoot();
  const params = new URLSearchParams();
  params.set("q", q);
  params.set("limit", String(limit));

  if (categoryIds) {
    const c = Array.isArray(categoryIds) ? categoryIds.join(",") : String(categoryIds);
    if (c) params.set("category_ids", c);
  }

  params.append("filter", `price:[${minPrice}..${maxPrice}]`);
  params.append("filter", `priceCurrency:${currency}`);

  const searchUrl = `${root}/buy/browse/v1/item_summary/search?${params.toString()}`;

  const accessToken = await getApplicationAccessToken();

  const searchResponse = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-EBAY-C-MARKETPLACE-ID": marketplaceId,
      Accept: "application/json",
    },
  });

  const data = await searchResponse.json().catch(() => ({}));
  if (!searchResponse.ok) {
    const msg =
      data?.errors?.[0]?.message ||
      data?.message ||
      searchResponse.statusText ||
      "eBay search failed";
    const err = new Error(msg);
    err.statusCode = searchResponse.status >= 400 && searchResponse.status < 500 ? searchResponse.status : 502;
    throw err;
  }

  const summaries = data.itemSummaries || [];
  const userCtx = {
    keywords: keywordsRaw,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
  };

  const products = summaries
    .map((item) => {
      const fitScore = calculateEBayFitScore(item, userCtx);
      const affiliateUrl = item.itemAffiliateWebUrl || item.itemWebUrl || undefined;
      return {
        id: item.itemId,
        title: item.title,
        price: item.price?.value,
        currency: item.price?.currency,
        image: item.image?.imageUrl,
        condition: item.condition,
        itemUrl: item.itemWebUrl,
        affiliateUrl,
        fitScore,
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore);

  return {
    success: true,
    products,
    total: data.total ?? products.length,
    href: data.href,
    limit: data.limit,
    offset: data.offset,
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
    const result = await runEbaySearch(body);
    return sendJson(200, result);
  } catch (err) {
    const code = err.statusCode || 500;
    console.error("eBay search error:", err);
    return sendJson(code, {
      success: false,
      error: err.message || "eBay search failed",
    });
  }
}
