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
- `ops/hermes/oa-control.sh`                               EDIT  status label
- `ops/hermes/oa-agent-runner.sh`                          EDIT  OA_CODE_MODEL default
- `ops/hermes/oa-worker.sh`                                EDIT  OA_CODE_MODEL default
- `ops/hermes/oa-worker-autonomous-wrapper.sh`             EDIT  OA_CODE_MODEL default
- `ops/hermes/oa-enable-handsfree.sh`                      EDIT  OA_CODE_MODEL default
- `ops/hermes/setup-hermes-runtime.sh`                     EDIT  OA_CODE_MODEL default
- `ops/hermes/config.env.example`                          EDIT  OA_CODE_MODEL value
- `ops/hermes/distribution/config.yaml`                    EDIT  provider/base_url
- `ops/hermes/HERMES_CEO_ENGINE.md`                        EDIT  doc
- `ops/hermes/DISCORD_WORKDAY_SETUP.md`                    EDIT  doc
- `ai_context/HERMES_SETUP.md`                             EDIT  doc

## Out of scope (this PR)
- Switching `polymarket_bot/nemotron_client.py` (the polymarket bot is
  decoupled from OA worker model config).
- Renaming workers, merging Greek fleet, or restarting running OA processes
  on the VPS at this commit.
- Hot-merging to `main` — explicit NO.

## Risks / regressions
- Old `opencode/nemotron-3-ultra-free` no longer used; NVIDIA NIM quota
  differs → existing workers must be restarted inside the same Hermes
  workflow loop (not done here).
- `NVIDIA_NIM_API_KEY` must be present in `~/hermes/config.env` — missing
  key ⇒ verify-script exits non-zero; OA worker falls back to mise.

## Rollback
- `git revert <merge-sha>` or `git checkout origin/main -- <files>` +
  `bash ops/hermes/setup-hermes-runtime.sh` to restore env defaults.
- Verify script can be deleted; workflow doc has no live dependencies.

## Tests run (recorded at end of execution)
- `bash -n` on every touched shell script.
- `python3 -c "import yaml..."` lint of `distribution/config.yaml`.
- Verify script invoked with no token (`expected=skipped`).
