# OA Proposal: Issue #49 — [OPENCODE] 🚨 Credential Alert: xAI OAuth missing access_token. Run: hermes auth

**Worker:** kappa (partition 9)
**Owner:** opencode
**Priority:** P2
**Mode:** Normal mode: committed locally to branch, validated and merged locally by reviewer.

## Issue Body
## Objective
🚨 Credential Alert: xAI OAuth missing access_token. Run: hermes auth add xai-oauth --no-browser (with ssh -L 56121:127.0.0.1:56121 on Mac if remote)

## Owner
opencode

## Priority
P2

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## Workflow (Producer-Critic Pattern)
1. **Implementer** (opencode) creates PR on branch `exp/opencode-issue-XXX`
2. **Critic Agent** reviews PR automatically (read-only, no code changes)
3. Critic posts structured review: PASS/FAIL + findings
4. If FAIL: Implementer addresses findings, pushes updates
5. If PASS: Label `status:critic_pass` → Antigravity/Nico human review
6. Merge after human approval

## Required Output (Implementer)
- Proposed file list
- Risks/regressions + rollback
- Exact test commands
- **Structured plan JSON** as FIRST output (see below)

## Required First Output: Plan JSON
Before any code changes, output this JSON to stdout:
```json
{
  "goal": "Create automated xAI OAuth re-authentication script and runbook for revoked refresh tokens",
  "issue_number": 49,
  "branch": "exp/opencode-issue-49",
  "steps": [
    {"action": "Create xAI OAuth re-auth runbook", "files": ["docs/intake/2026-06-13-xai-oauth-reauth-runbook.md"], "depends_on": []},
    {"action": "Create automated re-auth script with SSH tunnel support", "files": ["ops/hermes/scripts/xai-oauth-reauth.sh"], "depends_on": []},
    {"action": "Update credential maintenance to detect revoked tokens", "files": ["ops/hermes/scripts/hermes-credential-maintain.sh"], "depends_on": ["Create automated re-auth script with SSH tunnel support"]},
    {"action": "Add xAI OAuth re-auth to Manager SOUL.md procedures", "files": ["ops/hermes/SOUL.md"], "depends_on": []}
  ],
  "dependencies": ["hermes CLI with xai-oauth provider", "SSH access for tunnel"],
  "risks": ["SSH tunnel port conflicts", "Browser OAuth flow requires human interaction", "Revoked refresh token requires full re-auth"],
  "verification": ["Run re-auth script successfully", "Verify auth.json has valid xai-oauth tokens", "Run hermes-xai-oauth-refresh.py --all-agent-profiles", "Verify credential-maintain cron job passes"]
}
```

## Plan JSON Output (First Output)
```json
{
  "goal": "Create automated xAI OAuth re-authentication script and runbook for revoked refresh tokens",
  "issue_number": 49,
  "branch": "exp/opencode-issue-49",
  "steps": [
    {"action": "Create xAI OAuth re-auth runbook", "files": ["docs/intake/2026-06-13-xai-oauth-reauth-runbook.md"], "depends_on": []},
    {"action": "Create automated re-auth script with SSH tunnel support", "files": ["ops/hermes/scripts/xai-oauth-reauth.sh"], "depends_on": []},
    {"action": "Update credential maintenance to detect revoked tokens", "files": ["ops/hermes/scripts/hermes-credential-maintain.sh"], "depends_on": ["Create automated re-auth script with SSH tunnel support"]},
    {"action": "Add xAI OAuth re-auth to Manager SOUL.md procedures", "files": ["ops/hermes/SOUL.md"], "depends_on": []}
  ],
  "dependencies": ["hermes CLI with xai-oauth provider", "SSH access for tunnel"],
  "risks": ["SSH tunnel port conflicts", "Browser OAuth flow requires human interaction", "Revoked refresh token requires full re-auth"],
  "verification": ["Run re-auth script successfully", "Verify auth.json has valid xai-oauth tokens", "Run hermes-xai-oauth-refresh.py --all-agent-profiles", "Verify credential-maintain cron job passes"]
}
```

## Proposed File List
- `docs/intake/2026-06-13-xai-oauth-reauth-runbook.md` — Runbook for xAI OAuth re-authentication
- `ops/hermes/scripts/xai-oauth-reauth.sh` — Automated re-auth script with SSH tunnel support
- `ops/hermes/scripts/hermes-credential-maintain.sh` — Updated to detect revoked tokens and alert
- `ops/hermes/SOUL.md` — Updated Manager procedures

## Risks/Regressions + Rollback
- **Risk**: SSH tunnel port 56121 conflicts with other services
  - **Mitigation**: Script checks port availability, uses alternative if needed
- **Risk**: Browser OAuth flow requires human interaction (cannot be fully automated)
  - **Mitigation**: Script uses `--no-browser` and `--manual-paste` for headless environments
- **Risk**: Revoked refresh token requires full re-auth (cannot be recovered programmatically)
  - **Mitigation**: Runbook documents the manual steps clearly
- **Rollback**: No code changes to Hermes core; scripts are additive. Revert by removing new files.

## Exact Test Commands
```bash
# 1. Verify current auth.json shows revoked token
cat ~/.hermes/auth.json | jq '.providers["xai-oauth"].last_auth_error'

# 2. Run the re-auth script (requires human to complete OAuth in browser)
bash ops/hermes/scripts/xai-oauth-reauth.sh

# 3. Verify new tokens are valid
~/.hermes/hermes-agent/venv/bin/python3 ~/hermes/scripts/hermes-xai-oauth-refresh.py --all-agent-profiles

# 4. Run credential maintenance
bash ~/hermes/scripts/hermes-credential-maintain.sh

# 5. Check logs
tail -20 ~/hermes/logs/credential-maintain.log
```

## Workflow
- One implementer only
- Branch naming: `exp/opencode-issue-49`
- Draft PR for Antigravity/Nico review — no direct merge to `main` unless `cambio urgente`