#!/usr/bin/env python3
"""
Practice run — tests all 5 deliverable builders with mock research data.
Skips the Claude Agent SDK research step (needs API key) and feeds
realistic hardcoded data directly into the builders.
"""

from pathlib import Path

from article_builder import build_scouting_article
from deliverables_builder import build_deliverables_doc
from tracker_builder import build_or_append_tracker
from graphics_builder import build_graphics_brief
from email_builder import build_member_emails

OUTPUT_DIR = Path(__file__).parent / "outputs"

# ── Mock researched player data ──────────────────────────────────────────────
PLAYERS = [
    {
        "name": "Kyngstonn Viliamu-Asa",
        "school": "Conestoga High School",
        "city": "Berwyn",
        "state": "PA",
        "measurables": {"height": "6-2", "weight": "225", "class": "2027"},
        "the_fit": (
            "Viliamu-Asa is exactly the kind of linebacker Manny Diaz wants in his "
            "system — a downhill thumper who can also drop into coverage and match "
            "tight ends in space. At 6-2, 225, he has the frame to play MIKE in a "
            "4-2-5 or WILL in a 3-3-5 stack look. His burst off the edge on designed "
            "blitzes is special. The staff has been running more pressure packages "
            "since Diaz arrived, and Viliamu-Asa's ability to get to the quarterback "
            "from a two-point stance gives them another chess piece."
        ),
        "culture_fit": (
            "Polynesian heritage runs deep in the Viliamu-Asa family — discipline, "
            "community, and respect are non-negotiables. That maps perfectly to James "
            "Franklin's culture-first program. Multiple coaches have noted his "
            "coachability and film room intensity. He's the first one in and the last "
            "one out. Campbell would love this kid's mentality."
        ),
        "lifestyle": (
            "Berwyn is 3.5 hours from State College — close enough for family to make "
            "Saturday games, far enough to feel like a real college experience. The "
            "Main Line suburb-to-college-town transition is a well-worn path for PA "
            "recruits. State College's tight-knit community mirrors the family-oriented "
            "environment he grew up in."
        ),
        "insider_intel": [
            "Instagram: @kyngstonn_va",
            "Twitter/X: @KyngstonnVA",
            "Multi-sport athlete — also starts on the basketball team",
            "Father played college football at Utah — football family DNA",
            "Visited Penn State for the White Out game in October — 'life-changing' per sources",
            "Clocked a 4.52 laser 40 at a regional combine in January",
            "73 tackles, 12 TFL, 4 sacks as a junior — all-conference first team",
        ],
    },
    {
        "name": "Jaiden Mudge",
        "school": "Scranton Prep",
        "city": "Scranton",
        "state": "PA",
        "measurables": {"height": "6-1", "weight": "215", "class": "2027"},
        "the_fit": (
            "Mudge is a sideline-to-sideline linebacker with coverage instincts that "
            "belie his age. In Diaz's defense, the WILL linebacker has to be able to "
            "carry running backs out of the backfield and match slot receivers on "
            "crossing routes. Mudge does both. His football IQ shows up in his "
            "pre-snap reads — he's diagnosing plays before the ball is snapped. "
            "The staff sees him as a potential three-down linebacker who never has to "
            "come off the field."
        ),
        "culture_fit": (
            "Scranton Prep is one of the top academic programs in NEPA. Mudge carries "
            "a 3.8 GPA and is a team captain as a junior. The discipline required to "
            "excel in Prep's academic environment translates directly to what Franklin "
            "demands of his players in the classroom. He's a natural leader — coaches "
            "describe him as the kind of kid who raises the standard for everyone around him."
        ),
        "lifestyle": (
            "Scranton is pure Northeast Pennsylvania — blue-collar, tight community, "
            "Friday night lights matter. That identity translates seamlessly to State "
            "College. The 2.5-hour drive means family stays connected. Mudge has talked "
            "publicly about wanting to stay in-state and represent PA football on a "
            "national stage."
        ),
        "insider_intel": [
            "Instagram: @jaiden.mudge",
            "Twitter/X: @JaidenMudge",
            "Team captain as a junior — rare at Scranton Prep",
            "3.8 GPA — academic qualifier with room to spare",
            "Attended Penn State's junior day in February — stayed for extra meetings with LB coach",
            "Also holds offers from Pitt, BC, Syracuse, and Rutgers",
            "68 tackles, 9 TFL, 2 INTs, 1 FF as a junior — the INTs are the story",
        ],
    },
    {
        "name": "Tae'Shaun Gelsey",
        "school": "St. Frances Academy",
        "city": "Baltimore",
        "state": "MD",
        "measurables": {"height": "6-3", "weight": "220", "class": "2027"},
        "the_fit": (
            "Gelsey is the wild card on this board — and the one with the highest "
            "ceiling. At 6-3, 220 with room to grow, he projects as an EDGE/OLB "
            "hybrid in Diaz's scheme. St. Frances Academy is a national powerhouse "
            "that produces NFL talent annually. The competition level he faces weekly "
            "is higher than what most high school players see in a full season. "
            "His pass rush repertoire is advanced — he has a speed-to-power move that "
            "would translate immediately at the college level."
        ),
        "culture_fit": (
            "St. Frances Academy is a military-style program with strict discipline "
            "standards. Players who come through that system arrive at college ready "
            "for structure. Gelsey has thrived in that environment. The intensity of "
            "Franklin's program would feel familiar, not foreign. His coaches describe "
            "him as a quiet competitor who lets his play speak."
        ),
        "lifestyle": (
            "Baltimore to State College is a 3-hour drive straight up I-83. The DMV "
            "pipeline to Penn State is well-established — Gelsey would join a strong "
            "contingent of Maryland players in the program. The transition from a big "
            "city to a college town is real, but St. Frances players are used to "
            "boarding-school-style living. State College would feel comfortable."
        ),
        "insider_intel": [
            "Instagram: @taeshaun_gelsey",
            "Twitter/X: @TaeShaunG",
            "Plays at St. Frances Academy — nationally ranked program that produces NFL talent",
            "Transferred from a public school before sophomore year — wanted elite competition",
            "Unofficial visit to Penn State scheduled for March — big weekend",
            "Also drawing heavy interest from Michigan, Ohio State, and Clemson",
            "41 tackles, 14 TFL, 8.5 sacks as a junior — the sack numbers are elite",
            "Pregame playlist is all Meek Mill and Lil Baby — Baltimore through and through",
        ],
    },
]

