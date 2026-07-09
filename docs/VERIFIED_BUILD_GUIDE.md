# Verified Build Guide — GoalChain Program

> Added per issue #847 (voice task xq @SolPlay_jonas/2061767065569001508).
> The Solana Explorer now supports **verified programs** and **Codama IDL
> interaction**, making on-chain transparency a first-class feature.

## Why Verified Builds Matter

A verified build lets anyone confirm that the deployed on-chain bytecode
matches the public source code. The official Solana Explorer now shows a
"Verified" badge and lets users browse the IDL interactively.

For GoalChain this means:
- Users can inspect the program page and see **exactly** what code handles
  their bets, payouts, and vault operations.
- The IDL published by Anchor becomes interactable in the explorer (view
  instructions, accounts, types).
- Builds are reproducible: any auditor can re-derive the same BPF binary.

## Current State (devnet)

| Item | Value |
|------|-------|
| Program ID | `FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg` |
| Cluster | devnet |
| Explorer link | https://explorer.solana.com/address/FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg?cluster=devnet |
| IDL sync | `scripts/sync-idl.sh` → `goalchain-sdk/` |
| Build tool | Anchor CLI (`anchor build`) |

## Steps to Verify (future mainnet)

1. **Install solana-verify CLI:**
   ```bash
   cargo install solana-verify
   ```

2. **Build reproducibly:**
   ```bash
   cd goalchain_program
   solana-verify build
   ```

3. **Publish verification:**
   ```bash
   solana-verify verify-from-repo \
     --program-id FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg \
     --url https://github.com/TheNeuralWars/GoalChain \
     --mount-path goalchain_program
   ```

4. **Check on Explorer:**
   Visit the program page on explorer.solana.com — a green "Verified"
   badge will appear once confirmation propagates.

## Roadmap

- [ ] Devnet: run `solana-verify build` in CI (dry-run, no publish).
- [ ] Pre-mainnet: enable `solana-verify verify-from-repo` in release.
- [ ] Post-mainnet: add verified badge check to deploy runbook.

## References

- Solana Verified Builds: https://solana.com/developers/guides/advanced/verified-builds
- solana-verify CLI: https://github.com/Ellipsis-Labs/solana-verifiable-build
- Explorer (programs): https://explorer.solana.com
- Feature Gates: https://explorer.solana.com/feature-gates
