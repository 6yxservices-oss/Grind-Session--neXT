import { getData } from "./db";
import type { Player, Team, Game, PlayerStats, ScoutingReport, ScholasticData, NextUpProfile, PhysicalMetrics, NbaProjection } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
function as<T>(rows: Record<string, unknown>[]): T[] { return rows as unknown as T[]; }
function asOne<T>(row: Record<string, unknown> | undefined): T | null { return (row as unknown as T) ?? null; }

// ── Teams ──────────────────────────────────────────────
export function getAllTeams(): Team[] {
  return as<Team>(getData().teams.slice().sort((a, b) => String(a.name).localeCompare(String(b.name))));
}

export function getTeamById(id: number): (Team & { players: Player[] }) | null {
  const team = asOne<Team>(getData().teams.find((t) => t.id === id));
  if (!team) return null;
  const players = as<Player>(getData().players.filter((p) => p.team_id === id).sort((a, b) => String(a.last_name).localeCompare(String(b.last_name))));
  return { ...team, players };
}

// ── Players ────────────────────────────────────────────
export function getAllPlayers(filters?: {
  position?: string;
  classYear?: number;
  teamId?: number;
  search?: string;
}): Player[] {
  const data = getData();
  let rows = data.players.map((p: any) => {
    const team = data.teams.find((t) => t.id === p.team_id);
    return { ...p, team_name: team ? team.name : null };
  });

  if (filters?.position) rows = rows.filter((p) => p.position === filters.position);
  if (filters?.classYear) rows = rows.filter((p) => p.class_year === filters.classYear);
  if (filters?.teamId) rows = rows.filter((p) => p.team_id === filters.teamId);
  if (filters?.search) {
    const s = String(filters.search).toLowerCase();
    rows = rows.filter((p) => `${p.first_name} ${p.last_name}`.toLowerCase().includes(s));
  }

  rows.sort((a, b) => Number(b.star_rating) - Number(a.star_rating) || (Number(a.ranking) || 999) - (Number(b.ranking) || 999));
  return as<Player>(rows);
}

export function getPlayerById(
  id: number
): (Player & { stats: PlayerStats[]; reports: ScoutingReport[]; averages: Record<string, number>; scholastic: ScholasticData | null; nextup: NextUpProfile | null; physical: PhysicalMetrics | null; nba_projection: NbaProjection | null }) | null {
  const data = getData();
  const raw = data.players.find((p) => p.id === id);
  if (!raw) return null;

  const team = data.teams.find((t) => t.id === raw.team_id);
  const player = { ...raw, team_name: team ? team.name : null } as unknown as Player;

  const stats = as<PlayerStats>(
    data.player_stats
      .filter((ps) => ps.player_id === id)
      .map((ps) => {
        const game = data.games.find((g) => g.id === ps.game_id);
        const ht = game ? data.teams.find((t) => t.id === game.home_team_id) : null;
        const at = game ? data.teams.find((t) => t.id === game.away_team_id) : null;
        return { ...ps, game_info: ht && at ? `${ht.name} vs ${at.name}` : "" };
      })
      .sort((a, b) => {
        const ga = data.games.find((g) => g.id === a.game_id);
        const gb = data.games.find((g) => g.id === b.game_id);
        return String(gb?.game_date ?? "").localeCompare(String(ga?.game_date ?? ""));
      })
  );

  const reports = as<ScoutingReport>(
    data.scouting_reports.filter((sr) => sr.player_id === id).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
  );

  // Compute averages
  const playerStats = data.player_stats.filter((ps) => ps.player_id === id);
  const gamesPlayed = playerStats.length;
  const avg = (field: string) => gamesPlayed > 0 ? Math.round(playerStats.reduce((sum, ps) => sum + Number(ps[field] || 0), 0) / gamesPlayed * 10) / 10 : 0;
  const averages = {
    ppg: avg("points"),
    rpg: avg("rebounds"),
    apg: avg("assists"),
    spg: avg("steals"),
    bpg: avg("blocks"),
    mpg: avg("minutes"),
    games_played: gamesPlayed,
  };

  const scholastic = asOne<ScholasticData>(data.scholastic_data.find((sd) => sd.player_id === id));
  const nextup = asOne<NextUpProfile>(data.nextup_profiles.find((np) => np.player_id === id));
  const physical = asOne<PhysicalMetrics>(data.physical_metrics.find((pm) => pm.player_id === id));
  const nba_projection = asOne<NbaProjection>(data.nba_projections.find((np) => np.player_id === id));

  return { ...player, stats, reports, averages, scholastic, nextup, physical, nba_projection };
}

