// ASU Basketball Roster Construction Analysis Data
// Bobby Hurley Era (2015-2026) -> Randy Bennett Transition

export interface HurleySeason {
  season: string;
  overall: string;
  confRecord: string;
  conference: string;
  confFinish: string;
  postseason: string;
  kenpomApprox: number;
  recruitRank: string;
}

export interface RosterPlayer {
  name: string;
  pos: string;
  height: string;
  classYear: string;
  ppg: number;
  rpg: number;
  apg: number;
  mpg: number;
  gp: number;
  origin: "HS Recruit" | "1x Transfer" | "2x+ Transfer" | "International";
  fromSchool: string;
  stars: number;
  yearsInCollege: number;
  status2627: "Portal Out" | "Returning (TBD)" | "NBA Draft" | "Eligibility Exhausted" | "Retained" | "Injured";
}

export interface TransferSeasonData {
  season: string;
  record: string;
  transfersIn: number;
  transfersOut: number;
  returningMinPct: number;
  returningScorePct: number;
  keyIn: { name: string; from: string; type: "Step-Up" | "Lateral" | "Step-Down"; priorPpg: number; asuPpg: number }[];
  keyOut: { name: string; to: string; ppg: number }[];
}

export interface BennettSeason {
  season: string;
  overall: string;
  wccRecord: string;
  wccFinish: string;
  postseason: string;
  kenpomApprox: number;
  adjDE_rank: string;
}

export interface PortalTarget {
  name: string;
  pos: string;
  height: string;
  from: string;
  ppg: number;
  rpg: number;
  apg: number;
  type: "SMC Follow" | "Portal Target" | "HS Recruit" | "Returning ASU";
  likelihood: number;
  notes: string;
}

// ============ HURLEY ERA SEASON-BY-SEASON ============
export function getHurleySeasons(): HurleySeason[] {
  return [
    { season: "2015-16", overall: "15-17", confRecord: "5-13", conference: "Pac-12", confFinish: "11th", postseason: "None", kenpomApprox: 135, recruitRank: "~60s" },
    { season: "2016-17", overall: "15-18", confRecord: "7-11", conference: "Pac-12", confFinish: "8th", postseason: "None", kenpomApprox: 115, recruitRank: "~50s" },
    { season: "2017-18", overall: "20-12", confRecord: "8-10", conference: "Pac-12", confFinish: "T-8th", postseason: "NCAA First Four (L Syracuse)", kenpomApprox: 40, recruitRank: "~30" },
    { season: "2018-19", overall: "23-11", confRecord: "12-6", conference: "Pac-12", confFinish: "2nd", postseason: "NCAA R64 (W St. John's FF, L Buffalo)", kenpomApprox: 38, recruitRank: "~35" },
    { season: "2019-20", overall: "20-11", confRecord: "11-7", conference: "Pac-12", confFinish: "T-3rd", postseason: "Cancelled (COVID)", kenpomApprox: 45, recruitRank: "No. 8" },
    { season: "2020-21", overall: "11-14", confRecord: "7-10", conference: "Pac-12", confFinish: "9th", postseason: "None", kenpomApprox: 140, recruitRank: "~55" },
    { season: "2021-22", overall: "14-17", confRecord: "10-10", conference: "Pac-12", confFinish: "8th", postseason: "None", kenpomApprox: 120, recruitRank: "~60" },
    { season: "2022-23", overall: "23-13", confRecord: "11-9", conference: "Pac-12", confFinish: "5th", postseason: "NCAA R64 (W Nevada FF, L TCU)", kenpomApprox: 60, recruitRank: "~45" },
    { season: "2023-24", overall: "14-18", confRecord: "8-12", conference: "Pac-12", confFinish: "T-9th", postseason: "L Pac-12 Tourney R1", kenpomApprox: 110, recruitRank: "No. 3" },
    { season: "2024-25", overall: "13-20", confRecord: "4-16", conference: "Big 12", confFinish: "15th", postseason: "L Big 12 Tourney R1", kenpomApprox: 155, recruitRank: "~45" },
    { season: "2025-26", overall: "17-16", confRecord: "7-11", conference: "Big 12", confFinish: "11th", postseason: "L Big 12 Tourney R2 (42-91 Iowa St)", kenpomApprox: 67, recruitRank: "~50" },
  ];
}

