import { getData } from "./db";
import type {
  Driver, Team, Race, RaceResult, ScoutingReport, PerformanceMetrics,
  F1Projection, DriverMarketEntry, FeedPost, MerchItem, SocialAction,
  DriverContract, FanVote,
} from "./types";

// Helper to cast rows
function as<T>(rows: Record<string, unknown>[]): T[] {
  return rows as unknown as T[];
}
function asOne<T>(row: Record<string, unknown> | undefined): T | null {
  return (row as unknown as T) ?? null;
}

// ── Teams ──────────────────────────────────────────────
export function getAllTeams(): Team[] {
  return as<Team>(getData().teams.slice().sort((a, b) => String(a.name).localeCompare(String(b.name))));
}

export function getTeamById(id: number): (Team & { drivers: Driver[] }) | null {
  const team = asOne<Team>(getData().teams.find((t) => t.id === id));
  if (!team) return null;
  const drivers = as<Driver>(
    getData().drivers.filter((d) => d.team_id === id).sort((a, b) => String(a.last_name).localeCompare(String(b.last_name)))
  );
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
  const data = getData();
  let rows = data.drivers.map((d: any) => {
    const team = data.teams.find((t) => t.id === d.team_id);
    return { ...d, team_name: team ? team.name : null };
  });

  if (filters?.series) rows = rows.filter((d) => d.current_series === filters.series);
  if (filters?.nationality) rows = rows.filter((d) => d.nationality === filters.nationality);
  if (filters?.teamId) rows = rows.filter((d) => d.team_id === filters.teamId);
  if (filters?.search) {
    const s = String(filters.search).toLowerCase();
    rows = rows.filter((d) => `${d.first_name} ${d.last_name}`.toLowerCase().includes(s));
  }
  if (filters?.targetTeam) {
    rows = rows.filter((d) => d.f1_target_team === filters.targetTeam || d.f1_target_team === "Both");
  }

  rows.sort((a, b) => Number(b.rating) - Number(a.rating) || (Number(a.ranking) || 999) - (Number(b.ranking) || 999));
  return as<Driver>(rows);
}

export function getDriverById(id: number) {
  const data = getData();
  const raw = data.drivers.find((d) => d.id === id);
  if (!raw) return null;

  const team = data.teams.find((t) => t.id === raw.team_id);
  const driver = { ...raw, team_name: team ? team.name : null } as unknown as Driver;

  const filteredResults = data.race_results.filter((rr) => rr.driver_id === id);
  filteredResults.sort((a, b) => {
    const ra = data.races.find((r) => r.id === a.race_id);
    const rb = data.races.find((r) => r.id === b.race_id);
    return String(rb?.race_date ?? "").localeCompare(String(ra?.race_date ?? ""));
  });
  const results = as<RaceResult>(filteredResults.map((rr) => {
    const race = data.races.find((r) => r.id === rr.race_id);
    return { ...rr, race_info: race ? `${race.race_name} (${race.circuit})` : "" };
  }));

  const reports = as<ScoutingReport>(
    data.scouting_reports.filter((sr) => sr.driver_id === id).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
  );

  const metrics = asOne<PerformanceMetrics>(data.performance_metrics.find((pm) => pm.driver_id === id));
  const f1_projection = asOne<F1Projection>(data.f1_projections.find((fp) => fp.driver_id === id));
  const merch = as<MerchItem>(data.merch_items.filter((m) => m.driver_id === id && m.in_stock === 1));
  const market_entry = asOne<DriverMarketEntry>(data.driver_market.find((dm) => dm.driver_id === id));

  const follows = data.social_actions.filter((sa) => sa.driver_id === id && sa.action_type === "follow").length;
  const likes = data.social_actions.filter((sa) => sa.driver_id === id && sa.action_type === "like").length;
  const shortlisted = data.social_actions.filter((sa) => sa.driver_id === id && sa.action_type === "shortlist").length;

  const haasVotes = data.fan_votes.filter((fv) => fv.driver_id === id && fv.target_team === "haas").length;
  const alpineVotes = data.fan_votes.filter((fv) => fv.driver_id === id && fv.target_team === "alpine").length;

  return {
    ...driver, results, reports, metrics, f1_projection, merch, market_entry,
    social_counts: { follows, likes, shortlisted },
    vote_counts: { haas: haasVotes, alpine: alpineVotes },
  };
}

// ── Races ──────────────────────────────────────────────
export function getAllRaces(filters?: { series?: string; status?: string }): Race[] {
  let rows = getData().races.slice();
  if (filters?.series) rows = rows.filter((r) => r.series === filters.series);
  if (filters?.status) rows = rows.filter((r) => r.status === filters.status);
  rows.sort((a, b) => String(b.race_date).localeCompare(String(a.race_date)));
  return as<Race>(rows);
}

