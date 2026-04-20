import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSupabaseAdmin,
  createSupabaseRequestClient,
  isSupabaseAdminConfigured,
  isSupabaseAuthConfigured
} from "@/lib/supabase";
import {
  buildStoragePath,
  createSignedAssetUrl,
  createSignedAssetUrls,
  ensureGenerationBucket,
  getGenerationBucket,
  uploadGenerationAsset
} from "@/lib/generation-storage";
import { listGuestGenerations, saveGuestGeneration } from "@/lib/guest-generation-store";
import { aiProvider } from "@/lib/ai-provider";

export const runtime = "nodejs";

const bodySchema = z.object({
  mode: z.enum(["photo", "mannequin"]).default("photo"),
  gender: z.enum(["female", "male", "unisex"]).default("female"),
  prompt: z.string().min(5).max(400),
  clothingRequest: z.string().max(160).optional(),
  preferredSize: z.string().max(8).optional(),
  preset: z.string().min(2).max(80).default("Custom"),
  existingSourcePath: z.string().min(1).optional(),
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
  source_image_path: string | null;
  result_image_path: string;
  measurements: Record<string, number> | null;
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
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = await createSupabaseRequestClient(request);
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
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ items: [] });
    }

    const guestKey = request.headers.get("x-forwarded-for") || "anonymous";
    const admin = createSupabaseAdmin();
    const authResult = await requireUser(request);
    if (authResult instanceof NextResponse) {
      const guestRows = await listGuestGenerations(admin, guestKey);
      const storagePaths = guestRows.flatMap((row) => [row.resultImagePath, row.sourceImagePath].filter(Boolean) as string[]);
      const signedUrls = storagePaths.length ? await createSignedAssetUrls(admin, storagePaths) : [];
      const signedByPath = new Map<string, string>();

      storagePaths.forEach((storagePath, index) => {
        signedByPath.set(storagePath, signedUrls[index] ?? "");
      });

      return NextResponse.json({
        items: guestRows.map((row) => ({
          id: row.id,
          mode: row.mode,
          gender: row.gender,
          prompt: row.prompt,
          preset: row.preset,
          sourceUrl: row.sourceImagePath ? signedByPath.get(row.sourceImagePath) ?? "" : "",
          sourceImagePath: row.sourceImagePath,
          resultUrl: signedByPath.get(row.resultImagePath) ?? "",
          measurements: row.measurements,
          createdAt: row.createdAt,
          watermark: row.watermark,
          tookMs: row.tookMs
        }))
      });
    }

    const { data, error } = await admin
      .from("user_generations")
      .select("id, mode, gender, prompt, preset, source_image_path, result_image_path, measurements, watermark, took_ms, created_at")
      .eq("user_id", authResult.id)
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as HistoryRow[];
    const storagePaths = rows.flatMap((row) => [row.result_image_path, row.source_image_path].filter(Boolean) as string[]);
    const signedUrls = storagePaths.length ? await createSignedAssetUrls(admin, storagePaths) : [];
    const signedByPath = new Map<string, string>();

    storagePaths.forEach((storagePath, index) => {
      signedByPath.set(storagePath, signedUrls[index] ?? "");
    });

    return NextResponse.json({
      items: rows.map((row) => ({
        id: row.id,
        mode: row.mode,
        gender: row.gender,
        prompt: row.prompt,
        preset: row.preset,
        sourceUrl: row.source_image_path ? signedByPath.get(row.source_image_path) ?? "" : "",
        sourceImagePath: row.source_image_path,
        resultUrl: signedByPath.get(row.result_image_path) ?? "",
        measurements: row.measurements,
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
    const guestUserId = "guest-user";
    const guestKey = request.headers.get("x-forwarded-for") || "anonymous";
    if (!checkRateLimit(`guest:${guestKey}`)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const generationOwnerId = guestUserId;
    const isGuest = true;

    const formData = await request.formData();
    const parsed = bodySchema.parse({
      mode: formData.get("mode"),
      gender: formData.get("gender"),
      prompt: formData.get("prompt"),
      clothingRequest: formData.get("clothingRequest"),
      preferredSize: formData.get("preferredSize"),
      preset: formData.get("preset"),
      existingSourcePath: formData.get("existingSourcePath"),
      measurements: parseMeasurements(formData.get("measurements"))
    });

    const photo = formData.get("file");
    let sourceImagePath: string | null = null;

    if (photo instanceof File) {
      const extension = photo.name.split(".").pop() || "jpg";
      sourceImagePath = buildStoragePath(generationOwnerId, "uploads", photo.name, extension);
      const sourceBuffer = Buffer.from(await photo.arrayBuffer());

      if (!isSupabaseAdminConfigured()) {
        return NextResponse.json({ error: "Photo uploads require Supabase storage configuration." }, { status: 503 });
      }

      const admin = createSupabaseAdmin();
      await ensureGenerationBucket(admin);
      await uploadGenerationAsset(admin, sourceImagePath, sourceBuffer, photo.type || "application/octet-stream");
    } else if (parsed.mode === "photo" && parsed.existingSourcePath?.startsWith(`${generationOwnerId}/uploads/`)) {
      sourceImagePath = parsed.existingSourcePath;
    } else if (parsed.mode === "photo") {
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

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Image generation storage is not configured yet." }, { status: 503 });
    }

    const admin = createSupabaseAdmin();
    await ensureGenerationBucket(admin);

    const generation = await aiProvider.generateTryOn({
      image: sourceImagePath,
      mode: parsed.mode,
      style: parsed.preset,
      gender: parsed.gender,
      prompt: parsed.prompt,
      clothingRequest: [parsed.clothingRequest, parsed.preferredSize].filter(Boolean).join(" | size: ") || null,
      measurements: parsed.measurements ?? null
    });

    const resultImagePath = buildStoragePath(generationOwnerId, "results", parsed.preset, generation.extension);
    await uploadGenerationAsset(admin, resultImagePath, generation.buffer, generation.contentType);

    let inserted: { id: string; created_at: string } = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };

    await saveGuestGeneration(admin, guestKey, {
      id: inserted.id,
      mode: parsed.mode,
      gender: parsed.gender,
      prompt: parsed.prompt,
      preset: parsed.preset,
      sourceImagePath,
      resultImagePath,
      measurements: parsed.measurements ?? null,
      watermark: true,
      tookMs: generation.tookMs,
      createdAt: inserted.created_at
    });

    const resultUrl = await createSignedAssetUrl(admin, resultImagePath);
    const sourceUrl = sourceImagePath ? await createSignedAssetUrl(admin, sourceImagePath) : "";

    return NextResponse.json({
      id: inserted.id,
      createdAt: inserted.created_at,
      mode: parsed.mode,
      gender: parsed.gender,
      prompt: parsed.prompt,
      preset: parsed.preset,
      sourceUrl,
      sourceImagePath,
      resultUrl,
      summary: generation.summary,
      measurements: parsed.measurements ?? null,
      watermark: isGuest,
      guest: isGuest,
      tookMs: generation.tookMs
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed." },
      { status: 400 }
    );
  }
}
