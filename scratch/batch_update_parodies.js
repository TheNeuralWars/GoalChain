const fs = require('fs');
const path = require('path');

const PLAYERS_PATH = path.join(__dirname, '../docs/assets/data/players.json');
const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf8'));

const TEAM_MAP = {
    8: { country: "México", base_names: ["Chicharito Coin", "Memo Block", "Hirving Gas", "Raul Node", "Edson Mint", "Santi Swap"] },
    9: { country: "EEUU", base_names: ["Christian Pull-isic", "Gio Rey-Node", "Weston Mac-Chainie", "Sergiño Decentralized", "Tyler Ro-Block"] },
    10: { country: "Países Bajos", base_names: ["Virgil van Block", "Frenkie de Swap", "Memphis Moon-phis", "Cody Gak-P2P", "Xavi Sim-Nodes"] },
    11: { country: "Italia", base_names: ["Nicolo Bar-Ether", "Federico Chain-sa", "Gianluigi Ledger-umma", "Marco Ver-Swap-ti", "Ciro Im-Block-ile"] },
    12: { country: "Bélgica", base_names: ["Kevin De Bruyne-Chain", "Romelu Lu-Cash", "Thibaut Court-Wallet", "Jeremy Do-Node", "Youri Tie-Token"] },
    13: { country: "Marruecos", base_names: ["Achraf Ha-Key-mi", "Hakim Zi-Yield", "Yassine Bo-Node", "Sofyan Amra-Block", "Azzedine Una-Swap"] },
    14: { country: "Japón", base_names: ["Kaoru Mi-Token", "Take Kubo-Coin", "Wataru En-Node", "Daichi Kama-Swap", "Ritsu Do-Block"] },
    15: { country: "Senegal", base_names: ["Sadio Ma-Node", "Kalidou Kouli-Block", "Edouard Men-Wallet", "Nicolas Jack-Swap", "Pape Ma-Token"] },
    16: { country: "Colombia", base_names: ["Luis Di-Assets", "James Ro-Mining", "Luis Mu-Yield", "Juan Cuadrado-Block", "Jefferson Ler-Meta"] },
    17: { country: "Suiza", base_names: ["Granit Sha-Key-ra", "Yann Som-Block", "Manuel Akan-Chain", "Breel Em-Swap-lo", "Xherdan Sha-Coin"] },
    // Seguiremos con más en ejecuciones posteriores si es necesario
};

console.log("🛠️ Iniciando actualización de nombres parodiados...");

players.forEach(p => {
    const teamIdMatch = p.country.match(/TEAM_(\d+)/);
    if (teamIdMatch) {
        const teamId = parseInt(teamIdMatch[1]);
        if (TEAM_MAP[teamId]) {
            p.country = TEAM_MAP[teamId].country;
            // Generar nombre parodiado si es genérico
            if (p.name.includes("Player")) {
                const playerNum = parseInt(p.name.match(/Player (\d+)/)[1]);
                const baseNames = TEAM_MAP[teamId].base_names;
                if (playerNum <= baseNames.length) {
                    p.name = baseNames[playerNum - 1];
                } else {
                    // Generador genérico de parodias por posición
                    const suffix = ["Block", "Swap", "Chain", "Node", "Coin", "Wallet", "Token", "Mint", "Gas", "Ledger"][playerNum % 10];
                    p.name = `${p.country} Star ${playerNum} ${suffix}`;
                }
            }
        }
    }
});

fs.writeFileSync(PLAYERS_PATH, JSON.stringify(players, null, 4));
console.log("✅ Bloque 1 de naciones actualizado con éxito.");
