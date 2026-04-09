"""
Member Email Template Generator
---------------------------------
Produces ready-to-send email templates (.html) for Blueprint (client)
to distribute to members per intel drop.

Blueprint receives the finished email files — they handle sending.
Each drop generates a set of emails tied to the drop timeline.
"""

from __future__ import annotations

from pathlib import Path
from datetime import datetime

# ── Brand Constants ───────────────────────────────────────────────────────────
NAVY = "#041E42"
GOLD = "#B8860B"
LIGHT_BLUE = "#A2D2FF"
WHITE = "#FFFFFF"
GRAY = "#666666"
BG_DARK = "#0A1628"

EMAIL_WRAPPER = """\
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{subject}</title>
<style>
  body {{ margin: 0; padding: 0; background: #f4f4f4; font-family: Arial, sans-serif; }}
  .container {{ max-width: 600px; margin: 0 auto; background: {WHITE}; }}
  .header {{ background: {NAVY}; padding: 24px 32px; text-align: center; }}
  .header h1 {{ color: {WHITE}; font-size: 18px; margin: 0; letter-spacing: 2px; }}
  .header .subtitle {{ color: {LIGHT_BLUE}; font-size: 12px; margin-top: 4px; }}
  .body {{ padding: 32px; color: #333; font-size: 15px; line-height: 1.6; }}
  .body h2 {{ color: {NAVY}; font-size: 20px; margin-top: 0; }}
  .body p {{ margin: 0 0 16px 0; }}
  .cta-btn {{ display: inline-block; background: {GOLD}; color: {WHITE}; padding: 14px 32px;
              text-decoration: none; font-weight: bold; font-size: 15px; border-radius: 4px;
              margin: 16px 0; }}
  .player-card {{ background: {BG_DARK}; padding: 16px 20px; margin: 16px 0; border-radius: 6px; }}
  .player-card .name {{ color: {WHITE}; font-size: 16px; font-weight: bold; }}
  .player-card .school {{ color: {LIGHT_BLUE}; font-size: 13px; }}
  .player-card .measurables {{ color: {LIGHT_BLUE}; font-size: 12px; margin-top: 4px; }}
  .divider {{ border: none; border-top: 1px solid #ddd; margin: 24px 0; }}
  .footer {{ background: #f0f0f0; padding: 20px 32px; text-align: center; font-size: 11px; color: {GRAY}; }}
  .footer a {{ color: {NAVY}; }}
  .xp-badge {{ display: inline-block; background: {GOLD}; color: {WHITE}; padding: 2px 8px;
               border-radius: 3px; font-size: 11px; font-weight: bold; }}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>HVU INSIDER</h1>
    <div class="subtitle">{header_subtitle}</div>
  </div>
  <div class="body">
    {body_content}
  </div>
  <div class="footer">
    HVU Insider Network &mdash; Exclusive Penn State Recruiting Intel<br>
    <a href="{{{{platform_link}}}}">Visit the Platform</a> &nbsp;|&nbsp;
    <a href="{{{{unsubscribe_link}}}}">Unsubscribe</a>
  </div>
</div>
</body>
</html>
"""


def _player_cards_html(players: list[dict]) -> str:
    """Generate HTML player cards for email body."""
    cards = []
    for p in players:
        m = p.get("measurables", {})
        measurables = f"{m.get('height', 'TBD')} | {m.get('weight', 'TBD')} lbs"
        cards.append(
            f'<div class="player-card">'
            f'  <div class="name">{p["name"].upper()}</div>'
            f'  <div class="school">{p.get("school", "")}</div>'
            f'  <div class="measurables">{measurables}</div>'
            f"</div>"
        )
    return "\n".join(cards)


def _build_email(
    subject: str,
    header_subtitle: str,
    body_content: str,
) -> str:
    """Wrap body content in the branded email template."""
    return EMAIL_WRAPPER.format(
        subject=subject,
        header_subtitle=header_subtitle,
        body_content=body_content,
        WHITE=WHITE,
        NAVY=NAVY,
        LIGHT_BLUE=LIGHT_BLUE,
        GOLD=GOLD,
        GRAY=GRAY,
        BG_DARK=BG_DARK,
    )


