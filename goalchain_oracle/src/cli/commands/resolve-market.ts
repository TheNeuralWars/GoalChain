import { Command } from "commander";
import { OracleService } from "../../OracleService.js";
import { loadWalletOrDummy } from "../utils.js";

export const resolveMarketCommand = new Command("resolve-market")
  .description("Resolve a live market with a winner")
  .requiredOption("--match-id <id>", "Match identifier")
  .requiredOption("--market-id <number>", "Market identifier")
  .requiredOption("--winner <winner>", "Winner: teamA | teamB | draw")
  .option("--rpc-url <url>", "Solana RPC URL", "http://127.0.0.1:8899")
  .option("--keypair <path>", "Path to keypair file", "~/.config/solana/id.json")
  .option("--program-id <id>", "Program ID", "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg")
  .option("--dry-run", "Print transaction details without sending", false)
  .action(async (opts) => {
    try {
      const marketId = parseInt(opts.marketId, 10);
      if (isNaN(marketId)) {
        throw new Error("market-id must be a valid number");
      }

      const validWinners = ["teamA", "teamB", "draw"];
      if (!validWinners.includes(opts.winner)) {
        throw new Error(`Invalid winner: ${opts.winner}. Must be one of: ${validWinners.join(", ")}`);
      }

      let winner: any;
      switch (opts.winner) {
        case "teamA":
          winner = { teamA: {} };
          break;
        case "teamB":
          winner = { teamB: {} };
          break;
        case "draw":
          winner = { draw: {} };
          break;
      }

      if (opts.dryRun) {
        const wallet = loadWalletOrDummy(opts.keypair, true);
        console.log(`[CLI] Resolving live market (dry-run)...`);
        console.log(`  Match ID: ${opts.matchId}`);
        console.log(`  Market ID: ${marketId}`);
        console.log(`  Winner: ${opts.winner}`);
        console.log(`  Wallet: ${wallet.publicKey.toBase58()}`);
        console.log(`[DRY RUN] Would call resolveMarket with:`);
        console.log(`  matchId: ${opts.matchId}`);
        console.log(`  marketId: ${marketId}`);
        console.log(`  winner: ${JSON.stringify(winner)}`);
        return;
      }

      const wallet = loadWalletOrDummy(opts.keypair, false);
      const oracle = new OracleService(opts.rpcUrl, wallet, opts.programId);

      console.log(`[CLI] Resolving live market...`);
      console.log(`  Match ID: ${opts.matchId}`);
      console.log(`  Market ID: ${marketId}`);
      console.log(`  Winner: ${opts.winner}`);
      console.log(`  Wallet: ${oracle.wallet.publicKey.toBase58()}`);

      const tx = await oracle.resolveMarket(opts.matchId, marketId, winner);
      console.log(`[CLI] ✅ Live market resolved. Tx: ${tx}`);
      process.exit(0);
    } catch (error) {
      console.error(`[CLI] ❌ Failed to resolve live market:`, error);
      process.exit(1);
    }
  });