// Generate static data.json from seed logic (no SQLite needed)
// Seeded random for reproducibility
let seed = 42;
function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
function randInt(min, max) { return min + Math.floor(rand() * (max - min + 1)); }

const teams = [
  { id: 1, name: "MoKan Elite", program: "MoKan Basketball", city: "Kansas City", state: "MO", circuit: "EYBL", logo_url: null, created_at: "2026-01-01T00:00:00Z" },
  { id: 2, name: "Team CP3", program: "CP3 Basketball", city: "Winston-Salem", state: "NC", circuit: "EYBL", logo_url: null, created_at: "2026-01-01T00:00:00Z" },
  { id: 3, name: "Nightrydas Elite", program: "Nightrydas", city: "Bronx", state: "NY", circuit: "EYBL", logo_url: null, created_at: "2026-01-01T00:00:00Z" },
  { id: 4, name: "Brad Beal Elite", program: "BBE Basketball", city: "St. Louis", state: "MO", circuit: "EYBL", logo_url: null, created_at: "2026-01-01T00:00:00Z" },
  { id: 5, name: "Team Final", program: "Final Club Basketball", city: "Philadelphia", state: "PA", circuit: "EYBL", logo_url: null, created_at: "2026-01-01T00:00:00Z" },
  { id: 6, name: "Nike Team Florida", program: "Nike Florida", city: "Orlando", state: "FL", circuit: "EYBL", logo_url: null, created_at: "2026-01-01T00:00:00Z" },
  { id: 7, name: "Expressions Elite", program: "Expressions Basketball", city: "Boston", state: "MA", circuit: "EYBL", logo_url: null, created_at: "2026-01-01T00:00:00Z" },
  { id: 8, name: "EYBL Indy", program: "Indiana Elite", city: "Indianapolis", state: "IN", circuit: "EYBL", logo_url: null, created_at: "2026-01-01T00:00:00Z" },
  { id: 9, name: "Houston Hoops", program: "Houston Hoops BBall", city: "Houston", state: "TX", circuit: "EYBL", logo_url: null, created_at: "2026-01-01T00:00:00Z" },
  { id: 10, name: "Seattle Rotary", program: "Rotary Select", city: "Seattle", state: "WA", circuit: "EYBL", logo_url: null, created_at: "2026-01-01T00:00:00Z" },
  { id: 11, name: "Georgia Stars", program: "Georgia Stars AAU", city: "Atlanta", state: "GA", circuit: "EYBL", logo_url: null, created_at: "2026-01-01T00:00:00Z" },
  { id: 12, name: "Compton Magic", program: "Magic Elite", city: "Compton", state: "CA", circuit: "EYBL", logo_url: null, created_at: "2026-01-01T00:00:00Z" },
];

