
// api/recommend.js - Маркетплейс интеграцияси билан AI кийим тавсияси
// Фойдаланувчи профили: ёш, жинс, бўй, вазн, услуб, фасл, мавзу, нарх диапазони

const { OpenAI } = require('openai');
const crypto = require('crypto');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Amazon конфигурацияси
const AMAZON_CONFIG = {
  accessKey: process.env.AMAZON_ACCESS_KEY,
  secretKey: process.env.AMAZON_SECRET_KEY,
  partnerTag: process.env.AMAZON_PARTNER_TAG,
  host: process.env.AMAZON_HOST,
  region: process.env.AMAZON_REGION
};

// eBay конфигурацияси
const EBAY_CONFIG = {
  appId: process.env.EBAY_APP_ID,
  certId: process.env.EBAY_CERT_ID,
  devId: process.env.EBAY_DEV_ID,
  ruName: process.env.EBAY_RUNAME
};

// Кэш
const cache = new Map();
const CACHE_TTL = 1800000; // 30 минут

// ============ 1. ФОЙДАЛАНУВЧИ ПРОФИЛИНИ ТАҲЛИЛ ҚИЛИШ ============
function analyzeUserProfile(userData) {
  const {
    age, gender, height, weight, bust, waist, hips,
    style = 'casual', season = 'summer', occasion = 'daily',
    minPrice = 10, maxPrice = 200, preferredColors = [],
    preferredBrands = [], excludedCategories = []
  } = userData;

  // Тана турини аниқлаш
  let bodyType = 'standard';
  if (height && weight) {
    const bmi = weight / ((height/100) ** 2);
    if (bmi < 18.5) bodyType = 'slim';
    else if (bmi >= 18.5 && bmi < 25) bodyType = 'standard';
    else if (bmi >= 25 && bmi < 30) bodyType = 'curvy';
    else bodyType = 'plus-size';
  }

  // Ўлчамни тавсия қилиш
  let sizeRecommendation = 'M';
  if (bust && waist && hips) {
    const bustSize = parseInt(bust);
    if (bustSize < 84) sizeRecommendation = 'XS';
    else if (bustSize >= 84 && bustSize < 88) sizeRecommendation = 'S';
    else if (bustSize >= 88 && bustSize < 92) sizeRecommendation = 'M';
    else if (bustSize >= 92 && bustSize < 96) sizeRecommendation = 'L';
    else if (bustSize >= 96 && bustSize < 100) sizeRecommendation = 'XL';
    else sizeRecommendation = 'XXL';
  }

  return {
    bodyType, sizeRecommendation,
    stylePreferences: { style, season, occasion, minPrice, maxPrice, preferredColors, preferredBrands, excludedCategories },
    age, gender
  };
}

// ============ 2. AI ОРҚАЛИ ТАВСИЯ (OpenRouter) ============
async function getAIRecommendations(userProfile) {
  const { bodyType, sizeRecommendation, stylePreferences, age, gender } = userProfile;
  
  const prompt = `
Сен профессионал стилист AI. Фойдаланувчига кийим тавсия қил.

Фойдаланувчи маълумотлари:
- Ёши: ${age}
- Жинси: ${gender}
- Тана тури: ${bodyType}
- Тавсия этилган ўлчам: ${sizeRecommendation}
- Услуб: ${stylePreferences.style}
- Фасл: ${stylePreferences.season}
- Мавзу: ${stylePreferences.occasion}
- Нарх диапазони: $${stylePreferences.minPrice} - $${stylePreferences.maxPrice}
- Афзал ранглар: ${stylePreferences.preferredColors.join(', ') || 'ҳар қандай'}

Илтимос, қуйидаги форматда жавоб бер:
1. 3-5 та кийим категорияси (юбка, шим, кўйлак, футболка, куртка ва б.)
2. Ҳар бир категория учун:
   - Мато тури
   - Ранг тавсияси
   - Крой (fit)
   - Нега бу фойдаланувчига мос
3. Умумий стиль бўйича маслаҳат
`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('AI recommendation error:', error);
    return '';
  }
}

