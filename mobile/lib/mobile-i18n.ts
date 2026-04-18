import { LEGACY_EN, LEGACY_RU, LEGACY_UZ } from './legacy-app-i18n';
import { syncedProductCopy } from '../../shared/synced-product-copy';

export const LANG_IDS = ['en', 'es', 'fr', 'pt', 'ar', 'de', 'ru', 'uz'] as const;
export type AppLangId = (typeof LANG_IDS)[number];

export const LANG_OPTIONS: { id: AppLangId; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
  { id: 'fr', label: 'Français' },
  { id: 'pt', label: 'Português' },
  { id: 'ar', label: 'العربية' },
  { id: 'de', label: 'Deutsch' },
  { id: 'ru', label: 'Русский' },
  { id: 'uz', label: "O'zbekcha" },
];

const EN: Record<string, string> = {
  langLabel: 'Language',

  tabLooks: 'Looks',
  tabStudio: 'Studio',
  tabStyleHub: 'Style Hub',
  tabTryOn: 'Try-on',

  homeKicker: 'GetDressAI',
  homeTitle: 'One wardrobe story across web and mobile.',
  homeSubtitle:
    'Discover looks, preview try-on results, and move from inspiration to shopping without switching to a different product mindset.',
  homeMetricTryOnTitle: 'Try-On',
  homeMetricTryOnBody: 'Upload your photo and test an outfit.',
  homeMetricWardrobeTitle: 'Wardrobe',
  homeMetricWardrobeBody: 'Keep saved looks and repeatable style cues.',
  homeSectionPromise: 'Core product promise',
  homeCard1Title: 'AI looks that feel wearable',
  homeCard1Body:
    'Start from your occasion, preferred fit, and vibe. GetDressAI turns that into look ideas you can actually use.',
  homeCard2Title: 'Wardrobe-first guidance',
  homeCard2Body: 'Save what you like, compare ideas, and keep one product story across the mobile app and the website.',
  homeCard3Title: 'Premium when you need more',
  homeCard3Body:
    'Free users can explore the core flow. Premium unlocks more generations, deeper try-on sessions, and richer styling help.',
  homeSectionHow: 'How to use this app',
  homeStep1: 'Open Try-On to test one look with your own photo.',
  homeStep2: 'Use Style Hub to review wardrobe, marketplace, and premium sections.',
  homeStep3: 'Sign in to keep the same identity and product story across devices.',

  exploreKicker: 'Style Hub',
  exploreTitle: 'The same product language as the website.',
  exploreSubtitle:
    'This tab mirrors the web experience: wardrobe, marketplace, premium, and profile all live inside one clear fashion workflow.',
  exploreWardrobeTitle: 'Wardrobe',
  exploreWardrobeBody: 'Save strong looks, remember fit notes, and keep your personal style history in one place.',
  exploreMarketplaceTitle: 'Marketplace',
  exploreMarketplaceBody:
    'Move from inspiration to product discovery with a shopping-oriented flow similar to the website.',
  explorePremiumTitle: 'Premium',
  explorePremiumBody: 'Use premium when you want more generations, longer sessions, and deeper styling support.',
  exploreProfileTitle: 'Profile',
  exploreProfileBody: 'Keep one identity, one plan, and one product promise across mobile and web.',
  exploreWorkflowEyebrow: 'Pro workflow',
  exploreWorkflowCopy: 'Generate, track, and monetize every look.',
  explorePopularStylesTitle: 'Popular styles',
  explorePopularStylesBody: 'Mobile and web now use the same style names so updates stay in sync.',
  presetLuxury: 'Luxury',
  presetStreetwear: 'Streetwear',
  presetWedding: 'Wedding',
  presetOffice: 'Office',
  presetGym: 'Gym',
  presetAnime: 'Anime',
  presetCelebrity: 'Celebrity',
  presetCasual: 'Casual',
  exploreNoteTitle: 'Alignment note',
  exploreNoteBody:
    'The website signs in with Supabase; keep the mobile app on the same Supabase project so your account and language choice stay in sync.',

  tryonKicker: 'GetDressAI Try-On',
  tryonTitle: 'Virtual try-on',
  tryonHint:
    'Upload your photo, choose the garment type, and preview a wearable look that fits the same try-on story shown on the website.',
  tryonStep1: '1. Choose your photo',
  tryonStep2: '2. Garment type',
  tryonGarmentUpper: 'Upper',
  tryonGarmentLower: 'Lower',
  tryonGarmentDress: 'Dress',
  tryonStep3: '3. Generate try-on preview',
  tryonResultTitle: 'Result',
  tryonResultHint: 'Use this preview to decide what belongs in your wardrobe, premium session, or next shopping step.',

  alertPermTitle: 'Permission',
  alertPermBody: 'Photo library access is required.',
  alertTryonTitle: 'Try-on',
  alertTryonNeedPhoto: 'Choose a photo of yourself first.',
  alertVtonTitle: 'VTON',

  ...LEGACY_EN,
};

