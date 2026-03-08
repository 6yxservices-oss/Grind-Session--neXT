"""
Trigger Listener — Slack / Email / Webhook
--------------------------------------------
Watches for incoming drop commands and auto-fires the full production system.

Three trigger modes:
  1. Slack bot — listens for messages in a channel (e.g., #hvu-drops)
  2. Email — polls an inbox for drop instructions
  3. Webhook — HTTP endpoint that receives POST requests

Each trigger parses the message into a drop config, then calls hvu_drop.run_drop().

Setup:
  # Slack mode
  python trigger_listener.py --mode slack --channel hvu-drops

  # Email mode
  python trigger_listener.py --mode email --inbox drops@hvuinsider.com

  # Webhook mode (runs HTTP server on port 8080)
  python trigger_listener.py --mode webhook --port 8080
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import os
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler


def parse_drop_message(text: str) -> dict | None:
    """
    Parse a natural language or structured drop command into a drop config.

    Supported formats:

    Structured:
      LB drop 2027: Kyngstonn Viliamu-Asa (Conestoga HS, Berwyn PA),
                     Jaiden Mudge (Scranton Prep, Scranton PA)

    Natural:
      "New LB drop. Players: Kyngstonn Viliamu-Asa from Berwyn PA,
       Jaiden Mudge from Scranton PA. Class of 2027."

    JSON:
      {"position_group": "LB", "year": 2027, "players": [...]}
    """
    text = text.strip()

    # Try JSON first
    if text.startswith("{"):
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

    # Try structured format: "POSITION drop YEAR: Player1, Player2"
    pattern = r"(?i)(RB|LB|DB|EDGE|WR|QB|DL|ATH)\s+drop\s*(\d{4})?\s*[:\-]?\s*(.*)"
    match = re.match(pattern, text, re.DOTALL)
    if not match:
        return None

    position = match.group(1).upper()
    year = int(match.group(2)) if match.group(2) else 2027
    player_text = match.group(3).strip()

    # Parse player entries
    players = []
    # Split on commas that are followed by a capital letter (new player)
    # or on newlines
    entries = re.split(r"\n|(?:,\s*(?=[A-Z]))", player_text)

    for entry in entries:
        entry = entry.strip().rstrip(",")
        if not entry:
            continue

        # Try: "Name (School, City State)" or "Name, City, State"
        paren_match = re.match(
            r"([^(]+?)(?:\s*\(([^,]+),\s*([^)]+)\))?$", entry
        )
        if paren_match:
            name = paren_match.group(1).strip()
            school = (paren_match.group(2) or "").strip()
            location = (paren_match.group(3) or "").strip()

            player = {"name": name}
            if school:
                player["school"] = school

            # Parse "City State" or "City, State"
            if location:
                loc_parts = re.split(r",\s*|\s+(?=[A-Z]{2}$)", location)
                if len(loc_parts) >= 2:
                    player["city"] = loc_parts[0].strip()
                    player["state"] = loc_parts[-1].strip()
                else:
                    player["city"] = location

            players.append(player)

    if not players:
        return None

    return {
        "position_group": position,
        "year": year,
        "players": players,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Slack Trigger
# ─────────────────────────────────────────────────────────────────────────────

def run_slack_listener(channel: str):
    """
    Listen to a Slack channel for drop commands.

    Requires:
      pip install slack-sdk
      export SLACK_BOT_TOKEN=xoxb-...
      export SLACK_APP_TOKEN=xapp-...

    The bot must be invited to the target channel.
    """
    try:
        from slack_sdk.web import WebClient
        from slack_sdk.socket_mode import SocketModeClient
        from slack_sdk.socket_mode.request import SocketModeRequest
        from slack_sdk.socket_mode.response import SocketModeResponse
    except ImportError:
        print("Install slack-sdk: pip install slack-sdk")
        sys.exit(1)

    bot_token = os.environ.get("SLACK_BOT_TOKEN")
    app_token = os.environ.get("SLACK_APP_TOKEN")
    if not bot_token or not app_token:
        print("Set SLACK_BOT_TOKEN and SLACK_APP_TOKEN environment variables")
        sys.exit(1)

    web_client = WebClient(token=bot_token)
    socket_client = SocketModeClient(app_token=app_token, web_client=web_client)

    def handle_event(client: SocketModeClient, req: SocketModeRequest):
        if req.type != "events_api":
            return
        client.send_socket_mode_response(SocketModeResponse(envelope_id=req.envelope_id))

        event = req.payload.get("event", {})
        if event.get("type") != "message" or event.get("subtype"):
            return

        text = event.get("text", "")
        drop_config = parse_drop_message(text)
        if not drop_config:
            return

        channel_id = event.get("channel")
        pos = drop_config["position_group"]
        n = len(drop_config["players"])

        # Acknowledge in Slack
        web_client.chat_postMessage(
            channel=channel_id,
            text=f"Drop received: {pos} | {n} targets. Agents are working...",
        )

        # Fire the drop
        import anyio
        from hvu_drop import run_drop

        anyio.run(
            run_drop,
            drop_config["position_group"],
            drop_config.get("year", 2027),
            drop_config["players"],
            drop_config.get("drop_date", ""),
            drop_config.get("context_narrative", ""),
        )

        # Notify completion
        web_client.chat_postMessage(
            channel=channel_id,
            text=(
                f"Drop complete: {pos}\n"
                f"- Scouting article (.docx)\n"
                f"- Deliverables by team (.docx)\n"
                f"- Content tracker (.xlsx) — appended\n"
                f"- Graphics brief + CSV for Nano Banana\n"
                f"- 5 member emails for Blueprint\n"
                f"Files in `hvu_insider/outputs/`"
            ),
        )

    socket_client.socket_mode_request_listeners.append(handle_event)
    print(f"Listening on Slack channel: #{channel}")
    print("Send a message like: 'LB drop 2027: Player Name (School, City ST)'")
    socket_client.connect()

    import time
    while True:
        time.sleep(1)


# ─────────────────────────────────────────────────────────────────────────────
# Email Trigger
# ─────────────────────────────────────────────────────────────────────────────

def run_email_listener(inbox: str, poll_interval: int = 60):
    """
    Poll an IMAP inbox for drop commands.

    Requires:
      export EMAIL_HOST=imap.gmail.com
      export EMAIL_USER=drops@hvuinsider.com
      export EMAIL_PASSWORD=app-password

    Looks for unread emails with subject containing "drop" + a position group.
    """
    import imaplib
    import email as email_lib
    import time

    host = os.environ.get("EMAIL_HOST", "imap.gmail.com")
    user = os.environ.get("EMAIL_USER", inbox)
    password = os.environ.get("EMAIL_PASSWORD", "")

    if not password:
        print("Set EMAIL_PASSWORD environment variable")
        sys.exit(1)

    print(f"Polling inbox: {user} every {poll_interval}s")
    print("Send an email with subject like 'LB Drop 2027' and player list in body")

    while True:
        try:
            mail = imaplib.IMAP4_SSL(host)
            mail.login(user, password)
            mail.select("inbox")

            # Search for unread emails with "drop" in subject
            _, msg_ids = mail.search(None, '(UNSEEN SUBJECT "drop")')
            for msg_id in msg_ids[0].split():
                if not msg_id:
                    continue

                _, msg_data = mail.fetch(msg_id, "(RFC822)")
                msg = email_lib.message_from_bytes(msg_data[0][1])

                # Get body text
                body = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        if part.get_content_type() == "text/plain":
                            body = part.get_payload(decode=True).decode()
                            break
                else:
                    body = msg.get_payload(decode=True).decode()

                # Combine subject + body for parsing
                subject = msg.get("Subject", "")
                full_text = f"{subject}: {body}"

                drop_config = parse_drop_message(full_text)
                if drop_config:
                    pos = drop_config["position_group"]
                    n = len(drop_config["players"])
                    print(f"\nDrop detected from email: {pos} | {n} targets")

                    import anyio
                    from hvu_drop import run_drop

                    anyio.run(
                        run_drop,
                        drop_config["position_group"],
                        drop_config.get("year", 2027),
                        drop_config["players"],
                        drop_config.get("drop_date", ""),
                        drop_config.get("context_narrative", ""),
                    )
                    print("Drop complete.")

                # Mark as read
                mail.store(msg_id, "+FLAGS", "\\Seen")

            mail.logout()
        except Exception as e:
            print(f"Email poll error: {e}")

        time.sleep(poll_interval)


# ─────────────────────────────────────────────────────────────────────────────
# Webhook Trigger
# ─────────────────────────────────────────────────────────────────────────────

def run_webhook_listener(port: int = 8080):
    """
    HTTP webhook that receives POST requests with drop data.

    POST /drop with JSON body or plain text body.
    Returns 200 with file paths on success.

    Example:
      curl -X POST http://localhost:8080/drop \\
        -H "Content-Type: application/json" \\
        -d '{"position_group": "LB", "year": 2027, "players": [...]}'

    Or plain text:
      curl -X POST http://localhost:8080/drop \\
        -d "LB drop 2027: Kyngstonn Viliamu-Asa (Conestoga HS, Berwyn PA)"
    """

    class DropHandler(BaseHTTPRequestHandler):
        def do_POST(self):
            if self.path != "/drop":
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'{"error": "Use POST /drop"}')
                return

            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode()

            content_type = self.headers.get("Content-Type", "")

            if "application/json" in content_type:
                try:
                    drop_config = json.loads(body)
                except json.JSONDecodeError:
                    self.send_response(400)
                    self.end_headers()
                    self.wfile.write(b'{"error": "Invalid JSON"}')
                    return
            else:
                drop_config = parse_drop_message(body)

            if not drop_config:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'{"error": "Could not parse drop command"}')
                return

            pos = drop_config["position_group"]
            n = len(drop_config["players"])
            print(f"\nWebhook drop: {pos} | {n} targets")

            # Send immediate acknowledgment
            self.send_response(202)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "accepted",
                "position": pos,
                "players": n,
                "message": "Drop processing started. Files will appear in outputs/.",
            }).encode())

            # Fire the drop (runs after response is sent)
            import anyio
            from hvu_drop import run_drop

            anyio.run(
                run_drop,
                drop_config["position_group"],
                drop_config.get("year", 2027),
                drop_config["players"],
                drop_config.get("drop_date", ""),
                drop_config.get("context_narrative", ""),
            )
            print("Webhook drop complete.")

        def log_message(self, format, *args):
            # Quieter logging
            pass

    server = HTTPServer(("0.0.0.0", port), DropHandler)
    print(f"Webhook listener running on http://0.0.0.0:{port}/drop")
    print("POST JSON or plain text to trigger a drop.")
    print('Example: curl -X POST http://localhost:8080/drop -d "LB drop 2027: Player Name (School, City ST)"')
    server.serve_forever()


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="HVU Insider — Trigger Listener")
    parser.add_argument(
        "--mode", choices=["slack", "email", "webhook"],
        required=True, help="Trigger mode",
    )
    parser.add_argument("--channel", default="hvu-drops", help="Slack channel (slack mode)")
    parser.add_argument("--inbox", default="", help="Email inbox address (email mode)")
    parser.add_argument("--port", type=int, default=8080, help="Webhook port (webhook mode)")
    parser.add_argument("--poll-interval", type=int, default=60, help="Email poll interval in seconds")

    args = parser.parse_args()

    if args.mode == "slack":
        run_slack_listener(args.channel)
    elif args.mode == "email":
        run_email_listener(args.inbox, args.poll_interval)
    elif args.mode == "webhook":
        run_webhook_listener(args.port)


if __name__ == "__main__":
    main()
