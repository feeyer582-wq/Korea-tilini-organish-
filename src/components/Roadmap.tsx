import { motion } from 'motion/react';
import { Calendar, Flag, CheckCircle2, Circle, Star, Trophy, GraduationCap, Map } from 'lucide-react';
import { cn } from '../lib/utils';

interface Milestone {
  id: number;
  month: string;
  title: string;
  goal: string;
  topics: string[];
  status: 'done' | 'current' | 'locked';
}

const milestones: Milestone[] = [
  { 
    id: 1, 
    month: "1-OY", 
    title: "Hangul Asoslari", 
    goal: "Alifboni to'liq yodlash va o'qish", 
    topics: ["Undoshlar", "Unlilar", "Bachim qoidalari"],
    status: 'current'
  },
  { 
    id: 2, 
    month: "2-OY", 
    title: "Kundalik Muloqot", 
    goal: "O'zini tanishtirish va oddiy gaplar", 
    topics: ["Salomlashish", "Raqamlar", "Ega qo'shimchalari"],
    status: 'locked'
  },
  { 
    id: 3, 
    month: "3-OY", 
    title: "Harakat va Vaqt", 
    goal: "Vaqtni aytish va harakatlar", 
    topics: ["Zamonlar (O'tgan, Hozirgi)", "Kun tartibi"],
    status: 'locked'
  },
  { 
    id: 4, 
    month: "6-OY", 
    title: "TOPIK I Tayyorgarlik", 
    goal: "1-2 daraja imtihoniga tayyor bo'lish", 
    topics: ["Murakkab grammatika", "Lug'at (1500+ so'z)"],
    status: 'locked'
  },
  { 
    id: 5, 
    month: "9-OY", 
    title: "O'rta Daraja (Intermediate)", 
    goal: "Uzun dialoglar va tushunish", 
    topics: ["Koreys madaniyati", "Seriallar tahlili"],
    status: 'locked'
  },
  { 
    id: 6, 
    month: "1-YIL", 
    title: "Professional (TOPIK II)", 
    goal: "Siyosiy va ijtimoiy mavzularda muloqot", 
    topics: ["Rasmiy nutq", "Esselar yozish"],
    status: 'locked'
  },
];

export default function Roadmap() {
  return (
    <div className="py-6 h-full">
      <header className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-8 mb-12">
        <div>
          <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-xs font-black uppercase tracking-wider">Muvaffaqiyat Yo'li</span>
          <h2 className="text-4xl font-black mt-4 tracking-tight dark:text-white">1 Yillik Reja</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Professional darajaga Qadam-baqadam</p>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-100 dark:shadow-amber-900/40">
            <Trophy size={20} />
          </div>
          <div className="text-left">
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Maqsad</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">TOPIK II (4-5 Daraja)</p>
          </div>
        </div>
      </header>

      <div className="relative pt-10 pb-20">
        {/* Line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-slate-200 dark:bg-slate-800 -translate-x-1/2 rounded-full" />

        <div className="space-y-20 relative z-10">
          {milestones.map((m, idx) => (
            <motion.div 
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "flex flex-col md:flex-row items-center gap-10",
                idx % 2 !== 0 ? "md:flex-row-reverse" : ""
              )}
            >
              {/* Content Card */}
              <div className="w-full md:w-1/2">
                <div className={cn(
                  "bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border shadow-sm transition-all relative overflow-hidden",
                  m.status === 'current' 
                    ? "border-blue-500 dark:border-blue-400 shadow-xl shadow-blue-500/10 dark:shadow-blue-500/20" 
                    : "border-slate-200 dark:border-slate-800 grayscale opacity-60",
                  m.status === 'done' ? "border-emerald-500 dark:border-emerald-400 opacity-100" : ""
                )}>
                  {m.status === 'current' && (
                    <div className="absolute top-0 right-0 p-6 opacity-5 animate-pulse dark:text-white">
                        <GraduationCap size={120} />
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-8">
                    <span className={cn(
                      "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      m.status === 'current' ? "bg-blue-600 dark:bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    )}>
                      {m.month}
                    </span>
                    {m.status === 'done' 
                      ? <CheckCircle2 className="text-emerald-500 dark:text-emerald-400" size={24} /> 
                      : m.status === 'current' 
                        ? <Star className="text-amber-500 fill-amber-500" size={24} /> 
                        : <Circle className="text-slate-300 dark:text-slate-700" size={24} />
                    }
                  </div>

                  <h3 className="text-3xl font-black mb-4 tracking-tight dark:text-white uppercase">{m.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed mb-8 uppercase tracking-wide">
                    {m.goal}
                  </p>

                  <div className="space-y-3">
                    {m.topics.map((t, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Node on the line */}
              <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-xl z-20 transition-colors">
                <div className={cn(
                  "w-8 h-8 rounded-full shadow-inner",
                  m.status === 'done' ? "bg-emerald-500" : m.status === 'current' ? "bg-blue-600 animate-ping" : "bg-slate-200 dark:bg-slate-800"
                )} />
                {m.status === 'current' && (
                  <div className="absolute inset-0 bg-blue-600 rounded-full flex items-center justify-center">
                    <Map size={24} className="text-white" />
                  </div>
                )}
              </div>

              {/* Spacer for other side */}
              <div className="hidden md:block md:w-1/2" />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-20 bg-blue-600 dark:bg-blue-800 rounded-[3rem] p-16 text-white text-center shadow-2xl shadow-blue-200 dark:shadow-blue-900/40 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <GraduationCap size={400} className="absolute -bottom-20 -right-20 rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col items-center">
           <Trophy size={80} className="mb-8 text-amber-300 dark:text-amber-400 drop-shadow-2xl" />
           <h3 className="text-4xl font-black mb-6 leading-tight max-w-2xl uppercase">Marra aniq: Professional Koreys tili mutaxassisi!</h3>
           <p className="text-blue-100 font-bold uppercase tracking-[0.2em] text-sm mb-12 opacity-80">Har kuni 30 daqiqa - Natija 1 yildan so'ng</p>
           <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 px-8 py-4 rounded-2xl flex flex-col items-center">
                 <span className="text-xs font-black text-blue-200 uppercase mb-1">Darslar</span>
                 <span className="text-2xl font-black">365+</span>
              </div>
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 px-8 py-4 rounded-2xl flex flex-col items-center">
                 <span className="text-xs font-black text-blue-200 uppercase mb-1">Lug'at</span>
                 <span className="text-2xl font-black">3000+</span>
              </div>
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 px-8 py-4 rounded-2xl flex flex-col items-center">
                 <span className="text-xs font-black text-blue-200 uppercase mb-1">Sertifikat</span>
                 <span className="text-2xl font-black">TOPIK II</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
