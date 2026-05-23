import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, ChevronLeft, ChevronRight, Volume2, Sparkles, Check, Search, List, Grid3X3 as GridIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface Word {
  kr: string;
  uz: string;
  pron: string;
  ex: string;
  img: string;
  category: string;
}

const words: Word[] = [
  // Meva va Sabzavotlar
  { kr: "사과", uz: "Olma", pron: "Sagwa", ex: "Sagwareul meogeoyo. (Olma yeyapman)", img: "🍎", category: "Mevalar" },
  { kr: "우유", uz: "Sut", pron: "Uyu", ex: "Uyureul masyeoyo. (Sut ichyapman)", img: "🥛", category: "Ichimliklar" },
  { kr: "물", uz: "Suv", pron: "Mul", ex: "Mul juseyo. (Suv bering)", img: "💧", category: "Ichimliklar" },
  { kr: "선생님", uz: "O'qituvchi", pron: "Seonsaengnim", ex: "Annyeonghaseyo, seonsaengnim.", img: "👨‍🏫", category: "Odamlar" },
  { kr: "학생", uz: "O'quvchi", pron: "Haksaeng", ex: "Naeneun haksaeng ieyo.", img: "🎒", category: "Odamlar" },
  { kr: "책", uz: "Kitob", pron: "Chaek", ex: "Chaek ilgoyo.", img: "📖", category: "O'quv" },
  { kr: "친구", uz: "Do'st", pron: "Chingu", ex: "Chingureul mannayo.", img: "🤝", category: "Odamlar" },
  { kr: "밥", uz: "Ovqat/Guruch", pron: "Bap", ex: "Bap meogeosseoyo?", img: "🍚", category: "Ovqat" },
  { kr: "김치", uz: "Kimchi", pron: "Kimchi", ex: "Kimchi masisseoyo.", img: "🥬", category: "Ovqat" },
  { kr: "학교", uz: "Maktab", pron: "Hakgyo", ex: "Hakgyoe gayo.", img: "🏫", category: "Joylar" },
  { kr: "집", uz: "Uy", pron: "Jip", ex: "Jibe gayo.", img: "🏠", category: "Joylar" },
  { kr: "병원", uz: "Shifoxona", pron: "Byeongwon", ex: "Byeongwone gayo.", img: "🏥", category: "Joylar" },
  { kr: "고양이", uz: "Mushuk", pron: "Goyangi", ex: "Goyangi kwiyeowoyo.", img: "🐱", category: "Hayvonlar" },
  { kr: "강아지", uz: "Kuchukcha", pron: "Gangaji", ex: "Gangaji jireunayo?", img: "🐶", category: "Hayvonlar" },
  { kr: "여동생", uz: "Singil", pron: "Yeodongsaeng", ex: "Yeodongsaeng isseoyo.", img: "👧", category: "Oila" },
  { kr: "남동생", uz: "Uka", pron: "Namdongsaeng", ex: "Namdongsaeng isseoyo.", img: "👦", category: "Oila" },
];

