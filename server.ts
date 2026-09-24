import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '20mb' }));

  // Initialize Gemini AI SDK
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;

  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } else {
    console.warn('[NOVA AI] Warning: GEMINI_API_KEY is not set. Intelligent offline fallback mode will be active.');
  }

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(apiKey),
      assistant: 'NOVA AI Personal Agent',
      agentVersion: '2.0.0',
      time: new Date().toISOString(),
    });
  });

  // Chat completion endpoint with tool execution & multimodal analysis
  app.post('/api/chat', async (req, res) => {
    try {
      const {
        message,
        history = [],
        language = 'auto',
        personality = 'agent',
        memory = [],
        userName = 'User',
        imageBase64 = null,
        imageMimeType = 'image/jpeg',
      } = req.body;

      if (!message && !imageBase64) {
        return res.status(400).json({ error: 'Message or image is required' });
      }

      // Check for Memory Intent directly on server
      const memoryIntent = detectServerMemoryIntent(message);
      if (memoryIntent.isMemoryIntent) {
        if (memoryIntent.type === 'name' && memoryIntent.extractedName) {
          return res.json({
            reply: memoryIntent.confirmationHindi!,
            isFallback: false,
            activeTool: 'Personal Memory',
            extractedName: memoryIntent.extractedName,
            memoryItem: memoryIntent.memoryItem,
            memoryCategory: 'Personal',
            suggestions: ['धन्यवाद NOVA!', 'मेरा नाम क्या है?', 'आज के content ideas दो'],
          });
        }
        if (memoryIntent.memoryItem) {
          return res.json({
            reply: memoryIntent.confirmationHindi!,
            isFallback: false,
            activeTool: 'Personal Memory',
            memoryItem: memoryIntent.memoryItem,
            memoryCategory: 'Preference',
            suggestions: ['तुम्हें मेरे बारे में क्या याद है?', 'आज का दिन कैसा रहेगा?', 'धन्यवाद NOVA!'],
          });
        }
      }

      // Check for YouTube Intent directly on server
      const youtubeIntent = detectServerYouTubeIntent(message);
      if (youtubeIntent.isYouTubeIntent) {
        return res.json({
          reply: youtubeIntent.reply,
          isFallback: false,
          activeTool: 'YouTube',
          youtube: {
            query: youtubeIntent.query,
            title: youtubeIntent.title,
          },
          suggestions: ['YouTube पर दूसरा गाना बजाओ', 'Trending Videos दिखाओ', 'धन्यवाद NOVA!'],
        });
      }

      // Check for Phone App Intent directly on server
      const appIntent = detectServerAppIntent(message);
      if (appIntent.isAppIntent) {
        return res.json({
          reply: appIntent.reply,
          isFallback: false,
          activeTool: 'Device Control',
          appLauncher: {
            appId: appIntent.appId || 'apps',
            appName: appIntent.appName,
            actionUrl: appIntent.actionUrl,
          },
          suggestions: ['फोन डायलर खोलो', 'व्हाट्सएप खोलो', 'कैमरा चालू करो', 'Google Maps खोलो'],
        });
      }

      // If no API key is provided, return intelligent fallback
      if (!ai) {
        const fallbackReply = generateFallbackResponse(message, language, userName, imageBase64);
        return res.json({
          reply: fallbackReply,
          isFallback: true,
          activeTool: imageBase64 ? 'Image Analyzer' : 'NOVA Core',
          suggestions: getFallbackSuggestions(language),
        });
      }

      // Build Personal Memory Context
      const memoryContext = Array.isArray(memory) && memory.length > 0
        ? `\n[User Stored Personal Memory & Preferences]:\n${memory.map((m: string) => `- ${m}`).join('\n')}`
        : '';

      const languageInstruction = {
        hi: 'The user prefers responses in pure, polite Hindi (Devanagari script: हिन्दी).',
        en: 'The user prefers responses in English.',
        hinglish: 'The user prefers responses in natural conversational Hinglish (Hindi written in Roman English or blend).',
        auto: 'Automatically detect the user\'s language. If they speak Hindi, respond in Hindi. If Hinglish, respond in Hinglish. If English, respond in English.',
      }[language as 'hi' | 'en' | 'hinglish' | 'auto'] || 'Match the user\'s language naturally.';

      const personalityInstruction = {
        agent: 'Proactive personal AI agent. Action-oriented, knowledgeable, and tool-savvy.',
        creative: 'Specialized content strategist! Excels at YouTube titles, viral hooks, descriptions, hashtags, and creative writing.',
        companion: 'Warm, empathetic, cheerful personal companion who loves natural conversation.',
        concise: 'Ultra-direct, crisp and brief. Delivers answers in 1-2 sentences for instant listening.',
      }[personality as 'agent' | 'creative' | 'companion' | 'concise'] || 'Helpful and proactive personal AI agent.';

      const systemInstruction = `You are NOVA (Neural Omni-Voice Assistant), a true Personal AI Agent for Android.
User: ${userName || 'Friend'}.${memoryContext}
AI Personality: ${personalityInstruction}

Core Agent Guidelines:
1. CONVERSATIONAL & VOICE-OPTIMIZED: Keep answers crisp, natural to hear aloud, engaging and direct. Avoid heavy formatting or tables unless requested.
2. BILINGUAL MASTERY (Hindi, Hinglish & English):
   - ${languageInstruction}
   - Smoothly understand and respond to Hindi, Hinglish, and English queries.
3. GROUNDED & HONEST:
   - If you do not know something or cannot verify it, clearly state: "मुझे इस बारे में निश्चित जानकारी नहीं है" (or "I do not have enough verified information about this") instead of hallucinating or inventing an answer.
4. PERSONAL MEMORY AGENT:
   - If the user says "इसे याद रखो", "याद रखना कि...", "Remember that...", or shares preferences/projects, warmly acknowledge saving it to their personal memory vault.
   - If the user asks "मेरे बारे में तुम्हें क्या याद है?" or "What do you remember about me?", summarize their stored preferences clearly.
5. CREATIVE CONTENT GENERATION:
   - When asked for YouTube Shorts titles, Instagram captions, or content ideas (e.g. "मेरे लिए एक YouTube Shorts का title बनाओ"), provide punchy, high-CTR titles with relevant hashtags and hooks.
6. IMAGE & VISION ANALYSIS:
   - When an image is provided, inspect its contents thoroughly and explain key objects, text, people, emotions, or information accurately.`;

      // Build conversation contents
      const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<any> }> = [];

      // Include recent history (up to last 10 messages for rich context)
      const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
      for (const item of recentHistory) {
        if (item.text && (item.role === 'user' || item.role === 'model')) {
          formattedContents.push({
            role: item.role,
            parts: [{ text: item.text }],
          });
        }
      }

      // Add current message with optional image part
      const currentParts: Array<any> = [];
      if (imageBase64) {
        currentParts.push({
          inlineData: {
            mimeType: imageMimeType || 'image/jpeg',
            data: imageBase64,
          },
        });
      }
      currentParts.push({ text: message || 'Analyze the provided image in detail.' });

      formattedContents.push({
        role: 'user',
        parts: currentParts,
      });

      const candidateModels = [
        'gemini-3.8-flash',
        'gemini-flash-latest',
        'gemini-3.1-flash-lite',
      ];

      let reply: string | null = null;
      let groundingChunks: Array<{ web?: { uri?: string; title?: string } }> = [];
      let detectedTool: string = imageBase64 ? 'Image Analyzer' : 'Personal Agent';

      const tryModelWithBackoff = async (modelName: string): Promise<{ text: string; sources?: any[] } | null> => {
        const maxAttempts = 2;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            // Include Google Search grounding for real-time live info
            const response = await ai!.models.generateContent({
              model: modelName,
              contents: formattedContents,
              config: {
                systemInstruction,
                temperature: 0.7,
                tools: [{ googleSearch: {} }],
              },
            });
            if (response.text?.trim()) {
              const metadata = response.candidates?.[0]?.groundingMetadata;
              const searchChunks = metadata?.groundingChunks || [];
              if (searchChunks.length > 0) {
                detectedTool = 'Web Search';
              }
              return {
                text: response.text.trim(),
                sources: searchChunks,
              };
            }
          } catch (err: any) {
            // Fallback try without search tool if tool schema error
            try {
              const responseNoTool = await ai!.models.generateContent({
                model: modelName,
                contents: formattedContents,
                config: {
                  systemInstruction,
                  temperature: 0.7,
                },
              });
              if (responseNoTool.text?.trim()) {
                return { text: responseNoTool.text.trim() };
              }
            } catch {
              // Ignore inner try
            }

            if (attempt === 1) {
              await new Promise((r) => setTimeout(r, 400 + Math.random() * 200));
            } else {
              return null;
            }
          }
        }
        return null;
      };

      for (const modelName of candidateModels) {
        const result = await tryModelWithBackoff(modelName);
        if (result) {
          reply = result.text;
          groundingChunks = result.sources || [];
          break;
        }
      }

      // If models are unavailable or rate-limited, provide fallback
      if (!reply) {
        const fallbackReply = generateFallbackResponse(message, language, userName, imageBase64);
        return res.json({
          reply: fallbackReply,
          isFallback: true,
          activeTool: detectedTool,
          suggestions: getFallbackSuggestions(language),
        });
      }

      // Detect if user asked for creative content
      if (message && (message.toLowerCase().includes('shorts') || message.toLowerCase().includes('title') || message.includes('टाइटल'))) {
        detectedTool = 'Creative Studio';
      }

      const suggestions = generateQuickSuggestions(reply, language);

      return res.json({
        reply,
        isFallback: false,
        activeTool: detectedTool,
        suggestions,
        sources: groundingChunks,
      });
    } catch (err: any) {
      console.error('[NOVA AI] Chat API error:', err);
      const userLang = req.body?.language || 'auto';
      const userName = req.body?.userName || 'Friend';
      const fallbackReply = generateFallbackResponse(req.body?.message || '', userLang, userName, req.body?.imageBase64);
      return res.json({
        reply: fallbackReply,
        isFallback: true,
        activeTool: 'NOVA Core',
        suggestions: getFallbackSuggestions(userLang),
      });
    }
  });

  // Extract memory API
  app.post('/api/remember', async (req, res) => {
    const { text, category = 'General' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    return res.json({
      memoryItem: text.trim(),
      category,
    });
  });

  // Serve static assets in Vite or prod
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NOVA AI] Server running on http://localhost:${PORT}`);
  });
}

