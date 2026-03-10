import Link from "next/link";
import { getShortlistedDrivers } from "@/lib/queries";
import StarRating from "@/components/star-rating";
export const dynamic = "force-dynamic";
function fmt(v: number): string { if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`; if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`; return `$${v}`; }
export default function ShortlistPage() {
  const drivers = getShortlistedDrivers("fan_1");
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Scouting Board</h1><p className="text-gray-400 text-sm mt-1">Drivers you&apos;re tracking &middot; {drivers.length} on your board</p></div>
      {drivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((d) => (
            <Link key={d.id} href={`/drivers/${d.id}`} className="card hover:border-haas-red/50">
              <div className="flex items-center justify-between mb-2">
                <span className="badge-blue">{d.current_series}</span>
                <StarRating rating={d.rating} />
              </div>
              <h3 className="font-semibold">{d.first_name} {d.last_name}</h3>
              <p className="text-sm text-gray-400">{d.nationality} &middot; {d.team_name || "Independent"}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">{d.super_license_points} SL pts</span>
                {d.market_value ? <span className="text-alpine-cyan font-medium text-sm">{fmt(d.market_value)}</span> : null}
              </div>
              {d.f1_target_team && <span className={`badge mt-2 ${d.f1_target_team === "Haas" ? "badge-red" : "badge-pink"}`}>Target: {d.f1_target_team}</span>}
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500">No drivers on your board yet</p>
          <p className="text-sm text-gray-600 mt-2">Visit driver profiles and click &quot;+ Board&quot; to add them here</p>
          <Link href="/drivers" className="btn-primary mt-4 inline-block">Browse Drivers</Link>
        </div>
      )}
    </div>
  );
}
