import { promises as fs } from "fs";
import path from "path";
import type { SupabaseClient } from "@supabase/supabase-js";

const GENERATIONS_BUCKET = "user-generations";

let bucketReady: Promise<void> | null = null;

function sanitizeSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "look";
}

export function getGenerationBucket() {
  return GENERATIONS_BUCKET;
}

export function buildStoragePath(userId: string, kind: "uploads" | "results", name: string, extension: string) {
  const cleanName = sanitizeSegment(name);
  const cleanExtension = extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
  return `${userId}/${kind}/${Date.now()}-${cleanName}.${cleanExtension}`;
}

export async function ensureGenerationBucket(admin: SupabaseClient) {
  if (!bucketReady) {
    bucketReady = (async () => {
      const { error } = await admin.storage.createBucket(GENERATIONS_BUCKET, {
        public: false,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]
      });

      if (error && !error.message.toLowerCase().includes("already")) {
        throw error;
      }
    })().catch((error) => {
      bucketReady = null;
      throw error;
    });
  }

  await bucketReady;
}

export async function uploadGenerationAsset(
  admin: SupabaseClient,
  storagePath: string,
  body: ArrayBuffer | Buffer,
  contentType: string
) {
  const { error } = await admin.storage.from(GENERATIONS_BUCKET).upload(storagePath, body, {
    contentType,
    upsert: false
  });

  if (error) {
    throw error;
  }
}

export async function createSignedAssetUrl(admin: SupabaseClient, storagePath: string, expiresIn = 60 * 60) {
  const { data, error } = await admin.storage.from(GENERATIONS_BUCKET).createSignedUrl(storagePath, expiresIn);

  if (error || !data?.signedUrl) {
    throw error ?? new Error("Could not create a signed URL.");
  }

  return data.signedUrl;
}

export async function createSignedAssetUrls(admin: SupabaseClient, storagePaths: string[], expiresIn = 60 * 60) {
  if (!storagePaths.length) {
    return [];
  }

  const { data, error } = await admin.storage.from(GENERATIONS_BUCKET).createSignedUrls(storagePaths, expiresIn);

  if (error) {
    throw error;
  }

  return data.map((item) => item.signedUrl);
}

export async function readPresetTemplate(preset: string) {
  const templateName = sanitizeSegment(preset);
  const preferredPath = path.join(process.cwd(), "public", "examples", `${templateName}.svg`);
  const fallbackPath = path.join(process.cwd(), "public", "examples", "luxury.svg");

  try {
    return await fs.readFile(preferredPath);
  } catch {
    return fs.readFile(fallbackPath);
  }
}
