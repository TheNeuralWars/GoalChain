import { Command } from "commander";

export const initTokensCommand = new Command("init-tokens")
  .description("Initialize token mints and associated token accounts")
  .option("--rpc-url <url>", "Solana RPC URL", "https://api.devnet.solana.com")
  .option("--keypair <path>", "Path to keypair file", "~/.config/solana/id.json")
  .option("--program-id <id>", "Program ID", "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg")
  .option("--dry-run", "Print what would be done without executing", false)
  .action(async (opts) => {
    try {
      console.log(`[CLI] Initializing tokens...`);
      console.log(`  RPC URL: ${opts.rpcUrl}`);
      console.log(`  Keypair: ${opts.keypair}`);

      if (opts.dryRun) {
        console.log(`[DRY RUN] Would run initialize_tokens with:`);
        console.log(`  RPC URL: ${opts.rpcUrl}`);
        console.log(`  Keypair: ${opts.keypair}`);
        console.log(`  Would create: GCH Mint, Treasury ATA, mint 10M GCH`);
        return;
      }

      // Import and run the existing initialize_tokens (executes main on import)
      await import("../../initialize_tokens.js");

      console.log(`[CLI] ✅ Tokens initialized`);
      process.exit(0);
    } catch (error) {
      console.error(`[CLI] ❌ Failed to initialize tokens:`, error);
      process.exit(1);
    }
  });