const playerDefs = [
  { first: "Jaylen", last: "Carter", team: 1, pos: "PG", height: "6'2", weight: 185, year: 2026, hs: "Blue Valley North", city: "Overland Park", state: "KS", stars: 5, rank: 3 },
  { first: "Marcus", last: "Thompson", team: 1, pos: "SF", height: "6'7", weight: 205, year: 2026, hs: "Rockhurst", city: "Kansas City", state: "MO", stars: 4, rank: 28 },
  { first: "Devon", last: "Williams", team: 1, pos: "C", height: "6'10", weight: 230, year: 2027, hs: "Bishop Miege", city: "Shawnee Mission", state: "KS", stars: 4, rank: 45 },
  { first: "Andre", last: "Mitchell", team: 1, pos: "SG", height: "6'4", weight: 190, year: 2026, hs: "Park Hill", city: "Kansas City", state: "MO", stars: 3, rank: 89 },
  { first: "Isaiah", last: "Washington", team: 2, pos: "PG", height: "6'3", weight: 180, year: 2026, hs: "Word of God", city: "Raleigh", state: "NC", stars: 5, rank: 7 },
  { first: "Terrence", last: "Davis Jr", team: 2, pos: "SG", height: "6'5", weight: 195, year: 2026, hs: "Greensboro Day", city: "Greensboro", state: "NC", stars: 4, rank: 22 },
  { first: "Jordan", last: "Baker", team: 2, pos: "PF", height: "6'8", weight: 215, year: 2027, hs: "Durham Academy", city: "Durham", state: "NC", stars: 4, rank: 38 },
  { first: "Cam", last: "Robinson", team: 2, pos: "SF", height: "6'6", weight: 200, year: 2026, hs: "Oak Hill Academy", city: "Mouth of Wilson", state: "VA", stars: 3, rank: 72 },
  { first: "Jalen", last: "Cruz", team: 3, pos: "SG", height: "6'5", weight: 200, year: 2026, hs: "Archbishop Stepinac", city: "White Plains", state: "NY", stars: 5, rank: 1 },
  { first: "Darius", last: "Monroe", team: 3, pos: "PG", height: "6'1", weight: 175, year: 2026, hs: "Christ the King", city: "Middle Village", state: "NY", stars: 4, rank: 18 },
  { first: "Tyrese", last: "Grant", team: 3, pos: "PF", height: "6'9", weight: 225, year: 2027, hs: "Long Island Lutheran", city: "Brookville", state: "NY", stars: 4, rank: 32 },
  { first: "Khalil", last: "Edwards", team: 3, pos: "C", height: "6'11", weight: 240, year: 2026, hs: "St. Raymond's", city: "Bronx", state: "NY", stars: 5, rank: 5 },
  { first: "Brandon", last: "Scott", team: 4, pos: "SG", height: "6'4", weight: 190, year: 2026, hs: "Chaminade", city: "St. Louis", state: "MO", stars: 4, rank: 25 },
  { first: "Malik", last: "Johnson", team: 4, pos: "PG", height: "6'0", weight: 170, year: 2027, hs: "Vashon", city: "St. Louis", state: "MO", stars: 3, rank: 95 },
  { first: "Xavier", last: "Hughes", team: 4, pos: "SF", height: "6'7", weight: 210, year: 2026, hs: "CBC", city: "St. Louis", state: "MO", stars: 4, rank: 41 },
  { first: "Amir", last: "Simmons", team: 5, pos: "PF", height: "6'8", weight: 220, year: 2026, hs: "Neumann-Goretti", city: "Philadelphia", state: "PA", stars: 5, rank: 8 },
  { first: "Chris", last: "Wallace", team: 5, pos: "PG", height: "6'2", weight: 180, year: 2026, hs: "Imhotep Charter", city: "Philadelphia", state: "PA", stars: 4, rank: 30 },
  { first: "Zion", last: "Taylor", team: 5, pos: "C", height: "7'0", weight: 245, year: 2027, hs: "Roman Catholic", city: "Philadelphia", state: "PA", stars: 5, rank: 4 },
  { first: "DeVonte", last: "Harris", team: 6, pos: "SG", height: "6'5", weight: 195, year: 2026, hs: "Montverde Academy", city: "Montverde", state: "FL", stars: 5, rank: 2 },
  { first: "Jayden", last: "Brooks", team: 6, pos: "PG", height: "6'3", weight: 185, year: 2026, hs: "IMG Academy", city: "Bradenton", state: "FL", stars: 4, rank: 15 },
  { first: "Trevon", last: "Lewis", team: 6, pos: "SF", height: "6'7", weight: 205, year: 2027, hs: "Windermere Prep", city: "Orlando", state: "FL", stars: 4, rank: 35 },
  { first: "Miles", last: "Foster", team: 7, pos: "PG", height: "6'1", weight: 175, year: 2026, hs: "Brewster Academy", city: "Wolfeboro", state: "NH", stars: 4, rank: 20 },
  { first: "Nate", last: "Collins", team: 7, pos: "SF", height: "6'6", weight: 200, year: 2026, hs: "Cushing Academy", city: "Ashburnham", state: "MA", stars: 3, rank: 68 },
  { first: "Trey", last: "Patterson", team: 8, pos: "PF", height: "6'8", weight: 215, year: 2026, hs: "Cathedral", city: "Indianapolis", state: "IN", stars: 4, rank: 27 },
  { first: "Eric", last: "Adams", team: 8, pos: "SG", height: "6'3", weight: 185, year: 2027, hs: "Park Tudor", city: "Indianapolis", state: "IN", stars: 3, rank: 78 },
  { first: "Jace", last: "Williams", team: 9, pos: "SG", height: "6'5", weight: 195, year: 2026, hs: "Westbury Christian", city: "Houston", state: "TX", stars: 5, rank: 6 },
  { first: "Kendrick", last: "Moore", team: 9, pos: "PG", height: "6'2", weight: 180, year: 2026, hs: "Fort Bend Elkins", city: "Missouri City", state: "TX", stars: 4, rank: 33 },
  { first: "Desmond", last: "Jackson", team: 9, pos: "C", height: "6'10", weight: 235, year: 2027, hs: "Bellaire", city: "Houston", state: "TX", stars: 3, rank: 82 },
  { first: "Noah", last: "Chen", team: 10, pos: "PG", height: "6'3", weight: 180, year: 2026, hs: "Seattle Prep", city: "Seattle", state: "WA", stars: 4, rank: 24 },
  { first: "Kai", last: "Anderson", team: 10, pos: "SF", height: "6'8", weight: 210, year: 2026, hs: "Eastside Catholic", city: "Sammamish", state: "WA", stars: 4, rank: 19 },
  { first: "Jaylen", last: "Thomas", team: 11, pos: "PF", height: "6'9", weight: 220, year: 2026, hs: "Milton", city: "Alpharetta", state: "GA", stars: 5, rank: 10 },
  { first: "Derrick", last: "Stone", team: 11, pos: "SG", height: "6'4", weight: 190, year: 2026, hs: "Wheeler", city: "Marietta", state: "GA", stars: 3, rank: 65 },
  { first: "Marcus", last: "Green", team: 12, pos: "PG", height: "6'2", weight: 180, year: 2026, hs: "Sierra Canyon", city: "Chatsworth", state: "CA", stars: 5, rank: 9 },
  { first: "Tyler", last: "Washington", team: 12, pos: "C", height: "7'1", weight: 250, year: 2027, hs: "Mater Dei", city: "Santa Ana", state: "CA", stars: 4, rank: 14 },
];