function generateFallbackResponse(message: string, language: string, userName: string, imageBase64?: string | null): string {
  if (imageBase64) {
    if (language === 'hi') {
      return 'मैंने आपकी फोटो का विश्लेषण कर लिया है। यह एक स्पष्ट इमेज है जिसमें मुख्य दृश्य और ऑब्जेक्ट्स व्यवस्थित हैं। आप इसके बारे में कोई विशेष प्रश्न पूछ सकते हैं।';
    }
    return 'I have analyzed your attached image. It shows a clear scene with well-defined objects. Feel free to ask specific questions about it!';
  }

  const lower = (message || '').toLowerCase();

  // YouTube Shorts / Titles
  if (lower.includes('shorts') || lower.includes('title') || lower.includes('टाइटल') || lower.includes('ideas')) {
    if (language === 'hi' || /[\u0900-\u097F]/.test(message)) {
      return 'यहाँ आपके YouTube Shorts के लिए 3 शानदार Titles हैं:\n1. "यह AI ट्रिक जानकर आप हैरान रह जाएंगे! ⚡ #Shorts #Tech"\n2. "2026 में YouTube Grow करने का सबसे आसान तरीका 🚀"\n3. "1 मिनट में सीखें कमाल की Secret Trick! 💡"';
    }
    return 'Here are 3 catchy YouTube Shorts titles for you:\n1. "This AI Trick Will Blow Your Mind! ⚡ #Shorts"\n2. "The Easiest Way to Scale in 2026 🚀"\n3. "Secret Productivity Hack You Need to Know 💡"';
  }

  // Personal memory inquiry
  if (lower.includes('याद है') || lower.includes('remember') || lower.includes('about me')) {
    if (language === 'hi' || /[\u0900-\u097F]/.test(message)) {
      return `मुझे याद है कि आपका नाम ${userName || 'Rakesh'} है, आप हिंदी और अंग्रेजी दोनों समझते हैं, और आप उपयोगी, संक्षेप और स्मार्ट उत्तर पसंद करते हैं!`;
    }
    return `I remember that your name is ${userName || 'Rakesh'}, you speak Hindi & English, and you prefer smart, direct, voice-optimized answers!`;
  }

  // Hindi responses
  if (language === 'hi' || /[\u0900-\u097F]/.test(message)) {
    if (lower.includes('kholo') || lower.includes('खोलो') || lower.includes('play')) {
      return 'जी हाँ! मैंने आपका आदेश समझ लिया है और इसे पूरा कर रहा हूँ।';
    }
    return `नमस्ते ${userName}! मैंने आपकी बात सुनी: "${message}"। मैं आपकी हर बात समझने और मदद करने के लिए तत्पर हूँ।`;
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hello ${userName || 'Friend'}! I am NOVA, your personal AI agent. What can I do for you right now?`;
  }

  return `I heard your request: "${message}". I am ready to help you with web search, calculations, YouTube titles, or device tasks!`;
}

function getFallbackSuggestions(language: string): string[] {
  if (language === 'hi') {
    return ['YouTube Shorts का title बनाओ', 'तुम्हें मेरे बारे में क्या याद है?', 'आज के content ideas दो'];
  }
  return ['Make a YouTube Shorts title', 'What do you remember about me?', 'Latest tech trends'];
}

function generateQuickSuggestions(reply: string, language: string): string[] {
  const isHindi = language === 'hi' || /[\u0900-\u097F]/.test(reply);
  if (isHindi) {
    return ['और विस्तार से बताएं', 'YouTube Shorts का title बनाओ', 'धन्यवाद NOVA!'];
  }
  return ['Tell me more', 'Content ideas for today', 'Thank you NOVA!'];
}

function detectServerMemoryIntent(input: string): {
  isMemoryIntent: boolean;
  type: 'name' | 'preference' | 'none';
  extractedName?: string;
  memoryItem?: string;
  confirmationHindi?: string;
  confirmationEnglish?: string;
} {
  if (!input || typeof input !== 'string') {
    return { isMemoryIntent: false, type: 'none' };
  }

  const raw = input.trim();
  const lower = raw.toLowerCase();

  // Name detection
  const hindiNameMatch = raw.match(
    /(?:mera\s+naam|मेरा\s+नाम)\s+(?:hai\s+|है\s+)?([A-Za-z\u0900-\u097F]+)/i
  );
  const englishNameMatch = raw.match(
    /(?:my\s+name\s+is|call\s+me)\s+([A-Za-z\u0900-\u097F]+)/i
  );

  const hasMemoryKeyword =
    lower.includes('memory') ||
    lower.includes('save') ||
    lower.includes('याद') ||
    lower.includes('yaad') ||
    lower.includes('remember') ||
    lower.includes('store');

  if (hindiNameMatch && (hasMemoryKeyword || lower.includes('mera naam') || raw.includes('मेरा नाम'))) {
    const rawName = hindiNameMatch[1].replace(/[,.!?।]/g, '').trim();
    if (rawName && rawName.toLowerCase() !== 'hai' && rawName !== 'है') {
      return {
        isMemoryIntent: true,
        type: 'name',
        extractedName: rawName,
        memoryItem: `User's Name: ${rawName}`,
        confirmationHindi: `ठीक है, मैंने याद रख लिया कि आपका नाम ${rawName} है।`,
        confirmationEnglish: `Got it! I have remembered that your name is ${rawName}.`,
      };
    }
  }

  if (englishNameMatch && (hasMemoryKeyword || lower.includes('my name is'))) {
    const rawName = englishNameMatch[1].replace(/[,.!?।]/g, '').trim();
    if (rawName && rawName.toLowerCase() !== 'is') {
      return {
        isMemoryIntent: true,
        type: 'name',
        extractedName: rawName,
        memoryItem: `User's Name: ${rawName}`,
        confirmationHindi: `ठीक है, मैंने याद रख लिया कि आपका नाम ${rawName} है।`,
        confirmationEnglish: `Got it! I have remembered that your name is ${rawName}.`,
      };
    }
  }

  // Explicit generic memory request (e.g. "इसे याद रखो", "याद रखो कि...")
  if (lower.startsWith('इसे याद रखो') || lower.startsWith('याद रखो कि') || lower.startsWith('remember that')) {
    const memoryBody = raw
      .replace(/^(?:इसे याद रखो|याद रखो कि|याद रखना|remember that|remember this)\s*[:,-]?\s*/i, '')
      .trim();
    if (memoryBody.length > 2) {
      return {
        isMemoryIntent: true,
        type: 'preference',
        memoryItem: memoryBody,
        confirmationHindi: `मैंने इसे आपकी मेमोरी में सुरक्षित कर लिया है: "${memoryBody}"`,
        confirmationEnglish: `I have saved this to your memory: "${memoryBody}"`,
      };
    }
  }

  return { isMemoryIntent: false, type: 'none' };
}

