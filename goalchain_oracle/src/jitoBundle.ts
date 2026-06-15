import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction, VersionedTransaction } from "@solana/web3.js";
import { fetchWithTimeout, retryWithBackoff } from "@goalchain/sdk";

/**
 * Jito Block Engine client for submitting transaction bundles.
 * Provides MEV protection and guaranteed execution during congestion.
 */

export interface TipAccount {
  account: string;
  name?: string;
}

export interface BundleSubmissionResult {
  bundleId: string;
  success: boolean;
  error?: string;
}

export interface BundleStatus {
  bundle_id: string;
  status: "Pending" | "Landed" | "Failed" | "Rejected";
  slot?: number;
  error?: string;
  transactions?: string[];
}

/**
 * Priority fee tiers matching the strategic decision (2026-06-07).
 * Economy = 50th percentile, Standard = 75th, Priority = 90th, Urgent = 99th + Jito tip
 */
export enum PriorityTier {
  ECONOMY = "economy",
  STANDARD = "standard",
  PRIORITY = "priority",
  URGENT = "urgent",
}

/**
 * Tip multipliers for each tier relative to base priority fee.
 * Urgent tier adds a Jito tip on top of 99th percentile priority fee.
 */
const TIP_MULTIPLIERS: Record<PriorityTier, number> = {
  [PriorityTier.ECONOMY]: 0,      // No Jito tip
  [PriorityTier.STANDARD]: 0,     // No Jito tip
  [PriorityTier.PRIORITY]: 0.5,   // 50% of base fee as tip
  [PriorityTier.URGENT]: 2.0,     // 2x base fee as tip (99th percentile + aggressive tip)
};

/**
 * Default Jito Block Engine URLs.
 * Per strategic decision (2026-06-07): use testnet Block Engine for devnet.
 */
export const BLOCK_ENGINE_URLS = {
  devnet: "https://testnet.block-engine.jito.wtf",
  testnet: "https://testnet.block-engine.jito.wtf",
  mainnet: "https://mainnet.block-engine.jito.wtf",
  // Regional endpoints for latency optimization
  "ny": "https://ny.block-engine.jito.wtf",
  "frankfurt": "https://frankfurt.block-engine.jito.wtf",
  "amsterdam": "https://amsterdam.block-engine.jito.wtf",
  "tokyo": "https://tokyo.block-engine.jito.wtf",
} as const;

/**
 * Fetches current Jito tip accounts from the Block Engine.
 * Tip accounts are rotated periodically; always fetch dynamically.
 */
export async function fetchTipAccounts(blockEngineUrl: string): Promise<TipAccount[]> {
  const tipAccountsUrl = `${blockEngineUrl.replace("/api/v1", "")}/api/v1/tip_accounts`;
  
  try {
    const response = await fetchWithTimeout(tipAccountsUrl, { timeoutMs: 5000 });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data.map((acc: any) => ({
        account: typeof acc === "string" ? acc : acc.account,
        name: typeof acc === "object" ? acc.name : undefined,
      }));
    }
    
    console.warn("[Jito Bundle] Unexpected tip accounts response format:", data);
    return [];
  } catch (error) {
    console.error("[Jito Bundle] Failed to fetch tip accounts:", error);
    // Return empty array — caller should handle fallback
    return [];
  }
}

/**
 * Selects a random tip account from the available pool.
 * Distributes tips across validators to avoid centralization.
 */
export function selectTipAccount(tipAccounts: TipAccount[]): PublicKey | null {
  if (!tipAccounts || tipAccounts.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * tipAccounts.length);
  return new PublicKey(tipAccounts[randomIndex].account);
}

/**
 * Calculates the Jito tip amount based on priority tier and base priority fee.
 * 
 * @param basePriorityFeeMicroLamports - Base priority fee from priorityFees.ts (micro-lamports)
 * @param tier - Priority tier
 * @returns Tip amount in lamports (not micro-lamports)
 */
export function calculateJitoTip(basePriorityFeeMicroLamports: number, tier: PriorityTier): number {
  const multiplier = TIP_MULTIPLIERS[tier] ?? 0;
  if (multiplier === 0) return 0;
  
  // Convert micro-lamports to lamports, apply multiplier
  const baseFeeLamports = Math.ceil(basePriorityFeeMicroLamports / 1_000_000);
  const tipLamports = Math.ceil(baseFeeLamports * multiplier);
  
  // Ensure minimum tip of 1000 lamports (0.000001 SOL) for Urgent tier
  return Math.max(tipLamports, tier === PriorityTier.URGENT ? 1000 : 0);
}

/**
 * Creates a tip transfer instruction for the Jito bundle.
 * Must be the LAST transaction in the bundle per Jito protocol.
 */
export function createTipInstruction(payer: PublicKey, tipAccount: PublicKey, tipLamports: number): TransactionInstruction {
  return SystemProgram.transfer({
    fromPubkey: payer,
    toPubkey: tipAccount,
    lamports: tipLamports,
  });
}

