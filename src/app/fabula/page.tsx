"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Sparkles, BrainCircuit, Target, Layers,
  Camera, Zap, Crown, ChevronRight, ArrowLeft,
  Volume2, Eye, Flame, Trash2
} from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function FabulaPage() {
  const [topic, setTopic] = useState("");
  const [results, setResults] = useState<any[]>([]); // Store multiple generations
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scripts, setScripts] = useState<Record<number, string>>({});
  const [generatingScript, setGeneratingScript] = useState<number | null>(null);

  const generateFullScript = async (coreStory: string, index: number) => {
    setGeneratingScript(index);
    try {
      const res = await fetch("/api/script", {
        method: "POST",
        body: JSON.stringify({ idea: { title: coreStory } }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setScripts((prev) => ({ ...prev, [index]: data.plan }));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Script generation failed.");
    } finally {
      setGeneratingScript(null);
    }
  };

  const runFabula = async () => {
    if (!topic) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/fabula", {
        method: "POST",
        body: JSON.stringify({
          topic,
          platform: "shorts",
          tone: "aggressive",
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults([data, ...results]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden pb-32">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:border-indigo-500/50">
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
          </div>
          <span className="font-black text-[10px] uppercase tracking-[0.4em]">Back to Engine</span>
        </Link>

        <div className="flex items-center gap-3">
          <Crown className="w-4 h-4 text-indigo-500" />
          <span className="font-black text-xs uppercase tracking-[0.4em]">Story<span className="text-indigo-500">.Mode</span></span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto pt-32 px-6">
        {/* Header */}
        <section className="text-center space-y-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400"
          >
            <Sparkles className="w-3 h-3" />
            Story Intelligence v2.0
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]">
            THE STORY <br />
            <span className="text-indigo-500 italic">ARCHITECTURE.</span>
          </h1>

          <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto pt-8">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter topic or raw idea..."
                className="w-full px-8 py-6 rounded-[2rem] border border-white/10 bg-white/[0.03] text-white shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-bold text-lg placeholder:text-slate-700"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && runFabula()}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2">
                {topic && <button onClick={() => setTopic("")} className="p-2 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>}
              </div>
            </div>
            <button
              onClick={runFabula}
              disabled={loading || !topic}
              className="px-10 py-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-4 h-4" /> Deploy Engine</>}
            </button>
          </div>
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 mx-auto max-w-xl p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold flex items-center justify-center gap-3">
              <span>⚠️</span> {error}
            </motion.div>
          )}
        </section>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {results.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-24"
            >
              {results.map((result, idx) => (
                <div key={idx} className="space-y-20 relative">
                  {idx > 0 && <div className="absolute -top-10 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />}

                  {/* Phase 1: Story DNA */}
                  <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-3">
                      <h2 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-500 mb-8 flex items-center gap-3">
                        <div className="w-8 h-px bg-indigo-500/30" />
                        Phase 01: Story DNA
                      </h2>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-6">
                      <BrainCircuit className="w-8 h-8 text-indigo-500" />
                      <h3 className="text-xl font-black text-white italic uppercase">Core Story</h3>
                      <p className="text-slate-400 font-bold leading-relaxed">"{result.core_story}"</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-6">
                      <Flame className="w-8 h-8 text-red-500" />
                      <h3 className="text-xl font-black text-white italic uppercase">Emotional Trigger</h3>
                      <p className="text-slate-400 font-bold leading-relaxed">{result.emotional_trigger}</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-6">
                      <Target className="w-8 h-8 text-emerald-500" />
                      <h3 className="text-xl font-black text-white italic uppercase">Curiosity Gap</h3>
                      <p className="text-slate-400 font-bold leading-relaxed">{result.curiosity_gap}</p>
                    </motion.div>
                  </section>

                  {/* Phase 2: Narrative Flow (Timeline) */}
                  <section className="space-y-12">
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-purple-500 flex items-center gap-3">
                      <div className="w-8 h-px bg-purple-500/30" />
                      Phase 02: Narrative Flow
                    </h2>

                    <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide">
                      {result.narrative_flow?.map((s: string, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="min-w-[280px] p-8 bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 rounded-[2.5rem] relative group shrink-0"
                        >
                          <div className="absolute top-8 right-8 text-[40px] font-black text-white/5 italic select-none group-hover:text-purple-500/10 transition-colors">0{i + 1}</div>
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-black mb-6">
                            {i === 0 ? <Zap className="w-5 h-5" /> : i === result.narrative_flow.length - 1 ? <Target className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                          </div>
                          <p className="text-sm font-black text-white uppercase italic tracking-tight">{s}</p>
                          {i < result.narrative_flow.length - 1 && (
                            <div className="absolute top-1/2 -right-4 translate-y-[-50%] z-10 hidden lg:block">
                              <ChevronRight className="w-6 h-6 text-white/10" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  {/* Phase 3: Visual Blocks (Production) */}
                  <section className="space-y-12">
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-500 flex items-center gap-3">
                      <div className="w-8 h-px bg-emerald-500/30" />
                      Phase 03: Visual Blocks
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {result.scene_details?.map((s: any, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          className="group p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] hover:bg-white/[0.03] transition-all"
                        >
                          <div className="flex justify-between items-start mb-8">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest px-4 py-2 bg-white/5 rounded-full">{s.scene}</h4>
                          </div>

                          <div className="space-y-8">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500/60">
                                <Eye className="w-3 h-3" /> Visual Direction
                              </div>
                              <p className="text-slate-300 font-bold leading-relaxed">{s.visual}</p>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500/60">
                                <Volume2 className="w-3 h-3" /> Voiceover Script
                              </div>
                              <div className="p-6 bg-black/40 rounded-2xl border border-white/5 text-slate-400 font-mono text-xs leading-relaxed italic">
                                "{s.voiceover}"
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="pt-10 flex flex-col items-center gap-8">
                      {!scripts[idx] ? (
                        <button 
                          onClick={() => generateFullScript(result.core_story, idx)}
                          disabled={generatingScript === idx}
                          className="px-12 py-7 bg-indigo-600 hover:bg-white hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-600/20 flex items-center gap-4 group"
                        >
                          {generatingScript === idx ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> ENGAGING SCRIPT ENGINE...</>
                          ) : (
                            <>⚡ Generate Full Cinematic Script <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                          )}
                        </button>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full mt-4 bg-black/50 p-10 rounded-[3rem] border border-white/10 relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
                          <div className="mb-8 flex items-center gap-3">
                            <Camera className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Master Blueprint Generated</h3>
                          </div>
                          <div className="font-mono text-xs md:text-sm text-slate-400 leading-relaxed whitespace-pre-wrap text-left">
                            {scripts[idx]}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </section>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-10">
                <BrainCircuit className="w-8 h-8 text-slate-700" />
              </div>
              <h2 className="text-slate-600 font-black uppercase tracking-[0.4em] text-xs transition-colors group-hover:text-indigo-500">Engine Standby</h2>
              <p className="text-slate-800 font-bold text-sm max-w-md mx-auto italic">Feed the engine a topic to deconstruct it into a high-velocity viral narrative.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-48 pt-16 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.6em]">Story Engine 2.0 • Cinematic Architecture 1.0</p>
        </footer>
      </main>
    </div>
  );
}
