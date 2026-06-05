import { Command } from "commander";
import { OracleService } from "../../OracleService.js";
import { loadWalletOrDummy } from "../utils.js";

export const recordPlayerCommand = new Command("record-player")
  .description("Record player match participation")
  .requiredOption("--match-id <id>", "Match identifier")
  .requiredOption("--player-id <id>", "Player identifier")
  .option("--rpc-url <url>", "Solana RPC URL", "http://127.0.0.1:8899")
  .option("--keypair <path>", "Path to keypair file", "~/.config/solana/id.json")
  .option("--program-id <id>", "Program ID", "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg")
  .option("--dry-run", "Print transaction details without sending", false)
  .action(async (opts) => {
    try {
      if (opts.dryRun) {
        const wallet = loadWalletOrDummy(opts.keypair, true);
        console.log(`[CLI] Recording player match participation (dry-run)...`);
        console.log(`  Match ID: ${opts.matchId}`);
        console.log(`  Player ID: ${opts.playerId}`);
        console.log(`  Wallet: ${wallet.publicKey.toBase58()}`);
        console.log(`[DRY RUN] Would call recordPlayerMatch with:`);
        console.log(`  matchId: ${opts.matchId}`);
        console.log(`  playerId: ${opts.playerId}`);
        return;
      }

      const wallet = loadWalletOrDummy(opts.keypair, false);
      const oracle = new OracleService(opts.rpcUrl, wallet, opts.programId);

      console.log(`[CLI] Recording player match participation...`);
      console.log(`  Match ID: ${opts.matchId}`);
      console.log(`  Player ID: ${opts.playerId}`);
      console.log(`  Wallet: ${oracle.wallet.publicKey.toBase58()}`);

      const tx = await oracle.recordPlayerMatch(opts.matchId, opts.playerId);
      console.log(`[CLI] ✅ Player match recorded. Tx: ${tx}`);
      process.exit(0);
    } catch (error) {
      console.error(`[CLI] ❌ Failed to record player match:`, error);
      process.exit(1);
    }
  });