import * as anchor from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
export function createDummyWallet() {
    const dummyKeypair = Keypair.generate();
    return new anchor.Wallet(dummyKeypair);
}
export function loadWalletOrDummy(keypairPath, dryRun) {
    if (dryRun) {
        return createDummyWallet();
    }
    return keypairPath;
}
