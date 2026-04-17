"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function TrustBadges() {
  const { t } = useLanguage();
  const badges = [
    { label: "100,000+", note: t("trust.generations") },
    { label: "4.9/5", note: t("trust.rating") },
    { label: "190+", note: t("trust.countries") },
    { label: "12 sec", note: t("trust.speed") }
  ];

  return (
    <section className="section-shell py-12">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {badges.map((badge) => (
          <div key={badge.label} className="glass-panel rounded-3xl px-6 py-5">
            <p className="text-2xl font-semibold text-slate-950 dark:text-white">{badge.label}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{badge.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
