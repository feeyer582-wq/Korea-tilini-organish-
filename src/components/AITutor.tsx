import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, User, Bot, Sparkles, Loader2, RefreshCw, 
  Mic, MicOff, Volume2, VolumeX, MessageSquare, 
  Target, Zap, Coffee, Plane, ShoppingBag, 
  GraduationCap, Briefcase, Heart, AlertCircle,
  Play, CheckCircle2, ChevronRight, BarChart3,
  Languages
} from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';
import { clientChat, clientConversation } from '../lib/geminiClient';

interface Correction {
  original: string;
  corrected: string;
  explanation: string;
}

interface Message {
  role: 'user' | 'model';
  content: string;
  translation?: string;
  corrections?: Correction[];
  score?: number;
  shadowing?: {
    sentence: string;
    pronunciation: string;
  };
  audioUrl?: string;
}

const PERSONALITIES = [
  { id: 'friendly_teacher', name: 'Friendly Teacher', icon: GraduationCap, color: 'bg-emerald-500', desc: 'Muloyim va sabrli o\'qituvchi' },
  { id: 'korean_friend', name: 'Korean Friend', icon: Heart, color: 'bg-pink-500', desc: 'Siz bilan do\'stona muloqot qiladi' },
  { id: 'strict_teacher', name: 'Strict Teacher', icon: AlertCircle, color: 'bg-red-500', desc: 'Xatolarga qat\'iy e\'tibor beradi' },
  { id: 'topik_examiner', name: 'TOPIK Examiner', icon: Target, color: 'bg-indigo-600', desc: 'Imtihon darajasida savol-javob' },
  { id: 'cafe_worker', name: 'Cafe Worker', icon: Coffee, color: 'bg-amber-600', desc: 'Kafe muhitidagi muloqot' },
  { id: 'interviewer', name: 'Interviewer', icon: Briefcase, color: 'bg-slate-700', desc: 'Ishga kirish suhbati' },
  { id: 'travel_guide', name: 'Travel Guide', icon: Plane, color: 'bg-blue-500', desc: 'Koreya bo\'ylab sayohat gidi' }
];

const SCENARIOS = [
  { id: 'general', name: 'Umumiy', icon: MessageSquare },
  { id: 'airport', name: 'Aeroport', icon: Plane },
  { id: 'restaurant', name: 'Restoran', icon: Coffee },
  { id: 'shopping', name: 'Xaridlar', icon: ShoppingBag },
  { id: 'office', name: 'Ofis', icon: Briefcase },
  { id: 'dating', name: 'Uchrashuv', icon: Heart },
  { id: 'emergency', name: 'Shoshilinch', icon: AlertCircle }
];

