/**
 * Shared AI upstream resolution for Vercel (api/outfit.js) and local dev-server.mjs.
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

function ollamaChatCompletionsUrl() {
  const base = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434")
    .trim()
    .replace(/\/$/, "");
  return `${base}/v1/chat/completions`;
}

/**
 * @returns {{ kind: string, url: string, apiKey: string | null } | null }
 */
export function resolveProvider() {
  const prefer = (process.env.AI_PROVIDER || "").toLowerCase().trim();
  const orKey = process.env.OPENROUTER_API_KEY?.trim();
  const gqKey = process.env.GROQ_API_KEY?.trim();
  const oaKey = process.env.OPENAI_API_KEY?.trim();

  if (prefer === "ollama") {
    return { kind: "ollama", url: ollamaChatCompletionsUrl(), apiKey: null };
  }
  if (prefer === "groq" && gqKey) {
    return { kind: "groq", url: GROQ_URL, apiKey: gqKey };
  }
  if (prefer === "openrouter" && orKey) {
    return { kind: "openrouter", url: OPENROUTER_URL, apiKey: orKey };
  }
  if (prefer === "openai" && oaKey) {
    return { kind: "openai", url: OPENAI_URL, apiKey: oaKey };
  }
  if (orKey) {
    return { kind: "openrouter", url: OPENROUTER_URL, apiKey: orKey };
  }
  if (gqKey) {
    return { kind: "groq", url: GROQ_URL, apiKey: gqKey };
  }
  if (oaKey) {
    return { kind: "openai", url: OPENAI_URL, apiKey: oaKey };
  }
  return null;
}
