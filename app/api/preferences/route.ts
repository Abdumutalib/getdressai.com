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
  ensureGenerationBucket,
  uploadGenerationAsset
} from "@/lib/generation-storage";
import {
  getUserGeneratorPreferences,
  upsertUserGeneratorPreferences
} from "@/lib/user-preferences";

export const runtime = "nodejs";

const jsonSchema = z.object({
  mode: z.enum(["photo", "mannequin"]).default("photo"),
  gender: z.enum(["female", "male", "unisex"]).default("female"),
  preset: z.string().min(2).max(80).default("Luxury"),
  prompt: z.string().min(5).max(400).default("A polished editorial outfit with realistic fabric detail"),
  clothingRequest: z.string().max(160).nullable().optional(),
  sourceImagePath: z.string().nullable().optional(),
  measurements: z
    .object({
      height: z.coerce.number().min(120).max(230).optional(),
      chest: z.coerce.number().min(60).max(180).optional(),
      waist: z.coerce.number().min(45).max(160).optional(),
      hips: z.coerce.number().min(65).max(190).optional(),
      inseam: z.coerce.number().min(50).max(120).optional()
    })
    .partial()
    .nullable()
    .optional()
});

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

  return user;
}

export async function GET(request: Request) {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ item: null });
    }

    const authResult = await requireUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const admin = createSupabaseAdmin();
    const row = await getUserGeneratorPreferences(admin, authResult.id);

    if (!row) {
      return NextResponse.json({ item: null });
    }

    const sourceUrl = row.source_image_path ? await createSignedAssetUrl(admin, row.source_image_path) : "";
    return NextResponse.json({
      item: {
        mode: row.mode,
        gender: row.gender,
        preset: row.preset,
        prompt: row.prompt,
        clothingRequest: row.clothing_request ?? "",
        measurements: row.measurements,
        sourceImagePath: row.source_image_path,
        sourceUrl,
        updatedAt: row.updated_at
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load preferences." },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Preferences storage is not configured yet." }, { status: 503 });
    }

    const authResult = await requireUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const parsed = jsonSchema.parse(await request.json());
    const sourceImagePath =
      parsed.sourceImagePath && parsed.sourceImagePath.startsWith(`${authResult.id}/uploads/`)
        ? parsed.sourceImagePath
        : null;

    const admin = createSupabaseAdmin();
    await upsertUserGeneratorPreferences(admin, authResult.id, {
      mode: parsed.mode,
      gender: parsed.gender,
      preset: parsed.preset,
      prompt: parsed.prompt,
      clothingRequest: parsed.clothingRequest ?? null,
      sourceImagePath,
      measurements: parsed.measurements ?? null
    });

    const sourceUrl = sourceImagePath ? await createSignedAssetUrl(admin, sourceImagePath) : "";
    return NextResponse.json({
      item: {
        mode: parsed.mode,
        gender: parsed.gender,
        preset: parsed.preset,
        prompt: parsed.prompt,
        clothingRequest: parsed.clothingRequest ?? "",
        measurements: parsed.measurements ?? null,
        sourceImagePath,
        sourceUrl
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save preferences." },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: "Photo uploads require Supabase storage configuration." }, { status: 503 });
    }

    const authResult = await requireUser(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const formData = await request.formData();
    const photo = formData.get("file");

    if (!(photo instanceof File)) {
      return NextResponse.json({ error: "Photo is required." }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(photo.type) || photo.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Unsupported image format or size." }, { status: 400 });
    }

    const extension = photo.name.split(".").pop() || "jpg";
    const storagePath = buildStoragePath(authResult.id, "uploads", photo.name, extension);
    const sourceBuffer = Buffer.from(await photo.arrayBuffer());

    const admin = createSupabaseAdmin();
    await ensureGenerationBucket(admin);
    await uploadGenerationAsset(admin, storagePath, sourceBuffer, photo.type || "application/octet-stream");

    const current = await getUserGeneratorPreferences(admin, authResult.id);
    await upsertUserGeneratorPreferences(admin, authResult.id, {
      mode: current?.mode ?? "photo",
      gender: current?.gender ?? "female",
      preset: current?.preset ?? "Luxury",
      prompt: current?.prompt ?? "A polished editorial outfit with realistic fabric detail",
      clothingRequest: current?.clothing_request ?? null,
      measurements: current?.measurements ?? null,
      sourceImagePath: storagePath
    });

    return NextResponse.json({
      sourceImagePath: storagePath,
      sourceUrl: await createSignedAssetUrl(admin, storagePath)
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save uploaded photo." },
      { status: 400 }
    );
  }
}
