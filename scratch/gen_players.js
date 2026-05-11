const fs = require('fs');

const rarities = ["mythic", "legendary", "epic", "rare", "common"];
const positions = ["GK", "DEF", "MID", "FWD"];

const worldNations = [
    // CONMEBOL
    { id: "ARG", name: "Argentina", stars: ["Lionel Bitcoin", "Dibu Block", "Julian Alva-Swap", "Lautaro Bull-tinez", "Enzo Chain"] },
    { id: "BRA", name: "Brasil", stars: ["Vini Burner Jr", "Endrick Chain", "Rodrygo Node", "Neymar HODL", "Casemiro Vault"] },
    { id: "URU", name: "Uruguay", stars: ["Valverde Vault", "Darwin Bull-ñez", "Araujo Armor"] },
    { id: "COL", name: "Colombia", stars: ["Luis Gas-Díaz", "James Jpeg", "Lucho Ledger"] },
    { id: "ECU", name: "Ecuador", stars: ["Caicedo Coin", "Estupiñán Ether"] },
    { id: "PAR", name: "Paraguay", stars: ["Almirón Armor"] },
    { id: "CHI", name: "Chile", stars: ["Alexis Alpha"] },
    // UEFA
    { id: "FRA", name: "Francia", stars: ["Kylian M-Bag-pé", "Antoine G-Staking", "Camavinga Gas", "Saliba Vault"] },
    { id: "ENG", name: "Inglaterra", stars: ["Jude Whale-ingham", "Harry Chain", "Phil Flip-den", "Bukayo Stake-a"] },
    { id: "ESP", name: "España", stars: ["Lamine Ya-Hype", "Pedri P2P", "Rodri Node", "Gavi Gas-Fee"] },
    { id: "GER", name: "Alemania", stars: ["Jamal Moon-siala", "Florian Web3-irtz", "Kimmich Vault"] },
    { id: "POR", name: "Portugal", stars: ["Cristiano Holdaldo", "Bernardo Byte", "Bruno Burner"] },
    { id: "ITA", name: "Italia", stars: ["Barella Block", "Chiesa Chain", "Donnarumma Wall"] },
    { id: "NED", name: "Países Bajos", stars: ["Virgil van Vault", "Simons Swap", "Gakpo Gas"] },
    { id: "BEL", name: "Bélgica", stars: ["Kevin De Byte", "Doku Dash"] },
    { id: "CRO", name: "Croacia", stars: ["Modric Mint", "Gvardiol Guard"] },
    // CAF
    { id: "MAR", name: "Marruecos", stars: ["Hakimi Hype", "Bono Block", "Amrabat Armor"] },
    { id: "SEN", name: "Senegal", stars: ["Mané Mint", "Jackson Jpeg"] },
    { id: "NGA", name: "Nigeria", stars: ["Osimhen On-Chain", "Lookman Ledger"] },
    { id: "EGY", name: "Egipto", stars: ["Mo Swap-lah"] },
    // AFC
    { id: "JPN", name: "Japón", stars: ["Mitoma Moon", "Kubo Krypto", "Endo Engine"] },
    { id: "KOR", name: "Corea del Sur", stars: ["Son HODL-min", "Kim Min-Node"] },
    { id: "KSA", name: "Arabia Saudí", stars: ["Salem Swap"] },
    // CONCACAF
    { id: "MEX", name: "México", stars: ["Santi Gainz", "Edson Vault", "Chucky Flip"] },
    { id: "USA", name: "USA", stars: ["Pulisic Pump", "Reyna Rare", "Balogun Bull"] },
    { id: "CAN", name: "Canadá", stars: ["Davies Dash", "David DEX"] }
];

const totalTeams = 48;
const playersPerTeam = 26;
const allPlayers = [];
let idCounter = 1;

// Mapear naciones existentes y rellenar hasta 48
const nationsPool = [...worldNations];
while (nationsPool.length < totalTeams) {
    const id = `TEAM_${nationsPool.length + 1}`;
    nationsPool.push({ id, name: `Nación ${id}`, stars: [`Capitán ${id}`] });
}

nationsPool.forEach(nation => {
    for (let i = 0; i < playersPerTeam; i++) {
        const isStar = nation.stars && i < nation.stars.length;
        const parodyName = isStar ? nation.stars[i] : `${nation.name} Player ${i + 1}`;
        
        // Rarity Logic
        let rarity = "common";
        if (isStar) {
            if (nation.id === "ARG" && i === 0) rarity = "mythic"; // Messi
            else if (i === 0) rarity = "legendary"; // Capitanes
            else rarity = "epic";
        } else {
            const rand = Math.random();
            if (rand > 0.95) rarity = "epic";
            else if (rand > 0.7) rarity = "rare";
        }

        const pos = positions[Math.floor(Math.random() * 4)];
        
        allPlayers.push({
            id: idCounter++,
            name: parodyName,
            country: nation.name,
            rarity: rarity,
            position: pos,
            number: i + 1,
            height: `${(1.65 + Math.random() * 0.35).toFixed(2)}m`,
            weight: `${(60 + Math.random() * 35).toFixed(0)}kg`,
            stats: {
                atk: Math.floor(40 + Math.random() * 59),
                def: Math.floor(40 + Math.random() * 59),
                hype: Math.floor(30 + Math.random() * 69)
            },
            details: `Ficha técnica oficial - Mundial 2026.`
        });
    }
});

fs.writeFileSync('/Users/NicoPez/GoalChain/goalchain_web/assets/data/players.json', JSON.stringify(allPlayers, null, 4));
console.log(`¡COMPLETO! Se han catalogado ${allPlayers.length} jugadores en players.json (48 selecciones).`);
