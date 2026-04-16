import { GoogleGenerativeAI } from "@google/generative-ai";
import { validateOutput, improveOutput, passesThreshold, calculateAvgScore, selectBestIdea } from "./validator";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiModel = (modelName: string = "gemini-2.5-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};

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
    Reverse-engineer WHY these specific videos are winning. Identify triggers, formats, and GAPS.

    OUTPUT FORMAT (STRICT JSON):
    {
      "dominantPatterns": [], "saturatedAngles": [], "emergingOpportunities": [], 
      "psychologicalDrivers": [], "audience": ""
    }
    Only return JSON.
  `;

  const result = await model.generateContent(elitePrompt);
  try {
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (e) {
    return { dominantPatterns: [], saturatedAngles: [], emergingOpportunities: [], psychologicalDrivers: [], audience: "General" };
  }
}

/**
 * Upgrade 3, 5, 6 & 7: Deadly Idea Generation with Strategic Memory
 */
export async function generateEliteIdeas(keyword: string, analysis: any, titles: string[], angle: string = "default", pastIdeas: string[] = []) {
  const model = getGeminiModel();
  
  // Get recent ideas for repetition avoidance
  const recentIdeas = pastIdeas.slice(-5);
  const recentIdeasText = recentIdeas.length > 0 
    ? `\n    AVOID REPEATING OR REPHRASING THESE RECENT IDEAS:\n    ${recentIdeas.map(i => `- "${i}"`).join("\n    ")}` 
    : "";
  
  const deadlyPrompt = `
    You are a viral content strategist.
    ${keyword} niche. 1 format + 1 trigger + 1 gap per idea. 
    Avoid saturated angles: ${analysis.saturatedAngles.join(", ")}.
${recentIdeasText}

    TASK: Generate 8 viral ideas.

    STRICT RULES:
    1. NEVER repeat or duplicate ideas from recent ideas list.
    2. LEARN from past ideas.if those exist, these must be MORE novel and high-concept.
    3. Evaluation: Hook strength, Novelty, Emotion, CTR potential.

    OUTPUT FORMAT (STRICT JSON):
    [
      { 
        "id": 1, "title": "...", "hook": "...", "concept": "...",
        "trigger": "fear/money/etc", "format": "list/experiment/etc",
        "whyItWorks": "...",
        "confidenceScore": 8.7,
        "improvementSuggestion": "specific 1-line improvement based on scores"
      }
    ]
    Only return JSON.
  `;

  const result = await model.generateContent(deadlyPrompt);
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

  const result = await model.generateContent(pivotPrompt);
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
    You are a viral video director. 
    Create a COMPLETE production blueprint for the idea: "${idea.title}".

    STRUCTURE:
    1. HOOK (0–2 sec):
       - Visual Action + Specific Voice Line (Curiosity Gap).
       
    2. SCENE FLOW:
       - Scene 1: Pattern interrupt visual (Stop the scroll).
       - Scene 2: Core value delivery (Why they stay).
       - Scene 3: Twist/Insight (The Aha! moment).
       - Scene 4: Loop ending (Instant replay logic).

    3. VOICEOVER:
       - Natural, human script (30-45s). Fast-paced, punchy, no filler.

    4. VISUAL PROMPTS:
       - Detailed AI image/video prompts for Midjourney/Runway.

    5. EDITING:
       - Specific cut timing, caption style, and sound design (SFX) cues.

    6. PLATFORM OPTIMIZATION:
       - Specific Shorts / Reels / TikTok formatting and engagement tips.

    Output must be ready to record immediately. Be aggressive and punchy.
  `;

  const result = await model.generateContent(directorPrompt);
  return result.response.text();
}
