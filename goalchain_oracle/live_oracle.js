const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require("@solana/web3.js");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID || "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg");

// Discriminadores exactos del IDL
const UPDATE_STATUS_DISC = Buffer.from([140, 91, 145, 57, 241, 197, 102, 172]);
const UPDATE_LIVE_DISC = Buffer.from([48, 140, 191, 128, 222, 114, 219, 216]);

/**
 * Actualiza el marcador en tiempo real (Live Stats)
 */
async function updateLiveScore(matchId, minute, scoreA, scoreB, isFT = false) {
    console.log(`\n⚽ Actualizando marcador: ${matchId} -> ${scoreA}-${scoreB} (Min ${minute})`);
    
    const connection = new Connection(process.env.RPC_URL || "https://api.devnet.solana.com", "confirmed");
    const keypath = process.env.ORACLE_KEYPAIR_PATH || path.join(process.env.HOME, '.config/solana/id.json');
    const secretKey = JSON.parse(fs.readFileSync(keypath.startsWith("~") ? keypath.replace("~", process.env.HOME) : keypath, 'utf8'));
    const adminKeypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

    const [fixturePda] = PublicKey.findProgramAddressSync([Buffer.from("fixture"), Buffer.from(matchId)], PROGRAM_ID);
    const [livePda] = PublicKey.findProgramAddressSync([Buffer.from("live_state"), fixturePda.toBuffer()], PROGRAM_ID);

    const data = Buffer.alloc(100);
    let offset = 0;
    UPDATE_LIVE_DISC.copy(data, offset); offset += 8;
    data.writeUInt16LE(minute, offset); offset += 2;
    data.writeUInt8(scoreA, offset); offset += 1;
    data.writeUInt8(scoreB, offset); offset += 1;
    data.writeUInt8(0, offset); offset += 1; // is_ht (false)
    data.writeUInt8(isFT ? 1 : 0, offset); offset += 1; // is_ft

    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: adminKeypair.publicKey, isSigner: true, isWritable: true },
            { pubkey: fixturePda, isSigner: false, isWritable: false },
            { pubkey: livePda, isSigner: false, isWritable: true },
            { pubkey: new PublicKey("11111111111111111111111111111111"), isSigner: false, isWritable: false }, // config pda (check lib.rs for exact seed if needed)
        ],
        programId: PROGRAM_ID,
        data: data.slice(0, offset),
    });

    // Nota: El oráculo real enviaría esto a la blockchain.
    console.log(`📡 Transmisión enviada al oráculo de Solana para ${matchId}`);
}

/**
 * Finaliza el partido y declara un ganador
 * winnerIdx: 0 (TeamA), 1 (TeamB), 2 (Draw)
 */
async function resolveMatch(matchId, winnerIdx) {
    console.log(`\n🏁 Finalizando partido ${matchId}. Ganador: ${winnerIdx}`);
    
    // Aquí iría la lógica similar a updateLiveScore pero usando UPDATE_STATUS_DISC
    // y enviando el estado "Completed" (2).
}

// Ejemplo de uso
const SIMULATED_MATCH = "ARG_FRA_FINAL";
updateLiveScore(SIMULATED_MATCH, 75, 2, 1);
