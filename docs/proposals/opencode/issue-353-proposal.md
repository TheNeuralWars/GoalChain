# OA Proposal — Issue #353

## Title
[OPENCODE] API: Modularize goalchain_api - routes, controllers, services, middleware

## Source
GitHub issue #353

## Objective
## Objective
Modularize goalchain_api into feature-based structure:

## Scope
### 1. Structure
Create `src/` with:
- `routes/` - Route definitions per feature
  - `trading.ts` - Manual orders, bot management, positions
  - `coach.ts` - Chat, advisories, predictor
  - `commentator.ts` - Commentary feed, WS bridge
  - `stadium.ts` - Fixtures, live events, markets
  - `club.ts` - Club, treasury, roster, stadium
  - `defi.ts` - Vaults, staking, Jupiter quotes
  - `nft.ts` - Marketplace, minting, collections
  - `squad.ts` - Players, filters, synergy
  - `profile.ts` - User, activity, achievements
  - `ops.ts` - Alpha signals, health, metrics
  - `onboarding.ts` - Steps, persona, rewards
- `controllers/` - Request handling, validation, response formatting
- `services/` - Business logic (oracle, program, cache, external APIs)
- `middleware/` - Auth, rate limit, validation, error handling, logging
- `utils/` - Helpers, constants, type guards
- `config/` - Environment, feature flags, external clients
- `app.ts` - Express/Fastify app factory
- `server.ts` - Entry point

### 2. Shared Patterns
- `src/lib/` - Prisma/client, Redis, WebSocket server, Cache
- `src/types/` - Shared request/response types
- `src/errors/` - Custom error classes, HTTP mapping

### 3. Integration
- OracleService client (modular oracle)
- Program client (modular program via SDK)
- Jupiter API, Pyth API, Drift API
- WebSocket server for live events/commentary

## Acceptance Criteria
- Each file < 200 lines
- OpenAPI/Swagger docs generated

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #353
