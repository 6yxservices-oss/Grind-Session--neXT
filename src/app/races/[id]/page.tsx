import Link from "next/link";
import { notFound } from "next/navigation";
import { getRaceById } from "@/lib/queries";
export const dynamic = "force-dynamic";
export default function RaceDetailPage({ params }: { params: { id: string } }) {
  const race = getRaceById(parseInt(params.id));
  if (!race) notFound();
  return (
    <div className="space-y-6">
      <div>
        <Link href="/races" className="text-sm text-gray-400 hover:text-gray-200 mb-2 inline-block">&larr; Back to Races</Link>
        <h1 className="text-2xl font-bold">{race.race_name}</h1>
        <p className="text-gray-400 text-sm mt-1">Round {race.round_number} &middot; {race.circuit} &middot; {race.country} &middot; {race.race_date}</p>
      </div>
      {race.results.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Race Classification</h2>
          <table className="w-full">
            <thead className="border-b border-haas-light/20">
              <tr>{["Pos", "Driver", "Grid", "Quali", "Points", "FL", "Gap", "Status"].map((h) => <th key={h} className="table-header">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-haas-light/10">
              {race.results.map((r) => (
                <tr key={r.id} className="hover:bg-white/5">
                  <td className="table-cell font-bold"><span className={r.race_position && r.race_position <= 3 ? "text-haas-red" : ""}>{r.dnf ? "DNF" : `P${r.race_position}`}</span></td>
                  <td className="table-cell"><Link href={`/drivers/${r.driver_id}`} className="hover:text-haas-red font-medium">{r.driver_name}</Link></td>
                  <td className="table-cell">P{r.grid_position || "—"}</td>
                  <td className="table-cell">P{r.qualifying_position || "—"}</td>
                  <td className="table-cell font-medium text-alpine-cyan">{r.points_scored}</td>
                  <td className="table-cell">{r.fastest_lap ? <span className="text-purple-400 font-bold">FL</span> : ""}</td>
                  <td className="table-cell text-gray-400">{r.gap_to_leader || "—"}</td>
                  <td className="table-cell">{r.dnf ? <span className="text-red-400">{r.dnf_reason || "DNF"}</span> : <span className="text-green-400">Finished</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
