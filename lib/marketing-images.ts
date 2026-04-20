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

const localMarketingImages = {
  heroDemo: "/examples/luxury.svg",
  before: "/examples/before.svg",
  luxury: "/examples/luxury.svg",
  streetwear: "/examples/streetwear.svg",
  wedding: "/examples/wedding.svg",
  office: "/examples/office.svg",
  gym: "/examples/gym.svg",
  anime: "/examples/anime.svg",
  celebrity: "/examples/celebrity.svg",
  casual: "/examples/casual.svg"
} as const;

function getMarketingBaseUrl() {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_PROJECT_URL).trim().replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${MARKETING_BUCKET}`;
}

function publicMarketingUrl(key: string) {
  return `${getMarketingBaseUrl()}/${key}`;
}

export const marketingImages = {
  heroDemo: process.env.NEXT_PUBLIC_USE_SUPABASE_MARKETING_ASSETS === "true" ? publicMarketingUrl(marketingImageKeys.heroDemo) : localMarketingImages.heroDemo,
  before: process.env.NEXT_PUBLIC_USE_SUPABASE_MARKETING_ASSETS === "true" ? publicMarketingUrl(marketingImageKeys.before) : localMarketingImages.before,
  luxury: process.env.NEXT_PUBLIC_USE_SUPABASE_MARKETING_ASSETS === "true" ? publicMarketingUrl(marketingImageKeys.luxury) : localMarketingImages.luxury,
  streetwear: process.env.NEXT_PUBLIC_USE_SUPABASE_MARKETING_ASSETS === "true" ? publicMarketingUrl(marketingImageKeys.streetwear) : localMarketingImages.streetwear,
  wedding: process.env.NEXT_PUBLIC_USE_SUPABASE_MARKETING_ASSETS === "true" ? publicMarketingUrl(marketingImageKeys.wedding) : localMarketingImages.wedding,
  office: process.env.NEXT_PUBLIC_USE_SUPABASE_MARKETING_ASSETS === "true" ? publicMarketingUrl(marketingImageKeys.office) : localMarketingImages.office,
  gym: process.env.NEXT_PUBLIC_USE_SUPABASE_MARKETING_ASSETS === "true" ? publicMarketingUrl(marketingImageKeys.gym) : localMarketingImages.gym,
  anime: process.env.NEXT_PUBLIC_USE_SUPABASE_MARKETING_ASSETS === "true" ? publicMarketingUrl(marketingImageKeys.anime) : localMarketingImages.anime,
  celebrity: process.env.NEXT_PUBLIC_USE_SUPABASE_MARKETING_ASSETS === "true" ? publicMarketingUrl(marketingImageKeys.celebrity) : localMarketingImages.celebrity,
  casual: process.env.NEXT_PUBLIC_USE_SUPABASE_MARKETING_ASSETS === "true" ? publicMarketingUrl(marketingImageKeys.casual) : localMarketingImages.casual
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
