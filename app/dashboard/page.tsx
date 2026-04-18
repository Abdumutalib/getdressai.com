"use client";

import { Suspense } from "react";
import Image from "next/image";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { StatsCards } from "@/components/StatsCards";
import { UploadGenerator } from "@/components/UploadGenerator";
import { useLanguage } from "@/components/LanguageProvider";

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="h-36 animate-pulse rounded-[2rem] bg-slate-100 dark:bg-white/5" />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { t, tm } = useLanguage();
  const historyText = tm<{ title: string; date: string }[]>("dashboard.history");
  const safeHistoryText = Array.isArray(historyText) ? historyText : [];
  const history = [
    { ...(safeHistoryText[0] ?? { title: "Wedding couture", date: "2 minutes ago" }), src: "/examples/wedding.svg" },
    { ...(safeHistoryText[1] ?? { title: "Celebrity leather set", date: "12 minutes ago" }), src: "/examples/celebrity.svg" },
    { ...(safeHistoryText[2] ?? { title: "Office capsule", date: "Yesterday" }), src: "/examples/office.svg" }
  ];

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
                <span className="rounded-full bg-accentSoft px-4 py-2 text-xs font-semibold text-accent">{t("dashboard.creditsUsed")}</span>
              </div>
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.title} className="flex gap-5 rounded-[1.5rem] border border-slate-200 bg-white/80 p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
                    <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-[1.35rem] bg-slate-50 dark:bg-slate-950/60 sm:h-40 sm:w-32">
                      <Image src={item.src} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-950 dark:text-white">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{item.date}</p>
                        <div className="mt-3 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                          Ready for download
                        </div>
                      </div>
                      <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-glow">{t("dashboard.download")}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