export function getRaceById(id: number) {
  const data = getData();
  const race = data.races.find((r) => r.id === id);
  if (!race) return null;
  const raceResults = data.race_results.filter((rr) => rr.race_id === id);
  raceResults.sort((a, b) => (Number(a.race_position) || 999) - (Number(b.race_position) || 999));
  const results = raceResults.map((rr) => {
    const d = data.drivers.find((dr) => dr.id === rr.driver_id);
    return { ...rr, driver_name: d ? `${d.first_name} ${d.last_name}` : "Unknown" };
  });
  return { ...(race as unknown as Race), results: results as unknown as (RaceResult & { driver_name: string })[] };
}

// ── Scouting Reports ──────────────────────────────────
export function getAllReports(): ScoutingReport[] {
  const data = getData();
  const sorted = data.scouting_reports.slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return as<ScoutingReport>(sorted.map((sr) => {
    const d = data.drivers.find((dr) => dr.id === sr.driver_id);
    return { ...sr, driver_name: d ? `${d.first_name} ${d.last_name}` : "Unknown" };
  }));
}

export function getReportById(id: number): ScoutingReport | null {
  const data = getData();
  const sr = data.scouting_reports.find((r) => r.id === id);
  if (!sr) return null;
  const d = data.drivers.find((dr) => dr.id === sr.driver_id);
  return { ...sr, driver_name: d ? `${d.first_name} ${d.last_name}` : "Unknown" } as unknown as ScoutingReport;
}

export function createReport(body: Record<string, unknown>): number {
  const data = getData();
  const id = data.scouting_reports.length + 100;
  data.scouting_reports.push({
    id,
    driver_id: body.driver_id,
    race_id: body.race_id ?? null,
    scout_name: body.scout_name,
    overall_grade: body.overall_grade,
    speed_grade: body.speed_grade ?? null,
    racecraft_grade: body.racecraft_grade ?? null,
    consistency_grade: body.consistency_grade ?? null,
    race_iq_grade: body.race_iq_grade ?? null,
    strengths: body.strengths ?? null,
    weaknesses: body.weaknesses ?? null,
    notes: body.notes ?? null,
    projection: body.projection ?? null,
    comparison: body.comparison ?? null,
    created_at: new Date().toISOString(),
  });
  return id;
}

// ── Driver Market ────────────────────────────────────
export function getDriverMarketFeed(): DriverMarketEntry[] {
  const data = getData();
  return as<DriverMarketEntry>(
    data.driver_market
      .map((dm) => {
        const d = data.drivers.find((dr) => dr.id === dm.driver_id);
        const t = d ? data.teams.find((te) => te.id === d.team_id) : null;
        return {
          ...dm,
          driver_name: d ? `${d.first_name} ${d.last_name}` : "Unknown",
          nationality: d?.nationality,
          current_series: d?.current_series,
          rating: d?.rating,
          market_value: d?.market_value,
          team_name: t?.name ?? null,
        };
      })
      .sort((a, b) => Number(b.availability_likelihood) - Number(a.availability_likelihood))
  );
}

// ── Social ─────────────────────────────────────────────
export function toggleSocialAction(userId: string, driverId: number, actionType: string): boolean {
  const data = getData();
  const idx = data.social_actions.findIndex(
    (sa) => sa.user_id === userId && sa.driver_id === driverId && sa.action_type === actionType
  );
  if (idx >= 0) {
    data.social_actions.splice(idx, 1);
    return false;
  }
  data.social_actions.push({ id: Date.now(), user_id: userId, driver_id: driverId, action_type: actionType, created_at: new Date().toISOString() });
  return true;
}

export function getUserActions(userId: string): SocialAction[] {
  return as<SocialAction>(getData().social_actions.filter((sa) => sa.user_id === userId));
}

export function getShortlistedDrivers(userId: string): Driver[] {
  const data = getData();
  const shortIds = new Set(data.social_actions.filter((sa) => sa.user_id === userId && sa.action_type === "shortlist").map((sa) => sa.driver_id));
  return as<Driver>(
    data.drivers
      .filter((d) => shortIds.has(d.id))
      .map((d) => {
        const t = data.teams.find((te) => te.id === d.team_id);
        return { ...d, team_name: t?.name ?? null };
      })
      .sort((a, b) => Number(b.rating) - Number(a.rating))
  );
}

// ── Fan Votes ─────────────────────────────────────────
export function castVote(userId: string, driverId: number, targetTeam: string): boolean {
  const data = getData();
  const idx = data.fan_votes.findIndex(
    (fv) => fv.user_id === userId && fv.driver_id === driverId && fv.target_team === targetTeam
  );
  if (idx >= 0) {
    data.fan_votes.splice(idx, 1);
    return false;
  }
  data.fan_votes.push({ id: Date.now(), user_id: userId, driver_id: driverId, target_team: targetTeam, created_at: new Date().toISOString() });
  return true;
}

