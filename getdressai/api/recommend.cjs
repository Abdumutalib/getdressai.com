// api/recommend.cjs - CommonJS version for Express
// Фойдаланувчи профили: ёш, жинс, бўй, вазн, услуб, фасл, мавзу, нарх диапазони

const { OpenAI } = require('openai');
const crypto = require('crypto');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const AMAZON_CONFIG = {
  accessKey: process.env.AMAZON_ACCESS_KEY,
  secretKey: process.env.AMAZON_SECRET_KEY,
  partnerTag: process.env.AMAZON_PARTNER_TAG,
  host: process.env.AMAZON_HOST,
  region: process.env.AMAZON_REGION
};

const EBAY_CONFIG = {
  appId: process.env.EBAY_APP_ID,
  certId: process.env.EBAY_CERT_ID,
  devId: process.env.EBAY_DEV_ID,
  ruName: process.env.EBAY_RUNAME
};

const cache = new Map();
const CACHE_TTL = 1800000; // 30 минут

function analyzeUserProfile(userData) {
  const {
    age, gender, height, weight, bust, waist, hips,
    style = 'casual', season = 'summer', occasion = 'daily',
    minPrice = 10, maxPrice = 200, preferredColors = [],
    preferredBrands = [], excludedCategories = []
  } = userData;

  let bodyType = 'standard';
  if (height && weight) {
    const bmi = weight / ((height/100) ** 2);
    if (bmi < 18.5) bodyType = 'slim';
    else if (bmi >= 18.5 && bmi < 25) bodyType = 'standard';
    else if (bmi >= 25 && bmi < 30) bodyType = 'curvy';
    else bodyType = 'plus-size';
  }

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

async function getAIRecommendations(userProfile) {
  const { bodyType, sizeRecommendation, stylePreferences, age, gender } = userProfile;
  const prompt = `\nСен профессионал стилист AI. Фойдаланувчига кийим тавсия қил.\n\nФойдаланувчи маълумотлари:\n- Ёши: ${age}\n- Жинси: ${gender}\n- Тана тури: ${bodyType}\n- Тавсия этилган ўлчам: ${sizeRecommendation}\n- Услуб: ${stylePreferences.style}\n- Фасл: ${stylePreferences.season}\n- Мавзу: ${stylePreferences.occasion}\n- Нарх диапазони: $${stylePreferences.minPrice} - $${stylePreferences.maxPrice}\n- Афзал ранглар: ${stylePreferences.preferredColors.join(', ') || 'ҳар қандай'}\n\nИлтимос, қуйидаги форматда жавоб бер:\n1. 3-5 та кийим категорияси (юбка, шим, кўйлак, футболка, куртка ва б.)\n2. Ҳар бир категория учун:\n   - Мато тури\n   - Ранг тавсияси\n   - Крой (fit)\n   - Нега бу фойдаланувчига мос\n3. Умумий стиль бўйича маслаҳат\n`;
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

async function searchAmazonProducts(keyword, userProfile, limit = 10) {
  const { minPrice, maxPrice, preferredColors, preferredBrands } = userProfile.stylePreferences;
  const cacheKey = `amazon:${keyword}:${minPrice}:${maxPrice}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  try {
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
    cache.set(cacheKey, demoProducts);
    setTimeout(() => cache.delete(cacheKey), CACHE_TTL);
    return demoProducts;
  } catch (error) {
    console.error('Amazon API error:', error);
    return [];
  }
}

async function searchEbayProducts(keyword, userProfile, limit = 10) {
  const { minPrice, maxPrice } = userProfile.stylePreferences;
  const cacheKey = `ebay:${keyword}:${minPrice}:${maxPrice}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  try {
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

async function searchAsosProducts(keyword, userProfile, limit = 10) {
  const { minPrice, maxPrice, gender } = userProfile.stylePreferences;
  try {
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

async function generateOutfitImage(prompt, quality = 'fast') {
  const cacheKey = `image:${prompt}:${quality}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  try {
    return null; // Demo: skip image generation
  } catch (error) {
    console.error('Image generation error:', error);
    return null;
  }
}

async function criticalAnalysis(prompt, userProfile) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Сен эксперт стилист. Фойдаланувчининг тана тури, ёши, услубига қараб энг яхши тавсияни бер." },
        { role: "user", content: `Фойдаланувчи профили: ${JSON.stringify(userProfile)}\n\nСўров: ${prompt}` }
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

module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userData, critical = false, marketplace = 'all' } = req.body;
  if (!userData) {
    return res.status(400).json({ error: 'userData required' });
  }
  try {
    const userProfile = analyzeUserProfile(userData);
    let recommendations = await getAIRecommendations(userProfile);
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
    let generatedImage = null;
    if (userData.generateImage) {
      const stylePrompt = `${userProfile.stylePreferences.style} ${userProfile.stylePreferences.season} outfit for ${userData.age} year old ${userData.gender}`;
      generatedImage = await generateOutfitImage(stylePrompt, userData.imageQuality || 'fast');
    }
    let criticalAdvice = null;
    if (critical) {
      criticalAdvice = await criticalAnalysis(userData.specificQuestion || 'Энг яхши кийимларни тавсия қил', userProfile);
    }
    res.status(200).json({
      success: true,
      userProfile: {
        bodyType: userProfile.bodyType,
        recommendedSize: userProfile.sizeRecommendation,
        style: userProfile.stylePreferences.style,
        season: userProfile.stylePreferences.season
      },
      aiRecommendations: recommendations,
      products: products.slice(0, 12),
      generatedImage: generatedImage,
      criticalAdvice: criticalAdvice,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