// ============ 2025-26 ROSTER ============
export function getRoster2526(): RosterPlayer[] {
  return [
    { name: "Moe Odum", pos: "G", height: "6-1", classYear: "Sr", ppg: 17.1, rpg: 3.0, apg: 5.9, mpg: 33, gp: 31, origin: "1x Transfer", fromSchool: "Pepperdine", stars: 0, yearsInCollege: 5, status2627: "Portal Out" },
    { name: "Massamba Diop", pos: "C", height: "7-1", classYear: "Fr", ppg: 13.6, rpg: 5.8, apg: 1.1, mpg: 28, gp: 33, origin: "International", fromSchool: "Gran Canaria B (Spain/Senegal)", stars: 3, yearsInCollege: 1, status2627: "Returning (TBD)" },
    { name: "Anthony 'Pig' Johnson", pos: "G", height: "6-2", classYear: "Sr", ppg: 13.3, rpg: 3.1, apg: 1.8, mpg: 28, gp: 31, origin: "2x+ Transfer", fromSchool: "Cumberlands (NAIA)", stars: 0, yearsInCollege: 5, status2627: "Eligibility Exhausted" },
    { name: "Andrija Grbovic", pos: "F", height: "6-9", classYear: "Fr", ppg: 7.3, rpg: 3.2, apg: 0.4, mpg: 20.3, gp: 25, origin: "International", fromSchool: "SC Derby (Montenegro)", stars: 0, yearsInCollege: 1, status2627: "Returning (TBD)" },
    { name: "Bryce Ford", pos: "G", height: "6-3", classYear: "Sr", ppg: 7.2, rpg: 1.7, apg: 1.5, mpg: 23.3, gp: 21, origin: "1x Transfer", fromSchool: "Toledo", stars: 0, yearsInCollege: 5, status2627: "Eligibility Exhausted" },
    { name: "Allen Mukeba", pos: "F", height: "6-6", classYear: "Sr", ppg: 8.0, rpg: 4.0, apg: 1.0, mpg: 22, gp: 30, origin: "1x Transfer", fromSchool: "Oakland (Belgium/Congo)", stars: 0, yearsInCollege: 5, status2627: "Portal Out" },
    { name: "Santiago Trouet", pos: "F", height: "6-10", classYear: "Jr", ppg: 5.0, rpg: 5.6, apg: 0.5, mpg: 14, gp: 25, origin: "1x Transfer", fromSchool: "San Diego (Argentina)", stars: 0, yearsInCollege: 3, status2627: "Returning (TBD)" },
    { name: "Marcus Adams Jr.", pos: "F", height: "6-8", classYear: "So", ppg: 3.6, rpg: 2.4, apg: 0.5, mpg: 11.8, gp: 25, origin: "1x Transfer", fromSchool: "Cal St. Northridge", stars: 0, yearsInCollege: 3, status2627: "Portal Out" },
    { name: "Marcus Jackson", pos: "F", height: "6-8", classYear: "Fr", ppg: 5.0, rpg: 3.0, apg: 0.5, mpg: 15, gp: 28, origin: "HS Recruit", fromSchool: "Word of God (NC)", stars: 4, yearsInCollege: 1, status2627: "Returning (TBD)" },
    { name: "Trevor Best", pos: "G", height: "6-2", classYear: "So", ppg: 3.5, rpg: 1.5, apg: 1.0, mpg: 12, gp: 25, origin: "HS Recruit", fromSchool: "2024 class", stars: 3, yearsInCollege: 2, status2627: "Returning (TBD)" },
    { name: "Kash Polk", pos: "F", height: "6-7", classYear: "Fr", ppg: 3.0, rpg: 2.0, apg: 0.5, mpg: 10, gp: 20, origin: "HS Recruit", fromSchool: "Argyle (TX)", stars: 3, yearsInCollege: 1, status2627: "Returning (TBD)" },
    { name: "Jaion Pitt", pos: "F", height: "6-10", classYear: "Fr", ppg: 2.5, rpg: 2.0, apg: 0.3, mpg: 8, gp: 15, origin: "HS Recruit", fromSchool: "Bella Vista Prep (AZ)", stars: 4, yearsInCollege: 1, status2627: "Returning (TBD)" },
    { name: "Noah Meeusen", pos: "G", height: "6-5", classYear: "Fr", ppg: 2.0, rpg: 1.0, apg: 0.5, mpg: 7, gp: 18, origin: "International", fromSchool: "Oostende (Belgium)", stars: 0, yearsInCollege: 1, status2627: "Returning (TBD)" },
    { name: "Dame Salane", pos: "C", height: "7-0", classYear: "Fr", ppg: 1.5, rpg: 1.5, apg: 0.2, mpg: 5, gp: 10, origin: "International", fromSchool: "Italy (Senegal)", stars: 0, yearsInCollege: 1, status2627: "Returning (TBD)" },
    { name: "Adante Holiman", pos: "F", height: "6-0", classYear: "Sr", ppg: 0, rpg: 0, apg: 0, mpg: 0, gp: 0, origin: "1x Transfer", fromSchool: "Georgia Southern", stars: 0, yearsInCollege: 5, status2627: "Injured" },
    { name: "Vijay Wallace", pos: "G", height: "6-6", classYear: "So", ppg: 2.0, rpg: 1.0, apg: 0.5, mpg: 8, gp: 15, origin: "1x Transfer", fromSchool: "Triton College (JUCO)", stars: 0, yearsInCollege: 2, status2627: "Returning (TBD)" },
  ];
}

