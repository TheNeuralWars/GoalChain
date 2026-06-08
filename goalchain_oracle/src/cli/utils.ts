import * as anchor from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

export function createDummyWallet(): anchor.Wallet {
  const dummyKeypair = Keypair.generate();
  return new anchor.Wallet(dummyKeypair);
}

/**
 * Load a wallet from keypair file, or return a dummy wallet for dry-run.
 * Always returns anchor.Wallet (never a string) so callers can safely access .publicKey
 */
export function loadWalletOrDummy(keypairPath: string, dryRun: boolean): anchor.Wallet {
  if (dryRun) {
    return createDummyWallet();
  }

  // Resolve tilde path
  const resolvedPath = keypairPath.startsWith("~")
    ? keypairPath.replace("~", process.env.HOME || "")
    : keypairPath;

  const secretKey = JSON.parse(fs.readFileSync(path.resolve(resolvedPath), "utf8"));
  const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
  return new anchor.Wallet(keypair);
}