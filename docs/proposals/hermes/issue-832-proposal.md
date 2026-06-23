# OA Proposal — Issue #832 — Provider & Workflow Optimization

## Title
[HERMES] Actualización de proveedor de modelo y optimización de workflow

## Source
GitHub issue #832 (P0, agent:hermes, status:ready, source:manager).
Branch: `exp/hermes-issue-832` (Hermes CEO branch policy).
Mode: **draft PR** — `cambio urgente` not present in the issuing message.

## Objective
Switch the OA code engine from `opencode/nemotron-3-ultra-free` (provider
`nous`, base `https://inference-api.nousresearch.com/v1`) to the **NVIDIA
NIM** provider running `nvidia/nemotron-3-super-120b-a12b` (base
`https://integrate.api.nvidia.com/v1`). Document the optimized 4-stage loop
(Manager → Dev → Reviewer → Automation) and ship a small verification script.

## Allowed files (this PR)
- `docs/proposals/hermes/issue-832-proposal.md`            REFRESH
- `ops/hermes/verify-nvidia-nim-provider.sh`               NEW   dev-worker smoke
- `docs/hermes-workflow/optimized-loop.md`                 NEW   workflow doc
- `ops/hermes/oa-control.sh`                               EDIT  auth subcommand
- `ops/hermes/oa-agent-runner.sh`                          EDIT  OA_CODE_MODEL
- `ops/hermes/oa-worker.sh`                                EDIT  OA_CODE_MODEL
- `ops/hermes/oa-worker-autonomous-wrapper.sh`             EDIT  OA_CODE_MODEL
- `ops/hermes/oa-enable-handsfree.sh`                      EDIT  OA_CODE_MODEL
- `ops/hermes/setup-hermes-runtime.sh`                     EDIT  OA_CODE_MODEL
- `ops/hermes/config.env.example`                          EDIT  OA_CODE_MODEL
- `ops/hermes/distribution/config.yaml`                    EDIT  provider/base_url
- `ops/hermes/HERMES_CEO_ENGINE.md` `DISCORD_WORKDAY_SETUP.md` `ai_context/HERMES_SETUP.md`   EDIT  docs

## Out of scope
- `polymarket_bot/nemotron_client.py` stays decoupled.
- Renaming workers / restarting the running OA fleet.
- Hot-merge to `main` — `cambio urgente` keyword NOT present.

## Risks / rollback
- See PR body. `git revert <merge-sha>` restores pre-#832 defaults.

## Tests run (executed 2026-06-23)
- `bash -n` on all 7 touched shell scripts → pass.
- YAML parse of `distribution/config.yaml` → pass.
- `verify-nvidia-nim-provider.sh` (no key) → SKIP, exit 0.
- `verify-nvidia-nim-provider.sh` (env key) → GET /models 200.
- `verify-nvidia-nim-provider.sh --live` (correct model) → endpoint accepts model, key auth surfaces 401 cleanly with redacted output.
