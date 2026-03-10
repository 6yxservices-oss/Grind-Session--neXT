import { getData } from "./db";

interface F1ReadinessScore {
  driver_id: number;
  driver_name: string;
  team_name: string | null;
  nationality: string;
  current_series: string;
  rating: number;
  f1_readiness: number;
  projected_tier: string;
  market_value: number;
  super_license_points: number;
  confidence: number;
}

export function getF1ReadinessScores(filters?: {
  minReadiness?: number;
  series?: string;
  targetTeam?: string;
}): F1ReadinessScore[] {
  const data = getData();

  const results: F1ReadinessScore[] = data.drivers.map((d) => {
    const team = data.teams.find((t) => t.id === d.team_id);
    const raceCount = data.race_results.filter((rr) => rr.driver_id === d.id).length;
    const stars = Number(d.rating) || 0;
    const slPoints = Number(d.super_license_points) || 0;
    const wins = Number(d.career_wins) || 0;
    const readiness = Math.min(99, Math.max(5, Math.round(stars * 16 + (slPoints / 40) * 10 + wins * 3 + Math.random() * 8)));
    let tier: string;
    if (readiness >= 85) tier = "F1 Race Seat Ready";
    else if (readiness >= 70) tier = "F1 Reserve / Test Driver";
    else if (readiness >= 50) tier = "1-2 Seasons Away";
    else if (readiness >= 30) tier = "Development Phase";
    else tier = "Early Career";
    const confidence = Math.min(100, 30 + raceCount * 5 + (slPoints > 25 ? 15 : 0));

    return {
      driver_id: d.id as number,
      driver_name: `${d.first_name} ${d.last_name}`,
      team_name: (team?.name as string) ?? null,
      nationality: d.nationality as string,
      current_series: d.current_series as string,
      rating: stars,
      f1_readiness: readiness,
      projected_tier: tier,
      market_value: Number(d.market_value) || 0,
      super_license_points: slPoints,
      confidence,
    };
  });

  let filtered = results;
  if (filters?.minReadiness) filtered = filtered.filter((d) => d.f1_readiness >= filters.minReadiness!);
  if (filters?.series) filtered = filtered.filter((d) => d.current_series === filters.series);

  return filtered.sort((a, b) => b.f1_readiness - a.f1_readiness);
}

export function getMarketValueProjections() {
  const scores = getF1ReadinessScores({ minReadiness: 30 });
  return scores.map((d) => {
    const base = d.f1_readiness >= 85 ? 5000000 : d.f1_readiness >= 70 ? 2000000 : d.f1_readiness >= 50 ? 800000 : 300000;
    const mult = 0.5 + (d.rating / 5) * 1.0;
    const baseVal = base * mult * (d.f1_readiness / 100);
    return {
      driver_id: d.driver_id,
      driver_name: d.driver_name,
      nationality: d.nationality,
      current_series: d.current_series,
      projected_tier: d.projected_tier,
      year1_salary: Math.round(baseVal * 0.3),
      year2_salary: Math.round(baseVal * 0.6),
      year3_salary: Math.round(baseVal * 1.0),
      peak_salary: Math.round(baseVal * 1.5),
      market_value: d.market_value,
      value_trend: (d.rating >= 4 ? "rising" : d.rating >= 3 ? "stable" : "declining") as "rising" | "stable" | "declining",
      best_fit_teams: d.f1_readiness >= 70 ? ["Haas", "Alpine", "Williams", "Sauber"] : ["F2 Team", "Reserve Role"],
    };
  }).sort((a, b) => b.peak_salary - a.peak_salary);
}

export function getTeamFitAnalysis(criteria: {
  series?: string;
  minRating?: number;
}) {
  const scores = getF1ReadinessScores({ series: criteria.series });
  return scores.filter((d) => {
    if (criteria.minRating && d.rating < criteria.minRating) return false;
    return true;
  }).map((d) => {
    const reasons: string[] = [];
    if (d.rating >= 4) reasons.push(`${d.rating}-star rated`);
    if (d.super_license_points >= 40) reasons.push("Super License eligible");
    else if (d.super_license_points >= 25) reasons.push(`${d.super_license_points} SL points`);
    if (d.f1_readiness >= 70) reasons.push("F1 ready");
    reasons.push(`Tier: ${d.projected_tier}`);
    return { ...d, match_score: Math.min(100, d.f1_readiness + (d.rating >= 4 ? 10 : 0)), match_reasons: reasons };
  }).sort((a, b) => b.match_score - a.match_score);
}
