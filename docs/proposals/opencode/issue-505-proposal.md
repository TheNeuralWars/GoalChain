# OA Proposal — Issue #505

## Title
[OPENCODE] [P0] #414 Deploy play.goalchain.fun with VITE_API_BASE_URL production

## Source
Local queue (autonomous mode)

## Objective
# [OPENCODE] [P0] #414 Deploy play.goalchain.fun with VITE_API_BASE_URL production

## Priority: P0 (deployment for MVP)
## Labels: agent:opencode, priority:P0, area:webapp, status:ready, mundial-mvp

## Objective
Deploy the webapp to `play.goalchain.fun` (Vercel) with production env pointing to production API.

## Required Configuration
| Env Var | Value |
|---------|-------|
| `VITE_API_BASE_URL` | `https://api.goalchain.fun` (or devnet API for MVP) |
| `VITE_SOLANA_NETWORK` | `devnet` (for MVP) / `mainnet-beta` (post-Mundial) |
| `VITE_PROGRAM_ID` | Devnet program ID from deploy |
| `VITE_JITO_BLOCK_ENGINE` | `https://testnet.block-engine.jito.wtf` |

## Steps
1. **Configure** Vercel project `play.goalchain.fun` with env vars above
2. **Build** webapp: `cd goalchain_webapp && npm run build`
3. **Deploy** to Vercel preview → promote to production
4. **Verify** DNS `play.goalchain.fun` resolves and loads
5. **Test** wallet connect + bet flow on deployed site

## Files to Modify
- `goalchain_webapp/.env.production` (or Vercel dashboard)
- `goalchain_webapp/vercel.json` if needed
- DNS: verify `play.goalchain.fun` CNAME → Vercel

## Acceptance Criteria
- `https://play.goalchain.fun` loads without console errors
- Wallet connect works (Phantom/Solflare)
- API calls go to correct backend (devnet for MVP)
- Build passes typecheck + lint

## Priority
P0

## Labels
status:ready,agent:opencode,priority:P0,mundial-mvp,area:webapp,

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft for review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-505`.
