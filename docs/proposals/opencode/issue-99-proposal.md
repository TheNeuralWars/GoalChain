# OA Proposal — Issue #99

## Title
[OPENCODE] FCC: Harden smoke-devnet.sh API checks

## Source
GitHub issue #99

## Objective
## Batch
FCC batch 4/5

## Objective
Extend `goalchain_webapp/scripts/smoke-devnet.sh` to fail fast with clear errors when API health/config unreachable.

## Allowed files
- `goalchain_webapp/scripts/smoke-devnet.sh`
- `goalchain_webapp/package.json` (only if script entry needed)

## Requirements
- curl/fetch health endpoint (use API_BASE from env or default documented in script)
- Check `/api/economy/config` or health payload fields if available
- Exit code 1 + human-readable message on failure
- Keep existing build step

## Forbidden
- Webapp UI changes unless required for script only

## Verification
```bash
cd goalchain_webapp && bash scripts/smoke-devnet.sh
```
(document if live API required vs skip)

## Workflow
- Draft PR only; P1 tier

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-99` and close draft PR.