// ── Games ──────────────────────────────────────────────
export function getAllGames(filters?: { session?: string; status?: string }): Game[] {
  const data = getData();
  let rows = data.games.map((g: any) => {
    const ht = data.teams.find((t) => t.id === g.home_team_id);
    const at = data.teams.find((t) => t.id === g.away_team_id);
    return { ...g, home_team_name: ht?.name ?? "TBD", away_team_name: at?.name ?? "TBD" };
  });

  if (filters?.session) rows = rows.filter((g) => g.session_name === filters.session);
  if (filters?.status) rows = rows.filter((g) => g.status === filters.status);
  rows.sort((a, b) => String(b.game_date).localeCompare(String(a.game_date)));
  return as<Game>(rows);
}

export function getGameById(id: number): (Game & { stats: (PlayerStats & { player_name: string })[] }) | null {
  const data = getData();
  const raw = data.games.find((g) => g.id === id);
  if (!raw) return null;
  const ht = data.teams.find((t) => t.id === raw.home_team_id);
  const at = data.teams.find((t) => t.id === raw.away_team_id);
  const game = { ...raw, home_team_name: ht?.name ?? "TBD", away_team_name: at?.name ?? "TBD" } as unknown as Game;

  const stats = data.player_stats
    .filter((ps) => ps.game_id === id)
    .map((ps) => {
      const p = data.players.find((pl) => pl.id === ps.player_id);
      return { ...ps, player_name: p ? `${p.first_name} ${p.last_name}` : "Unknown" };
    })
    .sort((a, b) => Number(b.points) - Number(a.points));

  return { ...game, stats: stats as unknown as (PlayerStats & { player_name: string })[] };
}

// ── Scouting Reports ──────────────────────────────────
export function getAllReports(): ScoutingReport[] {
  const data = getData();
  return as<ScoutingReport>(
    data.scouting_reports
      .slice()
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .map((sr) => {
        const p = data.players.find((pl) => pl.id === sr.player_id);
        return { ...sr, player_name: p ? `${p.first_name} ${p.last_name}` : "Unknown" };
      })
  );
}

export function getReportById(id: number): ScoutingReport | null {
  const data = getData();
  const sr = data.scouting_reports.find((r) => r.id === id);
  if (!sr) return null;
  const p = data.players.find((pl) => pl.id === sr.player_id);
  return { ...sr, player_name: p ? `${p.first_name} ${p.last_name}` : "Unknown" } as unknown as ScoutingReport;
}

export function createReport(body: {
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
  const data = getData();
  const id = data.scouting_reports.length + 100;
  data.scouting_reports.push({
    id,
    player_id: body.player_id,
    game_id: body.game_id ?? null,
    scout_name: body.scout_name,
    overall_grade: body.overall_grade,
    offensive_grade: body.offensive_grade ?? null,
    defensive_grade: body.defensive_grade ?? null,
    athleticism_grade: body.athleticism_grade ?? null,
    basketball_iq_grade: body.basketball_iq_grade ?? null,
    strengths: body.strengths ?? null,
    weaknesses: body.weaknesses ?? null,
    notes: body.notes ?? null,
    projection: body.projection ?? null,
    comparison: body.comparison ?? null,
    created_at: new Date().toISOString(),
  });
  return id;
}

// ── Dashboard Stats ────────────────────────────────────
export function getDashboardStats() {
  const data = getData();

  const playerCount = data.players.length;
  const teamCount = data.teams.length;
  const gameCount = data.games.length;
  const reportCount = data.scouting_reports.length;

  const topScorers = data.players
    .map((p) => {
      const t = data.teams.find((te) => te.id === p.team_id);
      const playerStats = data.player_stats.filter((ps) => ps.player_id === p.id);
      const games = playerStats.length;
      if (games === 0) return null;
      const ppg = Math.round(playerStats.reduce((sum, ps) => sum + Number(ps.points || 0), 0) / games * 10) / 10;
      return {
        id: p.id, first_name: p.first_name, last_name: p.last_name,
        team_name: t?.name ?? null, ppg, games,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.ppg - a.ppg)
    .slice(0, 10);

  const recentReports = data.scouting_reports
    .map((sr) => {
      const p = data.players.find((pl) => pl.id === sr.player_id);
      return { id: sr.id, overall_grade: sr.overall_grade, scout_name: sr.scout_name, created_at: sr.created_at, player_name: p ? `${p.first_name} ${p.last_name}` : "Unknown" };
    })
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .slice(0, 5);

  const upcomingGames = data.games
    .filter((g) => g.status === "Scheduled")
    .map((g) => {
      const ht = data.teams.find((t) => t.id === g.home_team_id);
      const at = data.teams.find((t) => t.id === g.away_team_id);
      return { ...g, home_team_name: ht?.name ?? "TBD", away_team_name: at?.name ?? "TBD" };
    })
    .sort((a, b) => String(a.game_date).localeCompare(String(b.game_date)))
    .slice(0, 5);

  return { playerCount, teamCount, gameCount, reportCount, topScorers, recentReports, upcomingGames };
}
