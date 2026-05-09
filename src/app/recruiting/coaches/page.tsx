import Link from "next/link";
import { coaches, getRecruitingPeriod, getSchool } from "@/lib/recruiting";

export const dynamic = "force-dynamic";

// Demo CRM state. In production this comes from the user's saved status records.
const demoStatus: Record<string, { status: string; lastTouch?: string; nextFollowUp?: string; notes?: string }> = {
  "stanford-hc": { status: "emailed", lastTouch: "2026-04-22", nextFollowUp: "2026-05-06", notes: "Sent intro w/ NIT Elite reel" },
  "texas-hc": { status: "responded", lastTouch: "2026-05-01", nextFollowUp: "2026-05-15", notes: "Asked for full match film" },
  "nebraska-hc": { status: "interested", lastTouch: "2026-05-03", nextFollowUp: "2026-05-12" },
  "wisconsin-hc": { status: "not-contacted" },
  "asu-hc": { status: "emailed", lastTouch: "2026-04-30", nextFollowUp: "2026-05-14" },
};

const statusBadge: Record<string, string> = {
  "not-contacted": "bg-haas-gray/40 text-haas-silver",
  emailed: "bg-blue-500/20 text-blue-400",
  responded: "bg-green-500/20 text-green-400",
  interested: "bg-alpine-pink/20 text-alpine-pink",
  offered: "bg-yellow-500/20 text-yellow-400",
  passed: "bg-red-500/20 text-red-400",
};

export default function CoachCRMPage() {
  const period = getRecruitingPeriod();
  const today = new Date().toISOString().slice(0, 10);

  const overdue = coaches.filter((c) => {
    const s = demoStatus[c.id];
    return s?.nextFollowUp && s.nextFollowUp <= today;
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/recruiting" className="text-haas-silver text-xs hover:text-white">← Recruiting</Link>
        <h1 className="text-2xl font-bold text-white mt-1">Coach CRM</h1>
        <p className="text-haas-silver text-sm mt-1">Track outreach, responses, and follow-ups. {coaches.length} coaches in your directory.</p>
      </div>

      {period.period === "dead" && (
        <div className="card border-red-500/30 bg-red-500/5">
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-xl">⚠</span>
            <div>
              <div className="font-bold text-red-400">NCAA Dead Period — {period.label}</div>
              <div className="text-xs text-haas-silver mt-1">Coaches typically can't respond to recruit communication during dead periods. Hold non-urgent outreach. Verify rules for your division on ncaa.org.</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="Coaches" value={coaches.length} color="text-haas-red" />
        <Stat label="Contacted" value={Object.values(demoStatus).filter((s) => s.status !== "not-contacted").length} color="text-blue-400" />
        <Stat label="Responded" value={Object.values(demoStatus).filter((s) => ["responded", "interested", "offered"].includes(s.status)).length} color="text-green-400" />
        <Stat label="Follow-ups Due" value={overdue} color="text-yellow-400" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-haas-light/20">
              <th className="table-header">Coach</th>
              <th className="table-header">School</th>
              <th className="table-header">Status</th>
              <th className="table-header">Last Touch</th>
              <th className="table-header">Follow-up</th>
              <th className="table-header">Notes</th>
              <th className="table-header"></th>
            </tr>
          </thead>
          <tbody>
            {coaches.map((c) => {
              const school = getSchool(c.schoolId);
              const status = demoStatus[c.id] ?? { status: "not-contacted" };
              const overdueRow = status.nextFollowUp && status.nextFollowUp <= today;
              return (
                <tr key={c.id} className="border-b border-haas-light/10 hover:bg-white/5">
                  <td className="table-cell">
                    <div className="font-medium">{c.firstName} {c.lastName}</div>
                    <div className="text-xs text-haas-silver">{c.title}</div>
                  </td>
                  <td className="table-cell">
                    <div>{school?.shortName ?? school?.name}</div>
                    <div className="text-xs text-haas-silver">{school?.conference} · {school?.division}</div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${statusBadge[status.status] ?? statusBadge["not-contacted"]}`}>{status.status}</span>
                  </td>
                  <td className="table-cell text-xs">{status.lastTouch ?? "—"}</td>
                  <td className={`table-cell text-xs ${overdueRow ? "text-yellow-400 font-bold" : ""}`}>{status.nextFollowUp ?? "—"}</td>
                  <td className="table-cell text-xs text-haas-silver max-w-[200px] truncate">{status.notes ?? c.notes ?? "—"}</td>
                  <td className="table-cell">
                    <Link href={`/recruiting/coaches/compose?coachId=${c.id}`} className="text-haas-red text-xs hover:underline">Email →</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card border-haas-light/20">
        <div className="text-xs uppercase tracking-widest text-haas-silver font-bold mb-2">Data sourcing</div>
        <p className="text-xs text-haas-silver">
          Directory is seeded from publicly listed athletic-department contact addresses. Coach names should be re-verified on each school's staff page before personalizing — head coaching changes happen mid-season. Athletes can add coaches manually (planned). Building a license relationship with NCSA, FieldLevel, or SportSource is the long-term play for live data.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}