// ============ TRANSFER PORTAL HISTORY ============
export function getTransferPortalHistory(): TransferSeasonData[] {
  return [
    {
      season: "2022-23",
      record: "23-13 (NCAA R64)",
      transfersIn: 5,
      transfersOut: 6,
      returningMinPct: 45,
      returningScorePct: 40,
      keyIn: [
        { name: "Desmond Cambridge Jr.", from: "Nevada", type: "Step-Up", priorPpg: 16.2, asuPpg: 13.6 },
        { name: "Warren Washington", from: "Nevada", type: "Step-Up", priorPpg: 10.2, asuPpg: 9.2 },
        { name: "Frankie Collins", from: "Michigan", type: "Step-Up", priorPpg: 2.0, asuPpg: 9.9 },
        { name: "Devan Cambridge", from: "Auburn", type: "Lateral", priorPpg: 5.3, asuPpg: 9.8 },
      ],
      keyOut: [
        { name: "DJ Horne", to: "NC State", ppg: 12.5 },
        { name: "Warren Washington", to: "Texas Tech", ppg: 9.2 },
        { name: "Devan Cambridge", to: "Oregon", ppg: 9.8 },
      ],
    },
    {
      season: "2023-24",
      record: "14-18",
      transfersIn: 6,
      transfersOut: 6,
      returningMinPct: 29,
      returningScorePct: 24,
      keyIn: [
        { name: "Jose Perez", from: "West Virginia", type: "Lateral", priorPpg: 18.9, asuPpg: 13.5 },
        { name: "Adam Miller", from: "LSU", type: "Lateral", priorPpg: 4.0, asuPpg: 12.0 },
      ],
      keyOut: [
        { name: "Frankie Collins", to: "TCU", ppg: 13.8 },
        { name: "Jamiya Neal", to: "Creighton", ppg: 11.0 },
      ],
    },
    {
      season: "2024-25",
      record: "13-20 (4-16 Big 12)",
      transfersIn: 5,
      transfersOut: 10,
      returningMinPct: 15,
      returningScorePct: 12,
      keyIn: [
        { name: "BJ Freeman", from: "Milwaukee", type: "Step-Up", priorPpg: 21.1, asuPpg: 13.7 },
        { name: "Alston Mason", from: "Missouri State", type: "Step-Up", priorPpg: 17.5, asuPpg: 13.8 },
        { name: "Basheer Jihad", from: "Ball State", type: "Step-Up", priorPpg: 18.6, asuPpg: 12.7 },
      ],
      keyOut: [
        { name: "Jayden Quaintance", to: "Kentucky", ppg: 9.4 },
        { name: "Joson Sanon", to: "St. John's", ppg: 11.9 },
        { name: "BJ Freeman", to: "UCF (dismissed)", ppg: 13.7 },
      ],
    },
    {
      season: "2025-26",
      record: "17-16 (7-11 Big 12)",
      transfersIn: 8,
      transfersOut: 8,
      returningMinPct: 2,
      returningScorePct: 1,
      keyIn: [
        { name: "Moe Odum", from: "Pepperdine", type: "Step-Up", priorPpg: 13.1, asuPpg: 17.1 },
        { name: "Marcus Adams Jr.", from: "CS Northridge", type: "Step-Up", priorPpg: 16.1, asuPpg: 3.6 },
        { name: "Allen Mukeba", from: "Oakland", type: "Step-Up", priorPpg: 14.6, asuPpg: 8.0 },
        { name: "Pig Johnson", from: "Cumberlands (NAIA)", type: "Step-Up", priorPpg: 23.6, asuPpg: 13.3 },
      ],
      keyOut: [
        { name: "Massamba Diop", to: "TBD (retention priority)", ppg: 13.6 },
        { name: "Moe Odum", to: "Portal", ppg: 17.1 },
      ],
    },
  ];
}

