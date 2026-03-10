import { getData } from "./db";
import type { Player, Team, Game, PlayerStats, ScoutingReport, FootballMetrics, NflProjection, ScholasticData, TransferPortalEntry, FeedPost, MerchItem, SocialAction, NilContract } from "./types";

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

  const metrics = asOne<FootballMetrics>(data.football_metrics.find((fm) => fm.player_id === id));
  const nfl_projection = asOne<NflProjection>(data.nfl_projections.find((np) => np.player_id === id));
  const scholastic = asOne<ScholasticData>(data.scholastic_data.find((sd) => sd.player_id === id));
  const merch = as<MerchItem>(data.merch_items.filter((m) => m.player_id === id && m.in_stock === 1));
  const portal_entry = asOne<TransferPortalEntry>(data.transfer_portal.find((tp) => tp.player_id === id));

  const follows = data.social_actions.filter((sa) => sa.player_id === id && sa.action_type === "follow").length;
  const likes = data.social_actions.filter((sa) => sa.player_id === id && sa.action_type === "like").length;
  const shortlisted = data.social_actions.filter((sa) => sa.player_id === id && sa.action_type === "shortlist").length;

  return { ...player, stats, reports, metrics, nfl_projection, scholastic, merch, portal_entry, social_counts: { follows, likes, shortlisted } };
}

// ── Games ──────────────────────────────────────────────
export function getAllGames(filters?: { week?: number; status?: string }): Game[] {
  const data = getData();
  let rows = data.games.map((g: any) => {
    const ht = data.teams.find((t) => t.id === g.home_team_id);
    const at = data.teams.find((t) => t.id === g.away_team_id);
    return { ...g, home_team_name: ht?.name ?? "TBD", away_team_name: at?.name ?? "TBD" };
  });

  if (filters?.week) rows = rows.filter((g) => g.week_number === filters.week);
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
    .sort((a, b) => (Number(b.tackles) + Number(b.pass_yards) + Number(b.rush_yards)) - (Number(a.tackles) + Number(a.pass_yards) + Number(a.rush_yards)));

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

export function createReport(body: Record<string, unknown>): number {
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
    football_iq_grade: body.football_iq_grade ?? null,
    strengths: body.strengths ?? null,
    weaknesses: body.weaknesses ?? null,
    notes: body.notes ?? null,
    projection: body.projection ?? null,
    comparison: body.comparison ?? null,
    created_at: new Date().toISOString(),
  });
  return id;
}

// ── Transfer Portal ───────────────────────────────────
export function getTransferPortalFeed(): TransferPortalEntry[] {
  const data = getData();
  return as<TransferPortalEntry>(
    data.transfer_portal
      .map((tp) => {
        const p = data.players.find((pl) => pl.id === tp.player_id);
        const t = p ? data.teams.find((te) => te.id === p.team_id) : null;
        return {
          ...tp,
          player_name: p ? `${p.first_name} ${p.last_name}` : "Unknown",
          position: p?.position,
          nil_value: p?.nil_value,
          star_rating: p?.star_rating,
          team_name: t?.name ?? null,
        };
      })
      .sort((a, b) => Number(b.transfer_likelihood) - Number(a.transfer_likelihood))
  );
}

// ── Social ─────────────────────────────────────────────
export function toggleSocialAction(userId: string, playerId: number, actionType: string): boolean {
  const data = getData();
  const idx = data.social_actions.findIndex(
    (sa) => sa.user_id === userId && sa.player_id === playerId && sa.action_type === actionType
  );
  if (idx >= 0) {
    data.social_actions.splice(idx, 1);
    return false;
  }
  data.social_actions.push({ id: Date.now(), user_id: userId, player_id: playerId, action_type: actionType, created_at: new Date().toISOString() });
  return true;
}

export function getUserActions(userId: string): SocialAction[] {
  return as<SocialAction>(getData().social_actions.filter((sa) => sa.user_id === userId));
}

export function getShortlistedPlayers(userId: string): Player[] {
  const data = getData();
  const shortIds = new Set(data.social_actions.filter((sa) => sa.user_id === userId && sa.action_type === "shortlist").map((sa) => sa.player_id));
  return as<Player>(
    data.players
      .filter((p) => shortIds.has(p.id))
      .map((p) => {
        const t = data.teams.find((te) => te.id === p.team_id);
        return { ...p, team_name: t?.name ?? null };
      })
      .sort((a, b) => Number(b.star_rating) - Number(a.star_rating))
  );
}

