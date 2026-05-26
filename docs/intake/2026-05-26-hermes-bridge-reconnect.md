# Hermes bridge reconnect — Mac (Cursor) ↔ VPS (Manager)

- **Date:** 2026-05-26
- **Status:** ready
- **Priority:** P0
- **Owner:** Nico + Hermes (VPS) + Antigravity (merge/push)

## Situation

Cursor runs **disconnected** from the Hermes VPS: no live GBrain sync Mac↔server. **Normal** — GBrain is per-host PGLite. The **bridge** is: **Git** + optional **SSH** + **Hermes gateway** (Discord/WhatsApp).

## Bridge components (state checklist)

| Layer | Mac (Cursor) | VPS (Hermes) | Healthy signal |
|-------|----------------|--------------|----------------|
| **Repo** | `~/GoalChain` | `~/hermes/workspace/GoalChain` | Same commit on `main` after pull |
| **Intake** | `docs/intake/*.md` | same path after pull | Hermes reads `GITHUB_ISSUES_BACKLOG_*` |
| **GBrain MCP** | `.cursor/mcp.json` → `bun` + `gbrain serve` | `~/.hermes/config.yaml` → `mcp_servers.gbrain` | `gbrain doctor --fast` OK |
| **Manager chat** | `hermes` CLI (mirror) or Discord `#hermes` | `hermes-gateway.service` | Reply without @mention in #hermes |
| **FCC worker** | — | `oa-worker` + `fcc-claude` | `oa-control.sh status` |
| **API health** | `curl` prod URL | `HEALTH_URL` in `config.env` | `/health` 200 |

There is **no** continuous memory sync. After reconnect, run **git pull + gbrain import** on **both** hosts.

---

## Step 1 — Reconnect Git (primary bridge)

### On Mac (Cursor) — push handoff pack

```bash
cd /Users/NicoPez/GoalChain
git status
git add docs/intake/2026-05-26-hermes-bridge-reconnect.md \
        docs/intake/2026-05-26-hermes-manager-handoff.md \
        docs/intake/GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.md \
        docs/intake/GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.csv
git commit -m "docs(intake): Hermes handoff — issue backlog + bridge reconnect"
git push origin HEAD
```

If blocked on merge: push branch `exp/cursor-hermes-handoff-2026-05-26` and open PR for Antigravity.

### On VPS — pull (Hermes sync)

```bash
ssh goalchain@178.105.148.109
export HERMES_HOME=~/hermes
source ~/hermes/config.env 2>/dev/null || true
bash ~/hermes/workspace/GoalChain/ops/hermes/sync.sh
# or:
cd ~/hermes/workspace/GoalChain && git pull origin main
```

---

## Step 2 — Reconnect GBrain (each host separately)

### Mac

```bash
# Bun + gbrain present
~/.bun/bin/bun --version
~/.bun/bin/gbrain doctor --fast

# Re-import institutional memory from repo
cd /Users/NicoPez/GoalChain
~/.bun/bin/gbrain import ai_context docs/intake
~/.bun/bin/gbrain embed --stale   # optional if OPENAI_API_KEY or ZEROENTROPY_API_KEY set

# Cursor: Reload Window after MCP change
bash ops/hermes/install-gbrain-cursor.sh   # idempotent
```

### VPS

```bash
ssh goalchain@178.105.148.109
cd ~/hermes/workspace/GoalChain
bash ops/hermes/install-gbrain-hermes.sh    # if never installed
gbrain import ai_context docs/intake
gbrain embed --stale 2>/dev/null || true
systemctl --user restart hermes-gateway
```

---

## Step 3 — Reconnect Hermes CLI mirror (Mac ↔ VPS config)

**Pull VPS → Mac** (keys, SOUL, MCP):

```bash
cd /Users/NicoPez/GoalChain
GOALCHAIN_SSH=goalchain@178.105.148.109 bash ops/hermes/install-hermes-mirror-mac.sh
```

**Push Mac → VPS** (after editing SOUL/MCP on Mac):

```bash
bash ops/hermes/push-hermes-mirror-to-server.sh
```

**Verify gateway:**

```bash
ssh goalchain@178.105.148.109 'systemctl --user status hermes-gateway --no-pager | head -20'
ssh goalchain@178.105.148.109 'tail -30 ~/.hermes/profiles/jito-strategy/logs/gateway.log'
```

**Discord profile sync** (active profile `jito-strategy`):

```bash
ssh goalchain@178.105.148.109 \
  'bash ~/hermes/workspace/GoalChain/ops/hermes/sync-hermes-active-profile-discord.sh && systemctl --user restart hermes-gateway'
```

---

## Step 4 — Notify Manager (optional fast path)

After `git push`, ping Hermes without waiting for cron:

### A) Discord (Nico)

```
manager: estado
manager: prioridad — leer docs/intake/2026-05-26-hermes-manager-handoff.md y GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.md en main
```

### B) SSH one-liner (runs sync + context)

```bash
ssh goalchain@178.105.148.109 'bash ~/hermes/scripts/hermes-context.sh; ls ~/hermes/workspace/GoalChain/docs/intake/*hermes* ~/hermes/workspace/GoalChain/docs/intake/GITHUB_ISSUES*'
```

### C) Webhook (VPS localhost only — from VPS)

```bash
# On VPS:
curl -sS -X POST http://127.0.0.1:8644/webhooks/goalchain-alpha-push \
  -H 'Content-Type: application/json' \
  -d '{"message":"[Bridge] Issue backlog landed in docs/intake — run hermes-context and create P0 GitHub issues from GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.csv"}'
```

---

## Step 5 — Verify bridge end-to-end

| # | Check | Command |
|---|-------|---------|
| 1 | Same git SHA | `git rev-parse HEAD` Mac vs VPS |
| 2 | Backlog file exists on VPS | `test -f docs/intake/GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.md` |
| 3 | GBrain query | `gbrain query "Mundial MVP P0 issues"` |
| 4 | API | `curl -sf https://crm.goalchain.fun/goalchain-api/health` |
| 5 | #hermes responds | Discord test message |

---

## What is NOT the bridge

| Misconception | Reality |
|---------------|---------|
| Hermes-vault MCP on VPS | Separate; `hermes-vault init` not required for GBrain |
| Live GBrain Mac→VPS | Use **git + import** |
| Antigravity inside Hermes | Separate; linked via issues + `oa-dispatch-local.sh` |
| Merge queue #32–#34 | **Already merged** (#26 + #35) — see manager handoff |

---

## Related files

- Manager handoff: [`2026-05-26-hermes-manager-handoff.md`](2026-05-26-hermes-manager-handoff.md)
- Issue backlog: [`GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.md`](GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.md)
- CSV for bulk issue create: [`GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.csv`](GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.csv)
- Setup: [`ai_context/HERMES_SETUP.md`](../../ai_context/HERMES_SETUP.md)
