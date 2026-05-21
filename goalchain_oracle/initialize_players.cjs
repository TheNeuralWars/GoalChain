const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require("@solana/web3.js");
const anchor = require("@coral-xyz/anchor");
const fs = require('fs');
const path = require('path');
const { BorshInstructionCoder } = require("@coral-xyz/anchor");

const PROGRAM_ID = new PublicKey("FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg");

// Discriminator para 'init_parody_player' (lo sacamos del IDL anterior)
const INIT_DISC = Buffer.from([47, 202, 43, 87, 50, 56, 115, 94]);

async function initPlayer(playerId, name, speed, shotPower) {
    console.log(`\n🆕 Inicializando jugador (Manual): ${name} (${playerId})...`);

    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const secretKey = JSON.parse(fs.readFileSync(path.join(process.env.HOME, '.config/solana/id.json'), 'utf8'));
    const adminKeypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

    const [playerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("player"), Buffer.from(playerId)],
        PROGRAM_ID
    );

    // Codificación manual de los argumentos (Borsh)
    // playerId (string), name (string), initial_speed (u8), initial_shot_power (u8)
    const playerIdBuf = Buffer.from(playerId, 'utf8');
    const nameBuf = Buffer.from(name, 'utf8');
    
    // Layout: [len(4 bytes) + content] for strings
    const data = Buffer.alloc(1000); // Espacio de sobra
    let offset = 0;
    INIT_DISC.copy(data, offset); offset += 8;
    
    data.writeUInt32LE(playerIdBuf.length, offset); offset += 4;
    playerIdBuf.copy(data, offset); offset += playerIdBuf.length;
    
    data.writeUInt32LE(nameBuf.length, offset); offset += 4;
    nameBuf.copy(data, offset); offset += nameBuf.length;
    
    data.writeUInt8(speed, offset); offset += 1;
    data.writeUInt8(shotPower, offset); offset += 1;

    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: adminKeypair.publicKey, isSigner: true, isWritable: true },
            { pubkey: playerPda, isSigner: false, isWritable: true },
            { pubkey: anchor.web3.SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: data.slice(0, offset),
    });

    const tx = new Transaction().add(instruction);
    try {
        const signature = await connection.sendTransaction(tx, [adminKeypair]);
        await connection.confirmTransaction(signature);
        console.log(`✅ Jugador Creado! Signature: ${signature}`);
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

async function main() {
    await initPlayer("lionel_bitcoin_v2", "Lionel Bitcoin V2", 85, 92);
    await initPlayer("cristiano_ethereum_v2", "Cristiano Ethereum V2", 90, 88);
}

main().catch(console.error);
