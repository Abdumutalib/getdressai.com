type RecommendationSource = "amazon" | "ebay" | "aliexpress";

export type MarketplaceRecommendation = {
  id: string;
  title: string;
  marketplace: RecommendationSource;
  price: number;
  currency: string;
  image: string;
  affiliateUrl: string;
  totalFitScore: number;
  recommendedSize: string;
};

const fallbackImages: Record<string, string> = {
  luxury: "/examples/luxury.svg",
  streetwear: "/examples/streetwear.svg",
  wedding: "/examples/wedding.svg",
  office: "/examples/office.svg",
  gym: "/examples/gym.svg",
  anime: "/examples/anime.svg",
  celebrity: "/examples/celebrity.svg",
  casual: "/examples/casual.svg"
};

export function inferRecommendedSize({
  gender,
  chest,
  waist,
  hips
}: {
  gender: "female" | "male" | "unisex";
  chest: number;
  waist: number;
  hips: number;
}) {
  const dominant = Math.max(chest, waist, hips);

  if (gender === "male") {
    if (dominant < 90) return "S";
    if (dominant < 98) return "M";
    if (dominant < 106) return "L";
    if (dominant < 114) return "XL";
    return "XXL";
  }

  if (dominant < 86) return "XS";
  if (dominant < 94) return "S";
  if (dominant < 102) return "M";
  if (dominant < 110) return "L";
  if (dominant < 118) return "XL";
  return "XXL";
}

function buildSearchUrl(marketplace: RecommendationSource, query: string) {
  const encoded = encodeURIComponent(query);

  if (marketplace === "amazon") {
    return `https://www.amazon.com/s?k=${encoded}`;
  }

  if (marketplace === "ebay") {
    return `https://www.ebay.com/sch/i.html?_nkw=${encoded}`;
  }

  return `https://www.aliexpress.com/wholesale?SearchText=${encoded}`;
}

export function buildFallbackRecommendations({
  preset,
  prompt,
  recommendedSize
}: {
  preset: string;
  prompt: string;
  recommendedSize: string;
}) {
  const slug = preset.toLowerCase().replace(/[^a-z0-9]+/g, "") || "luxury";
  const image = fallbackImages[slug] || fallbackImages.luxury;
  const keywords = `${preset} ${prompt}`.trim();

  const products = [
    { marketplace: "amazon" as const, title: `${preset} look set`, price: 79 },
    { marketplace: "ebay" as const, title: `${preset} style outfit`, price: 64 },
    { marketplace: "aliexpress" as const, title: `${preset} fashion match`, price: 42 }
  ];

  return products.map((product, index) => ({
    id: `${product.marketplace}-${slug}-${index}`,
    title: product.title,
    marketplace: product.marketplace,
    price: product.price,
    currency: "USD",
    image,
    affiliateUrl: buildSearchUrl(product.marketplace, `${keywords} size ${recommendedSize}`),
    totalFitScore: 88 - index * 6,
    recommendedSize
  }));
}
