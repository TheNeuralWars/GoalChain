import { Command } from "commander";
import { OracleService } from "../../OracleService.js";
import { loadWalletOrDummy } from "../utils.js";

export const completeFixtureCommand = new Command("complete-fixture")
  .description("Complete a fixture and optionally record player participation")
  .requiredOption("--match-id <id>", "Match identifier")
  .requiredOption("--winner <winner>", "Winner: teamA | teamB | draw")
  .option("--participant-players <ids...>", "Player IDs that participated (space-separated)")
  .option("--rpc-url <url>", "Solana RPC URL", "http://127.0.0.1:8899")
  .option("--keypair <path>", "Path to keypair file", "~/.config/solana/id.json")
  .option("--program-id <id>", "Program ID", "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg")
  .option("--dry-run", "Print transaction details without sending", false)
  .action(async (opts) => {
    try {
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

      const participantPlayerIds = opts.participantPlayers || [];

      if (opts.dryRun) {
        const wallet = loadWalletOrDummy(opts.keypair, true);
        console.log(`[CLI] Completing fixture (dry-run)...`);
        console.log(`  Match ID: ${opts.matchId}`);
        console.log(`  Winner: ${opts.winner}`);
        console.log(`  Participant Players: ${participantPlayerIds.length > 0 ? participantPlayerIds.join(", ") : "none"}`);
        console.log(`  Wallet: ${wallet.publicKey.toBase58()}`);
        console.log(`[DRY RUN] Would call completeFixture with:`);
        console.log(`  matchId: ${opts.matchId}`);
        console.log(`  winner: ${JSON.stringify(winner)}`);
        console.log(`  participantPlayerIds: ${JSON.stringify(participantPlayerIds)}`);
        return;
      }

      const wallet = loadWalletOrDummy(opts.keypair, false);
      const oracle = new OracleService(opts.rpcUrl, wallet, opts.programId);

      console.log(`[CLI] Completing fixture...`);
      console.log(`  Match ID: ${opts.matchId}`);
      console.log(`  Winner: ${opts.winner}`);
      console.log(`  Participant Players: ${participantPlayerIds.length > 0 ? participantPlayerIds.join(", ") : "none"}`);
      console.log(`  Wallet: ${oracle.wallet.publicKey.toBase58()}`);

      const tx = await oracle.completeFixture(opts.matchId, winner, {
        participantPlayerIds: participantPlayerIds.length > 0 ? participantPlayerIds : undefined,
      });
      console.log(`[CLI] ✅ Fixture completed. Tx: ${tx}`);
      process.exit(0);
    } catch (error) {
      console.error(`[CLI] ❌ Failed to complete fixture:`, error);
      process.exit(1);
    }
  });