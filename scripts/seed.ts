import Database from "better-sqlite3";
import path from "path";
const fs = require("fs");

const DB_PATH = path.join(process.cwd(), "mikev-scout.db");
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create all tables
db.exec(`
  CREATE TABLE teams (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, conference TEXT NOT NULL, city TEXT NOT NULL, state TEXT NOT NULL, logo_url TEXT, created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE players (id INTEGER PRIMARY KEY AUTOINCREMENT, first_name TEXT NOT NULL, last_name TEXT NOT NULL, team_id INTEGER REFERENCES teams(id), position TEXT NOT NULL, height TEXT, weight INTEGER, class_year INTEGER NOT NULL, high_school TEXT, hometown TEXT, state TEXT, star_rating INTEGER DEFAULT 0, ranking INTEGER, status TEXT DEFAULT 'Active', committed_to TEXT, photo_url TEXT, merch_store_url TEXT, nil_value INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE games (id INTEGER PRIMARY KEY AUTOINCREMENT, home_team_id INTEGER REFERENCES teams(id), away_team_id INTEGER REFERENCES teams(id), week_number INTEGER NOT NULL, venue TEXT, city TEXT, state TEXT, game_date TEXT NOT NULL, home_score INTEGER, away_score INTEGER, status TEXT DEFAULT 'Scheduled', created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE player_stats (id INTEGER PRIMARY KEY AUTOINCREMENT, player_id INTEGER NOT NULL REFERENCES players(id), game_id INTEGER NOT NULL REFERENCES games(id), snaps INTEGER DEFAULT 0, pass_completions INTEGER DEFAULT 0, pass_attempts INTEGER DEFAULT 0, pass_yards INTEGER DEFAULT 0, pass_tds INTEGER DEFAULT 0, interceptions INTEGER DEFAULT 0, rush_attempts INTEGER DEFAULT 0, rush_yards INTEGER DEFAULT 0, rush_tds INTEGER DEFAULT 0, receptions INTEGER DEFAULT 0, rec_yards INTEGER DEFAULT 0, rec_tds INTEGER DEFAULT 0, tackles INTEGER DEFAULT 0, solo_tackles INTEGER DEFAULT 0, tackles_for_loss INTEGER DEFAULT 0, sacks REAL DEFAULT 0, forced_fumbles INTEGER DEFAULT 0, interceptions_def INTEGER DEFAULT 0, pass_breakups INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE football_metrics (id INTEGER PRIMARY KEY AUTOINCREMENT, player_id INTEGER NOT NULL UNIQUE REFERENCES players(id), top_speed_mph REAL, top_speed_times_reached INTEGER DEFAULT 0, avg_top_speed_pos REAL, forty_yard REAL, shuttle REAL, vertical_jump REAL, broad_jump REAL, bench_press_reps INTEGER, throw_velocity_mph REAL, throw_velocity_avg_pos REAL, tackle_force_lbs REAL, block_force_lbs REAL, nfl_avg_tackle_force REAL, nfl_avg_block_force REAL, wingspan TEXT, hand_size REAL, arm_length REAL, updated_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE scouting_reports (id INTEGER PRIMARY KEY AUTOINCREMENT, player_id INTEGER NOT NULL REFERENCES players(id), game_id INTEGER REFERENCES games(id), scout_name TEXT NOT NULL, overall_grade TEXT NOT NULL, offensive_grade TEXT, defensive_grade TEXT, athleticism_grade TEXT, football_iq_grade TEXT, strengths TEXT, weaknesses TEXT, notes TEXT, projection TEXT, comparison TEXT, created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE transfer_portal (id INTEGER PRIMARY KEY AUTOINCREMENT, player_id INTEGER NOT NULL REFERENCES players(id), transfer_likelihood REAL DEFAULT 0, reason TEXT, current_playing_time_pct REAL DEFAULT 0, projected_nil_increase REAL DEFAULT 0, portal_entry_date TEXT, status TEXT DEFAULT 'Watch', destination TEXT, created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE social_actions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL DEFAULT 'fan_1', player_id INTEGER NOT NULL REFERENCES players(id), action_type TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')), UNIQUE(user_id, player_id, action_type));
  CREATE TABLE feed_posts (id INTEGER PRIMARY KEY AUTOINCREMENT, author TEXT NOT NULL DEFAULT 'Coach Mike V', content TEXT NOT NULL, post_type TEXT NOT NULL DEFAULT 'update', player_id INTEGER REFERENCES players(id), likes_count INTEGER DEFAULT 0, shares_count INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE merch_items (id INTEGER PRIMARY KEY AUTOINCREMENT, player_id INTEGER NOT NULL REFERENCES players(id), name TEXT NOT NULL, description TEXT, price REAL NOT NULL, image_url TEXT, category TEXT NOT NULL DEFAULT 'Apparel', in_stock INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE nfl_projections (id INTEGER PRIMARY KEY AUTOINCREMENT, player_id INTEGER NOT NULL UNIQUE REFERENCES players(id), draft_probability REAL DEFAULT 0, projected_round INTEGER, projected_pick_range TEXT, projected_role TEXT, nfl_comparison TEXT, nfl_comp_similarity REAL, secondary_comparison TEXT, player_archetype TEXT, bust_probability REAL DEFAULT 0, pro_bowl_probability REAL DEFAULT 0, projected_rookie_contract INTEGER, projected_second_contract INTEGER, career_earnings_est INTEGER, updated_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE scholastic_data (id INTEGER PRIMARY KEY AUTOINCREMENT, player_id INTEGER NOT NULL UNIQUE REFERENCES players(id), gpa REAL, gpa_scale REAL DEFAULT 4.0, sat_score INTEGER, act_score INTEGER, ncaa_eligible INTEGER DEFAULT 1, core_gpa REAL, academic_standing TEXT DEFAULT 'Good Standing', intended_major TEXT, updated_at TEXT DEFAULT (datetime('now')));
  CREATE INDEX idx_players_team ON players(team_id);
  CREATE INDEX idx_stats_player ON player_stats(player_id);
  CREATE INDEX idx_stats_game ON player_stats(game_id);
  CREATE INDEX idx_reports_player ON scouting_reports(player_id);
  CREATE INDEX idx_social_player ON social_actions(player_id);
  CREATE INDEX idx_portal_player ON transfer_portal(player_id);
  CREATE INDEX idx_merch_player ON merch_items(player_id);
  CREATE INDEX idx_feed_date ON feed_posts(created_at);
`);

