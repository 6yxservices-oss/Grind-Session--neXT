import { getDb } from "./db";
import type { Driver, Team, Race, RaceResult, ScoutingReport, PerformanceMetrics, F1Projection, DriverMarketEntry, FeedPost, MerchItem, SocialAction, DriverContract, FanVote } from "./types";

// ── Teams ──────────────────────────────────────────────
export function getAllTeams(): Team[] {
  return getDb().prepare("SELECT * FROM teams ORDER BY name").all() as Team[];
}

export function getTeamById(id: number): (Team & { drivers: Driver[] }) | null {
  const team = getDb().prepare("SELECT * FROM teams WHERE id = ?").get(id) as Team | undefined;
  if (!team) return null;
  const drivers = getDb().prepare("SELECT * FROM drivers WHERE team_id = ? ORDER BY last_name").all(id) as Driver[];
  return { ...team, drivers };
}

// ── Drivers ────────────────────────────────────────────
export function getAllDrivers(filters?: {
  series?: string;
  nationality?: string;
  teamId?: number;
  search?: string;
  targetTeam?: string;
}): Driver[] {
  let query = `SELECT d.*, t.name as team_name FROM drivers d LEFT JOIN teams t ON d.team_id = t.id WHERE 1=1`;
  const params: unknown[] = [];
  if (filters?.series) { query += " AND d.current_series = ?"; params.push(filters.series); }
  if (filters?.nationality) { query += " AND d.nationality = ?"; params.push(filters.nationality); }
  if (filters?.teamId) { query += " AND d.team_id = ?"; params.push(filters.teamId); }
  if (filters?.search) { query += " AND (d.first_name || ' ' || d.last_name LIKE ?)"; params.push(`%${filters.search}%`); }
  if (filters?.targetTeam) { query += " AND (d.f1_target_team = ? OR d.f1_target_team = 'Both')"; params.push(filters.targetTeam); }
  query += " ORDER BY d.rating DESC, d.ranking ASC";
  return getDb().prepare(query).all(...params) as Driver[];
}

export function getDriverById(id: number): (Driver & {
  results: RaceResult[];
  reports: ScoutingReport[];
  metrics: PerformanceMetrics | null;
  f1_projection: F1Projection | null;
  merch: MerchItem[];
  social_counts: Record<string, number>;
  market_entry: DriverMarketEntry | null;
  vote_counts: { haas: number; alpine: number };
}) | null {
  const driver = getDb().prepare(`SELECT d.*, t.name as team_name FROM drivers d LEFT JOIN teams t ON d.team_id = t.id WHERE d.id = ?`).get(id) as Driver | undefined;
  if (!driver) return null;

  const results = getDb().prepare(`SELECT rr.*, r.race_name || ' (' || r.circuit || ')' as race_info FROM race_results rr JOIN races r ON rr.race_id = r.id WHERE rr.driver_id = ? ORDER BY r.race_date DESC`).all(id) as RaceResult[];
  const reports = getDb().prepare(`SELECT sr.* FROM scouting_reports sr WHERE sr.driver_id = ? ORDER BY sr.created_at DESC`).all(id) as ScoutingReport[];
  const metrics = (getDb().prepare("SELECT * FROM performance_metrics WHERE driver_id = ?").get(id) as PerformanceMetrics | undefined) ?? null;
  const f1_projection = (getDb().prepare("SELECT * FROM f1_projections WHERE driver_id = ?").get(id) as F1Projection | undefined) ?? null;
  const merch = getDb().prepare("SELECT * FROM merch_items WHERE driver_id = ? AND in_stock = 1").all(id) as MerchItem[];
  const market_entry = (getDb().prepare("SELECT * FROM driver_market WHERE driver_id = ?").get(id) as DriverMarketEntry | undefined) ?? null;

  const follows = (getDb().prepare("SELECT COUNT(*) as c FROM social_actions WHERE driver_id = ? AND action_type = 'follow'").get(id) as { c: number }).c;
  const likes = (getDb().prepare("SELECT COUNT(*) as c FROM social_actions WHERE driver_id = ? AND action_type = 'like'").get(id) as { c: number }).c;
  const shortlisted = (getDb().prepare("SELECT COUNT(*) as c FROM social_actions WHERE driver_id = ? AND action_type = 'shortlist'").get(id) as { c: number }).c;

  const haasVotes = (getDb().prepare("SELECT COUNT(*) as c FROM fan_votes WHERE driver_id = ? AND target_team = 'haas'").get(id) as { c: number }).c;
  const alpineVotes = (getDb().prepare("SELECT COUNT(*) as c FROM fan_votes WHERE driver_id = ? AND target_team = 'alpine'").get(id) as { c: number }).c;

  return { ...driver, results, reports, metrics, f1_projection, merch, market_entry, social_counts: { follows, likes, shortlisted }, vote_counts: { haas: haasVotes, alpine: alpineVotes } };
}

