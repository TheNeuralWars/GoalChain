# OA Proposal — Issue #477

## Title
[opencode] P1: DontFront.me Integration for User Transaction MEV Protection

## Source
Local queue (autonomous mode)

## Objective
## Objective
Enable DontFront.me integration for user-facing transactions (place_bet, claim_winnings, deposit) to provide zero-cost front-running protection without requiring Jito bundle complexity for every user action.

## Context
- **DontFront.me** — Free MEV protection for user transactions via Jito's mempool privacy
- **How it works:** User sends tx to DontFront RPC → DontFront forwards to Jito Block Engine → included in bundle if mev-profitable
- **Cost:** Free for users (DontFront takes small % of MEV captured), no code changes to user tx logic
- **Perfect for:** Low-to-medium value user transactions where full bundle overhead isn't justified

## Integration Points
| User Action | Current RPC | With DontFront |
|-------------|-------------|----------------|
| `place_bet` | `connection.sendTransaction` | `dontfrontConnection.sendTransaction` |
| `claim_winnings` | `connection.sendTransaction` | `dontfrontConnection.sendTransaction` |
| `deposit_sol` | `connection.sendTransaction` | `dontfrontConnection.sendTransaction` (already has Jito CPI) |

## Implementation
**File to modify:** `goalchain_webapp/src/lib/rpc.ts` (or equivalent RPC config)

```typescript
// Add DontFront RPC endpoint for devnet
export const RPC_ENDPOINTS = {
  devnet: {
    standard: 'https://api.devnet.solana.com',
    helius: 'https://devnet.helius-rpc.com/?api-key=...',
    dontfront: 'https://devnet.dontfront.me',  // FREE MEV protection
  },
  // ... mainnet endpoints
};

// Wrapper: use DontFront for user txs, standard for reads
export async function sendUserTransaction(tx: Transaction, wallet: Wallet) {
  const connection = new Connection(RPC_ENDPOINTS.devnet.dontfront, 'confirmed');
  return connection.sendTransaction(tx, [wallet.payer], { skipPreflight: false });
}
```

## DontFront Devnet Endpoint
- **Devnet:** `https://devnet.dontfront.me`
- **Mainnet:** `https://api.dontfront.me`

## Priority
P1

## Labels
status:ready,source:manager,agent:opencode,priority:P1,devnet,jito,mev,dontfront,area:webapp,area:program,

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft for review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-477`.
