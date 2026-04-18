"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { UploadGenerator } from "@/components/UploadGenerator";
import { useLanguage } from "@/components/LanguageProvider";
import { trackEvent } from "@/lib/analytics";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-hero-radial py-16 sm:py-24">
      <div className="absolute inset-x-0 top-0 z-10 border-b border-accent/15 bg-accentSoft/80 backdrop-blur">
        <div className="section-shell flex min-h-12 items-center justify-center gap-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-accent sm:text-sm">
          <Sparkles className="size-4" />
          {t("hero.founderDrop")}
        </div>
      </div>
      <div className="grid-overlay absolute inset-0 opacity-60" />
      <div className="section-shell relative grid gap-12 pt-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/15 bg-accentSoft px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {t("hero.badge")}
          </div>
          <div className="space-y-6">
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
              {t("hero.title")}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{t("hero.copy")}</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              onClick={() => trackEvent("cta_clicked", { location: "hero_primary" })}
              className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-4 text-sm font-semibold text-white shadow-glow"
            >
              {t("navbar.tryFree")}
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link
              href="/examples"
              onClick={() => trackEvent("view_examples_clicked", { location: "hero_secondary" })}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-4 text-sm font-semibold text-slate-900 dark:border-white/15 dark:text-white"
            >
              <PlayCircle className="mr-2 size-4" />
              {t("hero.viewExamples")}
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-panel rounded-[1.75rem] px-5 py-4">
              <p className="text-2xl font-semibold text-slate-950 dark:text-white">100K+</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("hero.generatedLooks")}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] px-5 py-4">
              <p className="text-2xl font-semibold text-slate-950 dark:text-white">{t("hero.private")}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("hero.secureUploads")}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] px-5 py-4">
              <p className="text-2xl font-semibold text-slate-950 dark:text-white">12 sec</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("hero.fastOutput")}</p>
            </div>
          </div>

          <div className="grid gap-3 rounded-[2rem] border border-slate-200/80 bg-white/85 p-4 shadow-soft sm:grid-cols-3 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 text-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Private secure uploads</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{t("hero.trustUploadCopy")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="mt-0.5 size-5 text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Fast results</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{t("hero.trustFastCopy")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-5 text-accent" />
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Loved worldwide</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{t("hero.trustLovedCopy")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <BeforeAfterSlider beforeSrc="/examples/before.svg" afterSrc="/examples/luxury.svg" />
          <UploadGenerator />
        </div>
      </div>
    </section>
  );
}
