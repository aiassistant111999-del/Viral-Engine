/**
 * ViralEngine Strategic Memory System
 * Persists user history to local storage for iterative intelligence.
 */

export interface UserHistory {
  lastNiche?: string;
  niches: string[];
  pastIdeas: string[]; // Store titles/hooks to avoid repeats
  patterns: string[];
}

const STORAGE_KEY = "viral_engine_memory";

export const saveToMemory = (niche: string, ideas: any[], patterns: any[]) => {
  if (typeof window === "undefined") return;
  
  const existing = getMemory();
  
  // Niche-Isolation Check: If user switches niche, wipe strategy but keep niche list
  if (existing.lastNiche && existing.lastNiche !== niche) {
    console.log("NICHE SWITCH DETECTED — Clearing strategic memory to prevent bias.");
    existing.pastIdeas = [];
    existing.patterns = [];
  }
  
  existing.lastNiche = niche;
  
  // Update niches list
  if (!existing.niches.includes(niche)) {
    existing.niches.push(niche);
  }
  
  // Update ideas (store titles to detect duplicates)
  const newIdeaTitles = ideas.map(i => i.title);
  existing.pastIdeas = Array.from(new Set([...existing.pastIdeas, ...newIdeaTitles])).slice(-50); 
  
  // Update patterns
  const newPatterns = patterns.map(p => p.pattern || p);
  existing.patterns = Array.from(new Set([...existing.patterns, ...newPatterns])).slice(-20);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

export const getMemory = (): UserHistory => {
  if (typeof window === "undefined") return { niches: [], pastIdeas: [], patterns: [] };
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return { niches: [], pastIdeas: [], patterns: [] };
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    return { niches: [], pastIdeas: [], patterns: [] };
  }
};
