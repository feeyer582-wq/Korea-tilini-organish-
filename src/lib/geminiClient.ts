export function getApiKey(): string {
  const envKey = (process.env.GEMINI_API_KEY || ((import.meta as any).env && (import.meta as any).env.VITE_GEMINI_API_KEY)) as string | undefined;
  if (envKey && envKey.trim() !== "") {
    return envKey;
  }
  return localStorage.getItem('k_master_gemini_api_key') || "";
}

export function setApiKey(key: string) {
  if (key) {
    localStorage.setItem('k_master_gemini_api_key', key.trim());
  } else {
    localStorage.removeItem('k_master_gemini_api_key');
  }
}

export function hasApiKey(): boolean {
  return getApiKey().trim() !== "";
}

// Low-level helper to invoke Gemini API with optional JSON config
async function callGemini(contents: any[], systemInstruction?: string, responseMimeType?: string, temperature = 0.7): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("No API Key configured. Please enter your Gemini API Key in Settings.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const payload: any = {
    contents,
    generationConfig: {
      temperature,
    }
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  if (responseMimeType === "application/json") {
    payload.generationConfig.responseMimeType = "application/json";
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsedErr;
    try {
      parsedErr = JSON.parse(errText);
    } catch {
      parsedErr = null;
    }
    const errMsg = parsedErr?.error?.message || response.statusText || errText;
    throw new Error(`Gemini API Error: ${errMsg}`);
  }

  const resJson = await response.json();
  const contentText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!contentText) {
    throw new Error("Empty candidate response from Gemini API.");
  }

  return contentText;
}

// 1. CHAT ENDPOINT FUNCTION
export async function clientChat(message: string, history: any[]): Promise<{ text: string }> {
  if (!hasApiKey()) {
    return {
      text: `[OFFLINE MODE] Salom! Hozirda offline rejimdasiz. Koreys tili darslarimizdan foydalanishingiz mumkin, biroq to'liq interaktiv chat uchun sozlamalarda (Home sahifasida) Gemini API Key-ni kiriting.\n\nYordam beradigan ma'lumotlar:\n- Alifbo (Alphabet) bo'limida Hangulni o'rganing.\n- Rules bo'limida asosiy qoidalarni o'qing.\n- Test bo'limida o'zingizni sinang!`
    };
  }

  const systemInstruction = "Siz DUNYODAGI ENG YAXSHI KOREYS TILI REPETITORI va AI MASTER tizimisiz. Ismingiz 'KOREAN MASTER AI'. Sizning vazifangiz o'quvchini ABSOLUT NO'LDAN PROFESSIONAL DARAGAGA (TOPIK II) 1 yil ichida olib chiqish. Siz professional, do'stona, qat'iyatli va juda bilimlisiz. Hamma javoblaringizni o'zbek tilida yozing. Sizning uslubingiz: 1. Grammatikani oddiy va tushunarli tushuntirish. 2. Har doim misollar keltirish. 3. O'quvchi xatosini darhol tuzatish. 4. Motivatsiya berish. 5. Koreya madaniyati haqida qisqa qiziqarli faktlar qo'shish. Siz shunchaki chat-bot emassiz, siz to'liq EDUCATION ECOSYSTEMning miyasiz.";

  const formattedHistory = history.map(h => ({
    role: h.role === 'model' ? 'model' : 'user',
    parts: [{ text: h.content || h.parts?.[0]?.text || "" }]
  }));

  try {
    const responseText = await callGemini(
      [...formattedHistory, { role: "user", parts: [{ text: message }] }],
      systemInstruction
    );
    return { text: responseText };
  } catch (error: any) {
    console.error("Client chat error:", error);
    return { text: `Tizim xatosi: ${error.message || error}. Iltimos, API kalitingiz va internetingizni tekshiring.` };
  }
}

