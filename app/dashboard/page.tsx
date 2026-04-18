"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Footprints, PlusCircle, Shirt, Watch } from "lucide-react";
import { UploadGenerator } from "@/components/UploadGenerator";
import { useLanguage } from "@/components/LanguageProvider";

type StoredGeneration = {
  id: string;
  mode: "photo" | "mannequin";
  gender: "female" | "male" | "unisex";
  prompt: string;
  preset: string;
  resultUrl: string;
  createdAt: string;
  watermark: boolean;
  tookMs: number;
};

const dashboardCopy = {
  en: {
    welcome: "Welcome back",
    hero: "Your new style for today.",
    createLook: "Create a new look",
    wardrobe: "Virtual wardrobe",
    seeAll: "See all",
    tops: "Tops",
    bottoms: "Bottoms",
    shoes: "Shoes",
    accessories: "Accessories",
    insights: "Style insights",
    business: "Business",
    gala: "Gala",
    street: "Street",
    picks: "Daily picks",
    meetingTag: "Morning meeting",
    pickTitle: "Effortless Monochrome",
    results: "Recent results",
    ago: "ago",
    savedEmpty: "Your saved looks will appear here after you generate one.",
    savedFromPhoto: "Saved from your photo",
    savedMannequin: "Saved mannequin look",
    creditsLabel: "Credits",
    creditsNote: "5 bonus credits end in 2 days"
  },
  ru: {
    welcome: "С возвращением",
    hero: "Ваш новый стиль на сегодня.",
    createLook: "Создать новый образ",
    wardrobe: "Виртуальный гардероб",
    seeAll: "Смотреть всё",
    tops: "Верх",
    bottoms: "Низ",
    shoes: "Обувь",
    accessories: "Аксессуары",
    insights: "Анализ стиля",
    business: "Бизнес",
    gala: "Гала",
    street: "Стрит",
    picks: "Подборка дня",
    meetingTag: "Утренняя встреча",
    pickTitle: "Лёгкий монохром",
    results: "Последние результаты",
    ago: "назад",
    savedEmpty: "Сохранённые образы появятся здесь после первой генерации.",
    savedFromPhoto: "Сохранено с вашего фото",
    savedMannequin: "Сохранённый образ манекена",
    creditsLabel: "Кредиты",
    creditsNote: "5 бонусных кредитов закончатся через 2 дня"
  },
  uz: {
    welcome: "Xush kelibsiz",
    hero: "Bugungi yangi uslubingiz.",
    createLook: "Yangi kiyim yaratish",
    wardrobe: "Virtual garderob",
    seeAll: "Hammasini ko'rish",
    tops: "Tepalar",
    bottoms: "Shimlar",
    shoes: "Poyabzal",
    accessories: "Aksessuarlar",
    insights: "Uslub tahlili",
    business: "Biznes",
    gala: "Gala",
    street: "Street",
    picks: "Kunlik tanlov",
    meetingTag: "Ertalabki uchrashuv",
    pickTitle: "Effortless Monochrome",
    results: "Oxirgi natijalar",
    ago: "oldin",
    savedEmpty: "Yangi natija yaratganingizdan кейин сақланган look'лар шу ерда чиқади.",
    savedFromPhoto: "Rasmingizdan saqlandi",
    savedMannequin: "Manekendan saqlangan look",
    creditsLabel: "Kreditlar",
    creditsNote: "5 bonus kredit 2 kundan keyin tugaydi"
  }
} as const;