export default function AITutor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [useProVoice, setUseProVoice] = useState(true);
  const [isAdvanced, setIsAdvanced] = useState(true);
  
  const [personality, setPersonality] = useState(PERSONALITIES[0]);
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [level, setLevel] = useState('Beginner');
  const [micLang, setMicLang] = useState<'ko-KR' | 'uz-UZ'>('ko-KR');
  const [showSettings, setShowSettings] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const initSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const SpeechRecognition = (window as any).WebkitSpeechRecognition || (window as any).speechRecognition;
    if (!SpeechRecognition) {
      setMicError("Brauzeringiz ovozli muloqotni qo'llab-quvvatlamaydi. Iltimos, Google Chrome brauzeridan foydalaning.");
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = micLang;

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setInput(transcript);
        if (event.results[event.results.length - 1].isFinal) {
          setIsListening(false);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setMicError("Mikrofon ruxsati berilmagan. Iltimos, brauzer manzillar satridagi qulflash belgisini bosib, mikrofonga ruxsat bering.");
        } else if (event.error === 'network') {
          setMicError("Tarmoq xatosi. Ovozni aniqlash uchun internet kerak.");
        } else if (event.error === 'aborted') {
          // Ignore manual stop
        } else {
          setMicError(`Mikrofon xatosi: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      return recognition;
    } catch (e) {
      console.error("Failed to create SpeechRecognition", e);
      setMicError("Ovozli muloqot tizimini ishga tushirib bo'lmadi.");
      return null;
    }
  }, [micLang]);

  useEffect(() => {
    initSpeechRecognition();
  }, [initSpeechRecognition]);

  const playProVoice = async (text: string) => {
    speakLocal(text);
  };

  const speakLocal = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const hasKorean = /[\u3131-\uD79D]/.test(text);
    utterance.lang = hasKorean ? 'ko-KR' : 'uz-UZ';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const speak = (text: string) => {
    if (useProVoice) playProVoice(text);
    else speakLocal(text);
  };

  const toggleListening = () => {
    setMicError(null);
    
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      let recognition = recognitionRef.current;
      
      // Re-initialize if not ready
      if (!recognition) {
        recognition = initSpeechRecognition();
      }

      if (!recognition) {
        setMicError("Ovozli muloqot tizimi mavjud emas. Iltimos, sahifani yangilang yoki Chrome brauzeridan foydalaning.");
        return;
      }

      try {
        recognition.lang = micLang;
        recognition.start();
        setIsListening(true);
      } catch (err: any) {
        if (err.name === 'InvalidStateError') {
          // Already started, ignore
        } else {
          console.error("Mic start error", err);
          setMicError("Mikrofonni faollashtirishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
        }
      }
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!overrideInput) setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content
      }));

      let data;
      if (isAdvanced) {
        data = await clientConversation(
          textToSend,
          history,
          personality.name,
          scenario.name,
          level
        );

        const modelMsg: Message = {
          role: 'model',
          content: data.ai_response_kr,
          translation: data.ai_response_uz,
          corrections: data.corrections,
          score: data.fluency_score,
          shadowing: {
            sentence: data.shadowing_sentence,
            pronunciation: data.shadowing_pronunciation
          }
        };
        setMessages(prev => [...prev, modelMsg]);
        speak(data.ai_response_kr);
      } else {
        data = await clientChat(textToSend, history);
        setMessages(prev => [...prev, { role: 'model', content: data.text }]);
        speak(data.text);
      }
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "Xatolik yuz berdi. Iltimos, API Key-ni tekshiring va qaytadan urinib ko'ring." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-2 h-[85vh] flex flex-col space-y-4 lg:space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b dark:border-slate-800 pb-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", personality.color)}>
            <personality.icon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight dark:text-white uppercase leading-none">{personality.name}</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] mt-2">Scenario: {scenario.name} • Level: {level}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex-1 sm:flex-none px-4 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all dark:text-white"
          >
            <RefreshCw size={14} className={cn(showSettings && "rotate-180 transition-transform")} /> Rejimni o'zgartirish
          </button>
          <button 
            onClick={() => setUseProVoice(!useProVoice)}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all border",
              useProVoice ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-200 text-slate-400"
            )}
            title="Pro Voice (Gemini TTS)"
          >
            <Volume2 size={20} />
          </button>
        </div>
      </header>

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-30 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Personalities</label>
                <div className="grid grid-cols-2 gap-2">
                  {PERSONALITIES.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => { setPersonality(p); setShowSettings(false); }}
                      className={cn(
                        "p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all",
                        personality.id === p.id 
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600" 
                          : "border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:text-white"
                      )}
                    >
                      <p.icon size={20} />
                      <span className="text-[9px] font-black uppercase">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Scenarios</label>
                <div className="grid grid-cols-2 gap-2">
                  {SCENARIOS.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => { setScenario(s); setShowSettings(false); }}
                      className={cn(
                        "p-3 rounded-xl border flex items-center gap-2 transition-all",
                        scenario.id === s.id 
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600" 
                          : "border-slate-100 dark:border-slate-800 dark:text-white"
                      )}
                    >
                      <s.icon size={16} />
                      <span className="text-[9px] font-black uppercase">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Expertise Level</label>
                <div className="flex flex-col gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                    <button 
                      key={l}
                      onClick={() => { setLevel(l); setShowSettings(false); }}
                      className={cn(
                        "py-3 rounded-xl border font-black text-[10px] uppercase transition-all tracking-widest",
                        level === l 
                          ? "bg-blue-600 text-white border-blue-600" 
                          : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 dark:text-white"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                <div className="mt-6 space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Mic Input Language</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setMicLang('ko-KR')}
                      className={cn(
                        "flex-1 py-3 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all",
                        micLang === 'ko-KR' ? "bg-red-600 text-white border-red-600" : "bg-slate-50 dark:bg-slate-800 dark:text-white"
                      )}
                    >
                      Koreyscha
                    </button>
                    <button 
                      onClick={() => setMicLang('uz-UZ')}
                      className={cn(
                        "flex-1 py-3 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all",
                        micLang === 'uz-UZ' ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 dark:bg-slate-800 dark:text-white"
                      )}
                    >
                      O'zbekcha
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scroll-smooth relative z-10"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 sm:p-10">
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className={cn("w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mb-8 shadow-2xl text-white", personality.color)}
              >
                <personality.icon size={48} />
              </motion.div>
              <h3 className="text-2xl sm:text-3xl font-black mb-4 tracking-tight dark:text-white">Tayyormisiz?</h3>
              <p className="text-slate-500 max-w-sm font-bold text-xs sm:text-sm leading-relaxed uppercase tracking-wide opacity-80">
                Men {personality.name} man. Bugun {scenario.name} mavzusida muloqot qilamiz. {level} darajasiga moslashdim.
              </p>
              <button 
                onClick={() => handleSend("안녕하세요! 우리 대화를 시작해볼까요?")}
                className="mt-10 px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 active:scale-95 transition-all"
              >
                Suhbatni boshlash
              </button>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div 
              key={idx}
              className={cn(
                "flex w-full gap-4 sm:gap-5",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border-2",
                msg.role === 'user' ? "bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700" : cn("text-white border-transparent shadow-lg", personality.color)
              )}>
                {msg.role === 'user' ? <User size={20} /> : <personality.icon size={20} />}
              </div>
              <div className="flex flex-col gap-3 max-w-[85%] sm:max-w-[75%]">
                <div className={cn(
                  "p-5 sm:p-6 rounded-[2rem] text-[14px] sm:text-[16px] font-bold leading-relaxed shadow-sm",
                  msg.role === 'user' 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-700"
                )}>
                  {msg.role === 'model' && (
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 opacity-80">BIZNING JAVOB:</span>
                      <button onClick={() => speak(msg.content)} className="text-slate-400 hover:text-blue-500 transition-colors">
                        <Volume2 size={16} />
                      </button>
                    </div>
                  )}
                  <div className="markdown-body">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                  
                  {msg.translation && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-[12px] italic text-slate-500 dark:text-slate-400">{msg.translation}</p>
                    </div>
                  )}
                </div>

                {/* Advanced Analysis Cards */}
                {msg.role === 'model' && (msg.corrections?.length || msg.score !== undefined) && (
                  <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {msg.corrections && msg.corrections.length > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-3xl">
                        <header className="flex items-center gap-2 mb-3">
                           <AlertCircle size={14} className="text-amber-600" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-500">Xatolar tahlili</span>
                        </header>
                        <ul className="space-y-3">
                          {msg.corrections.map((c, i) => (
                            <li key={i} className="text-xs">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="line-through text-slate-400">{c.original}</span>
                                <ChevronRight size={10} />
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{c.corrected}</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 text-[10px]">{c.explanation}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {msg.score !== undefined && (
                      <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-3xl flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <BarChart3 size={18} className="text-emerald-600" />
                           <div>
                             <p className="text-[8px] font-black uppercase text-emerald-700/60 tracking-widest">Fluency Score</p>
                             <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 uppercase">{msg.score}% PERFECT</p>
                           </div>
                         </div>
                         <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin-slow flex items-center justify-center">
                            <span className="text-[8px] font-black">{msg.score}</span>
                         </div>
                      </div>
                    )}

                    {msg.shadowing && (
                      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-3xl group">
                        <p className="text-[8px] font-black uppercase text-blue-700/60 tracking-widest mb-2 flex items-center gap-1">
                          <Zap size={10} /> Shadowing Mode
                        </p>
                        <p className="text-sm font-black dark:text-white mb-1">{msg.shadowing.sentence}</p>
                        <p className="text-[10px] text-slate-500 italic mb-3">[{msg.shadowing.pronunciation}]</p>
                        <button 
                          onClick={() => speak(msg.shadowing!.sentence)}
                          className="w-full py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                          <Play size={10} fill="currentColor" /> Talaffuzni eshitish
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-5">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg", personality.color)}>
                <Loader2 size={24} className="animate-spin text-white" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 py-4 px-6 rounded-[2rem] animate-pulse font-black text-[10px] uppercase tracking-widest border border-slate-100 dark:border-slate-800">
                {personality.name} o'ylamoqda...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 relative z-20">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2 sm:gap-4 bg-slate-50 dark:bg-slate-800/50 p-2 border-2 border-slate-200 dark:border-slate-800 rounded-3xl transition-all focus-within:border-blue-600 focus-within:bg-white dark:focus-within:bg-slate-800 shadow-inner lg:max-w-4xl lg:mx-auto"
          >
            <button 
              type="button"
              onClick={toggleListening}
              className={cn(
                "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all shrink-0",
                isListening ? "bg-red-500 text-white animate-pulse" : "bg-white dark:bg-slate-700 text-slate-400 hover:text-blue-600 border border-slate-100 dark:border-slate-600 shadow-sm"
              )}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Koreys tilida gapiring yoki yozing..."
              className="flex-1 bg-transparent px-3 sm:px-6 py-2 sm:py-4 outline-none font-bold text-sm tracking-wide placeholder:text-slate-400 dark:text-white"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white px-4 sm:px-8 rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-xl shadow-blue-200 dark:shadow-none active:scale-95 flex items-center gap-2 group shrink-0"
            >
              <span className="hidden sm:inline font-black uppercase tracking-widest text-[10px]">Gapirish</span>
              <Send size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          {micError && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3"
             >
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest leading-relaxed">
                  {micError}
                </p>
                <div className="flex flex-wrap gap-2 ml-auto">
                   <button 
                     onClick={() => {
                        window.open(window.location.href, '_blank');
                     }}
                     className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-[8px] font-black uppercase hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-red-500/20"
                   >
                     <Zap size={12} /> Yangi oynada ochish
                   </button>
                   <button 
                     onClick={() => {
                        setMicError(null);
                        initSpeechRecognition();
                     }}
                     className="p-2 bg-white dark:bg-slate-800 rounded-xl text-red-500 hover:text-red-700 border border-red-100 dark:border-red-900/30"
                     title="Qayta urinish"
                   >
                     <RefreshCw size={14} />
                   </button>
                </div>
             </motion.div>
          )}
          {isListening && !micError && (
             <div className="mt-4 flex items-center justify-center gap-3">
                <div className="flex gap-1">
                   {[1,2,3,4,5].map(i => (
                     <motion.div 
                        key={i}
                        animate={{ height: [8, 20, 8] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        className="w-1 bg-red-500 rounded-full"
                     />
                   ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Ovozni tinglayapman ({micLang === 'ko-KR' ? 'KR' : 'UZ'})... {input && `"${input}"`}</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
