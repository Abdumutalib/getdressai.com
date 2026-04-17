"use client";

import { PricingCards } from "@/components/PricingCards";
import { useLanguage } from "@/components/LanguageProvider";

export default function PricingPage() {
  const { t } = useLanguage();

  return (
    <main className="section-shell py-20">
      <div className="max-w-2xl space-y-4 pb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("pricing.eyebrow")}</p>
        <h1 className="section-title">{t("pricing.pageTitle")}</h1>
        <p className="section-copy">{t("pricing.pageCopy")}</p>
      </div>
      <PricingCards />
    </main>
  );
}
