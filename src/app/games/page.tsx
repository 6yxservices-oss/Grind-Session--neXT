import Link from "next/link";
import { getAllGames } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function GamesPage({
  searchParams,
}: {
  searchParams: { session?: string; status?: string };
}) {
  const games = getAllGames({
    session: searchParams.session,
    status: searchParams.status,
  });

  const sessions = Array.from(new Set(games.map((g) => g.session_name)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Games</h1>
        <p className="text-gray-400 text-sm mt-1">{games.length} games in schedule</p>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3">
        <select name="session" defaultValue={searchParams.session || ""} className="select">
          <option value="">All Sessions</option>
          {sessions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select name="status" defaultValue={searchParams.status || ""} className="select">
          <option value="">All Status</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Final">Final</option>
          <option value="Live">Live</option>
        </select>
        <button type="submit" className="btn-primary">Filter</button>
      </form>

      <div className="space-y-4">
        {games.map((game) => (
          <Link key={game.id} href={`/games/${game.id}`} className="card block hover:border-eybl-accent/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center min-w-[80px]">
                  <div className="text-xs text-gray-500 mb-1">{game.session_name}</div>
                  <div className="text-sm text-gray-300">{game.game_date}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{game.home_team_name}</span>
                    {game.home_score !== null && (
                      <span className={`font-bold ${(game.home_score ?? 0) > (game.away_score ?? 0) ? "text-eybl-accent" : "text-gray-400"}`}>
                        {game.home_score}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{game.away_team_name}</span>
                    {game.away_score !== null && (
                      <span className={`font-bold ${(game.away_score ?? 0) > (game.home_score ?? 0) ? "text-eybl-accent" : "text-gray-400"}`}>
                        {game.away_score}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <span className={`badge ${
                  game.status === "Final" ? "bg-green-500/20 text-green-400" :
                  game.status === "Live" ? "bg-red-500/20 text-red-400" :
                  "bg-gray-500/20 text-gray-400"
                }`}>
                  {game.status}
                </span>
                {game.venue && <div className="text-xs text-gray-500 mt-1">{game.venue}</div>}
              </div>
            </div>
          </Link>
        ))}
      </div>
      {games.length === 0 && (
        <div className="text-center py-12 text-gray-500">No games scheduled. Seed the database to get started.</div>
      )}
    </div>
  );
}
