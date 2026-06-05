export class SportsApiProvider {
    name = 'sports-api';
    rateLimitRemaining = 10;
    rateLimitReset = Date.now() + 60_000;
    config;
    constructor(config) {
        this.config = config;
    }
    getRateLimitInfo() {
        return { remaining: this.rateLimitRemaining, reset: this.rateLimitReset };
    }
    async fetchWithRetry(url, headers, attempt = 1) {
        try {
            const response = await fetch(url, { headers });
            this.rateLimitRemaining = Number(response.headers.get('x-ratelimit-remaining') ?? this.rateLimitRemaining);
            const resetHeader = response.headers.get('x-ratelimit-reset');
            if (resetHeader)
                this.rateLimitReset = Number(resetHeader) * 1000;
            if (response.status === 429) {
                const retryAfter = Number(response.headers.get('retry-after') ?? '60');
                if (attempt < this.config.maxRetries) {
                    await this.sleep(retryAfter * 1000);
                    return this.fetchWithRetry(url, headers, attempt + 1);
                }
                return { success: false, error: `Rate limited after ${this.config.maxRetries} retries` };
            }
            if (!response.ok) {
                if (response.status >= 500 && attempt < this.config.maxRetries) {
                    await this.sleep(this.config.retryBaseDelayMs * Math.pow(2, attempt - 1));
                    return this.fetchWithRetry(url, headers, attempt + 1);
                }
                return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
            }
            const data = await response.json();
            return { success: true, data, rateLimitRemaining: this.rateLimitRemaining, rateLimitReset: this.rateLimitReset };
        }
        catch (error) {
            if (attempt < this.config.maxRetries) {
                await this.sleep(this.config.retryBaseDelayMs * Math.pow(2, attempt - 1));
                return this.fetchWithRetry(url, headers, attempt + 1);
            }
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    mapFootballDataStatus(status) {
        switch (status) {
            case 'TIMED':
            case 'SCHEDULED': return 'scheduled';
            case 'LIVE':
            case 'IN_PLAY': return 'live';
            case 'HALF_TIME': return 'ht';
            case 'FULL_TIME':
            case 'FINISHED': return 'ft';
            case 'POSTPONED': return 'postponed';
            case 'CANCELLED': return 'cancelled';
            default: return 'scheduled';
        }
    }
    mapApiFootballStatus(short) {
        switch (short) {
            case 'NS':
            case 'TBD': return 'scheduled';
            case '1H':
            case '2H':
            case 'ET':
            case 'BT':
            case 'P':
            case 'SUSP':
            case 'INT': return 'live';
            case 'HT': return 'ht';
            case 'FT':
            case 'AET':
            case 'PEN': return 'ft';
            case 'PST': return 'postponed';
            case 'CANC': return 'cancelled';
            default: return 'scheduled';
        }
    }
    async fetchFixtures(config) {
        const provider = config.sportsApiProvider || 'football-data';
        if (provider === 'football-data') {
            return this.fetchFootballDataFixtures(config);
        }
        else {
            return this.fetchApiFootballFixtures(config);
        }
    }
    async fetchFootballDataFixtures(config) {
        const apiKey = config.sportsApiKey;
        if (!apiKey) {
            return { success: false, error: 'SPORTS_API_KEY not configured for football-data.org' };
        }
        const url = 'https://api.football-data.org/v4/matches?status=SCHEDULED,LIVE,IN_PLAY,PAUSED,FINISHED';
        const response = await this.fetchWithRetry(url, {
            'X-Auth-Token': apiKey,
            'Accept': 'application/json',
        });
        if (!response.success || !response.data) {
            return { success: false, error: response.error };
        }
        const data = response.data;
        const fixtures = data.matches.map(match => ({
            matchId: `FD_${match.id}`,
            teamA: match.homeTeam.name,
            teamB: match.awayTeam.name,
            startTime: new Date(match.utcDate).getTime() / 1000,
            league: data.competition.name,
            status: this.mapFootballDataStatus(match.status),
            scoreA: match.score.fullTime.home ?? undefined,
            scoreB: match.score.fullTime.away ?? undefined,
            isHt: match.status === 'HALF_TIME',
            isFt: ['FULL_TIME', 'FINISHED'].includes(match.status),
            source: 'football-data.org',
            fetchedAt: Date.now(),
        }));
        return { success: true, data: fixtures, rateLimitRemaining: this.rateLimitRemaining, rateLimitReset: this.rateLimitReset };
    }
    async fetchApiFootballFixtures(config) {
        const apiKey = config.apiFootballKey;
        if (!apiKey) {
            return { success: false, error: 'API_FOOTBALL_KEY not configured for API-Football' };
        }
        const today = new Date().toISOString().split('T')[0];
        const url = `https://v3.football.api-sports.io/fixtures?date=${today}&timezone=UTC`;
        const response = await this.fetchWithRetry(url, {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'v3.football.api-sports.io',
        });
        if (!response.success || !response.data) {
            return { success: false, error: response.error };
        }
        const fixtures = response.data.response.map(fixture => ({
            matchId: `AF_${fixture.fixture.id}`,
            teamA: fixture.teams.home.name,
            teamB: fixture.teams.away.name,
            startTime: fixture.fixture.timestamp,
            league: fixture.league.name,
            venue: fixture.fixture.venue?.name ?? undefined,
            status: this.mapApiFootballStatus(fixture.fixture.status.short),
            scoreA: fixture.goals.home ?? undefined,
            scoreB: fixture.goals.away ?? undefined,
            minute: fixture.fixture.status.elapsed ?? undefined,
            isHt: fixture.fixture.status.short === 'HT',
            isFt: ['FT', 'AET', 'PEN'].includes(fixture.fixture.status.short),
            source: 'api-football',
            fetchedAt: Date.now(),
        }));
        return { success: true, data: fixtures, rateLimitRemaining: this.rateLimitRemaining, rateLimitReset: this.rateLimitReset };
    }
    async fetchLiveFixture(matchId, config) {
        const allFixtures = await this.fetchFixtures(config);
        if (!allFixtures.success || !allFixtures.data) {
            return { success: false, error: allFixtures.error };
        }
        const fixture = allFixtures.data.find(f => f.matchId === matchId) || null;
        return { success: true, data: fixture, rateLimitRemaining: this.rateLimitRemaining, rateLimitReset: this.rateLimitReset };
    }
}