const players = playerDefs.map((p, i) => ({
  id: i + 1,
  first_name: p.first,
  last_name: p.last,
  team_id: p.team,
  position: p.pos,
  height: p.height,
  weight: p.weight,
  class_year: p.year,
  high_school: p.hs,
  hometown: p.city,
  state: p.state,
  star_rating: p.stars,
  ranking: p.rank,
  status: "Active",
  photo_url: null,
  created_at: "2026-01-01T00:00:00Z",
}));

// Sessions
const sessions = [
  { name: "Session I - Hampton", venue: "Hampton Convention Center", city: "Hampton", state: "VA" },
  { name: "Session II - Indianapolis", venue: "Pacers Athletic Center", city: "Indianapolis", state: "IN" },
  { name: "Session III - Atlanta", venue: "LakePoint Champions Center", city: "Atlanta", state: "GA" },
  { name: "Session IV - Kansas City", venue: "Kansas City Convention Center", city: "Kansas City", state: "MO" },
];
const gameDates = [
  ["2026-04-18", "2026-04-19", "2026-04-20"],
  ["2026-05-09", "2026-05-10", "2026-05-11"],
  ["2026-05-23", "2026-05-24", "2026-05-25"],
  ["2026-06-06", "2026-06-07", "2026-06-08"],
];
// team indices are 0-based here but team_ids are 1-based
const matchups = [
  [0,2],[1,3],[4,5],[6,7],[8,9],[10,11],[0,5],[2,4],[1,8],[3,10],
  [1,0],[3,2],[5,4],[7,6],[9,8],[11,10],[0,10],[5,2],[1,7],[8,4],
  [2,1],[0,4],[5,3],[8,6],[10,9],[11,7],
  [0,11],[1,5],[2,8],[3,6],[4,10],[7,9],
];

