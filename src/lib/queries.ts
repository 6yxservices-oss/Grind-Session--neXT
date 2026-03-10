import { getDb } from "./db";
import type { Player, Team, Game, PlayerStats, ScoutingReport, FootballMetrics, NflProjection, ScholasticData, TransferPortalEntry, FeedPost, MerchItem, SocialAction, NilContract } from "./types";

// ── Teams ──────────────────────────────────────────────
export function getAllTeams(): Team[] {
  return getDb().prepare("SELECT * FROM teams ORDER BY name").all() as Team[];
}

export function getTeamById(id: number): (Team & { players: Player[] }) | null {
  const team = getDb().prepare("SELECT * FROM teams WHERE id = ?").get(id) as Team | undefined;
  if (!team) return null;
  const players = getDb().prepare("SELECT * FROM players WHERE team_id = ? ORDER BY last_name").all(id) as Player[];
  return { ...team, players };
}

// ── Players ────────────────────────────────────────────
export function getAllPlayers(filters?: {
  position?: string;
  classYear?: number;
  teamId?: number;
  search?: string;
}): Player[] {
  let query = `SELECT p.*, t.name as team_name FROM players p LEFT JOIN teams t ON p.team_id = t.id WHERE 1=1`;
  const params: unknown[] = [];
  if (filters?.position) { query += " AND p.position = ?"; params.push(filters.position); }
  if (filters?.classYear) { query += " AND p.class_year = ?"; params.push(filters.classYear); }
  if (filters?.teamId) { query += " AND p.team_id = ?"; params.push(filters.teamId); }
  if (filters?.search) { query += " AND (p.first_name || ' ' || p.last_name LIKE ?)"; params.push(`%${filters.search}%`); }
  query += " ORDER BY p.star_rating DESC, p.ranking ASC";
  return getDb().prepare(query).all(...params) as Player[];
}

export function getPlayerById(id: number): (Player & {
  stats: PlayerStats[];
  reports: ScoutingReport[];
  metrics: FootballMetrics | null;
  nfl_projection: NflProjection | null;
  scholastic: ScholasticData | null;
  merch: MerchItem[];
  social_counts: Record<string, number>;
  portal_entry: TransferPortalEntry | null;
}) | null {
  const player = getDb().prepare(`SELECT p.*, t.name as team_name FROM players p LEFT JOIN teams t ON p.team_id = t.id WHERE p.id = ?`).get(id) as Player | undefined;
  if (!player) return null;

  const stats = getDb().prepare(`SELECT ps.*, ht.name || ' vs ' || at.name as game_info FROM player_stats ps JOIN games g ON ps.game_id = g.id JOIN teams ht ON g.home_team_id = ht.id JOIN teams at ON g.away_team_id = at.id WHERE ps.player_id = ? ORDER BY g.game_date DESC`).all(id) as PlayerStats[];
  const reports = getDb().prepare(`SELECT sr.* FROM scouting_reports sr WHERE sr.player_id = ? ORDER BY sr.created_at DESC`).all(id) as ScoutingReport[];
  const metrics = (getDb().prepare("SELECT * FROM football_metrics WHERE player_id = ?").get(id) as FootballMetrics | undefined) ?? null;
  const nfl_projection = (getDb().prepare("SELECT * FROM nfl_projections WHERE player_id = ?").get(id) as NflProjection | undefined) ?? null;
  const scholastic = (getDb().prepare("SELECT * FROM scholastic_data WHERE player_id = ?").get(id) as ScholasticData | undefined) ?? null;
  const merch = getDb().prepare("SELECT * FROM merch_items WHERE player_id = ? AND in_stock = 1").all(id) as MerchItem[];
  const portal_entry = (getDb().prepare("SELECT * FROM transfer_portal WHERE player_id = ?").get(id) as TransferPortalEntry | undefined) ?? null;

  const follows = (getDb().prepare("SELECT COUNT(*) as c FROM social_actions WHERE player_id = ? AND action_type = 'follow'").get(id) as {c:number}).c;
  const likes = (getDb().prepare("SELECT COUNT(*) as c FROM social_actions WHERE player_id = ? AND action_type = 'like'").get(id) as {c:number}).c;
  const shortlisted = (getDb().prepare("SELECT COUNT(*) as c FROM social_actions WHERE player_id = ? AND action_type = 'shortlist'").get(id) as {c:number}).c;

  return { ...player, stats, reports, metrics, nfl_projection, scholastic, merch, portal_entry, social_counts: { follows, likes, shortlisted } };
}

