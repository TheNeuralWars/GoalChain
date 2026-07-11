// Seed data for oracle demo fixtures — issue #120
// These are placeholder player IDs used when running oracle_record_match demos
// in devnet without real player data from the scraper.
export const DEMO_PLAYER_IDS = [
  "001_laurent_blois",
  "002_marco_degen",
  "003_anna_nftmanager",
  "004_sebastian_gchdegen",
  "005_yuki_oraclesol",
] as const;

export const DEMO_FIXTURE_PLAYER_IDS: Record<string, string[]> = {
  // Map matchId prefix -> player IDs for that fixture demo
  // Extend this map as real fixtures are seeded.
  "demo-mundial-001": [...DEMO_PLAYER_IDS],
};

/**
 * Resolve participant IDs for a fixture demo.
 * Returns the mapped IDs if available, otherwise falls back to DEMO_PLAYER_IDS.
 */
export function resolveFixturePlayerIds(matchId: string): string[] {
  return DEMO_FIXTURE_PLAYER_IDS[matchId] ?? [...DEMO_PLAYER_IDS];
}