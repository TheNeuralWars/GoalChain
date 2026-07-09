# OA Proposal — Issue #849

## Title
[HERMES] [intake] xAI OAuth Re-Authentication Runbook

## Source
GitHub issue #849

## Status
COMPLETED — direct main (cambio urgente), 2 commits

## Objective
Create a production runbook and automated script for re-authenticating
xAI OAuth when the refresh token is revoked by xAI (SuperGrok / X Premium+).

## Problem
xAI periodically revokes refresh tokens for security reasons. When this
happens, `hermes-xai-oauth-refresh.py` fails with `relogin_required: true`
and the `credential-maintain` cron job logs `WARN xai-oauth refresh: exit 1`.
Downstream systems (X-Scout, OA workers) lose xAI/Grok access.

## Files Implemented

| File | Purpose |
|------|---------|
| `ops/hermes/scripts/xai-oauth-reauth.sh` | Interactive re-auth script (PKCE flow + SSH tunnel) |
| `docs/intake/2026-06-13-xai-oauth-reauth-runbook.md` | Production runbook (VPS, local, Manager flows) |
| `docs/intake/issue-849.done` | Intake marker (closed) |
| `ops/hermes/hermes-xai-oauth-refresh.py` | Pre-existing proactive refresh script (no changes) |

## Security Checklist
- [x] No hardcoded IPs — `<VPS_IP>` placeholder used
- [x] No credentials, tokens, or secrets in committed files
- [x] No `.env` files created or leaked
- [x] Script uses `set -euo pipefail` for safe execution
- [x] Token preview limited to first 8 chars in logs

## Tests Executed
- `bash -n ops/hermes/scripts/xai-oauth-reauth.sh` — PASS (syntax)
- `python3 -m py_compile ops/hermes/hermes-xai-oauth-refresh.py` — PASS
- Grep for leaked secrets — CLEAN

## Risk / Rollback
- Risk: Script requires interactive TTY; cannot run in headless CI
- Rollback: `git revert 6fd53ea 96f7b6c` reverts both commits
- No webapp, API, or on-chain code touched — zero regression risk

## Commits
1. `96f7b6ce` — docs(intake): runbook + intake closure
2. `6fd53eaf` — fix(security): remove hardcoded VPS IP
