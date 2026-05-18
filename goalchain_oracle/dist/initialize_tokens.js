import { Connection, Keypair } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function main() {
    const rpcUrl = "https://api.devnet.solana.com";
    const keypairPath = "~/.config/solana/id.json";
    const resolvedPath = keypairPath.startsWith("~")
        ? keypairPath.replace("~", process.env.HOME || "")
        : keypairPath;
    const secretKey = JSON.parse(fs.readFileSync(path.resolve(resolvedPath), "utf8"));
    const payer = Keypair.fromSecretKey(new Uint8Array(secretKey));
    console.log(`📡 Connecting to Solana Devnet...`);
    const connection = new Connection(rpcUrl, "confirmed");
    console.log(`✅ Loaded Wallet: ${payer.publicKey.toBase58()}`);
    try {
        console.log(`🪙 Creating official $GCH SPL Mint...`);
        const mint = await createMint(connection, payer, payer.publicKey, payer.publicKey, 6 // 6 decimals
        );
        console.log(`🎉 Mint created successfully! Address: ${mint.toBase58()}`);
        console.log(`🏦 Creating Associated Treasury Token Account...`);
        const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey);
        console.log(`🎉 Treasury Token Account created! Address: ${tokenAccount.address.toBase58()}`);
        console.log(`🪙 Minting 10,000,000 $GCH to Treasury...`);
        const mintAmount = 10_000_000 * 1_000_000; // 10M GCH with 6 decimals
        const tx = await mintTo(connection, payer, mint, tokenAccount.address, payer, mintAmount);
        console.log(`🎉 Successfully minted 10,000,000 $GCH! Tx: ${tx}`);
        console.log("\n=========================================");
        console.log("📝 COPY THESE INTO YOUR goalchain_oracle/.env FILE:");
        console.log("=========================================");
        console.log(`NODE_ENV=production`);
        console.log(`RPC_URL=https://api.devnet.solana.com`);
        console.log(`ORACLE_KEYPAIR_PATH=${keypairPath}`);
        console.log(`PROGRAM_ID=FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg`);
        console.log(`GCH_MINT=${mint.toBase58()}`);
        console.log(`TREASURY_TOKEN_ACCOUNT=${tokenAccount.address.toBase58()}`);
        console.log("=========================================");
    }
    catch (error) {
        console.error("❌ Token Initialization Failed:", error);
    }
}
main();