// ============ BENNETT AT SAINT MARY'S ============
export function getBennettSeasons(): BennettSeason[] {
  return [
    { season: "2019-20", overall: "26-8", wccRecord: "11-5", wccFinish: "T-3rd", postseason: "Cancelled (COVID)", kenpomApprox: 38, adjDE_rank: "~20th" },
    { season: "2020-21", overall: "14-10", wccRecord: "4-6", wccFinish: "7th", postseason: "NIT R1 (L W. Kentucky)", kenpomApprox: 90, adjDE_rank: "~50th" },
    { season: "2021-22", overall: "26-8", wccRecord: "12-3", wccFinish: "2nd", postseason: "NCAA R32 (#5, W Indiana, L UCLA)", kenpomApprox: 30, adjDE_rank: "~15th" },
    { season: "2022-23", overall: "26-7", wccRecord: "14-2", wccFinish: "1st", postseason: "NCAA R32 (#5, W VCU, L UConn)", kenpomApprox: 7, adjDE_rank: "~8th" },
    { season: "2023-24", overall: "26-8", wccRecord: "15-1", wccFinish: "1st", postseason: "NCAA R64 (#5, L Grand Canyon)", kenpomApprox: 38, adjDE_rank: "~12th" },
    { season: "2024-25", overall: "29-6", wccRecord: "17-1", wccFinish: "1st", postseason: "NCAA R32 (#7, W Vanderbilt, L Alabama)", kenpomApprox: 9, adjDE_rank: "~8th" },
    { season: "2025-26", overall: "25-7", wccRecord: "16-2", wccFinish: "1st", postseason: "NCAA R64 (#7, L Texas A&M)", kenpomApprox: 22, adjDE_rank: "~18th" },
  ];
}

