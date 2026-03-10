"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
interface DriverOption { id: number; name: string; }
export default function NewReportPage() { return (<Suspense fallback={<div className="text-gray-500">Loading...</div>}><NewReportForm /></Suspense>); }
function NewReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDriver = searchParams.get("player");
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { fetch("/api/players").then((r) => r.json()).then(setDrivers).catch(() => setError("Failed to load drivers")); }, []);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSubmitting(true); setError("");
    const form = new FormData(e.currentTarget);
    const body = { driver_id: parseInt(form.get("player_id") as string), scout_name: form.get("scout_name"), overall_grade: form.get("overall_grade"), speed_grade: form.get("speed_grade") || undefined, racecraft_grade: form.get("racecraft_grade") || undefined, consistency_grade: form.get("consistency_grade") || undefined, race_iq_grade: form.get("race_iq_grade") || undefined, strengths: form.get("strengths") || undefined, weaknesses: form.get("weaknesses") || undefined, notes: form.get("notes") || undefined, projection: form.get("projection") || undefined, comparison: form.get("comparison") || undefined };
    try { const res = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); if (!res.ok) throw new Error(); const { id } = await res.json(); router.push(`/reports/${id}`); } catch { setError("Failed to submit report."); setSubmitting(false); }
  }
  return (
    <div className="max-w-2xl space-y-6">
      <div><h1 className="text-2xl font-bold">New Scout Report</h1><p className="text-gray-400 text-sm mt-1">Evaluate a driver &middot; +50 RISE+ pts</p></div>
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4"><h2 className="font-semibold">Basic Info</h2><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-400 mb-1">Driver *</label><select name="player_id" required defaultValue={preselectedDriver || ""} className="select w-full"><option value="">Select driver...</option>{drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div><div><label className="block text-sm text-gray-400 mb-1">Scout Name *</label><input name="scout_name" required className="input w-full" placeholder="Your name" /></div></div></div>
        <div className="card space-y-4"><h2 className="font-semibold">Grades</h2><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[{n:"overall_grade",l:"Overall *",r:true},{n:"speed_grade",l:"Raw Speed"},{n:"racecraft_grade",l:"Racecraft"},{n:"consistency_grade",l:"Consistency"},{n:"race_iq_grade",l:"Race IQ"}].map((f) => <div key={f.n}><label className="block text-sm text-gray-400 mb-1">{f.l}</label><select name={f.n} required={f.r} className="select w-full"><option value="">—</option>{GRADES.map((g) => <option key={g} value={g}>{g}</option>)}</select></div>)}</div></div>
        <div className="card space-y-4"><h2 className="font-semibold">Evaluation</h2><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-400 mb-1">Strengths</label><textarea name="strengths" rows={3} className="input w-full" /></div><div><label className="block text-sm text-gray-400 mb-1">Weaknesses</label><textarea name="weaknesses" rows={3} className="input w-full" /></div></div><div><label className="block text-sm text-gray-400 mb-1">Notes</label><textarea name="notes" rows={4} className="input w-full" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-400 mb-1">F1 Projection</label><input name="projection" className="input w-full" /></div><div><label className="block text-sm text-gray-400 mb-1">Driver Comparison</label><input name="comparison" className="input w-full" /></div></div></div>
        <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50">{submitting ? "Submitting..." : "Submit Scout Report (+50 RISE+ pts)"}</button>
      </form>
    </div>
  );
}
