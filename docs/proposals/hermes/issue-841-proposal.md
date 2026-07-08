# OA Proposal — Issue #841

## Title
[HERMES] [intake] FCC queue reconciliation + model_not_supported retry — Ant

## Source
GitHub issue #841

## Objective
## Objective
# FCC queue reconciliation + model_not_supported retry — Antigravity (hands-free)

- **Task Created:** https://github.com/TheNeuralWars/goalworld/issues/262
- **Task Status:** ready

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
- [x] Read in order: CLAUDE.md, ai_context/META_CHARTER.md (from .bak for context), .cursor/rules/meta-principal.mdc (bak), ai_context/AGENT_ORCHESTRATION.md
- [x] Inspect current oa-worker.sh / reconcile / queue-all (label flows, .done AFTER GH only on success, model retry re-ready, multi-ref for direct-main, hermes- branch names)
- [x] Refine this proposal with required: Proposed file list, Risks/regressions + rollback, Exact test commands (modular patch only)
- [x] Small modular patches to allowed files (label ensure already + reconcile evidence loop)
- [x] Run shellcheck on allowed scripts (infos only, exit 0)
- [x] DRY_RUN=1 reconcile + queue-all dry runs + gh counts
- [x] Update intake execution log + close marker (in text)
- [x] Confirm label contract para present in ai_context/AGENT_ORCHESTRATION.md
- [x] git status / summary, residual risks
- [x] End: tests run + risks summary; prepare draft PR context (direct main enabled via 'cambio urgente' per prompt)

## Proposed file list (strictly allowed only)
- ops/hermes/oa-worker.sh (label sync: in_progress on dispatch/process; success: GH status:done + comment + .done ONLY after gh edit; model_not_supported: re-ready no .done; other fail: blocked no .done)
- ops/hermes/oa-reconcile-queue.sh (audit: for status:ready code-agents check .done vs evidence branch/pr/main-grep "issue #N"; DRY_RUN=1 default; set done or rm stale .done; summary table)
- ops/hermes/oa-queue-all-agents.sh (extend if needed: already re-queues ready + rm .done for legacy, adds agent:hermes)
- docs/intake/2026-05-27-fcc-queue-reconciliation-antigravity.md (this brief + status updates + exec log)
- docs/proposals/hermes/issue-841-proposal.md (this)
- ai_context/AGENT_ORCHESTRATION.md (contract para already present per spec)

## Exact test commands
```bash
# 1. Local verification (in repo root)
shellcheck ops/hermes/oa-worker.sh ops/hermes/oa-reconcile-queue.sh ops/hermes/oa-queue-all-agents.sh

# 2. Dry runs (safe, no mutation)
DRY_RUN=1 bash ops/hermes/oa-reconcile-queue.sh
DRY_RUN=1 bash ops/hermes/oa-queue-all-agents.sh

# 3. Current queue state
gh issue list --repo TheNeuralWars/GoalChain --state open --label status:ready --json number | python3 -c 'import json,sys; print("total ready:", len(json.load(sys.stdin)))'
gh issue list --repo TheNeuralWars/GoalChain --state open --label status:ready --json number,labels | python3 -c '
import json,sys
d=json.load(sys.stdin)
agents={"agent:hermes","agent:antigravity","agent:grok"}
print("code ready:", sum(1 for i in d if {l.get("name","") for l in i.get("labels",[])} & agents ))
'

# 4. Done markers (VPS profile)
ls ~/hermes/oa/state/issue-*.done 2>/dev/null | wc -l || echo 0

# 5. Worker status + monitor (VPS)
systemctl --user is-active oa-worker.service || true
tail -5 ~/hermes/oa/logs/worker.log || true

# 6. After changes (pull on VPS, restart, full run)
# git pull origin main
# DRY_RUN=0 bash ops/hermes/oa-reconcile-queue.sh   # only when needed
# bash ops/hermes/oa-queue-all-agents.sh            # DRY=0 to requeue
# systemctl --user restart oa-worker.service
# watch -n 60 'gh issue list --state open --label status:ready --label agent:hermes --json number | python3 -c "import json,sys;print(len(json.load(sys.stdin)))" ; ls ~/hermes/oa/state/*.done 2>/dev/null | wc -l'
```

## Risks / regressions + rollback
- Risk: reconcile misclassifies evidence (e.g. direct-main commits not matched by grep "issue #N", or remote ahead) -> keep stale .done or wrongly label done. Mit: multi-ref check (origin/main/main/HEAD -10), DRY_RUN=1 default, printed summary, manual override via gh.
- Risk: gh edit silent fail (|| true) -> labels inconsistent with .done. Mit: always log + comment on GH, idempotent labels, worker double-checks.
- Regression: legacy `agent:opencode` or unlabeled now get `agent:hermes` via queue-all (per spec).
- model_not_supported: handled as requeue to ready (no .done) — but if inner error string not "model_not_supported" (e.g. "Model not supported", abort, core dump) may hit blocked instead of retry. Mit: comment includes log; external FCC MODEL config fix (not in repo). Current run for 841 hit hermes profile abort (core).
- No impact on forbidden areas (no ECONOMIC_CANONICAL_CONFIG, no mainnet/treasury/mint, no risky flags, no secrets read/written).
- Blast radius: only OA/FCC intake queue for specific agents. Fully reversible.
- Rollback: `git revert <sha for 841>` (or cherry); `gh issue edit N --remove-label status:done --add-label status:ready`; selective `rm ~/hermes/oa/state/issue-N.done`; restore script from git; re-run queue-all.

## Label contract (per AGENT_ORCHESTRATION.md and spec)
- `status:ready` + (agent:hermes|antigravity|grok) : pick_next eligible (if no .done and no status:done)
- Dispatch/process: remove ready, add in_progress
- Success (run_status==0 AND no error strings in run_log): remove ready/in_progress, add `status:done`; comment (tier, PR/direct-main, log); THEN touch .done
- model_not_supported (detected by string in run_log): comment, remove in_progress, add `status:ready` (requeue); **DO NOT** touch .done
- Other failure: add `status:blocked`; no .done
- Reconcile: if .done but no branch/PR/main evidence("issue #N") then rm stale .done (leave ready)
- pick_next + reconcile respect .done OR status:done as terminal
- Source of truth: GH labels + git evidence; .done = local opt
- Updated by: oa-worker.sh (primary for runtime), oa-reconcile-queue.sh, oa-queue-all-agents.sh
- Owner: Antigravity (merge/integration)

## Verification (executed)
- Reads of required files (CLAUDE, META bak, meta-princ, AGENT_ORCH) complete
- Inspected key paths in oa-worker.sh:841 (process_hermes_issue, pick_next_hermes_issue, has_error detection, success/fail branches)
- shellcheck: only info/warn (SC2030/1, quotes) — no errors
- gh counts executed: total ready ~15, code-agent ready=6 (at time)
- Dry runs planned/exec (reconcile/queue will show tables)
- No large writes; all via patch or small
- Current .done=21 (some stale possible for closed)
- Worker processes issues but #841 itself triggers inner hermes abort (not model string match)
- Intake updated with status; proposal refined first
- Followed META R1-R11 (decomp, verify exec, contracts in labels/tests, reversible, convention match, no over-scope)
- No /ship /qa browser per CLAUDE; one implementer

## Current queue summary (executed)
6 code-agent status:ready remain (e.g. recent #844-846 hermes). Reconcile will audit any mismatch with .done. After worker restart + possible queue-all, will drain serially.

Ready for Antigravity review / integration on main (cambio urgente direct).
