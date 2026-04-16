/**
 * ViralEngine Strategic Memory System
 * Persists user history to local storage for iterative intelligence.
 */

export interface UserHistory {
  niches: string[];
  pastIdeas: string[]; // Store titles/hooks to avoid repeats
  patterns: string[];
}

const STORAGE_KEY = "viral_engine_memory";

export const saveToMemory = (niche: string, ideas: any[], patterns: any[]) => {
  if (typeof window === "undefined") return;
  
  const existing = getMemory();
  
  // Update niches
  if (!existing.niches.includes(niche)) {
    existing.niches.push(niche);
  }
  
  // Update ideas (store titles to detect duplicates)
  const newIdeaTitles = ideas.map(i => i.title);
  existing.pastIdeas = Array.from(new Set([...existing.pastIdeas, ...newIdeaTitles])).slice(-50); // Keep last 50
  
  // Update patterns
  const newPatterns = patterns.map(p => p.pattern);
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
