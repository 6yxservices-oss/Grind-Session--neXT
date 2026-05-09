import coachesData from "./coaches.json";
import schoolsData from "./schools.json";
import benchmarksData from "./benchmarks.json";
import templatesData from "./templates.json";
import type {
  AthleteProfile,
  Coach,
  EmailTemplate,
  Position,
  PositionBenchmark,
  RecruitingPeriod,
  School,
} from "./types";

export const coaches = coachesData as Coach[];
export const schools = schoolsData as School[];
export const benchmarks = benchmarksData as PositionBenchmark[];
export const templates = templatesData as EmailTemplate[];

export function getSchool(id: string): School | undefined {
  return schools.find((s) => s.id === id);
}

export function getCoach(id: string): Coach | undefined {
  return coaches.find((c) => c.id === id);
}

export function getCoachesForSchool(schoolId: string): Coach[] {
  return coaches.filter((c) => c.schoolId === schoolId);
}

export function getBenchmark(position: Position, level: PositionBenchmark["level"], ageGroup: PositionBenchmark["ageGroup"]): PositionBenchmark | undefined {
  return benchmarks.find((b) => b.position === position && b.level === level && b.ageGroup === ageGroup);
}

export function schoolsByPositionNeed(position: Position): School[] {
  return schools
    .filter((s) => (s.depthChart[position]?.needs ?? 0) > 0)
    .sort((a, b) => (b.depthChart[position]?.needs ?? 0) - (a.depthChart[position]?.needs ?? 0));
}

// Demo athlete profile shown on the recruiting hub. In production this comes from the user's record.
export const demoAthlete: AthleteProfile = {
  firstName: "Jordan",
  lastName: "Kim",
  classYear: 2029,
  position: "OH",
  secondaryPosition: "OPP",
  club: "Synergyforce 15 National",
  highSchool: "Pinnacle High School",
  city: "Phoenix",
  state: "AZ",
  height: 71,
  approachJump: 102,
  blockJump: 94,
  standingReach: 89,
  broadJump: 92,
  laneAgility: 11.6,
  gpa: 3.78,
  satMath: 660,
  satReading: 640,
  highlightReelUrl: "https://www.hudl.com/profile/example",
  hudlUrl: "https://www.hudl.com/profile/example",
  ncaaIdRegistered: false,
  coreCoursesOnTrack: true,
};

// NCAA D1 women's volleyball recruiting calendar (representative; date ranges shift each year — verify on ncaa.org).
// Used to warn before sending coach communication.
type CalendarBlock = { period: RecruitingPeriod; start: string; end: string; label: string };

const calendar2026: CalendarBlock[] = [
  { period: "quiet", start: "2026-01-01", end: "2026-01-08", label: "New Year quiet period" },
  { period: "contact", start: "2026-01-09", end: "2026-04-14", label: "Spring contact period" },
  { period: "evaluation", start: "2026-04-15", end: "2026-05-31", label: "Spring evaluation" },
  { period: "quiet", start: "2026-06-01", end: "2026-06-15", label: "Pre-summer quiet" },
  { period: "evaluation", start: "2026-06-16", end: "2026-08-15", label: "Summer evaluation (open period)" },
  { period: "contact", start: "2026-08-16", end: "2026-12-22", label: "Fall/winter contact period" },
  { period: "dead", start: "2026-12-23", end: "2026-12-31", label: "December dead period" },
];

export function getRecruitingPeriod(date = new Date()): CalendarBlock {
  const iso = date.toISOString().slice(0, 10);
  for (const block of calendar2026) {
    if (iso >= block.start && iso <= block.end) return block;
  }
  return { period: "contact", start: iso, end: iso, label: "Outside published calendar — verify on ncaa.org" };
}

export function emailAllowedForPeriod(period: RecruitingPeriod): boolean {
  // Athletes can always email coaches; coaches just can't reply during dead/quiet in many cases.
  // We surface the period as a warning, not a hard block.
  return period !== "dead";
}

export function fillTemplate(template: EmailTemplate, athlete: AthleteProfile, school: School, coach: Coach, extras: Record<string, string> = {}): { subject: string; body: string } {
  const tokens: Record<string, string> = {
    firstName: athlete.firstName,
    lastName: athlete.lastName,
    classYear: String(athlete.classYear),
    position: athlete.position,
    club: athlete.club,
    highSchool: athlete.highSchool,
    city: athlete.city,
    state: athlete.state,
    height: formatHeight(athlete.height),
    approachJump: athlete.approachJump ? `${athlete.approachJump}"` : "—",
    gpa: athlete.gpa ? athlete.gpa.toFixed(2) : "—",
    ncaaIdRegistered: athlete.ncaaIdRegistered ? "registered" : "registration in progress",
    highlightReelUrl: athlete.highlightReelUrl ?? "",
    coachLastName: coach.lastName,
    schoolName: school.shortName ?? school.name,
    phone: extras.phone ?? "",
    email: extras.email ?? "",
    recentResult: extras.recentResult ?? "[recent team or personal result]",
    tournamentName: extras.tournamentName ?? "[tournament]",
    tournamentCity: extras.tournamentCity ?? "[city]",
    tournamentDates: extras.tournamentDates ?? "[dates]",
    court: extras.court ?? "[court #]",
    firstMatchTime: extras.firstMatchTime ?? "[time]",
    jerseyNumber: extras.jerseyNumber ?? "[#]",
    lastTouchDate: extras.lastTouchDate ?? "[date]",
    recentMetricUpdate: extras.recentMetricUpdate ?? "[recent metric or PR]",
    recentStatLine: extras.recentStatLine ?? "[stat line]",
    matchFilmUrl: extras.matchFilmUrl ?? "[match film url]",
  };
  const apply = (str: string) => str.replace(/\{\{(\w+)\}\}/g, (_, k) => tokens[k] ?? `{{${k}}}`);
  return { subject: apply(template.subject), body: apply(template.body) };
}

export function formatHeight(inches: number): string {
  const ft = Math.floor(inches / 12);
  const inch = inches % 12;
  return `${ft}'${inch}"`;
}

export function profileCompleteness(athlete: AthleteProfile): { score: number; missing: string[] } {
  const required: Array<[keyof AthleteProfile, string]> = [
    ["firstName", "First name"],
    ["lastName", "Last name"],
    ["classYear", "Class year"],
    ["position", "Primary position"],
    ["height", "Height"],
    ["approachJump", "Approach jump"],
    ["blockJump", "Block jump"],
    ["standingReach", "Standing reach"],
    ["gpa", "GPA"],
    ["highlightReelUrl", "Highlight reel"],
  ];
  const missing: string[] = [];
  let filled = 0;
  for (const [key, label] of required) {
    const v = athlete[key];
    if (v === undefined || v === null || v === "" || v === 0) missing.push(label);
    else filled++;
  }
  if (!athlete.ncaaIdRegistered) missing.push("NCAA Eligibility Center registration");
  if (!athlete.coreCoursesOnTrack) missing.push("Core-course tracking");
  const totalChecks = required.length + 2;
  const completed = filled + (athlete.ncaaIdRegistered ? 1 : 0) + (athlete.coreCoursesOnTrack ? 1 : 0);
  return { score: Math.round((completed / totalChecks) * 100), missing };
}