const RU: Partial<Record<string, string>> = {
  langLabel: 'Язык',
  tabLooks: 'Луки',
  tabStudio: 'Студия',
  tabStyleHub: 'Стиль',
  tabTryOn: 'Примерка',
  homeTitle: 'Один гардероб на сайте и в приложении.',
  homeSubtitle:
    'Смотрите образы, пробуйте примерку и переходите к покупкам в одном сценарии, как на сайте GetDressAI.',
  homeMetricTryOnTitle: 'Примерка',
  homeMetricTryOnBody: 'Загрузите фото и проверьте образ.',
  homeMetricWardrobeTitle: 'Гардероб',
  homeMetricWardrobeBody: 'Сохраняйте луки и заметки по посадке.',
  homeSectionPromise: 'Что даёт продукт',
  homeCard1Title: 'Образы, которые можно носить',
  homeCard1Body: 'От повода, посадки и настроения — к идеям луков, которые реально купить и собрать.',
  homeCard2Title: 'Сначала гардероб',
  homeCard2Body: 'Сохраняйте понравившееся и ведите одну историю между приложением и сайтом.',
  homeCard3Title: 'Premium по необходимости',
  homeCard3Body: 'Бесплатно — базовый сценарий; Premium — больше генераций и глубже стилизация.',
  homeSectionHow: 'Как пользоваться',
  homeStep1: 'Откройте «Примерка» и загрузите своё фото.',
  homeStep2: 'В «Стиль» — разделы гардероба, маркетплейса и Premium.',
  homeStep3: 'Войдите в аккаунт, чтобы синхронизировать данные между устройствами.',
  exploreTitle: 'Те же разделы, что и на сайте.',
  exploreSubtitle: 'Гардероб, маркетплейс, Premium и профиль — в одном понятном потоке.',
  exploreWardrobeTitle: 'Гардероб',
  exploreWardrobeBody: 'Сохраняйте сильные образы и историю стиля.',
  exploreMarketplaceTitle: 'Маркетплейс',
  exploreMarketplaceBody: 'От идеи к товарам, как на сайте.',
  explorePremiumTitle: 'Premium',
  explorePremiumBody: 'Больше генераций и дольше сессии, когда нужно.',
  exploreProfileTitle: 'Профиль',
  exploreProfileBody: 'Один аккаунт и план на телефоне и в вебе.',
  exploreWorkflowEyebrow: 'Профи-режим',
  exploreWorkflowCopy: 'Создавайте, отслеживайте и монетизируйте каждый образ.',
  explorePopularStylesTitle: 'Популярные стили',
  explorePopularStylesBody: 'Мобильное приложение и сайт теперь используют одинаковые названия стилей.',
  presetLuxury: 'Роскошь',
  presetStreetwear: 'Стритвир',
  presetWedding: 'Свадьба',
  presetOffice: 'Офис',
  presetGym: 'Спортзал',
  presetAnime: 'Аниме',
  presetCelebrity: 'Знаменитость',
  presetCasual: 'Повседневный',
  exploreNoteTitle: 'Совместимость',
  exploreNoteBody:
    'Сайт использует Supabase — подключите то же приложение Supabase в мобильной сборке, чтобы аккаунт и язык совпадали.',
  tryonTitle: 'Виртуальная примерка',
  tryonHint: 'Фото, тип вещи и превью — в одной логике с сайтом.',
  tryonStep1: '1. Выберите фото',
  tryonStep2: '2. Тип вещи',
  tryonGarmentUpper: 'Верх',
  tryonGarmentLower: 'Низ',
  tryonGarmentDress: 'Платье',
  tryonStep3: '3. Сгенерировать превью',
  tryonResultTitle: 'Результат',
  tryonResultHint: 'Оцените превью перед сохранением в гардероб или покупкой.',
  alertPermTitle: 'Доступ',
  alertPermBody: 'Нужен доступ к фотогалерее.',
  alertTryonTitle: 'Примерка',
  alertTryonNeedPhoto: 'Сначала выберите фото.',
  alertVtonTitle: 'VTON',

  ...LEGACY_RU,
};

