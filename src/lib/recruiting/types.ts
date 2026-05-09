export type Position =
  | "OH" // outside hitter
  | "OPP" // opposite / right-side
  | "MB" // middle blocker
  | "S" // setter
  | "L" // libero
  | "DS"; // defensive specialist

export type Division = "D1" | "D2" | "D3" | "NAIA" | "JUCO";

export type RecruitingPeriod = "contact" | "evaluation" | "quiet" | "dead";

export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  title: string; // Head Coach, Associate HC, Assistant, Recruiting Coordinator
  schoolId: string;
  email: string; // public athletic-department address only
  phone?: string;
  recruitsPositions: Position[];
  source: "seed" | "athlete-added";
  notes?: string;
}

export interface School {
  id: string;
  name: string;
  shortName?: string;
  state: string;
  division: Division;
  conference: string;
  region: "Northeast" | "Southeast" | "Midwest" | "South" | "West";
  rosterUrl?: string;
  athleticsUrl: string;
  // Depth chart by class year for each position. "needs" = open scholarship slots projected.
  depthChart: Partial<Record<Position, { returning: number; seniors: number; needs: number }>>;
  academic: {
    avgGpa?: number; // typical admit GPA
    satRange?: [number, number];
    actRange?: [number, number];
    publicPrivate: "Public" | "Private";
  };
}

export interface PositionBenchmark {
  position: Position;
  level: "D1" | "D2" | "D3" | "Top Club";
  ageGroup: "15U" | "16U" | "17U" | "18U";
  metrics: {
    height?: { min: number; target: number }; // inches
    approachJump?: { min: number; target: number }; // inches
    blockJump?: { min: number; target: number }; // inches
    standingReach?: { min: number; target: number }; // inches
    broadJump?: { min: number; target: number }; // inches
    laneAgility?: { min: number; target: number }; // seconds (lower better)
    hittingPctTarget?: number;
    passingRatingTarget?: number; // 0-3 scale
  };
  notes?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string; // supports {{tokens}}
  body: string; // supports {{tokens}}
  recommendedTiming: string;
}

export interface CoachContactStatus {
  coachId: string;
  status: "not-contacted" | "emailed" | "responded" | "interested" | "offered" | "passed";
  lastTouch?: string; // ISO date
  nextFollowUp?: string; // ISO date
  notes?: string;
}

export interface AthleteProfile {
  firstName: string;
  lastName: string;
  classYear: number; // graduation year
  position: Position;
  secondaryPosition?: Position;
  club: string;
  highSchool: string;
  city: string;
  state: string;
  height: number; // inches
  approachJump?: number;
  blockJump?: number;
  standingReach?: number;
  broadJump?: number;
  laneAgility?: number;
  gpa?: number;
  satMath?: number;
  satReading?: number;
  actComposite?: number;
  highlightReelUrl?: string;
  hudlUrl?: string;
  ncaaIdRegistered: boolean;
  coreCoursesOnTrack: boolean;
}
