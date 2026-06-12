# Hermes — OAuth Remote Runbook (Mac → VPS tunnel)

**VPS:** `ubuntu@89.168.20.135` (Oracle)  
**Issue:** [#95](https://github.com/TheNeuralWars/GoalChain/issues/95)  
**Applies to:** xAI Grok OAuth flow when Hermes runs headless on the VPS.

---

## Overview

xAI's Grok provider uses an OAuth 2.0 PKCE flow that opens a browser window to authorize. When Hermes runs on the VPS (headless), no browser is available — the flow must be completed on your Mac and the resulting credentials pushed to the server.

---

## One-time setup (first authorization)

### Step 1 — Complete OAuth on Mac

```bash
# On your Mac, open a Hermes session with the xai-oauth provider:
hermes chat --provider xai-oauth -q "hello"
# A browser tab will open automatically → authorize → credentials saved to ~/.hermes/auth.json
```

### Step 2 — Push credentials to VPS

```bash
# Push only the auth/env (no gateway restart needed for token refresh):
bash ops/hermes/push-hermes-mirror-to-server.sh --env-only

# Or full sync including SOUL.md and config:
bash ops/hermes/push-hermes-mirror-to-server.sh
```

### Step 3 — Verify on VPS

```bash
ssh ubuntu@89.168.20.135 "hermes chat --provider xai-oauth -q 'ping'"
# Expected: Grok responds without browser prompt
```

---

## Token refresh (when OAuth token expires)

xAI OAuth tokens expire periodically. Signs of expiry:
- Hermes logs: `auth error`, `401 Unauthorized`, or `token_expired`
- OA worker stalls on Grok model calls

**Refresh flow:**

```bash
# 1. On Mac — re-authorize:
hermes chat --provider xai-oauth -q "refresh test"
# Browser opens → re-authorize if prompted → credentials updated in ~/.hermes/auth.json

# 2. Push updated credentials to VPS:
bash ops/hermes/push-hermes-mirror-to-server.sh --env-only

# 3. Restart Hermes gateway on VPS (if needed):
ssh ubuntu@89.168.20.135 "systemctl --user restart hermes-gateway-hermes-ceo"
```

**Automated refresh** (optional — via `hermes-credential-maintain.sh`):

```bash
# On VPS — runs every 6 hours via cron:
crontab -e
# Add:
0 */6 * * * bash ~/hermes/scripts/hermes-credential-maintain.sh >> ~/hermes/logs/credential-refresh.log 2>&1
```

---

## Tunnel approach (alternative — for interactive re-auth from VPS)

If you need to trigger OAuth from the VPS directly (e.g., during a remote session):

```bash
# On your Mac — open SSH tunnel forwarding VPS port 9222 locally:
ssh -L 9222:localhost:9222 ubuntu@89.168.20.135

# On VPS (in the tunnel session) — start Hermes with DISPLAY forwarding:
BROWSER=none hermes chat --provider xai-oauth -q "hello"
# Hermes will print the OAuth URL → copy it → open manually in Mac browser
# After authorization, credentials are written to VPS ~/.hermes/auth.json automatically
```

---

## Environment variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `XAI_API_KEY` | `~/hermes/config.env` | Fallback API key (non-OAuth path) |
| `OA_MODEL` | `~/hermes/config.env` | Model string (e.g. `xai/grok-4.3`) |
| OAuth tokens | `~/.hermes/auth.json` | Written by `hermes` CLI after browser auth |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `browser not found` on VPS | Use tunnel approach above or push from Mac |
| Token push fails (SSH error) | Check connection env or `~/.ssh/config` is configured for `ubuntu@89.168.20.135` |
| Grok 401 after push | Wait 30s for gateway to pick up new `auth.json`, or `systemctl restart hermes-gateway` |
| OA worker still uses OpenCode after push | Check `OA_MODEL` in `~/hermes/config.env` — must be `xai/grok-4.3` |

---

## Related files

- [`ai_context/HERMES_SETUP.md`](../../ai_context/HERMES_SETUP.md) — Full Hermes setup guide
- [`ops/hermes/push-hermes-mirror-to-server.sh`](push-hermes-mirror-to-server.sh) — Mac→VPS sync script
- [`ops/hermes/install-hermes-mirror-mac.sh`](install-hermes-mirror-mac.sh) — VPS→Mac sync script
- [`ops/hermes/hermes-credential-maintain.sh`](hermes-credential-maintain.sh) — Automated token refresh
