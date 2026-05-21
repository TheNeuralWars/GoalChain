import { Transaction } from "@solana/web3.js";
/**
 * KmsWallet implements the Anchor Wallet interface using a remote signer (AWS KMS, Turnkey, etc.).
 * This keeps private keys isolated from the runtime memory space.
 */
export class KmsWallet {
    publicKey;
    signFn;
    constructor(publicKey, signFn) {
        this.publicKey = publicKey;
        this.signFn = signFn;
    }
    async signTransaction(tx) {
        if (tx instanceof Transaction) {
            // Standard transaction signing
            const message = tx.serializeMessage();
            const signature = await this.signFn(message);
            tx.addSignature(this.publicKey, signature);
        }
        else {
            // Versioned transaction signing
            const message = Buffer.from(tx.message.serialize());
            const signature = await this.signFn(message);
            tx.addSignature(this.publicKey, signature);
        }
        return tx;
    }
    async signAllTransactions(txs) {
        return Promise.all(txs.map((tx) => this.signTransaction(tx)));
    }
    /**
     * Anchor Wallet compatibility check.
     * Note: Remote signers do not expose the raw Secret Key. Calling payer will throw an error.
     * Instead, use transaction-level signing methods.
     */
    get payer() {
        throw new Error("Payer raw Keypair is not accessible in KmsWallet to prevent key exposure. Use signTransaction.");
    }
}
