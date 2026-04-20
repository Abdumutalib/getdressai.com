"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Camera, ExternalLink, LoaderCircle, Ruler, Share2, ShoppingBag, UploadCloud, Wand2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { trackEvent } from "@/lib/analytics";
import { authFetch } from "@/lib/supabase-browser";
import {
  clothingFieldCopy as translatedClothingFieldCopy,
  genderCopy as translatedGenderCopy,
  marketplaceCopy as translatedMarketplaceCopy
} from "@/lib/generator-copy";
import { getPresetMarketingImage } from "@/lib/marketing-images";
import { formatCurrency } from "@/lib/utils";

type GeneratorMode = "photo" | "mannequin";
type GenderOption = "female" | "male" | "unisex";

type Measurements = {
  height: string;
  chest: string;
  waist: string;
  hips: string;
  inseam: string;
};

type GenerateResponse = {
  id: string;
  createdAt: string;
  mode: GeneratorMode;
  gender: GenderOption;
  prompt: string;
  preset: string;
  sourceUrl?: string;
  sourceImagePath?: string | null;
  resultUrl: string;
  summary: string;
  measurements?: Record<string, number> | null;
  watermark: boolean;
  tookMs: number;
};

type PreferencesResponse = {
  item?: {
    mode: GeneratorMode;
    gender: GenderOption;
    preset: string;
    prompt: string;
    clothingRequest: string;
    measurements?: Record<string, number> | null;
    sourceImagePath?: string | null;
    sourceUrl?: string;
  } | null;
  error?: string;
};

type KnownSizeCopy = {
  label: string;
  placeholder: string;
  hint: string;
};

type MarketplaceProduct = {
  id: string;
  title: string;
  marketplace: "amazon" | "ebay" | "aliexpress";
  price: number;
  currency: string;
  image: string;
  affiliateUrl: string;
  totalFitScore: number;
  recommendedSize: string;
};

type ParsedIntent = {
  category?: string;
  occasion?: string;
  color?: string;
  material?: string;
};

const exampleSlugs = ["luxury", "streetwear", "wedding", "office", "gym", "anime", "celebrity", "casual"] as const;

const defaultMeasurements: Measurements = {
  height: "170",
  chest: "92",
  waist: "74",
  hips: "98",
  inseam: "78"
};

