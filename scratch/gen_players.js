const fs = require('fs');

const rarities = ["mythic", "legendary", "epic", "rare", "common"];
const positions = ["GK", "DEF", "MID", "FWD"];

const countries = {
    "ARG": "Argentina", "BRA": "Brasil", "FRA": "Francia", "ENG": "Inglaterra", 
    "ESP": "España", "GER": "Alemania", "POR": "Portugal", "ITA": "Italia", 
    "URU": "Uruguay", "MEX": "México", "USA": "USA", "BEL": "Bélgica", "NED": "Países Bajos"
};

const playersBase = [
    { country: "ARG", real: "Lionel Messi", parody: "Lionel Bitcoin", nickname: "La Pulga Crypto", pos: "FWD", num: 10, rarity: "mythic", h: "1.70m", w: "72kg" },
    { country: "POR", real: "Cristiano Ronaldo", parody: "Cristiano Holdaldo", nickname: "CR7 HODL", pos: "FWD", num: 7, rarity: "legendary", h: "1.87m", w: "83kg" },
    { country: "FRA", real: "Kylian Mbappé", parody: "Kylian M-Bag-pé", nickname: "The Bag Man", pos: "FWD", num: 10, rarity: "epic", h: "1.78m", w: "75kg" },
    { country: "NOR", real: "Erling Haaland", parody: "Erling Hash-land", nickname: "The Terminator", pos: "FWD", num: 9, rarity: "epic", h: "1.94m", w: "88kg" },
    { country: "ENG", real: "Jude Bellingham", parody: "Jude Whale-ingham", nickname: "The Golden Whale", pos: "MID", num: 5, rarity: "legendary", h: "1.86m", w: "75kg" },
    { country: "BRA", real: "Vinícius Jr", parody: "Vini Burner Jr", nickname: "Burner King", pos: "FWD", num: 7, rarity: "epic", h: "1.76m", w: "73kg" },
    { country: "ESP", real: "Lamine Yamal", parody: "Lamine Ya-Hype", nickname: "Baby Hype", pos: "FWD", num: 19, rarity: "legendary", h: "1.78m", w: "70kg" },
    { country: "BEL", real: "Kevin De Bruyne", parody: "Kevin De Byte", nickname: "The Architect", pos: "MID", num: 17, rarity: "epic", h: "1.81m", w: "70kg" },
    { country: "EGY", real: "Mohamed Salah", parody: "Mo Swap-lah", nickname: "The Egyptian DEX", pos: "FWD", num: 11, rarity: "epic", h: "1.75m", w: "71kg" },
    { country: "KOR", real: "Son Heung-min", parody: "Son HODL-min", nickname: "Sunny Bull", pos: "FWD", num: 7, rarity: "epic", h: "1.83m", w: "77kg" },
    { country: "GER", real: "Jamal Musiala", parody: "Jamal Moon-siala", nickname: "Moon Boy", pos: "MID", num: 10, rarity: "legendary", h: "1.84m", w: "72kg" },
    { country: "GER", real: "Florian Wirtz", parody: "Florian Web3-irtz", nickname: "Magic Node", pos: "MID", num: 10, rarity: "epic", h: "1.76m", w: "70kg" },
    { country: "ARG", real: "Julian Alvarez", parody: "Julian Alva-Swap", nickname: "La Araña DEX", pos: "FWD", num: 9, rarity: "epic", h: "1.70m", w: "71kg" },
    { country: "ARG", real: "Emiliano Martinez", parody: "Dibu Block", nickname: "The Shield", pos: "GK", num: 23, rarity: "legendary", h: "1.95m", w: "88kg" },
    { country: "BRA", real: "Endrick", parody: "Endrick Chain", nickname: "New Genesis", pos: "FWD", num: 16, rarity: "legendary", h: "1.73m", w: "75kg" },
    { country: "ENG", real: "Phil Foden", parody: "Phil Flip-den", nickname: "Master Flipper", pos: "FWD", num: 47, rarity: "epic", h: "1.71m", w: "70kg" },
    { country: "ESP", real: "Pedri", parody: "Pedri P2P", nickname: "Peer 2 Peer", pos: "MID", num: 8, rarity: "epic", h: "1.74m", w: "60kg" },
    { country: "FRA", real: "Antoine Griezmann", parody: "Antoine G-Staking", nickname: "Staking King", pos: "FWD", num: 7, rarity: "epic", h: "1.76m", w: "73kg" },
    { country: "URU", real: "Darwin Nuñez", parody: "Darwin Bull-ñez", nickname: "The Bull", pos: "FWD", num: 9, rarity: "rare", h: "1.87m", w: "81kg" },
    { country: "COL", real: "Luis Díaz", parody: "Luis Gas-Díaz", nickname: "Fast Gas", pos: "FWD", num: 7, rarity: "rare", h: "1.80m", w: "73kg" },
    { country: "USA", real: "Christian Pulisic", parody: "Christian Pump-lisic", nickname: "Captain FOMO", pos: "FWD", num: 10, rarity: "rare", h: "1.78m", w: "73kg" },
    { country: "MEX", real: "Santiago Gimenez", parody: "Santi Gainz", nickname: "The Profit", pos: "FWD", num: 9, rarity: "legendary", h: "1.82m", w: "79kg" },
    { country: "ENG", real: "Harry Kane", parody: "Harry Chain", nickname: "Goal Miner", pos: "FWD", num: 9, rarity: "rare", h: "1.88m", w: "86kg" },
    { country: "ITA", real: "Nicolo Barella", parody: "Nicolo Block-ella", nickname: "The Engine", pos: "MID", num: 23, rarity: "epic", h: "1.75m", w: "68kg" },
    { country: "NED", real: "Virgil van Dijk", parody: "Virgil van Vault", nickname: "The Vault", pos: "DEF", num: 4, rarity: "legendary", h: "1.93m", w: "92kg" },
    // Generar el resto hasta 100 con variaciones
];

