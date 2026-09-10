"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pda = exports.SEEDS = exports.PROGRAM_ID = void 0;
exports.derivePda = derivePda;
exports.validatePda = validatePda;
const web3_js_1 = require("@solana/web3.js");
exports.PROGRAM_ID = new web3_js_1.PublicKey('FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg');
/**
 * PDA derivation utilities - single source of truth for all findProgramAddressSync calls.
 * All seeds must match the on-chain program's PDA derivations.
 */
exports.SEEDS = {
    CONFIG: 'config',
    STAKE: 'stake',
    PLAYER: 'player',
    RENTAL: 'rental',
    WAGER: 'wager',
    WAGER_VAULT: 'wager_vault',
    FIXTURE: 'fixture',
    FIXTURE_VAULT: 'fixture_vault',
    LIVE_STATE: 'live_state',
    MARKET: 'market',
    MARKET_VAULT: 'market_vault',
    POSITION: 'position',
    BUILDER_FUND: 'builder_fund',
    BUILDER_EPOCH: 'builder_epoch',
};
/**
 * Derives a PDA for a given seed and optional additional seeds.
 * @param seedKey - The primary seed identifier
 * @param additionalSeeds - Additional seeds (PublicKeys, buffers, strings, numbers)
 * @returns [PDA public key, bump seed]
 */
function derivePda(seedKey, ...additionalSeeds) {
    const seeds = [Buffer.from(exports.SEEDS[seedKey])];
    for (const seed of additionalSeeds) {
        if (seed instanceof web3_js_1.PublicKey) {
            seeds.push(seed.toBuffer());
        }
        else if (Buffer.isBuffer(seed)) {
            seeds.push(seed);
        }
        else if (seed instanceof Uint8Array) {
            seeds.push(seed);
        }
        else if (typeof seed === 'string') {
            seeds.push(Buffer.from(seed));
        }
        else if (typeof seed === 'number') {
            const buf = Buffer.alloc(8);
            buf.writeBigUInt64LE(BigInt(seed));
            seeds.push(buf);
        }
    }
    return web3_js_1.PublicKey.findProgramAddressSync(seeds, exports.PROGRAM_ID);
}
/**
 * Convenience functions for common PDA derivations
 */
exports.pda = {
    config: () => derivePda('CONFIG'),
    stake: (player) => derivePda('STAKE', player),
    player: (playerId) => derivePda('PLAYER', playerId),
    rental: (player, fixture) => derivePda('RENTAL', player, fixture),
    wager: (playerA, timestamp) => derivePda('WAGER', playerA, timestamp),
    wagerVault: (wager) => derivePda('WAGER_VAULT', wager),
    fixture: (matchId) => derivePda('FIXTURE', matchId),
    fixtureVault: (fixture) => derivePda('FIXTURE_VAULT', fixture),
    liveState: (fixture) => derivePda('LIVE_STATE', fixture),
    market: (fixture, outcomeIdx) => derivePda('MARKET', fixture, outcomeIdx),
    marketVault: (market) => derivePda('MARKET_VAULT', market),
    position: (player, market) => derivePda('POSITION', player, market),
    builderFund: (config) => derivePda('BUILDER_FUND', config),
    builderEpoch: (builderFund, epoch) => derivePda('BUILDER_EPOCH', builderFund, epoch),
};
/**
 * Validates that a given public key matches the expected PDA for a seed.
 * Useful for verifying accounts passed to instructions.
 */
function validatePda(expectedSeed, account, ...additionalSeeds) {
    const [derived] = derivePda(expectedSeed, ...additionalSeeds);
    return derived.equals(account);
}
