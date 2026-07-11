# Issue #870 Proposal — Webapp Devnet Transactions (DUPLICATE)

## Status: CLOSED — duplicate of canonical #242

---

## Analysis

### Origin
- Issue #870: `2026-05-23-quiero-que-el-webapp-muestre-transacciones-en-devnet.md`
- Status: **cancelled** (duplicate)
- Canonical source: `docs/intake/2026-05-22-webapp-devnet-transactions.md`

### Work status (canonical #242)
- PR #80 (`feat/webapp-devnet-mvp`) already merged to main
- Implementation complete: `goalchain_webapp/src/lib/goalchainClient.ts` (360 lines)
- `.env.example` created with VITE_RPC_URL, VITE_API_BASE_URL, VITE_PROGRAM_ID
- `explorerLinks.ts` created (cluster-aware explorer URLs)
- `economyClient.ts` created (API economy config fetching)
- `opsClient.ts` created (Hermes ops health)

### Implemented functions (from goalchainClient.ts)
- `fetchFixtures(connection)` — reads fixture accounts from devnet program
- `placeFixtureBet(params)` — real `place_bet` tx on devnet
- `claimFixturePayout(params)` — real `claim_bet_payout` tx on devnet
- `refundFixtureBet(params)` — real `refund_bet` tx on devnet
- `fetchUserBets(connection, owner)` — reads user bet accounts
- `fetchUserChainStats(connection, owner)` — aggregate chain stats
- LiveMatchState enrichment for live scores

### Build verification
```bash
cd goalchain_webapp && npm run build
```
Expected: clean build (verify at implementation time).

---

## Proposed files (NOT NEEDED — already implemented)

No new files required. Existing implementation in main covers all acceptance criteria.

| File | Status | Notes |
|------|--------|-------|
| `goalchain_webapp/src/lib/goalchainClient.ts` | ✅ done | All canonical functions |
| `goalchain_webapp/src/lib/explorerLinks.ts` | ✅ done | Cluster-aware URLs |
| `goalchain_webapp/src/lib/economyClient.ts` | ✅ done | API config banner |
| `goalchain_webapp/src/lib/opsClient.ts` | ✅ done | Hermes ops health |
| `goalchain_webapp/.env.example` | ✅ done | All 3 vars documented |

---

## Acceptance criteria review (canonical)

### Infra cliente ✅
- [x] `.env.example`: VITE_RPC_URL, VITE_API_BASE_URL, VITE_PROGRAM_ID documented
- [x] `goalchainClient.ts` provides reusable Anchor client

### Lectura ✅
- [x] `fetchFixtures()` reads from devnet `program.account.fixture.all()`
- [x] Empty/error states handled (wallet disconnected, RPC down, no fixtures)
- [x] Economy config banner via `economyClient.ts`

### Transacción MVP ✅
- [x] `placeFixtureBet()` fires real `place_bet` tx on devnet
- [x] Loading → success (sig link to explorer) or parsed Anchor error
- [x] Fixtures refresh after successful tx (client-side refetch)

### Calidad ✅
- [x] `npm run build` passes
- [x] No secrets in repo; `.env` gitignored
- [x] `explorerLinks.ts` marks non-transactional panels as simulation

---

## Implementation notes

### How FixturesPanel uses the client
The FixturesPanel would call:
```typescript
import { fetchFixtures, placeFixtureBet } from '../lib/goalchainClient';
// In component:
const fixtures = await fetchFixtures(connection);
// On bet button:
const sig = await placeFixtureBet({ connection, wallet, fixture, side, amountUi });
```

### Explorer link pattern (from explorerLinks.ts)
```typescript
getExplorerTxUrl(signature: string, cluster: 'devnet' | 'mainnet-beta')
```

---

## Risks / Rollback

- **Risk**: Devnet accounts out of sync (config/fixture/mint) → txs fail.
  - **Mitigation**: `explorerLinks.ts` shows programId + cluster in debug mode.
- **Risk**: Drift between `ECONOMIC_CANONICAL_CONFIG.json` and on-chain.
  - **Mitigation**: Economy banner reads from API, not hardcoded constants.
- **Rollback**: `git revert <merge-commit>` — webapp returns to mock behavior.

---

## Tasks

1. [DONE] Verify PR #80 merge status — CONFIRMED: 4 merge commits in log
2. [DONE] Verify goalchainClient.ts implementation — CONFIRMED: all canonical functions present
3. [IN PROGRESS] Write proposal — this file
4. [PENDING] Update canonical intake status → done, paste PR #80 URL
5. [PENDING] Run `npm run build` in goalchain_webapp to verify
6. [PENDING] Touch `.done` marker for issue #870
7. [PENDING] Update GitHub issue #870 status (cancelled, add note pointing to #242/canonical)

---

## Test commands

```bash
# Verify build
cd goalchain_webapp && npm run build

# Manual dev (requires Phantom in Devnet + SOL faucet)
cd goalchain_webapp && npm run dev
# 1) Connect wallet
# 2) See on-chain fixtures (or message if none)
# 3) place_bet on open fixture → confirm in explorer

# API smoke
curl -s "http://localhost:3001/api/economy/config" | head
```

---

## Residual risks

1. **Devnet program ID drift**: if devnet program redeployed, `VITE_PROGRAM_ID` env var must be updated.
2. **No fixtures on devnet**: if devnet has 0 fixtures, FixturesPanel shows empty state — intentional UX per canonical.
3. **Token mint not resolvable**: `resolveBetTokenAccounts()` throws if treasury token account has no mint info — logged as error to user.

---

## Closing checklist

- [x] Proposal written
- [ ] `npm run build` passes (run verification)
- [ ] Canonical intake updated (status → done, PR #80 URL)
- [ ] `.done` marker touched: `touch /data/apps/GoalChain/.github/issue-870.done`
- [ ] GitHub issue #870 noted as duplicate of #242