// Fill with more players to reach 100
for (let i = 26; i <= 100; i++) {
    const cCodes = Object.keys(countries);
    const country = cCodes[i % cCodes.length];
    playersBase.push({
        country,
        real: `Player ${i}`,
        parody: `Crypto Hero ${i}`,
        nickname: `Nick ${i}`,
        pos: positions[i % positions.length],
        num: (i % 99) + 1,
        rarity: i > 80 ? "mythic" : (i > 60 ? "legendary" : (i > 30 ? "epic" : "common")),
        h: `${(1.70 + Math.random() * 0.25).toFixed(2)}m`,
        w: `${(65 + Math.random() * 25).toFixed(0)}kg`
    });
}

const fullPlayers = playersBase.map(p => {
    let atk, def, hype;
    if (p.pos === "FWD") { atk = 85 + Math.random() * 14; def = 30 + Math.random() * 30; }
    else if (p.pos === "MID") { atk = 75 + Math.random() * 15; def = 60 + Math.random() * 20; }
    else if (p.pos === "DEF") { atk = 40 + Math.random() * 20; def = 85 + Math.random() * 14; }
    else { atk = 10 + Math.random() * 20; def = 90 + Math.random() * 9; }
    
    hype = 70 + Math.random() * 29;
    if (p.rarity === "mythic") { atk = 99; hype = 98; }

    return {
        id: p.num + (Math.floor(Math.random() * 1000)),
        name: p.parody,
        realName: p.real,
        nickname: p.nickname,
        height: p.h,
        weight: p.w,
        position: p.pos,
        number: p.num,
        country: countries[p.country] || p.country,
        rarity: p.rarity,
        stats: {
            atk: Math.floor(atk),
            def: Math.floor(def),
            hype: Math.floor(hype)
        },
        details: `Cromo especial para el Mundial 2026. Edición ${p.rarity.toUpperCase()}.`
    };
});

fs.writeFileSync('/Users/NicoPez/GoalChain/goalchain_web/assets/data/players.json', JSON.stringify(fullPlayers, null, 4));
console.log("Generados 100 jugadores en players.json");
