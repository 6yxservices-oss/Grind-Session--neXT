import { NextRequest, NextResponse } from "next/server";
import { getDriverContract, createDriverContract } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const driverId = req.nextUrl.searchParams.get("driver_id");
  if (!driverId) return NextResponse.json({ error: "driver_id required" }, { status: 400 });
  const contract = getDriverContract(parseInt(driverId));
  return NextResponse.json({ contract });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { driver_id, driver_legal_name, driver_email, digital_signature } = body;
  if (!driver_id || !driver_legal_name || !driver_email || !digital_signature) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = getDriverContract(driver_id);
  if (existing) {
    return NextResponse.json({ error: "Contract already exists" }, { status: 409 });
  }

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const id = createDriverContract({ driver_id, driver_legal_name, driver_email, digital_signature, ip_address: ip });
  return NextResponse.json({ id, status: "active" });
}
