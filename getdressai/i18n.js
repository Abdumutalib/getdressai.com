/**
 * UI locales + shopping region (Amazon host + AI “market” hints).
 * Persists: localStorage getdressai_locale, getdressai_region
 */

const LS_LOCALE = "getdressai_locale";
const LS_REGION = "getdressai_region";

/** @type {{ id: string, amazonHost: string }[]} */
export const REGION_OPTIONS = [
  { id: "GLOBAL", amazonHost: "www.amazon.com" },
  { id: "US", amazonHost: "www.amazon.com" },
  { id: "GB", amazonHost: "www.amazon.co.uk" },
  { id: "DE", amazonHost: "www.amazon.de" },
  { id: "FR", amazonHost: "www.amazon.fr" },
  { id: "ES", amazonHost: "www.amazon.es" },
  { id: "IT", amazonHost: "www.amazon.it" },
  { id: "UZ", amazonHost: "www.amazon.com" },
  { id: "KZ", amazonHost: "www.amazon.com" },
  { id: "RU", amazonHost: "www.amazon.com" },
  { id: "TR", amazonHost: "www.amazon.com.tr" },
  { id: "AE", amazonHost: "www.amazon.ae" },
  { id: "IN", amazonHost: "www.amazon.in" },
  { id: "JP", amazonHost: "www.amazon.co.jp" },
];

export const LOCALE_OPTIONS = [
  { code: "en", native: "English" },
  { code: "ru", native: "Русский" },
  { code: "uz", native: "Oʻzbekcha" },
];

/** English hints for the model (stable, not UI-translated). */
const REGION_AI_HINT = {
  GLOBAL:
    "Global / no single country: mainstream international brands; note sizing may vary.",
  US: "United States: typical US sizing, brands and retailers common in the US market.",
  GB: "United Kingdom: UK sizing, high-street and online retailers common in the UK.",
  DE: "Germany / DACH bias: EU sizing, brands common in Germany and Central Europe.",
  FR: "France: EU sizing, French and EU retail landscape.",
  ES: "Spain: EU sizing, Iberian retail.",
  IT: "Italy: EU sizing, Italian and EU brands.",
  UZ: "Uzbekistan: prioritize items realistically available in Tashkent/Samarkand malls, local chains, bazaars, and popular cross-border shopping; mark import-only pieces.",
  KZ: "Kazakhstan: malls in Almaty/Astana, local chains, marketplace apps; note cold-season needs.",
  RU: "Russia / CIS retail context where applicable: local chains, marketplaces, and realistic availability.",
  TR: "Türkiye: local brands, malls, and typical TR retail.",
  AE: "UAE / Gulf: malls, regional retailers, modest options where relevant.",
  IN: "India: common Indian retail, brands, and climate-appropriate pieces.",
  JP: "Japan: JP sizing and brands typical for Japan.",
};

