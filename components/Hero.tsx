"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, PlayCircle, Sparkles, Stars } from "lucide-react";
import { motion } from "framer-motion";
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
    tr: {
      kicker: "Küresel stil zekası",
      title: "Dünyanın en iyi stilistleri artık sizin için çalışıyor.",
      copy:
        "GetDressAI milyonlarca görünümü ve trendi analiz ederek vücut tipinize, fotoğrafınıza ve zevkinize uyan bir kombin oluşturur. Bir fotoğraf ve küresel stilin merkezindesiniz.",
      primaryCta: "İdeal kombnimi oluştur",
      secondaryCta: "Nasıl çalışır",
      proof: "Dünya standartlarında beğeni, anında eşleştirildi",
      proofSub: "Bir fotoğraf. Saniyeler içinde kesin bir cevap.",
      bullets: [
        "Bir fotoğraf yükleyin ve saniyeler içinde daha iyi bir görünüm önizleyin.",
        "Para harcamadan önce stilin vücut tipinize uyup uymadığını görün.",
        "Rastgele ilham yerine pazar yeri eşleşmeleri alın.",
      ],
      statOne: "Önizlenen kombinler",
      statTwo: "Ortalama ilk sonuç",
      statThree: "Özel yükleme akışı",
      socialProof: ["100K+ kombin önizlemesi", "Pazar yerine hazır eşleşmeler", "Varsayılan olarak özel"],
      previewTitle: "Kullanıcıların anında bilmek istediği şeyler",
      previewItems: [
        "Bu stil bana yakışır mı?",
        "Beden vücut tipimde doğru görünür mü?",
        "Önizlemeden hemen sonra benzer kıyafetleri bulabilir miyim?",
      ],
      floatingLabel: "En iyi ilk adım",
      floatingTitle: "Dönüşümle başlayın",
      floatingCopy: "Hero öncesi/sonrası vaadini satmalı. Jeneratör ilgi uyandıktan sonra gösterilmeli.",
    },
    es: {
      kicker: "Inteligencia de estilo global",
      title: "Los mejores estilistas del mundo ahora trabajan para ti.",
      copy:
        "GetDressAI analiza millones de looks y tendencias para crear un outfit que se adapta a tu cuerpo, foto y gusto. Una foto y estás en el centro del estilo global.",
      primaryCta: "Crear mi look ideal",
      secondaryCta: "Cómo funciona",
      proof: "Gusto de clase mundial, combinado al instante",
      proofSub: "Una foto. Una respuesta precisa en segundos.",
      bullets: [
        "Sube una foto y previsualiza un look mejor en segundos.",
        "Mira si el estilo se adapta a tu cuerpo antes de gastar dinero.",
        "Obtén coincidencias del mercado en vez de inspiración aleatoria.",
      ],
      statOne: "Outfits previsualizados",
      statTwo: "Primer resultado promedio",
      statThree: "Subida privada",
      socialProof: ["100K+ previsualizaciones", "Coincidencias de mercado", "Privado por defecto"],
      previewTitle: "Lo que la gente quiere saber al instante",
      previewItems: [
        "¿Me quedará bien este estilo?",
        "¿Se verá bien la talla en mi cuerpo?",
        "¿Puedo encontrar ropa similar justo después de la previsualización?",
      ],
      floatingLabel: "El mejor primer paso",
      floatingTitle: "Empieza con la transformación",
      floatingCopy: "El hero debe vender la promesa antes/después. El generador se muestra mejor después del interés.",
    },
    fr: {
      kicker: "Intelligence de style globale",
      title: "Les meilleurs stylistes du monde travaillent désormais pour vous.",
      copy:
        "GetDressAI analyse des millions de looks et tendances pour créer une tenue adaptée à votre morphologie, photo et goûts. Une photo et vous êtes au centre du style mondial.",
      primaryCta: "Créer mon look idéal",
      secondaryCta: "Comment ça marche",
      proof: "Un goût de classe mondiale, ajusté instantanément",
      proofSub: "Une photo. Une réponse précise en quelques secondes.",
      bullets: [
        "Ajoutez une photo et prévisualisez un meilleur look en quelques secondes.",
        "Voyez si le style correspond à votre morphologie avant de dépenser.",
        "Recevez des correspondances de marché au lieu d'inspirations aléatoires.",
      ],
      statOne: "Tenues prévisualisées",
      statTwo: "Premier résultat moyen",
      statThree: "Envoi privé",
      socialProof: ["100K+ prévisualisations", "Correspondances marché", "Privé par défaut"],
      previewTitle: "Ce que les gens veulent savoir instantanément",
      previewItems: [
        "Ce style me conviendra-t-il ?",
        "La taille sera-t-elle bien sur ma morphologie ?",
        "Puis-je trouver des vêtements similaires juste après la prévisualisation ?",
      ],
      floatingLabel: "Le meilleur premier pas",
      floatingTitle: "Commencez par la transformation",
      floatingCopy: "Le hero doit vendre la promesse avant/après. Le générateur est mieux présenté après l'intérêt.",
    },
    de: {
      kicker: "Globale Stil-Intelligenz",
      title: "Die besten Stylisten der Welt arbeiten jetzt für Sie.",
      copy:
        "GetDressAI analysiert Millionen von Looks und Trends, um ein Outfit zu erstellen, das zu Ihrem Körper, Foto und Geschmack passt. Ein Foto und Sie stehen im Zentrum des globalen Stils.",
      primaryCta: "Meinen idealen Look erstellen",
      secondaryCta: "Wie es funktioniert",
      proof: "Weltklasse-Geschmack, sofort abgestimmt",
      proofSub: "Ein Foto. Eine präzise Antwort in Sekunden.",
      bullets: [
        "Laden Sie ein Foto hoch und sehen Sie in Sekunden einen besseren Look.",
        "Sehen Sie, ob der Stil zu Ihrem Körper passt, bevor Sie Geld ausgeben.",
        "Erhalten Sie Marktplatz-Treffer statt zufälliger Inspiration.",
      ],
      statOne: "Outfits vorgeschaut",
      statTwo: "Durchschnittliches erstes Ergebnis",
      statThree: "Privater Upload",
      socialProof: ["100K+ Outfit-Vorschauen", "Marktplatz-Treffer", "Standardmäßig privat"],
      previewTitle: "Was Nutzer sofort wissen möchten",
      previewItems: [
        "Steht mir dieser Stil?",
        "Wird die Größe an meinem Körper richtig aussehen?",
        "Kann ich ähnliche Kleidung direkt nach der Vorschau finden?",
      ],
      floatingLabel: "Der beste erste Schritt",
      floatingTitle: "Beginnen Sie mit der Transformation",
      floatingCopy: "Der Hero muss das Vorher/Nachher-Versprechen verkaufen. Der Generator wird besser nach dem Interesse gezeigt.",
    },
    ar: {
      kicker: "ذكاء الأناقة العالمي",
      title: "أفضل مصممي الأزياء في العالم يعملون الآن من أجلك.",
      copy:
        "GetDressAI يحلل ملايين الإطلالات والاتجاهات لإنشاء إطلالة تناسب شكل جسمك وصورتك وذوقك. صورة واحدة وتصبح في قلب الموضة العالمية.",
      primaryCta: "ابتكر إطلالتي المثالية",
      secondaryCta: "كيف يعمل",
      proof: "ذوق عالمي المستوى، مُطابق فورياً",
      proofSub: "صورة واحدة. إجابة دقيقة في ثوانٍ.",
      bullets: [
        "ارفع صورة واحدة واستعرض إطلالة أفضل في ثوانٍ.",
        "تأكد أن الستايل يناسب جسمك قبل إنفاق المال.",
        "احصل على توصيات من المتاجر بدلاً من إلهام عشوائي.",
      ],
      statOne: "إطلالات مستعرضة",
      statTwo: "متوسط النتيجة الأولى",
      statThree: "رفع خاص",
      socialProof: ["100 ألف+ معاينة", "توصيات جاهزة للسوق", "خاص بشكل افتراضي"],
      previewTitle: "ما يريد المستخدمون معرفته فوراً",
      previewItems: [
        "هل سيناسبني هذا الستايل؟",
        "هل سيبدو المقاس صحيحاً على جسمي؟",
        "هل يمكنني العثور على ملابس مشابهة بعد المعاينة مباشرة؟",
      ],
      floatingLabel: "أفضل خطوة أولى",
      floatingTitle: "ابدأ بالتحول",
      floatingCopy: "يجب أن يبيع الهيرو وعد قبل/بعد. المولّد يُعرض بشكل أفضل بعد إثارة الاهتمام.",
    },
  } as const;

  const copy = marketingCopy[language as keyof typeof marketingCopy] ?? marketingCopy.en;

  return (
    <section className="hero-pattern relative overflow-hidden pb-20 pt-28 sm:pb-24 sm:pt-32 lg:pb-28 lg:pt-40">
      <div className="absolute left-[-4rem] top-10 h-72 w-72 rounded-full bg-fuchsia-300/35 blur-3xl" />
      <div className="absolute right-[-3rem] top-6 h-72 w-72 rounded-full bg-indigo-300/35 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-pink-300/25 blur-3xl" />

      <div className="absolute inset-x-0 top-20 z-20 border-b border-fuchsia-100/60 bg-white/55 backdrop-blur-xl">
        <div className="section-shell flex min-h-12 items-center justify-center gap-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-700 sm:text-sm">
          <Sparkles className="size-4" />
          {t("hero.founderDrop")}
        </div>
      </div>
      <div className="grid-overlay absolute inset-0 opacity-40" />
      <div className="section-shell relative grid gap-14 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="max-w-2xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-fuchsia-100 bg-fuchsia-50/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-700"
          >
            <Stars className="size-4" />
            {copy.kicker}
          </motion.div>
          <div className="space-y-5">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm font-semibold uppercase tracking-[0.18em] text-fuchsia-700"
            >
              {t("hero.badge")}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-[var(--font-heading)] max-w-5xl text-5xl font-extrabold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl dark:text-white"
            >
              {copy.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300"
            >
              {copy.copy}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 shadow-soft"
            >
              <CheckCircle2 className="size-4 text-emerald-500" />
              {copy.proof}
              <span className="text-slate-400 dark:text-slate-500">|</span>
              <span>{copy.proofSub}</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href="/#studio"
              onClick={() => trackEvent("cta_clicked", { location: "hero_primary" })}
              className="bg-gradient-brand inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition hover:-translate-y-1 hover:scale-[1.02] hover:shadow-fuchsia-500/40"
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
          </motion.div>

          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex -space-x-2">
              <div className="h-9 w-9 rounded-full border-2 border-white bg-[url('/examples/before.svg')] bg-cover bg-center" />
              <div className="h-9 w-9 rounded-full border-2 border-white bg-[url('/examples/luxury.svg')] bg-cover bg-center" />
              <div className="h-9 w-9 rounded-full border-2 border-white bg-[url('/examples/streetwear.svg')] bg-cover bg-center" />
            </div>
            <p>
              {t("hero.socialJoinPrefix")} <span className="font-semibold text-slate-900">10,000+</span> {t("hero.socialJoinSuffix")}
            </p>
          </div>

        </div>

        <div className="reveal-fade grid gap-6 lg:ml-auto">
          <div className="relative mx-auto w-full max-w-full lg:max-w-md">
            <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-r from-fuchsia-400/20 to-indigo-400/20 blur-xl" />
            <BeforeAfterSlider beforeSrc={marketingImages.before} afterSrc={marketingImages.luxury} />
            <div className="absolute -bottom-5 -left-5 rounded-[1.5rem] bg-white px-4 py-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">{t("hero.processingLabel")}</p>
                  <p className="text-sm font-bold text-slate-900">{t("hero.processingValue")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
