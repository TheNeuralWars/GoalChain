import { PublicKey } from '@solana/web3.js';
import idl from './goalchain_program.json';

export const PROGRAM_ID = new PublicKey("FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg");

export { idl };
export type { GoalchainProgram } from './goalchain_program';

export const SEEDS = {
    CONFIG: "config",
    STAKE: "stake",
    PLAYER: "player",
    RENTAL: "rental",
    WAGER: "wager",
    WAGER_VAULT: "wager_vault",
    FIXTURE: "fixture",
    FIXTURE_VAULT: "fixture_vault",
    LIVE_STATE: "live_state",
    MARKET: "market",
    MARKET_VAULT: "market_vault",
    POSITION: "position",
};
