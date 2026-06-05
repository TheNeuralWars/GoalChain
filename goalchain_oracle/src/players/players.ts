import { OracleService } from "../OracleService.js";
import { recordPlayerMatch } from "./recordMatch.js";
import { updatePlayerStats } from "./updateStats.js";
import { PlayerMatchInput, PlayerStatsInput } from "./types.js";

export class PlayersService {
  private oracle: OracleService;

  constructor(oracle: OracleService) {
    this.oracle = oracle;
  }

  async recordMatch(input: PlayerMatchInput): Promise<string> {
    return recordPlayerMatch(this.oracle, input);
  }

  async updateStats(input: PlayerStatsInput): Promise<string> {
    return updatePlayerStats(this.oracle, input);
  }
}