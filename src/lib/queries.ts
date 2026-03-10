import { getDb } from "./db";
import type { Player, Team, Game, PlayerStats, ScoutingReport, ScholasticData, NextUpProfile, PhysicalMetrics, NbaProjection } from "./types";

// ── Teams ──────────────────────────────────────────────
export function getAllTeams(): Team[] {
  return getDb().prepare("SELECT * FROM teams ORDER BY name").all() as Team[];
}

export function getTeamById(id: number): (Team & { players: Player[] }) | null {
  const team = getDb().prepare("SELECT * FROM teams WHERE id = ?").get(id) as Team | undefined;
  if (!team) return null;
  const players = getDb()
    .prepare("SELECT * FROM players WHERE team_id = ? ORDER BY last_name")
    .all(id) as Player[];
  return { ...team, players };
}

// ── Players ────────────────────────────────────────────
export function getAllPlayers(filters?: {
  position?: string;
  classYear?: number;
  teamId?: number;
  search?: string;
}): Player[] {
  let query = `
    SELECT p.*, t.name as team_name
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (filters?.position) {
    query += " AND p.position = ?";
    params.push(filters.position);
  }
  if (filters?.classYear) {
    query += " AND p.class_year = ?";
    params.push(filters.classYear);
  }
  if (filters?.teamId) {
    query += " AND p.team_id = ?";
    params.push(filters.teamId);
  }
  if (filters?.search) {
    query += " AND (p.first_name || ' ' || p.last_name LIKE ?)";
    params.push(`%${filters.search}%`);
  }

  query += " ORDER BY p.star_rating DESC, p.ranking ASC";
  return getDb().prepare(query).all(...params) as Player[];
}

export function getPlayerById(
  id: number
): (Player & { stats: PlayerStats[]; reports: ScoutingReport[]; averages: Record<string, number>; scholastic: ScholasticData | null; nextup: NextUpProfile | null; physical: PhysicalMetrics | null; nba_projection: NbaProjection | null }) | null {
  const player = getDb()
    .prepare(
      `SELECT p.*, t.name as team_name
       FROM players p LEFT JOIN teams t ON p.team_id = t.id
       WHERE p.id = ?`
    )
    .get(id) as Player | undefined;
  if (!player) return null;

  const stats = getDb()
    .prepare(
      `SELECT ps.*, ht.name || ' vs ' || at.name as game_info
       FROM player_stats ps
       JOIN games g ON ps.game_id = g.id
       JOIN teams ht ON g.home_team_id = ht.id
       JOIN teams at ON g.away_team_id = at.id
       WHERE ps.player_id = ?
       ORDER BY g.game_date DESC`
    )
    .all(id) as PlayerStats[];

  const reports = getDb()
    .prepare(
      `SELECT sr.*
       FROM scouting_reports sr
       WHERE sr.player_id = ?
       ORDER BY sr.created_at DESC`
    )
    .all(id) as ScoutingReport[];

  const avg = getDb()
    .prepare(
      `SELECT
        ROUND(AVG(points), 1) as ppg,
        ROUND(AVG(rebounds), 1) as rpg,
        ROUND(AVG(assists), 1) as apg,
        ROUND(AVG(steals), 1) as spg,
        ROUND(AVG(blocks), 1) as bpg,
        ROUND(AVG(minutes), 1) as mpg,
        COUNT(*) as games_played
       FROM player_stats WHERE player_id = ?`
    )
    .get(id) as Record<string, number>;

  const scholastic = (getDb()
    .prepare("SELECT * FROM scholastic_data WHERE player_id = ?")
    .get(id) as ScholasticData | undefined) ?? null;

  const nextup = (getDb()
    .prepare("SELECT * FROM nextup_profiles WHERE player_id = ?")
    .get(id) as NextUpProfile | undefined) ?? null;

  const physical = (getDb()
    .prepare("SELECT * FROM physical_metrics WHERE player_id = ?")
    .get(id) as PhysicalMetrics | undefined) ?? null;

  const nba_projection = (getDb()
    .prepare("SELECT * FROM nba_projections WHERE player_id = ?")
    .get(id) as NbaProjection | undefined) ?? null;

  return { ...player, stats, reports, averages: avg, scholastic, nextup, physical, nba_projection };
}

// ── Games ──────────────────────────────────────────────
export function getAllGames(filters?: { session?: string; status?: string }): Game[] {
  let query = `
    SELECT g.*, ht.name as home_team_name, at.name as away_team_name
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.id
    JOIN teams at ON g.away_team_id = at.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (filters?.session) {
    query += " AND g.session_name = ?";
    params.push(filters.session);
  }
  if (filters?.status) {
    query += " AND g.status = ?";
    params.push(filters.status);
  }

  query += " ORDER BY g.game_date DESC";
  return getDb().prepare(query).all(...params) as Game[];
}

