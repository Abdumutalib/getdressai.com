"use client";

import { useLanguage } from "@/components/LanguageProvider";

const metrics = [
  ["Users", "18,492"],
  ["Revenue", "$92,410"],
  ["MRR", "$28,340"],
  ["Conversions", "6.9%"],
  ["Credit usage", "184,202"],
  ["Failed payments", "23"],
  ["Top referrers", "Mila, Noor, Amelia"]
];

export function AdminClient() {
  const { t, tm } = useLanguage();
  const labels = tm<string[]>("admin.labels");
  const safeLabels = Array.isArray(labels) ? labels : metrics.map(([label]) => label);

  return (
    <main className="section-shell py-20">
      <div className="space-y-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("admin.eyebrow")}</p>
          <h1 className="section-title">{t("admin.title")}</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metrics.map(([, value], index) => (
            <div key={safeLabels[index]} className="glass-panel rounded-[2rem] p-6">
              <p className="text-sm text-slate-500 dark:text-slate-300">{safeLabels[index]}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
