export interface Team {
  id: number;
  name: string;
  program: string;
  city: string;
  state: string;
  circuit: string;
  logo_url: string | null;
  created_at: string;
}

export interface Player {
  id: number;
  first_name: string;
  last_name: string;
  team_id: number | null;
  position: string;
  height: string | null;
  weight: number | null;
  class_year: number;
  high_school: string | null;
  hometown: string | null;
  state: string | null;
  star_rating: number;
  ranking: number | null;
  status: string;
  photo_url: string | null;
  created_at: string;
  // Joined fields
  team_name?: string;
}

export interface Game {
  id: number;
  home_team_id: number;
  away_team_id: number;
  session_name: string;
  venue: string | null;
  city: string | null;
  state: string | null;
  game_date: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
  created_at: string;
  // Joined fields
  home_team_name?: string;
  away_team_name?: string;
}

export interface PlayerStats {
  id: number;
  player_id: number;
  game_id: number;
  minutes: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fg_made: number;
  fg_attempted: number;
  three_made: number;
  three_attempted: number;
  ft_made: number;
  ft_attempted: number;
  fouls: number;
  created_at: string;
  // Joined fields
  player_name?: string;
  game_info?: string;
}

export interface ScoutingReport {
  id: number;
  player_id: number;
  game_id: number | null;
  scout_name: string;
  overall_grade: string;
  offensive_grade: string | null;
  defensive_grade: string | null;
  athleticism_grade: string | null;
  basketball_iq_grade: string | null;
  strengths: string | null;
  weaknesses: string | null;
  notes: string | null;
  projection: string | null;
  comparison: string | null;
  created_at: string;
  // Joined fields
  player_name?: string;
  game_info?: string;
}

export interface PhysicalMetrics {
  id: number;
  player_id: number;
  wingspan: string | null;
  standing_reach: string | null;
  hand_length: number | null;
  hand_width: number | null;
  body_fat_pct: number | null;
  vertical_jump: number | null;
  max_vertical: number | null;
  lane_agility: number | null;
  sprint_3qt: number | null;
  speed_mph: number | null;
  shuttle_run: number | null;
  bench_press_reps: number | null;
  measured_height_shoes: string | null;
  measured_height_no_shoes: string | null;
  measured_weight: number | null;
  updated_at: string;
}

export interface NbaProjection {
  id: number;
  player_id: number;
  draft_probability: number;
  projected_round: number | null;
  projected_pick_range: string | null;
  projected_role: string | null;
  projected_minutes_yr1: number | null;
  projected_minutes_yr3: number | null;
  projected_minutes_prime: number | null;
  projected_salary_rookie: number | null;
  projected_salary_yr5: number | null;
  projected_salary_prime: number | null;
  career_earnings_est: number | null;
  nba_comparison: string | null;
  nba_comp_similarity: number | null;
  secondary_comparison: string | null;
  player_archetype: string | null;
  bust_probability: number;
  all_star_probability: number;
  updated_at: string;
}

export interface ScholasticData {
  id: number;
  player_id: number;
  gpa: number | null;
  gpa_scale: number;
  sat_score: number | null;
  act_score: number | null;
  ncaa_eligible: number;
  core_gpa: number | null;
  core_courses_completed: number;
  core_courses_required: number;
  academic_standing: string;
  intended_major: string | null;
  honors_ap_courses: number;
  class_rank: number | null;
  class_size: number | null;
  transcript_on_file: number;
  ncaa_clearinghouse_id: string | null;
  updated_at: string;
}

export interface NextUpProfile {
  id: number;
  player_id: number;
  nextup_id: string | null;
  nextup_url: string | null;
  profile_verified: number;
  highlights_count: number;
  followers: number;
  last_synced: string | null;
  created_at: string;
}

export type Grade = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F";

export const POSITIONS = ["PG", "SG", "SF", "PF", "C"] as const;
export const CLASS_YEARS = [2025, 2026, 2027, 2028] as const;
export const GRADES: Grade[] = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
