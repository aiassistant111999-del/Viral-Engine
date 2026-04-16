import { NextResponse } from "next/server";
import { generateExecutionPlan } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { idea } = await req.json();
    
    if (!idea) {
      return NextResponse.json({ error: "Idea is required" }, { status: 400 });
    }

    const plan = await generateExecutionPlan(idea);

    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error("Execution Plan Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