export function getGameById(id: number): (Game & { stats: (PlayerStats & { player_name: string })[] }) | null {
  const game = getDb()
    .prepare(
      `SELECT g.*, ht.name as home_team_name, at.name as away_team_name
       FROM games g
       JOIN teams ht ON g.home_team_id = ht.id
       JOIN teams at ON g.away_team_id = at.id
       WHERE g.id = ?`
    )
    .get(id) as Game | undefined;
  if (!game) return null;

  const stats = getDb()
    .prepare(
      `SELECT ps.*, p.first_name || ' ' || p.last_name as player_name
       FROM player_stats ps
       JOIN players p ON ps.player_id = p.id
       WHERE ps.game_id = ?
       ORDER BY ps.points DESC`
    )
    .all(id) as (PlayerStats & { player_name: string })[];

  return { ...game, stats };
}

// ── Scouting Reports ──────────────────────────────────
export function getAllReports(): ScoutingReport[] {
  return getDb()
    .prepare(
      `SELECT sr.*, p.first_name || ' ' || p.last_name as player_name
       FROM scouting_reports sr
       JOIN players p ON sr.player_id = p.id
       ORDER BY sr.created_at DESC`
    )
    .all() as ScoutingReport[];
}

export function getReportById(id: number): ScoutingReport | null {
  return (
    (getDb()
      .prepare(
        `SELECT sr.*, p.first_name || ' ' || p.last_name as player_name
         FROM scouting_reports sr
         JOIN players p ON sr.player_id = p.id
         WHERE sr.id = ?`
      )
      .get(id) as ScoutingReport | undefined) ?? null
  );
}

export function createReport(data: {
  player_id: number;
  game_id?: number;
  scout_name: string;
  overall_grade: string;
  offensive_grade?: string;
  defensive_grade?: string;
  athleticism_grade?: string;
  basketball_iq_grade?: string;
  strengths?: string;
  weaknesses?: string;
  notes?: string;
  projection?: string;
  comparison?: string;
}): number {
  const result = getDb()
    .prepare(
      `INSERT INTO scouting_reports
       (player_id, game_id, scout_name, overall_grade, offensive_grade, defensive_grade,
        athleticism_grade, basketball_iq_grade, strengths, weaknesses, notes, projection, comparison)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.player_id,
      data.game_id ?? null,
      data.scout_name,
      data.overall_grade,
      data.offensive_grade ?? null,
      data.defensive_grade ?? null,
      data.athleticism_grade ?? null,
      data.basketball_iq_grade ?? null,
      data.strengths ?? null,
      data.weaknesses ?? null,
      data.notes ?? null,
      data.projection ?? null,
      data.comparison ?? null
    );
  return Number(result.lastInsertRowid);
}

// ── Dashboard Stats ────────────────────────────────────
export function getDashboardStats() {
  const db = getDb();
  const playerCount = (db.prepare("SELECT COUNT(*) as count FROM players").get() as { count: number }).count;
  const teamCount = (db.prepare("SELECT COUNT(*) as count FROM teams").get() as { count: number }).count;
  const gameCount = (db.prepare("SELECT COUNT(*) as count FROM games").get() as { count: number }).count;
  const reportCount = (db.prepare("SELECT COUNT(*) as count FROM scouting_reports").get() as { count: number }).count;

  const topScorers = db
    .prepare(
      `SELECT p.id, p.first_name, p.last_name, t.name as team_name,
              ROUND(AVG(ps.points), 1) as ppg, COUNT(ps.id) as games
       FROM player_stats ps
       JOIN players p ON ps.player_id = p.id
       LEFT JOIN teams t ON p.team_id = t.id
       GROUP BY ps.player_id
       HAVING games >= 1
       ORDER BY ppg DESC
       LIMIT 10`
    )
    .all();

  const recentReports = db
    .prepare(
      `SELECT sr.id, sr.overall_grade, sr.scout_name, sr.created_at,
              p.first_name || ' ' || p.last_name as player_name
       FROM scouting_reports sr
       JOIN players p ON sr.player_id = p.id
       ORDER BY sr.created_at DESC
       LIMIT 5`
    )
    .all();

  const upcomingGames = db
    .prepare(
      `SELECT g.*, ht.name as home_team_name, at.name as away_team_name
       FROM games g
       JOIN teams ht ON g.home_team_id = ht.id
       JOIN teams at ON g.away_team_id = at.id
       WHERE g.status = 'Scheduled'
       ORDER BY g.game_date ASC
       LIMIT 5`
    )
    .all();

  return { playerCount, teamCount, gameCount, reportCount, topScorers, recentReports, upcomingGames };
}
