import http from "node:http";

const port = Number(process.env.PORT || 4010);
const endpointUrl = (process.env.HF_ENDPOINT_URL || "").trim();
const hfApiToken = (process.env.HF_API_TOKEN || "").trim();
const timeoutMs = Number(process.env.HF_TIMEOUT_MS || 120000);
const sharedSecret = (process.env.TRYON_SHARED_SECRET || "").trim();

if (!endpointUrl) {
  throw new Error("HF_ENDPOINT_URL is required.");
}

if (!hfApiToken) {
  throw new Error("HF_API_TOKEN is required.");
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 2 * 1024 * 1024) {
        reject(new Error("Request body too large."));
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1]?.trim() || "";
}

async function fetchJsonWithTimeout(url, init) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    return { response, json, text };
  } finally {
    clearTimeout(timer);
  }
}

function buildSummary(body, payload) {
  return (
    payload?.summary ||
    `Photo-based try-on generated for ${body.clothingRequest || body.style || "the selected outfit"}.`
  );
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method !== "POST" || req.url !== "/tryon") {
    return sendJson(res, 404, { error: "Not found." });
  }

  try {
    if (sharedSecret && getBearerToken(req) !== sharedSecret) {
      return sendJson(res, 401, { error: "Unauthorized." });
    }

    const body = await readJson(req);
    if (!body?.sourceImageUrl) {
      return sendJson(res, 400, { error: "sourceImageUrl is required." });
    }

    const startedAt = Date.now();
    const upstreamBody = {
      inputs: {
        source_image_url: body.sourceImageUrl,
        style: body.style,
        gender: body.gender,
        prompt: body.prompt,
        clothing_request: body.clothingRequest,
        measurements: body.measurements ?? null,
      },
    };

    const { response, json, text } = await fetchJsonWithTimeout(endpointUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfApiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(upstreamBody),
    });

    if (!response.ok) {
      return sendJson(res, 502, {
        error: `Hugging Face endpoint failed with HTTP ${response.status}.`,
        details: text.slice(0, 1000),
      });
    }

    const imageUrl = json?.image_url || json?.result_url || json?.url || "";
    const imageBase64 = json?.image_base64 || json?.result_image || "";

    if (!imageUrl && !imageBase64) {
      return sendJson(res, 502, {
        error: "HF endpoint response did not include an image URL or base64 payload.",
        details: json || text,
      });
    }

    return sendJson(res, 200, {
      imageUrl: imageUrl || undefined,
      imageBase64: imageBase64 || undefined,
      summary: buildSummary(body, json),
      tookMs: Date.now() - startedAt,
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Gateway failed.",
    });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`HF try-on gateway listening on ${port}`);
});