const games = [];
let gameId = 1;
let matchIdx = 0;
for (let s = 0; s < sessions.length; s++) {
  const session = sessions[s];
  const isUpcoming = s === 3;
  const gamesPerSession = s < 2 ? 10 : 6;
  for (let g = 0; g < gamesPerSession && matchIdx < matchups.length; g++) {
    const [home, away] = matchups[matchIdx];
    const dateIdx = Math.min(g % 3, gameDates[s].length - 1);
    const date = gameDates[s][dateIdx];
    let homeScore = null, awayScore = null, status = "Scheduled";
    if (!isUpcoming) {
      homeScore = 55 + randInt(0, 34);
      awayScore = 55 + randInt(0, 34);
      status = "Final";
    }
    games.push({
      id: gameId, home_team_id: home + 1, away_team_id: away + 1,
      session_name: session.name, venue: session.venue, city: session.city, state: session.state,
      game_date: date, home_score: homeScore, away_score: awayScore, status,
      created_at: "2026-01-01T00:00:00Z",
    });
    gameId++;
    matchIdx++;
  }
}

// Team -> player indices mapping (0-based)
const teamPlayers = {};
playerDefs.forEach((p, i) => {
  const tIdx = p.team - 1; // convert to 0-based team index
  if (!teamPlayers[tIdx]) teamPlayers[tIdx] = [];
  teamPlayers[tIdx].push(i);
});

const player_stats = [];
let statId = 1;
matchIdx = 0;
for (let s = 0; s < sessions.length; s++) {
  const isUpcoming = s === 3;
  const gamesPerSession = s < 2 ? 10 : 6;
  for (let g = 0; g < gamesPerSession && matchIdx < matchups.length; g++) {
    if (isUpcoming) { matchIdx++; continue; }
    const [homeTeam, awayTeam] = matchups[matchIdx];
    const gId = matchIdx + 1; // game id
    for (const teamIdx of [homeTeam, awayTeam]) {
      const pIndices = teamPlayers[teamIdx] || [];
      for (const pIdx of pIndices) {
        const p = playerDefs[pIdx];
        const stars = p.stars;
        const baseMin = 20 + stars * 4 + randInt(0, 7);
        const reb = (p.pos === "C" || p.pos === "PF") ? 4 + randInt(0, 7) : 1 + randInt(0, 4);
        const ast = (p.pos === "PG") ? 3 + randInt(0, 6) : 1 + randInt(0, 3);
        const stl = randInt(0, 3);
        const blk = (p.pos === "C" || p.pos === "PF") ? randInt(0, 3) : randInt(0, 1);
        const to = 1 + randInt(0, 3);
        const fga = 8 + randInt(0, 9);
        const fgm = Math.floor(fga * (0.35 + rand() * 0.25));
        const tpa = 2 + randInt(0, 5);
        const tpm = Math.floor(tpa * (0.25 + rand() * 0.2));
        const fta = 2 + randInt(0, 7);
        const ftm = Math.floor(fta * (0.6 + rand() * 0.3));
        const fouls = 1 + randInt(0, 3);
        const pts = fgm * 2 + tpm + ftm;
        player_stats.push({
          id: statId++, player_id: pIdx + 1, game_id: gId,
          minutes: baseMin, points: pts, rebounds: reb, assists: ast,
          steals: stl, blocks: blk, turnovers: to,
          fg_made: fgm, fg_attempted: fga, three_made: tpm, three_attempted: tpa,
          ft_made: ftm, ft_attempted: fta, fouls,
          created_at: "2026-01-01T00:00:00Z",
        });
      }
    }
    matchIdx++;
  }
}

