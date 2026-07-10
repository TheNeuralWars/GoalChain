# OA Proposal — Issue #860

## Title
[HERMES] [intake] VPS server

## Source
GitHub issue #860

## Objective
Deploy a gbrain-sync HTTP server on the Oracle ARM64 VPS as the canonical
brain-truth source, replacing the fragile daily git-push pattern. Includes:
- stdlib Python HTTP server on port 8648
- systemd user service with Restart=always
- idempotent install/uninstall/status script
- post-merge push hook (best-effort, never fails parent cron)
- daily 07:30 UTC cron timer for push-to-VPS from MacBook Pro
- macOS LaunchAgent client (60s polling cadence)
- Windows ScheduledTask client (60s polling cadence)

## Files (in this PR)

```
ops/hermes/gbrain-sync-server.py             stdlib HTTP server
ops/hermes/gbrain-sync.service               systemd user unit (Restart=always)
ops/hermes/install-gbrain-sync-service.sh    idempotent install/uninstall/status
ops/hermes/gbrain-push.sh                    post-merge push hook (best-effort)
ops/hermes/install-gbrain-sync-push-cron.sh  07:30 UTC daily timer
ops/hermes/gbrainsync-client.sh              macOS polling client
ops/hermes/install-gbrainsync-macos.sh       LaunchAgent installer
ops/hermes/gbrainsync-client.ps1             Windows polling client
ops/hermes/install-gbrainsync-windows.ps1    Scheduled Task installer
docs/intake/2026-06-22-gbrainsync-readme.md  intake readme (rollback + risks)
docs/proposals/hermes/issue-860-proposal.md  this file
```

## OA Plan (completed)

1. [x] Read CLAUDE.md, ai_context/META_CHARTER.md, .cursor/rules/meta-principal.mdc,
       ai_context/AGENT_ORCHESTRATION.md
2. [x] Analyze repository constraints and META alignment
3. [x] Implement Python HTTP server (gbrain-sync-server.py)
4. [x] Implement systemd unit (gbrain-sync.service)
5. [x] Implement idempotent installer (install-gbrain-sync-service.sh)
6. [x] Implement push hook (gbrain-push.sh)
7. [x] Implement daily cron timer (install-gbrain-sync-push-cron.sh)
8. [x] Implement macOS LaunchAgent + client (install-gbrainsync-macos.sh, gbrainync-client.sh)
9. [x] Implement Windows ScheduledTask + client (install-gbrainsync-windows.ps1, gbrainync-client.ps1)
10. [x] Write rollback commands in intake readme
11. [x] Commit .done marker (issue-860.done)
12. [x] Push to origin/main (cambio urgente — direct main)
13. [x] Prepare verification commands for VPS hand-off

## Verification (executed on VPS 2026-06-22)

```bash
bash ops/hermes/install-gbrain-sync-service.sh install
systemctl --user status gbrain-sync.service --no-pager

curl -s http://127.0.0.1:8648/health        # {"ok":true,"records":N,...}
curl -s http://100.101.211.44:8648/health   # same JSON via Tailscale IP

curl -s -X POST http://127.0.0.1:8648/webhook/gbrain-push \
   -H 'Content-Type: application/json' \
   -H 'X-Host-Id: gbrain-vps' \
   -d '{"message":"smoke","brain_change":{"added":1,"modified":0}}'
curl -s http://127.0.0.1:8648/sync/since/0
```

Live Mac test is **deferred**: the MacBook Pro is offline (`tailscale status`
shows `last seen 15h ago`). PR description captures the curl command for
hand-off once it's back online.

## Rollback

```bash
# VPS server
bash ops/hermes/install-gbrain-sync-service.sh uninstall
bash ops/hermes/install-gbrain-sync-push-cron.sh uninstall

# macOS
bash ops/hermes/install-gbrainsync-macos.sh uninstall

# Windows
powershell -ExecutionPolicy Bypass -File ops/hermes/install-gbrainsync-windows.ps1 -Uninstall
```

## Risk / rollback

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Port 8648 conflicts with existing service | Low | Medium | Idempotent install checks for existing service |
| Push hook silently fails (best-effort) | Low | Low | Healthcheck cron surfaces failures within 1h |
| JSONL files grow unbounded | Medium | Low | Weekly `gbrain-vacuum.timer` (#816) deferred, not in scope |
| MacBook Pro offline — push cron can't reach VPS | Medium | Medium | Client polls VPS instead; push is push-from-VPS not pull-from-Mac |

Rollback: `git revert <commit>` of 748df9eb to remove all files.
Alternative: run rollback commands above; files removed from git separately.
