# Oracle Data Pipeline Reliability & Freshness Audit - Fri Jun 26 03:39:58 UTC 2026

## 1. Recent Git Log
Running git log --oneline -10...
604e40bf chore: add clean repository project index, agent rules, and migration script
e44317ca chore: save devnet economy snapshot and authorize oracle updates
34c25619 fix: resolve global variable collisions in landing page JS, and fix mobile layout overflows and navigation responsiveness in webapp
14110004 feat: implement 3D cards in Transfer Market and add Tensor/Magic Eden simulator modals
ea27e4a8 chore: audit and fix nft collection transparent backgrounds, card styles, and webapp 3d flipping design
deb1b798 feat: remove white backgrounds from all 542 player NFT images
f3b3e721 fix(gallery): resolve image paths, translation function reference error, and add collection routes
b005bf8f feat: add generated gallery images, manifest, and GenesisCollectionGallery component
e246d258 feat(marketing): long_video_generator hardened (P1)
27be32a5 feat(api): /api/marketing/pipeline/health endpoint (Manager 2026-06-24)

## 2. Code Inspection
Examining src/scraper.ts, src/updater.ts, src/scheduler.ts...
File not found: src/scraper.ts
File not found: src/updater.ts
File not found: src/scheduler.ts

## 3. API Rate Limit Handling
Checking for 429 retries with exponential backoff and jitter...
src/vault_crank.ts:import { fetchWithTimeout, retrySendAndConfirm, getRpcUrl, getProgramId } from "@goalchain/sdk";
src/jitoBundle.ts:import { fetchWithTimeout, retryWithBackoff } from "@goalchain/sdk";
src/scraper/providers/sportsApi.ts:      if (response.status === 429) {
src/scraper/providers/sportsApi.ts:        const retryAfter = Number(response.headers.get('retry-after') ?? '60');
src/scraper/providers/sportsApi.ts:          await this.sleep(retryAfter * 1000);
src/scraper/providers/sportsApi.ts:          await this.sleep(this.config.retryBaseDelayMs * Math.pow(2, attempt - 1));
src/scraper/providers/sportsApi.ts:        await this.sleep(this.config.retryBaseDelayMs * Math.pow(2, attempt - 1));
src/scraper/types.ts:  retryBaseDelayMs: number;
src/scraper/types.ts:  retryBaseDelayMs: 1_000,
src/scraper/types.ts:    retryBaseDelayMs: Number(process.env.SCRAPER_RETRY_BASE_DELAY_MS) || DEFAULT_SCRAPER_CONFIG.retryBaseDelayMs,

## 4. Transaction Submission & Blockhash Expiration
Checking blockhash expiration handling and duplicate transaction detection...
src/OracleService.ts:   * Helper to wrap instruction execution with dynamic Helius priority fees and blockhash management.
src/OracleService.ts:    tx.recentBlockhash = latestBlockhash.blockhash;
src/OracleService.ts:        blockhash: latestBlockhash.blockhash,
src/vault_crank.ts:            burnLegacyTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
src/jitoBundle.ts:  stakingTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
src/jitoBundle.ts:    tipTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
src/scraper/fixtureOracle.ts:    return this.deduplicateFixtures(allFixtures);
src/scraper/fixtureOracle.ts:  private deduplicateFixtures(fixtures: FixtureData[]): FixtureData[] {
src/initialize_mainnet.ts:  tx.recentBlockhash = latestBlockhash.blockhash;
src/initialize_mainnet.ts:      blockhash: latestBlockhash.blockhash,

## 5. Nonce and Queue Management
Checking nonce and queue management during high-traffic matches...

## 6. Compilation Check
Running bun run build...
$ tsc

## 7. Unit Tests
Running bun run test...
$ bun run lint
$ tsc --noEmit

## Verification
This file was generated at Fri Jun 26 03:40:04 UTC 2026. Review the above outputs for findings.
