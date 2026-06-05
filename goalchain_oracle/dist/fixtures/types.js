import { PublicKey } from "@solana/web3.js";
import pkg from "@coral-xyz/anchor";
const { BN } = pkg;
export class OracleError extends Error {
    code;
    originalError;
    context;
    constructor(code, message, originalError, context = {}) {
        super(message);
        this.name = "OracleError";
        this.code = code;
        this.originalError = originalError;
        this.context = context;
    }
    static fromError(code, error, context = {}) {
        const message = error instanceof Error ? error.message : String(error);
        return new OracleError(code, message, error, context);
    }
}
export function deriveFixturePda(programId, matchId) {
    const [pda] = PublicKey.findProgramAddressSync([Buffer.from("fixture"), Buffer.from(matchId)], programId);
    return pda;
}
export function deriveLiveStatePda(programId, fixturePda) {
    const [pda] = PublicKey.findProgramAddressSync([Buffer.from("live_state"), fixturePda.toBuffer()], programId);
    return pda;
}
export function deriveMarketPda(programId, fixturePda, marketId) {
    const [pda] = PublicKey.findProgramAddressSync([Buffer.from("market"), fixturePda.toBuffer(), Buffer.from([marketId])], programId);
    return pda;
}
export function deriveParodyPlayerPda(programId, playerId) {
    const [pda] = PublicKey.findProgramAddressSync([Buffer.from("player"), Buffer.from(playerId)], programId);
    return pda;
}
export function derivePlayerMatchRecordPda(programId, parodyPlayerPda, fixturePda) {
    const [pda] = PublicKey.findProgramAddressSync([Buffer.from("player_match"), parodyPlayerPda.toBuffer(), fixturePda.toBuffer()], programId);
    return pda;
}
