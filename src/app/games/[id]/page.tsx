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
          Week {game.week_number} &middot; {game.game_date} &middot; {game.venue && `${game.venue}, `}{game.city}, {game.state}
        </p>
      </div>

      {/* Scoreboard */}
      {game.status === "Final" && (
        <div className="card">
          <div className="flex items-center justify-center gap-12">
            <div className="text-center">
              <div className="text-lg font-medium mb-2">{game.home_team_name}</div>
              <div className={`text-5xl font-bold ${(game.home_score ?? 0) > (game.away_score ?? 0) ? "text-psu-accent" : "text-gray-400"}`}>
                {game.home_score}
              </div>
            </div>
            <div className="text-2xl text-gray-600 font-light">FINAL</div>
            <div className="text-center">
              <div className="text-lg font-medium mb-2">{game.away_team_name}</div>
              <div className={`text-5xl font-bold ${(game.away_score ?? 0) > (game.home_score ?? 0) ? "text-psu-accent" : "text-gray-400"}`}>
                {game.away_score}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Football Box Score */}
      {game.stats.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Player Stats</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-800">
                <tr>
                  {["Player", "SNAPS", "C/ATT", "PYDS", "PTD", "INT", "CAR", "RYDS", "RTD", "REC", "RECYDS", "RECTD", "TKL", "TFL", "SCK"].map((h) => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {game.stats.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5">
                    <td className="table-cell">
                      <Link href={`/players/${s.player_id}`} className="hover:text-psu-accent font-medium">
                        {s.player_name}
                      </Link>
                    </td>
                    <td className="table-cell">{s.snaps}</td>
                    <td className="table-cell">{s.pass_completions}/{s.pass_attempts}</td>
                    <td className="table-cell font-medium text-psu-accent">{s.pass_yards}</td>
                    <td className="table-cell">{s.pass_tds}</td>
                    <td className="table-cell">{s.interceptions}</td>
                    <td className="table-cell">{s.rush_attempts}</td>
                    <td className="table-cell font-medium text-psu-accent">{s.rush_yards}</td>
                    <td className="table-cell">{s.rush_tds}</td>
                    <td className="table-cell">{s.receptions}</td>
                    <td className="table-cell">{s.rec_yards}</td>
                    <td className="table-cell">{s.rec_tds}</td>
                    <td className="table-cell">{s.tackles}</td>
                    <td className="table-cell">{s.tackles_for_loss}</td>
                    <td className="table-cell">{s.sacks}</td>
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