POSITION = "LB"
YEAR = 2027
DROP_DATE = "2026-03-15"
CONTEXT = (
    "The lesson was free and it was painful. When Penn State watched two "
    "linebacker commits flip in January, the staff learned what happens when "
    "you assume linebackers grow on trees in the Keystone State. They don't. "
    "James Franklin's defense needs athletes who can run sideline to sideline "
    "and drop into coverage in Manny Diaz's scheme. The 2027 linebacker board "
    "is live — and the clock is ticking."
)


def main():
    pos = POSITION.upper()
    print(f"\n{'='*60}")
    print(f"  PRACTICE RUN — {YEAR} {pos} INTEL DROP")
    print(f"  {len(PLAYERS)} targets | Drop date: {DROP_DATE}")
    print(f"  (Using mock research data — no API calls)")
    print(f"{'='*60}")

    # ── Deliverable 1: Scouting Article ──────────────────────────────────
    print("\n[1/5] Building Scouting Article (.docx)...")
    article_path = build_scouting_article(
        position=pos,
        year=YEAR,
        headline="THE LINEBACKER FILES",
        subtitle="Three Names. One Room. Penn State's 2027 Linebacker Hunt.",
        opening_text=CONTEXT,
        players=PLAYERS,
        bottom_line=(
            "Penn State's 2027 linebacker class will define the next era of Nittany "
            "Lion defense. Viliamu-Asa is the thumper. Mudge is the coverage weapon. "
            "Gelsey is the ceiling play. The staff doesn't need all three — but they "
            "need at least two. The clock is ticking. The board is live. And every "
            "program in the Big Ten is watching the same film."
        ),
        output_dir=OUTPUT_DIR,
    )
    print(f"  -> {article_path}")

    # ── Deliverable 2: Deliverables by Team ──────────────────────────────
    print("\n[2/5] Building Deliverables by Team (.docx)...")
    deliverables_path = build_deliverables_doc(
        position=pos,
        year=YEAR,
        players=PLAYERS,
        drop_date=DROP_DATE,
        output_dir=OUTPUT_DIR,
    )
    print(f"  -> {deliverables_path}")

    # ── Deliverable 3: Content Intel Tracker ─────────────────────────────
    tracker_existed = (OUTPUT_DIR / "HVU_Intel_Content_Tracker.xlsx").exists()
    action = "Appending to" if tracker_existed else "Creating"
    print(f"\n[3/5] {action} Content Intel Tracker (.xlsx)...")
    tracker_path = build_or_append_tracker(
        position=pos,
        year=YEAR,
        players=PLAYERS,
        drop_date=DROP_DATE,
        output_dir=OUTPUT_DIR,
    )
    print(f"  -> {tracker_path}")

    # ── Deliverable 4: Graphics Brief ────────────────────────────────────
    print("\n[4/5] Building Graphics Brief for Nano Banana...")
    brief_path, csv_path, manifest_path = build_graphics_brief(
        position=pos,
        year=YEAR,
        players=PLAYERS,
        drop_date=DROP_DATE,
        output_dir=OUTPUT_DIR,
    )
    print(f"  -> {brief_path}")
    print(f"  -> {csv_path}")
    print(f"  -> {manifest_path}")

    # ── Deliverable 5: Member Emails ─────────────────────────────────────
    print("\n[5/5] Building Member Emails for Blueprint...")
    email_paths = build_member_emails(
        position=pos,
        year=YEAR,
        players=PLAYERS,
        drop_date=DROP_DATE,
        context_narrative=CONTEXT,
        output_dir=OUTPUT_DIR,
    )
    for ep in email_paths:
        print(f"  -> {ep}")

    # ── Summary ──────────────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"  PRACTICE RUN COMPLETE — {YEAR} {pos}")
    print(f"{'='*60}")

    import os
    total_files = 0
    for root, dirs, files in os.walk(OUTPUT_DIR):
        for f in files:
            fpath = Path(root) / f
            size = fpath.stat().st_size
            rel = fpath.relative_to(OUTPUT_DIR)
            print(f"  {str(rel):50s} {size:>8,} bytes")
            total_files += 1

    print(f"\n  Total: {total_files} files in {OUTPUT_DIR.resolve()}")
    print(f"\n  The players change. The machine does not.")


if __name__ == "__main__":
    main()
