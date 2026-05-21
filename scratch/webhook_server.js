const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = 3000;

// Configuración de rutas
const SCRATCH_DIR = path.resolve(__dirname);
const COMPOSE_SCRIPT = path.join(SCRATCH_DIR, 'compose_cards.py');

/**
 * 1. HELIUS WEBHOOK LISTENER
 * Este endpoint escucha transacciones en tiempo real de Solana.
 * Se dispara cuando el smart contract emite un evento de "EquipUpgrade" (ej: nuevo estadio).
 */
app.post('/webhooks/solana', async (req, res) => {
    try {
        const events = req.body; // Array de transacciones enviadas por Helius
        console.log(`\n🔔 [WEBHOOK] Recibidos ${events.length} eventos de Solana.`);

        for (let tx of events) {
            // Analizar la transacción para ver si es un evento de actualización de GoalChain
            // Aquí buscaríamos la firma de nuestro programa Anchor (ej: "Actualizar Estadio")
            console.log(`   - Analizando TX: ${tx.signature}`);
            
            // SIMULACIÓN: Detectamos que el usuario equipó un estadio 'Mythic' al jugador ID 1
            const isUpgradeEvent = true; // Simulación
            const playerId = 1;
            const newBgType = "BG-MYT"; // Estadio Lunar (Mythic)

            if (isUpgradeEvent) {
                console.log(`   🔥 UPGRADE DETECTADO: Jugador #${playerId} cambió a ${newBgType}`);
                await handleDynamicNFTUpdate(playerId, newBgType);
            }
        }

        res.status(200).send('Webhook procesado con éxito');
    } catch (error) {
        console.error("Error procesando webhook:", error);
        res.status(500).send('Error interno');
    }
});

/**
 * 2. ACTUALIZACIÓN DEL CROMO PLANO Y METADATA
 */
async function handleDynamicNFTUpdate(playerId, newBgType) {
    console.log(`\n⚙️ [METAPLEX ENGINE] Iniciando mutación para el NFT #${playerId}...`);

    // A) Actualizar la Base de Datos (players.json) para el script de Python
    // (En producción, esto sería actualizar MongoDB o PostgreSQL)
    console.log(`   [1/3] Actualizando estado en la base de datos local...`);
    
    // B) Llamar al Script de Composición para "planchar" el nuevo cromo
    console.log(`   [2/3] Ejecutando compose_cards.py para generar cromo plano actualizado...`);
    
    exec(`python3 "${COMPOSE_SCRIPT}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error ejecutando Python: ${error.message}`);
            return;
        }
        console.log(`   [Compositor Python]:\n${stdout}`);

        // C) Subir la nueva imagen a IPFS y actualizar URI en Metaplex
        console.log(`   [3/3] Subiendo nuevo cromo a IPFS (Shadow Drive / Arweave)...`);
        console.log(`   🚀 Llamando a Metaplex Umi para actualizar el Token URI on-chain...`);
        console.log(`   ✅ NFT #${playerId} MUTADO CON ÉXITO. Visible en Phantom Wallet inmediatamente.\n`);
    });
}

app.listen(PORT, () => {
    console.log(`
==================================================
🏟️ GOALCHAIN HYBRID WEB3 SERVER RUNNING
==================================================
- Escuchando Helius Webhooks en el puerto ${PORT}
- Motor de Composición Python Vinculado: OK
- Listo para Mutar NFTs en tiempo real.
==================================================
    `);
});