// 2. TRANSLATE ENDPOINT FUNCTION
export async function clientTranslate(text: string): Promise<{ kr: string, pron: string }> {
  if (!hasApiKey()) {
    // Basic local offline dictionary fallback
    const dict: { [key: string]: { kr: string, pron: string } } = {
      "salom": { kr: "안녕하세요", pron: "Annyeonghaseyo" },
      "rahmat": { kr: "감사합니다", pron: "Gamsahabnida" },
      "hayr": { kr: "안녕히 계세요", pron: "Annyeonghi gyeseyo" },
      "ha": { kr: "네", pron: "Ne" },
      "yo'q": { kr: "아니요", pron: "Aniyo" },
      "maktab": { kr: "학교", pron: "Hakgyo" },
      "suv": { kr: "물", pron: "Mul" },
      "non": { kr: "빵", pron: "Ppang" },
      "yaxshi": { kr: "좋은", pron: "Joheun" }
    };
    const key = text.trim().toLowerCase();
    if (dict[key]) {
      return dict[key];
    }
    return { kr: `${text} (Offline)`, pron: "Gemini API kaliti kiritilmagan" };
  }

  const prompt = `Translate the following Uzbek phrase into natural Korean and provide its romanized pronunciation for a learner. 
  Always use standard polite form unless it's a very simple greeting.
  Respond strictly in JSON format with two fields: "kr" (Korean characters) and "pron" (Romanized pronunciation).
  Example input: "Salom"
  Example output: {"kr": "안녕하세요", "pron": "Annyeonghaseyo"}
  Input text: "${text}"`;

  try {
    const resText = await callGemini(
      [{ role: "user", parts: [{ text: prompt }] }],
      undefined,
      "application/json"
    );
    return JSON.parse(resText.trim());
  } catch (err) {
    console.error("Translation fail", err);
    return { kr: text, pron: "Translating error" };
  }
}

// 3. ADVANCED CONVERSATION ENDPOINT FUNCTION
export async function clientConversation(message: string, history: any[], mode: string, scenario: string, level: string): Promise<any> {
  if (!hasApiKey()) {
    // Simulated Offline Character Chat
    return {
      ai_response_kr: "안녕하세요! 지금 오프라인 모드입니다. 대화를 시작하려면 API 키를 입력해 주세요.",
      ai_response_uz: "Assalomu alaykum! Hozirda offline rejimdasiz. Haqiqiy jonli muloqot qilish uchun Home bo'limida API kalitini sozlang.",
      corrections: [],
      fluency_score: 95,
      grammar_accuracy: 95,
      shadowing_sentence: "한국어를 정말 열심히 공부하고 있군요!",
      shadowing_pronunciation: "Hangugoreul jeongmal yeolsimhi gongbuhago ingunyo!",
      encouragement: "K-Master tizimi sizning o'rganishingizda doim yordamga tayyor!"
    };
  }

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

  const formattedHistory = history.slice(-8).map(h => ({
    role: h.role === 'model' ? 'model' : 'user',
    parts: [{ text: h.content || h.parts?.[0]?.text || "" }]
  }));

  try {
    const resText = await callGemini(
      [...formattedHistory, { role: "user", parts: [{ text: message }] }],
      systemInstruction,
      "application/json"
    );
    return JSON.parse(resText.trim());
  } catch (err: any) {
    console.error("Conversation failure:", err);
    throw err;
  }
}

