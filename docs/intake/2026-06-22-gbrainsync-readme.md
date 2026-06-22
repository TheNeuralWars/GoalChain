
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

```bash
# VPS server
bash ops/hermes/install-gbrain-sync-service.sh uninstall
bash ops/hermes/install-gbrain-sync-push-cron.sh uninstall

# macOS
bash ops/hermes/install-gbrainsync-macos.sh uninstall

# Windows
powershell -ExecutionPolicy Bypass -File ops/hermes/install-gbrainsync-windows.ps1 -Uninstall
```

## Risks (low blast radius)

- New service, no other code path depends on port 8648. Healthcheck cron (#815)
  surfaces failures within 1 h.
- Push hook is best-effort — never fails the parent cron.
- No on-chain change. No secret-write. Vacuums of JSONL are deferred to the
  weekly `gbrain-vacuum.timer` (#816) in a follow-up.
