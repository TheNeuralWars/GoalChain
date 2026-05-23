import { OracleService } from "./OracleService.js";
import { PublicKey } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import * as fs from "fs";
import { spawn } from "child_process";
import * as path from "path";

dotenv.config();

const VIDEO_ALERTS_ENABLED = ["1", "true", "yes", "on"].includes(
  (process.env.ORACLE_VIDEO_ALERTS_ENABLED ?? "").toLowerCase(),
);
const VIDEO_ALERTS_TIMEOUT_MS = Number(
  process.env.ORACLE_VIDEO_ALERTS_TIMEOUT_MS ?? "180000",
);
const VIDEO_ALERTS_DISCORD_ONLY = ["1", "true", "yes", "on"].includes(
  (process.env.ORACLE_VIDEO_ALERTS_DISCORD_ONLY ?? "").toLowerCase(),
);
const VIDEO_ALERTS_PROD_DISCORD = ["1", "true", "yes", "on"].includes(
  (process.env.ORACLE_VIDEO_ALERTS_PROD_DISCORD ?? "").toLowerCase(),
);

function cleanupTempVideo(tempVideoOutput: string) {
  if (!fs.existsSync(tempVideoOutput)) return;
  try {
    fs.unlinkSync(tempVideoOutput);
    console.log(
      `[Video Pipeline] 🧹 Cleaned up temporary video: ${tempVideoOutput}`,
    );
  } catch (cleanupErr) {
    console.error(
      `[Video Pipeline] ⚠️ Failed to clean up temporary video:`,
      cleanupErr,
    );
  }
}

function wireChildLogs(prefix: string, proc: ReturnType<typeof spawn>) {
  if (proc.stdout) {
    proc.stdout.on("data", (chunk: Buffer) => {
      const text = chunk.toString().trim();
      if (text) {
        console.log(`[Video Pipeline] ${prefix}: ${text}`);
      }
    });
  }
  if (proc.stderr) {
    proc.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString().trim();
      if (text) {
        console.warn(`[Video Pipeline] ${prefix} stderr: ${text}`);
      }
    });
  }
}

/**
 * Triggers the video generation and social posting in the background.
 */
function triggerVideoAlert(
  teamA: string,
  teamB: string,
  scoreA: number,
  scoreB: number,
  eventText: string,
  yieldChange: string
) {
  if (!VIDEO_ALERTS_ENABLED) {
    return;
  }
  console.log(
    `\n[Video Pipeline] 🎬 Triggering video generation & posting in background...`,
  );

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Resolve paths relative to current file (dist or src).
  const projectRoot = path.resolve(__dirname, "../..");
  const generateScript = path.join(projectRoot, "scripts", "generate_video_alert.py");
  const postScript = path.join(projectRoot, "scripts", "post_video_update.py");
  if (!fs.existsSync(generateScript) || !fs.existsSync(postScript)) {
    console.warn(
      `[Video Pipeline] Skipping: missing script(s). generate=${generateScript}, post=${postScript}`,
    );
    return;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const tempVideoOutput = path.join(projectRoot, `temp_oracle_alert_${timestamp}.mp4`);
  const tweetText = `LIVE ORACLE UPDATE: ${eventText} in ${teamA} vs ${teamB}. Yield updated by ${yieldChange}. #GoalChain`;

  const generateArgs = [
    generateScript,
    "--teamA",
    teamA,
    "--teamB",
    teamB,
    "--scoreA",
    String(scoreA),
    "--scoreB",
    String(scoreB),
    "--eventText",
    eventText,
    "--yieldChange",
    yieldChange,
    "-o",
    tempVideoOutput,
  ];

  const postArgs = [postScript, "--video", tempVideoOutput, "--text", tweetText];
  if (VIDEO_ALERTS_DISCORD_ONLY) {
    postArgs.push("--discord-only");
  }
  if (VIDEO_ALERTS_PROD_DISCORD) {
    postArgs.push("--prod");
  }

  const runWithTimeout = (
    label: string,
    args: string[],
    onComplete: (ok: boolean) => void,
  ) => {
    const proc = spawn("python3", args, {
      cwd: projectRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });
    wireChildLogs(label, proc);

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill("SIGTERM");
      console.warn(
        `[Video Pipeline] ${label} timed out after ${VIDEO_ALERTS_TIMEOUT_MS}ms`,
      );
    }, VIDEO_ALERTS_TIMEOUT_MS);

    proc.on("error", (err) => {
      clearTimeout(timer);
      console.error(`[Video Pipeline] ${label} failed to start:`, err);
      onComplete(false);
    });

    proc.on("close", (code) => {
      clearTimeout(timer);
      if (timedOut) {
        onComplete(false);
        return;
      }
      if (code !== 0) {
        console.error(`[Video Pipeline] ${label} exited with code ${code}`);
        onComplete(false);
        return;
      }
      onComplete(true);
    });
  };

  runWithTimeout("generate_video_alert.py", generateArgs, (generatedOk) => {
    if (!generatedOk) {
      cleanupTempVideo(tempVideoOutput);
      return;
    }

    runWithTimeout("post_video_update.py", postArgs, (postOk) => {
      if (!postOk) {
        console.error(
          "[Video Pipeline] Post step failed; oracle flow continues safely.",
        );
      } else {
        console.log("[Video Pipeline] ✅ Video automation completed successfully.");
      }
      cleanupTempVideo(tempVideoOutput);
    });
  });
}

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
  triggerVideoAlert(teamA, teamB, 0, 0, "KICKOFF! The final has started", "+0.0%");

  console.log(`📈 [STEP 3] Creating 'Next Goal' Live Market...`);
  const marketId = 1;
  // Delay 15s to lock market right before a dangerous attack
  await oracle.createLiveMarket(
    matchId,
    marketId,
    { nextGoal: {} },
    15,
    90,
    gchMint,
  );
  console.log(
    "⏳ Live Market Open! Users have 15s delay to bet before a goal...\n",
  );
  await new Promise((r) => setTimeout(r, 15000));

  console.log(`⚽ [STEP 4] GOOOOOOOAL! ARGENTINA SCORES! (Min 23)`);
  await oracle.upsertLiveState(matchId, 23, 1, 0, false, false);
  triggerVideoAlert(teamA, teamB, 1, 0, "GOAL! Lionel Satoshi scores (23')", "+15.4%");

  console.log(`⚖️ [STEP 5] Resolving 'Next Goal' Market (Winner: Team A)`);
  await oracle.resolveMarket(matchId, marketId, { teamA: {} });

  console.log(
    `👤 [STEP 6] Updating Parody Player 'ARG_10' (Messi) Stats (+1 Goal)`,
  );
  // Example player ID logic
  try {
    await oracle.updatePlayerStats("ARG_10", 1, 0);
  } catch (e) {
    console.log(
      `[Oracle] ⚠️ Player ARG_10 not registered on-chain. Skipping stats update.`,
    );
  }

  console.log("\n⏳ Fast-forwarding match to Full Time...\n");
  await new Promise((r) => setTimeout(r, 5000));

  console.log(`🏁 [STEP 7] FULL TIME! Resolving Pre-Match Parimutuel Pools`);
  await oracle.completeFixture(matchId, { teamA: {} });
  triggerVideoAlert(teamA, teamB, 1, 0, "FULL TIME! Argentina wins!", "+25.0%");

  console.log("\n=========================================");
  console.log("🔴 SIMULATION COMPLETE. ORACLE STANDING BY.");
  console.log("=========================================");
}