// 4. SEARCH AI ENDPOINT FUNCTION
export async function clientSearch(query: string, category: string): Promise<any> {
  if (!hasApiKey()) {
    // Structured Mock Offline Database response based on category & input
    if (category === "general_grammar" || category === "culture_drama") {
      return {
        is_offline: true,
        summary: `OFFLINE BILIM REJIMI: Hozirda Google API quotalari va cheklovlari tufayli tarmoq aloqasi bir oz pasaygan. Shunga qaramay, K-Master AI tizimi sizning "${query}" darsingiz bo'yicha eng muhim o'quv qo'llanmasini offline shaklda tayyorladi. To'liq darslarni real vaqtda yangilash uchun home sahifasida API Key kiriting.`,
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
          "Hozirda tizim offline rejimda ishlamoqda. Haqiqiy vaqtli Internet qidirish uchun API Kalitni ulang.",
          "Koreys tilida gap oxirida keladigan fe'llar zamon va hurmat darajasiga ko'ra tuslanishini unutmang."
        ]
      };
    } else if (category === "youtube") {
      return {
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
    } else {
      return {
        is_offline: true,
        news: {
          article_title_kr: `한국어 마스터 AI 뉴스 피드 [OFFLINE REJIM]`,
          article_title_uz: `Koreys Tili Master AI Offline Yangiliklari`,
          raw_text_simplified: `한국에서는 매년 한글날을 아름답게 기념합니다. 한글은 세계에서 가장 훌륭한 문자 시스템 중 하나입니다.`,
          translation_uz: `Koreyada har yili Hangeul (koreys alifbosi) kunini juda chiroyli tarzda nishonlaydilar. Hangeul dunyodagi eng ajoyib yozuv tizimlaridir.`,
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
  }

  let systemInstruction = "";

  if (category === "general_grammar" || category === "culture_drama") {
    systemInstruction = `
      Siz 'KOREAN MASTER AI' tizimisiz. Siz Koreys tili bo'yicha eng kuchli internet-qidiruv va o'qitish tizimisiz.
      Foydalanuvchi quyidagi mavzuni so'radi: "${query}".
      
      Vazifangiz:
      1. Ushbu mavzu bo'yicha koreys tilining eng ishonchli va sifatli qoidalarini, tarjimalarini yoki madaniy xususiyatlarini tahlil qiling.
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
          "O'quvchi uchun huiy maslahat 1...",
          "O'quvchi xato qiladigan nozik jihat 2..."
        ]
      }
    `;
  } else if (category === "youtube") {
    systemInstruction = `
      Siz 'KOREAN MASTER AI' tizimisiz. Siz Koreys tili bo'yicha eng kuchli YouTube darsliklari saralovchi tizimisiz.
      Foydalanuvchi quyidagi darsni qidirdi: "${query}".
      
      Vazifangiz:
      1. Ushbu mavzu bo'yicha eng yaxshi va haqiqiy ko'rinadigan YouTube video darslik qismini va dars ma'lumotlarini tuzing.
      2. Video dars uchun qisqacha konspekt, tavsiya va yangi so'zlarni ajrating.
      3. Ushbu darslar asosida interaktiv 2 ta test savolini generated qiling.
      4. Natijani strictly JSON formatida qaytaring. Hech qanday boshqa matn qo'shmang. JSON quyidagi tuzilishga ega bo'lishi shart:
      {
        "playlist_title": "Mavzuga doir YouTube o'quv darslari to'plami",
        "recommended_videos": [
          {
            "title": "Video darslikning nomi",
            "channel": "Kanal nomi",
            "summary": "Ushbu darsning o'rganish bo'yicha amaliy tavsifi va foydasi...",
            "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "extracted_notes": "Sinxron o'rganish bo'yicha muhim eslatmalar va dars xulosasi...",
            "extracted_vocab": [
              { "kr": "Koreyscha so'z", "uz": "O'zbekcha tarjimasi" }
            ]
          }
        ],
        "quiz_generator": [
          {
            "question": "Savol matni",
            "options": ["Variant 1", "Variant 2", "Variant 3", "Variant 4"],
            "answer_index": 0,
            "explanation": "To'g'ri javobga qisqacha o'zbekcha izoh..."
          }
        ]
      }
    `;
  } else {
    // News query
    systemInstruction = `
      Siz 'KOREAN MASTER AI' tizimisiz.
      Foydalanuvchi quyidagi mavzuni qidirdi: "${query}".
      
      Vazifangiz:
      1. Ushbu yangilik yoki mavzu bo'yicha koreys tilidagi qiziqarli yangilik sarlavhasini yarating.
      2. Natijani va tarjimasini tahlil qiling.
      3. Matndagi eng zarur grammatika va lug'atlarni ajrating.
      4. Natijani strictly JSON formatida qaytaring. JSON quyidagi tuzilishga ega bo'lishi shart:
      {
        "news": {
          "article_title_kr": "Yangilik sarlavhasi Koreyscha",
          "article_title_uz": "Yangilik sarlavhasi O'zbekcha tarjimasi",
          "raw_text_simplified": "Sodda va tushunarli matn qismi (Hangeulda)",
          "translation_uz": "Barcha matnning o'zbekcha tarjimasi",
          "vocabulary_list": [
            { "kr": "Koreyscha so'z", "pron": "Lotincha talaffuzi", "uz": "O'zbekcha tarjimasi" }
          ],
          "grammar_breakdown": [
            { "kr": "Qo'shimcha/Grammatika", "explanation": "O'zbekcha tushunarli tushuntirish..." }
          ],
          "listening_practice_transcript": "Eshitish mashqi uchun matn"
        }
      }
    `;
  }

  try {
    const resText = await callGemini(
      [{ role: "user", parts: [{ text: `${category} bo'yicha so'rov: ${query}` }] }],
      systemInstruction,
      "application/json",
      0.6
    );
    return JSON.parse(resText.trim());
  } catch (err) {
    console.error("Search API failure, using fallback", err);
    throw err;
  }
}
