import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

/**
 * SecureSigner wraps transaction signing, enabling integration with KMS (AWS Key Management Service)
 * or Turnkey secure enclaves instead of exposing raw private keys on servers.
 */
export interface SecureSigner {
    publicKey: PublicKey;
    signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>;
}

/**
 * KmsWallet implements the Anchor Wallet interface using a remote signer (AWS KMS, Turnkey, etc.).
 * This keeps private keys isolated from the runtime memory space.
 */
export class KmsWallet implements anchor.Wallet {
    constructor(
        public publicKey: PublicKey,
        private signFn: (message: Buffer) => Promise<Buffer>
    ) {}

    async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
        if (tx instanceof Transaction) {
            // Standard transaction signing
            const message = tx.serializeMessage();
            const signature = await this.signFn(message);
            tx.addSignature(this.publicKey, signature);
        } else {
            // Versioned transaction signing
            const message = Buffer.from(tx.message.serialize());
            const signature = await this.signFn(message);
            tx.addSignature(this.publicKey, signature);
        }
        return tx;
    }

    async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
        return Promise.all(txs.map((tx) => this.signTransaction(tx)));
    }

    /**
     * Anchor Wallet compatibility check.
     * Note: Remote signers do not expose the raw Secret Key. Calling payer will throw an error.
     * Instead, use transaction-level signing methods.
     */
    get payer(): any {
        throw new Error(
            "Payer raw Keypair is not accessible in KmsWallet to prevent key exposure. Use signTransaction."
        );
    }
}
