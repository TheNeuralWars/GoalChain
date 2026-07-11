#!/usr/bin/env python3
"""
Hermes X Repost Monitor v2: Track retweets from @goalworldsol and @goalworlddotfun.
Extracts useful signals and routes them to the agent pipeline.

v2 additions: get_tweet_detail(), signal extraction via oa_x_signals.py,
X URL enrichment, action routing.
"""
from __future__ import annotations

import base64
import hmac
import json
import os
import re
import sys
import time
import urllib.parse
from datetime import datetime, timezone
from hashlib import sha1
from pathlib import Path

import requests

# Signal extractor (ships with this update)
SCRIPT_DIR = Path(__file__).parent
_SIGNALS_MODULE = SCRIPT_DIR / "oa_x_signals.py"

# ---- Signal extraction helpers ----
def _load_signal_extractor():
    """Dynamically import oa_x_signals to avoid hard dep at import time."""
    if not _SIGNALS_MODULE.exists():
        return None, None
    import importlib.util
    spec = importlib.util.spec_from_file_location("oa_x_signals", _SIGNALS_MODULE)
    if spec is None or spec.loader is None:
        return None, None
    mod = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(mod)
    except Exception:
        return None, None
    return mod.extract_signals, mod.write_signals

# Configuration
HOME = Path.home()
STATE_FILE = HOME / ".hermes" / "oa" / "state" / "x-repost-monitor.json"
OUT_DIR = Path(__file__).parent.parent.parent / "docs" / "x-reposts"

TARGET_ACCOUNTS = [
    "goalworldsol",
    "goalworlddotfun",
]

# Max seen_ids to keep per account (prune older ones)
MAX_SEEN_IDS = 1000


def getenv(name: str, default: str = "") -> str:
    return (os.getenv(name) or default).strip()


def _pct(value: str) -> str:
    return urllib.parse.quote(value, safe="~-._")


def oauth1_header(
    method: str,
    url: str,
    ck: str,
    cs: str,
    at: str,
    ats: str,
    query: dict[str, str] | None = None,
) -> str:
    nonce = base64.urlsafe_b64encode(os.urandom(16)).decode("ascii").rstrip("=")
    timestamp = str(int(time.time()))
    oauth = {
        "oauth_consumer_key": ck,
        "oauth_nonce": nonce,
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp": timestamp,
        "oauth_token": at,
        "oauth_version": "1.0",
    }
    base_url = url.split("?", 1)[0]
    sign_params = {**(query or {}), **oauth}
    param_str = "&".join(f"{_pct(k)}={_pct(v)}" for k, v in sorted(sign_params.items()))
    base_str = "&".join([_pct(method.upper()), _pct(base_url), _pct(param_str)])
    signing_key = f"{_pct(cs)}&{_pct(ats)}"
    sig = base64.b64encode(
        hmac.new(signing_key.encode(), base_str.encode(), sha1).digest()
    ).decode()
    oauth["oauth_signature"] = sig
    return "OAuth " + ", ".join(f'{_pct(k)}="{_pct(v)}"' for k, v in sorted(oauth.items()))


def load_state() -> dict:
    """Load state from JSON file."""
    if not STATE_FILE.exists():
        return {}
    try:
        return json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_state(state: dict) -> None:
    """Save state to JSON file."""
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def get_user_id(username: str, ck: str, cs: str, at: str, ats: str) -> str | None:
    """Get user ID from username."""
    url = "https://api.x.com/2/users/by/username/" + username
    auth = oauth1_header("GET", url, ck, cs, at, ats)
    try:
        r = requests.get(
            url,
            headers={"Authorization": auth, "User-Agent": "GoalChainRepostMonitor/1.0"},
            timeout=20,
        )
        if r.status_code == 200:
            return r.json().get("data", {}).get("id")
    except Exception:
        pass
    return None


def get_user_retweets(
    user_id: str, ck: str, cs: str, at: str, ats: str, max_results: int = 10
) -> list[dict]:
    """Get tweets that the user has retweeted."""
    url = f"https://api.x.com/2/users/{user_id}/retweets"
    params = {
        "max_results": str(min(max_results, 100)),
        "tweet.fields": "created_at,public_metrics,referenced_tweets,author_id",
        "expansions": "referenced_tweets.id,author_id",
        "user.fields": "username,name",
    }
    auth = oauth1_header("GET", url, ck, cs, at, ats, params)
    try:
        r = requests.get(
            url,
            params=params,
            headers={"Authorization": auth, "User-Agent": "GoalChainRepostMonitor/1.0"},
            timeout=20,
        )
        if r.status_code != 200:
            return []
        data = r.json()
        return data.get("data", [])
    except Exception:
        return []


# Maximum original tweet IDs to fetch per run (rate-limit guard)
_MAX_DETAIL_FETCH = 10


