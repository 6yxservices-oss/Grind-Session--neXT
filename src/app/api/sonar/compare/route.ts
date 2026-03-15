import { NextRequest, NextResponse } from "next/server";
import { compareDrivers } from "@/lib/sonar";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { driver_ids } = body;

    if (!Array.isArray(driver_ids) || driver_ids.length < 2) {
      return NextResponse.json({ error: "driver_ids must be an array of at least 2 IDs" }, { status: 400 });
    }

    if (driver_ids.length > 4) {
      return NextResponse.json({ error: "Maximum 4 drivers for comparison" }, { status: 400 });
    }

    const ids = driver_ids.map((id: unknown) => parseInt(String(id), 10));
    if (ids.some(isNaN)) {
      return NextResponse.json({ error: "All driver_ids must be numbers" }, { status: 400 });
    }

    const result = await compareDrivers(ids);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = message.includes("ANTHROPIC_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