// ============ BENNETT ROSTER CONSTRUCTION MODEL ============
export function getBennettRosterModel() {
  return {
    minuteBreakdown: [
      { season: "2021-22", hsRecruits: 62, transfers: 8, international: 30 },
      { season: "2022-23", hsRecruits: 55, transfers: 12, international: 33 },
      { season: "2023-24", hsRecruits: 50, transfers: 18, international: 32 },
      { season: "2024-25", hsRecruits: 48, transfers: 20, international: 32 },
      { season: "2025-26", hsRecruits: 45, transfers: 22, international: 33 },
    ],
    schemeProfile: {
      offense: "Princeton Motion (4-out, 1-in)",
      defense: "Pack-Line Man-to-Man",
      tempo: "Bottom 10 nationally (19+ sec possessions)",
      identity: [
        "Elite defensive efficiency (top-20 KenPom AdjDE 5 of last 6 seasons)",
        "Opponent 3P%: ~31% (top-50 nationally)",
        "Opponent 2P%: ~45.8% (top-15 nationally)",
        "Offensive rebounding: 40.5% rate (top-5 nationally in 2025-26)",
        "Turnover rate: Extremely low on offense",
        "Slowest tempo in Division I (outside top-300 in pace 11 straight years)",
      ],
    },
    internationalPipeline: [
      { country: "Australia", players: 23, nbaProducts: ["Patty Mills", "Matthew Dellavedova", "Jock Landale"], keyRecent: ["Alex Ducas", "Harry Wessels", "Joshua Dent", "Rory Hawke"] },
      { country: "Lithuania", players: 4, nbaProducts: [], keyRecent: ["Augustas Marciulionis (14.2 PPG sr yr)", "Paulius Murauskas (18.4 PPG)", "Mantas Juzenas"] },
      { country: "France", players: 2, nbaProducts: [], keyRecent: ["Samuel Saint-Jean"] },
      { country: "Canada", players: 2, nbaProducts: [], keyRecent: ["Oliver Faubert"] },
    ],
  };
}

// ============ 2026-27 PORTAL TARGETS & OUTLOOK ============
export function get2627Outlook(): PortalTarget[] {
  return [
    { name: "Paulius Murauskas", pos: "F", height: "6-8", from: "Saint Mary's (Lithuania)", ppg: 18.4, rpg: 7.7, apg: 2.1, type: "SMC Follow", likelihood: 75, notes: "1st Team All-WCC, #1 portal player nationally. Prev: Arizona. Bennett's top player." },
    { name: "Andrew McKeever", pos: "C", height: "7-3", from: "Saint Mary's", ppg: 10.0, rpg: 9.5, apg: 0.8, type: "SMC Follow", likelihood: 60, notes: "WCC all-time career rebound % leader. 285 lbs. Elite rim protector for pack-line D." },
    { name: "Mikey Lewis", pos: "G", height: "6-2", from: "Saint Mary's (Oakland, CA)", ppg: 13.9, rpg: 3.0, apg: 3.5, type: "SMC Follow", likelihood: 55, notes: "1st Team All-WCC. 64 threes, 37.1% from deep. Former ESPN 100 recruit (#83)." },
    { name: "JRob Croy", pos: "G", height: "6-5", from: "HS - Riverside Poly (CA)", ppg: 0, rpg: 0, apg: 0, type: "HS Recruit", likelihood: 100, notes: "4-star (#124 national). Flipped from SMC to ASU within 24hrs of Bennett hire. 'My loyalty is with Coach Bennett.'" },
    { name: "Massamba Diop", pos: "C", height: "7-1", from: "ASU (Senegal)", ppg: 13.6, rpg: 5.8, apg: 1.1, type: "Returning ASU", likelihood: 65, notes: "Led Big 12 in FG% (56.9%). Same agency as Bennett. Top retention priority." },
    { name: "Marcus Jackson", pos: "F", height: "6-8", from: "ASU (HS Recruit)", ppg: 5.0, rpg: 3.0, apg: 0.5, type: "Returning ASU", likelihood: 50, notes: "4-star freshman. Young development piece fits Bennett model." },
    { name: "Santiago Trouet", pos: "F", height: "6-10", from: "ASU (Argentina)", ppg: 5.0, rpg: 5.6, apg: 0.5, type: "Returning ASU", likelihood: 55, notes: "Argentine forward. International background fits Bennett. 2 years eligibility." },
    { name: "Andrija Grbovic", pos: "F", height: "6-9", from: "ASU (Montenegro)", ppg: 7.3, rpg: 3.2, apg: 0.4, type: "Returning ASU", likelihood: 55, notes: "Montenegrin freshman. 19 starts. Development candidate for Bennett system." },
  ];
}

