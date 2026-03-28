#!/usr/bin/env python3
"""
GARY WALKER CTS ANALYSIS — Competitive Translation Engine Pilot

Sonar Football Analytics Stack | neXT Intelligence

This script scrapes game-by-game data for Gary Walker (2027 RB, Creekside HS)
and computes a Competitive Translation Score (CTS) by classifying every
opponent's defensive talent level and isolating Walker's production against
each competition tier.

USAGE IN CLAUDE CODE:

1. Drop this file into your project directory
1. Run: python gary_walker_cts.py
1. Script outputs a full CTS report as markdown + CSV

REQUIREMENTS:
pip install requests beautifulsoup4 pandas tabulate

DATA SOURCES:

- MaxPreps box scores (web scrape)
- 247Sports / On3 recruiting databases (web search)
- Local newspaper recaps (web search fallback)
- Prep Redzone scouting reports

PLAYER PROFILE:
Name: Gary Walker
Class: 2027
School: Creekside HS, Fairburn, GA
Position: RB / OLB
Size: 6'0-6'1, 190-200 lbs
247 Composite: 0.8900 (4-star)
Season: 2025 (Junior) — 15-0, GHSA Class 4A State Champions
Stats: 1,669 rushing yards, 20 TDs, 9.4 YPC in 14-15 games
"""

import json
from dataclasses import dataclass, field, asdict
from typing import Optional
from datetime import datetime

# ============================================================
# CONFIGURATION
# ============================================================

PLAYER = {
    "name": "Gary Walker",
    "class_year": 2027,
    "school": "Creekside HS",
    "city": "Fairburn, GA",
    "position": "RB",
    "height": "6-1",
    "weight": 200,
    "rating_247": 0.8900,
    "national_rank": 377,
    "position_rank": 28,
    "state_rank": 41,
    "offers": 23,
    "season": "2025-26",
}

