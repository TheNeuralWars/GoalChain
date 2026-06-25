const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
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

        // 0. Limpieza previa de archivos antiguos de Sugar mayores o iguales al total de jugadores
        console.log(`🧹 Limpiando archivos obsoletos en ${ASSETS_DIR}...`);
        const existingFiles = fs.readdirSync(ASSETS_DIR);
        let deletedCount = 0;
        existingFiles.forEach(file => {
            const ext = path.extname(file);
            if (ext === '.json' || ext === '.png') {
                const name = path.basename(file, ext);
                const num = parseInt(name, 10);
                if (!isNaN(num) && num >= players.length) {
                    fs.unlinkSync(path.join(ASSETS_DIR, file));
                    deletedCount++;
                }
            }
        });
        if (deletedCount > 0) {
            console.log(`🗑️ Se eliminaron ${deletedCount} archivos obsoletos.`);
        }

        // 1. Copiar y procesar parejas de activos
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
            } else {
                console.warn(`⚠️ No se encontró metadato origen para jugador ID ${p.id} en ${oldJsonPath}`);
            }

            // 2. Procesar Imagen
            // Buscamos la imagen que empiece por el ID (ej: "001_")
            const idPrefix = String(p.id).padStart(3, '0');
            const imageName = images.find(img => img.startsWith(idPrefix) && (img.endsWith('.png') || img.endsWith('.webp')));

            if (imageName) {
                fs.copyFileSync(path.join(SOURCE_IMG, imageName), targetImg);
            } else {
                // Fallback a imagen por defecto (placeholder premium de Coming Soon)
                const fallback = path.join(SOURCE_IMG, 'card_placeholder_soon.png');
                if (fs.existsSync(fallback)) {
                    fs.copyFileSync(fallback, targetImg);
                } else {
                    console.error(`❌ No se encontró la imagen placeholder en ${fallback}`);
                }
            }
            
            if (index % 100 === 0) console.log(`📦 Procesados ${index} jugadores...`);
        });

        console.log(`\n✅ ¡Éxito! ${players.length} parejas (json/png) listas en mint_setup/assets/`);
    } catch (err) {
        console.error("❌ Error preparando activos:", err);
    }
}

prepare();
