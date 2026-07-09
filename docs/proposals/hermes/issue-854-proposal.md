# OA Proposal — Issue #854

## Title
[HERMES] [intake] 2026-06-22 live-sync decision + SSH-admin rebuttal log

## Source
GitHub issue #854

## Objective
## Objective
# 2026-06-22 live-sync decision + SSH-admin rebuttal log

## TL;DR

- Plan A (Scheduled Task polling) continues. Issue #827 + readiness branch
  `exp/gbrainsync-installers-only` already open. No admin SSH.
- Plan B (reverse tunnel Win→VPS) reserved for later, gated by:
  Nico + Lucas ack, 24h wait, time-box.
- Plan C (admin SSH VPS→Win) **rejected by Hermes Manager** even after
  Nico said "te autorizo a todo". Issue #828 documents the policy.

## Why the rebuttal

Nico asked by WhatsApp self-chat to give Hermes (VPS) total admin control over
his Windows Mini PC at `100.101.209.8` (tailscale) via:

1. Install `OpenSSH.Server` on the Mini PC.
2. Add VPS `id_*.pub` to `C:\ProgramData\ssh\administrators_authorized_keys`.
3. Run administrative `powershell.exe` from VPS over SSH.

Hermes Manager refused because:

- VPS Hermes shares the host with Discord/WhatsApp/Slock daemons — a credential
  there is not a single-purpose tool.
- "Te autorizo a todo" in a single chat message is exactly the kind of
  un-informed override that policy requires us to refuse.
- The actual goal (Win PC syncing brain) is fully satisfied by Plan A.

After explanation, Nico confirmed: stay on Plan A; eventually open Plan B with
Lucas present.

## What was done this turn (verified, not invented)

| Action | Status | Handle |
|--------|--------|--------|
| Patch `hermes-context.sh` to fix GBrain false-"not installed" | done | `/home/ubuntu/hermes/scripts/hermes-context.sh` |
| Open CEO brief for live-sync server | done | Issue #827 — https://github.com/TheNeuralWars/goalworld/issues/827 |
| Write Mac installer | done | `ops/hermes/install-gbrainsync-macos.sh` |
| Write Win installer | done | `ops/hermes/install-gbrainsync-windows.ps1` |

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #854
