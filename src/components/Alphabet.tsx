import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Eraser, Pen, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

interface Char {
  char: string;
  name: string;
  pron: string;
  uzb: string;
  strokes?: string;
}

const consonants: Char[] = [
  { char: 'ㄱ', name: 'Giyeok', pron: 'g/k', uzb: 'G/K', strokes: "1. Yuqoridan o'ngga va pastga." },
  { char: 'ㄴ', name: 'Nieun', pron: 'n', uzb: 'N', strokes: "1. Pastga va o'ngga." },
  { char: 'ㄷ', name: 'Digeut', pron: 'd/t', uzb: 'D/T', strokes: "1. Yuqoridan o'ngga. 2. Pastga va o'ngga." },
  { char: 'ㄹ', name: 'Rieul', pron: 'r/l', uzb: 'R/L', strokes: "1. Yuqoridan o'ngga va pastga. 2. Chapdan o'ngga. 3. Pastga va o'ngga." },
  { char: 'ㅁ', name: 'Mieum', pron: 'm', uzb: 'M', strokes: "1. Pastga. 2. Yuqoridan o'ngga va pastga. 3. Chapdan o'ngga (pastki)." },
  { char: 'ㅂ', name: 'Bieup', pron: 'b/p', uzb: 'B/P', strokes: "1. Pastga (chap). 2. Pastga (o'ng). 3. O'rtadan o'ngga. 4. Pastdan o'ngga." },
  { char: 'ㅅ', name: 'Siot', pron: 's', uzb: 'S', strokes: "1. Yuqoridan chapga (diagonal). 2. O'rtadan o'ngga (diagonal)." },
  { char: 'ㅇ', name: 'Ieung', pron: 'ng', uzb: 'ng / ovozsiz', strokes: "1. Soat strelkasiga teskari aylana." },
  { char: 'ㅈ', name: 'Jieut', pron: 'j', uzb: 'J', strokes: "1. Yuqoridan o'ngga. 2. Pastga chapga. 3. Pastga o'ngga." },
  { char: 'ㅊ', name: 'Chieut', pron: 'ch', uzb: 'Ch', strokes: "1. Tepadan kichik chiziq. 2. Gorizontal. 3. J shakli ostidan." },
  { char: 'ㅋ', name: 'Kieuk', pron: 'k', uzb: 'K (puhlangan)', strokes: "1. ㄱ shakli. 2. O'rtadan gorizontal chiziq." },
  { char: 'ㅌ', name: 'Tieut', pron: 't', uzb: 'T (puhlangan)', strokes: "1. Teppa chiziq. 2. O'rta chiziq. 3. L shakli ostidan." },
  { char: 'ㅍ', name: 'Pieup', pron: 'p', uzb: 'P (puhlangan)', strokes: "1. Tepada gorizontal. 2. Chapda vertikal. 3. O'ngda vertikal. 4. Pastda gorizontal." },
  { char: 'ㅎ', name: 'Hieut', pron: 'h', uzb: 'H', strokes: "1. Tepadan chiziqcha. 2. Gorizontal chiziq. 3. Aylana." },
];

const doubleConsonants: Char[] = [
  { char: 'ㄲ', name: 'Ssang-giyeok', pron: 'kk', uzb: 'KK', strokes: "1. Ikkita ㄱ yonma-yon." },
  { char: 'ㄸ', name: 'Ssang-digeut', pron: 'tt', uzb: 'TT', strokes: "1. Ikkita ㄷ yonma-yon." },
  { char: 'ㅃ', name: 'Ssang-bieup', pron: 'pp', uzb: 'PP', strokes: "1. Ikkita ㅂ yonma-yon." },
  { char: 'ㅆ', name: 'Ssang-siot', pron: 'ss', uzb: 'SS', strokes: "1. Ikkita ㅅ yonma-yon." },
  { char: 'ㅉ', name: 'Ssang-jieut', pron: 'jj', uzb: 'JJ', strokes: "1. Ikkita ㅈ yonma-yon." },
];

const vowels: Char[] = [
  { char: 'ㅏ', name: 'a', pron: 'a', uzb: 'A' },
  { char: 'ㅑ', name: 'ya', pron: 'ya', uzb: 'Ya' },
  { char: 'ㅓ', name: 'eo', pron: 'o', uzb: 'O' },
  { char: 'ㅕ', name: 'yeo', pron: 'yo', uzb: 'Yo' },
  { char: 'ㅗ', name: 'o', pron: 'o', uzb: 'O' },
  { char: 'ㅛ', name: 'yo', pron: 'yo', uzb: 'Yo' },
  { char: 'ㅜ', name: 'u', pron: 'u', uzb: 'U' },
  { char: 'ㅠ', name: 'yu', pron: 'yu', uzb: 'Yu' },
  { char: 'ㅡ', name: 'eu', pron: 'i', uzb: 'I (qisqa)' },
  { char: 'ㅣ', name: 'i', pron: 'i', uzb: 'I' },
];