// ============ 3. AMAZON PRODUCT SEARCH ============
async function searchAmazonProducts(keyword, userProfile, limit = 10) {
  const { minPrice, maxPrice, preferredColors, preferredBrands } = userProfile.stylePreferences;
  
  // Amazon API соат 1 сонияда 1 сўров (бекорчилик учун кэш муҳим)
  const cacheKey = `amazon:${keyword}:${minPrice}:${maxPrice}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  
  try {
    // Amazon Product Advertising API 5.0
    const timestamp = new Date().toISOString();
    const payload = {
      'Operation': 'SearchItems',
      'PartnerType': 'Associates',
      'PartnerTag': AMAZON_CONFIG.partnerTag,
      'Keywords': keyword,
      'SearchIndex': 'Apparel',
      'ItemCount': limit,
      'MinPrice': minPrice,
      'MaxPrice': maxPrice,
      'Resources': [
        'ItemInfo.Title', 'ItemInfo.ByLineInfo', 'Images.Primary.Medium',
        'Offers.Listings.Price', 'DetailPageURL'
      ]
    };
    
    // (Ҳақиқий Amazon API учун сизга AWS Signature в4 керак)
    // Бу yerda демо-маълумотлар қайтарамиз (реал API учун Amazon Associates дастурига ёзилинг)
    
    const demoProducts = [
      {
        title: `${keyword} - Зamonaviy дизайн`,
        price: Math.floor(Math.random() * (maxPrice - minPrice) + minPrice),
        image: `https://picsum.photos/seed/${Date.now()}/200/300`,
        url: `https://amazon.com/dp/B${Math.floor(Math.random() * 10000000)}`,
        brand: preferredBrands[0] || 'Premium',
        rating: (Math.random() * 2 + 3).toFixed(1)
      },
      {
        title: `${keyword} - Классик услубда`,
        price: Math.floor(Math.random() * (maxPrice - minPrice) + minPrice),
        image: `https://picsum.photos/seed/${Date.now() + 1}/200/300`,
        url: `https://amazon.com/dp/B${Math.floor(Math.random() * 10000000)}`,
        brand: preferredBrands[1] || 'Fashion',
        rating: (Math.random() * 2 + 3).toFixed(1)
      }
    ];
    
    // Кэшга сақлаш
    cache.set(cacheKey, demoProducts);
    setTimeout(() => cache.delete(cacheKey), CACHE_TTL);
    
    return demoProducts;
  } catch (error) {
    console.error('Amazon API error:', error);
    return [];
  }
}

// ============ 4. eBay PRODUCT SEARCH ============
async function searchEbayProducts(keyword, userProfile, limit = 10) {
  const { minPrice, maxPrice } = userProfile.stylePreferences;
  
  const cacheKey = `ebay:${keyword}:${minPrice}:${maxPrice}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  
  try {
    // eBay API - Buy Browse API
    const response = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(keyword)}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${EBAY_CONFIG.appId}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Демо-маълумотлар
    const demoProducts = [
      {
        title: `${keyword} - eBay топ`,
        price: Math.floor(Math.random() * (maxPrice - minPrice) + minPrice),
        image: `https://picsum.photos/seed/${Date.now() + 2}/200/300`,
        url: `https://ebay.com/itm/${Math.floor(Math.random() * 10000000)}`,
        condition: 'Yangi',
        shipping: 'Free'
      }
    ];
    
    cache.set(cacheKey, demoProducts);
    setTimeout(() => cache.delete(cacheKey), CACHE_TTL);
    
    return demoProducts;
  } catch (error) {
    console.error('eBay API error:', error);
    return [];
  }
}

// ============ 5. ASOS PRODUCT SEARCH ============
async function searchAsosProducts(keyword, userProfile, limit = 10) {
  const { minPrice, maxPrice, gender } = userProfile.stylePreferences;
  
  try {
    // ASOS API (агар мавжуд бўлса)
    const response = await fetch(
      `https://asos.com/api/product/search/v2?q=${encodeURIComponent(keyword)}&limit=${limit}&gender=${gender === 'female' ? '2' : '1'}`,
      {
        headers: { 'Api-Key': process.env.ASOS_API_KEY || '' }
      }
    );
    
    // Демо-маълумотлар
    return [
      {
        title: `${keyword} - ASOS Exclusive`,
        price: Math.floor(Math.random() * (maxPrice - minPrice) + minPrice),
        image: `https://picsum.photos/seed/${Date.now() + 3}/200/300`,
        url: `https://asos.com/product/${Math.floor(Math.random() * 10000000)}`,
        brand: 'ASOS Design'
      }
    ];
  } catch (error) {
    console.error('ASOS API error:', error);
    return [];
  }
}

