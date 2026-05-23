import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, Sparkles, CheckCircle2, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

interface Phrase {
  kr: string;
  uz: string;
  pron: string;
}

const phrases: Phrase[] = [
  { kr: "안녕하세요", uz: "Salom", pron: "Annyeonghaseyo" },
  { kr: "감사합니다", uz: "Rahmat", pron: "Gamsahamnida" },
  { kr: "사랑해요", uz: "Sizni sevaman", pron: "Saranghaeyo" },
  { kr: "죄송합니다", uz: "Kechirasiz", pron: "Joesonghamnida" },
  { kr: "괜찮아요", uz: "Hechqisi yo'q", pron: "Gwaenchannayo" },
];

export default function Speaking() {
  const [activePhrase, setActivePhrase] = useState<Phrase>(phrases[0]);
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [customKr, setCustomKr] = useState("");
  const [customUz, setCustomUz] = useState("");
  const [uzInput, setUzInput] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleTranslateAndLearn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uzInput.trim()) return;

    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: uzInput }),
      });
      const data = await response.json();
      if (data.kr) {
        const newPhrase: Phrase = {
          kr: data.kr,
          uz: uzInput,
          pron: data.pron || "...",
        };
        setActivePhrase(newPhrase);
        setResult(null);
        setUzInput("");
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCustomApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKr.trim()) return;
    const newPhrase: Phrase = {
      kr: customKr,
      uz: customUz || "Custom Phrase",
      pron: "Custom",
    };
    setActivePhrase(newPhrase);
    setResult(null);
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'ko-KR';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setResult(transcript);
        setIsListening(false);
        
        if (transcript.trim().replace(/\s/g, '') === activePhrase.kr.trim().replace(/\s/g, '')) {
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.8 },
                colors: ['#10b981', '#34d399']
            });
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error(event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setResult("Xatolik: Mikrofonga ruxsat berilmagan. Iltimos, brauzer sozlamalaridan mikrofonga ruxsat bering yoki ilovani yangi oynada oching.");
        } else if (event.error === 'no-speech') {
          setResult("Ovoz eshitilmadi. Iltimos, qaytadan gapirib ko'ring.");
        }
      };
    }
  }, [activePhrase]);

  const startListening = () => {
    if (recognitionRef.current) {
      setResult(null);
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      alert("Sizning brauzeringiz nutqni tanishni qo'llab-quvvatlamaydi.");
    }
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="py-6 space-y-12">
      <header className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black uppercase tracking-wider">Pronunciation AI</span>
          <h2 className="text-4xl font-black mt-4 tracking-tight dark:text-white uppercase">Talaffuz Master</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">AI bilan talaffuzni tekshiring va tarjima qiling</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-12 flex flex-col items-center">
           <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-12 shadow-2xl shadow-emerald-500/5 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 p-10 opacity-5 pointer-events-none">
                 <MessageCircle size={150} className="dark:text-white" />
              </div>

              <div className="flex justify-center gap-4 mb-2 overflow-x-auto pb-4 scrollbar-hide">
                 {phrases.map((p) => (
                    <button
                        key={p.kr}
                        onClick={() => { setActivePhrase(p); setResult(null); }}
                        className={cn(
                            "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            activePhrase.kr === p.kr && activePhrase.pron !== "Custom" 
                              ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-xl shadow-emerald-100 dark:shadow-emerald-900/40" 
                              : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                        )}
                    >
                        {p.kr}
                    </button>
                 ))}
              </div>

              <div className="space-y-4 mb-10">
                 <div className="text-left">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4 mb-2 block">O'zbekcha yozing (AI Koreyschaga o'giradi)</label>
                    <form onSubmit={handleTranslateAndLearn} className="flex flex-col sm:flex-row gap-3 bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-3xl border-2 border-emerald-100/50 dark:border-emerald-800/50">
                        <input 
                            type="text" 
                            placeholder="O'zbekcha gap yoki so'z..." 
                            value={uzInput}
                            onChange={(e) => setUzInput(e.target.value)}
                            className="flex-1 bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl outline-none font-bold text-sm dark:text-white"
                        />
                        <button 
                            type="submit"
                            disabled={isTranslating}
                            className={cn(
                                "bg-emerald-600 dark:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all disabled:opacity-50",
                                isTranslating && "animate-pulse"
                            )}
                        >
                            {isTranslating ? "Tarjima..." : "O'girish va O'rganish"}
                        </button>
                    </form>
                 </div>

                 <div className="flex items-center gap-4 my-4 opacity-20">
                    <div className="h-px bg-slate-400 flex-1"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest dark:text-white">Yoki</span>
                    <div className="h-px bg-slate-400 flex-1"></div>
                 </div>

                 <div className="text-left">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4 mb-2 block">O'zingiz qo'shing</label>
                    <form onSubmit={handleCustomApply} className="flex flex-col sm:flex-row gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-3xl border-2 border-slate-100 dark:border-slate-800">
                      <input 
                        type="text" 
                        placeholder="Koreyscha so'z..." 
                        value={customKr}
                        onChange={(e) => setCustomKr(e.target.value)}
                        className="flex-1 bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl outline-none font-bold text-sm dark:text-white border-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Ma'nosi..." 
                        value={customUz}
                        onChange={(e) => setCustomUz(e.target.value)}
                        className="flex-1 bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl outline-none font-bold text-sm dark:text-white border-none"
                      />
                      <button 
                        type="submit"
                        className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all"
                      >
                        Qo'shish
                      </button>
                    </form>
                 </div>
              </div>

              <h3 className="text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-none">{activePhrase.kr}</h3>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">[{activePhrase.pron}]</p>
              <p className="text-lg font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-12">{activePhrase.uz}</p>

              <div className="flex flex-col items-center gap-8">
                 <div className="flex gap-6">
                    <button 
                        onClick={() => speak(activePhrase.kr)}
                        className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl flex items-center justify-center transition-all shadow-inner"
                    >
                        <Volume2 size={32} />
                    </button>
                    <button 
                        onClick={startListening}
                        disabled={isListening}
                        className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-2xl relative",
                            isListening ? "bg-red-500 text-white animate-pulse" : "bg-emerald-600 dark:bg-emerald-500 text-white hover:scale-110 active:scale-95 shadow-emerald-200 dark:shadow-emerald-900/40"
                        )}
                    >
                        {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                        {isListening && <div className="absolute inset-0 rounded-2xl border-4 border-red-200 animate-ping" />}
                    </button>
                 </div>

                 <div className="h-24 flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                       {isListening && (
                           <motion.p 
                             initial={{ opacity: 0 }} 
                             animate={{ opacity: 1 }} 
                             className="text-sm font-black text-slate-400 uppercase tracking-widest"
                           >
                            Tinglanmoqda...
                           </motion.p>
                       )}
                       {result && (
                           <motion.div 
                             initial={{ opacity: 0, scale: 0.9 }} 
                             animate={{ opacity: 1, scale: 1 }}
                             className="flex flex-col items-center gap-2"
                           >
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Siz aytdingiz:</p>
                              <div className={cn(
                                  "px-8 py-3 rounded-2xl font-black text-xl flex items-center gap-3",
                                  result.trim().replace(/\s/g, '') === activePhrase.kr.trim().replace(/\s/g, '') 
                                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800" 
                                    : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800"
                              )}>
                                 {result}
                                 {result.trim().replace(/\s/g, '') === activePhrase.kr.trim().replace(/\s/g, '') && <CheckCircle2 size={24} />}
                              </div>
                           </motion.div>
                       )}
                    </AnimatePresence>
                 </div>
              </div>
           </div>

           <div className="mt-12 bg-slate-900 dark:bg-black rounded-[2.5rem] p-10 text-white max-w-2xl w-full flex items-center gap-8 shadow-2xl">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center shrink-0">
                 <Sparkles size={32} className="text-amber-400" />
              </div>
              <p className="text-sm font-bold leading-relaxed uppercase tracking-wide">
                 TALAFUZNI TEKSHIRISH UCHUN CHROME YOKI EDGE BRAUZERLARIDAN FOYDALANING. MIKROFONGA RUXSAT BERING!
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
