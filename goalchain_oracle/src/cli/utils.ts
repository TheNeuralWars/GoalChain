import * as anchor from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

export function createDummyWallet(): anchor.Wallet {
  const dummyKeypair = Keypair.generate();
  return new anchor.Wallet(dummyKeypair);
}

export function loadWalletOrDummy(keypairPath: string, dryRun: boolean): anchor.Wallet {
  if (dryRun) {
    return createDummyWallet();
  }
  try {
    const resolved = keypairPath.startsWith("~")
      ? keypairPath.replace("~", process.env.HOME || "")
      : keypairPath;
    const secretKey = JSON.parse(fs.readFileSync(path.resolve(resolved), "utf8"));
    const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
    return new anchor.Wallet(keypair);
  } catch {
    return createDummyWallet();
  }
}

export function getWalletPublicKey(wallet: anchor.Wallet): string {
  return wallet.publicKey.toBase58();
}