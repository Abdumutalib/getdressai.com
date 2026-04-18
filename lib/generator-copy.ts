import type { SupportedLanguage } from "@/lib/translations";

type MarketplaceText = {
  fitTitle: string;
  fitCopy: string;
  fitReady: string;
  recommendationsTitle: string;
  recommendationsCopy: string;
  recommendationsHint: string;
  recommendationsButton: string;
  recommendationsLoading: string;
  recommendedSize: string;
  fitScore: string;
  marketplaceSource: string;
  openProduct: string;
  clothingLabel: string;
  clothingPlaceholder: string;
  clothingHint: string;
  aiHint: string;
  clothingInputLabel: string;
  autoSource: string;
  marketplaceError: string;
  savedPhoto: string;
};

type GenderText = {
  label: string;
  hint: string;
};

type ClothingFieldText = {
  label: string;
  placeholder: string;
  aiHint: string;
};

export const marketplaceCopy: Record<SupportedLanguage, MarketplaceText> = {
  en: {
    fitTitle: "Size and fit",
    fitCopy: "Add your real measurements so we can match clothes to your photo and body shape.",
    fitReady: "Your measurements will be used for both try-on and shopping recommendations.",
    recommendationsTitle: "Clothes we found for your photo and size",
    recommendationsCopy: "These picks use your uploaded photo, chosen style, and body measurements.",
    recommendationsHint: "Upload a photo and fill in height, chest, waist, and hips to unlock shopping recommendations.",
    recommendationsButton: "Find matching clothes",
    recommendationsLoading: "Finding clothes for your size...",
    recommendedSize: "Recommended size",
    fitScore: "Fit score",
    marketplaceSource: "Marketplace source",
    openProduct: "Open item",
    clothingLabel: "What clothes do you want?",
    clothingPlaceholder: "Type clothing here...",
    clothingHint: "Describe the exact outfit you want to try or buy.",
    aiHint: "We automatically understand clothing type, color, material, and occasion from your text.",
    clothingInputLabel: "Text entry",
    autoSource: "Matched to your photo and measurements",
    marketplaceError: "Could not load marketplace recommendations.",
    savedPhoto: "Saved photo from your last session",
  },
  ru: {
    fitTitle: "Размер и посадка",
    fitCopy: "Добавьте реальные мерки, чтобы одежда лучше подходила к вашему фото и фигуре.",
    fitReady: "Эти мерки используются и для примерки, и для рекомендаций из магазинов.",
    recommendationsTitle: "Одежда по вашему фото и размерам",
    recommendationsCopy: "Эти варианты подбираются по загруженному фото, стилю и вашим меркам.",
    recommendationsHint: "Загрузите фото и заполните рост, грудь, талию и бёдра, чтобы открыть рекомендации.",
    recommendationsButton: "Найти подходящую одежду",
    recommendationsLoading: "Ищем одежду под ваши размеры...",
    recommendedSize: "Рекомендуемый размер",
    fitScore: "Оценка совпадения",
    marketplaceSource: "Маркетплейс",
    openProduct: "Открыть товар",
    clothingLabel: "Какую одежду вы хотите?",
    clothingPlaceholder: "Опишите одежду здесь...",
    clothingHint: "Напишите, что именно хотите примерить или найти в магазине.",
    aiHint: "Система автоматически понимает тип одежды, цвет, материал и повод из вашего текста.",
    clothingInputLabel: "Поле для текста",
    autoSource: "Подбор по вашему фото и меркам",
    marketplaceError: "Не удалось загрузить рекомендации из маркетплейсов.",
    savedPhoto: "Сохранённое фото из прошлого входа",
  },
  uz: {
    fitTitle: "O'lcham va moslik",
    fitCopy: "Haqiqiy o'lchamlaringizni kiriting, shunda kiyimlar rasmingiz va qomatingizga mos tanlanadi.",
    fitReady: "Bu o'lchamlar try-on ham, marketpleys tavsiyalari ham uchun ishlatiladi.",
    recommendationsTitle: "Rasmingiz va o'lchamingizga mos kiyimlar",
    recommendationsCopy: "Bu tavsiyalar yuklangan rasm, tanlangan uslub va o'lchamlaringiz asosida chiqadi.",
    recommendationsHint: "Rasm yuklang va bo'y, ko'krak, bel, son o'lchamlarini kiriting.",
    recommendationsButton: "Mos kiyimlarni topish",
    recommendationsLoading: "O'lchamingizga mos kiyimlar qidirilyapti...",
    recommendedSize: "Tavsiya o'lcham",
    fitScore: "Moslik bahosi",
    marketplaceSource: "Marketpleys",
    openProduct: "Mahsulotni ochish",
    clothingLabel: "Qanday kiyim xohlaysiz?",
    clothingPlaceholder: "Bu yerga kiyimni yozing...",
    clothingHint: "Kiydirmoqchi yoki topmoqchi bo'lgan kiyimni yozing.",
    aiHint: "Tizim matndan kiyim turi, rang, mato va vaziyatni o'zi tushunadi.",
    clothingInputLabel: "Tekst yozish joyi",
    autoSource: "Rasmingiz va o'lchamingiz asosida tanlandi",
    marketplaceError: "Marketpleys tavsiyalarini yuklab bo'lmadi.",
    savedPhoto: "Oldingi kirishdan saqlangan rasm",
  },
  tr: {
    fitTitle: "Beden ve uyum",
    fitCopy: "Gercek olculerinizi ekleyin, boylece kiyafetler fotografiniza ve bedeninize daha iyi uyar.",
    fitReady: "Bu olculer hem try-on hem de alisveris onerileri icin kullanilir.",
    recommendationsTitle: "Fotografiniz ve olculeriniz icin buldugumuz kiyafetler",
    recommendationsCopy: "Bu oneriler yuklediginiz fotograf, secilen stil ve olculerinize gore hazirlanir.",
    recommendationsHint: "Onerileri acmak icin fotograf yukleyin ve boy, gogus, bel ve kalca olculerini girin.",
    recommendationsButton: "Uygun kiyafet bul",
    recommendationsLoading: "Olculerinize uygun kiyafetler bulunuyor...",
    recommendedSize: "Onerilen beden",
    fitScore: "Uyum puani",
    marketplaceSource: "Pazaryeri",
    openProduct: "Urunu ac",
    clothingLabel: "Hangi kiyafeti istiyorsunuz?",
    clothingPlaceholder: "Kiyafeti buraya yazin...",
    clothingHint: "Denemek ya da satin almak istediginiz kiyafeti tarif edin.",
    aiHint: "Sistem metninizden kiyafet turunu, rengi, materyali ve durumu otomatik anlar.",
    clothingInputLabel: "Yazi alani",
    autoSource: "Fotografiniz ve olculerinize gore eslesti",
    marketplaceError: "Pazaryeri onerileri yuklenemedi.",
    savedPhoto: "Son oturumdan kaydedilen fotograf",
  },
  es: {
    fitTitle: "Talla y ajuste",
    fitCopy: "Agrega tus medidas reales para que la ropa combine mejor con tu foto y tu cuerpo.",
    fitReady: "Estas medidas se usan tanto para el try-on como para las recomendaciones de compra.",
    recommendationsTitle: "Ropa encontrada para tu foto y tus medidas",
    recommendationsCopy: "Estas opciones usan tu foto, el estilo elegido y tus medidas.",
    recommendationsHint: "Sube una foto y completa altura, pecho, cintura y cadera para ver recomendaciones.",
    recommendationsButton: "Buscar ropa adecuada",
    recommendationsLoading: "Buscando ropa para tu talla...",
    recommendedSize: "Talla recomendada",
    fitScore: "Nivel de ajuste",
    marketplaceSource: "Marketplace",
    openProduct: "Abrir producto",
    clothingLabel: "Que ropa quieres?",
    clothingPlaceholder: "Escribe la ropa aqui...",
    clothingHint: "Describe la ropa exacta que quieres probar o comprar.",
    aiHint: "El sistema entiende automaticamente el tipo de ropa, color, material y ocasion de tu texto.",
    clothingInputLabel: "Campo de texto",
    autoSource: "Coincide con tu foto y tus medidas",
    marketplaceError: "No se pudieron cargar las recomendaciones.",
    savedPhoto: "Foto guardada de tu ultima sesion",
  },
  fr: {
    fitTitle: "Taille et ajustement",
    fitCopy: "Ajoutez vos vraies mesures pour mieux adapter les vetements a votre photo et a votre silhouette.",
    fitReady: "Ces mesures servent a la fois pour le try-on et pour les recommandations shopping.",
    recommendationsTitle: "Vetements trouves pour votre photo et votre taille",
    recommendationsCopy: "Ces suggestions utilisent votre photo, le style choisi et vos mesures.",
    recommendationsHint: "Ajoutez une photo puis votre taille, poitrine, taille et hanches pour voir les suggestions.",
    recommendationsButton: "Trouver les bons vetements",
    recommendationsLoading: "Recherche des vetements adaptes a votre taille...",
    recommendedSize: "Taille recommandee",
    fitScore: "Score d'ajustement",
    marketplaceSource: "Marketplace",
    openProduct: "Ouvrir l'article",
    clothingLabel: "Quel vetement voulez-vous ?",
    clothingPlaceholder: "Ecrivez le vetement ici...",
    clothingHint: "Decrivez la tenue exacte que vous voulez essayer ou acheter.",
    aiHint: "Le systeme comprend automatiquement le type de vetement, la couleur, la matiere et l'occasion.",
    clothingInputLabel: "Champ de texte",
    autoSource: "Associe a votre photo et vos mesures",
    marketplaceError: "Impossible de charger les recommandations shopping.",
    savedPhoto: "Photo enregistree depuis votre derniere session",
  },
  de: {
    fitTitle: "Groesse und Passform",
    fitCopy: "Gib deine echten Masse ein, damit die Kleidung besser zu deinem Foto und Koerper passt.",
    fitReady: "Diese Masse werden fuer Try-on und Shopping-Empfehlungen verwendet.",
    recommendationsTitle: "Kleidung fuer dein Foto und deine Masse",
    recommendationsCopy: "Diese Vorschlaege nutzen dein Foto, den gewaehlten Stil und deine Masse.",
    recommendationsHint: "Lade ein Foto hoch und gib Groesse, Brust, Taille und Huefte ein, um Empfehlungen zu sehen.",
    recommendationsButton: "Passende Kleidung finden",
    recommendationsLoading: "Passende Kleidung fuer deine Groesse wird gesucht...",
    recommendedSize: "Empfohlene Groesse",
    fitScore: "Passform-Score",
    marketplaceSource: "Marktplatz",
    openProduct: "Produkt oeffnen",
    clothingLabel: "Welche Kleidung moechtest du?",
    clothingPlaceholder: "Kleidung hier eingeben...",
    clothingHint: "Beschreibe das genaue Outfit, das du anprobieren oder kaufen willst.",
    aiHint: "Das System erkennt automatisch Kleidungsart, Farbe, Material und Anlass aus deinem Text.",
    clothingInputLabel: "Textfeld",
    autoSource: "Zu deinem Foto und deinen Massen passend",
    marketplaceError: "Marktplatz-Empfehlungen konnten nicht geladen werden.",
    savedPhoto: "Gespeichertes Foto aus deiner letzten Sitzung",
  },
  ar: {
    fitTitle: "المقاس والملاءمة",
    fitCopy: "أضف مقاساتك الحقيقية حتى نطابق الملابس مع صورتك وجسمك بشكل أفضل.",
    fitReady: "هذه المقاسات تستخدم لتجربة الملابس ولتوصيات التسوق.",
    recommendationsTitle: "ملابس مناسبة لصورتك ومقاساتك",
    recommendationsCopy: "هذه الخيارات تعتمد على صورتك والنمط الذي اخترته ومقاساتك.",
    recommendationsHint: "ارفع صورة واملأ الطول والصدر والخصر والورك لفتح التوصيات.",
    recommendationsButton: "ابحث عن ملابس مناسبة",
    recommendationsLoading: "جار العثور على ملابس تناسب مقاسك...",
    recommendedSize: "المقاس المقترح",
    fitScore: "درجة الملاءمة",
    marketplaceSource: "المتجر",
    openProduct: "افتح المنتج",
    clothingLabel: "ما نوع الملابس التي تريدها؟",
    clothingPlaceholder: "اكتب وصف الملابس هنا...",
    clothingHint: "اكتب اللباس الذي تريد تجربته أو شراءه.",
    aiHint: "يفهم النظام نوع الملابس واللون والخامة والمناسبة من النص تلقائيا.",
    clothingInputLabel: "حقل الكتابة",
    autoSource: "تمت مطابقته مع صورتك ومقاساتك",
    marketplaceError: "تعذر تحميل توصيات المتجر.",
    savedPhoto: "صورة محفوظة من جلستك السابقة",
  },
};

