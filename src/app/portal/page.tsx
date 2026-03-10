import Link from "next/link";
import { getTransferPortalFeed } from "@/lib/queries";
export const dynamic = "force-dynamic";
function fmt(v: number): string { if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`; if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`; return `$${v}`; }
export default function PortalPage() {
  const entries = getTransferPortalFeed();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transfer Portal Watch</h1>
        <p className="text-gray-400 text-sm mt-1">Likelihood predictions based on playing time, NIL value, and roster fit</p>
      </div>
      <div className="space-y-4">
        {entries.map((e) => (
          <div key={e.id} className={`card ${e.transfer_likelihood >= 70 ? "border-red-500/30" : e.transfer_likelihood >= 50 ? "border-yellow-500/20" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${e.transfer_likelihood >= 70 ? "bg-red-500/20 text-red-400" : e.transfer_likelihood >= 50 ? "bg-yellow-500/20 text-yellow-400" : "bg-psu-light/20 text-psu-steel"}`}>
                  {e.transfer_likelihood}%
                </div>
                <div>
                  <Link href={`/players/${e.player_id}`} className="font-semibold hover:text-psu-accent">{e.player_name}</Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge-blue">{e.position}</span>
                    {e.team_name && <span className="text-xs text-gray-500">{e.team_name}</span>}
                    {e.star_rating && <span className="text-xs text-psu-gold">{"★".repeat(e.star_rating)}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                {e.nil_value ? <div className="text-psu-gold font-bold">{fmt(e.nil_value)}</div> : null}
                <div className="text-xs text-gray-500">Playing time: {e.current_playing_time_pct}%</div>
                {e.projected_nil_increase ? <div className="text-xs text-green-400">+{e.projected_nil_increase}% NIL if transfers</div> : null}
                <span className={`badge mt-1 ${e.status === "In Portal" ? "bg-red-500/20 text-red-400" : e.status === "Watch" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>{e.status}</span>
              </div>
            </div>
            {e.reason && <p className="text-sm text-gray-400 mt-3">{e.reason}</p>}
          </div>
        ))}
        {entries.length === 0 && <div className="text-center py-12 text-gray-500">No portal entries yet</div>}
      </div>
    </div>
  );
}
