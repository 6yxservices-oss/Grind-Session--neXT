import Link from "next/link";
import { getCollegeProbabilities, getMarketValueProjections, getCoachMatches } from "@/lib/analytics";
import StarRating from "@/components/star-rating";

export const dynamic = "force-dynamic";

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export default function AnalyticsPage({
  searchParams,
}: {
  searchParams: {
    tab?: string;
    position?: string;
    class?: string;
    minProb?: string;
    style?: string;
    minStars?: string;
  };
}) {
  const tab = searchParams.tab || "college";
  const position = searchParams.position || undefined;
  const classYear = searchParams.class ? parseInt(searchParams.class) : undefined;

  // College Probability Data
  const probabilities = getCollegeProbabilities({
    position,
    classYear,
    minProbability: searchParams.minProb ? parseInt(searchParams.minProb) : undefined,
  });

  // Market Value Projections
  const marketValues = getMarketValueProjections();

  // Coach Matching
  const coachMatches = getCoachMatches({
    position,
    minClassYear: classYear,
    maxClassYear: classYear,
    playStyle: (searchParams.style as "scoring" | "defensive" | "playmaking" | "rebounding" | "all-around") || undefined,
    minStarRating: searchParams.minStars ? parseInt(searchParams.minStars) : undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics & Insights</h1>
        <p className="text-gray-400 text-sm mt-1">
          College probability predictions, transfer portal market values, and coach-player matching
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-800 pb-3">
        {[
          { key: "college", label: "College Probability" },
          { key: "market", label: "Market Value" },
          { key: "coach", label: "Coach Matching" },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/analytics?tab=${t.key}`}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-eybl-accent/10 text-eybl-accent border-b-2 border-eybl-accent"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Shared Filters */}
      <form className="flex flex-wrap gap-3">
        <input type="hidden" name="tab" value={tab} />
        <select name="position" defaultValue={searchParams.position || ""} className="select">
          <option value="">All Positions</option>
          {["PG", "SG", "SF", "PF", "C"].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select name="class" defaultValue={searchParams.class || ""} className="select">
          <option value="">All Classes</option>
          {[2025, 2026, 2027, 2028].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        {tab === "college" && (
          <select name="minProb" defaultValue={searchParams.minProb || ""} className="select">
            <option value="">Min Probability</option>
            <option value="80">80%+</option>
            <option value="60">60%+</option>
            <option value="40">40%+</option>
            <option value="20">20%+</option>
          </select>
        )}
        {tab === "coach" && (
          <>
            <select name="style" defaultValue={searchParams.style || ""} className="select">
              <option value="">All Play Styles</option>
              <option value="scoring">Scoring</option>
              <option value="playmaking">Playmaking</option>
              <option value="rebounding">Rebounding</option>
              <option value="defensive">Defensive</option>
              <option value="all-around">All-Around</option>
            </select>
            <select name="minStars" defaultValue={searchParams.minStars || ""} className="select">
              <option value="">Min Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
            </select>
          </>
        )}
        <button type="submit" className="btn-primary">Apply</button>
      </form>

      {/* ─── College Probability Tab ─── */}
      {tab === "college" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {[
              { label: "Power 5 Caliber", count: probabilities.filter((p) => p.college_probability >= 80).length, color: "text-green-400" },
              { label: "Major Conf.", count: probabilities.filter((p) => p.college_probability >= 60 && p.college_probability < 80).length, color: "text-blue-400" },
              { label: "Mid-Major", count: probabilities.filter((p) => p.college_probability >= 40 && p.college_probability < 60).length, color: "text-yellow-400" },
              { label: "Lower Division", count: probabilities.filter((p) => p.college_probability < 40).length, color: "text-gray-400" },
            ].map((tier) => (
              <div key={tier.label} className="card text-center">
                <div className={`text-3xl font-bold ${tier.color}`}>{tier.count}</div>
                <div className="text-xs text-gray-400 mt-1">{tier.label}</div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-800">
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">Player</th>
                  <th className="table-header">Pos</th>
                  <th className="table-header">Class</th>
                  <th className="table-header">Stars</th>
                  <th className="table-header">PPG</th>
                  <th className="table-header">RPG</th>
                  <th className="table-header">APG</th>
                  <th className="table-header">Probability</th>
                  <th className="table-header">Projected Level</th>
                  <th className="table-header">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {probabilities.map((p, i) => (
                  <tr key={p.player_id} className="hover:bg-white/5">
                    <td className="table-cell text-gray-500">{i + 1}</td>
                    <td className="table-cell">
                      <Link href={`/players/${p.player_id}`} className="font-medium hover:text-eybl-accent">
                        {p.player_name}
                      </Link>
                      {p.team_name && <div className="text-xs text-gray-500">{p.team_name}</div>}
                    </td>
                    <td className="table-cell"><span className="badge-blue">{p.position}</span></td>
                    <td className="table-cell">{p.class_year}</td>
                    <td className="table-cell"><StarRating rating={p.star_rating} /></td>
                    <td className="table-cell">{p.ppg}</td>
                    <td className="table-cell">{p.rpg}</td>
                    <td className="table-cell">{p.apg}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-800 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              p.college_probability >= 80 ? "bg-green-500" :
                              p.college_probability >= 60 ? "bg-blue-500" :
                              p.college_probability >= 40 ? "bg-yellow-500" :
                              "bg-red-500"
                            }`}
                            style={{ width: `${p.college_probability}%` }}
                          />
                        </div>
                        <span className="font-bold text-sm">{p.college_probability}%</span>
                      </div>
                    </td>
                    <td className="table-cell text-sm">{p.projected_level}</td>
                    <td className="table-cell text-xs text-gray-400">{p.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {probabilities.length === 0 && (
            <div className="text-center py-12 text-gray-500">No player data available</div>
          )}
        </div>
      )}

      {/* ─── Market Value Tab ─── */}
      {tab === "market" && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-800">
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">Player</th>
                  <th className="table-header">Pos</th>
                  <th className="table-header">Level</th>
                  <th className="table-header">Fr. NIL</th>
                  <th className="table-header">So. NIL</th>
                  <th className="table-header">Jr. NIL</th>
                  <th className="table-header">Sr. NIL</th>
                  <th className="table-header">Portal Value</th>
                  <th className="table-header">Trend</th>
                  <th className="table-header">Best Conferences</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {marketValues.map((mv, i) => (
                  <tr key={mv.player_id} className="hover:bg-white/5">
                    <td className="table-cell text-gray-500">{i + 1}</td>
                    <td className="table-cell">
                      <Link href={`/players/${mv.player_id}`} className="font-medium hover:text-eybl-accent">
                        {mv.player_name}
                      </Link>
                    </td>
                    <td className="table-cell"><span className="badge-blue">{mv.position}</span></td>
                    <td className="table-cell text-xs">{mv.projected_level}</td>
                    <td className="table-cell text-sm">{formatCurrency(mv.year1_value)}</td>
                    <td className="table-cell text-sm">{formatCurrency(mv.year2_value)}</td>
                    <td className="table-cell text-sm">{formatCurrency(mv.year3_value)}</td>
                    <td className="table-cell text-sm">{formatCurrency(mv.year4_value)}</td>
                    <td className="table-cell">
                      <span className="text-eybl-accent font-bold">{formatCurrency(mv.portal_value)}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${
                        mv.value_trend === "rising" ? "bg-green-500/20 text-green-400" :
                        mv.value_trend === "stable" ? "bg-blue-500/20 text-blue-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {mv.value_trend === "rising" ? "Rising" : mv.value_trend === "stable" ? "Stable" : "Declining"}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1">
                        {mv.conference_fit.slice(0, 3).map((c) => (
                          <span key={c} className="badge-gold text-[10px]">{c}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {marketValues.length === 0 && (
            <div className="text-center py-12 text-gray-500">No projection data available</div>
          )}
        </div>
      )}

      {/* ─── Coach Matching Tab ─── */}
      {tab === "coach" && (
        <div className="space-y-4">
          <div className="card bg-eybl-blue/50 border-eybl-accent/20">
            <p className="text-sm text-gray-300">
              <strong className="text-eybl-accent">Coach Matching</strong> connects coaches directly to players with the highest probability of making it to college.
              Filter by position, play style, and star rating to find the best fit for your program.
            </p>
          </div>

          <div className="grid gap-4">
            {coachMatches.map((match, i) => (
              <div key={match.player_id} className="card hover:border-eybl-accent/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-eybl-accent/20 flex items-center justify-center text-eybl-accent font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <Link href={`/players/${match.player_id}`} className="text-lg font-semibold hover:text-eybl-accent">
                        {match.player_name}
                      </Link>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="badge-blue">{match.position}</span>
                        <span className="text-sm text-gray-400">Class of {match.class_year}</span>
                        <StarRating rating={match.star_rating} />
                      </div>
                      <div className="flex gap-6 mt-3 text-sm">
                        <div><span className="text-gray-500">PPG:</span> <span className="font-medium">{match.ppg}</span></div>
                        <div><span className="text-gray-500">RPG:</span> <span className="font-medium">{match.rpg}</span></div>
                        <div><span className="text-gray-500">APG:</span> <span className="font-medium">{match.apg}</span></div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {match.match_reasons.map((reason) => (
                          <span key={reason} className="badge bg-white/5 text-gray-300">{reason}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Match Score</div>
                    <div className={`text-3xl font-bold ${
                      match.match_score >= 80 ? "text-green-400" :
                      match.match_score >= 60 ? "text-blue-400" :
                      "text-yellow-400"
                    }`}>
                      {match.match_score}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{match.projected_level}</div>
                    <div className="mt-2">
                      <div className={`text-sm font-medium ${
                        match.college_probability >= 80 ? "text-green-400" :
                        match.college_probability >= 60 ? "text-blue-400" :
                        "text-yellow-400"
                      }`}>
                        {match.college_probability}% college prob.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {coachMatches.length === 0 && (
            <div className="text-center py-12 text-gray-500">No matching players found. Adjust your filters.</div>
          )}
        </div>
      )}
    </div>
  );
}
