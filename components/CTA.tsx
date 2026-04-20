"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export function CTA() {
  const { t } = useLanguage();

  return (
    <section className="section-shell py-24">
      <div className="overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-accent to-[#847DFF] px-8 py-14 text-white shadow-glow sm:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">{t("cta.eyebrow")}</p>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t("cta.title")}</h2>
            <p className="max-w-2xl text-base leading-7 text-white/70">{t("cta.copy")}</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
            <Link
              href="/#studio"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-4 text-sm font-semibold text-slate-950"
            >
              {t("navbar.tryFree")}
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-4 text-sm font-semibold text-white"
            >
              {t("cta.unlock")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
