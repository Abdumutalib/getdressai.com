"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { StatsCards } from "@/components/StatsCards";
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

function DashboardSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="h-28 animate-pulse rounded-[1.5rem] bg-slate-100 dark:bg-white/5" />
      ))}
    </div>
  );
}

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
  const { t, language } = useLanguage();
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

  return (
    <main className="section-shell py-16">
      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <DashboardSidebar />
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("dashboard.eyebrow")}</p>
            <h1 className="section-title">{t("dashboard.title")}</h1>
          </div>

          <Suspense fallback={<DashboardSkeleton />}>
            <StatsCards />
          </Suspense>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <UploadGenerator />
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{t("dashboard.recentResults")}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{t("dashboard.downloadHd")}</p>
                </div>
                <span className="rounded-full bg-accentSoft px-4 py-2 text-xs font-semibold text-accent">
                  {history.length} saved
                </span>
              </div>

              {loadingHistory ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-36 animate-pulse rounded-[1.5rem] bg-slate-100 dark:bg-white/5" />
                  ))}
                </div>
              ) : historyError ? (
                <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-6 text-sm font-medium text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                  {historyError}
                </div>
              ) : history.length ? (
                <div className="space-y-4">
                  {history.map((item) => {
                    const itemIsRemote = !item.resultUrl.startsWith("/");

                    return (
                      <div
                        key={item.id}
                        className="flex gap-5 rounded-[1.5rem] border border-slate-200 bg-white/80 p-5 shadow-soft dark:border-white/10 dark:bg-white/5"
                      >
                        <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-[1.35rem] bg-slate-50 dark:bg-slate-950/60 sm:h-40 sm:w-32">
                          {itemIsRemote ? (
                            <img src={item.resultUrl} alt={item.preset} className="h-full w-full object-cover" />
                          ) : (
                            <Image src={item.resultUrl} alt={item.preset} fill className="object-cover" />
                          )}
                        </div>
                        <div className="flex flex-1 items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-950 dark:text-white">{item.preset}</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                              {formatHistoryTime(item.createdAt, locale)}
                            </p>
                            <div className="mt-3 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                              {item.mode === "photo" ? "Saved from your photo" : "Saved mannequin look"}
                            </div>
                          </div>
                          <a
                            href={item.resultUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-glow"
                          >
                            {t("dashboard.download")}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 px-4 py-8 text-sm text-slate-500 shadow-soft dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  Your saved looks will appear here after you generate one.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
