# OA Proposal — Issue #860

## Title
[HERMES] [intake] VPS server

## Source
GitHub issue #860

## Objective

Deploy a self-hosted gbrain-sync server on the VPS (port 8648) to receive and persist brain-change events from the Mac via Tailscale. Enables real-time sync between the local dev environment (MacBook Pro) and the cloud Hermes workers.

## OA Plan
- [x] Analyze repository constraints and META alignment.
- [x] Verify existing files: gbrain-sync-server.py, gbrain-sync.service, gbrain-push.sh, gbrainsync-client.sh, install scripts
- [x] Fix service ExecStart path (/data/apps/GoalChain vs %h/hermes/workspace/GoalChain)
- [x] Create install-gbrain-sync-service.sh (was missing)
- [ ] Run local verification: bash install-gbrain-sync-service.sh install + smoke test
- [ ] Commit with "cambio urgente" (direct to main)

## Verification (executed on the VPS 2026-06-22)

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
docs/intake/2026-06-22-gbrainsync-readme.md  (this file)
docs/proposals/hermes/issue-827-proposal.md  proposal + plan
```

## Rollback

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #860