const UZ: Partial<Record<string, string>> = {
  langLabel: 'Til',
  tabLooks: 'Liboslar',
  tabStudio: 'Studiya',
  tabStyleHub: 'Uslub',
  tabTryOn: "Kiyib ko'rish",
  homeTitle: 'Veb va mobil ilovada bitta garderob hikoyasi.',
  homeSubtitle: "Libos g'oyalari, kiyib ko'rish natijasi va xarid — bitta oqimda, saytdagi bilan bir xil.",
  homeMetricTryOnTitle: "Kiyib ko'rish",
  homeMetricTryOnBody: 'Surat yuklab, libosni sinab ko‘ring.',
  homeMetricWardrobeTitle: 'Garderob',
  homeMetricWardrobeBody: 'Saqlangan looklar va uslub eslatmalari.',
  homeSectionPromise: 'Ilova nimani beradi',
  homeCard1Title: "Kiyish mumkin bo'lgan AI looklar",
  homeCard1Body: "Voqea, posadka va kayfiyatdan — haqiqiy libos g'oyalariga.",
  homeCard2Title: 'Avval garderob',
  homeCard2Body: 'Yoqqanini saqlang; mobil va sayt bir hikoya.',
  homeCard3Title: "Kerak bo'lganda Premium",
  homeCard3Body: "Bepul — asosiy oqim; Premium — ko'proq generatsiya va chuqurroq yordam.",
  homeSectionHow: 'Ilovadan foydalanish',
  homeStep1: "«Kiyib ko'rish»da o'z suratingiz bilan sinab ko'ring.",
  homeStep2: "«Uslub»da garderob, marketpleys va Premium.",
  homeStep3: "Hisobga kiring — qurilmalar o'rtasida sinxron bo'ladi.",
  exploreTitle: "Saytdagi bilan bir xil bo'limlar.",
  exploreSubtitle: 'Garderob, marketpleys, Premium va profil — bitta tushunarli oqimda.',
  exploreWardrobeTitle: 'Garderob',
  exploreWardrobeBody: 'Kuchli looklar va shaxsiy uslub tarixini saqlang.',
  exploreMarketplaceTitle: 'Marketpleys',
  exploreMarketplaceBody: "Ilhomdan mahsulotgacha, saytdagidek.",
  explorePremiumTitle: 'Premium',
  explorePremiumBody: "Ko'proq generatsiya va uzoqroq seanslar.",
  exploreProfileTitle: 'Profil',
  exploreProfileBody: 'Bitta akkaunt va reja — mobil va veb.',
  exploreWorkflowEyebrow: 'Pro ish oqimi',
  exploreWorkflowCopy: "Har bir lookni yarating, kuzating va monetizatsiya qiling.",
  explorePopularStylesTitle: 'Mashhur uslublar',
  explorePopularStylesBody: 'Mobil ilova va sayt endi bir xil style nomlaridan foydalanadi.',
  presetLuxury: 'Hashamat',
  presetStreetwear: 'Streetwear',
  presetWedding: "To'y",
  presetOffice: 'Ofis',
  presetGym: 'Sport',
  presetAnime: 'Anime',
  presetCelebrity: 'Mashhur uslub',
  presetCasual: 'Kundalik',
  exploreNoteTitle: 'Moslashuv',
  exploreNoteBody: 'Sayt Supabase orqali kiradi — mobil qurilmada ham xuddi shu Supabase loyihasini ulang.',
  tryonTitle: "Virtual kiyib ko'rish",
  tryonHint: "Surat, kiyim turi va ko'rinish — sayt bilan bir xil mantiqda.",
  tryonStep1: '1. Suratni tanlang',
  tryonStep2: '2. Kiyim turi',
  tryonGarmentUpper: 'Yuqori',
  tryonGarmentLower: 'Pastki',
  tryonGarmentDress: "Ko'ylak / platye",
  tryonStep3: "3. Ko'rinishni yaratish",
  tryonResultTitle: 'Natija',
  tryonResultHint: 'Garderob yoki keyingi xarid qadamiga qarab baholang.',
  alertPermTitle: 'Ruxsat',
  alertPermBody: 'Galereyaga ruxsat kerak.',
  alertTryonTitle: "Kiyib ko'rish",
  alertTryonNeedPhoto: "Avval o'z suratingizni tanlang.",
  alertVtonTitle: 'VTON',

  ...LEGACY_UZ,
};

const PARTIAL: Record<AppLangId, Partial<Record<string, string>>> = {
  en: {},
  es: {},
  fr: {},
  pt: {},
  ar: {},
  de: {},
  ru: RU,
  uz: UZ,
};

function buildMobileStrings(): Record<AppLangId, Record<string, string>> {
  const out = {} as Record<AppLangId, Record<string, string>>;
  for (const id of LANG_IDS) {
    const synced = syncedProductCopy[id] ?? syncedProductCopy.en;
    out[id] = {
      ...EN,
      ...(PARTIAL[id] || {}),
      exploreWorkflowEyebrow: synced.workflowEyebrow,
      exploreWorkflowCopy: synced.workflowCopy,
      presetLuxury: synced.presets[0],
      presetStreetwear: synced.presets[1],
      presetWedding: synced.presets[2],
      presetOffice: synced.presets[3],
      presetGym: synced.presets[4],
      presetAnime: synced.presets[5],
      presetCelebrity: synced.presets[6],
      presetCasual: synced.presets[7]
    } as Record<string, string>;
  }
  return out;
}

export const MOBILE_STRINGS = buildMobileStrings();

export function isSupportedLang(id: string): id is AppLangId {
  return (LANG_IDS as readonly string[]).includes(id);
}
