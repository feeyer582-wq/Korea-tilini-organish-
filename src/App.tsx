import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { 
  BookOpen, 
  MessageCircle, 
  Youtube, 
  Grid3X3, 
  Hash, 
  Search, 
  GraduationCap,
  Sparkles,
  ChevronRight,
  Volume2,
  Zap,
  Map,
  Layers,
  Star,
  Trophy,
  Headphones,
  Mic,
  Sun,
  Moon,
  MapPin,
  TrendingUp,
  Play
} from 'lucide-react';
import { cn } from './lib/utils';
import Alphabet from './components/Alphabet';
import Numbers from './components/Numbers';
import Grammar from './components/Grammar';
import YouTubeLessons from './components/YouTubeLessons';
import AITutor from './components/AITutor';
import Quiz from './components/Quiz';
import Vocabulary from './components/Vocabulary';
import Roadmap from './components/Roadmap';
import SearchAI from './components/SearchAI';

import Listening from './components/Listening';
import Speaking from './components/Speaking';
import Simulator from './components/Simulator';
import TopikMaster from './components/TopikMaster';
import { getApiKey, setApiKey, hasApiKey } from './lib/geminiClient';

type Tab = 'home' | 'alphabet' | 'numbers' | 'grammar' | 'youtube' | 'tutor' | 'quiz' | 'vocabulary' | 'roadmap' | 'listening' | 'speaking' | 'simulator' | 'topik' | 'search_ai';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [xp, setXp] = useState(() => Number(localStorage.getItem('k_master_xp')) || 0);
  const [level, setLevel] = useState(() => Math.floor(xp / 100) + 1);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('k_master_theme') === 'dark');
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('k_master_streak')) || 1);
  
  useEffect(() => {
    // Basic streak logic: if opened, increment or keep (simple version for now)
    const lastVisit = localStorage.getItem('k_master_last_visit');
    const today = new Date().toDateString();
    if (lastVisit && lastVisit !== today) {
      setStreak(prev => prev + 1);
      localStorage.setItem('k_master_streak', (streak + 1).toString());
    }
    localStorage.setItem('k_master_last_visit', today);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('k_master_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('k_master_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('k_master_xp', xp.toString());
    const newLevel = Math.floor(xp / 100) + 1;
    if (newLevel > level) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#fbbf24', '#10b981']
      });
      setLevel(newLevel);
    }
  }, [xp, level]);

  const addXp = (amount: number) => {
    setXp(prev => prev + amount);
  };

  const tabs = [
    { id: 'home', name: 'Home', icon: GraduationCap },
    { id: 'roadmap', name: 'Roadmap', icon: Map },
    { id: 'search_ai', name: 'Search AI', icon: Search },
    { id: 'alphabet', name: 'Alphabet', icon: Grid3X3 },
    { id: 'numbers', name: 'Numbers', icon: Hash },
    { id: 'vocabulary', name: 'Words', icon: Layers },
    { id: 'listening', name: 'Listen', icon: Headphones },
    { id: 'speaking', name: 'Speak', icon: Mic },
    { id: 'simulator', name: 'Simulator', icon: MapPin },
    { id: 'quiz', name: 'Test', icon: Zap },
    { id: 'topik', name: 'TOPIK', icon: Trophy },
    { id: 'grammar', name: 'Rules', icon: BookOpen },
    { id: 'youtube', name: 'Videos', icon: Youtube },
    { id: 'tutor', name: 'AI Tutor', icon: MessageCircle },
  ];

  const levelProgress = xp % 100;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:hidden flex justify-around p-3 shadow-lg overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all min-w-[60px]",
              activeTab === tab.id ? "text-blue-600 scale-110" : "text-slate-400"
            )}
            id={`nav-mobile-${tab.id}`}
          >
            <tab.icon size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.name}</span>
          </button>
        ))}
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col p-6 z-50 shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
              K
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight dark:text-white">K-Master</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Koreys Tili Pro</p>
            </div>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 transition-colors"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        
        <div className="space-y-1 overflow-y-auto pr-2 pb-6 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-left uppercase tracking-wide group",
                activeTab === tab.id 
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800" 
                  : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
              )}
              id={`nav-desktop-${tab.id}`}
            >
              <tab.icon size={18} strokeWidth={2.5} className={cn(
                "transition-transform group-hover:scale-110",
                activeTab === tab.id ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
              )} />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-200 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
            <Trophy size={80} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">LEVEL {level}</span>
              </div>
              <span className="text-[10px] font-black">{xp} XP</span>
            </div>
            <p className="text-sm font-bold mb-4">Progresso: {levelProgress}%</p>
            <div className="w-full bg-blue-800 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={false}
                animate={{ width: `${levelProgress}%` }}
                className="bg-blue-300 h-full rounded-full shadow-[0_0_10px_rgba(147,197,253,0.6)]" 
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-10 pb-24 md:pb-10 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'home' && <Home onStart={() => setActiveTab('roadmap')} xp={xp} level={level} streak={streak} setTab={setActiveTab} />}
              {activeTab === 'roadmap' && <Roadmap />}
              {activeTab === 'search_ai' && <SearchAI />}
              {activeTab === 'alphabet' && <Alphabet />}
              {activeTab === 'numbers' && <Numbers />}
              {activeTab === 'vocabulary' && <Vocabulary />}
              {activeTab === 'quiz' && <Quiz onComplete={() => addXp(20)} />}
              {activeTab === 'grammar' && <Grammar />}
              {activeTab === 'youtube' && <YouTubeLessons />}
              {activeTab === 'tutor' && <AITutor />}
              {activeTab === 'listening' && <Listening />}
              {activeTab === 'speaking' && <Speaking />}
              {activeTab === 'simulator' && <Simulator />}
              {activeTab === 'topik' && <TopikMaster />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function Home({ onStart, xp, level, streak, setTab }: { onStart: () => void, xp: number, level: number, streak: number, setTab: (t: Tab) => void }) {
  const isStarted = xp > 0;

  if (isStarted) {
    return (
      <div className="py-6 space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
               <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 dark:shadow-none">
                  <Star size={10} fill="currentColor" /> MASTER PRO
               </div>
               <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">UZBEKISTAN #1</span>
               <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-800">
                  <Zap size={10} fill="currentColor" /> {streak} KUNLIK STREAK
               </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight dark:text-white uppercase leading-none">
                Salom, Master! 👋
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-4 opacity-70">Sizning hozirgi darajangiz: <span className="text-blue-600 dark:text-blue-400 font-black">TOPIK I (2-DARAJA)</span></p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6">
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master XP</p>
                   <p className="text-2xl font-black dark:text-white">{xp}</p>
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 dark:shadow-blue-900/40">
                   <Trophy size={24} />
                </div>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Main Mission */}
           <motion.div 
            whileHover={{ y: -5 }}
            className="lg:col-span-8 bg-slate-900 dark:bg-black rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[400px] border border-slate-800"
           >
              <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                 <GraduationCap size={400} className="rotate-12 translate-x-20 translate-y-20" />
              </div>
              <div className="relative z-10 w-full mb-8">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/20">
                       <Play size={20} fill="currentColor" className="ml-1" />
                    </div>
                    <div>
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-1 block">TAVSIYA ETILGAN DARS</span>
                       <h3 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Muloqot: Kafeda</h3>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                       <p className="text-[8px] font-black text-white/40 uppercase mb-2 text-center">Qiyinchilik</p>
                       <div className="flex gap-1 justify-center">
                          {[1,2,3].map(i => <div key={i} className="w-4 h-1.5 bg-blue-500 rounded-full" />)}
                          {[1,2].map(i => <div key={i} className="w-4 h-1.5 bg-white/20 rounded-full" />)}
                       </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                       <p className="text-[8px] font-black text-white/40 uppercase mb-2 text-center">XP Mukofot</p>
                       <p className="text-sm font-black text-blue-400 text-center uppercase tracking-widest">+150 XP</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                       <p className="text-[8px] font-black text-white/40 uppercase mb-2 text-center">Davomiyligi</p>
                       <p className="text-sm font-black text-white text-center uppercase tracking-widest">~12 MIN</p>
                    </div>
                 </div>
              </div>
              <button 
                onClick={() => setTab('simulator')}
                className="relative z-10 w-full sm:w-fit bg-blue-600 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl group border border-blue-400/20"
              >
                 Darsni davom ettirish <ChevronRight size={18} strokeWidth={4} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </motion.div>

           {/* Skill Radar */}
           <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 flex flex-col shadow-xl overflow-hidden">
              <header className="flex justify-between items-center mb-6">
                 <div>
                    <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">Mahorat Radari</h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Sizning kuchli va kuchsiz tomonlaringiz</p>
                 </div>
                 <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                    <TrendingUp size={18} />
                 </div>
              </header>
              <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                       { subject: 'Grammatika', A: 85, fullMark: 150 },
                       { subject: 'Talaffuz', A: 65, fullMark: 150 },
                       { subject: 'Eshitish', A: 90, fullMark: 150 },
                       { subject: 'Yozish', A: 40, fullMark: 150 },
                       { subject: 'Lug\'at', A: 95, fullMark: 150 },
                       { subject: 'Tezlik', A: 50, fullMark: 150 }
                    ]}>
                       <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                       <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 'bold' }} 
                       />
                       <Radar
                          name="Siz"
                          dataKey="A"
                          stroke="#2563eb"
                          fill="#3b82f6"
                          fillOpacity={0.4}
                       />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                 <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/40">
                    <p className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase mb-1">Eng kuchli</p>
                    <p className="text-xs font-black dark:text-white uppercase">Lug'at</p>
                 </div>
                 <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-800/40">
                    <p className="text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase mb-1">E'tibor bering</p>
                    <p className="text-xs font-black dark:text-white uppercase">Yozish</p>
                 </div>
              </div>
           </div>

           {/* Global Leaderboard Mockup */}
           <div className="lg:col-span-12 xl:col-span-4 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 flex flex-col shadow-xl">
              <header className="flex justify-between items-center mb-8">
                 <h4 className="text-lg font-black dark:text-white uppercase tracking-tight">Global Leaderboard</h4>
                 <TrendingUp size={18} className="text-blue-600" />
              </header>
              <div className="space-y-4">
                 {[
                   { rank: 1, name: 'Abror M.', xp: '12,450', avatar: 'AM', color: 'bg-amber-400' },
                   { rank: 2, name: 'Sardor K.', xp: '10,200', avatar: 'SK', color: 'bg-slate-300' },
                   { rank: 3, name: 'Madina U.', xp: '9,850', avatar: 'MU', color: 'bg-orange-400' },
                   { rank: '...', name: 'Siz', xp: xp.toLocaleString(), avatar: 'YOU', color: 'bg-blue-600', isMe: true }
                 ].map((u, i) => (
                   <div key={i} className={cn(
                     "flex items-center justify-between p-4 rounded-2xl border transition-all",
                     u.isMe ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" : "bg-slate-50 dark:bg-slate-800/30 border-transparent"
                   )}>
                      <div className="flex items-center gap-4">
                         <span className="text-[10px] font-black text-slate-400 w-4">{u.rank}</span>
                         <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white text-[10px] font-black", u.color)}>
                            {u.avatar}
                         </div>
                         <div>
                            <p className="text-xs font-black dark:text-white uppercase">{u.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{u.xp} XP</p>
                         </div>
                      </div>
                      {u.rank === 1 && <Trophy size={16} className="text-amber-500" />}
                   </div>
                 ))}
              </div>
              <button className="mt-8 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline text-center">Barcha reytingni ko'rish</button>
           </div>

           {/* Quick Access */}
           <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { id: 'vocabulary', name: 'Lug\'at Empire', icon: Layers, color: 'bg-indigo-600', count: '120 SO\'Z YODLANDI' },
                { id: 'speaking', name: 'Pronunciation AI', icon: Mic, color: 'bg-emerald-600', count: 'MUKAMMALIK: 85%' },
                { id: 'listening', name: 'Immersion', icon: Headphones, color: 'bg-purple-600', count: '8 DARS QOLDI' },
                { id: 'quiz', name: 'TOPIK Master', icon: Zap, color: 'bg-amber-600', count: 'TEST REJIMI: ON' }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setTab(item.id as Tab)}
                  className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left group"
                >
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg", item.color)}>
                     <item.icon size={20} />
                  </div>
                  <h4 className="font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight text-sm">{item.name}</h4>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.count}</p>
                </button>
              ))}
           </div>
           <ApiKeySettings />
        </div>
      </div>
    );
  }


  return (
    <div className="py-6 space-y-8">
      <div className="relative overflow-hidden rounded-[3rem] bg-blue-600 dark:bg-blue-700 p-8 md:p-20 text-white shadow-2xl flex flex-col md:flex-row items-center gap-10">
        <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
           <Map size={400} className="rotate-12" />
        </div>
        
        <div className="relative z-10 md:w-3/5 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-center md:justify-start gap-2 mb-8">
              <span className="bg-white/20 dark:bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10">KOREAN MASTER AI ENGINE</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
              Koreys tilini<br />
              <span className="text-blue-200 italic dark:text-blue-300">AI bilan</span><br />
              mukammal o'rganing.
            </h1>
            <p className="text-xl md:text-2xl text-blue-100/90 dark:text-blue-200/90 mb-12 max-w-xl font-bold leading-relaxed">
              Dunyodagi eng kuchli AI texnologiyalari orqali 1 yil ichida professional TOPIK II darajasiga chiqing.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <button 
                onClick={onStart}
                className="bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 px-12 py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-900/20"
                id="get-started-btn"
              >
                Hozir Boshlash <ChevronRight size={22} strokeWidth={4} />
              </button>
            </div>
          </motion.div>
        </div>
        <div className="md:w-2/5 flex justify-center md:justify-end items-center">
            <GraduationCap size={280} className="text-blue-400 dark:text-blue-300/40 rotate-12 relative z-10 opacity-40 drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <FeatureCard 
          icon={<Map className="text-amber-500" size={32} />} 
          title="Roadmap" 
          desc="1 yil uchun professional darslar rejasi." 
          id="feature-roadmap"
          className="md:col-span-12 lg:col-span-8 bg-amber-50/50 border-amber-100"
        />
        <FeatureCard 
          icon={<Layers className="text-indigo-600" size={32} />} 
          title="Flashcardlar" 
          desc="Lug'atni rasmlar bilan oson yodlang." 
          id="feature-vocab"
          className="md:col-span-12 lg:col-span-4"
        />
        <FeatureCard 
          icon={<Volume2 className="text-blue-600" size={32} />} 
          title="Audio Hangul" 
          desc="Har bir harfning talaffuzini eshiting." 
          id="feature-voice"
          className="md:col-span-12 lg:col-span-4"
        />
        <FeatureCard 
          icon={<Youtube className="text-red-500" size={32} />} 
          title="Video Darslar" 
          desc="Sifatli o'zbekcha kontent toplami." 
          id="feature-video"
          className="md:col-span-12 lg:col-span-4 bg-slate-900 text-white border-slate-800"
        />
        <FeatureCard 
          icon={<MessageCircle className="text-emerald-600" size={32} />} 
          title="AI Tutor" 
          desc="24/7 savol-javob repetitori." 
          id="feature-ai"
          className="md:col-span-12 lg:col-span-4 border-emerald-100 bg-emerald-50/50"
        />
      </div>
      <ApiKeySettings />
    </div>
  );
}

