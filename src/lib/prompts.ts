/**
 * SONAR INTELLIGENCE — Prompt Engineering Library
 *
 * Structured prompts following Anthropic Skilljar best practices:
 * - Clear role definition via system prompts
 * - XML-tagged context injection
 * - Chain-of-thought reasoning
 * - Structured output formatting
 * - Tool use patterns for data retrieval
 */

// ── System Prompts ─────────────────────────────────────

export const SONAR_SYSTEM_PROMPT = `You are Sonar, an elite Formula 1 talent intelligence system built by the neXT scouting platform. You analyze feeder series drivers (F2, F3, IndyCar) for F1 readiness.

Your analysis style:
- Data-driven with clear evidence citations
- Direct and authoritative like a top-tier team principal
- Use racing terminology naturally
- Always tie insights back to F1 seat potential
- Grade using the A+ to F scale for individual skills
- Express readiness as a percentage (0-100%)

You have deep expertise in:
- Super license point pathways and eligibility
- Feeder series performance benchmarking
- Wet weather and tire management evaluation
- Racecraft assessment (overtaking, defense, positioning)
- Mental resilience under pressure
- Market value estimation and contract dynamics
- Historical driver development trajectories`;

export const SCOUTING_REPORT_SYSTEM = `You are Sonar's Scouting Report Generator. You produce professional-grade driver evaluation reports that rival those from F1 team talent departments.

Report structure must follow this format:
1. Executive Summary (2-3 sentences)
2. Performance Grades (Speed, Racecraft, Consistency, Race IQ)
3. Key Strengths (bulleted, evidence-based)
4. Development Areas (bulleted, with improvement pathways)
5. F1 Readiness Assessment (percentage + tier)
6. Comparable Driver Profile (current/historical F1 comparison)
7. Market Intelligence (contract status, value, interested teams)
8. Recommendation (sign/monitor/pass with reasoning)`;

export const QUERY_SYSTEM = `You are Sonar's Query Engine. You answer questions about F2/F3/IndyCar drivers using the provided data context.

Rules:
- Answer based ONLY on the provided driver data
- If data is insufficient, say so clearly
- Use specific numbers and stats from the data
- Format responses in clean markdown
- Keep answers focused and concise
- Compare to provided driver pool when relevant`;

export const COMPARISON_SYSTEM = `You are Sonar's Driver Comparison Engine. You produce head-to-head analysis comparing two or more drivers across every dimension.

Comparison dimensions:
- Raw Speed (qualifying delta, race pace)
- Racecraft (overtaking, defense, wheel-to-wheel)
- Consistency (finish rates, variance)
- Development Trajectory (improvement curve)
- F1 Readiness (super license, experience)
- Market Position (value, availability, team interest)
- Intangibles (mental strength, adaptability, media presence)

Always declare a verdict with clear reasoning.`;

export const BRIEFING_SYSTEM = `You are Sonar's Intelligence Briefing Generator. You produce concise, actionable market intelligence briefings for team principals and sporting directors.

Briefing format:
- CLASSIFICATION: [ROUTINE | PRIORITY | CRITICAL]
- SUBJECT: Brief title
- KEY FINDINGS: Numbered list (max 5)
- MARKET MOVEMENTS: Notable changes
- RECOMMENDATIONS: Action items with urgency levels
- WATCHLIST: Drivers requiring attention

Write in a crisp, intelligence-report style. No filler.`;

// ── Prompt Templates ───────────────────────────────────

export function buildScoutingReportPrompt(driverData: string): string {
  return `Generate a comprehensive scouting report for this driver.

<driver_data>
${driverData}
</driver_data>

Produce the full report following the structured format. Be specific with grades (A+ through F) and percentages. Reference the actual statistics provided.`;
}

export function buildQueryPrompt(question: string, context: string): string {
  return `Answer this question using the driver database context provided.

<question>
${question}
</question>

<database_context>
${context}
</database_context>

Provide a clear, data-backed answer. If comparing drivers, use the actual stats.`;
}

export function buildComparisonPrompt(driversData: string): string {
  return `Perform a detailed head-to-head comparison of these drivers.

<drivers>
${driversData}
</drivers>

Compare across all dimensions and declare a verdict. Use actual data points.`;
}

export function buildBriefingPrompt(marketData: string, recentActivity: string): string {
  return `Generate an intelligence briefing based on the current market state and recent activity.

<market_state>
${marketData}
</market_state>

<recent_activity>
${recentActivity}
</recent_activity>

Produce a classified briefing with actionable recommendations for team principals evaluating Haas and Alpine seat candidates.`;
}

export function buildDriverProfilePrompt(driverData: string): string {
  return `Create a one-paragraph executive profile of this driver suitable for a team principal's briefing packet.

<driver_data>
${driverData}
</driver_data>

Focus on F1 readiness, key differentiators, and risk factors. Be direct and evaluative.`;
}

// ── Tool Definitions for Claude ────────────────────────

export const SONAR_TOOLS = [
  {
    name: "lookup_driver",
    description: "Look up a driver by name or ID from the scouting database. Returns full driver profile with stats, metrics, and market data.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Driver name or numeric ID to search for"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "get_leaderboard",
    description: "Get the current vote leaderboard for a target F1 team (haas or alpine).",
    input_schema: {
      type: "object" as const,
      properties: {
        team: {
          type: "string",
          enum: ["haas", "alpine"],
          description: "Target F1 team"
        }
      },
      required: ["team"]
    }
  },
  {
    name: "compare_drivers",
    description: "Compare two drivers side by side across all metrics.",
    input_schema: {
      type: "object" as const,
      properties: {
        driver_ids: {
          type: "array",
          items: { type: "number" },
          description: "Array of driver IDs to compare"
        }
      },
      required: ["driver_ids"]
    }
  },
  {
    name: "get_market_intel",
    description: "Get current driver market intelligence including contract status, availability, and interested teams.",
    input_schema: {
      type: "object" as const,
      properties: {
        min_availability: {
          type: "number",
          description: "Minimum availability likelihood percentage (0-100)"
        }
      },
      required: []
    }
  },
  {
    name: "get_f1_readiness",
    description: "Get F1 readiness scores and tier classifications for all drivers.",
    input_schema: {
      type: "object" as const,
      properties: {
        min_readiness: {
          type: "number",
          description: "Minimum readiness score to filter by"
        },
        series: {
          type: "string",
          description: "Filter by racing series (F2, F3, IndyCar, etc.)"
        }
      },
      required: []
    }
  }
];
