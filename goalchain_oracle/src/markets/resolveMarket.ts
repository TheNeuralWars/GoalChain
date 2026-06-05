import pkg from "@coral-xyz/anchor";
const { BN } = pkg;
import {
  Connection,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import type { Program } from "@coral-xyz/anchor";
// @ts-ignore
import { GoalchainProgram } from "../../../goalchain_program/target/types/goalchain_program";
import {
  ResolveMarketInput,
  toAnchorMarketStatus,
  toAnchorMatchResult,
  validateResolveMarketInput,
  deriveFixturePda,
  deriveMarketPda,
} from "./types.js";
import { getPriorityFeeInstructions } from "../priorityFees.js";

export interface ResolveMarketDeps {
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

export async function resolveMarket(
  deps: ResolveMarketDeps,
  input: ResolveMarketInput,
): Promise<string> {
  validateResolveMarketInput(input);

  console.log(
    `[Markets] ⚖️ Resolving Live Market (ID: ${input.marketId}) for ${input.matchId}...`,
  );

  const fixturePda = deriveFixturePda(deps.program.programId, input.matchId);
  const marketPda = deriveMarketPda(deps.program.programId, fixturePda, input.marketId);

  const method = deps.program.methods
    .oracleUpdateMarketStatus(
      toAnchorMarketStatus("Resolved" as any),
      toAnchorMatchResult(input.winner),
    )
    .accounts({
      oracleAuthority: deps.wallet.publicKey,
      config: deps.configPda,
      market: marketPda,
    } as any);

  const tx = await deps.sendWithPriorityFees(method, [
    deps.wallet.publicKey,
    deps.configPda,
    marketPda,
  ]);

  console.log(`[Markets] ✅ Live Market ${input.marketId} resolved! Tx: ${tx}`);
  return tx;
}