import { OracleService } from "./OracleService.js";
import { PublicKey } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import * as fs from "fs";

dotenv.config();

/**
 * Simulates an active sports match, feeding real-time updates to the blockchain via OracleService.
 */
async function runMatchSimulation(oracle: OracleService, gchMint: PublicKey) {
    console.log("=========================================");
    console.log("🟢 GOALCHAIN SPORTS ORACLE DAEMON ONLINE 🟢");
    console.log("=========================================\n");

    const matchId = `WC2026_FINAL_${Math.floor(Date.now() / 1000)}`;
    const teamA = "Argentina";
    const teamB = "Francia";
    const startTime = Math.floor(Date.now() / 1000) + 10; // Starts in 10 seconds

    console.log(`📡 [STEP 1] Initializing World Cup Final: ${teamA} vs ${teamB}`);
    await oracle.initializeFixture(matchId, teamA, teamB, startTime);
    console.log("⏳ Waiting for kickoff...\n");
    await new Promise((r) => setTimeout(r, 10000));

    console.log(`🏟️ [STEP 2] KICKOFF! Updating Live State (Min 1)`);
    await oracle.upsertLiveState(matchId, 1, 0, 0, false, false);
    
    console.log(`📈 [STEP 3] Creating 'Next Goal' Live Market...`);
    const marketId = 1;
    // Delay 15s to lock market right before a dangerous attack
    await oracle.createLiveMarket(matchId, marketId, { nextGoal: {} }, 15, 90, gchMint);
    console.log("⏳ Live Market Open! Users have 15s delay to bet before a goal...\n");
    await new Promise((r) => setTimeout(r, 15000));

    console.log(`⚽ [STEP 4] GOOOOOOOAL! ARGENTINA SCORES! (Min 23)`);
    await oracle.upsertLiveState(matchId, 23, 1, 0, false, false);
    
    console.log(`⚖️ [STEP 5] Resolving 'Next Goal' Market (Winner: Team A)`);
    await oracle.resolveMarket(matchId, marketId, { teamA: {} });

    console.log(`👤 [STEP 6] Updating Parody Player 'ARG_10' (Messi) Stats (+1 Goal)`);
    // Example player ID logic
    try {
        await oracle.updatePlayerStats("ARG_10", 1, 0);
    } catch (e) {
        console.log(`[Oracle] ⚠️ Player ARG_10 not registered on-chain. Skipping stats update.`);
    }

    console.log("\n⏳ Fast-forwarding match to Full Time...\n");
    await new Promise((r) => setTimeout(r, 5000));

    console.log(`🏁 [STEP 7] FULL TIME! Resolving Pre-Match Parimutuel Pools`);
    await oracle.completeFixture(matchId, { teamA: {} });

    console.log("\n=========================================");
    console.log("🔴 SIMULATION COMPLETE. ORACLE STANDING BY.");
    console.log("=========================================");
}

async function main() {
    const nodeEnv = process.env.NODE_ENV || "development";
    const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8899";
    const keypairPath = process.env.ORACLE_KEYPAIR_PATH || "~/.config/solana/id.json";
    const programId = process.env.PROGRAM_ID || "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg";

    console.log(`📡 Oracle Configuration:`);
    console.log(`   - Environment: ${nodeEnv.toUpperCase()}`);
    console.log(`   - RPC URL: ${rpcUrl}`);
    console.log(`   - Keypair: ${keypairPath}`);
    console.log(`   - Program ID: ${programId}\n`);

    try {
        const oracle = new OracleService(rpcUrl, keypairPath, programId);
        console.log(`✅ Oracle Service initialized successfully. Wallet: ${oracle.wallet.publicKey.toBase58()}`);
        
        let gchMint: PublicKey;
        let treasuryAta: PublicKey;

        if (nodeEnv === "production") {
            const mintStr = process.env.GCH_MINT;
            const treasuryStr = process.env.TREASURY_TOKEN_ACCOUNT;

            if (!mintStr || !treasuryStr) {
                throw new Error("GCH_MINT and TREASURY_TOKEN_ACCOUNT must be defined in .env for production mode.");
            }

            gchMint = new PublicKey(mintStr);
            treasuryAta = new PublicKey(treasuryStr);

            console.log(`🛡️ Production Mode Active. Using existing Tokens:`);
            console.log(`   - GCH Mint: ${gchMint.toBase58()}`);
            console.log(`   - Treasury Token Account: ${treasuryAta.toBase58()}`);
        } else {
            console.log(`🪙 Development Mode Active. Initializing dummy configurations...`);
            treasuryAta = PublicKey.unique(); 
            
            console.log(`🪙 Minting Demo $GCH Token for Market testing...`);
            gchMint = await createMint(oracle.connection, (oracle.wallet as any).payer, oracle.wallet.publicKey, null, 6);
        }

        // Sync Oracle Authority on the blockchain config PDA
        await oracle.syncOracleAuthority(treasuryAta);

        // Run match simulation daemon
        await runMatchSimulation(oracle, gchMint);
    } catch (error) {
        console.error("❌ Critical Oracle Error:", error);
        process.exit(1);
    }
}

// Start daemon
const nodePath = fs.realpathSync(process.argv[1]);
const modulePath = fileURLToPath(import.meta.url);

if (nodePath === modulePath) {
    main();
}
