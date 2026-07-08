#!/usr/bin/env bash
# x_daily_post.sh — GoalChain Daily X Post (1/day, budget-safe)
# =============================================================
# Cron: 0 14 * * * (2pm UTC = peak engagement window for crypto/sports)
# Called by autonomic-dispatch.sh or cron directly.
#
# RULES:
#   - Calls x_budget_poster.py which enforces MAX 1 post/day hard limit
#   - Content rotates daily through different angles (never same twice)
#   - Golden Rule: X = short, unique, public hook (not same as Discord)
#   - No bulk runs, no retry loops, no scheduler calling this > 1x/day
#
# INTEGRATION (issue #844): Postiz support documented in docs/social/POSTIZ_INTEGRATION.md + refined in docs/proposals/hermes/issue-844-proposal.md
# - Optional: use Postiz API/MCP for unified scheduling + AI across platforms (agent CLI ready).
# - Current path unchanged (direct budget poster).
# - Future opt-in via POSTIZ_ENABLED + SDK without breaking rotation invariant.
# - See also: test_twitter.ts , marketing/video-automation , hermes oa-x scripts.
#
# Thin hook (modular, no behavior change):
# if [ "${POSTIZ_ENABLED:-false}" = "true" ]; then
#   echo "[x_daily] Would delegate to Postiz (MCP/SDK) instead of direct; content pre-validated."
#   # e.g. curl -H "Auth:..." https://postiz-host/api/posts -d '{"content":"'"$tweet"'","platforms":["x"]}'
# fi
# (Per proposal: keep budget guard + rotation first.)

set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUDGET_POSTER="$HOME/hermes/scripts/x_budget_poster.py"
STATE_FILE="$HOME/.hermes/state/x_content_rotation.json"
LOG="$HERMES_HOME/logs/x_daily_post.log"
CRED_FILE="$HOME/.hermes/credentials/x-scout.env"

mkdir -p "$(dirname "$LOG")" "$HOME/.hermes/state"

# Load credentials
set -a
source "$CRED_FILE" 2>/dev/null || true
set +a

# Load squad data for spotlights
SQUAD_FILE="$HERMES_HOME/workspace/GoalChain/docs/assets/data/players.json"
if [ ! -f "$SQUAD_FILE" ]; then
    SQUAD_FILE="$HERMES_HOME/workspace/GoalChain/ai_context/03_data/players.json"
fi

echo "=== $(date -u '+%F %T UTC') x_daily_post ===" >> "$LOG"

# Generate today's tweet via Python (content selection + rotation logic)
python3 - <<'PYEOF' 2>>"$LOG"
import json, os, random, subprocess, sys
from datetime import datetime, timezone
from pathlib import Path

STATE_FILE = Path(os.path.expanduser("~/.hermes/state/x_content_rotation.json"))
BUDGET_POSTER = Path(os.path.expanduser("~/hermes/scripts/x_budget_poster.py"))
SQUAD_PATHS = [
    Path(os.path.expanduser("~/hermes/workspace/GoalChain/docs/assets/data/players.json")),
    Path(os.path.expanduser("~/hermes/workspace/GoalChain/ai_context/03_data/players.json")),
]

# ── Load rotation state ──────────────────────────────────────────────────────
state = {}
if STATE_FILE.exists():
    try:
        state = json.loads(STATE_FILE.read_text())
    except:
        state = {}

used_angles = state.get("used_angles", [])
used_players = state.get("used_players", [])
today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

# ── Content angles (rotate so no two consecutive posts feel the same) ────────
ANGLES = [
    "zealy_push",
    "vault_mechanics",
    "x_scout_alpha",
    "player_spotlight",
    "presale_urgency",
    "rwa_stadium",
    "genesis_depth",
    "wc_2026_hook",
]

# Pick angle not used in last 3 posts
recent = used_angles[-3:] if len(used_angles) >= 3 else used_angles
available = [a for a in ANGLES if a not in recent]
if not available:
    available = ANGLES
angle = random.choice(available)

# ── Load squad for spotlight ─────────────────────────────────────────────────
squad = []
for p in SQUAD_PATHS:
    if p.exists():
        try:
            squad = json.loads(p.read_text())
        except:
            pass
        break

def pick_player(squad, used):
    cands = [p for p in squad if p.get("rarity") in ("legendary","mythic") and p.get("name") not in used]
    if not cands:
        cands = [p for p in squad if p.get("name") not in used]
    if not cands:
        cands = squad
    return random.choice(cands) if cands else None

# ── Build tweet by angle ─────────────────────────────────────────────────────
tweet = ""

