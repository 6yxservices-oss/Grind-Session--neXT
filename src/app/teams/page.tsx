import Link from "next/link";
import { getAllTeams } from "@/lib/queries";
export const dynamic = "force-dynamic";
export default function TeamsPage() {
  const teams = getAllTeams();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Programs</h1><p className="text-gray-400 text-sm mt-1">{teams.length} programs tracked</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <Link key={team.id} href={`/teams/${team.id}`} className="card hover:border-psu-accent/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-psu-accent/10 flex items-center justify-center text-psu-accent font-bold text-lg">{team.name.slice(0, 2).toUpperCase()}</div>
              <div><h3 className="font-semibold">{team.name}</h3><p className="text-sm text-gray-400">{team.conference}</p><p className="text-xs text-gray-500">{team.city}, {team.state}</p></div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