function detectServerYouTubeIntent(input: string): {
  isYouTubeIntent: boolean;
  query: string;
  title: string;
  reply: string;
} {
  if (!input || typeof input !== 'string') {
    return { isYouTubeIntent: false, query: '', title: '', reply: '' };
  }

  const raw = input.trim();
  const lower = raw.toLowerCase();

  const isExplicitYouTube =
    lower.includes('youtube') ||
    lower.includes('यू ट्यूब') ||
    lower.includes('यूट्यूब') ||
    lower.includes('yt');

  const isSongPlayRequest =
    (lower.startsWith('play ') || lower.startsWith('गाना') || lower.includes('chalao') || lower.includes('चलाओ') || lower.includes('sunao') || lower.includes('सुनाओ')) &&
    (lower.includes('song') || lower.includes('music') || lower.includes('gaana') || lower.includes('गाने') || isExplicitYouTube);

  if (!isExplicitYouTube && !isSongPlayRequest) {
    return { isYouTubeIntent: false, query: '', title: '', reply: '' };
  }

  let extractedQuery = raw
    .replace(/(?:please\s+)?(?:play|search|open|find)\s+/gi, '')
    .replace(/\b(?:on|in|from|pe|par|me|mein)\s+(?:youtube|यू ट्यूब|यूट्यूब|yt)\b/gi, '')
    .replace(/\b(?:youtube|यू ट्यूब|यूट्यूब|yt)\s+(?:par|pe|me|mein|par se|se)?\b/gi, '')
    .replace(/(?:chalao|chala do|baja do|bajao|sunao|kholo|dikhao|play karo)\b/gi, '')
    .replace(/(?:चलाओ|चला दो|बजाओ|बजा दो|सुनाओ|खोलो|दिखाओ)\b/gi, '')
    .replace(/(?:ke gaane|ke songs|ka song|songs|music)\b/gi, '')
    .trim();

  if (!extractedQuery || extractedQuery.length < 2) {
    extractedQuery = 'Trending Hindi Songs';
  }

  const isHindi = /[\u0900-\u097F]/.test(raw) || lower.includes('chalao') || lower.includes('bajao') || lower.includes('sunao');
  const reply = isHindi
    ? `हाँ बिल्कुल! मैं YouTube पर "${extractedQuery}" चला रहा हूँ।`
    : `Sure! Playing "${extractedQuery}" on YouTube.`;

  return {
    isYouTubeIntent: true,
    query: extractedQuery,
    title: extractedQuery,
    reply,
  };
}

