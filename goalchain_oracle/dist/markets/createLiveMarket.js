import pkg from "@coral-xyz/anchor";
const { BN } = pkg;
import { SystemProgram, } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { toAnchorMarketType, validateMarketInput, deriveFixturePda, deriveMarketPda, } from "./types.js";
export async function createLiveMarket(deps, input) {
    validateMarketInput(input);
    console.log(`[Markets] 📈 Opening Live Market (ID: ${input.marketId}) for ${input.matchId}...`);
    const fixturePda = deriveFixturePda(deps.program.programId, input.matchId);
    const marketPda = deriveMarketPda(deps.program.programId, fixturePda, input.marketId);
    const cooldownSeconds = input.cooldownSeconds ?? 0;
    const maxGoalDiff = input.maxGoalDiff ?? 1;
    const requireTied = input.requireTied ?? true;
    const method = deps.program.methods
        .oracleCreateMarket(input.marketId, toAnchorMarketType(input.marketType), new BN(input.delaySeconds), new BN(cooldownSeconds), input.closeMinute, maxGoalDiff, requireTied, input.tokenMint)
        .accounts({
        oracleAuthority: deps.wallet.publicKey,
        config: deps.configPda,
        fixture: fixturePda,
        market: marketPda,
        tokenMint: input.tokenMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
    });
    const tx = await deps.sendWithPriorityFees(method, [
        deps.wallet.publicKey,
        deps.configPda,
        fixturePda,
        marketPda,
        input.tokenMint,
    ]);
    console.log(`[Markets] ✅ Live Market ${input.marketId} opened successfully! Tx: ${tx}`);
    return tx;
}
