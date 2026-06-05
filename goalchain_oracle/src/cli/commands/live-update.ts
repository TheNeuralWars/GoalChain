import { Command } from "commander";
import { OracleService } from "../../OracleService.js";
import { loadWalletOrDummy } from "../utils.js";

export const liveUpdateCommand = new Command("live-update")
  .description("Push live state update for a fixture")
  .requiredOption("--match-id <id>", "Match identifier")
  .requiredOption("--minute <number>", "Current match minute")
  .requiredOption("--score-a <number>", "Team A score")
  .requiredOption("--score-b <number>", "Team B score")
  .option("--ht", "Half-time flag", false)
  .option("--ft", "Full-time flag", false)
  .option("--rpc-url <url>", "Solana RPC URL", "http://127.0.0.1:8899")
  .option("--keypair <path>", "Path to keypair file", "~/.config/solana/id.json")
  .option("--program-id <id>", "Program ID", "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg")
  .option("--dry-run", "Print transaction details without sending", false)
  .action(async (opts) => {
    try {
      const minute = parseInt(opts.minute, 10);
      const scoreA = parseInt(opts.scoreA, 10);
      const scoreB = parseInt(opts.scoreB, 10);

      if (isNaN(minute) || isNaN(scoreA) || isNaN(scoreB)) {
        throw new Error("minute, score-a, and score-b must be valid numbers");
      }
      if (minute < 0 || minute > 120) {
        throw new Error("minute must be between 0 and 120");
      }

      if (opts.dryRun) {
        const wallet = loadWalletOrDummy(opts.keypair, true);
        console.log(`[CLI] Pushing live update (dry-run)...`);
        console.log(`  Match ID: ${opts.matchId}`);
        console.log(`  Minute: ${minute}`);
        console.log(`  Score: ${scoreA} - ${scoreB}`);
        console.log(`  HT: ${opts.ht}, FT: ${opts.ft}`);
        console.log(`  Wallet: ${wallet.publicKey.toBase58()}`);
        console.log(`[DRY RUN] Would call upsertLiveState with:`);
        console.log(`  matchId: ${opts.matchId}`);
        console.log(`  minute: ${minute}`);
        console.log(`  scoreA: ${scoreA}`);
        console.log(`  scoreB: ${scoreB}`);
        console.log(`  isHt: ${opts.ht}`);
        console.log(`  isFt: ${opts.ft}`);
        return;
      }

      const wallet = loadWalletOrDummy(opts.keypair, false);
      const oracle = new OracleService(opts.rpcUrl, wallet, opts.programId);

      console.log(`[CLI] Pushing live update...`);
      console.log(`  Match ID: ${opts.matchId}`);
      console.log(`  Minute: ${minute}`);
      console.log(`  Score: ${scoreA} - ${scoreB}`);
      console.log(`  HT: ${opts.ht}, FT: ${opts.ft}`);
      console.log(`  Wallet: ${oracle.wallet.publicKey.toBase58()}`);

      const tx = await oracle.upsertLiveState(
        opts.matchId,
        minute,
        scoreA,
        scoreB,
        opts.ht,
        opts.ft
      );
      console.log(`[CLI] ✅ Live state updated. Tx: ${tx}`);
      process.exit(0);
    } catch (error) {
      console.error(`[CLI] ❌ Failed to push live update:`, error);
      process.exit(1);
    }
  });