// Scouting reports
const scouts = ["Coach Davis", "Scout Williams", "Analyst Brown", "Coach Martinez", "Scout Johnson"];
const reportData = [
  { pIdx: 8, scout: 0, og: "A+", off: "A+", def: "A", ath: "A+", iq: "A", str: "Elite shot creation. Can score from all three levels.", weak: "Can be turnover-prone in transition.", notes: "Dominant performance. NBA-caliber talent.", proj: "Top 5 NBA Draft Pick", comp: "Bradley Beal / Devin Booker hybrid" },
  { pIdx: 0, scout: 1, og: "A", off: "A", def: "B+", ath: "A-", iq: "A+", str: "Elite floor general. Exceptional court vision.", weak: "Could add more muscle. Outside shot is streaky.", notes: "8 assists to 2 turnovers. True point guard.", proj: "High Major Starter, potential lottery pick", comp: "Chris Paul with more athleticism" },
  { pIdx: 18, scout: 2, og: "A+", off: "A+", def: "A-", ath: "A+", iq: "A-", str: "Explosive athleticism. Elite scorer. Knockdown three-point shooter.", weak: "Sometimes settles for jump shots.", notes: "28 points on efficient shooting. Special talent.", proj: "One-and-done, potential #1 pick", comp: "Young Kobe Bryant" },
  { pIdx: 17, scout: 0, og: "A", off: "B+", def: "A+", ath: "A+", iq: "A", str: "Elite rim protection. Soft touch around basket.", weak: "Perimeter skills still developing.", notes: "6 blocks and 12 rebounds. Franchise-caliber center.", proj: "Immediate impact college center, NBA lottery", comp: "Young Anthony Davis" },
  { pIdx: 15, scout: 3, og: "A", off: "A-", def: "A", ath: "A", iq: "B+", str: "Versatile forward with a complete game.", weak: "Ball handling in traffic.", notes: "18/9/4 stat line. Matchup nightmare.", proj: "High Major starter, possible first round pick", comp: "Tobias Harris type" },
  { pIdx: 25, scout: 4, og: "A", off: "A+", def: "B", ath: "A", iq: "A-", str: "Smooth shooting stroke. High release point.", weak: "Lateral quickness on defense.", notes: "Hit 5 threes tonight. Best shooter in the class.", proj: "High Major impact player", comp: "Klay Thompson lite" },
  { pIdx: 30, scout: 1, og: "A-", off: "A", def: "B+", ath: "A-", iq: "A", str: "Strong body at the 4. Motor never stops.", weak: "Lateral footspeed.", notes: "20 and 10 on 8-12 shooting. College ready body.", proj: "Power 5 starter, potential 2nd round pick", comp: "Julius Randle" },
  { pIdx: 32, scout: 2, og: "A", off: "A-", def: "A-", ath: "A", iq: "A", str: "Complete point guard. Sees plays before they develop.", weak: "Size limits defensive upside.", notes: "Masterclass in point guard play. Poise off the charts.", proj: "Elite program PG, potential lottery pick", comp: "Young Jalen Brunson" },
  { pIdx: 11, scout: 0, og: "A+", off: "A-", def: "A+", ath: "A+", iq: "A-", str: "Dominant defensive presence. Athletic freak with 7'4 wingspan.", weak: "Post moves still raw.", notes: "Most physically impressive player in the session.", proj: "One-and-done, top 10 pick", comp: "Chet Holmgren with more power" },
  { pIdx: 19, scout: 4, og: "A-", off: "A", def: "B+", ath: "A-", iq: "A", str: "Heady point guard. Shifty ball handler.", weak: "Not the most explosive athlete.", notes: "Runs the team efficiently. Very few mistakes.", proj: "Power 5 starting PG", comp: "Jose Alvarado with better shooting" },
];

const scouting_reports = reportData.map((r, i) => ({
  id: i + 1,
  player_id: r.pIdx + 1,
  game_id: 1,
  scout_name: scouts[r.scout],
  overall_grade: r.og,
  offensive_grade: r.off,
  defensive_grade: r.def,
  athleticism_grade: r.ath,
  basketball_iq_grade: r.iq,
  strengths: r.str,
  weaknesses: r.weak,
  notes: r.notes,
  projection: r.proj,
  comparison: r.comp,
  created_at: "2026-03-08T12:00:00Z",
}));

