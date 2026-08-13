#!/usr/bin/env node

const baseUrlRaw = process.env.EXTERNAL_API_BASE_URL;
const token = process.env.EXTERNAL_API_TOKEN;

if (!baseUrlRaw) {
  console.error("[check-external-api] EXTERNAL_API_BASE_URL is required.");
  console.error("Example: EXTERNAL_API_BASE_URL=https://api.your-domain.com");
  process.exit(1);
}

const baseUrl = baseUrlRaw.replace(/\/$/, "");

const endpoints = [
  { method: "GET", path: "/api/auth/me", required: true, note: "Current user profile" },
  { method: "GET", path: "/api/private/products", required: true, note: "Products list" },
  { method: "GET", path: "/api/private/warehouses", required: true, note: "Warehouses list" },
  { method: "GET", path: "/api/private/sales", required: true, note: "Sales list" },
  { method: "GET", path: "/api/private/purchases", required: true, note: "Purchases list" },
  { method: "GET", path: "/api/private/payments", required: true, note: "Payments list" },
  { method: "GET", path: "/api/private/expenses", required: true, note: "Expenses list" },
  { method: "GET", path: "/api/private/cash", required: true, note: "Cash accounts" },
  { method: "POST", path: "/api/private/sales", required: true, note: "Create sale" },
  { method: "POST", path: "/api/private/purchases", required: true, note: "Create purchase" },
  { method: "POST", path: "/api/private/payments", required: true, note: "Create payment" },
  { method: "POST", path: "/api/private/expenses", required: true, note: "Create expense" },
  { method: "POST", path: "/api/private/cash", required: true, note: "Create cash transaction" },
  { method: "POST", path: "/api/private/warehouse/expense", required: true, note: "Stock expense" },
  { method: "POST", path: "/api/private/sync/push", required: true, note: "Offline sync push" },
  { method: "GET", path: "/api/telegram/products", required: false, note: "Telegram integration" },
  { method: "POST", path: "/api/telegram/order", required: false, note: "Telegram integration" },
  { method: "POST", path: "/api/telegram/customer", required: false, note: "Telegram integration" },
  { method: "POST", path: "/api/telegram/payment", required: false, note: "Telegram integration" },
];

const allowedStatuses = new Set([200, 201, 400, 401, 403, 404, 405, 409, 422]);

function makeHeaders() {
  const headers = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function checkEndpoint({ method, path, required, note }) {
  const url = `${baseUrl}${path}`;

  try {
    const init = {
      method,
      headers: makeHeaders(),
    };

    // For POST endpoints we intentionally send an empty body and accept 4xx,
    // this validates route presence and auth behavior without mutating data.
    if (method === "POST") {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify({});
    }

    const res = await fetch(url, init);
    const ok = allowedStatuses.has(res.status);

    let shape = "unknown";
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      try {
        const body = await res.json();
        if (body && typeof body === "object" && "success" in body && "data" in body) {
          shape = "ApiResponse(success,data,error)";
        } else {
          shape = "json";
        }
      } catch {
        shape = "invalid-json";
      }
    } else {
      shape = ct || "non-json";
    }

    return { method, path, required, note, status: res.status, ok, shape, url };
  } catch (error) {
    return {
      method,
      path,
      required,
      note,
      status: null,
      ok: false,
      shape: "network-error",
      url,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

(async () => {
  console.log(`[check-external-api] Base URL: ${baseUrl}`);
  console.log(`[check-external-api] Token: ${token ? "provided" : "not provided"}`);

  const results = [];
  for (const endpoint of endpoints) {
    // eslint-disable-next-line no-await-in-loop
    const result = await checkEndpoint(endpoint);
    results.push(result);
  }

  const requiredFailures = results.filter((x) => x.required && (!x.ok || x.status === 404));

  console.log("\n=== Endpoint Check Results ===");
  for (const item of results) {
    const statusText = item.status === null ? "ERR" : String(item.status);
    const reqTag = item.required ? "REQ" : "OPT";
    const okTag = item.ok && item.status !== 404 ? "OK" : "WARN";
    console.log(`${okTag} [${reqTag}] ${item.method} ${item.path} -> ${statusText} (${item.shape})`);
    if (item.error) {
      console.log(`    error: ${item.error}`);
    }
  }

  if (requiredFailures.length > 0) {
    console.log("\n[check-external-api] Missing or invalid required endpoints:");
    for (const fail of requiredFailures) {
      console.log(`- ${fail.method} ${fail.path} (${fail.status ?? "ERR"})`);
    }
    process.exit(2);
  }

  console.log("\n[check-external-api] Required endpoint mapping looks good.");
})();