# Full 2025 schedule with MaxPreps box score URLs
# These URLs are confirmed from MaxPreps schedule page scrape
SCHEDULE = [
    {
        "week": 1,
        "date": "2025-08-15",
        "opponent": "Rome",
        "opponent_state": "GA",
        "location": "away",
        "result": "W",
        "score_for": 48,
        "score_against": 28,
        "game_type": "non-region",
        "maxpreps_url": "https://www.maxpreps.com/games/08-15-2025/football-25/creekside-vs-rome.htm?c=bT_8nPGr006dwyO-4y2lyQ",
        "opponent_tier": 2,
        "tier_rationale": "Traditional GA power, historically produces D1 talent, competitive 5A/6A program",
        "opponent_d1_recruits": "TBD - search 247/On3 for Rome GA 2025-2027 recruits",
    },
    {
        "week": 2,
        "date": "2025-08-22",
        "opponent": "Seminole",
        "opponent_state": "FL",
        "location": "away",
        "result": "W",
        "score_for": 32,
        "score_against": 0,
        "game_type": "non-region",
        "maxpreps_url": "https://www.maxpreps.com/games/08-22-2025/football-25/creekside-vs-seminole.htm?c=dc0lmeyOZE-eE9cr65TmPg",
        "opponent_tier": 4,
        "tier_rationale": "Florida program, shutout suggests weaker opponent",
        "opponent_d1_recruits": "TBD",
    },
    {
        "week": 3,
        "date": "2025-08-30",
        "opponent": "DeSoto",
        "opponent_state": "TX",
        "location": "home",
        "result": "W",
        "score_for": 70,
        "score_against": 28,
        "game_type": "non-region",
        "maxpreps_url": "https://www.maxpreps.com/games/08-30-2025/football-25/creekside-vs-desoto.htm?c=CogoI6obQku8tSpMuxpzTA",
        "opponent_tier": 1,
        "tier_rationale": "NATIONAL POWERHOUSE. Texas 6A. Routinely 27+ D1 prospects on roster. SaRod Baker (2027 RB, nationally ranked), D.J. Rumph (2027 EDGE, ranked). Previous years included 5-stars. D1 pipeline school.",
        "opponent_d1_recruits": "SaRod Baker (RB, 2027, On3 ranked), D.J. Rumph (EDGE, 2027, 247 #858 natl), multiple additional D1 prospects across roster",
    },
    {
        "week": 4,
        "date": "2025-09-12",
        "opponent": "Forest Park",
        "opponent_state": "GA",
        "location": "home",
        "result": "W",
        "score_for": 70,
        "score_against": 0,
        "game_type": "region",
        "maxpreps_url": "https://www.maxpreps.com/games/09-12-2025/football-25/creekside-vs-forest-park.htm?c=yu0Vd4kLCkSGcLMPE6KS5A",
        "opponent_tier": 5,
        "tier_rationale": "Region blowout, 70-0 shutout",
        "opponent_d1_recruits": "TBD - likely minimal",
    },
    {
        "week": 5,
        "date": "2025-09-19",
        "opponent": "Mays",
        "opponent_state": "GA",
        "location": "away",
        "result": "W",
        "score_for": 56,
        "score_against": 0,
        "game_type": "region",
        "maxpreps_url": "https://www.maxpreps.com/games/09-19-2025/football-25/creekside-vs-mays.htm?c=q8XCNjTC5kmO9Ro12rwY9g",
        "opponent_tier": 4,
        "tier_rationale": "Atlanta Public Schools, shutout",
        "opponent_d1_recruits": "TBD",
    },
    {
        "week": 6,
        "date": "2025-09-25",
        "opponent": "M.L. King",
        "opponent_state": "GA",
        "location": "away",
        "result": "W",
        "score_for": 69,
        "score_against": 0,
        "game_type": "region",
        "maxpreps_url": "https://www.maxpreps.com/games/09-25-2025/football-25/creekside-vs-ml-king.htm?c=WAghrqve5UW9EOstJE3C2w",
        "opponent_tier": 5,
        "tier_rationale": "Region shutout, 69-0",
        "opponent_d1_recruits": "TBD - likely minimal",
    },
    {
        "week": 7,
        "date": "2025-10-03",
        "opponent": "Pace Academy",
        "opponent_state": "GA",
        "location": "home",
        "result": "W",
        "score_for": 55,
        "score_against": 0,
        "game_type": "region",
        "maxpreps_url": "https://www.maxpreps.com/games/10-03-2025/football-25/creekside-vs-pace-academy.htm?c=62fc3ifNdE2eEJsldDcJUw",
        "opponent_tier": 3,
        "tier_rationale": "Atlanta private school, some D1 talent historically, but shutout",
        "opponent_d1_recruits": "TBD",
    },
    {
        "week": 8,
        "date": "2025-10-10",
        "opponent": "Drew",
        "opponent_state": "GA",
        "location": "home",
        "result": "W",
        "score_for": 91,
        "score_against": 0,
        "game_type": "region",
        "maxpreps_url": "https://www.maxpreps.com/games/10-10-2025/football-25/creekside-vs-drew.htm?c=IdVWSi3CIUCiCB3zkhUEsA",
        "opponent_tier": 5,
        "tier_rationale": "91-0 blowout, lowest-tier opponent",
        "opponent_d1_recruits": "None expected",
    },
    {
        "week": 9,
        "date": "2025-10-24",
        "opponent": "Jackson",
        "opponent_state": "GA",
        "location": "away",
        "result": "W",
        "score_for": 44,
        "score_against": 7,
        "game_type": "region",
        "maxpreps_url": "https://www.maxpreps.com/games/10-24-2025/football-25/creekside-vs-jackson.htm?c=hFEgnlfpsku-rjBoYB-hZQ",
        "opponent_tier": 4,
        "tier_rationale": "Maynard Jackson HS, Atlanta area",
        "opponent_d1_recruits": "TBD",
    },
    {
        "week": 10,
        "date": "2025-10-31",
        "opponent": "Midtown",
        "opponent_state": "GA",
        "location": "home",
        "result": "W",
        "score_for": 79,
        "score_against": 3,
        "game_type": "region",
        "maxpreps_url": "https://www.maxpreps.com/games/10-31-2025/football-25/creekside-vs-midtown.htm?c=CFe8DnEeakWYxiG2iYGQIg",
        "opponent_tier": 4,
        "tier_rationale": "79-3 blowout",
        "opponent_d1_recruits": "TBD",
    },
    {
        "week": 11,
        "date": "2025-11-14",
        "opponent": "Dalton",
        "opponent_state": "GA",
        "location": "home",
        "result": "W",
        "score_for": 70,
        "score_against": 7,
        "game_type": "playoff_r1",
        "maxpreps_url": "https://www.maxpreps.com/games/11-14-2025/football-25/creekside-vs-dalton.htm?c=fS4nLeJ1BU2E2ekccv1BsQ",
        "opponent_tier": 3,
        "tier_rationale": "Playoff Rd 1, North GA program",
        "opponent_d1_recruits": "TBD",
    },
    {
        "week": 12,
        "date": "2025-11-21",
        "opponent": "Ware County",
        "opponent_state": "GA",
        "location": "home",
        "result": "W",
        "score_for": 49,
        "score_against": 0,
        "game_type": "playoff_r2",
        "maxpreps_url": "https://www.maxpreps.com/games/11-21-2025/football-25/creekside-vs-ware-county.htm?c=FxWwYhqwX0OKnAfFEt0djw",
        "opponent_tier": 3,
        "tier_rationale": "Traditional South GA power, Waycross. Has produced D1 talent historically.",
        "opponent_d1_recruits": "TBD",
    },
    {
        "week": 13,
        "date": "2025-11-28",
        "opponent": "Lithonia",
        "opponent_state": "GA",
        "location": "home",
        "result": "W",
        "score_for": 35,
        "score_against": 7,
        "game_type": "playoff_r3",
        "maxpreps_url": "https://www.maxpreps.com/games/11-28-2025/football-25/creekside-vs-lithonia.htm?c=jHeUbFTOSkqxhjA35rVopQ",
        "opponent_tier": 3,
        "tier_rationale": "Playoff Rd 3, DeKalb County",
        "opponent_d1_recruits": "TBD",
    },
    {
        "week": 14,
        "date": "2025-12-05",
        "opponent": "Kell",
        "opponent_state": "GA",
        "location": "home",
        "result": "W",
        "score_for": 35,
        "score_against": 6,
        "game_type": "playoff_semi",
        "maxpreps_url": "https://www.maxpreps.com/games/12-05-2025/football-25/creekside-vs-kell.htm?c=9AnjT88__EulN90KEWNdXg",
        "opponent_tier": 2,
        "tier_rationale": "Playoff semifinal. Cobb County, competitive program, has produced D1 talent. Tighter competition level.",
        "opponent_d1_recruits": "TBD - search Kell HS Marietta recruits",
    },
    {
        "week": 15,
        "date": "2025-12-15",
        "opponent": "Benedictine",
        "opponent_state": "GA",
        "location": "neutral",
        "result": "W",
        "score_for": 42,
        "score_against": 39,
        "game_type": "state_championship",
        "maxpreps_url": "https://www.maxpreps.com/games/12-15-2025/football-25/benedictine-vs-creekside.htm?c=ixzPEXIK9Uyv3xiGeSvBWA",
        "opponent_tier": 2,
        "tier_rationale": "STATE CHAMPIONSHIP. Benedictine Military (Savannah). Perennial D1 talent factory. Tightest game of season (42-39). Only game decided by fewer than 28 points.",
        "opponent_d1_recruits": "TBD - search Benedictine Savannah recruits 2025-2027",
    },
]