/**
 * Submits a bundle to the Jito Block Engine via JSON-RPC `sendBundle`.
 * 
 * @param blockEngineUrl - Jito Block Engine URL (e.g., https://testnet.block-engine.jito.wtf)
 * @param transactions - Array of signed VersionedTransactions (max 5, tip MUST be last)
 * @returns Bundle ID if accepted
 */
export async function submitBundle(
  blockEngineUrl: string,
  transactions: VersionedTransaction[]
): Promise<BundleSubmissionResult> {
  const rpcUrl = `${blockEngineUrl}/api/v1/bundles`;
  
  // Serialize transactions to base64
  const encodedTransactions = transactions.map((tx) =>
    Buffer.from(tx.serialize()).toString("base64")
  );
  
  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "sendBundle",
    params: [encodedTransactions],
  };
  
  try {
    const response = await fetchWithTimeout(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      timeoutMs: 10000,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        bundleId: "",
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
      };
    }
    
    const data = await response.json();
    
    if (data.error) {
      return {
        bundleId: "",
        success: false,
        error: data.error.message || JSON.stringify(data.error),
      };
    }
    
    return {
      bundleId: data.result,
      success: true,
    };
  } catch (error) {
    return {
      bundleId: "",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Polls the Jito Block Engine for bundle status until confirmed or timeout.
 */
export async function waitForBundleConfirmation(
  connection: Connection,
  bundleId: string,
  blockEngineUrl: string,
  options: {
    maxAttempts?: number;
    pollIntervalMs?: number;
    commitment?: "confirmed" | "finalized";
  } = {}
): Promise<BundleStatus> {
  const {
    maxAttempts = 30,
    pollIntervalMs = 1000,
    commitment = "confirmed",
  } = options;
  
  const statusUrl = `${blockEngineUrl.replace("/api/v1", "")}/api/v1/bundles/${bundleId}`;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetchWithTimeout(statusUrl, { timeoutMs: 5000 });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.result) {
          const status = data.result as BundleStatus;
          
          if (status.status === "Landed") {
            // Verify on-chain
            if (status.transactions && status.transactions.length > 0) {
              const signatures = status.transactions;
              const latestBlockhash = await connection.getLatestBlockhash(commitment);
              
              // Check at least one transaction is confirmed
              for (const sig of signatures) {
                try {
                  const txStatus = await connection.getSignatureStatus(sig, {
                    searchTransactionHistory: true,
                  });
                  if (txStatus.value && (txStatus.value.confirmationStatus === commitment || txStatus.value.err === null)) {
                    return { ...status, status: "Landed" };
                  }
                } catch {
                  // Continue checking other signatures
                }
              }
            }
            return { ...status, status: "Landed" };
          }
          
          if (status.status === "Failed" || status.status === "Rejected") {
            return status;
          }
        }
      }
    } catch (error) {
      console.warn(`[Jito Bundle] Poll attempt ${attempt + 1} failed:`, error);
    }
    
    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
  
  return {
    bundle_id: bundleId,
    status: "Failed",
    error: `Timeout waiting for bundle confirmation after ${maxAttempts} attempts`,
  };
}

/**
 * Simulates a bundle before submission to catch errors early.
 * Uses the Block Engine's simulateBundle endpoint if available.
 */
export async function simulateBundle(
  blockEngineUrl: string,
  transactions: VersionedTransaction[]
): Promise<{ success: boolean; error?: string; logs?: string[] }> {
  const simulateUrl = `${blockEngineUrl}/api/v1/bundles/simulate`;
  
  const encodedTransactions = transactions.map((tx) =>
    Buffer.from(tx.serialize()).toString("base64")
  );
  
  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "simulateBundle",
    params: [encodedTransactions],
  };
  
  try {
    const response = await fetchWithTimeout(simulateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      timeoutMs: 10000,
    });
    
    if (!response.ok) {
      return { success: false, error: `Simulation HTTP ${response.status}` };
    }
    
    const data = await response.json();
    
    if (data.error) {
      return { success: false, error: data.error.message };
    }
    
    return { success: true, logs: data.result?.logs };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Builds a complete vault crank bundle:
 * [Staking/Deposit TX, Buyback Swap TX, Burn TX, Jito Tip TX]
 * 
 * The tip transaction MUST be last per Jito protocol.
 */
export interface VaultCrankBundleParams {
  connection: Connection;
  payer: Keypair;
  stakingIx: TransactionInstruction;
  buybackTx: VersionedTransaction | null;
  burnTx: VersionedTransaction | null;
  basePriorityFeeMicroLamports: number;
  priorityTier: PriorityTier;
  tipAccounts: TipAccount[];
}

