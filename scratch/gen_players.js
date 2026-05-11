const fs = require('fs');

const rarities = ["mythic", "legendary", "epic", "rare", "common"];
const positions = ["GK", "DEF", "MID", "FWD"];

const nations = [
    { id: "ARG", name: "Argentina", stars: ["Lionel Bitcoin", "Dibu Block", "Julian Alva-Swap", "Lautaro Bull-tinez", "Enzo Chain"] },
    { id: "BRA", name: "Brasil", stars: ["Vini Burner Jr", "Endrick Chain", "Rodrygo Node", "Neymar HODL", "Casemiro Vault"] },
    { id: "FRA", name: "Francia", stars: ["Kylian M-Bag-pé", "Antoine G-Staking", "Camavinga Gas", "Saliba Vault", "Tchouameni Node"] },
    { id: "ENG", name: "Inglaterra", stars: ["Jude Whale-ingham", "Harry Chain", "Phil Flip-den", "Bukayo Stake-a", "Declan Rice-Chain"] },
    { id: "ESP", name: "España", stars: ["Lamine Ya-Hype", "Pedri P2P", "Rodri Node", "Gavi Gas-Fee", "Nico Pump-Williams"] },
    { id: "GER", name: "Alemania", stars: ["Jamal Moon-siala", "Florian Web3-irtz", "Kimmich Vault", "Havertz HODL", "Ter-Staking"] },
    { id: "POR", name: "Portugal", stars: ["Cristiano Holdaldo", "Bernardo Byte", "Bruno Burner", "Leao Lightning", "Ruben Node"] },
    { id: "ITA", name: "Italia", stars: ["Barella Block", "Chiesa Chain", "Donnarumma Wall", "Bastoni Vault", "Scalvini Sky"] },
    { id: "MEX", name: "México", stars: ["Santi Gainz", "Chucky Flip", "Edson Vault", "Memo Wall", "Ochoa Legend"] },
    { id: "USA", name: "USA", stars: ["Pulisic Pump", "Reyna Rare", "Balogun Bull", "Weah Web3", "McKennie MID"] },
    { id: "URU", name: "Uruguay", stars: ["Valverde Vault", "Darwin Bull-ñez", "Araujo Armor", "Pellistri Pump", "Ugarte Node"] },
    { id: "MAR", name: "Marruecos", stars: ["Hakimi Hype", "Ziyech Zig-Zag", "Bono Block", "Amrabat Armor", "En-Nesyri Node"] },
    { id: "JPN", name: "Japón", stars: ["Mitoma Moon", "Kubo Krypto", "Endo Engine", "Ito Impulse", "Tomiyasu Tech"] },
];

const allPlayers = [];
let idCounter = 1;

nations.forEach(nation => {
    // Generar 10-12 jugadores por estas naciones principales
    const count = 10 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
        const isStar = i < nation.stars.length;
        const parodyName = isStar ? nation.stars[i] : `${nation.name} Pro ${i}`;
        const rarity = isStar ? (i === 0 ? "mythic" : (i < 3 ? "legendary" : "epic")) : (Math.random() > 0.5 ? "rare" : "common");
        const pos = positions[Math.floor(Math.random() * 4)];
        
        allPlayers.push({
            id: idCounter++,
            name: parodyName,
            country: nation.name,
            rarity: rarity,
            position: pos,
            number: (i % 23) + 1,
            height: `${(1.70 + Math.random() * 0.25).toFixed(2)}m`,
            weight: `${(65 + Math.random() * 25).toFixed(0)}kg`,
            stats: {
                atk: Math.floor(60 + Math.random() * 39),
                def: Math.floor(60 + Math.random() * 39),
                hype: Math.floor(50 + Math.random() * 49)
            },
            details: `Jugador oficial de ${nation.name} para GoalChain 2026.`
        });
    }
});

// Rellenar hasta 500 con jugadores de "Resto del Mundo"
while (allPlayers.length < 500) {
    const rarity = Math.random() > 0.9 ? "epic" : (Math.random() > 0.7 ? "rare" : "common");
    allPlayers.push({
        id: idCounter++,
        name: `World Star ${allPlayers.length}`,
        country: "Global Stars",
        rarity: rarity,
        position: positions[Math.floor(Math.random() * 4)],
        number: (allPlayers.length % 99) + 1,
        height: `${(1.70 + Math.random() * 0.25).toFixed(2)}m`,
        weight: `${(65 + Math.random() * 25).toFixed(0)}kg`,
        stats: {
            atk: Math.floor(50 + Math.random() * 40),
            def: Math.floor(50 + Math.random() * 40),
            hype: Math.floor(40 + Math.random() * 50)
        },
        details: `Promesa internacional para el Mundial 2026.`
    });
}

fs.writeFileSync('/Users/NicoPez/GoalChain/goalchain_web/assets/data/players.json', JSON.stringify(allPlayers, null, 4));
console.log(`¡Éxito! Se han catalogado ${allPlayers.length} jugadores en players.json`);