// ── Teams (schools these recruits play for / are targeted by) ──
const teamsData = [
  { name: "Penn State", conf: "Big Ten", city: "State College", state: "PA" },
  { name: "Oregon", conf: "Big Ten", city: "Eugene", state: "OR" },
  { name: "Notre Dame", conf: "Independent", city: "South Bend", state: "IN" },
  { name: "Michigan", conf: "Big Ten", city: "Ann Arbor", state: "MI" },
  { name: "Ohio State", conf: "Big Ten", city: "Columbus", state: "OH" },
  { name: "Clemson", conf: "ACC", city: "Clemson", state: "SC" },
  { name: "Georgia", conf: "SEC", city: "Athens", state: "GA" },
  { name: "Auburn", conf: "SEC", city: "Auburn", state: "AL" },
  { name: "Miami", conf: "ACC", city: "Miami", state: "FL" },
  { name: "Virginia Tech", conf: "ACC", city: "Blacksburg", state: "VA" },
  { name: "Syracuse", conf: "ACC", city: "Syracuse", state: "NY" },
  { name: "Pittsburgh", conf: "ACC", city: "Pittsburgh", state: "PA" },
];

const insertTeam = db.prepare("INSERT INTO teams (name, conference, city, state) VALUES (?, ?, ?, ?)");
const teamIds: number[] = [];
for (const t of teamsData) { teamIds.push(Number(insertTeam.run(t.name, t.conf, t.city, t.state).lastInsertRowid)); }
console.log(`Seeded ${teamsData.length} teams`);

