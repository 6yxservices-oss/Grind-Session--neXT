import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "f1-next.db");

// Delete existing DB
try { require("fs").unlinkSync(DB_PATH); } catch {}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create schema
db.exec(`
  CREATE TABLE IF NOT EXISTS teams (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, series TEXT NOT NULL, country TEXT NOT NULL, engine_supplier TEXT, logo_url TEXT, created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS drivers (id INTEGER PRIMARY KEY AUTOINCREMENT, first_name TEXT NOT NULL, last_name TEXT NOT NULL, team_id INTEGER REFERENCES teams(id), nationality TEXT NOT NULL, date_of_birth TEXT, age INTEGER, current_series TEXT NOT NULL, super_license_points INTEGER DEFAULT 0, super_license_eligible INTEGER DEFAULT 0, career_wins INTEGER DEFAULT 0, career_podiums INTEGER DEFAULT 0, career_poles INTEGER DEFAULT 0, rating INTEGER DEFAULT 0, ranking INTEGER, status TEXT DEFAULT 'Active', academy TEXT, photo_url TEXT, merch_store_url TEXT, market_value INTEGER DEFAULT 0, f1_target_team TEXT, created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS races (id INTEGER PRIMARY KEY AUTOINCREMENT, series TEXT NOT NULL, round_number INTEGER NOT NULL, race_name TEXT NOT NULL, circuit TEXT NOT NULL, country TEXT NOT NULL, race_date TEXT NOT NULL, status TEXT DEFAULT 'Upcoming', created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS race_results (id INTEGER PRIMARY KEY AUTOINCREMENT, driver_id INTEGER NOT NULL REFERENCES drivers(id), race_id INTEGER NOT NULL REFERENCES races(id), qualifying_position INTEGER, race_position INTEGER, grid_position INTEGER, fastest_lap INTEGER DEFAULT 0, points_scored REAL DEFAULT 0, dnf INTEGER DEFAULT 0, dnf_reason TEXT, gap_to_leader TEXT, created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS performance_metrics (id INTEGER PRIMARY KEY AUTOINCREMENT, driver_id INTEGER NOT NULL UNIQUE REFERENCES drivers(id), avg_qualifying_delta REAL, avg_race_pace_delta REAL, wet_weather_rating INTEGER, tire_management_rating INTEGER, overtaking_rating INTEGER, consistency_rating INTEGER, racecraft_rating INTEGER, starts_rating INTEGER, reaction_time_avg REAL, reaction_time_best REAL, top_speed_kph REAL, avg_top_speed_series REAL, sector_speciality TEXT, mental_resilience_rating INTEGER, adaptability_rating INTEGER, updated_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS scouting_reports (id INTEGER PRIMARY KEY AUTOINCREMENT, driver_id INTEGER NOT NULL REFERENCES drivers(id), race_id INTEGER REFERENCES races(id), scout_name TEXT NOT NULL, overall_grade TEXT NOT NULL, speed_grade TEXT, racecraft_grade TEXT, consistency_grade TEXT, race_iq_grade TEXT, strengths TEXT, weaknesses TEXT, notes TEXT, projection TEXT, comparison TEXT, created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS driver_market (id INTEGER PRIMARY KEY AUTOINCREMENT, driver_id INTEGER NOT NULL REFERENCES drivers(id), contract_status TEXT DEFAULT 'Under Contract', current_contract_end TEXT, availability_likelihood REAL DEFAULT 0, interested_teams TEXT, reason TEXT, estimated_salary INTEGER, created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS social_actions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL DEFAULT 'fan_1', driver_id INTEGER NOT NULL REFERENCES drivers(id), action_type TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')), UNIQUE(user_id, driver_id, action_type));
  CREATE TABLE IF NOT EXISTS fan_votes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL DEFAULT 'fan_1', driver_id INTEGER NOT NULL REFERENCES drivers(id), target_team TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')), UNIQUE(user_id, driver_id, target_team));
  CREATE TABLE IF NOT EXISTS feed_posts (id INTEGER PRIMARY KEY AUTOINCREMENT, author TEXT NOT NULL DEFAULT 'Haas neXT', content TEXT NOT NULL, post_type TEXT NOT NULL DEFAULT 'update', driver_id INTEGER REFERENCES drivers(id), team_context TEXT, likes_count INTEGER DEFAULT 0, shares_count INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS merch_items (id INTEGER PRIMARY KEY AUTOINCREMENT, driver_id INTEGER NOT NULL REFERENCES drivers(id), name TEXT NOT NULL, description TEXT, price REAL NOT NULL, image_url TEXT, category TEXT NOT NULL DEFAULT 'Apparel', in_stock INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS f1_projections (id INTEGER PRIMARY KEY AUTOINCREMENT, driver_id INTEGER NOT NULL UNIQUE REFERENCES drivers(id), f1_probability REAL DEFAULT 0, projected_year INTEGER, target_team TEXT, projected_role TEXT, f1_comparison TEXT, f1_comp_similarity REAL, secondary_comparison TEXT, driver_archetype TEXT, championship_probability REAL DEFAULT 0, career_podium_est INTEGER, projected_first_contract INTEGER, projected_peak_salary INTEGER, career_earnings_est INTEGER, updated_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS driver_contracts (id INTEGER PRIMARY KEY AUTOINCREMENT, driver_id INTEGER NOT NULL UNIQUE REFERENCES drivers(id), driver_legal_name TEXT NOT NULL, driver_email TEXT NOT NULL, license_type TEXT NOT NULL DEFAULT 'non-exclusive', revenue_split_driver REAL NOT NULL DEFAULT 70, revenue_split_team REAL NOT NULL DEFAULT 30, merch_categories TEXT NOT NULL DEFAULT 'Apparel,Headwear,Accessories', contract_status TEXT NOT NULL DEFAULT 'active', signed_at TEXT DEFAULT (datetime('now')), ip_address TEXT, digital_signature TEXT NOT NULL, terms_version TEXT NOT NULL DEFAULT '1.0', created_at TEXT DEFAULT (datetime('now')));
`);

