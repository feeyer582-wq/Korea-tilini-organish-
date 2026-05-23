import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, CheckCircle2, XCircle, Trophy, Sparkles, ChevronRight, Calculator } from 'lucide-react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

interface Question {
  id: number;
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

const topikQuestions: Question[] = [
  {
    id: 1,
    q: "다음 중 '사과'의 뜻은 무엇입니까?",
    options: ["Nok", "Olma", "Uzum", "Banan"],
    correct: 1,
    explanation: "'사va' koreys tilida 'olma' degan ma'noni anglatadi."
  },
  {
    id: 2,
    q: "저는 한국어를 ______.",
    options: ["공부해요", "먹어요", "자가요", "입어요"],
    correct: 0,
    explanation: "'공buhaeyo' - o'qiyman/o'rganaman."
  },
  {
    id: 3,
    q: "오늘 날씨가 어때요?",
    options: ["김밥이에요", "추워요", "한국이에요", "의자예요"],
    correct: 1,
    explanation: "'chuwoyo' - sovuq."
  }
];

export default function TopikMaster() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'result'>('idle');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [answers, setAnswers] = useState<number[]>([]);

  useEffect(() => {
    let timer: any;
    if (status === 'testing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setStatus('result');
    }
    return () => clearInterval(timer);
  }, [status, timeLeft]);

  const handleAnswer = (idx: number) => {
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    
    if (idx === topikQuestions[currentIdx].correct) {
      setScore(prev => prev + 1);
    }

    if (currentIdx < topikQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setStatus('result');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const reset = () => {
    setStatus('idle');
    setCurrentIdx(0);
    setScore(0);
    setTimeLeft(60);
    setAnswers([]);
  };

  return (
    <div className="py-6 space-y-12">
      <header className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-xs font-black uppercase tracking-wider">Exam Simulation</span>
          <h2 className="text-4xl font-black mt-4 tracking-tight dark:text-white">TOPIK Master</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Real vaqt va daraja analizatori</p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 1, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-16 text-center shadow-2xl"
          >
             <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-inner">
                <Calculator size={48} />
             </div>
             <h3 className="text-3xl font-black mb-4 dark:text-white">Imtihonga tayyormisiz?</h3>
             <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-bold text-sm leading-relaxed uppercase tracking-wide mb-12 opacity-80">
                USHBU TEST TOPIK DARANGIZNI TAXMINIY ANIQLAB BERADI. 60 SONIYA VAQTINGIZ BOR.
             </p>
             <button 
               onClick={() => setStatus('testing')}
               className="bg-amber-600 text-white px-12 py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 mx-auto hover:bg-amber-700 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-amber-200 dark:shadow-amber-900/40"
             >
                Testni boshlash <ChevronRight size={22} strokeWidth={4} />
             </button>
          </motion.div>
        )}

        {status === 'testing' && (
          <motion.div 
            key="testing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10"
          >
            <div className="flex justify-between items-center bg-slate-900 dark:bg-black p-8 rounded-[2rem] text-white shadow-2xl">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-amber-400">
                     <Timer size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Qolgan vaqt</p>
                     <p className="text-xl font-black">{timeLeft}s</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Savol</p>
                  <p className="text-xl font-black">{currentIdx + 1} / {topikQuestions.length}</p>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-12 shadow-2xl">
               <h3 className="text-4xl font-black mb-12 text-center dark:text-white leading-tight tracking-tight">
                  {topikQuestions[currentIdx].q}
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topikQuestions[currentIdx].options.map((opt, i) => (
                     <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        className="py-6 px-10 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-amber-600 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-xl font-bold transition-all text-left dark:text-slate-200"
                     >
                        {opt}
                     </button>
                  ))}
               </div>
            </div>
          </motion.div>
        )}

        {status === 'result' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-200 dark:border-slate-800 p-16 text-center shadow-2xl overflow-hidden relative"
          >
             <div className="absolute top-0 inset-x-0 h-2 bg-slate-100 dark:bg-slate-800">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(score / topikQuestions.length) * 100}%` }}
                  className="h-full bg-amber-600"
                />
             </div>
             
             <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-inner">
                <Trophy size={48} />
             </div>
             
             <h3 className="text-5xl font-black mb-4 dark:text-white tracking-tight">Natija: {score} / {topikQuestions.length}</h3>
             <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-[0.2em] mb-12">
                TOPIK TAXMINIY DARAJA: <span className="text-amber-600">{score === topikQuestions.length ? "TOPIK I (Master)" : "BEGINNER"}</span>
             </p>

             <div className="space-y-4 mb-16 text-left max-w-2xl mx-auto">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6">Tahlil:</h4>
                {topikQuestions.map((q, i) => (
                   <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl flex gap-6">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                        answers[i] === q.correct ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                      )}>
                         {answers[i] === q.correct ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                      </div>
                      <div>
                         <p className="font-bold mb-1 dark:text-white">{q.q}</p>
                         <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">{q.explanation}</p>
                      </div>
                   </div>
                ))}
             </div>

             <button 
               onClick={reset}
               className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-12 py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 mx-auto hover:bg-black transition-all shadow-2xl"
             >
                Qayta urinish <Sparkles size={18} />
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
