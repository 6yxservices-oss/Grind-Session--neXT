import { NextRequest, NextResponse } from "next/server";
import { queryIntelligence } from "@/lib/sonar";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    if (question.length > 1000) {
      return NextResponse.json({ error: "question must be under 1000 characters" }, { status: 400 });
    }

    const result = await queryIntelligence(question);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = message.includes("ANTHROPIC_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
