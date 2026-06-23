# GoalChain Optimized Loop (issue #832)

Four-stage workflow after a manager approves a code change.

## Stage 1 — Manager (Hermes, `xai/grok-4.3`)
- Captures intent from Discord/WhatsApp/manual.
- Writes **structured intake**: `docs/intake/YYYY-MM-DD-<slug>.md` or a
  GitHub issue (`agent:hermes`, `status:ready`, `priority:Pn`).
- Single implementer is assigned; no overlapping file edits.

## Stage 2 — Development Worker (Hermes CEO, NVIDIA NIM)
- Branch: `exp/hermes-issue-<N>` (or `feat/*` / `fix/*`).
- Reads `CLAUDE.md`, `META_CHARTER.md`, `meta-principal.mdc`,
  `AGENT_ORCHESTRATION.md` (in that order).
- **Provider (issue #832):** `nvidia` base URL
  `https://integrate.api.nvidia.com/v1`, model
  `nvidia/nemotron-3-super-120b-a12b`. Auth via `NVIDIA_NIM_API_KEY` in
  `~/hermes/config.env`.
- Pre-flight: `bash ops/hermes/verify-nvidia-nim-provider.sh` (must not
  return 0-fail). Use `--live` only when manually confirming the change.
- Pushes branch + opens **draft PR** (no merge to `main`).

## Stage 3 — Reviewer (Antigravity / Nico)
- Pre-merge: `gstack /review` then `/investigate` on draft PR.
- Antigravity is integration owner; on approval triggers merge.

## Stage 4 — Automation (after merge)
- Crons resume (`oa-scout-*.timer`), healthcheck every 10 min,
  GBrain captures the issue/PR pair via `install-gbrain-sync-push-cron.sh`.
- Manager posts the diff to `#goalchain-dev`; no `cambio urgente` needed.
- Manager archives the intake as `status:done` with PR link.

## Failure handling
- If `verify-nvidia-nim-provider.sh --live` returns non-zero: stop.
  Retry only after rotating the key. OA worker must NOT push.
- If `status:blocked`, do not auto-retry; flag back to Manager.
