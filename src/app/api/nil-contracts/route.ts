import { NextRequest, NextResponse } from "next/server";
import { getNilContract, createNilContract } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const playerId = req.nextUrl.searchParams.get("player_id");
  if (!playerId) return NextResponse.json({ error: "player_id required" }, { status: 400 });
  const contract = getNilContract(parseInt(playerId));
  return NextResponse.json({ contract });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { player_id, player_legal_name, player_email, digital_signature } = body;
  if (!player_id || !player_legal_name || !player_email || !digital_signature) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = getNilContract(player_id);
  if (existing) {
    return NextResponse.json({ error: "Contract already exists for this player" }, { status: 409 });
  }

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const id = createNilContract({
    player_id,
    player_legal_name,
    player_email,
    digital_signature,
    ip_address: ip,
  });

  return NextResponse.json({ id, status: "active" });
}
