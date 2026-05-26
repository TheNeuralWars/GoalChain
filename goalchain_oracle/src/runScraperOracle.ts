import { OracleService } from "./OracleService.js";
import { PublicKey } from "@solana/web3.js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

async function main() {
  const matchStatePath = path.resolve(projectRoot, "scripts/oracle_match_state.json");
  if (!fs.existsSync(matchStatePath)) {
    console.error(`[Oracle Driver] ❌ Error: Scraper output file not found at ${matchStatePath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(matchStatePath, "utf8");
  const matchState = JSON.parse(rawData);

  console.log(`[Oracle Driver] 📄 Loaded match state for ${matchState.matchId}:`);
  console.log(`   - Fixture: ${matchState.teamA} vs ${matchState.teamB}`);
  console.log(`   - Current score: ${matchState.scoreA} - ${matchState.scoreB}`);
  console.log(`   - Minute: ${matchState.minute}`);
  console.log(`   - HT: ${matchState.isHt} | FT: ${matchState.isFt}`);

  const rpcUrl = process.env.RPC_URL || "https://api.devnet.solana.com";
  const keypairPath = process.env.ORACLE_KEYPAIR_PATH || "~/.config/solana/id.json";
  const programId = process.env.PROGRAM_ID || "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg";

  try {
    const oracle = new OracleService(rpcUrl, keypairPath, programId);
    console.log(`[Oracle Driver] Wallet: ${oracle.wallet.publicKey.toBase58()}`);

    // Compute Fixture PDA to check if it's already initialized
    const [fixturePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("fixture"), Buffer.from(matchState.matchId)],
      oracle.program.programId
    );

    const fixtureAccountInfo = await oracle.connection.getAccountInfo(fixturePda);
    if (!fixtureAccountInfo) {
      console.log(`[Oracle Driver] 🏟️ Fixture not initialized on-chain. Initializing now...`);
      // Start time: now
      const startTime = Math.floor(Date.now() / 1000);
      await oracle.initializeFixture(
        matchState.matchId,
        matchState.teamA,
        matchState.teamB,
        startTime
      );
    } else {
      console.log(`[Oracle Driver] 🏟️ Fixture already initialized on-chain.`);
    }

    // Update live state
    console.log(`[Oracle Driver] ⚽ Updating live state on-chain...`);
    await oracle.upsertLiveState(
      matchState.matchId,
      matchState.minute,
      matchState.scoreA,
      matchState.scoreB,
      matchState.isHt,
      matchState.isFt
    );

    // If FT is true, complete fixture on-chain
    if (matchState.isFt) {
      console.log(`[Oracle Driver] 🏁 Full Time reached! Completing fixture...`);
      // Determine winner representation for updateFixtureStatus / completeFixture
      let winnerObj: any = { draw: {} };
      if (matchState.scoreA > matchState.scoreB) {
        winnerObj = { teamA: {} };
      } else if (matchState.scoreB > matchState.scoreA) {
        winnerObj = { teamB: {} };
      }
      await oracle.completeFixture(matchState.matchId, winnerObj, {
        participantPlayerIds: matchState.participantPlayerIds,
      });
    }

    console.log(`[Oracle Driver] ✅ Feeder run completed successfully.`);
  } catch (error) {
    console.error(`[Oracle Driver] ❌ Critical Error:`, error);
    process.exit(1);
  }
}

main();
