import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase";
import {
  buildFallbackRecommendations,
  inferRecommendedSize,
  type MarketplaceRecommendation
} from "@/lib/marketplace-recommendations";

const schema = z.object({
  prompt: z.string().min(3).max(400),
  preset: z.string().min(2).max(80),
  clothingRequest: z.string().max(160).optional(),
  gender: z.enum(["female", "male", "unisex"]),
  sourceImagePath: z.string().min(1),
  measurements: z.object({
    height: z.coerce.number().min(120).max(230),
    chest: z.coerce.number().min(60).max(180),
    waist: z.coerce.number().min(45).max(160),
    hips: z.coerce.number().min(65).max(190),
    inseam: z.coerce.number().min(50).max(120).optional()
  })
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = schema.parse(await request.json());
    if (!body.sourceImagePath.startsWith(`${user.id}/uploads/`)) {
      return NextResponse.json({ error: "This photo does not belong to the current user." }, { status: 403 });
    }

    const recommendedSize = inferRecommendedSize({
      gender: body.gender,
      chest: body.measurements.chest,
      waist: body.measurements.waist,
      hips: body.measurements.hips
    });

    const requestBody = {
      keywords: `${body.preset} ${body.prompt}`.trim(),
      clothingRequest: body.clothingRequest?.trim() || body.preset,
      style: body.preset,
      size: recommendedSize,
      measurements: {
        ...body.measurements,
        recommendedSize
      },
      sources: ["amazon", "ebay", "aliexpress"],
      limitPerMarketplace: 8
    };

    const apiBase = (
      process.env.MARKETPLACE_API_URL ||
      process.env.DRESSAI_API_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      ""
    )
      .trim()
      .replace(/\/$/, "");

    let products: MarketplaceRecommendation[] = [];
    let source = "fallback";

    if (apiBase) {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        const apiKey = (process.env.MARKETPLACE_API_KEY || process.env.MARKETPLACE_UPSTREAM_API_KEY || "").trim();
        if (apiKey) {
          headers.Authorization = `Bearer ${apiKey}`;
        }

        const response = await fetch(`${apiBase}/v1/hybrid-marketplace-search`, {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody),
          cache: "no-store"
        });

        const data = (await response.json()) as {
          products?: Array<{
            sourceId?: string;
            title?: string;
            marketplace?: "amazon" | "ebay" | "aliexpress";
            price?: number | null;
            currency?: string;
            image?: string;
            affiliateUrl?: string;
            totalFitScore?: number;
          }>;
        };

        if (response.ok && Array.isArray(data.products) && data.products.length) {
          products = data.products.slice(0, 8).map((product, index) => ({
            id: product.sourceId || `${product.marketplace || "market"}-${index}`,
            title: product.title || `${body.preset} match`,
            marketplace: product.marketplace || "amazon",
            price: Number(product.price ?? 0),
            currency: product.currency || "USD",
            image: product.image || "/examples/luxury.svg",
            affiliateUrl: product.affiliateUrl || "#",
            totalFitScore: Number(product.totalFitScore ?? 82),
            recommendedSize
          }));
          source = "marketplace";
        }
      } catch {
        source = "fallback";
      }
    }

    if (!products.length) {
      products = buildFallbackRecommendations({
        preset: body.preset,
        prompt: body.prompt,
        clothingRequest: body.clothingRequest,
        recommendedSize
      });
    }

    return NextResponse.json({
      recommendedSize,
      source,
      products
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load recommendations." },
      { status: 400 }
    );
  }
}