// Scholastic data
const majors = ["Business", "Communications", "Sports Management", "Kinesiology", "Undecided", "Psychology", "Computer Science", "Liberal Arts"];
const standingsList = ["Good Standing", "Good Standing", "Good Standing", "Honor Roll", "Honor Roll", "Dean's List"];
const scholastic_data = playerDefs.map((p, i) => {
  const stars = p.stars;
  const baseGpa = 2.5 + rand() * 1.5;
  const gpa = Math.round(Math.min(4.0, baseGpa) * 100) / 100;
  const coreGpa = Math.round((gpa - 0.1 + rand() * 0.2) * 100) / 100;
  const sat = stars >= 4 ? 1050 + randInt(0, 299) : 900 + randInt(0, 249);
  const act = Math.floor(sat / 50) + randInt(0, 3);
  const eligible = gpa >= 2.3 && coreGpa >= 2.3 ? 1 : 0;
  const coreCompleted = 10 + randInt(0, 6);
  const standing = standingsList[randInt(0, standingsList.length - 1)];
  const major = majors[randInt(0, majors.length - 1)];
  const honorsAp = randInt(0, 5);
  const classSize = 200 + randInt(0, 399);
  const classRank = Math.floor(classSize * (0.05 + rand() * 0.6));
  const hasTranscript = rand() > 0.3 ? 1 : 0;
  const clearinghouseId = eligible && rand() > 0.2 ? `NCAA-2026${String(i + 1).padStart(5, "0")}` : null;
  return {
    id: i + 1, player_id: i + 1, gpa, gpa_scale: 4.0, sat_score: sat, act_score: act,
    ncaa_eligible: eligible, core_gpa: coreGpa, core_courses_completed: coreCompleted,
    core_courses_required: 16, academic_standing: standing, intended_major: major,
    honors_ap_courses: honorsAp, class_rank: classRank, class_size: classSize,
    transcript_on_file: hasTranscript, ncaa_clearinghouse_id: clearinghouseId,
    updated_at: "2026-03-08T12:00:00Z",
  };
});

// NextUp profiles
const nextup_profiles = [];
playerDefs.forEach((p, i) => {
  if (p.stars >= 3 || rand() > 0.4) {
    const nextupId = `nu_${p.first.toLowerCase()}${p.last.toLowerCase()}${p.year}`;
    nextup_profiles.push({
      id: nextup_profiles.length + 1,
      player_id: i + 1,
      nextup_id: nextupId,
      nextup_url: `https://app.nextup.world/profile/${nextupId}`,
      profile_verified: p.stars >= 4 ? 1 : (rand() > 0.5 ? 1 : 0),
      highlights_count: p.stars * 3 + randInt(0, 14),
      followers: p.stars * 200 + randInt(0, 1999),
      last_synced: "2026-03-08T12:00:00Z",
      created_at: "2026-01-01T00:00:00Z",
    });
  }
});