def build_member_emails(
    position: str,
    year: int,
    players: list[dict],
    drop_date: str,
    context_narrative: str,
    output_dir: Path,
) -> list[Path]:
    """
    Generate the full set of member email templates for Blueprint.

    Returns list of paths to generated .html files.
    """
    pos = position.upper()
    output_dir.mkdir(parents=True, exist_ok=True)
    email_dir = output_dir / "emails"
    email_dir.mkdir(exist_ok=True)

    n = len(players)
    all_names = ", ".join(p["name"] for p in players)
    top_target = players[0]["name"] if players else "TBD"
    player_cards = _player_cards_html(players)

    generated: list[Path] = []

    # ═══════════════════════════════════════════════════════════════════════
    # EMAIL 1: Drop Day Launch (10 AM)
    # ═══════════════════════════════════════════════════════════════════════
    body = f"""\
<h2>The {year} {pos} Board Is Live</h2>
<p>The wait is over. Our {pos} intel drop just went live on the platform.</p>
<p>{context_narrative}</p>
<p><strong>{n} targets. Full scouting intel. Insider evaluation boxes.</strong></p>
{player_cards}
<hr class="divider">
<p style="text-align: center;">
  <a href="{{{{article_link}}}}" class="cta-btn">READ THE FULL INTEL DROP</a>
</p>
<p style="text-align: center; font-size: 13px; color: {GRAY};">
  Plus: polls, trivia, and a keyword hunt worth <span class="xp-badge">+20 XP</span>
</p>
"""
    email1 = _build_email(
        subject=f"LIVE: {year} {pos} Intel Drop — {n} Targets Revealed",
        header_subtitle=f"{year} {pos} INTEL DROP",
        body_content=body,
    )
    p1 = email_dir / f"01_drop_launch_{pos.lower()}.html"
    p1.write_text(email1)
    generated.append(p1)

    # ═══════════════════════════════════════════════════════════════════════
    # EMAIL 2: Top Target Spotlight (Drop Day PM)
    # ═══════════════════════════════════════════════════════════════════════
    top_player = players[0] if players else {}
    top_m = top_player.get("measurables", {})
    top_fit = top_player.get("the_fit", "Full scouting analysis available on the platform.")

    body2 = f"""\
<h2>Target Spotlight: {top_target}</h2>
<div class="player-card">
  <div class="name">{top_target.upper()}</div>
  <div class="school">{top_player.get('school', '')}</div>
  <div class="measurables">{top_m.get('height', 'TBD')} | {top_m.get('weight', 'TBD')} lbs</div>
</div>
<p>{top_fit[:300]}...</p>
<hr class="divider">
<p style="text-align: center;">
  <a href="{{{{article_link}}}}" class="cta-btn">READ THE FULL PROFILE</a>
</p>
<p style="text-align: center; font-size: 13px; color: {GRAY};">
  Cast your vote: Does {top_target} fit the system? <span class="xp-badge">+10 XP</span>
</p>
"""
    email2 = _build_email(
        subject=f"Spotlight: {top_target} — Does He Fit Penn State's System?",
        header_subtitle=f"TARGET SPOTLIGHT | {pos}",
        body_content=body2,
    )
    p2 = email_dir / f"02_top_target_{pos.lower()}.html"
    p2.write_text(email2)
    generated.append(p2)

    # ═══════════════════════════════════════════════════════════════════════
    # EMAIL 3: Engagement Push (Drop +1)
    # ═══════════════════════════════════════════════════════════════════════
    body3 = f"""\
<h2>Your Turn: Scout the {year} {pos} Board</h2>
<p>The intel is live. The profiles are up. Now we want to hear from YOU.</p>
<p><strong>Here's what's waiting on the platform:</strong></p>
<ul style="padding-left: 20px;">
  <li>6 trivia questions testing your {pos} knowledge <span class="xp-badge">+5 XP each</span></li>
  <li>3 pick'ems — who commits first? <span class="xp-badge">+5 XP each</span></li>
  <li>Polls — which {pos} fits PSU best? <span class="xp-badge">+10 XP each</span></li>
  <li>"Which {pos} Are You?" personality quiz <span class="xp-badge">+10-40 XP</span></li>
  <li>Challenge: Hit the XP target for sweepstakes entries <span class="xp-badge">+1,000 XP + 3 sweeps</span></li>
</ul>
<hr class="divider">
<p style="text-align: center;">
  <a href="{{{{platform_link}}}}" class="cta-btn">EARN XP NOW</a>
</p>
<p style="text-align: center; font-size: 13px; color: {GRAY};">
  Mike V is live in the forums — drop your take and get a response.
</p>
"""
    email3 = _build_email(
        subject=f"Earn XP: {pos} Trivia, Polls & a 1,000 XP Challenge Are Live",
        header_subtitle=f"ENGAGE | {year} {pos} DROP",
        body_content=body3,
    )
    p3 = email_dir / f"03_engagement_{pos.lower()}.html"
    p3.write_text(email3)
    generated.append(p3)

    # ═══════════════════════════════════════════════════════════════════════
    # EMAIL 4: Keyword Hunt (Drop +2)
    # ═══════════════════════════════════════════════════════════════════════
    body4 = f"""\
<h2>Keyword Hunt: +20 XP Hidden in Mike V's Video</h2>
<p>Somewhere in Mike V's {pos} breakdown video, there's a keyword.</p>
<p>Find it. Enter it on the platform. Earn <span class="xp-badge">+20 XP</span> instantly.</p>
<p style="font-size: 13px; color: {GRAY}; font-style: italic;">
  Hint: Pay attention to when Mike V talks about the top target's scheme fit.
</p>
<hr class="divider">
<p style="text-align: center;">
  <a href="{{{{video_link}}}}" class="cta-btn">WATCH THE BREAKDOWN</a>
</p>
<p style="text-align: center; font-size: 13px; color: {GRAY};">
  Weekend debate thread is live: "Most realistic {pos} commit?" — Mike V is responding.
</p>
"""
    email4 = _build_email(
        subject=f"Hidden Keyword: +20 XP in Mike V's {pos} Video",
        header_subtitle=f"KEYWORD HUNT | {pos}",
        body_content=body4,
    )
    p4 = email_dir / f"04_keyword_hunt_{pos.lower()}.html"
    p4.write_text(email4)
    generated.append(p4)

    # ═══════════════════════════════════════════════════════════════════════
    # EMAIL 5: Weekend Recap (Saturday)
    # ═══════════════════════════════════════════════════════════════════════
    body5 = f"""\
<h2>{pos} Drop — The Week in Review</h2>
<p>Here's what happened since the {pos} intel dropped:</p>
<ul style="padding-left: 20px;">
  <li><strong>{{{{total_votes}}}}</strong> votes cast across polls and pick'ems</li>
  <li><strong>{{{{total_forum_posts}}}}</strong> forum posts in the {pos} threads</li>
  <li><strong>{{{{keyword_entries}}}}</strong> keyword entries submitted</li>
  <li><strong>{{{{quiz_completions}}}}</strong> personality quiz completions</li>
</ul>
{player_cards}
<hr class="divider">
<p style="text-align: center;">
  <a href="{{{{recap_link}}}}" class="cta-btn">READ THE FULL RECAP</a>
</p>
<p style="text-align: center; font-size: 13px; color: {GRAY};">
  Next drop coming soon. Stay locked in.
</p>
"""
    email5 = _build_email(
        subject=f"{pos} Drop Recap — The Numbers Are In",
        header_subtitle=f"WEEKLY RECAP | {pos}",
        body_content=body5,
    )
    p5 = email_dir / f"05_recap_{pos.lower()}.html"
    p5.write_text(email5)
    generated.append(p5)

    # ═══════════════════════════════════════════════════════════════════════
    # MANIFEST: Email schedule summary for Blueprint
    # ═══════════════════════════════════════════════════════════════════════
    manifest = {
        "position_group": pos,
        "year": year,
        "drop_date": drop_date,
        "email_count": len(generated),
        "schedule": [
            {"file": "01_drop_launch", "send_time": "Drop Day 10 AM", "subject": f"LIVE: {year} {pos} Intel Drop"},
            {"file": "02_top_target", "send_time": "Drop Day 3 PM", "subject": f"Spotlight: {top_target}"},
            {"file": "03_engagement", "send_time": "Drop +1, 10 AM", "subject": f"Earn XP: {pos} Games Are Live"},
            {"file": "04_keyword_hunt", "send_time": "Drop +2, 10 AM", "subject": f"Hidden Keyword: +20 XP"},
            {"file": "05_recap", "send_time": "Saturday 12 PM", "subject": f"{pos} Drop Recap"},
        ],
        "template_variables": [
            "{{platform_link}} — Main platform URL",
            "{{article_link}} — Direct link to intel drop article",
            "{{video_link}} — Mike V breakdown video URL",
            "{{recap_link}} — Recap article URL",
            "{{unsubscribe_link}} — Member unsubscribe URL",
            "{{total_votes}} — Aggregate poll/pick'em votes (recap only)",
            "{{total_forum_posts}} — Forum post count (recap only)",
            "{{keyword_entries}} — Keyword submission count (recap only)",
            "{{quiz_completions}} — Quiz completion count (recap only)",
        ],
        "notes": [
            "All emails are ready to send. Blueprint fills in template variables before sending.",
            "Subject lines are pre-written. Blueprint may customize if needed.",
            "XP values in emails match dropt platform game configuration.",
        ],
    }

    import json
    manifest_path = email_dir / f"email_schedule_{pos.lower()}.json"
    manifest_path.write_text(json.dumps(manifest, indent=2))
    generated.append(manifest_path)

    return generated
