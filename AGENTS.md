# GoalChain Development Guide

## Cursor Cloud specific instructions

### Architecture

GoalChain is a multi-project monorepo (no workspace manager). Each package has its own `package.json` and `node_modules`. Key packages:

| Package | Purpose | Dev command | Port |
|---|---|---|---|
| `goalchain-sdk/` | Shared TypeScript SDK (must be built first) | `npm run build` | N/A |
| `goalchain_api/` | Express REST API (economy, ops, AI coach) | `npm run dev` | 3001 |
| `goalchain_webapp/` | React SPA (Vite) — main frontend | `npm run dev` | 5173 |
| `goalchain_program/` | Solana smart contract (Anchor/Rust) | `anchor build` | N/A |
| `goalchain_oracle/` | Sports oracle + on-chain cranks (optional) | `npm start` | N/A |

### Build order

1. `goalchain-sdk` — `npm install && npm run build` (produces `dist/` consumed by webapp and API)
2. `goalchain_api` — `npm install && npm run dev`
3. `goalchain_webapp` — `npm install && npm run dev`

The SDK must be built before installing/starting the API or webapp, since both depend on `@goalchain/sdk` via `file:../goalchain-sdk`.

### Solana / Anchor toolchain

- Rust 1.89.0 is pinned in `goalchain_program/rust-toolchain.toml`.
- Anchor CLI 1.0.2 is managed via AVM (`~/.avm/bin/anchor`).
- Solana CLI (Anza stable) is at `~/.local/share/solana/install/active_release/bin/`.
- PATH must include `$HOME/.avm/bin` **before** `$HOME/.cargo/bin` so AVM-managed Anchor takes precedence over any cargo-installed version.
- A default Solana keypair is at `~/.config/solana/id.json`; Solana config is set to localhost.
- `anchor build` will fail with "Program ID mismatch" because the official keypair for `FbDhM4it...` is not in the repo. Use `anchor keys sync && anchor build` for local builds, then revert the synced changes before committing.

### Environment files

- Root `.env` — `RPC_URL` and `PORT` for the API server.
- `goalchain_webapp/.env` — copy from `.env.example`; defaults point to devnet RPC and `http://localhost:3001`.
- `goalchain_oracle/.env` — copy from `.env.example`; needs `SPORTS_API_KEY` only for production oracle.
- `GEMINI_API_KEY` in root `.env` is needed for the AI coach chat endpoint but is not required for basic API operation.

### Lint & test commands

- **SDK**: `npm run lint` (tsc --noEmit) / `npm run build`
- **API**: `npm run lint` / `npm run check` (lint + build)
- **Oracle**: `npm run lint` / `npm test` (runs lint)
- **Webapp**: `npx tsc --noEmit` — note: a known React 18 type compat issue with `@solana/wallet-adapter-react` causes a TS error on `ConnectionProvider`, but the Vite build (`npm run build`) succeeds.
- **Program**: `npm run lint` (prettier check) / `anchor test --validator legacy` (requires local validator)

### Gotchas

- The webapp's `tsc --noEmit` fails due to a React 18 / wallet-adapter JSX type mismatch. This does not affect the Vite build or runtime.
- `anchor build` requires running `anchor keys sync` first when the official program keypair is absent (local dev). Remember to `git checkout` the synced files before committing.
- The API reads data files from `docs/data/` and `docs/ECONOMIC_CANONICAL_CONFIG.json` relative to its source. These are committed static files and do not require a database.
- AVM (Anchor Version Manager) requires Rust stable (1.91+) to compile, even though the program itself uses Rust 1.89.0. Both toolchains must be installed.
