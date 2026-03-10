import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "eybl-scout.db");

// Delete existing DB and start fresh
const fs = require("fs");
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    program TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    circuit TEXT NOT NULL DEFAULT 'EYBL',
    logo_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    team_id INTEGER REFERENCES teams(id),
    position TEXT NOT NULL,
    height TEXT,
    weight INTEGER,
    class_year INTEGER NOT NULL,
    high_school TEXT,
    hometown TEXT,
    state TEXT,
    star_rating INTEGER DEFAULT 0,
    ranking INTEGER,
    status TEXT DEFAULT 'Active',
    photo_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    home_team_id INTEGER REFERENCES teams(id),
    away_team_id INTEGER REFERENCES teams(id),
    session_name TEXT NOT NULL,
    venue TEXT,
    city TEXT,
    state TEXT,
    game_date TEXT NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    status TEXT DEFAULT 'Scheduled',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS player_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL REFERENCES players(id),
    game_id INTEGER NOT NULL REFERENCES games(id),
    minutes INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    rebounds INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    steals INTEGER DEFAULT 0,
    blocks INTEGER DEFAULT 0,
    turnovers INTEGER DEFAULT 0,
    fg_made INTEGER DEFAULT 0,
    fg_attempted INTEGER DEFAULT 0,
    three_made INTEGER DEFAULT 0,
    three_attempted INTEGER DEFAULT 0,
    ft_made INTEGER DEFAULT 0,
    ft_attempted INTEGER DEFAULT 0,
    fouls INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scouting_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL REFERENCES players(id),
    game_id INTEGER REFERENCES games(id),
    scout_name TEXT NOT NULL,
    overall_grade TEXT NOT NULL,
    offensive_grade TEXT,
    defensive_grade TEXT,
    athleticism_grade TEXT,
    basketball_iq_grade TEXT,
    strengths TEXT,
    weaknesses TEXT,
    notes TEXT,
    projection TEXT,
    comparison TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scholastic_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL UNIQUE REFERENCES players(id),
    gpa REAL,
    gpa_scale REAL DEFAULT 4.0,
    sat_score INTEGER,
    act_score INTEGER,
    ncaa_eligible INTEGER DEFAULT 1,
    core_gpa REAL,
    core_courses_completed INTEGER DEFAULT 0,
    core_courses_required INTEGER DEFAULT 16,
    academic_standing TEXT DEFAULT 'Good Standing',
    intended_major TEXT,
    honors_ap_courses INTEGER DEFAULT 0,
    class_rank INTEGER,
    class_size INTEGER,
    transcript_on_file INTEGER DEFAULT 0,
    ncaa_clearinghouse_id TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS nextup_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL UNIQUE REFERENCES players(id),
    nextup_id TEXT,
    nextup_url TEXT,
    profile_verified INTEGER DEFAULT 0,
    highlights_count INTEGER DEFAULT 0,
    followers INTEGER DEFAULT 0,
    last_synced TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS physical_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL UNIQUE REFERENCES players(id),
    wingspan TEXT,
    standing_reach TEXT,
    hand_length REAL,
    hand_width REAL,
    body_fat_pct REAL,
    vertical_jump REAL,
    max_vertical REAL,
    lane_agility REAL,
    sprint_3qt REAL,
    speed_mph REAL,
    shuttle_run REAL,
    bench_press_reps INTEGER,
    measured_height_shoes TEXT,
    measured_height_no_shoes TEXT,
    measured_weight INTEGER,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS nba_projections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL UNIQUE REFERENCES players(id),
    draft_probability REAL DEFAULT 0,
    projected_round INTEGER,
    projected_pick_range TEXT,
    projected_role TEXT,
    projected_minutes_yr1 REAL,
    projected_minutes_yr3 REAL,
    projected_minutes_prime REAL,
    projected_salary_rookie INTEGER,
    projected_salary_yr5 INTEGER,
    projected_salary_prime INTEGER,
    career_earnings_est INTEGER,
    nba_comparison TEXT,
    nba_comp_similarity REAL,
    secondary_comparison TEXT,
    player_archetype TEXT,
    bust_probability REAL DEFAULT 0,
    all_star_probability REAL DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
  CREATE INDEX IF NOT EXISTS idx_stats_player ON player_stats(player_id);
  CREATE INDEX IF NOT EXISTS idx_stats_game ON player_stats(game_id);
  CREATE INDEX IF NOT EXISTS idx_reports_player ON scouting_reports(player_id);
  CREATE INDEX IF NOT EXISTS idx_games_date ON games(game_date);
  CREATE INDEX IF NOT EXISTS idx_scholastic_player ON scholastic_data(player_id);
