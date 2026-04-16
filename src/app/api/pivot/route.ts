import { NextResponse } from "next/server";
import { pivotIdea } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { idea, angle } = await req.json();
    
    if (!idea || !angle) {
      return NextResponse.json({ error: "Idea and angle are required" }, { status: 400 });
    }

    const pivotedIdea = await pivotIdea(idea, angle);

    return NextResponse.json({ idea: pivotedIdea });
  } catch (error: any) {
    console.error("Pivot Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
