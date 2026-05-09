#!/usr/bin/env python3
"""Build the Club MVP strategy brief as a .docx for sharing with Ryan."""
from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_ALIGN_VERTICAL
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from pathlib import Path

OUT = Path(__file__).parent.parent / "mvp-strategy" / "07-ryan-walkthrough.docx"

ACCENT = RGBColor(0xE1, 0x1D, 0x2E)
GOLD = RGBColor(0xD4, 0xAF, 0x37)
MUTED = RGBColor(0x6B, 0x72, 0x80)
DARK = RGBColor(0x14, 0x14, 0x14)
GREEN = RGBColor(0x16, 0xA3, 0x4A)


def shade(cell, hex_color):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_color)
    tc_pr.append(shd)


def add_heading(doc, text, level=1, color=DARK, size=None):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True
    run.font.color.rgb = color
    if level == 0:
        run.font.size = Pt(28)
    elif level == 1:
        run.font.size = Pt(20)
    elif level == 2:
        run.font.size = Pt(15)
    else:
        run.font.size = Pt(12)
    if size:
        run.font.size = Pt(size)
    return p


def add_para(doc, text, bold=False, color=None, size=11, align=None, italic=False):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    if color:
        run.font.color.rgb = color
    if align:
        p.alignment = align
    return p


def add_eyebrow(doc, text):
    p = doc.add_paragraph()
    run = p.add_run(text.upper())
    run.font.size = Pt(9)
    run.font.color.rgb = ACCENT
    run.bold = True
    p.paragraph_format.space_after = Pt(2)
    return p


def add_bullets(doc, items):
    for item in items:
        p = doc.add_paragraph(style="List Bullet")
        run = p.runs[0] if p.runs else p.add_run("")
        if isinstance(item, tuple):
            bold_part, rest = item
            run.text = ""
            r1 = p.add_run(bold_part)
            r1.bold = True
            r1.font.size = Pt(11)
            r2 = p.add_run(rest)
            r2.font.size = Pt(11)
        else:
            run.text = item
            run.font.size = Pt(11)


def add_two_col(doc, left_title, left_items, right_title, right_items, left_color="F3F4F6", right_color="FEE2E4"):
    table = doc.add_table(rows=1, cols=2)
    table.autofit = True
    hdr = table.rows[0].cells
    shade(hdr[0], left_color)
    shade(hdr[1], right_color)
    for cell, title, items in [(hdr[0], left_title, left_items), (hdr[1], right_title, right_items)]:
        cell.vertical_alignment = WD_ALIGN_VERTICAL.TOP
        p = cell.paragraphs[0]
        run = p.add_run(title)
        run.bold = True
        run.font.size = Pt(12)
        for item in items:
            ip = cell.add_paragraph(style="List Bullet")
            r = ip.runs[0] if ip.runs else ip.add_run("")
            r.text = item
            r.font.size = Pt(10)
    doc.add_paragraph()


def add_step(doc, n, fan_title, fan_text, mvp_title, mvp_data):
    add_eyebrow(doc, f"Step {n}")
    add_heading(doc, fan_title, level=2)

    table = doc.add_table(rows=1, cols=2)
    table.autofit = True
    fan_cell, mvp_cell = table.rows[0].cells
    shade(fan_cell, "F8FAFC")
    shade(mvp_cell, "FEF3C7")
    fan_cell.vertical_alignment = WD_ALIGN_VERTICAL.TOP
    mvp_cell.vertical_alignment = WD_ALIGN_VERTICAL.TOP

    fp = fan_cell.paragraphs[0]
    fr = fp.add_run("WHAT THE FAN SEES")
    fr.bold = True
    fr.font.size = Pt(9)
    fr.font.color.rgb = ACCENT
    fp2 = fan_cell.add_paragraph()
    fr2 = fp2.add_run(fan_text)
    fr2.font.size = Pt(10)

    mp = mvp_cell.paragraphs[0]
    mr = mp.add_run("WHAT MVP CAPTURES")
    mr.bold = True
    mr.font.size = Pt(9)
    mr.font.color.rgb = GOLD
    mp2 = mvp_cell.add_paragraph()
    mr2 = mp2.add_run(mvp_title)
    mr2.bold = True
    mr2.font.size = Pt(11)

    for k, v in mvp_data:
        line = mvp_cell.add_paragraph()
        rk = line.add_run(f"{k}: ")
        rk.font.size = Pt(10)
        rk.font.color.rgb = MUTED
        rv = line.add_run(v)
        rv.font.size = Pt(10)
        rv.bold = True

    doc.add_paragraph()


