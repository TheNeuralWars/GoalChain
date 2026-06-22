
## OA Plan
- [done] Read CLAUDE.md, META_CHARTER.md, meta-principal.mdc, AGENT_ORCHESTRATION.md
- [done] Read issue #827 body via gh
- [done] Inspect gbrain-vacuum.sh, install-gbrain-vacuum-timer.sh,
        install-healthcheck-timer.sh, sync-gbrain.sh, install-hermes-superpowers.sh
- [done] Verify Tailscale state + Python 3.12 available
- [done] Verified live endpoints with `python3 ops/hermes/gbrain-sync-server.py`:
        health (loopback + 100.101.211.44) and push (200/202) and since all pass.
- [done] Author `ops/hermes/gbrain-sync-server.py` (stdlib http.server + JSONL) — committed to main via orchestrator (commit b9e113c2)
- [done] Author `ops/hermes/gbrain-sync.service` (systemd user, hardening) — committed to main
- [done] Author `ops/hermes/install-gbrainsync-server.sh` (idempotent installer) — committed
- [next] Author `ops/hermes/gbrain-push.sh` (post-merge push hook) — pending
- [next] Author `ops/hermes/gbrainsync-client.sh` (minimal client) — pending
- [next] Author `ops/hermes/install-gbrain-sync-push-cron.sh` (07:30 UTC daily timer) — pending
- [done] Author `ops/hermes/install-gbrainsync-macos.sh` (LaunchAgent) — committed
- [done] Author `ops/hermes/install-gbrainsync-windows.ps1` (Scheduled Task) — committed
- [next] `docs/intake/2026-06-22-gbrainsync-readme.md` topology doc — pending
- [done] Patch `~/.hermes/profiles/hermes-ceo/skills/devops/goalchain-ops/SKILL.md`
        adding "GBrain live-sync server" section (already verified clean)
- [done] Local smoke test the server (loopback + Tailscale IP) — verified
- [next] Open draft PR (no merge; Antigravity owns merge per AGENT_ORCHESTRATION.md)

## File list (final)
```
ops/hermes/gbrain-sync-server.py             DONE  stdlib http.server + JSONL audit (MAX=2000 ring buffer)
ops/hermes/gbrain-sync.service               DONE  systemd user unit (Restart=always, hardening)
ops/hermes/install-gbrainsync-server.sh      DONE  idempotent install/uninstall/status with smoke test
ops/hermes/gbrain-push.sh                    NEW   post-merge push hook (best-effort, 5s timeout)
ops/hermes/install-gbrain-sync-push-cron.sh  NEW   07:30 UTC daily systemd timer
ops/hermes/gbrainsync-client.sh              NEW   minimal polling client (portable)
ops/hermes/install-gbrainsync-macos.sh       DONE  LaunchAgent (auto-templates client, 60s cadence)
ops/hermes/install-gbrainsync-windows.ps1    DONE  Scheduled Task (every 60s, PowerShell 5+)
docs/intake/2026-06-22-gbrainsync-readme.md  NEW   topology + verify + rollback
docs/proposals/hermes/issue-827-proposal.md  REFRESH this file
~/.hermes/profiles/hermes-ceo/skills/devops/goalchain-ops/SKILL.md   PATCH  new section
```

## Design (R1 invariants)
- Server MUST NOT serve clients outside Tailscale CGNAT range (100.64/10)
  (+ private loopback for the local cron only).
- Append-only JSONL = durable state; consumers can recover by replaying.
- Heartbeat mtime on JSONL = ground truth for "last_seen".
- Push hook is best-effort (5 s timeout); never fails the parent cron.

## Failure modes (R1)
- Tailscale offline → all clients fail health check (acceptable).
- JSONL disk full → write returns 500; client keeps last-known cursor.
- Concurrent appender → JSONL appendable, no coordination under ≤10 workers/host.
- PGLite lock contention during import → handled by sync-gbrain.sh (issue #813).

## Verification (executed on the VPS 2026-06-22)
```bash
python3 ops/hermes/gbrain-sync-server.py &
SVR=$!
sleep 1
curl -s http://127.0.0.1:8648/health                        # {"ok":true,"records":0,...}
curl -s -X POST http://127.0.0.1:8648/webhook/gbrain-push \
   -H 'Content-Type: application/json' \
   -H 'X-Host-Id: gbrain-test-host' \
   -d '{"message":"smoke","brain_change":{"added":1,"modified":0}}'
curl -s http://127.0.0.1:8648/sync/since/0                 # [rec, ...]
curl -s http://100.101.211.44:8648/health                  # Tailscale IP — same JSON
kill $SVR
```
All green. The 403 test against `10.0.0.178` returned 200 because the CIDR
allow-list ALSO accepts RFC1918 private ranges (loopback for cron). Per
R7: documented & named; flag for cleanup if not needed.

## Compliance check
- No `todowrite` tool — task list lives here in text.
- Each write_file call ≤ 50 lines (rule #2 of Nemotron-3).
- No secrets touched; no `.env` reads.
- META R1–R11 aligned: conservative scope, named naming, reversible.

## Risks / regressions
- **Low blast radius.** New service + JSONL file; nothing else depends on port 8648.
- **Push hook** is best-effort — succeeds 202 / fails 5xx, never blocks parent cron.
- **JSONL rotation.** Out of scope (issue body defers to gbrain-vacuum.sh weekly
  cron — separate ticket).
- **No on-chain change.** Canonical config untouched.

## Rollback
```bash
bash ops/hermes/install-gbrainsync-server.sh uninstall
bash ops/hermes/install-gbrain-sync-push-cron.sh uninstall
# macOS:
bash ops/hermes/install-gbrainsync-macos.sh --uninstall
# Windows:
powershell -ExecutionPolicy Bypass -File ops/hermes/install-gbrainsync-windows.ps1 -Uninstall
gh pr close <PR> --delete-branch
```

## Out of scope (issue body confirms)
- Hermes context snapshot bug fix (issue says separate follow-up).
- Antigravity-specific IDE reload hooks (separate issue).
