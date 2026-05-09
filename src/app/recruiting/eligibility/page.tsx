import Link from "next/link";
import { demoAthlete } from "@/lib/recruiting";

export const dynamic = "force-dynamic";

const checklist = [
  {
    title: "Register with the NCAA Eligibility Center",
    detail: "Required for D1 and D2. Coaches typically won't formally pursue without an NCAA ID. Register at eligibilitycenter.org as early as sophomore year.",
    done: (a: typeof demoAthlete) => a.ncaaIdRegistered,
    link: "https://web3.ncaa.org/ecwr3/",
  },
  {
    title: "16 NCAA-approved core courses on track",
    detail: "10 must be completed before the start of senior year (D1). Use your high school counselor to verify each course is on the school's NCAA list.",
    done: (a: typeof demoAthlete) => a.coreCoursesOnTrack,
  },
  {
    title: "Core-course GPA above the sliding-scale minimum",
    detail: "D1 sliding scale typically requires a 2.3 core GPA. The higher your test scores, the lower the GPA can be (and vice versa). Calculate at eligibilitycenter.org.",
    done: (a: typeof demoAthlete) => (a.gpa ?? 0) >= 2.3,
  },
  {
    title: "Test scores recorded (SAT or ACT) — optional but recommended",
    detail: "Many schools are test-optional for admissions but still factor scores into the eligibility sliding scale. Submit scores directly to the Eligibility Center using code 9999.",
    done: (a: typeof demoAthlete) => !!(a.satMath || a.actComposite),
  },
  {
    title: "Amateurism Certification submitted (senior year)",
    detail: "Submit by April 1 of senior year. Required for first competition. NIL activities must be disclosed accurately.",
    done: () => false,
  },
  {
    title: "Transcripts uploaded after each grading period",
    detail: "Final transcript required after graduation. Don't wait until summer.",
    done: () => false,
  },
];

const milestones = [
  { year: "9th-10th grade", items: ["Take core courses", "Begin highlight reel", "Attend college camps", "Track GPA"] },
  { year: "11th grade (junior year)", items: ["Register with NCAA Eligibility Center", "Take SAT/ACT", "Email coaches", "Visit campuses (unofficial)"] },
  { year: "12th grade (senior year)", items: ["Submit Amateurism Certification by April 1", "Complete 10 core courses before senior year (D1)", "Sign National Letter of Intent (Nov / Apr signing periods)", "Submit final transcript"] },
];

export default function EligibilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/recruiting" className="text-haas-silver text-xs hover:text-white">← Recruiting</Link>
        <h1 className="text-2xl font-bold text-white mt-1">NCAA Eligibility</h1>
        <p className="text-haas-silver text-sm mt-1">Eligibility blocks more recruits than skill ever does. Stay ahead of the paperwork.</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Checklist</h2>
        <div className="space-y-3">
          {checklist.map((item) => {
            const done = item.done(demoAthlete);
            return (
              <div key={item.title} className={`flex items-start gap-3 p-3 rounded-lg border ${done ? "border-green-500/30 bg-green-500/5" : "border-haas-light/20 bg-haas-gray/30"}`}>
                <span className={`text-xl ${done ? "text-green-400" : "text-yellow-400"}`}>{done ? "✓" : "○"}</span>
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-haas-silver mt-1">{item.detail}</div>
                </div>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-haas-red hover:underline whitespace-nowrap">Open ↗</a>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {milestones.map((m) => (
          <div key={m.year} className="card">
            <h3 className="text-sm font-bold text-haas-red uppercase tracking-widest mb-3">{m.year}</h3>
            <ul className="space-y-1.5 text-xs text-haas-silver">
              {m.items.map((it) => <li key={it} className="flex gap-2"><span className="text-haas-red">•</span>{it}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="card border-haas-light/20">
        <div className="text-xs uppercase tracking-widest text-haas-silver font-bold mb-2">Disclaimer</div>
        <p className="text-xs text-haas-silver">
          This is a simplified summary for D1 women's volleyball. Rules vary by division (D2, D3 don't use the Eligibility Center), and the NCAA updates them regularly. Always cross-check the current rulebook on <a href="https://www.ncaa.org" target="_blank" rel="noopener noreferrer" className="text-haas-red hover:underline">ncaa.org</a> and confirm with a high school counselor or your club's recruiting coordinator.
        </p>
      </div>
    </div>
  );
}
