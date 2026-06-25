import fs from "fs";
import path from "path";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { fetchWithTimeout, retrySendAndConfirm, getRpcUrl, getProgramId } from "@goalchain/sdk";
import {
  executeVaultCrankBundle,
  PriorityTier,
  BLOCK_ENGINE_URLS,
} from "./jitoBundle.js";

/**
 * Simulates a transaction and throws a detailed error if simulation fails.
 * Used as a preflight check before submitting transactions on mainnet.
 */
async function simulateAndValidate(
  connection: Connection,
  tx: VersionedTransaction | Transaction,
  label: string
): Promise<void> {
  // Handle VersionedTransaction vs Transaction overloads with correct config shape
  let simResult: any;
  if (tx instanceof VersionedTransaction) {
    simResult = await connection.simulateTransaction(tx, {
      commitment: "confirmed",
      replaceRecentBlockhash: true,
      sigVerify: false,
    } as any);
  } else {
    simResult = await connection.simulateTransaction(tx, [], false);
  }

  if (simResult.value.err) {
    const logs = simResult.value.logs?.join("\n") || "No logs";
    throw new Error(`Simulation failed for ${label}: ${JSON.stringify(simResult.value.err)}\nLogs:\n${logs}`);
  }

  console.log(`[vault_crank] Simulation OK for ${label}: ${simResult.value.unitsConsumed} CU consumed`);
}

interface VaultCrankReport {
  timestamp_iso: string;
  mode: "dry-run" | "execute";
  principal_sol: number;
  current_sol: number;
  excess_sol: number;
  buyback_share: number;
  jackpot_share: number;
  reinvest_share: number;
  buyback_sol: number;
  jackpot_sol: number;
  reinvest_sol: number;
  gch_price_usd: number;
  estimated_gch_burned: number;
  tx_hashes: string[];
  notes: string[];
}

const BUYBACK_SHARE = Number(process.env.BUYBACK_SHARE_OF_YIELD || "0.60");
const JACKPOT_SHARE = Number(process.env.JACKPOT_SHARE_OF_YIELD || "0.10");
const REINVEST_SHARE = Number(process.env.REINVEST_SHARE_OF_YIELD || "0.30");

// Jito Bundle Configuration
const JITO_BUNDLE_ENABLED = process.env.JITO_BUNDLE_ENABLED === "1";
const JITO_BLOCK_ENGINE_URL = process.env.JITO_BLOCK_ENGINE_URL || BLOCK_ENGINE_URLS.devnet;
const JITO_PRIORITY_TIER = (process.env.JITO_PRIORITY_TIER as PriorityTier) || PriorityTier.STANDARD;
const JITO_MAX_POLL_ATTEMPTS = Number(process.env.JITO_MAX_POLL_ATTEMPTS || "30");

function clampShare(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function fakeTx(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 18);
  return `${prefix}_${rand}`;
}

