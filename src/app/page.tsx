"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Loader2, Sparkles, Video, FileText, ChevronRight, ExternalLink,
  Target, BarChart3, Calendar, Activity, Zap, TrendingUp,
  BrainCircuit, AlertTriangle, DollarSign, Bomb, Lightbulb, 
  Crown, RefreshCw, Layers, Eye, Music, Camera, Edit3,
  Copy, Check, Lock, MousePointer2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { saveToMemory, getMemory } from "@/lib/memory";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Animation Variants
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function ContentEngine() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [detectedPatterns, setDetectedPatterns] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [activePlan, setActivePlan] = useState<{ id: any; content: string } | null>(null);
  const [selectedAngle, setSelectedAngle] = useState("default");
  const [generationCount, setGenerationCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [statusLogs, setStatusLogs] = useState<string[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-Demo Onboarding
  useEffect(() => {
    if (videos.length === 0 && !loading && keyword === "" && generationCount === 0) {
      const timer = setTimeout(() => {
        setKeyword("AI Automation");
        setTimeout(() => handleAnalyze(), 600);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    setTimeout(() => setCopiedId(null), 2000);
  };

   const handleAnalyze = async () => {
    setError(null);
    setLoading("analyze");
    setVideos([]);
    setAnalysis(null);
    setIdeas([]);
    setStatusLogs(["🔍 SCANNING YOUTUBE MARKET...", "📊 CALCULATING VIRAL VELOCITY...", "🧠 EXTRACTING PATTERNS..."]);
    
    try {
      const res = await fetch("/api/analyze", { method: "POST", body: JSON.stringify({ keyword: keyword || "AI Automation" }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      
      // Instant feedback - show found videos immediately
      const foundCount = data.videos?.length || 0;
      setStatusLogs(prev => [...prev, `Found ${foundCount} high-performing videos`]);
      
      setStatusLogs(prev => [...prev, "MARKET DNA DECRYPTED.", "EXTRACTING GROWTH VELOCITY SIGNALS...", "DETECTING CONTENT GAPS..."]);
      setVideos(data.videos || []);
      setAnalysis(data.analysis || null);
      setDetectedPatterns(data.detectedPatterns || []);
      setStatusLogs(prev => [...prev, "INTELLIGENCE PASS COMPLETE."]);

      if (data.analysis?.dominantPatterns) {
        saveToMemory(keyword || "AI Automation", [], data.analysis.dominantPatterns.map((p: string) => ({ pattern: p })));
      }
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(null); }
  };

   const handleGenerateIdeas = async (angle: string = "default") => {
    setError(null);
    setSelectedAngle(angle);
    setLoading("ideas");
    const memory = getMemory();
    setStatusLogs(["CONSULTING STRATEGIC BRAIN...", `SWITCHING TO ${angle.toUpperCase()} ANGLE...`]);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        body: JSON.stringify({ 
          keyword, 
          analysis, 
          titles: videos.map(v => v.title), 
          angle,
          pastIdeas: memory.pastIdeas
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Idea generation failed");
      
      setStatusLogs(prev => [...prev, "ENSURING NOVELTY CHECK...", "SCORING VIRALITY SIGNALS...", "SYNTHESIZING ELITE BLUEPRINTS..."]);
      setIdeas(data.ideas || []);
      setGenerationCount(prev => prev + 1);
      setStatusLogs(prev => [...prev, "STRATEGY READY."]);
      saveToMemory(keyword, data.ideas || [], []);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(null); }
  };

   const handleFetchPlan = async (idea: any) => {
    setError(null);
    setLoading(`plan-${idea.id}`);
    setStatusLogs(["INITIATING EXECUTION BLUEPRINTING...", "GENERATING AI SCENE BOARDS...", "CUEING SOUND DESIGN SFX..."]);
    try {
      const res = await fetch("/api/script", { method: "POST", body: JSON.stringify({ idea }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Execution plan failed");
      
      setStatusLogs(prev => [...prev, "POLISHING NATURAL VO...", "FINALIZING PRODUCTION SYSTEM."]);
      setActivePlan({ id: idea.id, content: data.plan });
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(null); }
  };

  const handlePivot = async (idea: any, angle: string) => {
    setLoading(`pivot-${idea.id}`);
    try {
      const res = await fetch("/api/pivot", { method: "POST", body: JSON.stringify({ idea, angle }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Pivot failed");
      
      setIdeas(prev => prev.map(i => i.id === idea.id ? { ...data.idea, id: i.id } : i));
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(null); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative pb-32">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full opacity-40" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full opacity-30" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-between items-center backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.4em] whitespace-nowrap">ViralEngine<span className="text-indigo-500">.AI</span></span>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
           <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden lg:block">Status: <span className="text-emerald-500">System Live</span></span>
           <button className="px-4 md:px-5 py-2 md:py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 transition-all">Sign In</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-32 md:pt-40 px-4 md:px-8 2xl:px-16 relative z-10">
        <section className="text-center space-y-8 md:space-y-12 mb-16 md:mb-32">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-[0.2em]">
            <Crown className="w-4 h-4 text-amber-500 animate-pulse" />
            Strategic content brain active
          </motion.div>
          <motion.h1 initial={{ opacity: 0, filter: "blur(10px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.8 }} className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter text-white max-w-5xl mx-auto leading-[1.1] md:leading-[0.8]">
            STOP GUESSING <br />
            <span className="text-indigo-500 italic">WHAT TO POST.</span>
          </motion.h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] sm:text-xs">Find viral ideas using real YouTube data in seconds</p>
          
          <div className="flex flex-col sm:flex-row gap-6 max-w-4xl mx-auto pt-10">
            <div className="flex-1 relative group">
              <MousePointer2 className="w-5 h-5 text-slate-700 absolute left-4 md:left-6 top-1/2 -translate-y-1/2 opacity-50 group-hover:scale-110 transition-transform" />
              <input
                type="text"
                placeholder="Try: AI Tools, Fitness, Motivation..."
                className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-4 md:py-7 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 bg-white/[0.03] text-white shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-black placeholder:text-slate-700 text-base md:text-xl"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>
            <button onClick={handleAnalyze} disabled={!!loading} className="w-full md:w-auto px-6 md:px-14 py-4 md:py-7 bg-indigo-600 text-white rounded-[2rem] md:rounded-[2.5rem] font-black text-lg md:text-xl hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-4 shadow-2xl shadow-indigo-600/30 group whitespace-normal md:whitespace-nowrap">
              {loading === "analyze" ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  ANALYZING...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  Find Viral Ideas Now
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {statusLogs.length > 0 && loading && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto mt-8 md:mt-12 bg-[#111114] border border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 font-mono text-[9px] md:text-[10px] text-indigo-400 space-y-2 shadow-2xl overflow-x-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-white">Live Intelligence Feed</span>
                </div>
                {statusLogs.map((log, i) => (
                  <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={i} className="flex items-center gap-3 text-left">
                    <span className="text-slate-700">[{new Date().toLocaleTimeString([], {hour12: false})}]</span>
                    <span className="font-bold tracking-widest">{log}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <AnimatePresence>
          {videos.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16 md:space-y-40">
              <section className="bg-white/[0.02] border border-white/5 rounded-3xl md:rounded-[4rem] p-6 md:p-16 overflow-hidden relative backdrop-blur-3xl shadow-xl md:shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-20 relative z-10">
                  <div className="space-y-16">
                    <div className="space-y-4">
                       <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white flex items-center gap-4 italic tracking-tight">
                         <Layers className="w-8 h-8 text-indigo-500" />
                         Pattern Intelligence
                       </h2>
                       <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">What is winning right now</p>
                    </div>
                    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {detectedPatterns.slice(0, 6).map((p, i) => (
                        <motion.div key={i} variants={item} className="p-5 bg-white/5 border border-white/10 rounded-2xl group hover:border-indigo-500/50 transition-all">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={cn("w-2.5 h-2.5 rounded-full", p.type === 'curiosity' ? "bg-purple-500 shadow-[0_0_15px_#a855f7]" : p.type === 'list' ? "bg-blue-500 shadow-[0_0_15px_#3b82f6]" : "bg-red-500 shadow-[0_0_15px_#ef4444]")} />
                            <span className="text-[10px] font-black uppercase text-indigo-400">{p.type} pattern</span>
                          </div>
                          <div className="text-xs text-slate-300 font-bold line-clamp-2">{p.pattern}</div>
                        </motion.div>
                      ))}
                    </motion.div>

                    {analysis && (
                      <div className="space-y-12 pt-12 border-t border-white/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                          <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 flex items-center gap-3">
                              <BrainCircuit className="w-4 h-4" />
                              Psychological Drivers
                            </h4>
                            <div className="space-y-2">
                              {analysis.psychologicalDrivers?.map((driver: string, idx: number) => (
                                <div key={idx} className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10 text-[11px] font-bold text-slate-400">
                                  {driver}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 flex items-center gap-3">
                              <TrendingUp className="w-4 h-4" />
                              Emerging Opportunities
                            </h4>
                            <div className="space-y-2">
                              {analysis.emergingOpportunities?.map((opp: string, idx: number) => (
                                <div key={idx} className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-[11px] font-bold text-slate-400">
                                  {opp}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400 flex items-center gap-3">
                              <AlertTriangle className="w-4 h-4" />
                              Saturated Angles
                            </h4>
                            <div className="space-y-2">
                              {analysis.saturatedAngles?.map((angle: string, idx: number) => (
                                <div key={idx} className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10 text-[11px] font-bold text-slate-400">
                                  {angle}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-12 md:space-y-16" id="strategy-section">
                    <div className="space-y-4 text-right">
                       <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white italic tracking-tight">Strategy Angle</h2>
                       <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">Select psychological Trigger</p>
                       <p className="text-indigo-400 font-bold text-[11px]">Pick an angle to change emotional impact</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {[
                        { id: 'fear', name: 'Fear / Warning', icon: AlertTriangle, color: 'hover:border-red-500/50', desc: 'Survival Instinct' },
                        { id: 'money', name: 'ROI / Wealth', icon: DollarSign, color: 'hover:border-emerald-500/50', desc: 'Resource Acquisition' },
                        { id: 'mistake', name: 'Error / Fix', icon: Bomb, color: 'hover:border-amber-500/50', desc: 'Status Protection' },
                        { id: 'default', name: 'Pure Viral', icon: Zap, color: 'hover:border-indigo-500/50', desc: 'High Velocity' },
                      ].map((angle) => (
                        <button key={angle.id} onClick={() => handleGenerateIdeas(angle.id)} disabled={!!loading} className={cn("p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] bg-white/[0.03] border border-white/5 transition-all text-left flex flex-col justify-between group h-36 md:h-52 relative overflow-hidden shadow-xl", selectedAngle === angle.id ? "bg-indigo-600/20 border-indigo-500/50" : "", angle.color)}>
                          <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <angle.icon className="w-24 h-24" />
                          </div>
                          <angle.icon className="w-8 h-8 mb-8 text-slate-600 group-hover:text-white transition-all transform group-hover:scale-110 relative z-10" />
                          <div className="relative z-10">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-1">{angle.name}</div>
                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{angle.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="pt-6">
                       <button onClick={() => handleGenerateIdeas()} className="w-full py-4 md:py-7 bg-indigo-600 text-white rounded-[2rem] md:rounded-[2.5rem] font-black text-xs md:text-sm tracking-[0.2em] md:tracking-[0.4em] shadow-2xl shadow-indigo-600/40 hover:bg-indigo-500 transition-all flex items-center justify-center gap-4">
                         {loading === "ideas" ? (
                           <>
                             <Loader2 className="w-5 h-5 animate-spin" />
                             SYNTHESIZING ELITE STRATEGIES...
                           </>
                         ) : (
                           <>
                             <Sparkles className="w-5 h-5" />
                             GENERATE ELITE IDEAS
                           </>
                         )}
                       </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-12">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/5 pb-8 gap-4 md:gap-0 relative">
                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-4">
                      <BarChart3 className="w-5 h-5" />
                      Current Market Heat Map
                    </h2>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 w-full md:w-auto">
                      <span className="text-[10px] font-bold text-emerald-500 tracking-[0.1em] md:tracking-[0.3em] uppercase bg-emerald-500/5 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-emerald-500/10">Analyzed {videos.length} High-Velocity Videos</span>
                      <span className="text-[10px] font-bold text-slate-600 tracking-widest uppercase hidden md:block">Updated Real-Time</span>
                    </div>
                  </div>
                  
                  <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {videos.map((v, i) => (
                      <motion.div variants={item} key={v.id} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-indigo-500/30 transition-all shadow-xl">
                        <div className="relative aspect-video">
                          <img src={v.thumbnail} className="w-full h-full object-cover transition-transform group-hover:scale-105 opacity-80" alt="Video cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] to-transparent opacity-90" />
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1.5 bg-indigo-500/20 backdrop-blur-md rounded-lg text-[9px] font-black text-indigo-300 border border-indigo-500/30 uppercase tracking-widest">
                              Used for analysis
                            </span>
                          </div>
                          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                             <span className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-xl text-[10px] font-black text-white border border-white/10 uppercase tracking-widest">
                               Rank #{i+1}
                             </span>
                            <a href={`https://youtube.com/watch?v=${v.id}`} target="_blank" className="p-3 bg-indigo-600 rounded-full hover:bg-indigo-500 text-white transition-all shadow-lg hover:scale-110">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                        <div className="p-4 md:p-6 rounded-2xl space-y-4 md:space-y-6">
                          <h4 className="text-sm font-bold text-white line-clamp-2 leading-relaxed h-[2.8rem] group-hover:text-indigo-400 transition-colors" dangerouslySetInnerHTML={{ __html: v.title }} />
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-0 pt-6 border-t border-white/5">
                            <div className="space-y-4">
                              <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Viral Momentum</div>
                              <div className="text-sm font-black text-emerald-400 flex items-center gap-2">
                                {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(v.velocity)}
                                <span className="text-[8px] text-slate-700 tracking-widest">/ HR</span>
                              </div>
                            </div>
                            <div className="text-left lg:text-right space-y-4">
                              <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Recency</div>
                              <div className="text-sm font-black text-slate-300 flex items-center lg:justify-end gap-2">
                                <Calendar className="w-3.5 h-3.5 text-slate-700" />
                                {Math.floor((Date.now() - new Date(v.publishedDate).getTime()) / (1000 * 60 * 60 * 24))} Days
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
              </section>

              {/* Sticky Jump to Ideas button for mobile */}
              {videos.length > 0 && ideas.length === 0 && !loading && (
                <div className="fixed bottom-4 left-0 right-0 px-4 md:hidden z-50">
                  <button 
                    onClick={() => document.getElementById('strategy-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm tracking-[0.3em] shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-3 animate-bounce"
                  >
                    <Zap className="w-4 h-4" />
                    Jump to Ideas
                  </button>
                </div>
              )}

              {ideas.length > 0 && (
                <section className="space-y-12 md:space-y-20">
                  <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white italic tracking-tighter">Elite Decision Output</h2>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6">
                      <span className="text-[10px] font-bold text-emerald-400 tracking-[0.1em] md:tracking-[0.3em] uppercase bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10">
                        Analyzed {videos.length} trending videos
                      </span>
                      <span className="text-[10px] font-bold text-indigo-400 tracking-[0.1em] md:tracking-[0.3em] uppercase bg-indigo-500/5 px-4 py-2 rounded-full border border-indigo-500/10">
                        Updated just now
                      </span>
                      <span className="text-[10px] font-bold text-purple-400 tracking-[0.1em] md:tracking-[0.3em] uppercase bg-purple-500/5 px-4 py-2 rounded-full border border-purple-500/10">
                        Based on real YouTube data
                      </span>
                    </div>
                  </div>

                  <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                    {ideas.map((idea) => (
                      <motion.div variants={item} key={idea.id} className={cn("relative group", idea.isBestPick && "md:col-span-2 lg:col-span-1")}>
                        {idea.isBestPick && <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 blur-xl opacity-75" />}
                        <div className={cn("relative bg-[#111114] border rounded-3xl md:rounded-[4rem] p-6 md:p-12 transition-all shadow-2xl overflow-hidden", idea.isBestPick ? "border-amber-500/40 md:scale-[1.02]" : "border-white/5 hover:border-indigo-500/40")}>
                           
                           <div className="flex flex-col lg:flex-row items-start justify-between gap-6 md:gap-8 mb-8 md:mb-10 text-left">
                              <div className="space-y-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                  {idea.validationScore && (
                                    <span className={cn("text-xs font-black px-4 py-2 rounded-full border tracking-widest", idea.validationScore >= 8 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : idea.validationScore >= 7 ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : "text-red-400 bg-red-500/10 border-red-500/20")}>
                                      Quality Score: {idea.validationScore.toFixed(1)}/10
                                    </span>
                                  )}
                                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-400 px-3 py-1.5 bg-purple-500/5 rounded-xl border border-purple-500/20">{idea.trigger}</span>
                                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400 px-3 py-1.5 bg-blue-500/5 rounded-xl border border-blue-500/20">{idea.format}</span>
                                  <span className={cn("text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-xl border", idea.confidenceScore > 9 ? "text-amber-400 bg-amber-400/10 border-amber-400/20" : "text-white/60 bg-white/5 border-white/10")}>
                                    Confidence: {idea.confidenceScore}
                                  </span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-white leading-[1.1] group-hover:text-indigo-400 transition-colors underline decoration-indigo-500/10 underline-offset-8">{idea.title}</h3>
                                <p className="text-xs font-black text-indigo-500 bg-indigo-500/5 py-3 md:py-4 px-4 md:px-6 rounded-2xl italic flex items-center gap-3">
                                  <Activity className="w-3 h-3" />
                                  “{idea.hook}”
                                </p>
                              </div>
                              <div className="flex flex-col gap-2 w-full lg:w-auto">
                                <button 
                                  onClick={() => {
                                    if (isSubscribed) handleFetchPlan(idea);
                                    else setActivePlan({ id: idea.id, content: "PAYWALL" });
                                  }} 
                                  className="w-full md:w-auto p-4 md:p-6 bg-indigo-600 text-white rounded-2xl md:rounded-3xl hover:bg-indigo-500 transition-all shadow-xl border border-white/10 shrink-0 group relative overflow-hidden flex items-center justify-center lg:justify-start"
                                >
                                  <div className="flex items-center gap-3">
                                    <Sparkles className={cn("w-6 h-6", loading === `plan-${idea.id}` && "animate-spin")} />
                                    <span className="font-black text-[10px] uppercase tracking-widest whitespace-nowrap">Plan</span>
                                  </div>
                                </button>
                                <div className="flex flex-wrap lg:flex-nowrap gap-2 justify-center mt-2">
                                  {[
                                    { id: 'fear', icon: AlertTriangle, label: 'MISTAKE' },
                                    { id: 'money', icon: DollarSign, label: 'MONEY' },
                                    { id: 'controversy', icon: Bomb, label: 'CONTROVERSY' }
                                  ].map(a => (
                                    <button key={a.id} onClick={() => handlePivot(idea, a.id)} disabled={loading?.toString().startsWith('pivot')} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-colors group">
                                      <a.icon className="w-3 h-3 text-indigo-400 group-hover:scale-125 transition-transform" />
                                      <span className="text-[7px] font-black uppercase text-slate-500 group-hover:text-white transition-colors">{a.id}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 gap-6 mb-8 md:mb-10">
                              <div className="p-5 md:p-8 bg-white/[0.02] rounded-2xl md:rounded-[2rem] border border-white/5 space-y-4 md:space-y-6 relative overflow-hidden text-left">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                                    <BrainCircuit className="w-4 h-4 text-indigo-500" />
                                    Analysis
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={() => copyToClipboard(idea.hook, `${idea.id}-hook`)} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-[8px] font-black uppercase text-slate-500 hover:text-white transition-colors">
                                      {copiedId === `${idea.id}-hook` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      Hook
                                    </button>
                                    <button onClick={() => copyToClipboard(idea.concept, `${idea.id}-concept`)} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-[8px] font-black uppercase text-slate-500 hover:text-white transition-colors">
                                      {copiedId === `${idea.id}-concept` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      Plan
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-400 font-bold leading-relaxed">{idea.whyItWorks}</p>
                              </div>
                           </div>

                           {idea.validationScore && (
                             <div className="space-y-4 mb-10">
                               {idea.isBestPick && (
                                 <div className="p-4 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                     <span className="text-xl">Trophy</span>
                                     <div>
                                       <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Best Pick</div>
                                       <div className="text-xs text-slate-400">{idea.bestPickReason}</div>
                                     </div>
                                   </div>
                                   {idea.recommendedToday && (
                                     <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-[9px] font-black text-emerald-400 uppercase tracking-widest hidden sm:block">
                                       Recommended to post today
                                     </span>
                                   )}
                                 </div>
                               )}
                               <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                 <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 text-center">
                                   <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Hook</div>
                                   <div className={cn("text-lg font-black", idea.hookStrength >= 8 ? "text-emerald-400" : idea.hookStrength >= 6 ? "text-amber-400" : "text-red-400")}>{idea.hookStrength}/10</div>
                                 </div>
                                 <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 text-center">
                                   <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Original</div>
                                   <div className={cn("text-lg font-black", idea.originality >= 8 ? "text-emerald-400" : idea.originality >= 6 ? "text-amber-400" : "text-red-400")}>{idea.originality}/10</div>
                                 </div>
                                 <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 text-center">
                                   <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Clarity</div>
                                   <div className={cn("text-lg font-black", idea.clarity >= 8 ? "text-emerald-400" : idea.clarity >= 6 ? "text-amber-400" : "text-red-400")}>{idea.clarity}/10</div>
                                 </div>
                                 <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 text-center">
                                   <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Viral</div>
                                   <div className={cn("text-lg font-black", idea.viralityPotential >= 8 ? "text-emerald-400" : idea.viralityPotential >= 6 ? "text-amber-400" : "text-red-400")}>{idea.viralityPotential}/10</div>
                                 </div>
                               </div>
                               {idea.whyNotHigher && (
                                 <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-left">
                                   <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Why not higher?</div>
                                   <div className="text-xs text-slate-400">{idea.whyNotHigher}</div>
                                 </div>
                               )}
                               <div className="pt-4 border-t border-white/5">
                                 <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Try a stronger version?</div>
                                 <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                                   <button 
                                     onClick={() => handlePivot(idea, 'viral')}
                                     disabled={loading?.toString().startsWith('pivot')}
                                     className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[9px] font-black uppercase text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                                   >
                                     More Viral
                                   </button>
                                   <button 
                                     onClick={() => handlePivot(idea, 'controversy')}
                                     disabled={loading?.toString().startsWith('pivot')}
                                     className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-[9px] font-black uppercase text-purple-400 hover:bg-purple-500/20 transition-all disabled:opacity-50"
                                   >
                                     More Controversial
                                   </button>
                                   <button 
                                     onClick={() => handlePivot(idea, 'money')}
                                     disabled={loading?.toString().startsWith('pivot')}
                                     className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                                   >
                                     Money-Focused
                                   </button>
                                   <button 
                                     onClick={() => handlePivot(idea, 'simple')}
                                     disabled={loading?.toString().startsWith('pivot')}
                                     className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[9px] font-black uppercase text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-50"
                                   >
                                     Make it Simpler
                                   </button>
                                 </div>
                               </div>
                             </div>
                           )}

                           {activePlan?.id === idea.id && (
                              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-16 pt-16 border-t border-white/5 space-y-12 text-left">
                                 {activePlan?.content === "PAYWALL" && !isSubscribed ? (
                                   <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-center space-y-8 relative overflow-hidden">
                                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                                      <div className="space-y-4">
                                        <h3 className="text-2xl md:text-3xl font-black text-white italic">YOU'RE ONE STEP AWAY.</h3>
                                        <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
                                          Unlock full blueprints, AI scene boards, and trend intelligence for your niche.
                                        </p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                                         {[
                                           { label: 'Elite VO Scripts', icon: Music },
                                           { label: 'Scene Cues', icon: Camera },
                                           { label: 'AI Prompts', icon: Eye },
                                           { label: 'No Limits', icon: Zap },
                                         ].map((feat, i) => (
                                           <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                              <feat.icon className="w-4 h-4 text-indigo-400" />
                                              <span className="text-[10px] font-black uppercase text-slate-400">{feat.label}</span>
                                           </div>
                                         ))}
                                      </div>
                                      <button 
                                        onClick={() => setIsSubscribed(true)}
                                        className="w-full md:w-auto px-8 md:px-12 py-4 md:py-6 bg-white text-black rounded-full font-black text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.4em] hover:bg-indigo-100 transition-all shadow-2xl"
                                      >
                                        UPGRADE FOR ₹499/MONTH
                                      </button>
                                   </div>
                                 ) : (
                                   <>
                                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                                        {[
                                          { label: 'Scene Board', icon: Camera, color: 'text-blue-400' },
                                          { label: 'AI Prompts', icon: Eye, color: 'text-purple-400' },
                                          { label: 'Fast Edits', icon: Edit3, color: 'text-amber-400' },
                                          { label: 'Elite VO', icon: Music, color: 'text-emerald-400' },
                                        ].map((m, i) => (
                                          <div key={i} className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 flex flex-col items-center gap-4 group cursor-help transition-all hover:bg-white/10">
                                             <m.icon className={cn("w-5 h-5", m.color)} />
                                             <span className="text-[9px] font-black uppercase text-slate-600 tracking-[0.2em]">{m.label}</span>
                                          </div>
                                        ))}
                                     </div>
                                     <div className="bg-[#050505] rounded-2xl md:rounded-[3rem] p-6 md:p-12 font-mono text-[11px] text-slate-500 leading-9 whitespace-pre-wrap border border-white/10 shadow-inner relative group text-left">
                                       <div className="absolute top-4 right-4 md:top-8 md:right-12 text-[9px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                         <FileText className="w-3 h-3" />
                                         Execution Script v1.0
                                       </div>
                                       {activePlan?.content}
                                     </div>
                                   </>
                                 )}
                              </motion.div>
                            )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </section>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-24 md:mt-48 pt-12 md:pt-16 border-t border-white/5 text-center space-y-8">
           <div className="flex items-center justify-center gap-6 md:gap-12 opacity-20 grayscale transition-all hover:opacity-50 hover:grayscale-0">
             <Video className="w-5 h-5 md:w-6 md:h-6" />
             <BarChart3 className="w-5 h-5 md:w-6 md:h-6" />
             <Activity className="w-5 h-5 md:w-6 md:h-6" />
             <Zap className="w-5 h-5 md:w-6 md:h-6" />
           </div>
           <p className="text-[8px] md:text-[10px] text-slate-700 font-black uppercase tracking-[0.3em] md:tracking-[0.6em] px-4">Powered by Intelligence Engine 2.5 • Decision Architecture 1.0</p>
        </footer>
      </main>
    </div>
  );
}
