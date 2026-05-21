const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require("@solana/web3.js");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID || "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg");

// Discriminadores exactos del IDL
const INIT_FIXTURE_DISC = Buffer.from([26, 99, 178, 9, 192, 14, 167, 207]);

async function initFixture(matchId, teamA, teamB, startTime) {
    console.log(`\n🏟️ Creando Fixture: ${teamA} vs ${teamB} (${matchId})...`);

    const connection = new Connection(process.env.RPC_URL || "https://api.devnet.solana.com", "confirmed");
    const keypath = process.env.ORACLE_KEYPAIR_PATH || path.join(process.env.HOME, '.config/solana/id.json');
    const secretKey = JSON.parse(fs.readFileSync(keypath.startsWith("~") ? keypath.replace("~", process.env.HOME) : keypath, 'utf8'));
    const adminKeypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

    const [fixturePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("fixture"), Buffer.from(matchId)],
        PROGRAM_ID
    );

    const data = Buffer.alloc(1000);
    let offset = 0;
    INIT_FIXTURE_DISC.copy(data, offset); offset += 8;

    const writeString = (s) => {
        const buf = Buffer.from(s, 'utf8');
        data.writeUInt32LE(buf.length, offset); offset += 4;
        buf.copy(data, offset); offset += buf.length;
    };

    writeString(matchId);
    writeString(teamA);
    writeString(teamB);
    data.writeBigInt64LE(BigInt(startTime), offset); offset += 8;

    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: adminKeypair.publicKey, isSigner: true, isWritable: true },
            { pubkey: fixturePda, isSigner: false, isWritable: true },
            { pubkey: new PublicKey("11111111111111111111111111111111"), isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: data.slice(0, offset),
    });

    const tx = new Transaction().add(instruction);
    try {
        const signature = await connection.sendTransaction(tx, [adminKeypair]);
        await connection.confirmTransaction(signature);
        console.log(`✅ Fixture creado en Solana! Signature: ${signature}`);
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

async function main() {
    const matchStartTime = Math.floor(Date.now() / 1000) + 3600;
    await initFixture("ARG_POR_QTR", "Argentina", "Portugal", matchStartTime);
}

main().catch(console.error);
