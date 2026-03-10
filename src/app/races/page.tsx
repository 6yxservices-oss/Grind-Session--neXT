import Link from "next/link";
import { getAllRaces } from "@/lib/queries";
import { SERIES } from "@/lib/types";
export const dynamic = "force-dynamic";
export default function RacesPage({ searchParams }: { searchParams: { series?: string; status?: string } }) {
  const races = getAllRaces({ series: searchParams.series, status: searchParams.status });
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Races</h1><p className="text-gray-400 text-sm mt-1">{races.length} races tracked</p></div>
      <form className="flex flex-wrap gap-3">
        <select name="series" defaultValue={searchParams.series || ""} className="select"><option value="">All Series</option>{SERIES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <select name="status" defaultValue={searchParams.status || ""} className="select"><option value="">All Status</option><option value="Completed">Completed</option><option value="Upcoming">Upcoming</option></select>
        <button type="submit" className="btn-primary">Filter</button>
      </form>
      <div className="space-y-4">
        {races.map((r) => (
          <Link key={r.id} href={`/races/${r.id}`} className="card block hover:border-haas-red/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{r.race_name}</div>
                <div className="text-sm text-gray-400">Round {r.round_number} &middot; {r.circuit} &middot; {r.country}</div>
              </div>
              <div className="text-right">
                <span className="badge-blue">{r.series}</span>
                <div className="text-xs text-gray-500 mt-1">{r.race_date}</div>
                <span className={`badge mt-1 ${r.status === "Completed" ? "bg-green-500/20 text-green-400" : "bg-haas-light/20 text-haas-silver"}`}>{r.status}</span>
              </div>
            </div>
          </Link>
        ))}
        {races.length === 0 && <div className="text-center py-12 text-gray-500">No races yet</div>}
      </div>
    </div>
  );
}
