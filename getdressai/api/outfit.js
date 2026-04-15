/**
 * Vercel Serverless — proxies chat completions (OpenAI-style JSON body: model, messages, …).
 * Client sends the same body as for OpenAI Chat Completions; this handler forwards upstream.
 * No Supabase here — keep keys server-side only.
 *
 * Provider choice (AI_PROVIDER билан мажбурий йўналиш ёки автоматик танлов):
 *   1) AI_PROVIDER=ollama     → local Ollama /v1/chat/completions (OLLAMA_BASE_URL)
 *   2) AI_PROVIDER=groq       → Groq (GROQ_API_KEY зарур)
 *   3) AI_PROVIDER=openrouter → OpenRouter (OPENROUTER_API_KEY зарур)
 *   4) AI_PROVIDER=openai     → OpenAI (OPENAI_API_KEY зарур)
 *   Автомат (AI_PROVIDER бўш): OpenRouter калити борса шу → кейин Groq → охирги булут чора: OpenAI.
 *   Шу тарзда OPENAI_API_KEY — «охирги нажот» (бошқа булут калитлар йўқ ёки фақат OpenAI қолганда).
 *
 * Optional: OPENROUTER_SITE_URL, OPENROUTER_APP_NAME (OpenRouter учун).
 */

import { validateChatCompletionsBody } from "./validate-chat.js";
import { resolveProvider } from "./lib/resolve-provider.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const p = resolveProvider();
  if (!p) {
    return res.status(500).json({
      error: "Server misconfiguration",
      details:
        "Set OPENROUTER_API_KEY, GROQ_API_KEY, OPENAI_API_KEY, or AI_PROVIDER=ollama (local). Use AI_PROVIDER=openai|groq|openrouter|ollama to force one provider.",
    });
  }

  const headers = { "Content-Type": "application/json" };
  if (p.apiKey) {
    headers.Authorization = `Bearer ${p.apiKey}`;
  }

  if (p.kind === "openrouter") {
    headers["HTTP-Referer"] =
      process.env.OPENROUTER_SITE_URL || "https://localhost";
    headers["X-Title"] = process.env.OPENROUTER_APP_NAME || "GetdressAI";
  }

  const bodyErr = validateChatCompletionsBody(req.body);
  if (bodyErr) {
    return res.status(400).json({
      error: "Bad request",
      details: bodyErr,
    });
  }

  try {
    const upstream = await fetch(p.url, {
      method: "POST",
      headers,
      body: JSON.stringify(req.body),
    });

    const json = await upstream.json();
    res.setHeader("X-GetdressAI-Provider", p.kind);
    return res.status(upstream.status).json(json);
  } catch (e) {
    console.error(e);
    return res.status(502).json({
      error: "Proxy failed",
      details: e.message || String(e),
    });
  }
}
