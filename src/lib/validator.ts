/**
 * ViralEngine Output Validation System
 * Self-checking AI for quality control
 */

export interface ValidationResult {
  hook_strength: number;
  originality: number;
  clarity: number;
  virality_potential: number;
  issues: string[];
  final_verdict: "PASS" | "IMPROVE";
  why_not_higher: string;
  best_idea_index?: number;
  best_idea_reason?: string;
}

export async function validateOutput(aiOutput: string): Promise<ValidationResult | null> {
  // Fail-safe for garbage output
  if (!aiOutput || aiOutput.length < 20) {
    console.error("VALIDATION FAIL: Output too short or empty");
    return null;
  }

  const prompt = `
You are an EXTREMELY strict quality control system for viral content.

Evaluate the following content:

${aiOutput}

STRICT SCORING RULES:
- Be extremely strict. Do NOT give scores above 7 unless content is truly exceptional.
- Penalize: generic phrases, weak hooks, repeated formats, obvious ideas
- Only give 8+ if it feels highly viral AND unique
- Compare to top-performing YouTube videos - would this compete with them?
- If not competitive with top creators, reduce score and explain why.

Score each (1-10):
1. Hook strength - Does it stop the scroll instantly?
2. Originality - Is this fresh or just a copy?
3. Clarity - Is the value proposition crystal clear?
4. Virality potential - Would people share this?

Return ONLY valid JSON. No extra text. No markdown.

{
  "hook_strength": number,
  "originality": number,
  "clarity": number,
  "virality_potential": number,
  "issues": ["specific issues found"],
  "why_not_higher": "One sentence explaining why score isn't higher",
  "final_verdict": "PASS" or "IMPROVE"
}
`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!rawText) return null;
  
  try {
    // Clean and parse JSON strictly
    let cleaned = rawText.replace(/```json|```/g, "").trim();
    // Remove any text before or after JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("VALIDATION FAIL: No JSON object found in response");
      return null;
    }
    const review = JSON.parse(jsonMatch[0]);
    console.log("VALIDATION PARSED:", review);
    return review;
  } catch (e) {
    console.error("VALIDATION PARSE ERROR:", e, "Raw:", rawText);
    return null;
  }
}

/**
 * Calculate average score from validation result
 */
export function calculateAvgScore(review: ValidationResult): number {
  return (review.hook_strength + review.originality + review.clarity + review.virality_potential) / 4;
}

/**
 * Check if output passes quality threshold
 */
export function passesThreshold(review: ValidationResult): boolean {
  const avgScore = calculateAvgScore(review);
  return review.final_verdict === "PASS" && avgScore >= 7;
}

/**
 * Select the best idea from a list
 */
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

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!rawText) return null;
  
  try {
    const jsonMatch = rawText.replace(/```json|```/g, "").trim().match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    return null;
  }
}

export async function improveOutput(originalOutput: string, issues: string[] = []): Promise<string> {
  // Fail-safe for garbage input
  if (!originalOutput || originalOutput.length < 20) {
    return "Regenerate — output not valid";
  }

  const issuesText = issues.length > 0 ? issues.map(i => `- ${i}`).join("\n") : "- Hook not curiosity-driven\n- Generic phrasing\- Weak emotional trigger";

  const prompt = `
You are a viral content expert.

Improve the following content based on these issues:

Issues:
${issuesText}

Content:
${originalOutput}

Rules:
- Make hooks more curiosity-driven
- Remove generic phrasing
- Add strong emotional trigger (fear, money, mistake)
- Keep it short and punchy

Return improved version as JSON array only. No extra text.
`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await res.json();
  const improved = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!improved || improved.length < 20) {
    console.error("IMPROVE FAIL: Output too short, returning original");
    return originalOutput;
  }
  
  console.log("IMPROVED OUTPUT:", improved.substring(0, 200) + "...");
  return improved;
}
