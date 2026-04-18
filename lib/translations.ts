export const supportedLanguages = ["en", "ru", "uz", "tr", "es", "fr", "de", "ar"] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

const examplePresets = ["Luxury", "Streetwear", "Wedding", "Office", "Gym", "Anime", "Celebrity", "Casual"];

export const translations = {
  en: {
    navbar: {
      pricing: "Pricing",
      examples: "Examples",
      referrals: "Referrals",
      login: "Login",
      tryFree: "Try free"
    },
    footer: {
      description: "Try clothes on your photo with AI.",
      product: "Product",
      company: "Company",
      growth: "Growth",
      dashboard: "Dashboard",
      referralProgram: "Referral program",
      copyright: "© 2026 GetDressAI"
    },
    hero: {
      badge: "AI outfit try-on",
      title: "Try Any Outfit on Your Photo in Seconds",
      copy: "Upload your photo, pick a style, and get a new look fast.",
      watchDemo: "Watch demo",
      founderDrop: "30% off Starter this week",
      viewExamples: "View examples",
      generatedLooks: "Looks made",
      private: "Private",
      secureUploads: "Safe uploads",
      fastOutput: "Fast results",
      trustUploadTitle: "Private secure uploads",
      trustFastTitle: "Fast results",
      trustLovedTitle: "Loved worldwide",
      trustUploadCopy: "Your uploads stay protected.",
      trustFastCopy: "Get results in a few seconds.",
      trustLovedCopy: "Used by people in 190+ countries."
    },
    slider: {
      before: "Before",
      after: "After",
      drag: "Drag"
    },
    trust: {
      generations: "Looks created",
      rating: "Average rating",
      countries: "Countries",
      speed: "Average speed"
    },
    howItWorks: {
      eyebrow: "How it works",
      title: "Three simple steps.",
      steps: [
        {
          title: "Upload a photo",
          copy: "Use a clear front photo."
        },
        {
          title: "Choose an outfit",
          copy: "Pick a style or write your own idea."
        },
        {
          title: "Get your result",
          copy: "See your new look in seconds."
        }
      ]
    },
    examples: {
      eyebrow: "Examples",
      title: "See what your next look can be.",
      pageTitle: "Real examples made with GetDressAI.",
      note: "Try this style: {example}."
    },
    whyUs: {
      eyebrow: "Why us",
      title: "Simple, fast, and made for real users.",
      category: "What matters",
      ours: "GetDressAI",
      competitor: "Other tools",
      rows: [
        ["Image quality", "Clean and realistic", "Often uneven"],
        ["Speed", "Fast results", "Often slower"],
        ["Payments", "Easy plans", "Confusing pricing"],
        ["Sharing", "Built-in referral loop", "Little to no sharing tools"]
      ]
    },
    testimonials: {
      eyebrow: "Reviews",
      title: "People use it and come back.",
      items: [
        {
          name: "Amelia Hart",
          role: "Creator",
          quote: "It is easy to use and the results look good."
        },
        {
          name: "Noor Rahman",
          role: "Founder",
          quote: "Our visitors understood it right away."
        },
        {
          name: "Mila Sato",
          role: "Stylist",
          quote: "People share their results a lot."
        }
      ]
    },
    pricing: {
      eyebrow: "Pricing",
      title: "Pick a plan and start.",
      pageTitle: "Simple plans for every need.",
      pageCopy: "Start free, then upgrade when you need more looks.",
      popular: "Most popular",
      bestValue: "Best value",
      loading: "Loading...",
      highlightNote: "Most people choose this plan.",
      defaultNote: "You can change your plan anytime.",
      checkoutFailed: "Checkout failed.",
      checkoutUrlMissing: "Checkout link not found.",
      perMonth: "/ month",
      plans: [
        {
          name: "Free",
          subtitle: "1 try",
          features: ["1 credit", "Watermark", "Standard speed"],
          cta: "Start free"
        },
        {
          name: "Starter",
          subtitle: "10 credits",
          features: ["10 credits", "Faster speed", "HD download", "No watermark"],
          cta: "Get Starter"
        },
        {
          name: "Popular",
          subtitle: "30 credits",
          features: ["30 credits", "Priority speed", "Bonus referrals", "More value"],
          cta: "Choose Popular"
        },
        {
          name: "Pro",
          subtitle: "Unlimited",
          features: ["Unlimited fair use", "Best speed", "HD download", "Priority help"],
          cta: "Go Pro"
        }
      ]
    },
    referralLoop: {
      eyebrow: "Referrals",
      title: "Invite friends and get credits.",
      copy: "Get +2 credits when a friend joins and +5 when they buy.",
      bullets: [
        "Free results have a watermark",
        "Friend joins = +2 credits",
        "Friend buys = +5 credits",
        "Discount pop-up helps close sales"
      ]
    },
    faq: {
      eyebrow: "FAQ",
      title: "Quick answers.",
      items: [
        {
          q: "Are the results realistic?",
          a: "Yes, the app is built to make clean and realistic outfit previews."
        },
        {
          q: "Do free results have a watermark?",
          a: "Yes, free results show a watermark."
        },
        {
          q: "Can I cancel anytime?",
          a: "Yes, you can manage your plan anytime."
        },
        {
          q: "Are my uploads private?",
          a: "Yes, uploads are protected."
        }
      ]
    },
    cta: {
      eyebrow: "Start now",
      title: "Make your next look in seconds.",
      copy: "Upload a photo, try a style, and share the result.",
      unlock: "Get 30% off"
    },
    urgency: {
      eyebrow: "Today only",
      title: "Wait! Get 30% Off Today",
      copy: "This offer is for this session only.",
      button: "Unlock discount"
    },
    upload: {
      modePhoto: "Use my photo",
      modeMannequin: "Use virtual mannequin",
      genderLabel: "Body type",
      genderHint: "Pick the closest body type.",
      genderFemale: "Female",
      genderMale: "Male",
      genderUnisex: "Unisex",
      genderValue: {
        female: "Female",
        male: "Male",
        unisex: "Unisex"
      },
      dropPhoto: "Drop your photo",
      formats: "PNG, JPG, WEBP up to 10MB",
      mannequinTitle: "No photo? Use a mannequin.",
      mannequinCopy: "Enter your size and preview the outfit on a mannequin.",
      measurementHeight: "Height",
      measurementChest: "Chest",
      measurementWaist: "Waist",
      measurementHips: "Hips",
      measurementInseam: "Inseam",
      measurementUnit: "cm",
      mannequinHint: "This helps create a mannequin close to your size.",
      resultTitle: "Latest result",
      resultModePhoto: "Photo mode",
      resultModeMannequin: "Mannequin mode",
      resultSummaryPhoto: "The outfit was placed on your photo.",
      resultSummaryMannequin: "The outfit was placed on a mannequin based on your size.",
      shareTitle: "My GetDressAI result",
      shareText: "See my new AI outfit look.",
      shareButton: "Share result",
      downloadHd: "Download HD",
      generationFailed: "Could not generate the image. Please try again.",
      defaultPrompt: "Luxury outfit, clean light, simple background",
      generating: "Generating...",
      generate: "Generate result",
      presets: examplePresets
    },
    dashboard: {
      eyebrow: "Dashboard",
      title: "Your results, credits, and history.",
      recentResults: "Recent results",
      downloadHd: "HD download is for paid plans",
      creditsUsed: "3 of 28 credits used",
      download: "Download",
      history: [
        { title: "Wedding look", date: "2 minutes ago" },
        { title: "Leather set", date: "12 minutes ago" },
        { title: "Office outfit", date: "Yesterday" }
      ],
      sidebar: ["Generate", "History", "Billing", "Referrals", "Settings"],
      stats: [
        { label: "Credits", note: "5 bonus credits end in 2 days" },
        { label: "Generations", note: "12 today, 38 this week" },
        { label: "Referral sales", note: "11 purchases this month" },
        { label: "Upgrade rate", note: "Best traffic: social" }
      ]
    },
    login: {
      eyebrow: "Login",
      title: "Sign in to GetDressAI",
      copy: "Use your email to open your account.",
      email: "Email",
      password: "Password",
      button: "Continue",
      forgotPassword: "Forgot password?",
      sending: "Sending...",
      sendReset: "Send reset link",
      resetSent: "Password reset link sent.",
      resetHint: "We will email you a reset link."
    },
    resetPassword: {
      eyebrow: "Reset password",
      title: "Create a new password",
      copy: "Open the email link, then enter your new password here.",
      password: "New password",
      confirmPassword: "Confirm new password",
      button: "Update password",
      saving: "Updating...",
      success: "Password updated.",
      missingSession: "Open this page from the email link first.",
      mismatch: "Passwords do not match.",
      minLength: "Password must be at least 8 characters."
    },
    referralsPage: {
      eyebrow: "Referrals",
      title: "Invite friends and earn credits.",
      items: [
        { title: "+2 credits", note: "Friend joins" },
        { title: "+5 credits", note: "Friend buys" },
        { title: "18.7%", note: "Average signup rate" }
      ]
    },
    privacy: {
      title: "Privacy Policy",
      copy: "We protect your uploads and use analytics only to improve the product."
    },
    terms: {
      title: "Terms of Service",
      copy: "Paid plans renew through Paddle. Fair use rules apply to unlimited plans."
    },
    admin: {
      eyebrow: "Admin",
      title: "See users, sales, and growth.",
      labels: ["Users", "Revenue", "MRR", "Conversions", "Credit use", "Failed payments", "Top referrers"]
    }
  },
  ru: {
    navbar: {
      pricing: "Тарифы",
      examples: "Примеры",
      referrals: "Рефералы",
      login: "Войти",
      tryFree: "Попробовать бесплатно"
    },
    footer: {
      description: "Примеряйте одежду на своем фото с помощью AI.",
      product: "Продукт",
      company: "Компания",
      growth: "Рост",
      dashboard: "Панель",
      referralProgram: "Реферальная программа",
      copyright: "© 2026 GetDressAI"
    },
    hero: {
      badge: "AI примерка одежды",
      title: "Примерьте любой образ на своем фото за секунды",
      copy: "Загрузите фото, выберите стиль и быстро получите новый образ.",
      watchDemo: "Смотреть демо",
      founderDrop: "Скидка 30% на Starter на этой неделе",
      viewExamples: "Смотреть примеры",
      generatedLooks: "Создано образов",
      private: "Приватно",
      secureUploads: "Безопасные загрузки",
      fastOutput: "Быстрые результаты",
      trustUploadTitle: "Приватные безопасные загрузки",
      trustFastTitle: "Быстрые результаты",
      trustLovedTitle: "Любят по всему миру",
      trustUploadCopy: "Ваши файлы остаются защищенными.",
      trustFastCopy: "Результат приходит за несколько секунд.",
      trustLovedCopy: "Сервис используют в 190+ странах."
    },
    slider: {
      before: "До",
      after: "После",
      drag: "Тянуть"
    },
    trust: {
      generations: "Создано образов",
      rating: "Средний рейтинг",
      countries: "Страны",
      speed: "Средняя скорость"
    },
    howItWorks: {
      eyebrow: "Как это работает",
      title: "Три простых шага.",
      steps: [
        { title: "Загрузите фото", copy: "Используйте четкое фото спереди." },
        { title: "Выберите образ", copy: "Выберите стиль или напишите свою идею." },
        { title: "Получите результат", copy: "Посмотрите новый образ через несколько секунд." }
      ]
    },
    examples: {
      eyebrow: "Примеры",
      title: "Посмотрите, каким может быть ваш следующий образ.",
      pageTitle: "Реальные примеры, сделанные в GetDressAI.",
      note: "Попробуйте этот стиль: {example}."
    },
    whyUs: {
      eyebrow: "Почему мы",
      title: "Просто, быстро и понятно.",
      category: "Что важно",
      ours: "GetDressAI",
      competitor: "Другие сервисы",
      rows: [
        ["Качество", "Чистые и реалистичные фото", "Часто неровный результат"],
        ["Скорость", "Быстрый результат", "Часто медленнее"],
        ["Оплата", "Понятные тарифы", "Сложные планы"],
        ["Шеринг", "Есть реферальный цикл", "Мало инструментов для роста"]
      ]
    },
    testimonials: {
      eyebrow: "Отзывы",
      title: "Люди пользуются и возвращаются.",
      items: [
        { name: "Amelia Hart", role: "Креатор", quote: "Сервис простой, а результат выглядит хорошо." },
        { name: "Noor Rahman", role: "Основатель", quote: "Посетители сразу поняли, как все работает." },
        { name: "Mila Sato", role: "Стилист", quote: "Люди часто делятся своими результатами." }
      ]
    },
    pricing: {
      eyebrow: "Тарифы",
      title: "Выберите план и начните.",
      pageTitle: "Простые планы для разных задач.",
      pageCopy: "Начните бесплатно, потом перейдите на платный план, когда понадобится больше образов.",
      popular: "Самый популярный",
      bestValue: "Лучший выбор",
      loading: "Загрузка...",
      highlightNote: "Этот план выбирают чаще всего.",
      defaultNote: "План можно изменить в любое время.",
      checkoutFailed: "Не удалось открыть оплату.",
      checkoutUrlMissing: "Ссылка на оплату не найдена.",
      perMonth: "/ месяц",
      plans: [
        {
          name: "Free",
          subtitle: "1 попытка",
          features: ["1 кредит", "Водяной знак", "Обычная скорость"],
          cta: "Начать бесплатно"
        },
        {
          name: "Starter",
          subtitle: "10 кредитов",
          features: ["10 кредитов", "Быстрее", "HD загрузка", "Без водяного знака"],
          cta: "Купить Starter"
        },
        {
          name: "Popular",
          subtitle: "30 кредитов",
          features: ["30 кредитов", "Приоритет", "Бонус за рефералов", "Больше выгоды"],
          cta: "Выбрать Popular"
        },
        {
          name: "Pro",
          subtitle: "Безлимит",
          features: ["Безлимит fair use", "Лучшая скорость", "HD загрузка", "Приоритетная помощь"],
          cta: "Перейти на Pro"
        }
      ]
    },
    referralLoop: {
      eyebrow: "Рефералы",
      title: "Приглашайте друзей и получайте кредиты.",
      copy: "Получайте +2 кредита, когда друг зарегистрируется, и +5, когда он купит план.",
      bullets: [
        "На бесплатных результатах есть водяной знак",
        "Друг зарегистрировался = +2 кредита",
        "Друг купил = +5 кредитов",
        "Поп-ап со скидкой помогает закрывать продажи"
      ]
    },
    faq: {
      eyebrow: "FAQ",
      title: "Короткие ответы.",
      items: [
        { q: "Результаты выглядят реалистично?", a: "Да, сервис делает чистые и реалистичные превью одежды." },
        { q: "На бесплатных результатах есть водяной знак?", a: "Да, на бесплатных результатах есть водяной знак." },
        { q: "Можно отменить подписку в любое время?", a: "Да, вы можете управлять планом в любое время." },
        { q: "Мои загрузки приватны?", a: "Да, ваши загрузки защищены." }
      ]
    },
    cta: {
      eyebrow: "Начните сейчас",
      title: "Сделайте новый образ за секунды.",
      copy: "Загрузите фото, выберите стиль и поделитесь результатом.",
      unlock: "Получить скидку 30%"
    },
    urgency: {
      eyebrow: "Только сегодня",
      title: "Подождите! Получите скидку 30% сегодня",
      copy: "Это предложение действует только в этой сессии.",
      button: "Открыть скидку"
    },
    upload: {
      modePhoto: "Использовать мое фото",
      modeMannequin: "Использовать манекен",
      genderLabel: "Тип фигуры",
      genderHint: "Выберите самый близкий тип фигуры.",
      genderFemale: "Женский",
      genderMale: "Мужской",
      genderUnisex: "Унисекс",
      genderValue: {
        female: "Женский",
        male: "Мужской",
        unisex: "Унисекс"
      },
      dropPhoto: "Перетащите фото",
      formats: "PNG, JPG, WEBP до 10MB",
      mannequinTitle: "Нет фото? Используйте манекен.",
      mannequinCopy: "Введите размер и посмотрите одежду на манекене.",
      measurementHeight: "Рост",
      measurementChest: "Грудь",
      measurementWaist: "Талия",
      measurementHips: "Бедра",
      measurementInseam: "Шаговый шов",
      measurementUnit: "см",
      mannequinHint: "Это помогает создать манекен, похожий на ваш размер.",
      resultTitle: "Последний результат",
      resultModePhoto: "Режим фото",
      resultModeMannequin: "Режим манекена",
      resultSummaryPhoto: "Одежда наложена на ваше фото.",
      resultSummaryMannequin: "Одежда показана на манекене по вашим размерам.",
      shareTitle: "Мой результат GetDressAI",
      shareText: "Посмотрите на мой новый AI образ.",
      shareButton: "Поделиться",
      downloadHd: "Скачать HD",
      generationFailed: "Не удалось создать изображение. Попробуйте еще раз.",
      defaultPrompt: "Роскошный образ, чистый свет, простой фон",
      generating: "Создание...",
      generate: "Создать результат",
      presets: examplePresets
    },
    dashboard: {
      eyebrow: "Панель",
      title: "Ваши результаты, кредиты и история.",
      recentResults: "Последние результаты",
      downloadHd: "HD загрузка доступна на платных планах",
      creditsUsed: "Использовано 3 из 28 кредитов",
      download: "Скачать",
      history: [
        { title: "Свадебный образ", date: "2 минуты назад" },
        { title: "Кожаный образ", date: "12 минут назад" },
        { title: "Офисный образ", date: "Вчера" }
      ],
      sidebar: ["Создать", "История", "Оплата", "Рефералы", "Настройки"],
      stats: [
        { label: "Кредиты", note: "5 бонусных кредитов закончатся через 2 дня" },
        { label: "Генерации", note: "12 сегодня, 38 за неделю" },
        { label: "Реферальные продажи", note: "11 покупок в этом месяце" },
        { label: "Апгрейд", note: "Лучший трафик: соцсети" }
      ]
    },
    login: {
      eyebrow: "Вход",
      title: "Войдите в GetDressAI",
      copy: "Используйте email, чтобы открыть свой аккаунт.",
      email: "Email",
      password: "Пароль",
      button: "Продолжить",
      forgotPassword: "Забыли пароль?",
      sending: "Отправка...",
      sendReset: "Отправить ссылку",
      resetSent: "Ссылка для сброса пароля отправлена.",
      resetHint: "Мы отправим вам ссылку для сброса."
    },
    resetPassword: {
      eyebrow: "Сброс пароля",
      title: "Создайте новый пароль",
      copy: "Откройте ссылку из письма и введите новый пароль здесь.",
      password: "Новый пароль",
      confirmPassword: "Подтвердите пароль",
      button: "Обновить пароль",
      saving: "Обновление...",
      success: "Пароль обновлен.",
      missingSession: "Сначала откройте эту страницу по ссылке из письма.",
      mismatch: "Пароли не совпадают.",
      minLength: "Пароль должен содержать минимум 8 символов."
    },
    referralsPage: {
      eyebrow: "Рефералы",
      title: "Приглашайте друзей и получайте кредиты.",
      items: [
        { title: "+2 кредита", note: "Друг зарегистрировался" },
        { title: "+5 кредитов", note: "Друг купил" },
        { title: "18.7%", note: "Средняя конверсия" }
      ]
    },
    privacy: {
      title: "Политика конфиденциальности",
      copy: "Мы защищаем ваши загрузки и используем аналитику только для улучшения сервиса."
    },
    terms: {
      title: "Условия использования",
      copy: "Платные планы продлеваются через Paddle. Для безлимитных планов действует fair use."
    },
    admin: {
      eyebrow: "Админ",
      title: "Пользователи, продажи и рост.",
      labels: ["Пользователи", "Выручка", "MRR", "Конверсии", "Использование кредитов", "Неудачные платежи", "Топ рефералы"]
    }
  },
  uz: {
    navbar: {
      pricing: "Narxlar",
      examples: "Namunalar",
      referrals: "Referallar",
      login: "Kirish",
      tryFree: "Bepul sinab ko'rish"
    },
    footer: {
      description: "Kiyimni o'z rasmingizda AI bilan sinab ko'ring.",
      product: "Mahsulot",
      company: "Kompaniya",
      growth: "O'sish",
      dashboard: "Panel",
      referralProgram: "Referal dasturi",
      copyright: "© 2026 GetDressAI"
    },
    hero: {
      badge: "AI kiyim sinab ko'rish",
      title: "Istalgan kiyimni rasmingizda soniyalar ichida sinab ko'ring",
      copy: "Rasm yuklang, uslub tanlang va tezda yangi ko'rinishni oling.",
      watchDemo: "Demo ko'rish",
      founderDrop: "Bu hafta Starter uchun 30% chegirma",
      viewExamples: "Namunalarni ko'rish",
      generatedLooks: "Yaratilgan look'lar",
      private: "Maxfiy",
      secureUploads: "Xavfsiz yuklash",
      fastOutput: "Tez natija",
      trustUploadTitle: "Maxfiy va xavfsiz yuklash",
      trustFastTitle: "Tez natija",
      trustLovedTitle: "Butun dunyoda ishlatiladi",
      trustUploadCopy: "Yuklangan fayllaringiz himoyalanadi.",
      trustFastCopy: "Natija bir necha soniyada keladi.",
      trustLovedCopy: "Servis 190+ mamlakatda ishlatiladi."
    },
    slider: {
      before: "Oldin",
      after: "Keyin",
      drag: "Surish"
    },
    trust: {
      generations: "Yaratilgan look'lar",
      rating: "O'rtacha baho",
      countries: "Mamlakatlar",
      speed: "O'rtacha tezlik"
    },
    howItWorks: {
      eyebrow: "Qanday ishlaydi",
      title: "Uchta oddiy qadam.",
      steps: [
        { title: "Rasm yuklang", copy: "Old tomondan aniq rasm yuklang." },
        { title: "Kiyim tanlang", copy: "Uslub tanlang yoki o'z g'oyangizni yozing." },
        { title: "Natijani oling", copy: "Yangi ko'rinishni bir necha soniyada ko'ring." }
      ]
    },
    examples: {
      eyebrow: "Namunalar",
      title: "Keyingi look'ingiz qanday bo'lishini ko'ring.",
      pageTitle: "GetDressAI bilan yaratilgan haqiqiy namunalar.",
      note: "Mana shu uslubni sinab ko'ring: {example}."
    },
    whyUs: {
      eyebrow: "Nega biz",
      title: "Oddiy, tez va tushunarli.",
      category: "Muhim jihat",
      ours: "GetDressAI",
      competitor: "Boshqa servislar",
      rows: [
        ["Sifat", "Toza va realistik", "Ko'pincha notekis"],
        ["Tezlik", "Tez natija", "Ko'pincha sekin"],
        ["To'lov", "Tushunarli tariflar", "Murakkab narxlar"],
        ["Ulashish", "Referal tizimi bor", "O'sish uchun vosita kam"]
      ]
    },
    testimonials: {
      eyebrow: "Fikrlar",
      title: "Odamlar ishlatadi va yana qaytadi.",
      items: [
        { name: "Amelia Hart", role: "Kreator", quote: "Ishlatish oson va natija chiroyli chiqadi." },
        { name: "Noor Rahman", role: "Asoschi", quote: "Foydalanuvchilar hammasini darrov tushundi." },
        { name: "Mila Sato", role: "Stilist", quote: "Odamlar natijani ko'p ulashadi." }
      ]
    },
    pricing: {
      eyebrow: "Narxlar",
      title: "Plan tanlang va boshlang.",
      pageTitle: "Har ehtiyoj uchun oddiy planlar.",
      pageCopy: "Avval bepul boshlang, ko'proq look kerak bo'lsa keyin upgrade qiling.",
      popular: "Eng ommabop",
      bestValue: "Eng yaxshi tanlov",
      loading: "Yuklanmoqda...",
      highlightNote: "Ko'pchilik shu planni oladi.",
      defaultNote: "Planni istalgan payt o'zgartirish mumkin.",
      checkoutFailed: "To'lov oynasi ochilmadi.",
      checkoutUrlMissing: "To'lov havolasi topilmadi.",
      perMonth: "/ oy",
      plans: [
        {
          name: "Free",
          subtitle: "1 ta urinish",
          features: ["1 kredit", "Watermark bor", "Oddiy tezlik"],
          cta: "Bepul boshlash"
        },
        {
          name: "Starter",
          subtitle: "10 kredit",
          features: ["10 kredit", "Tezroq", "HD yuklash", "Watermark yo'q"],
          cta: "Starter olish"
        },
        {
          name: "Popular",
          subtitle: "30 kredit",
          features: ["30 kredit", "Ustuvor tezlik", "Referal bonusi", "Ko'proq foyda"],
          cta: "Popular tanlash"
        },
        {
          name: "Pro",
          subtitle: "Cheksiz",
          features: ["Cheksiz fair use", "Eng tez", "HD yuklash", "Ustuvor yordam"],
          cta: "Pro olish"
        }
      ]
    },
    referralLoop: {
      eyebrow: "Referallar",
      title: "Do'stlarni taklif qiling va kredit oling.",
      copy: "Do'st qo'shilsa +2 kredit, xarid qilsa +5 kredit oling.",
      bullets: [
        "Bepul natijada watermark bo'ladi",
        "Do'st qo'shilsa = +2 kredit",
        "Do'st xarid qilsa = +5 kredit",
        "Chegirma oynasi sotuvni oshiradi"
      ]
    },
    faq: {
      eyebrow: "FAQ",
      title: "Qisqa javoblar.",
      items: [
        { q: "Natija realistik chiqadimi?", a: "Ha, servis toza va realistik kiyim preview qiladi." },
        { q: "Bepul natijada watermark bormi?", a: "Ha, bepul natijada watermark bo'ladi." },
        { q: "Obunani istalgan payt to'xtatsa bo'ladimi?", a: "Ha, planingizni istalgan payt boshqarishingiz mumkin." },
        { q: "Yuklangan rasmlarim maxfiymi?", a: "Ha, yuklangan rasmlar himoyalanadi." }
      ]
    },
    cta: {
      eyebrow: "Hozir boshlang",
      title: "Yangi look'ingizni soniyalarda yarating.",
      copy: "Rasm yuklang, uslub tanlang va natijani ulashing.",
      unlock: "30% chegirmani olish"
    },
    urgency: {
      eyebrow: "Faqat bugun",
      title: "To'xtang! Bugun 30% chegirma oling",
      copy: "Bu taklif faqat shu sessiya uchun.",
      button: "Chegirmani ochish"
    },
    upload: {
      modePhoto: "Mening rasmim",
      modeMannequin: "Virtual maneken",
      genderLabel: "Tana turi",
      genderHint: "Eng yaqin tana turini tanlang.",
      genderFemale: "Ayol",
      genderMale: "Erkak",
      genderUnisex: "Uniseks",
      genderValue: {
        female: "Ayol",
        male: "Erkak",
        unisex: "Uniseks"
      },
      dropPhoto: "Rasmingizni tashlang",
      formats: "PNG, JPG, WEBP 10MB gacha",
      mannequinTitle: "Rasm yo'qmi? Manekendan foydalaning.",
      mannequinCopy: "O'lchamingizni kiriting va kiyimni manekenda ko'ring.",
      measurementHeight: "Bo'y",
      measurementChest: "Ko'krak",
      measurementWaist: "Bel",
      measurementHips: "Son",
      measurementInseam: "Ichki oyoq",
      measurementUnit: "sm",
      mannequinHint: "Bu sizga yaqin o'lchamdagi manekenni yaratadi.",
      resultTitle: "So'nggi natija",
      resultModePhoto: "Foto rejimi",
      resultModeMannequin: "Maneken rejimi",
      resultSummaryPhoto: "Kiyim sizning rasmingizga qo'yildi.",
      resultSummaryMannequin: "Kiyim o'lchamingiz bo'yicha manekenga qo'yildi.",
      shareTitle: "Mening GetDressAI natijam",
      shareText: "Mening yangi AI look'imni ko'ring.",
      shareButton: "Ulashish",
      downloadHd: "HD yuklab olish",
      generationFailed: "Rasm yaratilmadi. Yana urinib ko'ring.",
      defaultPrompt: "Hashamatli outfit, toza yorug'lik, oddiy fon",
      generating: "Yaratilmoqda...",
      generate: "Natijani yaratish",
      presets: examplePresets
    },
    dashboard: {
      eyebrow: "Panel",
      title: "Natijalar, kreditlar va tarixingiz.",
      recentResults: "So'nggi natijalar",
      downloadHd: "HD yuklash pullik planlarda bor",
      creditsUsed: "28 kreditdan 3 tasi ishlatilgan",
      download: "Yuklab olish",
      history: [
        { title: "To'y look'i", date: "2 daqiqa oldin" },
        { title: "Teri outfit", date: "12 daqiqa oldin" },
        { title: "Ofis kiyimi", date: "Kecha" }
      ],
      sidebar: ["Yaratish", "Tarix", "To'lov", "Referallar", "Sozlamalar"],
      stats: [
        { label: "Kreditlar", note: "5 bonus kredit 2 kundan keyin tugaydi" },
        { label: "Generatsiyalar", note: "Bugun 12 ta, haftada 38 ta" },
        { label: "Referal savdo", note: "Bu oy 11 ta xarid" },
        { label: "Upgrade", note: "Eng yaxshi trafik: ijtimoiy tarmoq" }
      ]
    },
    login: {
      eyebrow: "Kirish",
      title: "GetDressAI ga kiring",
      copy: "Akkauntingizni ochish uchun emaildan foydalaning.",
      email: "Email",
      password: "Parol",
      button: "Davom etish",
      forgotPassword: "Parol esdan chiqdimi?",
      sending: "Yuborilmoqda...",
      sendReset: "Tiklash havolasini yuborish",
      resetSent: "Parolni tiklash havolasi yuborildi.",
      resetHint: "Sizga tiklash havolasini emailga yuboramiz."
    },
    resetPassword: {
      eyebrow: "Parolni tiklash",
      title: "Yangi parol yarating",
      copy: "Emaildagi havolani oching va yangi parolni shu yerda kiriting.",
      password: "Yangi parol",
      confirmPassword: "Parolni tasdiqlang",
      button: "Parolni yangilash",
      saving: "Yangilanmoqda...",
      success: "Parol yangilandi.",
      missingSession: "Avval emaildagi havola orqali kiring.",
      mismatch: "Parollar mos emas.",
      minLength: "Parol kamida 8 ta belgidan iborat bo'lishi kerak."
    },
    referralsPage: {
      eyebrow: "Referallar",
      title: "Do'stlarni taklif qiling va kredit oling.",
      items: [
        { title: "+2 kredit", note: "Do'st qo'shilsa" },
        { title: "+5 kredit", note: "Do'st xarid qilsa" },
        { title: "18.7%", note: "O'rtacha konversiya" }
      ]
    },
    privacy: {
      title: "Maxfiylik siyosati",
      copy: "Biz yuklangan fayllarni himoya qilamiz va analytics'ni faqat servisni yaxshilash uchun ishlatamiz."
    },
    terms: {
      title: "Foydalanish shartlari",
      copy: "Pullik planlar Paddle orqali yangilanadi. Cheksiz planlarda fair use qoidasi bor."
    },
    admin: {
      eyebrow: "Admin",
      title: "Foydalanuvchilar, savdo va o'sish.",
      labels: ["Foydalanuvchilar", "Tushum", "MRR", "Konversiyalar", "Kredit ishlatilishi", "Muvaffaqiyatsiz to'lovlar", "Top referallar"]
    }
  },
  tr: {
    navbar: {
      pricing: "Fiyatlar",
      examples: "Örnekler",
      referrals: "Referanslar",
      login: "Giriş",
      tryFree: "Ücretsiz dene"
    },
    footer: {
      description: "Kıyafetleri fotoğrafınızda yapay zeka ile deneyin.",
      product: "Ürün",
      company: "Şirket",
      growth: "Büyüme",
      dashboard: "Panel",
      referralProgram: "Referans programı",
      copyright: "© 2026 GetDressAI"
    },
    hero: {
      badge: "AI kıyafet deneme",
      title: "Herhangi Bir Kombini Fotoğrafınızda Saniyeler İçinde Deneyin",
      copy: "Fotoğrafınızı yükleyin, stil seçin ve yeni görünümü hızlıca alın.",
      watchDemo: "Demoyu izle",
      founderDrop: "Bu hafta Starter'da %30 indirim",
      viewExamples: "Örnekleri gör",
      generatedLooks: "Oluşturulan görünüm",
      private: "Gizli",
      secureUploads: "Güvenli yükleme",
      fastOutput: "Hızlı sonuç",
      trustUploadTitle: "Özel ve güvenli yüklemeler",
      trustFastTitle: "Hızlı sonuçlar",
      trustLovedTitle: "Dünya çapında seviliyor",
      trustUploadCopy: "Yüklemeleriniz korunur.",
      trustFastCopy: "Sonuçlar birkaç saniyede gelir.",
      trustLovedCopy: "190+ ülkede kullanılıyor."
    },
    slider: { before: "Önce", after: "Sonra", drag: "Sürükle" },
    trust: {
      generations: "Oluşturulan görünüm",
      rating: "Ortalama puan",
      countries: "Ülkeler",
      speed: "Ortalama hız"
    },
    howItWorks: {
      eyebrow: "Nasıl çalışır",
      title: "Üç basit adım.",
      steps: [
        { title: "Fotoğraf yükle", copy: "Önden çekilmiş net bir fotoğraf kullanın." },
        { title: "Kombin seç", copy: "Bir stil seçin ya da kendi fikrinizi yazın." },
        { title: "Sonucu al", copy: "Yeni görünümünüzü saniyeler içinde görün." }
      ]
    },
    examples: {
      eyebrow: "Örnekler",
      title: "Bir sonraki görünümünüzü görün.",
      pageTitle: "GetDressAI ile yapılmış gerçek örnekler.",
      note: "Bu stili deneyin: {example}."
    },
    whyUs: {
      eyebrow: "Neden biz",
      title: "Basit, hızlı ve anlaşılır.",
      category: "Önemli konu",
      ours: "GetDressAI",
      competitor: "Diğer araçlar",
      rows: [
        ["Kalite", "Temiz ve gerçekçi", "Genelde düzensiz"],
        ["Hız", "Hızlı sonuç", "Daha yavaş olabilir"],
        ["Ödeme", "Açık fiyatlar", "Karışık planlar"],
        ["Paylaşım", "Referans sistemi var", "Büyüme araçları az"]
      ]
    },
    testimonials: {
      eyebrow: "Yorumlar",
      title: "İnsanlar kullanıyor ve geri geliyor.",
      items: [
        { name: "Amelia Hart", role: "İçerik üreticisi", quote: "Kullanması kolay ve sonuçlar güzel görünüyor." },
        { name: "Noor Rahman", role: "Kurucu", quote: "Ziyaretçiler sistemi hemen anladı." },
        { name: "Mila Sato", role: "Stilist", quote: "İnsanlar sonuçlarını sıkça paylaşıyor." }
      ]
    },
    pricing: {
      eyebrow: "Fiyatlar",
      title: "Bir plan seçin ve başlayın.",
      pageTitle: "Her ihtiyaç için basit planlar.",
      pageCopy: "Ücretsiz başlayın, daha fazlasına ihtiyaç olunca yükseltin.",
      popular: "En popüler",
      bestValue: "En iyi seçenek",
      loading: "Yükleniyor...",
      highlightNote: "Çoğu kişi bu planı seçiyor.",
      defaultNote: "Planınızı istediğiniz zaman değiştirebilirsiniz.",
      checkoutFailed: "Ödeme açılamadı.",
      checkoutUrlMissing: "Ödeme bağlantısı bulunamadı.",
      perMonth: "/ ay",
      plans: [
        { name: "Free", subtitle: "1 deneme", features: ["1 kredi", "Filigran", "Standart hız"], cta: "Ücretsiz başla" },
        { name: "Starter", subtitle: "10 kredi", features: ["10 kredi", "Daha hızlı", "HD indirme", "Filigran yok"], cta: "Starter al" },
        { name: "Popular", subtitle: "30 kredi", features: ["30 kredi", "Öncelikli hız", "Referans bonusu", "Daha iyi değer"], cta: "Popular seç" },
        { name: "Pro", subtitle: "Sınırsız", features: ["Sınırsız fair use", "En hızlı", "HD indirme", "Öncelikli destek"], cta: "Pro al" }
      ]
    },
    referralLoop: {
      eyebrow: "Referanslar",
      title: "Arkadaşlarını davet et ve kredi kazan.",
      copy: "Arkadaşın katılınca +2, satın alınca +5 kredi kazan.",
      bullets: [
        "Ücretsiz sonuçlarda filigran var",
        "Arkadaş katılırsa = +2 kredi",
        "Arkadaş alırsa = +5 kredi",
        "İndirim açılır penceresi satışa yardım eder"
      ]
    },
    faq: {
      eyebrow: "SSS",
      title: "Kısa cevaplar.",
      items: [
        { q: "Sonuçlar gerçekçi mi?", a: "Evet, servis temiz ve gerçekçi kıyafet önizlemeleri üretir." },
        { q: "Ücretsiz sonuçlarda filigran var mı?", a: "Evet, ücretsiz sonuçlarda filigran vardır." },
        { q: "Aboneliği istediğim zaman iptal edebilir miyim?", a: "Evet, planınızı istediğiniz zaman yönetebilirsiniz." },
        { q: "Yüklemelerim gizli mi?", a: "Evet, yüklemeleriniz korunur." }
      ]
    },
    cta: {
      eyebrow: "Hemen başla",
      title: "Yeni görünümünü saniyeler içinde oluştur.",
      copy: "Fotoğraf yükle, stil seç ve sonucu paylaş.",
      unlock: "%30 indirimi al"
    },
    urgency: {
      eyebrow: "Sadece bugün",
      title: "Bekleyin! Bugün %30 indirim alın",
      copy: "Bu teklif sadece bu oturum için geçerlidir.",
      button: "İndirimi aç"
    },
    upload: {
      modePhoto: "Fotoğrafımı kullan",
      modeMannequin: "Sanal manken kullan",
      genderLabel: "Vücut tipi",
      genderHint: "En yakın vücut tipini seçin.",
      genderFemale: "Kadın",
      genderMale: "Erkek",
      genderUnisex: "Uniseks",
      genderValue: { female: "Kadın", male: "Erkek", unisex: "Uniseks" },
      dropPhoto: "Fotoğrafınızı bırakın",
      formats: "PNG, JPG, WEBP en fazla 10MB",
      mannequinTitle: "Fotoğraf yok mu? Manken kullanın.",
      mannequinCopy: "Ölçünüzü girin ve kıyafeti mankende görün.",
      measurementHeight: "Boy",
      measurementChest: "Göğüs",
      measurementWaist: "Bel",
      measurementHips: "Kalça",
      measurementInseam: "İç bacak",
      measurementUnit: "cm",
      mannequinHint: "Bu, size yakın bir manken oluşturmaya yardım eder.",
      resultTitle: "Son sonuç",
      resultModePhoto: "Fotoğraf modu",
      resultModeMannequin: "Manken modu",
      resultSummaryPhoto: "Kıyafet fotoğrafınıza yerleştirildi.",
      resultSummaryMannequin: "Kıyafet ölçünüze göre mankene yerleştirildi.",
      shareTitle: "GetDressAI sonucum",
      shareText: "Yeni AI görünümüme bakın.",
      shareButton: "Sonucu paylaş",
      downloadHd: "HD indir",
      generationFailed: "Görsel oluşturulamadı. Lütfen tekrar deneyin.",
      defaultPrompt: "Lüks kombin, temiz ışık, sade arka plan",
      generating: "Oluşturuluyor...",
      generate: "Sonucu oluştur",
      presets: examplePresets
    },
    dashboard: {
      eyebrow: "Panel",
      title: "Sonuçlarınız, kredileriniz ve geçmişiniz.",
      recentResults: "Son sonuçlar",
      downloadHd: "HD indirme ücretli planlarda var",
      creditsUsed: "28 kredinin 3'ü kullanıldı",
      download: "İndir",
      history: [
        { title: "Düğün görünümü", date: "2 dakika önce" },
        { title: "Deri set", date: "12 dakika önce" },
        { title: "Ofis kıyafeti", date: "Dün" }
      ],
      sidebar: ["Oluştur", "Geçmiş", "Ödeme", "Referanslar", "Ayarlar"],
      stats: [
        { label: "Krediler", note: "5 bonus kredi 2 gün sonra bitecek" },
        { label: "Oluşturmalar", note: "Bugün 12, bu hafta 38" },
        { label: "Referans satışları", note: "Bu ay 11 satın alma" },
        { label: "Yükseltme", note: "En iyi trafik: sosyal medya" }
      ]
    },
    login: {
      eyebrow: "Giriş",
      title: "GetDressAI'a giriş yapın",
      copy: "Hesabınızı açmak için e-postanızı kullanın.",
      email: "E-posta",
      password: "Şifre",
      button: "Devam et",
      forgotPassword: "Şifrenizi mi unuttunuz?",
      sending: "Gönderiliyor...",
      sendReset: "Sıfırlama bağlantısı gönder",
      resetSent: "Şifre sıfırlama bağlantısı gönderildi.",
      resetHint: "Size sıfırlama bağlantısı e-posta ile gönderilecek."
    },
    resetPassword: {
      eyebrow: "Şifre sıfırla",
      title: "Yeni şifre oluştur",
      copy: "E-postadaki bağlantıyı açın ve yeni şifreyi burada girin.",
      password: "Yeni şifre",
      confirmPassword: "Şifreyi doğrula",
      button: "Şifreyi güncelle",
      saving: "Güncelleniyor...",
      success: "Şifre güncellendi.",
      missingSession: "Önce e-postadaki bağlantıdan bu sayfayı açın.",
      mismatch: "Şifreler eşleşmiyor.",
      minLength: "Şifre en az 8 karakter olmalı."
    },
    referralsPage: {
      eyebrow: "Referanslar",
      title: "Arkadaşlarını davet et ve kredi kazan.",
      items: [
        { title: "+2 kredi", note: "Arkadaş katılırsa" },
        { title: "+5 kredi", note: "Arkadaş satın alırsa" },
        { title: "18.7%", note: "Ortalama dönüşüm" }
      ]
    },
    privacy: {
      title: "Gizlilik Politikası",
      copy: "Yüklemelerinizi koruruz ve analitiği yalnızca ürünü geliştirmek için kullanırız."
    },
    terms: {
      title: "Kullanım Şartları",
      copy: "Ücretli planlar Paddle ile yenilenir. Sınırsız planlarda fair use geçerlidir."
    },
    admin: {
      eyebrow: "Yönetici",
      title: "Kullanıcılar, satış ve büyüme.",
      labels: ["Kullanıcılar", "Gelir", "MRR", "Dönüşümler", "Kredi kullanımı", "Başarısız ödemeler", "En iyi referanslar"]
    }
  },
  es: {
    navbar: {
      pricing: "Precios",
      examples: "Ejemplos",
      referrals: "Referidos",
      login: "Entrar",
      tryFree: "Probar gratis"
    },
    footer: {
      description: "Prueba ropa en tu foto con IA.",
      product: "Producto",
      company: "Empresa",
      growth: "Crecimiento",
      dashboard: "Panel",
      referralProgram: "Programa de referidos",
      copyright: "© 2026 GetDressAI"
    },
    hero: {
      badge: "Prueba de ropa con IA",
      title: "Prueba Cualquier Outfit en Tu Foto en Segundos",
      copy: "Sube tu foto, elige un estilo y recibe un nuevo look rápido.",
      watchDemo: "Ver demo",
      founderDrop: "30% de descuento en Starter esta semana",
      viewExamples: "Ver ejemplos",
      generatedLooks: "Looks creados",
      private: "Privado",
      secureUploads: "Subidas seguras",
      fastOutput: "Resultados rápidos",
      trustUploadTitle: "Subidas privadas y seguras",
      trustFastTitle: "Resultados rápidos",
      trustLovedTitle: "Usado en todo el mundo",
      trustUploadCopy: "Tus archivos se mantienen protegidos.",
      trustFastCopy: "El resultado llega en pocos segundos.",
      trustLovedCopy: "Se usa en más de 190 países."
    },
    slider: { before: "Antes", after: "Después", drag: "Mover" },
    trust: {
      generations: "Looks creados",
      rating: "Valoración media",
      countries: "Países",
      speed: "Velocidad media"
    },
    howItWorks: {
      eyebrow: "Cómo funciona",
      title: "Tres pasos simples.",
      steps: [
        { title: "Sube una foto", copy: "Usa una foto clara de frente." },
        { title: "Elige un outfit", copy: "Elige un estilo o escribe tu idea." },
        { title: "Recibe el resultado", copy: "Mira tu nuevo look en segundos." }
      ]
    },
    examples: {
      eyebrow: "Ejemplos",
      title: "Mira cómo puede verse tu próximo look.",
      pageTitle: "Ejemplos reales hechos con GetDressAI.",
      note: "Prueba este estilo: {example}."
    },
    whyUs: {
      eyebrow: "Por qué nosotros",
      title: "Simple, rápido y claro.",
      category: "Lo importante",
      ours: "GetDressAI",
      competitor: "Otras herramientas",
      rows: [
        ["Calidad", "Limpio y realista", "A menudo irregular"],
        ["Velocidad", "Resultado rápido", "A menudo más lento"],
        ["Pago", "Planes claros", "Precios confusos"],
        ["Compartir", "Tiene sistema de referidos", "Pocas herramientas de crecimiento"]
      ]
    },
    testimonials: {
      eyebrow: "Opiniones",
      title: "La gente lo usa y vuelve.",
      items: [
        { name: "Amelia Hart", role: "Creadora", quote: "Es fácil de usar y el resultado se ve bien." },
        { name: "Noor Rahman", role: "Fundador", quote: "Los visitantes entendieron todo de inmediato." },
        { name: "Mila Sato", role: "Estilista", quote: "La gente comparte mucho sus resultados." }
      ]
    },
    pricing: {
      eyebrow: "Precios",
      title: "Elige un plan y empieza.",
      pageTitle: "Planes simples para cada necesidad.",
      pageCopy: "Empieza gratis y mejora cuando necesites más looks.",
      popular: "Más popular",
      bestValue: "Mejor opción",
      loading: "Cargando...",
      highlightNote: "La mayoría elige este plan.",
      defaultNote: "Puedes cambiar tu plan cuando quieras.",
      checkoutFailed: "No se pudo abrir el pago.",
      checkoutUrlMissing: "No se encontró el enlace de pago.",
      perMonth: "/ mes",
      plans: [
        { name: "Free", subtitle: "1 intento", features: ["1 crédito", "Marca de agua", "Velocidad estándar"], cta: "Empezar gratis" },
        { name: "Starter", subtitle: "10 créditos", features: ["10 créditos", "Más rápido", "Descarga HD", "Sin marca de agua"], cta: "Comprar Starter" },
        { name: "Popular", subtitle: "30 créditos", features: ["30 créditos", "Prioridad", "Bono por referidos", "Más valor"], cta: "Elegir Popular" },
        { name: "Pro", subtitle: "Ilimitado", features: ["Uso ilimitado fair use", "Más rápido", "Descarga HD", "Soporte prioritario"], cta: "Ir a Pro" }
      ]
    },
    referralLoop: {
      eyebrow: "Referidos",
      title: "Invita amigos y gana créditos.",
      copy: "Recibe +2 créditos cuando un amigo se une y +5 cuando compra.",
      bullets: [
        "Los resultados gratis tienen marca de agua",
        "Amigo se une = +2 créditos",
        "Amigo compra = +5 créditos",
        "La ventana de descuento ayuda a cerrar ventas"
      ]
    },
    faq: {
      eyebrow: "FAQ",
      title: "Respuestas rápidas.",
      items: [
        { q: "¿Los resultados son realistas?", a: "Sí, el servicio crea vistas previas limpias y realistas." },
        { q: "¿Los resultados gratis tienen marca de agua?", a: "Sí, los resultados gratis tienen marca de agua." },
        { q: "¿Puedo cancelar en cualquier momento?", a: "Sí, puedes gestionar tu plan cuando quieras." },
        { q: "¿Mis subidas son privadas?", a: "Sí, tus subidas están protegidas." }
      ]
    },
    cta: {
      eyebrow: "Empieza ahora",
      title: "Crea tu nuevo look en segundos.",
      copy: "Sube una foto, elige un estilo y comparte el resultado.",
      unlock: "Conseguir 30% de descuento"
    },
    urgency: {
      eyebrow: "Solo hoy",
      title: "¡Espera! Consigue 30% de descuento hoy",
      copy: "Esta oferta es solo para esta sesión.",
      button: "Abrir descuento"
    },
    upload: {
      modePhoto: "Usar mi foto",
      modeMannequin: "Usar maniquí virtual",
      genderLabel: "Tipo de cuerpo",
      genderHint: "Elige el tipo de cuerpo más cercano.",
      genderFemale: "Mujer",
      genderMale: "Hombre",
      genderUnisex: "Unisex",
      genderValue: { female: "Mujer", male: "Hombre", unisex: "Unisex" },
      dropPhoto: "Suelta tu foto",
      formats: "PNG, JPG, WEBP hasta 10MB",
      mannequinTitle: "¿No tienes foto? Usa un maniquí.",
      mannequinCopy: "Introduce tu talla y mira la ropa en un maniquí.",
      measurementHeight: "Altura",
      measurementChest: "Pecho",
      measurementWaist: "Cintura",
      measurementHips: "Cadera",
      measurementInseam: "Entrepierna",
      measurementUnit: "cm",
      mannequinHint: "Esto ayuda a crear un maniquí parecido a tu talla.",
      resultTitle: "Último resultado",
      resultModePhoto: "Modo foto",
      resultModeMannequin: "Modo maniquí",
      resultSummaryPhoto: "La ropa se colocó sobre tu foto.",
      resultSummaryMannequin: "La ropa se colocó sobre un maniquí según tu talla.",
      shareTitle: "Mi resultado de GetDressAI",
      shareText: "Mira mi nuevo look con IA.",
      shareButton: "Compartir",
      downloadHd: "Descargar HD",
      generationFailed: "No se pudo crear la imagen. Inténtalo de nuevo.",
      defaultPrompt: "Outfit de lujo, luz limpia, fondo simple",
      generating: "Creando...",
      generate: "Crear resultado",
      presets: examplePresets
    },
    dashboard: {
      eyebrow: "Panel",
      title: "Tus resultados, créditos e historial.",
      recentResults: "Resultados recientes",
      downloadHd: "La descarga HD está en planes de pago",
      creditsUsed: "3 de 28 créditos usados",
      download: "Descargar",
      history: [
        { title: "Look de boda", date: "Hace 2 minutos" },
        { title: "Conjunto de cuero", date: "Hace 12 minutos" },
        { title: "Outfit de oficina", date: "Ayer" }
      ],
      sidebar: ["Crear", "Historial", "Pago", "Referidos", "Ajustes"],
      stats: [
        { label: "Créditos", note: "5 créditos extra terminan en 2 días" },
        { label: "Generaciones", note: "12 hoy, 38 esta semana" },
        { label: "Ventas por referidos", note: "11 compras este mes" },
        { label: "Mejora", note: "Mejor tráfico: redes sociales" }
      ]
    },
    login: {
      eyebrow: "Entrar",
      title: "Entra en GetDressAI",
      copy: "Usa tu email para abrir tu cuenta.",
      email: "Email",
      password: "Contraseña",
      button: "Continuar",
      forgotPassword: "¿Olvidaste tu contraseña?",
      sending: "Enviando...",
      sendReset: "Enviar enlace",
      resetSent: "Enlace de restablecimiento enviado.",
      resetHint: "Te enviaremos un enlace por email."
    },
    resetPassword: {
      eyebrow: "Restablecer contraseña",
      title: "Crea una nueva contraseña",
      copy: "Abre el enlace del email y escribe aquí tu nueva contraseña.",
      password: "Nueva contraseña",
      confirmPassword: "Confirmar contraseña",
      button: "Actualizar contraseña",
      saving: "Actualizando...",
      success: "Contraseña actualizada.",
      missingSession: "Abre esta página desde el enlace del email.",
      mismatch: "Las contraseñas no coinciden.",
      minLength: "La contraseña debe tener al menos 8 caracteres."
    },
    referralsPage: {
      eyebrow: "Referidos",
      title: "Invita amigos y gana créditos.",
      items: [
        { title: "+2 créditos", note: "Amigo se une" },
        { title: "+5 créditos", note: "Amigo compra" },
        { title: "18.7%", note: "Conversión media" }
      ]
    },
    privacy: {
      title: "Política de Privacidad",
      copy: "Protegemos tus archivos y usamos analítica solo para mejorar el producto."
    },
    terms: {
      title: "Términos del Servicio",
      copy: "Los planes de pago se renuevan con Paddle. Los planes ilimitados usan reglas de fair use."
    },
    admin: {
      eyebrow: "Admin",
      title: "Usuarios, ventas y crecimiento.",
      labels: ["Usuarios", "Ingresos", "MRR", "Conversiones", "Uso de créditos", "Pagos fallidos", "Mejores referidos"]
    }
  },
  fr: {
    navbar: {
      pricing: "Tarifs",
      examples: "Exemples",
      referrals: "Parrainage",
      login: "Connexion",
      tryFree: "Essayer gratuitement"
    },
    footer: {
      description: "Essayez des vêtements sur votre photo avec l'IA.",
      product: "Produit",
      company: "Entreprise",
      growth: "Croissance",
      dashboard: "Tableau de bord",
      referralProgram: "Programme de parrainage",
      copyright: "© 2026 GetDressAI"
    },
    hero: {
      badge: "Essayage IA",
      title: "Essayez N'importe Quelle Tenue sur Votre Photo en Quelques Secondes",
      copy: "Ajoutez votre photo, choisissez un style et obtenez vite un nouveau look.",
      watchDemo: "Voir la démo",
      founderDrop: "30% de réduction sur Starter cette semaine",
      viewExamples: "Voir les exemples",
      generatedLooks: "Looks créés",
      private: "Privé",
      secureUploads: "Envois sécurisés",
      fastOutput: "Résultats rapides",
      trustUploadTitle: "Envois privés et sécurisés",
      trustFastTitle: "Résultats rapides",
      trustLovedTitle: "Aimé dans le monde entier",
      trustUploadCopy: "Vos fichiers restent protégés.",
      trustFastCopy: "Le résultat arrive en quelques secondes.",
      trustLovedCopy: "Utilisé dans plus de 190 pays."
    },
    slider: { before: "Avant", after: "Après", drag: "Glisser" },
    trust: {
      generations: "Looks créés",
      rating: "Note moyenne",
      countries: "Pays",
      speed: "Vitesse moyenne"
    },
    howItWorks: {
      eyebrow: "Comment ça marche",
      title: "Trois étapes simples.",
      steps: [
        { title: "Ajoutez une photo", copy: "Utilisez une photo nette de face." },
        { title: "Choisissez une tenue", copy: "Choisissez un style ou écrivez votre idée." },
        { title: "Recevez le résultat", copy: "Voyez votre nouveau look en quelques secondes." }
      ]
    },
    examples: {
      eyebrow: "Exemples",
      title: "Voyez à quoi peut ressembler votre prochain look.",
      pageTitle: "De vrais exemples faits avec GetDressAI.",
      note: "Essayez ce style : {example}."
    },
    whyUs: {
      eyebrow: "Pourquoi nous",
      title: "Simple, rapide et clair.",
      category: "Point important",
      ours: "GetDressAI",
      competitor: "Autres outils",
      rows: [
        ["Qualité", "Net et réaliste", "Souvent irrégulier"],
        ["Vitesse", "Résultat rapide", "Souvent plus lent"],
        ["Paiement", "Tarifs clairs", "Prix compliqués"],
        ["Partage", "Système de parrainage", "Peu d'outils de croissance"]
      ]
    },
    testimonials: {
      eyebrow: "Avis",
      title: "Les gens l'utilisent et reviennent.",
      items: [
        { name: "Amelia Hart", role: "Créatrice", quote: "C'est facile à utiliser et le résultat est beau." },
        { name: "Noor Rahman", role: "Fondateur", quote: "Les visiteurs ont compris tout de suite." },
        { name: "Mila Sato", role: "Styliste", quote: "Les gens partagent souvent leurs résultats." }
      ]
    },
    pricing: {
      eyebrow: "Tarifs",
      title: "Choisissez un plan et commencez.",
      pageTitle: "Des plans simples pour chaque besoin.",
      pageCopy: "Commencez gratuitement puis passez à une offre supérieure si vous voulez plus.",
      popular: "Le plus populaire",
      bestValue: "Meilleur choix",
      loading: "Chargement...",
      highlightNote: "La plupart des gens choisissent ce plan.",
      defaultNote: "Vous pouvez changer de plan à tout moment.",
      checkoutFailed: "Le paiement n'a pas pu s'ouvrir.",
      checkoutUrlMissing: "Lien de paiement introuvable.",
      perMonth: "/ mois",
      plans: [
        { name: "Free", subtitle: "1 essai", features: ["1 crédit", "Filigrane", "Vitesse standard"], cta: "Commencer gratuitement" },
        { name: "Starter", subtitle: "10 crédits", features: ["10 crédits", "Plus rapide", "Téléchargement HD", "Sans filigrane"], cta: "Prendre Starter" },
        { name: "Popular", subtitle: "30 crédits", features: ["30 crédits", "Priorité", "Bonus parrainage", "Plus de valeur"], cta: "Choisir Popular" },
        { name: "Pro", subtitle: "Illimité", features: ["Utilisation illimitée fair use", "Le plus rapide", "Téléchargement HD", "Support prioritaire"], cta: "Passer à Pro" }
      ]
    },
    referralLoop: {
      eyebrow: "Parrainage",
      title: "Invitez des amis et gagnez des crédits.",
      copy: "Gagnez +2 crédits quand un ami rejoint et +5 quand il achète.",
      bullets: [
        "Les résultats gratuits ont un filigrane",
        "Un ami rejoint = +2 crédits",
        "Un ami achète = +5 crédits",
        "La fenêtre de réduction aide à vendre"
      ]
    },
    faq: {
      eyebrow: "FAQ",
      title: "Réponses rapides.",
      items: [
        { q: "Les résultats sont-ils réalistes ?", a: "Oui, le service crée des aperçus propres et réalistes." },
        { q: "Les résultats gratuits ont-ils un filigrane ?", a: "Oui, les résultats gratuits ont un filigrane." },
        { q: "Puis-je annuler à tout moment ?", a: "Oui, vous pouvez gérer votre plan à tout moment." },
        { q: "Mes fichiers sont-ils privés ?", a: "Oui, vos fichiers sont protégés." }
      ]
    },
    cta: {
      eyebrow: "Commencez maintenant",
      title: "Créez votre nouveau look en quelques secondes.",
      copy: "Ajoutez une photo, choisissez un style et partagez le résultat.",
      unlock: "Obtenir 30% de réduction"
    },
    urgency: {
      eyebrow: "Aujourd'hui seulement",
      title: "Attendez ! Obtenez 30% de réduction aujourd'hui",
      copy: "Cette offre est valable uniquement pendant cette session.",
      button: "Ouvrir la réduction"
    },
    upload: {
      modePhoto: "Utiliser ma photo",
      modeMannequin: "Utiliser un mannequin virtuel",
      genderLabel: "Type de corps",
      genderHint: "Choisissez le type de corps le plus proche.",
      genderFemale: "Femme",
      genderMale: "Homme",
      genderUnisex: "Unisexe",
      genderValue: { female: "Femme", male: "Homme", unisex: "Unisexe" },
      dropPhoto: "Déposez votre photo",
      formats: "PNG, JPG, WEBP jusqu'à 10MB",
      mannequinTitle: "Pas de photo ? Utilisez un mannequin.",
      mannequinCopy: "Entrez votre taille et voyez le vêtement sur un mannequin.",
      measurementHeight: "Taille",
      measurementChest: "Poitrine",
      measurementWaist: "Taille",
      measurementHips: "Hanches",
      measurementInseam: "Entrejambe",
      measurementUnit: "cm",
      mannequinHint: "Cela aide à créer un mannequin proche de votre taille.",
      resultTitle: "Dernier résultat",
      resultModePhoto: "Mode photo",
      resultModeMannequin: "Mode mannequin",
      resultSummaryPhoto: "Le vêtement a été placé sur votre photo.",
      resultSummaryMannequin: "Le vêtement a été placé sur un mannequin selon votre taille.",
      shareTitle: "Mon résultat GetDressAI",
      shareText: "Regardez mon nouveau look IA.",
      shareButton: "Partager",
      downloadHd: "Télécharger HD",
      generationFailed: "Impossible de créer l'image. Réessayez.",
      defaultPrompt: "Tenue de luxe, lumière propre, fond simple",
      generating: "Création...",
      generate: "Créer le résultat",
      presets: examplePresets
    },
    dashboard: {
      eyebrow: "Tableau de bord",
      title: "Vos résultats, crédits et historique.",
      recentResults: "Résultats récents",
      downloadHd: "Le téléchargement HD est pour les plans payants",
      creditsUsed: "3 crédits utilisés sur 28",
      download: "Télécharger",
      history: [
        { title: "Look de mariage", date: "Il y a 2 minutes" },
        { title: "Ensemble cuir", date: "Il y a 12 minutes" },
        { title: "Tenue de bureau", date: "Hier" }
      ],
      sidebar: ["Créer", "Historique", "Paiement", "Parrainage", "Réglages"],
      stats: [
        { label: "Crédits", note: "5 crédits bonus expirent dans 2 jours" },
        { label: "Générations", note: "12 aujourd'hui, 38 cette semaine" },
        { label: "Ventes par parrainage", note: "11 achats ce mois-ci" },
        { label: "Upgrade", note: "Meilleur trafic : social" }
      ]
    },
    login: {
      eyebrow: "Connexion",
      title: "Connectez-vous à GetDressAI",
      copy: "Utilisez votre email pour ouvrir votre compte.",
      email: "Email",
      password: "Mot de passe",
      button: "Continuer",
      forgotPassword: "Mot de passe oublié ?",
      sending: "Envoi...",
      sendReset: "Envoyer le lien",
      resetSent: "Lien de réinitialisation envoyé.",
      resetHint: "Nous vous enverrons un lien par email."
    },
    resetPassword: {
      eyebrow: "Réinitialiser le mot de passe",
      title: "Créez un nouveau mot de passe",
      copy: "Ouvrez le lien de l'email puis entrez le nouveau mot de passe ici.",
      password: "Nouveau mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      button: "Mettre à jour le mot de passe",
      saving: "Mise à jour...",
      success: "Mot de passe mis à jour.",
      missingSession: "Ouvrez d'abord cette page depuis le lien email.",
      mismatch: "Les mots de passe ne correspondent pas.",
      minLength: "Le mot de passe doit contenir au moins 8 caractères."
    },
    referralsPage: {
      eyebrow: "Parrainage",
      title: "Invitez des amis et gagnez des crédits.",
      items: [
        { title: "+2 crédits", note: "Un ami rejoint" },
        { title: "+5 crédits", note: "Un ami achète" },
        { title: "18.7%", note: "Conversion moyenne" }
      ]
    },
    privacy: {
      title: "Politique de confidentialité",
      copy: "Nous protégeons vos fichiers et utilisons l'analyse seulement pour améliorer le produit."
    },
    terms: {
      title: "Conditions d'utilisation",
      copy: "Les plans payants se renouvellent via Paddle. Les plans illimités suivent la règle fair use."
    },
    admin: {
      eyebrow: "Admin",
      title: "Utilisateurs, ventes et croissance.",
      labels: ["Utilisateurs", "Revenus", "MRR", "Conversions", "Utilisation des crédits", "Paiements échoués", "Meilleurs parrains"]
    }
  },
  de: {
    navbar: {
      pricing: "Preise",
      examples: "Beispiele",
      referrals: "Empfehlungen",
      login: "Login",
      tryFree: "Kostenlos testen"
    },
    footer: {
      description: "Probiere Kleidung auf deinem Foto mit KI an.",
      product: "Produkt",
      company: "Firma",
      growth: "Wachstum",
      dashboard: "Dashboard",
      referralProgram: "Empfehlungsprogramm",
      copyright: "© 2026 GetDressAI"
    },
    hero: {
      badge: "KI Kleidung testen",
      title: "Probiere Jedes Outfit in Sekunden auf Deinem Foto",
      copy: "Lade dein Foto hoch, wähle einen Stil und erhalte schnell einen neuen Look.",
      watchDemo: "Demo ansehen",
      founderDrop: "Diese Woche 30% Rabatt auf Starter",
      viewExamples: "Beispiele ansehen",
      generatedLooks: "Erstellte Looks",
      private: "Privat",
      secureUploads: "Sichere Uploads",
      fastOutput: "Schnelle Ergebnisse",
      trustUploadTitle: "Private sichere Uploads",
      trustFastTitle: "Schnelle Ergebnisse",
      trustLovedTitle: "Weltweit beliebt",
      trustUploadCopy: "Deine Uploads bleiben geschützt.",
      trustFastCopy: "Das Ergebnis kommt in wenigen Sekunden.",
      trustLovedCopy: "Wird in über 190 Ländern genutzt."
    },
    slider: { before: "Vorher", after: "Nachher", drag: "Ziehen" },
    trust: {
      generations: "Erstellte Looks",
      rating: "Durchschnittsbewertung",
      countries: "Länder",
      speed: "Durchschnittsgeschwindigkeit"
    },
    howItWorks: {
      eyebrow: "So funktioniert es",
      title: "Drei einfache Schritte.",
      steps: [
        { title: "Foto hochladen", copy: "Nutze ein klares Foto von vorn." },
        { title: "Outfit wählen", copy: "Wähle einen Stil oder schreibe deine Idee." },
        { title: "Ergebnis erhalten", copy: "Sieh deinen neuen Look in wenigen Sekunden." }
      ]
    },
    examples: {
      eyebrow: "Beispiele",
      title: "Sieh, wie dein nächster Look aussehen kann.",
      pageTitle: "Echte Beispiele mit GetDressAI.",
      note: "Probiere diesen Stil: {example}."
    },
    whyUs: {
      eyebrow: "Warum wir",
      title: "Einfach, schnell und klar.",
      category: "Wichtiger Punkt",
      ours: "GetDressAI",
      competitor: "Andere Tools",
      rows: [
        ["Qualität", "Sauber und realistisch", "Oft unruhig"],
        ["Geschwindigkeit", "Schnelles Ergebnis", "Oft langsamer"],
        ["Bezahlung", "Klare Preise", "Komplizierte Pläne"],
        ["Teilen", "Empfehlungssystem", "Wenig Wachstumstools"]
      ]
    },
    testimonials: {
      eyebrow: "Bewertungen",
      title: "Menschen nutzen es und kommen wieder.",
      items: [
        { name: "Amelia Hart", role: "Creator", quote: "Es ist leicht zu nutzen und das Ergebnis sieht gut aus." },
        { name: "Noor Rahman", role: "Gründer", quote: "Besucher haben alles sofort verstanden." },
        { name: "Mila Sato", role: "Stylistin", quote: "Viele Leute teilen ihre Ergebnisse." }
      ]
    },
    pricing: {
      eyebrow: "Preise",
      title: "Wähle einen Plan und starte.",
      pageTitle: "Einfache Pläne für jeden Bedarf.",
      pageCopy: "Starte kostenlos und upgrade später, wenn du mehr Looks brauchst.",
      popular: "Am beliebtesten",
      bestValue: "Beste Wahl",
      loading: "Lädt...",
      highlightNote: "Die meisten wählen diesen Plan.",
      defaultNote: "Du kannst deinen Plan jederzeit ändern.",
      checkoutFailed: "Zahlung konnte nicht geöffnet werden.",
      checkoutUrlMissing: "Zahlungslink nicht gefunden.",
      perMonth: "/ Monat",
      plans: [
        { name: "Free", subtitle: "1 Versuch", features: ["1 Kredit", "Wasserzeichen", "Standardgeschwindigkeit"], cta: "Kostenlos starten" },
        { name: "Starter", subtitle: "10 Kredite", features: ["10 Kredite", "Schneller", "HD Download", "Kein Wasserzeichen"], cta: "Starter kaufen" },
        { name: "Popular", subtitle: "30 Kredite", features: ["30 Kredite", "Priorität", "Empfehlungsbonus", "Mehr Wert"], cta: "Popular wählen" },
        { name: "Pro", subtitle: "Unbegrenzt", features: ["Unbegrenzt fair use", "Am schnellsten", "HD Download", "Priorisierte Hilfe"], cta: "Zu Pro wechseln" }
      ]
    },
    referralLoop: {
      eyebrow: "Empfehlungen",
      title: "Lade Freunde ein und erhalte Credits.",
      copy: "Du bekommst +2 Credits, wenn ein Freund beitritt, und +5, wenn er kauft.",
      bullets: [
        "Kostenlose Ergebnisse haben ein Wasserzeichen",
        "Freund tritt bei = +2 Credits",
        "Freund kauft = +5 Credits",
        "Das Rabatt-Popup hilft beim Verkaufen"
      ]
    },
    faq: {
      eyebrow: "FAQ",
      title: "Kurze Antworten.",
      items: [
        { q: "Sind die Ergebnisse realistisch?", a: "Ja, der Service erstellt saubere und realistische Vorschauen." },
        { q: "Haben kostenlose Ergebnisse ein Wasserzeichen?", a: "Ja, kostenlose Ergebnisse haben ein Wasserzeichen." },
        { q: "Kann ich jederzeit kündigen?", a: "Ja, du kannst deinen Plan jederzeit verwalten." },
        { q: "Sind meine Uploads privat?", a: "Ja, deine Uploads sind geschützt." }
      ]
    },
    cta: {
      eyebrow: "Jetzt starten",
      title: "Erstelle deinen neuen Look in Sekunden.",
      copy: "Lade ein Foto hoch, wähle einen Stil und teile das Ergebnis.",
      unlock: "30% Rabatt holen"
    },
    urgency: {
      eyebrow: "Nur heute",
      title: "Warte! Hol dir heute 30% Rabatt",
      copy: "Dieses Angebot gilt nur für diese Sitzung.",
      button: "Rabatt öffnen"
    },
    upload: {
      modePhoto: "Mein Foto nutzen",
      modeMannequin: "Virtuelle Schaufensterpuppe nutzen",
      genderLabel: "Körpertyp",
      genderHint: "Wähle den passendsten Körpertyp.",
      genderFemale: "Weiblich",
      genderMale: "Männlich",
      genderUnisex: "Unisex",
      genderValue: { female: "Weiblich", male: "Männlich", unisex: "Unisex" },
      dropPhoto: "Foto hier ablegen",
      formats: "PNG, JPG, WEBP bis 10MB",
      mannequinTitle: "Kein Foto? Nutze eine Puppe.",
      mannequinCopy: "Gib deine Größe ein und sieh das Outfit auf einer Puppe.",
      measurementHeight: "Größe",
      measurementChest: "Brust",
      measurementWaist: "Taille",
      measurementHips: "Hüfte",
      measurementInseam: "Innenbein",
      measurementUnit: "cm",
      mannequinHint: "So wird eine Puppe erstellt, die deiner Größe ähnelt.",
      resultTitle: "Letztes Ergebnis",
      resultModePhoto: "Fotomodus",
      resultModeMannequin: "Puppenmodus",
      resultSummaryPhoto: "Das Outfit wurde auf dein Foto gesetzt.",
      resultSummaryMannequin: "Das Outfit wurde passend zu deiner Größe auf eine Puppe gesetzt.",
      shareTitle: "Mein GetDressAI Ergebnis",
      shareText: "Sieh dir meinen neuen KI Look an.",
      shareButton: "Teilen",
      downloadHd: "HD herunterladen",
      generationFailed: "Bild konnte nicht erstellt werden. Bitte versuche es erneut.",
      defaultPrompt: "Luxus Outfit, sauberes Licht, einfacher Hintergrund",
      generating: "Wird erstellt...",
      generate: "Ergebnis erstellen",
      presets: examplePresets
    },
    dashboard: {
      eyebrow: "Dashboard",
      title: "Deine Ergebnisse, Credits und Historie.",
      recentResults: "Letzte Ergebnisse",
      downloadHd: "HD Download ist in bezahlten Plänen enthalten",
      creditsUsed: "3 von 28 Credits genutzt",
      download: "Herunterladen",
      history: [
        { title: "Hochzeitslook", date: "Vor 2 Minuten" },
        { title: "Leder Set", date: "Vor 12 Minuten" },
        { title: "Büro Outfit", date: "Gestern" }
      ],
      sidebar: ["Erstellen", "Verlauf", "Zahlung", "Empfehlungen", "Einstellungen"],
      stats: [
        { label: "Credits", note: "5 Bonus Credits enden in 2 Tagen" },
        { label: "Generierungen", note: "12 heute, 38 diese Woche" },
        { label: "Empfehlungsverkäufe", note: "11 Käufe in diesem Monat" },
        { label: "Upgrade", note: "Beste Quelle: Social Media" }
      ]
    },
    login: {
      eyebrow: "Login",
      title: "Bei GetDressAI anmelden",
      copy: "Nutze deine E-Mail, um dein Konto zu öffnen.",
      email: "E-Mail",
      password: "Passwort",
      button: "Weiter",
      forgotPassword: "Passwort vergessen?",
      sending: "Wird gesendet...",
      sendReset: "Link senden",
      resetSent: "Link zum Zurücksetzen wurde gesendet.",
      resetHint: "Wir senden dir einen Link per E-Mail."
    },
    resetPassword: {
      eyebrow: "Passwort zurücksetzen",
      title: "Neues Passwort erstellen",
      copy: "Öffne den Link in der E-Mail und gib hier dein neues Passwort ein.",
      password: "Neues Passwort",
      confirmPassword: "Passwort bestätigen",
      button: "Passwort aktualisieren",
      saving: "Wird aktualisiert...",
      success: "Passwort aktualisiert.",
      missingSession: "Öffne diese Seite zuerst über den E-Mail-Link.",
      mismatch: "Die Passwörter stimmen nicht überein.",
      minLength: "Das Passwort muss mindestens 8 Zeichen lang sein."
    },
    referralsPage: {
      eyebrow: "Empfehlungen",
      title: "Lade Freunde ein und erhalte Credits.",
      items: [
        { title: "+2 Credits", note: "Freund tritt bei" },
        { title: "+5 Credits", note: "Freund kauft" },
        { title: "18.7%", note: "Durchschnittliche Conversion" }
      ]
    },
    privacy: {
      title: "Datenschutz",
      copy: "Wir schützen deine Uploads und nutzen Analysen nur zur Verbesserung des Produkts."
    },
    terms: {
      title: "Nutzungsbedingungen",
      copy: "Bezahlte Pläne verlängern sich über Paddle. Für unbegrenzte Pläne gilt fair use."
    },
    admin: {
      eyebrow: "Admin",
      title: "Nutzer, Umsatz und Wachstum.",
      labels: ["Nutzer", "Umsatz", "MRR", "Conversions", "Credit Nutzung", "Fehlgeschlagene Zahlungen", "Top Empfehlungen"]
    }
  },
  ar: {
    navbar: {
      pricing: "الأسعار",
      examples: "أمثلة",
      referrals: "الإحالات",
      login: "تسجيل الدخول",
      tryFree: "جرّب مجانًا"
    },
    footer: {
      description: "جرّب الملابس على صورتك بالذكاء الاصطناعي.",
      product: "المنتج",
      company: "الشركة",
      growth: "النمو",
      dashboard: "لوحة التحكم",
      referralProgram: "برنامج الإحالة",
      copyright: "© 2026 GetDressAI"
    },
    hero: {
      badge: "تجربة ملابس بالذكاء الاصطناعي",
      title: "جرّب أي ملابس على صورتك خلال ثوانٍ",
      copy: "ارفع صورتك واختر النمط واحصل على مظهر جديد بسرعة.",
      watchDemo: "شاهد العرض",
      founderDrop: "خصم 30٪ على Starter هذا الأسبوع",
      viewExamples: "شاهد الأمثلة",
      generatedLooks: "إطلالات تم إنشاؤها",
      private: "خاص",
      secureUploads: "رفع آمن",
      fastOutput: "نتائج سريعة",
      trustUploadTitle: "رفع خاص وآمن",
      trustFastTitle: "نتائج سريعة",
      trustLovedTitle: "محبوب حول العالم",
      trustUploadCopy: "ملفاتك تبقى محمية.",
      trustFastCopy: "تحصل على النتيجة خلال ثوانٍ.",
      trustLovedCopy: "يُستخدم في أكثر من 190 دولة."
    },
    slider: { before: "قبل", after: "بعد", drag: "اسحب" },
    trust: {
      generations: "إطلالات تم إنشاؤها",
      rating: "متوسط التقييم",
      countries: "دول",
      speed: "متوسط السرعة"
    },
    howItWorks: {
      eyebrow: "كيف يعمل",
      title: "ثلاث خطوات بسيطة.",
      steps: [
        { title: "ارفع صورة", copy: "استخدم صورة واضحة من الأمام." },
        { title: "اختر الزي", copy: "اختر نمطًا أو اكتب فكرتك." },
        { title: "احصل على النتيجة", copy: "شاهد مظهرك الجديد خلال ثوانٍ." }
      ]
    },
    examples: {
      eyebrow: "أمثلة",
      title: "شاهد كيف قد تبدو إطلالتك القادمة.",
      pageTitle: "أمثلة حقيقية صُنعت باستخدام GetDressAI.",
      note: "جرّب هذا النمط: {example}."
    },
    whyUs: {
      eyebrow: "لماذا نحن",
      title: "بسيط وسريع وواضح.",
      category: "الأهم",
      ours: "GetDressAI",
      competitor: "أدوات أخرى",
      rows: [
        ["الجودة", "نظيف وواقعي", "غالبًا غير متناسق"],
        ["السرعة", "نتيجة سريعة", "غالبًا أبطأ"],
        ["الدفع", "أسعار واضحة", "خطط معقدة"],
        ["المشاركة", "نظام إحالة", "أدوات نمو قليلة"]
      ]
    },
    testimonials: {
      eyebrow: "آراء المستخدمين",
      title: "الناس يستخدمونه ويعودون إليه.",
      items: [
        { name: "Amelia Hart", role: "صانعة محتوى", quote: "سهل الاستخدام والنتيجة تبدو جميلة." },
        { name: "Noor Rahman", role: "مؤسس", quote: "الزوار فهموا الفكرة بسرعة." },
        { name: "Mila Sato", role: "منسقة أزياء", quote: "الناس يشاركون النتائج كثيرًا." }
      ]
    },
    pricing: {
      eyebrow: "الأسعار",
      title: "اختر خطة وابدأ.",
      pageTitle: "خطط بسيطة لكل احتياج.",
      pageCopy: "ابدأ مجانًا ثم طوّر خطتك عندما تحتاج إلى المزيد.",
      popular: "الأكثر شعبية",
      bestValue: "أفضل اختيار",
      loading: "جارٍ التحميل...",
      highlightNote: "معظم الناس يختارون هذه الخطة.",
      defaultNote: "يمكنك تغيير الخطة في أي وقت.",
      checkoutFailed: "تعذر فتح الدفع.",
      checkoutUrlMissing: "رابط الدفع غير موجود.",
      perMonth: "/ شهر",
      plans: [
        { name: "Free", subtitle: "محاولة واحدة", features: ["رصيد واحد", "علامة مائية", "سرعة عادية"], cta: "ابدأ مجانًا" },
        { name: "Starter", subtitle: "10 أرصدة", features: ["10 أرصدة", "أسرع", "تنزيل HD", "بدون علامة مائية"], cta: "اشترِ Starter" },
        { name: "Popular", subtitle: "30 رصيدًا", features: ["30 رصيدًا", "أولوية", "مكافأة إحالة", "قيمة أكبر"], cta: "اختر Popular" },
        { name: "Pro", subtitle: "غير محدود", features: ["استخدام غير محدود fair use", "الأسرع", "تنزيل HD", "دعم أولوية"], cta: "احصل على Pro" }
      ]
    },
    referralLoop: {
      eyebrow: "الإحالات",
      title: "ادعُ أصدقاءك واحصل على أرصدة.",
      copy: "تحصل على +2 رصيد عندما ينضم صديق، و+5 عندما يشتري.",
      bullets: [
        "النتائج المجانية عليها علامة مائية",
        "انضمام صديق = +2 رصيد",
        "شراء صديق = +5 أرصدة",
        "نافذة الخصم تساعد على زيادة المبيعات"
      ]
    },
    faq: {
      eyebrow: "الأسئلة الشائعة",
      title: "إجابات سريعة.",
      items: [
        { q: "هل النتائج واقعية؟", a: "نعم، الخدمة تصنع معاينات نظيفة وواقعية." },
        { q: "هل النتائج المجانية عليها علامة مائية؟", a: "نعم، النتائج المجانية عليها علامة مائية." },
        { q: "هل يمكنني الإلغاء في أي وقت؟", a: "نعم، يمكنك إدارة خطتك في أي وقت." },
        { q: "هل رفعاتي خاصة؟", a: "نعم، ملفاتك محمية." }
      ]
    },
    cta: {
      eyebrow: "ابدأ الآن",
      title: "أنشئ مظهرك الجديد خلال ثوانٍ.",
      copy: "ارفع صورة واختر نمطًا وشارك النتيجة.",
      unlock: "احصل على خصم 30٪"
    },
    urgency: {
      eyebrow: "اليوم فقط",
      title: "انتظر! احصل على خصم 30٪ اليوم",
      copy: "هذا العرض لهذه الجلسة فقط.",
      button: "افتح الخصم"
    },
    upload: {
      modePhoto: "استخدم صورتي",
      modeMannequin: "استخدم مانيكان افتراضي",
      genderLabel: "نوع الجسم",
      genderHint: "اختر نوع الجسم الأقرب.",
      genderFemale: "أنثى",
      genderMale: "ذكر",
      genderUnisex: "للجنسين",
      genderValue: { female: "أنثى", male: "ذكر", unisex: "للجنسين" },
      dropPhoto: "اسحب صورتك",
      formats: "PNG, JPG, WEBP حتى 10MB",
      mannequinTitle: "لا توجد صورة؟ استخدم مانيكان.",
      mannequinCopy: "أدخل مقاسك وشاهد الملابس على مانيكان.",
      measurementHeight: "الطول",
      measurementChest: "الصدر",
      measurementWaist: "الخصر",
      measurementHips: "الورك",
      measurementInseam: "طول الساق الداخلي",
      measurementUnit: "سم",
      mannequinHint: "يساعد هذا في إنشاء مانيكان قريب من مقاسك.",
      resultTitle: "آخر نتيجة",
      resultModePhoto: "وضع الصورة",
      resultModeMannequin: "وضع المانيكان",
      resultSummaryPhoto: "تم وضع الملابس على صورتك.",
      resultSummaryMannequin: "تم وضع الملابس على مانيكان حسب مقاسك.",
      shareTitle: "نتيجتي من GetDressAI",
      shareText: "شاهدوا إطلالتي الجديدة بالذكاء الاصطناعي.",
      shareButton: "مشاركة",
      downloadHd: "تنزيل HD",
      generationFailed: "تعذر إنشاء الصورة. حاول مرة أخرى.",
      defaultPrompt: "إطلالة فاخرة، إضاءة نظيفة، خلفية بسيطة",
      generating: "جارٍ الإنشاء...",
      generate: "إنشاء النتيجة",
      presets: examplePresets
    },
    dashboard: {
      eyebrow: "لوحة التحكم",
      title: "نتائجك وأرصدةك وسجلك.",
      recentResults: "آخر النتائج",
      downloadHd: "تنزيل HD متاح في الخطط المدفوعة",
      creditsUsed: "تم استخدام 3 من 28 رصيدًا",
      download: "تنزيل",
      history: [
        { title: "إطلالة زفاف", date: "منذ دقيقتين" },
        { title: "طقم جلدي", date: "منذ 12 دقيقة" },
        { title: "ملابس مكتب", date: "أمس" }
      ],
      sidebar: ["إنشاء", "السجل", "الدفع", "الإحالات", "الإعدادات"],
      stats: [
        { label: "الأرصدة", note: "ستنتهي 5 أرصدة إضافية خلال يومين" },
        { label: "الإنشاءات", note: "12 اليوم، 38 هذا الأسبوع" },
        { label: "مبيعات الإحالة", note: "11 عملية شراء هذا الشهر" },
        { label: "الترقية", note: "أفضل مصدر: الشبكات الاجتماعية" }
      ]
    },
    login: {
      eyebrow: "تسجيل الدخول",
      title: "سجّل الدخول إلى GetDressAI",
      copy: "استخدم بريدك الإلكتروني لفتح حسابك.",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      button: "متابعة",
      forgotPassword: "هل نسيت كلمة المرور؟",
      sending: "جارٍ الإرسال...",
      sendReset: "إرسال الرابط",
      resetSent: "تم إرسال رابط إعادة التعيين.",
      resetHint: "سنرسل لك رابط إعادة التعيين عبر البريد."
    },
    resetPassword: {
      eyebrow: "إعادة تعيين كلمة المرور",
      title: "أنشئ كلمة مرور جديدة",
      copy: "افتح الرابط من البريد ثم أدخل كلمة المرور الجديدة هنا.",
      password: "كلمة المرور الجديدة",
      confirmPassword: "تأكيد كلمة المرور",
      button: "تحديث كلمة المرور",
      saving: "جارٍ التحديث...",
      success: "تم تحديث كلمة المرور.",
      missingSession: "افتح هذه الصفحة أولًا من رابط البريد.",
      mismatch: "كلمتا المرور غير متطابقتين.",
      minLength: "يجب أن تكون كلمة المرور 8 أحرف على الأقل."
    },
    referralsPage: {
      eyebrow: "الإحالات",
      title: "ادعُ أصدقاءك واحصل على أرصدة.",
      items: [
        { title: "+2 رصيد", note: "عندما ينضم صديق" },
        { title: "+5 أرصدة", note: "عندما يشتري صديق" },
        { title: "18.7%", note: "متوسط التحويل" }
      ]
    },
    privacy: {
      title: "سياسة الخصوصية",
      copy: "نحن نحمي ملفاتك ونستخدم التحليلات فقط لتحسين المنتج."
    },
    terms: {
      title: "شروط الخدمة",
      copy: "يتم تجديد الخطط المدفوعة عبر Paddle. الخطط غير المحدودة تخضع لقاعدة fair use."
    },
    admin: {
      eyebrow: "المشرف",
      title: "المستخدمون والمبيعات والنمو.",
      labels: ["المستخدمون", "الإيراد", "MRR", "التحويلات", "استخدام الأرصدة", "المدفوعات الفاشلة", "أفضل المحيلين"]
    }
  }
} satisfies Record<SupportedLanguage, Record<string, unknown>>;

export function getTranslationValue(language: SupportedLanguage, key: string) {
  const parts = key.split(".");
  let current: unknown = translations[language] ?? translations.en;

  for (const part of parts) {
    if (typeof current !== "object" || current === null || !(part in current)) {
      current = translations.en;
      for (const fallbackPart of parts) {
        if (typeof current !== "object" || current === null || !(fallbackPart in current)) {
          return key;
        }
        current = (current as Record<string, unknown>)[fallbackPart];
      }
      return current;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}
