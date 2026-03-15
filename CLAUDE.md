# CLAUDE.md — Grind Session neXT

## What This Is

F1 driver scouting platform (Haas neXT / Alpine neXT) powered by Claude AI. Fans vote on drivers, view AI-generated scouting reports, and explore market intelligence — all through a Next.js app with an agentic Claude backend.

## Tech Stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript 5
- **Styling**: Tailwind CSS with custom Haas (red/black) and Alpine (blue/pink) palettes
- **AI**: Anthropic SDK (`@anthropic-ai/sdk`) — Claude Sonnet 4 with tool use + agentic loop
- **Data**: Static JSON (`src/lib/data.json`) — in-memory with deep cloning
- **Deploy**: Vercel — requires `ANTHROPIC_API_KEY` env var

## Architecture

```
src/
├── app/
│   ├── api/sonar/       # AI endpoints: analyze, query, compare, briefing
│   ├── api/vote/        # Fan voting (Haas / Alpine)
│   ├── api/players/     # Driver listings
│   ├── api/reports/     # Scouting reports
│   ├── api/social/      # Follow, like, shortlist
│   ├── sonar/           # Sonar Intelligence UI (4 modes)
│   ├── drivers/[id]/    # Driver profiles + merch
│   ├── teams/[id]/      # Team rosters
│   ├── vote/            # Fan voting page
│   └── ...              # feed, analytics, market, shortlist, races
├── lib/
│   ├── prompts.ts       # System prompts, tool definitions, prompt builders
│   ├── sonar.ts         # AI engine: agentic loop, tool handler, public API
│   ├── types.ts         # All TypeScript interfaces and constants
│   ├── db.ts            # Data layer (loads data.json)
│   ├── queries.ts       # Query functions with filters
│   ├── analytics.ts     # Analytics calculations
│   └── data.json        # Static dataset (3540 lines)
└── components/          # nav, grade-badge, social-buttons, star-rating
```

## Key Patterns

### Sonar Intelligence (AI Engine)
- **Agentic loop** in `sonar.ts`: Claude calls tools iteratively until done
- **5 tools**: `lookup_driver`, `get_leaderboard`, `compare_drivers`, `get_market_intel`, `get_f1_readiness`
- **5 modes**: scouting report, natural language query, driver comparison, market briefing, driver profile
- Each mode has its own system prompt + prompt builder in `prompts.ts`
- Returns `SonarAnalysis`: `{ type, content, model, tokens_used, timestamp }`

### Data Flow
- `data.json` → `db.ts` (getData) → `queries.ts` (query functions) → API routes / sonar tools
- No external database — all data is static JSON loaded into memory

### Prompt Engineering Style
- XML-tagged context blocks (`<driver_data>`, `<context>`)
- Structured role definitions with explicit instructions
- Chain-of-thought reasoning encouraged in system prompts

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
```

## Workflow Notes

### When Modifying AI Behavior
1. System prompts live in `src/lib/prompts.ts` — edit these to change analysis style
2. Tool definitions also in `prompts.ts` (`SONAR_TOOLS`) — add tools here
3. Tool execution handler in `sonar.ts` (`handleToolCall`) — implement tool logic here
4. Public API functions in `sonar.ts` — these compose prompt + tools + agentic loop

### When Adding New Features
- New pages go in `src/app/<route>/page.tsx`
- New API routes go in `src/app/api/<route>/route.ts`
- Add types to `src/lib/types.ts`
- Data queries go in `src/lib/queries.ts`
- Navigation items in `src/components/nav.tsx` (11 links currently)

### When Modifying Data
- Edit `src/lib/data.json` directly
- Schema defined by `DataStore` interface in `db.ts` and types in `types.ts`
- Entities: teams, drivers, races, race_results, performance_metrics, scouting_reports, driver_market, social_actions, fan_votes, feed_posts, merch_items, f1_projections, driver_contracts

## Design System

- **Haas**: black `#1a1a2e`, red `#E10600`, silver `#B0B0B0`
- **Alpine**: blue `#0090FF`, pink `#FF69B4`, cyan `#00D4FF`
- Grade system: A+ through F
- Series: F2, F3, F4, Super Formula, IndyCar, Formula E, DTM
- RISE+ points system for fan engagement (votes = +100 pts)
