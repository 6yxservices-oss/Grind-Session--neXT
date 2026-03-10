import { NextRequest, NextResponse } from "next/server";
import { createReport } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.driver_id || !body.scout_name || !body.overall_grade) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = createReport(body);
  return NextResponse.json({ id }, { status: 201 });
}
