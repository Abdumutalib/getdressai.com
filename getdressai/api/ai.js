// api/ai.js - GetDressAI учун оптимал AI API
// Replicate (расм) + OpenRouter (матн) + OpenAI (критик ҳоллар)

import { OpenAI } from 'openai';

// API калитлари
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Кэш (такроран сўровларни тежаш учун)
const cache = new Map();
const CACHE_TTL = 3600000; // 1 соат

// ============ 1. МАТН ЁЗИШ (OpenRouter - арзон) ============
async function generateText(prompt, systemPrompt = 'Сиз ёрдамчи AI') {
  const cacheKey = `text:${prompt}:${systemPrompt}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-nemo', // энг арзон (20 сотих/1M токен)
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || 'Хатолик юз берди';
    
    // Кэшга сақлаш
    cache.set(cacheKey, result);
    setTimeout(() => cache.delete(cacheKey), CACHE_TTL);
    
    return result;
  } catch (error) {
    console.error('OpenRouter хатолик:', error);
    return 'Хатолик, қайта уриниб кўринг';
  }
}

// ============ 2. КИЙИМ ТАВСИЯСИ (OpenRouter мультимодал - арзон) ============
async function getOutfitRecommendation(imageBase64, userPreferences) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash', // расмни тушунади, арзон
        messages: [
          { 
            role: 'user', 
            content: [
              { type: 'text', text: `Менга бу кийимни таҳлил қил. Ўлчам: ${userPreferences.size || 'M'}, Услуб: ${userPreferences.style || 'casual'}, Фасли: ${userPreferences.season || 'summer'}. Тавсия бер.` },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ]
          }
        ],
        max_tokens: 300
      })
    });
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Тавсия беришда хатолик';
  } catch (error) {
    console.error('Recommendation хатолик:', error);
    return 'Кийимни таҳлил қилишда хатолик';
  }
}

// ============ 3. РАСМ ГЕНЕРАЦИЯСИ (Replicate - OpenAI дан 90% арзон) ============
async function generateOutfitImage(prompt, quality = 'fast') {
  const cacheKey = `image:${prompt}:${quality}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  
  try {
    // Replicate API - 1 та расм ~$0.01 (OpenAI ~$0.08)
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input: {
          prompt: `fashion model wearing ${prompt}, professional studio lighting, high quality fashion photography, ${quality === 'high' ? '4k, detailed' : 'fast preview'}`,
          negative_prompt: "ugly, blurry, low quality, deformed",
          width: 768,
          height: 1024,
          num_outputs: 1,
          scheduler: "DPMSolverMultistep",
          num_inference_steps: quality === 'high' ? 30 : 20,
          guidance_scale: 7.5
        }
      })
    });
    
    const prediction = await response.json();
    const pollUrl = prediction.urls.get;
    
    // Натижани кутиш (max 30 сония)
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
        throw new Error('Генерация бекор бўлди');
      }
    }
    
    if (result) {
      cache.set(cacheKey, result);
      setTimeout(() => cache.delete(cacheKey), CACHE_TTL);
      return result;
    }
    
    // Агар Replicate ишламаса, запасной вариант (Stability AI)
    return await generateImageFallback(prompt);
    
  } catch (error) {
    console.error('Replicate хатолик:', error);
    return await generateImageFallback(prompt);
  }
}

// ============ 4. ЗАПАСНОЙ ВАРИАНТ (расм генерацияси) ============
async function generateImageFallback(prompt) {
  try {
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY || ''}`
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt, weight: 1 }],
        cfg_scale: 7,
        height: 1024,
        width: 768,
        samples: 1,
        steps: 30
      })
    });
    
    const data = await response.json();
    return `data:image/png;base64,${data.artifacts[0].base64}`;
  } catch (error) {
    console.error('Fallback хатолик:', error);
    return null;
  }
}

// ============ 5. КРИТИК ҲОЛЛАР УЧУН (OpenAI - фақат керак бўлганда) ============
async function criticalAnalysis(prompt, imageBase64 = null) {
  try {
    if (imageBase64) {
      // Расмли мураккаб анализ
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "user", 
            content: [
              { type: "text", text: `Критик таҳлил: ${prompt}. Жуда аниқ ва батафсил жавоб бер.` },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      });
      return response.choices[0].message.content;
    } else {
      // Фақат матн
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Сиз эксперт ассистентсиз. Жуда аниқ ва батафсил жавоб беринг." },
          { role: "user", content: `Критик таҳлил: ${prompt}` }
        ],
        max_tokens: 1000,
        temperature: 0.3
      });
      return response.choices[0].message.content;
    }
  } catch (error) {
    console.error('OpenAI хатолик:', error);
    return 'Критик анализда хатолик';
  }
}

// ============ 6. АСОСИЙ API ҲАНДЛЕР (Vercel Serverless) ============
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { action, data, critical = false } = req.body;
  
  try {
    let result;
    
    switch (action) {
      case 'text':
        // Оддий матн ёзиш (арзон)
        result = await generateText(data.prompt, data.systemPrompt);
        break;
        
      case 'outfit':
        // Кийим тавсияси (арзон мультимодал)
        result = await getOutfitRecommendation(data.image, data.preferences);
        break;
        
      case 'image':
        // Расм генерацияси (Replicate - арзон)
        result = await generateOutfitImage(data.prompt, data.quality);
        break;
        
      case 'critical':
        // Фақат критик ҳолларда OpenAI ишлайди
        if (!critical) {
          // Агар critical=false бўлса, арзон вариантни ишлат
          result = await generateText(data.prompt);
        } else {
          result = await criticalAnalysis(data.prompt, data.image);
        }
        break;
        
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
    
    res.status(200).json({ success: true, result });
    
  } catch (error) {
    console.error('API хатолик:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