// ── Races ──────────────────────────────────────────────
export function getAllRaces(filters?: { series?: string; status?: string }): Race[] {
  let query = `SELECT * FROM races WHERE 1=1`;
  const params: unknown[] = [];
  if (filters?.series) { query += " AND series = ?"; params.push(filters.series); }
  if (filters?.status) { query += " AND status = ?"; params.push(filters.status); }
  query += " ORDER BY race_date DESC";
  return getDb().prepare(query).all(...params) as Race[];
}

export function getRaceById(id: number): (Race & { results: (RaceResult & { driver_name: string })[] }) | null {
  const race = getDb().prepare(`SELECT * FROM races WHERE id = ?`).get(id) as Race | undefined;
  if (!race) return null;
  const results = getDb().prepare(`SELECT rr.*, d.first_name || ' ' || d.last_name as driver_name FROM race_results rr JOIN drivers d ON rr.driver_id = d.id WHERE rr.race_id = ? ORDER BY COALESCE(rr.race_position, 999) ASC`).all(id) as (RaceResult & { driver_name: string })[];
  return { ...race, results };
}

// ── Scouting Reports ──────────────────────────────────
export function getAllReports(): ScoutingReport[] {
  return getDb().prepare(`SELECT sr.*, d.first_name || ' ' || d.last_name as driver_name FROM scouting_reports sr JOIN drivers d ON sr.driver_id = d.id ORDER BY sr.created_at DESC`).all() as ScoutingReport[];
}

export function getReportById(id: number): ScoutingReport | null {
  return (getDb().prepare(`SELECT sr.*, d.first_name || ' ' || d.last_name as driver_name FROM scouting_reports sr JOIN drivers d ON sr.driver_id = d.id WHERE sr.id = ?`).get(id) as ScoutingReport | undefined) ?? null;
}

