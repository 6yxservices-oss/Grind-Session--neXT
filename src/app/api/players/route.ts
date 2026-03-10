import { NextResponse } from "next/server";
import { getAllDrivers } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const drivers = getAllDrivers();
  return NextResponse.json(
    drivers.map((d) => ({
      id: d.id,
      name: `${d.first_name} ${d.last_name}`,
    }))
  );
}