def get_tweet_detail(
    tweet_id: str, ck: str, cs: str, at: str, ats: str
) -> dict | None:
    """Fetch full details for a single tweet ID (the original, not the retweet)."""
    url = f"https://api.x.com/2/tweets/{tweet_id}"
    params = {
        "tweet.fields": "created_at,public_metrics,author_id,text",
        "expansions": "author_id",
        "user.fields": "username,name,public_metrics",
    }
    auth = oauth1_header("GET", url, ck, cs, at, ats, params)
    try:
        r = requests.get(
            url,
            params=params,
            headers={"Authorization": auth, "User-Agent": "GoalChainRepostMonitor/2.0"},
            timeout=20,
        )
        if r.status_code != 200:
            return None
        data = r.json()
        tweet = data.get("data")
        if not tweet:
            return None

        # Resolve author from includes
        users = data.get("includes", {}).get("users", [])
        author = users[0] if users else {}
        return {
            "id": tweet_id,
            "text": tweet.get("text", ""),
            "username": author.get("username", "unknown"),
            "follower_count": author.get("public_metrics", {}).get("followers_count", 0),
            "rt_count": tweet.get("public_metrics", {}).get("retweet_count", 0),
            "like_count": tweet.get("public_metrics", {}).get("like_count", 0),
            "quote_count": tweet.get("public_metrics", {}).get("quote_count", 0),
            "created_at": tweet.get("created_at", ""),
        }
    except Exception:
        return None


def parse_retweet(
    retweet: dict, users_map: dict, seen_ids: set[str]
) -> dict | None:
    """Parse a retweet into structured format."""
    tweet_id = retweet.get("id", "")
    if tweet_id in seen_ids:
        return None

    # Get referenced tweet (the original that was retweeted)
    ref_tweets = retweet.get("referenced_tweets", [])
    original = None
    for ref in ref_tweets:
        if ref.get("type") == "retweeted":
            original = ref
            break

    if not original:
        return None

    author_id = original.get("author_id", "")
    author = users_map.get(author_id, {})
    author_username = author.get("username", "unknown")

    metrics = retweet.get("public_metrics", {})
    text = (retweet.get("text", "") or "")[:200]
    text = re.sub(r"\s+", " ", text)

    return {
        "id": tweet_id,
        "original_author": f"@{author_username}",
        "original_id": original.get("id", ""),
        "content_preview": text,
        "rt_count": metrics.get("retweet_count", 0),
        "like_count": metrics.get("like_count", 0),
        "quote_count": metrics.get("quote_count", 0),
        "created_at": retweet.get("created_at", ""),
    }


def generate_report(
    username: str,
    new_retweets: list[dict],
    ts: str,
) -> str:
    """Generate markdown report for one account."""
    lines = [f"## @{username} — {len(new_retweets)} new reposts\n"]

    if not new_retweets:
        lines.append("*No new retweets detected.*\n")
        return "\n".join(lines)

    lines.append("| Original Author | Content Preview | RTs | Likes |")
    lines.append("|-----------------|-----------------|-----|-------|")

    for rt in new_retweets:
        author = rt["original_author"]
        content = rt["content_preview"][:50] + "..." if len(rt["content_preview"]) > 50 else rt["content_preview"]
        rts = rt["rt_count"]
        likes = rt["like_count"]
        lines.append(f"| {author} | {content} | {rts} | {likes} |")

    lines.append("")
    return "\n".join(lines)


