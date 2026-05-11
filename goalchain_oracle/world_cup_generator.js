const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require("@solana/web3.js");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PROGRAM_ID = new PublicKey("FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg");
const INIT_FIXTURE_DISC = Buffer.from([26, 99, 178, 9, 192, 14, 167, 207]);

async function createFixture(connection, adminKeypair, matchId, teamA, teamB, startTime) {
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

    return instruction;
}

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const secretKey = JSON.parse(fs.readFileSync(path.join(process.env.HOME, '.config/solana/id.json'), 'utf8'));
    const adminKeypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

    console.log("🏆 Inicializando Fase de Eliminatorias de GoalChain...");

    const startTime = Math.floor(Date.now() / 1000) + 86400; // Mañana
    const tx = new Transaction();

    // Creamos los otros 3 partidos de Cuartos
    tx.add(await createFixture(connection, adminKeypair, "BRA_ENG_QTR", "Brasil", "Inglaterra", startTime));
    tx.add(await createFixture(connection, adminKeypair, "FRA_GER_QTR", "Francia", "Alemania", startTime));
    tx.add(await createFixture(connection, adminKeypair, "SPA_ITA_QTR", "España", "Italia", startTime));

    // Añadimos un evento tipo Polymarket (Prop Bet)
    tx.add(await createFixture(connection, adminKeypair, "ARG_CHAMP_YES_NO", "ARG Campeón: SÍ", "ARG Campeón: NO", startTime));

    const signature = await connection.sendTransaction(tx, [adminKeypair]);
    console.log(`✅ ¡Mundial Inicializado! Cuadro de Cuartos y Mercados Binarios listos. Sig: ${signature}`);
}

main().catch(console.error);
