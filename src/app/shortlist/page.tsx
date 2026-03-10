import Link from "next/link";
import { getShortlistedPlayers } from "@/lib/queries";
import StarRating from "@/components/star-rating";
export const dynamic = "force-dynamic";
function fmt(v: number): string { if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`; if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`; return `$${v}`; }
export default function ShortlistPage() {
  const players = getShortlistedPlayers("fan_1");
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Recruiting Board</h1><p className="text-gray-400 text-sm mt-1">Players you&apos;re tracking &middot; {players.length} on your board</p></div>
      {players.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((p) => (
            <Link key={p.id} href={`/players/${p.id}`} className="card hover:border-psu-accent/50">
              <div className="flex items-center justify-between mb-2">
                <span className="badge-blue">{p.position}</span>
                <StarRating rating={p.star_rating} />
              </div>
              <h3 className="font-semibold">{p.first_name} {p.last_name}</h3>
              <p className="text-sm text-gray-400">{p.high_school || "—"} &middot; Class of {p.class_year}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">{p.height} / {p.weight} lbs</span>
                {p.nil_value ? <span className="text-psu-gold font-medium text-sm">{fmt(p.nil_value)}</span> : null}
              </div>
              {p.committed_to && <span className="badge bg-green-500/20 text-green-400 mt-2">{p.committed_to}</span>}
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500">No players on your board yet</p>
          <p className="text-sm text-gray-600 mt-2">Visit recruit profiles and click &quot;+ Board&quot; to add them here</p>
          <Link href="/players" className="btn-primary mt-4 inline-block">Browse Recruits</Link>
        </div>
      )}
    </div>
  );
}
