import { SystemProgram } from "@solana/web3.js";
import { OracleError, deriveFixturePda, deriveParodyPlayerPda, derivePlayerMatchRecordPda } from "./types.js";
export async function recordPlayerMatch(oracle, input) {
    const { matchId, playerId } = input;
    console.log(`[Oracle] 🧾 Recording match participation: ${playerId} in ${matchId}`);
    const fixturePda = deriveFixturePda(oracle.program.programId, matchId);
    const parodyPlayerPda = deriveParodyPlayerPda(oracle.program.programId, playerId);
    const playerMatchRecordPda = derivePlayerMatchRecordPda(oracle.program.programId, parodyPlayerPda, fixturePda);
    try {
        const method = oracle.program.methods.oracleRecordMatch().accounts({
            oracleAuthority: oracle.wallet.publicKey,
            config: oracle.configPda,
            parodyPlayer: parodyPlayerPda,
            fixture: fixturePda,
            playerMatchRecord: playerMatchRecordPda,
            systemProgram: SystemProgram.programId,
        });
        const tx = await oracle.sendWithPriorityFees(method, [
            oracle.wallet.publicKey,
            oracle.configPda,
            parodyPlayerPda,
            fixturePda,
            playerMatchRecordPda,
        ]);
        console.log(`[Oracle] ✅ Player match participation recorded for ${playerId} (${matchId}). Tx: ${tx}`);
        return tx;
    }
    catch (error) {
        console.error(`[Oracle] ❌ Failed to record player match for ${playerId} (${matchId}):`, error);
        throw OracleError.fromError("PLAYER_RECORD_FAILED", error, { matchId, playerId });
    }
}