export function createReport(data: Record<string, unknown>): number {
  const result = getDb().prepare(`INSERT INTO scouting_reports (driver_id, race_id, scout_name, overall_grade, speed_grade, racecraft_grade, consistency_grade, race_iq_grade, strengths, weaknesses, notes, projection, comparison) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(data.driver_id, data.race_id ?? null, data.scout_name, data.overall_grade, data.speed_grade ?? null, data.racecraft_grade ?? null, data.consistency_grade ?? null, data.race_iq_grade ?? null, data.strengths ?? null, data.weaknesses ?? null, data.notes ?? null, data.projection ?? null, data.comparison ?? null);
  return Number(result.lastInsertRowid);
}

// ── Driver Market ────────────────────────────────────
export function getDriverMarketFeed(): DriverMarketEntry[] {
  return getDb().prepare(`SELECT dm.*, d.first_name || ' ' || d.last_name as driver_name, d.nationality, d.current_series, d.rating, d.market_value, t.name as team_name FROM driver_market dm JOIN drivers d ON dm.driver_id = d.id LEFT JOIN teams t ON d.team_id = t.id ORDER BY dm.availability_likelihood DESC`).all() as DriverMarketEntry[];
}

// ── Social ─────────────────────────────────────────────
export function toggleSocialAction(userId: string, driverId: number, actionType: string): boolean {
  const existing = getDb().prepare("SELECT id FROM social_actions WHERE user_id = ? AND driver_id = ? AND action_type = ?").get(userId, driverId, actionType);
  if (existing) {
    getDb().prepare("DELETE FROM social_actions WHERE user_id = ? AND driver_id = ? AND action_type = ?").run(userId, driverId, actionType);
    return false;
  }
  getDb().prepare("INSERT INTO social_actions (user_id, driver_id, action_type) VALUES (?, ?, ?)").run(userId, driverId, actionType);
  return true;
}

export function getUserActions(userId: string): SocialAction[] {
  return getDb().prepare("SELECT * FROM social_actions WHERE user_id = ?").all(userId) as SocialAction[];
}

export function getShortlistedDrivers(userId: string): Driver[] {
  return getDb().prepare(`SELECT d.*, t.name as team_name FROM drivers d LEFT JOIN teams t ON d.team_id = t.id JOIN social_actions sa ON d.id = sa.driver_id WHERE sa.user_id = ? AND sa.action_type = 'shortlist' ORDER BY d.rating DESC`).all(userId) as Driver[];
}

// ── Fan Votes ─────────────────────────────────────────
export function castVote(userId: string, driverId: number, targetTeam: string): boolean {
  const existing = getDb().prepare("SELECT id FROM fan_votes WHERE user_id = ? AND driver_id = ? AND target_team = ?").get(userId, driverId, targetTeam);
  if (existing) {
    getDb().prepare("DELETE FROM fan_votes WHERE user_id = ? AND driver_id = ? AND target_team = ?").run(userId, driverId, targetTeam);
    return false;
  }
  getDb().prepare("INSERT INTO fan_votes (user_id, driver_id, target_team) VALUES (?, ?, ?)").run(userId, driverId, targetTeam);
  return true;
}

export function getVoteLeaderboard(targetTeam: string): { driver_id: number; driver_name: string; nationality: string; current_series: string; rating: number; votes: number }[] {
  return getDb().prepare(`SELECT d.id as driver_id, d.first_name || ' ' || d.last_name as driver_name, d.nationality, d.current_series, d.rating, COUNT(fv.id) as votes FROM drivers d JOIN fan_votes fv ON d.id = fv.driver_id WHERE fv.target_team = ? GROUP BY d.id ORDER BY votes DESC LIMIT 20`).all(targetTeam) as { driver_id: number; driver_name: string; nationality: string; current_series: string; rating: number; votes: number }[];
}

// ── Feed ───────────────────────────────────────────────
export function getFeedPosts(teamContext?: string): FeedPost[] {
  let query = `SELECT fp.*, d.first_name || ' ' || d.last_name as driver_name FROM feed_posts fp LEFT JOIN drivers d ON fp.driver_id = d.id WHERE 1=1`;
  const params: unknown[] = [];
  if (teamContext) { query += " AND (fp.team_context = ? OR fp.team_context IS NULL)"; params.push(teamContext); }
  query += " ORDER BY fp.created_at DESC";
  return getDb().prepare(query).all(...params) as FeedPost[];
}

// ── Driver Contracts ──────────────────────────────────
export function getDriverContract(driverId: number): DriverContract | null {
  return (getDb().prepare("SELECT * FROM driver_contracts WHERE driver_id = ?").get(driverId) as DriverContract | undefined) ?? null;
}

export function createDriverContract(data: {
  driver_id: number;
  driver_legal_name: string;
  driver_email: string;
  digital_signature: string;
  ip_address?: string;
}): number {
  const result = getDb().prepare(
    `INSERT INTO driver_contracts (driver_id, driver_legal_name, driver_email, digital_signature, ip_address)
     VALUES (?, ?, ?, ?, ?)`
  ).run(data.driver_id, data.driver_legal_name, data.driver_email, data.digital_signature, data.ip_address ?? null);
  return Number(result.lastInsertRowid);
}

// ── Dashboard ──────────────────────────────────────────
export function getDashboardStats() {
  const db = getDb();
  const driverCount = (db.prepare("SELECT COUNT(*) as c FROM drivers").get() as { c: number }).c;
  const teamCount = (db.prepare("SELECT COUNT(*) as c FROM teams").get() as { c: number }).c;
  const raceCount = (db.prepare("SELECT COUNT(*) as c FROM races").get() as { c: number }).c;
  const reportCount = (db.prepare("SELECT COUNT(*) as c FROM scouting_reports").get() as { c: number }).c;

  const topDrivers = db.prepare(`SELECT d.id, d.first_name, d.last_name, d.nationality, d.current_series, d.rating, d.market_value, d.f1_target_team, d.super_license_points, t.name as team_name, COALESCE(SUM(rr.points_scored), 0) as total_points, COUNT(rr.id) as races FROM drivers d LEFT JOIN teams t ON d.team_id = t.id LEFT JOIN race_results rr ON d.id = rr.driver_id GROUP BY d.id ORDER BY d.rating DESC, total_points DESC LIMIT 10`).all();

  const recentReports = db.prepare(`SELECT sr.id, sr.overall_grade, sr.scout_name, sr.created_at, d.first_name || ' ' || d.last_name as driver_name FROM scouting_reports sr JOIN drivers d ON sr.driver_id = d.id ORDER BY sr.created_at DESC LIMIT 5`).all();

  const marketWatch = db.prepare(`SELECT dm.*, d.first_name || ' ' || d.last_name as driver_name, d.nationality, d.current_series, d.market_value FROM driver_market dm JOIN drivers d ON dm.driver_id = d.id WHERE dm.availability_likelihood >= 50 ORDER BY dm.availability_likelihood DESC LIMIT 5`).all();

  const haasVoteCount = (db.prepare("SELECT COUNT(*) as c FROM fan_votes WHERE target_team = 'haas'").get() as { c: number }).c;
  const alpineVoteCount = (db.prepare("SELECT COUNT(*) as c FROM fan_votes WHERE target_team = 'alpine'").get() as { c: number }).c;

  return { driverCount, teamCount, raceCount, reportCount, topDrivers, recentReports, marketWatch, haasVoteCount, alpineVoteCount };
}
