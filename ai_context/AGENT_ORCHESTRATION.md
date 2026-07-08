# Agent Orchestration (minimal for label contract per issue #841)

## GitHub Label Contract for OA/FCC (oa-worker.sh)
- `status:ready` + `agent:hermes|antigravity|grok` : eligible for pick_next.
- Dispatch: remove ready, add in_progress.
- **Success**: (exit 0 and no error strings in log): remove ready/in_progress, add `status:done`; THEN `touch .../issue-N.done`. Comment with tier, PR or "direct-main (cambio urgente)", log.
- **model_not_supported**: comment explaining, remove in_progress add `status:ready` (requeue retry); **DO NOT** touch .done.
- Other failure: add `status:blocked`; no .done.
- pick_next and reconcile respect .done OR status:done as terminal.
- Reconcile (oa-reconcile-queue.sh): if .done but no evidence (branch/PR/main git log "issue #N") then rm stale .done.
- Source of truth: GitHub labels + evidence; local .done only optimization.
- Updated by: oa-worker.sh (primary), oa-reconcile-queue.sh, oa-queue-all-agents.sh.
- Owner: Antigravity (merge/integration).

See CLAUDE.md, ops/hermes/oa-worker.sh for impl. One paragraph added per spec.
