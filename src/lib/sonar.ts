/**
 * SONAR INTELLIGENCE ENGINE
 *
 * Core AI engine that powers the Sonar Intelligence system.
 * Uses Claude API with structured prompts, tool use, and
 * chain-of-thought reasoning to deliver F1 scouting intelligence.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  SONAR_SYSTEM_PROMPT,
  SCOUTING_REPORT_SYSTEM,
  QUERY_SYSTEM,
  COMPARISON_SYSTEM,
  BRIEFING_SYSTEM,
  SONAR_TOOLS,
  buildScoutingReportPrompt,
  buildQueryPrompt,
  buildComparisonPrompt,
  buildBriefingPrompt,
  buildDriverProfilePrompt,
} from "./prompts";
import { getAllDrivers, getDriverById, getVoteLeaderboard, getDriverMarketFeed } from "./queries";
import { getF1ReadinessScores } from "./analytics";

// ── Client ─────────────────────────────────────────────

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is required for Sonar Intelligence");
  }
  return new Anthropic({ apiKey });
}

const MODEL = "claude-sonnet-4-20250514";

// ── Data Serializers ───────────────────────────────────

function serializeDriver(driverId: number): string {
  const d = getDriverById(driverId);
  if (!d) return "Driver not found";

  return JSON.stringify({
    name: `${d.first_name} ${d.last_name}`,
    nationality: d.nationality,
    age: d.age,
    series: d.current_series,
    team: d.team_name,
    rating: d.rating,
    ranking: d.ranking,
    super_license_points: d.super_license_points,
    super_license_eligible: d.super_license_eligible,
    career: { wins: d.career_wins, podiums: d.career_podiums, poles: d.career_poles },
    academy: d.academy,
    f1_target_team: d.f1_target_team,
    market_value: d.market_value,
    metrics: d.metrics ? {
      qualifying_delta: d.metrics.avg_qualifying_delta,
      race_pace_delta: d.metrics.avg_race_pace_delta,
      wet_weather: d.metrics.wet_weather_rating,
      tire_management: d.metrics.tire_management_rating,
      overtaking: d.metrics.overtaking_rating,
      consistency: d.metrics.consistency_rating,
      racecraft: d.metrics.racecraft_rating,
      mental_resilience: d.metrics.mental_resilience_rating,
      adaptability: d.metrics.adaptability_rating,
      sector_specialty: d.metrics.sector_speciality,
    } : null,
    f1_projection: d.f1_projection ? {
      probability: d.f1_projection.f1_probability,
      projected_year: d.f1_projection.projected_year,
      target_team: d.f1_projection.target_team,
      role: d.f1_projection.projected_role,
      comparison: d.f1_projection.f1_comparison,
      archetype: d.f1_projection.driver_archetype,
      championship_probability: d.f1_projection.championship_probability,
    } : null,
    market: d.market_entry ? {
      contract_status: d.market_entry.contract_status,
      contract_end: d.market_entry.current_contract_end,
      availability: d.market_entry.availability_likelihood,
      interested_teams: d.market_entry.interested_teams,
      estimated_salary: d.market_entry.estimated_salary,
    } : null,
    recent_results: d.results?.slice(0, 5).map(r => ({
      race: r.race_info,
      qualifying: r.qualifying_position,
      finish: r.race_position,
      points: r.points_scored,
      fastest_lap: r.fastest_lap,
      gap: r.gap_to_leader,
    })),
    vote_counts: d.vote_counts,
    social_counts: d.social_counts,
    existing_reports: d.reports?.map(r => ({
      scout: r.scout_name,
      grade: r.overall_grade,
      strengths: r.strengths,
      weaknesses: r.weaknesses,
      projection: r.projection,
    })),
  }, null, 2);
}

function serializeAllDriversSummary(): string {
  const drivers = getAllDrivers();
  return JSON.stringify(drivers.map(d => ({
    id: d.id,
    name: `${d.first_name} ${d.last_name}`,
    nationality: d.nationality,
    series: d.current_series,
    team: d.team_name,
    rating: d.rating,
    sl_points: d.super_license_points,
    wins: d.career_wins,
    podiums: d.career_podiums,
    target: d.f1_target_team,
    market_value: d.market_value,
  })), null, 2);
}

function serializeMarketData(): string {
  const market = getDriverMarketFeed();
  return JSON.stringify(market, null, 2);
}

// ── Tool Handler ───────────────────────────────────────

function handleToolCall(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case "lookup_driver": {
      const query = String(input.query);
      const numId = parseInt(query, 10);
      if (!isNaN(numId)) {
        return serializeDriver(numId);
      }
      const drivers = getAllDrivers({ search: query });
      if (drivers.length === 0) return "No drivers found matching that query.";
      return serializeDriver(drivers[0].id);
    }
    case "get_leaderboard": {
      const team = String(input.team);
      return JSON.stringify(getVoteLeaderboard(team), null, 2);
    }
    case "compare_drivers": {
      const ids = input.driver_ids as number[];
      return JSON.stringify(ids.map(id => {
        const data = serializeDriver(id);
        return { driver_id: id, data: JSON.parse(data) };
      }), null, 2);
    }
    case "get_market_intel": {
      return serializeMarketData();
    }
    case "get_f1_readiness": {
      const readiness = getF1ReadinessScores({
        minReadiness: input.min_readiness as number | undefined,
        series: input.series as string | undefined,
      });
      return JSON.stringify(readiness, null, 2);
    }
    default:
      return `Unknown tool: ${name}`;
  }
}

// ── Agentic Loop ───────────────────────────────────────

async function runAgenticLoop(
  client: Anthropic,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userMessage }
  ];

  let response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    tools: SONAR_TOOLS as Anthropic.Tool[],
    messages,
  });

  // Agentic loop: keep processing until no more tool calls
  while (response.stop_reason === "tool_use") {
    const assistantContent = response.content;
    messages.push({ role: "assistant", content: assistantContent });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of assistantContent) {
      if (block.type === "tool_use") {
        const result = handleToolCall(block.name, block.input as Record<string, unknown>);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    messages.push({ role: "user", content: toolResults });

    response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      tools: SONAR_TOOLS as Anthropic.Tool[],
      messages,
    });
  }

  // Extract final text
  const textBlocks = response.content.filter(b => b.type === "text");
  return textBlocks.map(b => (b as Anthropic.TextBlock).text).join("\n\n");
}

// ── Public API ─────────────────────────────────────────

export interface SonarAnalysis {
  type: "report" | "query" | "comparison" | "briefing" | "profile";
  content: string;
  model: string;
  tokens_used: number;
  timestamp: string;
}

/**
 * Generate an AI-powered scouting report for a driver
 */
