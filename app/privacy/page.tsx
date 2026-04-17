"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <main className="section-shell py-20">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="section-title">{t("privacy.title")}</h1>
        <p className="section-copy">{t("privacy.copy")}</p>
      </div>
    </main>
  );
}
