#!/usr/bin/env python3
"""
hermes_reporter.py — GoalChain Private Ops & Changelog Reporter
================================================================
Posts task completion, activity, and changelog updates to private Discord channels.
Channels:
  - #hermes-reports: 1511220889453334618
  - #hermes-changelog: 1511350294611624086
"""
import os, sys, json, time, argparse, requests, subprocess
from datetime import datetime, timezone

# ─── CONFIG ──────────────────────────────────────────────────────────────────
BOT_TOKEN      = "MTUwOTMyMTI0NTczNTM5MTI0Mg.GskD8X.vy0Vozh1KqquBS37xgZ1bviuGBddYdkGzyt1gY"
REPORTS_ID     = "1511220889453334618"   # #hermes-reports
CHANGELOG_ID   = "1511350294611624086"   # #hermes-changelog
HEADERS        = {"Authorization": f"Bot {BOT_TOKEN}", "Content-Type": "application/json"}

# Model Mapping for pretty logging
MODEL_MAPPING = {
    "haiku": "meta/llama-3.1-8b-instruct",
    "sonnet": "meta/llama-3.3-70b-instruct",
    "opus": "nvidia/nemotron-4-340b-instruct",
}

def send(channel_id: str, content: str):
    """Send a message to a specific Discord channel."""
    if len(content) > 2000:
        content = content[:1990] + "\n…"
    url = f"https://discord.com/api/v10/channels/{channel_id}/messages"
    r = requests.post(url, headers=HEADERS, json={"content": content}, timeout=10)
    if r.status_code not in (200, 201):
        print(f"[reporter] Discord error {r.status_code} on channel {channel_id}: {r.text}", file=sys.stderr)
        return False
    print(f"[reporter] ✅ Posted to channel {channel_id}")
    return True

def now_utc():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

def get_recent_git_changes():
    """Extract list of changed files and short diff from the latest commit."""
    try:
        repo_path = os.getenv("GOALCHAIN_REPO_PATH", "/home/goalchain/hermes/workspace/GoalChain")
        # List of changed files
        files_cmd = ["git", "-C", repo_path, "diff-tree", "--no-commit-id", "--name-status", "-r", "HEAD"]
        files_out = subprocess.check_output(files_cmd, text=True, stderr=subprocess.DEVNULL).strip()
        
        # Commit hash and full message
        log_cmd = ["git", "-C", repo_path, "log", "-1", "--pretty=format:%B"]
        full_message = subprocess.check_output(log_cmd, text=True, stderr=subprocess.DEVNULL).strip()
        
        # Split subject and body/description
        lines = full_message.split("\n")
        subject = lines[0]
        description = "\n".join(lines[1:]).strip() if len(lines) > 1 else ""
        
        # Fallback if description is empty, get commit author and hash info
        author_cmd = ["git", "-C", repo_path, "log", "-1", "--pretty=format:%h (%an)"]
        commit_info = subprocess.check_output(author_cmd, text=True, stderr=subprocess.DEVNULL).strip()
        
        if not description:
            description = f"Autonomic commit: {subject}"
            
        return commit_info, subject, description, files_out
    except Exception as e:
        return None, None, f"Could not retrieve git changes: {e}", ""

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--intake",        type=str, help="Brief filename just created")
    p.add_argument("--transcription", type=str, help="Original voice/text transcription")
    p.add_argument("--active",        action="store_true", help="Task is actively being processed")
    p.add_argument("--done",          action="store_true", help="Task completed successfully")
    p.add_argument("--failed",        action="store_true", help="Task failed")
    p.add_argument("--issue",         type=str, help="GitHub issue number")
    p.add_argument("--title",         type=str, help="Issue/task title")
    p.add_argument("--pr",            type=str, help="PR URL if created")
    p.add_argument("--tier",          type=str, help="Agent tier used (fast/standard/sonnet/etc)")
    p.add_argument("--agent",         type=str, default="hermes", help="Agent executing the task")
    p.add_argument("--reason",        type=str, help="Failure reason")
    p.add_argument("--custom",        type=str, help="Send any custom message")
    args = p.parse_args()

    # Get model name mapping
    tier_lower = (args.tier or "sonnet").lower()
    resolved_model = MODEL_MAPPING.get(tier_lower, args.tier or "meta/llama-3.3-70b-instruct")

    # ── Mode: intake received ────────────────────────────────────────────────
    if args.intake:
        transcription = args.transcription or "(text command)"
        msg = (
            f"📥 **New Task Ingested** · {now_utc()}\n"
            f"```\n{transcription[:300]}{'…' if len(transcription) > 300 else ''}\n```\n"
            f"📁 `{args.intake}`\n"
            f"⚡ Status: enqueued → agent picking up now"
        )
        send(REPORTS_ID, msg)

    # ── Mode: task active (picked up by agent) ───────────────────────────────
    elif args.active:
        msg = (
            f"⚡ **Task Active** · {now_utc()}\n"
            f"**#{args.issue or '?'}** — {args.title or 'Untitled'}\n"
            f"👤 Agent: `agent:{args.agent or 'hermes'}`\n"
            f"🏷️ Model: `{resolved_model}`\n"
            f"⚙️ Status: **in_progress** 🚀 (agent executing code implementation now)"
        )
        send(REPORTS_ID, msg)

    # ── Mode: task done ──────────────────────────────────────────────────────
    elif args.done:
        pr_line = f"\n🔗 PR: {args.pr}" if args.pr else "\n📭 No code changes (analysis/research task)"
        tier_line = f" · agent: `{args.agent or 'hermes'}` (`{resolved_model}`)"
        issue_link = f"https://github.com/TheNeuralWars/GoalChain/issues/{args.issue}" if args.issue else ""
        msg = (
            f"✅ **Task Done** · {now_utc()}{tier_line}\n"
            f"**#{args.issue or '?'}** — {args.title or 'Untitled'}\n"
            f"{pr_line}"
            + (f"\n📋 Issue: {issue_link}" if issue_link else "")
        )
        send(REPORTS_ID, msg)
        
        # Publish Changelog automatically to #hermes-changelog
        commit_info, subject, description, files_out = get_recent_git_changes()
        if commit_info:
            changelog_msg = (
                f"🛠️ **Changelog Update** · {now_utc()}\n"
                f"**Task:** #{args.issue or '?'} — {args.title or 'Untitled'}\n"
                f"👤 **Model / Tier:** `{resolved_model}`\n"
                f"📦 **Commit:** `{commit_info} - {subject}`\n"
                f"📝 **Description:** {description[:400]}\n"
                f"📂 **Files Modified:**\n```diff\n{files_out[:1000]}\n```"
            )
            send(CHANGELOG_ID, changelog_msg)

    # ── Mode: task failed ────────────────────────────────────────────────────
    elif args.failed:
        msg = (
            f"❌ **Task Failed** · {now_utc()}\n"
            f"**#{args.issue or '?'}** — {args.title or 'Untitled'}\n"
            f"💬 Reason: {args.reason or 'Unknown'}\n"
            f"↩️ Re-queued as `status:ready` for retry"
        )
        send(REPORTS_ID, msg)

    # ── Mode: custom message ─────────────────────────────────────────────────
    elif args.custom:
        send(REPORTS_ID, f"🤖 **Hermes** · {now_utc()}\n{args.custom}")

    else:
        p.print_help()
        sys.exit(1)

if __name__ == "__main__":
    main()
