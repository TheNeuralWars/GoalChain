import { PublicKey } from '@solana/web3.js';
export declare const PROGRAM_ID: PublicKey;
/**
 * PDA derivation utilities - single source of truth for all findProgramAddressSync calls.
 * All seeds must match the on-chain program's PDA derivations.
 */
export declare const SEEDS: {
    readonly CONFIG: "config";
    readonly STAKE: "stake";
    readonly PLAYER: "player";
    readonly RENTAL: "rental";
    readonly WAGER: "wager";
    readonly WAGER_VAULT: "wager_vault";
    readonly FIXTURE: "fixture";
    readonly FIXTURE_VAULT: "fixture_vault";
    readonly LIVE_STATE: "live_state";
    readonly MARKET: "market";
    readonly MARKET_VAULT: "market_vault";
    readonly POSITION: "position";
    readonly BUILDER_FUND: "builder_fund";
    readonly BUILDER_EPOCH: "builder_epoch";
};
export type SeedKey = keyof typeof SEEDS;
/**
 * Derives a PDA for a given seed and optional additional seeds.
 * @param seedKey - The primary seed identifier
 * @param additionalSeeds - Additional seeds (PublicKeys, buffers, strings, numbers)
 * @returns [PDA public key, bump seed]
 */
export declare function derivePda(seedKey: SeedKey, ...additionalSeeds: Array<PublicKey | Buffer | string | number | Uint8Array>): [PublicKey, number];
/**
 * Convenience functions for common PDA derivations
 */
export declare const pda: {
    config: () => [PublicKey, number];
    stake: (player: PublicKey) => [PublicKey, number];
    player: (playerId: string) => [PublicKey, number];
    rental: (player: PublicKey, fixture: PublicKey) => [PublicKey, number];
    wager: (playerA: PublicKey, timestamp: number) => [PublicKey, number];
    wagerVault: (wager: PublicKey) => [PublicKey, number];
    fixture: (matchId: string) => [PublicKey, number];
    fixtureVault: (fixture: PublicKey) => [PublicKey, number];
    liveState: (fixture: PublicKey) => [PublicKey, number];
    market: (fixture: PublicKey, outcomeIdx: number) => [PublicKey, number];
    marketVault: (market: PublicKey) => [PublicKey, number];
    position: (player: PublicKey, market: PublicKey) => [PublicKey, number];
    builderFund: (config: PublicKey) => [PublicKey, number];
    builderEpoch: (builderFund: PublicKey, epoch: number) => [PublicKey, number];
};
/**
 * Validates that a given public key matches the expected PDA for a seed.
 * Useful for verifying accounts passed to instructions.
 */
export declare function validatePda(expectedSeed: SeedKey, account: PublicKey, ...additionalSeeds: Array<PublicKey | Buffer | string | number | Uint8Array>): boolean;
