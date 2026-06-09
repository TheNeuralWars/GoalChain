/**
 * Maps NFT rarity metadata to on-chain base_yield_rate (6-decimal lamports).
 * Loads defaults from docs/ECONOMIC_CANONICAL_CONFIG.json when available.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CANONICAL_CONFIG_PATH = path.resolve(__dirname, "../../../docs/ECONOMIC_CANONICAL_CONFIG.json");
export const GCH_LAMPORTS = 1_000_000;
export const RARITY_TIER = {
    rare: 1,
    epic: 2,
    legendary: 3,
    mythic: 4,
};
const DEFAULT_YIELD_BY_TIER = {
    0: 100 * GCH_LAMPORTS,
    [RARITY_TIER.rare]: 50 * GCH_LAMPORTS,
    [RARITY_TIER.epic]: 250 * GCH_LAMPORTS,
    [RARITY_TIER.legendary]: 1000 * GCH_LAMPORTS,
    [RARITY_TIER.mythic]: 5000 * GCH_LAMPORTS,
};
function loadYieldsFromCanonical() {
    try {
        const raw = JSON.parse(fs.readFileSync(CANONICAL_CONFIG_PATH, "utf8"));
        const yields = raw?.rarity_base_yields_lamports;
        if (!yields || typeof yields !== "object")
            return null;
        return {
            0: yields.unknown ?? DEFAULT_YIELD_BY_TIER[0],
            [RARITY_TIER.rare]: yields.rare ?? DEFAULT_YIELD_BY_TIER[RARITY_TIER.rare],
            [RARITY_TIER.epic]: yields.epic ?? DEFAULT_YIELD_BY_TIER[RARITY_TIER.epic],
            [RARITY_TIER.legendary]: yields.legendary ?? DEFAULT_YIELD_BY_TIER[RARITY_TIER.legendary],
            [RARITY_TIER.mythic]: yields.mythic ?? DEFAULT_YIELD_BY_TIER[RARITY_TIER.mythic],
        };
    }
    catch {
        return null;
    }
}
const YIELD_BY_TIER = loadYieldsFromCanonical() ?? DEFAULT_YIELD_BY_TIER;
export function baseYieldForRarityTier(tier) {
    return YIELD_BY_TIER[tier] ?? YIELD_BY_TIER[0];
}
export function baseYieldForRarityName(rarity) {
    const tier = RARITY_TIER[rarity];
    return tier !== undefined ? baseYieldForRarityTier(tier) : YIELD_BY_TIER[0];
}
/** Tiered potion burn: max(25, 5% of daily gross base yield) in GCH whole units. */
export function tieredPotionBurnGch(baseYieldLamports) {
    const baseGch = baseYieldLamports / GCH_LAMPORTS;
    return Math.max(25, Math.floor(baseGch * 0.05));
}
