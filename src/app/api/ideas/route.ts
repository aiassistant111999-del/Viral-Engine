import { NextResponse } from "next/server";
import { generateEliteIdeas } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { keyword, analysis, titles, angle, pastIdeas, nicheContext } = await req.json();
    
    if (!keyword || !analysis || !titles) {
      return NextResponse.json({ error: "Keyword, analysis, and titles are required" }, { status: 400 });
    }

    const ideas = await generateEliteIdeas(keyword, analysis, titles, angle || "default", pastIdeas || [], nicheContext);

    return NextResponse.json({ ideas });
  } catch (error: any) {
    console.error("Ideas Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