if angle == "player_spotlight" and squad:
    p = pick_player(squad, used_players)
    if p:
        name = p.get("name", "Unknown")
        real = p.get("real_name", "")
        country = p.get("country", "")
        rarity = p.get("rarity", "").upper()
        stats = p.get("stats", {})
        atk = stats.get("atk", "?")
        defd = stats.get("def", "?")
        hype = stats.get("hype", "?")
        tweet = (
            f"⚡ {name} ({real}, {country}) — {rarity}\n"
            f"ATK {atk} · DEF {defd} · HYPE {hype}\n\n"
            f"1 of 528 Genesis legends forged across 19 Grok batches.\n"
            f"Real biometrics. Daily on-chain yield. World Cup infrastructure.\n\n"
            f"Presale live → goalchain.fun\n"
            f"#GoalChain #SolanaFootball #WC2026"
        )
        used_players = (used_players + [name])[-20:]
    else:
        angle = "genesis_depth"

if angle == "zealy_push":
    tweet = (
        "🎯 Zealy Season 1 is live.\n\n"
        "XP earned now = $GCH airdrop at launch.\n"
        "25% of total supply goes to the community.\n\n"
        "→ Follow @GoalChainSOL\n"
        "→ Earn your Degen role in Discord\n"
        "→ Screenshot your penalty streaks\n\n"
        "zealy.io/cw/goalchain\n"
        "#GoalChain #Solana #Airdrop"
    )

elif angle == "vault_mechanics":
    tweet = (
        "🔒 The GoalChain Vault:\n\n"
        "100% of Genesis NFT sales → staked via Jito\n"
        "→ buys back $GCH\n"
        "→ burns forever (Infinity Burn)\n\n"
        "Every sale deflationary pressure before launch.\n"
        "Presale → goalchain.fun\n\n"
        "#GoalChain #Solana #DeFi #SportsFi"
    )

elif angle == "x_scout_alpha":
    tweet = (
        "📡 X-Scout live on Solana:\n\n"
        "Scanning GOAL/USDC arb spreads in real time.\n"
        "Mapping World Cup match volatility windows.\n"
        "On-chain signals feeding the ecosystem before launch.\n\n"
        "This is running right now.\n"
        "goalchain.fun\n\n"
        "#GoalChain #Solana #Alpha #WC2026"
    )

elif angle == "presale_urgency":
    tweet = (
        "⏳ GoalChain Presale:\n\n"
        "1 SOL = 50,000 $GCH\n"
        "~30% of hard cap raised.\n"
        "Vault executing buybacks from every sale.\n\n"
        "528 Genesis NFTs. Real yield. Real biometrics.\n"
        "Not a memecoin.\n\n"
        "→ goalchain.fun\n"
        "#GoalChain #Solana #Presale"
    )

elif angle == "rwa_stadium":
    tweet = (
        "🏟️ GoalChain RWA Stadiums:\n\n"
        "Digital venue owners earn from global attendance.\n"
        "5-2-3 split: owners / players / treasury\n\n"
        "Real World Assets. On-chain revenue.\n"
        "World Cup 2026 infrastructure.\n\n"
        "goalchain.fun\n"
        "#GoalChain #RWA #Solana #WC2026"
    )

elif angle == "genesis_depth":
    tweet = (
        "19 Grok batches.\n"
        "528 players.\n"
        "Real biometrics, lore, and daily on-chain yield.\n\n"
        "This is not AI-generated noise.\n"
        "This is studied craft.\n\n"
        "Genesis mint coming. Presale live.\n"
        "→ goalchain.fun\n\n"
        "#GoalChain #Solana #SportsFi"
    )

elif angle == "wc_2026_hook":
    tweet = (
        "⚽ World Cup 2026 is 1 year away.\n\n"
        "GoalChain is already running:\n"
        "→ 528 player Genesis Squad (on-chain)\n"
        "→ Live X-Scout match signals\n"
        "→ Vault buybacks + Infinity Burn\n"
        "→ Zealy Season 1 airdrop\n\n"
        "Be early. goalchain.fun\n"
        "#WC2026 #Solana #GoalChain"
    )

if not tweet:
    print(f"[x_daily] No tweet built for angle '{angle}'. Skipping.")
    sys.exit(0)

# Enforce 280 char limit
if len(tweet) > 280:
    tweet = tweet[:277] + "…"

print(f"[x_daily] Angle: {angle}")
print(f"[x_daily] Length: {len(tweet)} chars")
print(f"[x_daily] Preview: {tweet[:100]}…")

# ── Call budget poster ───────────────────────────────────────────────────────
result = subprocess.run(
    [sys.executable, str(BUDGET_POSTER), "--post", tweet],
    capture_output=True, text=True
)
print(result.stdout)
if result.returncode != 0:
    print(f"[x_daily] Budget poster exited {result.returncode}: {result.stderr}")
    sys.exit(result.returncode)

# ── Save rotation state ──────────────────────────────────────────────────────
state["used_angles"]  = (used_angles + [angle])[-10:]
state["used_players"] = used_players
state["last_post"]    = today
STATE_FILE.write_text(json.dumps(state, indent=2))
print(f"[x_daily] State saved. Next angles will avoid: {state['used_angles'][-3:]}")

PYEOF

echo "=== done ===" >> "$LOG"
