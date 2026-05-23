import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, RefreshCw, Trophy, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface Question {
  q: string;
  options: string[];
  correct: number;
  type: 'alphabet' | 'numbers';
}

const questions: Question[] = [
  { q: "ㅏ harfi qanday o'qiladi?", options: ["A", "O", "U", "I"], correct: 0, type: 'alphabet' },
  { q: "ㄱ harfining nomi nima?", options: ["Nieun", "Giyeok", "Siot", "Rieul"], correct: 1, type: 'alphabet' },
  { q: "3 raqami koreys tilida (Sino) qanday?", options: ["Il", "I", "Sam", "Sa"], correct: 2, type: 'numbers' },
  { q: "하나 (Hana) qaysi raqam?", options: ["1", "5", "10", "2"], correct: 0, type: 'numbers' },
  { q: "ㄴ harfi qaysi tovushni beradi?", options: ["M", "N", "L", "G"], correct: 1, type: 'alphabet' },
];

export default function Quiz({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const handleAnswer = (idx: number) => {
    setSelected(idx);
    if (idx === questions[current].correct) {
      setScore(prev => prev + 1);
    }
    
    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(prev => prev + 1);
        setSelected(null);
      } else {
        setShowResult(true);
        if (score + (idx === questions[current].correct ? 1 : 0) >= questions.length / 2) {
          onComplete(); // Award XP if result is good
        }
      }
    }, 1000);
  };

  const restart = () => {
    setCurrent(0);
    setScore(0);
    setShowResult(false);
    setSelected(null);
  };

  if (showResult) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-yellow-400 rounded-[2.5rem] flex items-center justify-center text-white mb-8 shadow-2xl shadow-yellow-200 dark:shadow-yellow-900/40"
        >
          <Trophy size={60} />
        </motion.div>
        <h2 className="text-4xl font-black mb-4 dark:text-white uppercase tracking-tight">Natija: {score}/{questions.length}</h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs mb-10">
          {score === questions.length ? "Ajoyib! Siz professionalsiz!" : "Yana biroz mashq qiling."}
        </p>
        <button 
          onClick={restart}
          className="bg-blue-600 dark:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-blue-200 dark:shadow-blue-900/40 hover:scale-105 transition-all"
        >
          Qayta urinish <RefreshCw size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-2xl mx-auto">
      <header className="mb-12 flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">
            {current + 1}
          </div>
          <span className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Savol</span>
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={cn(
              "w-8 h-1.5 rounded-full transition-colors",
              i < current ? "bg-blue-600 dark:bg-blue-500" : i === current ? "bg-blue-400 dark:bg-blue-400 animate-pulse" : "bg-slate-100 dark:bg-slate-800"
            )} />
          ))}
        </div>
      </header>

      <motion.div 
        key={current}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-blue-500/5"
      >
        <div className="flex items-center gap-2 mb-6 text-yellow-500">
          <Zap size={14} fill="currentColor" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            {questions[current].type} testi
          </span>
        </div>
        
        <h3 className="text-3xl font-black mb-12 tracking-tight leading-tight dark:text-white uppercase">
          {questions[current].q}
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {questions[current].options.map((opt, idx) => (
            <button
              key={idx}
              disabled={selected !== null}
              onClick={() => handleAnswer(idx)}
              className={cn(
                "p-6 rounded-2xl border-2 font-bold text-left transition-all flex justify-between items-center",
                selected === null 
                  ? "border-slate-100 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 dark:text-slate-300" 
                  : idx === questions[current].correct 
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" 
                    : selected === idx 
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400" 
                      : "border-slate-100 dark:border-slate-800 opacity-50 dark:text-slate-500"
              )}
            >
              <span className="text-lg">{opt}</span>
              {selected !== null && idx === questions[current].correct && <CheckCircle2 className="text-emerald-500 dark:text-emerald-400" size={24} />}
              {selected === idx && idx !== questions[current].correct && <XCircle className="text-red-500 dark:text-red-400" size={24} />}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
