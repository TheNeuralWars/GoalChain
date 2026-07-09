# ADR: Live-Sync Architecture — Plan A Selected, SSH Admin Rejected

**Date:** 2026-06-22
**Status:** Accepted
**Issue:** #854 (intake), #827 (implementation), #828 (SSH policy)
**Decision makers:** Nico (owner), Hermes Manager (security gate)

## Context

GoalWorld needs the Windows Mini PC (`100.101.209.8` via Tailscale) to
sync its GBrain knowledge base with the VPS. Three plans were evaluated.

## Options

### Plan A — Scheduled Task Polling (SELECTED)
- Windows/Mac clients poll `GET /sync/since/<ts>` on VPS port 8648.
- Installers: `install-gbrainsync-windows.ps1`, `install-gbrainsync-macos.sh`.
- No admin SSH required. Client runs as normal user.
- Implemented in branch `exp/gbrainsync-installers-only`, merged via #827.

### Plan B — Reverse Tunnel Win→VPS (DEFERRED)
- Windows initiates SSH tunnel to VPS (outbound only).
- Gated by: Nico + Lucas ack, 24h wait, time-box.
- Tracked in issue #828; requires explicit informed consent.

### Plan C — Admin SSH VPS→Win (REJECTED)
- VPS Hermes connects to Windows via `OpenSSH.Server` with admin keys.
- **Rejected by Hermes Manager** because:
  - VPS shares host with Discord/WhatsApp/Slock daemons — not single-purpose.
  - "Te autorizo a todo" in one chat message is uninformed override.
  - Plan A fully satisfies the actual goal without admin access.

## Decision

**Plan A** is the production path. Plan B is contingency with formal
consent gates. Plan C is permanently rejected unless security posture
fundamentally changes (dedicated tooling VM, multi-party sign-off).

## Rebuttal Record

Nico requested Plan C via WhatsApp self-chat. Hermes Manager refused per
safe-by-default policy. After explanation, Nico confirmed Plan A and
agreed to defer Plan B until Lucas is present. Full log preserved in
`docs/intake/2026-06-22-live-sync-decision.md`.

## Consequences

- Clients poll; no inbound SSH to any user machine.
- Plan B activation requires comment on #828 with informed consent + 24h wait.
- Policy saved to Hermes memory (`~/.hermes/state.db`).
