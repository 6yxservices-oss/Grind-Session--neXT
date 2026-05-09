import Link from "next/link";
import { coaches, demoAthlete, schools } from "@/lib/recruiting";
import type { Position } from "@/lib/recruiting/types";

export const dynamic = "force-dynamic";

const positions: Position[] = ["OH", "OPP", "MB", "S", "L", "DS"];

export default function SchoolsPage({ searchParams }: { searchParams: { position?: string; division?: string; region?: string } }) {
  const filterPos = (searchParams.position as Position) ?? demoAthlete.position;
  const filterDiv = searchParams.division ?? "all";
  const filterRegion = searchParams.region ?? "all";

  const filtered = schools.filter((s) => {
    if (filterDiv !== "all" && s.division !== filterDiv) return false;
    if (filterRegion !== "all" && s.region !== filterRegion) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.depthChart[filterPos]?.needs ?? 0) - (a.depthChart[filterPos]?.needs ?? 0));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/recruiting" className="text-haas-silver text-xs hover:text-white">← Recruiting</Link>
        <h1 className="text-2xl font-bold text-white mt-1">Schools & Depth Charts</h1>
        <p className="text-haas-silver text-sm mt-1">Filter by position need, division, region, and academic fit. {schools.length} schools loaded.</p>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Filter label="Position" name="position" value={filterPos} options={positions.map((p) => ({ value: p, label: p }))} extraQuery={{ division: filterDiv, region: filterRegion }} />
          <Filter label="Division" name="division" value={filterDiv} options={[
            { value: "all", label: "All" }, { value: "D1", label: "D1" }, { value: "D2", label: "D2" }, { value: "D3", label: "D3" }, { value: "NAIA", label: "NAIA" }, { value: "JUCO", label: "JUCO" },
          ]} extraQuery={{ position: filterPos, region: filterRegion }} />
          <Filter label="Region" name="region" value={filterRegion} options={[
            { value: "all", label: "All" }, { value: "Northeast", label: "Northeast" }, { value: "Southeast", label: "Southeast" }, { value: "Midwest", label: "Midwest" }, { value: "South", label: "South" }, { value: "West", label: "West" },
          ]} extraQuery={{ position: filterPos, division: filterDiv }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sorted.map((s) => {
          const slot = s.depthChart[filterPos];
          const schoolCoaches = coaches.filter((c) => c.schoolId === s.id);
          return (
            <div key={s.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold">{s.name}</h3>
                  <div className="text-xs text-haas-silver">{s.conference} · {s.division} · {s.region} · {s.state}</div>
                </div>
                {slot && (
                  <div className={`px-2 py-1 rounded text-xs font-bold ${slot.needs > 0 ? "bg-haas-red/20 text-haas-red" : "bg-haas-gray/40 text-haas-silver"}`}>
                    {slot.needs > 0 ? `${slot.needs} ${filterPos} need${slot.needs > 1 ? "s" : ""}` : "No need"}
                  </div>
                )}
              </div>

              {slot && (
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <Mini label="Returning" value={slot.returning} />
                  <Mini label="Seniors out" value={slot.seniors} />
                  <Mini label="Open slots" value={slot.needs} highlight={slot.needs > 0} />
                </div>
              )}

              <div className="text-xs text-haas-silver space-y-1 border-t border-haas-light/10 pt-3">
                <div>GPA admit: {s.academic.avgGpa ?? "—"} · {s.academic.publicPrivate}</div>
                {s.academic.satRange && <div>SAT: {s.academic.satRange[0]}–{s.academic.satRange[1]}</div>}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-haas-light/10">
                <div className="text-xs text-haas-silver">{schoolCoaches.length} coach{schoolCoaches.length === 1 ? "" : "es"} on file</div>
                <div className="flex gap-2">
                  {s.rosterUrl && <a href={s.rosterUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-haas-red hover:underline">Roster ↗</a>}
                  {schoolCoaches[0] && <Link href={`/recruiting/coaches/compose?coachId=${schoolCoaches[0].id}`} className="text-xs text-haas-red hover:underline">Email →</Link>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card border-haas-light/20">
        <div className="text-xs uppercase tracking-widest text-haas-silver font-bold mb-2">Depth-chart caveat</div>
        <p className="text-xs text-haas-silver">
          Depth charts are projected from publicly listed rosters and class years. They shift as players transfer or commitments come in. Verify on each school's roster page (linked above) before treating "needs" as authoritative. The long-term plan is a licensed feed (SportSource, Synergy) for live data.
        </p>
      </div>
    </div>
  );
}

function Filter({ label, name, value, options, extraQuery }: { label: string; name: string; value: string; options: { value: string; label: string }[]; extraQuery: Record<string, string> }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-haas-silver font-bold mb-1">{label}</label>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => {
          const params = new URLSearchParams({ ...extraQuery, [name]: o.value });
          return (
            <Link
              key={o.value}
              href={`/recruiting/schools?${params.toString()}`}
              className={`px-2 py-1 rounded text-xs ${o.value === value ? "bg-haas-red text-white" : "bg-haas-gray/40 text-haas-silver hover:text-white"}`}
            >
              {o.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Mini({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-2 ${highlight ? "bg-haas-red/10 border border-haas-red/30" : "bg-haas-gray/40 border border-haas-light/20"}`}>
      <div className={`text-lg font-bold ${highlight ? "text-haas-red" : "text-white"}`}>{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-haas-silver">{label}</div>
    </div>
  );
}