function formatHistoryTime(value: string, locale: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function DashboardPage() {
  const { language } = useLanguage();
  const copy = dashboardCopy[language as keyof typeof dashboardCopy] ?? dashboardCopy.en;
  const [history, setHistory] = useState<StoredGeneration[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    setHistoryError("");

    try {
      const response = await fetch("/api/generate", {
        method: "GET",
        cache: "no-store"
      });
      const data = (await response.json()) as { items?: StoredGeneration[]; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Could not load saved results.");
      }

      setHistory(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : "Could not load saved results.");
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();

    const refreshHistory = () => {
      void loadHistory();
    };

    window.addEventListener("getdressai:generation-saved", refreshHistory);
    return () => {
      window.removeEventListener("getdressai:generation-saved", refreshHistory);
    };
  }, [loadHistory]);

  const locale = useMemo(() => {
    const locales: Record<string, string> = {
      en: "en-US",
      ru: "ru-RU",
      uz: "uz-UZ",
      tr: "tr-TR",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
      ar: "ar-SA"
    };

    return locales[language] ?? "en-US";
  }, [language]);

  const wardrobeStats = [
    { icon: Shirt, value: 42, label: copy.tops },
    { icon: ChevronLeft, value: 18, label: copy.bottoms },
    { icon: Footprints, value: 12, label: copy.shoes },
    { icon: Watch, value: 25, label: copy.accessories }
  ];

  return (
    <main className="section-shell py-10 sm:py-12">
      <div className="mx-auto max-w-[760px] space-y-8">
        <section className="rounded-[2.5rem] bg-[linear-gradient(180deg,#ffffff_0%,#f6f7ff_100%)] p-6 shadow-soft">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-indigo-600 text-xs font-bold uppercase tracking-[0.24em]">{copy.welcome}</p>
              <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-[#0d1c2e] sm:text-4xl">
                {copy.hero}
              </h1>
            </div>
            <div className="rounded-[1.25rem] border border-indigo-100 bg-white px-4 py-3 text-right shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-500">{copy.creditsLabel}</p>
              <p className="mt-1 text-2xl font-black text-[#0d1c2e]">28</p>
              <p className="mt-1 text-[11px] leading-4 text-slate-500">{copy.creditsNote}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => document.getElementById("generator-section")?.scrollIntoView({ behavior: "smooth" })}
            className="w-full rounded-[1.5rem] bg-indigo-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-transform active:scale-[0.98]"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <PlusCircle className="size-5" />
              {copy.createLook}
            </span>
          </button>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-bold text-[#0d1c2e]">{copy.wardrobe}</h2>
            <a href="#recent-results" className="text-sm font-semibold text-indigo-600">
              {copy.seeAll}
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {wardrobeStats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[2rem] bg-white p-5 text-center shadow-sm">
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Icon className="size-6" />
                  </div>
                  <p className="text-2xl font-black text-[#0d1c2e]">{item.value}</p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-[2.5rem] bg-slate-900 p-6 text-white">
          <h2 className="text-xl font-bold">{copy.insights}</h2>
          <div className="mt-6 flex h-32 items-end justify-around gap-4">
            {[
              { label: copy.business, height: "h-24", tone: "bg-indigo-500" },
              { label: copy.gala, height: "h-16", tone: "bg-indigo-500/40" },
              { label: copy.street, height: "h-20", tone: "bg-indigo-500/70" }
            ].map((bar) => (
              <div key={bar.label} className="flex flex-col items-center gap-2">
                <div className={`w-12 rounded-full ${bar.height} ${bar.tone}`} />
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/60">{bar.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#0d1c2e]">{copy.picks}</h2>
            <div className="flex gap-2">
              <button className="flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white">
                <ChevronLeft className="size-4" />
              </button>
              <button className="flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
          <div className="relative h-[380px] overflow-hidden rounded-[2.5rem]">
            <Image src="/examples/luxury.svg" alt={copy.pickTitle} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent p-6">
              <div className="flex h-full flex-col justify-end">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-300">{copy.meetingTag}</p>
                <h3 className="mt-2 text-3xl font-black leading-tight text-white">{copy.pickTitle}</h3>
              </div>
            </div>
          </div>
        </section>

        <section id="generator-section" className="space-y-4">
          <UploadGenerator />
        </section>

        <section id="recent-results" className="space-y-4">
          <h2 className="text-xl font-bold text-[#0d1c2e]">{copy.results}</h2>
          {loadingHistory ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((item) => (
                <div key={item} className="aspect-[3/4] animate-pulse rounded-[2rem] bg-slate-100" />
              ))}
            </div>
          ) : historyError ? (
            <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-4 py-6 text-sm font-medium text-rose-600">
              {historyError}
            </div>
          ) : history.length ? (
            <div className="grid grid-cols-2 gap-4">
              {history.slice(0, 4).map((item) => {
                const itemIsRemote = !item.resultUrl.startsWith("/");
                return (
                  <div key={item.id} className="space-y-2">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-white shadow-sm">
                      {itemIsRemote ? (
                        <img src={item.resultUrl} alt={item.preset} className="h-full w-full object-cover" />
                      ) : (
                        <Image src={item.resultUrl} alt={item.preset} fill className="object-cover" />
                      )}
                    </div>
                    <p className="text-sm font-bold text-[#0d1c2e]">{item.preset}</p>
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                      {formatHistoryTime(item.createdAt, locale)}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {item.mode === "photo" ? copy.savedFromPhoto : copy.savedMannequin}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-white px-4 py-8 text-sm text-slate-500 shadow-sm">
              {copy.savedEmpty}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