async function main() {
  const nodeEnv = process.env.NODE_ENV || "development";
  const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8899";
  const keypairPath =
    process.env.ORACLE_KEYPAIR_PATH || "~/.config/solana/id.json";
  const programId =
    process.env.PROGRAM_ID || "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg";

  console.log(`📡 Oracle Configuration:`);
  console.log(`   - Environment: ${nodeEnv.toUpperCase()}`);
  console.log(`   - RPC URL: ${rpcUrl}`);
  console.log(`   - Keypair: ${keypairPath}`);
  console.log(`   - Program ID: ${programId}\n`);

  try {
    const oracle = new OracleService(rpcUrl, keypairPath, programId);
    console.log(
      `✅ Oracle Service initialized successfully. Wallet: ${oracle.wallet.publicKey.toBase58()}`,
    );

    let gchMint: PublicKey;
    let treasuryAta: PublicKey;
    let jackpotAta: PublicKey;

    if (nodeEnv === "production") {
      const mintStr = process.env.GCH_MINT;
      const treasuryStr = process.env.TREASURY_TOKEN_ACCOUNT;
      const jackpotStr = process.env.JACKPOT_TOKEN_ACCOUNT;

      if (!mintStr || !treasuryStr) {
        throw new Error(
          "GCH_MINT and TREASURY_TOKEN_ACCOUNT must be defined in .env for production mode.",
        );
      }

      gchMint = new PublicKey(mintStr);
      treasuryAta = new PublicKey(treasuryStr);
      jackpotAta = jackpotStr ? new PublicKey(jackpotStr) : treasuryAta;

      console.log(`🛡️ Production Mode Active. Using existing Tokens:`);
      console.log(`   - GCH Mint: ${gchMint.toBase58()}`);
      console.log(`   - Treasury Token Account: ${treasuryAta.toBase58()}`);
      console.log(`   - Jackpot Token Account: ${jackpotAta.toBase58()}`);
    } else {
      console.log(
        `🪙 Development Mode Active. Initializing dummy configurations...`,
      );
      treasuryAta = PublicKey.unique();
      jackpotAta = treasuryAta;

      console.log(`🪙 Minting Demo $GCH Token for Market testing...`);
      gchMint = await createMint(
        oracle.connection,
        (oracle.wallet as any).payer,
        oracle.wallet.publicKey,
        null,
        6,
      );
    }

    // Sync Oracle Authority on the blockchain config PDA
    await oracle.syncOracleAuthority(treasuryAta, jackpotAta);

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
