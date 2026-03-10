import Link from "next/link";
import { notFound } from "next/navigation";
import { getReportById } from "@/lib/queries";
import GradeBadge from "@/components/grade-badge";

export const dynamic = "force-dynamic";

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const report = getReportById(parseInt(params.id));
  if (!report) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/reports" className="text-sm text-gray-400 hover:text-gray-200 mb-2 inline-block">&larr; Back to Reports</Link>
        <div className="flex items-center gap-4">
          <GradeBadge grade={report.overall_grade} size="lg" />
          <div>
            <h1 className="text-2xl font-bold">
              <Link href={`/players/${report.player_id}`} className="hover:text-eybl-accent">
                {report.player_name}
              </Link>
            </h1>
            <p className="text-gray-400 text-sm">Scouted by {report.scout_name} &middot; {report.created_at}</p>
          </div>
        </div>
      </div>

      {/* Grade Breakdown */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Grade Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Offense", grade: report.offensive_grade },
            { label: "Defense", grade: report.defensive_grade },
            { label: "Athleticism", grade: report.athleticism_grade },
            { label: "Basketball IQ", grade: report.basketball_iq_grade },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-xs text-gray-500 mb-2">{item.label}</div>
              {item.grade ? <GradeBadge grade={item.grade} size="lg" /> : <span className="text-gray-600">N/A</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report.strengths && (
          <div className="card">
            <h3 className="text-sm font-semibold text-green-400 mb-2">Strengths</h3>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{report.strengths}</p>
          </div>
        )}
        {report.weaknesses && (
          <div className="card">
            <h3 className="text-sm font-semibold text-red-400 mb-2">Weaknesses</h3>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{report.weaknesses}</p>
          </div>
        )}
      </div>

      {/* Notes */}
      {report.notes && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-2">Scout Notes</h3>
          <p className="text-sm text-gray-300 whitespace-pre-wrap">{report.notes}</p>
        </div>
      )}

      {/* Projection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report.projection && (
          <div className="card">
            <h3 className="text-sm font-semibold text-eybl-gold mb-2">Projection</h3>
            <p className="text-sm text-gray-300">{report.projection}</p>
          </div>
        )}
        {report.comparison && (
          <div className="card">
            <h3 className="text-sm font-semibold text-blue-400 mb-2">Player Comparison</h3>
            <p className="text-sm text-gray-300">{report.comparison}</p>
          </div>
        )}
      </div>
    </div>
  );
}
