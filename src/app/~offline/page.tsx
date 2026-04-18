"use client";

import { motion } from "framer-motion";
import { Zap, WifiOff } from "lucide-react";

export default function OfflineFallback() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 max-w-md">
        <div className="w-24 h-24 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
           <WifiOff className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-black italic">YOU'RE OFFLINE.</h1>
        <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">
          ViralEngine.AI intelligence connection severed. Please reconnect to the grid to continue reverse-engineering the market.
        </p>
        <button onClick={() => window.location.reload()} className="mt-8 px-8 py-4 bg-indigo-600 rounded-full font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-3 mx-auto">
           <Zap className="w-4 h-4" />
           Retry Connection
        </button>
      </motion.div>
    </div>
  );
}