def main():
    doc = Document()

    # Margins
    for section in doc.sections:
        section.top_margin = Inches(0.6)
        section.bottom_margin = Inches(0.6)
        section.left_margin = Inches(0.7)
        section.right_margin = Inches(0.7)

    # Title block
    add_eyebrow(doc, "Club MVP — Strategy Brief for Ryan Rechten, MVP Partnerships")
    title = doc.add_paragraph()
    t1 = title.add_run("Stop renting fans from Instagram. ")
    t1.bold = True
    t1.font.size = Pt(26)
    t2 = title.add_run("Start owning them.")
    t2.bold = True
    t2.font.size = Pt(26)
    t2.font.color.rgb = ACCENT

    add_para(
        doc,
        "A walkthrough of exactly what happens for the fan, what MVP captures, and how it turns "
        "into sponsor revenue, ticket sales, and a year-round audience asset.",
        size=12, color=MUTED,
    )
    add_para(
        doc,
        "Club MVP — the logged-in fan layer on top of mostvaluablepromotions.com. "
        "Not a new destination. The same site, with a door for fans to walk through.",
        size=11, color=GOLD, italic=True,
    )

    # 00 — How Club MVP fits
    doc.add_paragraph()
    add_heading(doc, "00  How Club MVP fits the existing site", level=1)
    add_para(
        doc,
        "Today, mostvaluablepromotions.com is a brochure: news, fights, fighters, a shop. Visitors come, "
        "read, leave anonymous. Club MVP adds a single button — \"Join Club MVP\" — that converts that "
        "traffic into a logged-in fan with an account, a profile, an entry count, and a direct line back to MVP.",
        size=11,
    )
    add_two_col(
        doc,
        "mostvaluablepromotions.com today",
        [
            "News & fight announcements",
            "Fighter roster pages",
            "Press releases",
            "Merch / shop",
            "Anonymous traffic out",
        ],
        "+ Club MVP layer",
        [
            "\"Join Club MVP\" button in nav",
            "Member account + profile",
            "Sweepstakes hub",
            "Predictions, polls, live scorecards",
            "Named fans in — data captured",
        ],
    )
    add_para(doc, "Same domain. Same brand. Same fights. New layer.", size=10, color=MUTED, align=WD_ALIGN_PARAGRAPH.CENTER, italic=True)

    # 01 — The setup
    doc.add_page_break()
    add_heading(doc, "01  The setup", level=1)
    add_para(
        doc,
        "Combat sports already generates massive attention. The problem is the relationship is owned by "
        "Instagram, YouTube, broadcasters, ticketing companies, and sportsbooks — not by MVP. A "
        "sweepstakes-driven fan platform changes that. MVP starts owning the fan account, the engagement "
        "data, the purchase behavior, the sponsor interactions, and the direct communication channel.",
        size=11,
    )
    add_two_col(
        doc,
        "Today — rented attention",
        [
            "Anonymous viewers",
            "Re-acquired at full cost every fight",
            "Sponsors buy logos and hope",
            "No CRM, no retargeting, no compounding",
        ],
        "With Club MVP — owned audience",
        [
            "Named, opted-in fans logged in",
            "Free promotional channel for the next fight",
            "Sponsors buy audiences, not impressions",
            "Every event grows the asset",
        ],
    )

    # 02 — Fan flow
    doc.add_page_break()
    add_heading(doc, "02  How it works — the fan flow", level=1)
    add_para(
        doc,
        "Five steps. The hook is prizes. The mechanism is fight-week interactions. The output for MVP is data.",
        size=11,
    )

    add_step(
        doc, 1,
        "Sweepstakes drop — \"Win a VIP fight experience\"",
        "Fight-week ad on TikTok / Instagram drives to a landing page on mostvaluablepromotions.com "
        "with a real prize: ringside seats, signed gloves, backstage access, walkout with the fighter.",
        "Acquisition event",
        [
            ("Source channel", "tiktok / creator-A"),
            ("Landing page CTR", "14.2%"),
            ("Cost per click", "$0.18"),
            ("UTM tag", "utm_xyz_fight7"),
        ],
    )
    add_step(
        doc, 2,
        "Account creation — the data capture moment",
        "Fan creates a Club MVP account to enter. Email, phone (for SMS opt-in), favorite fighter, "
        "location. Frictionless — one screen, three fields, one tap.",
        "New first-party record",
        [
            ("Fan ID", "fan_0a91f7"),
            ("Email", "captured"),
            ("SMS opt-in", "YES"),
            ("Demo / geo", "M, 24, Phoenix AZ"),
            ("Pixel fired", "Meta + TikTok"),
        ],
    )
    add_step(
        doc, 3,
        "Earn entries — the engagement loop",
        "Predictions, polls, shares, sponsor content views, friend referrals. Each action = more entries. "
        "Every interaction is shareable.",
        "Behavior signal & sponsor proof",
        [
            ("Predictions made", "3 / 5"),
            ("Sponsor clip dwell", "28s avg"),
            ("Shares triggered", "2"),
            ("Referral signups", "1"),
            ("Engagement score", "87 / 100"),
        ],
    )
    add_step(
        doc, 4,
        "Fight night — live participation",
        "Live scorecards round-by-round, push notifications timed to the broadcast, exclusive moments "
        "only Club MVP fans get. The platform becomes a second screen.",
        "Real-time engaged-viewer list",
        [
            ("Concurrent fans", "112,400"),
            ("Avg session length", "42 min"),
            ("Push opt-in rate", "71%"),
            ("Sponsor co-brand views", "+2.1M"),
        ],
    )
    add_step(
        doc, 5,
        "After the fight — offers, content, the next event",
        "Winners notified. Personalized offer based on behavior: PPV bundle, fighter merch, ticket "
        "pre-sale for the next event. The relationship doesn't end at the bell.",
        "Compounding asset",
        [
            ("Captured fan", "retained"),
            ("Next-fight CAC", "~$0"),
            ("Lookalike seeded", "Meta + TikTok"),
            ("Sponsor offer redemption", "tracked"),
            ("Lifetime value", "growing"),
        ],
    )

    # 03 — Division of labor
    doc.add_page_break()
    add_heading(doc, "03  What MVP does vs. what Club MVP handles", level=1)
    add_para(
        doc,
        "The most important slide for a CMO worried about another tech project: MVP doesn't build, "
        "integrate, or operate anything. MVP runs MVP.",
        size=11,
    )
    add_two_col(
        doc,
        "MVP provides (no new lift)",
        [
            "Prizes / VIP access / experiences",
            "Fight-week promotion across owned channels",
            "Bringing sponsors into activations",
            "Encouraging fighter participation (15-sec selfies)",
            "Live-event amplification",
        ],
        "Club MVP handles",
        [
            "User accounts & identity",
            "Sweepstakes logic & legal compliance",
            "Sponsor integrations & branded UX",
            "Data collection, CRM, lifecycle messaging",
            "Analytics, retention loops, dashboard reporting",
        ],
    )

    # 04 — Three engines
    add_heading(doc, "04  Three revenue engines", level=1)
    engines = [
        ("Sponsorship reinvented", "Sell moments + audiences, not logos. \"Pick the Round, Presented by Monster.\" Sponsor gets the activation plus the audience file.", "5–10x", "CPM lift vs. broadcast"),
        ("Direct fan revenue", "Use the captured list to retarget for PPV, tickets, merch. Pixel every page, build lookalikes, run lifecycle email/SMS.", "3–5x", "Conversion vs. cold traffic"),
        ("Year-round monetization", "VIP/loyalty memberships, premium sweepstakes, sponsor newsletter inventory, affiliate ticketing splits. The list keeps paying.", "$2–4M", "Year-one upside on a 250K-fan list"),
    ]
    table = doc.add_table(rows=1, cols=3)
    for i, (title, body, lift, label) in enumerate(engines):
        c = table.rows[0].cells[i]
        shade(c, "FAFAF9")
        c.vertical_alignment = WD_ALIGN_VERTICAL.TOP
        c.paragraphs[0].add_run(title).bold = True
        bp = c.add_paragraph()
        br = bp.add_run(body)
        br.font.size = Pt(10)
        lp = c.add_paragraph()
        lr = lp.add_run(lift)
        lr.bold = True
        lr.font.size = Pt(20)
        lr.font.color.rgb = ACCENT
        lbp = c.add_paragraph()
        lbr = lbp.add_run(label)
        lbr.font.size = Pt(9)
        lbr.font.color.rgb = MUTED
    doc.add_paragraph()

    # 05 — Sponsor packages
    add_heading(doc, "05  Sponsor packages", level=1)
    add_para(doc, "Three tiers, all with audience hand-off and a Dropt performance report.", size=11)
    pkg_table = doc.add_table(rows=4, cols=3)
    headers = ["Package", "Scope", "Investment"]
    for i, h in enumerate(headers):
        c = pkg_table.rows[0].cells[i]
        shade(c, "1F1F1F")
        run = c.paragraphs[0].add_run(h)
        run.bold = True
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        run.font.size = Pt(10)
    rows = [
        ("Presenting Sponsor — single activation", "~75–125K engaged actions, audience hand-off, performance report", "$150K–$250K"),
        ("Fight-Week Partner — three activations", "~300K actions, branded leaderboard, push co-branding", "$500K–$750K"),
        ("Season Category Exclusive — full year", "Category lockout, every event, quarterly audience refresh", "$1.5M–$3M"),
    ]
    for i, row in enumerate(rows, start=1):
        for j, val in enumerate(row):
            c = pkg_table.rows[i].cells[j]
            r = c.paragraphs[0].add_run(val)
            r.font.size = Pt(10)
            if j == 2:
                r.bold = True
                r.font.color.rgb = ACCENT
    doc.add_paragraph()

    # 06 — Operating model
    add_heading(doc, "06  The CMO operating model", level=1)
    add_para(doc, "One ratio runs the whole company.", size=11)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("Revenue per captured fan  ÷  Cost per captured fan")
    r.bold = True
    r.font.size = Pt(16)
    r.font.color.rgb = ACCENT
    add_para(doc, "If > 1, scale spend. If < 1, fix the funnel. Whole org aligned on one number.",
             size=11, align=WD_ALIGN_PARAGRAPH.CENTER, color=MUTED)
    add_para(doc, "Daily 3-number Slack digest: fans captured (24h) · cost per fan · revenue per fan.",
             size=10, align=WD_ALIGN_PARAGRAPH.CENTER, color=MUTED, italic=True)

    # 07 — Pilot
    add_heading(doc, "07  The 14-day pilot", level=1)
    add_para(doc, "No new tech. No new vendors. No new budget. The cost to test is effectively zero.", size=11)
    add_bullets(doc, [
        ("One sweepstakes live", " — VIP fight experience as the prize, predictions + polls as entry mechanism, fighter-promoted across socials"),
        ("One sponsor pilot sold", " — even at half-rate, to land the case study"),
        ("One retargeting pixel firing", " — across MVP properties + lookalike seeded for next fight"),
        ("One sponsor-ready report", " — exported from Dropt within 48h post-fight: reach, engaged actions, demo split, time spent, completion rate"),
    ])
    add_para(doc, "Targets: 50K+ captured fans · CPF under $3 · audience file delivered to sponsor in 48h.", size=11, bold=True)

    # Bottom line
    doc.add_paragraph()
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("THE BOTTOM LINE")
    r.bold = True
    r.font.size = Pt(10)
    r.font.color.rgb = GOLD

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("We don't need a bigger fight to make more money.\nWe need to keep the fans we already have.")
    r.bold = True
    r.font.size = Pt(16)

    add_para(
        doc,
        "Ryan — pick a fight on the calendar. Send me the date and the top 3 sponsor targets. "
        "I'll come back with a custom activation, audience projection, and price in 5 business days.",
        size=11, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER,
    )

    # Save
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(OUT))
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
