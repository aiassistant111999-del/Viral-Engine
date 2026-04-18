"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Loader2, Sparkles, Video, FileText, ChevronRight, ExternalLink,
  Target, BarChart3, Calendar, Activity, Zap, TrendingUp,
  BrainCircuit, AlertTriangle, DollarSign, Bomb, Lightbulb, 
  Crown, RefreshCw, Layers, Eye, Music, Camera, Edit3,
  Copy, Check, Lock, MousePointer2, ArrowRight, CheckCircle2, Flame
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { saveToMemory, getMemory } from "@/lib/memory";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [videos, setVideos] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [detectedPatterns, setDetectedPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<{ id: any; content: string } | null>(null);
  const [selectedAngle, setSelectedAngle] = useState("default");
  const [generationCount, setGenerationCount] = useState(0);
  const [nicheDecision, setNicheDecision] = useState<any>(null);
  const [isNicheActive, setIsNicheActive] = useState(false);
  const [nicheContext, setNicheContext] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState({ skill: "talking", interest: "tech", goal: "fast growth" });

  const [activeVideoAudit, setActiveVideoAudit] = useState<{ id: string; data: any } | null>(null); // New Video Audit state
  const [activeFabula, setActiveFabula] = useState<{ id: any; data: any } | null>(null); // New Fabula state
  const [error, setError] = useState<string | null>(null);
  const [statusLogs, setStatusLogs] = useState<string[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    const memory = getMemory();
    if (memory && memory.pastIdeas && memory.pastIdeas.length > 0) {
      setIsReturning(true);
    }
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAnalyze = async (overrideKeyword?: string) => {
    const searchKeyword = overrideKeyword || keyword;
    if (!searchKeyword) return;
    setError(null);
    setLoading("analyze");
    setVideos([]);
    setIdeas([]);
    setAnalysis(null);
    setNicheDecision(null);
    setIsNicheActive(false);
    setStatusLogs(["INITIALIZING MARKET AUDIT...", "CONNECTING TO HIGH-VELOCITY SIGNALS...", "BYPASSING NOISE..."]);

    const normalizedInput = searchKeyword.toLowerCase();
    const isNicheIntent = normalizedInput.includes("which") || normalizedInput.includes("what") || normalizedInput.includes("niche") || normalizedInput.includes("start");

    if (isNicheIntent) {
      setStatusLogs([
        "Analyzing market signals...",
        "Matching with your strengths...",
        "Detecting opportunity gaps...",
        "Making final decision..."
      ]);
    } else {
      setStatusLogs(["INITIALIZING MARKET AUDIT...", "CONNECTING TO HIGH-VELOCITY SIGNALS...", "BYPASSING NOISE..."]);
    }

    try {
      if (isNicheIntent) {
        setIsNicheActive(true);
        const res = await fetch("/api/niche", { method: "POST", body: JSON.stringify({ input: searchKeyword, userProfile }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Niche analysis failed");
        setNicheDecision(data);
        setNicheContext(data.reasoning ? data.reasoning.join(" ") : ""); // Store the "Why"
        setStatusLogs(prev => [...prev, "MARKET AUDIT COMPLETE.", "BEST PICK IDENTIFIED."]);
        return;
      }

      const res = await fetch("/api/analyze", { method: "POST", body: JSON.stringify({ keyword: searchKeyword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      
      setVideos(data.videos || []);
      setAnalysis(data.analysis || null);
      setDetectedPatterns(data.analysis?.dominantPatterns?.map((p: any) => ({ 
        type: p.toLowerCase().includes('curiosity') ? 'curiosity' : p.toLowerCase().includes('list') ? 'list' : 'strategy', 
        pattern: p 
      })) || []);
      
      setStatusLogs(prev => [...prev, "SIGNALS DETECTED.", "VELOCITY CALCULATED.", "READY FOR SYNTHESIS."]);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(null); }
  };

  const handleGenerateIdeas = async (angle: string = "default") => {
    setSelectedAngle(angle);
    setError(null);
    setLoading("ideas");
    setStatusLogs(["ACCESSING PSYCHOLOGICAL TRIGGERS...", "SHARPENING HOOKS...", "CALIBRATING RETENTION..."]);
    
    try {
      const res = await fetch("/api/ideas", { 
        method: "POST", 
        body: JSON.stringify({ 
          keyword, 
          analysis, 
          titles: videos.map(v => v.title), 
          angle,
          pastIdeas: ideas.map(i => i.title),
          nicheContext // Inject the strategic reasoning
        }) 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Idea generation failed");
      
      setIdeas(data.ideas || []);
      setGenerationCount(prev => prev + 1);
      saveToMemory(keyword, data.ideas || [], []);
      setStatusLogs(prev => [...prev, "IDEAS SYNTHESIZED.", "STRATEGY READY."]);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(null); }
  };

  const handleFetchPlan = async (idea: any) => {
    setError(null);
    setLoading(`plan-${idea.id}`);
    setStatusLogs(["INITIATING BLUEPRINT...", "GENERATING SCENE BOARDS..."]);
    try {
      const res = await fetch("/api/script", { method: "POST", body: JSON.stringify({ idea }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Execution plan failed");
      setActivePlan({ id: idea.id, content: data.plan });
      setStatusLogs(prev => [...prev, "PRODUCTION SYSTEM READY."]);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(null); }
  };
  const handleFetchFabula = async (idea: any) => {
    setError(null);
    setLoading(`fabula-${idea.id}`);
    setStatusLogs(["ENGAGING FABULA ENGINE...", "DECONSTRUCTING NARRATIVE...", "MAPPING SYUZHET FLOW..."]);
    try {
      const res = await fetch("/api/fabula", { method: "POST", body: JSON.stringify({ idea }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fabula generation failed");
      setActiveFabula({ id: idea.id, data: data.fabula });
      setStatusLogs(prev => [...prev, "STORY ARCHITECTURE STABLIZED."]);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(null); }
  };


  const handleAnalyzeVideo = async (video: any) => {
    setActiveVideoAudit({ id: video.id, data: null });
    try {
      const res = await fetch("/api/video-audit", { method: "POST", body: JSON.stringify({ video }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Audit failed");
      setActiveVideoAudit({ id: video.id, data });
    } catch (e: any) {
      setError(e.message);
      setActiveVideoAudit(null);
    }
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
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-between items-center backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-[10px] md:text-xs uppercase tracking-[0.4em] whitespace-nowrap">ViralEngine<span className="text-indigo-500">.AI</span></span>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-white/[0.03] border border-white/5 rounded-2xl backdrop-blur-xl">
           <button 
             onClick={() => setIsNicheActive(true)}
             className={cn("px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2", isNicheActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:text-white")}
           >
             <Target className="w-3 h-3" />
             Strategist
           </button>
           <button 
             onClick={() => setIsNicheActive(false)}
             className={cn("px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2", !isNicheActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:text-white")}
           >
             <Zap className="w-3 h-3" />
             Generator
           </button>
           <Link 
             href="/fabula"
             className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 text-slate-500 hover:text-white"
           >
             <Crown className="w-3 h-3 text-amber-500" />
             Story
           </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-32 md:pt-40 px-4 md:px-8 relative z-10">
        <section className="text-center space-y-12 mb-16 md:mb-32">
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter text-white max-w-5xl mx-auto leading-[0.8]">
            STOP GUESSING <br />
            <span className="text-indigo-500 italic">WHAT TO POST.</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-xs">Based on real YouTube data in seconds</p>
          
          {isNicheActive && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto pt-6 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 pl-4 pr-2 py-2 rounded-[2rem] shadow-lg shadow-black/20">
                <span className="text-slate-500">Skill:</span>
                <select className="bg-transparent text-white focus:outline-none cursor-pointer p-1" value={userProfile.skill} onChange={e => setUserProfile(prev => ({...prev, skill: e.target.value}))}>
                  <option className="bg-black" value="talking">Talking</option>
                  <option className="bg-black" value="editing">Editing</option>
                  <option className="bg-black" value="research">Research</option>
                </select>
              </div>
              <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 pl-4 pr-2 py-2 rounded-[2rem] shadow-lg shadow-black/20">
                <span className="text-slate-500">Interest:</span>
                <select className="bg-transparent text-white focus:outline-none cursor-pointer p-1" value={userProfile.interest} onChange={e => setUserProfile(prev => ({...prev, interest: e.target.value}))}>
                  <option className="bg-black" value="tech">Tech & AI</option>
                  <option className="bg-black" value="fitness">Fitness</option>
                  <option className="bg-black" value="finance">Finance</option>
                  <option className="bg-black" value="motivation">Motivation</option>
                  <option className="bg-black" value="gaming">Gaming</option>
                  <option className="bg-black" value="education">Education</option>
                </select>
              </div>
              <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 pl-4 pr-2 py-2 rounded-[2rem] shadow-lg shadow-black/20">
                <span className="text-slate-500">Goal:</span>
                <select className="bg-transparent text-indigo-400 font-bold focus:outline-none cursor-pointer p-1" value={userProfile.goal} onChange={e => setUserProfile(prev => ({...prev, goal: e.target.value}))}>
                  <option className="bg-black" value="fast growth">Fast Growth</option>
                  <option className="bg-black" value="long-term brand">Long-term Brand</option>
                  <option className="bg-black" value="money">Money</option>
                </select>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-6 max-w-4xl mx-auto pt-10">
            <input
              type="text"
              placeholder="Try: AI Tools vs Fitness vs Finance..."
              className="w-full px-8 py-7 rounded-[2.5rem] border border-white/5 bg-white/[0.03] text-white shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-black text-xl placeholder:text-slate-700"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <button onClick={() => handleAnalyze()} disabled={!!loading} className="px-14 py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xl hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-4">
              {loading === "analyze" ? <Loader2 className="w-6 h-6 animate-spin" /> : "AUDIT MARKET"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto mt-8">
            {(isNicheActive
              ? [
                  "Which is more profitable: AI tools vs Personal Finance?",
                  "I'm a beginner with no budget. What niche should I start?",
                  "Is the fitness/gym niche too saturated to start in?",
                  "Gaming vs Tech Reviews: Which has better sponsor rates?",
                  "What are the most explosive faceless niches right now?",
                  "What niche works best for purely educational content?"
                ]
              : [
                  "How do I make a viral hook for a video about AI?",
                  "Top 10 mistakes beginner YouTube creators make",
                  "Content ideas for a Faceless psychology hacks channel",
                  "How to explain complex finance concepts simply",
                  "Content strategy for a 30-day fitness transformation",
                  "Hidden secrets real estate agents don't tell you"
                ]
            ).map((promptText, idx) => (
              <button 
                key={idx}
                onClick={() => { setKeyword(promptText); handleAnalyze(promptText); }}
                className="flex items-start text-left gap-3 px-4 py-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 rounded-xl transition-all group"
              >
                <div className="pt-0.5">
                  {isNicheActive ? (
                    <Target className="w-4 h-4 text-indigo-400 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  ) : (
                    <Lightbulb className="w-4 h-4 text-emerald-400 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  )}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-300 leading-snug line-clamp-2">{promptText}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-20 space-y-4">
              {statusLogs.map((log, i) => (
                <div key={i} className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400/60 animate-pulse">{log}</div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isNicheActive && nicheDecision && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
              <div className="text-center space-y-4">
                <div className="flex flex-col items-center justify-center space-y-6 mb-12">
                  <div className="h-px w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                  <h2 className="text-sm font-black uppercase tracking-[0.4em] text-indigo-500 flex items-center gap-3">
                    <Target className="w-5 h-5 text-amber-400" />
                    Venture Mentor V2
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                  {nicheDecision.comparison.map((n: any) => (
                    <div key={n.niche} className={cn("p-8 rounded-[3rem] border transition-all", n.niche === nicheDecision.winner ? "bg-indigo-600/10 border-indigo-500/40 shadow-2xl shadow-indigo-600/20" : "bg-white/[0.02] border-white/5 opacity-40")}>
                      <h3 className="text-lg font-black text-white uppercase italic mb-6">{n.niche}</h3>
                      <div className="text-xs space-y-3 font-black text-slate-500">
                        <div className="flex justify-between">
                          <span>MARKET FIT</span>
                          <span className={n.finalScore >= 8 ? 'text-emerald-400' : n.finalScore >= 6 ? 'text-amber-400' : 'text-red-400'}>
                            {n.finalScore >= 8 ? '🟢 High' : n.finalScore >= 6 ? '🟡 Medium' : '🔴 Low'} ({n.finalScore})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>GROWTH</span>
                          <span className={n.growth >= 7 ? 'text-emerald-400' : n.growth >= 4 ? 'text-amber-400' : 'text-red-400'}>
                            {n.growth >= 7 ? '🟢 High' : n.growth >= 4 ? '🟡 Medium' : '🔴 Low'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>COMPETITION</span>
                          <span className={n.competition <= 4 ? 'text-emerald-400' : n.competition <= 7 ? 'text-amber-400' : 'text-red-400'}>
                            {n.competition <= 4 ? '🟢 Low' : n.competition <= 7 ? '🟡 Medium' : '🔴 High'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>MONEY</span>
                          <span className={n.monetization >= 8 ? 'text-emerald-400' : n.monetization >= 5 ? 'text-amber-400' : 'text-red-400'}>
                            {n.monetization >= 8 ? '🟢 High' : n.monetization >= 5 ? '🟡 Medium' : '🔴 Low'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-16 max-w-5xl mx-auto bg-gradient-to-b from-[#0f0f13] to-[#0a0a0c] border-2 border-indigo-500/30 rounded-[4rem] p-8 md:p-16 text-left relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 border-b border-white/5 pb-8">
                    <div>
                      <h3 className="text-[10px] md:text-xs font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Crown className="w-4 h-4" /> YOUR BEST MOVE RIGHT NOW
                      </h3>
                      <div className="text-4xl md:text-6xl font-black text-white italic truncate">{nicheDecision.winner}</div>
                    </div>
                    <div className="flex flex-col md:text-right mt-6 md:mt-0">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confidence Score</div>
                      <div className="text-3xl font-black text-indigo-400">{nicheDecision.confidenceScore || "9.0"} / 10</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-12">
                       {/* 3. Why THIS works */}
                       <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                           <Lightbulb className="w-4 h-4" /> Why THIS is the right move for YOU
                         </h4>
                         <ul className="text-slate-300 font-bold leading-relaxed text-sm space-y-2">
                           {nicheDecision.reasoning?.map((reason: string, i: number) => (
                             <li key={i} className="flex gap-2"><span className="text-emerald-500 shrink-0">•</span> <span>{reason}</span></li>
                           ))}
                         </ul>
                       </div>

                       {/* 4. Reality Check */}
                       <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                           <AlertTriangle className="w-4 h-4" /> Reality Check
                         </h4>
                         <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 text-xs font-bold leading-relaxed space-y-3">
                           <p className="uppercase tracking-widest text-[10px] text-amber-500 font-black">This is NOT easy. You will:</p>
                           <ul className="space-y-2">
                             {nicheDecision.realityCheck?.map((check: string, i: number) => (
                               <li key={i} className="flex gap-2"><span className="shrink-0">•</span> <span>{check}</span></li>
                             ))}
                           </ul>
                           <p className="text-amber-500/80 italic pt-2 border-t border-amber-500/20">Most people quit here.</p>
                         </div>
                       </div>

                       {/* 5. What it ACTUALLY demands */}
                       <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                           <Zap className="w-4 h-4" /> What this niche ACTUALLY demands
                         </h4>
                         <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-300 text-xs font-bold leading-relaxed space-y-3">
                           <p className="uppercase tracking-widest text-[9px] text-indigo-400 font-black">To win here, you must:</p>
                           <ul className="space-y-2">
                             {nicheDecision.requirements?.map((req: string, i: number) => (
                               <li key={i} className="flex gap-2"><span className="shrink-0">•</span> <span>{req}</span></li>
                             ))}
                           </ul>
                         </div>
                       </div>
                    </div>

                    <div className="space-y-12">
                       {/* 6. Execution Path (Roadmap) */}
                       <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                           <Calendar className="w-4 h-4" /> Your First 30 Days (Clear Roadmap)
                         </h4>
                         <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/10 space-y-4">
                           {nicheDecision.roadmap?.map((rm: any, i: number) => (
                             <div key={i} className="text-xs space-y-1">
                               <div className="text-emerald-400 font-black uppercase tracking-widest text-[10px]">{rm.week}:</div>
                               <div className="text-slate-300 font-bold leading-relaxed">{rm.task}</div>
                             </div>
                           ))}
                         </div>
                       </div>

                       {/* 7. Future Projection */}
                       <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                           <TrendingUp className="w-4 h-4" /> What happens if you stay consistent
                         </h4>
                         <div className="p-6 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                           {nicheDecision.projection?.map((proj: string, i: number) => (
                             <p key={i} className="text-slate-400 font-bold leading-relaxed text-xs">
                               {proj}
                             </p>
                           ))}
                         </div>
                       </div>

                       {/* 8. Risk Warning */}
                       <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                           <Flame className="w-4 h-4" /> Risks (Mentor Honesty)
                         </h4>
                         <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5 text-red-400 text-xs font-bold leading-relaxed">
                           <p className="uppercase tracking-widest text-[9px] mb-2 text-red-500/70">If you:</p>
                           <ul className="space-y-2">
                             {nicheDecision.risks?.map((risk: string, i: number) => (
                               <li key={i} className="flex gap-2"><span className="shrink-0">•</span> <span>{risk}</span></li>
                             ))}
                           </ul>
                         </div>
                       </div>

                       {/* 9. Second Option */}
                       {nicheDecision.alternatives?.length > 0 && (
                         <div className="space-y-4 pt-4 border-t border-white/5">
                           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                             <Layers className="w-4 h-4" /> Second Option
                           </h4>
                           {nicheDecision.alternatives.map((alt: any, i: number) => (
                             <div key={i} className="text-slate-500 font-bold leading-relaxed text-xs space-y-2">
                               <div className="text-white text-sm italic">{alt.name}</div>
                               <div className="italic text-[10px] uppercase tracking-widest">Choose this ONLY if:</div>
                               <div className="flex gap-2"><span className="shrink-0">•</span> {alt.condition}</div>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="mt-16 text-center space-y-4 flex flex-col items-center border-t border-white/5 pt-12">
                    <button 
                      onClick={() => {
                        setKeyword(nicheDecision.winner);
                        handleAnalyze(nicheDecision.winner);
                      }}
                      className="px-10 py-6 bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white rounded-[2rem] font-black text-sm md:text-base uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-600/30 flex items-center gap-3"
                    >
                      🔥 Lock this niche & start creating
                    </button>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-2">We’ll generate your first viral ideas instantly</p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {!isNicheActive && videos.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-40">
              <section className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-16 grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-12">
                  <h2 className="text-5xl font-black text-white italic tracking-tight uppercase">Pattern Intelligence</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detectedPatterns.map((p, i) => (
                      <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="text-[10px] font-black uppercase text-indigo-400 mb-2">{p.type}</div>
                        <div className="text-xs text-slate-300 font-bold">{p.pattern}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-12 text-right">
                  <h2 className="text-5xl font-black text-white italic tracking-tight uppercase">Strategy Angle</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {['fear', 'money', 'mistake', 'default'].map(a => (
                      <button key={a} onClick={() => handleGenerateIdeas(a)} className={cn("p-8 rounded-[3rem] bg-white/[0.03] border border-white/5 text-left font-black uppercase tracking-widest text-xs", selectedAngle === a && "bg-indigo-600/20 border-indigo-500")}>
                        {a}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => handleGenerateIdeas()} className="w-full py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black text-sm tracking-widest">GENERATE ELITE IDEAS</button>
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {videos.map(v => (
                  <div key={v.id} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6 group">
                    <div className="relative aspect-video rounded-2xl overflow-hidden">
                       <img src={v.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>
                    <h4 className="text-sm font-bold text-white line-clamp-2" dangerouslySetInnerHTML={{ __html: v.title }} />
                    
                    <button 
                      onClick={() => handleAnalyzeVideo(v)}
                      className="w-full py-3 bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      Deep Audit Strategy
                    </button>

                    {activeVideoAudit?.id === v.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-6 space-y-6 border-t border-white/5 overflow-hidden text-left">
                         {!activeVideoAudit?.data ? (
                           <div className="text-[9px] font-black uppercase text-indigo-400 animate-pulse">Forensic Audit in progress...</div>
                         ) : (
                           <div className="space-y-6">
                              <div className="space-y-2">
                                 <h5 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Growth Chemistry</h5>
                                 {activeVideoAudit?.data?.growthChemistry?.map((c: string, i: number) => (
                                   <p key={i} className="text-[10px] text-slate-400 font-bold">• {c}</p>
                                 ))}
                              </div>
                              <div className="space-y-2">
                                 <h5 className="text-[9px] font-black text-red-400 uppercase tracking-widest">Mistakes to Avoid</h5>
                                 {activeVideoAudit?.data?.mistakesToAvoid?.map((m: string, i: number) => (
                                   <p key={i} className="text-[10px] text-slate-400 font-bold">⚠ {m}</p>
                                 ))}
                              </div>
                              <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                 <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Likely Framework</h5>
                                 <p className="text-[10px] text-slate-300 font-mono leading-relaxed">{activeVideoAudit?.data?.framework}</p>
                              </div>
                           </div>
                         )}
                      </motion.div>
                    )}
                  </div>
                ))}
              </section>

              {ideas.length > 0 && (
                <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {ideas.map(idea => (
                    <div key={idea.id} className="bg-[#111114] border border-white/5 rounded-[4rem] p-12 space-y-10">
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-3 py-1.5 bg-indigo-500/10 rounded-xl">{idea.trigger}</span>
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-3 py-1.5 bg-emerald-500/10 rounded-xl">{idea.validationScore?.toFixed(1)}/10</span>
                        </div>
                        <h3 className="text-3xl font-black text-white italic uppercase">{idea.title}</h3>
                        <p className="text-xl font-bold text-indigo-400 italic">“{idea.hook}”</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleFetchPlan(idea)} className="py-6 bg-white/5 border border-white/10 rounded-3xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Basic Blueprint</button>
                        <button onClick={() => handleFetchFabula(idea)} className="py-6 bg-indigo-600 rounded-3xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                          <Crown className="w-3 h-3" />
                          Story Mode
                        </button>
                      </div>

                      {activePlan?.id === idea.id && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-black/50 p-8 rounded-3xl font-mono text-[11px] text-slate-500 leading-relaxed overflow-hidden border border-white/5">
                          {activePlan?.content}
                        </motion.div>
                      )}

                      {(() => {
                        const fabula = activeFabula?.id === idea.id ? activeFabula?.data : null;
                        if (!fabula) return null;
                        
                        return (
                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pt-8 border-t border-white/5 text-left">
                            <div className="space-y-4">
                              <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <BrainCircuit className="w-4 h-4" /> 1. Core Story (Fabula)
                              </h4>
                              <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl italic text-slate-300 font-bold leading-relaxed">
                                "{fabula.fabula?.coreStory}"
                                <div className="mt-4 text-[9px] font-black uppercase text-indigo-500/60">Change: {fabula.fabula?.theChange}</div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Layers className="w-4 h-4" /> 2. Narrative Flow (Syuzhet)
                              </h4>
                              <div className="space-y-3">
                                {fabula.syuzhet?.map((s: any, idx: number) => (
                                  <div key={idx} className="p-4 bg-white/[0.03] border border-white/5 rounded-xl flex gap-4">
                                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-[10px] font-black">{idx + 1}</div>
                                    <div>
                                      <div className="text-[10px] font-black text-white uppercase italic">{s.scene}</div>
                                      <p className="text-[10px] text-slate-500 font-bold mt-1">{s.action}</p>
                                      <div className="text-[9px] text-purple-500/60 font-black uppercase mt-2">Conflict: {s.internalConflict}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Camera className="w-4 h-4" /> 3. Script + Visuals
                              </h4>
                              <div className="p-6 bg-black/40 rounded-3xl font-mono text-[10px] text-slate-400 leading-relaxed border border-white/5 whitespace-pre-wrap">
                                <div className="mb-4 text-emerald-500/60 uppercase font-black">Aesthetic: {fabula.production?.visualStyle}</div>
                                {fabula.production?.script}
                                <div className="mt-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                                  🔁 <strong>Loop:</strong> {fabula.production?.loopLogic}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })()}
                    </div>
                  ))}
                </section>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-48 pt-16 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.6em]">Powered by Intelligence Engine 2.5 • Decision Architecture 1.0</p>
        </footer>
      </main>
    </div>
  );
}
