import { Command } from "commander";

export const crankVaultsCommand = new Command("crank-vaults")
  .description("Run vault crank to harvest yield and execute buyback/burn")
  .option("--execute", "Execute on-chain transactions (default: dry-run)", false)
  .option("--rpc-url <url>", "Solana RPC URL", "http://127.0.0.1:8899")
  .option("--keypair <path>", "Path to keypair file", "~/.config/solana/id.json")
  .option("--program-id <id>", "Program ID", "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg")
  .option("--dry-run", "Print what would be done without executing (default: true)", true)
  .action(async (opts) => {
    try {
      // Use the existing vault_crank.ts logic via dynamic import
      process.env.VAULT_CRANK_EXECUTE = opts.execute ? "1" : "0";
      process.env.RPC_URL = opts.rpcUrl;
      process.env.ORACLE_KEYPAIR_PATH = opts.keypair;

      console.log(`[CLI] Running vault crank...`);
      console.log(`  Mode: ${opts.execute ? "EXECUTE" : "DRY RUN"}`);
      console.log(`  RPC URL: ${opts.rpcUrl}`);
      console.log(`  Keypair: ${opts.keypair}`);

      // Import and run the existing vault crank (executes main on import)
      await import("../../vault_crank.js");

      console.log(`[CLI] ✅ Vault crank completed`);
      process.exit(0);
    } catch (error) {
      console.error(`[CLI] ❌ Failed to run vault crank:`, error);
      process.exit(1);
    }
  });