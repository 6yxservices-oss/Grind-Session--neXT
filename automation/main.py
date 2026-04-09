"""
Client Automation Orchestrator
-------------------------------
Reads client intel from a JSON file and dispatches specialized Claude subagents
to automate: content production, social media, project management, reporting,
email sequences, and workflow documentation.

Usage:
    python main.py client_intel.json

    # Or pipe intel directly:
    python main.py --stdin < client_intel.json
"""

import json
import sys
import argparse
from pathlib import Path

import anyio
from claude_agent_sdk import (
    query,
    ClaudeAgentOptions,
    AgentDefinition,
    ResultMessage,
    SystemMessage,
)


# ---------------------------------------------------------------------------
# Subagent definitions
# ---------------------------------------------------------------------------

SUBAGENTS: dict[str, AgentDefinition] = {
    "content-producer": AgentDefinition(
        description=(
            "Creates blog posts, website copy, marketing materials, and other "
            "written content based on client brand, voice, and audience."
        ),
        prompt="""\
You are an expert content producer and copywriter. You will receive client intel
as context in the working directory (client_intel.json). Read it first.

Produce the following and save each to the outputs/ directory:
1. content/blog_posts.md      — 3 full blog post drafts (700-1000 words each)
2. content/website_copy.md    — Hero, About, Features, CTA copy for each product/service
3. content/ad_copy.md         — 5 short-form ad variations per product
4. content/case_study_template.md — A reusable case study template pre-filled with client details

Match the client's brand voice exactly. Address their audience pain points directly.
Use specific, concrete language — avoid filler phrases.\
""",
        tools=["Read", "Write"],
    ),

    "social-media-manager": AgentDefinition(
        description=(
            "Creates social media content calendars, platform-specific post copy, "
            "hashtag strategy, and engagement templates."
        ),
        prompt="""\
You are an expert social media strategist. Read client_intel.json from the working directory.

Produce and save:
1. social/30_day_calendar.md      — Full 30-day posting calendar with dates, platforms, topics
2. social/post_copy_library.md    — 60+ ready-to-publish posts (platform-specific tone and length)
3. social/hashtag_strategy.md     — Primary, secondary, and niche hashtag sets per platform
4. social/engagement_templates.md — Response templates for comments, DMs, reviews (positive and negative)

Format the calendar as a table: Date | Platform | Content Type | Caption | Hashtags | Media Note.
LinkedIn posts should be professional/thought-leadership. Twitter/X should be punchy (<280 chars).
Instagram should be visual-first with strong hooks.\
""",
        tools=["Read", "Write"],
    ),

    "project-manager": AgentDefinition(
        description=(
            "Creates project roadmaps, task breakdowns, team RACI matrices, "
            "timelines, and risk assessments."
        ),
        prompt="""\
You are a senior project manager (PMP-certified mindset). Read client_intel.json.

Produce and save:
1. project/roadmap.md          — 90-day roadmap with weekly milestones per active project
2. project/task_breakdown.md   — Granular task list: task, owner role, due date, priority, dependencies
3. project/raci_matrix.md      — Responsibility matrix for all key workflows and team members
4. project/risk_register.md    — Top 10 risks with likelihood, impact, mitigation, and owner
5. project/weekly_standup.md   — Standup template pre-configured for the client's team

Use the client's actual project names, deadlines, and team roles from the intel.\
""",
        tools=["Read", "Write"],
    ),

    "reporter": AgentDefinition(
        description=(
            "Creates KPI dashboards, weekly status reports, executive summaries, "
            "and metrics tracking templates."
        ),
        prompt="""\
You are an expert business analyst and reporting specialist. Read client_intel.json.

Produce and save:
1. reports/weekly_status_template.md     — Pre-filled weekly status report with the client's actual KPIs
2. reports/monthly_kpi_dashboard.md      — Monthly dashboard template with sections per metric
3. reports/executive_summary_template.md — One-page exec summary format tied to client's goals
4. reports/metrics_tracker.csv           — CSV template with all client KPIs as columns, ready for data entry
5. reports/client_facing_report.md       — External-facing progress report template (clean, branded language)

All templates should be pre-populated with the client's specific KPIs and metric definitions.
The CSV should have headers that match exactly what the client tracks.\
""",
        tools=["Read", "Write"],
    ),

    "email-automator": AgentDefinition(
        description=(
            "Creates email sequences, drip campaigns, transactional templates, "
            "and newsletter formats tailored to the client's list and product."
        ),
        prompt="""\
You are an expert email marketing strategist. Read client_intel.json.

Produce and save:
1. emails/welcome_sequence.md       — 5-email welcome sequence (subject + full body each)
2. emails/nurture_sequence.md       — 7-email lead nurture drip (subject + full body each)
3. emails/re_engagement_campaign.md — 3-email win-back campaign
4. emails/transactional_templates.md — Confirmation, onboarding, invoice, and support templates
5. emails/newsletter_template.md    — Monthly newsletter format pre-configured for the client

Each email must have: Subject line, Preview text, Body (with personalization tokens like {{first_name}}),
and a clear CTA. Match the client's brand voice. Focus on their product benefits and audience pain points.
Include send timing recommendations for each sequence.\
""",
        tools=["Read", "Write"],
    ),

    "workflow-designer": AgentDefinition(
        description=(
            "Documents core business processes, creates SOPs, onboarding checklists, "
            "and quality assurance workflows."
        ),
        prompt="""\
You are an expert operations consultant specializing in workflow design. Read client_intel.json.

Produce and save:
1. workflows/core_processes.md       — Step-by-step documentation of the client's key business processes
2. workflows/sop_library.md          — Standard Operating Procedures for recurring tasks
3. workflows/client_onboarding.md    — Complete client onboarding checklist with responsible roles
4. workflows/team_onboarding.md      — New team member onboarding workflow
5. workflows/qa_checklist.md         — Quality assurance checklist for deliverables

Use the client's actual team structure, tools, and workflows from the intel.
Format SOPs as numbered steps with who does what, when, and how to verify completion.\
""",
        tools=["Read", "Write"],
    ),
}


# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------

ORCHESTRATOR_SYSTEM = """\
You are a senior business automation orchestrator. Your job is to coordinate
specialized AI agents to produce a complete, production-ready automation package
for a client. You delegate work to specialized subagents and ensure all outputs
are well-organized and comprehensive. You are methodical, thorough, and precise.\
"""


def build_orchestrator_prompt(intel: dict, output_dir: Path) -> str:
    client_name = intel.get("client_name", "Client")
    return f"""\
You have received client intel for **{client_name}**.

The client intel is saved at client_intel.json in the working directory.
All outputs must be saved inside the `outputs/{client_name}/` directory.

Your job:
1. Read the client intel.
2. Create the output directory structure: outputs/{client_name}/content/, social/, project/, reports/, emails/, workflows/
3. Activate each specialized agent in order, passing them context from the intel:
   - content-producer   → generates all written content
   - social-media-manager → generates social media assets
   - project-manager    → generates project plans and RACI
   - reporter           → generates reporting templates
   - email-automator    → generates email sequences
   - workflow-designer  → generates SOPs and process docs

4. After all agents complete, write outputs/{client_name}/SUMMARY.md that lists
   every file created with a one-line description.

Be systematic. Each agent should produce complete, professional deliverables —
not placeholders or examples. Use real details from the client intel throughout.\
"""


async def run(intel_path: Path) -> None:
    with intel_path.open() as f:
        intel = json.load(f)

    client_name = intel.get("client_name", "Client")
    output_dir = Path("outputs") / client_name
    output_dir.mkdir(parents=True, exist_ok=True)

    # Write intel to cwd so all agents can read it
    cwd = intel_path.parent
    intel_copy = cwd / "client_intel.json"
    if intel_copy.resolve() != intel_path.resolve():
        intel_copy.write_text(json.dumps(intel, indent=2))

    print(f"\n{'='*60}")
    print(f"  Client Automation — {client_name}")
    print(f"  Output: {output_dir.resolve()}")
    print(f"{'='*60}\n")

    async for message in query(
        prompt=build_orchestrator_prompt(intel, output_dir),
        options=ClaudeAgentOptions(
            cwd=str(cwd.resolve()),
            model="claude-opus-4-6",
            allowed_tools=["Read", "Write", "Glob", "Agent"],
            permission_mode="acceptEdits",
            system_prompt=ORCHESTRATOR_SYSTEM,
            agents=SUBAGENTS,
            max_turns=50,
        ),
    ):
        if isinstance(message, ResultMessage):
            print("\n✅ Automation complete.")
            if message.result:
                print(message.result)
        elif isinstance(message, SystemMessage) and message.subtype == "init":
            print(f"Session: {message.session_id}\n")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Client automation orchestrator powered by Claude agents."
    )
    parser.add_argument(
        "intel_file",
        nargs="?",
        default="client_intel.json",
        help="Path to client intel JSON file (default: client_intel.json)",
    )
    parser.add_argument(
        "--stdin",
        action="store_true",
        help="Read client intel JSON from stdin instead of a file",
    )
    args = parser.parse_args()

    if args.stdin:
        intel = json.load(sys.stdin)
        tmp = Path("client_intel.json")
        tmp.write_text(json.dumps(intel, indent=2))
        intel_path = tmp
    else:
        intel_path = Path(args.intel_file)
        if not intel_path.exists():
            print(f"Error: {intel_path} not found.")
            print("Create a client_intel.json file or run: python main.py --help")
            sys.exit(1)

    anyio.run(run, intel_path)


if __name__ == "__main__":
    main()
