import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const SOURCE_DB = path.join(process.cwd(), "mikev-scout.db");
const VERCEL_DB = "/tmp/mikev-scout.db";

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
      conference TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
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
      committed_to TEXT,
      photo_url TEXT,
      merch_store_url TEXT,
      nil_value INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      home_team_id INTEGER REFERENCES teams(id),
      away_team_id INTEGER REFERENCES teams(id),
      week_number INTEGER NOT NULL,
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
      snaps INTEGER DEFAULT 0,
      pass_completions INTEGER DEFAULT 0,
      pass_attempts INTEGER DEFAULT 0,
      pass_yards INTEGER DEFAULT 0,
      pass_tds INTEGER DEFAULT 0,
      interceptions INTEGER DEFAULT 0,
      rush_attempts INTEGER DEFAULT 0,
      rush_yards INTEGER DEFAULT 0,
      rush_tds INTEGER DEFAULT 0,
      receptions INTEGER DEFAULT 0,
      rec_yards INTEGER DEFAULT 0,
      rec_tds INTEGER DEFAULT 0,
      tackles INTEGER DEFAULT 0,
      solo_tackles INTEGER DEFAULT 0,
      tackles_for_loss INTEGER DEFAULT 0,
      sacks REAL DEFAULT 0,
      forced_fumbles INTEGER DEFAULT 0,
      interceptions_def INTEGER DEFAULT 0,
      pass_breakups INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS football_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL UNIQUE REFERENCES players(id),
      top_speed_mph REAL,
      top_speed_times_reached INTEGER DEFAULT 0,
      avg_top_speed_pos REAL,
      forty_yard REAL,
      shuttle REAL,
      vertical_jump REAL,
      broad_jump REAL,
      bench_press_reps INTEGER,
      throw_velocity_mph REAL,
      throw_velocity_avg_pos REAL,
      tackle_force_lbs REAL,
      block_force_lbs REAL,
      nfl_avg_tackle_force REAL,
      nfl_avg_block_force REAL,
      wingspan TEXT,
      hand_size REAL,
      arm_length REAL,
      updated_at TEXT DEFAULT (datetime('now'))
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
      football_iq_grade TEXT,
      strengths TEXT,
      weaknesses TEXT,
      notes TEXT,
      projection TEXT,
      comparison TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS transfer_portal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL REFERENCES players(id),
      transfer_likelihood REAL DEFAULT 0,
      reason TEXT,
      current_playing_time_pct REAL DEFAULT 0,
      projected_nil_increase REAL DEFAULT 0,
      portal_entry_date TEXT,
      status TEXT DEFAULT 'Watch',
      destination TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS social_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL DEFAULT 'fan_1',
      player_id INTEGER NOT NULL REFERENCES players(id),
      action_type TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, player_id, action_type)
    );

    CREATE TABLE IF NOT EXISTS feed_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT NOT NULL DEFAULT 'Coach Mike V',
      content TEXT NOT NULL,
      post_type TEXT NOT NULL DEFAULT 'update',
      player_id INTEGER REFERENCES players(id),
      likes_count INTEGER DEFAULT 0,
      shares_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS merch_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL REFERENCES players(id),
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      category TEXT NOT NULL DEFAULT 'Apparel',
      in_stock INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS nfl_projections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL UNIQUE REFERENCES players(id),
      draft_probability REAL DEFAULT 0,
      projected_round INTEGER,
      projected_pick_range TEXT,
      projected_role TEXT,
      nfl_comparison TEXT,
      nfl_comp_similarity REAL,
      secondary_comparison TEXT,
      player_archetype TEXT,
      bust_probability REAL DEFAULT 0,
      pro_bowl_probability REAL DEFAULT 0,
      projected_rookie_contract INTEGER,
      projected_second_contract INTEGER,
      career_earnings_est INTEGER,
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
      academic_standing TEXT DEFAULT 'Good Standing',
      intended_major TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
    CREATE INDEX IF NOT EXISTS idx_stats_player ON player_stats(player_id);
    CREATE INDEX IF NOT EXISTS idx_stats_game ON player_stats(game_id);
    CREATE INDEX IF NOT EXISTS idx_reports_player ON scouting_reports(player_id);
    CREATE INDEX IF NOT EXISTS idx_games_date ON games(game_date);
    CREATE INDEX IF NOT EXISTS idx_social_player ON social_actions(player_id);
    CREATE INDEX IF NOT EXISTS idx_social_user ON social_actions(user_id);
    CREATE INDEX IF NOT EXISTS idx_portal_player ON transfer_portal(player_id);
    CREATE INDEX IF NOT EXISTS idx_merch_player ON merch_items(player_id);
    CREATE INDEX IF NOT EXISTS idx_feed_date ON feed_posts(created_at);

    CREATE TABLE IF NOT EXISTS nil_contracts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL UNIQUE REFERENCES players(id),
      player_legal_name TEXT NOT NULL,
      player_email TEXT NOT NULL,
      license_type TEXT NOT NULL DEFAULT 'non-exclusive',
      revenue_split_player REAL NOT NULL DEFAULT 70,
      revenue_split_collective REAL NOT NULL DEFAULT 30,
      merch_categories TEXT NOT NULL DEFAULT 'Apparel,Headwear,Accessories',
      contract_status TEXT NOT NULL DEFAULT 'active',
      signed_at TEXT DEFAULT (datetime('now')),
      ip_address TEXT,
      digital_signature TEXT NOT NULL,
      terms_version TEXT NOT NULL DEFAULT '1.0',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_nil_contracts_player ON nil_contracts(player_id);
  `);
}
