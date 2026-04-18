import { GoogleGenerativeAI } from "@google/generative-ai";
import { validateOutput, improveOutput, passesThreshold, calculateAvgScore, selectBestIdea } from "./validator";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiModel = (modelName: string = "gemini-2.5-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Resilient API Wrapper with Exponential Backoff + Fallback
 */
export async function callGeminiResilient(prompt: string, modelName: string = "gemini-2.5-flash", attempts: number = 2): Promise<any> {
  let currentModel = modelName;
  
  for (let i = 0; i < attempts; i++) {
    try {
      const model = getGeminiModel(currentModel);
      const result = await model.generateContent(prompt);
      return result;
    } catch (error: any) {
      const is503 = error?.status === 503 || error?.message?.includes("503") || error?.message?.includes("high demand");
      const is429 = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota") || error?.message?.includes("limit");
      
      if ((is503 || is429) && i < attempts - 1) {
        console.warn(`Gemini ${is429 ? "429 (Quota)" : "503"} detected. Retrying with Lite Fallback (gemini-2.5-flash-lite) in ${1000 * (i + 1)}ms...`);
        // Pivot to 2.5 Lite model if 2.5 Flash is saturated or quota-restricted
        currentModel = "gemini-2.5-flash-lite";
        await new Promise(resolve => setTimeout(resolve, 1500 * (i + 1))); // Slightly longer wait for quota
        continue;
      }
      throw error;
    }
  }
}

/**
 * Upgrade 6: Confidence Engine Heuristics
 */
export function calculateConfidence(idea: any): number {
  let score = 0;
  const hookLen = idea.hook.split(" ").length;
  // Hook length penalty/bonus
  if (hookLen <= 10) score += 3;
  else if (hookLen <= 12) score += 2;
  
  // Psychological keyword boost
  const content = (idea.title + " " + idea.hook + " " + idea.concept).toLowerCase();
  if (content.includes("you") || content.includes("your")) score += 2;
  if (content.match(/secret|mistake|don't|stop|fix/)) score += 3;
  if (content.includes("money") || content.includes("fail")) score += 2;
  
  return Math.min(Math.round((score / 10) * 100) / 10, 10);
}

/**
 * Upgrade 2: Elite Phase 2 Prompt (Pattern Intelligence)
 */
export async function analyzePatterns(keyword: string, videos: any[]) {
  const model = getGeminiModel();
  
  const now = new Date();
  const trendSignals = videos.map(v => {
    const publishedAt = new Date(v.publishedDate);
    const hoursOld = Math.max(1, (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60));
    const rawVelocity = v.viewCount / hoursOld;
    const recencyBoost = hoursOld < 48 ? 1.5 : 1;
    const viralScore = Math.floor(rawVelocity * recencyBoost);
    
    return { title: v.title, velocity: viralScore, isRecent: hoursOld < 48 };
  });

  const videoData = videos.map(v => `Title: ${v.title} | Views: ${v.viewCount}`).join("\n");
  
  const elitePrompt = `
    You are a TOP 1% YouTube growth strategist for niche: "${keyword}".
    DATA STACK:
    ${videoData}
    Velocity Data: ${JSON.stringify(trendSignals)}

    TASK:
    Reverse-engineer the PSYCHOLOGICAL strategy behind these winning videos. 

    DEEP EXTRACTION REQUIREMENTS:
    1. DOMINANT EMOTIONAL TRIGGERS: (Fear of missing out, Greed/Money, Status protection, Curiosity).
    2. CURIOSITY GAP TYPES: (Specific vs Open, Question-based, Contradiction).
    3. PROMISE TYPES: (Immediate Result, Survival Warning, Hidden Secret).
    4. GROWTH GAPS: What are these videos MISSING that we can exploit?

    OUTPUT FORMAT (STRICT JSON):
    {
      "dominantPatterns": [], 
      "emotionalTriggers": [], 
      "curiosityGaps": [], 
      "promiseTypes": [],
      "emergingOpportunities": [],
      "marketSaturation": "high/med/low",
      "audienceTarget": ""
    }
    Only return JSON.
  `;

  const result = await callGeminiResilient(elitePrompt);
  try {
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (e) {
    return { dominantPatterns: [], emotionalTriggers: [], curiosityGaps: [], promiseTypes: [], emergingOpportunities: [], marketSaturation: "med", audienceTarget: "General" };
  }
}

/**
 * Upgrade 3, 5, 6 & 7: Deadly Idea Generation with Strategic Memory
 */
export async function generateEliteIdeas(keyword: string, analysis: any, titles: string[], angle: string = "default", pastIdeas: string[] = [], nicheContext?: string) {
  const model = getGeminiModel();
  
  // Get recent ideas for repetition avoidance
  const recentIdeas = pastIdeas.slice(-5);
  const recentIdeasText = recentIdeas.length > 0 
    ? `\n    AVOID REPEATING OR REPHRASING THESE RECENT IDEAS:\n    ${recentIdeas.map(i => `- "${i}"`).join("\n    ")}` 
    : "";
    const deadlyPrompt = `
    You are a TOP 1% viral content strategist.
    ${nicheContext ? `STRATEGIC OVERRIDE: ${nicheContext}` : ""}
    ${keyword} niche. 

    TASK: Generate 8 ELITE, dangerous-to-ignore viral ideas.

    RULES FOR MARKET DOMINANCE:
    1. NEVER repeat generic titles. If it feels like a search result, it fails. Use "High-Stakes Discovery" angles.
    2. Hook Priority: The first idea must be your ABSOLUTE STRONGEST. It must create an immediate Curiosity Gap.
    3. Triggers: Every idea must utilize a hard-hitting psychological trigger:
       - Fear (Loss of status/money)
       - Resource Revelation (Hidden opportunity)
       - Mistake Correction (Stop doing X)
       - Secret Insight (What experts hide)
    4. Labels: For the BEST idea, use exactly "🏆 Best Pick".
    5. Proof Line: For every idea, include: "📈 Seen in fast-growing videos".

    OUTPUT FORMAT (STRICT JSON):
    [
      { 
        "id": 1, "title": "...", "hook": "...", "concept": "...",
        "trigger": "...", "format": "...",
        "whyItWorksToday": "...",
        "confidenceScore": 8.7,
        "bestPickLabel": "...",
        "proofLine": "📈 Seen in fast-growing videos"
      }
    ]
    Only return JSON.
  `;

  const result = await callGeminiResilient(deadlyPrompt);
  try {
    const text = result.response.text().replace(/```json|```/g, "").trim();
    let ideas = JSON.parse(text).map((i: any) => ({ ...i, confidenceScore: i.confidenceScore || calculateConfidence(i) }));
    
    // Debug: Log generated ideas
    console.log("IDEAS GENERATED:", JSON.stringify(ideas, null, 2));
    
    // Improvement loop with max 2 attempts
    let attempts = 0;
    let finalReview = null;
    
    while (attempts < 2) {
      const review = await validateOutput(JSON.stringify(ideas));
      console.log(`VALIDATION ATTEMPT ${attempts + 1}:`, review);
      
      // Fail-safe: if no review, break
      if (!review) {
        console.log("VALIDATION FAILED, RETURNING CURRENT IDEAS");
        break;
      }
      
      finalReview = review;
      
      // Check threshold (PASS + avg >= 7)
      if (passesThreshold(review)) {
        console.log("PASSED THRESHOLD - Avg Score:", calculateAvgScore(review).toFixed(1));
        break;
      }
      
      // Auto-improve with issues
      console.log(`IMPROVING (Attempt ${attempts + 1})... Issues:`, review.issues);
      const improved = await improveOutput(JSON.stringify(ideas), review.issues);
      
      try {
        const cleaned = improved.replace(/```json|```/g, "").trim();
        const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const improvedIdeas = JSON.parse(jsonMatch[0]);
          if (Array.isArray(improvedIdeas) && improvedIdeas.length > 0) {
            ideas = improvedIdeas.map((i: any) => ({ ...i, confidenceScore: i.confidenceScore || calculateConfidence(i) }));
            console.log("IMPROVED IDEAS:", ideas.length, "items");
          }
        }
      } catch (e) {
        console.log("IMPROVE PARSE FAILED, KEEPING CURRENT");
      }
      
      attempts++;
    }
    
    // Attach validation scores to each idea for UI display
    if (finalReview) {
      const avgScore = calculateAvgScore(finalReview);
      ideas = ideas.map((i: any) => ({
        ...i,
        validationScore: avgScore,
        hookStrength: finalReview.hook_strength,
        originality: finalReview.originality,
        clarity: finalReview.clarity,
        viralityPotential: finalReview.virality_potential,
        marketCompetitionScore: finalReview.market_competition_score,
        wouldClick: finalReview.would_click,
        validationVerdict: finalReview.final_verdict,
        whyNotHigher: finalReview.why_not_higher
      }));
    }
    
    // Select best idea (runs in parallel with score attachment - already done above)
    const bestPick = await selectBestIdea(ideas);
    if (bestPick && ideas[bestPick.index]) {
      ideas[bestPick.index].isBestPick = true;
      ideas[bestPick.index].bestPickReason = bestPick.reason;
      ideas[bestPick.index].recommendedToday = true;
    }
    
    // Sort: Best pick first, then by validation score
    ideas.sort((a: any, b: any) => {
      if (a.isBestPick) return -1;
      if (b.isBestPick) return 1;
      return (b.validationScore || 0) - (a.validationScore || 0);
    });
    
    return ideas;
  } catch (e) { return []; }
}

/**
 * Upgrade 5: Smart Strategic Pivot (Emotional Recalibration)
 */
export async function pivotIdea(idea: any, targetAngle: string) {
  const model = getGeminiModel();
  
  const pivotPrompt = `
    You are a viral content refiner.
    
    ORIGINAL IDEA: "${idea.title}" (Trigger: ${idea.trigger})
    TASK: Regenerate this idea using the "${targetAngle.toUpperCase()}" psychological trigger.
    
    STRICT RULES:
    1. Keep exactly the same topic.
    2. Change emotional trigger COMPLETELY.
    3. Make the hook STRONGER than the original.
    
    EVALUATION (1-10): Hook strength, Novelty, Emotion, CTR potential.

    OUTPUT FORMAT (STRICT JSON):
    {
      "title": "...", "hook": "...", "concept": "...",
      "trigger": "${targetAngle}", "format": "${idea.format}",
      "whyItWorks": "...",
      "confidenceScore": 9.2,
      "improvementSuggestion": "..."
    }
  `;

  const result = await callGeminiResilient(pivotPrompt);
  try {
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (e) { return idea; }
}

/**
 * Upgrade 4: Execution Mode (The Production Blueprint)
 */
export async function generateExecutionPlan(idea: any) {
  const model = getGeminiModel();
  
  const directorPrompt = `
    You are a TOP 1% Viral Video Director. 
    Task: Create an aggressive, high-velocity PRODUCTION BLUEPRINT for: "${idea.title}".

    STRUCTURE FOR REELS/SHORTS/TIKTOK DOMINANCE:

    1. THE KILLER HOOK (0–3 SEC):
       - Visual Action: (Exact pattern interrupt visual).
       - Voiceover Line: (The opening curiosity gap line).
       - MUST stop the thumb-scroll instantly.

    2. RETENTION ENGINE (The "Slide" effect):
       - Beat 1: (3-10s) Validate the hook. Why they stay.
       - Beat 2: (10-25s) Deliver value payoff + scene transitions.
       - Beat 3: (25-45s) The "Aha!" insight or twist.
       - Ending: (Loop logic) Script the "perfect loop" back to the start.

    3. SOCIAL STRATEGY (Platform Specific):
       - TikTok Style: Raw, low-production, text-heavy.
       - IG Reels Style: Aesthetic, fast-cuts, high-saturation.
       - YouTube Shorts: High-velocity, caption-focused, "MrBeast" style pacing.

    4. VISUAL BOARD (AI Prompts):
       - Provide 3 detailed prompts for Midjourney/Runway to create B-roll.

    5. EDITING CUES:
       - Caption Style: (Dynamic, bouncing, color-coded).
       - SFX: (Swooshes, pops, atmospheric risers).
       - BGM: (Mood recommendation).

    Be aggressive. No fluff. Make it ready to record immediately.
  `;

  const result = await callGeminiResilient(directorPrompt);
  return result.response.text();
}

/**
 * FABULA ENGINE (STORY MODE): 
 * Deconstructs an idea into:
 * 1. Fabula (The raw story)
 * 2. Syuzhet (The narrative structure)
 * 3. Script (The execution)
 */
export async function generateFabulaStory(idea: any) {
  const model = getGeminiModel();
  
  const fabulaPrompt = `
    You are a Master Storyteller and Viral Narrative Architect.
    
    IDEA: "${idea.title}"
    CONCEPT: "${idea.concept}"
    TRIGGER: "${idea.trigger}"

    TASK: Convert this idea into a high-stakes STORY (Fabula Engine).

    STRICT OUTPUT FORMAT (JSON):
    {
      "fabula": {
        "coreStory": "The raw logic/lesson/event in one powerful sentence.",
        "stakes": "What is lost if the protagonist fails?",
        "theChange": "The transformation that occurs during the story."
      },
      "syuzhet": [
        { "scene": "Hook/Inciting Incident", "action": "...", "internalConflict": "..." },
        { "scene": "Rising Action/Complexity", "action": "...", "internalConflict": "..." },
        { "scene": "The Pivot/Twist", "action": "...", "internalConflict": "..." },
        { "scene": "Resolution/Payoff", "action": "...", "internalConflict": "..." }
      ],
      "production": {
        "visualStyle": "The aesthetic 'vibe' (e.g., Gritty, High-Saturation, Cinematic).",
        "script": "The full voiceover script with [VISUAL CUES] in brackets.",
        "loopLogic": "How it loops back to the start perfectly."
      }
    }
  `;

  const result = await callGeminiResilient(fabulaPrompt);
  try {
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Failed to generate Fabula story structure.");
  }
}