const marketplaceCopy = {
  en: {
    fitTitle: "Size and fit",
    fitCopy: "Add your real measurements so we can match clothes to your photo and body shape.",
    fitReady: "Your measurements will be used for both try-on and shopping recommendations.",
    recommendationsTitle: "Clothes we found for your photo and size",
    recommendationsCopy: "These picks use your uploaded photo, chosen style, and body measurements.",
    recommendationsHint: "Upload a photo and fill in height, chest, waist, and hips to unlock shopping recommendations.",
    recommendationsButton: "Find matching clothes",
    recommendationsLoading: "Finding clothes for your size...",
    recommendedSize: "Recommended size",
    fitScore: "Fit score",
    marketplaceSource: "Marketplace source",
    openProduct: "Open item",
    clothingLabel: "What clothes do you want?",
    clothingPlaceholder: "Type clothing here...",
    clothingHint: "Describe the exact outfit you want to try or buy.",
    aiHint: "We automatically understand clothing type, color, material, and occasion from your text.",
    clothingInputLabel: "Text entry",
    autoSource: "Matched to your photo and measurements",
    marketplaceError: "Could not load marketplace recommendations.",
    savedPhoto: "Saved photo from your last session"
  },
  ru: {
    fitTitle: "Размер и посадка",
    fitCopy: "Добавьте реальные мерки, чтобы мы подобрали одежду под ваше фото и фигуру.",
    fitReady: "Эти мерки используются и для примерки, и для рекомендаций из магазинов.",
    recommendationsTitle: "Одежда по вашему фото и размерам",
    recommendationsCopy: "Эти варианты подбираются по загруженному фото, стилю и вашим меркам.",
    recommendationsHint: "Загрузите фото и заполните рост, грудь, талию и бёдра, чтобы открыть рекомендации.",
    recommendationsButton: "Найти подходящую одежду",
    recommendationsLoading: "Ищем одежду под ваши размеры...",
    recommendedSize: "Рекомендуемый размер",
    fitScore: "Оценка совпадения",
    marketplaceSource: "Маркетплейс",
    openProduct: "Открыть товар",
    clothingLabel: "Какую одежду вы хотите?",
    clothingPlaceholder: "Например: пляжный набор, пижама, дорожный образ, вечернее платье...",
    clothingHint: "Опишите одежду, которую хотите примерить или найти в магазинах.",
    autoSource: "Подбор по вашему фото и меркам",
    marketplaceError: "Не удалось загрузить рекомендации из маркетплейсов.",
    savedPhoto: "Сохранённое фото из прошлого входа"
  },
  uz: {
    fitTitle: "O'lcham va moslik",
    fitCopy: "Haqiqiy o'lchamlaringizni kiriting, shunda kiyimlar rasmingiz va qomatingizga mos tanlanadi.",
    fitReady: "Bu o'lchamlar try-on ham, marketpleys tavsiyalari ham uchun ishlatiladi.",
    recommendationsTitle: "Rasmingiz va o'lchamingizga mos kiyimlar",
    recommendationsCopy: "Bu tavsiyalar yuklangan rasm, tanlangan uslub va o'lchamlaringiz asosida chiqadi.",
    recommendationsHint: "Rasm yuklang va bo'y, ko'krak, bel, son o'lchamlarini kiriting.",
    recommendationsButton: "Mos kiyimlarni topish",
    recommendationsLoading: "O'lchamingizga mos kiyimlar qidirilyapti...",
    recommendedSize: "Tavsiya o'lcham",
    fitScore: "Moslik bahosi",
    marketplaceSource: "Marketpleys",
    openProduct: "Mahsulotni ochish",
    clothingLabel: "Qanday kiyim xohlaysiz?",
    clothingPlaceholder: "Bu yerga kiyimni yozing...",
    clothingHint: "Kiydirmoqchi yoki topmoqchi bo'lgan kiyimni yozing.",
    aiHint: "Tizim matndan kiyim turi, rang, mato va vaziyatni o'zi tushunadi.",
    clothingInputLabel: "Tekst yozish joyi",
    autoSource: "Rasmingiz va o'lchamingiz asosida tanlandi",
    marketplaceError: "Marketpleys tavsiyalarini yuklab bo'lmadi.",
    savedPhoto: "Oldingi kirishdan сақланган rasm"
  }
} as const;

const genderCopy = {
  en: {
    label: "Gender",
    hint: "Choose who this look is for."
  },
  ru: {
    label: "Пол",
    hint: "Выберите, для кого этот образ."
  },
  uz: {
    label: "Jinsi",
    hint: "Bu look kim uchun ekanini tanlang."
  }
} as const;

const clothingFieldCopy = {
  en: {
    label: "Text entry",
    placeholder: "Type clothing here...",
    aiHint: "We automatically understand clothing type, color, material, and occasion from your text."
  },
  ru: {
    label: "Поле для текста",
    placeholder: "Опишите одежду здесь...",
    aiHint: "Мы автоматически понимаем тип одежды, цвет, материал и повод из вашего текста."
  },
  uz: {
    label: "Tekst yozish joyi",
    placeholder: "Bu yerga kiyimni yozing...",
    aiHint: "Tizim matndan kiyim turi, rang, mato va vaziyatni o'zi tushunadi."
  }
} as const;

type UploadGeneratorProps = {
  skipInitialLoad?: boolean;
};

