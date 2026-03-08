#!/usr/bin/env python3
"""
HVU Insider — Full Production Drop Orchestrator
-------------------------------------------------
Entry point. Takes a position group + player list, researches each player
via Claude subagents in parallel, then produces all 5 deliverables:

  1. Scouting Article (.docx)    — Brady Jordan insider article
  2. Deliverables by Team (.docx) — Operational playbook
  3. Content Intel Tracker (.xlsx) — 11-tab ops spreadsheet (append if exists)
  4. Graphics Brief + CSV (.docx/.csv/.json) — Nano Banana template swap guide
  5. Member Emails (.html) — 5 pre-built emails for Blueprint to send

Usage:
    python hvu_drop.py --position LB --year 2027 \\
        --players "Kyngstonn Viliamu-Asa, Edison, PA" \\
                  "Jaiden Mudge, Scranton, PA"

    python hvu_drop.py --intel drop_intel.json
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

import anyio
from claude_agent_sdk import (
    query,
    ClaudeAgentOptions,
    AgentDefinition,
    ResultMessage,
    SystemMessage,
)

from article_builder import build_scouting_article
from deliverables_builder import build_deliverables_doc
from tracker_builder import build_or_append_tracker
from graphics_builder import build_graphics_brief
from email_builder import build_member_emails

OUTPUT_DIR = Path(__file__).parent / "outputs"

# ─────────────────────────────────────────────────────────────────────────────
# Claude Agent SDK: Research Orchestrator
# ─────────────────────────────────────────────────────────────────────────────

RESEARCH_SYSTEM_PROMPT = """\
You are an elite college football recruiting researcher for HVU Insider,
a Penn State Nittany Lions recruiting intelligence platform.

Your job is to research recruit prospects and return structured data.
You are thorough, accurate, and football-literate. You verify social media
handles. You find real stats, real measurables, real recruiting intel.

CRITICAL RULES:
- No star ratings — HVU does not report star ratings
- No "Likely Major" guesses — stay in our lane
- Always find both Instagram AND Twitter/X handles
- No generic recruiting language — every detail should feel sourced
- No hedging — if you're not sure, research more before writing
"""

PLAYER_RESEARCH_PROMPT = """\
Research the following college football recruit prospect thoroughly.

PLAYER: {name}
SCHOOL: {school}
LOCATION: {city}, {state}
POSITION: {position}
CLASS: {year}

Find and return a JSON object with these fields:
{{
  "name": "Full Name",
  "school": "High School Name",
  "city": "City",
  "state": "State",
  "measurables": {{
    "height": "6-2",
    "weight": "215",
    "class": "2027"
  }},
  "recruiting_profile": "National/positional ranking, offer list, commitment status",
  "stats": "Position-relevant stats, per-game averages, combine measurables",
  "play_style": "Scout assessments, film keywords, strengths and weaknesses",
  "the_fit": "2-3 paragraphs on how this player fits Penn State's current offensive/defensive scheme under James Franklin and current coordinators. Be specific about scheme, formations, and coaching tendencies.",
  "culture_fit": "1-2 paragraphs on how this player's character, work ethic, background, and mentality align with the Campbell/Franklin culture at Penn State.",
  "lifestyle": "1-2 paragraphs on geographic and cultural fit with State College. Do NOT include 'Likely Major'. Focus on hometown comparison, campus life fit, community.",
  "insider_intel": [
    "Instagram: @handle",
    "Twitter/X: @handle",
    "Fun fact from social media or interviews",
    "Family connections or multi-sport background",
    "Recruiting relationships and visit details",
    "Key stat lines that pop",
    "Any other insider-level detail"
  ],
  "recruiting_momentum": "Which schools are pushing hardest, visits scheduled/completed, team to beat",
  "social_media_personality": "Personality traits observed from public social media — music, fashion, pregame routines, interests"
}}

Return ONLY valid JSON. No markdown fences. No commentary outside the JSON.
"""

ARTICLE_WRITING_PROMPT = """\
You are Brady Jordan, the lead writer for HVU Insider. You write like a scout
who also happens to be a storyteller.

Your voice:
- Confident and declarative — no hedging
- Insider cadence — "If you're paying attention..." / "Here's what the staff is watching..."
- Football-literate — reference scheme fits, coaching tendencies by name
- Urgency-driven — recruiting is a race
- Short, punchy paragraphs — let the writing breathe

Given the following player research data and position group context, produce:

1. A punchy HEADLINE (not just "2027 Running Backs" — think "THE BACKFIELD BLUEPRINT")
2. A one-line SUBTITLE that frames the stakes
3. An OPENING (2-3 paragraphs) setting the scene — why this position matters NOW
4. A BOTTOM_LINE (1-2 paragraphs) summarizing the position group

POSITION: {position}
YEAR: {year}
NUMBER OF TARGETS: {n_players}
CONTEXT: {context}

