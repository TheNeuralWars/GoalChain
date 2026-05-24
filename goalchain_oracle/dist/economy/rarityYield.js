/**
 * Maps NFT rarity metadata to on-chain base_yield_rate (6-decimal lamports).
 * Keep in sync with goalchain_program::base_yield_for_rarity_tier.
 */
export const GCH_LAMPORTS = 1_000_000;
export const RARITY_TIER = {
    rare: 1,
    epic: 2,
    legendary: 3,
    mythic: 4,
};
const YIELD_BY_TIER = {
    0: 100 * GCH_LAMPORTS,
    [RARITY_TIER.rare]: 50 * GCH_LAMPORTS,
    [RARITY_TIER.epic]: 250 * GCH_LAMPORTS,
    [RARITY_TIER.legendary]: 1000 * GCH_LAMPORTS,
    [RARITY_TIER.mythic]: 5000 * GCH_LAMPORTS,
};
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
