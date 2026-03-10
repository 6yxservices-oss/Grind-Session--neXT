import Link from "next/link";
import { notFound } from "next/navigation";
import { getGameById } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function GameDetailPage({ params }: { params: { id: string } }) {
  const game = getGameById(parseInt(params.id));
  if (!game) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/games" className="text-sm text-gray-400 hover:text-gray-200 mb-2 inline-block">&larr; Back to Games</Link>
        <h1 className="text-2xl font-bold">{game.home_team_name} vs {game.away_team_name}</h1>
        <p className="text-gray-400 text-sm mt-1">
          {game.session_name} &middot; {game.game_date} &middot; {game.venue && `${game.venue}, `}{game.city}, {game.state}
        </p>
      </div>

      {/* Scoreboard */}
      {game.status === "Final" && (
        <div className="card">
          <div className="flex items-center justify-center gap-12">
            <div className="text-center">
              <div className="text-lg font-medium mb-2">{game.home_team_name}</div>
              <div className={`text-5xl font-bold ${(game.home_score ?? 0) > (game.away_score ?? 0) ? "text-eybl-accent" : "text-gray-400"}`}>
                {game.home_score}
              </div>
            </div>
            <div className="text-2xl text-gray-600 font-light">FINAL</div>
            <div className="text-center">
              <div className="text-lg font-medium mb-2">{game.away_team_name}</div>
              <div className={`text-5xl font-bold ${(game.away_score ?? 0) > (game.home_score ?? 0) ? "text-eybl-accent" : "text-gray-400"}`}>
                {game.away_score}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Box Score */}
      {game.stats.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Box Score</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-800">
                <tr>
                  {["Player", "MIN", "PTS", "REB", "AST", "STL", "BLK", "TO", "FG", "3PT", "FT", "PF"].map((h) => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {game.stats.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5">
                    <td className="table-cell">
                      <Link href={`/players/${s.player_id}`} className="hover:text-eybl-accent font-medium">
                        {s.player_name}
                      </Link>
                    </td>
                    <td className="table-cell">{s.minutes}</td>
                    <td className="table-cell font-medium text-eybl-accent">{s.points}</td>
                    <td className="table-cell">{s.rebounds}</td>
                    <td className="table-cell">{s.assists}</td>
                    <td className="table-cell">{s.steals}</td>
                    <td className="table-cell">{s.blocks}</td>
                    <td className="table-cell">{s.turnovers}</td>
                    <td className="table-cell">{s.fg_made}/{s.fg_attempted}</td>
                    <td className="table-cell">{s.three_made}/{s.three_attempted}</td>
                    <td className="table-cell">{s.ft_made}/{s.ft_attempted}</td>
                    <td className="table-cell">{s.fouls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