`);

// ── Seed Teams ──────────────────────────────────────────
const teams = [
  { name: "MoKan Elite", program: "MoKan Basketball", city: "Kansas City", state: "MO" },
  { name: "Team CP3", program: "CP3 Basketball", city: "Winston-Salem", state: "NC" },
  { name: "Nightrydas Elite", program: "Nightrydas", city: "Bronx", state: "NY" },
  { name: "Brad Beal Elite", program: "BBE Basketball", city: "St. Louis", state: "MO" },
  { name: "Team Final", program: "Final Club Basketball", city: "Philadelphia", state: "PA" },
  { name: "Nike Team Florida", program: "Nike Florida", city: "Orlando", state: "FL" },
  { name: "Expressions Elite", program: "Expressions Basketball", city: "Boston", state: "MA" },
  { name: "EYBL Indy", program: "Indiana Elite", city: "Indianapolis", state: "IN" },
  { name: "Houston Hoops", program: "Houston Hoops BBall", city: "Houston", state: "TX" },
  { name: "Seattle Rotary", program: "Rotary Select", city: "Seattle", state: "WA" },
  { name: "Georgia Stars", program: "Georgia Stars AAU", city: "Atlanta", state: "GA" },
  { name: "Compton Magic", program: "Magic Elite", city: "Compton", state: "CA" },
];

const insertTeam = db.prepare(
  "INSERT INTO teams (name, program, city, state) VALUES (?, ?, ?, ?)"
);

const teamIds: number[] = [];
for (const t of teams) {
  const r = insertTeam.run(t.name, t.program, t.city, t.state);
  teamIds.push(Number(r.lastInsertRowid));
}

console.log(`Seeded ${teams.length} teams`);

// ── Seed Players ────────────────────────────────────────
const players = [
  // MoKan Elite (team 0)
  { first: "Jaylen", last: "Carter", team: 0, pos: "PG", height: "6'2", weight: 185, year: 2026, hs: "Blue Valley North", city: "Overland Park", state: "KS", stars: 5, rank: 3 },
  { first: "Marcus", last: "Thompson", team: 0, pos: "SF", height: "6'7", weight: 205, year: 2026, hs: "Rockhurst", city: "Kansas City", state: "MO", stars: 4, rank: 28 },
  { first: "Devon", last: "Williams", team: 0, pos: "C", height: "6'10", weight: 230, year: 2027, hs: "Bishop Miege", city: "Shawnee Mission", state: "KS", stars: 4, rank: 45 },
  { first: "Andre", last: "Mitchell", team: 0, pos: "SG", height: "6'4", weight: 190, year: 2026, hs: "Park Hill", city: "Kansas City", state: "MO", stars: 3, rank: 89 },

  // Team CP3 (team 1)
  { first: "Isaiah", last: "Washington", team: 1, pos: "PG", height: "6'3", weight: 180, year: 2026, hs: "Word of God", city: "Raleigh", state: "NC", stars: 5, rank: 7 },
  { first: "Terrence", last: "Davis Jr", team: 1, pos: "SG", height: "6'5", weight: 195, year: 2026, hs: "Greensboro Day", city: "Greensboro", state: "NC", stars: 4, rank: 22 },
  { first: "Jordan", last: "Baker", team: 1, pos: "PF", height: "6'8", weight: 215, year: 2027, hs: "Durham Academy", city: "Durham", state: "NC", stars: 4, rank: 38 },
  { first: "Cam", last: "Robinson", team: 1, pos: "SF", height: "6'6", weight: 200, year: 2026, hs: "Oak Hill Academy", city: "Mouth of Wilson", state: "VA", stars: 3, rank: 72 },

  // Nightrydas Elite (team 2)
  { first: "Jalen", last: "Cruz", team: 2, pos: "SG", height: "6'5", weight: 200, year: 2026, hs: "Archbishop Stepinac", city: "White Plains", state: "NY", stars: 5, rank: 1 },
  { first: "Darius", last: "Monroe", team: 2, pos: "PG", height: "6'1", weight: 175, year: 2026, hs: "Christ the King", city: "Middle Village", state: "NY", stars: 4, rank: 18 },
  { first: "Tyrese", last: "Grant", team: 2, pos: "PF", height: "6'9", weight: 225, year: 2027, hs: "Long Island Lutheran", city: "Brookville", state: "NY", stars: 4, rank: 32 },
  { first: "Khalil", last: "Edwards", team: 2, pos: "C", height: "6'11", weight: 240, year: 2026, hs: "St. Raymond's", city: "Bronx", state: "NY", stars: 5, rank: 5 },

  // Brad Beal Elite (team 3)
  { first: "Brandon", last: "Scott", team: 3, pos: "SG", height: "6'4", weight: 190, year: 2026, hs: "Chaminade", city: "St. Louis", state: "MO", stars: 4, rank: 25 },
  { first: "Malik", last: "Johnson", team: 3, pos: "PG", height: "6'0", weight: 170, year: 2027, hs: "Vashon", city: "St. Louis", state: "MO", stars: 3, rank: 95 },
  { first: "Xavier", last: "Hughes", team: 3, pos: "SF", height: "6'7", weight: 210, year: 2026, hs: "CBC", city: "St. Louis", state: "MO", stars: 4, rank: 41 },

  // Team Final (team 4)
  { first: "Amir", last: "Simmons", team: 4, pos: "PF", height: "6'8", weight: 220, year: 2026, hs: "Neumann-Goretti", city: "Philadelphia", state: "PA", stars: 5, rank: 8 },
  { first: "Chris", last: "Wallace", team: 4, pos: "PG", height: "6'2", weight: 180, year: 2026, hs: "Imhotep Charter", city: "Philadelphia", state: "PA", stars: 4, rank: 30 },
  { first: "Zion", last: "Taylor", team: 4, pos: "C", height: "7'0", weight: 245, year: 2027, hs: "Roman Catholic", city: "Philadelphia", state: "PA", stars: 5, rank: 4 },

  // Nike Team Florida (team 5)
  { first: "DeVonte", last: "Harris", team: 5, pos: "SG", height: "6'5", weight: 195, year: 2026, hs: "Montverde Academy", city: "Montverde", state: "FL", stars: 5, rank: 2 },
  { first: "Jayden", last: "Brooks", team: 5, pos: "PG", height: "6'3", weight: 185, year: 2026, hs: "IMG Academy", city: "Bradenton", state: "FL", stars: 4, rank: 15 },
  { first: "Trevon", last: "Lewis", team: 5, pos: "SF", height: "6'7", weight: 205, year: 2027, hs: "Windermere Prep", city: "Orlando", state: "FL", stars: 4, rank: 35 },

  // Expressions Elite (team 6)
  { first: "Miles", last: "Foster", team: 6, pos: "PG", height: "6'1", weight: 175, year: 2026, hs: "Brewster Academy", city: "Wolfeboro", state: "NH", stars: 4, rank: 20 },
  { first: "Nate", last: "Collins", team: 6, pos: "SF", height: "6'6", weight: 200, year: 2026, hs: "Cushing Academy", city: "Ashburnham", state: "MA", stars: 3, rank: 68 },

  // EYBL Indy (team 7)
  { first: "Trey", last: "Patterson", team: 7, pos: "PF", height: "6'8", weight: 215, year: 2026, hs: "Cathedral", city: "Indianapolis", state: "IN", stars: 4, rank: 27 },
  { first: "Eric", last: "Adams", team: 7, pos: "SG", height: "6'3", weight: 185, year: 2027, hs: "Park Tudor", city: "Indianapolis", state: "IN", stars: 3, rank: 78 },

  // Houston Hoops (team 8)
  { first: "Jace", last: "Williams", team: 8, pos: "SG", height: "6'5", weight: 195, year: 2026, hs: "Westbury Christian", city: "Houston", state: "TX", stars: 5, rank: 6 },
  { first: "Kendrick", last: "Moore", team: 8, pos: "PG", height: "6'2", weight: 180, year: 2026, hs: "Fort Bend Elkins", city: "Missouri City", state: "TX", stars: 4, rank: 33 },
  { first: "Desmond", last: "Jackson", team: 8, pos: "C", height: "6'10", weight: 235, year: 2027, hs: "Bellaire", city: "Houston", state: "TX", stars: 3, rank: 82 },

  // Seattle Rotary (team 9)
  { first: "Noah", last: "Chen", team: 9, pos: "PG", height: "6'3", weight: 180, year: 2026, hs: "Seattle Prep", city: "Seattle", state: "WA", stars: 4, rank: 24 },
  { first: "Kai", last: "Anderson", team: 9, pos: "SF", height: "6'8", weight: 210, year: 2026, hs: "Eastside Catholic", city: "Sammamish", state: "WA", stars: 4, rank: 19 },

  // Georgia Stars (team 10)
  { first: "Jaylen", last: "Thomas", team: 10, pos: "PF", height: "6'9", weight: 220, year: 2026, hs: "Milton", city: "Alpharetta", state: "GA", stars: 5, rank: 10 },
  { first: "Derrick", last: "Stone", team: 10, pos: "SG", height: "6'4", weight: 190, year: 2026, hs: "Wheeler", city: "Marietta", state: "GA", stars: 3, rank: 65 },

  // Compton Magic (team 11)
  { first: "Marcus", last: "Green", team: 11, pos: "PG", height: "6'2", weight: 180, year: 2026, hs: "Sierra Canyon", city: "Chatsworth", state: "CA", stars: 5, rank: 9 },
  { first: "Tyler", last: "Washington", team: 11, pos: "C", height: "7'1", weight: 250, year: 2027, hs: "Mater Dei", city: "Santa Ana", state: "CA", stars: 4, rank: 14 },
];

const insertPlayer = db.prepare(
  `INSERT INTO players (first_name, last_name, team_id, position, height, weight, class_year, high_school, hometown, state, star_rating, ranking)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

