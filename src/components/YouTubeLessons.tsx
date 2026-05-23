import { motion } from 'motion/react';
import { Youtube, ExternalLink, Play } from 'lucide-react';
import { cn } from '../lib/utils';

const videos = [
  {
    id: "rCH3e_X3r5A",
    title: "1-Dars: Alifbo (Hangul) asoslari",
    channel: "Koreys tili darslari",
    desc: "Koreys tili alifbosini 0 dan o'rganishni boshlang."
  },
  {
    id: "yW9tV7L8p1U",
    title: "2-Dars: Oson Grammatika",
    channel: "Master Korean",
    desc: "Boshlang'ich darajadagi eng muhim qo'shimchalar."
  },
  {
    id: "vXhL9XzP0zU",
    title: "3-Dars: Raqamlar va Pul",
    channel: "Korean with Shohjahon",
    desc: "Sino va Native raqamlarni birgalikda o'rganamiz."
  },
  {
    id: "J3HnU8X0lzo",
    title: "4-Dars: Kundalik muloqot",
    channel: "Uzbek in Korea",
    desc: "Do'konda va ko'chada kerak bo'ladigan iboralar."
  }
];

export default function YouTubeLessons() {
  return (
    <div className="py-6 space-y-12">
      <header className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <span className="px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-black uppercase tracking-wider">Smart Media</span>
          <h2 className="text-4xl font-black mt-4 tracking-tight dark:text-white">YouTube Kurslar</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Eng yaxshi o'zbekcha kontentlar saralangan</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {videos.map((video, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col",
              idx % 3 === 0 ? "md:col-span-12 lg:col-span-8" : "md:col-span-12 lg:col-span-4"
            )}
          >
            <div className="aspect-video relative overflow-hidden bg-slate-900">
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${video.id}`} 
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </div>
            
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-red-600 text-white p-1 rounded-lg">
                    <Youtube size={14} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase">{video.channel}</span>
                </div>
                <h3 className="text-2xl font-black mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight dark:text-white">{video.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed font-bold uppercase tracking-wide opacity-80">{video.desc}</p>
              </div>
              
              <div className="flex justify-between items-center">
                 <a 
                   href={`https://www.youtube.com/watch?v=${video.id}`}
                   target="_blank"
                   rel="noreferrer"
                   className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest hover:underline"
                 >
                   YouTube-da ko'rish <ExternalLink size={14} />
                 </a>
                 <button className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                    AI Eslatma
                 </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 bg-slate-900 dark:bg-black rounded-[2.5rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Youtube size={300} />
        </div>
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-4 tracking-tight uppercase">Yana ko'proq darslar...</h3>
          <p className="text-slate-400 max-w-md font-bold text-sm leading-relaxed uppercase tracking-wide">
            YOUTUBE-DA "KOREYS TILI O'ZBEK TILIDA" DEB QIDIRIB, YUZLAB YANGI DARSLARNI TOPING.
          </p>
        </div>
        <a 
          href="https://www.youtube.com/results?search_query=koreys+tili+o'zbek+tilida"
          target="_blank"
          rel="noreferrer"
          className="relative z-10 bg-red-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-red-900/40 hover:scale-105 active:scale-95 transition-all outline-none"
        >
          YouTube-da ochish <Youtube size={22} />
        </a>
      </div>
    </div>
  );
}