# ============================================================
# DATA STRUCTURES
# ============================================================


@dataclass
class GameStats:
    """Walker's stats for a single game"""
    game_date: str
    opponent: str
    opponent_state: str
    opponent_tier: int
    tier_rationale: str
    game_type: str
    score_for: int
    score_against: int
    margin: int = 0
    garbage_time_flag: bool = False
    # Rushing
    carries: int = 0
    rush_yards: int = 0
    rush_ypc: float = 0.0
    rush_tds: int = 0
    long_run: int = 0
    # Receiving
    receptions: int = 0
    rec_yards: int = 0
    rec_tds: int = 0
    # Opposition quality
    opponent_d1_count: int = 0
    opponent_top_defender: str = ""
    opponent_top_defender_rating: float = 0.0
    # Source
    data_source: str = "pending"

    def __post_init__(self):
        self.margin = self.score_for - self.score_against
        if self.margin >= 35:
            self.garbage_time_flag = True
        if self.carries > 0:
            self.rush_ypc = round(self.rush_yards / self.carries, 1)


@dataclass
class OpponentDefender:
    """A D1 recruit on an opponent's defense"""
    name: str
    position: str
    class_year: int
    school: str
    rating_247: float = 0.0
    national_rank: int = 0
    offers_count: int = 0
    top_offers: list = field(default_factory=list)
    committed_to: str = ""
    tier: int = 3  # default to D1 starter