// ============ NIL & FACILITIES ============
export function getNILData() {
  return {
    collective: "Sun Angel Collective",
    launched: "August 2, 2022",
    estimatedBudget: "$4-6M (basketball)",
    big12Tier: "Middle-to-lower tier",
    keyDonor: "James Harden (high six-figure donation, 2025)",
    big12Comparison: [
      { school: "Kansas", tier: "Elite", estimated: "$12-15M+" },
      { school: "Houston", tier: "Top", estimated: "$10-12M" },
      { school: "Arizona", tier: "Top", estimated: "$10-12M" },
      { school: "Iowa State", tier: "Strong", estimated: "$8-10M" },
      { school: "Baylor", tier: "Strong", estimated: "$8-10M" },
      { school: "BYU", tier: "Strong", estimated: "$7-9M" },
      { school: "Texas Tech", tier: "Mid", estimated: "$6-8M" },
      { school: "Cincinnati", tier: "Mid", estimated: "$5-7M" },
      { school: "Arizona State", tier: "Mid-Low", estimated: "$4-6M" },
      { school: "UCF", tier: "Lower", estimated: "$3-5M" },
      { school: "Colorado", tier: "Lower", estimated: "$3-5M" },
    ],
    avgPerAthlete: "$46K (Big 12 avg)",
  };
}

export function getFacilitiesData() {
  return {
    arena: "Desert Financial Arena",
    renovationBudget: "$100M",
    funding: "System revenue bonds (pending ABOR approval)",
    phases: [
      { phase: "Phase 1", timeline: "May 2026", details: "New court, 729 padded lower-bowl seats w/ cupholders, 200 wider seats, 4 courtside seats" },
      { phase: "Phase 2", timeline: "After 2026-27 season", details: "Renovated restrooms, 2 new bathrooms, new sound system" },
      { phase: "Phase 3", timeline: "Summer 2027", details: "Court-level club, premium seating access, upgraded concessions, upgraded locker rooms, center-court video board, ribbon boards" },
    ],
    completion: "December 2029",
    currentCapacity: 14198,
    age: "51 years old (built 1975)",
  };
}

// ============ CHAMPIONSHIP BENCHMARK ============
export function getChampionshipBenchmark() {
  return {
    bennettPeak: {
      season: "2022-23",
      kenpom: 7,
      record: "26-7",
      context: "Best KenPom finish ever for SMC. Would have been competitive as a 3-4 seed in any conference tournament.",
    },
    big12Champions: [
      { season: "2025-26", team: "Arizona", kenpom: 10, record: "28-5" },
      { season: "2024-25", team: "Iowa State", kenpom: 4, record: "29-7" },
      { season: "2024-25", team: "Houston", kenpom: 2, record: "33-5" },
    ],
    projectedTrajectory: [
      { year: "Year 1 (2026-27)", wins: "16-20", bigTwelve: "6-12 to 8-10", kenpom: "50-75", notes: "Roster transition. Core of SMC follows + ASU returners. Pack-line defense installs fast. Offense takes longer." },
      { year: "Year 2 (2027-28)", wins: "20-24", bigTwelve: "9-9 to 11-7", kenpom: "30-50", notes: "Bennett's development model kicks in. International pipeline starts producing. NCAA Tournament contender." },
      { year: "Year 3 (2028-29)", wins: "23-28", bigTwelve: "11-7 to 14-4", kenpom: "15-35", notes: "Full Bennett system. DFA renovation Phase 3 complete. Top-half Big 12 finisher. NCAA Tournament 5-8 seed range." },
    ],
  };
}

// ============ NIKOZA WAR VALUATION ENGINE ============
// Adapted from Nik Oza's Bottom-Up WAR framework (nikoza2.substack.com)
// 7-input model: target quality, budget, replacement level, replacement salary,
// rotation size, player projected impact, player projected minutes

export interface WARConfig {
  targetQuality: number;      // KenPom AdjEM target (e.g., +12 for Big 12 ~50th)
  rosterBudget: number;       // Total NIL spend in dollars
  replacementImpact: number;  // Per-100-poss net impact of replacement player (-1.0 consensus)
  replacementSalary: number;  // Cost of replacement player ($0 = scholarship only)
  rotationSize: number;       // Injury-adjusted rotation spots (~8)
  coachingEffect: number;     // Bennett coaching bump (estimated +3 to +5)
}

