import Link from "next/link";
import { demoAthlete, formatHeight, getBenchmark, profileCompleteness } from "@/lib/recruiting";

export const dynamic = "force-dynamic";

export default function AthleteProfilePage() {
  const a = demoAthlete;
  const c = profileCompleteness(a);
  const benchmark = getBenchmark(a.position, "D1", "15U");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/recruiting" className="text-haas-silver text-xs hover:text-white">← Recruiting</Link>
          <h1 className="text-2xl font-bold text-white mt-1">{a.firstName} {a.lastName}</h1>
          <div className="text-haas-silver text-sm">{a.classYear} · {a.position}{a.secondaryPosition ? ` / ${a.secondaryPosition}` : ""} · {a.club}</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-haas-red">{c.score}%</div>
          <div className="text-xs text-haas-silver">Profile complete</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Verifiable Metrics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Metric label="Height" value={formatHeight(a.height)} target={benchmark?.metrics.height ? formatHeight(benchmark.metrics.height.target) : undefined} hit={!!(benchmark?.metrics.height && a.height >= benchmark.metrics.height.min)} />
            <Metric label="Approach Jump" value={a.approachJump ? `${a.approachJump}"` : "—"} target={benchmark?.metrics.approachJump ? `${benchmark.metrics.approachJump.target}"` : undefined} hit={!!(benchmark?.metrics.approachJump && a.approachJump && a.approachJump >= benchmark.metrics.approachJump.min)} />
            <Metric label="Block Jump" value={a.blockJump ? `${a.blockJump}"` : "—"} target={benchmark?.metrics.blockJump ? `${benchmark.metrics.blockJump.target}"` : undefined} hit={!!(benchmark?.metrics.blockJump && a.blockJump && a.blockJump >= benchmark.metrics.blockJump.min)} />
            <Metric label="Standing Reach" value={a.standingReach ? `${a.standingReach}"` : "—"} target={benchmark?.metrics.standingReach ? `${benchmark.metrics.standingReach.target}"` : undefined} hit={!!(benchmark?.metrics.standingReach && a.standingReach && a.standingReach >= benchmark.metrics.standingReach.min)} />
            <Metric label="Broad Jump" value={a.broadJump ? `${a.broadJump}"` : "—"} target={benchmark?.metrics.broadJump ? `${benchmark.metrics.broadJump.target}"` : undefined} hit={!!(benchmark?.metrics.broadJump && a.broadJump && a.broadJump >= benchmark.metrics.broadJump.min)} />
            <Metric label="Lane Agility" value={a.laneAgility ? `${a.laneAgility}s` : "—"} target={benchmark?.metrics.laneAgility ? `${benchmark.metrics.laneAgility.target}s` : undefined} hit={!!(benchmark?.metrics.laneAgility && a.laneAgility && a.laneAgility <= benchmark.metrics.laneAgility.min)} />
          </div>
          <div className="text-xs text-haas-silver mt-4 border-t border-haas-light/20 pt-3">
            <span className="text-yellow-400 font-bold">Coaches discount unverified numbers.</span> Each metric should be tied to a video upload or coach attestation. Self-reported jumps without proof are treated as hype.
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Academic Snapshot</h2>
          <div className="space-y-2 text-sm">
            <Row label="GPA" value={a.gpa?.toFixed(2) ?? "—"} />
            <Row label="SAT (M)" value={a.satMath ?? "—"} />
            <Row label="SAT (R)" value={a.satReading ?? "—"} />
            <Row label="SAT total" value={a.satMath && a.satReading ? a.satMath + a.satReading : "—"} />
            <Row label="ACT" value={a.actComposite ?? "—"} />
          </div>
          <div className="mt-3 pt-3 border-t border-haas-light/20 space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className={a.ncaaIdRegistered ? "text-green-400" : "text-yellow-400"}>{a.ncaaIdRegistered ? "✓" : "○"}</span>
              <span className="text-haas-silver">NCAA Eligibility Center ID</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={a.coreCoursesOnTrack ? "text-green-400" : "text-yellow-400"}>{a.coreCoursesOnTrack ? "✓" : "○"}</span>
              <span className="text-haas-silver">Core courses on track</span>
            </div>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold mb-3">Highlight Reel</h2>
          {a.highlightReelUrl ? (
            <div className="space-y-2">
              <a href={a.highlightReelUrl} target="_blank" rel="noopener noreferrer" className="text-haas-red hover:underline text-sm">{a.highlightReelUrl}</a>
              <p className="text-xs text-haas-silver">Reel should be 2:30–4:00 max, position-tagged, with the best clip first. Coaches give you ~30 seconds before deciding to keep watching.</p>
            </div>
          ) : (
            <p className="text-sm text-yellow-400">No highlight reel linked. This is the most important asset in recruiting — add a Hudl, MaxPreps, or YouTube URL.</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-3">What's Missing</h2>
          {c.missing.length === 0 ? (
            <p className="text-green-400 text-sm">Profile complete. Focus on outreach.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {c.missing.map((m) => (
                <li key={m} className="flex items-center gap-2 text-haas-silver"><span className="text-yellow-400">○</span>{m}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, target, hit }: { label: string; value: string; target?: string; hit: boolean }) {
  return (
    <div className="bg-haas-gray/40 rounded-lg p-3 border border-haas-light/20">
      <div className="text-[10px] uppercase tracking-widest text-haas-silver">{label}</div>
      <div className={`text-lg font-bold ${hit ? "text-green-400" : "text-yellow-400"}`}>{value}</div>
      {target && <div className="text-[10px] text-gray-500 mt-0.5">D1 target: {target}</div>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-haas-silver">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
