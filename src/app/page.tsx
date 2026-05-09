import Link from "next/link";
import { coaches, demoAthlete, formatHeight, getBenchmark, getRecruitingPeriod, profileCompleteness, schools, schoolsByPositionNeed } from "@/lib/recruiting";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const a = demoAthlete;
  const period = getRecruitingPeriod();
  const completeness = profileCompleteness(a);
  const benchmark = getBenchmark(a.position, "D1", "15U");
  const targetSchools = schoolsByPositionNeed(a.position).slice(0, 5);

  const periodColor: Record<string, string> = {
    contact: "text-green-400 border-green-500/30 bg-green-500/10",
    evaluation: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    quiet: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    dead: "text-red-400 border-red-500/30 bg-red-500/10",
  };

  return (
    <div className="space-y-6">
      <div className="haas-gradient rounded-xl p-6 border border-haas-light/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Synergyforce</h1>
            <p className="text-haas-silver text-sm mt-1">The ultimate prep platform for athletes who want to play at the next level. Train, get recruited, compete.</p>
          </div>
          <Link href="/recruiting" className="btn-vote text-sm">Open Recruiting Hub →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {[
            { tag: "TRAIN", desc: "Log verifiable metrics — vertical, approach, agility — that flow straight into your recruiting profile.", color: "text-haas-red" },
            { tag: "RECRUIT", desc: "Coach CRM, school depth charts, NCAA eligibility, and a templated email composer with dead-period guardrails.", color: "text-alpine-pink" },
            { tag: "COMPETE", desc: "Tournament tracking, highlight reel hosting, and feedback from coaches you've actually played in front of.", color: "text-alpine-cyan" },
          ].map((s) => (
            <div key={s.tag} className="bg-haas-dark/50 rounded-lg p-3 border border-haas-light/10">
              <span className={`text-xs font-bold uppercase ${s.color}`}>{s.tag}</span>
              <p className="text-[11px] text-haas-silver mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-2xl font-bold text-haas-red">{completeness.score}%</div>
          <div className="text-xs text-gray-400">Profile Complete</div>
          <div className="text-[10px] text-haas-silver mt-1">{completeness.missing.length ? `${completeness.missing.length} items left` : "Complete"}</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-alpine-blue">{coaches.length}</div>
          <div className="text-xs text-gray-400">Coaches in Directory</div>
          <div className="text-[10px] text-haas-silver mt-1">across {schools.length} schools</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-alpine-cyan">{targetSchools.length}+</div>
          <div className="text-xs text-gray-400">Schools w/ {a.position} Need</div>
          <div className="text-[10px] text-haas-silver mt-1">filtered to your position</div>
        </div>
        <div className={`card ${periodColor[period.period]} border`}>
          <div className="text-sm font-bold capitalize">{period.period} period</div>
          <div className="text-xs text-gray-400">NCAA Calendar</div>
          <div className="text-[10px] mt-1 opacity-80">{period.label}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Athlete Snapshot</h2>
            <Link href="/recruiting/profile" className="text-haas-red text-sm hover:underline">Full Profile →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <Snap label="Class" value={String(a.classYear)} />
            <Snap label="Position" value={a.position} />
            <Snap label="Height" value={formatHeight(a.height)} />
            <Snap label="Approach" value={a.approachJump ? `${a.approachJump}"` : "—"} />
            <Snap label="Block" value={a.blockJump ? `${a.blockJump}"` : "—"} />
            <Snap label="GPA" value={a.gpa?.toFixed(2) ?? "—"} />
          </div>
          {benchmark && (
            <div className="text-xs text-haas-silver border-t border-haas-light/10 pt-3 italic">
              D1 {a.position} target ({benchmark.ageGroup}): approach <span className="text-white">{benchmark.metrics.approachJump?.target}"</span>, block <span className="text-white">{benchmark.metrics.blockJump?.target}"</span>, height <span className="text-white">{benchmark.metrics.height ? formatHeight(benchmark.metrics.height.target) : "—"}</span>.
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Top Schools w/ Need</h2>
          <div className="text-xs text-haas-silver mb-3">Filtered to {a.position} positions</div>
          <div className="space-y-2">
            {targetSchools.map((s) => {
              const slot = s.depthChart[a.position];
              return (
                <Link key={s.id} href="/recruiting/schools" className="flex items-center justify-between py-2 px-2 hover:bg-white/5 rounded-lg transition-colors">
                  <div>
                    <div className="text-sm font-medium">{s.shortName ?? s.name}</div>
                    <div className="text-xs text-haas-silver">{s.conference} · {s.division}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-haas-red font-bold text-sm">{slot?.needs ?? 0}</div>
                    <div className="text-[10px] text-haas-silver">open</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link href="/recruiting/coaches" className="card hover:border-haas-red/50 transition-colors block">
          <h3 className="text-base font-semibold mb-1">Coach CRM →</h3>
          <p className="text-xs text-haas-silver">Status per coach, last touch, follow-up dates, dead-period guardrails.</p>
        </Link>
        <Link href="/recruiting/eligibility" className="card hover:border-haas-red/50 transition-colors block">
          <h3 className="text-base font-semibold mb-1">NCAA Eligibility →</h3>
          <p className="text-xs text-haas-silver">Eligibility Center registration, core courses, sliding-scale GPA, milestones by grade.</p>
        </Link>
        <Link href="/gear" className="card hover:border-haas-red/50 transition-colors block">
          <h3 className="text-base font-semibold mb-1">Gear →</h3>
          <p className="text-xs text-haas-silver">VJ Sneaker featured partner + Synergyforce merch (coming soon).</p>
        </Link>
        <Link href="/feed" className="card hover:border-haas-red/50 transition-colors block">
          <h3 className="text-base font-semibold mb-1">Feed →</h3>
          <p className="text-xs text-haas-silver">Stories, results, and movement across the Synergyforce community.</p>
        </Link>
      </div>
    </div>
  );
}

function Snap({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-haas-gray/40 rounded-lg p-3 border border-haas-light/20">
      <div className="text-[10px] uppercase tracking-widest text-haas-silver">{label}</div>
      <div className="text-lg font-bold mt-0.5">{value}</div>
    </div>
  );
}