export async function generateScoutingReport(driverId: number): Promise<SonarAnalysis> {
  const client = getClient();
  const driverData = serializeDriver(driverId);

  if (driverData === "Driver not found") {
    throw new Error(`Driver with ID ${driverId} not found`);
  }

  const prompt = buildScoutingReportPrompt(driverData);
  const content = await runAgenticLoop(client, SCOUTING_REPORT_SYSTEM, prompt);

  return {
    type: "report",
    content,
    model: MODEL,
    tokens_used: 0,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Answer a natural language question about the driver database
 */
export async function queryIntelligence(question: string): Promise<SonarAnalysis> {
  const client = getClient();

  // For tool-use queries, let Claude decide what data it needs
  const prompt = buildQueryPrompt(question, serializeAllDriversSummary());
  const content = await runAgenticLoop(client, QUERY_SYSTEM, prompt);

  return {
    type: "query",
    content,
    model: MODEL,
    tokens_used: 0,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Compare two or more drivers head-to-head
 */
export async function compareDrivers(driverIds: number[]): Promise<SonarAnalysis> {
  const client = getClient();
  const driversData = driverIds.map(id => serializeDriver(id)).join("\n---\n");

  const prompt = buildComparisonPrompt(driversData);
  const content = await runAgenticLoop(client, COMPARISON_SYSTEM, prompt);

  return {
    type: "comparison",
    content,
    model: MODEL,
    tokens_used: 0,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate a market intelligence briefing
 */
export async function generateBriefing(): Promise<SonarAnalysis> {
  const client = getClient();
  const marketData = serializeMarketData();

  const drivers = getAllDrivers();
  const recentActivity = JSON.stringify({
    total_drivers: drivers.length,
    top_rated: drivers.slice(0, 5).map(d => ({
      name: `${d.first_name} ${d.last_name}`,
      rating: d.rating,
      series: d.current_series,
      target: d.f1_target_team,
    })),
    f1_ready: getF1ReadinessScores({ minReadiness: 70 }).map(d => ({
      name: d.driver_name,
      readiness: d.f1_readiness,
      tier: d.projected_tier,
    })),
    vote_leaders: {
      haas: getVoteLeaderboard("haas").slice(0, 3),
      alpine: getVoteLeaderboard("alpine").slice(0, 3),
    }
  }, null, 2);

  const prompt = buildBriefingPrompt(marketData, recentActivity);
  const content = await runAgenticLoop(client, BRIEFING_SYSTEM, prompt);

  return {
    type: "briefing",
    content,
    model: MODEL,
    tokens_used: 0,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate a quick executive profile for a driver
 */
export async function generateDriverProfile(driverId: number): Promise<SonarAnalysis> {
  const client = getClient();
  const driverData = serializeDriver(driverId);

  if (driverData === "Driver not found") {
    throw new Error(`Driver with ID ${driverId} not found`);
  }

  const prompt = buildDriverProfilePrompt(driverData);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SONAR_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content
    .filter(b => b.type === "text")
    .map(b => (b as Anthropic.TextBlock).text)
    .join("\n\n");

  return {
    type: "profile",
    content,
    model: MODEL,
    tokens_used: response.usage.input_tokens + response.usage.output_tokens,
    timestamp: new Date().toISOString(),
  };
}
