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
His Windows Mini PC at `100.101.209.8` (tailscale) via:

1. Install `OpenSSH.Server` on the Mini PC.
2. Add VPS `id_*.pub` to `C:
ProgramData
tssh
dministrators_authorized_keys`.
3. Run administrative `powershell.exe` from VPS over SSH.

Hermes Manager refused because:

- VPS Hermes shares the host with Discord/WhatsApp/Slock daemons — a credential
 There is not a single-purpose tool.
- "Te autorizo a todo" in a single chat message is exactly the kind of
 Un-informed override that policy requires us to refuse.
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
| Upload installers + intake to a non-`main` branch | done | branch `exp/gbrainsync-installers-only` (so `irm` works on that branch immediately, not just after PR merge) |
---
Source file: docs/intake/2026-06-22-live-sync-decision.md (auto-dispatched by intake_goal_loop.sh). Prioritize according to GoalWorld queue freeze rules. Close the linked intake file marker once implemented.

## Owner
Hermes

## Priority
P1

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with goalworld orchestration rules.

## Required output
- Proposed file list
- Risks/regressions + rollback
- Exact test commands

## Workflow
- One implementer only
- Branch naming:
 - cursor: `feat/*` or `fix/*`
 - antigravity: `exp/antigravity-*`
 - hermes: `exp/hermes-*`
 - grok: `exp/grok-*`
- Draft PR for Antigravity/Nico review — no direct merge to `main` unless `cambio urgente`

CRITICAL COMPATIBILITY RULES FOR NEMOTRON-3-ULTRA-FREE:
1. DO NOT use the `todowrite` tool. It causes schema errors with Nemotron-3. Manage all your tasks and checklists in text format in the proposal file.
2. DO NOT write or overwrite large files (greater than 50 lines) using the `write` tool. Output truncation will break JSON parsing and crash the run. Break changes down into smaller files or modular edits.

.done