// ── Games ──────────────────────────────────────────────
export function getAllGames(filters?: { week?: number; status?: string }): Game[] {
  let query = `SELECT g.*, ht.name as home_team_name, at.name as away_team_name FROM games g JOIN teams ht ON g.home_team_id = ht.id JOIN teams at ON g.away_team_id = at.id WHERE 1=1`;
  const params: unknown[] = [];
  if (filters?.week) { query += " AND g.week_number = ?"; params.push(filters.week); }
  if (filters?.status) { query += " AND g.status = ?"; params.push(filters.status); }
  query += " ORDER BY g.game_date DESC";
  return getDb().prepare(query).all(...params) as Game[];
}

export function getGameById(id: number): (Game & { stats: (PlayerStats & { player_name: string })[] }) | null {
  const game = getDb().prepare(`SELECT g.*, ht.name as home_team_name, at.name as away_team_name FROM games g JOIN teams ht ON g.home_team_id = ht.id JOIN teams at ON g.away_team_id = at.id WHERE g.id = ?`).get(id) as Game | undefined;
  if (!game) return null;
  const stats = getDb().prepare(`SELECT ps.*, p.first_name || ' ' || p.last_name as player_name FROM player_stats ps JOIN players p ON ps.player_id = p.id WHERE ps.game_id = ? ORDER BY ps.tackles + ps.pass_yards + ps.rush_yards DESC`).all(id) as (PlayerStats & { player_name: string })[];
  return { ...game, stats };
}

// ── Scouting Reports ──────────────────────────────────
export function getAllReports(): ScoutingReport[] {
  return getDb().prepare(`SELECT sr.*, p.first_name || ' ' || p.last_name as player_name FROM scouting_reports sr JOIN players p ON sr.player_id = p.id ORDER BY sr.created_at DESC`).all() as ScoutingReport[];
}

export function getReportById(id: number): ScoutingReport | null {
  return (getDb().prepare(`SELECT sr.*, p.first_name || ' ' || p.last_name as player_name FROM scouting_reports sr JOIN players p ON sr.player_id = p.id WHERE sr.id = ?`).get(id) as ScoutingReport | undefined) ?? null;
}

