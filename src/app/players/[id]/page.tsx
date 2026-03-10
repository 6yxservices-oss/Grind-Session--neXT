import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayerById } from "@/lib/queries";
import { getCollegeProbabilities, getMarketValueProjections } from "@/lib/analytics";
import StarRating from "@/components/star-rating";
import GradeBadge from "@/components/grade-badge";

export const dynamic = "force-dynamic";

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export default function PlayerDetailPage({ params }: { params: { id: string } }) {
  const player = getPlayerById(parseInt(params.id));
  if (!player) notFound();

  const collegeProbabilities = getCollegeProbabilities();
  const playerProb = collegeProbabilities.find((p) => p.player_id === player.id);
  const marketProjections = getMarketValueProjections(player.id);
  const marketValue = marketProjections[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/players" className="text-sm text-gray-400 hover:text-gray-200 mb-2 inline-block">&larr; Back to Players</Link>
          <h1 className="text-3xl font-bold">{player.first_name} {player.last_name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="badge-blue">{player.position}</span>
            <span className="text-gray-400">Class of {player.class_year}</span>
            {player.team_name && (
              <Link href={`/teams/${player.team_id}`} className="text-eybl-accent hover:underline">{player.team_name}</Link>
            )}
          </div>
        </div>
        <Link href={`/reports/new?player=${player.id}`} className="btn-primary">
          + New Report
        </Link>
      </div>

      {/* Info + Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Info */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Player Info</h2>
          <div className="space-y-3 text-sm">
            {[
              ["Height", player.height || "—"],
              ["Weight", player.weight ? `${player.weight} lbs` : "—"],
              ["High School", player.high_school || "—"],
              ["Hometown", player.hometown && player.state ? `${player.hometown}, ${player.state}` : "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-400">{label}</span>
                <span>{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Rating</span>
              <StarRating rating={player.star_rating} />
            </div>
            {player.ranking && (
              <div className="flex justify-between">
                <span className="text-gray-400">National Rank</span>
                <span className="text-eybl-gold font-bold">#{player.ranking}</span>
              </div>
            )}
          </div>
        </div>

        {/* Season Averages */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Season Averages</h2>
          {player.averages.games_played > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "PPG", value: player.averages.ppg, highlight: true },
                { label: "RPG", value: player.averages.rpg },
                { label: "APG", value: player.averages.apg },
                { label: "SPG", value: player.averages.spg },
                { label: "BPG", value: player.averages.bpg },
                { label: "MPG", value: player.averages.mpg },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className={`text-2xl font-bold ${stat.highlight ? "text-eybl-accent" : ""}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
              <div className="text-center col-span-3 pt-2 border-t border-gray-800">
                <span className="text-sm text-gray-400">{player.averages.games_played} games played</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No game stats recorded</p>
          )}
        </div>

        {/* College Probability */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">College Probability</h2>
          {playerProb ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${
                  playerProb.college_probability >= 80 ? "text-green-400" :
                  playerProb.college_probability >= 60 ? "text-blue-400" :
                  playerProb.college_probability >= 40 ? "text-yellow-400" :
                  "text-red-400"
                }`}>
                  {playerProb.college_probability}%
                </div>
                <div className="text-sm text-gray-400 mt-1">{playerProb.projected_level}</div>
                <div className="text-xs text-gray-600 mt-1">Confidence: {playerProb.confidence}%</div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Star Rating", value: playerProb.factors.star_factor },
                  { label: "Statistics", value: playerProb.factors.stats_factor },
                  { label: "Size/Measurables", value: playerProb.factors.size_factor },
                  { label: "Consistency", value: playerProb.factors.consistency_factor },
                ].map((factor) => (
                  <div key={factor.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{factor.label}</span>
                      <span>{factor.value}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div
                        className="bg-eybl-accent h-1.5 rounded-full transition-all"
                        style={{ width: `${factor.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">Insufficient data</p>
          )}
        </div>
      </div>

      {/* Physical Metrics */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Physical Metrics & Combine Data</h2>
        {player.physical ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: "Wingspan", value: player.physical.wingspan, unit: "" },
              { label: "Standing Reach", value: player.physical.standing_reach, unit: "" },
              { label: "Speed", value: player.physical.speed_mph, unit: " mph", highlight: true },
              { label: "Vertical", value: player.physical.vertical_jump, unit: '"', highlight: true },
              { label: "Max Vertical", value: player.physical.max_vertical, unit: '"' },
              { label: "Lane Agility", value: player.physical.lane_agility, unit: "s" },
              { label: "3/4 Sprint", value: player.physical.sprint_3qt, unit: "s" },
              { label: "Shuttle Run", value: player.physical.shuttle_run, unit: "s" },
              { label: "Hand Length", value: player.physical.hand_length, unit: '"' },
              { label: "Hand Width", value: player.physical.hand_width, unit: '"' },
              { label: "Body Fat", value: player.physical.body_fat_pct, unit: "%" },
              { label: "Bench Reps", value: player.physical.bench_press_reps, unit: "" },
            ].map((m) => (
              <div key={m.label} className={`text-center p-3 rounded-lg ${m.highlight ? "bg-eybl-accent/10 border border-eybl-accent/20" : "bg-eybl-blue"}`}>
                <div className={`text-xl font-bold ${m.highlight ? "text-eybl-accent" : ""}`}>
                  {m.value != null ? `${m.value}${m.unit}` : "—"}
                </div>
                <div className="text-xs text-gray-500 mt-1">{m.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">No physical metrics recorded yet</p>
        )}
      </div>

      {/* NBA Projection */}
      {player.nba_projection && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">NBA Draft & Career Projection</h2>
            <span className={`badge ${
              player.nba_projection.draft_probability >= 70 ? "bg-green-500/20 text-green-400" :
              player.nba_projection.draft_probability >= 40 ? "bg-yellow-500/20 text-yellow-400" :
              "bg-gray-500/20 text-gray-400"
            }`}>
              {player.nba_projection.draft_probability}% Draft Probability
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Draft Info */}
            <div className="bg-eybl-blue rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-eybl-gold">Draft Outlook</h3>
              {player.nba_projection.projected_round && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Projected Round</span>
                  <span className="font-medium">Round {player.nba_projection.projected_round}</span>
                </div>
              )}
              {player.nba_projection.projected_pick_range && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Pick Range</span>
                  <span className="font-medium">{player.nba_projection.projected_pick_range}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Archetype</span>
                <span className="font-medium">{player.nba_projection.player_archetype ?? "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Projected Role</span>
                <span className="font-medium">{player.nba_projection.projected_role ?? "—"}</span>
              </div>
              <div className="pt-2 border-t border-gray-700 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">All-Star Probability</span>
                  <span className="text-green-400">{player.nba_projection.all_star_probability}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Bust Probability</span>
                  <span className="text-red-400">{player.nba_projection.bust_probability}%</span>
                </div>
              </div>
            </div>

            {/* Minutes Projection */}
            <div className="bg-eybl-blue rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-blue-400">Projected NBA Minutes</h3>
              {[
                { label: "Rookie Year", value: player.nba_projection.projected_minutes_yr1 },
                { label: "Year 3", value: player.nba_projection.projected_minutes_yr3 },
                { label: "Prime Years", value: player.nba_projection.projected_minutes_prime, highlight: true },
              ].map((yr) => (
                <div key={yr.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{yr.label}</span>
                    <span className={`font-medium ${yr.highlight ? "text-blue-400" : ""}`}>
                      {yr.value != null ? `${yr.value} MPG` : "—"}
                    </span>
                  </div>
                  {yr.value != null && (
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(yr.value / 40) * 100}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Salary Projection */}
            <div className="bg-eybl-blue rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-eybl-accent">Projected NBA Salary</h3>
              {[
                { label: "Rookie Contract", value: player.nba_projection.projected_salary_rookie },
                { label: "Year 5", value: player.nba_projection.projected_salary_yr5 },
                { label: "Prime Contract", value: player.nba_projection.projected_salary_prime, highlight: true },
              ].map((yr) => (
                <div key={yr.label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{yr.label}</span>
                  <span className={`font-bold ${yr.highlight ? "text-eybl-accent" : ""}`}>
                    {yr.value != null ? formatCurrency(yr.value) : "—"}
                  </span>
                </div>
              ))}
              {player.nba_projection.career_earnings_est != null && (
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Est. Career Earnings</span>
                    <span className="text-eybl-gold font-bold">{formatCurrency(player.nba_projection.career_earnings_est)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* NBA Comparisons */}
          <div className="bg-eybl-blue rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">NBA Player Comparisons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {player.nba_projection.nba_comparison && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-eybl-accent/20 flex items-center justify-center text-eybl-accent text-xs font-bold">
                    #1
                  </div>
                  <div>
                    <div className="font-medium">{player.nba_projection.nba_comparison}</div>
                    <div className="text-xs text-gray-500">
                      Similarity: {player.nba_projection.nba_comp_similarity != null ? `${player.nba_projection.nba_comp_similarity}%` : "—"}
                    </div>
                  </div>
                </div>
              )}
              {player.nba_projection.secondary_comparison && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                    #2
                  </div>
                  <div>
                    <div className="font-medium">{player.nba_projection.secondary_comparison}</div>
                    <div className="text-xs text-gray-500">Secondary comparison</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scholastic Data & NextUp Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scholastic Data */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Scholastic Profile</h2>
            {player.scholastic?.ncaa_eligible ? (
              <span className="badge bg-green-500/20 text-green-400">NCAA Eligible</span>
            ) : player.scholastic ? (
              <span className="badge bg-red-500/20 text-red-400">Eligibility Pending</span>
            ) : null}
          </div>
          {player.scholastic ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-xs mb-1">GPA</div>
                  <div className="text-xl font-bold text-eybl-gold">
                    {player.scholastic.gpa?.toFixed(2) ?? "N/A"} / {player.scholastic.gpa_scale}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">Core GPA</div>
                  <div className="text-xl font-bold">
                    {player.scholastic.core_gpa?.toFixed(2) ?? "N/A"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">SAT</span>
                  <span className="font-medium">{player.scholastic.sat_score ?? "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ACT</span>
                  <span className="font-medium">{player.scholastic.act_score ?? "N/A"}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Core Courses</span>
                  <span>{player.scholastic.core_courses_completed}/{player.scholastic.core_courses_required}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-eybl-gold h-2 rounded-full"
                    style={{ width: `${(player.scholastic.core_courses_completed / player.scholastic.core_courses_required) * 100}%` }}
                  />
                </div>
              </div>
              {[
                ["Academic Standing", player.scholastic.academic_standing],
                ["Intended Major", player.scholastic.intended_major ?? "Undecided"],
                ["Honors/AP Courses", String(player.scholastic.honors_ap_courses)],
                ["Class Rank", player.scholastic.class_rank && player.scholastic.class_size ? `${player.scholastic.class_rank} / ${player.scholastic.class_size}` : "N/A"],
                ["NCAA Clearinghouse", player.scholastic.ncaa_clearinghouse_id ? "Registered" : "Not Registered"],
                ["Transcript", player.scholastic.transcript_on_file ? "On File" : "Not Received"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-400">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No scholastic data on file</p>
          )}
        </div>

        {/* NextUp World Profile */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">NextUp Profile</h2>
            {player.nextup?.profile_verified ? (
              <span className="badge bg-blue-500/20 text-blue-400">Verified</span>
            ) : null}
          </div>
          {player.nextup ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{player.nextup.highlights_count}</div>
                  <div className="text-xs text-gray-500">Highlights</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{player.nextup.followers}</div>
                  <div className="text-xs text-gray-500">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{player.nextup.profile_verified ? "Yes" : "No"}</div>
                  <div className="text-xs text-gray-500">Verified</div>
                </div>
              </div>
              {player.nextup.nextup_url && (
                <a
                  href={player.nextup.nextup_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary block text-center text-sm"
                >
                  View NextUp Profile &rarr;
                </a>
              )}
              {player.nextup.last_synced && (
                <p className="text-xs text-gray-600 text-center">Last synced: {player.nextup.last_synced}</p>
              )}
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <p className="text-gray-500 text-sm">No NextUp profile linked</p>
              <p className="text-xs text-gray-600">Connect this player&apos;s NextUp World profile to sync highlights, followers, and verified status</p>
            </div>
          )}
        </div>
      </div>

      {/* Market Value Projection */}
      {marketValue && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">
            Transfer Portal Market Value Projection
            <span className={`ml-3 badge ${
              marketValue.value_trend === "rising" ? "bg-green-500/20 text-green-400" :
              marketValue.value_trend === "stable" ? "bg-blue-500/20 text-blue-400" :
              "bg-red-500/20 text-red-400"
            }`}>
              {marketValue.value_trend === "rising" ? "Trending Up" :
               marketValue.value_trend === "stable" ? "Stable" : "Declining"}
            </span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {[
              { label: "Freshman NIL", value: marketValue.year1_value },
              { label: "Sophomore NIL", value: marketValue.year2_value },
              { label: "Junior NIL", value: marketValue.year3_value },
              { label: "Senior NIL", value: marketValue.year4_value },
              { label: "Portal Value", value: marketValue.portal_value, highlight: true },
            ].map((yr) => (
              <div key={yr.label} className={`text-center p-3 rounded-lg ${yr.highlight ? "bg-eybl-accent/10 border border-eybl-accent/30" : "bg-eybl-blue"}`}>
                <div className={`text-xl font-bold ${yr.highlight ? "text-eybl-accent" : ""}`}>
                  {formatCurrency(yr.value)}
                </div>
                <div className="text-xs text-gray-400 mt-1">{yr.label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Conference Fit</h3>
              <div className="flex flex-wrap gap-2">
                {marketValue.conference_fit.map((conf) => (
                  <span key={conf} className="badge-gold">{conf}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Player Comparisons</h3>
              <div className="flex flex-wrap gap-2">
                {marketValue.comparable_players.map((comp) => (
                  <span key={comp} className="badge-blue">{comp}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Log */}
      {player.stats.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Game Log</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-800">
                <tr>
                  {["Game", "MIN", "PTS", "REB", "AST", "STL", "BLK", "TO", "FG", "3PT", "FT"].map((h) => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {player.stats.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5">
                    <td className="table-cell text-sm">{s.game_info}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scouting Reports */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Scouting Reports ({player.reports.length})</h2>
          <Link href={`/reports/new?player=${player.id}`} className="btn-secondary text-sm">+ Add Report</Link>
        </div>
        {player.reports.length > 0 ? (
          <div className="space-y-4">
            {player.reports.map((report) => (
              <Link key={report.id} href={`/reports/${report.id}`} className="block p-4 bg-eybl-blue rounded-lg hover:bg-eybl-blue/80 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <GradeBadge grade={report.overall_grade} />
                    <div>
                      <div className="text-sm font-medium">by {report.scout_name}</div>
                      <div className="text-xs text-gray-500">{report.created_at}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {report.offensive_grade && <span className="text-xs text-gray-400">OFF: {report.offensive_grade}</span>}
                    {report.defensive_grade && <span className="text-xs text-gray-400">DEF: {report.defensive_grade}</span>}
                  </div>
                </div>
                {report.notes && <p className="text-sm text-gray-300 line-clamp-2">{report.notes}</p>}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">No scouting reports yet</p>
        )}
      </div>
    </div>
  );
}
