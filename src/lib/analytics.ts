import { getDb } from "./db";

const CONFERENCE_NIL_RATES: Record<string, number> = {
  "Big Ten": 350000,
  "SEC": 400000,
  "Big 12": 275000,
  "ACC": 250000,
  "Pac-12": 225000,
  "Group of 5": 100000,
  "FCS": 40000,
};

interface CollegeProbability {
  player_id: number;
  player_name: string;
  team_name: string | null;
  position: string;
  class_year: number;
  star_rating: number;
  college_probability: number;
  projected_level: string;
  nil_value: number;
  confidence: number;
}

export function getCollegeProbabilities(filters?: {
  minProbability?: number;
  position?: string;
  classYear?: number;
}): CollegeProbability[] {
  const players = getDb().prepare(`SELECT p.id, p.first_name, p.last_name, p.position, p.class_year, p.star_rating, p.nil_value, t.name as team_name, COUNT(ps.id) as games_played FROM players p LEFT JOIN teams t ON p.team_id = t.id LEFT JOIN player_stats ps ON p.id = ps.player_id GROUP BY p.id`).all() as Array<Record<string, number | string | null>>;

  const results: CollegeProbability[] = players.map((p) => {
    const stars = (p.star_rating as number) || 0;
    const probability = Math.min(99, Math.max(5, Math.round(stars * 18 + Math.random() * 10)));
    let level: string;
    if (probability >= 85) level = "Power 4 (Big Ten, SEC, Big 12, ACC)";
    else if (probability >= 70) level = "Power Conference";
    else if (probability >= 50) level = "Group of 5";
    else if (probability >= 30) level = "FCS / Low D1";
    else level = "D2 / D3";
    const confidence = Math.min(100, 30 + ((p.games_played as number) || 0) * 10);

    return {
      player_id: p.id as number,
      player_name: `${p.first_name} ${p.last_name}`,
      team_name: p.team_name as string | null,
      position: p.position as string,
      class_year: p.class_year as number,
      star_rating: stars,
      college_probability: probability,
      projected_level: level,
      nil_value: (p.nil_value as number) || 0,
      confidence,
    };
  });

  let filtered = results;
  if (filters?.minProbability) filtered = filtered.filter((p) => p.college_probability >= filters.minProbability!);
  if (filters?.position) filtered = filtered.filter((p) => p.position === filters.position);
  if (filters?.classYear) filtered = filtered.filter((p) => p.class_year === filters.classYear);

  return filtered.sort((a, b) => b.college_probability - a.college_probability);
}

export function getMarketValueProjections() {
  const probs = getCollegeProbabilities({ minProbability: 40 });
  return probs.map((p) => {
    const bestConf = p.projected_level.includes("Power 4") ? "Big Ten" : p.projected_level.includes("Power") ? "ACC" : "Group of 5";
    const base = CONFERENCE_NIL_RATES[bestConf] || 100000;
    const starMult = 0.5 + (p.star_rating / 5) * 1.0;
    const baseVal = base * starMult * (p.college_probability / 100);
    return {
      player_id: p.player_id,
      player_name: p.player_name,
      position: p.position,
      projected_level: p.projected_level,
      year1_value: Math.round(baseVal * 0.4),
      year2_value: Math.round(baseVal * 0.8),
      year3_value: Math.round(baseVal * 1.2),
      year4_value: Math.round(baseVal * 1.0),
      portal_value: Math.round(baseVal * 1.3),
      value_trend: (p.star_rating >= 4 ? "rising" : p.star_rating >= 3 ? "stable" : "declining") as "rising" | "stable" | "declining",
      conference_fit: p.projected_level.includes("Power 4") ? ["Big Ten", "SEC", "Big 12"] : p.projected_level.includes("Power") ? ["ACC", "Pac-12"] : ["AAC", "Sun Belt"],
    };
  }).sort((a, b) => b.portal_value - a.portal_value);
}

export function getCoachMatches(criteria: {
  position?: string;
  playStyle?: string;
  minStarRating?: number;
}) {
  const probs = getCollegeProbabilities({ position: criteria.position });
  return probs.filter((p) => {
    if (criteria.minStarRating && p.star_rating < criteria.minStarRating) return false;
    return true;
  }).map((p) => {
    const reasons: string[] = [];
    if (p.star_rating >= 4) reasons.push(`${p.star_rating}-star prospect`);
    if (p.college_probability >= 80) reasons.push("High college probability");
    reasons.push(`Projects to: ${p.projected_level}`);
    return { ...p, match_score: Math.min(100, p.college_probability + (p.star_rating >= 4 ? 10 : 0)), match_reasons: reasons };
  }).sort((a, b) => b.match_score - a.match_score);
}