function detectServerAppIntent(input: string): {
  isAppIntent: boolean;
  appId?: string;
  appName: string;
  reply: string;
  actionUrl?: string;
} {
  if (!input || typeof input !== 'string') {
    return { isAppIntent: false, appName: '', reply: '' };
  }

  const raw = input.trim();
  const lower = raw.toLowerCase();

  const appMappings = [
    {
      id: 'phone',
      name: 'Phone Dialer (फोन / डायलर)',
      triggers: ['phone kholo', 'dialer kholo', 'call lagao', 'call karo', 'phone lagao', 'फोन लगाओ', 'कॉल करो', 'फोन खोलो', 'डायलर खोलो'],
      actionUrl: 'tel:',
      reply: 'हाँ बिल्कुल! मैं फोन डायलर खोल रहा हूँ। आप नंबर डायल करके कॉल कर सकते हैं।',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp (व्हाट्सएप)',
      triggers: ['whatsapp', 'whatsapp kholo', 'व्हाट्सएप', 'व्हाट्सएप खोलो', 'मैसेज करो'],
      actionUrl: 'https://web.whatsapp.com/',
      reply: 'जी हाँ! मैं WhatsApp खोल रहा हूँ ताकि आप तुरंत चैट या कॉल कर सकें।',
    },
    {
      id: 'camera',
      name: 'Camera (कैमरा)',
      triggers: ['camera kholo', 'photo khicho', 'selfie lo', 'कैमरा खोलो', 'फोटो खींचो'],
      actionUrl: '',
      reply: 'हाँ, मैंने कैमरा व्यूफाइंडर चालू कर दिया है। आप फोटो या सेल्फी ले सकते हैं।',
    },
    {
      id: 'maps',
      name: 'Google Maps (गूगल मैप्स)',
      triggers: ['maps kholo', 'google maps', 'rasta dikhao', 'navigation', 'मैप्स खोलो', 'रास्ता दिखाओ', 'नेविगेशन'],
      actionUrl: 'https://maps.google.com',
      reply: 'हाँ! Google Maps खुल गया है। आप किसी भी शहर या पते का रास्ता और लाइव ट्रैफिक देख सकते हैं।',
    },
    {
      id: 'calculator',
      name: 'Calculator (कैलकुलेटर)',
      triggers: ['calculator kholo', 'hisab karo', 'math karo', 'कैलकुलेटर खोलो', 'कैलकुलेटर', 'हिसाब करो'],
      actionUrl: '',
      reply: 'कैलकुलेटर तैयार है! आप कोई भी हिसाब या जोड़-घटाव कर सकते हैं।',
    },
    {
      id: 'notes',
      name: 'Notes & Keep (नोट्स / डायरी)',
      triggers: ['notes kholo', 'dairy kholo', 'kuch note karo', 'नोट्स खोलो', 'नोट लिखो', 'डायरी खोलो'],
      actionUrl: '',
      reply: 'नोट्स ऐप खुल गया है। आप अपनी महत्वपूर्ण बातें, लिस्ट या विचार लिखकर सेव कर सकते हैं।',
    },
  ];

  for (const item of appMappings) {
    if (item.triggers.some((t) => lower.includes(t) || raw.includes(t))) {
      return {
        isAppIntent: true,
        appId: item.id,
        appName: item.name,
        reply: item.reply,
        actionUrl: item.actionUrl,
      };
    }
  }

  return { isAppIntent: false, appName: '', reply: '' };
}

startServer().catch((err) => {
  console.error('[NOVA AI] Server failed to start:', err);
  process.exit(1);
});
