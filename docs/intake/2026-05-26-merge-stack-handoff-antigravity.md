# Merge stack #26→#34 — Antigravity handoff (Fase 0)

- **Date:** 2026-05-26
- **Status:** ready
- **Owner:** Antigravity (sole merge integrator)
- **CEO decision:** Nico approves sequential merge or squash policy

## Objective

Unblock Mundial MVP by landing observability, video flags OFF, and post-merge intake on `main`.

## Sequence

Per [`2026-05-23-merge-stack-convergence.md`](2026-05-23-merge-stack-convergence.md): merge PRs **#26 through #34** in order after CI green.

## Post-merge ritual

```bash
git pull origin main
gbrain import ai_context docs/intake   # Mac + VPS each host
bash ops/hermes/sync-hermes-active-profile-discord.sh   # VPS if discord.* changed
systemctl --user restart hermes-gateway
```

## Acceptance

- `main` contains merged stack
- FCC queue frozen; only [`MUNDIAL-2026-MVP.md`](MUNDIAL-2026-MVP.md) as `agent:opencode` ready track
