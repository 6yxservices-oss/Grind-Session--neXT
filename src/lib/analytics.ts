import { getDb } from "./db";

// Conference-based market value rates (estimated NIL $ per season)
const CONFERENCE_MARKET_RATES: Record<string, { base: number; multiplier: number }> = {
  "Big 12": { base: 250000, multiplier: 1.0 },
  "SEC": { base: 350000, multiplier: 1.4 },
  "Big Ten": { base: 300000, multiplier: 1.2 },
  "ACC": { base: 275000, multiplier: 1.1 },
  "Big East": { base: 200000, multiplier: 0.8 },
  "Pac-12": { base: 225000, multiplier: 0.9 },
  "AAC": { base: 125000, multiplier: 0.5 },
  "Mountain West": { base: 100000, multiplier: 0.4 },
  "Mid-Major": { base: 75000, multiplier: 0.3 },
};

// Weights for college probability scoring
const COLLEGE_PROB_WEIGHTS = {
  star_rating: 0.25,
  ppg: 0.2,
  rpg: 0.1,
  apg: 0.1,
  athleticism: 0.15,
  size: 0.1,
  consistency: 0.1,
};

interface CollegeProbability {
  player_id: number;
  player_name: string;
  team_name: string | null;
  position: string;
  class_year: number;
  star_rating: number;
  height: string | null;
  college_probability: number;
  projected_level: string;
  confidence: number;
  ppg: number;
  rpg: number;
  apg: number;
  factors: {
    star_factor: number;
    stats_factor: number;
    size_factor: number;
    consistency_factor: number;
  };
}

interface MarketValueProjection {
  player_id: number;
  player_name: string;
  position: string;
  projected_level: string;
  year1_value: number;
  year2_value: number;
  year3_value: number;
  year4_value: number;
  portal_value: number;
  value_trend: "rising" | "stable" | "declining";
  comparable_players: string[];
  conference_fit: string[];
}

interface CoachMatch {
  player_id: number;
  player_name: string;
  position: string;
  class_year: number;
  star_rating: number;
  college_probability: number;
  projected_level: string;
  ppg: number;
  rpg: number;
  apg: number;
  match_score: number;
  match_reasons: string[];
}

