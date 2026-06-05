import { Command } from "commander";
import { OracleService } from "../../OracleService.js";
import { loadWalletOrDummy } from "../utils.js";

export const updateStatsCommand = new Command("update-stats")
  .description("Update player goals and assists stats")
  .requiredOption("--player-id <id>", "Player identifier")
  .requiredOption("--goals <number>", "Goals to add")
  .requiredOption("--assists <number>", "Assists to add")
  .option("--rpc-url <url>", "Solana RPC URL", "http://127.0.0.1:8899")
  .option("--keypair <path>", "Path to keypair file", "~/.config/solana/id.json")
  .option("--program-id <id>", "Program ID", "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg")
  .option("--dry-run", "Print transaction details without sending", false)
  .action(async (opts) => {
    try {
      const goalsAdded = parseInt(opts.goals, 10);
      const assistsAdded = parseInt(opts.assists, 10);

      if (isNaN(goalsAdded) || isNaN(assistsAdded)) {
        throw new Error("goals and assists must be valid numbers");
      }
      if (goalsAdded < 0 || assistsAdded < 0 || goalsAdded > 10 || assistsAdded > 10) {
        throw new Error("goals and assists must be between 0 and 10");
      }

      if (opts.dryRun) {
        const wallet = loadWalletOrDummy(opts.keypair, true);
        console.log(`[CLI] Updating player stats (dry-run)...`);
        console.log(`  Player ID: ${opts.playerId}`);
        console.log(`  Goals: +${goalsAdded}`);
        console.log(`  Assists: +${assistsAdded}`);
        console.log(`  Wallet: ${wallet.publicKey.toBase58()}`);
        console.log(`[DRY RUN] Would call updatePlayerStats with:`);
        console.log(`  playerId: ${opts.playerId}`);
        console.log(`  goalsAdded: ${goalsAdded}`);
        console.log(`  assistsAdded: ${assistsAdded}`);
        return;
      }

      const wallet = loadWalletOrDummy(opts.keypair, false);
      const oracle = new OracleService(opts.rpcUrl, wallet, opts.programId);

      console.log(`[CLI] Updating player stats...`);
      console.log(`  Player ID: ${opts.playerId}`);
      console.log(`  Goals: +${goalsAdded}`);
      console.log(`  Assists: +${assistsAdded}`);
      console.log(`  Wallet: ${oracle.wallet.publicKey.toBase58()}`);

      const tx = await oracle.updatePlayerStats(opts.playerId, goalsAdded, assistsAdded);
      console.log(`[CLI] ✅ Player stats updated. Tx: ${tx}`);
      process.exit(0);
    } catch (error) {
      console.error(`[CLI] ❌ Failed to update player stats:`, error);
      process.exit(1);
    }
  });