function FeatureCard({ icon, title, desc, id, className }: { icon: React.ReactNode, title: string, desc: string, id: string, className?: string }) {
  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.01 }}
      className={cn(
        "bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all flex flex-col justify-between min-h-[260px]",
        className
      )}
      id={id}
    >
      <div>
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
          {icon}
        </div>
        <h3 className="text-2xl font-black mb-4 tracking-tight dark:text-white">{title}</h3>
      </div>
      <p className={cn("text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest opacity-80 leading-relaxed")}>
        {desc}
      </p>
    </motion.div>
  );
}

function ApiKeySettings() {
  const [keyInput, setKeyInput] = useState(() => getApiKey());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKey(keyInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm max-w-4xl mx-auto mt-12 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles size={20} className="animate-pulse text-amber-500" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider dark:text-white">Jonli AI Rejimi (Static / Bepul)</h4>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">Ilova GitHub Pages-da 100% serverni talab qilmaydigan static shaklda ishlaydi.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider border ${hasApiKey() ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}>
            {hasApiKey() ? "JONLI AI FAOL" : "SIMULYATSIYA REJIMI"}
          </span>
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold mb-6">
        K-Master AI tizimi offline rejimida ishlash uchun boy lokal bilimlarga ega. Agar siz Jonli AI Tutor va real-time qidiruvlarga ega bo'lishni istasangiz, o'zingizning shaxsiy 
        <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-extrabold ml-1 hover:underline">Google AI Studio-dan bepul Gemini API Kaliti</a>ingizni bu erga ulashingiz mumkin. Kalit faqat sizning shaxsiy brauzeringizda saqlanadi.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input 
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="Gemini API Key-ni kiriting (AIzaSy...)"
          className="flex-1 px-5 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-sans font-semibold text-xs tracking-wider bg-slate-50 dark:bg-slate-950 dark:text-white focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-all shadow-inner"
        />
        <button 
          onClick={handleSave}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none"
        >
          {saved ? "Saqlandi! ✓" : "Sozlamalarni Saqlash"}
        </button>
      </div>
    </div>
  );
}