// ── Feed ───────────────────────────────────────────────
export function getFeedPosts(): FeedPost[] {
  const data = getData();
  return as<FeedPost>(
    data.feed_posts
      .map((fp) => {
        const p = fp.player_id ? data.players.find((pl) => pl.id === fp.player_id) : null;
        return { ...fp, player_name: p ? `${p.first_name} ${p.last_name}` : null };
      })
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
  );
}

// ── NIL Contracts ─────────────────────────────────────
export function getNilContract(playerId: number): NilContract | null {
  return asOne<NilContract>(getData().nil_contracts.find((nc) => nc.player_id === playerId));
}

export function createNilContract(body: {
  player_id: number;
  player_legal_name: string;
  player_email: string;
  digital_signature: string;
  ip_address?: string;
}): number {
  const data = getData();
  const id = data.nil_contracts.length + 100;
  data.nil_contracts.push({
    id,
    player_id: body.player_id,
    player_legal_name: body.player_legal_name,
    player_email: body.player_email,
    license_type: "non-exclusive",
    revenue_split_player: 70,
    revenue_split_collective: 30,
    merch_categories: "Apparel,Headwear,Accessories",
    contract_status: "active",
    signed_at: new Date().toISOString(),
    ip_address: body.ip_address ?? null,
    digital_signature: body.digital_signature,
    terms_version: "1.0",
    created_at: new Date().toISOString(),
  });
  return id;
}

export function getPlayersWithNilContracts(): (Player & { contract: NilContract })[] {
  const data = getData();
  return data.nil_contracts
    .filter((nc) => nc.contract_status === "active")
    .map((nc) => {
      const p = data.players.find((pl) => pl.id === nc.player_id);
      const t = p ? data.teams.find((te) => te.id === p.team_id) : null;
      return {
        ...(p ?? {}),
        team_name: t?.name ?? null,
        contract: nc as unknown as NilContract,
      };
    })
    .sort((a, b) => Number(b.star_rating ?? 0) - Number(a.star_rating ?? 0)) as unknown as (Player & { contract: NilContract })[];
}

// ── Dashboard ──────────────────────────────────────────
export function getDashboardStats() {
  const data = getData();

  const playerCount = data.players.length;
  const teamCount = data.teams.length;
  const gameCount = data.games.length;
  const reportCount = data.scouting_reports.length;

  const topPerformers = data.players
    .map((p) => {
      const t = data.teams.find((te) => te.id === p.team_id);
      const playerStats = data.player_stats.filter((ps) => ps.player_id === p.id);
      const total_yards = playerStats.reduce((sum, ps) => sum + Number(ps.pass_yards || 0) + Number(ps.rush_yards || 0) + Number(ps.rec_yards || 0), 0);
      const total_tackles = playerStats.reduce((sum, ps) => sum + Number(ps.tackles || 0), 0);
      return {
        id: p.id, first_name: p.first_name, last_name: p.last_name,
        position: p.position, team_name: t?.name ?? null, nil_value: p.nil_value,
        total_yards, total_tackles, games: playerStats.length,
      };
    })
    .sort((a, b) => (b.total_yards + b.total_tackles * 10) - (a.total_yards + a.total_tackles * 10))
    .slice(0, 10);

  const recentReports = data.scouting_reports
    .map((sr) => {
      const p = data.players.find((pl) => pl.id === sr.player_id);
      return { id: sr.id, overall_grade: sr.overall_grade, scout_name: sr.scout_name, created_at: sr.created_at, player_name: p ? `${p.first_name} ${p.last_name}` : "Unknown" };
    })
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .slice(0, 5);

  const portalWatch = data.transfer_portal
    .filter((tp) => Number(tp.transfer_likelihood) >= 50)
    .map((tp) => {
      const p = data.players.find((pl) => pl.id === tp.player_id);
      return { ...tp, player_name: p ? `${p.first_name} ${p.last_name}` : "Unknown", position: p?.position, nil_value: p?.nil_value };
    })
    .sort((a, b) => Number(b.transfer_likelihood) - Number(a.transfer_likelihood))
    .slice(0, 5);

  return { playerCount, teamCount, gameCount, reportCount, topPerformers, recentReports, portalWatch };
}
