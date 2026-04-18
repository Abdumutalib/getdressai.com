type IntentPart = {
  label: string;
  synonyms: string[];
};

export type ClothingIntent = {
  original: string;
  cleaned: string;
  category?: string;
  occasion?: string;
  color?: string;
  material?: string;
  keywords: string[];
  marketplaceQuery: string;
};

const categories: IntentPart[] = [
  { label: "pajama set", synonyms: ["pajama", "pyjama", "пижама", "пижам", "uyqu kiyimi"] },
  { label: "beach set", synonyms: ["beach set", "пляжный набор", "пляж", "swimwear", "plyaj"] },
  { label: "evening dress", synonyms: ["evening dress", "вечернее платье", "вечерний образ", "kechki ko'ylak"] },
  { label: "airport look", synonyms: ["airport look", "travel outfit", "дорожный образ", "sayohat looki"] },
  { label: "office outfit", synonyms: ["office outfit", "office look", "офисный образ", "ofis looki"] },
  { label: "wedding guest dress", synonyms: ["wedding guest", "свадебный образ", "to'y libosi"] },
  { label: "hoodie set", synonyms: ["hoodie", "худи", "tolstovka", "svitshot"] },
  { label: "dress", synonyms: ["dress", "платье", "ko'ylak"] },
  { label: "suit", synonyms: ["suit", "костюм", "kostyum"] },
  { label: "lingerie set", synonyms: ["lingerie", "белье", "ichki kiyim"] }
];

const occasions: IntentPart[] = [
  { label: "beach", synonyms: ["beach", "пляж", "plyaj"] },
  { label: "sleep", synonyms: ["sleep", "night", "сон", "uyqu"] },
  { label: "party", synonyms: ["party", "вечеринка", "partyga"] },
  { label: "office", synonyms: ["office", "офис", "ish"] },
  { label: "travel", synonyms: ["travel", "trip", "дорожный", "sayohat"] },
  { label: "wedding", synonyms: ["wedding", "свадеб", "to'y"] }
];

const colors: IntentPart[] = [
  { label: "black", synonyms: ["black", "черный", "qora"] },
  { label: "white", synonyms: ["white", "белый", "oq"] },
  { label: "red", synonyms: ["red", "красный", "qizil"] },
  { label: "blue", synonyms: ["blue", "синий", "ko'k"] },
  { label: "pink", synonyms: ["pink", "розовый", "pushti"] },
  { label: "green", synonyms: ["green", "зеленый", "yashil"] },
  { label: "beige", synonyms: ["beige", "бежевый", "bej"] }
];

const materials: IntentPart[] = [
  { label: "silk", synonyms: ["silk", "шелк", "ipak"] },
  { label: "linen", synonyms: ["linen", "лен", "zig'ir"] },
  { label: "cotton", synonyms: ["cotton", "хлопок", "paxta"] },
  { label: "satin", synonyms: ["satin", "сатин"] },
  { label: "denim", synonyms: ["denim", "джинс", "jins"] }
];

function findBestMatch(text: string, parts: IntentPart[]) {
  for (const part of parts) {
    if (part.synonyms.some((synonym) => text.includes(synonym))) {
      return part.label;
    }
  }
  return undefined;
}

export function parseClothingIntent(input: string, fallbackPreset: string) {
  const cleaned = input.trim().toLowerCase();
  const base = cleaned || fallbackPreset.toLowerCase();
  const category = findBestMatch(base, categories) || fallbackPreset.toLowerCase();
  const occasion = findBestMatch(base, occasions);
  const color = findBestMatch(base, colors);
  const material = findBestMatch(base, materials);

  const keywords = [category, occasion, color, material].filter(Boolean) as string[];
  const marketplaceQuery = [color, material, category, occasion].filter(Boolean).join(" ").trim() || base;

  return {
    original: input,
    cleaned: base,
    category,
    occasion,
    color,
    material,
    keywords,
    marketplaceQuery
  } satisfies ClothingIntent;
}
