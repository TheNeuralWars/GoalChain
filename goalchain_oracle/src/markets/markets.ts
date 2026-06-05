import { Connection, PublicKey } from "@solana/web3.js";
import type { Program } from "@coral-xyz/anchor";
// @ts-ignore
import { GoalchainProgram } from "../../../goalchain_program/target/types/goalchain_program";
import {
  MarketInput,
  ResolveMarketInput,
  UpdateMarketStatusInput,
  MarketType,
  MarketStatus,
  MatchResult,
} from "./types.js";
import { createLiveMarket } from "./createLiveMarket.js";
import { resolveMarket } from "./resolveMarket.js";
import { updateMarketStatus, closeMarket, cancelMarket, reopenMarket } from "./updateMarketStatus.js";

export interface MarketsServiceDeps {
  connection: Connection;
  wallet: any;
  provider: any;
  program: Program<GoalchainProgram>;
  configPda: PublicKey;
  sendWithPriorityFees: (
    methodBuilder: any,
    keysForPriorityEstimate: PublicKey[],
    computeUnitsLimit?: number,
  ) => Promise<string>;
}

export class MarketsService {
  private deps: MarketsServiceDeps;

  constructor(deps: MarketsServiceDeps) {
    this.deps = deps;
  }

  async createLiveMarket(input: MarketInput): Promise<string> {
    return createLiveMarket(this.deps, input);
  }

  async resolveMarket(input: ResolveMarketInput): Promise<string> {
    return resolveMarket(this.deps, input);
  }

  async updateMarketStatus(input: UpdateMarketStatusInput): Promise<string> {
    return updateMarketStatus(this.deps, input);
  }

  async closeMarket(matchId: string, marketId: number): Promise<string> {
    return closeMarket(this.deps, matchId, marketId);
  }

  async cancelMarket(matchId: string, marketId: number): Promise<string> {
    return cancelMarket(this.deps, matchId, marketId);
  }

  async reopenMarket(matchId: string, marketId: number): Promise<string> {
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

export function createMarketsService(deps: MarketsServiceDeps): MarketsService {
  return new MarketsService(deps);
}