const DICT = {
  en: {
    "doc.title": "GetdressAI — Outfit intelligence",
    "prefs.language": "Language",
    "prefs.region": "Region / shopping",
    "auth.tagline": "Minimal · Fast · Yours",
    "auth.heroKicker": "Wardrobe intelligence",
    "auth.heroTitle": "Outfits that feel designed for you.",
    "auth.heroBody":
      "Sign in with email, tune your style profile, generate looks with AI, save them to your wardrobe, and checkout curated products — all in one calm, premium experience.",
    "auth.signinTitle": "Sign in",
    "auth.signinHelp": "Use the email & password you registered in Supabase Auth.",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.continue": "Continue",
    "auth.signupSubmit": "Sign up",
    "auth.newHere": "New here?",
    "auth.createAccount": "Create an account",
    "auth.signupTitle": "Create account",
    "auth.signupHelp":
      "If email confirmation is on in Supabase, check your inbox after signing up.",
    "auth.passwordMin": "Password (min 6)",
    "auth.signinLink": "Sign in",
    "auth.working": "Working…",
    "auth.haveAccount": "Already have an account?",
    "nav.aiShort": "AI",
    "nav.saved": "Saved",
    "nav.shop": "Shop",
    "nav.cart": "Cart",
    "nav.orders": "Orders",
    "nav.profile": "Profile",
    "nav.aiLong": "AI generator",
    "nav.wardrobe": "Wardrobe",
    "nav.signOut": "Sign out",
    "gen.title": "AI outfit generator",
    "gen.body":
      "Describe a moment, season, or vibe. We blend it with your profile (gender, style, budget) and your region for tailored, locally realistic suggestions.",
    "gen.prompt": "Prompt",
    "gen.placeholder":
      "e.g. Summer outfit for men, office casual, light colors",
    "gen.submit": "Generate looks",
    "saved.title": "Wardrobe",
    "saved.body": "Outfits you saved from the generator.",
    "shop.title": "Shop",
    "shop.body":
      'Products from your Supabase <code class="rounded bg-neutral-100 px-1 text-xs">products</code> table.',
    "cart.title": "Cart",
    "cart.body":
      'Stored locally on this device for your account. Placing an order writes to <code class="rounded bg-neutral-100 px-1 text-xs">orders</code>.',
    "orders.title": "Orders",
    "orders.body": "Your order history.",
    "profile.title": "Profile",
    "profile.body":
      'Used to personalize AI suggestions (stored in <code class="rounded bg-neutral-100 px-1 text-xs">profiles</code>).',
    "profile.gender": "Gender / fit preference",
    "profile.genderPh": "e.g. Women, relaxed fit",
    "profile.style": "Style",
    "profile.stylePh": "e.g. Minimal, streetwear, quiet luxury",
    "profile.budget": "Budget",
    "profile.budgetPh": "e.g. Under $150 per piece",
    "profile.save": "Save profile",
    "shop.addCart": "Add to cart",
    "shop.noImage": "No image",
    "shop.emptyTitle": "No products yet",
    "shop.emptyBody": "Add rows in Supabase → Table Editor → products",
    "cart.emptyTitle": "Your cart is empty",
    "cart.emptyBody": "Browse the shop and add pieces you like.",
    "cart.remove": "Remove",
    "cart.placeOrder": "Place order",
    "cart.signInView": "Sign in to view your cart.",
    "cart.each": "each",
    "cart.qtyLabel": "Qty",
    "cart.totalLabel": "Total",
    "common.delete": "Delete",
    "orders.emptyTitle": "No orders yet",
    "orders.emptyBody": "Place an order from the cart to see it here.",
    "wardrobe.emptyTitle": "No saved outfits",
    "wardrobe.emptyBody": "Generate a look and tap “Save to wardrobe”.",
    "outfit.saveWardrobe": "Save to wardrobe",
    "outfit.shopAmazon": "Shop on Amazon",
    "outfit.lookLabel": "Look",
    "outfit.pieces": "Pieces",
    "outfit.tips": "Tips",
    "outfit.untitled": "Untitled",
    "outfit.savedDefaultTitle": "Outfit",
    "footer.text": "GetdressAI · Static + Supabase + AI ·",
    "footer.setup": "Setup guide",
    "toast.configIncomplete":
      "Set Supabase URL, anon key, and AI proxy in GETDRESSAI_CONFIG, then reload (see SETUP.md).",
    "toast.pwdShort": "Password must be at least 6 characters.",
    "toast.checkEmail": "Check your email to confirm your account.",
    "toast.accountCreated": "Account created. You're signed in.",
    "toast.welcome": "Welcome back.",
    "toast.signedOut": "Signed out.",
    "toast.profileLoadFail": "Could not load profile.",
    "toast.profileSaved": "Profile saved.",
    "toast.cartSignIn": "Sign in to use the cart.",
    "toast.productMissing": "Product not found.",
    "toast.addedCart": "Added to cart.",
    "toast.orderThanks": "Order placed. Thank you!",
    "toast.enterPrompt": "Enter a prompt.",
    "toast.sessionLoaded": "Loaded from this session.",
    "toast.showingSaved": "Showing saved outfit.",
    "toast.genOk": "Outfits generated.",
    "toast.genContext": "Outfits generated (with similar past context).",
    "toast.genFail": "Generation failed",
    "toast.saveSignIn": "Sign in to save outfits.",
    "toast.genFirst": "Generate outfits first.",
    "toast.savedWardrobe": "Saved to wardrobe.",
    "toast.outfitRemoved": "Outfit removed.",
    "region.GLOBAL": "Worldwide",
    "region.US": "United States",
    "region.GB": "United Kingdom",
    "region.DE": "Germany",
    "region.FR": "France",
    "region.ES": "Spain",
    "region.IT": "Italy",
    "region.UZ": "Uzbekistan",
    "region.KZ": "Kazakhstan",
    "region.RU": "Russia / CIS",
    "region.TR": "Türkiye",
    "region.AE": "UAE / Gulf",
    "region.IN": "India",
    "region.JP": "Japan",
  },
  ru: {
    "doc.title": "GetdressAI — стиль и образы",
    "prefs.language": "Язык",
    "prefs.region": "Регион / магазины",
    "auth.tagline": "Минимализм · Быстро · Ваше",
    "auth.heroKicker": "Интеллект гардероба",
    "auth.heroTitle": "Образы, созданные для вас.",
    "auth.heroBody":
      "Войдите по email, настройте профиль, генерируйте луки с AI, сохраняйте в гардероб и оформляйте заказы — в одном спокойном интерфейсе.",
    "auth.signinTitle": "Вход",
    "auth.signinHelp": "Email и пароль из Supabase Auth.",
    "auth.email": "Email",
    "auth.password": "Пароль",
    "auth.continue": "Продолжить",
    "auth.signupSubmit": "Зарегистрироваться",
    "auth.newHere": "Нет аккаунта?",
    "auth.createAccount": "Регистрация",
    "auth.signupTitle": "Регистрация",
    "auth.signupHelp":
      "Если в Supabase включено подтверждение email, проверьте почту после регистрации.",
    "auth.passwordMin": "Пароль (мин. 6)",
    "auth.signinLink": "Войти",
    "auth.working": "Подождите…",
    "auth.haveAccount": "Уже есть аккаунт?",
    "nav.aiShort": "AI",
    "nav.saved": "Сохр.",
    "nav.shop": "Магазин",
    "nav.cart": "Корзина",
    "nav.orders": "Заказы",
    "nav.profile": "Профиль",
    "nav.aiLong": "Генератор AI",
    "nav.wardrobe": "Гардероб",
    "nav.signOut": "Выйти",
    "gen.title": "Генератор образов",
    "gen.body":
      "Опишите повод, сезон или настроение. Учитываем профиль и регион, чтобы подсказки были реалистичны для ваших магазинов.",
    "gen.prompt": "Запрос",
    "gen.placeholder": "Напр. летний образ для офиса, мужской, светлые тона",
    "gen.submit": "Сгенерировать",
    "saved.title": "Гардероб",
    "saved.body": "Сохранённые из генератора образы.",
    "shop.title": "Магазин",
    "shop.body":
      'Товары из таблицы Supabase <code class="rounded bg-neutral-100 px-1 text-xs">products</code>.',
    "cart.title": "Корзина",
    "cart.body":
      'Локально на устройстве. Заказ пишется в <code class="rounded bg-neutral-100 px-1 text-xs">orders</code>.',
    "orders.title": "Заказы",
    "orders.body": "История заказов.",
    "profile.title": "Профиль",
    "profile.body":
      'Для персонализации AI (<code class="rounded bg-neutral-100 px-1 text-xs">profiles</code>).',
    "profile.gender": "Пол / посадка",
    "profile.genderPh": "Напр. Женский, оверсайз",
    "profile.style": "Стиль",
    "profile.stylePh": "Минимализм, стритвир",
    "profile.budget": "Бюджет",
    "profile.budgetPh": "Напр. до $150 за вещь",
    "profile.save": "Сохранить профиль",
    "shop.addCart": "В корзину",
    "shop.noImage": "Нет фото",
    "shop.emptyTitle": "Пока нет товаров",
    "shop.emptyBody": "Добавьте строки в Supabase → Table Editor → products",
    "cart.emptyTitle": "Корзина пуста",
    "cart.emptyBody": "Зайдите в магазин и добавьте товары.",
    "cart.remove": "Удалить",
    "cart.placeOrder": "Оформить заказ",
    "cart.signInView": "Войдите, чтобы видеть корзину.",
    "cart.each": "за шт.",
    "cart.qtyLabel": "Кол-во",
    "cart.totalLabel": "Итого",
    "common.delete": "Удалить",
    "orders.emptyTitle": "Заказов пока нет",
    "orders.emptyBody": "Оформите заказ из корзины.",
    "wardrobe.emptyTitle": "Нет сохранённых образов",
    "wardrobe.emptyBody": "Сгенерируйте образ и нажмите «Сохранить в гардероб».",
    "outfit.saveWardrobe": "Сохранить в гардероб",
    "outfit.shopAmazon": "Купить на Amazon",
    "outfit.lookLabel": "Образ",
    "outfit.pieces": "Вещи",
    "outfit.tips": "Советы",
    "outfit.untitled": "Без названия",
    "outfit.savedDefaultTitle": "Образ",
    "footer.text": "GetdressAI · Static + Supabase + AI ·",
    "footer.setup": "Настройка",
    "toast.configIncomplete":
      "Укажите URL Supabase, anon key и прокси AI в GETDRESSAI_CONFIG и перезагрузите страницу (см. SETUP.md).",
    "toast.pwdShort": "Пароль не короче 6 символов.",
    "toast.checkEmail": "Проверьте почту для подтверждения.",
    "toast.accountCreated": "Аккаунт создан. Вы вошли.",
    "toast.welcome": "С возвращением.",
    "toast.signedOut": "Вы вышли.",
    "toast.profileLoadFail": "Не удалось загрузить профиль.",
    "toast.profileSaved": "Профиль сохранён.",
    "toast.cartSignIn": "Войдите, чтобы использовать корзину.",
    "toast.productMissing": "Товар не найден.",
    "toast.addedCart": "Добавлено в корзину.",
    "toast.orderThanks": "Заказ оформлен. Спасибо!",
    "toast.enterPrompt": "Введите запрос.",
    "toast.sessionLoaded": "Показан недавний результат.",
    "toast.showingSaved": "Показан сохранённый образ.",
    "toast.genOk": "Образы сгенерированы.",
    "toast.genContext": "Образы сгенерированы (с учётом прошлого).",
    "toast.genFail": "Ошибка генерации",
    "toast.saveSignIn": "Войдите, чтобы сохранять образы.",
    "toast.genFirst": "Сначала сгенерируйте образы.",
    "toast.savedWardrobe": "Сохранено в гардероб.",
    "toast.outfitRemoved": "Образ удалён.",
    "region.GLOBAL": "Весь мир",
    "region.US": "США",
    "region.GB": "Великобритания",
    "region.DE": "Германия",
    "region.FR": "Франция",
    "region.ES": "Испания",
    "region.IT": "Италия",
    "region.UZ": "Узбекистан",
    "region.KZ": "Казахстан",
    "region.RU": "Россия / СНГ",
    "region.TR": "Турция",
    "region.AE": "ОАЭ / Персидский залив",
    "region.IN": "Индия",
    "region.JP": "Япония",
  },
  uz: {
    "doc.title": "GetdressAI — libos va uslub",
    "prefs.language": "Til",
    "prefs.region": "Hudud / do‘konlar",
    "auth.tagline": "Minimal · Tez · Sizniki",
    "auth.heroKicker": "Garderob intellekti",
    "auth.heroTitle": "Siz uchun tanlangan liboslar.",
    "auth.heroBody":
      "Email bilan kiring, profilni sozlang, AI bilan ko‘rinish yarating, garderobga saqlang va mahsulotlarni xarid qiling — bitta sokin interfeysda.",
    "auth.signinTitle": "Kirish",
    "auth.signinHelp": "Supabase Auth dagi email va parolingiz.",
    "auth.email": "Email",
    "auth.password": "Parol",
    "auth.continue": "Davom etish",
    "auth.signupSubmit": "Ro‘yxatdan o‘tish",
    "auth.newHere": "Yangi misiz?",
    "auth.createAccount": "Hisob ochish",
    "auth.signupTitle": "Hisob ochish",
    "auth.signupHelp":
      "Supabase da email tasdiqlash yoqilgan bo‘lsa, ro‘yxatdan keyin pochtani tekshiring.",
    "auth.passwordMin": "Parol (min. 6)",
    "auth.signinLink": "Kirish",
    "auth.working": "Kutilmoqda…",
    "auth.haveAccount": "Hisobingiz bormi?",
    "nav.aiShort": "AI",
    "nav.saved": "Saql.",
    "nav.shop": "Do‘kon",
    "nav.cart": "Savat",
    "nav.orders": "Buyurtma",
    "nav.profile": "Profil",
    "nav.aiLong": "AI generator",
    "nav.wardrobe": "Garderob",
    "nav.signOut": "Chiqish",
    "gen.title": "AI libos generatori",
    "gen.body":
      "Payt, fasl yoki kayfiyatni yozing. Profil va hududingiz bo‘yicha do‘konlarda amaliy maslahat beramiz.",
    "gen.prompt": "So‘rov",
    "gen.placeholder": "Masalan, yozgi ofis libosi, erkaklar, och ranglar",
    "gen.submit": "Ko‘rinishlar yaratish",
    "saved.title": "Garderob",
    "saved.body": "Generator dan saqlangan ko‘rinishlar.",
    "shop.title": "Do‘kon",
    "shop.body":
      'Supabase <code class="rounded bg-neutral-100 px-1 text-xs">products</code> jadvalidagi mahsulotlar.',
    "cart.title": "Savat",
    "cart.body":
      'Bu qurilmada mahalliy saqlanadi. Buyurtma <code class="rounded bg-neutral-100 px-1 text-xs">orders</code> ga yoziladi.',
    "orders.title": "Buyurtmalar",
    "orders.body": "Buyurtmalar tarixi.",
    "profile.title": "Profil",
    "profile.body":
      'AI shaxsiylashtirish uchun (<code class="rounded bg-neutral-100 px-1 text-xs">profiles</code>).',
    "profile.gender": "Jins / posadka",
    "profile.genderPh": "Masalan, Ayollar, relaxed",
    "profile.style": "Uslub",
    "profile.stylePh": "Minimal, streetwear",
    "profile.budget": "Byudjet",
    "profile.budgetPh": "Masalan, dona bo‘yicha $150 gacha",
    "profile.save": "Profilni saqlash",
    "shop.addCart": "Savatga",
    "shop.noImage": "Rasm yo‘q",
    "shop.emptyTitle": "Hozircha mahsulot yo‘q",
    "shop.emptyBody": "Supabase → Table Editor → products ga qo‘shing",
    "cart.emptyTitle": "Savat bo‘sh",
    "cart.emptyBody": "Do‘kondan mahsulot qo‘shing.",
    "cart.remove": "Olib tashlash",
    "cart.placeOrder": "Buyurtma berish",
    "cart.signInView": "Savatni ko‘rish uchun kiring.",
    "cart.each": "dona",
    "cart.qtyLabel": "Soni",
    "cart.totalLabel": "Jami",
    "common.delete": "O‘chirish",
    "orders.emptyTitle": "Buyurtmalar yo‘q",
    "orders.emptyBody": "Savatdan buyurtma bering.",
    "wardrobe.emptyTitle": "Saqlangan ko‘rinish yo‘q",
    "wardrobe.emptyBody": "Ko‘rinish yarating va «Garderobga saqlash» ni bosing.",
    "outfit.saveWardrobe": "Garderobga saqlash",
    "outfit.shopAmazon": "Amazon da ko‘rish",
    "outfit.lookLabel": "Ko‘rinish",
    "outfit.pieces": "Buyumlar",
    "outfit.tips": "Maslahatlar",
    "outfit.untitled": "Nomsiz",
    "outfit.savedDefaultTitle": "Ko‘rinish",
    "footer.text": "GetdressAI · Static + Supabase + AI ·",
    "footer.setup": "Sozlash",
    "toast.configIncomplete":
      "GETDRESSAI_CONFIG da Supabase URL, anon key va AI proksini sozlang, sahifani yangilang (SETUP.md).",
    "toast.pwdShort": "Parol kamida 6 belgi bo‘lsin.",
    "toast.checkEmail": "Tasdiqlash uchun pochtani tekshiring.",
    "toast.accountCreated": "Hisob yaratildi. Tizimga kirdingiz.",
    "toast.welcome": "Xush kelibsiz.",
    "toast.signedOut": "Chiqdingiz.",
    "toast.profileLoadFail": "Profil yuklanmadi.",
    "toast.profileSaved": "Profil saqlandi.",
    "toast.cartSignIn": "Savat uchun tizimga kiring.",
    "toast.productMissing": "Mahsulot topilmadi.",
    "toast.addedCart": "Savatga qo‘shildi.",
    "toast.orderThanks": "Buyurtma qabul qilindi. Rahmat!",
    "toast.enterPrompt": "So‘rov kiriting.",
    "toast.sessionLoaded": "Yaqinda yaratilgan natija ko‘rsatilmoqda.",
    "toast.showingSaved": "Saqlangan ko‘rinish ko‘rsatilmoqda.",
    "toast.genOk": "Ko‘rinishlar yaratildi.",
    "toast.genContext": "Ko‘rinishlar yaratildi (oldingi kontekst bilan).",
    "toast.genFail": "Yaratishda xato",
    "toast.saveSignIn": "Saqlash uchun tizimga kiring.",
    "toast.genFirst": "Avval ko‘rinish yarating.",
    "toast.savedWardrobe": "Garderobga saqlandi.",
    "toast.outfitRemoved": "Ko‘rinish o‘chirildi.",
    "region.GLOBAL": "Butun dunyo",
    "region.US": "AQSH",
    "region.GB": "Buyuk Britaniya",
    "region.DE": "Germaniya",
    "region.FR": "Fransiya",
    "region.ES": "Ispaniya",
    "region.IT": "Italiya",
    "region.UZ": "O‘zbekiston",
    "region.KZ": "Qozog‘iston",
    "region.RU": "Rossiya / MDH",
    "region.TR": "Turkiya",
    "region.AE": "BAA / Xalqaro",
    "region.IN": "Hindiston",
    "region.JP": "Yaponiya",
  },
};

