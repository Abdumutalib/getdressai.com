export const supportedLanguages = ["en", "ru", "uz", "tr", "es", "fr", "de", "ar"] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export const translations = {
  en: {
    navbar: {
      pricing: "Pricing",
      examples: "Examples",
      referrals: "Referrals",
      login: "Login",
      tryFree: "Try Free Now"
    },
    footer: {
      description: "Premium AI virtual try-on for fast-moving creators, shoppers, and fashion-first teams.",
      product: "Product",
      company: "Company",
      growth: "Growth",
      dashboard: "Dashboard",
      referralProgram: "Referral program",
      copyright: "© 2026 GetDressAI"
    },
    hero: {
      badge: "Viral AI try-on for premium conversion",
      title: "Try Any Outfit on Your Photo in Seconds",
      copy: "Upload your photo, choose any style, and get realistic AI transformations instantly.",
      watchDemo: "Watch Demo",
      founderDrop: "Founder drop: 30% off starter plans this week",
      viewExamples: "View Examples",
      generatedLooks: "Generated looks",
      private: "Private",
      secureUploads: "Secure signed uploads",
      fastOutput: "Fast output pipeline",
      trustUploadTitle: "Private secure uploads",
      trustFastTitle: "Fast results",
      trustLovedTitle: "Loved worldwide",
      trustUploadCopy: "Signed URLs and guarded asset access.",
      trustFastCopy: "Built for fast feedback and repeat usage.",
      trustLovedCopy: "Creators, stylists, and shoppers in 190+ countries."
    },
    slider: {
      before: "Before",
      after: "After",
      drag: "Drag"
    },
    trust: {
      generations: "AI generations delivered",
      rating: "Average creator rating",
      countries: "Countries with active users",
      speed: "Median generation time"
    },
    howItWorks: {
      eyebrow: "How it works",
      title: "From upload to premium shareable result in three fast steps.",
      steps: [
        {
          title: "Upload photo",
          copy: "Drop a clear front-facing image. We secure it with signed URLs and private storage policies."
        },
        {
          title: "Choose style",
          copy: "Use premium presets like luxury, wedding, gym, office, anime, or write your own prompt."
        },
        {
          title: "Generate result",
          copy: "Get a studio-grade AI transformation, watermark for free users, and HD downloads for paid plans."
        }
      ]
    },
    examples: {
      eyebrow: "Examples",
      title: "High-intent looks designed to trigger curiosity, screenshots, and shares.",
      pageTitle: "Explore transformations that feel premium enough to convert and viral enough to share.",
      note: "Viral-ready transformation preset for {example} moments."
    },
    whyUs: {
      eyebrow: "Why us",
      title: "A premium AI SaaS stack built to outperform low-trust try-on tools.",
      category: "Category",
      ours: "GetDressAI",
      competitor: "Typical competitor",
      rows: [
        ["Realistic outputs", "High-fidelity body-aware transformations", "Template-heavy outputs"],
        ["Growth loop", "Watermark + referral credits + exit offer", "No built-in viral acquisition"],
        ["Billing stack", "Paddle subscriptions and credit packs", "One-dimensional paywall"],
        ["Retention", "Email flows, low-credit warnings, winback triggers", "Weak lifecycle hooks"]
      ]
    },
    testimonials: {
      eyebrow: "Loved by growth teams",
      title: "Social proof that feels specific, human, and believable.",
      items: [
        {
          name: "Amelia Hart",
          role: "UGC Creator",
          quote: "We switched from a generic try-on app and our landing page conversion jumped within the first week."
        },
        {
          name: "Noor Rahman",
          role: "Fashion Founder",
          quote: "GetDressAI feels premium enough to sell at startup prices and fast enough to keep viral momentum."
        },
        {
          name: "Mila Sato",
          role: "TikTok Stylist",
          quote: "The before-and-after output gets posted directly. That watermark loop alone brings us new users daily."
        }
      ]
    },
    pricing: {
      eyebrow: "Pricing",
      title: "Built to convert first-time users into expanding paid cohorts.",
      pageTitle: "Choose the plan that matches your content velocity.",
      pageCopy: "Free for first proof. Paid plans for serious creators, teams, and high-frequency wardrobe testing.",
      popular: "Most Popular",
      bestValue: "Best value for creators",
      loading: "Loading...",
      highlightNote: "Most creators upgrade here after the first free try.",
      defaultNote: "Instant activation. Cancel or upgrade anytime.",
      checkoutFailed: "Checkout failed.",
      checkoutUrlMissing: "Checkout URL not returned.",
      perMonth: "/ month",
      plans: [
        {
          name: "Free",
          subtitle: "1 preview with watermark",
          features: ["1 preview credit", "Made with GetDressAI watermark", "Standard queue"],
          cta: "Start Free"
        },
        {
          name: "Starter",
          subtitle: "10 credits for first wins",
          features: ["10 credits", "Faster queue", "HD download", "No watermark"],
          cta: "Get Starter"
        },
        {
          name: "Popular",
          subtitle: "30 credits for creators",
          features: ["30 credits", "Priority queue", "Referral multipliers", "Early prompt packs"],
          cta: "Choose Popular"
        },
        {
          name: "Pro",
          subtitle: "Unlimited monthly fair use",
          features: ["Unlimited fair use", "Batch generation", "Upsell portal access", "Priority support"],
          cta: "Go Pro"
        }
      ]
    },
    referralLoop: {
      eyebrow: "Referral loop",
      title: "Invite friends. Earn credits. Turn free users into a growth engine.",
      copy: "Refer a friend and get +2 credits when they join, +5 credits when they buy. Combine that with shareable watermarked outputs and an exit pop-up that unlocks 30% off today.",
      bullets: [
        "Free outputs include a shareable watermark",
        "Invite accepted = +2 credits",
        "First purchase = +5 credits",
        "Abandoned checkout email flow recovers lost revenue"
      ]
    },
    faq: {
      eyebrow: "FAQ",
      title: "Answers that remove buying friction fast.",
      items: [
        {
          q: "How realistic are the generations?",
          a: "The app is tuned for conversion-grade realism: clean body alignment, sharper outfit boundaries, and prompt-safe upscale delivery."
        },
        {
          q: "Do free images include a watermark?",
          a: "Yes. Free outputs include a Made with GetDressAI watermark to create a built-in viral loop."
        },
        {
          q: "Can I cancel Paddle subscriptions anytime?",
          a: "Yes. Billing portal, upgrade, downgrade, and cancellation are handled through Paddle-backed subscription sync."
        },
        {
          q: "Are uploads private?",
          a: "Uploads use secure buckets, signed URLs, auth-guarded access, and server-side validation before generation."
        }
      ]
    },
    cta: {
      eyebrow: "Final CTA",
      title: "Try your next viral outfit before someone else captures the trend.",
      copy: "Free preview, instant sharing, premium upgrades, and referral credits all wired into one premium stack.",
      unlock: "Unlock 30% today"
    },
    urgency: {
      eyebrow: "Urgency trigger",
      title: "Wait! Get 30% Off Today",
      copy: "Limited-time founder offer for creators who activate within this session.",
      button: "Unlock Discount"
    },
    upload: {
      modePhoto: "Use my photo",
      modeMannequin: "Use virtual mannequin",
      genderLabel: "Model fit",
      genderHint: "Choose the body shape closest to your outfit target.",
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
      mannequinTitle: "No photo? Dress a virtual mannequin instead.",
      mannequinCopy: "Enter your body measurements and we'll fit the outfit on a mannequin with proportions close to your sizing.",
      measurementHeight: "Height",
      measurementChest: "Chest",
      measurementWaist: "Waist",
      measurementHips: "Hips",
      measurementInseam: "Inseam",
      measurementUnit: "cm",
      mannequinHint: "These measurements shape a mannequin preview when you don't want to upload a personal photo.",
      resultTitle: "Latest generation",
      resultModePhoto: "Photo mode",
      resultModeMannequin: "Virtual mannequin mode",
      resultSummaryPhoto: "Outfit placed on your uploaded photo with creator-grade styling.",
      resultSummaryMannequin: "Outfit fitted on a virtual mannequin built from your measurements.",
      shareTitle: "GetDressAI result",
      shareText: "See my AI outfit transformation from GetDressAI.",
      shareButton: "Share result",
      downloadHd: "Download HD",
      generationFailed: "Generation failed. Please try again.",
      defaultPrompt: "Luxury editorial look with premium tailoring, strong silhouette, clean lighting",
      generating: "Generating...",
      generate: "Generate Result",
      presets: ["Luxury", "Streetwear", "Wedding", "Office", "Gym", "Anime", "Celebrity", "Casual"]
    },
    dashboard: {
      eyebrow: "Dashboard",
      title: "Generate, monitor credits, and turn results into repeat usage.",
      recentResults: "Recent results",
      downloadHd: "Download HD on paid plans",
      creditsUsed: "3 of 28 credits used",
      download: "Download",
      history: [
        { title: "Wedding couture", date: "2 minutes ago" },
        { title: "Celebrity leather set", date: "12 minutes ago" },
        { title: "Office capsule", date: "Yesterday" }
      ],
      sidebar: ["Generate", "History", "Billing", "Referrals", "Settings"],
      stats: [
        { label: "Credits", note: "5 bonus credits expiring in 2 days" },
        { label: "Generations", note: "12 today, 38 this week" },
        { label: "Referral revenue", note: "11 referred purchases this month" },
        { label: "Upgrade rate", note: "Best cohort: organic social" }
      ]
    },
    login: {
      eyebrow: "Login",
      title: "Sign in to GetDressAI",
      copy: "Supabase Auth powers secure email and magic-link access for dashboard, billing, and referrals.",
      email: "Email",
      password: "Password",
      button: "Continue",
      forgotPassword: "Forgot password?",
      sending: "Sending...",
      sendReset: "Send reset link",
      resetSent: "Password reset link sent. Check your email inbox.",
      resetHint: "We'll email you a secure link to choose a new password."
    },
    resetPassword: {
      eyebrow: "Password recovery",
      title: "Choose a new password",
      copy: "Open the recovery email, then set a fresh password for your account here.",
      password: "New password",
      confirmPassword: "Confirm new password",
      button: "Update password",
      saving: "Updating...",
      success: "Password updated. You can sign in now.",
      missingSession: "Open this page from the email recovery link first.",
      mismatch: "Passwords do not match.",
      minLength: "Password must be at least 8 characters."
    },
    referralsPage: {
      eyebrow: "Referrals",
      title: "Build a compounding credit loop.",
      items: [
        { title: "+2 credits", note: "Friend joins through your link" },
        { title: "+5 credits", note: "Friend completes first purchase" },
        { title: "18.7%", note: "Average invite-to-signup conversion" }
      ]
    },
    privacy: {
      title: "Privacy Policy",
      copy: "We store uploads in secure, access-controlled storage, issue signed URLs for temporary asset access, and use analytics only to improve conversion, retention, and product performance."
    },
    terms: {
      title: "Terms of Service",
      copy: "Paid plans renew through Paddle. Fair-use limits apply to unlimited plans. Abuse prevention includes rate limiting, fraud checks, and protected asset access."
    },
    admin: {
      eyebrow: "Admin",
      title: "Revenue, conversion, and retention control center.",
      labels: ["Users", "Revenue", "MRR", "Conversions", "Credit usage", "Failed payments", "Top referrers"]
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
      description: "Премиальный AI virtual try-on для креаторов, покупателей и fashion-команд с высокой скоростью запуска.",
      product: "Продукт",
      company: "Компания",
      growth: "Рост",
      dashboard: "Панель",
      referralProgram: "Реферальная программа",
      copyright: "© 2026 GetDressAI"
    },
    hero: {
      badge: "Вирусный AI try-on для премиальной конверсии",
      title: "Примерьте любой образ на своем фото за секунды",
      copy: "Загрузите фото, выберите стиль и получите реалистичную AI-трансформацию почти мгновенно.",
      watchDemo: "Смотреть демо",
      generatedLooks: "Сгенерированных образов",
      private: "Приватно",
      secureUploads: "Защищенные загрузки",
      fastOutput: "Быстрый рендер",
      trustUploadTitle: "\u041f\u0440\u0438\u0432\u0430\u0442\u043d\u044b\u0435 \u0437\u0430\u0449\u0438\u0449\u0435\u043d\u043d\u044b\u0435 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438",
      trustFastTitle: "\u0411\u044b\u0441\u0442\u0440\u044b\u0435 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u044b",
      trustLovedTitle: "\u041b\u044e\u0431\u044f\u0442 \u043f\u043e \u0432\u0441\u0435\u043c\u0443 \u043c\u0438\u0440\u0443"
    },
    trust: {
      generations: "AI-генераций доставлено",
      rating: "Средняя оценка креаторов",
      countries: "Стран с активными пользователями",
      speed: "Среднее время генерации"
    },
    howItWorks: {
      eyebrow: "Как это работает",
      title: "От загрузки до премиального результата всего за три шага.",
      steps: [
        {
          title: "Загрузите фото",
          copy: "Добавьте четкое фронтальное фото. Мы защищаем его signed URL и приватным хранением."
        },
        {
          title: "Выберите стиль",
          copy: "Используйте премиальные пресеты: luxury, wedding, gym, office, anime или свой промпт."
        },
        {
          title: "Получите результат",
          copy: "Получайте студийную AI-трансформацию, водяной знак для free-плана и HD-загрузки для платных."
        }
      ]
    },
    examples: {
      eyebrow: "Примеры",
      title: "Образы с высоким intent, которые вызывают интерес, скриншоты и шеры.",
      pageTitle: "Смотрите трансформации, которые выглядят достаточно премиально для покупки и достаточно ярко для шаринга.",
      note: "Готовый к вирусности пресет трансформации для {example}."
    },
    whyUs: {
      eyebrow: "Почему мы",
      title: "Премиальный AI SaaS-стек, который обгоняет low-trust try-on сервисы.",
      category: "Категория",
      ours: "GetDressAI",
      competitor: "Обычный конкурент",
      rows: [
        ["Реализм", "Трансформации с учетом тела и деталей", "Шаблонные результаты"],
        ["Рост", "Watermark + referral credits + exit offer", "Нет встроенного вирусного цикла"],
        ["Оплата", "Paddle подписки и пакеты кредитов", "Слабый paywall"],
        ["Retention", "Email-флоу, low-credit warning, winback", "Слабая lifecycle-механика"]
      ]
    },
    testimonials: {
      eyebrow: "Любим рост-командами",
      title: "Соцдоказательство, которое звучит конкретно и правдоподобно.",
      items: [
        {
          name: "Amelia Hart",
          role: "UGC Creator",
          quote: "Мы ушли с обычного try-on сервиса, и конверсия лендинга выросла уже в первую неделю."
        },
        {
          name: "Noor Rahman",
          role: "Fashion Founder",
          quote: "GetDressAI ощущается премиально настолько, что можно продавать как startup-продукт, и быстро настолько, чтобы держать вирусный темп."
        },
        {
          name: "Mila Sato",
          role: "TikTok Stylist",
          quote: "Пользователи сразу постят before/after. Один watermark цикл уже ежедневно приводит новых людей."
        }
      ]
    },
    pricing: {
      eyebrow: "Тарифы",
      title: "Сделано так, чтобы превращать первых пользователей в растущие платные когорты.",
      pageTitle: "Выберите тариф под вашу скорость создания контента.",
      pageCopy: "Бесплатно для первой проверки. Платные планы для серьезных креаторов, команд и частых примерок.",
      popular: "Самый популярный",
      perMonth: "/ месяц",
      plans: [
        {
          name: "Free",
          subtitle: "1 превью с watermark",
          features: ["1 кредит на превью", "Watermark Made with GetDressAI", "Стандартная очередь"],
          cta: "Начать бесплатно"
        },
        {
          name: "Starter",
          subtitle: "10 кредитов для первых побед",
          features: ["10 кредитов", "Быстрее очередь", "HD скачивание", "Без watermark"],
          cta: "Взять Starter"
        },
        {
          name: "Popular",
          subtitle: "30 кредитов для креаторов",
          features: ["30 кредитов", "Приоритетная очередь", "Усиленные рефералы", "Ранний доступ к prompt pack"],
          cta: "Выбрать Popular"
        },
        {
          name: "Pro",
          subtitle: "Безлимитное fair use в месяц",
          features: ["Безлимитное fair use", "Пакетная генерация", "Доступ к upsell portal", "Приоритетная поддержка"],
          cta: "Перейти на Pro"
        }
      ]
    },
    referralLoop: {
      eyebrow: "Реферальный цикл",
      title: "Приглашайте друзей. Зарабатывайте кредиты. Превратите free users в growth engine.",
      copy: "Пригласите друга и получите +2 кредита, когда он зарегистрируется, и +5, когда купит. Добавьте shareable watermark и exit pop-up со скидкой 30% сегодня.",
      bullets: [
        "Free outputs включают shareable watermark",
        "Принятое приглашение = +2 кредита",
        "Первая покупка = +5 кредитов",
        "Email flow для abandoned checkout возвращает выручку"
      ]
    },
    faq: {
      eyebrow: "FAQ",
      title: "Ответы, которые быстро убирают трение перед оплатой.",
      items: [
        {
          q: "Насколько реалистичны генерации?",
          a: "Приложение настроено на conversion-grade realism: чистое выравнивание тела, четкие границы одежды и безопасный upscale."
        },
        {
          q: "Есть ли watermark на бесплатных изображениях?",
          a: "Да. Free outputs получают watermark Made with GetDressAI и создают встроенный вирусный цикл."
        },
        {
          q: "Можно ли отменить подписку Paddle в любой момент?",
          a: "Да. Billing portal, upgrade, downgrade и cancellation работают через Paddle-backed sync."
        },
        {
          q: "Загрузки приватные?",
          a: "Да. Используются secure buckets, signed URLs, auth-guarded access и server-side validation."
        }
      ]
    },
    cta: {
      eyebrow: "Финальный CTA",
      title: "Примерьте следующий вирусный образ раньше, чем тренд заберет кто-то другой.",
      copy: "Бесплатное превью, мгновенный шаринг, премиальные апгрейды и реферальные кредиты собраны в одну сильную систему.",
      unlock: "Открыть 30% сегодня"
    },
    urgency: {
      eyebrow: "Триггер срочности",
      title: "Подождите! Получите 30% скидку сегодня",
      copy: "Ограниченное предложение для первых креаторов, которые активируются в этой сессии.",
      button: "Открыть скидку"
    },
    upload: {
      modePhoto: "\u0418\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u044c \u043c\u043e\u0435 \u0444\u043e\u0442\u043e",
      modeMannequin: "\u0418\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u044c \u0432\u0438\u0440\u0442\u0443\u0430\u043b\u044c\u043d\u044b\u0439 \u043c\u0430\u043d\u0435\u043a\u0435\u043d",
      genderLabel: "\u041f\u043e\u0441\u0430\u0434\u043a\u0430 \u043c\u043e\u0434\u0435\u043b\u0438",
      genderHint: "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0438\u043b\u0443\u044d\u0442 \u0442\u0435\u043b\u0430, \u043a\u043e\u0442\u043e\u0440\u044b\u0439 \u0431\u043b\u0438\u0436\u0435 \u0432\u0441\u0435\u0433\u043e \u043a \u0432\u0430\u0448\u0435\u043c\u0443 \u043e\u0431\u0440\u0430\u0437\u0443.",
      genderFemale: "\u0416\u0435\u043d\u0441\u043a\u0438\u0439",
      genderMale: "\u041c\u0443\u0436\u0441\u043a\u043e\u0439",
      genderUnisex: "\u0423\u043d\u0438\u0441\u0435\u043a\u0441",
      genderValue: {
        female: "\u0416\u0435\u043d\u0441\u043a\u0438\u0439",
        male: "\u041c\u0443\u0436\u0441\u043a\u043e\u0439",
        unisex: "\u0423\u043d\u0438\u0441\u0435\u043a\u0441"
      },
      dropPhoto: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0444\u043e\u0442\u043e",
      formats: "PNG, JPG, WEBP \u0434\u043e 10MB",
      mannequinTitle: "\u041d\u0435\u0442 \u0444\u043e\u0442\u043e? \u041f\u0440\u0438\u043c\u0435\u0440\u044c\u0442\u0435 \u043e\u0431\u0440\u0430\u0437 \u043d\u0430 \u0432\u0438\u0440\u0442\u0443\u0430\u043b\u044c\u043d\u043e\u043c \u043c\u0430\u043d\u0435\u043a\u0435\u043d\u0435.",
      mannequinCopy: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0432\u043e\u0438 \u043c\u0435\u0440\u043a\u0438, \u0438 \u043c\u044b \u043f\u043e\u043a\u0430\u0436\u0435\u043c \u043e\u0434\u0435\u0436\u0434\u0443 \u043d\u0430 \u043c\u0430\u043d\u0435\u043a\u0435\u043d\u0435 \u0441 \u0431\u043b\u0438\u0437\u043a\u0438\u043c\u0438 \u043f\u0440\u043e\u043f\u043e\u0440\u0446\u0438\u044f\u043c\u0438.",
      measurementHeight: "\u0420\u043e\u0441\u0442",
      measurementChest: "\u0413\u0440\u0443\u0434\u044c",
      measurementWaist: "\u0422\u0430\u043b\u0438\u044f",
      measurementHips: "\u0411\u0435\u0434\u0440\u0430",
      measurementInseam: "\u0428\u0430\u0433\u043e\u0432\u044b\u0439 \u0448\u043e\u0432",
      measurementUnit: "\u0441\u043c",
      mannequinHint: "\u042d\u0442\u0438 \u043c\u0435\u0440\u043a\u0438 \u0444\u043e\u0440\u043c\u0438\u0440\u0443\u044e\u0442 \u043f\u0440\u0435\u0432\u044c\u044e \u043c\u0430\u043d\u0435\u043a\u0435\u043d\u0430, \u0435\u0441\u043b\u0438 \u0432\u044b \u043d\u0435 \u0445\u043e\u0442\u0438\u0442\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u0442\u044c \u043b\u0438\u0447\u043d\u043e\u0435 \u0444\u043e\u0442\u043e.",
      resultTitle: "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u044f\u044f \u0433\u0435\u043d\u0435\u0440\u0430\u0446\u0438\u044f",
      resultModePhoto: "\u0420\u0435\u0436\u0438\u043c \u0444\u043e\u0442\u043e",
      resultModeMannequin: "\u0420\u0435\u0436\u0438\u043c \u0432\u0438\u0440\u0442\u0443\u0430\u043b\u044c\u043d\u043e\u0433\u043e \u043c\u0430\u043d\u0435\u043a\u0435\u043d\u0430",
      resultSummaryPhoto: "\u041e\u0431\u0440\u0430\u0437 \u043d\u0430\u043b\u043e\u0436\u0435\u043d \u043d\u0430 \u0432\u0430\u0448\u0435 \u0444\u043e\u0442\u043e \u0441 creator-grade \u0441\u0442\u0438\u043b\u0438\u0437\u0430\u0446\u0438\u0435\u0439.",
      resultSummaryMannequin: "\u041e\u0431\u0440\u0430\u0437 \u043f\u043e\u0434\u043e\u0433\u043d\u0430\u043d \u043f\u043e\u0434 \u0432\u0438\u0440\u0442\u0443\u0430\u043b\u044c\u043d\u044b\u0439 \u043c\u0430\u043d\u0435\u043a\u0435\u043d \u043f\u043e \u0432\u0430\u0448\u0438\u043c \u043c\u0435\u0440\u043a\u0430\u043c.",
      shareTitle: "\u0420\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442 GetDressAI",
      shareText: "\u041f\u043e\u0441\u043c\u043e\u0442\u0440\u0438\u0442\u0435 \u043d\u0430 \u043c\u043e\u044e AI-\u0442\u0440\u0430\u043d\u0441\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044e \u043e\u0431\u0440\u0430\u0437\u0430 \u0432 GetDressAI.",
      shareButton: "\u041f\u043e\u0434\u0435\u043b\u0438\u0442\u044c\u0441\u044f \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u043e\u043c",
      downloadHd: "\u0421\u043a\u0430\u0447\u0430\u0442\u044c HD",
      generationFailed: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0432\u044b\u043f\u043e\u043b\u043d\u0438\u0442\u044c \u0433\u0435\u043d\u0435\u0440\u0430\u0446\u0438\u044e. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0435 \u0440\u0430\u0437.",
      defaultPrompt: "Luxury editorial look \u0441 \u043f\u0440\u0435\u043c\u0438\u0430\u043b\u044c\u043d\u044b\u043c \u0442\u0435\u0439\u043b\u043e\u0440\u0438\u043d\u0433\u043e\u043c, \u0441\u0438\u043b\u044c\u043d\u044b\u043c \u0441\u0438\u043b\u0443\u044d\u0442\u043e\u043c \u0438 \u0447\u0438\u0441\u0442\u044b\u043c \u0441\u0432\u0435\u0442\u043e\u043c",
      generating: "\u0413\u0435\u043d\u0435\u0440\u0430\u0446\u0438\u044f...",
      generate: "\u0421\u0433\u0435\u043d\u0435\u0440\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442",
      presets: ["Luxury", "Streetwear", "Wedding", "Office", "Gym", "Anime", "Celebrity", "Casual"]
    },
    dashboard: {
      eyebrow: "Панель",
      title: "Генерируйте, отслеживайте кредиты и превращайте результат в повторное использование.",
      recentResults: "Недавние результаты",
      downloadHd: "HD скачивание на платных планах",
      creditsUsed: "Использовано 3 из 28 кредитов",
      download: "Скачать",
      history: [
        { title: "Wedding couture", date: "2 минуты назад" },
        { title: "Celebrity leather set", date: "12 минут назад" },
        { title: "Office capsule", date: "Вчера" }
      ],
      sidebar: ["Генерация", "История", "Оплата", "Рефералы", "Настройки"],
      stats: [
        { label: "Кредиты", note: "5 бонусных кредитов истекают через 2 дня" },
        { label: "Генерации", note: "12 сегодня, 38 за неделю" },
        { label: "Реферальная выручка", note: "11 покупок по рефералам в этом месяце" },
        { label: "Апгрейд-рейт", note: "Лучшая когорта: organic social" }
      ]
    },
    login: {
      eyebrow: "Вход",
      title: "Войдите в GetDressAI",
      copy: "Supabase Auth обеспечивает безопасный email и magic-link доступ к панели, оплате и рефералам.",
      email: "Email",
      password: "Пароль",
      button: "Продолжить",
      forgotPassword: "Забыли пароль?",
      sending: "Отправка...",
      sendReset: "Отправить ссылку",
      resetSent: "Ссылка для сброса пароля отправлена. Проверьте почту.",
      resetHint: "Мы отправим безопасную ссылку, чтобы вы выбрали новый пароль."
    },
    resetPassword: {
      eyebrow: "Восстановление пароля",
      title: "Задайте новый пароль",
      copy: "Откройте письмо для восстановления и задайте здесь новый пароль для аккаунта.",
      password: "Новый пароль",
      confirmPassword: "Подтвердите новый пароль",
      button: "Обновить пароль",
      saving: "Обновление...",
      success: "Пароль обновлен. Теперь можно войти.",
      missingSession: "Сначала откройте эту страницу из письма для восстановления.",
      mismatch: "Пароли не совпадают.",
      minLength: "Пароль должен содержать минимум 8 символов."
    },
    referralsPage: {
      eyebrow: "Рефералы",
      title: "Постройте самоускоряющийся цикл кредитов.",
      items: [
        { title: "+2 кредита", note: "Друг зарегистрировался по вашей ссылке" },
        { title: "+5 кредитов", note: "Друг совершил первую покупку" },
        { title: "18.7%", note: "Средняя конверсия invite-to-signup" }
      ]
    },
    privacy: {
      title: "Политика конфиденциальности",
      copy: "Мы храним загрузки в защищенном хранилище с контролем доступа, используем signed URLs для временного доступа и применяем аналитику только для улучшения конверсии, retention и качества продукта."
    },
    terms: {
      title: "Условия использования",
      copy: "Платные планы продлеваются через Paddle. Для безлимитных планов действует fair-use. Защита от злоупотреблений включает rate limiting, fraud checks и защищенный доступ к файлам."
    },
    admin: {
      eyebrow: "Админ",
      title: "Центр управления выручкой, конверсией и удержанием.",
      labels: ["Пользователи", "Выручка", "MRR", "Конверсии", "Использование кредитов", "Неудачные платежи", "Топ рефереры"]
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
      description: "Tez ishlaydigan kreatorlar, xaridorlar va fashion jamoalar учун premium AI virtual try-on.",
      product: "Mahsulot",
      company: "Kompaniya",
      growth: "O'sish",
      dashboard: "Panel",
      referralProgram: "Referal dasturi",
      copyright: "© 2026 GetDressAI"
    },
    hero: {
      badge: "Premium konversiya uchun viral AI try-on",
      title: "Istalgan kiyimni suratingizda soniyalar ichida sinab ko'ring",
      copy: "Suratingizni yuklang, uslubni tanlang va realistik AI transformatsiyani darhol oling.",
      watchDemo: "Demo ko'rish",
      generatedLooks: "Yaratilgan look'lar",
      private: "Maxfiy",
      secureUploads: "Himoyalangan yuklashlar",
      fastOutput: "Tez natija pipeline",
      trustUploadTitle: "Maxfiy himoyalangan yuklashlar",
      trustFastTitle: "Tez natijalar",
      trustLovedTitle: "Butun dunyoda sevib ishlatiladi"
    },
    trust: {
      generations: "Yetkazilgan AI generatsiyalar",
      rating: "Kreatorlar o'rtacha reytingi",
      countries: "Faol foydalanuvchili mamlakatlar",
      speed: "O'rtacha generatsiya vaqti"
    },
    howItWorks: {
      eyebrow: "Qanday ishlaydi",
      title: "Yuklashdan premium share qilinadigan natijagacha atigi uch qadam.",
      steps: [
        {
          title: "Rasm yuklang",
          copy: "Aniq old tomondan olingan suratni tashlang. Uni signed URL va private storage bilan himoya qilamiz."
        },
        {
          title: "Uslub tanlang",
          copy: "Luxury, wedding, gym, office, anime kabi premium preset'lardan foydalaning yoki o'zingiz prompt yozing."
        },
        {
          title: "Natija oling",
          copy: "Studio darajasidagi AI transformatsiya, bepul foydalanuvchilar uchun watermark va pullik planlarda HD yuklashni oling."
        }
      ]
    },
    examples: {
      eyebrow: "Namunalar",
      title: "Qiziqish, screenshot va share'larni qo'zg'atadigan yuqori intent look'lar.",
      pageTitle: "Premium ko'rinish beradigan va viral tarqalishga yetadigan transformatsiyalarni ko'ring.",
      note: "{example} holatlari uchun viralga tayyor transformatsiya preset."
    },
    whyUs: {
      eyebrow: "Nega biz",
      title: "Ishonchi past try-on vositalardan ustun premium AI SaaS stack.",
      category: "Kategoriya",
      ours: "GetDressAI",
      competitor: "Oddiy raqib",
      rows: [
        ["Realistik natijalar", "Tana va detallarni hisobga oluvchi transformatsiyalar", "Shablon natijalar"],
        ["O'sish loop'i", "Watermark + referral credits + exit offer", "Ichki viral loop yo'q"],
        ["To'lov stack'i", "Paddle obunalar va kredit pack'lari", "Bir o'lchamli paywall"],
        ["Retention", "Email flow, low-credit ogohlantirish, winback", "Zaif lifecycle hook'lar"]
      ]
    },
    testimonials: {
      eyebrow: "Growth jamoalar sevadi",
      title: "Aniq, insoniy va ishonarli social proof.",
      items: [
        {
          name: "Amelia Hart",
          role: "UGC Creator",
          quote: "Oddiy try-on ilovadan o'tdik va landing page konversiyasi bir haftada ko'tarildi."
        },
        {
          name: "Noor Rahman",
          role: "Fashion Founder",
          quote: "GetDressAI startup darajasida premium tuyuladi va viral tezlikni ushlash uchun yetarlicha tez."
        },
        {
          name: "Mila Sato",
          role: "TikTok Stylist",
          quote: "Before/after natijalar darrov post qilinadi. Faqat watermark loop'ning o'zi ham har kuni yangi user olib keladi."
        }
      ]
    },
    pricing: {
      eyebrow: "Narxlar",
      title: "Birinchi foydalanuvchilarni o'suvchi pullik cohort'larga aylantirish uchun qurilgan.",
      pageTitle: "Kontent tezligingizga mos plan tanlang.",
      pageCopy: "Birinchi tekshiruv uchun bepul. Jiddiy kreatorlar, jamoalar va ko'p wardrobe test qiluvchilar uchun pullik planlar.",
      popular: "Eng ommabop",
      perMonth: "/ oy",
      plans: [
        {
          name: "Free",
          subtitle: "Watermark bilan 1 preview",
          features: ["1 preview kredit", "Made with GetDressAI watermark", "Standart navbat"],
          cta: "Bepul boshlash"
        },
        {
          name: "Starter",
          subtitle: "Birinchi yutuqlar uchun 10 kredit",
          features: ["10 kredit", "Tezroq navbat", "HD yuklash", "Watermark yo'q"],
          cta: "Starter olish"
        },
        {
          name: "Popular",
          subtitle: "Kreatorlar uchun 30 kredit",
          features: ["30 kredit", "Priority navbat", "Referral multiplier", "Erta prompt pack"],
          cta: "Popular tanlash"
        },
        {
          name: "Pro",
          subtitle: "Oyiga unlimited fair use",
          features: ["Unlimited fair use", "Batch generation", "Upsell portal access", "Priority support"],
          cta: "Pro ga o'tish"
        }
      ]
    },
    referralLoop: {
      eyebrow: "Referal loop",
      title: "Do'stlarni taklif qiling. Kredit ishlang. Bepul user'larni growth engine'ga aylantiring.",
      copy: "Do'stingiz qo'shilganda +2 kredit, sotib olganda +5 kredit oling. Buni share qilinadigan watermark va bugungi 30% chegirma beradigan exit pop-up bilan birlashtiring.",
      bullets: [
        "Bepul natijalarda share qilinadigan watermark bor",
        "Taklif qabul qilinsa = +2 kredit",
        "Birinchi xarid = +5 kredit",
        "Abandoned checkout email flow yo'qolgan revenue'ni qaytaradi"
      ]
    },
    faq: {
      eyebrow: "FAQ",
      title: "Sotib olish oldidagi ishqalanishni tez olib tashlaydigan javoblar.",
      items: [
        {
          q: "Generatsiyalar qanchalik realistik?",
          a: "Ilova conversion-grade realism uchun sozlangan: toza body alignment, kiyim chegaralarining aniqligi va xavfsiz upscale."
        },
        {
          q: "Bepul rasmlarda watermark bormi?",
          a: "Ha. Bepul natijalarda Made with GetDressAI watermark bo'ladi va bu ichki viral loop yaratadi."
        },
        {
          q: "Paddle obunasini istalgan payt bekor qila olamanmi?",
          a: "Ha. Billing portal, upgrade, downgrade va cancellation Paddle orqali boshqariladi."
        },
        {
          q: "Yuklangan rasmlar maxfiymi?",
          a: "Ha. Secure bucket, signed URL, auth-guarded access va server-side validation ishlatiladi."
        }
      ]
    },
    cta: {
      eyebrow: "Yakuniy CTA",
      title: "Keyingi viral outfitingizni trendni boshqalar egallashidan oldin sinab ko'ring.",
      copy: "Bepul preview, tez share, premium upgrade va referral kreditlar bitta kuchli stack'ka yig'ilgan.",
      unlock: "Bugun 30% ochish"
    },
    urgency: {
      eyebrow: "Shoshilinch trigger",
      title: "To'xtang! Bugun 30% chegirma oling",
      copy: "Shu sessiyada aktivatsiya qiladigan kreatorlar uchun cheklangan founder taklifi.",
      button: "Chegirmani ochish"
    },
    upload: {
      modePhoto: "Mening rasmimdan foydalanish",
      modeMannequin: "Virtual manekendan foydalanish",
      genderLabel: "Model mosligi",
      genderHint: "Outfit maqsadingizga eng yaqin tana shaklini tanlang.",
      genderFemale: "Ayol",
      genderMale: "Erkak",
      genderUnisex: "Uniseks",
      genderValue: {
        female: "Ayol",
        male: "Erkak",
        unisex: "Uniseks"
      },
      dropPhoto: "Suratingizni tashlang",
      formats: "PNG, JPG, WEBP 10MB gacha",
      mannequinTitle: "Rasm yo'qmi? Avval virtual manekenga kiydirib ko'ring.",
      mannequinCopy: "O'lchamlaringizni kiriting, biz outfit'ni sizga yaqin proporsiyadagi manekenda ko'rsatamiz.",
      measurementHeight: "Bo'y",
      measurementChest: "Ko'krak",
      measurementWaist: "Bel",
      measurementHips: "Son",
      measurementInseam: "Ichki oyoq uzunligi",
      measurementUnit: "sm",
      mannequinHint: "Shaxsiy rasm yuklamoqchi bo'lmasangiz, shu o'lchamlar maneken preview'ni shakllantiradi.",
      resultTitle: "So'nggi generatsiya",
      resultModePhoto: "Foto rejimi",
      resultModeMannequin: "Virtual maneken rejimi",
      resultSummaryPhoto: "Outfit creator-grade uslub bilan yuklangan rasmingizga joylandi.",
      resultSummaryMannequin: "Outfit o'lchamlaringiz asosida virtual manekenga moslashtirildi.",
      shareTitle: "GetDressAI natijasi",
      shareText: "GetDressAI'dagi AI outfit transformatsiyamni ko'ring.",
      shareButton: "Natijani ulashish",
      downloadHd: "HD yuklab olish",
      generationFailed: "Generatsiya bajarilmadi. Yana urinib ko'ring.",
      defaultPrompt: "Premium tailoring, kuchli siluet va toza yorug'lik bilan luxury editorial look",
      generating: "Yaratilmoqda...",
      generate: "Natijani yaratish",
      presets: ["Luxury", "Streetwear", "Wedding", "Office", "Gym", "Anime", "Celebrity", "Casual"]
    },
    dashboard: {
      eyebrow: "Panel",
      title: "Natija yarating, kreditlarni kuzating va foydalanishni takroriy oqimga aylantiring.",
      recentResults: "So'nggi natijalar",
      downloadHd: "Pullik planlarda HD yuklash",
      creditsUsed: "28 kreditdan 3 tasi ishlatilgan",
      download: "Yuklab olish",
      history: [
        { title: "Wedding couture", date: "2 daqiqa oldin" },
        { title: "Celebrity leather set", date: "12 daqiqa oldin" },
        { title: "Office capsule", date: "Kecha" }
      ],
      sidebar: ["Yaratish", "Tarix", "Billing", "Referallar", "Sozlamalar"],
      stats: [
        { label: "Kreditlar", note: "5 bonus kredit 2 kundan keyin tugaydi" },
        { label: "Generatsiyalar", note: "Bugun 12 ta, bu hafta 38 ta" },
        { label: "Referal revenue", note: "Shu oy 11 ta referal xarid" },
        { label: "Upgrade rate", note: "Eng yaxshi cohort: organic social" }
      ]
    },
    login: {
      eyebrow: "Kirish",
      title: "GetDressAI'ga kiring",
      copy: "Supabase Auth dashboard, billing va referallar uchun xavfsiz email va magic-link kirishni таъминлайди.",
      email: "Email",
      password: "Parol",
      button: "Davom etish",
      forgotPassword: "Parol esdan chiqdimi?",
      sending: "Yuborilmoqda...",
      sendReset: "Tiklash havolasini yuborish",
      resetSent: "Parolni tiklash havolasi emailingizga yuborildi.",
      resetHint: "Yangi parol tanlash учун xavfsiz havola yuboramiz."
    },
    resetPassword: {
      eyebrow: "Parolni tiklash",
      title: "Yangi parol qo'ying",
      copy: "Recovery email'ni oching, keyin shu yerda аккаунт учун янги parol белгиланг.",
      password: "Yangi parol",
      confirmPassword: "Yangi parolni tasdiqlang",
      button: "Parolni yangilash",
      saving: "Yangilanmoqda...",
      success: "Parol yangilandi. Endi kirishingiz mumkin.",
      missingSession: "Avval email'dagi recovery havolasi orqali kiring.",
      mismatch: "Parollar mos emas.",
      minLength: "Parol камида 8 та belgidan iborat bo'lishi kerak."
    },
    referralsPage: {
      eyebrow: "Referallar",
      title: "O'sib boradigan kredit loop'ini quring.",
      items: [
        { title: "+2 kredit", note: "Do'st havolangiz orqali qo'shilsa" },
        { title: "+5 kredit", note: "Do'st birinchi xaridni qilsa" },
        { title: "18.7%", note: "Invite-to-signup o'rtacha konversiya" }
      ]
    },
    privacy: {
      title: "Maxfiylik сиёсати",
      copy: "Yuklangan fayllarni himoyalangan, access-controlled storage'да сақлаймиз, vaqtinchalik access uchun signed URL ishlatamiz va analytics'ни faqat konversiya, retention va product performance'ni yaxshilash uchun qo'llaymiz."
    },
    terms: {
      title: "Foydalanish шартлари",
      copy: "Pullik planlar Paddle orqali yangilanadi. Unlimited planlar uchun fair-use qo'llanadi. Abuse prevention'га rate limiting, fraud checks va himoyalangan asset access киради."
    },
    admin: {
      eyebrow: "Admin",
      title: "Revenue, conversion ва retention бошқарув маркази.",
      labels: ["Foydalanuvchilar", "Revenue", "MRR", "Konversiyalar", "Kredit ishlatilishi", "Muvaffaqiyatsiz to'lovlar", "Top referallar"]
    }
  },
  tr: {} as Record<string, unknown>,
  es: {} as Record<string, unknown>,
  fr: {} as Record<string, unknown>,
  de: {} as Record<string, unknown>,
  ar: {} as Record<string, unknown>
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
