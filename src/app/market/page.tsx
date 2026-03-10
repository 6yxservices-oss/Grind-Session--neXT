import Link from "next/link";
import { getDriverMarketFeed } from "@/lib/queries";
export const dynamic = "force-dynamic";
function fmt(v: number): string { if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`; if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`; return `$${v}`; }
export default function MarketPage() {
  const entries = getDriverMarketFeed();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Driver Market</h1>
        <p className="text-gray-400 text-sm mt-1">Contract status, availability, and market movement for F2/F3 talent</p>
      </div>
      <div className="space-y-4">
        {entries.map((e) => (
          <div key={e.id} className={`card ${e.availability_likelihood >= 70 ? "border-green-500/30" : e.availability_likelihood >= 50 ? "border-yellow-500/20" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${e.availability_likelihood >= 70 ? "bg-green-500/20 text-green-400" : e.availability_likelihood >= 50 ? "bg-yellow-500/20 text-yellow-400" : "bg-haas-light/20 text-haas-silver"}`}>
                  {e.availability_likelihood}%
                </div>
                <div>
                  <Link href={`/drivers/${e.driver_id}`} className="font-semibold hover:text-haas-red">{e.driver_name}</Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge-blue">{e.current_series}</span>
                    {e.team_name && <span className="text-xs text-gray-500">{e.team_name}</span>}
                    {e.nationality && <span className="text-xs text-gray-500">{e.nationality}</span>}
                    {e.rating && <span className="text-xs text-haas-red">{"★".repeat(e.rating)}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`badge ${e.contract_status === "Free Agent" ? "bg-green-500/20 text-green-400" : e.contract_status === "Option Year" ? "bg-yellow-500/20 text-yellow-400" : "bg-haas-light/20 text-haas-silver"}`}>{e.contract_status}</span>
                {e.current_contract_end && <div className="text-xs text-gray-500 mt-1">Expires: {e.current_contract_end}</div>}
                {e.market_value ? <div className="text-alpine-cyan font-bold text-sm mt-1">{fmt(e.market_value)}</div> : null}
                {e.interested_teams && <div className="text-xs text-alpine-pink mt-1">{e.interested_teams}</div>}
              </div>
            </div>
            {e.reason && <p className="text-sm text-gray-400 mt-3">{e.reason}</p>}
          </div>
        ))}
        {entries.length === 0 && <div className="text-center py-12 text-gray-500">No market entries yet</div>}
      </div>
    </div>
  );
}