export function getLocale() {
  const s = localStorage.getItem(LS_LOCALE);
  if (s && DICT[s]) return s;
  return "en";
}

export function setLocale(code) {
  if (DICT[code]) localStorage.setItem(LS_LOCALE, code);
}

export function getRegion() {
  const r = localStorage.getItem(LS_REGION);
  if (r && REGION_OPTIONS.some((x) => x.id === r)) return r;
  return "GLOBAL";
}

export function setRegion(id) {
  if (REGION_OPTIONS.some((x) => x.id === id)) {
    localStorage.setItem(LS_REGION, id);
  }
}

export function t(key) {
  const loc = getLocale();
  const pack = DICT[loc] || DICT.en;
  return pack[key] ?? DICT.en[key] ?? key;
}

export function getAmazonHost() {
  const id = getRegion();
  const row = REGION_OPTIONS.find((x) => x.id === id);
  return row?.amazonHost || "www.amazon.com";
}

export function regionHintForAI() {
  const id = getRegion();
  return REGION_AI_HINT[id] || REGION_AI_HINT.GLOBAL;
}

export function languageInstructionForAI() {
  const loc = getLocale();
  if (loc === "ru") return "Respond in Russian.";
  if (loc === "uz")
    return "Respond in Uzbek using Latin script (O‘zbek lotin alifbosi).";
  return "Respond in English.";
}

