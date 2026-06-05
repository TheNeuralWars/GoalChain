import pkg from "@coral-xyz/anchor";
const { BN } = pkg;
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { Program } from "@coral-xyz/anchor";
// @ts-ignore
import { GoalchainProgram } from "../../../goalchain_program/target/types/goalchain_program";
import {
  MarketInput,
  toAnchorMarketType,
  validateMarketInput,
  deriveFixturePda,
  deriveMarketPda,
} from "./types.js";
import { getPriorityFeeInstructions } from "../priorityFees.js";

export interface CreateLiveMarketDeps {
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

export async function createLiveMarket(
  deps: CreateLiveMarketDeps,
  input: MarketInput,
): Promise<string> {
  validateMarketInput(input);

  console.log(
    `[Markets] 📈 Opening Live Market (ID: ${input.marketId}) for ${input.matchId}...`,
  );

  const fixturePda = deriveFixturePda(deps.program.programId, input.matchId);
  const marketPda = deriveMarketPda(deps.program.programId, fixturePda, input.marketId);

  const cooldownSeconds = input.cooldownSeconds ?? 0;
  const maxGoalDiff = input.maxGoalDiff ?? 1;
  const requireTied = input.requireTied ?? true;

  const method = deps.program.methods
    .oracleCreateMarket(
      input.marketId,
      toAnchorMarketType(input.marketType),
      new BN(input.delaySeconds),
      new BN(cooldownSeconds),
      input.closeMinute,
      maxGoalDiff,
      requireTied,
      input.tokenMint,
    )
    .accounts({
      oracleAuthority: deps.wallet.publicKey,
      config: deps.configPda,
      fixture: fixturePda,
      market: marketPda,
      tokenMint: input.tokenMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    } as any);

  const tx = await deps.sendWithPriorityFees(method, [
    deps.wallet.publicKey,
    deps.configPda,
    fixturePda,
    marketPda,
    input.tokenMint,
  ]);

  console.log(
    `[Markets] ✅ Live Market ${input.marketId} opened successfully! Tx: ${tx}`,
  );
  return tx;
}