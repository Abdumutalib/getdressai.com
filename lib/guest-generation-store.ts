import type { SupabaseClient } from "@supabase/supabase-js";

export type GuestGenerationRecord = {
  id: string;
  mode: "photo" | "mannequin";
  gender: "female" | "male" | "unisex";
  prompt: string;
  preset: string;
  sourceImagePath: string | null;
  resultImagePath: string;
  measurements: Record<string, number> | null;
  watermark: boolean;
  tookMs: number;
  createdAt: string;
};

type GuestGenerationRow = {
  id: string;
  guest_key: string;
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

const TABLE_NAME = "guest_generations";

export async function saveGuestGeneration(
  admin: SupabaseClient,
  guestKey: string,
  item: GuestGenerationRecord
) {
  const { error } = await admin.from(TABLE_NAME).insert({
    id: item.id,
    guest_key: guestKey,
    mode: item.mode,
    gender: item.gender,
    prompt: item.prompt,
    preset: item.preset,
    source_image_path: item.sourceImagePath,
    result_image_path: item.resultImagePath,
    measurements: item.measurements,
    watermark: item.watermark,
    took_ms: item.tookMs,
    created_at: item.createdAt
  });

  if (error) {
    throw error;
  }
}

export async function listGuestGenerations(admin: SupabaseClient, guestKey: string, limit = 12) {
  const { data, error } = await admin
    .from(TABLE_NAME)
    .select("id, guest_key, mode, gender, prompt, preset, source_image_path, result_image_path, measurements, watermark, took_ms, created_at")
    .eq("guest_key", guestKey)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return ((data ?? []) as GuestGenerationRow[]).map((row) => ({
    id: row.id,
    mode: row.mode,
    gender: row.gender,
    prompt: row.prompt,
    preset: row.preset,
    sourceImagePath: row.source_image_path,
    resultImagePath: row.result_image_path,
    measurements: row.measurements,
    watermark: row.watermark,
    tookMs: row.took_ms,
    createdAt: row.created_at
  }));
}
