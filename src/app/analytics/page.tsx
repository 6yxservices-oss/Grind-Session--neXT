import Link from "next/link";
import { getF1ReadinessScores, getMarketValueProjections, getTeamFitAnalysis } from "@/lib/analytics";
import StarRating from "@/components/star-rating";
import { SERIES } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatValue(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export default function AnalyticsPage({ searchParams }: { searchParams: { tab?: string; series?: string; minStars?: string } }) {
  const tab = searchParams.tab || "readiness";
  const readiness = getF1ReadinessScores({ series: searchParams.series });
  const marketValues = getMarketValueProjections();
  const teamFit = getTeamFitAnalysis({ series: searchParams.series, minRating: searchParams.minStars ? parseInt(searchParams.minStars) : undefined });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Analytics & Insights</h1><p className="text-gray-400 text-sm mt-1">F1 readiness, market value, and team fit analysis</p></div>

      <div className="flex gap-2 border-b border-gray-800 pb-3">
        {[{ key: "readiness", label: "F1 Readiness" }, { key: "market", label: "Market Value" }, { key: "fit", label: "Team Fit" }].map((t) => (
          <Link key={t.key} href={`/analytics?tab=${t.key}`} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-haas-red/10 text-haas-red border-b-2 border-haas-red" : "text-gray-400 hover:text-gray-200"}`}>{t.label}</Link>
        ))}
      </div>

      <form className="flex flex-wrap gap-3">
        <input type="hidden" name="tab" value={tab} />
        <select name="series" defaultValue={searchParams.series || ""} className="select"><option value="">All Series</option>{SERIES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        {tab === "fit" && <select name="minStars" defaultValue={searchParams.minStars || ""} className="select"><option value="">Min Rating</option><option value="5">5 Stars</option><option value="4">4+ Stars</option><option value="3">3+ Stars</option></select>}
        <button type="submit" className="btn-primary">Apply</button>
      </form>

      {tab === "readiness" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {[{ label: "F1 Ready", count: readiness.filter((d) => d.f1_readiness >= 85).length, color: "text-green-400" }, { label: "1-2 Seasons", count: readiness.filter((d) => d.f1_readiness >= 50 && d.f1_readiness < 85).length, color: "text-alpine-cyan" }, { label: "Development", count: readiness.filter((d) => d.f1_readiness >= 30 && d.f1_readiness < 50).length, color: "text-yellow-400" }, { label: "Early Career", count: readiness.filter((d) => d.f1_readiness < 30).length, color: "text-gray-400" }].map((tier) => (
              <div key={tier.label} className="card text-center"><div className={`text-3xl font-bold ${tier.color}`}>{tier.count}</div><div className="text-xs text-gray-400 mt-1">{tier.label}</div></div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-800"><tr>{["#", "Driver", "Series", "Rating", "SL Pts", "F1 Readiness", "Tier", "Confidence"].map((h) => <th key={h} className="table-header">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-800/50">
                {readiness.map((d, i) => (
                  <tr key={d.driver_id} className="hover:bg-white/5">
                    <td className="table-cell text-gray-500">{i + 1}</td>
                    <td className="table-cell"><Link href={`/drivers/${d.driver_id}`} className="font-medium hover:text-haas-red">{d.driver_name}</Link>{d.team_name && <div className="text-xs text-gray-500">{d.team_name}</div>}</td>
                    <td className="table-cell"><span className="badge-blue">{d.current_series}</span></td>
                    <td className="table-cell"><StarRating rating={d.rating} /></td>
                    <td className="table-cell"><span className={d.super_license_points >= 40 ? "text-green-400 font-medium" : ""}>{d.super_license_points}</span></td>
                    <td className="table-cell"><div className="flex items-center gap-2"><div className="w-16 bg-gray-800 rounded-full h-2"><div className={`h-2 rounded-full ${d.f1_readiness >= 85 ? "bg-green-500" : d.f1_readiness >= 50 ? "bg-alpine-cyan" : d.f1_readiness >= 30 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${d.f1_readiness}%` }} /></div><span className="font-bold text-sm">{d.f1_readiness}%</span></div></td>
                    <td className="table-cell text-sm">{d.projected_tier}</td>
                    <td className="table-cell text-xs text-gray-400">{d.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "market" && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-800"><tr>{["#", "Driver", "Series", "Tier", "Year 1", "Year 2", "Year 3", "Peak", "Trend", "Best Fit"].map((h) => <th key={h} className="table-header">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-800/50">
              {marketValues.map((mv, i) => (
                <tr key={mv.driver_id} className="hover:bg-white/5">
                  <td className="table-cell text-gray-500">{i + 1}</td>
                  <td className="table-cell"><Link href={`/drivers/${mv.driver_id}`} className="font-medium hover:text-haas-red">{mv.driver_name}</Link></td>
                  <td className="table-cell"><span className="badge-blue">{mv.current_series}</span></td>
                  <td className="table-cell text-xs">{mv.projected_tier}</td>
                  <td className="table-cell text-sm">{formatValue(mv.year1_salary)}</td>
                  <td className="table-cell text-sm">{formatValue(mv.year2_salary)}</td>
                  <td className="table-cell text-sm">{formatValue(mv.year3_salary)}</td>
                  <td className="table-cell"><span className="text-alpine-cyan font-bold">{formatValue(mv.peak_salary)}</span></td>
                  <td className="table-cell"><span className={`badge ${mv.value_trend === "rising" ? "bg-green-500/20 text-green-400" : mv.value_trend === "stable" ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"}`}>{mv.value_trend}</span></td>
                  <td className="table-cell"><div className="flex flex-wrap gap-1">{mv.best_fit_teams.slice(0, 3).map((t) => <span key={t} className="badge-red text-[10px]">{t}</span>)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "fit" && (
        <div className="space-y-4">
          <div className="card bg-haas-gray/50 border-haas-red/20">
            <p className="text-sm text-gray-300"><strong className="text-haas-red">Team Fit Analysis</strong> matches drivers to F1 seats based on readiness, super license eligibility, and performance metrics.</p>
          </div>
          <div className="grid gap-4">
            {teamFit.map((d, i) => (
              <div key={d.driver_id} className="card hover:border-haas-red/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-haas-red/20 flex items-center justify-center text-haas-red font-bold text-sm">{i + 1}</div>
                    <div>
                      <Link href={`/drivers/${d.driver_id}`} className="text-lg font-semibold hover:text-haas-red">{d.driver_name}</Link>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="badge-blue">{d.current_series}</span>
                        <span className="text-sm text-gray-400">{d.nationality}</span>
                        <StarRating rating={d.rating} />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">{d.match_reasons.map((r) => <span key={r} className="badge bg-white/5 text-gray-300">{r}</span>)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Match Score</div>
                    <div className={`text-3xl font-bold ${d.match_score >= 80 ? "text-green-400" : d.match_score >= 60 ? "text-alpine-cyan" : "text-yellow-400"}`}>{d.match_score}</div>
                    <div className="text-xs text-gray-500 mt-1">{d.projected_tier}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
