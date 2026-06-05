export class FixtureOracle {
    oracle;
    providers;
    config;
    fixtureCache = new Map();
    CACHE_TTL_MS = 60_000;
    DEDUP_WINDOW_MS = 30_000;
    constructor(oracle, providers, config) {
        this.oracle = oracle;
        this.providers = providers;
        this.config = config;
    }
    async discoverFixtures() {
        const allFixtures = [];
        for (const provider of this.providers) {
            const response = await provider.fetchFixtures(this.config);
            if (response.success && response.data) {
                allFixtures.push(...response.data);
            }
            else {
                console.warn(`[FixtureOracle] Provider ${provider.name} failed:`, response.error);
            }
        }
        return this.deduplicateFixtures(allFixtures);
    }
    deduplicateFixtures(fixtures) {
        const seen = new Map();
        for (const fixture of fixtures) {
            const key = `${fixture.matchId}:${fixture.status}`;
            const existing = seen.get(key);
            if (!existing || fixture.fetchedAt > existing.fetchedAt) {
                seen.set(key, fixture);
            }
        }
        const now = Date.now();
        for (const [key, entry] of this.fixtureCache.entries()) {
            if (now - entry.cachedAt > this.CACHE_TTL_MS) {
                this.fixtureCache.delete(key);
            }
        }
        const result = [];
        for (const fixture of seen.values()) {
            const cacheKey = `${fixture.matchId}:${fixture.status}`;
            const cached = this.fixtureCache.get(cacheKey);
            if (!cached || now - cached.cachedAt > this.DEDUP_WINDOW_MS) {
                this.fixtureCache.set(cacheKey, { fixture, cachedAt: now });
                result.push(fixture);
            }
        }
        return result;
    }
    async initializeFixtureIfNeeded(fixture) {
        const [fixturePda] = await this.deriveFixturePda(fixture.matchId);
        const accountInfo = await this.oracle.connection.getAccountInfo(fixturePda);
        if (accountInfo) {
            console.log(`[FixtureOracle] Fixture ${fixture.matchId} already exists on-chain`);
            return false;
        }
        try {
            await this.oracle.initializeFixture(fixture.matchId, fixture.teamA, fixture.teamB, fixture.startTime);
            console.log(`[FixtureOracle] Initialized fixture ${fixture.matchId} on-chain`);
            return true;
        }
        catch (error) {
            console.error(`[FixtureOracle] Failed to initialize fixture ${fixture.matchId}:`, error);
            throw error;
        }
    }
    async updateLiveState(fixture) {
        if (fixture.status !== 'live' && fixture.status !== 'ht')
            return;
        await this.oracle.upsertLiveState(fixture.matchId, fixture.minute ?? 0, fixture.scoreA ?? 0, fixture.scoreB ?? 0, fixture.isHt ?? false, fixture.isFt ?? false);
    }
    async completeFixtureIfNeeded(fixture) {
        if (fixture.status !== 'ft')
            return;
        let winnerObj = { draw: {} };
        if ((fixture.scoreA ?? 0) > (fixture.scoreB ?? 0)) {
            winnerObj = { teamA: {} };
        }
        else if ((fixture.scoreB ?? 0) > (fixture.scoreA ?? 0)) {
            winnerObj = { teamB: {} };
        }
        await this.oracle.completeFixture(fixture.matchId, winnerObj, {
            participantPlayerIds: fixture.participantPlayerIds,
        });
    }
    async deriveFixturePda(matchId) {
        const { PublicKey } = await import('@solana/web3.js');
        return PublicKey.findProgramAddressSync([Buffer.from('fixture'), Buffer.from(matchId)], this.oracle.program.programId);
    }
    async pollLiveFixture(matchId) {
        for (const provider of this.providers) {
            const response = await provider.fetchLiveFixture(matchId, this.config);
            if (response.success && response.data) {
                return response.data;
            }
        }
        return null;
    }
}
