"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function ReferralsPage() {
  const { t, tm } = useLanguage();
  const items = tm<{ title: string; note: string }[]>("referralsPage.items");
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <main className="section-shell py-20">
      <div className="max-w-4xl space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("referralsPage.eyebrow")}</p>
        <h1 className="section-title">{t("referralsPage.title")}</h1>
        <div className="grid gap-6 md:grid-cols-3">
          {safeItems.map((item) => (
            <div key={item.title} className="glass-panel rounded-[2rem] p-6">
              <p className="text-3xl font-semibold text-slate-950 dark:text-white">{item.title}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