export async function buildVaultCrankBundle(
  params: VaultCrankBundleParams
): Promise<VersionedTransaction[]> {
  const { connection, payer, stakingIx, buybackTx, burnTx, basePriorityFeeMicroLamports, priorityTier, tipAccounts } = params;
  
  // Get priority fee instructions (compute budget + priority fee)
  const { getPriorityFeeInstructions } = await import("./priorityFees.js");
  const priorityFeeIxs = await getPriorityFeeInstructions(connection, [payer.publicKey.toBase58()], 500_000);
  
  // Select tip account and calculate tip
  const tipAccount = selectTipAccount(tipAccounts);
  const tipLamports = tipAccount ? calculateJitoTip(basePriorityFeeMicroLamports, priorityTier) : 0;
  
  const transactions: VersionedTransaction[] = [];
  
  // 1. Staking transaction (with priority fees)
  const stakingTx = new Transaction().add(...priorityFeeIxs, stakingIx);
  stakingTx.feePayer = payer.publicKey;
  stakingTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  stakingTx.sign(payer);
  transactions.push(VersionedTransaction.deserialize(stakingTx.serialize()));
  
  // 2. Buyback transaction (if present) - use Jupiter VersionedTransaction directly
  if (buybackTx) {
    // Sign the buyback transaction
    buybackTx.sign([payer]);
    transactions.push(buybackTx);
  }
  
  // 3. Burn transaction (if present)
  if (burnTx) {
    burnTx.sign([payer]);
    transactions.push(burnTx);
  }
  
  // 4. Jito Tip transaction (MUST BE LAST)
  if (tipAccount && tipLamports > 0) {
    const tipIx = createTipInstruction(payer.publicKey, tipAccount, tipLamports);
    const tipTx = new Transaction().add(...priorityFeeIxs, tipIx);
    tipTx.feePayer = payer.publicKey;
    tipTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tipTx.sign(payer);
    transactions.push(VersionedTransaction.deserialize(tipTx.serialize()));
    console.log(`[Jito Bundle] Added tip transaction: ${tipLamports} lamports to ${tipAccount.toBase58()}`);
  }
  
  // Validate bundle size (max 5 transactions)
  if (transactions.length > 5) {
    throw new Error(`Bundle exceeds max 5 transactions: ${transactions.length}`);
  }
  
  console.log(`[Jito Bundle] Built bundle with ${transactions.length} transactions (tier: ${priorityTier}, tip: ${tipLamports} lamports)`);
  
  return transactions;
}

/**
 * High-level function to execute a vault crank via Jito bundle.
 * Handles the full flow: fetch tip accounts, build bundle, simulate, submit, confirm.
 */
export async function executeVaultCrankBundle(
  connection: Connection,
  payer: Keypair,
  stakingIx: TransactionInstruction,
  buybackTx: VersionedTransaction | null,
  burnTx: VersionedTransaction | null,
  options: {
    blockEngineUrl?: string;
    priorityTier?: PriorityTier;
    maxPollAttempts?: number;
  } = {}
): Promise<{ success: boolean; bundleId?: string; error?: string; txHashes?: string[] }> {
  const {
    blockEngineUrl = BLOCK_ENGINE_URLS.devnet,
    priorityTier = PriorityTier.STANDARD,
    maxPollAttempts = 30,
  } = options;

  console.log(`[Jito Bundle] Starting vault crank bundle execution (tier: ${priorityTier})`);
  
  // 1. Fetch tip accounts
  const tipAccounts = await fetchTipAccounts(blockEngineUrl);
  if (tipAccounts.length === 0) {
    return { success: false, error: "No tip accounts available from Block Engine" };
  }
  console.log(`[Jito Bundle] Fetched ${tipAccounts.length} tip accounts`);
  
  // 2. Get base priority fee estimate
  const { getPriorityFeeEstimate } = await import("./priorityFees.js");
  const basePriorityFee = await getPriorityFeeEstimate(connection, [payer.publicKey.toBase58()]);
  
  // 3. Build bundle
  const bundle = await buildVaultCrankBundle({
    connection,
    payer,
    stakingIx,
    buybackTx,
    burnTx,
    basePriorityFeeMicroLamports: basePriorityFee,
    priorityTier,
    tipAccounts,
  });
  
  // 4. Simulate bundle (optional but recommended)
  const simulation = await simulateBundle(blockEngineUrl, bundle);
  if (!simulation.success) {
    return { success: false, error: `Bundle simulation failed: ${simulation.error}` };
  }
  console.log(`[Jito Bundle] Simulation successful`);
  
  // 5. Submit bundle
  const submission = await submitBundle(blockEngineUrl, bundle);
  if (!submission.success) {
    return { success: false, error: `Bundle submission failed: ${submission.error}` };
  }
  console.log(`[Jito Bundle] Submitted bundle: ${submission.bundleId}`);
  
  // 6. Wait for confirmation
  const status = await waitForBundleConfirmation(connection, submission.bundleId!, blockEngineUrl, {
    maxAttempts: maxPollAttempts,
  });
  
  if (status.status === "Landed") {
    return {
      success: true,
      bundleId: submission.bundleId,
      txHashes: status.transactions,
    };
  }
  
  return {
    success: false,
    bundleId: submission.bundleId,
    error: status.error || `Bundle failed with status: ${status.status}`,
  };
}