import * as anchor from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";

export function createDummyWallet(): anchor.Wallet {
  const dummyKeypair = Keypair.generate();
  return new anchor.Wallet(dummyKeypair);
}

export function loadWalletOrDummy(keypairPath: string, dryRun: boolean): anchor.Wallet | string {
  if (dryRun) {
    return createDummyWallet();
  }
  return keypairPath;
}

export function getWalletPublicKey(wallet: anchor.Wallet | string): string {
  if (typeof wallet === "string") {
    throw new Error("Cannot get public key from keypair path string");
  }
  return wallet.publicKey.toBase58();
}