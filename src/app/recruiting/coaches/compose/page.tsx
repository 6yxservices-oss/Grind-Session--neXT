import Link from "next/link";
import { coaches, demoAthlete, fillTemplate, getCoach, getRecruitingPeriod, getSchool, templates } from "@/lib/recruiting";

export const dynamic = "force-dynamic";

export default function ComposePage({ searchParams }: { searchParams: { coachId?: string; templateId?: string } }) {
  const coachId = searchParams.coachId ?? coaches[0].id;
  const templateId = searchParams.templateId ?? templates[0].id;
  const coach = getCoach(coachId) ?? coaches[0];
  const school = getSchool(coach.schoolId);
  const template = templates.find((t) => t.id === templateId) ?? templates[0];
  const period = getRecruitingPeriod();

  const filled = school
    ? fillTemplate(template, demoAthlete, school, coach, {
        phone: "(555) 555-0123",
        email: "jordan.kim@example.com",
        recentResult: "top-8 finish at NIT Elite",
      })
    : { subject: "", body: "" };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/recruiting/coaches" className="text-haas-silver text-xs hover:text-white">← Coach CRM</Link>
        <h1 className="text-2xl font-bold text-white mt-1">Compose</h1>
        <p className="text-haas-silver text-sm mt-1">Templated outreach, auto-filled from your profile. Edit before sending.</p>
      </div>

      {(period.period === "dead" || period.period === "quiet") && (
        <div className={`card ${period.period === "dead" ? "border-red-500/30 bg-red-500/5" : "border-yellow-500/30 bg-yellow-500/5"}`}>
          <div className="flex items-start gap-3">
            <span className={period.period === "dead" ? "text-red-400 text-xl" : "text-yellow-400 text-xl"}>⚠</span>
            <div>
              <div className={`font-bold ${period.period === "dead" ? "text-red-400" : "text-yellow-400"}`}>NCAA {period.period === "dead" ? "Dead" : "Quiet"} Period — {period.label}</div>
              <div className="text-xs text-haas-silver mt-1">
                {period.period === "dead"
                  ? "Coaches typically may not respond to recruit communication during a dead period. You can send, but expect no reply until the period ends."
                  : "Quiet periods limit some forms of contact (off-campus visits). Email is generally still permitted. Verify on ncaa.org for your division."}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Recipient</h2>
          <div className="space-y-1.5 text-sm">
            <div className="font-medium">{coach.firstName} {coach.lastName}</div>
            <div className="text-xs text-haas-silver">{coach.title}</div>
            <div className="text-xs text-haas-silver">{school?.name}</div>
            <div className="text-xs text-haas-silver">{coach.email}</div>
          </div>
          <div className="text-[10px] text-yellow-400 mt-3 italic">Verify the head coach name on {school?.athleticsUrl} before sending.</div>

          <h3 className="text-base font-semibold mt-6 mb-2">Templates</h3>
          <div className="space-y-1.5">
            {templates.map((t) => (
              <Link
                key={t.id}
                href={`/recruiting/coaches/compose?coachId=${coach.id}&templateId=${t.id}`}
                className={`block px-3 py-2 rounded-lg text-xs ${t.id === template.id ? "bg-haas-red/20 text-white border border-haas-red/40" : "bg-haas-gray/40 text-haas-silver hover:text-white"}`}
              >
                <div className="font-medium">{t.name}</div>
                <div className="text-[10px] opacity-80 mt-0.5">{t.description}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-haas-silver font-bold mb-1">To</label>
              <div className="bg-haas-gray/40 rounded-lg px-3 py-2 text-sm">{coach.email}</div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-haas-silver font-bold mb-1">Subject</label>
              <div className="bg-haas-gray/40 rounded-lg px-3 py-2 text-sm">{filled.subject}</div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-haas-silver font-bold mb-1">Body</label>
              <pre className="bg-haas-gray/40 rounded-lg px-3 py-3 text-sm whitespace-pre-wrap font-sans leading-relaxed">{filled.body}</pre>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
              <div className="text-xs text-haas-silver">{template.recommendedTiming}</div>
              <div className="flex gap-2">
                <button className="btn-secondary text-sm" disabled>Edit</button>
                <a
                  href={`mailto:${coach.email}?subject=${encodeURIComponent(filled.subject)}&body=${encodeURIComponent(filled.body)}`}
                  className="btn-primary text-sm"
                >
                  Open in Mail
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
