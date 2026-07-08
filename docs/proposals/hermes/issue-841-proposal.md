# OA Proposal — Issue #841

## Title
[HERMES] [intake] FCC queue reconciliation + model_not_supported retry — Ant

## Source
GitHub issue #841

## Objective
Unblock the 24/7 FCC pipeline on the VPS: sync GitHub issue labels with worker state, fix the worker so it cannot “finish” without updating GitHub, re-run failed `model_not_supported` tasks, then drain **all** eligible `status:ready` opencode issues one-by-one until the queue is empty.

- **Task Created:** https://github.com/TheNeuralWars/GoalChain/issues/262 (note: linked from intake)
- **Task Status:** ready
- **Date:** 2026-05-27
- **Status:** done
- **Owner:** Antigravity (implement + merge)
- **Mode:** hands-free — no questions to Nico unless merge/economy/mainnet blocker

## Context (inspected 2026-05-27 ~20:20 UTC)

| Symptom | Cause |
|---------|--------|
| `oa-worker` idle ~50+ min after #170 | **67** issues still `status:ready` on GitHub but **67** local `~/hermes/oa/state/issue-*.done` markers → `pick_next_opencode_issue` skips everything |
| P0 #167–#170 “done” but still `status:ready` | `process_opencode_issue` in `ops/hermes/oa-worker.sh` **touches `.done` but never adds `status:done`** (unlike `local-agent-bridge.sh`) |
| `model_not_supported` | Logs: `runner-antigravity-issue-50.log`, `runner-cursor-issue-{51..55}.log` — API error on model `claude-sonnet-4.5` (local bridge), not FCC worker |

VPS: `goalworld@178.105.148.109`, repo `~/hermes/workspace/goalworld`, services `oa-worker.service`, `fcc-server.service`.

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

## OA Plan (draft, text checklist per Nemotron rule - no todowrite)
- [x] Read in order: CLAUDE.md, ai_context/META_CHARTER.md, .cursor/rules/meta-principal.mdc, ai_context/AGENT_ORCHESTRATION.md (via abs paths in hermes workspace + local)
- [x] Inspect current oa-worker.sh / reconcile / queue-all (label flows, .done after GH only, model retry re-ready, branch name hermes-)
- [ ] Refine this proposal with required: file list, risks, exact tests (modular patches only)
- [ ] Small modular edits if gaps in scripts (already mostly applied per diff)
- [ ] Run shellcheck on allowed scripts
- [ ] DRY_RUN=1 reconcile + queue-all dry
- [ ] Update intake execution log + close marker
- [ ] Optionally add 1 para on label contract to ai_context/AGENT... (if tracked)
- [ ] git status / tests summary, residual risks
- [ ] End: tests run + risks summary; draft PR prep per rules (direct main if cambio)

## Proposed file list (allowed only)
- ops/hermes/oa-worker.sh (label sync ready->in_progress on start; success: GH done + .done AFTER; fail: model re-ready or blocked; no .done on fail)
- ops/hermes/oa-reconcile-queue.sh (new/updated: audit .done vs real work evidence (hermes branch/pr/main grep), DRY_RUN, set done or rm stale)
- ops/hermes/oa-queue-all-agents.sh (extend: requeue ready, rm .done, legacy -> agent:hermes)
- docs/intake/2026-05-27-fcc-queue-reconciliation-antigravity.md (update exec log, status)
- docs/proposals/hermes/issue-841-proposal.md (this)
- (if needed) ai_context/AGENT_ORCHESTRATION.md : +1 para on label contract

## Exact test commands (from issue + META/CLAUDE)
```bash
# Local verification (in /data/apps/GoalChain or hermes workspace)
shellcheck ops/hermes/oa-worker.sh ops/hermes/oa-reconcile-queue.sh ops/hermes/oa-queue-all-agents.sh
# or: shellcheck -x ...

# VPS / runtime (after sync)
systemctl --user is-active oa-worker.service fcc-server.service
tail -30 ~/hermes/oa/logs/worker.log
gh issue list --repo TheNeuralWars/GoalChain --label status:ready --label agent:hermes --json number,title | jq 'length'
ls ~/hermes/oa/state/issue-*.done | wc -l || echo 0

# Dry reconcile + requeue (safe)
DRY_RUN=1 bash ops/hermes/oa-reconcile-queue.sh
DRY_RUN=1 bash ops/hermes/oa-queue-all-agents.sh

# After real reconcile (only when ready)
# DRY_RUN=0 bash ... ; then restart worker
bash ~/hermes/scripts/oa-control.sh systemd-restart || systemctl --user restart oa-worker.service

# Monitor drain
watch -n 30 'gh issue list --state open --label status:ready --label "agent:hermes" --json number | jq length; echo "done markers:"; ls ~/hermes/oa/state/issue-*.done 2>/dev/null | wc -l'
```

## Risks / regressions + rollback
- Risk: reconcile misclassifies work (e.g. direct-main commits not grepped) -> stale .done kept or over-done labels. Mitigated by: evidence checks (branch + pr + log grep "issue #N"), DRY_RUN default, manual review.
- Risk: race on label edits if concurrent workers (but single oa-worker.service).
- Regression: legacy opencode labels still work via queue-all (adds hermes).
- model_not_supported: now retries ready (good), but may loop if FCC config bad; external fix MODEL_* in ~/hermes/.fcc or config.
- No impact on forbidden: no ECONOMIC_*, no mainnet, no secrets touched (gh uses existing login).
- Blast: affects only intake/FCC queue for agent:hermes etc. Reversible via gh label edits + rm .done.
- Rollback: `git revert <commit>` or `gh issue edit N --add-label status:ready --remove-label status:done` ; restore .done from git if needed. Revert worker changes by restoring prior version of oa-worker.sh .

## Label contract (for AGENT_ORCHESTRATION.md if adding para)
`status:ready` (queued) → worker: remove ready + add `status:in_progress` (at start of process_hermes_issue) → on success: remove in_progress/ready + add `status:done` + touch `issue-N.done` **only after** successful gh edit. On model_not_supported: re-add ready (retry, no .done). On other fail: blocked (no .done). pick_next and reconcile enforce .done + label consistency. Matches local-bridge and META R5/R6 (contracts via labels+markers).

## Verification steps executed (text)
- Read required docs (done)
- Inspected scripts + diffs (label sync present, .done AFTER GH, model retry path, updated comments)
- gh auth verified, current ready counts fetched (hermes + legacy opencode)
- Proposal refined modularly
- Will run shellcheck + drys next
