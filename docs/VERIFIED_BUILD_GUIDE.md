# Verified Build Guide

## Solana Explorer Integration

### Cluster-Aware URLs

The GoalChain webapp now uses a centralized `explorerLinks.ts` module to generate Solana Explorer URLs. The `explorerTxUrl` function is cluster-aware and generates URLs based on the current cluster (devnet, testnet, mainnet).

### Implementation Details

- **File**: `goalchain_webapp/src/lib/explorerLinks.ts`
- **Function**: `explorerTxUrl(txId: string, cluster: string = 'devnet'): string`
- **Usage**: Replace hardcoded Solana Explorer URLs with `explorerTxUrl(txId, connection.rpcEndpoint)`

### Verification

- Run TypeScript checks: `cd goalchain_webapp && npx tsc --noEmit`
- Run build: `npm run build`
