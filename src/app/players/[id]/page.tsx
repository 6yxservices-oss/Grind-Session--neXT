import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayerById, getNilContract } from "@/lib/queries";
import StarRating from "@/components/star-rating";
import GradeBadge from "@/components/grade-badge";
import SocialButtons from "@/components/social-buttons";

export const dynamic = "force-dynamic";

function fmt(v: number): string {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

export default function PlayerDetailPage({ params }: { params: { id: string } }) {
  const player = getPlayerById(parseInt(params.id));
  if (!player) notFound();
  const nilContract = getNilContract(player.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/players" className="text-sm text-gray-400 hover:text-gray-200 mb-2 inline-block">&larr; Back to Recruits</Link>
          <h1 className="text-3xl font-bold">{player.first_name} {player.last_name}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="badge-blue">{player.position}</span>
            <span className="text-gray-400">Class of {player.class_year}</span>
            {player.team_name && <Link href={`/teams/${player.team_id}`} className="text-psu-accent hover:underline">{player.team_name}</Link>}
            {player.committed_to && <span className="badge bg-green-500/20 text-green-400">Committed: {player.committed_to}</span>}
            {player.nil_value ? <span className="badge-gold">NIL: {fmt(player.nil_value)}</span> : null}
          </div>
        </div>
        <div className="flex gap-2">
          <SocialButtons playerId={player.id} counts={player.social_counts} />
          <Link href={`/reports/new?player=${player.id}`} className="btn-primary text-sm">+ Scout Report</Link>
        </div>
      </div>

      {/* Info Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Player Info</h2>
          <div className="space-y-3 text-sm">
            {[["Height", player.height || "—"], ["Weight", player.weight ? `${player.weight} lbs` : "—"], ["High School", player.high_school || "—"], ["Hometown", player.hometown && player.state ? `${player.hometown}, ${player.state}` : "—"]].map(([l, v]) => (
              <div key={l} className="flex justify-between"><span className="text-gray-400">{l}</span><span>{v}</span></div>
            ))}
            <div className="flex justify-between items-center"><span className="text-gray-400">Rating</span><StarRating rating={player.star_rating} /></div>
            {player.ranking && <div className="flex justify-between"><span className="text-gray-400">National Rank</span><span className="text-psu-gold font-bold">#{player.ranking}</span></div>}
          </div>
        </div>

        {/* Football Metrics */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Physical Metrics & Performance</h2>
          {player.metrics ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { label: "Top Speed", value: player.metrics.top_speed_mph, unit: " mph", highlight: true },
                { label: "Times @ Top Speed", value: player.metrics.top_speed_times_reached, unit: "x this season" },
                { label: "Pos Avg Speed", value: player.metrics.avg_top_speed_pos, unit: " mph" },
                { label: "40-Yard", value: player.metrics.forty_yard, unit: "s", highlight: true },
                { label: "Shuttle", value: player.metrics.shuttle, unit: "s" },
                { label: "Vertical", value: player.metrics.vertical_jump, unit: '"' },
                { label: "Broad Jump", value: player.metrics.broad_jump, unit: '"' },
                { label: "Bench Reps", value: player.metrics.bench_press_reps, unit: "" },
                ...(player.metrics.throw_velocity_mph ? [
                  { label: "Throw Velo", value: player.metrics.throw_velocity_mph, unit: " mph", highlight: true },
                  { label: "Avg QB Velo", value: player.metrics.throw_velocity_avg_pos, unit: " mph" },
                ] : []),
                ...(player.metrics.tackle_force_lbs ? [
                  { label: "Tackle Force", value: player.metrics.tackle_force_lbs, unit: " lbs", highlight: true },
                  { label: "NFL Avg Tackle", value: player.metrics.nfl_avg_tackle_force, unit: " lbs" },
                ] : []),
                ...(player.metrics.block_force_lbs ? [
                  { label: "Block Force", value: player.metrics.block_force_lbs, unit: " lbs", highlight: true },
                  { label: "NFL Avg Block", value: player.metrics.nfl_avg_block_force, unit: " lbs" },
                ] : []),
                { label: "Wingspan", value: player.metrics.wingspan, unit: "" },
                { label: "Hand Size", value: player.metrics.hand_size, unit: '"' },
                { label: "Arm Length", value: player.metrics.arm_length, unit: '"' },
              ].map((m) => (
                <div key={m.label} className={`text-center p-2 rounded-lg ${m.highlight ? "bg-psu-accent/10 border border-psu-accent/20" : "bg-psu-blue"}`}>
                  <div className={`text-lg font-bold ${m.highlight ? "text-psu-accent" : ""}`}>{m.value != null ? `${m.value}${m.unit}` : "—"}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 text-sm text-center py-8">No metrics recorded</p>}
          {/* NFL Benchmark comparison bar */}
          {player.metrics?.top_speed_mph && player.metrics?.avg_top_speed_pos && (
            <div className="mt-4 p-3 bg-psu-blue rounded-lg">
              <div className="text-xs text-gray-400 mb-2">Top Speed vs Position Average</div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="w-full bg-gray-800 rounded-full h-3 relative">
                    <div className="bg-psu-steel h-3 rounded-full absolute" style={{ width: `${(player.metrics.avg_top_speed_pos / 25) * 100}%` }} />
                    <div className="bg-psu-accent h-3 rounded-full absolute" style={{ width: `${(player.metrics.top_speed_mph / 25) * 100}%` }} />
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-psu-accent font-bold">{player.metrics.top_speed_mph}</span>
                  <span className="text-gray-500"> vs </span>
                  <span className="text-psu-steel">{player.metrics.avg_top_speed_pos}</span>
                  <span className="text-gray-500"> mph</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NFL Projection */}
      {player.nfl_projection && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">NFL Draft Projection</h2>
            <span className={`badge ${player.nfl_projection.draft_probability >= 70 ? "bg-green-500/20 text-green-400" : player.nfl_projection.draft_probability >= 40 ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"}`}>
              {player.nfl_projection.draft_probability}% Draft Probability
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-psu-blue rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-psu-gold">Draft Outlook</h3>
              {player.nfl_projection.projected_round && <div className="flex justify-between text-sm"><span className="text-gray-400">Round</span><span className="font-medium">Round {player.nfl_projection.projected_round}</span></div>}
              {player.nfl_projection.projected_pick_range && <div className="flex justify-between text-sm"><span className="text-gray-400">Pick Range</span><span>{player.nfl_projection.projected_pick_range}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-gray-400">Archetype</span><span>{player.nfl_projection.player_archetype ?? "—"}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Role</span><span>{player.nfl_projection.projected_role ?? "—"}</span></div>
              <div className="pt-2 border-t border-gray-700 space-y-1">
                <div className="flex justify-between text-xs"><span className="text-gray-500">Pro Bowl %</span><span className="text-green-400">{player.nfl_projection.pro_bowl_probability}%</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">Bust %</span><span className="text-red-400">{player.nfl_projection.bust_probability}%</span></div>
              </div>
            </div>
            <div className="bg-psu-blue rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-psu-accent">Projected Earnings</h3>
              {[["Rookie Contract", player.nfl_projection.projected_rookie_contract], ["Second Contract", player.nfl_projection.projected_second_contract], ["Career Earnings", player.nfl_projection.career_earnings_est]].map(([l, v]) => (
                <div key={l as string} className="flex justify-between text-sm"><span className="text-gray-400">{l as string}</span><span className="font-bold text-psu-gold">{v ? fmt(v as number) : "—"}</span></div>
              ))}
            </div>
            <div className="bg-psu-blue rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold mb-3">NFL Comparisons</h3>
              {player.nfl_projection.nfl_comparison && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-psu-accent/20 flex items-center justify-center text-psu-accent text-xs font-bold">#1</div>
                  <div><div className="font-medium">{player.nfl_projection.nfl_comparison}</div><div className="text-xs text-gray-500">{player.nfl_projection.nfl_comp_similarity}% match</div></div>
                </div>
              )}
              {player.nfl_projection.secondary_comparison && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">#2</div>
                  <div className="font-medium">{player.nfl_projection.secondary_comparison}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transfer Portal Status */}
      {player.portal_entry && (
        <div className="card border-red-500/20">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Transfer Portal Status</h2>
            <span className={`badge ${player.portal_entry.transfer_likelihood >= 70 ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
              {player.portal_entry.transfer_likelihood}% Transfer Likelihood
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-400">Playing Time:</span> <span className="font-medium">{player.portal_entry.current_playing_time_pct}%</span></div>
            <div><span className="text-gray-400">NIL Increase:</span> <span className="text-psu-gold font-medium">+{player.portal_entry.projected_nil_increase}%</span></div>
            <div><span className="text-gray-400">Status:</span> <span>{player.portal_entry.status}</span></div>
            {player.portal_entry.reason && <div><span className="text-gray-400">Reason:</span> <span>{player.portal_entry.reason}</span></div>}
          </div>
        </div>
      )}

      {/* NIL Merch Store */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">NIL Merch Store</h2>
          <div className="flex items-center gap-3">
            {nilContract ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs font-medium">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                NIL Agreement Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-medium">
                Awaiting NIL Agreement
              </span>
            )}
            <Link href={`/players/${player.id}/nil`} className="btn-primary text-xs">
              {nilContract ? "Shop Merch" : "Activate Store"}
            </Link>
          </div>
        </div>
        {nilContract && player.merch.length > 0 ? (
          <>
            <p className="text-sm text-gray-400 mb-4">
              Every purchase supports <span className="text-psu-accent font-medium">{player.first_name}</span> directly &mdash; 70% to the player, 30% to HVU collective
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {player.merch.map((item) => (
                <Link key={item.id} href={`/players/${player.id}/nil`} className="bg-psu-blue rounded-lg p-4 text-center hover:bg-psu-accent/10 transition-colors">
                  <div className="w-16 h-16 mx-auto mb-2 bg-psu-light/20 rounded-lg flex items-center justify-center text-2xl">
                    {item.category === "Jersey" || item.category === "Apparel" ? "👕" : item.category === "Hat" || item.category === "Headwear" ? "🧢" : item.category === "Poster" || item.category === "Collectibles" ? "🏈" : "🛍"}
                  </div>
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-psu-gold font-bold mt-1">${item.price.toFixed(2)}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{item.category}</div>
                </Link>
              ))}
            </div>
          </>
        ) : nilContract ? (
          <p className="text-sm text-gray-400 text-center py-4">Merch items coming soon. <Link href={`/players/${player.id}/nil`} className="text-psu-accent hover:underline">Visit the store</Link></p>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="text-4xl">🏈</div>
            <p className="text-gray-400 text-sm">This player hasn&apos;t activated their NIL merch store yet.</p>
            <Link href={`/players/${player.id}/nil`} className="btn-primary inline-block text-sm">
              Activate NIL Store
            </Link>
            <p className="text-xs text-gray-600">Players sign a non-exclusive licensing agreement to activate</p>
          </div>
        )}
      </div>

      {/* Scholastic */}
      {player.scholastic && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Academics</h2>
            {player.scholastic.ncaa_eligible ? <span className="badge bg-green-500/20 text-green-400">NCAA Eligible</span> : <span className="badge bg-red-500/20 text-red-400">Eligibility Pending</span>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-400">GPA:</span> <span className="text-psu-gold font-bold">{player.scholastic.gpa?.toFixed(2) ?? "N/A"}</span></div>
            <div><span className="text-gray-400">SAT:</span> <span>{player.scholastic.sat_score ?? "N/A"}</span></div>
            <div><span className="text-gray-400">ACT:</span> <span>{player.scholastic.act_score ?? "N/A"}</span></div>
            <div><span className="text-gray-400">Major:</span> <span>{player.scholastic.intended_major ?? "Undecided"}</span></div>
          </div>
        </div>
      )}

      {/* Game Log */}
      {player.stats.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Game Log</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-psu-light/20">
                <tr>
                  {["Game", "Snaps", "Pass", "Pass Yds", "TD/INT", "Rush", "Rush Yds", "Rush TD", "Rec", "Rec Yds", "Rec TD", "Tkl", "TFL", "Sacks"].map((h) => <th key={h} className="table-header">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-psu-light/10">
                {player.stats.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5">
                    <td className="table-cell text-sm">{s.game_info}</td>
                    <td className="table-cell">{s.snaps}</td>
                    <td className="table-cell">{s.pass_completions}/{s.pass_attempts}</td>
                    <td className="table-cell font-medium text-psu-accent">{s.pass_yards}</td>
                    <td className="table-cell">{s.pass_tds}/{s.interceptions}</td>
                    <td className="table-cell">{s.rush_attempts}</td>
                    <td className="table-cell">{s.rush_yards}</td>
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

      {/* Scouting Reports */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Scouting Reports ({player.reports.length})</h2>
          <Link href={`/reports/new?player=${player.id}`} className="btn-secondary text-sm">+ Add Report</Link>
        </div>
        {player.reports.length > 0 ? (
          <div className="space-y-4">
            {player.reports.map((r) => (
              <Link key={r.id} href={`/reports/${r.id}`} className="block p-4 bg-psu-blue rounded-lg hover:bg-psu-blue/80 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <GradeBadge grade={r.overall_grade} />
                    <div><div className="text-sm font-medium">by {r.scout_name}</div><div className="text-xs text-gray-500">{r.created_at}</div></div>
                  </div>
                </div>
                {r.notes && <p className="text-sm text-gray-300 line-clamp-2">{r.notes}</p>}
              </Link>
            ))}
          </div>
        ) : <p className="text-gray-500 text-sm text-center py-8">No scouting reports yet</p>}
      </div>
    </div>
  );
}
