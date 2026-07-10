# OA Proposal — Issue #859
## Handoff Antigravity — Hermes + OpenClaw + Voice (goalworld)

## Source
GitHub issue #859 (source: `docs/intake/2026-05-23-antigravity-hermes-openclaw-handoff.md`)

## Status
**COMPLETED** — Antigravity server-side ops done; FCC code-side handoff documented here.

## Background

This issue is a **handoff record** from Antigravity to FCC/Hermes CEO.
The actual implementation was server-side ops on `178.105.148.109`.
Allowed files: server-only (`~/.openclaw/openclaw.json`, `~/.openclaw/devices/*`).
No code changes to the GoalChain repo were required.

## Component Status (as of 2026-05-23 handoff)

| Componente | Status | Notes |
|------------|--------|-------|
| Hermes sync/digest | OK | `~/hermes`, 24/7 scripts |
| OpenClaw gateway | OK | `Connectivity probe: ok` at `127.0.0.1:18789` |
| xAI OAuth (Grok) | OK | `xai/grok-4.3` or `grok-build` |
| Device pairing panel | OK | Fixed via scopes in `~/.openclaw/devices/*.json` |
| ngrok tunnel | PENDING | Must run in tmux: `ngrok http 3334` -> `skyrocket-femur-endpoint.ngrok-free.dev` |
| Voice Call plugin | DEFERRED | Twilio credentials pending user input |

## Remaining Server-Side Task

**ngrok in tmux** (requires Antigravity or Nico SSH access to `178.105.148.109`):

```bash
# On VPS — start ngrok in a persistent tmux session:
tmux new -s ngrok -d
tmux send-keys -t ngrok 'ngrok http 3334' Enter

# Verify:
curl https://skyrocket-femur-endpoint.ngrok-free.dev/status

# To auto-restart on reboot, add to crontab:
@reboot tmux new -s ngrok -d 'ngrok http 3334'
```

## Files Changed (by Antigravity on server)

These files are NOT in the repo — server-only at `~/.openclaw/`:
- `~/.openclaw/openclaw.json` — OpenClaw config (gateway, providers, device scopes)
- `~/.openclaw/devices/*.json` — Device pairing scopes

## Reference Documents (in repo)

| File | Purpose |
|------|---------|
| `ops/hermes/OAUTH_REMOTE.md` | xAI OAuth tunnel approach (Mac <-> VPS) |
| `ops/hermes/setup-tunnel-xai.sh` | Cloudflare tunnel + xAI setup (OpenClaw gateway) |
| `ops/hermes/HERMES_CEO_ENGINE.md` | Current Hermes CEO architecture (post-FCC) |
| `ai_context/AGENT_ORCHESTRATION.md` | Label contract, merge ownership |

## Risks / Rollback

- **Risk**: No repo code changes — nothing to regress.
- **Rollback**: N/A (server-side ops already completed by Antigravity).
- **Residual**: ngrok tunnel is not persisted across server reboots without cron entry.

## Test Commands (for ngrok when active)

```bash
# Verify ngrok tunnel is live:
curl -s https://skyrocket-femur-endpoint.ngrok-free.dev/ | head -5

# Verify OpenClaw is reachable through tunnel:
opencode providers list 2>&1 | grep -i xai

# Check Hermes CEO engine:
hermes status 2>&1 | head -20
```

## Intake Marker

Intake file (server-side): `docs/intake/2026-05-23-antigravity-hermes-openclaw-handoff.md`
No `.done` marker in repo (intake file not present in this codebase — server-only).

## Branch / Merge Strategy

Working on `main` (Nico directive: DIRECT MAIN MODE). No feature branch.
No code changes to merge — this proposal IS the handoff documentation.

---

## Implementation Notes (FCC code agent perspective)

After reviewing the full codebase and ops scripts:

1. **No repo code changes required** — this is an ops handoff, not a coding issue.
2. **HERMES_CEO_ENGINE.md** is the canonical architecture doc (post-FCC migration, issue #832).
3. **setup-tunnel-xai.sh** already handles the Cloudflare tunnel -> OpenClaw gateway path.
4. **OA_REMOTE.md** covers xAI OAuth remote flow (Mac <-> VPS tunnel).
5. The ngrok item uses ngrok-free.dev subdomain — different from the Cloudflare approach
   in `setup-tunnel-xai.sh`; both can coexist (ngrok on port 3334, cloudflared on 18789).

## Summary

- Antigravity completed the server-side OpenClaw + Hermes integration on `178.105.148.109`.
- FCC/Hermes CEO role: document, verify, and flag remaining items.
- Remaining: ngrok in tmux (requires SSH access to VPS) + Twilio voice (deferred pending user creds).
- No regression risk to the GoalChain codebase.
- Proposal complete. Handoff closed.