/**
 * dressai-api POST /v1/hybrid-vton → HYBRID_VTON_SERVICE_URL (GPU getdressai).
 */

const SAMPLE_GARMENT = {
  url: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?w=400",
  type: "upper" as const,
};

function getApiBase(): string {
  const u = process.env.EXPO_PUBLIC_API_URL;
  if (!u || !String(u).trim()) {
    throw new Error("Set EXPO_PUBLIC_API_URL in .env (e.g. http://192.168.x.x:3000)");
  }
  return String(u).replace(/\/$/, "");
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function fetchGarmentBase64(url: string): Promise<string> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Garment image ${r.status}`);
  const buf = await r.arrayBuffer();
  return arrayBufferToBase64(buf);
}

export type HybridVtonResponse = {
  success: boolean;
  resultImage?: string;
  layers?: Array<{ type: string; kind?: string; result: string }>;
  metadata?: { garmentsProcessed?: number; accessoriesProcessed?: number; cacheUsed?: boolean };
  error?: string;
};

export async function postHybridVton(params: {
  personBase64: string;
  garmentBase64: string;
  garmentType: "upper" | "lower" | "dress";
}): Promise<HybridVtonResponse> {
  const url = `${getApiBase()}/v1/hybrid-vton`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      personImageBase64: params.personBase64,
      garments: [{ image: params.garmentBase64, type: params.garmentType }],
      accessories: [],
      useFastCache: true,
    }),
  });
  const data = (await r.json()) as HybridVtonResponse;
  if (!r.ok || !data.success) {
    throw new Error(data.error || `HTTP ${r.status}`);
  }
  return data;
}

export function getSampleGarment() {
  return { ...SAMPLE_GARMENT };
}
