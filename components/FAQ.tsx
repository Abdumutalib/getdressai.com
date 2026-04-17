"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function FAQ() {
  const { t, tm } = useLanguage();
  const faqs = tm<{ q: string; a: string }[]>("faq.items");

  return (
    <section className="section-shell py-24">
      <div className="mb-12 max-w-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t("faq.eyebrow")}</p>
        <h2 className="section-title">{t("faq.title")}</h2>
      </div>
      <div className="grid gap-4">
        {faqs.map((faq) => (
          <details key={faq.q} className="glass-panel rounded-[2rem] px-6 py-5">
            <summary className="cursor-pointer list-none text-lg font-semibold text-slate-950 dark:text-white">
              {faq.q}
            </summary>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