const playerIds: number[] = [];
for (const p of players) {
  const r = insertPlayer.run(
    p.first, p.last, teamIds[p.team], p.pos, p.height, p.weight,
    p.year, p.hs, p.city, p.state, p.stars, p.rank
  );
  playerIds.push(Number(r.lastInsertRowid));
}

console.log(`Seeded ${players.length} players`);

// ── Seed Games ──────────────────────────────────────────
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

const insertGame = db.prepare(
  `INSERT INTO games (home_team_id, away_team_id, session_name, venue, city, state, game_date, home_score, away_score, status)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

const gameIds: number[] = [];
const matchups = [
  // Session I - completed games
  [0, 2], [1, 3], [4, 5], [6, 7], [8, 9], [10, 11],
  [0, 5], [2, 4], [1, 8], [3, 10],
  // Session II - completed games
  [1, 0], [3, 2], [5, 4], [7, 6], [9, 8], [11, 10],
  [0, 10], [5, 2], [1, 7], [8, 4],
  // Session III - completed games
  [2, 1], [0, 4], [5, 3], [8, 6], [10, 9], [11, 7],
  // Session IV - upcoming
  [0, 11], [1, 5], [2, 8], [3, 6], [4, 10], [7, 9],
];

let matchIdx = 0;
for (let s = 0; s < sessions.length; s++) {
  const session = sessions[s];
  const isUpcoming = s === 3;
  const gamesPerSession = s < 2 ? 10 : s === 2 ? 6 : 6;

  for (let g = 0; g < gamesPerSession && matchIdx < matchups.length; g++) {
    const [home, away] = matchups[matchIdx];
    const dateIdx = Math.min(g % 3, gameDates[s].length - 1);
    const date = gameDates[s][dateIdx];

    let homeScore = null;
    let awayScore = null;
    let status = "Scheduled";

    if (!isUpcoming) {
      homeScore = 55 + Math.floor(Math.random() * 35);
      awayScore = 55 + Math.floor(Math.random() * 35);
      status = "Final";
    }

    const r = insertGame.run(
      teamIds[home], teamIds[away], session.name, session.venue,
      session.city, session.state, date, homeScore, awayScore, status
    );
    gameIds.push(Number(r.lastInsertRowid));
    matchIdx++;
  }
}

console.log(`Seeded ${gameIds.length} games`);

// ── Seed Player Stats (for completed games) ─────────────
const insertStats = db.prepare(
  `INSERT INTO player_stats
   (player_id, game_id, minutes, points, rebounds, assists, steals, blocks, turnovers,
    fg_made, fg_attempted, three_made, three_attempted, ft_made, ft_attempted, fouls)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

// Map team index to player indices
const teamPlayers: Record<number, number[]> = {};
for (let i = 0; i < players.length; i++) {
  const teamIdx = players[i].team;
  if (!teamPlayers[teamIdx]) teamPlayers[teamIdx] = [];
  teamPlayers[teamIdx].push(i);
}

let statsCount = 0;
matchIdx = 0;
for (let s = 0; s < sessions.length; s++) {
  const isUpcoming = s === 3;
  const gamesPerSession = s < 2 ? 10 : 6;

  for (let g = 0; g < gamesPerSession && matchIdx < matchups.length; g++) {
    if (isUpcoming) { matchIdx++; continue; }

    const [homeTeam, awayTeam] = matchups[matchIdx];
    const gameId = gameIds[matchIdx];

    // Generate stats for all players on both teams
    for (const teamIdx of [homeTeam, awayTeam]) {
      const pIndices = teamPlayers[teamIdx] || [];
      for (const pIdx of pIndices) {
        const p = players[pIdx];
        const stars = p.stars;

        // Higher-rated players get better stats
        const baseMin = 20 + stars * 4 + Math.floor(Math.random() * 8);
        const basePts = (stars * 3) + Math.floor(Math.random() * 12);
        const reb = (p.pos === "C" || p.pos === "PF") ? 4 + Math.floor(Math.random() * 8) : 1 + Math.floor(Math.random() * 5);
        const ast = (p.pos === "PG") ? 3 + Math.floor(Math.random() * 7) : 1 + Math.floor(Math.random() * 4);
        const stl = Math.floor(Math.random() * 4);
        const blk = (p.pos === "C" || p.pos === "PF") ? Math.floor(Math.random() * 4) : Math.floor(Math.random() * 2);
        const to = 1 + Math.floor(Math.random() * 4);
        const fga = 8 + Math.floor(Math.random() * 10);
        const fgm = Math.floor(fga * (0.35 + Math.random() * 0.25));
        const tpa = 2 + Math.floor(Math.random() * 6);
        const tpm = Math.floor(tpa * (0.25 + Math.random() * 0.2));
        const fta = 2 + Math.floor(Math.random() * 8);
        const ftm = Math.floor(fta * (0.6 + Math.random() * 0.3));
        const fouls = 1 + Math.floor(Math.random() * 4);
        const pts = fgm * 2 + tpm + ftm;

        insertStats.run(
          playerIds[pIdx], gameId, baseMin, pts, reb, ast, stl, blk, to,
          fgm, fga, tpm, tpa, ftm, fta, fouls
        );
        statsCount++;
      }
    }
    matchIdx++;
  }
}

console.log(`Seeded ${statsCount} stat lines`);

// ── Seed Scouting Reports ───────────────────────────────
const insertReport = db.prepare(
  `INSERT INTO scouting_reports
   (player_id, game_id, scout_name, overall_grade, offensive_grade, defensive_grade,
    athleticism_grade, basketball_iq_grade, strengths, weaknesses, notes, projection, comparison)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

const scouts = ["Coach Davis", "Scout Williams", "Analyst Brown", "Coach Martinez", "Scout Johnson"];
const grades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C"];

const reportData = [
  { pIdx: 8, scout: 0, og: "A+", off: "A+", def: "A", ath: "A+", iq: "A",
    str: "Elite shot creation. Can score from all three levels. Smooth mid-range game with deep range. Finishes through contact.",
    weak: "Can be turnover-prone in transition. Needs to improve off-ball defense.",
    notes: "Dominant performance. Controlled the game from start to finish. Showed poise beyond his years in crunch time. NBA-caliber talent.",
    proj: "Top 5 NBA Draft Pick", comp: "Bradley Beal / Devin Booker hybrid" },
  { pIdx: 0, scout: 1, og: "A", off: "A", def: "B+", ath: "A-", iq: "A+",
    str: "Elite floor general. Makes everyone around him better. Exceptional court vision and feel for the game. Crafty finisher.",
    weak: "Could add more muscle. Outside shot is streaky.",
    notes: "Ran the show beautifully. 8 assists to 2 turnovers. Made the right play almost every time. True point guard.",
    proj: "High Major Starter, potential lottery pick", comp: "Chris Paul with more athleticism" },
  { pIdx: 18, scout: 2, og: "A+", off: "A+", def: "A-", ath: "A+", iq: "A-",
    str: "Explosive athleticism. Elite scorer who can get to the rim at will. Knockdown three-point shooter. Transition game is electric.",
    weak: "Sometimes settles for jump shots. Decision-making in half-court can improve.",
    notes: "Put on a show. 28 points on efficient shooting. Drew a crowd every time he touched the ball. Special talent.",
    proj: "One-and-done, potential #1 pick", comp: "Young Kobe Bryant" },
  { pIdx: 17, scout: 0, og: "A", off: "B+", def: "A+", ath: "A+", iq: "A",
    str: "Elite rim protection. Incredible length and timing. Soft touch around the basket. Excellent rebounder with a motor.",
    weak: "Perimeter skills still developing. Free throw shooting needs work.",
    notes: "Altered every shot at the rim. 6 blocks and 12 rebounds. Changed the game defensively. Franchise-caliber center.",
    proj: "Immediate impact college center, NBA lottery", comp: "Young Anthony Davis" },
  { pIdx: 15, scout: 3, og: "A", off: "A-", def: "A", ath: "A", iq: "B+",
    str: "Versatile forward with a complete game. Can play 3-5. Excellent in transition. Strong rebounder who runs the floor.",
    weak: "Ball handling in traffic. Three-point consistency.",
    notes: "Does a little bit of everything. 18/9/4 stat line. Matchup nightmare because of his versatility and motor.",
    proj: "High Major starter, possible first round pick", comp: "Tobias Harris type" },
  { pIdx: 25, scout: 4, og: "A", off: "A+", def: "B", ath: "A", iq: "A-",
    str: "Smooth shooting stroke. Can score in bunches. High release point makes shot unblockable. Great in catch-and-shoot.",
    weak: "Lateral quickness on defense. Needs to be more aggressive on drives.",
    notes: "Hit 5 threes tonight. When he gets hot, he's the best shooter in the class. Shot selection has improved dramatically.",
    proj: "High Major impact player", comp: "Klay Thompson lite" },
  { pIdx: 30, scout: 1, og: "A-", off: "A", def: "B+", ath: "A-", iq: "A",
    str: "Strong body at the 4. Finishes through contact. Face-up game is developing. Motor never stops.",
    weak: "Lateral footspeed. Perimeter defense in switches.",
    notes: "Physically dominant in the post. 20 and 10 on 8-12 shooting. College ready body. Impact player from day one.",
    proj: "Power 5 starter, potential 2nd round pick", comp: "Julius Randle" },
  { pIdx: 32, scout: 2, og: "A", off: "A-", def: "A-", ath: "A", iq: "A",
    str: "Complete point guard. Makes everyone better. Sees plays before they develop. Can score when needed. Tough competitor.",
    weak: "Size limits defensive upside against bigger guards. Can over-pass at times.",
    notes: "Masterclass in point guard play. Led his team through adversity. Poise and leadership are off the charts.",
    proj: "Elite program PG, potential lottery pick", comp: "Young Jalen Brunson" },
  { pIdx: 11, scout: 0, og: "A+", off: "A-", def: "A+", ath: "A+", iq: "A-",
    str: "Dominant defensive presence. Blocks shots without fouling. Improving offensive game. Athletic freak with a 7'4 wingspan.",
    weak: "Post moves still raw. Foul trouble in physical games.",
    notes: "Most physically impressive player in the session. His impact doesn't show up fully in the box score. Changes the game on defense.",
    proj: "One-and-done, top 10 pick", comp: "Chet Holmgren with more power" },
  { pIdx: 19, scout: 4, og: "A-", off: "A", def: "B+", ath: "A-", iq: "A",
    str: "Heady point guard with excellent feel. Shifty ball handler. Good shooter off the dribble. Natural leader.",
    weak: "Not the most explosive athlete. Can be streaky from deep.",
    notes: "Runs the team efficiently. Knows when to push pace and when to slow down. Makes very few mistakes.",
    proj: "Power 5 starting PG", comp: "Jose Alvarado with better shooting" },
];

for (const r of reportData) {
  insertReport.run(
    playerIds[r.pIdx], gameIds[0], scouts[r.scout], r.og, r.off, r.def,
    r.ath, r.iq, r.str, r.weak, r.notes, r.proj, r.comp
  );
}

console.log(`Seeded ${reportData.length} scouting reports`);

// ── Seed Scholastic Data ────────────────────────────────
const insertScholastic = db.prepare(
  `INSERT INTO scholastic_data
   (player_id, gpa, gpa_scale, sat_score, act_score, ncaa_eligible, core_gpa,
    core_courses_completed, core_courses_required, academic_standing, intended_major,
    honors_ap_courses, class_rank, class_size, transcript_on_file, ncaa_clearinghouse_id)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

const majors = ["Business", "Communications", "Sports Management", "Kinesiology", "Undecided", "Psychology", "Computer Science", "Liberal Arts"];
const standings = ["Good Standing", "Good Standing", "Good Standing", "Honor Roll", "Honor Roll", "Dean's List"];

for (let i = 0; i < players.length; i++) {
  const stars = players[i].stars;
  // Higher-rated players tend to have better academic support
  const baseGpa = 2.5 + Math.random() * 1.5;
  const gpa = Math.round(Math.min(4.0, baseGpa) * 100) / 100;
  const coreGpa = Math.round((gpa - 0.1 + Math.random() * 0.2) * 100) / 100;
  const sat = stars >= 4 ? 1050 + Math.floor(Math.random() * 300) : 900 + Math.floor(Math.random() * 250);
  const act = Math.floor(sat / 50) + Math.floor(Math.random() * 4);
  const eligible = gpa >= 2.3 && coreGpa >= 2.3 ? 1 : 0;
  const coreCompleted = 10 + Math.floor(Math.random() * 7);
  const standing = standings[Math.floor(Math.random() * standings.length)];
  const major = majors[Math.floor(Math.random() * majors.length)];
  const honorsAp = Math.floor(Math.random() * 6);
  const classSize = 200 + Math.floor(Math.random() * 400);
  const classRank = Math.floor(classSize * (0.05 + Math.random() * 0.6));
  const hasTranscript = Math.random() > 0.3 ? 1 : 0;
  const clearinghouseId = eligible && Math.random() > 0.2 ? `NCAA-${2026}${String(i + 1).padStart(5, "0")}` : null;

  insertScholastic.run(
    playerIds[i], gpa, 4.0, sat, act, eligible, coreGpa,
    coreCompleted, 16, standing, major, honorsAp,
    classRank, classSize, hasTranscript, clearinghouseId
  );
}

console.log(`Seeded ${players.length} scholastic records`);

// ── Seed NextUp Profiles ────────────────────────────────
const insertNextUp = db.prepare(
  `INSERT INTO nextup_profiles
   (player_id, nextup_id, nextup_url, profile_verified, highlights_count, followers, last_synced)
   VALUES (?, ?, ?, ?, ?, ?, ?)`
);

// Most top players would have NextUp profiles
let nextupCount = 0;
for (let i = 0; i < players.length; i++) {
  const stars = players[i].stars;
  // Higher-rated players more likely to have profiles
  if (stars >= 3 || Math.random() > 0.4) {
    const p = players[i];
    const nextupId = `nu_${p.first.toLowerCase()}${p.last.toLowerCase()}${p.year}`;
    const url = `https://app.nextup.world/profile/${nextupId}`;
    const verified = stars >= 4 ? 1 : Math.random() > 0.5 ? 1 : 0;
    const highlights = stars * 3 + Math.floor(Math.random() * 15);
    const followers = stars * 200 + Math.floor(Math.random() * 2000);

    insertNextUp.run(
      playerIds[i], nextupId, url, verified, highlights, followers,
      "2026-03-08T12:00:00Z"
    );
    nextupCount++;
  }
}

console.log(`Seeded ${nextupCount} NextUp profiles`);

// ── Seed Physical Metrics ───────────────────────────────
const insertPhysical = db.prepare(
  `INSERT INTO physical_metrics
   (player_id, wingspan, standing_reach, hand_length, hand_width, body_fat_pct,
    vertical_jump, max_vertical, lane_agility, sprint_3qt, speed_mph, shuttle_run,
    bench_press_reps, measured_height_shoes, measured_height_no_shoes, measured_weight)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

// Position-based physical profiles
const posPhysicals: Record<string, { wingAdj: number; vertBase: number; speedBase: number }> = {
  PG: { wingAdj: 2, vertBase: 36, speedBase: 18.5 },
  SG: { wingAdj: 3, vertBase: 37, speedBase: 18.0 },
  SF: { wingAdj: 4, vertBase: 35, speedBase: 17.5 },
  PF: { wingAdj: 5, vertBase: 33, speedBase: 17.0 },
  C:  { wingAdj: 6, vertBase: 31, speedBase: 16.0 },
};

function heightInches(h: string): number {
  const m = h.match(/(\d+)'(\d+)/);
  return m ? parseInt(m[1]) * 12 + parseInt(m[2]) : 72;
}

function inchesToFeetStr(inches: number): string {
  return `${Math.floor(inches / 12)}'${inches % 12}`;
}

for (let i = 0; i < players.length; i++) {
  const p = players[i];
  const phys = posPhysicals[p.pos] || posPhysicals.SF;
  const h = heightInches(p.height);

  const wingInches = h + phys.wingAdj + Math.floor(Math.random() * 4) - 1;
  const wingspan = inchesToFeetStr(wingInches);
  const reachInches = h + 6 + Math.floor(Math.random() * 4);
  const standingReach = inchesToFeetStr(reachInches);
  const handLength = +(8.5 + Math.random() * 2.5).toFixed(1);
  const handWidth = +(8.0 + Math.random() * 3).toFixed(1);
  const bodyFat = +(5 + Math.random() * 7).toFixed(1);
  const vert = +(phys.vertBase + Math.random() * 8 - 2).toFixed(1);
  const maxVert = +(vert + 2 + Math.random() * 4).toFixed(1);
  const laneAgility = +(10.5 + Math.random() * 2).toFixed(2);
  const sprint = +(3.1 + Math.random() * 0.5).toFixed(2);
  const speed = +(phys.speedBase + Math.random() * 2 - 1).toFixed(1);
  const shuttle = +(2.8 + Math.random() * 0.6).toFixed(2);
  const bench = Math.floor(Math.random() * 12);
  const shoesHeight = inchesToFeetStr(h + 1);
  const noShoesHeight = inchesToFeetStr(h);

  insertPhysical.run(
    playerIds[i], wingspan, standingReach, handLength, handWidth, bodyFat,
    vert, maxVert, laneAgility, sprint, speed, shuttle, bench,
    shoesHeight, noShoesHeight, p.weight
  );
}

console.log(`Seeded ${players.length} physical metrics`);

// ── Seed NBA Projections ────────────────────────────────
const insertNba = db.prepare(
  `INSERT INTO nba_projections
   (player_id, draft_probability, projected_round, projected_pick_range, projected_role,
    projected_minutes_yr1, projected_minutes_yr3, projected_minutes_prime,
    projected_salary_rookie, projected_salary_yr5, projected_salary_prime,
    career_earnings_est, nba_comparison, nba_comp_similarity, secondary_comparison,
    player_archetype, bust_probability, all_star_probability)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

// NBA comparisons based on position + star rating
const nbaComps: Record<string, { primary: string[]; secondary: string[]; archetypes: string[]; roles: string[] }> = {
  PG: {
    primary: ["Ja Morant", "Trae Young", "Tyrese Haliburton", "Jalen Brunson", "De'Aaron Fox", "Fred VanVleet"],
    secondary: ["Marcus Smart", "Derrick White", "Immanuel Quickley", "Tre Jones", "Dennis Smith Jr"],
    archetypes: ["Score-first PG", "Floor General", "Two-way PG", "Combo Guard", "Playmaking Lead Guard"],
    roles: ["Starting PG", "Sixth Man", "Rotational PG", "Bench Facilitator", "Two-way Player"],
  },
  SG: {
    primary: ["Devin Booker", "Anthony Edwards", "Donovan Mitchell", "Jaylen Brown", "Desmond Bane", "Anfernee Simons"],
    secondary: ["Austin Reaves", "Malik Monk", "Quentin Grimes", "Cam Thomas", "Gradey Dick"],
    archetypes: ["Elite Scorer", "3-and-D Wing", "Shot Creator", "Two-way Guard", "Sharpshooter"],
    roles: ["Franchise Scorer", "Starting SG", "Sixth Man Scorer", "3-and-D Starter", "Rotation Wing"],
  },
  SF: {
    primary: ["Jayson Tatum", "Paolo Banchero", "Scottie Barnes", "Brandon Ingram", "Mikal Bridges", "OG Anunoby"],
    secondary: ["Herb Jones", "Dillon Brooks", "Keldon Johnson", "Jalen Williams", "Aaron Wiggins"],
    archetypes: ["Two-way Wing", "Point Forward", "Versatile Scorer", "3-and-D Wing", "Switchable Defender"],
    roles: ["Franchise Wing", "Starting SF", "Two-way Starter", "Versatile Role Player", "Defensive Specialist"],
  },
  PF: {
    primary: ["Giannis Antetokounmpo", "Julius Randle", "Evan Mobley", "Jaren Jackson Jr", "Zion Williamson", "Scottie Barnes"],
    secondary: ["Jabari Smith Jr", "Jonathan Isaac", "Keegan Murray", "Jalen Smith", "Onyeka Okongwu"],
    archetypes: ["Stretch Four", "Power Forward", "Modern Big", "Versatile Forward", "Two-way Big"],
    roles: ["Franchise PF", "Starting PF", "Stretch Four Starter", "Rotation Big", "Defensive Anchor"],
  },
  C: {
    primary: ["Victor Wembanyama", "Chet Holmgren", "Bam Adebayo", "Evan Mobley", "Anthony Davis", "Jarrett Allen"],
    secondary: ["Walker Kessler", "Mark Williams", "Jalen Duren", "Kel'el Ware", "Dereck Lively II"],
    archetypes: ["Rim Protector", "Two-way Center", "Stretch Five", "Paint Beast", "Modern Center"],
    roles: ["Franchise Center", "Starting C", "Defensive Anchor", "Rotation Center", "Two-way Starter"],
  },
};

for (let i = 0; i < players.length; i++) {
  const p = players[i];
  const stars = p.stars;
  const comps = nbaComps[p.pos] || nbaComps.SF;

  // Draft probability based on star rating
  let draftProb: number;
  let round: number | null;
  let pickRange: string;
  let roleIdx: number;

  if (stars === 5) {
    draftProb = 75 + Math.random() * 20;
    round = 1;
    pickRange = `${1 + Math.floor(Math.random() * 14)}-${5 + Math.floor(Math.random() * 10)}`;
    roleIdx = Math.floor(Math.random() * 2);
  } else if (stars === 4) {
    draftProb = 30 + Math.random() * 35;
    round = Math.random() > 0.4 ? 1 : 2;
    pickRange = `${15 + Math.floor(Math.random() * 20)}-${25 + Math.floor(Math.random() * 15)}`;
    roleIdx = 1 + Math.floor(Math.random() * 2);
  } else {
    draftProb = 5 + Math.random() * 20;
    round = 2;
    pickRange = `${35 + Math.floor(Math.random() * 20)}-${45 + Math.floor(Math.random() * 15)}`;
    roleIdx = 2 + Math.floor(Math.random() * 3);
  }

  draftProb = +draftProb.toFixed(1);

  // Minutes projections
  const minYr1 = stars >= 4 ? +(12 + Math.random() * 18).toFixed(1) : +(5 + Math.random() * 12).toFixed(1);
  const minYr3 = +(minYr1 + 5 + Math.random() * 8).toFixed(1);
  const minPrime = +(Math.min(38, minYr3 + 3 + Math.random() * 5)).toFixed(1);

  // Salary projections (based on draft position)
  const rookieSalary = round === 1 ? 3000000 + Math.floor(Math.random() * 8000000) : 1000000 + Math.floor(Math.random() * 1500000);
  const yr5Salary = round === 1 ? 15000000 + Math.floor(Math.random() * 20000000) : 5000000 + Math.floor(Math.random() * 10000000);
  const primeSalary = stars >= 4 ? 25000000 + Math.floor(Math.random() * 30000000) : 8000000 + Math.floor(Math.random() * 15000000);
  const careerEarnings = rookieSalary * 4 + yr5Salary * 3 + primeSalary * 5;

  // Comparisons
  const primaryIdx = stars >= 4 ? Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 3);
  const primary = comps.primary[primaryIdx] || comps.primary[0];
  const secondary = comps.secondary[Math.floor(Math.random() * comps.secondary.length)];
  const similarity = +(55 + Math.random() * 35).toFixed(1);
  const archetype = comps.archetypes[Math.floor(Math.random() * comps.archetypes.length)];
  const role = comps.roles[roleIdx] || comps.roles[2];

  const bustProb = stars >= 5 ? +(5 + Math.random() * 15).toFixed(1) : stars >= 4 ? +(15 + Math.random() * 20).toFixed(1) : +(30 + Math.random() * 30).toFixed(1);
  const allStarProb = stars >= 5 ? +(20 + Math.random() * 30).toFixed(1) : stars >= 4 ? +(5 + Math.random() * 15).toFixed(1) : +(1 + Math.random() * 5).toFixed(1);

  insertNba.run(
    playerIds[i], draftProb, round, pickRange, role,
    minYr1, minYr3, minPrime,
    rookieSalary, yr5Salary, primeSalary, careerEarnings,
    primary, similarity, secondary, archetype, bustProb, allStarProb
  );
}

console.log(`Seeded ${players.length} NBA projections`);

db.close();
console.log("\nDatabase seeded successfully!");
