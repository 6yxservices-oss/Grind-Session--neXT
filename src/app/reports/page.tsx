import Link from "next/link";
import { getAllReports } from "@/lib/queries";
import GradeBadge from "@/components/grade-badge";

export const dynamic = "force-dynamic";

export default function ReportsPage() {
  const reports = getAllReports();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scouting Reports</h1>
          <p className="text-gray-400 text-sm mt-1">{reports.length} reports filed</p>
        </div>
        <Link href="/reports/new" className="btn-primary">+ New Report</Link>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <Link key={report.id} href={`/reports/${report.id}`} className="card block hover:border-eybl-accent/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <GradeBadge grade={report.overall_grade} size="lg" />
                <div>
                  <h3 className="font-semibold">{report.player_name}</h3>
                  <p className="text-sm text-gray-400">by {report.scout_name} &middot; {report.created_at}</p>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                {report.offensive_grade && <div className="text-center"><div className="text-gray-500 text-xs">OFF</div><div>{report.offensive_grade}</div></div>}
                {report.defensive_grade && <div className="text-center"><div className="text-gray-500 text-xs">DEF</div><div>{report.defensive_grade}</div></div>}
                {report.athleticism_grade && <div className="text-center"><div className="text-gray-500 text-xs">ATH</div><div>{report.athleticism_grade}</div></div>}
                {report.basketball_iq_grade && <div className="text-center"><div className="text-gray-500 text-xs">IQ</div><div>{report.basketball_iq_grade}</div></div>}
              </div>
            </div>
            {report.notes && <p className="text-sm text-gray-300 mt-3 line-clamp-2">{report.notes}</p>}
          </Link>
        ))}
      </div>
      {reports.length === 0 && (
        <div className="text-center py-12 text-gray-500">No scouting reports yet. Create your first report.</div>
      )}
    </div>
  );
}
