import {
  Connection,
  PublicKey,
} from "@solana/web3.js";
import type { Program } from "@coral-xyz/anchor";
// @ts-ignore
import { GoalchainProgram } from "../../../goalchain_program/target/types/goalchain_program";
import {
  UpdateMarketStatusInput,
  toAnchorMarketStatus,
  toAnchorMatchResult,
  validateUpdateMarketStatusInput,
  deriveFixturePda,
  deriveMarketPda,
  MarketStatus,
} from "./types.js";

export interface UpdateMarketStatusDeps {
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

export async function updateMarketStatus(
  deps: UpdateMarketStatusDeps,
  input: UpdateMarketStatusInput,
): Promise<string> {
  validateUpdateMarketStatusInput(input);

  console.log(
    `[Markets] 🔄 Updating Market (ID: ${input.marketId}) status to ${input.status} for ${input.matchId}...`,
  );

  const fixturePda = deriveFixturePda(deps.program.programId, input.matchId);
  const marketPda = deriveMarketPda(deps.program.programId, fixturePda, input.marketId);

  const anchorStatus = toAnchorMarketStatus(input.status);
  const anchorWinner = input.winner ? toAnchorMatchResult(input.winner) : null;

  const method = deps.program.methods
    .oracleUpdateMarketStatus(anchorStatus, anchorWinner)
    .accounts({
      oracleAuthority: deps.wallet.publicKey,
      config: deps.configPda,
      market: marketPda,
    } as any);

  const keysForPriority = [
    deps.wallet.publicKey,
    deps.configPda,
    marketPda,
  ];

  const tx = await deps.sendWithPriorityFees(method, keysForPriority);

  console.log(
    `[Markets] ✅ Market ${input.marketId} status updated to ${input.status}! Tx: ${tx}`,
  );
  return tx;
}

export async function closeMarket(
  deps: UpdateMarketStatusDeps,
  matchId: string,
  marketId: number,
): Promise<string> {
  return updateMarketStatus(deps, {
    matchId,
    marketId,
    status: MarketStatus.Closed,
  });
}

export async function cancelMarket(
  deps: UpdateMarketStatusDeps,
  matchId: string,
  marketId: number,
): Promise<string> {
  return updateMarketStatus(deps, {
    matchId,
    marketId,
    status: MarketStatus.Cancelled,
  });
}

export async function reopenMarket(
  deps: UpdateMarketStatusDeps,
  matchId: string,
  marketId: number,
): Promise<string> {
  return updateMarketStatus(deps, {
    matchId,
    marketId,
    status: MarketStatus.Open,
  });
}