export function UploadGenerator({ skipInitialLoad = false }: UploadGeneratorProps) {
  const { t, tm, language } = useLanguage();
  const localizedMarketplaceCopy = translatedMarketplaceCopy[language] ?? translatedMarketplaceCopy.en;
  const localizedGenderCopy = translatedGenderCopy[language] ?? translatedGenderCopy.en;
  const localizedClothingFieldCopy = translatedClothingFieldCopy[language] ?? translatedClothingFieldCopy.en;
  const knownSizeCopy: Record<string, KnownSizeCopy> = {
    en: {
      label: "Known clothing size",
      placeholder: "For example: XXL",
      hint: "If you already know your usual size, you can enter it here.",
    },
    ru: {
      label: "Готовый размер",
      placeholder: "Например: XXL",
      hint: "Если вы уже знаете свой обычный размер, укажите его здесь.",
    },
    uz: {
      label: "Tayyor razmer",
      placeholder: "Masalan: XXL",
      hint: "Agar odatda qaysi razmer kiyishingizni bilsangiz, shu yerga yozishingiz mumkin.",
    },
  };
  const localizedKnownSizeCopy = knownSizeCopy[language] ?? knownSizeCopy.en;
  const presets = tm<string[]>("upload.presets");
  const safePresets = Array.isArray(presets) ? presets : [];
  const [mode, setMode] = useState<GeneratorMode>("photo");
  const [gender, setGender] = useState<GenderOption>("female");
  const [selected, setSelected] = useState(safePresets[0] ?? "Luxury");
  const [prompt, setPrompt] = useState(t("upload.defaultPrompt"));
  const [clothingRequest, setClothingRequest] = useState("");
  const [preferredSize, setPreferredSize] = useState("");
  const [generating, setGenerating] = useState(false);
  const [hydrating, setHydrating] = useState(true);
  const [recommending, setRecommending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [recommendationError, setRecommendationError] = useState("");
  const [recommendations, setRecommendations] = useState<MarketplaceProduct[]>([]);
  const [recommendedSize, setRecommendedSize] = useState("");
  const [parsedIntent, setParsedIntent] = useState<ParsedIntent | null>(null);
  const [measurements, setMeasurements] = useState<Measurements>(defaultMeasurements);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [savedSourcePath, setSavedSourcePath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const hydratedInitialRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSelected(safePresets[0] ?? "Luxury");
    setPrompt(t("upload.defaultPrompt"));
  }, [language, safePresets, t]);

  useEffect(() => {
    async function loadInitial() {
      if (skipInitialLoad) {
        setHydrating(false);
        return;
      }

      setHydrating(true);

      try {
        const [preferencesResponse, historyResponse] = await Promise.all([
          authFetch("/api/preferences", { method: "GET", cache: "no-store" }),
          authFetch("/api/generate", { method: "GET", cache: "no-store" })
        ]);

        if (preferencesResponse.status !== 401) {
          const preferencesData = (await preferencesResponse.json()) as PreferencesResponse;
          const preferencesItem = preferencesResponse.ok ? preferencesData.item : null;

          if (preferencesItem) {
            setMode(preferencesItem.mode);
            setGender(preferencesItem.gender);
            setSelected(preferencesItem.preset);
            setPrompt(preferencesItem.prompt);
            setClothingRequest(preferencesItem.clothingRequest || "");
            setSavedSourcePath(preferencesItem.sourceImagePath ?? null);
            if (preferencesItem.sourceUrl) {
              setPhotoPreview(preferencesItem.sourceUrl);
            }
            if (preferencesItem.measurements) {
              setMeasurements({
                height: String(preferencesItem.measurements.height ?? defaultMeasurements.height),
                chest: String(preferencesItem.measurements.chest ?? defaultMeasurements.chest),
                waist: String(preferencesItem.measurements.waist ?? defaultMeasurements.waist),
                hips: String(preferencesItem.measurements.hips ?? defaultMeasurements.hips),
                inseam: String(preferencesItem.measurements.inseam ?? defaultMeasurements.inseam)
              });
            }
          }
        }

        if (historyResponse.status === 401) {
          return;
        }

        const historyData = (await historyResponse.json()) as { items?: GenerateResponse[] };
        if (!historyResponse.ok || !Array.isArray(historyData.items) || !historyData.items.length) {
          return;
        }

        const latest = historyData.items[0];
        setResult(latest);
        setSavedSourcePath((current) => current ?? latest.sourceImagePath ?? null);
        if (!photoPreview && latest.mode === "photo" && latest.sourceUrl) {
          setPhotoPreview(latest.sourceUrl);
        }

        if (!hydratedInitialRef.current && latest.measurements) {
          setMeasurements({
            height: String(latest.measurements.height ?? defaultMeasurements.height),
            chest: String(latest.measurements.chest ?? defaultMeasurements.chest),
            waist: String(latest.measurements.waist ?? defaultMeasurements.waist),
            hips: String(latest.measurements.hips ?? defaultMeasurements.hips),
            inseam: String(latest.measurements.inseam ?? defaultMeasurements.inseam)
          });
        }

      } finally {
        hydratedInitialRef.current = true;
        setHydrating(false);
      }
    }

    void loadInitial();
  }, [photoPreview, skipInitialLoad]);

  useEffect(() => {
    if (!hydratedInitialRef.current || skipInitialLoad) {
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      void authFetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          gender,
          preset: selected,
          prompt,
          clothingRequest: clothingRequest.trim(),
          sourceImagePath: savedSourcePath,
          measurements: serializeMeasurements()
        })
      }).catch(() => {
        // Ignore autosave failures until the user acts again.
      });
    }, 500);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [clothingRequest, gender, measurements, mode, prompt, savedSourcePath, selected, skipInitialLoad]);

  const measurementFields = useMemo(
    () => [
      { key: "height", label: t("upload.measurementHeight") },
      { key: "chest", label: t("upload.measurementChest") },
      { key: "waist", label: t("upload.measurementWaist") },
      { key: "hips", label: t("upload.measurementHips") },
      { key: "inseam", label: t("upload.measurementInseam") }
    ] as const,
    [t]
  );

  function serializeMeasurements() {
    return Object.fromEntries(
      Object.entries(measurements)
        .map(([key, value]) => [key, Number(value)] as const)
        .filter((entry) => Number.isFinite(entry[1]) && entry[1] > 0)
    );
  }

  const genderOptions = useMemo(
    () =>
      ([
        { value: "female", label: t("upload.genderFemale") },
        { value: "male", label: t("upload.genderMale") },
        { value: "unisex", label: t("upload.genderUnisex") }
      ] as const),
    [t]
  );

  const mannequinSummary = `${measurements.height}${t("upload.measurementUnit")} · ${measurements.chest}/${measurements.waist}/${measurements.hips}`;
  const resultIsRemote = Boolean(result?.resultUrl && !result.resultUrl.startsWith("/"));
  const previewIsRemote = Boolean(photoPreview && !photoPreview.startsWith("blob:") && !photoPreview.startsWith("/"));
  const hasRecommendationInputs = Boolean(
    (photoFile || savedSourcePath || photoPreview) &&
      (preferredSize.trim() ||
        (measurements.height &&
          measurements.chest &&
          measurements.waist &&
          measurements.hips))
  );

  const normalizedPreferredSize = preferredSize.trim().toUpperCase();

  function updateMeasurement(field: keyof Measurements, rawValue: string) {
    const sanitized = rawValue.replace(/[^\d]/g, "");
    setMeasurements((current) => ({
      ...current,
      [field]: sanitized
    }));
  }

  function updatePreferredSize(rawValue: string) {
    const sanitized = rawValue.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 8);
    setPreferredSize(sanitized);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function openCameraPicker() {
    cameraInputRef.current?.click();
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      return;
    }

    const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(nextFile.type);
    const maxSize = 10 * 1024 * 1024;

    if (!isValidType || nextFile.size > maxSize) {
      setError(t("upload.formats"));
      return;
    }

    if (photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    const previewUrl = URL.createObjectURL(nextFile);
    setPhotoFile(nextFile);
    setPhotoPreview(previewUrl);
    setSavedSourcePath(null);
    setResult(null);
    setRecommendations([]);
    setRecommendationError("");
    setRecommendedSize("");
    setError("");
    trackEvent("upload_started", { mode: "photo", fileType: nextFile.type, size: nextFile.size });

    try {
      const formData = new FormData();
      formData.set("file", nextFile);

      const response = await authFetch("/api/preferences", {
        method: "POST",
        body: formData
      });
      const data = (await response.json()) as {
        sourceImagePath?: string;
        sourceUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.sourceImagePath) {
        throw new Error(data.error || t("upload.generationFailed"));
      }

      setSavedSourcePath(data.sourceImagePath);
      if (data.sourceUrl) {
        if (previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl);
        }
        setPhotoPreview(data.sourceUrl);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t("upload.generationFailed"));
    }
  }

  async function fetchRecommendations() {
    if (!hasRecommendationInputs) {
      setRecommendationError(localizedMarketplaceCopy.recommendationsHint);
      return;
    }

    setRecommending(true);
    setRecommendationError("");

    try {
      const response = await authFetch("/api/recommend-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          clothingRequest,
          preset: selected,
          gender,
          sourceImagePath: savedSourcePath,
          measurements: serializeMeasurements(),
          preferredSize: normalizedPreferredSize || undefined
        })
      });

      const data = (await response.json()) as {
        recommendedSize?: string;
        products?: MarketplaceProduct[];
        intent?: ParsedIntent;
        error?: string;
      };

      if (!response.ok || !Array.isArray(data.products)) {
        throw new Error(data.error || localizedMarketplaceCopy.marketplaceError);
      }

      setRecommendations(data.products);
      setRecommendedSize(data.recommendedSize || "");
      setParsedIntent(data.intent ?? null);
      trackEvent("marketplace_recommendations_loaded", {
        preset: selected,
        clothingRequest,
        count: data.products.length,
        size: data.recommendedSize || ""
      });
    } catch (nextError) {
      setRecommendationError(
        nextError instanceof Error ? nextError.message : localizedMarketplaceCopy.marketplaceError
      );
      setRecommendations([]);
      setRecommendedSize("");
      setParsedIntent(null);
    } finally {
      setRecommending(false);
    }
  }

  async function handleGenerate() {
    if (mode === "photo" && !photoFile && !savedSourcePath) {
      setError(t("upload.dropPhoto"));
      return;
    }

    setGenerating(true);
    setProgress(12);
    setError("");
    trackEvent("generation_started", {
      mode,
      preset: selected,
      gender
    });

    try {
      const payload = new FormData();
      payload.set("mode", mode);
      payload.set("gender", gender);
      payload.set("prompt", prompt);
      payload.set("clothingRequest", clothingRequest.trim() || selected);
      payload.set("preset", selected);
      payload.set(
        "measurements",
        JSON.stringify(serializeMeasurements())
      );
      if (normalizedPreferredSize) {
        payload.set("preferredSize", normalizedPreferredSize);
      }

      if (mode === "photo" && photoFile) {
        payload.set("file", photoFile);
      }

      if (mode === "photo" && !photoFile && savedSourcePath) {
        payload.set("existingSourcePath", savedSourcePath);
      }

      const response = await authFetch("/api/generate", {
        method: "POST",
        body: payload
      });
      setProgress(68);

      const data = (await response.json()) as GenerateResponse | { error: string };

      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : t("upload.generationFailed"));
      }

      setResult(data);
      setSavedSourcePath(data.sourceImagePath ?? null);
      if (data.mode === "photo" && data.sourceUrl) {
        setPhotoPreview(data.sourceUrl);
        setPhotoFile(null);
      }
      setProgress(100);
      window.dispatchEvent(new CustomEvent("getdressai:generation-saved"));
      trackEvent("generation_completed", {
        mode: data.mode,
        preset: data.preset,
        clothingRequest: clothingRequest.trim() || data.preset,
        gender: data.gender,
        tookMs: data.tookMs
      });

      if (data.mode === "photo" && data.sourceImagePath) {
        await fetchRecommendations();
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t("upload.generationFailed"));
      setProgress(0);
    } finally {
      setGenerating(false);
    }
  }

  async function shareResult() {
    if (!result) {
      return;
    }

    trackEvent("referral_shared", {
      source: "generator_result",
      mode: result.mode
    });

    const shareData = {
      title: t("upload.shareTitle"),
      text: t("upload.shareText"),
      url: typeof window !== "undefined" ? window.location.href : ""
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(shareData.url);
  }

  return (
    <div className="glass-panel rounded-[2rem] p-6">
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-white/5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">{localizedMarketplaceCopy.recommendationsTitle}</p>
              <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-300">{localizedMarketplaceCopy.recommendationsCopy}</p>
            </div>
            <button
              type="button"
              onClick={() => void fetchRecommendations()}
              disabled={!hasRecommendationInputs || recommending}
              className="btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {recommending ? <LoaderCircle className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}
              {recommending ? localizedMarketplaceCopy.recommendationsLoading : localizedMarketplaceCopy.recommendationsButton}
            </button>
          </div>

          {recommendedSize ? (
            <div className="mb-4 inline-flex rounded-full bg-accentSoft px-4 py-2 text-xs font-semibold text-accent">
              {localizedMarketplaceCopy.recommendedSize}: {recommendedSize}
            </div>
          ) : null}

          {parsedIntent && (parsedIntent.category || parsedIntent.color || parsedIntent.material || parsedIntent.occasion) ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {[parsedIntent.category, parsedIntent.color, parsedIntent.material, parsedIntent.occasion]
                .filter(Boolean)
                .map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-200"
                  >
                    {item}
                  </span>
                ))}
            </div>
          ) : null}

          {recommendationError ? (
            <p className="mb-4 text-sm font-medium text-rose-500">{recommendationError}</p>
          ) : null}

          {!recommendations.length && !recommendationError ? (
            <p className="text-sm text-slate-500 dark:text-slate-300">{localizedMarketplaceCopy.recommendationsHint}</p>
          ) : null}

          {recommendations.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommendations.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950/40"
                >
                  <div className="relative aspect-[4/5] bg-white dark:bg-slate-950/60">
                    {product.image.startsWith("/") ? (
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <img src={product.image} alt={product.title} className="h-full w-full object-cover" loading="lazy" />
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">{product.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">{product.marketplace}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">
                        {formatCurrency(product.price, product.currency)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold text-accent">
                        {localizedMarketplaceCopy.recommendedSize}: {product.recommendedSize}
                      </span>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                        {localizedMarketplaceCopy.fitScore}: {product.totalFitScore}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-300">{localizedMarketplaceCopy.autoSource}</p>
                    <a
                      href={product.affiliateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                    >
                      <ExternalLink className="size-4" />
                      {localizedMarketplaceCopy.openProduct}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 rounded-[1.5rem] bg-slate-100 p-2 dark:bg-white/5">
          {([
            { value: "photo", label: t("upload.modePhoto") },
            { value: "mannequin", label: t("upload.modeMannequin") }
          ] as const).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setMode(item.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === item.value
                  ? "btn-primary text-white"
                  : "btn-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">{localizedGenderCopy.label}</p>
            <span className="text-xs text-slate-500 dark:text-slate-300">{localizedGenderCopy.hint}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {genderOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setGender(option.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  gender === option.value
                    ? "btn-primary text-white"
                    : "btn-muted"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              {localizedMarketplaceCopy.clothingLabel}
            </p>
            <p className="text-xs leading-6 text-slate-500 dark:text-slate-300">
              {localizedMarketplaceCopy.clothingHint}
            </p>
            <p className="text-[11px] leading-5 text-accent">
              {localizedClothingFieldCopy.aiHint}
            </p>
            <div className="surface-soft rounded-[1.2rem] p-3">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                {localizedClothingFieldCopy.label}
              </label>
              <input
                type="text"
                value={clothingRequest}
                onChange={(event) => setClothingRequest(event.target.value)}
                placeholder={localizedClothingFieldCopy.placeholder}
                className="w-full rounded-[1rem] border border-[#D8DEFF] bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/15 dark:border-white/10 dark:bg-slate-950/60"
              />
            </div>
          </div>
        </div>

        {mode === "photo" ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-center dark:border-white/10 dark:bg-white/5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              capture="environment"
              className="hidden"
              onChange={handlePhotoChange}
            />
            {photoPreview ? (
              <div className="space-y-4">
                <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950/60">
                  {previewIsRemote ? (
                    <img src={photoPreview} alt="Uploaded photo preview" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <Image src={photoPreview} alt="Uploaded photo preview" fill className="object-cover" sizes="320px" unoptimized />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-950 dark:text-white">
                    {photoFile?.name || localizedMarketplaceCopy.savedPhoto}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-300">
                    {hydrating ? t("upload.checkingSavedUpload") : t("upload.formats")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="btn-muted inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                  >
                    <UploadCloud className="size-4" />
                    {t("upload.choosePhoto")}
                  </button>
                  <button
                    type="button"
                    onClick={openCameraPicker}
                    className="btn-muted inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                  >
                    <Camera className="size-4" />
                    {t("upload.takePhoto")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <UploadCloud className="mx-auto size-8 text-slate-500" />
                  <p className="mt-4 text-sm font-medium text-slate-950 dark:text-white">{t("upload.dropPhoto")}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{t("upload.formats")}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
                  >
                    <UploadCloud className="size-4" />
                    {t("upload.choosePhoto")}
                  </button>
                  <button
                    type="button"
                    onClick={openCameraPicker}
                    className="btn-muted inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
                  >
                    <Camera className="size-4" />
                    {t("upload.takePhoto")}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-[1.25rem] bg-white p-4 shadow-soft dark:bg-slate-950/60">
                <div className="flex h-full min-h-56 items-end justify-center rounded-[1rem] bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]">
                  <div className="relative flex h-48 w-28 items-center justify-center">
                    <div className="absolute top-0 size-10 rounded-full border-4 border-slate-300 dark:border-slate-600" />
                    <div className="absolute top-10 h-20 w-16 rounded-t-[2rem] rounded-b-[1rem] border-4 border-slate-300 dark:border-slate-600" />
                    <div className="absolute top-[4.6rem] left-0 h-16 w-4 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <div className="absolute top-[4.6rem] right-0 h-16 w-4 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <div className="absolute bottom-0 left-[2.2rem] h-20 w-4 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <div className="absolute bottom-0 right-[2.2rem] h-20 w-4 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <div className="absolute top-[3.8rem] h-24 w-20 rounded-[1.5rem] bg-gradient-to-b from-slate-900 via-slate-700 to-slate-500 opacity-90" />
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">{t("upload.mannequinTitle")}</p>
                <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-300">{mannequinSummary}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{localizedMarketplaceCopy.fitTitle}</p>
                  <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-300">{localizedMarketplaceCopy.fitCopy}</p>
                </div>
                <div className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950/60">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
                    {localizedKnownSizeCopy.label}
                  </p>
                  <input
                    type="text"
                    value={preferredSize}
                    onChange={(event) => updatePreferredSize(event.target.value)}
                    placeholder={localizedKnownSizeCopy.placeholder}
                    className="mt-2 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">{localizedKnownSizeCopy.hint}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {measurementFields.map((field) => (
                    <label key={field.key} className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
                        {field.label}
                      </span>
                      <div className="surface-soft flex items-center rounded-[1rem] px-3 py-3 dark:border-white/10 dark:bg-slate-950/60">
                        <Ruler className="mr-2 size-4 text-slate-400" />
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          autoComplete="off"
                          value={measurements[field.key]}
                          onChange={(event) => updateMeasurement(field.key, event.target.value)}
                          className="w-full bg-transparent text-sm outline-none"
                        />
                        <span className="text-xs text-slate-400">{t("upload.measurementUnit")}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs leading-6 text-slate-500 dark:text-slate-300">{localizedMarketplaceCopy.fitReady}</p>
              </div>
            </div>
          </div>
        )}

        {mode === "photo" ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <div className="mb-3">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">{localizedMarketplaceCopy.fitTitle}</p>
              <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-300">{localizedMarketplaceCopy.fitCopy}</p>
            </div>
            <div className="mb-4 rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950/40">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
                {localizedKnownSizeCopy.label}
              </p>
              <input
                type="text"
                value={preferredSize}
                onChange={(event) => updatePreferredSize(event.target.value)}
                placeholder={localizedKnownSizeCopy.placeholder}
                className="mt-2 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">{localizedKnownSizeCopy.hint}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {measurementFields.map((field) => (
                <label key={field.key} className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
                    {field.label}
                  </span>
                  <div className="surface-soft flex items-center rounded-[1rem] px-3 py-3 dark:border-white/10 dark:bg-slate-950/60">
                    <Ruler className="mr-2 size-4 text-slate-400" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      value={measurements[field.key]}
                      onChange={(event) => updateMeasurement(field.key, event.target.value)}
                      className="w-full bg-transparent text-sm outline-none"
                    />
                    <span className="text-xs text-slate-400">{t("upload.measurementUnit")}</span>
                  </div>
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-300">{localizedMarketplaceCopy.fitReady}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {safePresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setSelected(preset);
                trackEvent("upload_started", { preset, mode });
              }}
              className={`rounded-full px-4 py-2 text-sm transition ${
                selected === preset
                  ? "btn-primary text-white"
                  : "btn-muted"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">{t("examples.eyebrow")}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{t("examples.title")}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {exampleSlugs.map((slug, index) => {
              const presetLabel = safePresets[index] ?? slug;
              const active = selected === presetLabel;

              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setSelected(presetLabel)}
                  className={`overflow-hidden rounded-[1.25rem] border text-left transition ${
                    active
                      ? "border-ink shadow-soft"
                      : "border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20"
                  }`}
                >
                  <div className="relative aspect-[4/5] bg-slate-50 dark:bg-slate-950/60">
                    <Image src={getPresetMarketingImage(slug)} alt={presetLabel} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                  </div>
                  <div className="px-3 py-3">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">{presetLabel}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <textarea
          rows={4}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-accent dark:border-white/10 dark:bg-white/5"
        />

        <button
          type="button"
          onClick={handleGenerate}
          className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-semibold"
        >
          {generating ? <LoaderCircle className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
          {generating ? t("upload.generating") : t("upload.generate")}
        </button>
        {generating ? (
          <div className="space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-sky-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-[1.25rem] bg-slate-100 dark:bg-white/5" />
              ))}
            </div>
          </div>
        ) : null}

        {error ? <p className="text-sm font-medium text-rose-500">{error}</p> : null}

        {result ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-slate-950/60">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">{t("upload.resultTitle")}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                  {result.mode === "mannequin" ? t("upload.resultModeMannequin") : t("upload.resultModePhoto")}
                </p>
              </div>
              <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold text-accent">
                {result.preset}
              </span>
            </div>
            <div className="grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950/60">
                {resultIsRemote ? (
                  <img src={result.resultUrl} alt={result.preset} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <Image src={result.resultUrl} alt={result.preset} fill className="object-cover" sizes="220px" />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {localizedGenderCopy.label}: {t(`upload.genderValue.${result.gender}`)}
                </p>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {result.mode === "mannequin" ? t("upload.resultSummaryMannequin") : t("upload.resultSummaryPhoto")}
                </p>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{result.tookMs} ms</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={shareResult}
                    className="btn-muted inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                  >
                    <Share2 className="size-4" />
                    {t("upload.shareButton")}
                  </button>
                  <a
                    href={result.resultUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                  >
                    {t("upload.downloadHd")}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}