// Physical metrics
function heightInches(h) { const m = h.match(/(\d+)'(\d+)/); return m ? parseInt(m[1]) * 12 + parseInt(m[2]) : 72; }
function inchesToFeetStr(inches) { return `${Math.floor(inches / 12)}'${inches % 12}`; }
const posPhys = { PG: { wingAdj: 2, vertBase: 36, speedBase: 18.5 }, SG: { wingAdj: 3, vertBase: 37, speedBase: 18.0 }, SF: { wingAdj: 4, vertBase: 35, speedBase: 17.5 }, PF: { wingAdj: 5, vertBase: 33, speedBase: 17.0 }, C: { wingAdj: 6, vertBase: 31, speedBase: 16.0 } };

const physical_metrics = playerDefs.map((p, i) => {
  const phys = posPhys[p.pos] || posPhys.SF;
  const h = heightInches(p.height);
  const wingInches = h + phys.wingAdj + randInt(-1, 2);
  const reachInches = h + 6 + randInt(0, 3);
  return {
    id: i + 1, player_id: i + 1,
    wingspan: inchesToFeetStr(wingInches),
    standing_reach: inchesToFeetStr(reachInches),
    hand_length: +(8.5 + rand() * 2.5).toFixed(1),
    hand_width: +(8.0 + rand() * 3).toFixed(1),
    body_fat_pct: +(5 + rand() * 7).toFixed(1),
    vertical_jump: +(phys.vertBase + rand() * 8 - 2).toFixed(1),
    max_vertical: +(phys.vertBase + rand() * 8 + 2).toFixed(1),
    lane_agility: +(10.5 + rand() * 2).toFixed(2),
    sprint_3qt: +(3.1 + rand() * 0.5).toFixed(2),
    speed_mph: +(phys.speedBase + rand() * 2 - 1).toFixed(1),
    shuttle_run: +(2.8 + rand() * 0.6).toFixed(2),
    bench_press_reps: randInt(0, 11),
    measured_height_shoes: inchesToFeetStr(h + 1),
    measured_height_no_shoes: inchesToFeetStr(h),
    measured_weight: p.weight,
    updated_at: "2026-03-08T12:00:00Z",
  };
});

// NBA projections
const nbaComps = {
  PG: { primary: ["Ja Morant", "Trae Young", "Tyrese Haliburton", "Jalen Brunson", "De'Aaron Fox", "Fred VanVleet"], secondary: ["Marcus Smart", "Derrick White", "Immanuel Quickley", "Tre Jones", "Dennis Smith Jr"], archetypes: ["Score-first PG", "Floor General", "Two-way PG", "Combo Guard", "Playmaking Lead Guard"], roles: ["Starting PG", "Sixth Man", "Rotational PG", "Bench Facilitator", "Two-way Player"] },
  SG: { primary: ["Devin Booker", "Anthony Edwards", "Donovan Mitchell", "Jaylen Brown", "Desmond Bane", "Anfernee Simons"], secondary: ["Austin Reaves", "Malik Monk", "Quentin Grimes", "Cam Thomas", "Gradey Dick"], archetypes: ["Elite Scorer", "3-and-D Wing", "Shot Creator", "Two-way Guard", "Sharpshooter"], roles: ["Franchise Scorer", "Starting SG", "Sixth Man Scorer", "3-and-D Starter", "Rotation Wing"] },
  SF: { primary: ["Jayson Tatum", "Paolo Banchero", "Scottie Barnes", "Brandon Ingram", "Mikal Bridges", "OG Anunoby"], secondary: ["Herb Jones", "Dillon Brooks", "Keldon Johnson", "Jalen Williams", "Aaron Wiggins"], archetypes: ["Two-way Wing", "Point Forward", "Versatile Scorer", "3-and-D Wing", "Switchable Defender"], roles: ["Franchise Wing", "Starting SF", "Two-way Starter", "Versatile Role Player", "Defensive Specialist"] },
  PF: { primary: ["Giannis Antetokounmpo", "Julius Randle", "Evan Mobley", "Jaren Jackson Jr", "Zion Williamson", "Scottie Barnes"], secondary: ["Jabari Smith Jr", "Jonathan Isaac", "Keegan Murray", "Jalen Smith", "Onyeka Okongwu"], archetypes: ["Stretch Four", "Power Forward", "Modern Big", "Versatile Forward", "Two-way Big"], roles: ["Franchise PF", "Starting PF", "Stretch Four Starter", "Rotation Big", "Defensive Anchor"] },
  C: { primary: ["Victor Wembanyama", "Chet Holmgren", "Bam Adebayo", "Evan Mobley", "Anthony Davis", "Jarrett Allen"], secondary: ["Walker Kessler", "Mark Williams", "Jalen Duren", "Kel'el Ware", "Dereck Lively II"], archetypes: ["Rim Protector", "Two-way Center", "Stretch Five", "Paint Beast", "Modern Center"], roles: ["Franchise Center", "Starting C", "Defensive Anchor", "Rotation Center", "Two-way Starter"] },
};

const nba_projections = playerDefs.map((p, i) => {
  const stars = p.stars;
  const comps = nbaComps[p.pos] || nbaComps.SF;
  let draftProb, round, pickRange, roleIdx;
  if (stars === 5) { draftProb = 75 + rand() * 20; round = 1; pickRange = `${1 + randInt(0,13)}-${5 + randInt(0,9)}`; roleIdx = randInt(0,1); }
  else if (stars === 4) { draftProb = 30 + rand() * 35; round = rand() > 0.4 ? 1 : 2; pickRange = `${15 + randInt(0,19)}-${25 + randInt(0,14)}`; roleIdx = 1 + randInt(0,1); }
  else { draftProb = 5 + rand() * 20; round = 2; pickRange = `${35 + randInt(0,19)}-${45 + randInt(0,14)}`; roleIdx = 2 + randInt(0,2); }
  draftProb = +draftProb.toFixed(1);
  const minYr1 = stars >= 4 ? +(12 + rand() * 18).toFixed(1) : +(5 + rand() * 12).toFixed(1);
  const minYr3 = +(minYr1 + 5 + rand() * 8).toFixed(1);
  const minPrime = +(Math.min(38, minYr3 + 3 + rand() * 5)).toFixed(1);
  const rookieSalary = round === 1 ? 3000000 + randInt(0, 7999999) : 1000000 + randInt(0, 1499999);
  const yr5Salary = round === 1 ? 15000000 + randInt(0, 19999999) : 5000000 + randInt(0, 9999999);
  const primeSalary = stars >= 4 ? 25000000 + randInt(0, 29999999) : 8000000 + randInt(0, 14999999);
  const careerEarnings = rookieSalary * 4 + yr5Salary * 3 + primeSalary * 5;
  const primaryIdx = stars >= 4 ? randInt(0,2) : 3 + randInt(0,2);
  const primary = comps.primary[primaryIdx] || comps.primary[0];
  const secondary = comps.secondary[randInt(0, comps.secondary.length - 1)];
  const similarity = +(55 + rand() * 35).toFixed(1);
  const archetype = comps.archetypes[randInt(0, comps.archetypes.length - 1)];
  const role = comps.roles[roleIdx] || comps.roles[2];
  const bustProb = stars >= 5 ? +(5 + rand() * 15).toFixed(1) : stars >= 4 ? +(15 + rand() * 20).toFixed(1) : +(30 + rand() * 30).toFixed(1);
  const allStarProb = stars >= 5 ? +(20 + rand() * 30).toFixed(1) : stars >= 4 ? +(5 + rand() * 15).toFixed(1) : +(1 + rand() * 5).toFixed(1);
  return {
    id: i + 1, player_id: i + 1, draft_probability: draftProb, projected_round: round,
    projected_pick_range: pickRange, projected_role: role,
    projected_minutes_yr1: minYr1, projected_minutes_yr3: minYr3, projected_minutes_prime: minPrime,
    projected_salary_rookie: rookieSalary, projected_salary_yr5: yr5Salary,
    projected_salary_prime: primeSalary, career_earnings_est: careerEarnings,
    nba_comparison: primary, nba_comp_similarity: similarity,
    secondary_comparison: secondary, player_archetype: archetype,
    bust_probability: bustProb, all_star_probability: allStarProb,
    updated_at: "2026-03-08T12:00:00Z",
  };
});

const data = {
  teams,
  players,
  games,
  player_stats,
  scouting_reports,
  scholastic_data,
  nextup_profiles,
  physical_metrics,
  nba_projections,
};

require("fs").writeFileSync(
  require("path").join(__dirname, "..", "src", "lib", "data.json"),
  JSON.stringify(data, null, 2)
);

console.log(`Generated data.json:`);
console.log(`  Teams: ${teams.length}`);
console.log(`  Players: ${players.length}`);
console.log(`  Games: ${games.length}`);
console.log(`  Stats: ${player_stats.length}`);
console.log(`  Reports: ${scouting_reports.length}`);
console.log(`  Scholastic: ${scholastic_data.length}`);
console.log(`  NextUp: ${nextup_profiles.length}`);
console.log(`  Physical: ${physical_metrics.length}`);
console.log(`  NBA Projections: ${nba_projections.length}`);