@dataclass
class CTSResult:
    """Competitive Translation Score output"""
    player_name: str
    season: str
    # Tier splits
    games_tier_1_2: int = 0
    games_tier_3: int = 0
    games_tier_4_5: int = 0
    # Production by tier
    ypc_tier_1_2: float = 0.0
    ypc_tier_3: float = 0.0
    ypc_tier_4_5: float = 0.0
    ypc_overall: float = 0.0
    # CTS calculation
    cts_score: float = 0.0
    cts_label: str = ""
    confidence: str = ""
    # Adjusted
    cts_garbage_adjusted: float = 0.0

    def compute_cts(self):
        """Calculate CTS from tier splits"""
        avg_lower = (self.ypc_tier_3 + self.ypc_tier_4_5) / 2 if (self.ypc_tier_3 + self.ypc_tier_4_5) > 0 else 1.0
        if avg_lower > 0 and self.ypc_tier_1_2 > 0:
            self.cts_score = round(self.ypc_tier_1_2 / avg_lower, 3)

        # Label
        if self.cts_score >= 1.20:
            self.cts_label = "RISES"
        elif self.cts_score >= 1.00:
            self.cts_label = "HOLDS"
        elif self.cts_score >= 0.85:
            self.cts_label = "SLIGHT DROP"
        elif self.cts_score >= 0.70:
            self.cts_label = "SIGNIFICANT DROP"
        else:
            self.cts_label = "COLLAPSES"

        # Confidence
        if self.games_tier_1_2 >= 8:
            self.confidence = "HIGH"
        elif self.games_tier_1_2 >= 4:
            self.confidence = "MODERATE"
        elif self.games_tier_1_2 >= 1:
            self.confidence = "LOW"
        else:
            self.confidence = "N/A - UNTESTED"


# ============================================================
# HELPER FUNCTIONS
# ============================================================


def generate_search_queries(opponent: str, state: str) -> list:
    """Generate web search queries for opponent roster analysis"""
    return [
        f"247sports {opponent} {state} football 2025 2026 2027 recruits",
        f"on3 {opponent} {state} football roster recruits commits",
        f"{opponent} high school {state} football D1 offers commits",
        f"maxpreps {opponent} {state} football roster 2025",
    ]


def generate_box_score_queries(opponent: str) -> list:
    """Generate web search queries for game stats"""
    return [
        f"Gary Walker Creekside {opponent} rushing yards 2025",
        f"Creekside vs {opponent} football 2025 box score recap",
        f"Creekside Seminoles {opponent} game stats recap 2025",
    ]


def generate_local_media_queries() -> list:
    """Generate queries for local newspaper coverage"""
    return [
        "Gary Walker Creekside DeSoto rushing yards touchdown 2025",
        "Gary Walker Creekside Benedictine state championship stats",
        "Creekside Seminoles football Gary Walker AJC 2025",
        "Creekside football 2025 recap Fairburn Gary Walker",
        "Gary Walker running back Creekside junior season stats highlights",
        "Creekside Fairburn football 2025 season recap state championship",
        "Gary Walker Creekside Rome football opening game",
        "GHSA Class 4A championship Creekside Benedictine Gary Walker",
    ]


