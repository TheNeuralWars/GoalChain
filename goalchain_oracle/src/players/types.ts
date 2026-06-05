import { PublicKey } from "@solana/web3.js";

export interface PlayerMatchInput {
  matchId: string;
  playerId: string;
}

export interface PlayerStatsInput {
  playerId: string;
  goalsAdded: number;
  assistsAdded: number;
}

export type PlayerErrorCode =
  | "PLAYER_RECORD_FAILED"
  | "STATS_UPDATE_FAILED"
  | "INVALID_STATS_INPUT"
  | "RARITY_VALIDATION_FAILED";

export class PlayerError extends Error {
  public readonly code: PlayerErrorCode;
  public readonly originalError: Error | unknown;
  public readonly context: Record<string, unknown>;

  constructor(
    code: PlayerErrorCode,
    message: string,
    originalError?: Error | unknown,
    context: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "PlayerError";
    this.code = code;
    this.originalError = originalError;
    this.context = context;
  }

  static fromError(
    code: PlayerErrorCode,
    error: Error | unknown,
    context: Record<string, unknown> = {},
  ): PlayerError {
    const message = error instanceof Error ? error.message : String(error);
    return new PlayerError(code, message, error, context);
  }
}

export {
  deriveFixturePda,
  deriveParodyPlayerPda,
  derivePlayerMatchRecordPda,
} from "../fixtures/types.js";