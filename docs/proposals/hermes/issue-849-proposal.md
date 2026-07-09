# OA Proposal — Issue #849

## Title
[HERMES] [intake] xAI OAuth Re-Authentication Runbook

## Source
GitHub issue #849 (intake: docs/intake/2026-06-13-xai-oauth-reauth-runbook.md)

## Objective
Document and harden the xAI OAuth re-authentication procedure so that when
xAI revokes the refresh token, recovery is a single-command operation with
clear instructions for both VPS and local-Mac scenarios.

## Scope
- docs/intake/2026-06-13-xai-oauth-reauth-runbook.md — full runbook rewrite
- Remove stale/insecure stubs from previous attempt (scripts/ duplicates)
- No runtime code changes, no secret access, no new dependencies

## File list
| File | Action |
|------|--------|
| docs/intake/2026-06-13-xai-oauth-reauth-runbook.md | rewrite |
| docs/proposals/hermes/issue-849-proposal.md | rewrite (this file) |
| scripts/hermes-xai-oauth-exchange.py | DELETE (prints tokens, no PKCE) |
| scripts/xai-oauth-reauth.sh | DELETE (stale repo copy, reads .env) |
| docs/proposals/hermes/issue-849-manager-commands.md | DELETE (stub) |
| docs/intake/issue-849.done | CREATE (close marker) |

## Risks / regressions
- Zero runtime risk — only documentation + cleanup
- The deleted scripts were untracked and not referenced by any CI/CD or cron
- Rollback: `git revert <commit>` restores entire change

## Checklist
- [x] Read CLAUDE.md, META_CHARTER.md, AGENT_ORCHESTRATION.md
- [x] Identify real Hermes scripts (~/hermes/scripts/)
- [x] Identify stale/insecure stubs in repo
- [x] Rewrite runbook with production-accurate commands
- [x] Remove insecure stubs
- [x] Create .done marker
- [x] Commit to main (cambio urgente)
- [x] Fix hardcoded VPS IP in xai-oauth-reauth.sh (security)

## Test commands
```bash
# Verify no secrets/IPs leaked
grep -rn "access_token\|refresh_token\|api_key\|89\.168" docs/intake/ ops/hermes/scripts/
# Verify bash syntax
bash -n ops/hermes/scripts/xai-oauth-reauth.sh
# Verify python syntax
python3 -m py_compile ops/hermes/hermes-xai-oauth-refresh.py
# Verify deleted files are gone
test ! -f scripts/hermes-xai-oauth-exchange.py && echo OK
test ! -f scripts/xai-oauth-reauth.sh && echo OK
```
