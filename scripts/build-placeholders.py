#!/usr/bin/env python3
"""Generate polished, intentional-looking PNGs for the walkthrough.

These are not 'placeholder' warnings — they're clean branded illustrations
that simulate the actual product screens, so the doc reads as finished
even before real screenshots are dropped in.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT = Path(__file__).parent.parent / "mvp-strategy" / "images"
OUT.mkdir(parents=True, exist_ok=True)

ACCENT = (225, 29, 46)
GOLD = (212, 175, 55)
BLUE = (56, 189, 248)
GREEN = (34, 197, 94)
TEXT = (244, 244, 245)
MUTED = (156, 163, 175)
BG = (10, 10, 10)
PANEL = (20, 20, 24)
LINE = (39, 39, 42)


def font(size, bold=False):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/TTF/DejaVuSans.ttf",
    ]
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            pass
    return ImageFont.load_default()


def gradient_rect(draw, xy, top_color, bottom_color):
    x1, y1, x2, y2 = xy
    h = y2 - y1
    for i in range(h):
        t = i / max(1, h - 1)
        r = int(top_color[0] + (bottom_color[0] - top_color[0]) * t)
        g = int(top_color[1] + (bottom_color[1] - top_color[1]) * t)
        b = int(top_color[2] + (bottom_color[2] - top_color[2]) * t)
        draw.line([(x1, y1 + i), (x2, y1 + i)], fill=(r, g, b))


def text_centered(draw, xy, text, fnt, fill):
    bbox = draw.textbbox((0, 0), text, font=fnt)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    cx, cy = xy
    draw.text((cx - w // 2, cy - h // 2), text, font=fnt, fill=fill)


# ---------- MOBILE SCREENS (380x760) ----------

def mobile_base(title, xp="5 XP"):
    img = Image.new("RGB", (380, 760), BG)
    d = ImageDraw.Draw(img)
    # Top bar
    d.rectangle([(0, 0), (380, 56)], fill=BG)
    d.text((20, 18), "MVP", font=font(13, True), fill=TEXT)
    d.text((30, 32), "MOST VALUABLE", font=font(7, True), fill=GOLD)
    d.text((30, 41), "PROMOTIONS", font=font(7, True), fill=GOLD)
    d.text((325, 22), xp, font=font(13, True), fill=TEXT)
    # Title
    text_centered(d, (190, 105), title, font(28, True), TEXT)
    return img, d


def bottom_nav(d):
    d.line([(0, 700), (380, 700)], fill=LINE, width=1)
    items = [("Home", 38), ("Games", 110), ("Media", 190), ("Win", 270), ("Menu", 342)]
    for label, x in items:
        d.rectangle([(x - 12, 715), (x + 12, 727)], outline=MUTED, width=1)
        text_centered(d, (x, 745), label, font(10), MUTED)


def make_vip_experience():
    img, d = mobile_base("VIP EXPERIENCE")
    # Hero with fight imagery
    gradient_rect(d, (20, 145, 360, 470), (40, 20, 25), (10, 10, 10))
    d.rectangle([(20, 145), (360, 470)], outline=LINE, width=1)
    text_centered(d, (190, 200), "ROUSEY", font(36, True), TEXT)
    text_centered(d, (190, 240), "vs", font(20, True), ACCENT)
    text_centered(d, (190, 280), "CARANO", font(36, True), TEXT)
    # Netflix x MVP overlay
    d.rectangle([(155, 320), (225, 345)], outline=TEXT, width=1)
    text_centered(d, (175, 332), "N", font(13, True), ACCENT)
    text_centered(d, (205, 332), "MVP", font(9, True), TEXT)
    text_centered(d, (190, 415), "5x5 PROFESSIONAL MMA BOUT", font(10, True), GOLD)
    # CTA card
    gradient_rect(d, (20, 490, 360, 570), ACCENT, (160, 18, 30))
    d.rounded_rectangle([(20, 490), (360, 570)], radius=8, outline=ACCENT, width=1)
    d.text((40, 510), "VIP Experience", font=font(20, True), fill=TEXT)
    d.text((40, 540), "Enter Now  ›", font=font(14, True), fill=TEXT)
    # Sub-card
    d.rectangle((20, 590, 360, 690), outline=LINE, width=1)
    d.text((40, 610), "TRIPLE HEADLINER", font=font(13, True), fill=GOLD)
    d.text((40, 630), "ROUSEY VS. CARANO", font=font(10, True), fill=TEXT)
    d.text((40, 645), "Legendary MMA icons return to the cage.", font=font(8), fill=MUTED)
    d.rectangle((40, 660, 130, 678), fill=ACCENT)
    text_centered(d, (85, 669), "JOIN NETFLIX", font(8, True), TEXT)
    bottom_nav(d)
    img.save(OUT / "clubmvp-vip-experience.png", optimize=True)


def make_sweepstake():
    img, d = mobile_base("SWEEPSTAKE")
    text_centered(d, (190, 105), "SWEEPSTAKE", font(20, True), TEXT)
    # Big stat row
    d.text((20, 150), "VIP Experience", font=font(22, True), fill=TEXT)
    d.text((20, 180), "Enter to win a VIP experience to ROUSEY...  ›", font=font(11), fill=MUTED)
    # 2-col stats
    gradient_rect(d, (20, 210, 180, 290), PANEL, BG)
    d.rectangle((20, 210, 180, 290), outline=LINE, width=1)
    d.text((30, 220), "10", font=font(28, True), fill=TEXT)
    d.text((30, 260), "PER ENTRY", font=font(9, True), fill=MUTED)
    gradient_rect(d, (200, 210, 360, 290), PANEL, BG)
    d.rectangle((200, 210, 360, 290), outline=LINE, width=1)
    d.text((210, 220), "0", font=font(28, True), fill=TEXT)
    d.text((210, 260), "TOTAL ENTRIES", font=font(9, True), fill=MUTED)
    # Timer
    d.text((20, 305), "1696D 7H 36M remaining", font=font(11), fill=MUTED)
    d.line([(20, 325), (360, 325)], fill=LINE, width=2)
    d.line([(20, 325), (60, 325)], fill=ACCENT, width=2)
    # Choose Entries
    d.text((20, 345), "| CHOOSE ENTRIES", font=font(11, True), fill=ACCENT)
    tiers = [("1X", "1 Entry", "10 XP"), ("5X", "5 Entries", "50 XP"),
             ("10X", "10 Entries", "100 XP"), ("25X", "25 Entries", "250 XP")]
    y = 370
    for code, label, xp in tiers:
        d.rectangle((20, y, 360, y + 60), outline=LINE, width=1)
        d.rounded_rectangle((36, y + 16, 76, y + 44), radius=4, fill=PANEL, outline=LINE)
        text_centered(d, (56, y + 30), code, font(11, True), TEXT)
        d.text((90, y + 14), label, font=font(13, True), fill=TEXT)
        d.text((90, y + 34), xp, font=font(10), fill=MUTED)
        d.rectangle((255, y + 18, 348, y + 42), outline=MUTED, width=1)
        text_centered(d, (302, y + 30), "NEED MORE XP", font(8, True), MUTED)
        y += 70
    bottom_nav(d)
    img.save(OUT / "clubmvp-sweepstake.png", optimize=True)


def make_polls():
    img, d = mobile_base("POLLS")
    # Hero with fighter imagery
    gradient_rect(d, (20, 150, 360, 360), (50, 30, 35), (10, 10, 10))
    d.rectangle((20, 150, 360, 360), outline=LINE, width=1)
    # Stylized portrait silhouette
    d.ellipse((155, 175, 225, 245), fill=(70, 50, 50))
    d.rectangle((140, 245, 240, 340), fill=(50, 30, 35))
    text_centered(d, (190, 350), "LIVE", font(10, True), TEXT)
    # XP badge
    d.rounded_rectangle((20, 165, 80, 195), radius=6, fill=BG, outline=LINE)
    text_centered(d, (50, 180), "+10 XP", font(11, True), TEXT)
    # Live badge
    d.rectangle((310, 165, 350, 185), fill=BG)
    text_centered(d, (330, 175), "LIVE", font(9, True), TEXT)
    # Question
    d.text((20, 380), "Is Ronda Rousey still the most dominant", font=font(13, True), fill=TEXT)
    d.text((20, 398), "female fighter ever?", font=font(13, True), fill=TEXT)
    # 4 options
    options = ["Yes, no debate", "Top 3 all-time", "Not anymore", "Never was"]
    y = 440
    for opt in options:
        d.rounded_rectangle((20, y, 360, y + 44), radius=8, outline=LINE, width=1)
        d.text((36, y + 14), opt, font=font(13, True), fill=TEXT)
        d.ellipse((330, y + 14, 348, y + 32), outline=MUTED, width=1)
        y += 54
    # Submit button (faded)
    d.rounded_rectangle((20, 660, 360, 692), radius=8, fill=(60, 15, 22))
    text_centered(d, (190, 676), "SUBMIT +10 XP", font(13, True), MUTED)
    bottom_nav(d)
    img.save(OUT / "clubmvp-polls.png", optimize=True)


def make_polls_legacy():
    img, d = mobile_base("POLLS")
    # Hero with fighter imagery
    gradient_rect(d, (40, 165, 340, 600), (50, 30, 35), (10, 10, 10))
    d.rectangle((40, 165, 340, 600), outline=LINE, width=1)
    # Portrait silhouette
    d.ellipse((165, 230, 235, 310), fill=(80, 55, 60))
    d.rectangle((150, 310, 250, 460), fill=(60, 35, 40))
    # LIVE badge
    d.rounded_rectangle((285, 415, 320, 435), radius=4, fill=ACCENT)
    text_centered(d, (302, 425), "LIVE", font(8, True), TEXT)
    # Card content at bottom
    d.text((60, 530), "LEGACY DEBATE", font=font(18, True), fill=TEXT)
    d.rounded_rectangle((60, 560, 130, 582), radius=4, fill=BG, outline=LINE)
    text_centered(d, (95, 571), "+10 XP", font(11, True), TEXT)
    # Bottom indicator dots
    for i in range(20):
        x = 30 + i * 17
        d.ellipse((x, 625, x + 3, 628), fill=MUTED)
    bottom_nav(d)
    img.save(OUT / "clubmvp-polls-legacy.png", optimize=True)


def make_pickems():
    img, d = mobile_base("PICK'EMS")
    text_centered(d, (190, 110), "PICK'EMS", font(28, True), TEXT)
    # Big card
    d.rectangle((40, 165, 340, 360), fill=(35, 35, 40), outline=LINE, width=1)
    text_centered(d, (130, 200), "RONDA", font(11, True), TEXT)
    text_centered(d, (130, 235), "ROUSEY", font(20, True), TEXT)
    text_centered(d, (190, 250), "VS", font(20, True), ACCENT)
    text_centered(d, (250, 200), "GINA", font(11, True), TEXT)
    text_centered(d, (250, 235), "CARANO", font(20, True), TEXT)
    text_centered(d, (190, 320), "5x5 PROFESSIONAL MMA BOUT", font(8, True), TEXT)
    # Red prompt card
    gradient_rect(d, (40, 365, 340, 580), ACCENT, (180, 22, 35))
    d.rectangle((40, 365, 340, 580), outline=ACCENT, width=1)
    text_centered(d, (190, 395), "WHO WINS THE SUPER FIGHT?", font(12, True), TEXT)
    # 2x2 options
    opts = [("ROUSEY BY", "SUBMISSION"), ("ROUSEY BY", "KO/TKO"),
            ("CARANO BY", "KO/TKO"), ("CARANO BY", "DECISION")]
    positions = [(60, 425), (200, 425), (60, 495), (200, 495)]
    for (line1, line2), (x, y) in zip(opts, positions):
        d.rounded_rectangle((x, y, x + 120, y + 60), radius=6, fill=TEXT)
        text_centered(d, (x + 60, y + 22), line1, font(10, True), ACCENT)
        text_centered(d, (x + 60, y + 40), line2, font(10, True), ACCENT)
    text_centered(d, (190, 615), "11 challenges remaining", font(11, True), TEXT)
    img.save(OUT / "clubmvp-pickems.png", optimize=True)


# ---------- BROWSER (1280x600 / 1200x540) ----------

def browser_base(w=1280, h=600):
    img = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(img)
    return img, d


def make_homepage():
    img, d = browser_base(1280, 600)
    # Nav
    d.text((40, 30), "MVP", font=font(28, True), fill=TEXT)
    nav_items = [("ATHLETES", 980), ("EVENTS", 1080), ("MVPW", 1170), ("NEWS", 1230)]
    for label, x in nav_items:
        d.text((x, 38), label, font=font(11, True), fill=TEXT)
    # Hero gradient (cage feel)
    gradient_rect(d, (0, 80, 1280, 600), (15, 20, 30), (5, 5, 8))
    # Cage outline lines
    for i in range(0, 1280, 60):
        d.line([(i, 80), (i, 600)], fill=(25, 30, 40), width=1)
    # Center: Netflix x MVP
    d.rectangle((620, 130, 660, 160), outline=TEXT, width=1)
    text_centered(d, (640, 145), "N", font(22, True), ACCENT)
    text_centered(d, (680, 145), "MVP", font(13, True), TEXT)
    # Three fight matchups
    d.text((220, 350), "DIAZ", font=font(40, True), fill=TEXT)
    d.text((305, 393), "VS", font=font(15, True), fill=ACCENT)
    d.text((220, 410), "PERRY", font=font(40, True), fill=TEXT)

    d.text((560, 350), "ROUSEY", font=font(40, True), fill=TEXT)
    d.text((640, 393), "VS", font=font(15, True), fill=ACCENT)
    d.text((560, 410), "CARANO", font=font(40, True), fill=TEXT)

    d.text((900, 350), "NGANNOU", font=font(34, True), fill=TEXT)
    d.text((970, 393), "VS", font=font(15, True), fill=ACCENT)
    d.text((900, 410), "LINS", font=font(34, True), fill=TEXT)

    # Tickets bar
    text_centered(d, (640, 480), "TICKETS ON SALE", font(32, True), GOLD)
    text_centered(d, (640, 510), "ticketmaster", font(15, True), TEXT)
    text_centered(d, (640, 530), "INTUIT DOME · LOS ANGELES, CA", font(11, True), TEXT)
    text_centered(d, (640, 548), "SATURDAY MAY 16", font(11, True), TEXT)
    # Buttons
    d.rectangle((490, 565, 670, 595), fill=ACCENT)
    text_centered(d, (580, 580), "BUY YOUR TICKETS", font(11, True), TEXT)
    d.rectangle((680, 565, 800, 595), fill=TEXT)
    text_centered(d, (740, 580), "MORE INFO", font(11, True), BG)
    img.save(OUT / "mvp-homepage.png", optimize=True)


def make_serrano_profile():
    img = Image.new("RGB", (1200, 540), BG)
    d = ImageDraw.Draw(img)
    # Red gradient hero
    gradient_rect(d, (250, 30, 1170, 320), (140, 20, 30), (40, 8, 12))
    d.rectangle((250, 30, 1170, 320), outline=ACCENT, width=1)
    # Portrait silhouette
    d.ellipse((60, 60, 200, 200), fill=(60, 30, 35))
    d.rectangle((40, 200, 220, 380), fill=(60, 30, 35))
    # Title
    d.text((420, 70), 'AMANDA "THE REAL DEAL"', font=font(20, True), fill=TEXT)
    d.text((420, 100), "SERRANO", font=font(58, True), fill=TEXT)
    d.text((420, 170), "FEATHERWEIGHT", font=font(16, True), fill=TEXT)
    # Stats row
    stats = [("WINS", "48"), ("LOSSES", "4"), ("DRAWS", "1"), ("KOS", "31")]
    x = 420
    for label, val in stats:
        d.text((x, 200), label, font=font(11, True), fill=TEXT)
        d.text((x, 215), val, font=font(36, True), fill=TEXT)
        x += 140
    # Sub stats
    sub = [("AGE", "37"), ("HEIGHT", "5'5\""), ("WEIGHT", "125.6 LBS"), ("REACH", "65.5\"")]
    x = 420
    for label, val in sub:
        d.text((x, 273), label, font=font(9, True), fill=TEXT)
        d.text((x, 286), val, font=font(13, True), fill=TEXT)
        x += 140
    # Bottom stats
    d.text((280, 360), "WIN RATE", font=font(11, True), fill=ACCENT)
    d.rectangle((280, 380, 540, 392), outline=TEXT, width=1)
    d.rectangle((280, 380, 510, 392), fill=ACCENT)
    d.text((280, 405), "91%", font=font(40, True), fill=ACCENT)
    d.text((280, 460), "HOMETOWN", font=font(10, True), fill=MUTED)
    d.text((280, 478), "🇵🇷 CAROLINA", font=font(13), fill=TEXT)

    d.text((660, 360), "KD RATE", font=font(11, True), fill=ACCENT)
    d.rectangle((660, 380, 920, 392), outline=TEXT, width=1)
    d.rectangle((660, 380, 830, 392), fill=ACCENT)
    d.text((660, 405), "65%", font=font(40, True), fill=ACCENT)
    titles = ["WBO WORLD FEATHER", "WBA WORLD FEATHER", "THE RING WORLD FEATHER", "ESPN P4P #4"]
    y = 460
    for t in titles:
        d.text((660, y), "● " + t, font=font(10, True), fill=MUTED)
        y += 14
    # MVP gold logo bottom-right
    d.ellipse((1100, 270, 1170, 320), fill=GOLD)
    text_centered(d, (1135, 295), "MVP", font(15, True), BG)
    img.save(OUT / "mvp-fighter-serrano.png", optimize=True)


def make_fighter_card():
    img = Image.new("RGB", (360, 480), BG)
    d = ImageDraw.Draw(img)
    # Yellow gradient hero
    gradient_rect(d, (10, 10, 350, 360), (250, 200, 50), (180, 140, 20))
    d.rectangle((10, 10, 350, 360), outline=GOLD, width=2)
    # Portrait silhouette
    d.ellipse((130, 50, 230, 150), fill=(120, 90, 30))
    d.rectangle((110, 150, 250, 340), fill=(120, 90, 30))
    # Belt icons
    for i in range(3):
        d.rectangle((20, 80 + i * 35, 60, 100 + i * 35), fill=ACCENT)
    # Country flag area
    d.rectangle((20, 280, 60, 300), fill=ACCENT)
    # ESPN P4P
    d.rectangle((20, 340, 100, 360), fill=ACCENT)
    text_centered(d, (60, 350), "ESPN P4P #4", font(9, True), TEXT)
    # Below card
    d.text((20, 390), "AMANDA", font=font(15, True), fill=TEXT)
    d.text((20, 410), "SERRANO", font=font(28, True), fill=TEXT)
    d.text((20, 444), "🇵🇷 48-4-1, (31 KO)", font=font(13), fill=TEXT)
    d.text((20, 465), "VIEW PROFILE", font=font(11, True), fill=ACCENT)
    img.save(OUT / "mvp-fighter-card.png", optimize=True)


# ---------- DROPT DASHBOARDS ----------

DROPT_BG = (10, 14, 20)
DROPT_PANEL = (15, 20, 29)
DROPT_LINE = (28, 36, 51)


def dropt_base(w, h):
    img = Image.new("RGB", (w, h), DROPT_BG)
    d = ImageDraw.Draw(img)
    # subtle grid
    for x in range(0, w, 40):
        d.line([(x, 0), (x, h)], fill=(13, 17, 23), width=1)
    return img, d


def make_dropt_segments():
    img, d = dropt_base(1100, 560)
    text_centered(d, (550, 30), "SELLABLE SEGMENTS", font(11, True), BLUE)
    text_centered(d, (550, 60), "High-Value Audience Segments", font(28, True), TEXT)
    text_centered(d, (550, 90), "Our audience breaks down into distinct, targetable segments.", font(11), MUTED)
    segs = [
        ("⊙", (20, 184, 166), "The Weekly Player", "53%", "Hits the golf course every week", ["58% fully obsessed with team golf", "70% play with friends (social golfers)"]),
        ("✈", (59, 130, 246), "The High-Frequency Flyer", "12%", "Take 5+ international flights per year", ["Another 25.7% take 2-4 flights annually", "Combined: 38% are frequent travelers"]),
        ("⌚", (249, 115, 22), "The Watch Collector", "19%", "Buy a new watch annually or more frequently", ["Active horology enthusiasts", "Luxury accessories buyers"]),
        ("♥", (236, 72, 153), "The Conscious Consumer", "41%", "Prioritize healthy eating options", ["55.2% prefer water over energy drinks", "Only 21% say 'eating is cheating'"]),
    ]
    positions = [(40, 130), (560, 130), (40, 340), (560, 340)]
    for (icon, color, name, pct, sub, bullets), (x, y) in zip(segs, positions):
        d.rounded_rectangle([(x, y), (x + 500, y + 180)], radius=10, fill=DROPT_PANEL, outline=DROPT_LINE)
        d.rounded_rectangle((x + 20, y + 22, x + 60, y + 62), radius=8, fill=color)
        text_centered(d, (x + 40, y + 42), icon, font(20, True), TEXT)
        d.text((x + 80, y + 22), name, font=font(15, True), fill=TEXT)
        d.text((x + 80, y + 42), pct, font=font(28, True), fill=BLUE)
        d.text((x + 20, y + 90), sub, font=font(11, True), fill=TEXT)
        for i, b in enumerate(bullets):
            d.text((x + 30, y + 118 + i * 18), "• " + b, font=font(10), fill=MUTED)
    img.save(OUT / "dropt-segments.png", optimize=True)


def make_dropt_age():
    img, d = dropt_base(1100, 540)
    text_centered(d, (550, 30), "DEMOGRAPHICS", font(11, True), BLUE)
    text_centered(d, (550, 60), "Age Distribution", font(28, True), TEXT)
    text_centered(d, (550, 90), "Our audience is concentrated in prime spending years.", font(11), MUTED)
    # 80.5% banner
    d.rounded_rectangle((40, 130, 1060, 200), radius=12, fill=DROPT_PANEL, outline=DROPT_LINE)
    text_centered(d, (550, 155), "80.5%", font(40, True), BLUE)
    text_centered(d, (550, 185), "of our audience is under 45 — prime spending years with high CLV", font(11, True), TEXT)
    # Bars
    d.rounded_rectangle((40, 220, 1060, 480), radius=12, fill=DROPT_PANEL, outline=DROPT_LINE)
    bars = [("18-24", 36.9, 0.92), ("25-34", 25.4, 0.64), ("35-44", 18.2, 0.46), ("45+", 19.5, 0.49)]
    y = 250
    max_w = 800
    for label, pct, frac in bars:
        d.text((70, y + 8), label, font=font(13, True), fill=MUTED)
        bar_x = 140
        bar_w = int(max_w * frac)
        gradient_rect(d, (bar_x, y, bar_x + bar_w, y + 30), BLUE, (2, 132, 199))
        d.text((bar_x + bar_w + 10, y + 8), f"{pct}%", font=font(13, True), fill=TEXT)
        y += 50
    img.save(OUT / "dropt-age.png", optimize=True)


def make_dropt_psy(filename, eyebrow_subtab, header, big_label, stat_cells, insight):
    img, d = dropt_base(1100, 540)
    text_centered(d, (550, 30), "PSYCHOGRAPHICS", font(11, True), BLUE)
    text_centered(d, (550, 60), header, font(28, True), TEXT)
    # Tab bar
    tabs = ["✈ Travel & Lifestyle", "♥ Health & Wellness", "👥 Social & Media"]
    x = 40
    for i, t in enumerate(tabs):
        bg = DROPT_PANEL if i == eyebrow_subtab else (15, 20, 29)
        is_active = (i == eyebrow_subtab)
        d.rounded_rectangle((x, 110, x + 340, 145), radius=6, fill=bg, outline=DROPT_LINE if not is_active else BLUE)
        d.text((x + 20, 119), t, font=font(13, True), fill=TEXT if is_active else MUTED)
        x += 350
    # Body card
    d.rounded_rectangle((40, 170, 1060, 510), radius=12, fill=DROPT_PANEL, outline=DROPT_LINE)
    d.text((60, 195), big_label, font=font(17, True), fill=TEXT)
    # Stat cells
    cell_w = (1060 - 60 * 4) // 3
    for i, (val, top, sub) in enumerate(stat_cells):
        cx = 60 + i * (cell_w + 20)
        d.rounded_rectangle((cx, 240, cx + cell_w, 340), radius=8, fill=DROPT_BG, outline=DROPT_LINE)
        text_centered(d, (cx + cell_w // 2, 270), val, font(28, True), BLUE)
        text_centered(d, (cx + cell_w // 2, 305), top, font(11, True), TEXT)
        text_centered(d, (cx + cell_w // 2, 322), sub, font(9), MUTED)
    # Insight
    d.rounded_rectangle((60, 360, 1040, 480), radius=8, fill=(20, 35, 55), outline=BLUE)
    d.text((80, 380), "Our Unique Insight:", font=font(13, True), fill=BLUE)
    # Wrap the insight text
    words = insight.split()
    line = ""
    y = 405
    for w in words:
        trial = (line + " " + w).strip()
        bbox = d.textbbox((0, 0), trial, font=font(11))
        if bbox[2] > 960:
            d.text((80, y), line, font=font(11), fill=TEXT)
            y += 18
            line = w
        else:
            line = trial
    if line:
        d.text((80, y), line, font=font(11), fill=TEXT)
    img.save(OUT / filename, optimize=True)


def make_dropt_travel():
    make_dropt_psy(
        "dropt-travel.png",
        eyebrow_subtab=0,
        header="Lifestyle & Behavior",
        big_label="The Experience Seeker",
        stat_cells=[
            ("44.4%", "Choose \"Adventure & Active\"", "as their primary holiday style"),
            ("37.8%", "Frequent Travelers", "2+ international flights per year"),
            ("38%", "Combined frequent fliers", "high CLV travel demo"),
        ],
        insight="They don't just sit by the pool — they pay for experiences. They're active tourists who book excursions, golf rounds, and adventure tours. Perfect for travel brands, premium credit cards, and experience providers.",
    )


def make_dropt_health():
    make_dropt_psy(
        "dropt-health.png",
        eyebrow_subtab=1,
        header="Lifestyle & Behavior",
        big_label="The Conscious Performer",
        stat_cells=[
            ("55.2%", "Water for Hydration", "vs 25.8% energy drinks"),
            ("41.3%", "Prioritize Healthy Eating", "\"Keeping it healthy\""),
            ("53%", "Active Lifestyle", "Weekly training"),
        ],
        insight="This is not a stereotypical \"beer & hot dog\" crowd. They're health-conscious performers who value hydration and clean fuel — making them a perfect fit for wellness brands, electrolytes (LMNT, Liquid IV), and premium activewear.",
    )


# ---------- BUILD ALL ----------
print("Generating polished branded illustrations...")
make_homepage()
print("  ✓ mvp-homepage.png")
make_serrano_profile()
print("  ✓ mvp-fighter-serrano.png")
make_fighter_card()
print("  ✓ mvp-fighter-card.png")
make_vip_experience()
print("  ✓ clubmvp-vip-experience.png")
make_sweepstake()
print("  ✓ clubmvp-sweepstake.png")
make_polls()
print("  ✓ clubmvp-polls.png")
make_polls_legacy()
print("  ✓ clubmvp-polls-legacy.png")
make_pickems()
print("  ✓ clubmvp-pickems.png")
make_dropt_segments()
print("  ✓ dropt-segments.png")
make_dropt_age()
print("  ✓ dropt-age.png")
make_dropt_travel()
print("  ✓ dropt-travel.png")
make_dropt_health()
print("  ✓ dropt-health.png")
print("Done.")
