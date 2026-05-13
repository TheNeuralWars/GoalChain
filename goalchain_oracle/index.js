const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require("@solana/web3.js");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuración de Red y Programa
const PROGRAM_ID = new PublicKey("FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg");
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Cargar Autoridad (Wallet del Oráculo)
const secretKey = JSON.parse(fs.readFileSync(path.join(process.env.HOME, '.config/solana/id.json'), 'utf8'));
const oracleKeypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

// Discriminadores (Obtenidos del Smart Contract)
const DISC = {
    INIT_FIXTURE: Buffer.from([26, 99, 178, 9, 192, 14, 167, 207]),
    UPDATE_LIVE: Buffer.from([48, 140, 191, 128, 222, 114, 219, 216]),
    RESOLVE: Buffer.from([140, 91, 145, 57, 241, 197, 102, 172])
};

/**
 * Registra un nuevo partido en la Blockchain
 */
async function registerFixture(matchId, teamA, teamB, startTime) {
    console.log(`🏟️ Registrando: ${teamA} vs ${teamB}...`);
    
    const [fixturePda] = PublicKey.findProgramAddressSync([Buffer.from("fixture"), Buffer.from(matchId)], PROGRAM_ID);
    
    const data = Buffer.alloc(500);
    let offset = 0;
    DISC.INIT_FIXTURE.copy(data, offset); offset += 8;
    
    const writeString = (s) => {
        const buf = Buffer.from(s, 'utf8');
        data.writeUInt32LE(buf.length, offset); offset += 4;
        buf.copy(data, offset); offset += buf.length;
    };

    writeString(matchId); writeString(teamA); writeString(teamB);
    data.writeBigInt64LE(BigInt(startTime), offset); offset += 8;

    const ix = new TransactionInstruction({
        keys: [
            { pubkey: oracleKeypair.publicKey, isSigner: true, isWritable: true },
            { pubkey: fixturePda, isSigner: false, isWritable: true },
            { pubkey: PublicKey.default, isSigner: false, isWritable: false }, // System Program placeholder
        ],
        programId: PROGRAM_ID,
        data: data.slice(0, offset),
    });

    // Envío simplificado para esta demo
    console.log(`✅ Instrucción lista para ${matchId}`);
    return ix;
}

/**
 * Envía un gol o actualización de tiempo al contrato
 */
async function pushLiveUpdate(matchId, minute, scoreA, scoreB, isFT = false) {
    const [fixturePda] = PublicKey.findProgramAddressSync([Buffer.from("fixture"), Buffer.from(matchId)], PROGRAM_ID);
    const [livePda] = PublicKey.findProgramAddressSync([Buffer.from("live_state"), fixturePda.toBuffer()], PROGRAM_ID);
    const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("config")], PROGRAM_ID);

    const data = Buffer.alloc(100);
    let offset = 0;
    DISC.UPDATE_LIVE.copy(data, offset); offset += 8;
    data.writeUInt16LE(minute, offset); offset += 2;
    data.writeUInt8(scoreA, offset); offset += 1;
    data.writeUInt8(scoreB, offset); offset += 1;
    data.writeUInt8(0, offset); offset += 1; // is_ht
    data.writeUInt8(isFT ? 1 : 0, offset); offset += 1; // is_ft

    const ix = new TransactionInstruction({
        keys: [
            { pubkey: oracleKeypair.publicKey, isSigner: true, isWritable: true },
            { pubkey: configPda, isSigner: false, isWritable: false },
            { pubkey: fixturePda, isSigner: false, isWritable: false },
            { pubkey: livePda, isSigner: false, isWritable: true },
            { pubkey: PublicKey.default, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: data.slice(0, offset),
    });

    console.log(`⚽ GOOOOL! ${matchId}: ${scoreA}-${scoreB} (Min ${minute})`);
    return ix;
}

// Lógica de simulación para pruebas
async function runDemo() {
    console.log("🚀 GoalChain Oracle System - Online");
    const matchId = "FINAL_2026_ARG_POR";
    
    // 1. Crear el partido
    await registerFixture(matchId, "Argentina", "Portugal", Math.floor(Date.now()/1000) + 3600);
    
    // 2. Simular un gol a los 3 segundos
    setTimeout(() => pushLiveUpdate(matchId, 23, 1, 0), 3000);
    
    // 3. Simular empate a los 6 segundos
    setTimeout(() => pushLiveUpdate(matchId, 44, 1, 1), 6000);
}

if (require.main === module) {
    runDemo();
}
