const PROGRAM_ID = "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg";
const RPC_URL = "https://api.devnet.solana.com";

// IDL for reading Fixtures from Solana
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

// Derive fixture and live PDAs on Devnet
function derivePDAs(matchId) {
    try {
        const programId = new solanaWeb3.PublicKey(PROGRAM_ID);
        const encoder = new TextEncoder();
        const [fixturePda] = solanaWeb3.PublicKey.findProgramAddressSync(
            [encoder.encode("fixture"), encoder.encode(matchId)],
            programId
        );
        const [livePda] = solanaWeb3.PublicKey.findProgramAddressSync(
            [encoder.encode("live_state"), fixturePda.toBuffer()],
            programId
        );
        return { fixturePda: fixturePda.toString(), livePda: livePda.toString() };
    } catch (e) {
        console.error("Error deriving PDAs:", e);
        return { fixturePda: "Error", livePda: "Error" };
    }
}

// Select a match in the brackets and update the debugger
window.selectBracketMatch = function(matchId) {
    const debugMatchId = document.getElementById('debugMatchId');
    const debugFixturePda = document.getElementById('debugFixturePda');
    const debugLivePda = document.getElementById('debugLivePda');
    const debugMatchState = document.getElementById('debugMatchState');
    
    if (!debugMatchId) return;

    debugMatchId.innerText = matchId;
    
    // Highlight selected match UI
    document.querySelectorAll('.bracket-match').forEach(el => {
        el.style.borderColor = el.classList.contains('live') ? 'var(--primary)' : 'rgba(255,255,255,0.05)';
    });
    const selectedEl = document.getElementById(`match-${matchId}`);
    if (selectedEl) {
        selectedEl.style.borderColor = 'var(--primary)';
    }

    const { fixturePda, livePda } = derivePDAs(matchId);
    if (debugFixturePda) debugFixturePda.innerText = fixturePda;
    if (debugLivePda) debugLivePda.innerText = livePda;
    
    if (debugMatchState) {
        if (matchId === 'ARG_FRA_FINAL') {
            debugMatchState.innerText = "LIVE MATCH ARENA ACTIVE";
            debugMatchState.style.color = "var(--primary)";
        } else {
            debugMatchState.innerText = "UPCOMING (WAITING FOR ORACLE)";
            debugMatchState.style.color = "var(--text-dim)";
        }
    }

    // Add log entry
    logBracketEvent(`[System] Selección de partido cambiada a: ${matchId}`);
    logBracketEvent(`[System] Derived PDA Fixture: ${fixturePda}`);
    logBracketEvent(`[System] Derived PDA Live State: ${livePda}`);
};

function logBracketEvent(msg, color = '#a0aec0') {
    const logs = document.getElementById('bracketLiveLogs');
    if (!logs) return;
    const div = document.createElement('div');
    div.style.color = color;
    div.innerText = msg;
    logs.appendChild(div);
    logs.scrollTop = logs.scrollHeight;
}

// Simulated real-time score updates with neon flashes
let bracketScoreA = 0;
let bracketScoreB = 0;

function startBracketMatchSimulation() {
    let minute = 0;
    
    const interval = setInterval(() => {
        if (!document.getElementById('score-teamA')) {
            clearInterval(interval);
            return;
        }

        minute += 5;
        if (minute >= 90) {
            logBracketEvent(`[Oracle] 🏁 Final de partido ARG_FRA_FINAL. Marcador final: Argentina ${bracketScoreA} - ${bracketScoreB} Francia`, 'var(--gold)');
            clearInterval(interval);
            return;
        }

        // Random events
        if (Math.random() > 0.7) {
            const scorer = Math.random() > 0.5 ? 'Argentina' : 'Francia';
            if (scorer === 'Argentina') {
                bracketScoreA++;
                const el = document.getElementById('score-teamA');
                if (el) el.innerText = bracketScoreA;
                logBracketEvent(`[Oracle] ⚽ GOL DE ARGENTINA! Marcador: ${bracketScoreA} - ${bracketScoreB} (Min ${minute})`, 'var(--primary)');
            } else {
                bracketScoreB++;
                const el = document.getElementById('score-teamB');
                if (el) el.innerText = bracketScoreB;
                logBracketEvent(`[Oracle] ⚽ GOL DE FRANCIA! Marcador: ${bracketScoreA} - ${bracketScoreB} (Min ${minute})`, 'var(--danger)');
            }
            
            // Trigger golden neon flash
            const matchCard = document.getElementById('match-ARG_FRA_FINAL');
            if (matchCard) {
                matchCard.classList.add('gold-neon-flash');
                setTimeout(() => {
                    matchCard.classList.remove('gold-neon-flash');
                }, 2400); // 3 repeats of 0.8s = 2.4s
            }
        }
    }, 4000);
}

async function fetchFixtures() {
    console.log("Cargando fixtures desde Solana...");
    
    // Initialize default PDAs in UI
    const defaultMatchId = 'ARG_FRA_FINAL';
    const { fixturePda, livePda } = derivePDAs(defaultMatchId);
    
    const debugFixturePda = document.getElementById('debugFixturePda');
    const debugLivePda = document.getElementById('debugLivePda');
    if (debugFixturePda) debugFixturePda.innerText = fixturePda;
    if (debugLivePda) debugLivePda.innerText = livePda;
    
    // Start simulation
    startBracketMatchSimulation();

    // Standard read from Solana Anchor
    const connection = new solanaWeb3.Connection(RPC_URL, "confirmed");
    try {
        const provider = new anchor.AnchorProvider(connection, window.solana, {});
        const program = new anchor.Program(IDL, PROGRAM_ID, provider);
        const fixtures = await program.account.fixture.all();
        console.log("Fixtures encontrados on-chain:", fixtures);
        
        if (fixtures.length > 0) {
            updateFixtureUI(fixtures[0].account); // Fallback standard view
        }
    } catch (error) {
        console.error("Error al leer fixtures reales de Anchor (usando fallback simulado):", error);
    }
}

function updateFixtureUI(match) {
    const fixtureSection = document.getElementById('matchDisplay');
    if (!fixtureSection) return;

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

// Load
window.addEventListener('load', fetchFixtures);
