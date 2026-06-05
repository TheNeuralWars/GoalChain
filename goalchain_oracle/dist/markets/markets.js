import { MarketType, MarketStatus, MatchResult, } from "./types.js";
import { createLiveMarket } from "./createLiveMarket.js";
import { resolveMarket } from "./resolveMarket.js";
import { updateMarketStatus, closeMarket, cancelMarket, reopenMarket } from "./updateMarketStatus.js";
export class MarketsService {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async createLiveMarket(input) {
        return createLiveMarket(this.deps, input);
    }
    async resolveMarket(input) {
        return resolveMarket(this.deps, input);
    }
    async updateMarketStatus(input) {
        return updateMarketStatus(this.deps, input);
    }
    async closeMarket(matchId, marketId) {
        return closeMarket(this.deps, matchId, marketId);
    }
    async cancelMarket(matchId, marketId) {
        return cancelMarket(this.deps, matchId, marketId);
    }
    async reopenMarket(matchId, marketId) {
        return reopenMarket(this.deps, matchId, marketId);
    }
    getMarketType() {
        return MarketType;
    }
    getMarketStatus() {
        return MarketStatus;
    }
    getMatchResult() {
        return MatchResult;
    }
}
export function createMarketsService(deps) {
    return new MarketsService(deps);
}
