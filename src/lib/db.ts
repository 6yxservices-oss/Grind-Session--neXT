import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const SOURCE_DB = path.join(process.cwd(), "eybl-scout.db");
const VERCEL_DB = "/tmp/eybl-scout.db";
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
import rawData from "./data.json";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DataStore {
  teams: any[];
  drivers: any[];
  races: any[];
  race_results: any[];
  performance_metrics: any[];
  scouting_reports: any[];
  driver_market: any[];
  social_actions: any[];
  fan_votes: any[];
  feed_posts: any[];
  merch_items: any[];
  f1_projections: any[];
  driver_contracts: any[];
}

// Deep clone so mutations don't corrupt the imported module cache
function freshData(): DataStore {
  return JSON.parse(JSON.stringify(rawData)) as DataStore;
}

let store: DataStore | null = null;

export function getData(): DataStore {
  if (!store) store = freshData();
  return store;
}
