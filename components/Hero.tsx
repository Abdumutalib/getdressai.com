"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, PlayCircle, ShieldCheck, Sparkles, Stars, Zap } from "lucide-react";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { useLanguage } from "@/components/LanguageProvider";
import { trackEvent } from "@/lib/analytics";
import { marketingImages } from "@/lib/marketing-images";

export function Hero() {
  const { t, language } = useLanguage();
  const marketingCopy = {
    en: {
      kicker: "Result-first outfit try-on",
      title: "See how the right outfit looks on you before you buy it.",
      copy:
        "GetDressAI matches clothes to your photo, body shape, and style so the first screen sells the outcome, not the tool.",
      primaryCta: "Try it free",
      secondaryCta: "See how it works",
      proof: "No stylist needed",
      proofSub: "Upload once, get a cleaner answer fast.",
      bullets: [
        "Upload one photo and preview a better look in seconds.",
        "See size-aware outfit ideas before spending money.",
        "Use marketplace matches instead of random inspiration.",
      ],
      statOne: "Outfits previewed",
      statTwo: "Average first result",
      statThree: "Private upload flow",
      socialProof: ["100K+ outfit previews", "Marketplace-ready matches", "Private by default"],
      previewTitle: "What users want to know instantly",
      previewItems: [
        "Will this style suit me?",
        "Will the size look right on my body shape?",
        "Can I find similar clothes right after the preview?",
      ],
      floatingLabel: "Best first step",
      floatingTitle: "Lead with the transformation",
      floatingCopy: "Let the hero show the before/after promise. The generator can come after the sale is made.",
    },
    ru: {
      kicker: "Примерка, которая продает результат",
      title: "Сразу покажите, как подходящий образ выглядит именно на вас.",
      copy:
        "GetDressAI подбирает одежду под фото, фигуру и стиль, поэтому первый экран должен продавать итог, а не выглядеть как панель инструмента.",
      primaryCta: "Попробовать бесплатно",
      secondaryCta: "Как это работает",
      proof: "Без стилиста и догадок",
      proofSub: "Одно фото и понятный результат за секунды.",
      bullets: [
        "Загрузите одно фото и сразу увидите более сильный образ.",
        "Сначала поймите, подходит ли стиль вашей фигуре, а потом тратьте деньги.",
        "Получайте похожие товары из маркетплейсов вместо случайных идей.",
      ],
      statOne: "Примерок сделано",
      statTwo: "До первого результата",
      statThree: "Приватная загрузка",
      socialProof: ["100K+ примерок", "Подбор под маркетплейсы", "Приватно по умолчанию"],
      previewTitle: "Что человек хочет понять с первого взгляда",
      previewItems: [
        "Пойдет ли мне этот стиль?",
        "Будет ли это смотреться правильно на моей фигуре?",
        "Смогу ли я сразу найти похожую одежду?",
      ],
      floatingLabel: "Лучший первый экран",
      floatingTitle: "Сначала трансформация, потом инструмент",
      floatingCopy: "Hero должен продавать обещание до и после. Сам генератор лучше показывать уже после появления интереса.",
    },
    uz: {
      kicker: "Натижани сотадиган try-on",
      title: "Аввал кийим сизда қандай кўринишини кўрсатинг, кейин сотиб олинг.",
      copy:
        "GetDressAI кийимни фото, қомат ва услубга мослайди. Шунинг учун биринчи экран инструмент эмас, натижани сотиши керак.",
      primaryCta: "Бепул синаб кўриш",
      secondaryCta: "Қандай ишлайди",
      proof: "Стилистсиз ҳам аниқроқ танлов",
      proofSub: "Битта фото ва бир неча сонияда тушунарли жавоб.",
      bullets: [
        "Битта фото юкланг ва дарров яхшироқ образни кўринг.",
        "Пул сарфлашдан олдин услуб қоматингизга мосми-йўқми билиб олинг.",
        "Тасодифий илҳом эмас, маркетплейсдан мос вариантларни олинг.",
      ],
      statOne: "Кўрилган образлар",
      statTwo: "Биринчи натижа вақти",
      statThree: "Хавфсиз юклаш",
      socialProof: ["100K+ примерка", "Маркетплейсга тайёр мослик", "Стандарт ҳолатда приват"],
      previewTitle: "Фойдаланувчи биринчи қарашда нимани билиши керак",
      previewItems: [
        "Бу услуб менга ярашадими?",
        "Ўлчам қоматимда тўғри кўринадими?",
        "Шунга ўхшаш кийимни дарров топа оламанми?",
      ],
      floatingLabel: "Энг тўғри биринчи қадам",
      floatingTitle: "Аввал трансформацияни кўрсатинг",
      floatingCopy: "Hero до/после натижани сотиши керак. Генераторни қизиқиш уйғонгандан кейин бериш тўғрироқ.",
    },
  } as const;

  const copy = marketingCopy[language as keyof typeof marketingCopy] ?? marketingCopy.en;

  return (
    <section className="relative overflow-hidden bg-hero-radial py-16 sm:py-24">
      <div className="absolute inset-x-0 top-0 z-10 border-b border-accent/15 bg-accentSoft/80 backdrop-blur">
        <div className="section-shell flex min-h-12 items-center justify-center gap-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-accent sm:text-sm">
          <Sparkles className="size-4" />
          {t("hero.founderDrop")}
        </div>
      </div>
      <div className="grid-overlay absolute inset-0 opacity-60" />
      <div className="section-shell relative grid gap-14 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/15 bg-accentSoft px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <Stars className="size-4" />
            {copy.kicker}
          </div>
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">{t("hero.badge")}</p>
            <h1 className="max-w-5xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
              {copy.title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{copy.copy}</p>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-soft dark:bg-white/10 dark:text-slate-200">
              <CheckCircle2 className="size-4 text-emerald-500" />
              {copy.proof}
              <span className="text-slate-400 dark:text-slate-500">|</span>
              <span>{copy.proofSub}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="#demo"
              onClick={() => trackEvent("cta_clicked", { location: "hero_primary" })}
              className="btn-primary inline-flex items-center justify-center rounded-full px-6 py-4 text-sm font-semibold"
            >
              {copy.primaryCta}
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => trackEvent("view_examples_clicked", { location: "hero_secondary" })}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-4 text-sm font-semibold text-slate-900 dark:border-white/15 dark:text-white"
            >
              <PlayCircle className="mr-2 size-4" />
              {copy.secondaryCta}
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {copy.socialProof.map((item) => (
              <div
                key={item}
                className="rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600 shadow-soft dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="glass-panel rounded-[1.75rem] px-5 py-4">
              <p className="text-2xl font-semibold text-slate-950 dark:text-white">100K+</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{copy.statOne}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] px-5 py-4">
              <p className="text-2xl font-semibold text-slate-950 dark:text-white">12 sec</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{copy.statTwo}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] px-5 py-4">
              <p className="text-2xl font-semibold text-slate-950 dark:text-white">{t("hero.private")}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{copy.statThree}</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">{copy.previewTitle}</p>
            <div className="mt-4 grid gap-3">
              {copy.bullets.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[1.25rem] bg-slate-50/90 px-4 py-3 dark:bg-white/5">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                  <p className="text-sm text-slate-700 dark:text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="relative">
            <BeforeAfterSlider beforeSrc={marketingImages.before} afterSrc={marketingImages.luxury} />
            <div className="absolute -bottom-5 left-5 right-5 rounded-[1.75rem] border border-white/70 bg-white/92 p-5 shadow-soft backdrop-blur dark:border-white/10 dark:bg-slate-950/85">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{copy.floatingLabel}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{copy.floatingTitle}</h3>
                </div>
                <ShieldCheck className="size-6 shrink-0 text-emerald-500" />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{copy.floatingCopy}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
            {copy.previewItems.map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-[1.25rem] bg-slate-50 px-4 py-3 dark:bg-slate-900/60">
                <div className="flex size-8 items-center justify-center rounded-full bg-accentSoft text-sm font-semibold text-accent">
                  {index + 1}
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item}</p>
              </div>
            ))}
            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-[1.25rem] border border-slate-200/80 px-4 py-3 dark:border-white/10">
                <Zap className="mt-0.5 size-5 shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{t("hero.trustFastTitle")}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{t("hero.trustFastCopy")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-[1.25rem] border border-slate-200/80 px-4 py-3 dark:border-white/10">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{t("hero.trustUploadTitle")}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{t("hero.trustUploadCopy")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