export function createReport(data: Record<string, unknown>): number {
  const result = getDb().prepare(`INSERT INTO scouting_reports (player_id, game_id, scout_name, overall_grade, offensive_grade, defensive_grade, athleticism_grade, football_iq_grade, strengths, weaknesses, notes, projection, comparison) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(data.player_id, data.game_id ?? null, data.scout_name, data.overall_grade, data.offensive_grade ?? null, data.defensive_grade ?? null, data.athleticism_grade ?? null, data.football_iq_grade ?? null, data.strengths ?? null, data.weaknesses ?? null, data.notes ?? null, data.projection ?? null, data.comparison ?? null);
  return Number(result.lastInsertRowid);
}

// ── Transfer Portal ───────────────────────────────────
export function getTransferPortalFeed(): TransferPortalEntry[] {
  return getDb().prepare(`SELECT tp.*, p.first_name || ' ' || p.last_name as player_name, p.position, p.nil_value, p.star_rating, t.name as team_name FROM transfer_portal tp JOIN players p ON tp.player_id = p.id LEFT JOIN teams t ON p.team_id = t.id ORDER BY tp.transfer_likelihood DESC`).all() as TransferPortalEntry[];
}

// ── Social ─────────────────────────────────────────────
export function toggleSocialAction(userId: string, playerId: number, actionType: string): boolean {
  const existing = getDb().prepare("SELECT id FROM social_actions WHERE user_id = ? AND player_id = ? AND action_type = ?").get(userId, playerId, actionType);
  if (existing) {
    getDb().prepare("DELETE FROM social_actions WHERE user_id = ? AND player_id = ? AND action_type = ?").run(userId, playerId, actionType);
    return false;
  }
  getDb().prepare("INSERT INTO social_actions (user_id, player_id, action_type) VALUES (?, ?, ?)").run(userId, playerId, actionType);
  return true;
}

export function getUserActions(userId: string): SocialAction[] {
  return getDb().prepare("SELECT * FROM social_actions WHERE user_id = ?").all(userId) as SocialAction[];
}

export function getShortlistedPlayers(userId: string): Player[] {
  return getDb().prepare(`SELECT p.*, t.name as team_name FROM players p LEFT JOIN teams t ON p.team_id = t.id JOIN social_actions sa ON p.id = sa.player_id WHERE sa.user_id = ? AND sa.action_type = 'shortlist' ORDER BY p.star_rating DESC`).all(userId) as Player[];
}

// ── Feed ───────────────────────────────────────────────
export function getFeedPosts(): FeedPost[] {
  return getDb().prepare(`SELECT fp.*, p.first_name || ' ' || p.last_name as player_name FROM feed_posts fp LEFT JOIN players p ON fp.player_id = p.id ORDER BY fp.created_at DESC`).all() as FeedPost[];
}

// ── NIL Contracts ─────────────────────────────────────
export function getNilContract(playerId: number): NilContract | null {
  return (getDb().prepare("SELECT * FROM nil_contracts WHERE player_id = ?").get(playerId) as NilContract | undefined) ?? null;
}

export function createNilContract(data: {
  player_id: number;
  player_legal_name: string;
  player_email: string;
  digital_signature: string;
  ip_address?: string;
}): number {
  const result = getDb().prepare(
    `INSERT INTO nil_contracts (player_id, player_legal_name, player_email, digital_signature, ip_address)
     VALUES (?, ?, ?, ?, ?)`
  ).run(data.player_id, data.player_legal_name, data.player_email, data.digital_signature, data.ip_address ?? null);
  return Number(result.lastInsertRowid);
}

export function getPlayersWithNilContracts(): (Player & { contract: NilContract })[] {
  const rows = getDb().prepare(
    `SELECT p.*, t.name as team_name, nc.id as nc_id, nc.signed_at, nc.contract_status, nc.revenue_split_player, nc.revenue_split_collective
     FROM players p
     JOIN nil_contracts nc ON p.id = nc.player_id
     LEFT JOIN teams t ON p.team_id = t.id
     WHERE nc.contract_status = 'active'
     ORDER BY p.star_rating DESC`
  ).all() as (Player & { nc_id: number; signed_at: string; contract_status: string; revenue_split_player: number; revenue_split_collective: number })[];
  return rows.map((r) => ({
    ...r,
    contract: { id: r.nc_id, player_id: r.id, signed_at: r.signed_at, contract_status: r.contract_status, revenue_split_player: r.revenue_split_player, revenue_split_collective: r.revenue_split_collective } as NilContract,
  }));
}

// ── Dashboard ──────────────────────────────────────────
export function getDashboardStats() {
  const db = getDb();
  const playerCount = (db.prepare("SELECT COUNT(*) as c FROM players").get() as {c:number}).c;
  const teamCount = (db.prepare("SELECT COUNT(*) as c FROM teams").get() as {c:number}).c;
  const gameCount = (db.prepare("SELECT COUNT(*) as c FROM games").get() as {c:number}).c;
  const reportCount = (db.prepare("SELECT COUNT(*) as c FROM scouting_reports").get() as {c:number}).c;

  const topPerformers = db.prepare(`SELECT p.id, p.first_name, p.last_name, p.position, t.name as team_name, p.nil_value, COALESCE(SUM(ps.pass_yards + ps.rush_yards + ps.rec_yards), 0) as total_yards, COALESCE(SUM(ps.tackles), 0) as total_tackles, COUNT(ps.id) as games FROM players p LEFT JOIN teams t ON p.team_id = t.id LEFT JOIN player_stats ps ON p.id = ps.player_id GROUP BY p.id ORDER BY total_yards + total_tackles * 10 DESC LIMIT 10`).all();

  const recentReports = db.prepare(`SELECT sr.id, sr.overall_grade, sr.scout_name, sr.created_at, p.first_name || ' ' || p.last_name as player_name FROM scouting_reports sr JOIN players p ON sr.player_id = p.id ORDER BY sr.created_at DESC LIMIT 5`).all();

  const portalWatch = db.prepare(`SELECT tp.*, p.first_name || ' ' || p.last_name as player_name, p.position, p.nil_value FROM transfer_portal tp JOIN players p ON tp.player_id = p.id WHERE tp.transfer_likelihood >= 50 ORDER BY tp.transfer_likelihood DESC LIMIT 5`).all();

  return { playerCount, teamCount, gameCount, reportCount, topPerformers, recentReports, portalWatch };
}
