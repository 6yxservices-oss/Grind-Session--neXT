import { NextRequest, NextResponse } from "next/server";
import { castVote, getVoteLeaderboard } from "@/lib/queries";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const team = req.nextUrl.searchParams.get("team") || "haas";
  const leaderboard = getVoteLeaderboard(team);
  return NextResponse.json({ leaderboard });
}

export async function POST(request: NextRequest) {
  const { driver_id, target_team } = await request.json();
  if (!driver_id || !target_team) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (target_team !== "haas" && target_team !== "alpine") return NextResponse.json({ error: "Invalid team" }, { status: 400 });
  const active = castVote("fan_1", driver_id, target_team);
  return NextResponse.json({ active, driver_id, target_team });
}
