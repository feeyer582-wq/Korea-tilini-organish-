import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  BookOpen, 
  Youtube, 
  Newspaper, 
  Compass, 
  Volume2, 
  Bookmark, 
  BookmarkCheck,
  ExternalLink, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  FileText,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  GraduationCap
} from 'lucide-react';
import { clientSearch } from '../lib/geminiClient';

type SearchCategory = 'general_grammar' | 'youtube' | 'news' | 'culture_drama';

interface Source {
  title: string;
  url: string;
}

interface GrammarPoint {
  term: string;
  meaning: string;
  explanation: string;
  examples: { kr: string; uz: string }[];
}

interface VocabWord {
  kr: string;
  pron: string;
  uz: string;
}

interface YoutubeVideo {
  title: string;
  channel: string;
  summary: string;
  url: string;
  extracted_notes: string;
  extracted_vocab: { kr: string; uz: string }[];
}

interface QuizItem {
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
}

interface NewsData {
  article_title_kr: string;
  article_title_uz: string;
  raw_text_simplified: string;
  translation_uz: string;
  vocabulary_list: VocabWord[];
  grammar_breakdown: { kr: string; explanation: string }[];
  listening_practice_transcript: string;
}

interface SearchResults {
  is_offline?: boolean;
  // general_grammar or culture_drama
  summary?: string;
  grammar_points?: GrammarPoint[];
  vocabulary?: VocabWord[];
  learning_notes?: string[];
  sources?: Source[];
  
  // youtube
  playlist_title?: string;
  recommended_videos?: YoutubeVideo[];
  quiz_generator?: QuizItem[];

  // news
  news?: NewsData;
}

