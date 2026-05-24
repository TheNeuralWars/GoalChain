import pkg from "@coral-xyz/anchor";
const { BN } = pkg;
import * as anchor from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { getPriorityFeeInstructions } from "./priorityFees.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function main() {
  const rpcUrl = process.env.RPC_URL || "https://api.devnet.solana.com";
  const programIdStr =
    process.env.PROGRAM_ID || "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg";
  const adminKeypairPath =
    process.env.ORACLE_KEYPAIR_PATH || "~/.config/solana/id.json";

  const programId = new PublicKey(programIdStr);

  console.log(`🚀 GoalChain Config Migrator`);
  console.log(`=======================================`);
  console.log(`RPC URL:            ${rpcUrl}`);
  console.log(`Program ID:         ${programId.toBase58()}`);
  console.log(`Admin Keypair Path: ${adminKeypairPath}`);
  console.log(`=======================================`);

  // Load admin wallet
  const resolvedPath = adminKeypairPath.startsWith("~")
    ? adminKeypairPath.replace("~", process.env.HOME || "")
    : adminKeypairPath;
  const secretKey = JSON.parse(
    fs.readFileSync(path.resolve(resolvedPath), "utf8"),
  );
  const adminKeypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
  const wallet = new anchor.Wallet(adminKeypair);

  const connection = new Connection(rpcUrl, "confirmed");
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // Load program IDL
  const idl = JSON.parse(
    fs.readFileSync(
      path.join(
        __dirname,
        "../../goalchain_program/target/idl/goalchain_program.json",
      ),
      "utf8",
    ),
  );
  const program = new anchor.Program(idl, provider) as any;

  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    programId,
  );
  console.log(`Config PDA derived: ${configPda.toBase58()}`);

  const configInfo = await connection.getAccountInfo(configPda);
  if (!configInfo) {
    console.error("❌ Error: Config PDA does not exist on-chain! Initialize it first.");
    process.exit(1);
  }

  console.log(`Current config account data length: ${configInfo.data.length} bytes`);
  if (configInfo.data.length >= 159) {
    console.log("✅ Config account is already migrated/resized! Skipping migration.");
    return;
  }

  console.log(`📝 Resizing config account to 159 bytes and migrating data...`);

  const method = program.methods
    .migrateConfig()
    .accounts({
      admin: wallet.publicKey,
      config: configPda,
      systemProgram: SystemProgram.programId,
    } as any);

  const instruction = await method.instruction();
  const accountKeys = [wallet.publicKey.toBase58(), configPda.toBase58()];
  const priorityFeeIxs = await getPriorityFeeInstructions(
    connection,
    accountKeys,
    250000,
  );

  const tx = new Transaction().add(...priorityFeeIxs, instruction);
  const latestBlockhash = await connection.getLatestBlockhash();
  tx.recentBlockhash = latestBlockhash.blockhash;
  tx.feePayer = wallet.publicKey;

  console.log(`✍️ Signing and sending transaction with priority fees...`);
  const signedTx = await wallet.signTransaction(tx);
  const rawTx = signedTx.serialize();
  const txid = await connection.sendRawTransaction(rawTx, {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });

  console.log(`⏳ Confirming transaction: ${txid}...`);
  await connection.confirmTransaction(
    {
      signature: txid,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    },
    "confirmed",
  );

  console.log(`✅ Config successfully migrated!`);
  
  // Re-fetch to verify new length and data
  const updatedInfo = await connection.getAccountInfo(configPda);
  if (updatedInfo) {
    console.log(`New config account data length: ${updatedInfo.data.length} bytes`);
  }
}

main().catch((err) => {
  console.error("❌ Critical Error migrating config:", err);
  process.exit(1);
});