export interface WARValuation {
  name: string;
  pos: string;
  projectedImpact: number;     // Per-100-poss net impact estimate
  projectedMPG: number;
  marginalContribution: number; // WAR-equivalent quality points
  dollarValue: number;          // Calculated fair value
  marketPrice: string;          // Estimated market ask
  surplus: string;              // Value vs market (positive = bargain)
  optionValue: string;          // Young player upside flag
  systemFit: number;            // 0-100 Bennett system fit score
  systemFitNotes: string;
}

// Default ASU 2026-27 WAR config
export function getASUWARConfig(): WARConfig {
  return {
    targetQuality: 12.0,       // KenPom ~50th, realistic Year 1 Bennett
    rosterBudget: 5500000,     // $5.5M estimated (Sun Angel Collective + Harden)
    replacementImpact: -1.0,   // Consensus from 3 P5 sources per Oza
    replacementSalary: 0,      // Scholarship only
    rotationSize: 8,           // Standard
    coachingEffect: 4.0,       // Bennett = elite coach, +4 estimated
  };
}

// Estimate per-100-poss impact from box score stats
// Rough BPM proxy: (PPG * 1.0 + RPG * 0.7 + APG * 1.2 + SPG * 1.5 + BPG * 1.0) / MPG * 40 - calibration
function estimateImpact(ppg: number, rpg: number, apg: number, mpg: number): number {
  if (mpg === 0) return -2.0;
  const per40 = ((ppg + rpg * 0.7 + apg * 1.5) / mpg) * 40;
  // Calibrate: average D1 starter ~15 per40 → ~0 impact; elite ~25+ → ~+8
  return (per40 - 15) * 0.8;
}

// Bennett system fit scoring
function calcSystemFit(pos: string, origin: string, ppg: number, rpg: number, apg: number, height: string): { score: number; notes: string } {
  let score = 50; // baseline
  const notes: string[] = [];

  // International players fit Bennett's model
  if (origin === "International" || origin === "SMC Follow") { score += 20; notes.push("Intl/SMC pipeline fit"); }

  // Pack-line defense rewards size and rebounding
  const heightInches = parseInt(height.split("-")[0]) * 12 + parseInt(height.split("-")[1] || "0");
  if (heightInches >= 78) { score += 10; notes.push("Size for pack-line"); } // 6-6+
  if (rpg >= 5) { score += 10; notes.push("Elite rebounder (Bennett top-5 OR%)"); }

  // Princeton offense rewards passing
  if (apg >= 3) { score += 10; notes.push("Playmaker for Princeton motion"); }

  // Low-usage efficiency players thrive in Bennett system
  if (ppg > 0 && ppg <= 12) { score += 5; notes.push("Role-player efficiency profile"); }
  if (ppg > 15) { score += 5; notes.push("Alpha scorer (needed in Big 12)"); }

  // Development-model players (freshmen/sophomores)
  if (origin === "HS Recruit") { score += 5; notes.push("Development model candidate"); }

  return { score: Math.min(score, 100), notes: notes.join("; ") };
}