export function fillLocaleSelects() {
  const html = LOCALE_OPTIONS.map(
    (o) => `<option value="${o.code}">${o.native}</option>`
  ).join("");
  document.querySelectorAll("[data-locale-select]").forEach((sel) => {
    sel.innerHTML = html;
    sel.value = getLocale();
  });
}

export function fillRegionSelects() {
  document.querySelectorAll("[data-region-select]").forEach((sel) => {
    sel.innerHTML = REGION_OPTIONS.map(
      (r) => `<option value="${r.id}">${t("region." + r.id)}</option>`
    ).join("");
    sel.value = getRegion();
  });
}

export function applyI18n() {
  const loc = getLocale();
  document.documentElement.lang = loc === "uz" ? "uz" : loc === "ru" ? "ru" : "en";
  document.title = t("doc.title");

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (key) el.innerHTML = t(key);
  });

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    if (el.hasAttribute("data-i18n-html")) return;
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key && "placeholder" in el) el.placeholder = t(key);
  });

  document.querySelectorAll("[data-i18n-label]").forEach((el) => {
    const key = el.getAttribute("data-i18n-label");
    if (key) el.setAttribute("aria-label", t(key));
  });
}

/** Region option labels depend on locale — call after setLocale. */
export function refreshRegionOptions() {
  fillRegionSelects();
  document.querySelectorAll("[data-region-select]").forEach((sel) => {
    sel.value = getRegion();
  });
  document.querySelectorAll("[data-i18n-label]").forEach((el) => {
    const key = el.getAttribute("data-i18n-label");
    if (key) el.setAttribute("aria-label", t(key));
  });
}
