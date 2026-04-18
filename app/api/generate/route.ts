import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin, createSupabaseServerClient } from "@/lib/supabase";
import {
  buildStoragePath,
  createSignedAssetUrl,
  createSignedAssetUrls,
  ensureGenerationBucket,
  getGenerationBucket,
  readPresetTemplate,
  uploadGenerationAsset
} from "@/lib/generation-storage";

export const runtime = "nodejs";

const bodySchema = z.object({
  mode: z.enum(["photo", "mannequin"]).default("photo"),
  gender: z.enum(["female", "male", "unisex"]).default("female"),
  prompt: z.string().min(5).max(400),
  preset: z.string().min(2).max(80).default("Custom"),
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

type HistoryRow = {
  id: string;
  mode: "photo" | "mannequin";
  gender: "female" | "male" | "unisex";
  prompt: string;
  preset: string;
  result_image_path: string;
  watermark: boolean;
  took_ms: number;
  created_at: string;
};

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

function parseMeasurements(raw: FormDataEntryValue | null) {
  if (!raw || typeof raw !== "string") {
    return undefined;
  }

  try {
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return undefined;
  }
}

async function requireUser(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  if (!checkRateLimit(`${user.id}:${ip}`)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  return user;
}

export async function GET(request: Request) {
  try {
    const authResult = await requireUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const admin = createSupabaseAdmin();
    const { data, error } = await admin
      .from("user_generations")
      .select("id, mode, gender, prompt, preset, result_image_path, watermark, took_ms, created_at")
      .eq("user_id", authResult.id)
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as HistoryRow[];
    const signedUrls = await createSignedAssetUrls(
      admin,
      rows.map((row) => row.result_image_path)
    );

    return NextResponse.json({
      items: rows.map((row, index) => ({
        id: row.id,
        mode: row.mode,
        gender: row.gender,
        prompt: row.prompt,
        preset: row.preset,
        resultUrl: signedUrls[index] ?? "",
        createdAt: row.created_at,
        watermark: row.watermark,
        tookMs: row.took_ms
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load generations." },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const formData = await request.formData();
    const parsed = bodySchema.parse({
      mode: formData.get("mode"),
      gender: formData.get("gender"),
      prompt: formData.get("prompt"),
      preset: formData.get("preset"),
      measurements: parseMeasurements(formData.get("measurements"))
    });

    const photo = formData.get("file");
    if (parsed.mode === "photo" && !(photo instanceof File)) {
      return NextResponse.json({ error: "Please upload a photo first." }, { status: 400 });
    }

    if (parsed.mode === "mannequin") {
      const mannequinMeasurements = parsed.measurements ?? {};
      const requiredKeys = ["height", "chest", "waist", "hips"] as const;
      const hasAllRequired = requiredKeys.every((key) => typeof mannequinMeasurements[key] === "number");

      if (!hasAllRequired) {
        return NextResponse.json({ error: "Measurements are required for mannequin mode." }, { status: 400 });
      }
    }

    const admin = createSupabaseAdmin();
    await ensureGenerationBucket(admin);

    let sourceImagePath: string | null = null;
    if (photo instanceof File) {
      const extension = photo.name.split(".").pop() || "jpg";
      sourceImagePath = buildStoragePath(authResult.id, "uploads", photo.name, extension);
      const sourceBuffer = Buffer.from(await photo.arrayBuffer());
      await uploadGenerationAsset(admin, sourceImagePath, sourceBuffer, photo.type || "application/octet-stream");
    }

    const presetTemplate = await readPresetTemplate(parsed.preset);
    const resultImagePath = buildStoragePath(authResult.id, "results", parsed.preset, "svg");
    await uploadGenerationAsset(admin, resultImagePath, presetTemplate, "image/svg+xml");

    const { data: inserted, error: insertError } = await admin
      .from("user_generations")
      .insert({
        user_id: authResult.id,
        mode: parsed.mode,
        gender: parsed.gender,
        prompt: parsed.prompt,
        preset: parsed.preset,
        source_bucket: getGenerationBucket(),
        source_image_path: sourceImagePath,
        result_bucket: getGenerationBucket(),
        result_image_path: resultImagePath,
        measurements: parsed.measurements ?? null,
        watermark: true,
        took_ms: 12130
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      throw insertError;
    }

    const resultUrl = await createSignedAssetUrl(admin, resultImagePath);

    return NextResponse.json({
      id: inserted.id,
      createdAt: inserted.created_at,
      mode: parsed.mode,
      gender: parsed.gender,
      prompt: parsed.prompt,
      preset: parsed.preset,
      resultUrl,
      summary:
        parsed.mode === "mannequin"
          ? "Virtual mannequin generated from your saved size profile."
          : "Photo-based try-on generated from your uploaded image.",
      measurements: parsed.measurements ?? null,
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
