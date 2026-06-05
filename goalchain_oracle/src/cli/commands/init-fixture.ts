import { Command } from "commander";
import { OracleService } from "../../OracleService.js";
import { loadWalletOrDummy } from "../utils.js";

export const initFixtureCommand = new Command("init-fixture")
  .description("Initialize a new fixture")
  .requiredOption("--match-id <id>", "Unique match identifier")
  .requiredOption("--team-a <name>", "Team A name")
  .requiredOption("--team-b <name>", "Team B name")
  .requiredOption("--start-time <timestamp>", "Match start time (unix timestamp)")
  .option("--rpc-url <url>", "Solana RPC URL", "http://127.0.0.1:8899")
  .option("--keypair <path>", "Path to keypair file", "~/.config/solana/id.json")
  .option("--program-id <id>", "Program ID", "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg")
  .option("--dry-run", "Print transaction details without sending", false)
  .action(async (opts) => {
    try {
      const startTime = parseInt(opts.startTime, 10);
      if (isNaN(startTime)) {
        throw new Error("start-time must be a valid unix timestamp");
      }

      if (opts.dryRun) {
        const wallet = loadWalletOrDummy(opts.keypair, true);
        console.log(`[CLI] Initializing fixture (dry-run)...`);
        console.log(`  Match ID: ${opts.matchId}`);
        console.log(`  Team A: ${opts.teamA}`);
        console.log(`  Team B: ${opts.teamB}`);
        console.log(`  Start Time: ${startTime} (${new Date(startTime * 1000).toISOString()})`);
        console.log(`  Wallet: ${wallet.publicKey.toBase58()}`);
        console.log(`[DRY RUN] Would call initializeFixture with:`);
        console.log(`  matchId: ${opts.matchId}`);
        console.log(`  teamA: ${opts.teamA}`);
        console.log(`  teamB: ${opts.teamB}`);
        console.log(`  startTime: ${startTime}`);
        return;
      }

      const wallet = loadWalletOrDummy(opts.keypair, false);
      const oracle = new OracleService(opts.rpcUrl, wallet, opts.programId);

      console.log(`[CLI] Initializing fixture...`);
      console.log(`  Match ID: ${opts.matchId}`);
      console.log(`  Team A: ${opts.teamA}`);
      console.log(`  Team B: ${opts.teamB}`);
      console.log(`  Start Time: ${startTime} (${new Date(startTime * 1000).toISOString()})`);
      console.log(`  Wallet: ${oracle.wallet.publicKey.toBase58()}`);

      const tx = await oracle.initializeFixture(opts.matchId, opts.teamA, opts.teamB, startTime);
      console.log(`[CLI] ✅ Fixture initialized. Tx: ${tx}`);
      process.exit(0);
    } catch (error) {
      console.error(`[CLI] ❌ Failed to initialize fixture:`, error);
      process.exit(1);
    }
  });