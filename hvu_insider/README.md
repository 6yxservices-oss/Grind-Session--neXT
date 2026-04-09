# HVU Insider — Full Production System

This skill produces the complete HVU Insider production package for any positional
intel drop. Every position group — RB, LB, DB, EDGE, WR, QB, DL, ATH — runs
through the same machine. The players change. The machine does not.

## THREE DELIVERABLES PER DROP

| # | Deliverable | Format | Description |
|---|-------------|--------|-------------|
| 1 | Scouting Article | `.docx` | Brady Jordan insider article — player profiles, scouting intel, evaluation boxes |
| 2 | Deliverables by Team | `.docx` | Operational task assignment — every deliverable, owner, deadline, organized by team |
| 3 | Content Intel Tracker | `.xlsx` | Master ops spreadsheet — 11 tabs. **APPEND** to existing tracker, never replace |

## Usage

```bash
cd hvu_insider/
pip install -r requirements.txt

# Basic: position group + player names
python hvu_drop.py --position LB --year 2027 \
  --players "Kyngstonn Viliamu-Asa, Edison, PA" \
            "Jaiden Mudge, Scranton, PA" \
            "Tae'Shaun Gelsey, Baltimore, MD"

# From a JSON intel file
python hvu_drop.py --intel drop_intel.json
```

## Intel File Format

```json
{
  "position_group": "LB",
  "year": 2027,
  "drop_date": "2026-03-15",
  "players": [
    {
      "name": "Kyngstonn Viliamu-Asa",
      "school": "Conestoga High School",
      "city": "Edison",
      "state": "PA",
      "measurables": {"height": "6-2", "weight": "225"}
    }
  ],
  "context_narrative": "After losing two LB commits in January..."
}
```

## Output Files

All outputs saved to `hvu_insider/outputs/`:

- `HVU_Insider_[POSITION]_Drop_[YEAR].docx`
- `HVU_[POSITION]_Deliverables_[YEAR].docx`
- `HVU_Intel_Content_Tracker.xlsx` (appended if exists)