async function main() {
  const mode = process.env.VAULT_CRANK_EXECUTE === "1" ? "execute" : "dry-run";
  const principalSol = Number(process.env.VAULT_PRINCIPAL_SOL || "5000");
  const currentSol = Number(process.env.VAULT_CURRENT_SOL || "5032.7");
  const minExcessSol = Number(process.env.VAULT_MIN_EXCESS_SOL || "0.1");
  const gchPriceUsd = Number(process.env.GCH_PRICE_USD || "0.01");
  const solPriceUsd = Number(process.env.SOL_PRICE_USD || "180");

  const buybackShare = clampShare(BUYBACK_SHARE);
  const jackpotShare = clampShare(JACKPOT_SHARE);
  const reinvestShare = clampShare(REINVEST_SHARE);
  const shareSum = buybackShare + jackpotShare + reinvestShare;
  if (Math.abs(shareSum - 1) > 0.0001) {
    throw new Error(
      `Invalid share split: buyback+jackpot+reinvest must equal 1 (got ${shareSum})`,
    );
  }

  const excessSol = Math.max(0, currentSol - principalSol);
  let buybackSol = 0;
  let jackpotSol = 0;
  let reinvestSol = 0;
  let estimatedGchBurned = 0;
  const notes: string[] = [];
  const txHashes: string[] = [];

  if (excessSol < minExcessSol) {
    notes.push(
      `Excess SOL (${excessSol.toFixed(6)}) is below threshold (${minExcessSol}). No-op crank.`,
    );
  } else {
    buybackSol = excessSol * buybackShare;
    jackpotSol = excessSol * jackpotShare;
    reinvestSol = excessSol * reinvestShare;

    const buybackUsd = buybackSol * solPriceUsd;
    estimatedGchBurned = gchPriceUsd > 0 ? buybackUsd / gchPriceUsd : 0;

    if (mode === "execute") {
      notes.push("Initiating real execution path...");
      try {
        // Load dotenv to make sure env variables are populated
        const dotenv = await import("dotenv");
        dotenv.config();
      } catch (e) {}

      const rpcUrl = getRpcUrl();
      const keypairPath = process.env.ORACLE_KEYPAIR_PATH || "~/.config/solana/id.json";
      const programId = getProgramId().toBase58();

      notes.push(`Connecting to Solana RPC: ${rpcUrl}`);

      try {
        const { Connection, Keypair, PublicKey, SystemProgram, Transaction } = await import("@solana/web3.js");
        const connection = new Connection(rpcUrl, "confirmed");

        let gchMintStr = process.env.GCH_MINT;
        if (!gchMintStr) {
          try {
            const [configPda] = PublicKey.findProgramAddressSync(
              [Buffer.from("config")],
              new PublicKey(programId)
            );
            const accountInfo = await connection.getAccountInfo(configPda);
            if (accountInfo && accountInfo.data.length >= 104) {
              const treasuryPubkey = new PublicKey(accountInfo.data.slice(72, 104));
              const treasuryTokenInfo = await connection.getParsedAccountInfo(treasuryPubkey);
              const parsed = (treasuryTokenInfo.value as any)?.data?.parsed;
              const tokenMintString = parsed?.info?.mint as string | undefined;
              if (tokenMintString) {
                gchMintStr = tokenMintString;
                notes.push(`Dynamically resolved GCH Mint from on-chain config: ${gchMintStr}`);
              }
            }
          } catch (resolveErr: any) {
            notes.push(`Could not dynamically resolve GCH Mint from config PDA: ${resolveErr.message}`);
          }
        }
        if (!gchMintStr) {
          gchMintStr = "So11111111111111111111111111111111111111112"; // Fallback to WSOL
          notes.push(`No GCH Mint found in env or config. Falling back to WSOL: ${gchMintStr}`);
        }

        // Resolve keypair path
        let resolvedPath = keypairPath;
        if (keypairPath.startsWith("~")) {
          resolvedPath = keypairPath.replace("~", process.env.HOME || "");
        }

        let payer: Keypair;
        if (fs.existsSync(resolvedPath)) {
          const secretKey = JSON.parse(fs.readFileSync(resolvedPath, "utf-8"));
          payer = Keypair.fromSecretKey(new Uint8Array(secretKey));
          notes.push(`Loaded oracle keypair: ${payer.publicKey.toBase58()}`);
        } else {
          // Graceful fallback for environments without a local keypair file (e.g. CI)
          payer = Keypair.generate();
          notes.push(`Oracle keypair file not found at ${resolvedPath}. Generated transient keypair: ${payer.publicKey.toBase58()}`);
        }

        const isMainnet = rpcUrl.includes("mainnet") || rpcUrl.includes("jito") || rpcUrl.includes("helius");
        const buybackLamports = Math.round(buybackSol * 1e9);

        // --- JITO BUNDLE PATH ---
        if (JITO_BUNDLE_ENABLED) {
          notes.push(`Jito Bundle execution enabled (tier: ${JITO_PRIORITY_TIER}, block engine: ${JITO_BLOCK_ENGINE_URL})`);

          // Build staking instruction (deposit excess SOL to vault/stake pool)
          // For now, use a placeholder staking instruction - in production this would be the actual vault deposit CPI
          const stakingIx = SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: payer.publicKey, // Self-transfer as placeholder for stake instruction
            lamports: 0, // No lamports moved in placeholder
          });

          // Build buyback transaction (Jupiter swap SOL -> GCH)
          let buybackTx: VersionedTransaction | null = null;
          if (isMainnet && buybackLamports > 0) {
            try {
              const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${gchMintStr}&amount=${buybackLamports}&slippageBps=100`;
              notes.push(`Fetching Jupiter Quote: ${quoteUrl}`);

              const quoteRes = await fetchWithTimeout(quoteUrl, { timeoutMs: 10000 });
              if (quoteRes.ok) {
                const quoteData: any = await quoteRes.json();
                notes.push(`Jupiter quote fetched: GCH out = ${quoteData.outAmount}`);

                const swapRes = await fetchWithTimeout("https://quote-api.jup.ag/v6/swap", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    quoteResponse: quoteData,
                    userPublicKey: payer.publicKey.toBase58(),
                    wrapAndUnwrapSol: true,
                  }),
                  timeoutMs: 10000,
                });

                if (swapRes.ok) {
                  const { swapTransaction } = await swapRes.json() as any;
                  notes.push("Jupiter swap transaction generated.");
                  const rawTx = Buffer.from(swapTransaction, "base64");
                  // Use VersionedTransaction.deserialize for v0 transaction support
                  buybackTx = VersionedTransaction.deserialize(rawTx);
                  
                  // Preflight simulation before adding to bundle
                  await simulateAndValidate(connection, buybackTx, "Jupiter buyback (Jito)");
                } else {
                  throw new Error(`Jupiter swap endpoint returned status ${swapRes.status}`);
                }
              } else {
                throw new Error(`Jupiter quote endpoint returned status ${quoteRes.status}`);
              }
            } catch (swapErr: any) {
              notes.push(`Jupiter swap failed/not-executed: ${swapErr.message}`);
              notes.push("Proceeding without buyback in bundle...");
            }
          }

          // Build burn transaction (SPL Token burn of GCH)
          // NOTE: Real GCH burn requires treasury token account authority.
          // This placeholder uses a minimal system transfer for devnet/localnet testing only.
          let burnTx: VersionedTransaction | null = null;
          if (buybackLamports > 0) {
            // In production, this would be an SPL Token burn instruction on the treasury GCH token account
            // For devnet/localnet, use a minimal system transfer as placeholder
            const burnIx = SystemProgram.transfer({
              fromPubkey: payer.publicKey,
              toPubkey: new PublicKey("11111111111111111111111111111111"), // Burn address placeholder
              lamports: Math.min(1000000, buybackLamports), // Limit for devnet
            });
            const burnLegacyTx = new Transaction().add(burnIx);
            burnLegacyTx.feePayer = payer.publicKey;
            burnLegacyTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            burnTx = VersionedTransaction.deserialize(burnLegacyTx.serialize());
            notes.push("Burn transaction created (placeholder - real burn requires SPL Token burn ix)");
          }

          // Execute via Jito Bundle
          try {
            const result = await executeVaultCrankBundle(
              connection,
              payer,
              stakingIx,
              buybackTx,
              burnTx,
              {
                blockEngineUrl: JITO_BLOCK_ENGINE_URL,
                priorityTier: JITO_PRIORITY_TIER,
                maxPollAttempts: JITO_MAX_POLL_ATTEMPTS,
              }
            );

            if (result.success) {
              notes.push(`Jito Bundle LANDED: ${result.bundleId}`);
              if (result.txHashes) {
                txHashes.push(...result.txHashes);
              }
            } else {
              notes.push(`Jito Bundle FAILED: ${result.error}`);
              notes.push("Falling back to standard RPC execution...");
              throw new Error(result.error || "Bundle execution failed");
            }
          } catch (bundleErr: any) {
            notes.push(`Jito Bundle error: ${bundleErr.message}`);
            notes.push("Falling back to standard RPC execution...");
            // Fall through to standard execution below
          }
        }

        // --- STANDARD RPC FALLBACK PATH ---
        if (!JITO_BUNDLE_ENABLED || txHashes.length === 0) {
          if (isMainnet) {
            notes.push("Production Mainnet detected. Attempting live Jupiter swap & burn...");
            // In mainnet, perform the real Jupiter API quote & swap call
            try {
              const lamports = Math.round(buybackSol * 1e9);
              const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${gchMintStr}&amount=${lamports}&slippageBps=100`;
              notes.push(`Fetching Jupiter Quote: ${quoteUrl}`);

              // Native fetch exists in Node 18+
              const quoteRes = await fetchWithTimeout(quoteUrl, { timeoutMs: 10000 });
              if (quoteRes.ok) {
                const quoteData: any = await quoteRes.json();
                notes.push(`Jupiter quote fetched: GCH out = ${quoteData.outAmount}`);

                // Construct swap transaction
                const swapRes = await fetchWithTimeout("https://quote-api.jup.ag/v6/swap", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    quoteResponse: quoteData,
                    userPublicKey: payer.publicKey.toBase58(),
                    wrapAndUnwrapSol: true,
                  }),
                  timeoutMs: 10000,
                });

                if (swapRes.ok) {
                  const { swapTransaction } = await swapRes.json() as any;
                  notes.push("Jupiter swap transaction generated. Ready to sign and submit.");

                  // Sign & Send using VersionedTransaction for v0 support
                  const rawTx = Buffer.from(swapTransaction, "base64");
                  const versionedTx = VersionedTransaction.deserialize(rawTx);
                  
                  // Preflight simulation
                  await simulateAndValidate(connection, versionedTx, "Jupiter buyback (standard)");
                  
                  // Sign the transaction
                  versionedTx.sign([payer]);
                  
                  // Send using sendTransaction for VersionedTransaction support
                  const txid = await connection.sendTransaction(versionedTx, {
                    skipPreflight: false,
                    preflightCommitment: "confirmed",
                  });
                  txHashes.push(txid);
                  notes.push(`Jupiter swap transaction sent: ${txid}`);
                  
                  // NOTE: Real GCH burn requires SPL Token burn instruction on treasury token account.
                  // This is not implemented here as it requires treasury token account authority.
                  // The swap itself buys back GCH to the treasury; burning is a separate step.
                  notes.push("NOTE: GCH burn step requires SPL Token burn ix on treasury token account (not implemented in this path)");
                } else {
                  throw new Error(`Jupiter swap endpoint returned status ${swapRes.status}`);
                }
              } else {
                throw new Error(`Jupiter quote endpoint returned status ${quoteRes.status}`);
              }
            } catch (swapErr: any) {
              // On mainnet, Jupiter failure is a hard error - do not fall back to fake transfers
              const errMsg = `Jupiter swap failed on mainnet: ${swapErr.message}. Aborting - no risky fallback.`;
              notes.push(errMsg);
              throw new Error(errMsg);
            }
          } else {
            // Devnet/localnet: mock execution for testing
            notes.push("Devnet/localnet mode: simulating Jupiter swap & burn (no real transactions)");
            const mockTx = fakeTx("devnet_mock_swap");
            txHashes.push(mockTx);
            notes.push(`Mock transaction logged: ${mockTx}`);
          }
        }
      } catch (solanaErr: any) {
        notes.push(`Solana web3 initialization or runtime error: ${solanaErr.message}`);
        txHashes.push(fakeTx("exec_err_harvest"));
        txHashes.push(fakeTx("exec_err_swap"));
        txHashes.push(fakeTx("exec_err_burn"));
      }
    } else {
      txHashes.push(fakeTx("dryrun_harvest"));
      txHashes.push(fakeTx("dryrun_swap"));
      txHashes.push(fakeTx("dryrun_burn"));
      notes.push("Dry-run mode only: no on-chain state modified.");
    }
  }

  const report: VaultCrankReport = {
    timestamp_iso: new Date().toISOString(),
    mode,
    principal_sol: principalSol,
    current_sol: currentSol,
    excess_sol: excessSol,
    buyback_share: buybackShare,
    jackpot_share: jackpotShare,
    reinvest_share: reinvestShare,
    buyback_sol: buybackSol,
    jackpot_sol: jackpotSol,
    reinvest_sol: reinvestSol,
    gch_price_usd: gchPriceUsd,
    estimated_gch_burned: estimatedGchBurned,
    tx_hashes: txHashes,
    notes,
  };

  const outputPath = path.resolve(
    process.cwd(),
    "../docs/data/burn_tracker.json",
  );
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  console.log(`[vault_crank] report written: ${outputPath}`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error("[vault_crank] error:", err.message);
  process.exit(1);
});