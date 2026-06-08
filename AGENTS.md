# GoalChain Development Guide

**Cursor agents:** read `ai_context/CURSOR_SESSION_CONTEXT.md` first (live VPS + GBrain sync). Production server is Oracle `ubuntu@89.168.20.135`; repo on VPS at `/data/apps/GoalChain`.

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

## GOLDEN RULES FOR MARKETING / PUBLICATIONS (added 2026-06-02, user directives - permanent)
1. **English MAX LAW (ley maxima):** ALL publications/posts/copy/facts/CTAs/spotlights/engagement on X, Discord, Zealy, ads, ANY platform = 100% ENGLISH ONLY. No Spanish words/phrases in generated public content. Generators, scripts, posters, quests, schedulers, docs that feed them must produce EN. Historical in internal logs only.

2. **GOLDEN RULE / REGLA DE ORO (highest, user exact):** "cada informacion tiene su canal correspondiente, y su unicidad como publicacion. tu deber es estudiar exactamente donde es mejor lanzarla y como va a tener mas contundencia y fuerza, para que funcione y llame la atencion, y que no distraiga o aleje al pulico por sobredosis de informacion." 
   - Each info unique per publication.
   - Study best channel/placement for max impact/strength/attention.
   - No information overload/sobredosis that distracts or alienates.
   - Delete Spanish + repeats always.
   - See full channel mapping + examples + enforcement in LAUNCH_CAMPAIGN_AGGRESSIVE.md (X: short spaced public diff hooks; **📋 LEY DE CANALES DISCORD (permanent table)**: #announcements = major only 1/día, #genesis-lounge = deep spotlights/lore 2/día, #degen-locker-room = Zealy+X-Scout+urgency 1/día, #marketing-active + #general = bot silent for public marketing; use ops/discord/discord_channel_router.js + discord_router_state.json; no @everyone on retention).
   - No verbatim repeats across channels same day; log used + rationale before every publication.

These two are the highest priority for all marketing work, schedulers, manual posts, generators. Violate = bad for campaign momentum/growth. Update prompts/generators/docs when changed. Combine with "no repeats", live proofs, Zealy push, fresh from 528 players + logs.

