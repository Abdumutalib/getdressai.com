import { readPresetTemplate } from "@/lib/generation-storage";

export type GenerateOptions = {
  image?: string | null;
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

export class AIProvider {
  async generateTryOn(options: GenerateOptions): Promise<GenerateResult> {
    const startedAt = Date.now();

    // Mock provider for now. Later this class can call Replicate / Fal.ai
    // without changing the API route contract.
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
      tookMs: Math.max(1200, Date.now() - startedAt)
    };
  }
}

export const aiProvider = new AIProvider();
