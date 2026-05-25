# OA Proposal — Issue #95

## Title
[OPENCODE] FCC: OAuth remote runbook (Mac→VPS tunnel)

## Source
GitHub issue #95

## Objective
## Batch
FCC batch 1/5 — Nico requested full queue via Cursor Manager.

## Objective
Create `ops/hermes/OAUTH_REMOTE.md` documenting xAI Grok OAuth when Hermes runs on VPS `178.105.148.109`.

## Allowed files
- `ops/hermes/OAUTH_REMOTE.md` (new)
- `ai_context/HERMES_SETUP.md` (link only)
- `ai_context/AGENT_TOOLS_GUIDE.md` (link only)

## Content required
1. SSH tunnel: `ssh -N -L <port>:127.0.0.1:<port> goalchain@178.105.148.109` — port must match redirect_uri in authorize URL (often 56121).
2. Order: tunnel first → `hermes auth add xai-oauth --no-browser` → open URL on Mac → success on VPS.
3. Manual paste: paste FULL callback URL including `code=` AND `state=` (not code alone).
4. Verify: `hermes auth status xai-oauth`, `systemctl --user restart hermes-gateway`.
5. Credential timer: `goalchain-credential-maintain.timer`, log `~/hermes/logs/credential-maintain.log`.

## Out of scope
- Code changes, on-chain, economy config

## Verification
- Markdown renders; links valid

## Workflow
- Branch `exp/opencode-issue-<N>`
- Draft PR only

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-95` and close draft PR.
