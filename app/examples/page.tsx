"use client";

import { ExamplesGrid } from "@/components/ExamplesGrid";
import { useLanguage } from "@/components/LanguageProvider";

export default function ExamplesPage() {
  const { t } = useLanguage();

  return (
    <main className="py-20">
      <div className="section-shell max-w-3xl space-y-4 pb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("examples.eyebrow")}</p>
        <h1 className="section-title">{t("examples.pageTitle")}</h1>
      </div>
      <ExamplesGrid />
    </main>
  );
}