export function calculateWARValuations(config?: WARConfig): WARValuation[] {
  const c = config || getASUWARConfig();
  const targets = get2627Outlook();

  // Core Nikoza formula
  const marginalQuality = c.targetQuality - (c.replacementImpact * (c.rotationSize - 3)); // 3 starter spots need quality
  const adjustedQuality = marginalQuality - c.coachingEffect; // Bennett coaching reduces quality needed from roster
  const costPerPoint = c.rosterBudget / Math.max(adjustedQuality, 1);

  return targets.map(t => {
    const projMPG = t.ppg > 15 ? 32 : t.ppg > 10 ? 28 : t.ppg > 5 ? 20 : t.ppg > 0 ? 15 : 12;
    const impact = t.ppg > 0 ? estimateImpact(t.ppg, t.rpg, t.apg, projMPG) : -0.5; // HS recruit estimate
    const contribution = (impact - c.replacementImpact) * (projMPG / 40);
    const dollarValue = Math.max(contribution * costPerPoint, 0);

    const fit = calcSystemFit(t.pos, t.type, t.ppg, t.rpg, t.apg, t.height);

    // Market price estimates based on production tier
    let marketPrice = "$0 (scholarship)";
    let surplus = "N/A";
    if (t.ppg >= 18) { marketPrice = "$1.5-2.5M"; surplus = dollarValue > 2000000 ? "Bargain" : dollarValue > 1000000 ? "Fair" : "Overpay risk"; }
    else if (t.ppg >= 13) { marketPrice = "$600K-1.2M"; surplus = dollarValue > 900000 ? "Bargain" : dollarValue > 500000 ? "Fair" : "Overpay risk"; }
    else if (t.ppg >= 8) { marketPrice = "$200-500K"; surplus = dollarValue > 350000 ? "Bargain" : "Fair"; }
    else if (t.ppg >= 3) { marketPrice = "$50-150K"; surplus = "Development value"; }
    else { marketPrice = "$0-50K"; surplus = "Option value"; }

    // Option value for young players (Marc's identified gap in Oza framework)
    let optionValue = "Low";
    if (t.type === "HS Recruit") optionValue = "Very High (Oza undervalues)";
    else if (t.type === "Returning ASU" && t.ppg > 0 && t.ppg < 10) optionValue = "High (development upside)";
    else if (t.type === "SMC Follow" && t.ppg >= 15) optionValue = "Moderate (proven but system change)";

    return {
      name: t.name,
      pos: t.pos,
      projectedImpact: Math.round(impact * 10) / 10,
      projectedMPG: projMPG,
      marginalContribution: Math.round(contribution * 100) / 100,
      dollarValue: Math.round(dollarValue),
      marketPrice,
      surplus,
      optionValue,
      systemFit: fit.score,
      systemFitNotes: fit.notes,
    };
  });
}

// Sensitivity analysis: how valuation changes with different inputs
export function getWARSensitivity() {
  const base = getASUWARConfig();
  const baseVals = calculateWARValuations(base);
  const murauskas = baseVals.find(v => v.name === "Paulius Murauskas")!;

  return {
    playerName: "Paulius Murauskas",
    baseValue: murauskas.dollarValue,
    scenarios: [
      { label: "Replacement -2.0 (conservative)", config: { ...base, replacementImpact: -2.0 }, description: "Lower replacement level increases value of all players" },
      { label: "Replacement 0.0 (generous)", config: { ...base, replacementImpact: 0.0 }, description: "Higher replacement level means less marginal value" },
      { label: "Budget $8M (increased NIL)", config: { ...base, rosterBudget: 8000000 }, description: "If ASU boosters step up post-Bennett hire" },
      { label: "Budget $3M (constrained)", config: { ...base, rosterBudget: 3000000 }, description: "If NIL dollars don't materialize" },
      { label: "Target +18 (ambitious Y1)", config: { ...base, targetQuality: 18 }, description: "Aiming for KenPom ~30, very aggressive" },
      { label: "Target +8 (conservative Y1)", config: { ...base, targetQuality: 8 }, description: "Just trying to be competitive" },
      { label: "No coaching effect", config: { ...base, coachingEffect: 0 }, description: "Removes Bennett coaching bump" },
    ].map(s => ({
      label: s.label,
      description: s.description,
      value: calculateWARValuations(s.config).find(v => v.name === "Paulius Murauskas")?.dollarValue || 0,
    })),
  };
}

// ============ ROSTER COMPOSITION ANALYSIS ============
export function getRosterComposition() {
  const roster = getRoster2526();
  const total = roster.filter(p => p.gp > 0);
  const totalMin = total.reduce((a, p) => a + p.mpg * p.gp, 0);

  const byOrigin = (origin: string) => {
    const players = total.filter(p => p.origin === origin);
    const mins = players.reduce((a, p) => a + p.mpg * p.gp, 0);
    return { count: players.length, minPct: Math.round((mins / totalMin) * 100), ppg: players.reduce((a, p) => a + p.ppg, 0) };
  };

  return {
    hsRecruits: byOrigin("HS Recruit"),
    transfers1x: byOrigin("1x Transfer"),
    transfers2x: byOrigin("2x+ Transfer"),
    international: byOrigin("International"),
  };
}
