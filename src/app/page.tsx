import Link from "next/link";
import { getDashboardStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

function formatValue(v: number): string {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

export default function Dashboard() {
  const stats = getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="haas-gradient rounded-xl p-6 border border-haas-light/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">HAAS neXT | ALPINE neXT</h1>
            <p className="text-haas-silver text-sm mt-1">Discover the Next Generation of F1 Drivers</p>
          </div>
          <Link href="/vote" className="btn-vote text-sm">
            Vote Now &mdash; Who Gets a Shot?
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[
            { tag: "SCOUT", desc: "Analyze F2/F3 drivers with real performance data & metrics", pts: "+50 pts", color: "text-haas-red" },
            { tag: "VOTE", desc: "Cast your vote for who should test with Haas or Alpine", pts: "+100 pts", color: "text-alpine-pink" },
            { tag: "WIN", desc: "Redeem points for paddock passes, signed merch & VIP experiences", pts: "Redeem", color: "text-alpine-cyan" },
          ].map((s) => (
            <div key={s.tag} className="bg-haas-dark/50 rounded-lg p-3 border border-haas-light/10">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase ${s.color}`}>{s.tag}</span>
                <span className="text-[10px] text-alpine-pink font-medium">{s.pts}</span>
              </div>
              <p className="text-[11px] text-haas-silver mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Drivers Tracked", value: stats.driverCount, color: "text-haas-red" },
          { label: "Feeder Teams", value: stats.teamCount, color: "text-alpine-blue" },
          { label: "Races Logged", value: stats.raceCount, color: "text-alpine-cyan" },
          { label: "Scout Reports", value: stats.reportCount, color: "text-green-400" },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Vote Tally Banner */}
      <div className="card bg-gradient-to-r from-haas-black to-haas-gray border-haas-red/20">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-haas-red">{stats.haasVoteCount}</div>
            <div className="text-xs text-haas-silver">Haas neXT Votes</div>
          </div>
          <div className="text-center px-6">
            <Link href="/vote" className="text-sm font-bold text-white hover:text-alpine-pink transition-colors">FAN VOTE LIVE</Link>
            <div className="text-[10px] text-haas-silver mt-1">Who gets a tryout?</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-alpine-blue">{stats.alpineVoteCount}</div>
            <div className="text-xs text-haas-silver">Alpine neXT Votes</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Drivers */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top Rated Drivers</h2>
            <Link href="/drivers" className="text-haas-red text-sm hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {(stats.topDrivers as Array<Record<string, unknown>>).map((d, i) => (
              <Link key={d.id as number} href={`/drivers/${d.id}`} className="flex items-center justify-between py-2 hover:bg-white/5 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-5">{i + 1}</span>
                  <div>
                    <div className="text-sm font-medium">{d.first_name as string} {d.last_name as string}</div>
                    <div className="text-xs text-gray-500">{d.current_series as string} &middot; {(d.team_name as string) || "Independent"}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-haas-red font-bold text-sm">{"★".repeat(d.rating as number)}</div>
                  <div className="text-[10px] text-haas-silver">{d.super_license_points as number} SL pts</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Market Watch */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Driver Market Watch</h2>
            <Link href="/market" className="text-haas-red text-sm hover:underline">Full Market</Link>
          </div>
          <div className="space-y-3">
            {(stats.marketWatch as Array<Record<string, unknown>>).map((entry) => (
              <Link key={entry.id as number} href={`/drivers/${entry.driver_id}`} className="flex items-center justify-between py-2 hover:bg-white/5 px-2 rounded-lg transition-colors">
                <div>
                  <div className="text-sm font-medium">{entry.driver_name as string}</div>
                  <div className="text-xs text-gray-500">{entry.current_series as string}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${(entry.availability_likelihood as number) >= 70 ? "text-green-400" : "text-yellow-400"}`}>{entry.availability_likelihood as number}% available</div>
                </div>
              </Link>
            ))}
            {(stats.marketWatch as unknown[]).length === 0 && <p className="text-gray-500 text-sm text-center py-4">No market entries</p>}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Scout Reports</h2>
            <Link href="/reports" className="text-haas-red text-sm hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {(stats.recentReports as Array<Record<string, unknown>>).map((r) => (
              <Link key={r.id as number} href={`/reports/${r.id}`} className="flex items-center justify-between py-2 hover:bg-white/5 px-2 rounded-lg transition-colors">
                <div><div className="text-sm font-medium">{r.driver_name as string}</div><div className="text-xs text-gray-500">by {r.scout_name as string}</div></div>
                <span className="badge-red">{r.overall_grade as string}</span>
              </Link>
            ))}
            {(stats.recentReports as unknown[]).length === 0 && <p className="text-gray-500 text-sm text-center py-4">No reports yet</p>}
          </div>
        </div>

        {/* Silverstone CTA */}
        <div className="card bg-gradient-to-br from-haas-black to-haas-gray border-alpine-pink/20">
          <div className="text-center space-y-4">
            <div className="text-alpine-pink font-bold text-lg">Meet The Next Gen at Silverstone</div>
            <p className="text-sm text-haas-silver">Paddock Access, Rising Driver Meet &amp; Greets, F2/F3 Qualifying, Pit Lane Walks, RISE+ VIP Experiences</p>
            <div className="grid grid-cols-3 gap-2">
              {["Paddock Access", "Driver Meet & Greet", "Pit Lane Walk", "F2/F3 Qualifying", "Signed Merch", "RISE+ VIP"].map((f) => (
                <div key={f} className="text-[10px] text-white bg-haas-light/20 rounded px-2 py-1.5">{f}</div>
              ))}
            </div>
            <Link href="/vote" className="btn-vote inline-block text-sm">Start Voting &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
