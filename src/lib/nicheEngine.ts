import { searchTopVideos } from "./youtube";
import { callGeminiResilient } from "./gemini";

export interface NicheScore {
  niche: string;
  growth: number;
  competition: number;
  consistency: number;
  monetization: number;
  finalScore: number;
  topPatterns: string[];
}

export interface NicheDecision {
  winner: string;
  confidence: number;
  reasoning: string[];
  realityCheck: string[];
  requirements: string[];
  roadmap: { week: string; task: string }[];
  projection: string[];
  risks: string[];
  alternatives: { name: string; condition: string }[];
  comparison: NicheScore[];
}

export interface UserProfile {
  skill?: string;
  interest?: string;
  goal?: string;
}

const MONETIZATION_MAP: Record<string, number> = {
  "ai": 9.5, "tech": 9, "finance": 9.8, "crypto": 9.7,
  "fitness": 7.5, "health": 8, "vlog": 5, "gaming": 6,
  "education": 7, "business": 9.2, "motivation": 6.5,
  "software": 9.4, "saas": 9.5, "real estate": 9.3,
  "default": 7
};

export function extractNiches(input: string): string[] {
  // Normalize input: "AI vs Fitness" or "AI, Fitness"
  const normalized = input.toLowerCase().replace(/ vs /g, ",").replace(/\//g, ",");
  const niches = normalized.split(",").map(n => n.trim()).filter(n => n.length > 0);
  
  if (niches.length === 0 || input.includes("what should i start")) {
    return ["AI Tools", "Fitness", "Study Motivation"]; // Strategic Defaults
  }
  
  return niches.slice(0, 4); // Max 4 niches for performance
}

export async function analyzeNicheMarket(niche: string, userProfile?: UserProfile): Promise<NicheScore> {
  const videos = await searchTopVideos(niche);
  const now = new Date();
  
  const velocities = videos.map(v => {
    const publishedAt = new Date(v.publishedDate);
    const hoursOld = Math.max(1, (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60));
    return v.viewCount / hoursOld;
  });

  const avgVelocity = velocities.reduce((a, b) => a + b, 0) / Math.max(1, velocities.length);
  const highAuthorityCount = videos.filter(v => v.subscriberCount > 100000).length;
  
  // Growth (0-10) scaled against a benchmark
  const growth = Math.min(10, (avgVelocity / 500) * 10);
  // Competition (0-10) based on high authority dominance
  const competition = Math.min(10, (highAuthorityCount / videos.length) * 10);
  
  // Consistency (Static heuristic for now based on recent uploads)
  const recentCount = videos.filter(v => {
    const publishedAt = new Date(v.publishedDate);
    return (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24) < 30; // Last 30 days
  }).length;
  const consistency = Math.min(10, (recentCount / videos.length) * 10);

  // Monetization lookup
  const baseTag = Object.keys(MONETIZATION_MAP).find(k => niche.toLowerCase().includes(k)) || "default";
  const monetization = MONETIZATION_MAP[baseTag];

  // The Market Formula
  const marketScore = (growth * 0.35) + (monetization * 0.4) + (consistency * 0.15) - (competition * 0.1);

  // User Fit Logic
  let userFitScore = 5; // Default neutral fit
  if (userProfile) {
    const n = niche.toLowerCase();
    const interest = (userProfile.interest || "").toLowerCase();
    const skill = (userProfile.skill || "").toLowerCase();
    const goal = (userProfile.goal || "").toLowerCase();

    // Interest match
    if (interest && (n.includes(interest) || interest.includes(n) || (n.includes("ai") && interest.includes("tech")))) {
      userFitScore += 3;
    }
    // Goal match
    if (goal === "money" && monetization > 8) userFitScore += 2;
    if (goal === "fast growth" && growth > 7) userFitScore += 2;
    // Skill alignment
    if (skill === "editing" && (n.includes("faceless") || n.includes("documentary"))) userFitScore += 2;
    if (skill === "talking" && (n.includes("vlog") || n.includes("podcast"))) userFitScore += 2;
    
    // Bounds check
    userFitScore = Math.min(10, Math.max(0, userFitScore));
  }

  // The V2 Decision Formula: Market + Context
  const finalScore = userProfile ? (marketScore * 0.6) + (userFitScore * 0.4) : marketScore;

  return {
    niche,
    growth: parseFloat(growth.toFixed(1)),
    competition: parseFloat(competition.toFixed(1)),
    consistency: parseFloat(consistency.toFixed(1)),
    monetization,
    finalScore: parseFloat(finalScore.toFixed(2)),
    topPatterns: videos.slice(0, 3).map(v => v.title)
  };
}

export async function generateNicheDecision(scores: NicheScore[], userProfile?: UserProfile): Promise<NicheDecision> {
  const prompt = `
    You are a brutally honest, highly experienced YouTube growth mentor.

    Your goal is NOT to give options.
    Your goal is to make a clear decision and install confidence.

    For the given user input:
    1. Decide the best niche/path
    2. Explain why it fits the user
    3. Give a REALITY CHECK (struggles, difficulty)
    4. Define what work is actually required
    5. Give a 30-day execution roadmap
    6. Predict realistic growth timeline
    7. Warn about common failure mistakes
    8. Provide ONE alternative only if strong

    USER PROFILE:
    ${userProfile ? JSON.stringify(userProfile, null, 2) : "No specific profile provided. Assume a beginner looking for fast growth."}

    DATA STACK (Market Scores + Fit Scores):
    ${JSON.stringify(scores, null, 2)}
    
    OUTPUT FORMAT (STRICT JSON):
    {
      "winner": "AI Tools (Name of Best Niche)",
      "confidence": 8.6,
      "reasoning": [
        "Why this fits perfectly based on user interest",
        "Why the monetization/growth makes sense",
        "Another specific mentor reason"
      ],
      "realityCheck": [
        "What harsh truths they need to accept",
        "Where they will struggle in the beginning",
        "When they will want to quit"
      ],
      "requirements": [
        "What daily/weekly actions are non-negotiable",
        "Specific skills they MUST execute on"
      ],
      "roadmap": [
        { "week": "Week 1", "task": "Learn X and post Y" },
        { "week": "Week 2", "task": "Do Z to improve hooks" },
        { "week": "Week 3", "task": "Double down on W" },
        { "week": "Week 4", "task": "Analyze and repeat" }
      ],
      "projection": [
        "Month 1: (expectation)",
        "Month 2-3: (first traction)",
        "Month 4+: (growth compounds)"
      ],
      "risks": [
        "What happens if they copy others?",
        "What makes this niche hard?"
      ],
      "alternatives": [
        {
          "name": "Second Option Niche",
          "condition": "Only choose this if you can do X"
        }
      ]
    }
    
    Tone:
    - Direct
    - Practical
    - Slightly tough (not motivational fluff)
    - No generic advice

    Output must feel like: "A brutally honest mentor guiding a beginner with clarity"
    Only return JSON.
  `;

  const result = await callGeminiResilient(prompt);
  const data = JSON.parse(result.response.text().replace(/```json|```/g, "").trim());
  
  return {
    ...data,
    comparison: scores
  };
}
