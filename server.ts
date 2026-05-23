import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for AI Tutor
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const chat = ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: [
          {
            role: "user",
            parts: [{ text: "Siz DUNYODAGI ENG YAXSHI KOREYS TILI REPETITORI va AI MASTER tizimisiz. Ismingiz 'KOREAN MASTER AI'. Sizning vazifangiz o'quvchini ABSOLUT NO'LDAN PROFESSIONAL DARAGAGA (TOPIK II) 1 yil ichida olib chiqish. Siz professional, do'stona, qat'iyatli va juda bilimlisiz. Hamma javoblaringizni o'zbek tilida yozing. Sizning uslubingiz: 1. Grammatikani oddiy va tushunarli tushuntirish. 2. Har doim misollar keltirish. 3. O'quvchi xatosini darhol tuzatish. 4. Motivatsiya berish. 5. Koreya madaniyati haqida qisqa qiziqarli faktlar qo'shish. Siz shunchaki chat-bot emassiz, siz to'liq EDUCATION ECOSYSTEMning miyasiz." }]
          },
          ...history,
          {
            role: "user",
            parts: [{ text: message }]
          }
        ],
        config: {
          temperature: 0.7,
        }
      });

      const response = await chat;
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Xatolik yuz berdi" });
    }
  });

  // API Route for Translation (UZ -> KR)
  app.post("/api/translate", async (req, res) => {
    try {
      const { text } = req.body;
      const result = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: [{
          role: "user",
          parts: [{ text: `Translate the following Uzbek phrase into natural Korean and provide its romanized pronunciation for a learner. 
          Always use standard polite form unless it's a very simple greeting.
          Respond strictly in JSON format with two fields: "kr" (Korean characters) and "pron" (Romanized pronunciation).
          Example input: "Salom"
          Example output: {"kr": "안녕하세요", "pron": "Annyeonghaseyo"}
          Input text: "${text}"` }]
        }],
        config: { 
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      });
      const responseText = result.text;
      const data = JSON.parse(responseText);
      res.json(data);
    } catch (error: any) {
      console.error("Translation error:", error);
      res.status(500).json({ error: "Tarjima qilishda xatolik yuz berdi" });
    }
  });

  // Advanced AI Conversation Endpoint
  app.post("/api/conversation", async (req, res) => {
    try {
      const { message, history, mode, scenario, level } = req.body;
      
      const systemInstruction = `
        You are an advanced AI Korean Language Master. Your goal is to help Uzbek students learn Korean through immersive conversation.
        
        CURRENT CONTEXT:
        - Mode: ${mode || 'Friendly Korean Teacher'}
        - Scenario: ${scenario || 'General Conversation'}
        - User Level: ${level || 'Beginner'}
        
        YOUR PERSONALITY:
        Adopt the personality of the selected mode perfectly. If you are a 'Cafe Worker', act like one in a Korean cafe. If you are a 'Strict Teacher', be demanding and detail-oriented.
        
        YOUR TASKS:
        1. Respond to the user's message in natural Korean (Hangul).
        2. Correct ANY grammar or pronunciation mistakes in the user's message (if the message was speech-to-text, check for logical/grammatical errors).
        3. Provide explanations for mistakes in UZBEK.
        4. Track the user's fluency and confidence.
        5. Provide a 'Shadowing' sentence (the correct version of what they tried to say or a better alternative).
        
        RESPONSE FORMAT:
        You MUST respond strictly in JSON format with the following fields:
        {
          "ai_response_kr": "Your response in Korean",
          "ai_response_uz": "Translation of your response in Uzbek",
          "corrections": [
            { "original": "mistake", "corrected": "correct", "explanation": "uzbek explanation" }
          ],
          "fluency_score": 0-100,
          "grammar_accuracy": 0-100,
          "shadowing_sentence": "Correct natural sentence for the user to practice",
          "shadowing_pronunciation": "Romanization of the shadowing sentence",
          "encouragement": "A short encouraging sentence in Uzbek"
        }
      `;

      const result = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: [
          {
            role: "user",
            parts: [{ text: "System: " + systemInstruction }]
          },
          ...history.slice(-10), // Keep last 10 turns for context
          {
            role: "user",
            parts: [{ text: message }]
          }
        ],
        config: {
          temperature: 0.8,
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(result.text);
      res.json(data);
    } catch (error: any) {
      console.error("Conversation API Error:", error);
      res.status(500).json({ error: error.message || "Xatolik yuz berdi" });
    }
  });

  // API Route for Text-to-Speech (Gemini 3.1 Flash TTS)
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voice = 'Kore' } = req.body;
      if (!text || text.trim() === "") {
        return res.status(400).json({ error: "Text is required" });
      }

      const result = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ 
          role: "user",
          parts: [{ text }] 
        }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice as any },
            },
          },
        },
      });

      const audioData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        res.json({ audio: audioData });
      } else {
        throw new Error("Audio generate qilib bo'lmadi");
      }
    } catch (error: any) {
      console.error("TTS Error:", error);
      res.status(500).json({ error: "Ovozli xabar yaratishda xatolik" });
    }
  });

  // Google Search AI System endpoint
  app.post("/api/search", async (req, res) => {
    try {
      const { query, category } = req.body;
      if (!query || query.trim() === "") {
        return res.status(400).json({ error: "Soniya ichida izlash iborasi berilishi kerak" });
      }

      let systemInstruction = "";

      if (category === "general_grammar" || category === "culture_drama") {
        systemInstruction = `
          Siz 'KOREAN MASTER AI' tizimisiz. Siz Koreys tili bo'yicha eng kuchli internet-qidiruv va o'qitish tizimisiz.
          Foydalanuvchi quyidagi mavzuni qidirdi: "${query}".
          
          Vazifangiz:
          1. Google Search orqali ushbu so'rov bo'yicha koreys tilining eng ishonchli va sifatli qoidalarini, tarjimalarini yoki madaniy xususiyatlarini qidiring.
          2. Topilgan ma'lumotlarni o'quvchi uchun sodda, ammo mukammal darajada o'zbek tilida tahlil qiling.
          3. Natijalarni strictly JSON formatida qaytaring. Hech qanday boshqa matn yoki izoh qo'shmang. JSON quyidagi tuzilishga ega bo'lishi shart:
          {
            "summary": "Mavzu bo'yicha to'liq, batafsil va qiziqarli o'zbekcha tahlil...",
            "grammar_points": [
              {
                "term": "Grammatik qo'shimcha yoki ibora (masalan, -는/은)",
                "meaning": "O'zbekcha qisqacha ma'nosi",
                "explanation": "Ushbu qoidaning ishlatilishi va farqlari haqida o'zbekcha tushunarli tushuntirish...",
                "examples": [
                  { "kr": "Koreyscha gap", "uz": "O'zbekcha tarjimasi" }
                ]
              }
            ],
            "vocabulary": [
              { "kr": "Koreyscha so'z", "pron": "Lotincha talaffuzi", "uz": "O'zbekcha tarjimasi" }
            ],
            "learning_notes": [
              "O'quvchi uchun muhim maslahat 1...",
              "O'quvchi xato qiladigan nozik jihat 2..."
            ]
          }
        `;
      } else if (category === "youtube") {
        systemInstruction = `
          Siz 'KOREAN MASTER AI' tizimisiz. Siz Koreys tili bo'yicha eng kuchli internet-qidiruv o'quv YouTube darsliklari tizimisiz.
          Foydalanuvchi quyidagi darsni qidirdi: "${query}".
          
          Vazifangiz:
          1. Google Search darsliklaridan foydalanib, ushbu mavzu bo'yicha eng yaxshi bir nechta YouTube video darsliklarini toping.
          2. Har bir video uchun qisqacha konspekt, tavsiya va yangi so'zlarni ajrating.
          3. Ushbu darslar asosida interaktiv 2 ta test savolini generated qiling.
          4. Natijani strictly JSON formatida qaytaring. Hech qanday boshqa matn qo'shmang. JSON quyidagi tuzilishga ega bo'lishi shart:
          {
            "playlist_title": "Mavzuga doir YouTube o'quv darslari to'plami",
            "recommended_videos": [
              {
                "title": "Video darslikning nomi",
                "channel": "Kanal nomi",
                "summary": "Ushbu darsning o'rganish bo'yicha amaliy tavsifi va foydasi...",
                "url": "Haqiqiy yoki eng mos keladigan YouTube video linki (masalan, https://youtube.com/watch?v=...)",
                "extracted_notes": "Sinxron o'rganish bo'yicha muhim eslatmalar va dars xulosasi...",
                "extracted_vocab": [
                  { "kr": "Koreyscha so'z", "uz": "O'zbekcha tarjimasi" }
                ]
              }
            ],
            "quiz_generator": [
              {
                "question": "Mavzuga oid test savoli...",
                "options": ["Variant A", "Variant B", "Variant C", "Variant D"],
                "answer_index": 0,
                "explanation": "To'g'ri javob uchun o'zbekcha tushunarli sharh..."
              }
            ]
          }
        `;
      } else if (category === "news") {
        systemInstruction = `
          Siz 'KOREAN MASTER AI' tizimisiz. Siz Koreys tili bo'yicha eng so'nggi real-time yangiliklar tahlilchisiz.
          Foydalanuvchi yangiliklar qidirmoqda: "${query}".
          
          Vazifangiz:
          1. Google Search orqali so'nggi yoki eng qiziqarli Koreya yangiliklarini qidiring.
          2. Yangilik matnini koreys tili o'rganayotgan barcha darajadagi foydalanuvchilar o'qishi uchun soddalashtiring (raw_text_simplified).
          3. Ushbu yangilikni to'liq o'zbek tiliga tarjima qiling.
          4. Yangilikdan muhim o'quv so'zlarini (vocabulary_list) va 1-2 ta grammatik tahlilni ajrating.
          5. Natijani strictly JSON formatida qaytaring. Hech qanday boshqa matn qo'shmang. JSON quyidagi tuzilishga ega bo'lishi shart:
          {
            "news": {
              "article_title_kr": "Koreyscha yangilik sarlavhasi",
              "article_title_uz": "Uzbekcha tarjima qilingan sarlavha",
              "raw_text_simplified": "Soddalashtirilgan va o'qishga oson bo'lgan koreyscha yangilik matni...",
              "translation_uz": "Ushbu matnning to'liq va mukammal o'zbekcha tarjimasi...",
              "vocabulary_list": [
                { "kr": "Koreyscha so'z", "pron": "Pronunciation o'qilishi", "uz": "O'zbekcha ma'nosi" }
              ],
              "grammar_breakdown": [
                { "kr": "Grammatik element (masalan, -ㄴ/은 후에)", "explanation": "Matnda ishlatilganligi bo'yicha qisqacha o'zbekcha tahlili..." }
              ],
              "listening_practice_transcript": "Suxandonga xos bo'lgan, ohangdor va suxandon kabi o'qiladigan koreyscha qayta yozuv..."
            }
          }
        `;
      }

      let response;
      let usedSearch = true;
      let isMockOffline = false;
      let parsedData: any = {};

      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [
            {
              role: "user",
              parts: [{ text: systemInstruction }]
            }
          ],
          config: {
            tools: [{ googleSearch: {} }],
            temperature: 0.5,
            responseMimeType: "application/json"
          }
        });
      } catch (searchError: any) {
        console.warn("Google Search Grounding failed, attempting fallback model without Search tool:", searchError.message || searchError);
        usedSearch = false;

        const fallbackInstruction = systemInstruction + "\n\nQo'shimcha eslatma: Hozirgi vaqtda Google Search cheklovlari yoki quota sababli real-time qidiruv o'chirilgan bo'lishi mumkin. O'z lokal boy ichki bilimingizdan foydalanib eng so'nggi va ishonchli koreys tili darslarini va so'ralgan ma'lumotlarni mukammal va to'liq bering. Matn sarlavhasi va hamma maydonlar tuzuqligi bir xil JSON formatida qolsin.";

        try {
          response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: [
              {
                role: "user",
                parts: [{ text: fallbackInstruction }]
              }
            ],
            config: {
              temperature: 0.5,
              responseMimeType: "application/json"
            }
          });
        } catch (secondaryError: any) {
          console.warn("Secondary fallback with gemini-3.5-flash failed:", secondaryError.message || secondaryError);
          try {
            response = await ai.models.generateContent({
              model: "gemini-flash-latest",
              contents: [
                {
                  role: "user",
                  parts: [{ text: fallbackInstruction }]
                }
              ],
              config: {
                temperature: 0.5,
                responseMimeType: "application/json"
              }
            });
          } catch (offlineError: any) {
            console.error("All Gemini API attempts failed due to rate limits or exhaustion, serving custom mock dars response.", offlineError.message || offlineError);
            isMockOffline = true;
          }
        }
      }

      if (isMockOffline) {
        // Fallback offline state structure definition
        if (category === "general_grammar" || category === "culture_drama") {
          parsedData = {
            is_offline: true,
            summary: `OFFLINE BILIM REJIMI: Hozirda Google API quotalari va cheklovlari tufayli tarmoq aloqasi bir oz pasaygan. Shunga qaramay, K-Master AI tizimi sizning "${query}" darsingiz bo'yicha eng muhim o'quv qo'llanmasini offline shaklda tayyorladi.`,
            grammar_points: [
              {
                term: query || "-은/는",
                meaning: "Mavzu qo'shimchasi va asosiy grammatika",
                explanation: "Gapdagi ega yoki mavzuni ta'kidlash uchun ot so'z turkumiga qo'shiladigan qo'shimcha. Undosh bilan tugasa '-은', unli bilan tugasa '-는' shakli qo'llaniladi.",
                examples: [
                  { kr: "한국어는 아주 재미있습니다.", uz: "Koreys tili juda qiziqarli." },
                  { kr: "저는 한국 마스터 AI 학생입니다.", uz: "Men Koreys Master AI o'quvchisiman." }
                ]
              }
            ],
            vocabulary: [
              { kr: "한국어", pron: "hangugo", uz: "Koreys tili" },
              { kr: "공부", pron: "gongbu", uz: "O'qish, O'rganish" },
              { kr: "선생님", pron: "sonsengnim", uz: "O'qituvchi" },
              { kr: "친구", pron: "chingu", uz: "Do'st" }
            ],
            learning_notes: [
              "Hozirda Google API klyuchida quota tugaganligi sababli tizim offline rejimida ishlayapti.",
              "Koreys tilida gap oxirida keladigan fe'llar zamon va hurmat darajasiga ko'ra tuslanishini unutmang."
            ]
          };
        } else if (category === "youtube") {
          parsedData = {
            is_offline: true,
            playlist_title: `"${query}" mavzusi bo'yicha offline darslik tavsiyalari`,
            recommended_videos: [
              {
                title: "Koreys tili noldan boshlab eng ishonchli video dars",
                channel: "KOREAN MASTER OFFICIAL",
                summary: "Koreys tilining eng asosi bo'lgan alifbo, Hangeul tovushlari va unli-undoshlarni tushuntiruvchi dars.",
                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                extracted_notes: "Koreys tili alifbosi 21 unli va 19 undosh tovushdan iborat. Ushbu unli va undoshlar bo'g'inli bloklarga birlashtirilib yoziladi.",
                extracted_vocab: [
                  { kr: "안녕하세요", uz: "Assalomu alaykum (salom)" },
                  { kr: "한글", uz: "Koreys alifbosi" }
                ]
              }
            ],
            quiz_generator: [
              {
                question: "Koreys tilida alifboni mukammal qilgan qirol kim?",
                options: ["Qirol Sejong", "Qirol Gojong", "Qirol Taejo", "Qirol Wang Geon"],
                answer_index: 0,
                explanation: "Qirol Sejong (세종대왕) 1443-yilda xalq qiynalmasligi uchun Hangeul alifbosini yaratish to'g'risida buyruq bergan."
              }
            ]
          };
        } else if (category === "news") {
          parsedData = {
            is_offline: true,
            news: {
              article_title_kr: `한국어 마스터 AI 뉴스 피드 [OFFLINE REJIM]`,
              article_title_uz: `Koreys Tili Master AI Offline Yangiliklari`,
              raw_text_simplified: `한국에서는 매년 한글날을 아름답게 기념합니다. 한글은 세계에서 가장 훌륭한 문자 시스템 중 하나입니다.`,
              translation_uz: `Koreyada har yili Hangeul (koreys alifbosi) kunini juda chiroyli tarzda nishonlaydilar. Hangeul dunyodagi eng ajoyib yozuv tizimlaridan biridir.`,
              vocabulary_list: [
                { kr: "매년", pron: "menyon", uz: "har yili" },
                { kr: "기념하다", pron: "ginyom-hada", uz: "nishonlash, xotirlash" }
              ],
              grammar_breakdown: [
                { kr: "-에서는", explanation: "Joyga qo'shilib o'sha joyda o'ziga xos harakat bo'layotganini bildiradi (Koreyada)." }
              ],
              listening_practice_transcript: "한국에서는 매년 한글날을 아름답게 기념합니다."
            }
          };
        }
      } else {
        const text = response.text || "{}";
        
        // Extract clean JSON from markdown or raw string
        let clean = text.trim();
        if (clean.startsWith("```json")) {
          clean = clean.substring(7);
        } else if (clean.startsWith("```")) {
          clean = clean.substring(3);
        }
        if (clean.endsWith("```")) {
          clean = clean.slice(0, -3);
        }
        
        parsedData = JSON.parse(clean.trim());

        // Extract Grounding Chunks to add real Sources citations
        const sources: any[] = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks && chunks.length > 0) {
          chunks.forEach((chunk: any) => {
            if (chunk.web && chunk.web.uri) {
              sources.push({
                title: chunk.web.title || "Tashqi Manba",
                url: chunk.web.uri
              });
            }
          });
        }

        // Merge sources references into response payload
        parsedData.sources = sources;
      }

      res.json(parsedData);
    } catch (error: any) {
      console.error("Search API Error:", error);
      res.status(500).json({ error: error.message || "Xatolik yuz berdi" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
