import { NextResponse } from "next/server";
import { callGeminiResilient } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { video } = await req.json();
    if (!video) return NextResponse.json({ error: "Video data required" }, { status: 400 });

    const prompt = `
      You are a Viral Video Forensic Expert. 
      Analyze this high-performing video and provide a "Deep Deconstruction" for a creator who wants to compete with it.
      
      VIDEO DATA:
      Title: ${video.title}
      Description: ${video.description || "N/A"}
      Views: ${video.viewCount}
      Velocity: ${video.velocity} per hour
      
      TASK:
      1. Synthesize the likely Script/Framework used.
      2. Identify "Growth Chemistry": What psychological triggers are driving the views?
      3. Identify "Deadly Mistakes": What should a competitor NOT do when trying this angle?
      
      OUTPUT FORMAT (STRICT JSON):
      {
        "framework": "Detailed script outline or structure",
        "growthChemistry": ["Trigger 1: Reasoning", "Trigger 2: Reasoning"],
        "mistakesToAvoid": ["Mistake 1: Why it fails", "Mistake 2: Why it fails"],
        "verdict": "One sentence strategic summary"
      }
      Only return JSON.
    `;

    const result = await callGeminiResilient(prompt);
    const data = JSON.parse(result.response.text().replace(/```json|```/g, "").trim());

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Video Audit Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