// ── Players: Real HVU Insider 2027 Target Board ──
const playersData = [
  // QBs
  { first: "Will", last: "Mencl", team: null, pos: "QB", h: "6'3", w: 205, yr: 2027, hs: "Chandler HS", city: "Chandler", st: "AZ", stars: 5, rank: 1, nil: 150000, status: "Uncommitted" },
  { first: "Peter", last: "Borque", team: null, pos: "QB", h: "6'4", w: 220, yr: 2027, hs: "Tabor Academy", city: "Marion", st: "MA", stars: 4, rank: 86, nil: 75000, status: "Decommitted", note: "Decommitted from Michigan" },
  { first: "Will", last: "Wood", team: null, pos: "QB", h: "6'2", w: 220, yr: 2027, hs: "Xaverian Brothers HS", city: "Natick", st: "MA", stars: 3, rank: null, nil: 25000, status: "Uncommitted" },
  // RBs
  { first: "Tre", last: "Segarra", team: null, pos: "RB", h: "5'10", w: 205, yr: 2027, hs: "Byrnes HS", city: "Duncan", st: "SC", stars: 4, rank: 5, nil: 100000, status: "Uncommitted" },
  { first: "Aiden", last: "Gibson", team: null, pos: "RB", h: "5'11", w: 195, yr: 2027, hs: "TBD", city: "TBD", st: "PA", stars: 3, rank: null, nil: 15000, status: "PSU Visit Locked" },
  { first: "Gary", last: "Walker", team: null, pos: "RB", h: "6'0", w: 200, yr: 2027, hs: "TBD", city: "TBD", st: "PA", stars: 3, rank: null, nil: 10000, status: "PSU Visit Scheduled" },
  { first: "Dajon", last: "Talley-Rhodes", team: null, pos: "RB", h: "5'10", w: 190, yr: 2027, hs: "St. John's College HS", city: "Washington", st: "DC", stars: 3, rank: null, nil: 8000, status: "Pitt Lead" },
  // DB/ATH
  { first: "Case", last: "Alexander", team: null, pos: "ATH", h: "6'3", w: 210, yr: 2027, hs: "TBD", city: "TBD", st: "PA", stars: 3, rank: null, nil: 20000, status: "PSU Legacy" },
  { first: "Blake", last: "Betton", team: null, pos: "S", h: "6'1", w: 195, yr: 2027, hs: "Shakopee HS", city: "Shakopee", st: "MN", stars: 3, rank: null, nil: 15000, status: "PSU Visit Locked" },
  { first: "Brandon", last: "Lockley Jr.", team: null, pos: "LB", h: "6'2", w: 220, yr: 2027, hs: "TBD", city: "TBD", st: "PA", stars: 3, rank: null, nil: 10000, status: "Regional Target" },
  { first: "Tyson", last: "Washington", team: null, pos: "DB", h: "6'0", w: 185, yr: 2027, hs: "TBD", city: "TBD", st: "PA", stars: 3, rank: null, nil: 8000, status: "PSU Target" },
  // EDGE/DL
  { first: "Abraham", last: "Sesay", team: null, pos: "DE", h: "6'5", w: 225, yr: 2027, hs: "TBD", city: "Exton", st: "PA", stars: 4, rank: 50, nil: 125000, status: "Uncommitted" },
  { first: "Mekai", last: "Brown", team: null, pos: "DE", h: "6'4", w: 240, yr: 2027, hs: "TBD", city: "TBD", st: "PA", stars: 4, rank: null, nil: 60000, status: "PSU Re-Offered" },
  { first: "Keysan", last: "Taylor", team: null, pos: "EDGE", h: "6'3", w: 235, yr: 2027, hs: "TBD", city: "TBD", st: "TBD", stars: 4, rank: 26, nil: 50000, status: "PSU Monitoring" },
  { first: "Aidan", last: "O'Neil", team: null, pos: "DL", h: "6'4", w: 260, yr: 2027, hs: "TBD", city: "TBD", st: "TBD", stars: 3, rank: null, nil: 10000, status: "Evaluation Stage" },
  // Former PSU target (note)
  { first: "Kemon", last: "Spell", team: 6, pos: "RB", h: "5'11", w: 210, yr: 2027, hs: "McKeesport HS", city: "McKeesport", st: "PA", stars: 5, rank: 3, nil: 200000, status: "Active", committed: "Georgia" },
];

