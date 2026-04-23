import { readPresetTemplate } from "@/lib/generation-storage";

export type GenerateOptions = {
  image?: string | null;
  imageUrl?: string | null;
  mode: "photo" | "mannequin";
  style: string;
  gender: "female" | "male" | "unisex";
  prompt: string;
  clothingRequest?: string | null;
  measurements?: Record<string, number> | null;
};

export type GenerateResult = {
  buffer: Buffer;
  contentType: string;
  extension: string;
  summary: string;
  tookMs: number;
};

type RemoteProviderResponse = {
  imageUrl?: string;
  resultUrl?: string;
  imageBase64?: string;
  resultImage?: string;
  mimeType?: string;
  contentType?: string;
  extension?: string;
  summary?: string;
  tookMs?: number;
};

function parseTimeoutMs() {
  const raw = (process.env.TRYON_SERVICE_TIMEOUT_MS || "").trim();
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 90_000;
  }
  return parsed;
}

function guessExtension(contentType: string, fallback = "png") {
  const normalized = String(contentType || "").toLowerCase();
  if (normalized.includes("jpeg")) return "jpg";
  if (normalized.includes("png")) return "png";
  if (normalized.includes("webp")) return "webp";
  if (normalized.includes("svg")) return "svg";
  return fallback;
}

function stripDataUrl(value: string) {
  const match = /^data:([^;,]+)?;base64,(.+)$/i.exec(value);
  if (!match) {
    return {
      contentType: "",
      base64: value,
    };
  }

  return {
    contentType: match[1] || "",
    base64: match[2],
  };
}

async function createRemoteTryOn(options: GenerateOptions): Promise<GenerateResult> {
  const serviceUrl = (process.env.TRYON_SERVICE_URL || "").trim().replace(/\/$/, "");
  if (!serviceUrl) {
    throw new Error("TRYON_SERVICE_URL is required for photo try-on in production.");
  }

  if (!options.imageUrl) {
    throw new Error("A signed source image URL is required for the remote try-on provider.");
  }

  const timeoutMs = parseTimeoutMs();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = new Headers({
      "Content-Type": "application/json",
    });
    const apiKey = (process.env.TRYON_SERVICE_API_KEY || "").trim();
    if (apiKey) {
      headers.set("Authorization", `Bearer ${apiKey}`);
    }

    const response = await fetch(serviceUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        mode: options.mode,
        sourceImageUrl: options.imageUrl,
        style: options.style,
        gender: options.gender,
        prompt: options.prompt,
        clothingRequest: options.clothingRequest ?? null,
        measurements: options.measurements ?? null,
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => null)) as RemoteProviderResponse | null;
    if (!response.ok || !payload) {
      throw new Error(
        payload && typeof payload.summary === "string"
          ? payload.summary
          : `Remote try-on failed with HTTP ${response.status}.`
      );
    }

    const remoteImageUrl = payload.imageUrl || payload.resultUrl || "";
    const remoteBase64 = payload.imageBase64 || payload.resultImage || "";
    const resolvedContentType = payload.contentType || payload.mimeType || "image/png";
    const resolvedSummary =
      payload.summary?.trim() || `Photo-based try-on generated for ${options.clothingRequest?.trim() || options.style}.`;
    const tookMs = Math.max(1, Number(payload.tookMs) || 0) || 0;

    if (remoteImageUrl) {
      const imageResponse = await fetch(remoteImageUrl, {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!imageResponse.ok) {
        throw new Error(`Remote try-on image download failed with HTTP ${imageResponse.status}.`);
      }

      const arrayBuffer = await imageResponse.arrayBuffer();
      const contentType = imageResponse.headers.get("content-type") || resolvedContentType;
      return {
        buffer: Buffer.from(arrayBuffer),
        contentType,
        extension: payload.extension || guessExtension(contentType, "png"),
        summary: resolvedSummary,
        tookMs: tookMs || timeoutMs,
      };
    }

    if (remoteBase64) {
      const parsed = stripDataUrl(remoteBase64);
      const contentType = parsed.contentType || resolvedContentType;
      return {
        buffer: Buffer.from(parsed.base64, "base64"),
        contentType,
        extension: payload.extension || guessExtension(contentType, "png"),
        summary: resolvedSummary,
        tookMs: tookMs || timeoutMs,
      };
    }

    throw new Error("Remote try-on provider did not return imageUrl, resultUrl, imageBase64, or resultImage.");
  } finally {
    clearTimeout(timer);
  }
}

async function createMockTryOn(options: GenerateOptions): Promise<GenerateResult> {
  const startedAt = Date.now();
  const presetTemplate = await readPresetTemplate(options.style);
  const subject = options.clothingRequest?.trim() || options.style;
  const summary =
    options.mode === "mannequin"
      ? `Virtual mannequin generated for ${subject}.`
      : `Photo-based try-on generated for ${subject}.`;

  return {
    buffer: presetTemplate,
    contentType: "image/svg+xml",
    extension: "svg",
    summary,
    tookMs: Math.max(1200, Date.now() - startedAt),
  };
}

export class AIProvider {
  async generateTryOn(options: GenerateOptions): Promise<GenerateResult> {
    if (options.mode === "photo") {
      return createRemoteTryOn(options);
    }

    return createMockTryOn(options);
  }
}

export const aiProvider = new AIProvider();
