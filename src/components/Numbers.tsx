import { motion } from 'motion/react';
import { Volume2, Hash } from 'lucide-react';

interface Num {
  num: number;
  sino: string;
  native: string;
  pronSino: string;
  pronNative: string;
}

const numbers: Num[] = [
  { num: 1, sino: '일', native: '하나', pronSino: 'il', pronNative: 'hana' },
  { num: 2, sino: '이', native: '둘', pronSino: 'i', pronNative: 'dul' },
  { num: 3, sino: '삼', native: '셋', pronSino: 'sam', pronNative: 'set' },
  { num: 4, sino: '사', native: '넷', pronSino: 'sa', pronNative: 'net' },
  { num: 5, sino: '오', native: '다섯', pronSino: 'o', pronNative: 'daseot' },
  { num: 6, sino: '육', native: '여섯', pronSino: 'yuk', pronNative: 'yeoseot' },
  { num: 7, sino: '칠', native: '일곱', pronSino: 'chil', pronNative: 'ilgop' },
  { num: 8, sino: '팔', native: '여덟', pronSino: 'pal', pronNative: 'yeodeol' },
  { num: 9, sino: '구', native: '아홉', pronSino: 'gu', pronNative: 'ahop' },
  { num: 10, sino: '십', native: '열', pronSino: 'sip', pronNative: 'yeol' },
];

export default function Numbers() {
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
          <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-xs font-black uppercase tracking-wider">Dars 1: Sana</span>
          <h2 className="text-4xl font-black mt-4 tracking-tight dark:text-white">Raqamlar (Numbers)</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Sino vs Native • Ikki xil tizim</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-100 dark:shadow-blue-900/40">
               <Hash size={24} />
            </div>
            <h3 className="text-2xl font-black mb-4 dark:text-white">Sino-Koreys</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed mb-8">
              PUL, TELEFON, SANA, DAQIQA VA MANZILLAR UCHUN.
            </p>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 py-2 px-4 rounded-full inline-block w-fit">
            Xitoycha kelib chiqish
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-black p-10 rounded-[2.5rem] border border-slate-800 dark:border-slate-900 shadow-2xl flex flex-col justify-between text-white">
          <div>
            <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-orange-900/40">
               <Hash size={24} />
            </div>
            <h3 className="text-2xl font-black mb-4 uppercase">Native Koreys</h3>
            <p className="text-slate-400 font-bold text-sm leading-relaxed mb-8 uppercase">
              YOSH, SOAT VA BUYUMLARNI SANASH UCHUN.
            </p>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 dark:text-orange-500 bg-orange-950/50 py-2 px-4 rounded-full inline-block w-fit">
            Sof koreyscha
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numbers.map((n) => (
          <motion.div 
            key={n.num}
            whileHover={{ scale: 1.01 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-6 group hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm"
          >
            <div className="text-5xl font-black text-slate-100 dark:text-slate-800 group-hover:text-blue-50 dark:group-hover:text-blue-900/30 transition-colors w-16 text-center">
              {n.num}
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-6">
              <button 
                onClick={() => speak(n.sino)}
                className="flex flex-col items-start p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all group/sino"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black dark:text-white group-hover/sino:text-white">{n.sino}</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 dark:text-slate-400 group-hover/sino:opacity-100 group-hover/sino:text-white">{n.pronSino}</span>
              </button>

              <button 
                onClick={() => speak(n.native)}
                className="flex flex-col items-start p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-orange-600 dark:hover:bg-orange-500 hover:text-white transition-all group/native"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black dark:text-white group-hover/native:text-white">{n.native}</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 dark:text-slate-400 group-hover/native:opacity-100 group-hover/native:text-white">{n.pronNative}</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