export default function SearchAI() {
  const [category, setCategory] = useState<SearchCategory>('general_grammar');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [ttsPlaying, setTtsPlaying] = useState<string | null>(null);
  
  // Quiz states
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showQuizResult, setShowQuizResult] = useState(false);

  // Clipboard / Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<{ id: string; type: string; data: any }[]>(() => {
    const saved = localStorage.getItem('k_master_search_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  // Track active YouTube video iframes to prevent iframe block warnings
  const [activeIframeVideos, setActiveIframeVideos] = useState<{ [key: string]: boolean }>({});

  // Loading steps animation
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  const loadingMessages = [
    { title: "Internet Qidirilmoqda", desc: "Google Search orqali real vaqtda eng ishonchli koreys tili manbalari tekshirilmoqda..." },
    { title: "Filtrlash & Tahlil", desc: "AI past sifatli va takroriy kontentni olib tashlab, dars qismlarini saralamoqda..." },
    { title: "O'zbekcha Tarjima", desc: "Urg'u berilgan grammatik qoidalar va lug'atlar mukammal o'zbek tiliga tahrirlanmoqda..." },
    { title: "Eko-Tizim Sinxronizatsiyasi", desc: "Talaffuz TTS fayli hamda interaktiv test savollari tayyorlanmoqda..." }
  ];

  const presets: { [key in SearchCategory]: string[] } = {
    general_grammar: [
      "은/는 (eun/neun) va 이/가 (i/ga) farqlari",
      "Koreys tilida hurmat formalari (존댓말 va 반말) qoidalari",
      "Koreys tilidagi sifatlar va ularning tuslanishi",
    ],
    youtube: [
      "TOPIK I testiga tayyorlanish uchun eng yaxshi eshitish video darslari",
      "Koreyscha qo'shiqlar (K-Pop) orqali koreys tili o'rganish darslari",
      "Kafeda muloqot qilish bo'yicha amaliy darsliklar",
    ],
    news: [
      "Seuldagi bahor festivallari va turizm yangiliklari",
      "Seul metrosi va jamoat transportidagi innovatsiyalar",
      "Koreyaning an'anaviy taomlari va madaniy yangiliklari",
    ],
    culture_drama: [
      "Kdrama 'Crash Landing on You' dagi daho iboralar tahlili",
      "Chuseok bayrami (Koreys dehqonchilik bayrami) urf-odatlari",
      "Koreys madaniyatida sovg'a berish odoblari va qoidalari",
    ]
  };

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setLoadingStep(0);
    setError(null);
    setResults(null);
    setSelectedAnswers({});
    setShowQuizResult(false);

    try {
      const data = await clientSearch(searchQuery, category);
      setResults(data);
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (preset: string) => {
    setQuery(preset);
    executeSearch(preset);
  };

  const playTTS = async (text: string, id: string) => {
    if (ttsPlaying === id) return;
    setTtsPlaying(id);
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const hasKorean = /[\u3131-\uD79D]/.test(text);
      utterance.lang = hasKorean ? 'ko-KR' : 'uz-UZ';
      utterance.rate = 0.95;
      utterance.onend = () => setTtsPlaying(null);
      utterance.onerror = () => setTtsPlaying(null);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("TTS output failed", err);
      setTtsPlaying(null);
    }
  };

  const toggleBookmark = (id: string, type: string, data: any) => {
    const exists = bookmarks.some((b) => b.id === id);
    let updated;
    if (exists) {
      updated = bookmarks.filter((b) => b.id !== id);
    } else {
      updated = [...bookmarks, { id, type, data }];
    }
    setBookmarks(updated);
    localStorage.setItem('k_master_search_bookmarks', JSON.stringify(updated));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="py-2 space-y-8">
      {/* Premium Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-56 h-56 bg-blue-500/10 dark:bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
            <Search size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">REAL-TIME GOOGLE SEARCH ENGINE</span>
            <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">AI Bilimlar Qidiruvi</h1>
          </div>
        </div>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
          Google va eng so'nggi ma'lumotlar bazasini qidirib, o'quv materiallari, darslar, grammatika mulohazalari hamda haqiqiy yangiliklarni o'zbekcha sharhlar bilan soniyalar ichida hosil qiling.
        </p>
      </div>

      {/* Main Grid: Category Selection & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Categories & Presets */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Mavzu Yo'nalishi</h3>
            <div className="space-y-2">
              {[
                { id: 'general_grammar', name: 'Smart Qidiruv (Grammatika)', icon: BookOpen, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
                { id: 'youtube', name: 'YouTube Dars Generator', icon: Youtube, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
                { id: 'news', name: 'Real-Time Koreys Yangiliklari', icon: Newspaper, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
                { id: 'culture_drama', name: 'K-Drama & Madaniyat', icon: Compass, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id as SearchCategory)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider text-left transition-all ${
                    category === cat.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 border border-blue-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent'
                  }`}
                >
                  <cat.icon size={16} className={category === cat.id ? 'text-white' : cat.color.split(' ')[0]} />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Presets based on selected category */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} className="text-blue-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Tayyor Mavzular</h3>
            </div>
            <div className="space-y-2">
              {presets[category].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetClick(preset)}
                  className="w-full text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-left p-3.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-xl transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 flex items-start gap-2.5"
                >
                  <ArrowRight size={12} className="mt-0.5 shrink-0 text-slate-400" />
                  <span className="line-clamp-2 leading-relaxed">{preset}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Saved Bookmarks summary */}
          {bookmarks.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookmarkCheck size={14} className="text-amber-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Saqlangan Qaydlarim ({bookmarks.length})</h3>
                </div>
                <button 
                  onClick={() => {
                    setBookmarks([]);
                    localStorage.removeItem('k_master_search_bookmarks');
                  }}
                  className="text-[9px] font-black text-rose-500 hover:text-rose-600 uppercase"
                >
                  Tozalash
                </button>
              </div>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {bookmarks.map((bookmark, idx) => (
                  <div key={idx} className="p-3 bg-amber-50/50 dark:bg-amber-950/10 rounded-xl border border-amber-100/40 dark:border-amber-900/20 text-[11px] font-bold">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-amber-700 dark:text-amber-400 text-[9px] font-black uppercase tracking-wider">{bookmark.type === 'grammar' ? 'Grammatika' : 'Lug\'at'}</span>
                      <button 
                        onClick={() => toggleBookmark(bookmark.id, bookmark.type, bookmark.data)}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                      >
                       ✕
                      </button>
                    </div>
                    {bookmark.type === 'grammar' ? (
                      <div>
                        <p className="font-black text-slate-800 dark:text-white mt-1">{bookmark.data.term}</p>
                        <p className="text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mt-0.5">{bookmark.data.meaning}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-black text-slate-800 dark:text-white mt-1">{bookmark.data.kr} [{bookmark.data.pron}]</p>
                        <p className="text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mt-0.5">{bookmark.data.uz}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Search Input & Dynamic Hub Area */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Search Input Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm flex flex-col sm:flex-row items-stretch gap-4">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder={
                  category === 'general_grammar' ? "Grammatik mavzuni yoki so'zlarni qidiring..." :
                  category === 'youtube' ? "Youtube dars yoki qo'shiq mavzularini ko'rsating..." :
                  category === 'news' ? "Yangiliklar sohasini yozing..." :
                  "K-drama, kino yoki K-shou nomini yozing..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') executeSearch(query); }}
                className="w-full bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl py-4.5 pl-12 pr-4 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <button
              onClick={() => executeSearch(query)}
              disabled={loading || !query.trim()}
              className="px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Izlanmoqda
                </>
              ) : (
                <>
                  Izlash & O'rganish <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* Loading Animation Card */}
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 text-white p-12 rounded-[2.5rem] shadow-xl text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[350px]"
              >
                <div className="absolute inset-0 pointer-events-none opacity-5">
                  <div className="absolute top-0 left-0 w-80 h-80 bg-blue-500 rounded-full blur-3xl animate-pulse" />
                </div>
                
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center animate-spin mb-8">
                  <Loader2 size={32} className="text-blue-500" />
                </div>

                <div className="space-y-3 z-10 max-w-md">
                  <h3 className="text-xl font-black uppercase tracking-wider text-blue-400">
                    {loadingMessages[loadingStep].title}
                  </h3>
                  <p className="text-sm font-bold text-slate-400 leading-relaxed">
                    {loadingMessages[loadingStep].desc}
                  </p>
                </div>

                {/* Loading indicator bar */}
                <div className="w-48 bg-slate-800 h-1 rounded-full mt-10 overflow-hidden">
                  <motion.div 
                    className="bg-blue-500 h-full rounded-full"
                    animate={{ x: [-100, 200] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            )}
            
            {/* Error handling */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-rose-950/10 border border-red-100 dark:border-rose-900/30 p-8 rounded-[2rem] flex items-center gap-4 text-rose-700 dark:text-rose-400 font-bold text-sm"
              >
                <AlertCircle size={24} className="shrink-0" />
                <div>
                  <h4 className="font-black text-rose-800 dark:text-rose-300">Izlashda xatolik yuz berdi</h4>
                  <p className="mt-1 font-semibold opacity-95">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Results Display Pane */}
            {!loading && !error && results && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                
                {results.is_offline && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 p-6 rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">Offline Dars Rejimi (API Quota Cheklovi)</h4>
                        <p className="text-[11px] font-bold text-amber-600/90 dark:text-amber-450 mt-0.5 leading-relaxed">
                          Google Search API quotalari tufayli real-time qidiruv offline holatda. K-Master AI darsini lokal bilimlar bazasidan muvaffaqiyatli tayyorladi.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 1. Category: General Grammar & K-Culture/Drama Results */}
                {(category === 'general_grammar' || category === 'culture_drama') && (
                  <div className="space-y-6">
                    {/* Summary Explanations card */}
                    {results.summary && (
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Mavzu Sharhi & Xulosa</span>
                          <button 
                            onClick={() => copyToClipboard(results.summary || '', 'summary')}
                            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
                          >
                            {copiedId === 'summary' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                          </button>
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {results.summary}
                        </p>
                      </div>
                    )}

                    {/* Extracted Grammar cards */}
                    {results.grammar_points && results.grammar_points.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                          <BookOpen size={16} className="text-blue-500" />
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">O'rganilgan Qoidalar ({results.grammar_points.length})</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {results.grammar_points.map((pt, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start mb-4">
                                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest">Qoida {idx + 1}</span>
                                  <button
                                    onClick={() => toggleBookmark(`grammar-${pt.term}`, 'grammar', pt)}
                                    className="text-slate-400 hover:text-amber-500 transition-colors"
                                  >
                                    <Bookmark size={16} className={bookmarks.some(b => b.id === `grammar-${pt.term}`) ? "fill-amber-500 text-amber-500" : ""} />
                                  </button>
                                </div>
                                <h4 className="text-xl font-black text-slate-800 dark:text-white">{pt.term}</h4>
                                <p className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wide mt-1">{pt.meaning}</p>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">{pt.explanation}</p>
                              </div>
                              
                              {pt.examples && pt.examples.length > 0 && (
                                <div className="mt-6 border-t border-slate-50 dark:border-slate-800/60 pt-4 space-y-3">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Amaliy Misollar</p>
                                  {pt.examples.map((ex, exIdx) => (
                                    <div key={exIdx} className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-dashed border-slate-100 dark:border-slate-800">
                                      <div className="flex items-center justify-between">
                                        <p className="text-xs font-black text-slate-800 dark:text-slate-200">{ex.kr}</p>
                                        <button 
                                          onClick={() => playTTS(ex.kr, `ex-${idx}-${exIdx}`)}
                                          className={`p-1.5 rounded-lg border transition-all ${
                                            ttsPlaying === `ex-${idx}-${exIdx}` 
                                              ? 'bg-blue-600 text-white border-blue-600 animate-pulse' 
                                              : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-600'
                                          }`}
                                        >
                                          <Volume2 size={10} />
                                        </button>
                                      </div>
                                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">{ex.uz}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extracted Vocabulary */}
                    {results.vocabulary && results.vocabulary.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                          <FileText size={16} className="text-blue-500" />
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Mavzuga Oid Muhim So'zlar ({results.vocabulary.length})</h3>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm overflow-hidden">
                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {results.vocabulary.map((wd, idx) => (
                              <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-black text-xs">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-sm font-black text-slate-800 dark:text-white">{wd.kr}</span>
                                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">[{wd.pron}]</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{wd.uz}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => playTTS(wd.kr, `vocab-${idx}`)}
                                    className={`p-2 rounded-xl border transition-all ${
                                      ttsPlaying === `vocab-${idx}` 
                                        ? 'bg-blue-600 text-white border-blue-600 animate-pulse' 
                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-600 hover:bg-white'
                                    }`}
                                  >
                                    <Volume2 size={12} />
                                  </button>
                                  <button
                                    onClick={() => toggleBookmark(`vocab-${wd.kr}`, 'vocab', wd)}
                                    className="p-2 border border-slate-100 dark:border-slate-700 rounded-xl hover:text-amber-500 transition-colors"
                                  >
                                    <Bookmark size={12} className={bookmarks.some(b => b.id === `vocab-${wd.kr}`) ? "fill-amber-500 text-amber-500" : "text-slate-400"} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Learning Notes summary & Tips */}
                    {results.learning_notes && results.learning_notes.length > 0 && (
                      <div className="bg-amber-50/30 dark:bg-amber-950/5 border border-amber-100/60 dark:border-amber-900/20 p-8 rounded-[2.5rem] shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles size={16} className="text-amber-500" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">K-Master Eskiz Eslatmalari</h4>
                        </div>
                        <ul className="space-y-3.5">
                          {results.learning_notes.map((note, idx) => (
                            <li key={idx} className="flex gap-3 text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                              <span className="shrink-0 w-5 h-5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full flex items-center justify-center font-black text-[10px]">{idx + 1}</span>
                              <span className="pt-0.5">{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Category: YouTube Playlist Extraction & Quiz */}
                {category === 'youtube' && (
                  <div className="space-y-6">
                    {/* YouTube Header info */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2 block">Dahona YouTube Darsliklar</span>
                      <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{results.playlist_title || "Generatsiya qilingan Playlist"}</h2>
                      <p className="text-xs font-bold text-slate-500 mt-2">Darslarni tomosha qilib, AI orqali umumlashtirilgan o'rgatuvchi eslatmalarni va testlarni yeching.</p>
                    </div>

                    {/* Videos Cards */}
                    {results.recommended_videos && results.recommended_videos.map((vid, idx) => {
                      // Attempt to construct matching iFrame / YouTube embed logic if needed
                      let embedId = "";
                      if (vid.url) {
                        const directId = vid.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
                        if (directId) embedId = directId[1];
                      }

                      return (
                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12">
                          <div className="md:col-span-5 bg-slate-150 dark:bg-slate-950/80 aspect-video md:aspect-auto relative min-h-[230px] flex flex-col justify-between overflow-hidden group">
                            {embedId ? (
                              activeIframeVideos[vid.url] ? (
                                <div className="w-full h-full relative">
                                  <iframe
                                    src={`https://www.youtube.com/embed/${embedId}?autoplay=1&mute=0`}
                                    title={vid.title}
                                    className="w-full h-full border-0 absolute inset-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  ></iframe>
                                </div>
                              ) : (
                                <div className="relative w-full h-full cursor-pointer overflow-hidden group/thumb" onClick={() => setActiveIframeVideos(prev => ({ ...prev, [vid.url]: true }))}>
                                  <img 
                                    src={`https://img.youtube.com/vi/${embedId}/hqdefault.jpg`} 
                                    alt={vid.title} 
                                    className="w-full h-full object-cover transition-all duration-500 group-hover/thumb:scale-105"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-slate-950/40 group-hover/thumb:bg-slate-950/20 transition-all duration-300 flex flex-col items-center justify-center">
                                    <div className="w-16 h-11 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 transform group-hover/thumb:scale-110">
                                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                                      </svg>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white mt-3.5 px-3 py-1 bg-slate-950/80 rounded-lg backdrop-blur-sm shadow-md">
                                      Ilovada Tinglash
                                    </span>
                                  </div>
                                </div>
                              )
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-900">
                                <Youtube size={48} className="text-red-500 mb-3" />
                                <a 
                                  href={vid.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                                >
                                  Tomosha qilish <ExternalLink size={12} />
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="md:col-span-7 p-8 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-4 mb-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">{vid.channel || "YouTube Darslik"}</span>
                                <div className="flex gap-2">
                                  <a 
                                    href={vid.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all border border-red-100 dark:border-red-900/30"
                                  >
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.555A3.002 3.002 0 0 0 .5 6.163C0 8.038 0 12 0 12s0 3.962.502 5.837a3.002 3.002 0 0 0 2.11 2.108C5.082 20.5 12 20.5 12 20.5s7.518 0 9.388-.555a3.002 3.002 0 0 0 2.11-2.108C24 15.962 24 12 24 12s0-3.962-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                    </svg>
                                    YouTube-da Ochish (100% Kafolatli)
                                  </a>
                                  <a href={vid.url} target="blank" rel="noopener noreferrer" className="p-2 border border-slate-100 dark:border-slate-800 rounded-xl hover:text-red-500 transition-colors">
                                    <ExternalLink size={14} />
                                  </a>
                                </div>
                              </div>
                              <h3 className="text-lg font-black text-slate-800 dark:text-white leading-snug uppercase tracking-tight">{vid.title}</h3>
                              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase">Kanal: {vid.channel}</p>
                              
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-4 leading-relaxed line-clamp-2">
                                {vid.summary}
                              </p>

                              {vid.extracted_notes && (
                                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-100 dark:border-slate-800/80">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dars Konspekti (Qisqartma)</p>
                                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">{vid.extracted_notes}</p>
                                </div>
                              )}
                              
                              {/* Helpful note about potential iframe blocks in sandboxed preview */}
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-3 leading-relaxed">
                                🔒 YouTube xavfsizlik va mualliflik qoidalari sababli dars bu erda o'ynamasligi mumkin. Bunday holda tepadagi <span className="text-red-500 dark:text-red-400 font-bold">"YouTube-da Ochish"</span> tugmasidan foydalaning.
                              </p>
                            </div>

                            {vid.extracted_vocab && vid.extracted_vocab.length > 0 && (
                              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/80">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Ushbu darsdan topilgan yangi so'zlar</p>
                                <div className="flex flex-wrap gap-2">
                                  {vid.extracted_vocab.map((vc, vIdx) => (
                                    <div key={vIdx} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/15 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 transition-colors">
                                      {vc.kr} : {vc.uz}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Interaktiv Quiz Generator cards */}
                    {results.quiz_generator && results.quiz_generator.length > 0 && (
                      <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-800">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-slate-900 shadow-md">
                            <Sparkles size={18} />
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400">AI-SAVOLLAR</span>
                            <h3 className="text-xl font-black uppercase tracking-tight">O'rgatuvchi bilimlarini tekshirish testi</h3>
                          </div>
                        </div>

                        <div className="space-y-8">
                          {results.quiz_generator.map((item, qIdx) => (
                            <div key={qIdx} className="border-b border-slate-800 pb-8 last:border-0 last:pb-0">
                              <p className="text-xs font-black uppercase tracking-wider text-slate-500">Sinf Savoli {qIdx + 1}</p>
                              <h4 className="text-base font-black text-slate-200 mt-2 leading-relaxed">{item.question}</h4>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                {item.options.map((opt, oIdx) => {
                                  let btnClass = "bg-slate-800/50 hover:bg-slate-800 border-slate-800 text-slate-300";
                                  if (showQuizResult) {
                                    if (oIdx === item.answer_index) {
                                      btnClass = "bg-emerald-900/40 border-emerald-500 text-emerald-300 pointer-events-none";
                                    } else if (selectedAnswers[qIdx] === oIdx) {
                                      btnClass = "bg-rose-900/40 border-rose-500 text-rose-300 pointer-events-none";
                                    } else {
                                      btnClass = "opacity-40 pointer-events-none border-transparent";
                                    }
                                  } else if (selectedAnswers[qIdx] === oIdx) {
                                    btnClass = "bg-blue-600/20 border-blue-500 text-blue-300";
                                  }

                                  return (
                                    <button
                                      key={oIdx}
                                      onClick={() => {
                                        if (showQuizResult) return;
                                        setSelectedAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
                                      }}
                                      className={`w-full p-4 rounded-xl text-left border text-xs font-bold transition-all ${btnClass}`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>

                              {showQuizResult && (
                                <div className="mt-4 p-4 bg-slate-800/40 rounded-xl border border-slate-800">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 matches-correct">
                                    <HelpCircle size={12} /> Tushuntirish:
                                  </p>
                                  <p className="text-xs font-bold text-slate-300 mt-1 leading-relaxed">{item.explanation}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-wrap gap-4 items-center justify-between">
                          <p className="text-xs font-bold text-slate-400">
                            {Object.keys(selectedAnswers).length} x {results.quiz_generator.length} savol javob berildi
                          </p>
                          <div className="flex gap-3">
                            {showQuizResult ? (
                              <button
                                onClick={() => {
                                  setSelectedAnswers({});
                                  setShowQuizResult(false);
                                }}
                                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-colors"
                              >
                                <RotateCcw size={14} /> Qaytadan urinish
                              </button>
                            ) : (
                              <button
                                onClick={() => setShowQuizResult(true)}
                                disabled={Object.keys(selectedAnswers).length < results.quiz_generator.length}
                                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-500/10"
                              >
                                <CheckCircle2 size={14} /> Natijalarni Tekshirish
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Category: News Simplifier Area */}
                {category === 'news' && results.news && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">K-NEWS SIMPLIFIED</span>
                        <p className="text-[10px] font-bold text-slate-400">Latest Google Search News</p>
                      </div>
                      <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase leading-snug tracking-tight">
                        {results.news.article_title_kr}
                      </h2>
                      <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">
                        {results.news.article_title_uz}
                      </h4>
                    </div>

                    {/* Side-by-Side original simplified & Translate */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Simplified Korean with TTS */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Koreys tilida (Soddalashtirilgan)</h3>
                            <button 
                              onClick={() => playTTS(results.news?.listening_practice_transcript || results.news?.raw_text_simplified || '', 'news-kr')}
                              className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
                                ttsPlaying === 'news-kr' 
                                  ? 'bg-blue-600 text-white border-blue-600 animate-pulse font-black' 
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-750 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-white'
                              }`}
                            >
                              <Volume2 size={14} /> Tinglash
                            </button>
                          </div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-350 leading-loose whitespace-pre-wrap font-sans">
                            {results.news.raw_text_simplified}
                          </p>
                        </div>
                        
                        <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-850/50 rounded-2xl text-[10px] font-bold text-slate-450 dark:text-slate-500 border border-slate-100 dark:border-slate-800/80">
                          🔊 Yuqoridagi "Tinglash" tugmasi yangiliklarni talaffuzi aniq suxandon kabi, darslik ohangida o'qib beradi.
                        </div>
                      </div>

                      {/* Uzbek Translate */}
                      <div className="bg-slate-950 text-slate-200 border border-slate-900 p-8 rounded-[2.5rem] shadow-lg">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-6">O'zbekcha Tarjimasi</h3>
                        <p className="text-sm font-bold leading-loose whitespace-pre-wrap font-sans">
                          {results.news.translation_uz}
                        </p>
                      </div>
                    </div>

                    {/* Breakdown section: Vocabulary & Grammar extracted */}
                    {results.news.vocabulary_list && results.news.vocabulary_list.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2">Yangilik boyicha muhim iboralar</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {results.news.vocabulary_list.map((v, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                              <div>
                                <p className="text-sm font-black text-slate-800 dark:text-white">{v.kr}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">[{v.pron}]</p>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">{v.uz}</p>
                              </div>
                              <button 
                                onClick={() => playTTS(v.kr, `nl-${idx}`)}
                                className={`p-2 rounded-xl transition-all border ${
                                  ttsPlaying === `nl-${idx}` 
                                    ? 'bg-blue-600 text-white border-blue-600 animate-pulse' 
                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-600'
                                }`}
                              >
                                <Volume2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grammar analysis card for news */}
                    {results.news.grammar_breakdown && results.news.grammar_breakdown.length > 0 && (
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-6">Yangilik tarkibidan grammatik tahlil</h3>
                        <div className="space-y-6">
                          {results.news.grammar_breakdown.map((g, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row gap-4 tracking-normal">
                              <div className="sm:w-1/4 shrink-0">
                                <span className="text-base font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-900/20 inline-block">
                                  {g.kr}
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                                  {g.explanation}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Citations & Sources Card */}
                {results.sources && results.sources.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Google Search Manbalari & Ma'lumotlar bazasi</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {results.sources.map((src, idx) => (
                        <a
                          key={idx}
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-900/10 border border-transparent hover:border-blue-100 transition-all flex items-center justify-between gap-3 text-left group"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-700 dark:text-slate-350 line-clamp-1 group-hover:text-blue-600">{src.title || "Tarixiy Manba"}</p>
                            <p className="text-[9px] font-bold text-slate-400 truncate mt-0.5">{src.url}</p>
                          </div>
                          <ExternalLink size={12} className="shrink-0 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>

          {/* Initial State / Welcome search */}
          {!loading && !error && !results && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-100/50 dark:bg-slate-900/40 p-12 rounded-[2.5rem] text-center border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[300px]"
            >
              <div className="w-14 h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm mb-6">
                <Compass size={24} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight dark:text-white">Qidiruv boshlanmadi</h3>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-2 max-w-sm leading-relaxed">
                Chap tarafdagi mavzulardan birini tanlang yoki yuqoridagi qidiruv maydoniga koreys tili o'rganish bo'yicha savolingizni yozib izlang!
              </p>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
