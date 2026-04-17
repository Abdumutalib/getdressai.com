"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <main className="section-shell py-20">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="section-title">{t("terms.title")}</h1>
        <p className="section-copy">{t("terms.copy")}</p>
      </div>
    </main>
  );
}
