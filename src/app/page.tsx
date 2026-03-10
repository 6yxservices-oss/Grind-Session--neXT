import Link from "next/link";
import { getDashboardStats } from "@/lib/queries";
import { getCollegeProbabilities } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const stats = getDashboardStats();
  const topProspects = getCollegeProbabilities({ minProbability: 50 }).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">EYBL Scout Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Nike EYBL 2026 Season Overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Players Tracked", value: stats.playerCount, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "text-eybl-accent" },
          { label: "Teams", value: stats.teamCount, icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", color: "text-blue-400" },
          { label: "Games Logged", value: stats.gameCount, icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "text-eybl-gold" },
          { label: "Scout Reports", value: stats.reportCount, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "text-green-400" },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center gap-3">
              <svg className={`w-8 h-8 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
              </svg>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Scorers */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top Scorers</h2>
            <Link href="/players" className="text-eybl-accent text-sm hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {(stats.topScorers as Array<Record<string, unknown>>).map((player, i) => (
              <Link
                key={player.id as number}
                href={`/players/${player.id}`}
                className="flex items-center justify-between py-2 hover:bg-white/5 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-5">{i + 1}</span>
                  <div>
                    <div className="text-sm font-medium">{player.first_name as string} {player.last_name as string}</div>
                    <div className="text-xs text-gray-500">{player.team_name as string}</div>
                  </div>
                </div>
                <div className="text-eybl-accent font-bold">{player.ppg as number} PPG</div>
              </Link>
            ))}
            {(stats.topScorers as unknown[]).length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No game data yet</p>
            )}
          </div>
        </div>

        {/* College Probability Leaders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top College Prospects</h2>
            <Link href="/analytics" className="text-eybl-accent text-sm hover:underline">Full Analytics</Link>
          </div>
          <div className="space-y-3">
            {topProspects.map((p, i) => (
              <Link
                key={p.player_id}
                href={`/players/${p.player_id}`}
                className="flex items-center justify-between py-2 hover:bg-white/5 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-5">{i + 1}</span>
                  <div>
                    <div className="text-sm font-medium">{p.player_name}</div>
                    <div className="text-xs text-gray-500">{p.position} &middot; {p.projected_level}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-sm font-bold ${
                    p.college_probability >= 80 ? "text-green-400" :
                    p.college_probability >= 60 ? "text-blue-400" :
                    "text-yellow-400"
                  }`}>
                    {p.college_probability}%
                  </div>
                </div>
              </Link>
            ))}
            {topProspects.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No player data yet</p>
            )}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Scouting Reports</h2>
            <Link href="/reports" className="text-eybl-accent text-sm hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {(stats.recentReports as Array<Record<string, unknown>>).map((report) => (
              <Link
                key={report.id as number}
                href={`/reports/${report.id}`}
                className="flex items-center justify-between py-2 hover:bg-white/5 px-2 rounded-lg transition-colors"
              >
                <div>
                  <div className="text-sm font-medium">{report.player_name as string}</div>
                  <div className="text-xs text-gray-500">by {report.scout_name as string}</div>
                </div>
                <span className="badge-gold">{report.overall_grade as string}</span>
              </Link>
            ))}
            {(stats.recentReports as unknown[]).length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No reports yet</p>
            )}
          </div>
        </div>

        {/* Upcoming Games */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Games</h2>
            <Link href="/games" className="text-eybl-accent text-sm hover:underline">Full Schedule</Link>
          </div>
          <div className="space-y-3">
            {(stats.upcomingGames as Array<Record<string, unknown>>).map((game) => (
              <Link
                key={game.id as number}
                href={`/games/${game.id}`}
                className="flex items-center justify-between py-2 hover:bg-white/5 px-2 rounded-lg transition-colors"
              >
                <div>
                  <div className="text-sm font-medium">
                    {game.home_team_name as string} vs {game.away_team_name as string}
                  </div>
                  <div className="text-xs text-gray-500">
                    {game.session_name as string} &middot; {game.venue as string}
                  </div>
                </div>
                <div className="text-xs text-gray-400">{game.game_date as string}</div>
              </Link>
            ))}
            {(stats.upcomingGames as unknown[]).length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No upcoming games</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
