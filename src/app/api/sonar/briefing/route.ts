import { NextResponse } from "next/server";
import { generateBriefing } from "@/lib/sonar";

export async function POST() {
  try {
    const result = await generateBriefing();
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = message.includes("ANTHROPIC_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
