import Link from "next/link";
import { coaches, demoAthlete, formatHeight, getBenchmark, getRecruitingPeriod, profileCompleteness, schools, schoolsByPositionNeed } from "@/lib/recruiting";

export const dynamic = "force-dynamic";

export default function RecruitingHub() {
  const period = getRecruitingPeriod();
  const completeness = profileCompleteness(demoAthlete);
  const benchmark = getBenchmark(demoAthlete.position, "D1", "15U");
  const matchingSchools = schoolsByPositionNeed(demoAthlete.position);

  const periodColor: Record<string, string> = {
    contact: "text-green-400 border-green-500/30 bg-green-500/10",
    evaluation: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    quiet: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    dead: "text-red-400 border-red-500/30 bg-red-500/10",
  };

  return (
    <div className="space-y-6">
      <div className="haas-gradient rounded-xl p-6 border border-haas-light/20">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Recruiting</h1>
            <p className="text-haas-silver text-sm mt-1">Coach CRM, athlete profile, and school depth charts in one place. Tied to your training data.</p>
          </div>
          <div className={`px-3 py-2 rounded-lg border ${periodColor[period.period]}`}>
            <div className="text-[10px] uppercase tracking-widest font-bold">NCAA Period</div>
            <div className="text-sm font-bold capitalize">{period.period}</div>
            <div className="text-[10px] opacity-80">{period.label}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Profile Complete" value={`${completeness.score}%`} color="text-haas-red" sub={completeness.missing.length ? `${completeness.missing.length} items left` : "Complete"} />
        <StatCard label="Coaches Available" value={coaches.length} color="text-alpine-blue" sub="seeded directory" />
        <StatCard label="Schools w/ Need" value={matchingSchools.length} color="text-alpine-cyan" sub={`@ ${demoAthlete.position}`} />
        <StatCard label="Class Year" value={demoAthlete.classYear} color="text-green-400" sub={`${demoAthlete.position} · ${formatHeight(demoAthlete.height)}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Next 3 Actions</h2>
            <Link href="/recruiting/profile" className="text-haas-red text-sm hover:underline">View Profile</Link>
          </div>
          <ol className="space-y-3 list-decimal list-inside">
            {!demoAthlete.ncaaIdRegistered && (
              <li className="text-sm text-haas-silver">
                <Link href="/recruiting/eligibility" className="text-white hover:text-haas-red">Register with the NCAA Eligibility Center</Link>
                <span className="block text-xs ml-5 mt-1">Coaches won't formally pursue you without an NCAA ID.</span>
              </li>
            )}
            {completeness.missing.includes("Highlight reel") && (
              <li className="text-sm text-haas-silver">
                <Link href="/recruiting/profile" className="text-white hover:text-haas-red">Add a highlight reel link to your profile</Link>
                <span className="block text-xs ml-5 mt-1">Hudl, MaxPreps, or YouTube. The reel is the single most important asset.</span>
              </li>
            )}
            <li className="text-sm text-haas-silver">
              <Link href="/recruiting/coaches" className="text-white hover:text-haas-red">Email 3 coaches at schools with {demoAthlete.position} needs</Link>
              <span className="block text-xs ml-5 mt-1">{matchingSchools.slice(0, 3).map((s) => s.shortName ?? s.name).join(", ")}</span>
            </li>
            <li className="text-sm text-haas-silver">
              <Link href="/recruiting/schools" className="text-white hover:text-haas-red">Build a school target list (reach / match / safety)</Link>
              <span className="block text-xs ml-5 mt-1">Filter by division, region, academic fit, and position need.</span>
            </li>
          </ol>
        </div>

        {benchmark && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Position Benchmark</h2>
            <div className="text-xs text-haas-silver mb-3">D1 {demoAthlete.position} target ({benchmark.ageGroup})</div>
            <div className="space-y-2 text-sm">
              <BenchRow label="Height" you={formatHeight(demoAthlete.height)} target={benchmark.metrics.height ? formatHeight(benchmark.metrics.height.target) : undefined} hit={!!(benchmark.metrics.height && demoAthlete.height >= benchmark.metrics.height.min)} />
              <BenchRow label="Approach" you={demoAthlete.approachJump ? `${demoAthlete.approachJump}"` : "—"} target={benchmark.metrics.approachJump ? `${benchmark.metrics.approachJump.target}"` : undefined} hit={!!(benchmark.metrics.approachJump && demoAthlete.approachJump && demoAthlete.approachJump >= benchmark.metrics.approachJump.min)} />
              <BenchRow label="Block" you={demoAthlete.blockJump ? `${demoAthlete.blockJump}"` : "—"} target={benchmark.metrics.blockJump ? `${benchmark.metrics.blockJump.target}"` : undefined} hit={!!(benchmark.metrics.blockJump && demoAthlete.blockJump && demoAthlete.blockJump >= benchmark.metrics.blockJump.min)} />
              <BenchRow label="Reach" you={demoAthlete.standingReach ? `${demoAthlete.standingReach}"` : "—"} target={benchmark.metrics.standingReach ? `${benchmark.metrics.standingReach.target}"` : undefined} hit={!!(benchmark.metrics.standingReach && demoAthlete.standingReach && demoAthlete.standingReach >= benchmark.metrics.standingReach.min)} />
              <BenchRow label="Lane Agility" you={demoAthlete.laneAgility ? `${demoAthlete.laneAgility}s` : "—"} target={benchmark.metrics.laneAgility ? `${benchmark.metrics.laneAgility.target}s` : undefined} hit={!!(benchmark.metrics.laneAgility && demoAthlete.laneAgility && demoAthlete.laneAgility <= benchmark.metrics.laneAgility.min)} />
            </div>
            <div className="text-xs text-haas-silver mt-3 italic">{benchmark.notes}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link href="/recruiting/coaches" className="card hover:border-haas-red/50 transition-colors block">
          <h3 className="text-base font-semibold mb-1">Coach CRM →</h3>
          <p className="text-xs text-haas-silver">Track who you've contacted, follow-up dates, and who's responded. Don't burn coaches by forgetting.</p>
        </Link>
        <Link href="/recruiting/schools" className="card hover:border-haas-red/50 transition-colors block">
          <h3 className="text-base font-semibold mb-1">Schools & Depth Charts →</h3>
          <p className="text-xs text-haas-silver">See who needs your position, by class year and division. Filter by region and academic fit.</p>
        </Link>
        <Link href="/recruiting/profile" className="card hover:border-haas-red/50 transition-colors block">
          <h3 className="text-base font-semibold mb-1">Athlete Profile →</h3>
          <p className="text-xs text-haas-silver">Verifiable metrics, highlight reel, academic snapshot — the page you share with coaches.</p>
        </Link>
        <Link href="/recruiting/eligibility" className="card hover:border-haas-red/50 transition-colors block">
          <h3 className="text-base font-semibold mb-1">NCAA Eligibility →</h3>
          <p className="text-xs text-haas-silver">Eligibility Center registration, core-course tracker, amateurism status, deadlines.</p>
        </Link>
      </div>

      <div className="card border-alpine-pink/30 bg-gradient-to-r from-haas-black to-alpine-dark/40">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-alpine-pink text-xs uppercase tracking-widest font-bold">Tied to Training</div>
            <div className="text-base font-semibold mt-1">Your training metrics auto-populate your recruiting profile.</div>
            <div className="text-xs text-haas-silver mt-1">Vertical, approach, broad jump, and agility numbers logged in training feed straight into the profile coaches see.</div>
          </div>
          <Link href="/recruiting/profile" className="btn-primary text-sm">Open Profile</Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, sub }: { label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div className="card">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
      {sub && <div className="text-[10px] text-haas-silver mt-1">{sub}</div>}
    </div>
  );
}

function BenchRow({ label, you, target, hit }: { label: string; you: string; target?: string; hit: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-haas-silver">{label}</span>
      <span className="flex items-center gap-2">
        <span className={hit ? "text-green-400 font-medium" : "text-yellow-400 font-medium"}>{you}</span>
        {target && <span className="text-xs text-gray-500">/ {target}</span>}
      </span>
    </div>
  );
}
