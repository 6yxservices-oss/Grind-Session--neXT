import Link from "next/link";
import { getAllGames } from "@/lib/queries";
export const dynamic = "force-dynamic";
export default function GamesPage({ searchParams }: { searchParams: { week?: string; status?: string } }) {
  const games = getAllGames({ week: searchParams.week ? parseInt(searchParams.week) : undefined, status: searchParams.status });
  const weeks = Array.from(new Set(games.map((g) => g.week_number)));
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Schedule</h1><p className="text-gray-400 text-sm mt-1">{games.length} games tracked</p></div>
      <form className="flex flex-wrap gap-3">
        <select name="week" defaultValue={searchParams.week || ""} className="select"><option value="">All Weeks</option>{weeks.map((w) => <option key={w} value={w}>Week {w}</option>)}</select>
        <select name="status" defaultValue={searchParams.status || ""} className="select"><option value="">All Status</option><option value="Final">Final</option><option value="Scheduled">Scheduled</option></select>
        <button type="submit" className="btn-primary">Filter</button>
      </form>
      <div className="space-y-4">
        {games.map((g) => (
          <Link key={g.id} href={`/games/${g.id}`} className="card block hover:border-psu-accent/50">
            <div className="flex items-center justify-between">
              <div><div className="font-semibold">{g.home_team_name} vs {g.away_team_name}</div><div className="text-sm text-gray-400">Week {g.week_number} &middot; {g.game_date} {g.venue ? `&middot; ${g.venue}` : ""}</div></div>
              <div className="text-right">
                {g.status === "Final" ? <div className="text-lg font-bold">{g.home_score} - {g.away_score}</div> : null}
                <span className={`badge ${g.status === "Final" ? "bg-green-500/20 text-green-400" : "bg-psu-light/20 text-psu-steel"}`}>{g.status}</span>
              </div>
            </div>
          </Link>
        ))}
        {games.length === 0 && <div className="text-center py-12 text-gray-500">No games yet</div>}
      </div>
    </div>
  );
}
