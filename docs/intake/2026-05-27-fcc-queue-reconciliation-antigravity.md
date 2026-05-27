# FCC queue reconciliation + model_not_supported retry — Antigravity (hands-free)

- **Date:** 2026-05-27
- **Status:** done
- **Owner:** Antigravity (implement + merge)
- **Mode:** hands-free — no questions to Nico unless merge/economy/mainnet blocker

## Objective

Unblock the 24/7 FCC pipeline on the VPS: sync GitHub issue labels with worker state, fix the worker so it cannot “finish” without updating GitHub, re-run failed `model_not_supported` tasks, then drain **all** eligible `status:ready` opencode issues one-by-one until the queue is empty.

## Context (inspected 2026-05-27 ~20:20 UTC)

| Symptom | Cause |
|---------|--------|
| `oa-worker` idle ~50+ min after #170 | **67** issues still `status:ready` on GitHub but **67** local `~/hermes/oa/state/issue-*.done` markers → `pick_next_opencode_issue` skips everything |
| P0 #167–#170 “done” but still `status:ready` | `process_opencode_issue` in `ops/hermes/oa-worker.sh` **touches `.done` but never adds `status:done`** (unlike `local-agent-bridge.sh`) |
| `model_not_supported` | Logs: `runner-antigravity-issue-50.log`, `runner-cursor-issue-{51..55}.log` — API error on model `claude-sonnet-4.5` (local bridge), not FCC worker |

VPS: `goalchain@178.105.148.109`, repo `~/hermes/workspace/GoalChain`, services `oa-worker.service`, `fcc-server.service`.

## Allowed files

- `ops/hermes/oa-worker.sh` (required: label sync on success/failure)
- `ops/hermes/oa-reconcile-queue.sh` (new — audit + reconcile script)
- `ops/hermes/oa-queue-all-agents.sh` (extend if needed)
- `docs/intake/` (this brief + status updates)
- `ai_context/AGENT_ORCHESTRATION.md` (one paragraph on label contract, if missing)

## Forbidden

- `docs/ECONOMIC_CANONICAL_CONFIG.json` value changes
- Mainnet deploy, treasury, mint gates
- Enabling risky feature flags (oracle mint, video automation) without issue text
- Force-push `main`
- Secrets in repo (`.env`, `fcc.secrets.env`, `config.env`)

## Implementation plan (do in order)

### Phase A — Fix root cause (commit + push to `main` or small `fix/*` PR merged by you)

1. **`oa-worker.sh` — GitHub label contract on finish**
   - On **successful** run (define success: `oa-run-code` exit 0 **and** run log does **not** contain `model_not_supported`, `Error:`, or `FCC run failed` — tune regex from real logs):
     - `gh issue edit` → remove `status:ready`, `status:in_progress`; add `status:done`
     - Comment with: branch/PR link, tests run, tier used
     - Then `touch` `.done`
   - On **failure**: do **not** touch `.done`; remove `status:in_progress`; add comment + label `status:blocked` or re-add `status:ready` for retry
   - Apply to both normal and `cambio urgente` paths

2. **`oa-reconcile-queue.sh` (new)**
   - For each open issue with `status:ready` + `agent:opencode|antigravity|grok`:
     - If `.done` exists: verify PR exists OR commit on `exp/opencode-issue-N` OR direct-main comment — if yes → `status:done` + remove `status:ready`; if no real work → `rm` `.done` and leave `status:ready`
   - Dry-run flag `DRY_RUN=1` default in docs; `DRY_RUN=0` to apply
   - Print summary table: `#`, title, action taken

3. **Deploy to VPS** after merge: `git pull` in `~/hermes/workspace/GoalChain`, `systemctl --user restart oa-worker.service`

### Phase B — `model_not_supported` retries (hands-free)

| Issue | Agent | Action |
|-------|-------|--------|
| **#50** | `agent:antigravity` | Remove stale `issue-50.done`. Either complete spike yourself (Antigravity) **or** re-label `agent:opencode` + `status:ready` for FCC. Do not use broken `claude-sonnet-4.5` on VPS bridge. |
| **#51–#55** | `agent:cursor` | Smokes only — **close as cancelled** with comment, or remove `agent:cursor` and merge into opencode if still needed. FCC worker **skips** `agent:cursor` by design. |

FCC tiers on VPS use `~/hermes/.fcc/.env` (`MODEL_OPUS`, `MODEL_SONNET`, `MODEL_HAIKU`). If any FCC run still hits `model_not_supported`, fix routing in FCC config (not in repo secrets) and document in issue comment.

### Phase C — Drain queue (hands-free, one-by-one)

1. Run reconcile: `DRY_RUN=0 bash ~/hermes/scripts/oa-reconcile-queue.sh`
2. Re-queue remaining real work: `bash ~/hermes/scripts/oa-queue-all-agents.sh` (clears `.done` for issues it marks `status:ready`)
3. Ensure `touch ~/hermes/oa/RUNNING && systemctl --user restart oa-worker.service`
4. Monitor until `pick_next` returns empty **and** zero open issues match:
   ```bash
   gh issue list --label status:ready --label agent:opencode --state open --json number | jq length
   ```
5. For each issue FCC cannot complete (economy/on-chain): leave `status:blocked` + intake note; do not fake `.done`

**Throughput reference:** P0 direct-main #167–#170 took ~1–3 min each (opus); full backlog at P1/P2 may take many hours serial — acceptable.

## Acceptance criteria

- [ ] `oa-worker.sh` never sets `.done` without `status:done` on GitHub (or explicit failure path without `.done`)
- [ ] Reconcile script run on VPS; summary posted as comment on this intake issue or `docs/intake` status section
- [ ] #50 resolved (PR, comment, or re-queued opencode with passing FCC run)
- [ ] #51–#55 disposition documented (closed or reassigned)
- [ ] Open `status:ready` + `agent:opencode` count → **0** (or only issues explicitly `status:blocked` with reason)
- [ ] `oa-worker` processing visible in `~/hermes/oa/logs/worker.log` until idle with empty queue
- [ ] Changes pushed; integration owner merges to `main`

## Test commands

```bash
# Local (after editing oa-worker)
shellcheck ops/hermes/oa-worker.sh ops/hermes/oa-reconcile-queue.sh

# VPS
systemctl --user is-active oa-worker.service fcc-server.service
tail -30 ~/hermes/oa/logs/worker.log
gh issue list --repo TheNeuralWars/GoalChain --label status:ready --label agent:opencode --json number,title
ls ~/hermes/oa/state/issue-*.done | wc -l
```

## Risk / rollback

- **Risk:** Mass `status:done` on issues without real PRs — mitigate with reconcile verification step
- **Risk:** Re-running 67 issues duplicates work — reconcile must detect existing PRs before clearing `.done`
- **Rollback:** Revert `oa-worker.sh` commit; restore `oa/state` from backup if taken; re-add `status:ready` via `oa-queue-all-agents.sh`

## Handoff packet

| Field | Value |
|-------|--------|
| Owner | Antigravity |
| Status | ready |
| Integration | Antigravity merges; Cursor did not implement worker fix |