// ============ 6. РАСМ ГЕНЕРАЦИЯСИ (Replicate) ============
async function generateOutfitImage(prompt, quality = 'fast') {
  const cacheKey = `image:${prompt}:${quality}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  
  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input: {
          prompt: `fashion model wearing ${prompt}, professional studio lighting, ${quality === 'high' ? '4k detailed' : 'fast preview'}`,
          negative_prompt: "ugly, blurry",
          width: 768,
          height: 1024,
          num_outputs: 1,
          num_inference_steps: quality === 'high' ? 30 : 20
        }
      })
    });
    
    const prediction = await response.json();
    const pollUrl = prediction.urls.get;
    
    let result = null;
    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const pollResponse = await fetch(pollUrl, {
        headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` }
      });
      const pollData = await pollResponse.json();
      
      if (pollData.status === 'succeeded') {
        result = pollData.output[0];
        break;
      } else if (pollData.status === 'failed') {
        break;
      }
    }
    
    if (result) {
      cache.set(cacheKey, result);
      setTimeout(() => cache.delete(cacheKey), CACHE_TTL);
      return result;
    }
    return null;
  } catch (error) {
    console.error('Image generation error:', error);
    return null;
  }
}

// ============ 7. КРИТИК АНАЛИЗ (OpenAI - фақат керак бўлганда) ============
async function criticalAnalysis(prompt, userProfile) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Сен эксперт стилист. Фойдаланувчининг тана тури, ёши, услубига қараб энг яхши тавсияни бер." 
        },
        { 
          role: "user", 
          content: `Фойдаланувчи профили: ${JSON.stringify(userProfile)}\n\nСўров: ${prompt}` 
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI error:', error);
    return null;
  }
}

// ============ 8. АСОСИЙ API ҲАНДЛЕР ============
async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { userData, critical = false, marketplace = 'all' } = req.body;
  
  if (!userData) {
    return res.status(400).json({ error: 'userData required' });
  }
  
  try {
    // 1. Фойдаланувчи профилини таҳлил қилиш
    const userProfile = analyzeUserProfile(userData);
    
    // 2. AI орқали тавсия олиш
    let recommendations = await getAIRecommendations(userProfile);
    
    // 3. Маркетплейслардан маҳсулот излаш
    let products = [];
    const searchKeywords = extractKeywords(recommendations);
    
    if (marketplace === 'amazon' || marketplace === 'all') {
      const amazonProducts = await searchAmazonProducts(searchKeywords[0] || 'clothing', userProfile);
      products.push(...amazonProducts.map(p => ({ ...p, source: 'Amazon' })));
    }
    
    if (marketplace === 'ebay' || marketplace === 'all') {
      const ebayProducts = await searchEbayProducts(searchKeywords[0] || 'clothing', userProfile);
      products.push(...ebayProducts.map(p => ({ ...p, source: 'eBay' })));
    }
    
    if (marketplace === 'asos' || marketplace === 'all') {
      const asosProducts = await searchAsosProducts(searchKeywords[0] || 'clothing', userProfile);
      products.push(...asosProducts.map(p => ({ ...p, source: 'ASOS' })));
    }
    
    // 4. Расм генерацияси (агар керак бўлса)
    let generatedImage = null;
    if (userData.generateImage) {
      const stylePrompt = `${userProfile.stylePreferences.style} ${userProfile.stylePreferences.season} outfit for ${userData.age} year old ${userData.gender}`;
      generatedImage = await generateOutfitImage(stylePrompt, userData.imageQuality || 'fast');
    }
    
    // 5. Критик анализ (фақат critical=true бўлганда OpenAI ишлайди)
    let criticalAdvice = null;
    if (critical) {
      criticalAdvice = await criticalAnalysis(userData.specificQuestion || 'Энг яхши кийимларни тавсия қил', userProfile);
    }
    
    // 6. Натижани қайтариш
    res.status(200).json({
      success: true,
      userProfile: {
        bodyType: userProfile.bodyType,
        recommendedSize: userProfile.sizeRecommendation,
        style: userProfile.stylePreferences.style,
        season: userProfile.stylePreferences.season
      },
      aiRecommendations: recommendations,
      products: products.slice(0, 12), // 12 та маҳсулот
      generatedImage: generatedImage,
      criticalAdvice: criticalAdvice,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Ёрдамчи функция: тавсиядан калит сўзларни ажратиб олиш
function extractKeywords(recommendations) {
  const keywords = [];
  const categories = ['dress', 'shirt', 'pants', 'skirt', 'jacket', 'coat', 'shoes'];
  for (const cat of categories) {
    if (recommendations.toLowerCase().includes(cat)) {
      keywords.push(cat);
    }
  }
  if (keywords.length === 0) keywords.push('fashion clothing');
  return keywords;
}

module.exports = handler;
