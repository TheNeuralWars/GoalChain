#!/usr/bin/env python3
"""
x_budget_poster.py — GoalChain X (Twitter) API Budget Guard
============================================================
HARD LIMITS (never exceed without explicit override):
  - MAX 1 post per day on @GoalChainSOL
  - Budget warning at 80% of monthly credit cap
  - Full stop when daily/monthly limit hit
  - Every API call is logged to state file

Why this exists:
# INTEGRATION (issue #844 Postiz voice task): guard is invariant root. See docs/social/POSTIZ_INTEGRATION.md + docs/proposals/hermes/issue-844-proposal.md for thin opt-in (CLI/SDK future). No change to logic/limits. Current path unchanged.
  The old scheduler had no limits and burned all credits posting
  near-identical content multiple times per day. This replaces it.

Usage:
  # Post today's tweet (checks limit first):
  python3 x_budget_poster.py --post "Your tweet text here"

  # Check current budget/usage:
  python3 x_budget_poster.py --status

  # Force post even if limit hit (emergency only — requires --force):
  python3 x_budget_poster.py --post "text" --force
"""

import os
import sys
import json
import time
import hmac
import hashlib
import base64
import urllib.parse
import requests
import argparse
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ─── HARD LIMITS ─────────────────────────────────────────────────────────────
MAX_POSTS_PER_DAY    = 1      # Absolute max API writes per day
MAX_POSTS_PER_MONTH  = 20     # Safety ceiling per calendar month
WARN_AT_MONTHLY_PCT  = 0.8    # Warn at 80% of monthly cap

# ─── STATE FILE ──────────────────────────────────────────────────────────────
STATE_DIR  = Path(os.path.expanduser("~/.hermes/state"))
STATE_FILE = STATE_DIR / "x_budget.json"

# ─── CREDENTIALS ─────────────────────────────────────────────────────────────
CRED_FILE = Path(os.path.expanduser("~/.hermes/credentials/x-scout.env"))

def load_creds():
    creds = {}
    if CRED_FILE.exists():
        for line in CRED_FILE.read_text().splitlines():
            line = line.strip().replace("export ", "")
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                creds[k.strip()] = v.strip().strip('"').strip("'")
    # Env vars override file
    for k in ["X_API_KEY","X_API_KEY_SECRET","X_ACCESS_TOKEN","X_ACCESS_TOKEN_SECRET"]:
        if os.environ.get(k):
            creds[k] = os.environ[k]
    return creds

# ─── STATE ───────────────────────────────────────────────────────────────────
def load_state():
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception:
            pass
    return {"posts": []}

def save_state(state):
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2))

def get_today():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")

def get_month():
    return datetime.now(timezone.utc).strftime("%Y-%m")

def posts_today(state):
    today = get_today()
    return [p for p in state["posts"] if p["date"] == today]

def posts_this_month(state):
    month = get_month()
    return [p for p in state["posts"] if p["date"].startswith(month)]

def check_budget(state, force=False):
    today_count   = len(posts_today(state))
    monthly_count = len(posts_this_month(state))

    if not force:
        if today_count >= MAX_POSTS_PER_DAY:
            print(f"🛑 BUDGET STOP: Already posted {today_count}/{MAX_POSTS_PER_DAY} times today.")
            print(f"   Last post: {posts_today(state)[-1]['text'][:80]}…")
            print(f"   Next window: tomorrow UTC midnight.")
            print(f"   Use --force to override (emergency only).")
            return False

        if monthly_count >= MAX_POSTS_PER_MONTH:
            print(f"🛑 MONTHLY CAP: {monthly_count}/{MAX_POSTS_PER_MONTH} posts this month. Stopping.")
            return False

    warn_threshold = int(MAX_POSTS_PER_MONTH * WARN_AT_MONTHLY_PCT)
    if monthly_count >= warn_threshold:
        print(f"⚠️  WARNING: {monthly_count}/{MAX_POSTS_PER_MONTH} monthly posts used ({int(monthly_count/MAX_POSTS_PER_MONTH*100)}%)")

    return True

