import type { SupabaseClient } from "@supabase/supabase-js";

export type GeneratorMode = "photo" | "mannequin";
export type GenderOption = "female" | "male" | "unisex";

export type StoredMeasurements = {
  height?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  inseam?: number;
} | null;

export type UserGeneratorPreferencesRow = {
  user_id: string;
  mode: GeneratorMode;
  gender: GenderOption;
  preset: string;
  prompt: string;
  clothing_request: string | null;
  measurements: StoredMeasurements;
  source_image_path: string | null;
  updated_at: string;
};

export async function getUserGeneratorPreferences(admin: SupabaseClient, userId: string) {
  const { data, error } = await admin
    .from("user_generator_preferences")
    .select("user_id, mode, gender, preset, prompt, clothing_request, measurements, source_image_path, updated_at")
    .eq("user_id", userId)
    .maybeSingle<UserGeneratorPreferencesRow>();

  if (error) {
    throw error;
  }

  return data;
}

export async function upsertUserGeneratorPreferences(
  admin: SupabaseClient,
  userId: string,
  values: {
    mode?: GeneratorMode;
    gender?: GenderOption;
    preset?: string;
    prompt?: string;
    clothingRequest?: string | null;
    measurements?: StoredMeasurements;
    sourceImagePath?: string | null;
  }
) {
  const payload = {
    user_id: userId,
    mode: values.mode ?? "photo",
    gender: values.gender ?? "female",
    preset: values.preset ?? "Luxury",
    prompt: values.prompt ?? "A polished editorial outfit with realistic fabric detail",
    clothing_request: values.clothingRequest ?? null,
    measurements: values.measurements ?? null,
    source_image_path: values.sourceImagePath ?? null,
    updated_at: new Date().toISOString()
  };

  const { error } = await admin.from("user_generator_preferences").upsert(payload, {
    onConflict: "user_id"
  });

  if (error) {
    throw error;
  }

  return payload;
}