export const genderCopy: Record<SupportedLanguage, GenderText> = {
  en: { label: "Gender", hint: "Choose who this look is for." },
  ru: { label: "Пол", hint: "Выберите, для кого этот образ." },
  uz: { label: "Jinsi", hint: "Bu look kim uchun ekanini tanlang." },
  tr: { label: "Cinsiyet", hint: "Bu look'un kim icin oldugunu secin." },
  es: { label: "Genero", hint: "Elige para quien es este look." },
  fr: { label: "Genre", hint: "Choisissez pour qui est ce look." },
  de: { label: "Geschlecht", hint: "Waehle, fuer wen dieser Look ist." },
  ar: { label: "الجنس", hint: "اختر لمن هذا اللوك." },
};

export const clothingFieldCopy: Record<SupportedLanguage, ClothingFieldText> = {
  en: {
    label: "Text entry",
    placeholder: "Type clothing here...",
    aiHint: "We automatically understand clothing type, color, material, and occasion from your text.",
  },
  ru: {
    label: "Поле для текста",
    placeholder: "Опишите одежду здесь...",
    aiHint: "Мы автоматически понимаем тип одежды, цвет, материал и повод из вашего текста.",
  },
  uz: {
    label: "Tekst yozish joyi",
    placeholder: "Bu yerga kiyimni yozing...",
    aiHint: "Tizim matndan kiyim turi, rang, mato va vaziyatni o'zi tushunadi.",
  },
  tr: {
    label: "Yazi alani",
    placeholder: "Kiyafeti buraya yazin...",
    aiHint: "Sistem metninizden kiyafet turunu, rengi, materyali ve durumu otomatik anlar.",
  },
  es: {
    label: "Campo de texto",
    placeholder: "Escribe la ropa aqui...",
    aiHint: "El sistema entiende automaticamente el tipo de ropa, color, material y ocasion de tu texto.",
  },
  fr: {
    label: "Champ de texte",
    placeholder: "Ecrivez le vetement ici...",
    aiHint: "Le systeme comprend automatiquement le type de vetement, la couleur, la matiere et l'occasion.",
  },
  de: {
    label: "Textfeld",
    placeholder: "Kleidung hier eingeben...",
    aiHint: "Das System erkennt automatisch Kleidungsart, Farbe, Material und Anlass aus deinem Text.",
  },
  ar: {
    label: "حقل الكتابة",
    placeholder: "اكتب وصف الملابس هنا...",
    aiHint: "يفهم النظام نوع الملابس واللون والخامة والمناسبة من النص تلقائيا.",
  },
};