# ─── OAUTH 1.0a ──────────────────────────────────────────────────────────────
def oauth1_header(method, url, params, creds):
    oauth = {
        "oauth_consumer_key":     creds["X_API_KEY"],
        "oauth_nonce":            hashlib.md5(str(time.time()).encode()).hexdigest(),
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp":        str(int(time.time())),
        "oauth_token":            creds["X_ACCESS_TOKEN"],
        "oauth_version":          "1.0",
    }
    all_p  = {**oauth, **params}
    sorted_p = sorted(all_p.items())
    param_str   = "&".join(f"{k}={urllib.parse.quote(str(v), safe='')}" for k, v in sorted_p)
    base_str    = f"{method.upper()}&{urllib.parse.quote(url, safe='')}&{urllib.parse.quote(param_str, safe='')}"
    signing_key = f"{urllib.parse.quote(creds['X_API_KEY_SECRET'], safe='')}&{urllib.parse.quote(creds['X_ACCESS_TOKEN_SECRET'], safe='')}"
    sig = base64.b64encode(hmac.new(signing_key.encode(), base_str.encode(), hashlib.sha1).digest()).decode()
    oauth["oauth_signature"] = sig
    return "OAuth " + ", ".join(f'{k}="{urllib.parse.quote(str(v), safe="")}"' for k, v in oauth.items())

# ─── POST ────────────────────────────────────────────────────────────────────
def post_tweet(text, creds):
    url = "https://api.twitter.com/2/tweets"
    auth = oauth1_header("POST", url, {}, creds)
    resp = requests.post(
        url,
        headers={"Authorization": auth, "Content-Type": "application/json"},
        json={"text": text},
        timeout=30
    )
    if resp.status_code in (200, 201):
        return resp.json()
    raise Exception(f"HTTP {resp.status_code}: {resp.text}")

# ─── STATUS ──────────────────────────────────────────────────────────────────
def print_status(state):
    today_posts   = posts_today(state)
    monthly_posts = posts_this_month(state)
    print(f"\n📊 X Budget Status — {get_today()}")
    print(f"   Today:   {len(today_posts)}/{MAX_POSTS_PER_DAY} posts")
    print(f"   Month:   {len(monthly_posts)}/{MAX_POSTS_PER_MONTH} posts")
    print(f"   Limit:   {'🔴 DAILY CAP REACHED' if len(today_posts) >= MAX_POSTS_PER_DAY else '🟢 OK to post'}")
    if today_posts:
        print(f"\n   Today's post(s):")
        for p in today_posts:
            print(f"   [{p['time']}] {p['text'][:100]}…")
            if p.get("tweet_id"):
                print(f"            → https://x.com/GoalChainSOL/status/{p['tweet_id']}")
    if monthly_posts:
        print(f"\n   This month ({get_month()}):")
        for p in monthly_posts[-5:]:
            print(f"   [{p['date']}] {p['text'][:80]}…")

# ─── MAIN ────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="GoalChain X Budget Poster")
    parser.add_argument("--post",   type=str, help="Tweet text to post")
    parser.add_argument("--status", action="store_true", help="Show budget status")
    parser.add_argument("--force",  action="store_true", help="Override daily limit (emergency only)")
    args = parser.parse_args()

    state = load_state()

    if args.status or not args.post:
        print_status(state)
        return

    if not args.post.strip():
        print("❌ Tweet text is empty.")
        sys.exit(1)

    if len(args.post) > 280:
        print(f"❌ Tweet too long ({len(args.post)} chars, max 280).")
        sys.exit(1)

    # Budget check
    if not check_budget(state, force=args.force):
        sys.exit(0)  # Not an error — just a budget stop

    # Load credentials
    creds = load_creds()
    required = ["X_API_KEY","X_API_KEY_SECRET","X_ACCESS_TOKEN","X_ACCESS_TOKEN_SECRET"]
    missing = [k for k in required if not creds.get(k)]
    if missing:
        print(f"❌ Missing credentials: {missing}")
        print(f"   Add them to {CRED_FILE}")
        sys.exit(1)

    print(f"📤 Posting to @GoalChainSOL...")
    print(f"   Text: {args.post[:100]}{'…' if len(args.post) > 100 else ''}")

    try:
        result = post_tweet(args.post, creds)
        tweet_id = result.get("data", {}).get("id", "")
        print(f"✅ Posted! Tweet ID: {tweet_id}")
        print(f"   → https://x.com/GoalChainSOL/status/{tweet_id}")

        # Record in state
        entry = {
            "date":     get_today(),
            "time":     datetime.now(timezone.utc).strftime("%H:%M UTC"),
            "text":     args.post,
            "tweet_id": tweet_id,
            "forced":   args.force,
        }
        state["posts"].append(entry)
        # Keep last 90 days only
        cutoff = (datetime.now(timezone.utc) - timedelta(days=90)).strftime("%Y-%m-%d")
        state["posts"] = [p for p in state["posts"] if p["date"] >= cutoff]
        save_state(state)

    except Exception as e:
        if "402" in str(e) or "Payment" in str(e):
            print(f"❌ X API credits depleted (402). Recharge at developer.x.com → Billing.")
        elif "401" in str(e):
            print(f"❌ Authentication error. Check credentials in {CRED_FILE}")
        else:
            print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
