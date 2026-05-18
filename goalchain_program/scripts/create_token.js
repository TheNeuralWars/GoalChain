const { Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = require('@solana/spl-token');

async function createGoalChainToken() {
    console.log("\n=============================================");
    console.log("   🚀 INICIANDO CREACIÓN DE TOKEN $GCH 🚀   ");
    console.log("=============================================\n");

    const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
    
    // Generar la wallet del "Administrador" (El creador temporal)
    const payer = Keypair.generate();
    
    console.log("1️⃣  Solicitando Airdrop de SOL en Localnet para pagar la transacción...");
    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    
    // Esperar confirmación
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: airdropSignature,
    });
    
    console.log("   ✅ Airdrop recibido con éxito.\n");
    
    console.log("2️⃣  Creando Token Mint para $GCH (GoalChain)...");
    const mint = await createMint(
        connection,
        payer, // Payer de los fees
        payer.publicKey, // Mint Authority (Luego se transferirá al Smart Contract)
        null, // Freeze Authority
        6 // Decimales (1 GCH = 1,000,000 microGCH)
    );
    
    console.log("   ✅ ¡Token Creado Oficialmente!");
    console.log(`   🪙  MINT ADDRESS: \x1b[32m${mint.toBase58()}\x1b[0m\n`);
    
    console.log("3️⃣  Creando cuenta asociada para 'The Vault'...");
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        payer.publicKey
    );
    
    console.log("4️⃣  Minteando 100,000 $GCH iniciales para pruebas económicas...");
    await mintTo(
        connection,
        payer,
        mint,
        tokenAccount.address,
        payer.publicKey,
        100000 * (10 ** 6) // 100k tokens con 6 decimales
    );
    
    console.log("\n=============================================");
    console.log("🎉 MISIÓN CUMPLIDA. EL PROTOCOLO TIENE VIDA.");
    console.log("=============================================\n");
}

createGoalChainToken().catch(err => {
    console.error("❌ Error fatal:", err);
});