def main() -> int:
    dry_run = "--dry-run" in sys.argv

    # Check credentials
    ck = getenv("X_API_KEY")
    cs = getenv("X_API_SECRET")
    at = getenv("X_ACCESS_TOKEN")
    ats = getenv("X_ACCESS_SECRET")

    if dry_run:
        print("X Repost Monitor — DRY RUN")
        print(f"  STATE_FILE: {STATE_FILE}")
        print(f"  OUT_DIR: {OUT_DIR}")
        print(f"  ACCOUNTS: {TARGET_ACCOUNTS}")
        print(f"  CREDENTIALS: {'SET' if all([ck, cs, at, ats]) else 'MISSING'}")
        return 0

    if not all([ck, cs, at, ats]):
        print("ERROR: X API credentials missing. Set X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET")
        return 1

    state = load_state()
    all_new_retweets: dict[str, list[dict]] = {}
    all_signal_records: list[dict] = []
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d-%H%M")
    extract_signals, write_signals = _load_signal_extractor()

    for username in TARGET_ACCOUNTS:
        user_id = get_user_id(username, ck, cs, at, ats)
        if not user_id:
            print(f"WARN: Could not get user ID for @{username}")
            continue

        # Get recent retweets
        retweets = get_user_retweets(user_id, ck, cs, at, ats, max_results=20)
        if not retweets:
            all_new_retweets[username] = []
            continue

        seen_ids = set(state.get(username, {}).get("seen_ids", []))
        new_rt_list = []
        detail_count = 0  # rate-limit guard

        for rt in retweets:
            rt_id = rt.get("id", "")
            if rt_id in seen_ids:
                continue

            metrics = rt.get("public_metrics", {})

            # Extract the original tweet ID from referenced_tweets
            ref_tweets = rt.get("referenced_tweets", [])
            original_id = rt_id  # fallback to retweet ID
            for ref in ref_tweets:
                if ref.get("type") == "retweeted":
                    original_id = ref.get("id", rt_id)
                    break

            # Fetch original tweet detail for the first N new retweets
            record_for_signal: dict = {
                "id": rt_id,
                "original_id": original_id,
                "original_author": "via retweet",
                "content_preview": re.sub(r"\s+", " ", (rt.get("text") or "")[:100]),
                "rt_count": metrics.get("retweet_count", 0),
                "like_count": metrics.get("like_count", 0),
                "quote_count": metrics.get("quote_count", 0),
                "created_at": rt.get("created_at", ""),
                "username": "unknown",
                "follower_count": 0,
                "text": "",
            }

            if detail_count < _MAX_DETAIL_FETCH:
                detail = get_tweet_detail(original_id, ck, cs, at, ats)
                if detail:
                    record_for_signal["username"] = detail.get("username", "unknown")
                    record_for_signal["follower_count"] = detail.get("follower_count", 0)
                    record_for_signal["text"] = detail.get("text", "")
                    # Use original tweet metrics instead of retweet metrics for signals
                    record_for_signal["rt_count"] = detail.get("rt_count", 0)
                    record_for_signal["like_count"] = detail.get("like_count", 0)
                    record_for_signal["created_at"] = detail.get("created_at", "")
                    record_for_signal["original_author"] = f"@{detail.get('username', 'unknown')}"
                    record_for_signal["content_preview"] = detail.get("text", "")[:200]
                    detail_count += 1
                    time.sleep(1.0)  # deliberate rate-limit gap between detail calls

            new_rt_list.append({
                "id": rt_id,
                "original_author": record_for_signal["original_author"],
                "original_id": record_for_signal["original_id"],
                "content_preview": record_for_signal["content_preview"][:80],
                "rt_count": record_for_signal["rt_count"],
                "like_count": record_for_signal["like_count"],
                "quote_count": record_for_signal.get("quote_count", 0),
                "created_at": record_for_signal["created_at"],
            })

            # Collect for signal extraction
            all_signal_records.append(record_for_signal)

        all_new_retweets[username] = new_rt_list
        time.sleep(0.5)  # Rate limit between accounts

    # Generate combined report
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    report_path = OUT_DIR / f"reposts-{ts}.md"

    report_lines = [
        f"# X Repost Monitor — @goalworldsol & @goalworlddotfun",
        f"Generated: {ts} UTC\n",
    ]

    total_new = 0
    for username in TARGET_ACCOUNTS:
        new_rts = all_new_retweets.get(username, [])
        report_lines.append(generate_report(username, new_rts, ts))
        total_new += len(new_rts)

    # Add summary
    report_lines.append("\n## Summary")
    report_lines.append(f"- Total new reposts detected: {total_new}")
    report_lines.append(f"- Accounts monitored: {', '.join('@' + a for a in TARGET_ACCOUNTS)}")

    # Save report
    report_path.write_text("\n".join(report_lines), encoding="utf-8")
    print(f"REPORT: wrote {report_path} ({total_new} new reposts)")

    # Update state
    for username in TARGET_ACCOUNTS:
        new_rts = all_new_retweets.get(username, [])
        if not new_rts:
            continue

        account_state = state.get(username, {"seen_ids": []})
        seen_ids = account_state.get("seen_ids", [])

        # Add new IDs
        for rt in new_rts:
            if rt["id"] not in seen_ids:
                seen_ids.append(rt["id"])

        # Prune to MAX_SEEN_IDS
        if len(seen_ids) > MAX_SEEN_IDS:
            seen_ids = seen_ids[-MAX_SEEN_IDS:]

        state[username] = {"last_seen_id": new_rts[0]["id"], "seen_ids": seen_ids}

    save_state(state)
    print(f"STATE: updated {STATE_FILE}")

    # ---- Signal extraction ----
    if extract_signals and write_signals and all_signal_records:
        signals = extract_signals(all_signal_records)
        if signals:
            try:
                sig_path = write_signals(signals)
                print(f"SIGNALS: wrote {len(signals)} signals to {sig_path}")
                for sig in signals:
                    print(
                        f"  [{sig['type']}] @{sig['username']} "
                        f"conf={sig['confidence']} | {sig['text'][:60]}..."
                    )
            except Exception as e:
                print(f"WARN: signal write failed: {e}")
        else:
            print("SIGNALS: no actionable signals detected in new reposts")

    return 0


if __name__ == "__main__":
    sys.exit(main())