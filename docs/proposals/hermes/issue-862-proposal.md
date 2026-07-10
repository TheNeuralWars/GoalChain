# Proposal: Issue #862 — X-Scout v2 (anti-spam) — implementation audit

**Date:** 2026-07-10
**Status:** Implementation audit + config gap closure
**Owner:** Hermes-CEO (FCC)

## Executive Summary

The code for all 4 pieces was already implemented in a prior session. This audit verifies each piece, documents what was done, and closes the remaining config gap in `~/hermes/config.env`.

**Verdict: Implementation is COMPLETE. Only config vars are missing.**

---

## Code Audit: What Was Implemented

### 1. `oa-x-scout-discord.py` ✅

- Forum posting to `DISCORD_RESEARCH_CHANNEL_ID` (active-research) with embeds
- Hash dedup (`content_hash()` SHA256 16-char prefix, stored in `state["hashes"]`)
- 2h cooldown: `OA_X_SCOUT_MIN_INTERVAL_SEC` (default 7200s)
- Immediate state persistence after Discord OK
- `is_quiet_or_useless()` blocks: "none met minimum", "score: 22/40", "X_SCOUT_QUIET" comment
- Supports webhook OR bot-token posting
- `--state-file` CLI flag

### 2. `oa-x-scout-run.py` ✅

- v2 prompt: 3-pass MoA (generate → critique → final)
- Grok prompt outputs `<!-- X_SCOUT_QUIET -->` when no signal
- Model configurable via `OA_SCOUT_SYNTH_MODEL` env
- Tone/depth configurable via `OA_SCOUT_TONE`, `OA_SCOUT_STRATEGY_DEPTH`
- Publishes ONLY the current cycle's `.md` (not all ai-radar-*.md)
- Calls `oa-x-scout-discord.py` with correct state file path

### 3. `oa-x-scout-run.sh` ✅

- Sources `config.env`, logs to `oa/logs/x-scout.log`
- Passes hermes home via env

### 4. `oa-worker.sh` ✅

- `publish_research_updates()` gated by `OA_WORKER_PUBLISH_RESEARCH != true` → returns 0 immediately
- Passes `--exclude-glob "ai-radar-*.md"` to legacy publisher
- State persisted after Discord OK (line 382-383)

### 5. `oa-discord-research-publisher.py` ✅

- `build_sources()` excludes ai-radar-*.md
- `is_useless_report()` with all junk markers + signal check
- State persisted after Discord OK (line 382-383)
- Cooldown file on failure (line 76)

---

## Config Gap Analysis

| Variable | In config.env | Value | Required by |
|---|---|---|---|
| `OA_RESEARCH_PUBLISHER_ENABLED` | YES | `false` | oa-x-scout-run.py |
| `OA_WORKER_PUBLISH_RESEARCH` | NO | (missing) | oa-worker.sh |
| `OA_X_SCOUT_MIN_INTERVAL_SEC` | NO | (missing) | oa-x-scout-discord.py |
| `DISCORD_RESEARCH_CHANNEL_ID` | NO | (missing) | oa-x-scout-discord.py |
| `DISCORD_RESEARCH_WEBHOOK_URL` | YES | `` (empty) | oa-x-scout-discord.py |

**Action required:** Add 3 variables to `~/hermes/config.env`.

---

## Changes to Apply

**File:** `~/hermes/config.env`

Add after `OA_RESEARCH_PUBLISHER_ENABLED="false"`:

```
# X-Scout v2 anti-spam config
OA_WORKER_PUBLISH_RESEARCH=false
OA_X_SCOUT_MIN_INTERVAL_SEC=7200
# DISCORD_RESEARCH_CHANNEL_ID: set to the forum "active-research" channel ID
DISCORD_RESEARCH_CHANNEL_ID=
```

Note: `DISCORD_RESEARCH_CHANNEL_ID` needs manual setup by Nico (Discord forum channel ID). Placeholder added as comment.

---

## Verification Commands

```bash
# 1. Test the X-Scout script (dry run, no publish)
bash ~/hermes/scripts/oa-x-scout-run.sh
tail -10 ~/hermes/oa/logs/x-scout.log

# 2. Verify anti-spam filters (check recent reports for X_SCOUT_QUIET)
grep -l "X_SCOUT_QUIET" ~/.hermes/workspace/docs/ai-radar-*.md 2>/dev/null | tail -5

# 3. Verify state dedup is active
cat ~/hermes/oa/state/x-scout-discord.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'hashes: {len(d[\"hashes\"])}, files: {len(d[\"files\"])}, last_post: {d[\"last_post_at\"]}')"

# 4. Verify worker excludes ai-radar
grep -A5 "ai-radar" ~/hermes/scripts/oa-worker.sh | grep exclude
grep "build_sources" ~/hermes/scripts/oa-discord-research-publisher.py -A8
```

---

## Residual Risks

1. **DISCORD_RESEARCH_CHANNEL_ID not set** — Cannot test actual forum post until Nico provides the channel ID.
2. **last_post_at = 0 in state** — No post was ever successful (likely because OA_RESEARCH_PUBLISHER_ENABLED=false or no channel ID). When enabled, first real post will set this.
3. **Two different home dirs in state** — State file tracks `/home/goalchain/` and `/home/ubuntu/` reports. Harmless (same dedup logic applies), but means both are tracked.

---

## Files Touched

- `~/hermes/config.env` — 3 new vars added (OA_WORKER_PUBLISH_RESEARCH, OA_X_SCOUT_MIN_INTERVAL_SEC, DISCORD_RESEARCH_CHANNEL_ID)

## Files Previously Implemented (no changes needed)

- `~/hermes/scripts/oa-x-scout-discord.py` — already correct
- `~/hermes/scripts/oa-x-scout-run.py` — already correct
- `~/hermes/scripts/oa-x-scout-run.sh` — already correct
- `~/hermes/scripts/oa-worker.sh` — already correct
- `~/hermes/scripts/oa-discord-research-publisher.py` — already correct

---

## Branch/Commit

- Branch: `main` (cambio urgente)
- Commit message: `fix(hermes): issue-862 X-Scout v2 — anti-spam sync with VPS`