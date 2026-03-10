import Link from "next/link";
import { notFound } from "next/navigation";
import { getDriverById, getDriverContract } from "@/lib/queries";
import StarRating from "@/components/star-rating";
import GradeBadge from "@/components/grade-badge";
import SocialButtons from "@/components/social-buttons";

export const dynamic = "force-dynamic";

function fmt(v: number): string {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

export default function DriverDetailPage({ params }: { params: { id: string } }) {
  const driver = getDriverById(parseInt(params.id));
  if (!driver) notFound();
  const driverContract = getDriverContract(driver.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/drivers" className="text-sm text-gray-400 hover:text-gray-200 mb-2 inline-block">&larr; Back to Drivers</Link>
          <h1 className="text-3xl font-bold">{driver.first_name} {driver.last_name}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="badge-blue">{driver.current_series}</span>
            <span className="text-gray-400">{driver.nationality}</span>
            {driver.age && <span className="text-gray-400">Age {driver.age}</span>}
            {driver.team_name && <Link href={`/teams/${driver.team_id}`} className="text-haas-red hover:underline">{driver.team_name}</Link>}
            {driver.academy && <span className="badge-pink">{driver.academy}</span>}
            {driver.f1_target_team && <span className={`badge ${driver.f1_target_team === "Haas" ? "bg-haas-red/20 text-haas-red" : driver.f1_target_team === "Alpine" ? "bg-alpine-blue/20 text-alpine-blue" : "bg-alpine-pink/20 text-alpine-pink"}`}>Target: {driver.f1_target_team}</span>}
            {driver.market_value ? <span className="badge bg-alpine-cyan/20 text-alpine-cyan">Value: {fmt(driver.market_value)}</span> : null}
          </div>
        </div>
        <div className="flex gap-2">
          <SocialButtons driverId={driver.id} counts={driver.social_counts} />
          <Link href={`/reports/new?player=${driver.id}`} className="btn-primary text-sm">+ Scout Report</Link>
        </div>
      </div>

      {/* Info + Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Driver Info</h2>
          <div className="space-y-3 text-sm">
            {[["Series", driver.current_series], ["Nationality", driver.nationality], ["Age", driver.age?.toString() || "—"], ["Career Wins", driver.career_wins.toString()], ["Career Podiums", driver.career_podiums.toString()], ["Career Poles", driver.career_poles.toString()]].map(([l, v]) => (
              <div key={l} className="flex justify-between"><span className="text-gray-400">{l}</span><span>{v}</span></div>
            ))}
            <div className="flex justify-between items-center"><span className="text-gray-400">Rating</span><StarRating rating={driver.rating} /></div>
            <div className="flex justify-between"><span className="text-gray-400">Super License Pts</span><span className={driver.super_license_eligible ? "text-green-400 font-bold" : "text-gray-300"}>{driver.super_license_points}{driver.super_license_eligible ? " (Eligible)" : ""}</span></div>
            {driver.ranking && <div className="flex justify-between"><span className="text-gray-400">Ranking</span><span className="text-haas-red font-bold">#{driver.ranking}</span></div>}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
          {driver.metrics ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[
                { label: "Quali Delta", value: driver.metrics.avg_qualifying_delta != null ? `${driver.metrics.avg_qualifying_delta > 0 ? "+" : ""}${driver.metrics.avg_qualifying_delta.toFixed(3)}s` : null, highlight: true },
                { label: "Race Pace Delta", value: driver.metrics.avg_race_pace_delta != null ? `${driver.metrics.avg_race_pace_delta > 0 ? "+" : ""}${driver.metrics.avg_race_pace_delta.toFixed(3)}s` : null },
                { label: "Wet Weather", value: driver.metrics.wet_weather_rating, unit: "/100", highlight: true },
                { label: "Tire Mgmt", value: driver.metrics.tire_management_rating, unit: "/100" },
                { label: "Overtaking", value: driver.metrics.overtaking_rating, unit: "/100", highlight: true },
                { label: "Consistency", value: driver.metrics.consistency_rating, unit: "/100" },
                { label: "Racecraft", value: driver.metrics.racecraft_rating, unit: "/100", highlight: true },
                { label: "Starts", value: driver.metrics.starts_rating, unit: "/100" },
                { label: "Reaction (avg)", value: driver.metrics.reaction_time_avg ? `${driver.metrics.reaction_time_avg.toFixed(3)}s` : null },
                { label: "Reaction (best)", value: driver.metrics.reaction_time_best ? `${driver.metrics.reaction_time_best.toFixed(3)}s` : null },
                { label: "Top Speed", value: driver.metrics.top_speed_kph ? `${driver.metrics.top_speed_kph} kph` : null, highlight: true },
                { label: "Avg Top Speed", value: driver.metrics.avg_top_speed_series ? `${driver.metrics.avg_top_speed_series} kph` : null },
                { label: "Mental Resilience", value: driver.metrics.mental_resilience_rating, unit: "/100" },
                { label: "Adaptability", value: driver.metrics.adaptability_rating, unit: "/100" },
                { label: "Sector Specialty", value: driver.metrics.sector_speciality },
              ].map((m) => (
                <div key={m.label} className={`text-center p-2 rounded-lg ${m.highlight ? "bg-haas-red/10 border border-haas-red/20" : "bg-haas-gray"}`}>
                  <div className={`text-lg font-bold ${m.highlight ? "text-haas-red" : ""}`}>{m.value != null ? `${m.value}${m.unit || ""}` : "—"}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 text-sm text-center py-8">No metrics recorded</p>}
        </div>
      </div>

      {/* Fan Vote Card */}
      <div className="card border-haas-red/20">
        <h2 className="text-lg font-semibold mb-4">Fan Vote &mdash; Should {driver.first_name} get a shot?</h2>
        <div className="flex items-center gap-6">
          <div className="text-center flex-1 p-4 bg-haas-red/10 rounded-lg">
            <div className="text-3xl font-bold text-haas-red">{driver.vote_counts.haas}</div>
            <div className="text-xs text-haas-silver mt-1">Haas neXT votes</div>
          </div>
          <div className="text-center flex-1 p-4 bg-alpine-blue/10 rounded-lg">
            <div className="text-3xl font-bold text-alpine-blue">{driver.vote_counts.alpine}</div>
            <div className="text-xs text-haas-silver mt-1">Alpine neXT votes</div>
          </div>
          <Link href="/vote" className="btn-vote">Cast Your Vote</Link>
        </div>
      </div>

      {/* F1 Projection */}
      {driver.f1_projection && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">F1 Projection</h2>
            <span className={`badge ${driver.f1_projection.f1_probability >= 70 ? "bg-green-500/20 text-green-400" : driver.f1_projection.f1_probability >= 40 ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"}`}>
              {driver.f1_projection.f1_probability}% F1 Probability
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-haas-gray rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-haas-red">Career Outlook</h3>
              {driver.f1_projection.projected_year && <div className="flex justify-between text-sm"><span className="text-gray-400">Target Year</span><span className="font-medium">{driver.f1_projection.projected_year}</span></div>}
              {driver.f1_projection.target_team && <div className="flex justify-between text-sm"><span className="text-gray-400">Target Team</span><span>{driver.f1_projection.target_team}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-gray-400">Archetype</span><span>{driver.f1_projection.driver_archetype ?? "—"}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Role</span><span>{driver.f1_projection.projected_role ?? "—"}</span></div>
              <div className="pt-2 border-t border-gray-700">
                <div className="flex justify-between text-xs"><span className="text-gray-500">Championship %</span><span className="text-alpine-cyan">{driver.f1_projection.championship_probability}%</span></div>
              </div>
            </div>
            <div className="bg-haas-gray rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-alpine-cyan">Projected Earnings</h3>
              {[["First F1 Contract", driver.f1_projection.projected_first_contract], ["Peak Salary", driver.f1_projection.projected_peak_salary], ["Career Earnings", driver.f1_projection.career_earnings_est]].map(([l, v]) => (
                <div key={l as string} className="flex justify-between text-sm"><span className="text-gray-400">{l as string}</span><span className="font-bold text-alpine-cyan">{v ? fmt(v as number) : "—"}</span></div>
              ))}
            </div>
            <div className="bg-haas-gray rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold mb-3">F1 Driver Comparisons</h3>
              {driver.f1_projection.f1_comparison && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-haas-red/20 flex items-center justify-center text-haas-red text-xs font-bold">#1</div>
                  <div><div className="font-medium">{driver.f1_projection.f1_comparison}</div><div className="text-xs text-gray-500">{driver.f1_projection.f1_comp_similarity}% match</div></div>
                </div>
              )}
              {driver.f1_projection.secondary_comparison && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-alpine-blue/20 flex items-center justify-center text-alpine-blue text-xs font-bold">#2</div>
                  <div className="font-medium">{driver.f1_projection.secondary_comparison}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Driver Market Status */}
      {driver.market_entry && (
        <div className="card border-green-500/20">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Market Status</h2>
            <span className={`badge ${driver.market_entry.availability_likelihood >= 70 ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
              {driver.market_entry.availability_likelihood}% Available
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-400">Contract:</span> <span className="font-medium">{driver.market_entry.contract_status}</span></div>
            {driver.market_entry.current_contract_end && <div><span className="text-gray-400">Expires:</span> <span>{driver.market_entry.current_contract_end}</span></div>}
            {driver.market_entry.interested_teams && <div><span className="text-gray-400">Interest:</span> <span className="text-alpine-pink">{driver.market_entry.interested_teams}</span></div>}
            {driver.market_entry.reason && <div><span className="text-gray-400">Notes:</span> <span>{driver.market_entry.reason}</span></div>}
          </div>
        </div>
      )}

      {/* Merch Store */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Driver Merch</h2>
          <div className="flex items-center gap-3">
            {driverContract ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs font-medium">Active Store</span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-medium">Awaiting Activation</span>
            )}
            <Link href={`/drivers/${driver.id}/merch`} className="btn-primary text-xs">{driverContract ? "Shop Merch" : "Activate Store"}</Link>
          </div>
        </div>
        {driverContract && driver.merch.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {driver.merch.map((item) => (
              <Link key={item.id} href={`/drivers/${driver.id}/merch`} className="bg-haas-gray rounded-lg p-4 text-center hover:bg-haas-red/10 transition-colors">
                <div className="w-16 h-16 mx-auto mb-2 bg-haas-light/20 rounded-lg flex items-center justify-center text-2xl">
                  {item.category === "Apparel" ? "👕" : item.category === "Headwear" ? "🧢" : item.category === "Model" ? "🏎" : "🏁"}
                </div>
                <div className="text-sm font-medium">{item.name}</div>
                <div className="text-haas-red font-bold mt-1">${item.price.toFixed(2)}</div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="text-4xl">🏎</div>
            <p className="text-gray-400 text-sm">Merch store not yet activated.</p>
            <Link href={`/drivers/${driver.id}/merch`} className="btn-primary inline-block text-sm">Activate Store</Link>
          </div>
        )}
      </div>

      {/* Race Results */}
      {driver.results.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Race Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-haas-light/20">
                <tr>{["Race", "Grid", "Finish", "Quali", "Points", "FL", "Gap"].map((h) => <th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-haas-light/10">
                {driver.results.map((r) => (
                  <tr key={r.id} className="hover:bg-white/5">
                    <td className="table-cell text-sm">{r.race_info}</td>
                    <td className="table-cell">P{r.grid_position || "—"}</td>
                    <td className="table-cell font-medium"><span className={r.race_position && r.race_position <= 3 ? "text-haas-red" : ""}>{r.dnf ? "DNF" : `P${r.race_position}`}</span></td>
                    <td className="table-cell">P{r.qualifying_position || "—"}</td>
                    <td className="table-cell font-medium text-alpine-cyan">{r.points_scored}</td>
                    <td className="table-cell">{r.fastest_lap ? <span className="text-purple-400">FL</span> : "—"}</td>
                    <td className="table-cell text-gray-400">{r.gap_to_leader || "—"}</td>
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
          <h2 className="text-lg font-semibold">Scouting Reports ({driver.reports.length})</h2>
          <Link href={`/reports/new?player=${driver.id}`} className="btn-secondary text-sm">+ Add Report</Link>
        </div>
        {driver.reports.length > 0 ? (
          <div className="space-y-4">
            {driver.reports.map((r) => (
              <Link key={r.id} href={`/reports/${r.id}`} className="block p-4 bg-haas-gray rounded-lg hover:bg-haas-gray/80 transition-colors">
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
