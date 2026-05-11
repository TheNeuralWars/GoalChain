const PROGRAM_ID = "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg";
const RPC_URL = "https://api.devnet.solana.com";

// Simplificación del IDL para lectura de Fixtures
const IDL = {
    "version": "0.1.0",
    "name": "goalchain_program",
    "instructions": [],
    "accounts": [
        {
            "name": "Fixture",
            "type": {
                "kind": "struct",
                "fields": [
                    { "name": "matchId", "type": "string" },
                    { "name": "teamA", "type": "string" },
                    { "name": "teamB", "type": "string" },
                    { "name": "poolA", "type": "u64" },
                    { "name": "poolB", "type": "u64" },
                    { "name": "poolDraw", "type": "u64" },
                    { "name": "status", "type": { "defined": "MatchStatus" } },
                    { "name": "winner", "type": { "option": { "defined": "MatchResult" } } },
                    { "name": "startTime", "type": "i64" },
                    { "name": "bump", "type": "u8" }
                ]
            }
        }
    ],
    "types": [
        { "name": "MatchStatus", "type": { "kind": "enum", "variants": [{ "name": "Upcoming" }, { "name": "Live" }, { "name": "Completed" }, { "name": "Cancelled" }] } },
        { "name": "MatchResult", "type": { "kind": "enum", "variants": [{ "name": "TeamA" }, { "name": "TeamB" }, { "name": "Draw" }] } }
    ]
};

async function fetchFixtures() {
    console.log("Cargando fixtures desde Solana...");
    const connection = new solanaWeb3.Connection(RPC_URL, "confirmed");
    const provider = new anchor.AnchorProvider(connection, window.solana, {});
    const program = new anchor.Program(IDL, PROGRAM_ID, provider);

    try {
        const fixtures = await program.account.fixture.all();
        console.log("Fixtures encontrados:", fixtures);
        
        if (fixtures.length > 0) {
            updateFixtureUI(fixtures[0].account); // Mostramos el primero por ahora
        }
    } catch (error) {
        console.error("Error al leer fixtures:", error);
    }
}

function updateFixtureUI(match) {
    const fixtureSection = document.querySelector('#gameplay .glass-card');
    if (!fixtureSection) return;

    // Convertir lamports a SOL (asumiendo que los pools están en SOL o GCH)
    const totalA = (match.poolA / 10**9).toFixed(2);
    const totalB = (match.poolB / 10**9).toFixed(2);
    const totalDraw = (match.poolDraw / 10**9).toFixed(2);
    const totalPool = (parseFloat(totalA) + parseFloat(totalB) + parseFloat(totalDraw)).toFixed(2);

    fixtureSection.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background: var(--secondary); padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; width: fit-content; margin: 0 auto;">EN VIVO DESDE SOLANA</div>
            <div style="display: flex; justify-content: space-between; padding: 1rem; border-bottom: 1px solid var(--border); font-weight: bold; font-size: 1.2rem;">
                <span>${match.teamA}</span>
                <span style="color: var(--primary);">VS</span>
                <span>${match.teamB}</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 1rem;">
                <div style="text-align: center; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px;">
                    <div style="font-size: 0.7rem; color: var(--text-dim);">GANA A</div>
                    <div style="color: var(--primary); font-weight: bold;">${totalA}</div>
                </div>
                <div style="text-align: center; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px;">
                    <div style="font-size: 0.7rem; color: var(--text-dim);">EMPATE</div>
                    <div style="color: var(--primary); font-weight: bold;">${totalDraw}</div>
                </div>
                <div style="text-align: center; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px;">
                    <div style="font-size: 0.7rem; color: var(--text-dim);">GANA B</div>
                    <div style="color: var(--primary); font-weight: bold;">${totalB}</div>
                </div>
            </div>
            <div style="margin-top: 1rem; text-align: center;">
                <span style="font-size: 0.8rem; color: var(--text-dim);">POZO TOTAL: </span>
                <span style="font-size: 1rem; color: var(--primary); font-weight: bold;">${totalPool} SOL</span>
            </div>
        </div>
    `;
}

// Intentar cargar datos cuando la página cargue
window.addEventListener('load', fetchFixtures);
