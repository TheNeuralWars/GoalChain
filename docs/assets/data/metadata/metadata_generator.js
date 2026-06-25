const fs = require('fs');
const path = require('path');

// Configuración Maestra
const REPO_URL = "https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs";
const PLAYERS_DATA_PATH = path.join(__dirname, '../players.json');
const OUTPUT_DIR = path.join(__dirname, './');

// Manual image map (traído de docs/assets/js/nft_registry.js para consistencia total)
const NFT_IMAGE_MAP = {
    1: "001_lionel_satoshi.png",
    2: "002_dibu_block.png",
    3: "020_julian_alvaswap.png",
    14: "014_mo_solana.png",
    15: "015_pedri_protocol.png",
    16: "016_fede_valweb3.png",
    17: "017_darwin_nunft.png",
    18: "018_bukayo_stock.png",
    19: "019_phil_fod_ether.png",
    20: "020_enzo_ledger.png",
    21: "021_luis_swaswap.png",
    22: "022_bernardo_solana.png",
    24: "024_rodri_protocol.png",
    26: "026_joshua_bit_mmi.png",
    27: "027_vini_burner_jr.png",
    28: "028_endrick_chain.png",
    30: "030_kai_havests.png",
    33: "033_allison_block.png",
    53: "053_kylian_m-bag-pé.png",
    79: "079_jude_whale-ingham.png",
    80: "080_harry_chain.png",
    105: "105_lamine_ya-hype.png",
    106: "106_pedri_p2p.png",
    131: "131_jamal_moon-siala.png",
    157: "157_cristiano_holdaldo.png"
};

function getPlayerImageName(player) {
    if (player.filename) return player.filename;
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
            // El indexer/explorer espera webp si es la imagen real, pero mantenemos png/webp según el mapeo
            const imageUrlName = imageName.replace(/\.png$/, '.webp');
            const imageUrl = `${REPO_URL}/assets/img/nfts/${imageUrlName}`;
            const fileType = "image/webp";

            const metadata = {
                name: `GoalChain Genesis #${String(player.id).padStart(3, '0')} — ${player.name}`,
                symbol: "GCG",
                description: player.meta && player.meta.narrative ? player.meta.narrative : `GoalChain Genesis Squad - ${player.name} (${player.country}).`,
                seller_fee_basis_points: 100, // 1% de Royalties
                image: imageUrl,
                external_url: `https://goalchain.fun/nft/${player.id}`,
                attributes: [
                    { "trait_type": "Rarity", "value": player.rarity ? player.rarity.charAt(0).toUpperCase() + player.rarity.slice(1) : "Common" },
                    { "trait_type": "Position", "value": player.position || "N/A" },
                    { "trait_type": "Country", "value": player.country || "Unknown" },
                    { "trait_type": "Real Name", "value": player.real_name || player.name },
                    { "trait_type": "ATK", "value": player.stats && player.stats.atk !== undefined ? player.stats.atk : 50 },
                    { "trait_type": "DEF", "value": player.stats && player.stats.def !== undefined ? player.stats.def : 50 },
                    { "trait_type": "HYPE", "value": player.stats && player.stats.hype !== undefined ? player.stats.hype : 50 },
                    { "trait_type": "Jersey Number", "value": player.jersey_number ? player.jersey_number.toString() : "0" }
                ],
                properties: {
                    files: [{ "uri": imageUrl, "type": fileType }],
                    category: "image",
                    creators: [
                        { "address": "Fndrxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "share": 1 },
                        { "address": "BldrFundxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "share": 10 },
                        { "address": "CmntyTreasuryxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "share": 89 }
                    ]
                }
            };

            // Agregar meta atributos si existen
            if (player.meta) {
                if (player.meta.parody_club) {
                    metadata.attributes.push({ "trait_type": "Parody Club", "value": player.meta.parody_club });
                }
                if (player.meta.visual_effect) {
                    metadata.attributes.push({ "trait_type": "Visual Effect", "value": player.meta.visual_effect });
                }
            }

            // Agregar traits si existen
            if (player.traits && Array.isArray(player.traits)) {
                player.traits.forEach(t => {
                    metadata.attributes.push({ "trait_type": "Trait", "value": t });
                });
            }

            fs.writeFileSync(path.join(OUTPUT_DIR, `${player.id}.json`), JSON.stringify(metadata, null, 4));
        });

        console.log(`✅ ¡Éxito! ${players.length} archivos de metadatos regenerados y sincronizados.`);
    } catch (error) {
        console.error("❌ Error fatal en el Oráculo:", error);
    }
}

generateMetadata();
