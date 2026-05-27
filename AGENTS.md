# GoalChain Development Guide

## Cursor Cloud specific instructions

### Architecture

GoalChain is a Solana-based Web3 football gaming monorepo. Each package has an independent `package.json` with `package-lock.json` (use **npm**). There is no workspace manager (no Turborepo/Lerna/pnpm-workspace).

Key packages:
- `goalchain-sdk/` — shared TypeScript SDK consumed by API + webapp via `file:../goalchain-sdk`
- `goalchain_api/` — Express REST API (port 3001). Dev: `npm run dev`
- `goalchain_webapp/` — React/Vite SPA (port 5173). Dev: `npm run dev`
- `goalchain_program/` — Solana/Anchor smart contract (Rust). Build: `anchor build`
- `goalchain_oracle/` — Sports data oracle. Lint: `npm run lint`

### Build order

The SDK **must** be built before the webapp or API can start:
```
cd goalchain-sdk && npm run build
```

### Running services

1. Start the API: `cd goalchain_api && npm run dev` (port 3001)
2. Start the webapp: `cd goalchain_webapp && npm run dev` (port 5173)
3. The webapp `.env` (copy from `.env.example`) points to the API at `http://localhost:3001`

No external databases needed — all persistent state is on-chain (Solana).

### Lint commands

| Package | Command |
|---------|---------|
| `goalchain-sdk` | `npm run lint` (tsc --noEmit) |
| `goalchain_api` | `npm run lint` (tsc --noEmit) |
| `goalchain_oracle` | `npm run lint` (tsc --noEmit) |
| `goalchain_program` | `npm run lint` (prettier --check) |
| `goalchain_webapp` | `npx tsc --noEmit` (has known React types compat warning with wallet adapter) |

### Solana program development

- Toolchain: Rust 1.89, Solana CLI 3.x, Anchor CLI 1.0.2
- The production program ID `FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg` requires a team keypair at `goalchain_program/target/deploy/goalchain_program-keypair.json`
- For local-only development without the team keypair: `anchor keys sync && anchor build`
- Run tests: `anchor test --validator legacy` (uses solana-test-validator on port 8899)
- See `docs/DEV_ENV_SETUP.md` and `docs/LOCALNET_MINI_GUIDE.md` for details

### Gotchas

- The webapp TypeScript check (`tsc --noEmit`) has a known error with `ConnectionProvider` JSX types. This is a React 18 / `@solana/wallet-adapter-react` types mismatch. It does **not** block the Vite dev server.
- The API gracefully handles missing on-chain accounts (returns `onchainConfig: null`) so it runs fine without a local validator.
- Always rebuild the SDK (`cd goalchain-sdk && npm run build`) after changing SDK source files; the API and webapp consume its `dist/` output.
