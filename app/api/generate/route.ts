import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  mode: z.enum(["photo", "mannequin"]).default("photo"),
  prompt: z.string().min(5).max(400),
  preset: z.string().min(2).max(80).optional(),
  imagePath: z.string().min(1).optional(),
  measurements: z
    .object({
      height: z.coerce.number().min(120).max(230),
      chest: z.coerce.number().min(60).max(180),
      waist: z.coerce.number().min(45).max(160),
      hips: z.coerce.number().min(65).max(190),
      inseam: z.coerce.number().min(50).max(120)
    })
    .partial()
    .optional()
});

const buckets = new Map<string, { count: number; start: number }>();

function checkRateLimit(key: string) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || now - current.start > 60_000) {
    buckets.set(key, { count: 1, start: now });
    return true;
  }
  if (current.count >= 10) {
    return false;
  }
  current.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const body = requestSchema.parse(await request.json());

    if (body.mode === "mannequin") {
      const mannequinMeasurements = body.measurements ?? {};
      const requiredKeys = ["height", "chest", "waist", "hips"] as const;
      const hasAllRequired = requiredKeys.every((key) => typeof mannequinMeasurements[key] === "number");

      if (!hasAllRequired) {
        return NextResponse.json({ error: "Measurements are required for mannequin mode." }, { status: 400 });
      }
    }

    return NextResponse.json({
      mode: body.mode,
      prompt: body.prompt,
      preset: body.preset || "Custom",
      resultUrl: body.mode === "mannequin" ? "/examples/office.svg" : "/examples/luxury.svg",
      summary:
        body.mode === "mannequin"
          ? "Virtual mannequin generated from provided measurements."
          : "Photo-based try-on generated from your uploaded image.",
      measurements: body.measurements ?? null,
      watermark: true,
      tookMs: 12130
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed." },
      { status: 400 }
    );
  }
}
