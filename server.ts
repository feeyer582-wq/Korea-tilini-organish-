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
