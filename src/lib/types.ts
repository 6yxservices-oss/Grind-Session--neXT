export interface Team {
  id: number;
  name: string;
  conference: string;
  city: string;
  state: string;
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
  committed_to: string | null;
  photo_url: string | null;
  merch_store_url: string | null;
  nil_value: number | null;
  created_at: string;
  // Joined fields
  team_name?: string;
}

export interface Game {
  id: number;
  home_team_id: number;
  away_team_id: number;
  week_number: number;
  venue: string | null;
  city: string | null;
  state: string | null;
  game_date: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
  created_at: string;
  home_team_name?: string;
  away_team_name?: string;
}

export interface PlayerStats {
  id: number;
  player_id: number;
  game_id: number;
  snaps: number;
  // Offense
  pass_completions: number;
  pass_attempts: number;
  pass_yards: number;
  pass_tds: number;
  interceptions: number;
  rush_attempts: number;
  rush_yards: number;
  rush_tds: number;
  receptions: number;
  rec_yards: number;
  rec_tds: number;
  // Defense
  tackles: number;
  solo_tackles: number;
  tackles_for_loss: number;
  sacks: number;
  forced_fumbles: number;
  interceptions_def: number;
  pass_breakups: number;
  // Special
  created_at: string;
  player_name?: string;
  game_info?: string;
}

export interface FootballMetrics {
  id: number;
  player_id: number;
  top_speed_mph: number | null;
  top_speed_times_reached: number | null;
  avg_top_speed_pos: number | null;
  forty_yard: number | null;
  shuttle: number | null;
  vertical_jump: number | null;
  broad_jump: number | null;
  bench_press_reps: number | null;
  throw_velocity_mph: number | null;
  throw_velocity_avg_pos: number | null;
  tackle_force_lbs: number | null;
  block_force_lbs: number | null;
  nfl_avg_tackle_force: number | null;
  nfl_avg_block_force: number | null;
  wingspan: string | null;
  hand_size: number | null;
  arm_length: number | null;
  updated_at: string;
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
  football_iq_grade: string | null;
  strengths: string | null;
  weaknesses: string | null;
  notes: string | null;
  projection: string | null;
  comparison: string | null;
  created_at: string;
  player_name?: string;
  game_info?: string;
}

export interface TransferPortalEntry {
  id: number;
  player_id: number;
  transfer_likelihood: number;
  reason: string | null;
  current_playing_time_pct: number | null;
  projected_nil_increase: number | null;
  portal_entry_date: string | null;
  status: string;
  destination: string | null;
  created_at: string;
  player_name?: string;
  position?: string;
  team_name?: string;
  nil_value?: number;
  star_rating?: number;
}

export interface SocialAction {
  id: number;
  user_id: string;
  player_id: number;
  action_type: "follow" | "like" | "share" | "shortlist";
  created_at: string;
}

export interface FeedPost {
  id: number;
  author: string;
  content: string;
  post_type: string;
  player_id: number | null;
  likes_count: number;
  shares_count: number;
  created_at: string;
  player_name?: string;
}

export interface MerchItem {
  id: number;
  player_id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  in_stock: number;
  created_at: string;
}

export interface NflProjection {
  id: number;
  player_id: number;
  draft_probability: number;
  projected_round: number | null;
  projected_pick_range: string | null;
  projected_role: string | null;
  nfl_comparison: string | null;
  nfl_comp_similarity: number | null;
  secondary_comparison: string | null;
  player_archetype: string | null;
  bust_probability: number;
  pro_bowl_probability: number;
  projected_rookie_contract: number | null;
  projected_second_contract: number | null;
  career_earnings_est: number | null;
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
  academic_standing: string;
  intended_major: string | null;
  updated_at: string;
}

export interface NilContract {
  id: number;
  player_id: number;
  player_legal_name: string;
  player_email: string;
  license_type: string;
  revenue_split_player: number;
  revenue_split_collective: number;
  merch_categories: string;
  contract_status: string;
  signed_at: string;
  ip_address: string | null;
  digital_signature: string;
  terms_version: string;
  created_at: string;
}

export const POSITIONS = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "CB", "S", "K/P", "ATH"] as const;
export const CLASS_YEARS = [2025, 2026, 2027, 2028] as const;
export type Grade = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F";
export const GRADES: Grade[] = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
