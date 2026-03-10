import Link from "next/link";
import { getDashboardStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

function formatCurrency(v: number): string {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

export default function Dashboard() {
  const stats = getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="nittany-gradient rounded-xl p-6 border border-psu-light/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">MIKE V&apos;s Recruiting Board</h1>
            <p className="text-psu-steel text-sm mt-1">HVU Insider | Scout. Score. Win.</p>
          </div>
          <a href="https://insider.happyvalleyunited.com" target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
            Join HVU Insider
          </a>
        </div>
        {/* Scout Score Win */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[
            { tag: "SCOUT", desc: "Get 1st-to-market recruiting intel & training reports", pts: "+50 pts" },
            { tag: "SCORE", desc: "Engage with content to accumulate Insider Points", pts: "+25 pts" },
            { tag: "WIN", desc: "Cash in points for entries to win VIP experiences", pts: "Redeem" },
          ].map((s) => (
            <div key={s.tag} className="bg-psu-dark/50 rounded-lg p-3 border border-psu-light/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-psu-gold uppercase">{s.tag}</span>
                <span className="text-[10px] text-psu-accent font-medium">{s.pts}</span>
              </div>
              <p className="text-[11px] text-psu-steel mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Recruits Tracked", value: stats.playerCount, color: "text-psu-accent" },
          { label: "Programs", value: stats.teamCount, color: "text-blue-400" },
          { label: "Games Logged", value: stats.gameCount, color: "text-psu-gold" },
          { label: "Scout Reports", value: stats.reportCount, color: "text-green-400" },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top Performers</h2>
            <Link href="/players" className="text-psu-accent text-sm hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {(stats.topPerformers as Array<Record<string, unknown>>).map((p, i) => (
              <Link key={p.id as number} href={`/players/${p.id}`} className="flex items-center justify-between py-2 hover:bg-white/5 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-5">{i + 1}</span>
                  <div>
                    <div className="text-sm font-medium">{p.first_name as string} {p.last_name as string}</div>
                    <div className="text-xs text-gray-500">{p.position as string} &middot; {p.team_name as string}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-psu-accent font-bold text-sm">{p.total_yards as number} yds</div>
                  {(p.nil_value as number) > 0 && <div className="text-[10px] text-psu-gold">{formatCurrency(p.nil_value as number)} NIL</div>}
                </div>
              </Link>
            ))}
            {(stats.topPerformers as unknown[]).length === 0 && <p className="text-gray-500 text-sm text-center py-4">No game data yet</p>}
          </div>
        </div>

        {/* Portal Watch */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Transfer Portal Watch</h2>
            <Link href="/portal" className="text-psu-accent text-sm hover:underline">Full Feed</Link>
          </div>
          <div className="space-y-3">
            {(stats.portalWatch as Array<Record<string, unknown>>).map((entry) => (
              <Link key={entry.id as number} href={`/players/${entry.player_id}`} className="flex items-center justify-between py-2 hover:bg-white/5 px-2 rounded-lg transition-colors">
                <div>
                  <div className="text-sm font-medium">{entry.player_name as string}</div>
                  <div className="text-xs text-gray-500">{entry.position as string}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${(entry.transfer_likelihood as number) >= 70 ? "text-red-400" : "text-yellow-400"}`}>
                    {entry.transfer_likelihood as number}% likely
                  </div>
                  {(entry.nil_value as number) > 0 && <div className="text-[10px] text-psu-gold">{formatCurrency(entry.nil_value as number)}</div>}
                </div>
              </Link>
            ))}
            {(stats.portalWatch as unknown[]).length === 0 && <p className="text-gray-500 text-sm text-center py-4">No portal entries</p>}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Scout Reports</h2>
            <Link href="/reports" className="text-psu-accent text-sm hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {(stats.recentReports as Array<Record<string, unknown>>).map((r) => (
              <Link key={r.id as number} href={`/reports/${r.id}`} className="flex items-center justify-between py-2 hover:bg-white/5 px-2 rounded-lg transition-colors">
                <div>
                  <div className="text-sm font-medium">{r.player_name as string}</div>
                  <div className="text-xs text-gray-500">by {r.scout_name as string}</div>
                </div>
                <span className="badge-gold">{r.overall_grade as string}</span>
              </Link>
            ))}
            {(stats.recentReports as unknown[]).length === 0 && <p className="text-gray-500 text-sm text-center py-4">No reports yet</p>}
          </div>
        </div>

        {/* HVU Insider CTA */}
        <div className="card bg-gradient-to-br from-psu-navy to-psu-blue border-psu-gold/20">
          <div className="text-center space-y-4">
            <div className="text-psu-gold font-bold text-lg">Pro Day Experience with Mike V</div>
            <p className="text-sm text-psu-steel">Full Pro Day Credential, Lasch Building &amp; Stadium Tours, Meet PSU GM Derek Hoodjer, Signed Jersey, Lunch with Mike V, and more!</p>
            <div className="grid grid-cols-3 gap-2">
              {["Full Pro Day Credential", "Stadium Tours", "Signed Jersey", "Meet & Greet", "Lunch with Mike V", "Social Recognition"].map((f) => (
                <div key={f} className="text-[10px] text-white bg-psu-light/20 rounded px-2 py-1.5">{f}</div>
              ))}
            </div>
            <a href="https://insider.happyvalleyunited.com" target="_blank" rel="noopener noreferrer" className="btn-primary inline-block text-sm">
              Join HVU Insider &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
