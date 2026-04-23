"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, PlayCircle, Sparkles, Stars } from "lucide-react";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { useLanguage } from "@/components/LanguageProvider";
import { trackEvent } from "@/lib/analytics";
import { marketingImages } from "@/lib/marketing-images";

export function Hero() {
  const { t, language } = useLanguage();
  const marketingCopy = {
    en: {
      kicker: "Global styling intelligence",
      title: "The world’s best stylists are now working for you.",
      copy:
        "GetDressAI analyzes millions of looks and trends to create an outfit that fits your body shape, photo, and taste. One photo and you step into the center of global style.",
      primaryCta: "Create my ideal look",
      secondaryCta: "See how it works",
      proof: "World-class taste, instantly matched",
      proofSub: "One photo. A sharper answer in seconds.",
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
      kicker: "Глобальный интеллект стиля",
      title: "Лучшие стилисты мира теперь работают для вас.",
      copy:
        "GetDressAI анализирует миллионы образов и трендов, чтобы собрать стиль, который подходит именно вашей фигуре, фото и вкусу. Одно фото и вы уже в центре глобальной моды.",
      primaryCta: "Создать мой идеальный образ",
      secondaryCta: "Как это работает",
      proof: "Сильный вкус, подобранный мгновенно",
      proofSub: "Одно фото и точный результат за секунды.",
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
      kicker: "Глобал услуб интеллекти",
      title: "Бутун дунё стилистлари энди сизнинг хизматингизда.",
      copy:
        "GetDressAI миллионлаб услублар ва трендларни таҳлил қилиб, айнан сизнинг қоматингиз, суратиңиз ва дидингизга мос образ яратади. Битта сурат ва сиз глобал мода марказидасиз.",
      primaryCta: "Идеал образимни ярат",
      secondaryCta: "Қандай ишлайди",
      proof: "Дунё даражасидаги дид, сизга мосланган ҳолда",
      proofSub: "Битта сурат ва сонияларда аниқ жавоб.",
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
    <section className="hero-pattern relative overflow-hidden pb-20 pt-28 sm:pb-24 sm:pt-32 lg:pb-28 lg:pt-40">
      <div className="absolute left-[-4rem] top-10 h-72 w-72 rounded-full bg-fuchsia-300/35 blur-3xl" />
      <div className="absolute right-[-3rem] top-6 h-72 w-72 rounded-full bg-indigo-300/35 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-pink-300/25 blur-3xl" />

      <div className="absolute inset-x-0 top-0 z-10 border-b border-fuchsia-100/60 bg-white/55 backdrop-blur-xl">
        <div className="section-shell flex min-h-12 items-center justify-center gap-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-700 sm:text-sm">
          <Sparkles className="size-4" />
          {t("hero.founderDrop")}
        </div>
      </div>
      <div className="grid-overlay absolute inset-0 opacity-40" />
      <div className="section-shell relative grid gap-14 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="reveal-fade max-w-2xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-100 bg-fuchsia-50/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-700">
            <Stars className="size-4" />
            {copy.kicker}
          </div>
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-fuchsia-700">{t("hero.badge")}</p>
            <h1 className="font-[var(--font-heading)] max-w-5xl text-5xl font-extrabold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
              {copy.title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">{copy.copy}</p>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 shadow-soft">
              <CheckCircle2 className="size-4 text-emerald-500" />
              {copy.proof}
              <span className="text-slate-400 dark:text-slate-500">|</span>
              <span>{copy.proofSub}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="#studio"
              onClick={() => trackEvent("cta_clicked", { location: "hero_primary" })}
              className="bg-gradient-brand inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition hover:-translate-y-1"
            >
              {copy.primaryCta}
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => trackEvent("view_examples_clicked", { location: "hero_secondary" })}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-4 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            >
              <PlayCircle className="mr-2 size-4" />
              {copy.secondaryCta}
            </Link>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex -space-x-2">
              <div className="h-9 w-9 rounded-full border-2 border-white bg-[url('/examples/before.svg')] bg-cover bg-center" />
              <div className="h-9 w-9 rounded-full border-2 border-white bg-[url('/examples/luxury.svg')] bg-cover bg-center" />
              <div className="h-9 w-9 rounded-full border-2 border-white bg-[url('/examples/streetwear.svg')] bg-cover bg-center" />
            </div>
            <p>
              Joined by <span className="font-semibold text-slate-900">10,000+</span> fashion lovers
            </p>
          </div>

        </div>

        <div className="reveal-fade grid gap-6 lg:ml-auto">
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-r from-fuchsia-400/20 to-indigo-400/20 blur-xl" />
            <BeforeAfterSlider beforeSrc={marketingImages.before} afterSrc={marketingImages.luxury} />
            <div className="absolute -bottom-5 -left-5 rounded-[1.5rem] bg-white px-4 py-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Processing Time</p>
                  <p className="text-sm font-bold text-slate-900">Under 5 seconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