// Parse height string like "6'5" to inches
function heightToInches(height: string | null): number {
  if (!height) return 72; // default 6'0"
  const match = height.match(/(\d+)'(\d+)/);
  if (!match) return 72;
  return parseInt(match[1]) * 12 + parseInt(match[2]);
}

// Get position-ideal height ranges (in inches)
function getIdealHeightRange(position: string): { min: number; max: number; ideal: number } {
  const ranges: Record<string, { min: number; max: number; ideal: number }> = {
    PG: { min: 70, max: 76, ideal: 74 },
    SG: { min: 73, max: 78, ideal: 76 },
    SF: { min: 76, max: 81, ideal: 79 },
    PF: { min: 78, max: 83, ideal: 80 },
    C: { min: 80, max: 86, ideal: 82 },
  };
  return ranges[position] || ranges.SF;
}

// Calculate size factor based on position-appropriate height
function calculateSizeFactor(height: string | null, position: string): number {
  const inches = heightToInches(height);
  const range = getIdealHeightRange(position);

  if (inches >= range.min && inches <= range.max) {
    // Within ideal range: score based on proximity to ideal
    const deviation = Math.abs(inches - range.ideal);
    return Math.max(0.7, 1 - deviation * 0.05);
  } else if (inches > range.max) {
    // Oversized for position (often a plus)
    return Math.min(1.0, 0.85 + (inches - range.max) * 0.02);
  } else {
    // Undersized for position
    return Math.max(0.3, 0.7 - (range.min - inches) * 0.1);
  }
}

// Calculate college probability for all players
export function getCollegeProbabilities(filters?: {
  minProbability?: number;
  position?: string;
  classYear?: number;
}): CollegeProbability[] {
  const db = getDb();

  const players = db
    .prepare(
      `SELECT p.id, p.first_name, p.last_name, p.position, p.class_year,
              p.star_rating, p.height, p.weight, t.name as team_name,
              COALESCE(AVG(ps.points), 0) as ppg,
              COALESCE(AVG(ps.rebounds), 0) as rpg,
              COALESCE(AVG(ps.assists), 0) as apg,
              COALESCE(AVG(ps.steals), 0) as spg,
              COALESCE(AVG(ps.blocks), 0) as bpg,
              COUNT(ps.id) as games_played,
              0 as pts_stddev
       FROM players p
       LEFT JOIN teams t ON p.team_id = t.id
       LEFT JOIN player_stats ps ON p.id = ps.player_id
       GROUP BY p.id`
    )
    .all() as Array<Record<string, number | string | null>>;

  const results: CollegeProbability[] = players.map((p) => {
    const starRating = (p.star_rating as number) || 0;
    const ppg = (p.ppg as number) || 0;
    const rpg = (p.rpg as number) || 0;
    const apg = (p.apg as number) || 0;
    const gamesPlayed = (p.games_played as number) || 0;

    // Star rating factor (0-1): 5-star = 1.0, 4-star = 0.85, etc.
    const starFactor = Math.min(1, starRating / 5);

    // Stats factor: normalized scoring output for position
    const ppgNorm = Math.min(1, ppg / 25);
    const rpgNorm = Math.min(1, rpg / 12);
    const apgNorm = Math.min(1, apg / 8);
    const statsFactor = ppgNorm * 0.5 + rpgNorm * 0.25 + apgNorm * 0.25;

    // Size factor
    const sizeFactor = calculateSizeFactor(p.height as string | null, p.position as string);

    // Consistency factor (lower variance = more consistent)
    const consistencyFactor = gamesPlayed > 0 ? Math.max(0.3, 1 - ((p.pts_stddev as number) || 0) / (ppg + 1) * 0.5) : 0.5;

    // Weighted probability
    const rawProbability =
      starFactor * COLLEGE_PROB_WEIGHTS.star_rating +
      statsFactor * (COLLEGE_PROB_WEIGHTS.ppg + COLLEGE_PROB_WEIGHTS.rpg + COLLEGE_PROB_WEIGHTS.apg) +
      sizeFactor * (COLLEGE_PROB_WEIGHTS.athleticism + COLLEGE_PROB_WEIGHTS.size) +
      consistencyFactor * COLLEGE_PROB_WEIGHTS.consistency;

    // Scale to 0-100 with floor/ceiling
    const probability = Math.round(Math.min(99, Math.max(5, rawProbability * 100)));

    // Determine projected level
    let projectedLevel: string;
    if (probability >= 85) projectedLevel = "High Major (Power 5)";
    else if (probability >= 70) projectedLevel = "Major Conference";
    else if (probability >= 55) projectedLevel = "Mid-Major";
    else if (probability >= 40) projectedLevel = "Low Major / D1";
    else if (probability >= 25) projectedLevel = "D2 / NAIA";
    else projectedLevel = "D3 / JUCO";

    // Confidence based on data availability
    const confidence = Math.min(100, 30 + gamesPlayed * 10);

    return {
      player_id: p.id as number,
      player_name: `${p.first_name} ${p.last_name}`,
      team_name: p.team_name as string | null,
      position: p.position as string,
      class_year: p.class_year as number,
      star_rating: starRating,
      height: p.height as string | null,
      college_probability: probability,
      projected_level: projectedLevel,
      confidence,
      ppg: Math.round(ppg * 10) / 10,
      rpg: Math.round(rpg * 10) / 10,
      apg: Math.round(apg * 10) / 10,
      factors: {
        star_factor: Math.round(starFactor * 100),
        stats_factor: Math.round(statsFactor * 100),
        size_factor: Math.round(sizeFactor * 100),
        consistency_factor: Math.round(consistencyFactor * 100),
      },
    };
  });

  let filtered = results;
  if (filters?.minProbability) {
    filtered = filtered.filter((p) => p.college_probability >= filters.minProbability!);
  }
  if (filters?.position) {
    filtered = filtered.filter((p) => p.position === filters.position);
  }
  if (filters?.classYear) {
    filtered = filtered.filter((p) => p.class_year === filters.classYear);
  }

  return filtered.sort((a, b) => b.college_probability - a.college_probability);
}

// Project transfer portal market value based on stats, physical attributes, and conference rates
export function getMarketValueProjections(playerId?: number): MarketValueProjection[] {
  const probabilities = getCollegeProbabilities();

  return probabilities
    .filter((p) => (playerId ? p.player_id === playerId : p.college_probability >= 40))
    .map((p) => {
      // Determine best-fit conferences based on projected level
      const conferenceFit: string[] = [];
      if (p.projected_level.includes("Power 5") || p.projected_level.includes("High Major")) {
        conferenceFit.push("SEC", "Big Ten", "Big 12", "ACC");
      } else if (p.projected_level.includes("Major")) {
        conferenceFit.push("Big East", "Pac-12", "AAC");
      } else {
        conferenceFit.push("Mountain West", "Mid-Major");
      }

      // Base value from best conference fit
      const bestConf = conferenceFit[0];
      const rate = CONFERENCE_MARKET_RATES[bestConf] || CONFERENCE_MARKET_RATES["Mid-Major"];

      // Modify by player attributes
      const starMultiplier = 0.5 + (p.star_rating / 5) * 1.0;
      const statsMultiplier = 0.7 + (p.ppg / 20) * 0.6;
      const probabilityMultiplier = p.college_probability / 100;

      const baseValue = rate.base * starMultiplier * statsMultiplier * probabilityMultiplier;

      // Year-over-year projections (freshman to senior)
      const year1Value = Math.round(baseValue * 0.4); // Freshman: lower value
      const year2Value = Math.round(baseValue * 0.8); // Sophomore: developing
      const year3Value = Math.round(baseValue * 1.2); // Junior: peak portal value
      const year4Value = Math.round(baseValue * 1.0); // Senior: slight decline

      // Portal transfer value (typically peaks junior year)
      const portalValue = Math.round(baseValue * 1.3);

      // Value trend based on trajectory
      let valueTrend: "rising" | "stable" | "declining";
      if (p.star_rating >= 4 && p.ppg >= 15) valueTrend = "rising";
      else if (p.star_rating >= 3) valueTrend = "stable";
      else valueTrend = "declining";

      // Generate comparable player archetypes
      const comparables = generateComparables(p.position, p.ppg, p.rpg, p.apg, p.star_rating);

      return {
        player_id: p.player_id,
        player_name: p.player_name,
        position: p.position,
        projected_level: p.projected_level,
        year1_value: year1Value,
        year2_value: year2Value,
        year3_value: year3Value,
        year4_value: year4Value,
        portal_value: portalValue,
        value_trend: valueTrend,
        comparable_players: comparables,
        conference_fit: conferenceFit,
      };
    })
    .sort((a, b) => b.portal_value - a.portal_value);
}

// Generate archetype comparisons based on statistical profile
function generateComparables(
  position: string,
  ppg: number,
  rpg: number,
  apg: number,
  stars: number
): string[] {
  const archetypes: Record<string, string[]> = {
    PG: [
      ppg >= 18 ? "Score-first PG" : "Floor general",
      apg >= 6 ? "Elite facilitator" : "Combo guard",
      stars >= 4 ? "One-and-done caliber" : "4-year starter type",
    ],
    SG: [
      ppg >= 18 ? "Elite scorer" : "3-and-D wing",
      apg >= 4 ? "Playmaking wing" : "Off-ball scorer",
      stars >= 4 ? "Lottery pick trajectory" : "Rotation player",
    ],
    SF: [
      ppg >= 16 ? "Two-way wing" : "Versatile forward",
      rpg >= 7 ? "Rebounding wing" : "Perimeter-oriented",
      stars >= 4 ? "High-major starter" : "Solid contributor",
    ],
    PF: [
      ppg >= 15 ? "Stretch four" : "Traditional PF",
      rpg >= 8 ? "Glass cleaner" : "Face-up four",
      stars >= 4 ? "Franchise cornerstone" : "Rotation big",
    ],
    C: [
      ppg >= 14 ? "Scoring center" : "Rim protector",
      rpg >= 9 ? "Dominant rebounder" : "Finesse big",
      stars >= 4 ? "Program-changing big" : "Solid anchor",
    ],
  };

  return archetypes[position] || archetypes.SF;
}

// Coach-to-player matching: find best players matching coaching needs
export function getCoachMatches(criteria: {
  position?: string;
  minClassYear?: number;
  maxClassYear?: number;
  minHeight?: string;
  conference?: string;
  playStyle?: "scoring" | "defensive" | "playmaking" | "rebounding" | "all-around";
  minStarRating?: number;
}): CoachMatch[] {
  const probabilities = getCollegeProbabilities({
    position: criteria.position,
  });

  return probabilities
    .filter((p) => {
      if (criteria.minClassYear && p.class_year < criteria.minClassYear) return false;
      if (criteria.maxClassYear && p.class_year > criteria.maxClassYear) return false;
      if (criteria.minStarRating && p.star_rating < criteria.minStarRating) return false;
      if (criteria.minHeight) {
        const minInches = heightToInches(criteria.minHeight);
        const playerInches = heightToInches(p.height);
        if (playerInches < minInches) return false;
      }
      // Filter by conference fit
      if (criteria.conference) {
        const projections = getMarketValueProjections(p.player_id);
        if (projections.length > 0 && !projections[0].conference_fit.includes(criteria.conference)) {
          return false;
        }
      }
      return true;
    })
    .map((p) => {
      let matchScore = p.college_probability;
      const reasons: string[] = [];

      // Boost based on play style match
      switch (criteria.playStyle) {
        case "scoring":
          if (p.ppg >= 15) { matchScore += 10; reasons.push("Elite scorer"); }
          break;
        case "playmaking":
          if (p.apg >= 5) { matchScore += 10; reasons.push("Strong facilitator"); }
          break;
        case "rebounding":
          if (p.rpg >= 8) { matchScore += 10; reasons.push("Dominant rebounder"); }
          break;
        case "defensive":
          if (p.factors.size_factor >= 70) { matchScore += 10; reasons.push("Defensive presence"); }
          break;
        case "all-around":
          if (p.ppg >= 10 && p.rpg >= 5 && p.apg >= 3) { matchScore += 10; reasons.push("Versatile all-around game"); }
          break;
      }

      if (p.star_rating >= 4) reasons.push(`${p.star_rating}-star prospect`);
      if (p.college_probability >= 80) reasons.push("High college probability");
      reasons.push(`Projects to: ${p.projected_level}`);

      return {
        player_id: p.player_id,
        player_name: p.player_name,
        position: p.position,
        class_year: p.class_year,
        star_rating: p.star_rating,
        college_probability: p.college_probability,
        projected_level: p.projected_level,
        ppg: p.ppg,
        rpg: p.rpg,
        apg: p.apg,
        match_score: Math.min(100, matchScore),
        match_reasons: reasons,
      };
    })
    .sort((a, b) => b.match_score - a.match_score);
}

// SQLite doesn't have STDEV, so we approximate variance in the query as 0
// This is handled gracefully in the code above
