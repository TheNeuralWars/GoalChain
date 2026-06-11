import pkg from "@coral-xyz/anchor";
const { BN } = pkg;
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { OracleService } from "./OracleService.js";

type ScoreMap = Record<string, number>;
type WalletMap = Record<string, string>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

function mustEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function runGitScore(windowCommits: number): ScoreMap {
  const cmd = `git log -n ${windowCommits} --numstat --format='@@@%ae'`;
  const raw = execSync(cmd, { cwd: path.resolve(ROOT, ".."), encoding: "utf8" });
  const scores: ScoreMap = {};

  let currentEmail = "";
  const lines = raw.split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.startsWith("@@@")) {
      currentEmail = line.slice(3).trim().toLowerCase();
      if (currentEmail && !scores[currentEmail]) scores[currentEmail] = 0;
      if (currentEmail) scores[currentEmail] += 20; // commit base weight
      continue;
    }
    const parts = line.split("\t");
    if (parts.length < 3 || !currentEmail) continue;
    const add = Number(parts[0]);
    const del = Number(parts[1]);
    if (Number.isFinite(add)) scores[currentEmail] += add;
    if (Number.isFinite(del)) scores[currentEmail] += Math.floor(del / 2);
  }

  return scores;
}

function loadWalletMap(filePath: string): WalletMap {
  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content) as WalletMap;
}

async function main() {
  const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8899";
  const keypairPath = mustEnv("ORACLE_KEYPAIR_PATH");
  const treasuryAta = new PublicKey(mustEnv("TREASURY_ATA"));
  const tokenMint = new PublicKey(mustEnv("TOKEN_MINT"));
  const contributorPool = BigInt(mustEnv("CONTRIBUTOR_EPOCH_POOL"));
  const maxContributors = Number(process.env.MAX_HOOK_CONTRIBUTORS || "20");
  const windowCommits = Number(process.env.SCORE_WINDOW_COMMITS || "200");
  const mapPath = process.env.CONTRIBUTOR_MAP_PATH
    ? path.resolve(process.env.CONTRIBUTOR_MAP_PATH)
    : path.resolve(ROOT, "contributor_wallet_map.json");

  const oracle = new OracleService(
    rpcUrl,
    keypairPath,
    process.env.PROGRAM_ID || "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg"
  );
  await oracle.syncOracleAuthority(treasuryAta);

  const walletMap = loadWalletMap(mapPath);
  const emailScores = runGitScore(windowCommits);
  const normalized = Object.entries(emailScores)
    .filter(([email, score]) => !!walletMap[email] && score > 0)
    .map(([email, score]) => ({
      email,
      wallet: new PublicKey(walletMap[email]),
      score,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxContributors);

  if (normalized.length === 0) {
    throw new Error("No mapped contributors with positive score were found.");
  }

  const [builderFundPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("builder_fund"), oracle.configPda.toBuffer()],
    oracle.program.programId
  );
  const [contributorVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("builder_vault"), builderFundPda.toBuffer(), Buffer.from("contributors")],
    oracle.program.programId
  );

  for (const item of normalized) {
    const [contributorScorePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("contributor_score"), builderFundPda.toBuffer(), item.wallet.toBuffer()],
      oracle.program.programId
    );
    const tx = await oracle.program.methods
      .upsertContributorScore(new BN(item.score))
      .accounts({
        admin: oracle.wallet.publicKey,
        config: oracle.configPda,
        builderFund: builderFundPda,
        contributor: item.wallet,
        contributorScore: contributorScorePda,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();
    console.log(`[hook] score upsert ${item.email} (${item.wallet.toBase58()}) = ${item.score}, tx=${tx}`);
  }

  const builderFundState = await (oracle.program.account as any).builderFund.fetch(builderFundPda);
  const epochId = Number(process.env.EPOCH_ID || (Number(builderFundState.currentEpoch) + 1).toString());
  const epochBn = new BN(epochId);
  const epochBuf = Buffer.alloc(8);
  epochBuf.writeBigUInt64LE(BigInt(epochId));

  const [builderEpochPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("builder_epoch"), builderFundPda.toBuffer(), epochBuf],
    oracle.program.programId
  );

  let epochState: any = null;
  try {
    epochState = await (oracle.program.account as any).builderEpoch.fetch(builderEpochPda);
  } catch (e) {
    // Expected to fail if epoch does not exist yet
  }

  if (epochState) {
    if (epochState.finalized) {
      console.log(`[hook] Epoch ${epochId} is already finalized on-chain. Skipping execution.`);
      return;
    }
    console.log(`[hook] Epoch ${epochId} has already been started but not finalized. Resuming snapshots & finalization...`);
  } else {
    const txStart = await oracle.program.methods
      .startContributorEpoch(epochBn, new BN(contributorPool.toString()))
      .accounts({
        admin: oracle.wallet.publicKey,
        config: oracle.configPda,
        builderFund: builderFundPda,
        builderEpoch: builderEpochPda,
        contributorVault,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();
    console.log(`[hook] epoch ${epochId} started, tx=${txStart}`);
  }

  for (const item of normalized) {
    const [contributorScorePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("contributor_score"), builderFundPda.toBuffer(), item.wallet.toBuffer()],
      oracle.program.programId
    );
    const [epochContributorSnapshotPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("epoch_contributor"), builderEpochPda.toBuffer(), item.wallet.toBuffer()],
      oracle.program.programId
    );

    // Check if snapshot is already registered
    const snapshotAccountInfo = await oracle.connection.getAccountInfo(epochContributorSnapshotPda);
    if (snapshotAccountInfo !== null) {
      console.log(`[hook] epoch snapshot for ${item.email} already registered. Skipping.`);
      continue;
    }

    const tx = await oracle.program.methods
      .registerContributorEpochSnapshot()
      .accounts({
        admin: oracle.wallet.publicKey,
        config: oracle.configPda,
        builderFund: builderFundPda,
        builderEpoch: builderEpochPda,
        contributor: item.wallet,
        contributorScore: contributorScorePda,
        epochContributorSnapshot: epochContributorSnapshotPda,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();
    console.log(`[hook] epoch snapshot ${item.email} tx=${tx}`);
  }

  const txFinalize = await oracle.program.methods
    .finalizeContributorEpoch()
    .accounts({
      admin: oracle.wallet.publicKey,
      config: oracle.configPda,
      builderFund: builderFundPda,
      builderEpoch: builderEpochPda,
    } as any)
    .rpc();
  console.log(`[hook] epoch ${epochId} finalized, tx=${txFinalize}`);
}

main().catch((error) => {
  console.error("[hook] contributor epoch hook failed:", error);
  process.exit(1);
});

