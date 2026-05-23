import { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, SkipForward, Headphones, Subtitles } from 'lucide-react';
import { cn } from '../lib/utils';

interface Dialog {
  id: number;
  title: string;
  topic: string;
  lines: { role: 'A' | 'B'; kr: string; uz: string; audio: string }[];
}

const dialogs: Dialog[] = [
  {
    id: 1,
    title: "Tanishuv (Introduction)",
    topic: "Salomlashish va ism so'rash",
    lines: [
      { role: 'A', kr: "안녕하세요! (Annyeonghaseyo!)", uz: "Assalomu alaykum!", audio: "" },
      { role: 'B', kr: "안녕하세요! 만나서 반가워요. (Annyeonghaseyo! Mannaseo bangawoyo.)", uz: "Salom! Tanishganimdan xursandman.", audio: "" },
      { role: 'A', kr: "이름이 뭐예요? (Ireumi mwoyeyo?)", uz: "Ismingiz nima?", audio: "" },
      { role: 'B', kr: "제 이름은 김수진이에요. (Je ireumeun Kim Su-jin ieyo.)", uz: "Mening ismim Kim Su-jin.", audio: "" },
    ]
  },
  {
      id: 2,
      title: "Restoranda (At Restaurant)",
      topic: "Ovqat buyurtma qilish",
      lines: [
        { role: 'A', kr: "비빔밥 하나 주세요. (Bibimbap hana juseyo.)", uz: "Bitta bibimbap bering.", audio: "" },
        { role: 'B', kr: "네, 알겠습니다. 물도 드릴까요? (Ne, algetseumnida. Muldo deurilkkayo?)", uz: "Xo'p bo'ladi. Suv ham beraymi?", audio: "" },
        { role: 'A', kr: "네, 물도 주세요. (Ne, muldo juseyo.)", uz: "Ha, suv ham bering.", audio: "" },
      ]
    }
];

export default function Listening() {
  const [activeDialog, setActiveDialog] = useState<Dialog>(dialogs[0]);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isSlowMode, setIsSlowMode] = useState(false);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = isSlowMode ? 0.5 : 1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="py-6 space-y-12">
      <header className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-black uppercase tracking-wider">Tinglash Immersion</span>
          <h2 className="text-4xl font-black mt-4 tracking-tight dark:text-white">Dialoglar & Media</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Haqiqiy muloqot • Audio va Tarjima</p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={() => setIsSlowMode(!isSlowMode)}
            className={cn(
              "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
              isSlowMode ? "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
            )}
           >
              Sekin-rejim: {isSlowMode ? "ON" : "OFF"}
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Darslar</h3>
          {dialogs.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveDialog(d)}
              className={cn(
                "w-full p-6 rounded-3xl border text-left transition-all flex items-center gap-4",
                activeDialog.id === d.id 
                  ? "bg-white dark:bg-slate-900 border-purple-600 dark:border-purple-500 shadow-xl shadow-purple-500/10" 
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700"
              )}
            >
              <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                  activeDialog.id === d.id ? "bg-purple-600 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
              )}>
                 <Headphones size={20} />
              </div>
              <div>
                <h4 className="font-black text-slate-800 dark:text-white leading-tight">{d.title}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{d.topic}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-10 shadow-2xl shadow-purple-500/5 relative overflow-hidden flex-1">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                 <Headphones size={150} className="dark:text-white" />
              </div>

              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-2xl font-black tracking-tight dark:text-white">{activeDialog.title}</h3>
                 <button 
                  onClick={() => setShowSubtitles(!showSubtitles)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    showSubtitles ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                  )}
                 >
                    <Subtitles size={14} /> Subtitrlar: {showSubtitles ? "ON" : "OFF"}
                 </button>
              </div>

              <div className="space-y-8 relative z-10">
                 {activeDialog.lines.map((line, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: line.role === 'A' ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={cn(
                        "flex gap-4",
                        line.role === 'B' ? "flex-row-reverse" : ""
                      )}
                    >
                       <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shrink-0",
                          line.role === 'A' ? "bg-blue-600 shadow-lg shadow-blue-100 dark:shadow-blue-900/40" : "bg-purple-600 shadow-lg shadow-purple-100 dark:shadow-purple-900/40"
                       )}>
                          {line.role}
                       </div>
                       <div className="flex flex-col gap-2 max-w-[80%]">
                          <button 
                             onClick={() => speak(line.kr)}
                             className={cn(
                               "p-6 rounded-[2rem] text-left transition-all active:scale-95 group relative",
                               line.role === 'A' ? "bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-none" : "bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-tr-none"
                             )}
                          >
                             <p className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {line.kr}
                             </p>
                             {showSubtitles && (
                               <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide opacity-80 leading-relaxed">
                                  {line.uz}
                               </p>
                             )}
                             <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-white dark:bg-slate-700 p-2 rounded-full shadow-lg text-purple-600 dark:text-purple-400">
                                   <Play size={10} fill="currentColor" />
                                </div>
                             </div>
                          </button>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Headphones size={32} />
                 </div>
                 <div>
                    <h4 className="text-xl font-black mb-1">Butun darsni tinglang</h4>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Sekinlashtirilgan rejim bilan birga</p>
                 </div>
              </div>
              <button 
                onClick={() => speak(activeDialog.lines.map(l => l.kr).join('. '))}
                className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                  Hammasini eshitish <Play size={18} fill="currentColor" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
