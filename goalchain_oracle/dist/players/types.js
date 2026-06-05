export class PlayerError extends Error {
    code;
    originalError;
    context;
    constructor(code, message, originalError, context = {}) {
        super(message);
        this.name = "PlayerError";
        this.code = code;
        this.originalError = originalError;
        this.context = context;
    }
    static fromError(code, error, context = {}) {
        const message = error instanceof Error ? error.message : String(error);
        return new PlayerError(code, message, error, context);
    }
}
export { deriveFixturePda, deriveParodyPlayerPda, derivePlayerMatchRecordPda, } from "../fixtures/types.js";
