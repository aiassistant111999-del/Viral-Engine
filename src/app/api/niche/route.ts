import { NextResponse } from "next/server";
import { extractNiches, analyzeNicheMarket, generateNicheDecision } from "@/lib/nicheEngine";

export async function POST(req: Request) {
  try {
    const { input, userProfile } = await req.json();
    if (!input) return NextResponse.json({ error: "Input required" }, { status: 400 });

    // 1. Extract & Normalize
    const nicheList = extractNiches(input);
    console.log("DECISION ENGINE — Analyzing Niches:", nicheList);
    console.log("USER PROFILE INJECTED:", userProfile);

    // 2. Parallel Market Scan + User Fit
    const marketMetrics = await Promise.all(
      nicheList.map(niche => analyzeNicheMarket(niche, userProfile))
    );

    // 3. AI Mentor Strategy Layer
    const decision = await generateNicheDecision(marketMetrics, userProfile);

    return NextResponse.json(decision);
  } catch (error: any) {
    console.error("NICHE ENGINE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
