import { Command } from "commander";
import { PublicKey } from "@solana/web3.js";
import { OracleService } from "../../OracleService.js";
import { loadWalletOrDummy } from "../utils.js";

export const createMarketCommand = new Command("create-market")
  .description("Create a live betting market for a fixture")
  .requiredOption("--match-id <id>", "Match identifier")
  .requiredOption("--market-id <number>", "Market identifier (number)")
  .requiredOption("--delay-seconds <number>", "Delay before market locks (seconds)")
  .requiredOption("--close-minute <number>", "Minute when market closes")
  .requiredOption("--token-mint <address>", "Token mint address for betting")
  .option("--market-type <type>", "Market type: next-goal | match-result-live | custom", "next-goal")
  .option("--cooldown <seconds>", "Cooldown between bets (seconds)", "0")
  .option("--max-goal-diff <number>", "Maximum goal difference for market", "1")
  .option("--require-tied <boolean>", "Require tied score for next-goal market", "true")
  .option("--rpc-url <url>", "Solana RPC URL", "http://127.0.0.1:8899")
  .option("--keypair <path>", "Path to keypair file", "~/.config/solana/id.json")
  .option("--program-id <id>", "Program ID", "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg")
  .option("--dry-run", "Print transaction details without sending", false)
  .action(async (opts) => {
    try {
      const marketId = parseInt(opts.marketId, 10);
      const delaySeconds = parseInt(opts.delaySeconds, 10);
      const closeMinute = parseInt(opts.closeMinute, 10);
      const cooldownSeconds = parseInt(opts.cooldown, 10);
      const maxGoalDiff = parseInt(opts.maxGoalDiff, 10);
      const requireTied = opts.requireTied === "true";

      if (isNaN(marketId) || isNaN(delaySeconds) || isNaN(closeMinute)) {
        throw new Error("market-id, delay-seconds, and close-minute must be valid numbers");
      }

      const tokenMint = new PublicKey(opts.tokenMint);

      let marketType: any;
      switch (opts.marketType) {
        case "next-goal":
          marketType = { nextGoal: {} };
          break;
        case "match-result-live":
          marketType = { matchResultLive: {} };
          break;
        case "custom":
          marketType = { custom: {} };
          break;
        default:
          throw new Error(`Invalid market-type: ${opts.marketType}. Use: next-goal, match-result-live, or custom`);
      }

      if (opts.dryRun) {
        const wallet = loadWalletOrDummy(opts.keypair, true);
        console.log(`[CLI] Creating live market (dry-run)...`);
        console.log(`  Match ID: ${opts.matchId}`);
        console.log(`  Market ID: ${marketId}`);
        console.log(`  Market Type: ${opts.marketType}`);
        console.log(`  Delay: ${delaySeconds}s, Close Minute: ${closeMinute}`);
        console.log(`  Cooldown: ${cooldownSeconds}s, Max Goal Diff: ${maxGoalDiff}, Require Tied: ${requireTied}`);
        console.log(`  Token Mint: ${tokenMint.toBase58()}`);
        console.log(`  Wallet: ${wallet.publicKey.toBase58()}`);
        console.log(`[DRY RUN] Would call createLiveMarket with:`);
        console.log(`  matchId: ${opts.matchId}`);
        console.log(`  marketId: ${marketId}`);
        console.log(`  marketType: ${JSON.stringify(marketType)}`);
        console.log(`  delaySeconds: ${delaySeconds}`);
        console.log(`  closeMinute: ${closeMinute}`);
        console.log(`  tokenMint: ${tokenMint.toBase58()}`);
        return;
      }

      const wallet = loadWalletOrDummy(opts.keypair, false);
      const oracle = new OracleService(opts.rpcUrl, wallet, opts.programId);

      console.log(`[CLI] Creating live market...`);
      console.log(`  Match ID: ${opts.matchId}`);
      console.log(`  Market ID: ${marketId}`);
      console.log(`  Market Type: ${opts.marketType}`);
      console.log(`  Delay: ${delaySeconds}s, Close Minute: ${closeMinute}`);
      console.log(`  Cooldown: ${cooldownSeconds}s, Max Goal Diff: ${maxGoalDiff}, Require Tied: ${requireTied}`);
      console.log(`  Token Mint: ${tokenMint.toBase58()}`);
      console.log(`  Wallet: ${oracle.wallet.publicKey.toBase58()}`);

      const tx = await oracle.createLiveMarket(
        opts.matchId,
        marketId,
        marketType,
        delaySeconds,
        closeMinute,
        tokenMint
      );
      console.log(`[CLI] ✅ Live market created. Tx: ${tx}`);
      process.exit(0);
    } catch (error) {
      console.error(`[CLI] ❌ Failed to create live market:`, error);
      process.exit(1);
    }
  });