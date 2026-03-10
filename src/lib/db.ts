import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const SOURCE_DB = path.join(process.cwd(), "eybl-scout.db");
const VERCEL_DB = "/tmp/eybl-scout.db";

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

    CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
    CREATE INDEX IF NOT EXISTS idx_scholastic_player ON scholastic_data(player_id);
    CREATE INDEX IF NOT EXISTS idx_stats_player ON player_stats(player_id);
    CREATE INDEX IF NOT EXISTS idx_stats_game ON player_stats(game_id);
    CREATE INDEX IF NOT EXISTS idx_reports_player ON scouting_reports(player_id);
    CREATE INDEX IF NOT EXISTS idx_games_date ON games(game_date);
  `);
}
