# OA Proposal — Issue #860

## Title
[HERMES] [intake] VPS server

## Source
GitHub issue #860, auto-dispatched from docs/intake/2026-06-22-gbrainsync-readme.md

## Objective
Close out the gbrain-sync VPS server intake by fixing all missing/broken files
from the original issue #827 delivery and verifying the service is functional.

## Current state (audit)
| File | Status |
|------|--------|
| ops/hermes/gbrain-sync-server.py | OK (213 lines, stdlib HTTP) |
| ops/hermes/gbrain-sync.service | OK (systemd user unit) |
| ops/hermes/install-gbrainsync-server.sh | OK (idempotent installer) |
| ops/hermes/install-gbrain-sync-service.sh | NEW symlink → install-gbrainsync-server.sh |
| ops/hermes/gbrain-push.sh | BROKEN — missing shebang + header (starts at section 3) |
| ops/hermes/install-gbrain-sync-push-cron.sh | OK |
| ops/hermes/gbrainsync-client.sh | OK (53 lines, polling client) |
| ops/hermes/install-gbrainsync-macos.sh | PLACEHOLDER (downloads from example.com) |
| ops/hermes/gbrainsync-client.ps1 | MISSING |
| ops/hermes/install-gbrainsync-windows.ps1 | PLACEHOLDER (downloads from example.com) |
| docs/intake/2026-06-22-gbrainsync-readme.md | OK |

## OA Plan

- [done] Read CLAUDE.md, META_CHARTER.md, AGENT_ORCHESTRATION.md
- [done] Audit all files from issue #860 manifest
- [done] Create symlink install-gbrain-sync-service.sh → install-gbrainsync-server.sh
- [done] Fix gbrain-push.sh (add shebang + header + env vars + brace expansion bug)
- [done] Rewrite install-gbrainsync-macos.sh (proper LaunchAgent for client)
- [done] Create gbrainsync-client.ps1 (Windows polling client)
- [done] Rewrite install-gbrainsync-windows.ps1 (Scheduled Task for client)
- [done] Run server smoke test (health 200, push 202, sync/since 3 records)
- [done] Commit to main (cambio urgente) — 748df9eb
- [done] Close intake marker — aa61ad59

## Risks / regressions
- Low blast radius: new service files, nothing depends on port 8648 elsewhere
- Push hook is best-effort — never blocks parent cron
- macOS/Windows installers set up polling clients only (no daemon)
- No secrets touched, no .env reads, no on-chain changes

## Rollback
```bash
# VPS server
systemctl --user disable --now gbrain-sync.service
rm -f ~/.config/systemd/user/gbrain-sync.service
# macOS
launchctl unload ~/Library/LaunchAgents/com.goalchain.gbrainsync.plist
rm -f ~/Library/LaunchAgents/com.goalchain.gbrainsync.plist
# Windows
Unregister-ScheduledTask -TaskName 'GBrainSync' -Confirm:$false
```
