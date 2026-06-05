import { PublicKey } from "@solana/web3.js";

export function deriveFixturePda(programId: PublicKey, matchId: string): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("fixture"), Buffer.from(matchId)],
    programId,
  );
  return pda;
}

export function deriveMarketPda(programId: PublicKey, fixturePda: PublicKey, marketId: number): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("market"), fixturePda.toBuffer(), Buffer.from([marketId])],
    programId,
  );
  return pda;
}

export enum MarketType {
  MatchResultLive = "MatchResultLive",
  NextGoal = "NextGoal",
  Custom = "Custom",
}

export enum MarketStatus {
  Open = "Open",
  Closed = "Closed",
  Resolved = "Resolved",
  Cancelled = "Cancelled",
}

export enum MatchResult {
  TeamA = "TeamA",
  TeamB = "TeamB",
  Draw = "Draw",
}

export type WinnerVariant = MatchResult;

export interface MarketInput {
  matchId: string;
  marketId: number;
  marketType: MarketType;
  delaySeconds: number;
  closeMinute: number;
  tokenMint: PublicKey;
  cooldownSeconds?: number;
  maxGoalDiff?: number;
  requireTied?: boolean;
}

export interface ResolveMarketInput {
  matchId: string;
  marketId: number;
  winner: WinnerVariant;
}

export interface UpdateMarketStatusInput {
  matchId: string;
  marketId: number;
  status: MarketStatus;
  winner?: WinnerVariant;
}

export function toAnchorMarketType(marketType: MarketType): any {
  switch (marketType) {
    case MarketType.MatchResultLive:
      return { matchResultLive: {} };
    case MarketType.NextGoal:
      return { nextGoal: {} };
    case MarketType.Custom:
      return { custom: {} };
  }
}

export function toAnchorMarketStatus(status: MarketStatus): any {
  switch (status) {
    case MarketStatus.Open:
      return { open: {} };
    case MarketStatus.Closed:
      return { closed: {} };
    case MarketStatus.Resolved:
      return { resolved: {} };
    case MarketStatus.Cancelled:
      return { cancelled: {} };
  }
}

export function toAnchorMatchResult(result: MatchResult): any {
  switch (result) {
    case MatchResult.TeamA:
      return { teamA: {} };
    case MatchResult.TeamB:
      return { teamB: {} };
    case MatchResult.Draw:
      return { draw: {} };
  }
}

export function validateMarketInput(input: MarketInput): void {
  if (!input.matchId || input.matchId.trim() === "") {
    throw new Error("matchId is required");
  }
  if (input.marketId < 0 || input.marketId > 255) {
    throw new Error("marketId must be between 0 and 255");
  }
  if (input.delaySeconds < 0) {
    throw new Error("delaySeconds must be >= 0");
  }
  if (input.closeMinute <= 0) {
    throw new Error("closeMinute must be > 0");
  }
  if (input.cooldownSeconds !== undefined && input.cooldownSeconds < 0) {
    throw new Error("cooldownSeconds must be >= 0");
  }
  if (input.maxGoalDiff !== undefined && (input.maxGoalDiff < 0 || input.maxGoalDiff > 255)) {
    throw new Error("maxGoalDiff must be between 0 and 255");
  }
}

export function validateResolveMarketInput(input: ResolveMarketInput): void {
  if (!input.matchId || input.matchId.trim() === "") {
    throw new Error("matchId is required");
  }
  if (input.marketId < 0 || input.marketId > 255) {
    throw new Error("marketId must be between 0 and 255");
  }
  if (!Object.values(MatchResult).includes(input.winner)) {
    throw new Error("winner must be a valid MatchResult");
  }
}

export function validateUpdateMarketStatusInput(input: UpdateMarketStatusInput): void {
  if (!input.matchId || input.matchId.trim() === "") {
    throw new Error("matchId is required");
  }
  if (input.marketId < 0 || input.marketId > 255) {
    throw new Error("marketId must be between 0 and 255");
  }
  if (!Object.values(MarketStatus).includes(input.status)) {
    throw new Error("status must be a valid MarketStatus");
  }
  if (input.status === MarketStatus.Resolved && !input.winner) {
    throw new Error("winner is required when status is Resolved");
  }
  if (input.winner && !Object.values(MatchResult).includes(input.winner)) {
    throw new Error("winner must be a valid MatchResult");
  }
}