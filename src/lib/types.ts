export interface Team {
  id: number;
  name: string;
  series: string;
  country: string;
  engine_supplier: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  team_id: number | null;
  nationality: string;
  date_of_birth: string | null;
  age: number | null;
  current_series: string;
  super_license_points: number;
  super_license_eligible: number;
  career_wins: number;
  career_podiums: number;
  career_poles: number;
  rating: number;
  ranking: number | null;
  status: string;
  academy: string | null;
  photo_url: string | null;
  merch_store_url: string | null;
  market_value: number | null;
  f1_target_team: string | null;
  created_at: string;
  team_name?: string;
}

export interface Race {
  id: number;
  series: string;
  round_number: number;
  race_name: string;
  circuit: string;
  country: string;
  race_date: string;
  status: string;
  created_at: string;
}

export interface RaceResult {
  id: number;
  driver_id: number;
  race_id: number;
  qualifying_position: number | null;
  race_position: number | null;
  grid_position: number | null;
  fastest_lap: number;
  points_scored: number;
  dnf: number;
  dnf_reason: string | null;
  gap_to_leader: string | null;
  created_at: string;
  driver_name?: string;
  race_info?: string;
}

export interface PerformanceMetrics {
  id: number;
  driver_id: number;
  avg_qualifying_delta: number | null;
  avg_race_pace_delta: number | null;
  wet_weather_rating: number | null;
  tire_management_rating: number | null;
  overtaking_rating: number | null;
  consistency_rating: number | null;
  racecraft_rating: number | null;
  starts_rating: number | null;
  reaction_time_avg: number | null;
  reaction_time_best: number | null;
  top_speed_kph: number | null;
  avg_top_speed_series: number | null;
  sector_speciality: string | null;
  mental_resilience_rating: number | null;
  adaptability_rating: number | null;
  updated_at: string;
}

export interface ScoutingReport {
  id: number;
  driver_id: number;
  race_id: number | null;
  scout_name: string;
  overall_grade: string;
  speed_grade: string | null;
  racecraft_grade: string | null;
  consistency_grade: string | null;
  race_iq_grade: string | null;
  strengths: string | null;
  weaknesses: string | null;
  notes: string | null;
  projection: string | null;
  comparison: string | null;
  created_at: string;
  driver_name?: string;
  race_info?: string;
}

export interface DriverMarketEntry {
  id: number;
  driver_id: number;
  contract_status: string;
  current_contract_end: string | null;
  availability_likelihood: number;
  interested_teams: string | null;
  reason: string | null;
  estimated_salary: number | null;
  created_at: string;
  driver_name?: string;
  nationality?: string;
  current_series?: string;
  team_name?: string;
  rating?: number;
  market_value?: number;
}

export interface SocialAction {
  id: number;
  user_id: string;
  driver_id: number;
  action_type: "follow" | "like" | "share" | "shortlist" | "vote_haas" | "vote_alpine";
  created_at: string;
}

export interface FeedPost {
  id: number;
  author: string;
  content: string;
  post_type: string;
  driver_id: number | null;
  team_context: string | null;
  likes_count: number;
  shares_count: number;
  created_at: string;
  driver_name?: string;
}

export interface MerchItem {
  id: number;
  driver_id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  in_stock: number;
  created_at: string;
}

export interface F1Projection {
  id: number;
  driver_id: number;
  f1_probability: number;
  projected_year: number | null;
  target_team: string | null;
  projected_role: string | null;
  f1_comparison: string | null;
  f1_comp_similarity: number | null;
  secondary_comparison: string | null;
  driver_archetype: string | null;
  championship_probability: number;
  career_podium_est: number | null;
  projected_first_contract: number | null;
  projected_peak_salary: number | null;
  career_earnings_est: number | null;
  updated_at: string;
}

export interface FanVote {
  id: number;
  user_id: string;
  driver_id: number;
  target_team: string;
  created_at: string;
}

export interface DriverContract {
  id: number;
  driver_id: number;
  driver_legal_name: string;
  driver_email: string;
  license_type: string;
  revenue_split_driver: number;
  revenue_split_team: number;
  merch_categories: string;
  contract_status: string;
  signed_at: string;
  ip_address: string | null;
  digital_signature: string;
  terms_version: string;
  created_at: string;
}

export const SERIES = ["F2", "F3", "F4", "Super Formula", "IndyCar", "Formula E", "DTM"] as const;
export type Grade = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F";
export const GRADES: Grade[] = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
