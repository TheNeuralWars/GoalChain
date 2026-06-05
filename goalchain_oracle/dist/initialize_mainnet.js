import pkg from "@coral-xyz/anchor";
const { BN } = pkg;
import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { getPriorityFeeInstructions } from "./priorityFees.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
async function main() {
    const rpcUrl = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
    const programIdStr = process.env.PROGRAM_ID || "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg";
    const adminKeypairPath = process.env.ADMIN_KEYPAIR_PATH || "~/.config/solana/id.json";
    // Config Parameters
    const oraclePubkeyStr = process.env.ORACLE_AUTHORITY_PUBKEY;
    const treasuryTokenAccountStr = process.env.TREASURY_TOKEN_ACCOUNT;
    const jackpotTokenAccountStr = process.env.JACKPOT_TOKEN_ACCOUNT;
    const feeBps = parseInt(process.env.FEE_BPS || "100"); // default 1%
    const cutoffSeconds = parseInt(process.env.CUTOFF_BUFFER_SECONDS || "900"); // default 15 mins
    if (!oraclePubkeyStr || !treasuryTokenAccountStr) {
        console.error("❌ Error: ORACLE_AUTHORITY_PUBKEY and TREASURY_TOKEN_ACCOUNT must be defined in env.");
        process.exit(1);
    }
    const programId = new PublicKey(programIdStr);
    const oracleAuthority = new PublicKey(oraclePubkeyStr);
    const treasuryTokenAccount = new PublicKey(treasuryTokenAccountStr);
    const jackpotTokenAccount = new PublicKey(jackpotTokenAccountStr || treasuryTokenAccountStr);
    console.log(`🚀 GoalChain Mainnet Config Initializer`);
    console.log(`=======================================`);
    console.log(`RPC URL:                  ${rpcUrl}`);
    console.log(`Program ID:               ${programId.toBase58()}`);
    console.log(`Admin Keypair Path:       ${adminKeypairPath}`);
    console.log(`Oracle Authority:         ${oracleAuthority.toBase58()}`);
    console.log(`Treasury Token Account:   ${treasuryTokenAccount.toBase58()}`);
    console.log(`Jackpot Token Account:    ${jackpotTokenAccount.toBase58()}`);
    console.log(`Fee Bps:                  ${feeBps} (${feeBps / 100}%)`);
    console.log(`Cutoff Buffer (sec):      ${cutoffSeconds} (${cutoffSeconds / 60} mins)`);
    console.log(`=======================================`);
    // Load admin wallet
    const resolvedPath = adminKeypairPath.startsWith("~")
        ? adminKeypairPath.replace("~", process.env.HOME || "")
        : adminKeypairPath;
    const secretKey = JSON.parse(fs.readFileSync(path.resolve(resolvedPath), "utf8"));
    const adminKeypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
    const wallet = new anchor.Wallet(adminKeypair);
    const connection = new Connection(rpcUrl, "confirmed");
    const provider = new anchor.AnchorProvider(connection, wallet, {
        commitment: "confirmed",
    });
    anchor.setProvider(provider);
    // Load program IDL
    const idl = JSON.parse(fs.readFileSync(path.join(__dirname, "../../goalchain_program/target/idl/goalchain_program.json"), "utf8"));
    const program = new anchor.Program(idl, provider);
    const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("config")], programId);
    console.log(`Config PDA derived:       ${configPda.toBase58()}`);
    const configInfo = await connection.getAccountInfo(configPda);
    let method;
    if (!configInfo) {
        console.log(`📝 Config PDA not initialized. Initializing new config...`);
        method = program.methods
            .initializeConfig(oracleAuthority, treasuryTokenAccount, jackpotTokenAccount, feeBps, new BN(cutoffSeconds), new BN(2 * anchor.web3.LAMPORTS_PER_SOL), true)
            .accounts({
            admin: wallet.publicKey,
            config: configPda,
            systemProgram: SystemProgram.programId,
        });
    }
    else {
        console.log(`📝 Config PDA already exists. Updating existing config...`);
        method = program.methods
            .updateConfig(oracleAuthority, treasuryTokenAccount, jackpotTokenAccount, feeBps, new BN(cutoffSeconds), new BN(2 * anchor.web3.LAMPORTS_PER_SOL), true)
            .accounts({
            admin: wallet.publicKey,
            config: configPda,
        });
    }
    const instruction = await method.instruction();
    const accountKeys = [wallet.publicKey.toBase58(), configPda.toBase58()];
    const priorityFeeIxs = await getPriorityFeeInstructions(connection, accountKeys, 250000);
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
    await connection.confirmTransaction({
        signature: txid,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    }, "confirmed");
    console.log(`✅ Mainnet Configuration successfully applied! Tx: ${txid}`);
}
main().catch((err) => {
    console.error("❌ Critical Error initializing config:", err);
    process.exit(1);
});
