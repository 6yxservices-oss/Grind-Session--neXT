#!/usr/bin/env python3
"""Generate styled placeholder PNGs for the walkthrough so the HTML renders
even before real product screenshots are dropped in.

Each placeholder has the right aspect ratio and is clearly labeled with
what should replace it (filename + description).
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT = Path(__file__).parent.parent / "mvp-strategy" / "images"
OUT.mkdir(parents=True, exist_ok=True)

# Brand colors
BG = (10, 10, 10)
PANEL = (20, 20, 20)
BORDER = (40, 40, 40)
ACCENT = (225, 29, 46)
GOLD = (212, 175, 55)
BLUE = (56, 189, 248)
TEXT = (244, 244, 245)
MUTED = (156, 163, 175)


def font(size, bold=False):
    """Pick a sane default font."""
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/usr/share/fonts/TTF/DejaVuSans.ttf",
    ]
    for c in candidates:
        try:
            return ImageFont.truetype(c, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def make_placeholder(filename, w, h, kind, label, description, accent=ACCENT):
    """kind = 'mobile' | 'browser' | 'dashboard' | 'card'."""
    img = Image.new("RGB", (w, h), BG)
    draw = ImageDraw.Draw(img)

    # Subtle grid pattern
    for x in range(0, w, 40):
        draw.line([(x, 0), (x, h)], fill=(18, 18, 18), width=1)
    for y in range(0, h, 40):
        draw.line([(0, y), (w, y)], fill=(18, 18, 18), width=1)

    # Border + accent corner
    draw.rectangle([(0, 0), (w - 1, h - 1)], outline=BORDER, width=2)
    draw.rectangle([(0, 0), (w, 6)], fill=accent)

    # Type chip
    chip_text = kind.upper()
    chip_font = font(14, bold=True)
    bbox = draw.textbbox((0, 0), chip_text, font=chip_font)
    cw = bbox[2] - bbox[0] + 24
    ch = bbox[3] - bbox[1] + 12
    cx = (w - cw) // 2
    cy = h // 2 - 100
    draw.rounded_rectangle([(cx, cy), (cx + cw, cy + ch)], radius=12, fill=accent)
    draw.text((cx + 12, cy + 6), chip_text, font=chip_font, fill=(255, 255, 255))

    # Label
    label_font = font(28, bold=True)
    bbox = draw.textbbox((0, 0), label, font=label_font)
    lw = bbox[2] - bbox[0]
    draw.text(((w - lw) // 2, h // 2 - 50), label, font=label_font, fill=TEXT)

    # Filename
    fn_font = font(13, bold=False)
    bbox = draw.textbbox((0, 0), filename, font=fn_font)
    fw = bbox[2] - bbox[0]
    draw.text(((w - fw) // 2, h // 2 - 12), filename, font=fn_font, fill=GOLD)

    # Description (multi-line, centered, wrapped)
    desc_font = font(12, bold=False)
    words = description.split()
    lines = []
    line = ""
    max_chars = max(20, w // 9)
    for word in words:
        if len(line) + len(word) + 1 <= max_chars:
            line = (line + " " + word).strip()
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    y_off = h // 2 + 18
    for ln in lines[:6]:
        bbox = draw.textbbox((0, 0), ln, font=desc_font)
        lw = bbox[2] - bbox[0]
        draw.text(((w - lw) // 2, y_off), ln, font=desc_font, fill=MUTED)
        y_off += 18

    # "PLACEHOLDER — replace with real screenshot" footer
    foot_font = font(11, bold=True)
    foot = "PLACEHOLDER — REPLACE WITH ACTUAL SCREENSHOT"
    bbox = draw.textbbox((0, 0), foot, font=foot_font)
    fw = bbox[2] - bbox[0]
    draw.text(((w - fw) // 2, h - 28), foot, font=foot_font, fill=accent)

    img.save(OUT / filename, optimize=True)
    print(f"  wrote {filename}  ({w}x{h})")


# Spec: (filename, w, h, kind, short_label, long_description)
SPECS = [
    ("mvp-homepage.png", 1280, 600, "BROWSER",
     "MVP HOMEPAGE",
     "Real mostvaluablepromotions.com — Netflix x MVP card with Diaz vs Perry, Rousey vs Carano, Ngannou vs Lins, Tickets On Sale, Intuit Dome, Sat May 16"),

    ("mvp-fighter-serrano.png", 1200, 540, "BROWSER",
     "AMANDA SERRANO PROFILE",
     "Featherweight, 48-4-1 (31 KO), 91% win rate, 65% KD rate, hometown Carolina"),

    ("mvp-fighter-card.png", 360, 480, "CARD",
     "SERRANO ROSTER CARD",
     "Yellow background, ESPN P4P #4, View Profile CTA"),

    ("clubmvp-vip-experience.png", 380, 760, "MOBILE",
     "VIP EXPERIENCE",
     "Rousey vs Carano hero, Enter Now CTA, Triple Headliner banner with Join Netflix"),

    ("clubmvp-sweepstake.png", 380, 760, "MOBILE",
     "SWEEPSTAKE ENTRY TIERS",
     "VIP Experience prize · 1/5/10/25 entries with NEED MORE XP buttons · 1696D 7H remaining"),

    ("clubmvp-polls.png", 380, 760, "MOBILE",
     "POLLS — RONDA",
     "Is Ronda Rousey still the most dominant female fighter ever? — 4 answers, +10 XP, 5 XP shown"),

    ("clubmvp-polls-legacy.png", 380, 760, "MOBILE",
     "POLLS — LEGACY DEBATE",
     "Ronda Rousey LEGACY DEBATE tile, LIVE badge, +10 XP, MVP logo, bottom nav"),

    ("clubmvp-pickems.png", 380, 760, "MOBILE",
     "PICK'EMS — SUPER FIGHT",
     "Rousey vs Carano · Who wins the super fight? · 4 method options · 11 challenges remaining"),

    ("dropt-segments.png", 1100, 560, "DASHBOARD",
     "DROPT — SELLABLE SEGMENTS",
     "4 cards: Weekly Player 53%, High-Frequency Flyer 12%, Watch Collector 19%, Conscious Consumer 41%",
     ),

    ("dropt-age.png", 1100, 540, "DASHBOARD",
     "DROPT — AGE DISTRIBUTION",
     "80.5% of audience under 45 · 18-24: 36.9% · 25-34: 25.4% · 35-44: 18.2% · 45+: 19.5%"),

    ("dropt-travel.png", 1100, 540, "DASHBOARD",
     "DROPT — TRAVEL & LIFESTYLE",
     "The Experience Seeker — 44.4% Adventure & Active, 37.8% Frequent Travelers, travel brands fit insight"),

    ("dropt-health.png", 1100, 540, "DASHBOARD",
     "DROPT — HEALTH & WELLNESS",
     "The Conscious Performer — 55.2% Water for Hydration, 41.3% Healthy Eating, 53% Active Lifestyle"),
]

print(f"Generating {len(SPECS)} placeholder images into {OUT}/ ...")
for spec in SPECS:
    if len(spec) == 6:
        fn, w, h, kind, label, desc = spec
        accent = ACCENT
    else:
        fn, w, h, kind, label, desc, accent = spec
    # Color hint: dropt screens are blue-tinted, mobile/club uses red, mvp browser uses red
    if fn.startswith("dropt-"):
        accent = BLUE
    make_placeholder(fn, w, h, kind, label, desc, accent=accent)

print("Done.")
