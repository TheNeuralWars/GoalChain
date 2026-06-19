# Growth Task 3: Surface Presale Status & Whitelist Form on Landing

- **Status:** ready-for-hermes
- **Priority:** P1
- **Owner:** opencode
- **Created:** 2026-06-04
- **Source:** GitHub Issue #297 / Manager

## Objective

`goalchain_api/src/index.ts:874` already exposes `POST /api/whitelist` (writes wallet + email to `data/whitelist.json`) and `GET /api/economy/config` exposes `presaleActive`, `maxSolPerUser`, and `treasuryTokenAccount`. The Degen Preseason campaign is driving traffic to `goalchain.fun` but the webapp has no presale page, no whitelist form, no countdown, and no progress bar. Users arriving from X/Discord have nowhere to register intent or see live status.

**Action:**
1. Build a `PresalePanel.tsx` component in `goalchain_webapp/src/ui/` that fetches `/api/economy/config` and shows:
   - Presale live/off badge
   - Per-wallet SOL cap
   - Total raised (call a new `GET /api/presale/status` endpoint to be added in the API returning `whitelist.length` and aggregated SOL from prior contributions)
   - Countdown to next phase
2. Add the panel as the default route in `App.tsx` ahead of the marketplace
3. Add a wallet-connect-gated whitelist form that posts to the existing endpoint

---

## Recommended Path Forward

- [ ] Parse and generate implementation tasks via autonomic-intake-processor
- [ ] Auto-dispatch to FCC/OpenCode for code implementation
- [ ] Run typescript checks and auto-merge to main if clean

## Tags

#growth-task #presale #whitelist #landing-page #campaign #webapp #humans-0 #autonomous-push