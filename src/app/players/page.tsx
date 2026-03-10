import Link from "next/link";
import { getAllPlayers, getAllTeams } from "@/lib/queries";
import StarRating from "@/components/star-rating";

export const dynamic = "force-dynamic";

function formatCurrency(v: number): string {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

export default function PlayersPage({ searchParams }: { searchParams: { position?: string; class?: string; team?: string; q?: string } }) {
  const players = getAllPlayers({ position: searchParams.position, classYear: searchParams.class ? parseInt(searchParams.class) : undefined, teamId: searchParams.team ? parseInt(searchParams.team) : undefined, search: searchParams.q });
  const teams = getAllTeams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recruits</h1>
          <p className="text-gray-400 text-sm mt-1">{players.length} prospects on Mike V&apos;s board</p>
        </div>
      </div>

      <form className="flex flex-wrap gap-3">
        <input name="q" type="text" placeholder="Search recruits..." defaultValue={searchParams.q} className="input w-64" />
        <select name="position" defaultValue={searchParams.position || ""} className="select">
          <option value="">All Positions</option>
          {["QB", "RB", "WR", "TE", "OL", "DL", "LB", "CB", "S", "K/P", "ATH"].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select name="class" defaultValue={searchParams.class || ""} className="select">
          <option value="">All Classes</option>
          {[2025, 2026, 2027, 2028].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select name="team" defaultValue={searchParams.team || ""} className="select">
          <option value="">All Teams</option>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button type="submit" className="btn-primary">Filter</button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-psu-light/20">
            <tr>
              {["Rank", "Player", "Pos", "Class", "Size", "Team", "Rating", "NIL Value", "Status"].map((h) => <th key={h} className="table-header">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-psu-light/10">
            {players.map((p, i) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="table-cell text-gray-500">{p.ranking || i + 1}</td>
                <td className="table-cell">
                  <Link href={`/players/${p.id}`} className="text-white hover:text-psu-accent font-medium">{p.first_name} {p.last_name}</Link>
                  {p.high_school && <div className="text-xs text-gray-500">{p.high_school}</div>}
                </td>
                <td className="table-cell"><span className="badge-blue">{p.position}</span></td>
                <td className="table-cell">{p.class_year}</td>
                <td className="table-cell text-gray-300">{p.height || "—"} {p.weight ? `/ ${p.weight}` : ""}</td>
                <td className="table-cell text-gray-300">{p.team_name ? <Link href={`/teams/${p.team_id}`} className="hover:text-psu-accent">{p.team_name}</Link> : "—"}</td>
                <td className="table-cell"><StarRating rating={p.star_rating} /></td>
                <td className="table-cell">{p.nil_value ? <span className="text-psu-gold font-medium">{formatCurrency(p.nil_value)}</span> : "—"}</td>
                <td className="table-cell">
                  {p.committed_to ? <span className="badge bg-green-500/20 text-green-400">{p.committed_to}</span> : <span className="badge bg-psu-light/20 text-psu-steel">{p.status}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {players.length === 0 && <div className="text-center py-12 text-gray-500">No players found.</div>}
      </div>
    </div>
  );
}
