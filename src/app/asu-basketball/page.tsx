import Link from "next/link";
import {
  getHurleySeasons,
  getRoster2526,
  getTransferPortalHistory,
  getBennettSeasons,
  getBennettRosterModel,
  get2627Outlook,
  getNILData,
  getFacilitiesData,
  getChampionshipBenchmark,
  calculateWARValuations,
  getWARSensitivity,
  getRosterComposition,
} from "@/lib/asu-basketball";

export const dynamic = "force-dynamic";

function fmtDollar(v: number): string {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "roster", label: "Roster 25-26" },
  { key: "portal", label: "Portal Analysis" },
  { key: "bennett", label: "Bennett Model" },
  { key: "outlook", label: "2026-27 Outlook" },
  { key: "war", label: "WAR Engine" },
];

export default function ASUBasketballPage({ searchParams }: { searchParams: { tab?: string } }) {
  const tab = searchParams.tab || "overview";
  const hurley = getHurleySeasons();
  const roster = getRoster2526();
  const portalHistory = getTransferPortalHistory();
  const bennett = getBennettSeasons();
  const bennettModel = getBennettRosterModel();
  const outlook = get2627Outlook();
  const nil = getNILData();
  const facilities = getFacilitiesData();
  const benchmark = getChampionshipBenchmark();
  const warVals = calculateWARValuations();
  const warSens = getWARSensitivity();
  const composition = getRosterComposition();

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="asu-gradient rounded-xl p-8 border border-asu-maroon/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-asu-maroon flex items-center justify-center font-black text-asu-gold text-sm">ASU</div>
          <div>
            <h1 className="text-2xl font-bold text-white">ASU Sun Devils Basketball</h1>
            <p className="text-asu-gold/80 text-sm">Roster Construction Analysis &bull; Hurley &rarr; Bennett Transition</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-asu-black/60 rounded-lg p-3 border border-asu-maroon/20">
            <div className="text-2xl font-bold text-asu-gold">{hurley.length}</div>
            <div className="text-xs text-gray-400">Hurley Seasons</div>
          </div>
          <div className="bg-asu-black/60 rounded-lg p-3 border border-asu-maroon/20">
            <div className="text-2xl font-bold text-asu-gold">{hurley.filter(s => s.postseason.includes("NCAA")).length}</div>
            <div className="text-xs text-gray-400">NCAA Tournaments</div>
          </div>
          <div className="bg-asu-black/60 rounded-lg p-3 border border-asu-maroon/20">
            <div className="text-2xl font-bold text-asu-gold">{Math.min(...hurley.map(s => s.kenpomApprox))}</div>
            <div className="text-xs text-gray-400">Best KenPom</div>
          </div>
          <div className="bg-asu-black/60 rounded-lg p-3 border border-asu-maroon/20">
            <div className="text-2xl font-bold text-asu-gold">17-16</div>
            <div className="text-xs text-gray-400">Final Season</div>
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-2 border-b border-asu-maroon/30 pb-3 overflow-x-auto">
        {tabs.map((t) => (
          <Link key={t.key} href={`/asu-basketball?tab=${t.key}`} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${tab === t.key ? "bg-asu-maroon/20 text-asu-gold border-b-2 border-asu-gold" : "text-gray-400 hover:text-gray-200"}`}>{t.label}</Link>
        ))}
      </div>

      {/* ===== TAB: OVERVIEW ===== */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="card border-asu-maroon/30">
            <h2 className="text-lg font-bold text-asu-gold mb-2">The Coaching Change</h2>
            <p className="text-gray-300 text-sm leading-relaxed">Bobby Hurley was fired on March 11, 2026 after a 42-91 blowout loss to Iowa State in the Big 12 Tournament. In 11 seasons, Hurley made the NCAA Tournament just 3 times with zero wins beyond the Round of 64. His final two seasons produced a combined 30-36 record with the worst Big 12 finish (4-16) in 2024-25. Randy Bennett was hired from Saint Mary&apos;s, bringing a radically different philosophy: pack-line defense, Princeton motion offense, slow tempo, and an international development pipeline. Greg Howell joins as Director of Recruiting.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-asu-maroon/30">
                <tr>
                  {["Season", "Overall", "Conference", "Conf Finish", "Postseason", "KenPom"].map((h) => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {hurley.map((s) => {
                  const isNCAA = s.postseason.includes("NCAA");
                  const wins = parseInt(s.overall.split("-")[0]);
                  const losses = parseInt(s.overall.split("-")[1]);
                  return (
                    <tr key={s.season} className={`hover:bg-white/5 ${isNCAA ? "border-l-2 border-l-green-500" : losses > wins ? "border-l-2 border-l-red-500/50" : ""}`}>
                      <td className="table-cell font-medium text-asu-gold">{s.season}</td>
                      <td className="table-cell">{s.overall}</td>
                      <td className="table-cell text-xs"><span className="text-gray-400">{s.confRecord}</span> <span className="badge-maroon ml-1">{s.conference}</span></td>
                      <td className="table-cell">{s.confFinish}</td>
                      <td className="table-cell text-xs">{isNCAA ? <span className="text-green-400">{s.postseason}</span> : <span className="text-gray-500">{s.postseason}</span>}</td>
                      <td className="table-cell"><span className={s.kenpomApprox <= 50 ? "text-green-400 font-bold" : s.kenpomApprox <= 100 ? "text-yellow-400" : "text-red-400"}>{s.kenpomApprox}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== TAB: ROSTER ===== */}
      {tab === "roster" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "HS Recruits", data: composition.hsRecruits, color: "text-green-400" },
              { label: "1x Transfers", data: composition.transfers1x, color: "text-blue-400" },
              { label: "2x+ Transfers", data: composition.transfers2x, color: "text-blue-300" },
              { label: "International", data: composition.international, color: "text-purple-400" },
            ].map((c) => (
              <div key={c.label} className="card border-asu-maroon/20">
                <div className={`text-2xl font-bold ${c.color}`}>{c.data.count}</div>
                <div className="text-xs text-gray-400">{c.label}</div>
                <div className="text-xs text-gray-500 mt-1">{c.data.minPct}% of minutes &bull; {c.data.ppg.toFixed(1)} combined PPG</div>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-asu-maroon/30">
                <tr>
                  {["Player", "Pos", "Ht", "Class", "PPG", "RPG", "APG", "MPG", "GP", "Origin", "From", "2026-27 Status"].map((h) => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {[...roster].sort((a, b) => b.ppg - a.ppg).map((p) => (
                  <tr key={p.name} className="hover:bg-white/5">
                    <td className="table-cell font-medium">{p.name}</td>
                    <td className="table-cell">{p.pos}</td>
                    <td className="table-cell text-xs">{p.height}</td>
                    <td className="table-cell text-xs">{p.classYear}</td>
                    <td className="table-cell font-bold text-asu-gold">{p.ppg}</td>
                    <td className="table-cell">{p.rpg}</td>
                    <td className="table-cell">{p.apg}</td>
                    <td className="table-cell">{p.mpg}</td>
                    <td className="table-cell">{p.gp}</td>
                    <td className="table-cell">
                      <span className={p.origin === "HS Recruit" ? "badge-hs" : p.origin === "International" ? "badge-intl" : "badge-transfer"}>{p.origin}</span>
                    </td>
                    <td className="table-cell text-xs text-gray-400">{p.fromSchool}</td>
                    <td className="table-cell">
                      <span className={
                        p.status2627 === "Portal Out" ? "badge-portal-out" :
                        p.status2627 === "Returning (TBD)" ? "badge-returning" :
                        p.status2627 === "Eligibility Exhausted" ? "badge-exhausted" :
                        p.status2627 === "Injured" ? "badge-portal-out" :
                        "badge-maroon"
                      }>{p.status2627}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== TAB: PORTAL ===== */}
      {tab === "portal" && (
        <div className="space-y-6">
          <div className="card border-asu-maroon/20">
            <h2 className="text-lg font-bold text-asu-gold mb-2">Portal Dependency Index</h2>
            <p className="text-xs text-gray-400 mb-4">ASU&apos;s returning minute % has cratered &mdash; reaching 2% in 2025-26. Near-total roster rebuild every year.</p>
            <div className="space-y-3">
              {portalHistory.map((s) => (
                <div key={s.season} className="flex items-center gap-3">
                  <div className="w-20 text-xs font-medium text-asu-gold">{s.season}</div>
                  <div className="flex-1 bg-gray-800 rounded-full h-4 relative">
                    <div className={`h-4 rounded-full ${s.returningMinPct > 40 ? "bg-green-500" : s.returningMinPct > 20 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${s.returningMinPct}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">{s.returningMinPct}% returning</span>
                  </div>
                  <div className="w-28 text-xs text-gray-400">{s.record}</div>
                </div>
              ))}
            </div>
          </div>
          {portalHistory.map((s) => (
            <div key={s.season} className="card border-asu-maroon/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-asu-gold">{s.season}</h3>
                <div className="flex gap-3 text-xs">
                  <span className="badge-hs">{s.transfersIn} In</span>
                  <span className="badge-portal-out">{s.transfersOut} Out</span>
                  <span className="badge-maroon">{s.record}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-green-400 uppercase mb-2">Key Arrivals</h4>
                  <div className="space-y-1">
                    {s.keyIn.map((p) => (
                      <div key={p.name} className="flex items-center justify-between text-xs bg-green-500/5 rounded px-2 py-1">
                        <span className="font-medium">{p.name} <span className="text-gray-500">from {p.from}</span></span>
                        <span className={p.type === "Step-Up" ? "badge-hs" : p.type === "Lateral" ? "badge-transfer" : "badge-portal-out"}>{p.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-red-400 uppercase mb-2">Key Departures</h4>
                  <div className="space-y-1">
                    {s.keyOut.map((p) => (
                      <div key={p.name} className="flex items-center justify-between text-xs bg-red-500/5 rounded px-2 py-1">
                        <span className="font-medium">{p.name} <span className="text-gray-500">to {p.to}</span></span>
                        <span className="text-gray-400">{p.ppg} PPG</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== TAB: BENNETT ===== */}
      {tab === "bennett" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card border-asu-maroon/20">
              <h2 className="text-lg font-bold text-asu-gold mb-1">Scheme Profile</h2>
              <div className="space-y-3 mt-3">
                <div className="flex gap-2"><span className="badge-maroon">Offense</span><span className="text-sm text-gray-300">{bennettModel.schemeProfile.offense}</span></div>
                <div className="flex gap-2"><span className="badge-maroon">Defense</span><span className="text-sm text-gray-300">{bennettModel.schemeProfile.defense}</span></div>
                <div className="flex gap-2"><span className="badge-maroon">Tempo</span><span className="text-sm text-gray-300">{bennettModel.schemeProfile.tempo}</span></div>
              </div>
              <h3 className="text-xs font-bold text-asu-gold uppercase mt-4 mb-2">Identity Markers</h3>
              <ul className="space-y-1">
                {bennettModel.schemeProfile.identity.map((item, i) => (
                  <li key={i} className="text-xs text-gray-300 flex gap-2"><span className="text-asu-gold">&#9670;</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="card border-asu-maroon/20">
              <h2 className="text-lg font-bold text-asu-gold mb-3">International Pipeline</h2>
              <div className="space-y-3">
                {bennettModel.internationalPipeline.map((c) => (
                  <div key={c.country} className="bg-asu-black/40 rounded-lg p-3 border border-asu-maroon/10">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{c.country}</span>
                      <span className="badge-intl">{c.players} players</span>
                    </div>
                    {c.nbaProducts.length > 0 && <div className="text-xs text-asu-gold mt-1">NBA: {c.nbaProducts.join(", ")}</div>}
                    <div className="text-xs text-gray-400 mt-1">Recent: {c.keyRecent.join(", ")}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card border-asu-maroon/20">
            <h2 className="text-lg font-bold text-asu-gold mb-3">Bennett at Saint Mary&apos;s</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-asu-maroon/30">
                  <tr>
                    {["Season", "Overall", "WCC Record", "WCC Finish", "Postseason", "KenPom", "AdjDE Rank"].map((h) => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {bennett.map((s) => (
                    <tr key={s.season} className={`hover:bg-white/5 ${s.postseason.includes("NCAA") ? "border-l-2 border-l-green-500" : ""}`}>
                      <td className="table-cell font-medium text-asu-gold">{s.season}</td>
                      <td className="table-cell font-bold">{s.overall}</td>
                      <td className="table-cell">{s.wccRecord}</td>
                      <td className="table-cell">{s.wccFinish}</td>
                      <td className="table-cell text-xs">{s.postseason.includes("NCAA") ? <span className="text-green-400">{s.postseason}</span> : <span className="text-gray-400">{s.postseason}</span>}</td>
                      <td className="table-cell"><span className={s.kenpomApprox <= 15 ? "text-green-400 font-bold" : s.kenpomApprox <= 40 ? "text-yellow-400 font-bold" : "text-gray-300"}>{s.kenpomApprox}</span></td>
                      <td className="table-cell text-xs text-gray-400">{s.adjDE_rank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card border-asu-maroon/20">
            <h2 className="text-lg font-bold text-asu-gold mb-3">SMC Minute Distribution by Origin</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-asu-maroon/30">
                  <tr>
                    {["Season", "HS Recruits %", "Transfers %", "International %"].map((h) => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {bennettModel.minuteBreakdown.map((m) => (
                    <tr key={m.season} className="hover:bg-white/5">
                      <td className="table-cell font-medium text-asu-gold">{m.season}</td>
                      <td className="table-cell"><div className="flex items-center gap-2"><div className="w-20 bg-gray-800 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${m.hsRecruits}%` }} /></div><span className="text-xs">{m.hsRecruits}%</span></div></td>
                      <td className="table-cell"><div className="flex items-center gap-2"><div className="w-20 bg-gray-800 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${m.transfers}%` }} /></div><span className="text-xs">{m.transfers}%</span></div></td>
                      <td className="table-cell"><div className="flex items-center gap-2"><div className="w-20 bg-gray-800 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full" style={{ width: `${m.international}%` }} /></div><span className="text-xs">{m.international}%</span></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB: OUTLOOK ===== */}
      {tab === "outlook" && (
        <div className="space-y-6">
          <div className="card border-asu-maroon/20">
            <h2 className="text-lg font-bold text-asu-gold mb-3">2026-27 Portal Targets &amp; Retention</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-asu-maroon/30">
                  <tr>
                    {["Player", "Pos", "Ht", "From", "PPG", "RPG", "APG", "Type", "Likelihood", "Notes"].map((h) => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {outlook.map((t) => (
                    <tr key={t.name} className="hover:bg-white/5">
                      <td className="table-cell font-medium">{t.name}</td>
                      <td className="table-cell">{t.pos}</td>
                      <td className="table-cell text-xs">{t.height}</td>
                      <td className="table-cell text-xs text-gray-400">{t.from}</td>
                      <td className="table-cell font-bold text-asu-gold">{t.ppg || "—"}</td>
                      <td className="table-cell">{t.rpg || "—"}</td>
                      <td className="table-cell">{t.apg || "—"}</td>
                      <td className="table-cell">
                        <span className={t.type === "SMC Follow" ? "badge-maroon" : t.type === "HS Recruit" ? "badge-hs" : t.type === "Returning ASU" ? "badge-returning" : "badge-transfer"}>{t.type}</span>
                      </td>
                      <td className="table-cell"><div className="flex items-center gap-2"><div className="w-16 bg-gray-800 rounded-full h-2"><div className={`h-2 rounded-full ${t.likelihood >= 70 ? "bg-green-500" : t.likelihood >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${t.likelihood}%` }} /></div><span className="text-xs">{t.likelihood}%</span></div></td>
                      <td className="table-cell text-xs text-gray-400 max-w-xs">{t.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card border-asu-maroon/20">
              <h2 className="text-lg font-bold text-asu-gold mb-1">NIL Landscape</h2>
              <p className="text-xs text-gray-400 mb-3">{nil.collective} &bull; Est. {nil.estimatedBudget} &bull; {nil.big12Tier}</p>
              <div className="space-y-1">
                {nil.big12Comparison.map((s) => (
                  <div key={s.school} className={`flex items-center justify-between text-xs px-2 py-1.5 rounded ${s.school === "Arizona State" ? "bg-asu-maroon/20 border border-asu-maroon/40" : "hover:bg-white/5"}`}>
                    <span className={s.school === "Arizona State" ? "font-bold text-asu-gold" : "text-gray-300"}>{s.school}</span>
                    <div className="flex items-center gap-2">
                      <span className={s.tier === "Elite" ? "badge-asu-gold" : s.tier === "Top" ? "badge-hs" : s.tier === "Strong" ? "badge-transfer" : s.tier === "Mid" ? "badge-maroon" : "badge-exhausted"}>{s.tier}</span>
                      <span className="text-gray-400 w-16 text-right">{s.estimated}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="card border-asu-maroon/20">
                <h2 className="text-lg font-bold text-asu-gold mb-1">Desert Financial Arena</h2>
                <p className="text-xs text-gray-400 mb-3">{facilities.arena} &bull; {facilities.currentCapacity} seats &bull; {facilities.age} &bull; ${facilities.renovationBudget} renovation</p>
                <div className="space-y-2">
                  {facilities.phases.map((ph) => (
                    <div key={ph.phase} className="flex gap-3 text-xs">
                      <span className="badge-maroon w-16 text-center">{ph.phase}</span>
                      <div><span className="text-asu-gold font-medium">{ph.timeline}</span><span className="text-gray-400 ml-2">{ph.details}</span></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card border-asu-maroon/20">
                <h2 className="text-lg font-bold text-asu-gold mb-3">Projected Trajectory</h2>
                <div className="space-y-3">
                  {benchmark.projectedTrajectory.map((yr) => (
                    <div key={yr.year} className="bg-asu-black/40 rounded-lg p-3 border border-asu-maroon/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-asu-gold">{yr.year}</span>
                        <div className="flex gap-2 text-xs"><span className="badge-hs">{yr.wins}</span><span className="badge-maroon">Big 12: {yr.bigTwelve}</span><span className="badge-intl">KP: {yr.kenpom}</span></div>
                      </div>
                      <p className="text-xs text-gray-400">{yr.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB: WAR ENGINE ===== */}
      {tab === "war" && (
        <div className="space-y-6">
          <div className="card border-asu-maroon/20">
            <h2 className="text-lg font-bold text-asu-gold mb-1">Nikoza WAR Valuations</h2>
            <p className="text-xs text-gray-400 mb-4">Bottom-up player pricing adapted from Nik Oza&apos;s 7-input framework. Target: KenPom +12, Budget: $5.5M, Coaching Effect: +4.0</p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-asu-maroon/30">
                  <tr>
                    {["Player", "Pos", "Impact", "MPG", "Marginal", "Value", "Market", "Surplus", "Option", "Fit", "Fit Notes"].map((h) => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {warVals.map((w) => (
                    <tr key={w.name} className="hover:bg-white/5">
                      <td className="table-cell font-medium">{w.name}</td>
                      <td className="table-cell">{w.pos}</td>
                      <td className="table-cell"><span className={w.projectedImpact >= 3 ? "text-green-400 font-bold" : w.projectedImpact >= 0 ? "text-yellow-400" : "text-red-400"}>{w.projectedImpact > 0 ? "+" : ""}{w.projectedImpact}</span></td>
                      <td className="table-cell">{w.projectedMPG}</td>
                      <td className="table-cell font-medium">{w.marginalContribution.toFixed(2)}</td>
                      <td className="table-cell font-bold text-asu-gold">{fmtDollar(w.dollarValue)}</td>
                      <td className="table-cell text-xs text-gray-400">{w.marketPrice}</td>
                      <td className="table-cell"><span className={w.surplus === "Bargain" ? "text-green-400 font-bold" : w.surplus === "Fair" ? "text-yellow-400" : w.surplus.includes("Overpay") ? "text-red-400" : "text-gray-400"}>{w.surplus}</span></td>
                      <td className="table-cell text-xs">{w.optionValue}</td>
                      <td className="table-cell"><div className="flex items-center gap-1"><div className="w-12 bg-gray-800 rounded-full h-2"><div className={`h-2 rounded-full ${w.systemFit >= 80 ? "bg-green-500" : w.systemFit >= 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${w.systemFit}%` }} /></div><span className="text-xs">{w.systemFit}</span></div></td>
                      <td className="table-cell text-[10px] text-gray-500 max-w-[200px]">{w.systemFitNotes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card border-asu-maroon/20">
            <h2 className="text-lg font-bold text-asu-gold mb-1">Sensitivity Analysis: {warSens.playerName}</h2>
            <p className="text-xs text-gray-400 mb-4">Base valuation: <span className="text-asu-gold font-bold">{fmtDollar(warSens.baseValue)}</span> &mdash; how it changes across 7 scenarios</p>
            <div className="space-y-2">
              {warSens.scenarios.map((s) => {
                const delta = s.value - warSens.baseValue;
                return (
                  <div key={s.label} className="flex items-center gap-3 text-xs bg-asu-black/40 rounded-lg px-3 py-2 border border-asu-maroon/10">
                    <span className="w-52 font-medium text-gray-200">{s.label}</span>
                    <span className="w-20 font-bold text-asu-gold">{fmtDollar(s.value)}</span>
                    <span className={`w-20 font-bold ${delta > 0 ? "text-green-400" : delta < 0 ? "text-red-400" : "text-gray-400"}`}>{delta > 0 ? "+" : ""}{fmtDollar(Math.abs(delta))}</span>
                    <span className="flex-1 text-gray-500">{s.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card border-asu-maroon/20">
            <h2 className="text-lg font-bold text-asu-gold mb-3">Analytical Framework References</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-asu-black/40 rounded-lg p-4 border border-asu-maroon/10">
                <h3 className="font-bold text-sm text-green-400 mb-1">Hoop Explorer</h3>
                <p className="text-xs text-gray-400">RAPM decomposition, four-factor components, WOWY lineup analysis, play-style classification. The <span className="text-asu-gold">scouting layer</span> for individual player evaluation.</p>
              </div>
              <div className="bg-asu-black/40 rounded-lg p-4 border border-asu-maroon/10">
                <h3 className="font-bold text-sm text-blue-400 mb-1">ShootyHoops</h3>
                <p className="text-xs text-gray-400">Drag-and-drop roster impact simulator. Project KenPom AdjEM and win totals when adding/removing players. The <span className="text-asu-gold">construction layer</span> for roster assembly.</p>
              </div>
              <div className="bg-asu-black/40 rounded-lg p-4 border border-asu-maroon/10">
                <h3 className="font-bold text-sm text-asu-gold mb-1">Nikoza WAR</h3>
                <p className="text-xs text-gray-400">Bottom-up 7-input player pricing. Dollar valuation of marginal contribution above replacement. The <span className="text-asu-gold">pricing layer</span> for portal economics.</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
