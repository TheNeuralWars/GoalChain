# xAI OAuth Re-Authentication Runbook

**Created:** 2026-06-13
**Issue:** #49 — Credential Alert: xAI OAuth missing access_token
**GitHub:** #849
**Status:** Ready for use
**Owner:** Manager / hermes-ceo

---

## Problem

xAI periodically revokes OAuth refresh tokens (SuperGrok / X Premium+).
When this happens, `hermes-xai-oauth-refresh.py` cannot auto-refresh and
the `credential-maintain` cron job logs:

```
WARN xai-oauth refresh: exit 1
```

Downstream impact:
- X-Scout loses xAI/Grok search access
- OA workers cannot use Grok models
- Any Hermes tool relying on xAI OAuth stops working

### Error signature in `~/.hermes/auth.json`

```json
"last_auth_error": {
  "provider": "xai-oauth",
  "code": "xai_refresh_failed",
  "message": "xAI token refresh failed. Response: {\"error\":\"invalid_grant\",\"error_description\":\"Refresh token has been revoked\"}",
  "reason": "runtime_refresh_failure",
  "relogin_required": true
}
```

---

## Root Cause

xAI revokes refresh tokens for security reasons: subscription changes,
device limits, policy updates, or periodic rotation. Once revoked,
**automatic refresh is impossible** — a full OAuth PKCE flow with
browser interaction is required.

---

## Solution: Re-Authentication Procedure

### Option A: Automated Script on VPS (Recommended)

The canonical script lives at `~/hermes/scripts/xai-oauth-reauth.sh`.

```bash
# 1. On your Mac — open SSH tunnel for OAuth callback
ssh -L 56121:127.0.0.1:56121 ubuntu@<VPS_IP>

# 2. On the VPS (inside that SSH session)
bash ~/hermes/scripts/xai-oauth-reauth.sh
```

The script detects VPS vs local, runs `hermes auth add xai-oauth`
with the appropriate flags, and verifies via credential-maintain.

### Option B: Direct Hermes CLI

```bash
# On VPS (requires SSH tunnel from step 1 above)
hermes auth add xai-oauth --no-browser --manual-paste

# On local Mac (browser opens automatically)
hermes auth add xai-oauth
```

### Option C: Manager WhatsApp Command

```
manager: creds status        # check current credential state
manager: creds reauth xai-oauth  # triggers guided re-auth flow
```

---

## Verification

After re-authentication, verify with:

```bash
# 1. Run credential maintenance
bash ~/hermes/scripts/hermes-credential-maintain.sh

# 2. Check logs
tail -20 ~/hermes/logs/credential-maintain.log
# Should show: "xai-oauth refresh (default + agent profiles): OK"

# 3. Quick smoke test
hermes auth status | grep xai
```

---

## Architecture Reference

### Scripts (canonical, in ~/hermes/scripts/)

| Script | Purpose |
|--------|---------|
| `hermes-xai-oauth-refresh.py` | Proactive refresh via Hermes internal API. Called by cron. |
| `hermes-credential-maintain.sh` | Scheduled maintenance: vault + xAI refresh. |
| `xai-oauth-reauth.sh` | Interactive re-auth when refresh token is revoked. |

### Cron

`credential-maintain` runs on a timer and calls
`hermes-xai-oauth-refresh.py --all-agent-profiles`. If refresh fails
with `relogin_required: true`, manual intervention via this runbook
is required.

---

## Prevention & Monitoring

1. **Proactive refresh**: The cron job refreshes tokens before expiry
2. **Alert on failure**: credential-maintain logs WARN on exit != 0
3. **Multi-profile**: `--all-agent-profiles` refreshes all 10 profiles

---

## Rollback

If re-authentication produces invalid credentials:

1. Restore from backup: `cp ~/.hermes/state-snapshots/*/auth.json ~/.hermes/auth.json`
2. Re-run this runbook from scratch
3. Escalate to Nico if xAI account-level issues persist
