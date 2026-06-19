# xAI OAuth Re-Authentication Runbook
**Created:** 2026-06-13
**Issue:** #49 — Credential Alert: xAI OAuth missing access_token
**Status:** Ready for use
**Owner:** Manager / opencode

---

## Problem
The xAI OAuth refresh token has been revoked by xAI (SuperGrok / X Premium+). This causes:
- `hermes-xai-oauth-refresh.py` to fail with `relogin_required: true`
- `credential-maintain` cron job to log `WARN xai-oauth refresh: exit 1`
- Automated systems (X-Scout, OA workers) to lose xAI/Grok access

**Error signature in `~/.hermes/auth.json`:**
```json
"last_auth_error": {
  "provider": "xai-oauth",
  "code": "xai_refresh_failed",
  "message": "xAI token refresh failed. Response: {\"error\":\"invalid_grant\",\"error_description\":\"Refresh token has been revoked\"}",
  "reason": "runtime_refresh_failure",
  "relogin_required": true,
  "at": "2026-06-05T00:47:40.245281+00:00"
}
```

---

## Root Cause
xAI periodically revokes refresh tokens for security (subscription changes, device limits, policy updates). When this happens, **automatic refresh is impossible** — a full OAuth PKCE flow with browser interaction is required.

---

## Solution: Re-Authentication Procedure

### Option A: Automated Script (Recommended)
```bash
# On the VPS (or local machine with SSH tunnel)
bash ~/hermes/scripts/xai-oauth-reauth.sh
```
The script will:
1. Check current auth.json status
2. Set up SSH tunnel if running remotely (prompts for Mac command)
3. Run `hermes auth add xai-oauth --no-browser --manual-paste`
4. Guide you through browser OAuth on https://auth.x.ai
5. Save new tokens to auth.json
6. Verify with credential maintenance

### Option B: Manual Steps

#### If running locally (Mac/Linux with browser):
```bash
# 1. Ensure hermes CLI is available
export PATH="$HOME/.local/bin:$PATH"

# 2. Run OAuth flow (opens browser automatically)
hermes auth add xai-oauth

# Or without auto-browser (for headless/CI):
hermes auth add xai-oauth --no-browser --manual-paste
```

#### If running on remote VPS (Oracle Cloud):
**On your Mac (local machine):**
```bash
# Set up SSH tunnel for OAuth callback (port 56121)
ssh -L 56121:127.0.0.1:56121 ubuntu@89.168.20.135
# Keep this terminal open!
```

**On the VPS (in another terminal):**
```bash
# Run OAuth with no-browser + manual-paste
hermes auth add xai-oauth --no-browser --manual-paste
```

**Then:**
1. The VPS command will print an authorization URL like:
   ```
   Open this URL in your browser: https://auth.x.ai/oauth2/authorize?client_id=...&redirect_uri=http://127.0.0.1:56121/callback&...
   ```
2. Copy that URL, open in your **local Mac browser**
3. Complete the xAI login/authorization
4. After redirect, you'll land on `http://127.0.0.1:56121/callback?code=...&state=...` (this works because of the SSH tunnel)
5. Copy the **full callback URL** from your browser address bar
6. Paste it back into the VPS terminal where `hermes auth add` is waiting
7. Tokens will be saved to `~/.hermes/auth.json`

---

## Verification
After re-authentication, run:
```bash
# 1. Check tokens are valid
~/.hermes/hermes-agent/venv/bin/python3 ~/hermes/scripts/hermes-xai-oauth-refresh.py --all-agent-profiles
# Should output: OK [default] xai-oauth refreshed or still valid (token preview xxx...)

# 2. Run full credential maintenance
bash ~/hermes/scripts/hermes-credential-maintain.sh

# 3. Check logs
tail -20 ~/hermes/logs/credential-maintain.log
# Should show: xai-oauth refresh (default + agent profiles): OK
```

---

## Automation & Monitoring

### Cron Job (Already Exists)
```bash
# Every 15 minutes via systemd timer: goalchain-credential-maintain.timer
# Runs: ~/hermes/scripts/hermes-credential-maintain.sh
# Logs: ~/hermes/logs/credential-maintain.log
```

### Alerting
The updated `hermes-credential-maintain.sh` now detects `relogin_required` and:
1. Logs `ALERT: xai-oauth relogin_required — run xai-oauth-reauth.sh`
2. Sends WhatsApp alert to Nico (via `goalchain-alpha-push` webhook)

### Manager WhatsApp Commands
```bash
# Check credential status
manager: creds status

# Trigger re-auth (runs the script)
manager: creds reauth xai-oauth
```

---

## Rollback / Recovery
If re-auth fails:
1. **Delete corrupted xai-oauth state:**
   ```bash
   hermes auth remove xai-oauth loopback_pkce
   # Or manually edit ~/.hermes/auth.json to remove providers.xai-oauth block
   ```
2. **Re-run re-auth from scratch**

---

## References
- Hermes xAI OAuth docs: https://hermes-agent.nousresearch.com/docs/guides/xai-grok-oauth
- OAuth over SSH: https://hermes-agent.nousresearch.com/docs/guides/oauth-over-ssh
- GoalChain SOUL.md: `ops/hermes/SOUL.md`
- Issue #49: [OPENCODE] Credential Alert