# OA Proposal — Issue #862

## Title
[HERMES] [intake] X-Scout v2 — foro active-research (anti-spam)

## Source
GitHub issue #862

## Objective
## Objective
# X-Scout v2 — foro active-research (anti-spam)

- **Task Created:** https://github.com/TheNeuralWars/goalworld/issues/256
- **Task Status:** ready

- **Date:** 2026-05-25
- **Status:** done
- **Owner:** Cursor (draft) / Antigravity merge

## Problema

- El publisher legacy (`oa-discord-research-publisher.py`) + `oa-worker` (loop 20s) republicaba el mismo informe en `#oa-research-live`.
- Informes vacíos ("none met minimum", score 22/40) igual se publicaban.
- State de Discord no se persistía si fallaba el post a X → repeticiones infinitas.

## Solución

| Pieza | Cambio |
|-------|--------|
| `oa-x-scout-discord.py` | Publisher dedicado: embeds, foro, hash dedup, cooldown 2h, state inmediato |
| `oa-x-scout-run.py` | Prompt v2, `X_SCOUT_QUIET` si no hay señal, publica solo el `.md` del ciclo |
| `oa-worker.sh` | `OA_WORKER_PUBLISH_RESEARCH=false` por defecto; excluye `ai-radar-*.md` |
| `oa-discord-research-publisher.py` | Ya no escanea `ai-radar-*`; persiste state tras Discord OK |

## Config VPS (`~/hermes/config.env`)

```bash
DISCORD_RESEARCH_CHANNEL_ID=<ID del foro active-research>
OA_RESEARCH_PUBLISHER_ENABLED=true
OA_WORKER_PUBLISH_RESEARCH=false
OA_X_SCOUT_MIN_INTERVAL_SEC=7200
```

## Verificación

```bash
bash ~/hermes/scripts/oa-x-scout-run.sh
tail -30 ~/hermes/oa/logs/x-scout.log
```

## OA Plan (draft)
- Analyze repository constraints and META alignment. DONE
- Implement minimal safe changes first. IN PROGRESS
  - `oa-x-scout-discord.py` line ~71: fix `<!-- x_scout_quiet -->` case-insensitive (must match `<!-- X_SCOUT_QUIET -->` from Grok prompt)
  - `oa-x-scout-run.py` line ~165: verify `<!-- X_SCOUT_QUIET -->` in prompt matches the check above
  - `oa-worker.sh`: already has `--exclude-glob "ai-radar-*.md"` + `OA_WORKER_PUBLISH_RESEARCH=false` ✓
  - `oa-discord-research-publisher.py`: already excludes `ai-radar-*` + persists state after Discord OK ✓
  - `oa-x-scout-run.sh`: already publishes only the cycle's .md ✓
- Run local checks where feasible.
- Prepare draft PR for Antigravity review.
- Close intake marker: touch `docs/intake/2026-05-25-x-scout-v2-forum.done`

## Proposed file list
| File | Change |
|------|--------|
| `ops/hermes/oa-x-scout-discord.py` | Fix line ~71: make `x_scout_quiet` check case-insensitive to match `<!-- X_SCOUT_QUIET -->` from Grok prompt |
| `ops/hermes/oa-x-scout-run.py` | No-op: already has correct `<!-- X_SCOUT_QUIET -->` in Grok prompt (line 165) |
| `ops/hermes/oa-worker.sh` | No-op: already has `--exclude-glob "ai-radar-*.md"` + `OA_WORKER_PUBLISH_RESEARCH=false` |
| `ops/hermes/oa-discord-research-publisher.py` | No-op: already excludes `ai-radar-*` + persists state after Discord OK |
| `ops/hermes/oa-x-scout-run.sh` | No-op: already correct |
| `docs/proposals/hermes/issue-862-proposal.md` | Updated with final analysis |
| `docs/intake/2026-05-25-x-scout-v2-forum.done` | Touch done marker |

## Risks / regressions
- **Risk**: `is_quiet_or_useless()` skips valid reports if `github.com/` check fires prematurely
  - **Mitigation**: `github.com/` check only fires after all other junk markers; if content has thesis+table, GitHub link likely present
- **Regression**: Legacy `oa-discord-research-publisher.py` loses ai-radar posts
  - **Mitigation**: X-Scout owns ai-radar via dedicated `oa-x-scout-discord.py`; no overlap possible
- **Rollback**: `git revert` the single fix in `oa-x-scout-discord.py`; touch/rm done marker as needed

## Exact test commands
```bash
# Verify quiet marker detection (case-insensitive)
python3 -c "
import sys; sys.path.insert(0, 'ops/hermes')
from oa_x_scout_discord import is_quiet_or_useless
assert is_quiet_or_useless('<!-- X_SCOUT_QUIET -->') == True, 'uppercase fail'
assert is_quout_or_useless('<!-- x_scout_quiet -->') == True, 'lowercase fail'
assert is_quiet_or_useless('<!-- X_Scout_Quiet -->') == True, 'mixed case fail'
assert is_quiet_or_useless('Real report with github.com/foo') == False, 'valid fail'
print('All quiet marker checks passed')
"

# Verify no ai-radar exclusion leakage
grep -n 'ai-radar' ops/hermes/oa-worker.sh
grep -n 'ai-radar' ops/hermes/oa-discord-research-publisher.py

# Syntax check
python3 -m py_compile ops/hermes/oa-x-scout-discord.py && echo 'Syntax OK'
python3 -m py_compile ops/hermes/oa-x-scout-run.py && echo 'Syntax OK'

# Touch done marker
touch docs/intake/2026-05-25-x-scout-v2-forum.done