// ── TEAMS (F2/F3 teams) ──
const insertTeam = db.prepare("INSERT INTO teams (name, series, country, engine_supplier) VALUES (?, ?, ?, ?)");
const teams = [
  ["Prema Racing", "F2", "Italy", "Dallara"],
  ["ART Grand Prix", "F2", "France", "Dallara"],
  ["Campos Racing", "F2", "Spain", "Dallara"],
  ["DAMS", "F2", "France", "Dallara"],
  ["Invicta Racing", "F2", "UK", "Dallara"],
  ["MP Motorsport", "F2", "Netherlands", "Dallara"],
  ["Hitech Pulse-Eight", "F2", "UK", "Dallara"],
  ["Rodin Motorsport", "F2", "New Zealand", "Dallara"],
  ["Trident", "F3", "Italy", "Dallara"],
  ["Prema Racing F3", "F3", "Italy", "Dallara"],
  ["ART Grand Prix F3", "F3", "France", "Dallara"],
  ["Van Amersfoort Racing", "F3", "Netherlands", "Dallara"],
];
teams.forEach((t) => insertTeam.run(...t));
console.log(`Seeded ${teams.length} teams`);

// ── DRIVERS (Real F2/F3 talent) ──
const insertDriver = db.prepare("INSERT INTO drivers (first_name, last_name, team_id, nationality, age, current_series, super_license_points, super_license_eligible, career_wins, career_podiums, career_poles, rating, ranking, status, academy, market_value, f1_target_team) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
const drivers = [
  // F2 Top Tier - Haas targets
  ["Gabriel", "Bortoleto", 1, "Brazilian", 20, "F2", 40, 1, 3, 11, 4, 5, 1, "Active", "Alpine Academy", 8000000, "Both"],
  ["Isack", "Hadjar", 6, "French", 20, "F2", 38, 0, 4, 10, 3, 5, 2, "Active", "Red Bull Junior", 7500000, "Both"],
  ["Paul", "Aron", 7, "Estonian", 20, "F2", 30, 0, 2, 7, 2, 4, 3, "Active", "Mercedes Junior", 5000000, "Haas"],
  ["Jak", "Crawford", 3, "American", 20, "F2", 25, 0, 1, 5, 1, 4, 5, "Active", null, 4000000, "Haas"],
  ["Zane", "Maloney", 8, "Barbadian", 21, "F2", 28, 0, 3, 8, 2, 4, 4, "Active", "Sauber Academy", 4500000, "Both"],

  // F2 Mid-Tier - Alpine targets
  ["Victor", "Martins", 2, "French", 22, "F2", 22, 0, 1, 4, 3, 4, 6, "Active", "Alpine Academy", 3500000, "Alpine"],
  ["Kimi", "Antonelli", 1, "Italian", 18, "F2", 35, 0, 5, 9, 6, 5, 7, "Active", "Mercedes Junior", 10000000, "Both"],
  ["Oliver", "Bearman", 1, "British", 19, "F2", 32, 0, 2, 6, 2, 5, 8, "Active", "Ferrari Driver Academy", 7000000, "Haas"],

  // F3 Rising Stars
  ["Arvid", "Lindblad", 10, "British", 17, "F3", 15, 0, 4, 8, 5, 4, 9, "Active", "Red Bull Junior", 3000000, "Both"],
  ["Dino", "Beganovic", 9, "Swedish", 20, "F3", 18, 0, 2, 6, 1, 4, 10, "Active", "Ferrari Driver Academy", 2500000, "Alpine"],
  ["Gabriele", "Mini", 7, "Italian", 19, "F3", 12, 0, 3, 5, 2, 3, 11, "Active", "Alpine Academy", 2000000, "Alpine"],
  ["Luke", "Browning", 7, "British", 21, "F3", 20, 0, 3, 7, 4, 4, 12, "Active", "Williams Academy", 2800000, "Both"],

  // American / Wildcard entries
  ["Juju", "Noda", 5, "American", 18, "F3", 8, 0, 0, 2, 0, 3, 15, "Active", null, 1500000, "Haas"],
  ["Ugo", "Ugochukwu", 11, "American", 17, "F3", 6, 0, 1, 3, 1, 3, 16, "Active", "McLaren Junior", 2000000, "Haas"],

  // IndyCar Crossover
  ["Colton", "Herta", null, "American", 24, "IndyCar", 32, 0, 7, 18, 8, 5, 13, "Active", null, 6000000, "Haas"],
  ["Theo", "Pourchaire", 2, "French", 21, "F2", 35, 0, 5, 12, 4, 5, 14, "Active", "Sauber Academy", 6500000, "Alpine"],
];

drivers.forEach((d) => insertDriver.run(...d));
console.log(`Seeded ${drivers.length} drivers`);

// ── RACES ──
const insertRace = db.prepare("INSERT INTO races (series, round_number, race_name, circuit, country, race_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
const races = [
  ["F2", 1, "Bahrain Sprint", "Bahrain International Circuit", "Bahrain", "2025-03-01", "Completed"],
  ["F2", 1, "Bahrain Feature", "Bahrain International Circuit", "Bahrain", "2025-03-02", "Completed"],
  ["F2", 2, "Saudi Arabia Sprint", "Jeddah Corniche Circuit", "Saudi Arabia", "2025-03-08", "Completed"],
  ["F2", 2, "Saudi Arabia Feature", "Jeddah Corniche Circuit", "Saudi Arabia", "2025-03-09", "Completed"],
  ["F3", 1, "Bahrain Sprint", "Bahrain International Circuit", "Bahrain", "2025-03-01", "Completed"],
  ["F3", 1, "Bahrain Feature", "Bahrain International Circuit", "Bahrain", "2025-03-02", "Completed"],
  ["F2", 3, "Melbourne Sprint", "Albert Park Circuit", "Australia", "2025-03-22", "Upcoming"],
  ["F2", 3, "Melbourne Feature", "Albert Park Circuit", "Australia", "2025-03-23", "Upcoming"],
];
races.forEach((r) => insertRace.run(...r));
console.log(`Seeded ${races.length} races`);

// ── RACE RESULTS (for completed races) ──
const insertResult = db.prepare("INSERT INTO race_results (driver_id, race_id, qualifying_position, race_position, grid_position, fastest_lap, points_scored, dnf, dnf_reason, gap_to_leader) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
const results = [
  // Bahrain F2 Sprint (race 1)
  [1, 1, 2, 1, 2, 1, 10, 0, null, null], // Bortoleto P1
  [2, 1, 1, 2, 1, 0, 8, 0, null, "+1.2s"], // Hadjar P2
  [7, 1, 3, 3, 3, 0, 6, 0, null, "+3.4s"], // Antonelli P3
  [8, 1, 4, 4, 4, 0, 5, 0, null, "+5.1s"], // Bearman P4
  [3, 1, 6, 5, 6, 0, 4, 0, null, "+7.8s"], // Aron P5
  // Bahrain F2 Feature (race 2)
  [7, 2, 1, 1, 1, 1, 25, 0, null, null], // Antonelli wins feature
  [1, 2, 3, 2, 3, 0, 18, 0, null, "+2.1s"],
  [16, 2, 5, 3, 5, 0, 15, 0, null, "+4.5s"], // Pourchaire P3
  [2, 2, 2, 4, 2, 0, 12, 0, null, "+6.3s"],
  [5, 2, 4, 5, 4, 0, 10, 0, null, "+8.9s"], // Maloney P5
  // Saudi F2 Sprint (race 3)
  [2, 3, 1, 1, 1, 0, 10, 0, null, null], // Hadjar wins
  [8, 3, 3, 2, 3, 1, 8, 0, null, "+0.8s"],
  [1, 3, 2, 3, 2, 0, 6, 0, null, "+2.3s"],
  [4, 3, 7, 4, 7, 0, 5, 0, null, "+4.1s"], // Crawford P4
  // Bahrain F3 Sprint (race 5)
  [9, 5, 1, 1, 1, 1, 10, 0, null, null], // Lindblad P1
  [10, 5, 3, 2, 3, 0, 8, 0, null, "+1.5s"], // Beganovic P2
  [12, 5, 2, 3, 2, 0, 6, 0, null, "+3.2s"], // Browning P3
  [11, 5, 5, 4, 5, 0, 5, 0, null, "+5.6s"], // Mini P4
  // Bahrain F3 Feature (race 6)
  [12, 6, 1, 1, 1, 0, 25, 0, null, null], // Browning wins
  [9, 6, 2, 2, 2, 1, 18, 0, null, "+1.8s"],
  [14, 6, 8, 3, 8, 0, 15, 0, null, "+3.1s"], // Ugochukwu P3
  [10, 6, 3, 4, 3, 0, 12, 0, null, "+4.7s"],
];
results.forEach((r) => insertResult.run(...r));
console.log(`Seeded ${results.length} race results`);

// ── PERFORMANCE METRICS ──
const insertMetrics = db.prepare("INSERT INTO performance_metrics (driver_id, avg_qualifying_delta, avg_race_pace_delta, wet_weather_rating, tire_management_rating, overtaking_rating, consistency_rating, racecraft_rating, starts_rating, reaction_time_avg, reaction_time_best, top_speed_kph, avg_top_speed_series, sector_speciality, mental_resilience_rating, adaptability_rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
const metrics = [
  [1, -0.085, -0.042, 88, 92, 85, 90, 91, 87, 0.215, 0.198, 332.4, 328.1, "S2", 89, 91], // Bortoleto
  [2, -0.102, -0.055, 82, 85, 92, 84, 89, 90, 0.208, 0.191, 334.1, 328.1, "S1", 85, 83], // Hadjar
  [3, -0.065, -0.031, 76, 80, 78, 85, 80, 82, 0.225, 0.208, 330.2, 328.1, "S3", 82, 80], // Aron
  [4, -0.048, -0.025, 72, 78, 80, 80, 82, 79, 0.230, 0.215, 329.5, 328.1, "S1", 78, 85], // Crawford
  [5, -0.072, -0.038, 80, 88, 83, 87, 85, 84, 0.218, 0.202, 331.8, 328.1, "S2", 86, 84], // Maloney
  [6, -0.055, -0.030, 85, 82, 75, 78, 80, 76, 0.228, 0.210, 329.8, 328.1, "S1", 80, 82], // Martins
  [7, -0.125, -0.065, 92, 88, 95, 85, 94, 91, 0.198, 0.185, 335.2, 328.1, "S2", 88, 95], // Antonelli
  [8, -0.090, -0.048, 84, 86, 82, 88, 86, 85, 0.220, 0.205, 333.0, 328.1, "S3", 90, 88], // Bearman
  [9, -0.110, -0.052, 78, 75, 88, 82, 87, 88, 0.212, 0.195, 318.5, 315.2, "S1", 84, 86], // Lindblad
  [10, -0.068, -0.035, 74, 82, 76, 84, 79, 80, 0.232, 0.218, 316.8, 315.2, "S2", 80, 78], // Beganovic
  [11, -0.058, -0.028, 70, 76, 82, 78, 80, 77, 0.235, 0.220, 317.2, 315.2, "S3", 76, 80], // Mini
  [12, -0.082, -0.040, 86, 84, 80, 86, 83, 83, 0.222, 0.208, 319.0, 315.2, "S1", 85, 82], // Browning
  [15, -0.030, -0.015, 85, 90, 88, 92, 90, 86, 0.195, 0.182, 350.2, 345.0, null, 92, 78], // Herta (IndyCar)
  [16, -0.095, -0.050, 86, 90, 84, 89, 87, 85, 0.210, 0.195, 332.8, 328.1, "S2", 88, 86], // Pourchaire
];
metrics.forEach((m) => insertMetrics.run(...m));
console.log(`Seeded ${metrics.length} performance metrics`);

// ── SCOUTING REPORTS ──
const insertReport = db.prepare("INSERT INTO scouting_reports (driver_id, race_id, scout_name, overall_grade, speed_grade, racecraft_grade, consistency_grade, race_iq_grade, strengths, weaknesses, notes, projection, comparison) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
const reports = [
  [7, 2, "neXT Scout Team", "A+", "A+", "A", "A", "A+", "Extraordinary raw pace, fearless overtaking, adaptable in all conditions", "Occasional over-aggression in wheel-to-wheel, young and still maturing", "Antonelli is the generational talent. His Bahrain Feature win was dominant — fastest in every sector. He has the same instinctive speed Verstappen showed in F3.", "F1 race seat 2026 — future WDC contender", "Max Verstappen"],
  [1, 1, "neXT Scout Team", "A", "A", "A-", "A+", "A", "Brilliant tire management, smooth and consistent, great in traffic", "Qualifying pace sometimes lacking vs top competitors", "Bortoleto is the complete package. His consistency is remarkable — always in the points, rarely makes mistakes. Sprint race win in Bahrain was clinical.", "F1 race seat 2026", "Carlos Sainz"],
  [2, 3, "Haas neXT Analysis", "A", "A+", "A", "B+", "A-", "Blistering one-lap pace, aggressive but clean overtaking", "Consistency needs work — can have quiet weekends mixed with brilliant ones", "Hadjar is lightning quick. His Saudi sprint win was a masterclass in qualifying-to-race conversion. When he's on it, nobody can touch him.", "F1 race seat 2026-2027", "Charles Leclerc"],
  [8, 3, "Alpine neXT Analysis", "A-", "A-", "A", "A", "A-", "Already has F1 experience (Haas sub), mature beyond his years, consistent", "Needs more dominant wins, qualifying can improve", "Bearman has already tasted F1 and proved he belongs. His Saudi P2 shows he's ready to step up.", "F1 race seat 2025-2026", "Lando Norris"],
  [15, null, "Haas neXT Analysis", "A", "A+", "A", "A+", "B+", "IndyCar champion-level pace, oval experience unique, aggressive racer", "Super License situation complicated, no single-seater feeder series recently", "Herta is the American F1 dream. His raw speed is undeniable. The question isn't talent — it's logistics and super license.", "F1 test/reserve 2026, race seat if SL resolved", "Daniel Ricciardo"],
  [9, 5, "neXT Scout Team", "A-", "A", "A-", "B+", "A-", "Exceptional raw pace for his age, strong starts, fearless wheel-to-wheel", "Still learning tire management at this level, can overdrive", "Lindblad is the future. At 17, he's already dominating F3 qualifying. His Bahrain sprint win was clinical.", "F1 race seat 2028", "Lewis Hamilton (early career)"],
  [4, 3, "Haas neXT Analysis", "B+", "B+", "B+", "B", "B+", "American talent pipeline, solid racecraft, improving every weekend", "Not yet at the level of top F2 peers, needs more race wins", "Crawford represents the American F1 pipeline. His P4 in Saudi shows improvement. Haas would benefit from an American driver for marketing.", "F2 champion contender, F1 reserve 2027", "Alexander Rossi"],
];
reports.forEach((r) => insertReport.run(...r));
console.log(`Seeded ${reports.length} scouting reports`);

// ── DRIVER MARKET ──
const insertMarket = db.prepare("INSERT INTO driver_market (driver_id, contract_status, current_contract_end, availability_likelihood, interested_teams, reason, estimated_salary) VALUES (?, ?, ?, ?, ?, ?, ?)");
const marketEntries = [
  [1, "Option Year", "2025-12-31", 75, "Haas, Alpine, Sauber", "Alpine Academy graduate, contract expires end of 2025. Multiple teams interested.", 500000],
  [7, "Under Contract", "2026-12-31", 30, "Mercedes", "Locked into Mercedes pathway but could be loaned to a customer team.", 800000],
  [15, "Free Agent", null, 85, "Haas, Alpine", "No current F1 contract. Super license situation the only barrier. American marketing value enormous for Haas.", 2000000],
  [16, "Option Year", "2025-12-31", 70, "Alpine, Haas, Williams", "Sauber Academy but contract situation unclear. Strong F2 results making him attractive.", 600000],
  [8, "Under Contract", "2026-12-31", 60, "Haas, Sauber", "Ferrari Academy but could be placed at Haas (Ferrari partnership). Already has F1 race experience.", 700000],
  [4, "Under Contract", "2025-12-31", 55, "Haas", "American driver with F2 experience. Perfect marketing fit for Haas US fanbase.", 300000],
];
marketEntries.forEach((m) => insertMarket.run(...m));
console.log(`Seeded ${marketEntries.length} market entries`);

// ── MERCH ITEMS ──
const insertMerch = db.prepare("INSERT INTO merch_items (driver_id, name, price, category) VALUES (?, ?, ?, ?)");
const merchItems = [
  [1, "Bortoleto Team Cap", 35, "Headwear"], [1, "Bortoleto Race Tee", 40, "Apparel"], [1, "1:43 Model Car", 55, "Model"],
  [7, "Antonelli Trucker Hat", 30, "Headwear"], [7, "Antonelli Hoodie", 70, "Apparel"], [7, "Signed Driver Card", 25, "Collectibles"],
  [2, "Hadjar Race Cap", 35, "Headwear"], [2, "Hadjar Performance Tee", 40, "Apparel"],
  [8, "Bearman Team Cap", 35, "Headwear"], [8, "Bearman Race Tee", 40, "Apparel"],
  [15, "Herta USA Cap", 35, "Headwear"], [15, "Herta Stars & Stripes Tee", 45, "Apparel"], [15, "Herta Race Hoodie", 75, "Apparel"],
  [9, "Lindblad Rising Star Tee", 35, "Apparel"], [12, "Browning Team Cap", 30, "Headwear"],
];
merchItems.forEach((m) => insertMerch.run(...m));
console.log(`Seeded ${merchItems.length} merch items`);

// ── F1 PROJECTIONS ──
const insertProjection = db.prepare("INSERT INTO f1_projections (driver_id, f1_probability, projected_year, target_team, projected_role, f1_comparison, f1_comp_similarity, secondary_comparison, driver_archetype, championship_probability, career_podium_est, projected_first_contract, projected_peak_salary, career_earnings_est) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
const projections = [
  [7, 98, 2025, "Mercedes", "Race Seat", "Max Verstappen", 82, "Charles Leclerc", "Complete Driver", 35, 80, 5000000, 25000000, 200000000],
  [1, 88, 2026, "Alpine / Haas", "Race Seat", "Carlos Sainz", 78, "Fernando Alonso", "Consistent Racer", 15, 45, 2000000, 12000000, 80000000],
  [2, 85, 2026, "Red Bull / VCARB", "Race Seat", "Charles Leclerc", 75, "Pierre Gasly", "Qualifying Specialist", 12, 35, 2500000, 15000000, 90000000],
  [8, 90, 2025, "Haas", "Race Seat", "Lando Norris", 72, "Carlos Sainz", "Complete Driver", 10, 40, 1500000, 10000000, 70000000],
  [15, 65, 2026, "Haas", "Test Driver", "Daniel Ricciardo", 80, "Alexander Rossi", "Racecraft Master", 5, 20, 3000000, 8000000, 40000000],
  [16, 82, 2026, "Alpine", "Race Seat", "Pierre Gasly", 76, "Esteban Ocon", "Complete Driver", 8, 30, 1800000, 10000000, 60000000],
  [9, 78, 2028, "Red Bull Junior", "Race Seat", "Lewis Hamilton", 70, "Max Verstappen", "Future Champion", 25, 60, 3000000, 20000000, 150000000],
  [12, 55, 2027, "Williams", "Race Seat", "George Russell", 68, "Lando Norris", "Consistent Racer", 5, 15, 1000000, 5000000, 30000000],
];
projections.forEach((p) => insertProjection.run(...p));
console.log(`Seeded ${projections.length} F1 projections`);

// ── FEED POSTS ──
const insertPost = db.prepare("INSERT INTO feed_posts (author, content, post_type, driver_id, team_context, likes_count, shares_count) VALUES (?, ?, ?, ?, ?, ?, ?)");
const posts = [
  ["Haas neXT", "RACE RECAP: Antonelli dominates Bahrain Feature Race! The 18-year-old Italian put on a masterclass, leading every lap from pole. This kid is special. Fan Vote is LIVE — should he test with Haas?", "race_recap", 7, "haas", 1245, 389],
  ["Alpine neXT", "DRIVER INTEL: Gabriel Bortoleto's tire management data from Bahrain is extraordinary. His deg numbers are better than some current F1 drivers. Alpine Academy product — could he be France's next F1 star?", "intel", 1, "alpine", 892, 234],
  ["Haas neXT", "FAN VOTE UPDATE: Colton Herta leads the Haas neXT vote with 2,340 votes! The American driver has massive fan support. Super License situation remains the key question.", "vote", 15, "haas", 2341, 567],
  ["Alpine neXT", "RISE+ CHALLENGE: Scout 5 F3 drivers this weekend and earn 250 RISE+ points! Top scouts get an exclusive invite to the Alpine garage at Silverstone.", "intel", null, "alpine", 678, 145],
  ["Haas neXT", "MARKET ALERT: Oliver Bearman's contract with Ferrari Academy could see him placed at Haas for 2026. The British teenager already has F1 race experience from his Jeddah sub.", "signing", 8, "haas", 1567, 423],
  ["neXT Feed", "BREAKING: Arvid Lindblad wins F3 Bahrain Sprint at just 17 years old! Red Bull Junior dominating the feeder series. Remember this name.", "race_recap", 9, null, 945, 312],
  ["Alpine neXT", "RISE+ EVENT: Meet the next gen at Silverstone! RISE+ members get paddock access, driver meet & greets, and pit lane walks during the F2/F3 support races. Points required: 5,000", "update", null, "alpine", 1123, 289],
  ["Haas neXT", "SCOUTING REPORT: Jak Crawford's P4 in Saudi shows steady improvement. The American is exactly what Haas needs for their US market strategy. Full analysis on his profile.", "intel", 4, "haas", 456, 98],
];
posts.forEach((p) => insertPost.run(...p));
console.log(`Seeded ${posts.length} feed posts`);

// ── INITIAL FAN VOTES ──
const insertVote = db.prepare("INSERT INTO fan_votes (user_id, driver_id, target_team) VALUES (?, ?, ?)");
const votes: [string, number, string][] = [];
// Simulate some initial voting data
for (let i = 0; i < 50; i++) votes.push([`fan_${100 + i}`, 15, "haas"]); // Herta leads Haas vote
for (let i = 0; i < 35; i++) votes.push([`fan_${200 + i}`, 8, "haas"]); // Bearman
for (let i = 0; i < 28; i++) votes.push([`fan_${300 + i}`, 7, "haas"]); // Antonelli
for (let i = 0; i < 20; i++) votes.push([`fan_${400 + i}`, 4, "haas"]); // Crawford
for (let i = 0; i < 40; i++) votes.push([`fan_${500 + i}`, 1, "alpine"]); // Bortoleto leads Alpine
for (let i = 0; i < 32; i++) votes.push([`fan_${600 + i}`, 16, "alpine"]); // Pourchaire
for (let i = 0; i < 25; i++) votes.push([`fan_${700 + i}`, 6, "alpine"]); // Martins
for (let i = 0; i < 22; i++) votes.push([`fan_${800 + i}`, 7, "alpine"]); // Antonelli
votes.forEach((v) => insertVote.run(...v));
console.log(`Seeded ${votes.length} fan votes`);

console.log("\nDatabase seeded successfully with F2/F3 driver data for Haas neXT / Alpine neXT!");
