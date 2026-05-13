const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = '/Users/NicoPez/GoalChain';
const ASSETS_DIR = path.join(PROJECT_ROOT, 'mint_setup/assets');
const SOURCE_META = path.join(PROJECT_ROOT, 'docs/assets/data/metadata');
const SOURCE_IMG = path.join(PROJECT_ROOT, 'docs/assets/img/nfts');
const PLAYERS_FILE = path.join(PROJECT_ROOT, 'docs/assets/data/players.json');

if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

async function prepare() {
    console.log("🍭 Organizando activos para Sugar (Candy Machine)...");
    
    try {
        const players = JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf8'));
        const images = fs.readdirSync(SOURCE_IMG);

        players.forEach((p, index) => {
            // Renombrar a formato Sugar: 0, 1, 2...
            const targetJson = path.join(ASSETS_DIR, `${index}.json`);
            const targetImg = path.join(ASSETS_DIR, `${index}.png`);

            // 1. Procesar JSON
            const oldJsonPath = path.join(SOURCE_META, `${p.id}.json`);
            if (fs.existsSync(oldJsonPath)) {
                let meta = JSON.parse(fs.readFileSync(oldJsonPath, 'utf8'));
                meta.image = `${index}.png`;
                meta.properties.files = [{ uri: `${index}.png`, type: "image/png" }];
                fs.writeFileSync(targetJson, JSON.stringify(meta, null, 4));
            }

            // 2. Procesar Imagen
            // Buscamos la imagen que empiece por el ID (ej: "001_")
            const idPrefix = String(p.id).padStart(3, '0');
            const imageName = images.find(img => img.startsWith(idPrefix));

            if (imageName) {
                fs.copyFileSync(path.join(SOURCE_IMG, imageName), targetImg);
            } else {
                // Fallback a imagen por defecto
                const fallback = path.join(SOURCE_IMG, '001_lionel_bitcoin.png');
                if (fs.existsSync(fallback)) {
                    fs.copyFileSync(fallback, targetImg);
                }
            }
            
            if (index % 100 === 0) console.log(`📦 Procesados ${index} jugadores...`);
        });

        console.log(`\n✅ ¡Éxito! 1,248 parejas (json/png) listas en mint_setup/assets/`);
    } catch (err) {
        console.error("❌ Error preparando activos:", err);
    }
}

prepare();