const insertPlayer = db.prepare("INSERT INTO players (first_name, last_name, team_id, position, height, weight, class_year, high_school, hometown, state, star_rating, ranking, nil_value, status, committed_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
const playerIds: number[] = [];
for (const p of playersData) {
  const tid = p.team != null ? teamIds[p.team] : null;
  const committed = (p as any).committed || null;
  playerIds.push(Number(insertPlayer.run(p.first, p.last, tid, p.pos, p.h, p.w, p.yr, p.hs, p.city, p.st, p.stars, p.rank, p.nil, p.status, committed).lastInsertRowid));
}
console.log(`Seeded ${playersData.length} players`);

// ── Games (Penn State 2025 season sample) ──
const insertGame = db.prepare("INSERT INTO games (home_team_id, away_team_id, week_number, venue, city, state, game_date, home_score, away_score, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
const gameIds: number[] = [];
const psu = teamIds[0];
const gameData = [
  [psu, teamIds[4], 1, "Beaver Stadium", "State College", "PA", "2025-08-30", 28, 24, "Final"],
  [teamIds[2], psu, 3, "Notre Dame Stadium", "South Bend", "IN", "2025-09-13", 21, 31, "Final"],
  [psu, teamIds[3], 5, "Beaver Stadium", "State College", "PA", "2025-09-27", 35, 17, "Final"],
  [psu, teamIds[1], 7, "Beaver Stadium", "State College", "PA", "2025-10-11", 27, 24, "Final"],
  [psu, teamIds[5], 10, "Beaver Stadium", "State College", "PA", "2025-11-01", null, null, "Scheduled"],
  [teamIds[3], psu, 12, "Michigan Stadium", "Ann Arbor", "MI", "2025-11-15", null, null, "Scheduled"],
];
for (const g of gameData) { gameIds.push(Number(insertGame.run(...g).lastInsertRowid)); }
console.log(`Seeded ${gameData.length} games`);

// ── Football Metrics ──
const insertMetrics = db.prepare("INSERT INTO football_metrics (player_id, top_speed_mph, top_speed_times_reached, avg_top_speed_pos, forty_yard, shuttle, vertical_jump, broad_jump, bench_press_reps, throw_velocity_mph, throw_velocity_avg_pos, tackle_force_lbs, block_force_lbs, nfl_avg_tackle_force, nfl_avg_block_force, wingspan, hand_size, arm_length) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

const metricsData: Record<number, any> = {
  0: { speed: 19.8, times: 12, avgSpeed: 19.2, forty: 4.62, shut: 4.15, vert: 33.5, broad: 118, bench: 8, throwV: 62, throwAvg: 55, tackle: null, block: null, nflTkl: null, nflBlk: null, wing: "6'6", hand: 10.0, arm: 33.5 },
  1: { speed: 18.9, times: 8, avgSpeed: 19.2, forty: 4.72, shut: 4.22, vert: 31.0, broad: 112, bench: 10, throwV: 59, throwAvg: 55, tackle: null, block: null, nflTkl: null, nflBlk: null, wing: "6'8", hand: 10.25, arm: 34.0 },
  2: { speed: 19.5, times: 15, avgSpeed: 19.2, forty: 4.58, shut: 4.10, vert: 35.0, broad: 120, bench: 6, throwV: 57, throwAvg: 55, tackle: null, block: null, nflTkl: null, nflBlk: null, wing: "6'4", hand: 9.75, arm: 32.5 },
  3: { speed: 21.8, times: 22, avgSpeed: 21.0, forty: 4.42, shut: 4.02, vert: 38.5, broad: 126, bench: 12, throwV: null, throwAvg: null, tackle: null, block: null, nflTkl: null, nflBlk: null, wing: "5'11", hand: 9.25, arm: 31.0 },
  4: { speed: 21.2, times: 14, avgSpeed: 21.0, forty: 4.48, shut: 4.08, vert: 36.0, broad: 122, bench: 10, throwV: null, throwAvg: null, tackle: null, block: null, nflTkl: null, nflBlk: null, wing: "6'0", hand: 9.0, arm: 31.5 },
  7: { speed: 20.5, times: 8, avgSpeed: 20.0, forty: 4.55, shut: 4.12, vert: 34.0, broad: 119, bench: 6, throwV: null, throwAvg: null, tackle: null, block: null, nflTkl: null, nflBlk: null, wing: "6'5", hand: 9.5, arm: 33.0 },
  8: { speed: 20.8, times: 18, avgSpeed: 20.5, forty: 4.50, shut: 4.05, vert: 37.0, broad: 124, bench: 8, throwV: null, throwAvg: null, tackle: 520, block: null, nflTkl: 680, nflBlk: null, wing: "6'3", hand: 9.25, arm: 32.5 },
  9: { speed: 19.2, times: 6, avgSpeed: 19.5, forty: 4.65, shut: 4.18, vert: 32.0, broad: 116, bench: 14, throwV: null, throwAvg: null, tackle: 610, block: null, nflTkl: 680, nflBlk: null, wing: "6'4", hand: 10.0, arm: 33.0 },
  11: { speed: 19.5, times: 20, avgSpeed: 18.8, forty: 4.58, shut: 4.15, vert: 35.5, broad: 122, bench: 16, throwV: null, throwAvg: null, tackle: 720, block: null, nflTkl: 680, nflBlk: null, wing: "6'8", hand: 10.5, arm: 34.5 },
  12: { speed: 19.0, times: 14, avgSpeed: 18.8, forty: 4.65, shut: 4.20, vert: 34.0, broad: 119, bench: 18, throwV: null, throwAvg: null, tackle: 680, block: 750, nflTkl: 680, nflBlk: 820, wing: "6'7", hand: 10.25, arm: 34.0 },
  13: { speed: 18.8, times: 10, avgSpeed: 18.8, forty: 4.68, shut: 4.22, vert: 33.5, broad: 118, bench: 15, throwV: null, throwAvg: null, tackle: 650, block: null, nflTkl: 680, nflBlk: null, wing: "6'6", hand: 10.0, arm: 33.5 },
  15: { speed: 22.4, times: 28, avgSpeed: 21.0, forty: 4.35, shut: 3.98, vert: 40.0, broad: 130, bench: 14, throwV: null, throwAvg: null, tackle: null, block: null, nflTkl: null, nflBlk: null, wing: "6'1", hand: 9.5, arm: 31.5 },
};

for (const [idx, m] of Object.entries(metricsData)) {
  const i = parseInt(idx);
  insertMetrics.run(playerIds[i], m.speed, m.times, m.avgSpeed, m.forty, m.shut, m.vert, m.broad, m.bench, m.throwV, m.throwAvg, m.tackle, m.block, m.nflTkl, m.nflBlk, m.wing, m.hand, m.arm);
}
console.log(`Seeded ${Object.keys(metricsData).length} football metrics`);

// ── Scouting Reports ──
const insertReport = db.prepare("INSERT INTO scouting_reports (player_id, scout_name, overall_grade, offensive_grade, defensive_grade, athleticism_grade, football_iq_grade, strengths, weaknesses, notes, projection, comparison) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

const reports = [
  [playerIds[0], "Mike V", "A+", "A+", null, "A", "A+", "Completed 70%+ for 3,815 yards. Not a project — a ready passer. Navy All-American Bowl participant as a junior.", "Family has deep Florida ties — culture pitch matters as much as scheme.", "If Mencl ends up at PSU, it rewrites the QB room ceiling for the entire class. Oregon leads, PSU in active pursuit alongside Auburn and Miami.", "Elite P5 Starter, NFL Draft Day 1-2", "Justin Herbert"],
  [playerIds[1], "Mike V", "A", "A", null, "B+", "A", "Won Gatorade Player of the Year in Massachusetts. Led Tabor to 9-0 title. Efficient, clean, decisive. Older maturity shows on film.", "Reclassified back to 2027 — needs to prove consistent against top competition.", "Pulled Michigan pledge due to coaching staff uncertainty. PSU is now an early leader per ESPN. Scheduling spring visits — PSU needs to be on that list fast.", "Power 5 Starter, possible NFL mid-round", "Mac Jones"],
  [playerIds[2], "Mike V", "B+", "A-", null, "A-", "B+", "42 touchdowns, 1 interception. Led Xaverian to 3rd straight state championship. 2,828 passing + 440 rushing — dual threat who plays within the offense.", "ACC interest emerging but no Power 4 blue-blood offers yet. Needs to prove against national-level competition.", "If PSU can't land Mencl or Borque, Wood is a legitimate option with upside still being discovered. Syracuse offered.", "Mid-Major to Power 5 upside", "Gardner Minshew"],
  [playerIds[3], "Mike V", "A", "A+", null, "A+", "A-", "1,374 rushing yards + 12 TDs. 348 receiving yards. Plays in space AND between the tackles. Greer Touchdown Club Offensive POY.", "Catholic faith is a real factor — Notre Dame's messaging has been intentional. Marcus Freeman made in-home visit.", "Notre Dame has serious momentum. HC Marcus Freeman visited in-person. PSU needs to match that energy for a South Carolina kid.", "Power 5 RB1, NFL Day 2", "Saquon Barkley lite"],
  [playerIds[11], "Mike V", "A+", null, "A+", "A+", "A", "Top-ranked EDGE in updated 2027 Rivals300. In-state kid from Exton, PA. 6'5, 225 with top-program interest across SEC and Big Ten.", "Ohio State has RPM momentum. SC/PSU/ND battle ongoing.", "PSU cannot let this one leave the state. In-state elite EDGE prospects don't come around often. This is a top-3 priority.", "1st Round NFL Draft Pick", "Micah Parsons"],
  [playerIds[12], "Mike V", "A-", null, "A", "A", "B+", "New PSU staff made Brown a priority — in-home visit done, offer extended. Spring visit already scheduled.", "Needs continued development of pass rush technique. Raw but toolsy.", "Fast movement from new staff. PSU's DL development under last staff produced first-round picks. New staff leaning into that legacy.", "Power 5 Starter, NFL Day 2-3", "Nolan Smith"],
  [playerIds[15], "Mike V", "A+", "A+", null, "A+", "A-", "Former PSU commit. 5-star McKeesport RB. Electric speed, vision, and contact balance that's rare at this age.", "Lost to Georgia after January visit. Speed of recruitment matters — this is the cautionary tale.", "Flipped to Georgia. That recruitment is closed. The lesson: PSU can't let the next one get away.", "1st Round NFL Draft Pick", "Bijan Robinson"],
];

for (const r of reports) { insertReport.run(...r); }
console.log(`Seeded ${reports.length} scouting reports`);

// ── Transfer Portal Entries ──
const insertPortal = db.prepare("INSERT INTO transfer_portal (player_id, transfer_likelihood, reason, current_playing_time_pct, projected_nil_increase, status) VALUES (?, ?, ?, ?, ?, ?)");
// Create some hypothetical portal watch entries from existing college players
const portalPlayers = [
  { first: "Marcus", last: "Rivera", team: 3, pos: "WR", h: "6'2", w: 195, yr: 2025, hs: "Detroit Catholic Central", city: "Detroit", st: "MI", stars: 4, rank: null, nil: 180000, status: "Active" },
  { first: "Jaylen", last: "Thompson", team: 4, pos: "CB", h: "6'0", w: 185, yr: 2025, hs: "Pickerington Central", city: "Columbus", st: "OH", stars: 4, rank: null, nil: 150000, status: "Active" },
  { first: "Derek", last: "Williams", team: 1, pos: "LB", h: "6'3", w: 235, yr: 2025, hs: "Central Catholic", city: "Portland", st: "OR", stars: 3, rank: null, nil: 90000, status: "Active" },
  { first: "Tyler", last: "Jackson", team: 8, pos: "S", h: "6'1", w: 200, yr: 2025, hs: "Gulliver Prep", city: "Miami", st: "FL", stars: 4, rank: null, nil: 200000, status: "Active" },
];

for (const p of portalPlayers) {
  const pid = Number(insertPlayer.run(p.first, p.last, teamIds[p.team], p.pos, p.h, p.w, p.yr, p.hs, p.city, p.st, p.stars, p.rank, p.nil, p.status, null).lastInsertRowid);
  playerIds.push(pid);
}

insertPortal.run(playerIds[16], 75, "Buried on depth chart behind 2 seniors. Only 25% snap share. Looking for starting opportunity.", 25, 40, "Watch");
insertPortal.run(playerIds[17], 60, "Coaching staff changes. New DC runs different scheme. May not fit new system.", 55, 25, "Watch");
insertPortal.run(playerIds[18], 85, "Publicly expressed frustration with playing time on social media. Portal entry expected.", 15, 60, "In Portal");
insertPortal.run(playerIds[19], 45, "NIL situation. Current deal below market value. Testing waters for better NIL package.", 70, 35, "Watch");
console.log(`Seeded 4 portal entries`);

// ── Merch Items ──
const insertMerch = db.prepare("INSERT INTO merch_items (player_id, name, description, price, category) VALUES (?, ?, ?, ?, ?)");
const merchTargets = [0, 3, 11, 15]; // Mencl, Segarra, Sesay, Spell
for (const idx of merchTargets) {
  const p = playersData[idx];
  insertMerch.run(playerIds[idx], `${p.first} ${p.last} Jersey`, `Official replica jersey`, 89.99, "Jersey");
  insertMerch.run(playerIds[idx], `${p.first} ${p.last} Signed Poster`, `Limited edition signed print`, 49.99, "Poster");
  insertMerch.run(playerIds[idx], `${p.last} #${idx + 1} Hat`, `Snapback cap`, 34.99, "Hat");
}
console.log(`Seeded ${merchTargets.length * 3} merch items`);

// ── Feed Posts ──
const insertFeed = db.prepare("INSERT INTO feed_posts (author, content, post_type, player_id, likes_count, shares_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
const feedData = [
  ["Coach Mike V", "INTEL DROP: Will Mencl (5★ QB, Chandler AZ) completed 70%+ for 3,815 yards last season. Not a project — a ready passer. Oregon leads but PSU is in active pursuit. The offensive identity pitch vs Oregon determines if PSU is real here.", "intel", playerIds[0], 342, 89, "2026-03-10T08:00:00Z"],
  ["Coach Mike V", "DECOMMIT ALERT: Peter Borque has pulled his Michigan pledge. PSU + Virginia Tech are early leaders. Won Gatorade POY in Massachusetts. The timing of this decommit is a SIGNIFICANT opening. PSU needs to lock a visit NOW.", "commit", playerIds[1], 567, 201, "2026-03-09T14:30:00Z"],
  ["Coach Mike V", "🏈 HVU INSIDER CHALLENGE: 2027 QB Call — Penn State needs a quarterback. Who gets there first?\n\n1. Does PSU land Mencl, Borque, or Wood?\n2. Who is PSU's biggest QB competition in 2027?\n3. Does PSU lock a 2027 QB commit before Spring Game?\n\nComplete → 1,000 XP + 3 Sweepstakes Entries", "challenge", null, 891, 312, "2026-03-10T10:00:00Z"],
  ["Coach Mike V", "EDGE WATCH: Abraham Sesay (4★, Exton PA) — Top-ranked EDGE in updated Rivals300. In-state. 6'5, 225. Ohio State has RPM momentum but this isn't closed. PSU CANNOT let this one leave the state. Top-3 priority.", "intel", playerIds[11], 445, 156, "2026-03-08T16:00:00Z"],
  ["Coach Mike V", "LESSON LEARNED: Kemon Spell (5★ RB, McKeesport) flipped to Georgia after January visit. That recruitment is CLOSED. The lesson? Speed matters. PSU can't let the next one get away.", "intel", playerIds[15], 678, 234, "2026-03-07T12:00:00Z"],
  ["Coach Mike V", "RB BOARD UPDATE: Tre Segarra (4★, Byrnes HS) — Marcus Freeman made the in-person visit. Notre Dame has serious momentum. Catholic faith is a real factor. Can PSU's staff generate that level of urgency for a South Carolina kid?", "intel", playerIds[3], 389, 134, "2026-03-06T09:00:00Z"],
  ["Coach Mike V", "SPRING VISIT LOCKED: Mekai Brown (4★ DE) has a spring visit to State College scheduled. New staff made him a priority — in-home visit done, offer extended. PSU's DL development is the strongest pitch in the room.", "intel", playerIds[12], 234, 87, "2026-03-05T11:00:00Z"],
  ["Coach Mike V", "PRO DAY EXPERIENCE: Full Pro Day Credential, Lasch Building & Stadium Tours, Meet PSU GM Derek Hoodjer, Signed Jersey, Lunch with Mike V, Framed Signed Print, and Social Media Recognition. Enter at insider.happyvalleyunited.com", "update", null, 1203, 456, "2026-03-04T08:00:00Z"],
];
for (const f of feedData) { insertFeed.run(...f); }
console.log(`Seeded ${feedData.length} feed posts`);

// ── NFL Projections (for top recruits) ──
const insertNfl = db.prepare("INSERT INTO nfl_projections (player_id, draft_probability, projected_round, projected_pick_range, projected_role, nfl_comparison, nfl_comp_similarity, secondary_comparison, player_archetype, bust_probability, pro_bowl_probability, projected_rookie_contract, projected_second_contract, career_earnings_est) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
const nflData = [
  [playerIds[0], 82, 1, "8-20", "Starting QB", "Justin Herbert", 72, "Dak Prescott", "Pro-Style Pocket Passer", 12, 28, 32000000, 180000000, 350000000],
  [playerIds[1], 55, 2, "35-55", "Starting QB", "Mac Jones", 68, "Kirk Cousins", "Efficient Game Manager", 22, 12, 8000000, 80000000, 180000000],
  [playerIds[3], 70, 1, "15-30", "Starting RB", "Saquon Barkley", 65, "Josh Jacobs", "Three-Down Back", 15, 22, 18000000, 60000000, 150000000],
  [playerIds[11], 88, 1, "1-10", "Starting EDGE", "Micah Parsons", 78, "Myles Garrett", "Elite Pass Rusher", 8, 35, 40000000, 120000000, 300000000],
  [playerIds[15], 90, 1, "1-5", "Feature Back", "Bijan Robinson", 80, "Saquon Barkley", "Generational RB", 6, 40, 35000000, 70000000, 200000000],
];
for (const n of nflData) { insertNfl.run(...n); }
console.log(`Seeded ${nflData.length} NFL projections`);

// ── Scholastic Data ──
const insertScholastic = db.prepare("INSERT INTO scholastic_data (player_id, gpa, sat_score, act_score, ncaa_eligible, core_gpa, academic_standing, intended_major) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
const majors = ["Business", "Communications", "Kinesiology", "Sports Management", "Liberal Arts", "Undecided"];
for (let i = 0; i < playersData.length; i++) {
  const gpa = +(2.8 + Math.random() * 1.2).toFixed(2);
  const sat = 1000 + Math.floor(Math.random() * 300);
  const act = Math.floor(sat / 50) + Math.floor(Math.random() * 4);
  insertScholastic.run(playerIds[i], gpa, sat, act, 1, +(gpa - 0.1).toFixed(2), "Good Standing", majors[Math.floor(Math.random() * majors.length)]);
}
console.log(`Seeded ${playersData.length} scholastic records`);

db.close();
console.log("\nDatabase seeded successfully with HVU Insider 2027 Target Board!");
