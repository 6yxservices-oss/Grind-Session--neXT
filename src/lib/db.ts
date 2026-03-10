import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const SOURCE_DB = path.join(process.cwd(), "f1-next.db");
const VERCEL_DB = "/tmp/f1-next.db";

function getDbPath() {
  if (process.env.VERCEL) {
    if (!fs.existsSync(VERCEL_DB)) fs.copyFileSync(SOURCE_DB, VERCEL_DB);
    return VERCEL_DB;
  }
  return SOURCE_DB;
}

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(getDbPath());
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      series TEXT NOT NULL,
      country TEXT NOT NULL,
      engine_supplier TEXT,
      logo_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      team_id INTEGER REFERENCES teams(id),
      nationality TEXT NOT NULL,
      date_of_birth TEXT,
      age INTEGER,
      current_series TEXT NOT NULL,
      super_license_points INTEGER DEFAULT 0,
      super_license_eligible INTEGER DEFAULT 0,
      career_wins INTEGER DEFAULT 0,
      career_podiums INTEGER DEFAULT 0,
      career_poles INTEGER DEFAULT 0,
      rating INTEGER DEFAULT 0,
      ranking INTEGER,
      status TEXT DEFAULT 'Active',
      academy TEXT,
      photo_url TEXT,
      merch_store_url TEXT,
      market_value INTEGER DEFAULT 0,
      f1_target_team TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS races (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      series TEXT NOT NULL,
      round_number INTEGER NOT NULL,
      race_name TEXT NOT NULL,
      circuit TEXT NOT NULL,
      country TEXT NOT NULL,
      race_date TEXT NOT NULL,
      status TEXT DEFAULT 'Upcoming',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS race_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER NOT NULL REFERENCES drivers(id),
      race_id INTEGER NOT NULL REFERENCES races(id),
      qualifying_position INTEGER,
      race_position INTEGER,
      grid_position INTEGER,
      fastest_lap INTEGER DEFAULT 0,
      points_scored REAL DEFAULT 0,
      dnf INTEGER DEFAULT 0,
      dnf_reason TEXT,
      gap_to_leader TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS performance_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER NOT NULL UNIQUE REFERENCES drivers(id),
      avg_qualifying_delta REAL,
      avg_race_pace_delta REAL,
      wet_weather_rating INTEGER,
      tire_management_rating INTEGER,
      overtaking_rating INTEGER,
      consistency_rating INTEGER,
      racecraft_rating INTEGER,
      starts_rating INTEGER,
      reaction_time_avg REAL,
      reaction_time_best REAL,
      top_speed_kph REAL,
      avg_top_speed_series REAL,
      sector_speciality TEXT,
      mental_resilience_rating INTEGER,
      adaptability_rating INTEGER,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scouting_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER NOT NULL REFERENCES drivers(id),
      race_id INTEGER REFERENCES races(id),
      scout_name TEXT NOT NULL,
      overall_grade TEXT NOT NULL,
      speed_grade TEXT,
      racecraft_grade TEXT,
      consistency_grade TEXT,
      race_iq_grade TEXT,
      strengths TEXT,
      weaknesses TEXT,
      notes TEXT,
      projection TEXT,
      comparison TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS driver_market (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER NOT NULL REFERENCES drivers(id),
      contract_status TEXT DEFAULT 'Under Contract',
      current_contract_end TEXT,
      availability_likelihood REAL DEFAULT 0,
      interested_teams TEXT,
      reason TEXT,
      estimated_salary INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS social_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL DEFAULT 'fan_1',
      driver_id INTEGER NOT NULL REFERENCES drivers(id),
      action_type TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, driver_id, action_type)
    );

    CREATE TABLE IF NOT EXISTS fan_votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL DEFAULT 'fan_1',
      driver_id INTEGER NOT NULL REFERENCES drivers(id),
      target_team TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, driver_id, target_team)
    );

    CREATE TABLE IF NOT EXISTS feed_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT NOT NULL DEFAULT 'Haas neXT',
      content TEXT NOT NULL,
      post_type TEXT NOT NULL DEFAULT 'update',
      driver_id INTEGER REFERENCES drivers(id),
      team_context TEXT,
      likes_count INTEGER DEFAULT 0,
      shares_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS merch_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER NOT NULL REFERENCES drivers(id),
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      category TEXT NOT NULL DEFAULT 'Apparel',
      in_stock INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS f1_projections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER NOT NULL UNIQUE REFERENCES drivers(id),
      f1_probability REAL DEFAULT 0,
      projected_year INTEGER,
      target_team TEXT,
      projected_role TEXT,
      f1_comparison TEXT,
      f1_comp_similarity REAL,
      secondary_comparison TEXT,
      driver_archetype TEXT,
      championship_probability REAL DEFAULT 0,
      career_podium_est INTEGER,
      projected_first_contract INTEGER,
      projected_peak_salary INTEGER,
      career_earnings_est INTEGER,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS driver_contracts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER NOT NULL UNIQUE REFERENCES drivers(id),
      driver_legal_name TEXT NOT NULL,
      driver_email TEXT NOT NULL,
      license_type TEXT NOT NULL DEFAULT 'non-exclusive',
      revenue_split_driver REAL NOT NULL DEFAULT 70,
      revenue_split_team REAL NOT NULL DEFAULT 30,
      merch_categories TEXT NOT NULL DEFAULT 'Apparel,Headwear,Accessories',
      contract_status TEXT NOT NULL DEFAULT 'active',
      signed_at TEXT DEFAULT (datetime('now')),
      ip_address TEXT,
      digital_signature TEXT NOT NULL,
      terms_version TEXT NOT NULL DEFAULT '1.0',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_drivers_team ON drivers(team_id);
    CREATE INDEX IF NOT EXISTS idx_results_driver ON race_results(driver_id);
    CREATE INDEX IF NOT EXISTS idx_results_race ON race_results(race_id);
    CREATE INDEX IF NOT EXISTS idx_reports_driver ON scouting_reports(driver_id);
    CREATE INDEX IF NOT EXISTS idx_races_date ON races(race_date);
    CREATE INDEX IF NOT EXISTS idx_social_driver ON social_actions(driver_id);
    CREATE INDEX IF NOT EXISTS idx_social_user ON social_actions(user_id);
    CREATE INDEX IF NOT EXISTS idx_market_driver ON driver_market(driver_id);
    CREATE INDEX IF NOT EXISTS idx_merch_driver ON merch_items(driver_id);
    CREATE INDEX IF NOT EXISTS idx_feed_date ON feed_posts(created_at);
    CREATE INDEX IF NOT EXISTS idx_votes_driver ON fan_votes(driver_id);
    CREATE INDEX IF NOT EXISTS idx_contracts_driver ON driver_contracts(driver_id);
  `);
}
