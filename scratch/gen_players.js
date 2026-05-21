const fs = require('fs');

const rarities = ["mythic", "legendary", "epic", "rare", "common"];
const positions = ["GK", "DEF", "MID", "FWD"];

const worldNations = [
    { id: "ARG", name: "Argentina", stars: ["Lionel Bitcoin", "Dibu Block", "Julian Alva-Swap"] },
    { id: "BRA", name: "Brasil", stars: ["Vini Burner Jr", "Endrick Chain", "Neymar HODL"] },
    { id: "FRA", name: "Francia", stars: ["Kylian M-Bag-pé", "Antoine G-Staking"] },
    { id: "ENG", name: "Inglaterra", stars: ["Jude Whale-ingham", "Harry Chain"] },
    { id: "ESP", name: "España", stars: ["Lamine Ya-Hype", "Pedri P2P"] },
    { id: "GER", name: "Alemania", stars: ["Jamal Moon-siala", "Florian Web3-irtz"] },
    { id: "POR", name: "Portugal", stars: ["Cristiano Holdaldo", "Bernardo Byte"] }
];

const totalTeams = 48;
const playersPerTeam = 26;
const allPlayers = [];
let idCounter = 1;

const nationsPool = [...worldNations];
while (nationsPool.length < totalTeams) {
    const id = `TEAM_${nationsPool.length + 1}`;
    nationsPool.push({ id, name: `Nación ${id}`, stars: [`Capitán ${id}`] });
}

nationsPool.forEach(nation => {
    for (let i = 0; i < playersPerTeam; i++) {
        const isStar = nation.stars && i < nation.stars.length;
        const parodyName = isStar ? nation.stars[i] : `${nation.name} Player ${i + 1}`;
        
        let rarity = "common";
        let rwSalary = "€850K";
        let matchSalary = 50;

        if (isStar) {
            if ((nation.id === "ARG" || nation.id === "POR") && i === 0) {
                rarity = "mythic";
                rwSalary = "€130M+";
                matchSalary = 5000;
            } else if (i === 0) {
                rarity = "legendary";
                rwSalary = "€40M";
                matchSalary = 1000;
            } else {
                rarity = "epic";
                rwSalary = "€15M";
                matchSalary = 250;
            }
        } else {
            const rand = Math.random();
            if (rand > 0.95) { rarity = "epic"; rwSalary = "€10M"; matchSalary = 250; }
            else if (rand > 0.7) { rarity = "rare"; rwSalary = "€3M"; matchSalary = 100; }
        }

        allPlayers.push({
            id: idCounter++,
            name: parodyName,
            country: nation.name,
            rarity: rarity,
            position: positions[Math.floor(Math.random() * 4)],
            number: i + 1,
            height: `${(1.65 + Math.random() * 0.35).toFixed(2)}m`,
            weight: `${(60 + Math.random() * 35).toFixed(0)}kg`,
            stats: {
                atk: Math.floor(40 + Math.random() * 59),
                def: Math.floor(40 + Math.random() * 59),
                hype: Math.floor(30 + Math.random() * 69)
            },
            contract: {
                realSalary: rwSalary,
                matchSalary: matchSalary,
                clauses: [
                    "Bono Titularidad (+25%)",
                    "Bono Valla Invicta (GK/DEF)",
                    "Bono Goles No-Penalti"
                ]
            },
            details: `Contrato profesional activo para el Mundial 2026.`
        });
    }
});

fs.writeFileSync('/Users/NicoPez/GoalChain/goalchain_web/assets/data/players.json', JSON.stringify(allPlayers, null, 4));
console.log(`¡Lista actualizada con sueldos reales y GoalChain!`);
