import { PlayerError, deriveParodyPlayerPda, } from "./types.js";
import { baseYieldForRarityName } from "../economy/rarityYield.js";
const MAX_STATS_PER_MATCH = 10;
const GOAL_YIELD_PCT = 10;
const ASSIST_YIELD_PCT = 5;
const MAX_YIELD_MULTIPLIER = 2;
export async function updatePlayerStats(oracle, input) {
    const { playerId, goalsAdded, assistsAdded } = input;
    validateStats(playerId, goalsAdded, assistsAdded);
    console.log(`[Oracle] 👤 Updating Player Stats: ${playerId} (+${goalsAdded}G, +${assistsAdded}A)`);
    const parodyPlayerPda = deriveParodyPlayerPda(oracle.program.programId, playerId);
    try {
        const method = oracle.program.methods
            .updatePlayerStats(goalsAdded, assistsAdded)
            .accounts({
            oracleAuthority: oracle.wallet.publicKey,
            config: oracle.configPda,
            parodyPlayer: parodyPlayerPda,
        });
        const tx = await oracle.sendWithPriorityFees(method, [
            oracle.wallet.publicKey,
            oracle.configPda,
            parodyPlayerPda,
        ]);
        console.log(`[Oracle] ✅ Player ${playerId} stats updated! Tx: ${tx}`);
        return tx;
    }
    catch (error) {
        console.error(`[Oracle] ❌ Failed to update player ${playerId}:`, error);
        throw PlayerError.fromError("STATS_UPDATE_FAILED", error, { playerId, goalsAdded, assistsAdded });
    }
}
function validateStats(playerId, goals, assists) {
    if (goals < 0 || assists < 0 || goals > MAX_STATS_PER_MATCH || assists > MAX_STATS_PER_MATCH) {
        throw new PlayerError("INVALID_STATS_INPUT", `Stats out of range [0,${MAX_STATS_PER_MATCH}]: goals=${goals}, assists=${assists}`, undefined, { playerId, goals, assists });
    }
    validateYieldImpact(playerId, goals, assists);
}
function validateYieldImpact(playerId, goals, assists) {
    try {
        const rarity = playerId.split("_").pop()?.toLowerCase() ?? "unknown";
        const baseYield = baseYieldForRarityName(["mythic", "legendary", "epic", "rare", "unknown"].includes(rarity) ? rarity : "unknown");
        if (baseYield <= 0)
            throw new PlayerError("RARITY_VALIDATION_FAILED", `Invalid base yield for '${rarity}'`, undefined, { playerId, rarity });
        const yieldIncrease = baseYield * (goals * GOAL_YIELD_PCT + assists * ASSIST_YIELD_PCT) / 100;
        if (yieldIncrease > baseYield * MAX_YIELD_MULTIPLIER) {
            throw new PlayerError("RARITY_VALIDATION_FAILED", `Yield increase ${yieldIncrease} exceeds ${MAX_YIELD_MULTIPLIER}x base`, undefined, { playerId, rarity, baseYield, goals, assists, yieldIncrease });
        }
    }
    catch (e) {
        if (e instanceof PlayerError)
            throw e;
        console.warn(`[Oracle] ⚠️ Canonical yield validation skipped for ${playerId}:`, e);
    }
}
