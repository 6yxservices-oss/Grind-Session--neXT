import { NextRequest, NextResponse } from "next/server";
import { generateScoutingReport, generateDriverProfile } from "@/lib/sonar";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { driver_id, type = "report" } = body;

    if (!driver_id) {
      return NextResponse.json({ error: "driver_id is required" }, { status: 400 });
    }

    const driverId = parseInt(driver_id, 10);
    if (isNaN(driverId)) {
      return NextResponse.json({ error: "driver_id must be a number" }, { status: 400 });
    }

    let result;
    if (type === "profile") {
      result = await generateDriverProfile(driverId);
    } else {
      result = await generateScoutingReport(driverId);
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = message.includes("ANTHROPIC_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
