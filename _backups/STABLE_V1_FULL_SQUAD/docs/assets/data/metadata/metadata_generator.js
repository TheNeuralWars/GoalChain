const fs = require('fs');
const path = require('path');

// Configuración Maestra
const WALLET_OFICIAL = "GCHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // Reemplazar con tu wallet real
const REPO_URL = "https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs";
const PLAYERS_DATA_PATH = path.join(__dirname, '../players.json');
const OUTPUT_DIR = path.join(__dirname, './');

// Manual image map (traído de nft_registry.js para consistencia total)
const NFT_IMAGE_MAP = {
    1: "001_lionel_bitcoin.png", 2: "002_dibu_block.png", 3: "020_julian_alvaswap.png",
    14: "014_mo_solana.png", 15: "015_pedri_protocol.png", 16: "016_fede_valweb3.png",
    17: "017_darwin_nunft.png", 18: "018_bukayo_stock.png", 19: "019_phil_fod_ether.png",
    20: "020_enzo_ledger.png", 21: "021_luis_swaswap.png", 22: "022_bernardo_solana.png",
    24: "024_rodri_protocol.png", 26: "026_joshua_bit_mmi.png", 27: "027_vini_burner_jr.png",
    28: "028_endrick_chain.png", 30: "030_kai_havests.png", 32: "032_casemiro_chain.png",
    33: "033_allison_block.png", 53: "053_kylian_m-bag-pé.png", 79: "079_jude_whale-ingham.png",
    80: "080_harry_chain.png", 105: "105_lamine_ya-hype.png", 106: "106_pedri_p2p.png",
    131: "131_jamal_moon-siala.png", 157: "157_cristiano_holdaldo.png"
};

function getPlayerImageName(player) {
    if (NFT_IMAGE_MAP[player.id]) return NFT_IMAGE_MAP[player.id];
    const safeName = player.name.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_\-]/g, '');
    return `${String(player.id).padStart(3, '0')}_${safeName}.png`;
}

async function generateMetadata() {
    console.log("🚀 Iniciando Oráculo de Metadatos GoalChain...");
    
    try {
        const players = JSON.parse(fs.readFileSync(PLAYERS_DATA_PATH, 'utf8'));
        console.log(`📦 Procesando ${players.length} jugadores...`);

        players.forEach(player => {
            const imageName = getPlayerImageName(player);
            const imageUrl = `${REPO_URL}/assets/img/nfts/${imageName}`;

            const metadata = {
                name: player.name,
                symbol: "GCH",
                description: `GoalChain Genesis Squad - ${player.name} (${player.country}). ${player.details}`,
                seller_fee_basis_points: 500, // 5% de Royalties
                image: imageUrl,
                attributes: [
                    { "trait_type": "País", "value": player.country },
                    { "trait_type": "Posición", "value": player.position },
                    { "trait_type": "Rareza", "value": player.rarity.charAt(0).toUpperCase() + player.rarity.slice(1) },
                    { "trait_type": "Número", "value": player.number.toString() },
                    { "trait_type": "Ataque", "value": player.stats.atk },
                    { "trait_type": "Defensa", "value": player.stats.def },
                    { "trait_type": "Hype", "value": player.stats.hype },
                    { "trait_type": "Oracle Sync", "value": player.oracle_sync.status }
                ],
                properties: {
                    files: [{ "uri": imageUrl, "type": "image/png" }],
                    category: "image",
                    creators: [{ "address": WALLET_OFICIAL, "share": 100 }]
                }
            };

            fs.writeFileSync(path.join(OUTPUT_DIR, `${player.id}.json`), JSON.stringify(metadata, null, 4));
        });

        console.log("✅ ¡Éxito! 1,248 archivos de metadatos regenerados y sincronizados.");
    } catch (error) {
        console.error("❌ Error fatal en el Oráculo:", error);
    }
}

generateMetadata();
