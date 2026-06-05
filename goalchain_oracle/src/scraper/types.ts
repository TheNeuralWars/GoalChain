export type FixtureStatus = 'scheduled' | 'live' | 'ht' | 'ft' | 'postponed' | 'cancelled';

export interface FixtureData {
  matchId: string;
  teamA: string;
  teamB: string;
  startTime: number;
  league?: string;
  venue?: string;
  status: FixtureStatus;
  scoreA?: number;
  scoreB?: number;
  minute?: number;
  isHt?: boolean;
  isFt?: boolean;
  participantPlayerIds?: string[];
  source: string;
  fetchedAt: number;
}

export interface ProviderResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  rateLimitRemaining?: number;
  rateLimitReset?: number;
}

export interface ScraperConfig {
  pollIntervalMs: number;
  fixturePollIntervalMs: number;
  maxRetries: number;
  retryBaseDelayMs: number;
  enableSportsApi: boolean;
  enableChainlink: boolean;
  enableDrift: boolean;
  sportsApiKey?: string;
  apiFootballKey?: string;
  chainlinkRpcUrl?: string;
  driftRpcUrl?: string;
  sportsApiProvider?: 'football-data' | 'api-football';
}

export interface FixtureProvider {
  name: string;
  fetchFixtures(config: ScraperConfig): Promise<ProviderResponse<FixtureData[]>>;
  fetchLiveFixture(matchId: string, config: ScraperConfig): Promise<ProviderResponse<FixtureData | null>>;
  getRateLimitInfo(): { remaining: number; reset: number };
}

export interface PriceProvider {
  name: string;
  fetchPrice(symbol: string, config: ScraperConfig): Promise<ProviderResponse<number>>;
  getRateLimitInfo(): { remaining: number; reset: number };
}

export const DEFAULT_SCRAPER_CONFIG: ScraperConfig = {
  pollIntervalMs: 60_000,
  fixturePollIntervalMs: 300_000,
  maxRetries: 3,
  retryBaseDelayMs: 1_000,
  enableSportsApi: true,
  enableChainlink: false,
  enableDrift: false,
  sportsApiProvider: 'football-data',
};

export function loadScraperConfigFromEnv(): ScraperConfig {
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
    sportsApiProvider: (process.env.SPORTS_API_PROVIDER as 'football-data' | 'api-football') || 'football-data',
  };
}