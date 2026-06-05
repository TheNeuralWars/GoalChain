import { recordPlayerMatch } from "./recordMatch.js";
import { updatePlayerStats } from "./updateStats.js";
export class PlayersService {
    oracle;
    constructor(oracle) {
        this.oracle = oracle;
    }
    async recordMatch(input) {
        return recordPlayerMatch(this.oracle, input);
    }
    async updateStats(input) {
        return updatePlayerStats(this.oracle, input);
    }
}
