import { FixtureOracle } from './fixtureOracle.js';
export class ScraperService {
    oracle;
    config;
    providers;
    running = false;
    fixturePollTimer;
    livePollTimers = new Map();
    constructor(oracle, config, providers) {
        this.oracle = oracle;
        this.config = config;
        this.providers = providers;
    }
    async start() {
        if (this.running)
            return;
        this.running = true;
        console.log('[ScraperService] Starting scraper service...');
        console.log(`[ScraperService] Config: pollInterval=${this.config.pollIntervalMs}ms, fixturePollInterval=${this.config.fixturePollIntervalMs}ms`);
        const fixtureOracle = new FixtureOracle(this.oracle, this.providers, this.config);
        await this.runFixtureDiscovery(fixtureOracle);
        this.fixturePollTimer = setInterval(() => this.runFixtureDiscovery(fixtureOracle), this.config.fixturePollIntervalMs);
        console.log('[ScraperService] Scraper service started');
    }
    async stop() {
        if (!this.running)
            return;
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
    async runFixtureDiscovery(fixtureOracle) {
        try {
            console.log('[ScraperService] Discovering fixtures...');
            const fixtures = await fixtureOracle.discoverFixtures();
            console.log(`[ScraperService] Found ${fixtures.length} fixtures`);
            for (const fixture of fixtures) {
                await this.processFixture(fixtureOracle, fixture);
            }
        }
        catch (error) {
            console.error('[ScraperService] Fixture discovery failed:', error);
        }
    }
    async processFixture(fixtureOracle, fixture) {
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
        }
        catch (error) {
            console.error(`[ScraperService] Failed to process fixture ${fixture.matchId}:`, error);
        }
    }
    startLivePoll(matchId, fixtureOracle) {
        if (this.livePollTimers.has(matchId))
            return;
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
            }
            catch (error) {
                console.error(`[ScraperService] Live poll error for ${matchId}:`, error);
            }
        }, this.config.pollIntervalMs);
        this.livePollTimers.set(matchId, timer);
    }
    stopLivePoll(matchId) {
        const timer = this.livePollTimers.get(matchId);
        if (timer) {
            clearInterval(timer);
            this.livePollTimers.delete(matchId);
            console.log(`[ScraperService] Stopped live poll for ${matchId}`);
        }
    }
}
