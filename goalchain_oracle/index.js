const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require("@solana/web3.js");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PROGRAM_ID = new PublicKey("FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg");
const UPDATE_STATS_DISC = Buffer.from([61, 85, 73, 244, 51, 95, 21, 33]);

async function updatePlayerOnChain(playerId, goals, assists) {
    console.log(`\n--- ⚽ Actualizando estadísticas para: ${playerId} ---`);

    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const secretKey = JSON.parse(fs.readFileSync(path.join(process.env.HOME, '.config/solana/id.json'), 'utf8'));
    const oracleKeypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

    const [playerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("player"), Buffer.from(playerId)],
        PROGRAM_ID
    );

    // Codificación manual: discriminator (8) + goals (1) + assists (1)
    const data = Buffer.alloc(10);
    UPDATE_STATS_DISC.copy(data, 0);
    data.writeUInt8(goals, 8);
    data.writeUInt8(assists, 9);

    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: oracleKeypair.publicKey, isSigner: true, isWritable: true },
            { pubkey: playerPda, isSigner: false, isWritable: true },
        ],
        programId: PROGRAM_ID,
        data: data,
    });

    const tx = new Transaction().add(instruction);
    try {
        const signature = await connection.sendTransaction(tx, [oracleKeypair]);
        await connection.confirmTransaction(signature);
        console.log(`🚀 ¡Éxito! Stats actualizados. Signature: ${signature}`);
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

async function main() {
    console.log("📡 GoalChain Oracle v2.1 (Manual) - Actualizando desde el Mundo Real...");

    const playersToUpdate = [
        { id: "lionel_bitcoin", goals: 3, assists: 2 },
        { id: "cristiano_ethereum", goals: 2, assists: 1 }
    ];

    for (const player of playersToUpdate) {
        await updatePlayerOnChain(player.id, player.goals, player.assists);
    }
}

main().catch(console.error);
