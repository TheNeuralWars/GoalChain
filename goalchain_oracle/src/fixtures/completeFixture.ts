import { SystemProgram } from "@solana/web3.js";
import type { Program } from "@coral-xyz/anchor";
// @ts-ignore
import { GoalchainProgram } from "../../../goalchain_program/target/types/goalchain_program";
import { OracleService } from "../OracleService.js";
import { CompleteFixtureInput, OracleError, deriveFixturePda } from "./types.js";
import { recordPlayerMatch } from "./recordPlayerMatch.js";

export async function completeFixture(
  oracle: OracleService,
  input: CompleteFixtureInput,
): Promise<string> {
  const { matchId, winner, participantPlayerIds } = input;
  console.log(`[Oracle] 🏁 Completing Fixture ${matchId}...`);

  const fixturePda = deriveFixturePda(oracle.program.programId, matchId);

  try {
    const method = oracle.program.methods
      .updateFixtureStatus({ completed: {} }, winner)
      .accounts({
        oracleAuthority: oracle.wallet.publicKey,
        config: oracle.configPda,
        fixture: fixturePda,
      } as any);

    const tx = await oracle.sendWithPriorityFees(method, [
      oracle.wallet.publicKey,
      oracle.configPda,
      fixturePda,
    ]);

    console.log(`[Oracle] ✅ Fixture ${matchId} completed! Tx: ${tx}`);

    const recordOnComplete = process.env.ORACLE_RECORD_MATCH_ON_COMPLETE !== "false";
    const participants = participantPlayerIds ?? [];

    if (recordOnComplete && participants.length > 0) {
      for (const playerId of participants) {
        try {
          await recordPlayerMatch(oracle, { matchId, playerId });
        } catch (recordErr) {
          console.warn(`[Oracle] recordPlayerMatch skipped for ${playerId} (${matchId}):`, recordErr);
        }
      }
    }

    return tx;
  } catch (error) {
    console.error(`[Oracle] ❌ Failed to complete fixture ${matchId}:`, error);
    throw OracleError.fromError("COMPLETION_FAILED", error, { matchId, winner, participantPlayerIds });
  }
}