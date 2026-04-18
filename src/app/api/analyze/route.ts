import { NextResponse } from "next/server";
import { searchTopVideos } from "@/lib/youtube";
import { analyzePatterns } from "@/lib/gemini";
import { extractPatterns } from "@/lib/patterns";

export async function POST(req: Request) {
  try {
    const { keyword } = await req.json();
    
    if (!keyword) {
      return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
    }

    const videos = await searchTopVideos(keyword);
    const analysis = await analyzePatterns(keyword, videos);

    const now = new Date();
    const enrichedVideos = videos.map((v: any) => {
      const publishedAt = new Date(v.publishedDate);
      const hoursOld = Math.max(1, (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60));
      const rawVelocity = v.viewCount / hoursOld;
      
      // Authority weighting: log10(subscriber_count + 1)
      const authorityWeight = Math.log10(v.subscriberCount + 11); // +11 to ensure minimum weight of ~1
      const viralScore = Math.floor(rawVelocity * authorityWeight);

      return {
        ...v,
        velocity: viralScore,
        hoursOld,
        isHighAuthority: v.subscriberCount > 50000,
        signalStrength: viralScore > 100 ? "STRATEGIC" : "ORGANIC"
      };
    });

    // analysis now contains { dominantPatterns, saturatedAngles, emergingOpportunities, psychologicalDrivers, audience }
    const detectedPatterns = (analysis.dominantPatterns || []).map((p: string) => ({
      pattern: p,
      type: p.toLowerCase().includes("curiosity") || p.toLowerCase().includes("hook") ? "curiosity" : "list"
    }));

    return NextResponse.json({ videos: enrichedVideos, analysis, detectedPatterns });
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
