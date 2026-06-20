# OA Proposal — Issue #97

## Title
[OPENCODE] FCC: Global API health banner in webapp

## Source
GitHub issue #97

## Objective
## Batch
FCC batch 3/5

## Objective
Show a global banner when GoalChain API health check fails (ops down / economy health degraded).

## Allowed files
- `goalchain_webapp/src/ui/App.tsx` and/or `PlayLayout.tsx`
- `goalchain_webapp/src/` (small hook/component ok)
- `goalchain_webapp/.env.example` if new env documented

## Requirements
- Apply **frontend-design** skill — non-generic alert, matches glass UI.
- Fetch from `import.meta.env.VITE_API_BASE_URL` + `/health` and/or `/api/economy/health` (inspect goalchain_api routes; use what exists).
- Poll every 60s or on mount; dismissible optional.
- Do not block wallet connect when API down (banner only).

## Forbidden
- On-chain, economy canonical json edits

## Verification
```bash
cd goalchain_webapp && npm run build
```

## Workflow
- Draft PR only

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-97` and close draft PR.
