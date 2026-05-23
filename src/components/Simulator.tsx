import { motion } from 'motion/react';
import { Plane, Utensils, ShoppingBag, School, Users, MapPin, Search, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

interface Scenario {
  id: string;
  title: string;
  uz: string;
  icon: any;
  color: string;
  desc: string;
  dialog: { kr: string; uz: string; role: 'user' | 'ai' }[];
}

const scenarios: Scenario[] = [
  {
    id: 'airport',
    title: 'Incheon Airport',
    uz: 'Aeroportda',
    icon: Plane,
    color: 'bg-blue-500',
    desc: 'Passport nazorati va yuklarni olish.',
    dialog: [
      { role: 'ai', kr: '여권 좀 보여주시겠어요?', uz: 'Pasportingizni ko\'rsata olasizmi?' },
      { role: 'user', kr: '네, 여기 있습니다.', uz: 'Ha, mana marhamat.' },
      { role: 'ai', kr: '한국에 온 목적이 무엇입니까?', uz: 'Koreyaga kelishdan maqsad nima?' },
      { role: 'user', kr: '관광하러 왔습니다.', uz: 'Sayohat uchun keldim.' },
    ]
  },
  {
    id: 'restaurant',
    title: 'Korean Restaurant',
    uz: 'Restoranda',
    icon: Utensils,
    color: 'bg-orange-500',
    desc: 'Ovqat buyurtma qilish va to\'lov.',
    dialog: [
      { role: 'ai', kr: '주문하시겠어요?', uz: 'Buyurtma berasizmi?' },
      { role: 'user', kr: '비빔밥 하나랑 불고기 정식 주세요.', uz: 'Bitta bibimbap va bitta bulgogi seti bering.' },
      { role: 'ai', kr: '맵게 해드릴까요?', uz: 'Achchiq qilib beraymi?' },
      { role: 'user', kr: '아니요, 조금만 맵게 해주세요.', uz: 'Yo\'q, birozgina achchiq bo\'lsin.' },
    ]
  },
  {
    id: 'shopping',
    title: 'Myeongdong Shopping',
    uz: 'Kiyim do\'konida',
    icon: ShoppingBag,
    color: 'bg-pink-500',
    desc: 'Narx so\'rash va kiyim tanlash.',
    dialog: [
      { role: 'user', kr: '이거 얼마예요?', uz: 'Bu necha pul?' },
      { role: 'ai', kr: '오만 원입니다. 입어보실래요?', uz: '50 ming von. Kiyib ko\'rasizmi?' },
      { role: 'user', kr: '네, 조금 더 큰 사이즈 있어요?', uz: 'Ha, biroz kattaroq razmeri bormi?' },
    ]
  }
];

export default function Simulator() {
  const [active, setActive] = useState<Scenario | null>(null);

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
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-black uppercase tracking-wider">Simulyator</span>
          <h2 className="text-4xl font-black mt-4 tracking-tight dark:text-white">Kundalik Vaziyatlar</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Koreyadagi real hayotga tayyorlaning</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((s) => (
          <motion.button
            key={s.id}
            whileHover={{ y: -5 }}
            onClick={() => setActive(s)}
            className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-left transition-all shadow-sm hover:shadow-2xl"
          >
            <div className={cn("w-14 h-14 rounded-2xl mb-6 flex items-center justify-center text-white shadow-lg", s.color)}>
              <s.icon size={24} />
            </div>
            <h3 className="text-xl font-black dark:text-white mb-2">{s.title}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{s.uz}</p>
            <p className="text-sm font-bold text-slate-500 leading-relaxed">{s.desc}</p>
            
            <div className="mt-8 flex justify-end">
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                 <Search size={16} />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setActive(null)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[80vh] md:h-[600px]"
          >
            <div className={cn("w-full md:w-1/3 p-10 text-white flex flex-col justify-between", active.color)}>
               <div>
                  <active.icon size={48} className="mb-6" />
                  <h3 className="text-3xl font-black mb-2">{active.title}</h3>
                  <p className="text-white/80 font-bold uppercase tracking-widest text-xs">{active.uz}</p>
               </div>
               <p className="text-sm font-bold leading-relaxed opacity-90">{active.desc}</p>
            </div>
            <div className="flex-1 p-10 overflow-y-auto space-y-6">
               {active.dialog.map((line, idx) => (
                  <div key={idx} className={cn("flex flex-col", line.role === 'user' ? "items-end" : "items-start")}>
                     <button 
                        onClick={() => speak(line.kr)}
                        className={cn(
                        "p-6 rounded-[2rem] text-left transition-all active:scale-95 group max-w-[80%]",
                        line.role === 'ai' ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none" : "bg-blue-600 text-white rounded-tr-none"
                        )}
                     >
                        <p className="text-xl font-bold mb-2">{line.kr}</p>
                        <p className={cn("text-xs font-bold uppercase tracking-wide opacity-60", line.role === 'ai' ? "text-slate-500" : "text-white")}>{line.uz}</p>
                     </button>
                  </div>
               ))}
               <div className="pt-10 flex justify-center">
                  <button className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl">
                     AI Bilan praktika qilish <Sparkles size={18} />
                  </button>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
