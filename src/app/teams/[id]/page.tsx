import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeamById } from "@/lib/queries";
import StarRating from "@/components/star-rating";
export const dynamic = "force-dynamic";
export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const team = getTeamById(parseInt(params.id));
  if (!team) notFound();
  return (
    <div className="space-y-6">
      <div>
        <Link href="/teams" className="text-sm text-gray-400 hover:text-gray-200 mb-2 inline-block">&larr; Back to Teams</Link>
        <h1 className="text-3xl font-bold">{team.name}</h1>
        <p className="text-gray-400">{team.series} &middot; {team.country}{team.engine_supplier ? ` · ${team.engine_supplier}` : ""}</p>
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Drivers ({team.drivers.length})</h2>
        {team.drivers.length > 0 ? (
          <table className="w-full">
            <thead className="border-b border-haas-light/20"><tr>{["Driver", "Nationality", "Series", "Rating", "Wins", "SL Pts"].map((h) => <th key={h} className="table-header">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-haas-light/10">
              {team.drivers.map((d) => (
                <tr key={d.id} className="hover:bg-white/5">
                  <td className="table-cell"><Link href={`/drivers/${d.id}`} className="text-white hover:text-haas-red font-medium">{d.first_name} {d.last_name}</Link>{d.academy && <div className="text-xs text-alpine-pink">{d.academy}</div>}</td>
                  <td className="table-cell">{d.nationality}</td>
                  <td className="table-cell"><span className="badge-blue">{d.current_series}</span></td>
                  <td className="table-cell"><StarRating rating={d.rating} /></td>
                  <td className="table-cell">{d.career_wins}</td>
                  <td className="table-cell"><span className={d.super_license_eligible ? "text-green-400" : ""}>{d.super_license_points}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-gray-500 text-sm text-center py-8">No drivers on roster</p>}
      </div>
    </div>
  );
}