PLAYER RESEARCH DATA:
{research_json}

Return a JSON object:
{{
  "headline": "THE HEADLINE",
  "subtitle": "The subtitle line",
  "opening": "The 2-3 paragraph opening...",
  "bottom_line": "The 1-2 paragraph bottom line summary..."
}}

Return ONLY valid JSON.
"""


async def research_players(
    players: list[dict],
    position: str,
    year: int,
) -> list[dict]:
    """Research all players in parallel via Claude subagents."""
    print(f"\nResearching {len(players)} {position.upper()} targets...")

    researched = []

    for player in players:
        prompt = PLAYER_RESEARCH_PROMPT.format(
            name=player.get("name", "Unknown"),
            school=player.get("school", "Unknown"),
            city=player.get("city", "Unknown"),
            state=player.get("state", "Unknown"),
            position=position,
            year=year,
        )

        result_text = ""
        async for message in query(
            prompt=prompt,
            options=ClaudeAgentOptions(
                model="claude-opus-4-6",
                allowed_tools=["WebSearch", "WebFetch"],
                system_prompt=RESEARCH_SYSTEM_PROMPT,
                max_turns=15,
            ),
        ):
            if isinstance(message, ResultMessage) and message.result:
                result_text = message.result

        # Parse the research result
        try:
            # Strip any markdown fences
            cleaned = result_text.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
            data = json.loads(cleaned)
            # Merge with original player data (original takes precedence for name etc.)
            merged = {**data, **player, "measurables": {
                **data.get("measurables", {}),
                **player.get("measurables", {}),
            }}
            researched.append(merged)
            print(f"  + {player['name']}")
        except (json.JSONDecodeError, ValueError):
            # Fallback: use the player data as-is with research text as the_fit
            fallback = {**player}
            fallback.setdefault("the_fit", result_text[:500] if result_text else "Research pending.")
            fallback.setdefault("culture_fit", "Research pending.")
            fallback.setdefault("lifestyle", "Research pending.")
            fallback.setdefault("insider_intel", [])
            researched.append(fallback)
            print(f"  ~ {player['name']} (partial research)")

    return researched


async def generate_article_content(
    players: list[dict],
    position: str,
    year: int,
    context: str,
) -> dict:
    """Use Claude to generate the article framing: headline, subtitle, opening, bottom line."""
    print("\nGenerating article content (Brady Jordan voice)...")

    research_json = json.dumps(
        [{k: v for k, v in p.items() if k != "measurables"} for p in players],
        indent=2,
    )

    prompt = ARTICLE_WRITING_PROMPT.format(
        position=position.upper(),
        year=year,
        n_players=len(players),
        context=context,
        research_json=research_json,
    )

    result_text = ""
    async for message in query(
        prompt=prompt,
        options=ClaudeAgentOptions(
            model="claude-opus-4-6",
            allowed_tools=[],
            system_prompt="You are Brady Jordan. Return only valid JSON.",
            max_turns=3,
        ),
    ):
        if isinstance(message, ResultMessage) and message.result:
            result_text = message.result

    try:
        cleaned = result_text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
        return json.loads(cleaned)
    except (json.JSONDecodeError, ValueError):
        return {
            "headline": f"THE {position.upper()} FILES",
            "subtitle": f"{len(players)} Names. One Room. Penn State's {year} {position.upper()} Hunt.",
            "opening": context or "The board is live. Here's what you need to know.",
            "bottom_line": f"Penn State's {year} {position.upper()} class is taking shape.",
        }


async def run_drop(
    position: str,
    year: int,
    players: list[dict],
    drop_date: str = "",
    context: str = "",
) -> None:
    """Execute the full HVU Insider production drop."""
    pos = position.upper()
    if not drop_date:
        drop_date = datetime.now().strftime("%Y-%m-%d")

    print(f"\n{'='*60}")
    print(f"  HVU INSIDER | {year} {pos} INTEL DROP")
    print(f"  {len(players)} targets | Drop date: {drop_date}")
    print(f"{'='*60}")

    # ── Step 1: Research all players ─────────────────────────────────────
    researched_players = await research_players(players, position, year)

    # ── Step 2: Generate article content ─────────────────────────────────
    article_content = await generate_article_content(
        researched_players, position, year, context,
    )

    # ── Step 3: Build Deliverable 1 — Scouting Article ───────────────────
    print("\nBuilding Deliverable 1: Scouting Article (.docx)...")
    article_path = build_scouting_article(
        position=pos,
        year=year,
        headline=article_content["headline"],
        subtitle=article_content["subtitle"],
        opening_text=article_content["opening"],
        players=researched_players,
        bottom_line=article_content["bottom_line"],
        output_dir=OUTPUT_DIR,
    )
    print(f"  Saved: {article_path}")

    # ── Step 4: Build Deliverable 2 — Deliverables by Team ──────────────
    print("\nBuilding Deliverable 2: Deliverables by Team (.docx)...")
    deliverables_path = build_deliverables_doc(
        position=pos,
        year=year,
        players=researched_players,
        drop_date=drop_date,
        output_dir=OUTPUT_DIR,
    )
    print(f"  Saved: {deliverables_path}")

    # ── Step 5: Build/Append Deliverable 3 — Content Intel Tracker ──────
    tracker_existed = (OUTPUT_DIR / "HVU_Intel_Content_Tracker.xlsx").exists()
    action = "Appending to" if tracker_existed else "Creating"
    print(f"\nBuilding Deliverable 3: {action} Content Intel Tracker (.xlsx)...")
    tracker_path = build_or_append_tracker(
        position=pos,
        year=year,
        players=researched_players,
        drop_date=drop_date,
        output_dir=OUTPUT_DIR,
    )
    print(f"  Saved: {tracker_path}")

    # ── Step 6: Build Deliverable 4 — Graphics Brief for Nano Banana ────
    print("\nBuilding Deliverable 4: Graphics Brief for Nano Banana...")
    brief_path, csv_path, manifest_path = build_graphics_brief(
        position=pos,
        year=year,
        players=researched_players,
        drop_date=drop_date,
        output_dir=OUTPUT_DIR,
    )
    print(f"  Saved: {brief_path.name} (visual reference)")
    print(f"  Saved: {csv_path.name} (data feed for template swaps)")
    print(f"  Saved: {manifest_path.name} (machine-readable manifest)")

    # ── Step 7: Build Deliverable 5 — Member Emails for Blueprint ───────
    print("\nBuilding Deliverable 5: Member Emails for Blueprint...")
    email_paths = build_member_emails(
        position=pos,
        year=year,
        players=researched_players,
        drop_date=drop_date,
        context_narrative=context or article_content.get("opening", ""),
        output_dir=OUTPUT_DIR,
    )
    for ep in email_paths:
        print(f"  Saved: emails/{ep.name}")

    # ── Summary ──────────────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"  DROP COMPLETE — {year} {pos}")
    print(f"{'='*60}")
    print(f"\n  1. {article_path.name}")
    print(f"  2. {deliverables_path.name}")
    print(f"  3. {tracker_path.name}")
    print(f"  4. {brief_path.name} + {csv_path.name}")
    print(f"  5. {len(email_paths)} email templates in emails/")
    print(f"\n  All files in: {OUTPUT_DIR.resolve()}")
    print(f"\n  Graphics: Open Nano Banana, load templates, swap fields from CSV/brief.")
    print(f"  Emails: Send the .html files + schedule to Blueprint.")
    print(f"\n  The players change. The machine does not.")


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

def parse_player_arg(player_str: str) -> dict:
    """Parse 'Name, City, State' into a player dict."""
    parts = [p.strip() for p in player_str.split(",")]
    result = {"name": parts[0]}
    if len(parts) >= 2:
        result["city"] = parts[1]
    if len(parts) >= 3:
        result["state"] = parts[2]
    if len(parts) >= 4:
        result["school"] = parts[3]
    return result


def main():
    parser = argparse.ArgumentParser(
        description="HVU Insider — Full Production Drop",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""\
Examples:
  python hvu_drop.py --position LB --year 2027 \\
      --players "Kyngstonn Viliamu-Asa, Edison, PA, Conestoga HS" \\
                "Jaiden Mudge, Scranton, PA"

  python hvu_drop.py --intel drop_intel.json
""",
    )

    parser.add_argument("--intel", type=str, help="Path to JSON intel file")
    parser.add_argument("--position", type=str, help="Position group (LB, RB, DB, EDGE, WR, QB, DL, ATH)")
    parser.add_argument("--year", type=int, default=2027, help="Recruiting class year (default: 2027)")
    parser.add_argument("--players", nargs="+", help='Player entries: "Name, City, State, School"')
    parser.add_argument("--drop-date", type=str, default="", help="Drop date (YYYY-MM-DD, default: today)")
    parser.add_argument("--context", type=str, default="", help="Context narrative for the opening")

    args = parser.parse_args()

    if args.intel:
        intel_path = Path(args.intel)
        if not intel_path.exists():
            print(f"Error: {intel_path} not found.")
            sys.exit(1)
        with intel_path.open() as f:
            intel = json.load(f)

        position = intel["position_group"]
        year = intel.get("year", 2027)
        players = intel["players"]
        drop_date = intel.get("drop_date", "")
        context = intel.get("context_narrative", "")

    elif args.position and args.players:
        position = args.position
        year = args.year
        players = [parse_player_arg(p) for p in args.players]
        drop_date = args.drop_date
        context = args.context

    else:
        parser.print_help()
        print("\nError: Provide either --intel <file.json> or --position + --players")
        sys.exit(1)

    anyio.run(run_drop, position, year, players, drop_date, context)


if __name__ == "__main__":
    main()
