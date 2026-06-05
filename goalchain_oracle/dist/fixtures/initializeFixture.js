import { SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { OracleError, deriveFixturePda } from "./types.js";
export async function initializeFixture(oracle, input) {
    const { matchId, teamA, teamB, startTime } = input;
    console.log(`[Oracle] 🏟️ Initializing Fixture: ${teamA} vs ${teamB} (${matchId})`);
    const fixturePda = deriveFixturePda(oracle.program.programId, matchId);
    try {
        const method = oracle.program.methods
            .initializeFixture(matchId, teamA, teamB, new BN(startTime))
            .accounts({
            oracleAuthority: oracle.wallet.publicKey,
            config: oracle.configPda,
            fixture: fixturePda,
            systemProgram: SystemProgram.programId,
        });
        const tx = await oracle.sendWithPriorityFees(method, [
            oracle.wallet.publicKey,
            oracle.configPda,
            fixturePda,
        ]);
        console.log(`[Oracle] ✅ Fixture ${matchId} initialized! Tx: ${tx}`);
        return tx;
    }
    catch (error) {
        console.error(`[Oracle] ❌ Failed to initialize fixture ${matchId}:`, error);
        throw OracleError.fromError("INIT_FAILED", error, { matchId, teamA, teamB, startTime });
    }
}