export function getVoteLeaderboard(targetTeam: string) {
  const data = getData();
  const votes = data.fan_votes.filter((fv) => fv.target_team === targetTeam);
  const countMap = new Map<number, number>();
  for (const v of votes) countMap.set(Number(v.driver_id), (countMap.get(Number(v.driver_id)) || 0) + 1);

  return Array.from(countMap.entries())
    .map(([driverId, count]) => {
      const d = data.drivers.find((dr) => dr.id === driverId);
      return {
        driver_id: driverId,
        driver_name: d ? `${d.first_name} ${d.last_name}` : "Unknown",
        nationality: d?.nationality ?? "",
        current_series: d?.current_series ?? "",
        rating: Number(d?.rating ?? 0),
        votes: count,
      };
    })
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 20);
}

// ── Feed ───────────────────────────────────────────────
export function getFeedPosts(teamContext?: string): FeedPost[] {
  const data = getData();
  let rows = data.feed_posts.map((fp) => {
    const d = fp.driver_id ? data.drivers.find((dr) => dr.id === fp.driver_id) : null;
    return { ...fp, driver_name: d ? `${d.first_name} ${d.last_name}` : null };
  });
  if (teamContext) rows = rows.filter((fp) => fp.team_context === teamContext || !fp.team_context);
  rows.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return as<FeedPost>(rows);
}

// ── Driver Contracts ──────────────────────────────────
export function getDriverContract(driverId: number): DriverContract | null {
  return asOne<DriverContract>(getData().driver_contracts.find((dc) => dc.driver_id === driverId));
}

export function createDriverContract(body: {
  driver_id: number;
  driver_legal_name: string;
  driver_email: string;
  digital_signature: string;
  ip_address?: string;
}): number {
  const data = getData();
  const id = data.driver_contracts.length + 100;
  data.driver_contracts.push({
    id,
    driver_id: body.driver_id,
    driver_legal_name: body.driver_legal_name,
    driver_email: body.driver_email,
    license_type: "non-exclusive",
    revenue_split_driver: 70,
    revenue_split_team: 30,
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

// ── Dashboard ──────────────────────────────────────────
export function getDashboardStats() {
  const data = getData();

  const driverCount = data.drivers.length;
  const teamCount = data.teams.length;
  const raceCount = data.races.length;
  const reportCount = data.scouting_reports.length;

  // Top drivers with total points
  const topDrivers = data.drivers
    .map((d) => {
      const t = data.teams.find((te) => te.id === d.team_id);
      const driverResults = data.race_results.filter((rr) => rr.driver_id === d.id);
      const total_points = driverResults.reduce((sum, rr) => sum + Number(rr.points_scored || 0), 0);
      return {
        id: d.id, first_name: d.first_name, last_name: d.last_name,
        nationality: d.nationality, current_series: d.current_series,
        rating: d.rating, market_value: d.market_value, f1_target_team: d.f1_target_team,
        super_license_points: d.super_license_points,
        team_name: t?.name ?? null, total_points, races: driverResults.length,
      };
    })
    .sort((a, b) => Number(b.rating) - Number(a.rating) || b.total_points - a.total_points)
    .slice(0, 10);

  const recentReports = data.scouting_reports
    .map((sr) => {
      const d = data.drivers.find((dr) => dr.id === sr.driver_id);
      return { id: sr.id, overall_grade: sr.overall_grade, scout_name: sr.scout_name, created_at: sr.created_at, driver_name: d ? `${d.first_name} ${d.last_name}` : "Unknown" };
    })
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .slice(0, 5);

  const marketWatch = data.driver_market
    .filter((dm) => Number(dm.availability_likelihood) >= 50)
    .map((dm) => {
      const d = data.drivers.find((dr) => dr.id === dm.driver_id);
      return { ...dm, driver_name: d ? `${d.first_name} ${d.last_name}` : "Unknown", nationality: d?.nationality, current_series: d?.current_series, market_value: d?.market_value };
    })
    .sort((a, b) => Number(b.availability_likelihood) - Number(a.availability_likelihood))
    .slice(0, 5);

  const haasVoteCount = data.fan_votes.filter((fv) => fv.target_team === "haas").length;
  const alpineVoteCount = data.fan_votes.filter((fv) => fv.target_team === "alpine").length;

  return { driverCount, teamCount, raceCount, reportCount, topDrivers, recentReports, marketWatch, haasVoteCount, alpineVoteCount };
}
