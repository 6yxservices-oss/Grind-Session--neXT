import { NextRequest, NextResponse } from "next/server";
import { toggleSocialAction } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const { player_id, action_type } = await request.json();
  if (!player_id || !action_type) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const active = toggleSocialAction("fan_1", player_id, action_type);
  return NextResponse.json({ active, player_id, action_type });
}
