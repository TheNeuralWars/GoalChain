import pkg from "@coral-xyz/anchor";
const { BN } = pkg;
import { toAnchorMarketStatus, toAnchorMatchResult, validateResolveMarketInput, deriveFixturePda, deriveMarketPda, } from "./types.js";
export async function resolveMarket(deps, input) {
    validateResolveMarketInput(input);
    console.log(`[Markets] ⚖️ Resolving Live Market (ID: ${input.marketId}) for ${input.matchId}...`);
    const fixturePda = deriveFixturePda(deps.program.programId, input.matchId);
    const marketPda = deriveMarketPda(deps.program.programId, fixturePda, input.marketId);
    const method = deps.program.methods
        .oracleUpdateMarketStatus(toAnchorMarketStatus("Resolved"), toAnchorMatchResult(input.winner))
        .accounts({
        oracleAuthority: deps.wallet.publicKey,
        config: deps.configPda,
        market: marketPda,
    });
    const tx = await deps.sendWithPriorityFees(method, [
        deps.wallet.publicKey,
        deps.configPda,
        marketPda,
    ]);
    console.log(`[Markets] ✅ Live Market ${input.marketId} resolved! Tx: ${tx}`);
    return tx;
}