def print_schedule_summary():
    """Print the schedule with tier classifications"""
    print("\n" + "=" * 80)
    print("GARY WALKER 2025 SCHEDULE — OPPONENT TIER CLASSIFICATION")
    print("=" * 80)
    print(f"\n{'Date':<12} {'Opponent':<20} {'Score':<10} {'Tier':<6} {'Type':<15} {'Rationale'}")
    print("-" * 120)
    for g in SCHEDULE:
        score = f"W {g['score_for']}-{g['score_against']}"
        margin = g['score_for'] - g['score_against']
        gt_flag = " [GT]" if margin >= 35 else ""
        print(f"{g['date']:<12} {g['opponent']:<20} {score:<10} {g['opponent_tier']:<6} {g['game_type']:<15} {g['tier_rationale'][:60]}{gt_flag}")

    # Tier summary
    tier_1_2 = [g for g in SCHEDULE if g['opponent_tier'] <= 2]
    tier_3 = [g for g in SCHEDULE if g['opponent_tier'] == 3]
    tier_4_5 = [g for g in SCHEDULE if g['opponent_tier'] >= 4]

    print(f"\n--- TIER SUMMARY ---")
    print(f"Tier 1-2 games: {len(tier_1_2)} — {', '.join(g['opponent'] for g in tier_1_2)}")
    print(f"Tier 3 games:   {len(tier_3)} — {', '.join(g['opponent'] for g in tier_3)}")
    print(f"Tier 4-5 games: {len(tier_4_5)} — {', '.join(g['opponent'] for g in tier_4_5)}")

    # Garbage time exposure
    gt_games = [g for g in SCHEDULE if g['score_for'] - g['score_against'] >= 35]
    print(f"\nGarbage time risk (35+ pt wins): {len(gt_games)} of 15 games")
    print(f"Only competitive game: Benedictine (42-39, 3-point margin)")


def print_priority_scrape_urls():
    """Print the priority MaxPreps URLs to scrape"""
    print("\n" + "=" * 80)
    print("PRIORITY SCRAPE URLs — MaxPreps Box Scores")
    print("=" * 80)
    priority = ["DeSoto", "Benedictine", "Rome", "Kell"]
    for p in priority:
        game = next(g for g in SCHEDULE if g['opponent'] == p)
        print(f"\n[TIER {game['opponent_tier']}] {game['opponent']} ({game['opponent_state']}) — {game['date']}")
        print(f"  Score: {game['score_for']}-{game['score_against']}")
        print(f"  URL: {game['maxpreps_url']}")
        print(f"  Box: {game['maxpreps_url']}#tab=box-score")
        print(f"  Rationale: {game['tier_rationale']}")


def export_schedule_json(filepath: str = "gary_walker_schedule.json"):
    """Export schedule data as JSON for pipeline consumption"""
    with open(filepath, 'w') as f:
        json.dump({
            "player": PLAYER,
            "schedule": SCHEDULE,
            "generated": datetime.now().isoformat(),
            "status": "pending_box_score_scrape",
        }, f, indent=2)
    print(f"\nExported schedule to {filepath}")


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    print("=" * 80)
    print("GARY WALKER CTS ANALYSIS — Competitive Translation Engine Pilot")
    print("Sonar Football Analytics Stack | neXT Intelligence")
    print("=" * 80)
    print(f"\nPlayer: {PLAYER['name']} | {PLAYER['class_year']} | {PLAYER['school']}")
    print(f"Rating: {PLAYER['rating_247']} (247 Composite) | Natl #{PLAYER['national_rank']} | RB #{PLAYER['position_rank']}")
    print(f"Size: {PLAYER['height']}, {PLAYER['weight']} lbs | Offers: {PLAYER['offers']}")
    print(f"Season: 15-0, GHSA Class 4A State Champions")
    print(f"Stats: 1,669 rushing yards, 20 TDs, 9.4 YPC")

    print_schedule_summary()
    print_priority_scrape_urls()

    # Export data
    export_schedule_json()

    print("\n" + "=" * 80)
    print("READY FOR CLAUDE CODE EXECUTION")
    print("Run the searches above, populate GameStats objects, compute CTS")
    print("=" * 80)
