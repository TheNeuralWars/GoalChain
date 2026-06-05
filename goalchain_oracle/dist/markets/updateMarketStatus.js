import { toAnchorMarketStatus, toAnchorMatchResult, validateUpdateMarketStatusInput, deriveFixturePda, deriveMarketPda, MarketStatus, } from "./types.js";
export async function updateMarketStatus(deps, input) {
    validateUpdateMarketStatusInput(input);
    console.log(`[Markets] 🔄 Updating Market (ID: ${input.marketId}) status to ${input.status} for ${input.matchId}...`);
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
    });
    const keysForPriority = [
        deps.wallet.publicKey,
        deps.configPda,
        marketPda,
    ];
    const tx = await deps.sendWithPriorityFees(method, keysForPriority);
    console.log(`[Markets] ✅ Market ${input.marketId} status updated to ${input.status}! Tx: ${tx}`);
    return tx;
}
export async function closeMarket(deps, matchId, marketId) {
    return updateMarketStatus(deps, {
        matchId,
        marketId,
        status: MarketStatus.Closed,
    });
}
export async function cancelMarket(deps, matchId, marketId) {
    return updateMarketStatus(deps, {
        matchId,
        marketId,
        status: MarketStatus.Cancelled,
    });
}
export async function reopenMarket(deps, matchId, marketId) {
    return updateMarketStatus(deps, {
        matchId,
        marketId,
        status: MarketStatus.Open,
    });
}
