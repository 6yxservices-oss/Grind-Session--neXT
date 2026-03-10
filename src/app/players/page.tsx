import Link from "next/link";
import { getAllPlayers } from "@/lib/queries";
import { getAllTeams } from "@/lib/queries";
import StarRating from "@/components/star-rating";

export const dynamic = "force-dynamic";

export default function PlayersPage({
  searchParams,
}: {
  searchParams: { position?: string; class?: string; team?: string; q?: string };
}) {
  const players = getAllPlayers({
    position: searchParams.position,
    classYear: searchParams.class ? parseInt(searchParams.class) : undefined,
    teamId: searchParams.team ? parseInt(searchParams.team) : undefined,
    search: searchParams.q,
  });
  const teams = getAllTeams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Players</h1>
          <p className="text-gray-400 text-sm mt-1">{players.length} prospects tracked</p>
        </div>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3">
        <input
          name="q"
          type="text"
          placeholder="Search players..."
          defaultValue={searchParams.q}
          className="input w-64"
        />
        <select name="position" defaultValue={searchParams.position || ""} className="select">
          <option value="">All Positions</option>
          {["PG", "SG", "SF", "PF", "C"].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select name="class" defaultValue={searchParams.class || ""} className="select">
          <option value="">All Classes</option>
          {[2025, 2026, 2027, 2028].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select name="team" defaultValue={searchParams.team || ""} className="select">
          <option value="">All Teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button type="submit" className="btn-primary">Filter</button>
      </form>

      {/* Player Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              <th className="table-header">Rank</th>
              <th className="table-header">Player</th>
              <th className="table-header">Position</th>
              <th className="table-header">Class</th>
              <th className="table-header">Height</th>
              <th className="table-header">Team</th>
              <th className="table-header">Rating</th>
              <th className="table-header">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {players.map((player, i) => (
              <tr key={player.id} className="hover:bg-white/5 transition-colors">
                <td className="table-cell text-gray-500">{player.ranking || i + 1}</td>
                <td className="table-cell">
                  <Link href={`/players/${player.id}`} className="text-white hover:text-eybl-accent font-medium">
                    {player.first_name} {player.last_name}
                  </Link>
                  {player.high_school && (
                    <div className="text-xs text-gray-500">{player.high_school}</div>
                  )}
                </td>
                <td className="table-cell">
                  <span className="badge-blue">{player.position}</span>
                </td>
                <td className="table-cell">{player.class_year}</td>
                <td className="table-cell text-gray-300">{player.height || "—"}</td>
                <td className="table-cell text-gray-300">
                  {player.team_name ? (
                    <Link href={`/teams/${player.team_id}`} className="hover:text-eybl-accent">
                      {player.team_name}
                    </Link>
                  ) : "—"}
                </td>
                <td className="table-cell">
                  <StarRating rating={player.star_rating} />
                </td>
                <td className="table-cell">
                  <span className={`badge ${player.status === "Active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                    {player.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {players.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No players found. Seed the database to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
