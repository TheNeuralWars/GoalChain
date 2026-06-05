export const DEFAULT_SCRAPER_CONFIG = {
    pollIntervalMs: 60_000,
    fixturePollIntervalMs: 300_000,
    maxRetries: 3,
    retryBaseDelayMs: 1_000,
    enableSportsApi: true,
    enableChainlink: false,
    enableDrift: false,
    sportsApiProvider: 'football-data',
};
export function loadScraperConfigFromEnv() {
    return {
        pollIntervalMs: Number(process.env.SCRAPER_POLL_INTERVAL_MS) || DEFAULT_SCRAPER_CONFIG.pollIntervalMs,
        fixturePollIntervalMs: Number(process.env.SCRAPER_FIXTURE_POLL_INTERVAL_MS) || DEFAULT_SCRAPER_CONFIG.fixturePollIntervalMs,
        maxRetries: Number(process.env.SCRAPER_MAX_RETRIES) || DEFAULT_SCRAPER_CONFIG.maxRetries,
        retryBaseDelayMs: Number(process.env.SCRAPER_RETRY_BASE_DELAY_MS) || DEFAULT_SCRAPER_CONFIG.retryBaseDelayMs,
        enableSportsApi: ['1', 'true', 'yes', 'on'].includes((process.env.ENABLE_SPORTS_API ?? 'true').toLowerCase()),
        enableChainlink: ['1', 'true', 'yes', 'on'].includes((process.env.ENABLE_CHAINLINK ?? 'false').toLowerCase()),
        enableDrift: ['1', 'true', 'yes', 'on'].includes((process.env.ENABLE_DRIFT ?? 'false').toLowerCase()),
        sportsApiKey: process.env.SPORTS_API_KEY,
        apiFootballKey: process.env.API_FOOTBALL_KEY,
        chainlinkRpcUrl: process.env.CHAINLINK_RPC_URL,
        driftRpcUrl: process.env.DRIFT_RPC_URL,
        sportsApiProvider: process.env.SPORTS_API_PROVIDER || 'football-data',
    };
}
