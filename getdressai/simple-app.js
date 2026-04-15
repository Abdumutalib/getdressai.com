/**
 * Minimal outfit demo for simple.html — same /api/outfit as main app (npm run dev).
 */
function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function extractJsonFromAssistantText(text) {
  const t = String(text || "").trim();
  const fence = t.match(/^```(?:json)?\s*([\s\S]*?)```$/im);
  if (fence) return fence[1].trim();
  const inner = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (inner) return inner[1].trim();
  return t;
}

function amazonSearchUrl(query, associateTag) {
  const tag = String(associateTag || "YOUR_TAG").trim() || "YOUR_TAG";
  const k = encodeURIComponent(query);
  const t = encodeURIComponent(tag);
  return `https://www.amazon.com/s?k=${k}&tag=${t}`;
}

async function runAI() {
  const promptEl = document.getElementById("prompt");
  const resultEl = document.getElementById("result");
  const prompt = (promptEl.value || "").trim();
  if (!prompt) {
    resultEl.innerHTML = "Please enter something";
    return;
  }

  const CFG = window.GETDRESSAI_CONFIG || {};
  const url = (CFG.openaiProxyUrl || "/api/outfit").trim() || "/api/outfit";
  const model = (CFG.aiModel || "gpt-4o-mini").trim();
  const affiliateTag = CFG.amazonAffiliateTag;

  resultEl.innerHTML = "⏳ Generating...";

  const system = `You are a professional stylist.
Give short, stylish outfit + brand suggestions.

Return ONLY valid JSON (no markdown) with this shape:
{"looks":[{"title":"string","summary":"string","pieces":[{"name":"string","note":"string"}],"colors":["string"],"tips":["string"]}]}
Use each piece's "note" for brands and/or price tier. Give 2–3 looks.`;

  const body = {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Outfit request: ${prompt}` },
    ],
    temperature: 0.7,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      const msg =
        json.error?.message ||
        json.error?.details ||
        json.message ||
        res.statusText;
      throw new Error(String(msg || "Request failed"));
    }
    const raw = json.choices?.[0]?.message?.content;
    const text =
      typeof raw === "string" ? raw : raw != null ? JSON.stringify(raw) : "";
    const jsonText = extractJsonFromAssistantText(text);
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      throw new Error("Could not parse AI response as JSON.");
    }
    const looks = Array.isArray(parsed.looks) ? parsed.looks : [];
    if (!looks.length) throw new Error("No looks in response.");

    const looksHtml = looks
      .map((look) => {
        const title = escapeHtml(look.title || "Look");
        const summary = escapeHtml(look.summary || "");
        const pieces = (Array.isArray(look.pieces) ? look.pieces : [])
          .map(
            (p) =>
              `<li>${escapeHtml(p.name || "")} — <span class="text-neutral-600">${escapeHtml(p.note || "")}</span></li>`
          )
          .join("");
        return `<div class="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-left">
          <h2 class="font-semibold text-neutral-900">${title}</h2>
          <p class="mt-1 text-neutral-600">${summary}</p>
          <ul class="mt-2 list-inside list-disc text-neutral-800">${pieces}</ul>
        </div>`;
      })
      .join("");

    const amazonHref = amazonSearchUrl(prompt, affiliateTag);

    resultEl.innerHTML = `
      <div class="mb-4 text-left">${looksHtml}</div>
      <a href="${amazonHref}" target="_blank" rel="noopener noreferrer"
        class="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        🛒 Buy on Amazon
      </a>
    `;
  } catch {
    resultEl.innerHTML = "❌ Error. Try again.";
  }
}