export default function Vocabulary() {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isListView, setIsListView] = useState(false);
  const [search, setSearch] = useState('');

  const categories = ['All', ...new Set(words.map(w => w.category))];
  
  const filteredWords = words.filter(w => {
    const matchesCat = activeCategory === 'All' || w.category === activeCategory;
    const matchesSearch = w.kr.includes(search) || 
                          w.uz.toLowerCase().includes(search.toLowerCase()) || 
                          w.pron.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  useEffect(() => {
    setCurrent(0);
    setFlipped(false);
  }, [activeCategory, search]);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    window.speechSynthesis.speak(utterance);
  };

  const next = () => {
    if (filteredWords.length === 0) return;
    setFlipped(false);
    setCurrent((prev) => (prev + 1) % filteredWords.length);
  };

  const prev = () => {
    if (filteredWords.length === 0) return;
    setFlipped(false);
    setCurrent((prev) => (prev - 1 + filteredWords.length) % filteredWords.length);
  };

  const toggleMastered = (kr: string) => {
    // Using kr as unique ID for mastered list
    const wordIdx = words.findIndex(w => w.kr === kr);
    if (mastered.includes(wordIdx)) {
      setMastered(mastered.filter((i) => i !== wordIdx));
    } else {
      setMastered([...mastered, wordIdx]);
    }
  };

  return (
    <div className="py-6 max-w-5xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-slate-200 dark:border-slate-800 pb-12">
        <div className="flex-1">
          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-wider">So'z Boyligi</span>
          <h2 className="text-4xl font-black mt-4 tracking-tight dark:text-white uppercase leading-none">Vocabulary Empire</h2>
          <div className="flex items-center gap-2 mt-4">
             <div className="text-sm font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg uppercase tracking-widest">{mastered.length}/{words.length} O'ZLASHTIRILDI</div>
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-4">
           <div className="relative w-full sm:w-64 group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Izlash..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 font-bold text-xs outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
              />
           </div>
           <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setIsListView(false)}
                className={cn(
                  "px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                  !isListView ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-400"
                )}
              >
                <GridIcon size={14} /> Kartalar
              </button>
              <button 
                onClick={() => setIsListView(true)}
                className={cn(
                  "px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                  isListView ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-400"
                )}
              >
                <List size={14} /> Ro'yxat
              </button>
           </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 mb-12">
         {categories.map(cat => (
           <button 
             key={cat}
             onClick={() => setActiveCategory(cat)}
             className={cn(
               "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
               activeCategory === cat 
                ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20" 
                : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:border-blue-300"
             )}
           >
              {cat}
           </button>
         ))}
      </div>

      {!isListView ? (
        <div className="space-y-12">
          {filteredWords.length > 0 ? (
            <div className="relative h-[480px] w-full max-w-md mx-auto perspective-1000">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeCategory}-${current}-${search}`}
                  initial={{ opacity: 0, scale: 0.9, rotateY: flipped ? 180 : 0 }}
                  animate={{ opacity: 1, scale: 1, rotateY: flipped ? 180 : 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                  onClick={() => setFlipped(!flipped)}
                  className="w-full h-full relative cursor-pointer transform-style-3d bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-center p-12 text-center"
                >
                  {/* Front Side */}
                  <div className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center backface-hidden p-12",
                    flipped && "hidden"
                  )}>
                    <span className="text-8xl mb-8 block">{filteredWords[current].img}</span>
                    <h3 className="text-6xl font-black text-slate-800 dark:text-white mb-4 leading-tight">{filteredWords[current].kr}</h3>
                    <p className="text-base font-black text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-6 py-2 rounded-full uppercase tracking-widest">[{filteredWords[current].pron}]</p>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); speak(filteredWords[current].kr); }}
                      className="mt-10 w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-inner active:scale-90"
                    >
                      <Volume2 size={32} />
                    </button>
                  </div>

                  {/* Back Side */}
                  <div className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center backface-hidden p-12 bg-blue-600 dark:bg-blue-700 text-white rounded-[3rem] rotate-y-180",
                    !flipped && "hidden"
                  )}>
                    <h3 className="text-5xl font-black mb-6 uppercase tracking-tight">{filteredWords[current].uz}</h3>
                    <div className="w-full bg-white/20 h-px mb-8" />
                    <p className="text-xl font-bold italic opacity-90 mb-2 uppercase text-[10px] tracking-widest">Misol:</p>
                    <p className="text-2xl font-black leading-relaxed">{filteredWords[current].ex}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="absolute top-1/2 -left-24 -translate-y-1/2 hidden md:block">
                <button 
                  onClick={(e) => { e.stopPropagation(); prev(); }} 
                  className="p-5 bg-white dark:bg-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                >
                  <ChevronLeft size={32} strokeWidth={3} />
                </button>
              </div>
              <div className="absolute top-1/2 -right-24 -translate-y-1/2 hidden md:block">
                <button 
                  onClick={(e) => { e.stopPropagation(); next(); }} 
                  className="p-5 bg-white dark:bg-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                >
                  <ChevronRight size={32} strokeWidth={3} />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
               <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Hech narsa topilmadi</p>
            </div>
          )}

          <div className="max-w-md mx-auto mt-12 flex flex-col gap-6">
            {filteredWords.length > 0 && (
              <div className="flex gap-4 justify-center md:hidden">
                <button onClick={prev} className="p-4 bg-white dark:bg-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg flex-1 flex justify-center">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={next} className="p-4 bg-white dark:bg-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg flex-1 flex justify-center">
                  <ChevronRight size={24} />
                </button>
              </div>
            )}

            {filteredWords.length > 0 && (
              <button 
                onClick={() => toggleMastered(filteredWords[current].kr)}
                className={cn(
                  "w-full py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl",
                  mastered.includes(words.findIndex(w => w.kr === filteredWords[current].kr)) 
                    ? "bg-emerald-500 text-white shadow-emerald-200 dark:shadow-none border border-emerald-400" 
                    : "bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 hover:border-emerald-500 group"
                )}
              >
                {mastered.includes(words.findIndex(w => w.kr === filteredWords[current].kr)) ? <Check size={20} strokeWidth={4} /> : <Sparkles size={20} className="group-hover:text-emerald-500" />}
                {mastered.includes(words.findIndex(w => w.kr === filteredWords[current].kr)) ? "O'zlashtirildi" : "Yodladim deb belgilash"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredWords.map((word) => {
             const isMastered = mastered.includes(words.findIndex(w => w.kr === word.kr));
             return (
               <div 
                 key={word.kr}
                 className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all"
               >
                  <div className="flex justify-between items-start mb-4">
                     <span className="text-3xl">{word.img}</span>
                     <button 
                        onClick={() => toggleMastered(word.kr)}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                          isMastered ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                        )}
                     >
                        <Check size={16} strokeWidth={isMastered ? 4 : 2} />
                     </button>
                  </div>
                  <div>
                     <h4 className="text-xl font-black dark:text-white mb-1 uppercase tracking-tight">{word.kr}</h4>
                     <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">[{word.pron}]</p>
                     <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">{word.uz}</p>
                  </div>
                  <button 
                    onClick={() => speak(word.kr)}
                    className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Volume2 size={14} /> Eshitish
                  </button>
               </div>
             );
           })}
        </div>
      )}
    </div>
  );
}
