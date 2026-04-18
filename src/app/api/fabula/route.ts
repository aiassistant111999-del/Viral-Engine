import { NextResponse } from "next/server";
import { generateFabula } from "@/lib/fabula";

export async function POST(req: Request) {
  try {
    const { topic, platform, tone, idea } = await req.json();
    
    // Support both direct topic input and idea-based generation from the dashboard
    const finalTopic = topic || idea?.title || idea?.concept;

    if (!finalTopic) {
      return NextResponse.json({ error: "Topic or Idea is required" }, { status: 400 });
    }

    const data = await generateFabula({ 
      topic: finalTopic, 
      platform: platform || "shorts", 
      tone: tone || "default" 
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Fabula Engine Error:", error);
    return NextResponse.json(
      { error: "Fabula engine failed" },
      { status: 500 }
    );
  }
}
