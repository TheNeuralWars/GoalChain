import type { FixtureData, FixtureProvider, ScraperConfig } from './types.js';
import { OracleService } from '../OracleService.js';
import { FixtureOracle } from './fixtureOracle.js';

export class ScraperService {
  private running = false;
  private fixturePollTimer?: NodeJS.Timeout;
  private livePollTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private oracle: OracleService,
    private config: ScraperConfig,
    private providers: FixtureProvider[]
  ) {}

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    console.log('[ScraperService] Starting scraper service...');
    console.log(`[ScraperService] Config: pollInterval=${this.config.pollIntervalMs}ms, fixturePollInterval=${this.config.fixturePollIntervalMs}ms`);

    const fixtureOracle = new FixtureOracle(this.oracle, this.providers, this.config);

    await this.runFixtureDiscovery(fixtureOracle);

    this.fixturePollTimer = setInterval(
      () => this.runFixtureDiscovery(fixtureOracle),
      this.config.fixturePollIntervalMs
    );

    console.log('[ScraperService] Scraper service started');
  }

  async stop(): Promise<void> {
    if (!this.running) return;
    this.running = false;

    console.log('[ScraperService] Stopping scraper service...');

    if (this.fixturePollTimer) {
      clearInterval(this.fixturePollTimer);
    }

    for (const [matchId, timer] of this.livePollTimers.entries()) {
      clearInterval(timer);
      console.log(`[ScraperService] Stopped live poll for ${matchId}`);
    }
    this.livePollTimers.clear();

    console.log('[ScraperService] Scraper service stopped');
  }

  private async runFixtureDiscovery(fixtureOracle: FixtureOracle): Promise<void> {
    try {
      console.log('[ScraperService] Discovering fixtures...');
      const fixtures = await fixtureOracle.discoverFixtures();
      console.log(`[ScraperService] Found ${fixtures.length} fixtures`);

      for (const fixture of fixtures) {
        await this.processFixture(fixtureOracle, fixture);
      }
    } catch (error) {
      console.error('[ScraperService] Fixture discovery failed:', error);
    }
  }

  private async processFixture(fixtureOracle: FixtureOracle, fixture: FixtureData): Promise<void> {
    try {
      await fixtureOracle.initializeFixtureIfNeeded(fixture);

      if (fixture.status === 'live' || fixture.status === 'ht') {
        await fixtureOracle.updateLiveState(fixture);
        this.startLivePoll(fixture.matchId, fixtureOracle);
      }

      if (fixture.status === 'ft') {
        await fixtureOracle.completeFixtureIfNeeded(fixture);
        this.stopLivePoll(fixture.matchId);
      }
    } catch (error) {
      console.error(`[ScraperService] Failed to process fixture ${fixture.matchId}:`, error);
    }
  }

  private startLivePoll(matchId: string, fixtureOracle: FixtureOracle): void {
    if (this.livePollTimers.has(matchId)) return;

    console.log(`[ScraperService] Starting live poll for ${matchId}`);
    const timer = setInterval(async () => {
      try {
        const fixture = await fixtureOracle.pollLiveFixture(matchId);
        if (!fixture) {
          console.log(`[ScraperService] No live data for ${matchId}, stopping poll`);
          this.stopLivePoll(matchId);
          return;
        }

        await fixtureOracle.updateLiveState(fixture);

        if (fixture.status === 'ft') {
          await fixtureOracle.completeFixtureIfNeeded(fixture);
          this.stopLivePoll(matchId);
        }
      } catch (error) {
        console.error(`[ScraperService] Live poll error for ${matchId}:`, error);
      }
    }, this.config.pollIntervalMs);

    this.livePollTimers.set(matchId, timer);
  }

  private stopLivePoll(matchId: string): void {
    const timer = this.livePollTimers.get(matchId);
    if (timer) {
      clearInterval(timer);
      this.livePollTimers.delete(matchId);
      console.log(`[ScraperService] Stopped live poll for ${matchId}`);
    }
  }
}