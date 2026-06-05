import { Command } from "commander";

export const contributorEpochCommand = new Command("contributor-epoch")
  .description("Run contributor epoch transition")
  .requiredOption("--treasury-ata <address>", "Treasury token account address")
  .requiredOption("--token-mint <address>", "Token mint address")
  .requiredOption("--epoch-pool <amount>", "Contributor epoch pool amount (lamports)")
  .option("--max-contributors <number>", "Maximum contributors to include", "20")
  .option("--window-commits <number>", "Git commit window for scoring", "200")
  .option("--map-path <path>", "Path to contributor wallet map JSON", "")
  .option("--epoch-id <number>", "Epoch ID (auto-increment if not provided)")
  .option("--rpc-url <url>", "Solana RPC URL", "http://127.0.0.1:8899")
  .option("--keypair <path>", "Path to keypair file", "~/.config/solana/id.json")
  .option("--program-id <id>", "Program ID", "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg")
  .option("--dry-run", "Print what would be done without executing", false)
  .action(async (opts) => {
    try {
      process.env.RPC_URL = opts.rpcUrl;
      process.env.ORACLE_KEYPAIR_PATH = opts.keypair;
      process.env.TREASURY_ATA = opts.treasuryAta;
      process.env.TOKEN_MINT = opts.tokenMint;
      process.env.CONTRIBUTOR_EPOCH_POOL = opts.epochPool;
      process.env.MAX_HOOK_CONTRIBUTORS = opts.maxContributors;
      process.env.SCORE_WINDOW_COMMITS = opts.windowCommits;
      if (opts.mapPath) process.env.CONTRIBUTOR_MAP_PATH = opts.mapPath;
      if (opts.epochId) process.env.EPOCH_ID = opts.epochId;

      console.log(`[CLI] Running contributor epoch...`);
      console.log(`  Treasury ATA: ${opts.treasuryAta}`);
      console.log(`  Token Mint: ${opts.tokenMint}`);
      console.log(`  Epoch Pool: ${opts.epochPool}`);
      console.log(`  Max Contributors: ${opts.maxContributors}`);
      console.log(`  Window Commits: ${opts.windowCommits}`);
      console.log(`  Map Path: ${opts.mapPath || "(default)"}`);
      console.log(`  Epoch ID: ${opts.epochId || "(auto)"}`);
      console.log(`  RPC URL: ${opts.rpcUrl}`);
      console.log(`  Keypair: ${opts.keypair}`);

      if (opts.dryRun) {
        console.log(`[DRY RUN] Would run contributor_epoch_hook with above env vars`);
        return;
      }

      // Import and run the existing contributor epoch hook (executes main on import)
      await import("../../contributor_epoch_hook.js");

      console.log(`[CLI] ✅ Contributor epoch completed`);
      process.exit(0);
    } catch (error) {
      console.error(`[CLI] ❌ Failed to run contributor epoch:`, error);
      process.exit(1);
    }
  });