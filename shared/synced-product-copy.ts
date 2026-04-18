export const syncedProductCopy = {
  en: {
    workflowEyebrow: "Pro workflow",
    workflowCopy: "Generate, track, and monetize every look.",
    presets: ["Luxury", "Streetwear", "Wedding", "Office", "Gym", "Anime", "Celebrity", "Casual"]
  },
  ru: {
    workflowEyebrow: "Профи-режим",
    workflowCopy: "Создавайте, отслеживайте и монетизируйте каждый образ.",
    presets: ["Роскошь", "Стритвир", "Свадьба", "Офис", "Спортзал", "Аниме", "Знаменитость", "Повседневный"]
  },
  uz: {
    workflowEyebrow: "Pro ish oqimi",
    workflowCopy: "Har bir lookni yarating, kuzating va monetizatsiya qiling.",
    presets: ["Hashamat", "Streetwear", "To'y", "Ofis", "Sport", "Anime", "Mashhur uslub", "Kundalik"]
  },
  tr: {
    workflowEyebrow: "Pro akisi",
    workflowCopy: "Her look'u oluşturun, takip edin ve gelire çevirin.",
    presets: ["Luks", "Streetwear", "Dugun", "Ofis", "Spor", "Anime", "Unlu stili", "Gunluk"]
  },
  es: {
    workflowEyebrow: "Flujo pro",
    workflowCopy: "Crea, sigue y monetiza cada look.",
    presets: ["Lujo", "Streetwear", "Boda", "Oficina", "Gimnasio", "Anime", "Celebridad", "Casual"]
  },
  fr: {
    workflowEyebrow: "Flux pro",
    workflowCopy: "Creez, suivez et monetisez chaque look.",
    presets: ["Luxe", "Streetwear", "Mariage", "Bureau", "Salle de sport", "Anime", "Celebrite", "Casual"]
  },
  de: {
    workflowEyebrow: "Pro-Workflow",
    workflowCopy: "Erstelle, verfolge und monetarisiere jeden Look.",
    presets: ["Luxus", "Streetwear", "Hochzeit", "Buro", "Fitness", "Anime", "Promi", "Casual"]
  },
  ar: {
    workflowEyebrow: "وضع احترافي",
    workflowCopy: "أنشئ كل إطلالة وتابعها وحوّلها إلى دخل.",
    presets: ["فاخر", "ملابس شارع", "زفاف", "مكتب", "رياضة", "أنمي", "مشاهير", "كاجوال"]
  },
  pt: {
    workflowEyebrow: "Fluxo pro",
    workflowCopy: "Crie, acompanhe e monetize cada look.",
    presets: ["Luxo", "Streetwear", "Casamento", "Escritorio", "Academia", "Anime", "Celebridade", "Casual"]
  }
} as const;

export type SyncedProductLanguage = keyof typeof syncedProductCopy;
