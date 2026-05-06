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
    fitCopy: "Gerçek ölçülerinizi ekleyin, böylece kıyafetler fotoğrafınıza ve bedeninize daha iyi uyar.",
    fitReady: "Bu ölçüler hem try-on hem de alışveriş önerileri için kullanılır.",
    recommendationsTitle: "Fotoğrafınız ve ölçüleriniz için bulduğumuz kıyafetler",
    recommendationsCopy: "Bu öneriler yüklediğiniz fotoğraf, seçilen stil ve ölçülerinize göre hazırlanır.",
    recommendationsHint: "Önerileri açmak için fotoğraf yükleyin ve boy, göğüs, bel ve kalça ölçülerini girin.",
    recommendationsButton: "Uygun kıyafet bul",
    recommendationsLoading: "Ölçülerinize uygun kıyafetler bulunuyor...",
    recommendedSize: "Önerilen beden",
    fitScore: "Uyum puanı",
    marketplaceSource: "Pazaryeri",
    openProduct: "Ürünü aç",
    clothingLabel: "Hangi kıyafeti istiyorsunuz?",
    clothingPlaceholder: "Kıyafeti buraya yazın...",
    clothingHint: "Denemek ya da satın almak istediğiniz kıyafeti tarif edin.",
    aiHint: "Sistem metninizden kıyafet türünü, rengi, materyali ve durumu otomatik anlar.",
    clothingInputLabel: "Yazı alanı",
    autoSource: "Fotoğrafınız ve ölçülerinize göre eşleşti",
    marketplaceError: "Pazaryeri önerileri yüklenemedi.",
    savedPhoto: "Son oturumdan kaydedilen fotoğraf",
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
    clothingLabel: "¿Qué ropa quieres?",
    clothingPlaceholder: "Escribe la ropa aquí...",
    clothingHint: "Describe la ropa exacta que quieres probar o comprar.",
    aiHint: "El sistema entiende automáticamente el tipo de ropa, color, material y ocasión de tu texto.",
    clothingInputLabel: "Campo de texto",
    autoSource: "Coincide con tu foto y tus medidas",
    marketplaceError: "No se pudieron cargar las recomendaciones.",
    savedPhoto: "Foto guardada de tu última sesión",
  },
  fr: {
    fitTitle: "Taille et ajustement",
    fitCopy: "Ajoutez vos vraies mesures pour mieux adapter les vêtements à votre photo et à votre silhouette.",
    fitReady: "Ces mesures servent à la fois pour le try-on et pour les recommandations shopping.",
    recommendationsTitle: "Vêtements trouvés pour votre photo et votre taille",
    recommendationsCopy: "Ces suggestions utilisent votre photo, le style choisi et vos mesures.",
    recommendationsHint: "Ajoutez une photo puis votre taille, poitrine, taille et hanches pour voir les suggestions.",
    recommendationsButton: "Trouver les bons vêtements",
    recommendationsLoading: "Recherche des vêtements adaptés à votre taille...",
    recommendedSize: "Taille recommandée",
    fitScore: "Score d'ajustement",
    marketplaceSource: "Marketplace",
    openProduct: "Ouvrir l'article",
    clothingLabel: "Quel vêtement voulez-vous ?",
    clothingPlaceholder: "Écrivez le vêtement ici...",
    clothingHint: "Décrivez la tenue exacte que vous voulez essayer ou acheter.",
    aiHint: "Le système comprend automatiquement le type de vêtement, la couleur, la matière et l'occasion.",
    clothingInputLabel: "Champ de texte",
    autoSource: "Associé à votre photo et vos mesures",
    marketplaceError: "Impossible de charger les recommandations shopping.",
    savedPhoto: "Photo enregistrée depuis votre dernière session",
  },
  de: {
    fitTitle: "Größe und Passform",
    fitCopy: "Gib deine echten Maße ein, damit die Kleidung besser zu deinem Foto und Körper passt.",
    fitReady: "Diese Maße werden für Try-on und Shopping-Empfehlungen verwendet.",
    recommendationsTitle: "Kleidung für dein Foto und deine Maße",
    recommendationsCopy: "Diese Vorschläge nutzen dein Foto, den gewählten Stil und deine Maße.",
    recommendationsHint: "Lade ein Foto hoch und gib Größe, Brust, Taille und Hüfte ein, um Empfehlungen zu sehen.",
    recommendationsButton: "Passende Kleidung finden",
    recommendationsLoading: "Passende Kleidung für deine Größe wird gesucht...",
    recommendedSize: "Empfohlene Größe",
    fitScore: "Passform-Score",
    marketplaceSource: "Marktplatz",
    openProduct: "Produkt öffnen",
    clothingLabel: "Welche Kleidung möchtest du?",
    clothingPlaceholder: "Kleidung hier eingeben...",
    clothingHint: "Beschreibe das genaue Outfit, das du anprobieren oder kaufen willst.",
    aiHint: "Das System erkennt automatisch Kleidungsart, Farbe, Material und Anlass aus deinem Text.",
    clothingInputLabel: "Textfeld",
    autoSource: "Zu deinem Foto und deinen Maßen passend",
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
  tr: { label: "Cinsiyet", hint: "Bu look'un kim için olduğunu seçin." },
  es: { label: "Género", hint: "Elige para quién es este look." },
  fr: { label: "Genre", hint: "Choisissez pour qui est ce look." },
  de: { label: "Geschlecht", hint: "Wähle, für wen dieser Look ist." },
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
    label: "Yazı alanı",
    placeholder: "Kıyafeti buraya yazın...",
    aiHint: "Sistem metninizden kıyafet türünü, rengi, materyali ve durumu otomatik anlar.",
  },
  es: {
    label: "Campo de texto",
    placeholder: "Escribe la ropa aquí...",
    aiHint: "El sistema entiende automáticamente el tipo de ropa, color, material y ocasión de tu texto.",
  },
  fr: {
    label: "Champ de texte",
    placeholder: "Écrivez le vêtement ici...",
    aiHint: "Le système comprend automatiquement le type de vêtement, la couleur, la matière et l'occasion.",
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
