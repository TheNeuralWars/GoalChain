const fs = require('fs');
const path = require('path');

const PLAYERS_PATH = path.join(__dirname, '../docs/assets/data/players.json');
const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf8'));

const TEAM_MAP = {
    18: { country: "Nigeria", base_names: ["Victor O-Swap-hen", "Alex I-Token", "Samuel Chuku-Node", "Wilfred Ndidi-Chain", "Kelechi Ihean-Cash"] },
    19: { country: "Ghana", base_names: ["Mohammed Ku-Node", "Inaki Will-Chain", "Thomas Par-Token", "Jordan Ayew-Swap", "Mohammed Sal-Block"] },
    20: { country: "Australia", base_names: ["Harry Sou-Token", "Mat Ryan-Wallet", "Aaron Mooy-Chain", "Garang Ku-Node", "Craig Good-Swap"] },
    21: { country: "Ecuador", base_names: ["Enner Valen-Chain", "Moises Cai-Swap", "Pervis Estupi-Node", "Piero Hincap-Block", "Gonzalo Pla-Token"] },
    22: { country: "Serbia", base_names: ["Dusan Vla-Chain", "Aleksandar Mitro-Node", "Dusan Ta-Swap", "Sergej Milin-Token", "Filip Kos-Block"] },
    23: { country: "Camerún", base_names: ["Andre Ona-Wallet", "Vincent Abou-Chain", "Zambo Angui-Node", "Bryan Mbeu-Swap", "Karl Toko-Block"] },
    24: { country: "Canadá", base_names: ["Alphonso Da-Chain", "Jonathan Da-Swap", "Cyle Lar-Node", "Tajon Buch-Token", "Stephen Esta-Block"] },
    25: { country: "Chile", base_names: ["Alexis San-Chain", "Arturo Vi-Node", "Ben Brere-Swap", "Gary Me-Block", "Claudio Bra-Wallet"] },
    26: { country: "Perú", base_names: ["Gianluca Lap-Chain", "Paolo Guer-Node", "Christian Cue-Swap", "Luis Advin-Block", "Pedro Galle-Wallet"] },
    27: { country: "Ucrania", base_names: ["Mykhailo Mu-Chain", "Oleksandr Zinchen-Node", "Artem Dov-Swap", "Viktor Tsyg-Block", "Andriy Lunin-Wallet"] },
    28: { country: "Suecia", base_names: ["Alexander Is-Chain", "Dejan Kulu-Node", "Viktor Gyo-Swap", "Emil Fors-Block", "Victor Lind-Wallet"] },
    29: { country: "Noruega", base_names: ["Erling Borth-Chain", "Martin Ode-Node", "Alexander Sor-Swap", "Oscar Bobb-Block", "Julian Ryer-Token"] },
    30: { country: "Turquía", base_names: ["Arda Gu-Chain", "Hakan Calha-Node", "Kenan Yil-Swap", "Baris Al-Block", "Ferdi Kad-Wallet"] },
    31: { country: "Argelia", base_names: ["Riyad Mah-Chain", "Ismael Ben-Node", "Said Benrah-Swap", "Amine Gou-Block", "Ramy Bense-Token"] },
    32: { country: "Marruecos", base_names: ["Hakim Zi-Chain", "Youssef En-Node", "Sofyan Amra-Swap", "Nayef Ag-Block", "Achraf Ha-Wallet"] },
    33: { country: "Suiza", base_names: ["Granit Xha-Chain", "Xherdan Sha-Node", "Manuel Akan-Swap", "Yann Som-Block", "Gregor Ko-Wallet"] },
    34: { country: "Gales", base_names: ["Brennan John-Chain", "Harry Wil-Node", "Daniel Ja-Swap", "Aaron Ram-Block", "Ben Da-Wallet"] },
    35: { country: "Irán", base_names: ["Mehdi Tare-Chain", "Sardar Az-Node", "Alireza Ja-Swap", "Saman Ghod-Block", "Sardar Token"] },
    36: { country: "Costa Rica", base_names: ["Keylor Na-Wallet", "Joel Camp-Chain", "Brandon Agui-Node", "Manfred Ug-Swap", "Francisco Cal-Block"] },
    37: { country: "Arabia Saudí", base_names: ["Salem Al-Chain", "Firas Al-Node", "Saleh Al-Swap", "Abdulelah Al-Block", "Mohammed Al-Wallet"] },
    38: { country: "Egipto", base_names: ["Mo Sa-Chain", "Mostafa Mo-Node", "Omar Mar-Swap", "Trezeguet-Block", "Mohamed El-Wallet"] },
    39: { country: "Corea del Sur", base_names: ["Son Heung-Chain", "Hwang Hee-Node", "Lee Kang-Swap", "Kim Min-Block", "Cho Gue-Wallet"] },
    40: { country: "Japón", base_names: ["Kaoru Mi-Chain", "Take Ku-Node", "Wataru En-Swap", "Daichi Ka-Block", "Junyo I-Wallet"] },
    41: { country: "Australia", base_names: ["Harry Sou-Chain", "Garang Ku-Node", "Mat Ry-Swap", "Craig Good-Block", "Jackson Ir-Wallet"] },
    42: { country: "Costa de Marfil", base_names: ["Sebastien Hal-Chain", "Franck Kes-Node", "Ousmane Di-Swap", "Simon Adin-Block", "Nicolas Pe-Wallet"] },
    43: { country: "Austria", base_names: ["David Ala-Chain", "Marcel Sabi-Node", "Christoph Baum-Swap", "Konrad Lai-Block", "Marko Arnau-Wallet"] },
    44: { country: "Grecia", base_names: ["Vangelis Pav-Chain", "Kostas Tsi-Node", "Tasos Bake-Swap", "Konstan Ma-Block", "Odisseas Vla-Wallet"] },
    45: { country: "Escocia", base_names: ["Scott McTo-Chain", "Andrew Robert-Node", "John McGi-Swap", "Billy Gil-Block", "Che Ad-Wallet"] },
    46: { country: "Hungría", base_names: ["Dominik Szobo-Chain", "Barnabas Var-Node", "Roland Sal-Swap", "Willi Or-Block", "Peter Gula-Wallet"] },
    47: { country: "Paraguay", base_names: ["Miguel Almi-Chain", "Julio Enc-Node", "Antonio San-Swap", "Gustavo Go-Block", "Matías Ro-Wallet"] },
    48: { country: "Venezuela", base_names: ["Salomón Ron-Chain", "Yangel Her-Node", "Yeferson Sotel-Swap", "Darwin Mach-Block", "Nahuel Fer-Wallet"] },
};

console.log("🌍 Iniciando Expansión Global de Parodias (TEAM_18 al TEAM_48)...");

players.forEach(p => {
    const teamIdMatch = p.country.match(/TEAM_(\d+)/);
    if (teamIdMatch) {
        const teamId = parseInt(teamIdMatch[1]);
        if (TEAM_MAP[teamId]) {
            p.country = TEAM_MAP[teamId].country;
            if (p.name.includes("Player")) {
                const playerNum = parseInt(p.name.match(/Player (\d+)/)[1]);
                const baseNames = TEAM_MAP[teamId].base_names;
                if (playerNum <= baseNames.length) {
                    p.name = baseNames[playerNum - 1];
                } else {
                    const suffix = ["Block", "Swap", "Chain", "Node", "Coin", "Wallet", "Token", "Mint", "Gas", "Ledger"][playerNum % 10];
                    // Generar un nombre que suene al país
                    p.name = `${p.country} Pro ${playerNum} ${suffix}`;
                }
            }
        }
    }
});

fs.writeFileSync(PLAYERS_PATH, JSON.stringify(players, null, 4));
console.log("✅ ¡Misión Cumplida! Las 48 naciones tienen nombres parodiados.");
