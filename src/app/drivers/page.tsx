import Link from "next/link";
import { getAllDrivers, getAllTeams } from "@/lib/queries";
import StarRating from "@/components/star-rating";
import { SERIES } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatValue(v: number): string {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

export default function DriversPage({ searchParams }: { searchParams: { series?: string; team?: string; q?: string; target?: string } }) {
  const drivers = getAllDrivers({ series: searchParams.series, teamId: searchParams.team ? parseInt(searchParams.team) : undefined, search: searchParams.q, targetTeam: searchParams.target });
  const teams = getAllTeams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          <p className="text-gray-400 text-sm mt-1">{drivers.length} drivers on the neXT radar</p>
        </div>
      </div>

      <form className="flex flex-wrap gap-3">
        <input name="q" type="text" placeholder="Search drivers..." defaultValue={searchParams.q} className="input w-64" />
        <select name="series" defaultValue={searchParams.series || ""} className="select">
          <option value="">All Series</option>
          {SERIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="team" defaultValue={searchParams.team || ""} className="select">
          <option value="">All Teams</option>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select name="target" defaultValue={searchParams.target || ""} className="select">
          <option value="">All Targets</option>
          <option value="Haas">Haas neXT</option>
          <option value="Alpine">Alpine neXT</option>
        </select>
        <button type="submit" className="btn-primary">Filter</button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-haas-light/20">
            <tr>
              {["#", "Driver", "Series", "Team", "Nationality", "Rating", "SL Pts", "Wins", "Podiums", "Target", "Value"].map((h) => <th key={h} className="table-header">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-haas-light/10">
            {drivers.map((d, i) => (
              <tr key={d.id} className="hover:bg-white/5 transition-colors">
                <td className="table-cell text-gray-500">{d.ranking || i + 1}</td>
                <td className="table-cell">
                  <Link href={`/drivers/${d.id}`} className="text-white hover:text-haas-red font-medium">{d.first_name} {d.last_name}</Link>
                  {d.academy && <div className="text-xs text-alpine-pink">{d.academy}</div>}
                </td>
                <td className="table-cell"><span className="badge-blue">{d.current_series}</span></td>
                <td className="table-cell text-gray-300">{d.team_name ? <Link href={`/teams/${d.team_id}`} className="hover:text-haas-red">{d.team_name}</Link> : "—"}</td>
                <td className="table-cell text-gray-300">{d.nationality}</td>
                <td className="table-cell"><StarRating rating={d.rating} /></td>
                <td className="table-cell">
                  <span className={d.super_license_eligible ? "text-green-400 font-medium" : "text-gray-300"}>{d.super_license_points}</span>
                  {d.super_license_eligible ? <span className="text-[10px] text-green-400 ml-1">SL</span> : null}
                </td>
                <td className="table-cell font-medium">{d.career_wins}</td>
                <td className="table-cell">{d.career_podiums}</td>
                <td className="table-cell">
                  {d.f1_target_team === "Haas" && <span className="badge-red">Haas</span>}
                  {d.f1_target_team === "Alpine" && <span className="badge-pink">Alpine</span>}
                  {d.f1_target_team === "Both" && <><span className="badge-red mr-1">Haas</span><span className="badge-pink">Alpine</span></>}
                  {!d.f1_target_team && <span className="text-gray-500">—</span>}
                </td>
                <td className="table-cell">{d.market_value ? <span className="text-alpine-cyan font-medium">{formatValue(d.market_value)}</span> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {drivers.length === 0 && <div className="text-center py-12 text-gray-500">No drivers found.</div>}
      </div>
    </div>
  );
}
