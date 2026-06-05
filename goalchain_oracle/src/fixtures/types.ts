import { PublicKey } from "@solana/web3.js";
import pkg from "@coral-xyz/anchor";
const { BN } = pkg;

export interface FixtureInput {
  matchId: string;
  teamA: string;
  teamB: string;
  startTime: number;
}

export interface LiveStateInput {
  matchId: string;
  minute: number;
  scoreA: number;
  scoreB: number;
  isHt: boolean;
  isFt: boolean;
}

export interface PlayerMatchRecord {
  matchId: string;
  playerId: string;
}

export interface PlayerStatsUpdate {
  playerId: string;
  goalsAdded: number;
  assistsAdded: number;
}

export interface CompleteFixtureInput {
  matchId: string;
  winner: any;
  participantPlayerIds?: string[];
}

export type OracleErrorCode =
  | "INIT_FAILED"
  | "LIVE_UPDATE_FAILED"
  | "COMPLETION_FAILED"
  | "PLAYER_RECORD_FAILED"
  | "STATS_UPDATE_FAILED"
  | "MARKET_CREATION_FAILED"
  | "MARKET_RESOLUTION_FAILED"
  | "AUTHORITY_SYNC_FAILED";

export class OracleError extends Error {
  public readonly code: OracleErrorCode;
  public readonly originalError: Error | unknown;
  public readonly context: Record<string, unknown>;

  constructor(
    code: OracleErrorCode,
    message: string,
    originalError?: Error | unknown,
    context: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "OracleError";
    this.code = code;
    this.originalError = originalError;
    this.context = context;
  }

  static fromError(
    code: OracleErrorCode,
    error: Error | unknown,
    context: Record<string, unknown> = {},
  ): OracleError {
    const message = error instanceof Error ? error.message : String(error);
    return new OracleError(code, message, error, context);
  }
}

export interface PdaSet {
  fixturePda: PublicKey;
  liveStatePda?: PublicKey;
  marketPda?: PublicKey;
  parodyPlayerPda?: PublicKey;
  playerMatchRecordPda?: PublicKey;
}

export function deriveFixturePda(programId: PublicKey, matchId: string): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("fixture"), Buffer.from(matchId)],
    programId,
  );
  return pda;
}

export function deriveLiveStatePda(programId: PublicKey, fixturePda: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("live_state"), fixturePda.toBuffer()],
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

export function deriveParodyPlayerPda(programId: PublicKey, playerId: string): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("player"), Buffer.from(playerId)],
    programId,
  );
  return pda;
}

export function derivePlayerMatchRecordPda(
  programId: PublicKey,
  parodyPlayerPda: PublicKey,
  fixturePda: PublicKey,
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("player_match"), parodyPlayerPda.toBuffer(), fixturePda.toBuffer()],
    programId,
  );
  return pda;
}