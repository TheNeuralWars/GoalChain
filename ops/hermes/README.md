# ops/hermes/

GoalChain operations scripts run under Hermes (the manager and the CEO code agent)
on the Oracle Cloud VPS (`ubuntu@89.168.20.135`).

These scripts are dispatched via `oa-run-code.sh`, `oa-worker.sh`, or invoked
manually by Nico. They are **idempotent** and tolerate partial failures cleanly
(no half-applied state).

## Index

| Script | Purpose |
|---|---|
| `bootstrap.sh` | first-time VPS bootstrap (clones repo, writes `~/hermes/config.env`) |
| `deploy-hermes-workspace.sh` | deploy the Hermes Manager workspace |
| `oa-run-code.sh` | run a single issue through the `oa-worker` semaphore (4 slots) |
| `local-issue-queue.sh` | manage the local issue queue driven by issues labelled `agent:opencode` + `status:ready` |
| `install-hermes-superpowers.sh` | install `~/.claude/skills/` (frontend-design, gstack) for the CEO |
| `install-gbrain-hermes.sh` | install GBrain on this VPS (bun + `~/.gbrain` + MCP wiring) |
| `install-gbrain-cursor.sh` | install GBrain on a Mac for the Cursor IDE user-only brain |
| `install-gbrain-antigravity.sh` | install GBrain on a Mac for the Antigravity IDE user-only brain |
| `sync-gbrain.sh` | **idempotent daily brain sync — see "GBrain sync" below** |
| `start_all_agent_bots.sh` | boot the local Discord/agent bot fleet (idempotent) |
| `start_hermes_sync_daemon.sh` | daemonize the Hermes ↔ GitHub repo sync |
| `autonomic-reviewer.sh` | nightly cron: review queue health + open PRs |
| `oa-reconcile-queue.sh` | reconcile the current issue queue against `origin/main` |

## GBrain sync (issue #813)

`ops/hermes/sync-gbrain.sh` reconciles the local `~/.gbrain` engine against the
canonical GoalChain markdown (`ai_context/` + `docs/intake/` + `docs/proposals/`).

The script is **local-only by design** — it never SSHes into another host. Run it
on each host whose brain you want to refresh:

```bash
# On the VPS:
bash ops/hermes/sync-gbrain.sh vps

# On a Mac with both Cursor and Antigravity installed:
bash ops/hermes/sync-gbrain.sh mac-cursor       # imports (idempotent re-run)
bash ops/hermes/sync-gbrain.sh mac-antigravity
bash ops/hermes/sync-gbrain.sh all              # both, in sequence
```

A daily cron entry is recommended on each host (set in the host's
`~/.config/systemd/user/`); see `ai_context/AGENT_ORCHESTRATION.md` §"GBrain
ritual" for the cadence.

**Outputs (per host):**

- `~/hermes/logs/gbrain-sync-<host>-YYYY-MM-DD.log` — per-day log
- `~/hermes/logs/gbrain-sync-<host>.last-update-check` — sentinel mtime

**Exit codes:**

- `0` — success (a non-local host requested for `mac-*` on a VPS or vice-versa is
  logged + skipped; the script still returns success because the operator can
  re-run it on the right host)
- `1` — preflight failure (`bun`/`gbrain` not installed)
- `2` — `git pull --ff-only` failed (local history diverged — resolve manually)

**Notes:**

- `gbrain import <dir> --no-embed` is idempotent (re-imports already-imported
  pages just refresh mtimes).
- `gbrain embed --stale` only runs if `OPENAI_API_KEY` or `ZEROENTROPY_API_KEY`
  is present in env (loaded from `~/hermes/config.env` if available).
- The script never writes to `~/.gbrain/brain.pglite` directly — only gbrain
  CLI subcommands (`import`, `embed`).
- Cross-host gbrain sync must NOT happen via SSH in this script. Cron each host
  locally instead.
