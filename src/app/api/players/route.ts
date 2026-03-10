import { NextResponse } from "next/server";
import { getAllPlayers } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const players = getAllPlayers();
  return NextResponse.json(
    players.map((p) => ({
      id: p.id,
      name: `${p.first_name} ${p.last_name}`,
    }))
  );
}
