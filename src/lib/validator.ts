import { callGeminiResilient } from "./gemini";

export interface ValidationResult {
  hook_strength: number;
  originality: number;
  clarity: number;
  virality_potential: number;
  market_competition_score: number;
  would_click: boolean;
  issues: string[];
  final_verdict: "PASS" | "IMPROVE";
  why_not_higher: string;
  best_idea_index?: number;
  best_idea_reason?: string;
}

export async function validateOutput(aiOutput: string): Promise<ValidationResult | null> {
  if (!aiOutput || aiOutput.length < 20) {
    console.error("VALIDATION FAIL: Output too short or empty");
    return null;
  }

  const prompt = `
You are an EXTREMELY brutal, market-aware quality control system for viral YouTube content.
Your job is to KILL average ideas and only let through "Deadly Hooks" that can compete with the top 1% of YouTube.

TASK:
Evaluate if the following content would actually WIN against currently trending videos in its niche.

CONTENT:
${aiOutput}

BRUTAL SCORING RULES:
1. MARKET FIT OVER WRITING: Do not evaluate how well it is written. Evaluate COMPETITIVENESS.
2. FORCED COMPARISON: If this idea appeared in a sidebar next to the top 10 most viral videos in this niche, would a user CLICK this? If "No", the virality_potential MUST be < 5.
3. MARKET FAILURE DETECTION: Penalize heavily (max score 4) if:
   - It is a generic "Top 5" or "Best Tools" list.
   - It lacks a specific "Psychological Trigger" (Fear, Money, Status, Mistake).
   - The hook is descriptive instead of curiosity-driven.
   - It feels like "ChatGPT generated" fluff.
4. BRUTAL BIAS: Be harsh. Most ideas should NOT pass. Only give 8+ for world-class, dangerous-to-ignore concepts.

OUTPUT FORMAT (STRICT JSON):
{
  "hook_strength": number,
  "originality": number,
  "clarity": number,
  "virality_potential": number,
  "market_competition_score": number, (1-10 vs top viral competitors)
  "would_click": boolean, (Would a user click this next to a viral video?)
  "issues": ["specifically why this would fail in the market"],
  "why_not_higher": "One brutal sentence explaining why this isn't a 10",
  "final_verdict": "PASS" or "IMPROVE"
}
`;

  try {
    const result = await callGeminiResilient(prompt);
    const rawText = result.response.text();
    if (!rawText) return null;

    let cleaned = rawText.replace(/```json|```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const review = JSON.parse(jsonMatch[0]);
    console.log("MARKET VALIDATION PARSED:", review);
    return review;
  } catch (e) {
    console.error("VALIDATION ERROR:", e);
    return null;
  }
}

export function calculateAvgScore(review: ValidationResult): number {
  return (review.hook_strength + review.originality + review.clarity + review.virality_potential + review.market_competition_score) / 5;
}

export function passesThreshold(review: ValidationResult): boolean {
  const avgScore = calculateAvgScore(review);
  return (
    review.final_verdict === "PASS" &&
    avgScore >= 7.5 &&
    review.would_click === true &&
    review.market_competition_score >= 7
  );
}

export async function selectBestIdea(ideas: any[]): Promise<{ index: number; reason: string } | null> {
  if (!ideas || ideas.length === 0) return null;

  const prompt = `
From these content ideas, select the BEST one:

${JSON.stringify(ideas, null, 2)}

Criteria:
- Highest viral potential
- Strongest hook
- Most unique angle

Return ONLY valid JSON:
{
  "index": number (0-based),
  "reason": "One sentence why this is the best"
}
`;

  try {
    const result = await callGeminiResilient(prompt);
    const rawText = result.response.text();
    if (!rawText) return null;

    const jsonMatch = rawText.replace(/```json|```/g, "").trim().match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    return null;
  }
}

export async function improveOutput(originalOutput: string, issues: string[] = []): Promise<string> {
  if (!originalOutput || originalOutput.length < 20) return originalOutput;

  const issuesText = issues.length > 0 ? issues.map(i => `- ${i}`).join("\n") : "- Weak hooks";

  const prompt = `
You are a viral content strategist specializing in MARKET REVERSAL.

Your task is to REBUILD these failing content ideas to win against world-class YouTube competitors.

The original output failed for these reasons:
${issuesText}

STRICT RULES FOR REBUILDING:
1. CREATE A CURIOSITY GAP: The hook must make it impossible NOT to click. Move from "How to X" to "The secret reason X is failing".
2. INJECT HIGH-STAKES TRIGGERS: Use Fear, Money, Status, or Mistakes.
3. REMOVE CORPORATE FLUFF: No "Unlock your potential" or "Discover the best". Use raw, human, punchy language.
4. MARKET-AWARENESS: If a top YouTuber saw this, they should feel threatened by the angle.

Return improved version as JSON array only. No extra text.
`;

  try {
    const result = await callGeminiResilient(prompt);
    const improved = result.response.text();
    if (!improved || improved.length < 20) return originalOutput;

    console.log("IMPROVED OUTPUT (Resilient Path)");
    return improved;
  } catch (e) {
    return originalOutput;
  }
}
