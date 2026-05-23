import { motion } from 'motion/react';
import { BookOpen, Star, Info } from 'lucide-react';
import { cn } from '../lib/utils';

const lessons = [
  {
    title: "Gap tuzilishi (SOV)",
    level: "Beginner",
    desc: "Koreys tilida gap tuzilishi: Ega + To'ldiruvchi + Kesim. Bu o'zbek tili bilan deyarli bir xil.",
    example: "나는 사과를 먹어요 (Naneun sagwareul meogeoyo).",
    uzb: "Men olma yeyapman.",
    details: "Koreys tilida fe'l doimo gap oxirida keladi. Bu o'zbek tilida gapiradiganlar uchun eng katta afzalliklardan biri!"
  },
  {
    title: "Ega va Mavzu qo'shimchalari",
    level: "Beginner",
    desc: "은/는 (Eun/Neun) - Mavzu uchun, 이/가 (I/Ga) - Ega uchun qo'llaniladi.",
    example: "사과는 맛있어요 (Sagwaneun masisseoyo).",
    uzb: "Olma (mavzu sifatida) mazali.",
    details: "Undosh bilan tugasa '-eun/-i', unli bilan tugasa '-neun/-ga' ishlatiladi. Bu koreys tilining fundamenti hisoblanadi."
  },
  {
    title: "O'rin-payt kelishigi (에 / 에서)",
    level: "Beginner",
    desc: "에 (E) - Joyga/Vaqtga, 에서 (Eseo) - Joyda (harakat bo'lgan joyda).",
    example: "학교에 가요. vs 집에서 공부해요.",
    uzb: "Maktabga boraman. vs Uyda o'qiyman.",
    details: "Harakat yo'nalishini bildirganda '에', harakat biror joy ichida sodir bo'lganda '에서' ishlatiladi."
  },
  {
    title: "Hozirgi zamon (-아요/어요)",
    level: "Beginner",
    desc: "Harakat hozirgi vaqtda sodir bo'layotganini bildiradi.",
    example: "먹다 + 어요 = 먹어요",
    uzb: "Yamoq (Fe'l asosi) + Hozirgi zamon qo'shimchasi.",
    details: "Fe'l o'zagining oxirgi unlisi 'ㅏ' yoki 'ㅗ' bo'lsa '-아요', boshqa hamma hollarda '-어요' qo'shiladi."
  }
];

export default function Grammar() {
  return (
    <div className="py-6 space-y-12">
      <header className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black uppercase tracking-wider">Grammar Master Tizimi</span>
          <h2 className="text-4xl font-black mt-4 tracking-tight dark:text-white uppercase">Qoidalar & Struktura</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Beginnerdan TOPIK 6 gacha bosqichma-bosqich</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {lessons.map((lesson, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between",
              idx === 0 ? "md:col-span-12 lg:col-span-12" : "md:col-span-6 lg:col-span-6",
              idx === 4 && "md:col-span-6 lg:col-span-12"
            )}
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <BookOpen size={120} className="dark:text-white" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 dark:shadow-emerald-900/40">
                  <BookOpen size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 italic">{lesson.level}</span>
              </div>

              <h3 className={cn(
                "text-2xl font-black mb-4 tracking-tight dark:text-white uppercase",
                idx === 1 && "bg-black text-white px-6 py-2 rounded-2xl w-fit -ml-2"
              )}>
                {lesson.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 font-bold text-sm leading-relaxed uppercase tracking-wide opacity-80">{lesson.desc}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-wider">
                    <Star size={12} fill="currentColor" /> Misol
                  </div>
                  <p className="font-black text-lg text-slate-800 dark:text-white leading-tight">{lesson.example}</p>
                </div>
                <div className="bg-emerald-600/5 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-wider">
                    Ma'nosi
                  </div>
                  <p className="font-black text-emerald-900 dark:text-emerald-100">{lesson.uzb}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <Info size={20} className="shrink-0 text-amber-500" />
                <p className="font-bold text-slate-500 dark:text-slate-400 text-xs leading-relaxed lowercase first-letter:uppercase">{lesson.details}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
