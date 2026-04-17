import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  prompt: z.string().min(5).max(400),
  preset: z.string().min(2).max(80).optional(),
  imagePath: z.string().min(1).optional()
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

    return NextResponse.json({
      prompt: body.prompt,
      preset: body.preset || "Custom",
      resultUrl: "/examples/luxury.svg",
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
