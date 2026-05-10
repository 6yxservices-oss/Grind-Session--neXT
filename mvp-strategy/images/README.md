# Walkthrough Screenshots

Drop the screenshots into this folder using the **exact filenames below**. The HTML walkthrough (`../06-ryan-walkthrough.html`) references each by name — once they're here, the page renders with real product imagery instead of broken-image icons.

## Required files

| Filename | Source screenshot | Where it appears in the HTML |
|---|---|---|
| `mvp-homepage.png` | mostvaluablepromotions.com homepage — Netflix x MVP card showing Diaz vs Perry · Rousey vs Carano · Ngannou vs Lins · "Tickets on Sale · Intuit Dome · Saturday May 16" | Section 00 (the simple idea), Section 02 step 2 (land on site) |
| `mvp-fighter-serrano.png` | Amanda "The Real Deal" Serrano profile page — featherweight stats, 91% win rate, 65% KD rate, hometown Carolina | Section 00 (proof site has rich content) |
| `mvp-fighter-card.png` | Amanda Serrano roster card — yellow background, ESPN P4P #4, 48-4-1 (31 KO) | Section 02 step 1 (fighter assets that drive the social post) |
| `clubmvp-vip-experience.png` | Club MVP mobile — VIP EXPERIENCE screen, Rousey vs Carano hero, "Enter Now", Triple Headliner banner with Join Netflix | Section 02 step 4 (the prize the fan is playing for) |
| `clubmvp-sweepstake.png` | Club MVP mobile — SWEEPSTAKE screen, "VIP Experience · Enter to win a VIP experience to ROUSEY...", entry tiers (1 Entry / 5 Entries / 10 Entries / 25 Entries) with NEED MORE XP buttons | Section 02 step 4 (entry tiers) |
| `clubmvp-polls.png` | Club MVP mobile — POLLS, "Is Ronda Rousey still the most dominant female fighter ever?" with 4 answer options, +10 XP | Section 03 step 1 (earn entries via polls) |
| `clubmvp-polls-legacy.png` | Club MVP mobile — POLLS, Ronda Rousey "LEGACY DEBATE" tile with LIVE badge, +10 XP | Section 03 step 1 (live polls drop daily) |
| `clubmvp-pickems.png` | Club MVP mobile — PICK'EMS, Rousey vs Carano super fight, "Who wins the super fight?" with 4 options (Rousey by Submission/KO, Carano by KO/Decision), 11 challenges remaining | Section 03 step 1 (pick'ems mechanic) |
| `dropt-segments.png` | Dropt — High-Value Audience Segments (4 cards: Weekly Player 53%, High-Frequency Flyer 12%, Watch Collector 19%, Conscious Consumer 41%) | Section 05 (sponsor proof — segments) |
| `dropt-age.png` | Dropt — Age Distribution, "80.5% of audience is under 45", bar chart with 18-24 / 25-34 / 35-44 / 45+ | Section 05 (sponsor proof — demographics) |
| `dropt-travel.png` | Dropt — Psychographics, Travel & Lifestyle tab, "The Experience Seeker" with 44.4% Adventure & Active, 37.8% Frequent Travelers, "Our Unique Insight" travel brands callout | Section 05 (sponsor proof — psychographics tab 1) |
| `dropt-health.png` | Dropt — Psychographics, Health & Wellness tab, "The Conscious Performer" with 55.2% Water for Hydration, 41.3% Healthy Eating, 53% Weekly Golfers, "Our Unique Insight" wellness brands callout | Section 05 (sponsor proof — psychographics tab 2) |

## How to add them

```bash
# from the repo root
cd mvp-strategy/images
# drag-and-drop or cp each screenshot into this folder with the filenames above
git add .
git commit -m "Add walkthrough screenshots"
git push
```

Once pushed, the rendered HTML preview link picks them up automatically.

## Tips

- PNG, JPG, or WebP all work — keep `.png` extensions to match the HTML references, or update the HTML if you use a different format
- Aim for 1× resolution (no need for retina; browsers scale them down anyway)
- File sizes under 500 KB each keep the page snappy
- If you crop/resize, keep aspect ratios intact so the framing looks right
