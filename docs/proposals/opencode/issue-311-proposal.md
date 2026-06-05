# OA Proposal — Issue #311

## Title
[OPENCODE] Oracle: Extract scraper module (run scraper, fixture oracle, providers)

## Source
GitHub issue #311

## Objective
## Objective
Extract data ingestion into packages/oracle/src/scraper/:

## Scope
Create `packages/oracle/src/scraper/` with:

1. `runScraperOracle.ts` - Main scraper loop (from runScraperOracle.ts, 92 lines)
2. `fixtureOracle.ts` - Fixture data from external APIs (from fixture_oracle.js)
3. `providers/sportsApi.ts` - Football-data.org, API-Football integration
4. `providers/chainlink.ts` - Chainlink feed consumption
5. `providers/drift.ts` - Drift oracle price feeds
6. `scraper.ts` - Composed ScraperService class
7. `types.ts` - FixtureData, ScraperConfig, ProviderResponse

## Acceptance Criteria
- Each file < 200 lines
- Provider abstraction for easy swap/mock
- Rate limiting and retry logic
- Fixture deduplication (idempotent initializeFixture)
- Configurable poll intervals via env

## Skill Hint
Follow gstack investigate workflow (root cause, max 3 fixes).

## Owner
opencode

## Priority
P0

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## Required output
- Proposed file list
- Risks/regressions + rollback
- Exact test commands

## Workflow
- One implementer only

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #311
