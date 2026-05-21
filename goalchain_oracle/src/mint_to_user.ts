import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error("❌ Usage: npm run mint-to -- <DESTINATION_WALLET> <AMOUNT>");
        process.exit(1);
    }

    const destinationStr = args[0];
    const amountStr = args[1];
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
        console.error("❌ Invalid amount specified.");
        process.exit(1);
    }

    const rpcUrl = "https://api.devnet.solana.com";
    const keypairPath = "~/.config/solana/id.json";
    const mintStr = "49zjYVf8GYSWWyfxruM9eSVoXzUmbevxUzXn8TTYqbAA"; // Official $GCH Mint

    const resolvedPath = keypairPath.startsWith("~") 
        ? keypairPath.replace("~", process.env.HOME || "") 
        : keypairPath;
    const secretKey = JSON.parse(fs.readFileSync(path.resolve(resolvedPath), "utf8"));
    const payer = Keypair.fromSecretKey(new Uint8Array(secretKey));

    console.log(`📡 Connecting to Solana Devnet...`);
    const connection = new Connection(rpcUrl, "confirmed");
    
    try {
        const destPubkey = new PublicKey(destinationStr);
        const mintPubkey = new PublicKey(mintStr);

        console.log(`🪙 Minting ${amount.toLocaleString()} $GCH to: ${destPubkey.toBase58()}`);
        console.log(`🏦 Setting up/Retrieving Associated Token Account...`);
        
        const ata = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mintPubkey,
            destPubkey
        );

        console.log(`🎉 ATA Ready: ${ata.address.toBase58()}`);

        const mintAmount = amount * 1_000_000; // 6 Decimals
        const tx = await mintTo(
            connection,
            payer,
            mintPubkey,
            ata.address,
            payer,
            mintAmount
        );

        console.log(`\n=========================================`);
        console.log(`✅ SUCCESS! Minted ${amount} $GCH!`);
        console.log(`🔗 Transaction signature: ${tx}`);
        console.log(`🔍 View on Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
        console.log(`=========================================`);

    } catch (error) {
        console.error("❌ Minting Failed:", error);
    }
}

main();
