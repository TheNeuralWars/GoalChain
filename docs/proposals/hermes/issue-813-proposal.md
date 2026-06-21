# OA Proposal — Issue #813

## Title
[HERMES] [GBRAIN] ops/hermes/sync-gbrain.sh — reproducible VPS↔Mac sync

## Source
GitHub issue #813 (`owner: hermes`, `priority: P1`).

## Objective
Add a single idempotent shell script, `ops/hermes/sync-gbrain.sh`, that pulls the
canonical GoalChain markdown (`ai_context/`, `docs/intake/`, `docs/proposals/`)
into the **local** gbrain engine of the host that runs it.

INTERFACE (operates on the host that runs the script — no remote shell-out):
  bash ops/hermes/sync-gbrain.sh vps                  # sync VPS (this host)
  bash ops/hermes/sync-gbrain.sh mac-cursor           # aliases: vps-mac, cpu (alias)
  bash ops/hermes/sync-gbrain.sh mac-antigravity      # aliases: gemini (alias)
  bash ops/hermes/sync-gbrain.sh all                  # every reachable host from here

On a VPS only `vps` runs locally; `mac-*` print WARN and skip. On a Mac each
named flag runs that local brain's import (Cursor and Antigravity share the
same `~/.gbrain/` instance on macOS in this setup, so `all` runs once per host
that exists locally). See §"Detection" below.

## Detection (host runtime, not network)
- `uname -s` → `Linux` is VPS; `Darwin` is Mac. `hostname` further disambiguates
  (`ua-host` vs VPS bouncers).
- The script is **local-only** by design. A Mac cannot SSH into another Mac from
  here, so `mac-cursor` on the VPS prints a WARN and exits 0. The same way `vps`
  on a Mac prints a skipping WARN (the user would have meant their own VPS, not
  the current host).
- `all` on a Mac imports Cursor + Antigravity (same `~/.gbrain/`, run twice;
  `gbrain import` is idempotent). `all` on a VPS only runs VPS. Each branch
  records which targets were reachable.

## Steps per host (matches existing install-gbrain-antigravity.sh pattern)
1. **Pre-flight** — fail fast with a clear stderr if `bun` (or `~/.bun/bin/bun`)
   and `gbrain` are not on PATH. Both come from `install-gbrain-{antigravity,hermes,cursor}.sh`.
2. `cd "$REPO"` (`~/hermes/workspace/GoalChain` on VPS — symlinked to
   `/data/apps/GoalChain` — or `$GOALCHAIN_REPO_PATH` on a Mac).
3. `git pull --ff-only` (writes last-update-check stamp only on success).
4. Optional embedding step: if `OPENAI_API_KEY` / `ZEROENTROPY_API_KEY` /
   `VOYAGE_API_KEY` are present in env (loaded from `~/hermes/config.env` if it
   exists), run `gbrain embed --stale`. Otherwise skip with a single-line note.
5. For each existing subdir in `ai_context docs/intake docs/proposals`:
   `gbrain import "$REPO/$sub" --no-embed 2>&1 | tail -2` (printed to log).
6. Append summary line to `~/hermes/logs/gbrain-sync-<host>-<YYYY-MM-DD>.log`
   (one log per host per UTC day; rotated by date). Also `touch` a sentinel file
   `~/hermes/logs/gbrain-sync-<host>.last-update-check` so external cron/health
   probes can validate mtime without parsing logs.

## Output contract (proves success)
- `set -euo pipefail` — script exits non-zero if `git pull` fails. `gbrain import`
  failures of a single subdir are **logged but do not fail** the script (matches
  the existing installer tolerance for import hiccups).
- Returns exit 0 on success even when no embeddings ran.
- A trailing block prints the per-subdir import status and the sentinel mtime.

## File list (proposed)
| Path                                                | Status   | Notes                                |
|-----------------------------------------------------|----------|--------------------------------------|
| `ops/hermes/sync-gbrain.sh`                         | CREATE   | chmod 755, idempotent                |
| `ops/hermes/README.md`                              | CREATE   | short README section for the script  |

Skill update META decision (below) — no separate skill file is added; the line
is appended to the existing `goalchain-ops` skill (closest in scope).

## Risks & regressors
- **R1**: `git pull --ff-only` will refuse if the local working tree has
  diverged from `origin/main`. That is intentional — never silently rebase.
  Recovery is `git status` + manual rebase/reset by a human.
- **R2**: If `~/.gbrain/brain.pglite` is corrupted, `gbrain import` may stall or
  error. The script never touches the pglite file directly (per issue requirement);
  it only shells into the gbrain CLI. Operator must re-run `install-gbrain-*.sh`
  to recover.
- **R3**: Bun not on `PATH` after install — script prints stderr and exits 1.
  Operator must `source ~/.bashrc` or re-run the installer's PATH export.
- **R4**: Embedding stage incurs real API cost (`OPENAI_API_KEY`/`ZEROENTROPY_*`).
  Always gated on env presence; otherwise skipped.
- **R5**: Does not ship secrets. Loads `~/hermes/config.env` only as a source
  block, never inlines or echoes values into stdout/stderr.

## Rollback
```bash
git revert <merge-sha>   # or: rm ops/hermes/sync-gbrain.sh && git commit
```
No DB or on-chain state mutation. Brain reverts to its prior state because we
only call `gbrain import` (additive) and `gbrain embed --stale` (idempotent
re-embed of changed pages).

## Verification (intent of VALIDATE clause in #813)
```bash
bash ops/hermes/sync-gbrain.sh vps
echo "exit=$?"
ls -l ~/hermes/logs/gbrain-sync-vps.last-update-check
tail -20 ~/hermes/logs/gbrain-sync-vps-$(date -u +%Y-%m-%d).log
```
Expected: `exit=0`, sentinel file mtime recent, log shows per-subdir OK.

## META / scope notes
- **META R7 — surface the absent skill.** The issue says
  "update goalchain-hermes-ops skill (mention sync command)". No such skill
  exists on disk in the repo, in `~/.hermes/profiles/hermes-ceo/skills/`, or
  in `~/.claude/skills/`. The intake brief `2026-06-21-conectar-todo-gbrain-…`
  references it forward-looking. Per META R11 (don't fabricate) and the
  META-0 principle (name overrides), I am NOT creating a new skill. Instead
  the sync command is documented in:
    - the script header comment (always available),
    - `ops/hermes/README.md` (per-issue VALIDATE clause),
    - one appended line in the existing `goalchain-ops` skill (closest in scope;
      covers VPS operations and gbrain already).
- **META R3 — proportional simplicity.** A 130-line standalone bash script is
  the right shape. Anything more (Python orchestrator, systemd unit) is out
  of #813 scope. If Nico wants a cron later that becomes a one-liner.

## Workflow compliance
- direct-to-main mode enabled by Nico (keyword: `cambio urgente`) → commit on
  `main`, no feature branch.
- Draft PR opened for Antigravity/Nico review regardless (one-liner: "cambio
  urgente: ops/hermes/sync-gbrain.sh (issue #813)").
- One implementer (this agent). No concurrent edits.
- Constraints honored: NO `todowrite` tool usage; large writes broken into
  small calls (`patch` for edits); no secrets touched.
