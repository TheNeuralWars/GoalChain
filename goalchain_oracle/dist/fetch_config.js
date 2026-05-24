import { Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function main() {
    const rpcUrl = "https://api.devnet.solana.com";
    const programIdStr = "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg";
    const connection = new Connection(rpcUrl, "confirmed");
    const programId = new PublicKey(programIdStr);
    const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("config")], programId);
    console.log("Config PDA Address:", configPda.toBase58());
    // We need to fetch the account data and deserialize it
    const idlPath = path.resolve(__dirname, "../../goalchain_program/target/idl/goalchain_program.json");
    if (!fs.existsSync(idlPath)) {
        console.error("IDL file not found at:", idlPath);
        return;
    }
    const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
    // Create a dummy wallet
    const wallet = new anchor.Wallet(anchor.web3.Keypair.generate());
    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
    const program = new anchor.Program(idl, provider);
    try {
        const configData = await program.account.globalConfig.fetch(configPda);
        console.log("On-chain Config:", JSON.stringify(configData, (key, value) => {
            if (value instanceof PublicKey) {
                return value.toBase58();
            }
            if (typeof value === "bigint" || (value && value.toString && typeof value === "object" && value.constructor.name === "BN")) {
                return value.toString();
            }
            return value;
        }, 2));
    }
    catch (err) {
        console.error("Error fetching config:", err);
    }
}
main().catch(console.error);
