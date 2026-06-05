import { SystemProgram } from "@solana/web3.js";
import { OracleError, deriveFixturePda, deriveLiveStatePda } from "./types.js";
export async function upsertLiveState(oracle, input) {
    const { matchId, minute, scoreA, scoreB, isHt, isFt } = input;
    console.log(`[Oracle] ⚽ Live Update [${matchId}]: Min ${minute} | Score: ${scoreA}-${scoreB} | HT: ${isHt} FT: ${isFt}`);
    const fixturePda = deriveFixturePda(oracle.program.programId, matchId);
    const liveStatePda = deriveLiveStatePda(oracle.program.programId, fixturePda);
    try {
        const method = oracle.program.methods
            .oracleUpsertLiveState(minute, scoreA, scoreB, isHt, isFt)
            .accounts({
            oracleAuthority: oracle.wallet.publicKey,
            config: oracle.configPda,
            fixture: fixturePda,
            liveState: liveStatePda,
            systemProgram: SystemProgram.programId,
        });
        const tx = await oracle.sendWithPriorityFees(method, [
            oracle.wallet.publicKey,
            oracle.configPda,
            fixturePda,
            liveStatePda,
        ]);
        console.log(`[Oracle] ✅ Live state updated for ${matchId}. Tx: ${tx}`);
        return tx;
    }
    catch (error) {
        console.error(`[Oracle] ❌ Failed to update live state for ${matchId}:`, error);
        throw OracleError.fromError("LIVE_UPDATE_FAILED", error, { matchId, minute, scoreA, scoreB, isHt, isFt });
    }
}
