import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const sourceDir = process.argv[2] || "C:\\Users\\DELCOM\\Desktop\\atelier-ai";
const bucket = "marketing-assets";

const uploads = [
  { source: "14.png", target: "hero-demo.png", contentType: "image/png" },
  { source: "1.png", target: "before.png", contentType: "image/png" },
  { source: "95.jpg", target: "luxury.jpg", contentType: "image/jpeg" },
  { source: "стрит1.jpg", target: "streetwear.jpg", contentType: "image/jpeg" },
  { source: "153.jpg", target: "wedding.jpg", contentType: "image/jpeg" },
  { source: "101.jpg", target: "office.jpg", contentType: "image/jpeg" },
  { source: "61.jpg", target: "gym.jpg", contentType: "image/jpeg" },
  { source: "130.jpg", target: "anime.jpg", contentType: "image/jpeg" },
  { source: "170.jpg", target: "celebrity.jpg", contentType: "image/jpeg" },
  { source: "21.jpg", target: "casual.jpg", contentType: "image/jpeg" }
];

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function ensureBucket() {
  const { error } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"]
  });

  if (error && !error.message.toLowerCase().includes("already")) {
    throw error;
  }

  const { error: updateError } = await supabase.storage.updateBucket(bucket, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"]
  });

  if (updateError) {
    throw updateError;
  }
}

async function main() {
  await ensureBucket();

  for (const item of uploads) {
    const filePath = path.join(sourceDir, item.source);
    const buffer = await readFile(filePath);
    const { error } = await supabase.storage.from(bucket).upload(item.target, buffer, {
      contentType: item.contentType,
      upsert: true
    });

    if (error) {
      throw error;
    }

    console.log(`Uploaded ${item.source} -> ${item.target}`);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