export default function Alphabet() {
  const [selectedChar, setSelectedChar] = useState<Char | null>(null);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="py-6 space-y-12">
      <header className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-black uppercase tracking-wider">Dars 0: Hangul</span>
          <h2 className="text-4xl font-black mt-4 tracking-tight dark:text-white">Hangul Alifbosi</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Koreys tili asoslari • Tinglash va Yozishni o'rganing</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          <section>
            <h3 className="text-lg font-bold mb-8 flex items-center gap-3 dark:text-white">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
                자
              </div>
              Undoshlar (Consonants)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {consonants.map((c) => (
                <CharCard 
                  key={c.char} 
                  item={c} 
                  active={selectedChar?.char === c.char}
                  onSelect={() => { setSelectedChar(c); speak(c.char); }} 
                />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-8 flex items-center gap-3 dark:text-white">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
                쌍
              </div>
              Qo'sh Undoshlar (Double)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {doubleConsonants.map((c) => (
                <CharCard 
                  key={c.char} 
                  item={c} 
                  active={selectedChar?.char === c.char}
                  onSelect={() => { setSelectedChar(c); speak(c.char); }} 
                />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-8 flex items-center gap-3 dark:text-white">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-200 dark:shadow-orange-900/40">
                모
              </div>
              Unlilar (Vowels)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {vowels.map((v) => (
                <CharCard 
                  key={v.char} 
                  item={v} 
                  active={selectedChar?.char === v.char}
                  onSelect={() => { setSelectedChar(v); speak(v.char); }} 
                />
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 lg:sticky lg:top-10 h-fit">
          <AnimatePresence mode="wait">
            {selectedChar ? (
              <motion.div
                key={selectedChar.char}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 shadow-2xl shadow-blue-500/5 flex flex-col items-center"
              >
                <div className="w-full flex justify-between items-center mb-6">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{selectedChar.name}</p>
                   <button onClick={() => speak(selectedChar.char)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg">
                      <Volume2 size={24} />
                   </button>
                </div>

                <div className="text-[120px] font-black text-slate-900 dark:text-white leading-none mb-4 relative group">
                   <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-full scale-150 -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                   {selectedChar.char}
                </div>
                
                <h4 className="text-2xl font-black mb-4 dark:text-white">{selectedChar.uzb} <span className="text-blue-500">[{selectedChar.pron}]</span></h4>
                
                {selectedChar.strokes && (
                   <div className="w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-6 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Yozish Tartibi:</p>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{selectedChar.strokes}</p>
                   </div>
                )}

                <PracticeCanvas char={selectedChar.char} />
              </motion.div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6">
                  <Pen size={40} />
                </div>
                <h4 className="text-xl font-bold text-slate-400 dark:text-slate-500">Yozishni mashq qiling</h4>
                <p className="text-slate-400 dark:text-slate-600 text-sm mt-2">Buning uchun istalgan harfni tanlang</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function CharCard({ item, active, onSelect }: { item: Char, active: boolean, onSelect: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      className={cn(
        "bg-white dark:bg-slate-900 p-6 rounded-3xl border transition-all text-center group relative overflow-hidden",
        active 
          ? "border-blue-600 shadow-xl shadow-blue-500/10 dark:border-blue-500 dark:shadow-blue-500/20" 
          : "border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700"
      )}
    >
      <div className="flex flex-col items-center relative z-10">
        <span className={cn(
            "text-4xl font-black mb-3 transition-colors leading-none",
            active ? "text-blue-600 dark:text-blue-400" : "text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors"
        )}>
            {item.char}
        </span>
        <div className="space-y-1">
          <p className="text-sm font-black text-slate-500 dark:text-slate-400">{item.uzb}</p>
        </div>
      </div>
      {active && <div className="absolute top-0 right-0 p-2"><CheckCircle2 size={12} className="text-blue-600 dark:text-blue-400" /></div>}
    </motion.button>
  );
}

function PracticeCanvas({ char }: { char: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 12;
    ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#60a5fa' : '#2563eb';
    
    // Clear on char change
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }, [char]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setHasDrawn(true);
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const complete = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#2563eb', '#60a5fa']
    });
    setTimeout(clear, 1000);
  };

  return (
    <div className="w-full flex flex-col items-center">
       <div className="relative w-full aspect-square bg-slate-50 dark:bg-slate-950 rounded-3xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden group touch-none">
          <div className="absolute inset-0 flex items-center justify-center text-[180px] font-black text-slate-200 dark:text-slate-800 pointer-events-none opacity-50 dark:opacity-30">
             {char}
          </div>
          <canvas 
            ref={canvasRef}
            width={300}
            height={300}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
            className="w-full h-full cursor-crosshair relative z-10"
          />
       </div>

       <div className="flex gap-4 mt-6 w-full">
          <button 
            onClick={clear}
            className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all"
          >
            <Eraser size={14} /> Tozalash
          </button>
          <button 
            onClick={complete}
            disabled={!hasDrawn}
            className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-30 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-100 dark:shadow-blue-900/40"
          >
            <Sparkles size={14} /> Zo'r!
          </button>
       </div>
       <p className="mt-4 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest text-center">Sichqoncha yoki barmoq bilan chizib mashq qiling</p>
    </div>
  );
}
