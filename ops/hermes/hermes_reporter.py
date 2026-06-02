#!/usr/bin/env python3
"""
hermes_reporter.py — GoalChain Private Ops Reporter
====================================================
Posts concise task completion reports to #hermes-reports (private Discord channel).
Called by: oa-worker.sh (on issue complete/fail) + telegram_voice_listener.py (on intake)

Usage:
  python3 hermes_reporter.py --intake "brief_filename.md" --transcription "text..."
  python3 hermes_reporter.py --done --issue 42 --title "Task title" --pr "https://..." --tier "fast"
  python3 hermes_reporter.py --failed --issue 42 --title "Task title" --reason "why"
  python3 hermes_reporter.py --custom "Any message"
"""
import os, sys, json, time, argparse, requests
from datetime import datetime, timezone

# ─── CONFIG ──────────────────────────────────────────────────────────────────
BOT_TOKEN  = "MTUwOTMyMTI0NTczNTM5MTI0Mg.GskD8X.vy0Vozh1KqquBS37xgZ1bviuGBddYdkGzyt1gY"
CHANNEL_ID = "1511220889453334618"  # #hermes-reports (private)
API_URL    = f"https://discord.com/api/v10/channels/{CHANNEL_ID}/messages"
HEADERS    = {"Authorization": f"Bot {BOT_TOKEN}", "Content-Type": "application/json"}

def send(content: str):
    """Send a message to #hermes-reports. Truncate if > 2000 chars."""
    if len(content) > 2000:
        content = content[:1990] + "\n…"
    r = requests.post(API_URL, headers=HEADERS, json={"content": content}, timeout=10)
    if r.status_code not in (200, 201):
        print(f"[reporter] Discord error {r.status_code}: {r.text}", file=sys.stderr)
        sys.exit(1)
    print(f"[reporter] ✅ Reported to #hermes-reports")

def now_utc():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--intake",        type=str, help="Brief filename just created")
    p.add_argument("--transcription", type=str, help="Original voice/text transcription")
    p.add_argument("--done",          action="store_true", help="Task completed successfully")
    p.add_argument("--failed",        action="store_true", help="Task failed")
    p.add_argument("--issue",         type=str, help="GitHub issue number")
    p.add_argument("--title",         type=str, help="Issue/task title")
    p.add_argument("--pr",            type=str, help="PR URL if created")
    p.add_argument("--tier",          type=str, help="Agent tier used (fast/standard)")
    p.add_argument("--reason",        type=str, help="Failure reason")
    p.add_argument("--custom",        type=str, help="Send any custom message")
    args = p.parse_args()

    # ── Mode: intake received ────────────────────────────────────────────────
    if args.intake:
        transcription = args.transcription or "(text command)"
        msg = (
            f"📥 **New Task Ingested** · {now_utc()}\n"
            f"```\n{transcription[:300]}{'…' if len(transcription) > 300 else ''}\n```\n"
            f"📁 `{args.intake}`\n"
            f"⚡ Status: enqueued → agent picking up now"
        )
        send(msg)

    # ── Mode: task done ──────────────────────────────────────────────────────
    elif args.done:
        pr_line = f"\n🔗 PR: {args.pr}" if args.pr else "\n📭 No code changes (analysis/research task)"
        tier_line = f" · agent: `{args.tier}`" if args.tier else ""
        issue_link = f"https://github.com/TheNeuralWars/GoalChain/issues/{args.issue}" if args.issue else ""
        msg = (
            f"✅ **Task Done** · {now_utc()}{tier_line}\n"
            f"**#{args.issue or '?'}** — {args.title or 'Untitled'}\n"
            f"{pr_line}"
            + (f"\n📋 Issue: {issue_link}" if issue_link else "")
        )
        send(msg)

    # ── Mode: task failed ────────────────────────────────────────────────────
    elif args.failed:
        msg = (
            f"❌ **Task Failed** · {now_utc()}\n"
            f"**#{args.issue or '?'}** — {args.title or 'Untitled'}\n"
            f"💬 Reason: {args.reason or 'Unknown'}\n"
            f"↩️ Re-queued as `status:ready` for retry"
        )
        send(msg)

    # ── Mode: custom message ─────────────────────────────────────────────────
    elif args.custom:
        send(f"🤖 **Hermes** · {now_utc()}\n{args.custom}")

    else:
        p.print_help()
        sys.exit(1)

if __name__ == "__main__":
    main()
