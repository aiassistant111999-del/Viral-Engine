export interface TitlePattern {
  pattern: string;
  type: "curiosity" | "list" | "urgency" | "mistake" | "other";
}

/**
 * Simple keyword-based pattern extractor for YouTube titles
 */
export function extractPatterns(titles: string[]): TitlePattern[] {
  const patterns: TitlePattern[] = [];

  const detectors = [
    {
      type: "curiosity",
      keywords: ["you won't believe", "secret", "revealed", "reveals", "unveiled", "unknown", "hidden", "never seen"],
    },
    {
      type: "list",
      keywords: ["top", "best", "list", "ways to", "tools for", "strategies", "apps"],
      regex: /^\d+|top \d+|best \d+/i, // Matches titles starting with numbers or "Top 5"
    },
    {
      type: "urgency",
      keywords: ["before it's too late", "do this now", "stop", "immediately", "warning", "emergency", "deadline", "fast"],
    },
    {
      type: "mistake",
      keywords: ["wrong", "mistake", "failing", "stop doing", "don't do", "error", "fix this", "is killing your"],
    },
  ] as const;

  titles.forEach((title) => {
    const lowercaseTitle = title.toLowerCase();
    
    for (const detector of detectors) {
      const hasKeyword = detector.keywords.some((kw) => lowercaseTitle.includes(kw));
      const hasRegex = "regex" in detector ? detector.regex?.test(lowercaseTitle) : false;

      if (hasKeyword || hasRegex) {
        patterns.push({
          pattern: title,
          type: detector.type,
        });
        break; // Match first pattern and move to next title
      }
    }
  });

  return patterns;
}
