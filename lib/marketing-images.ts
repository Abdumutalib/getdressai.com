const SUPABASE_PROJECT_URL = "https://rmsluskirebmjxbnebyu.supabase.co";
const MARKETING_BUCKET = "marketing-assets";

export const marketingImageKeys = {
  heroDemo: "hero-demo.png",
  before: "before.png",
  luxury: "luxury.jpg",
  streetwear: "streetwear.jpg",
  wedding: "wedding.jpg",
  office: "office.jpg",
  gym: "gym.jpg",
  anime: "anime.jpg",
  celebrity: "celebrity.jpg",
  casual: "casual.jpg"
} as const;

function getMarketingBaseUrl() {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_PROJECT_URL).trim().replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${MARKETING_BUCKET}`;
}

function publicMarketingUrl(key: string) {
  return `${getMarketingBaseUrl()}/${key}`;
}

export const marketingImages = {
  heroDemo: publicMarketingUrl(marketingImageKeys.heroDemo),
  before: publicMarketingUrl(marketingImageKeys.before),
  luxury: publicMarketingUrl(marketingImageKeys.luxury),
  streetwear: publicMarketingUrl(marketingImageKeys.streetwear),
  wedding: publicMarketingUrl(marketingImageKeys.wedding),
  office: publicMarketingUrl(marketingImageKeys.office),
  gym: publicMarketingUrl(marketingImageKeys.gym),
  anime: publicMarketingUrl(marketingImageKeys.anime),
  celebrity: publicMarketingUrl(marketingImageKeys.celebrity),
  casual: publicMarketingUrl(marketingImageKeys.casual)
} as const;

export function getPresetMarketingImage(slug: string) {
  switch (slug) {
    case "luxury":
      return marketingImages.luxury;
    case "streetwear":
      return marketingImages.streetwear;
    case "wedding":
      return marketingImages.wedding;
    case "office":
      return marketingImages.office;
    case "gym":
      return marketingImages.gym;
    case "anime":
      return marketingImages.anime;
    case "celebrity":
      return marketingImages.celebrity;
    case "casual":
      return marketingImages.casual;
    default:
      return marketingImages.luxury;
  }
}
