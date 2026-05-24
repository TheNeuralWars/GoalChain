# Minimal Jupiter Integration (Spike Progress)

**Date:** 2026-05-24
**Status:** First working tool created

## What was built

- Created `src/tools/solana/jupiter.ts`
- Implemented `jupiter_get_quote` tool using Jupiter Quote API v6
- Tool accepts `inputMint`, `outputMint`, `amount`, and `slippageBps`
- Returns route information, expected output, and price impact

## Current limitations (MVP)

- Only quote, no actual swap execution yet
- No wallet/signer integration
- No transaction building or signing
- No error handling for common Solana failure modes

## How to register the tool in Dexter

To make this tool available to the agent, it would need to be added to the tool registry (similar to how finance tools are loaded).

Example addition in `src/tools/registry.ts` (hypothetical):

```ts
import { jupiterTools } from './solana/jupiter.js';

// Inside tool registration
if (process.env.ENABLE_SOLANA_TOOLS === 'true') {
  tools.push(...jupiterTools);
}
```

## Next steps for full integration

1. Add environment variable control (`ENABLE_SOLANA_TOOLS`)
2. Implement `jupiter_execute_swap` tool (requires wallet adapter)
3. Add Solana connection + transaction confirmation polling
4. Create a `SKILL.md` for Solana trading workflows
5. Test quote + swap flow end-to-end

## Files created

- `src/tools/solana/jupiter.ts`
- `src/tools/solana/index.ts`

This represents the first concrete step toward a Solana-adapted version of Dexter.
