# MVP FAN PLATFORM — 14-DAY LAUNCH CHECKLIST
*Internal · owners assumed · adjust dates to actual fight T-minus*

**Goal:** Ship one activation, sell one sponsor pilot, instrument retargeting, deliver one sponsor-ready report — in two weeks, with no new tech.

---

## 🎯 Success criteria (define before Day 1)

- [ ] ≥ 50,000 captured fans (email or phone, opted in)
- [ ] ≥ 1 sponsor pilot sold (even at discount)
- [ ] CPF (cost per captured fan) < $3.00
- [ ] Retargeting pixel firing on ≥ 95% of fan-platform sessions
- [ ] Sponsor-ready PDF report exported from Dropt by Day 14

---

## DAYS 1–3 — Foundations

### Product / Eng
- [ ] Confirm activation choice: **Pick the Round** (default) or alt
- [ ] Email + SMS opt-in copy approved by legal
- [ ] Privacy policy + terms updated for data capture
- [ ] Test full flow on staging (mobile + desktop)
- [ ] Wire UTM parameters into all entry URLs

### Marketing
- [ ] Lock landing-page hero copy + CTA
- [ ] Brief 3 fighters / coaches on social push (15-sec selfie video each)
- [ ] Draft 5 social variants per platform (TikTok, IG, X, YouTube Shorts)
- [ ] Email blast to existing house list (T-minus announcement)

### Data
- [ ] Install **Meta pixel + TikTok pixel + Google tag** on all platform pages
- [ ] Confirm Dropt is receiving event data (page view, action, opt-in, share)
- [ ] Define event taxonomy: `pick_round_started`, `pick_round_completed`, `email_captured`, `share_clicked`
- [ ] Stand up daily Slack digest: captured fans, CPF, revenue/fan

### Partnerships (Ryan)
- [ ] Pull sponsor short-list (3 brands, existing relationship)
- [ ] Draft 1-pager (use `01-sponsor-sales-sheet.md`)
- [ ] Book 3 sponsor pitch calls for Days 4–6

---

## DAYS 4–7 — Sell + Ship

### Partnerships
- [ ] Pitch all 3 sponsors using sales sheet
- [ ] Close 1 pilot (target: ~$150K, accept ~$75K to land case study)
- [ ] Send signed deal terms to legal + finance

### Product / Eng
- [ ] Apply sponsor branding to activation (logo, color, "Presented by")
- [ ] Build sponsor-branded results email (winners + offer)
- [ ] QA sponsor flow end-to-end on real devices
- [ ] Soft launch to 10% of traffic (smoke test)

### Marketing
- [ ] Fighter videos posted on their owned channels (T-minus 7)
- [ ] Paid promotion live: $5K test budget, even split Meta + TikTok
- [ ] Influencer outreach: 5 boxing creators, comp + commission
- [ ] PR note to combat-sports press (Boxing Scene, The Ring, MMA Fighting)

---

## DAYS 8–11 — Drive volume

### Marketing
- [ ] Scale paid spend on winning creative (kill underperformers daily)
- [ ] Launch retargeting audience: site visitors who didn't opt in
- [ ] Lookalike audience built off captured fans (1% LAL)
- [ ] Send 3 lifecycle emails: reminder, leaderboard update, last-chance

### Product / Eng
- [ ] Push notification flow live (T-minus 48h, T-minus 2h, live)
- [ ] Live scorecard module ready as fight-night fallback / next activation
- [ ] Monitor error rates; on-call rotation defined for fight night

### Data
- [ ] Mid-flight check-in: are we on pace for 50K captured?
  - If **no:** brief copy/creative test, increase paid spend
  - If **yes:** lock plan, prepare scaling playbook for next fight
- [ ] Build sponsor-facing dashboard view in Dropt (reach, actions, demos)

---

## DAYS 12–14 — Fight night + report

### Fight night ops
- [ ] War-room Slack channel; 3-person rotation
- [ ] Live scorecard module pushed to engaged fans 30 min before main event
- [ ] Real-time push: "Round X live, score it now"
- [ ] Capture screen recordings for post-event highlight reel

### Post-fight (within 48h)
- [ ] Sponsor audience file delivered (CSV via secure share)
- [ ] Sponsor-ready PDF exported from Dropt:
  - Reach
  - Engaged actions
  - Completion rate
  - Demo split (age, gender, geo)
  - Time spent
  - Comparison vs. baseline
- [ ] Internal recap doc: what worked, what didn't, what to repeat
- [ ] Lookalike audience exported back to MVP ad accounts for next fight
- [ ] Thank-you + offer email to all captured fans

### Sales follow-through
- [ ] Use pilot results to re-pitch the other 2 brands at full rate
- [ ] Schedule case-study writeup (co-branded with sponsor)
- [ ] Calendar: lock 3 activations for next fight using same playbook

---

## ⚠️ Risk register

| Risk | Mitigation |
|---|---|
| Activation under-performs (<25K captures) | Switch creative on Day 5; add prize incentive (signed gloves, ticket pair) |
| Sponsor closes too late to brand activation | Run unbranded; sell post-hoc with audience numbers as proof |
| Pixels misfire / data gaps | Daily pixel-health check on Days 1, 3, 7; fix within 24h |
| Push-notification opt-in too low | A/B prompt copy; offer instant value (live odds) for opt-in |
| Fight cancellation / change | Activation is fight-agnostic; pivot to "Pick the Card" for full event |

---

## 🧰 Tools needed (all assumed already in stack)

- MVP Fan Platform (preview.mvp-promotions-app.pages.dev)
- Dropt Analytics (dropt-analytics.lovable.app)
- Email/SMS: Klaviyo or Attentive
- Paid: Meta Ads Manager, TikTok Ads Manager, Google Ads
- CRM hand-off: secure CSV share or direct API to sponsor

---

## 👥 Owners (fill in real names)

| Workstream | Owner | Backup |
|---|---|---|
| Activation product | | |
| Marketing + creative | | |
| Paid media | | |
| Data + Dropt | | |
| Sponsor sales | Ryan Rechten | |
| Legal + privacy | | |
| Fight-night ops lead | | |

---

## 📅 Standing meetings during pilot

- **Daily 9am stand-up** (15 min) — captured fans, CPF, blockers
- **Day 7 mid-flight review** (45 min) — go/no-go decisions
- **T-24h fight readiness** (30 min) — final ops check
- **T+48h retro** (60 min) — what to bake in for next fight

---

## ⏭️ After Day 14

If we hit success criteria, the second fight gets:
- 3 activations instead of 1
- 2 sponsors instead of 1
- A pre-built lookalike audience seeded from fight #1
- A repeatable sponsor sales motion with real numbers, not pitch decks

That's the flywheel. Each fight makes the next one cheaper to fill and more valuable to sponsors.
