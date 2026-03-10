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
        <p className="text-gray-400">{team.conference} &middot; {team.city}, {team.state}</p>
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Roster ({team.players.length} players)</h2>
        {team.players.length > 0 ? (
          <table className="w-full">
            <thead className="border-b border-psu-light/20"><tr>{["Player", "Pos", "Class", "Size", "Rating"].map((h) => <th key={h} className="table-header">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-psu-light/10">
              {team.players.map((p) => (
                <tr key={p.id} className="hover:bg-white/5">
                  <td className="table-cell"><Link href={`/players/${p.id}`} className="text-white hover:text-psu-accent font-medium">{p.first_name} {p.last_name}</Link>{p.high_school && <div className="text-xs text-gray-500">{p.high_school}</div>}</td>
                  <td className="table-cell"><span className="badge-blue">{p.position}</span></td>
                  <td className="table-cell">{p.class_year}</td>
                  <td className="table-cell">{p.height} / {p.weight} lbs</td>
                  <td className="table-cell"><StarRating rating={p.star_rating} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-gray-500 text-sm text-center py-8">No players on roster</p>}
      </div>
    </div>
  );
}
