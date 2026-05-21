(() => {
    const PROGRAM_ID = "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg";
    const RPC_URL = "https://api.devnet.solana.com";
    const IDL_URL = "assets/js/generated/goalchain_program.idl.json";
    const DEFAULT_MATCH_ID = "ARG_FRA_FINAL";
    let cachedIdl = null;
    let activeMatchId = DEFAULT_MATCH_ID;

    function bnToNumber(v) {
        if (v === null || v === undefined) return 0;
        if (typeof v === "number") return v;
        if (typeof v === "bigint") return Number(v);
        if (typeof v === "string") return Number(v);
        if (typeof v.toNumber === "function") return v.toNumber();
        if (typeof v.toString === "function") return Number(v.toString());
        return 0;
    }

    function formatEnumValue(enumValue) {
        if (!enumValue) return "UNKNOWN";
        if (typeof enumValue === "string") return enumValue.toUpperCase();
        const key = Object.keys(enumValue)[0];
        return key ? key.toUpperCase() : "UNKNOWN";
    }

    function derivePDAs(matchId) {
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
        return { fixturePda, livePda };
    }

    function logBracketEvent(message, color = "#a0aec0") {
        const logs = document.getElementById("bracketLiveLogs");
        if (!logs) return;
        const row = document.createElement("div");
        row.style.color = color;
        row.innerText = message;
        logs.appendChild(row);
        logs.scrollTop = logs.scrollHeight;
    }

    async function loadIdl() {
        if (cachedIdl) return cachedIdl;
        const res = await fetch(IDL_URL, { cache: "no-store" });
        if (!res.ok) {
            throw new Error(`No se pudo cargar IDL generado (${res.status})`);
        }
        cachedIdl = await res.json();
        return cachedIdl;
    }

    async function loadFixtureData(matchId) {
        const { fixturePda, livePda } = derivePDAs(matchId);
        const connection = new solanaWeb3.Connection(RPC_URL, "confirmed");
        const idl = await loadIdl();
        const readOnlyWallet = {
            publicKey: solanaWeb3.PublicKey.default,
            signTransaction: async (tx) => tx,
            signAllTransactions: async (txs) => txs,
        };
        const provider = new anchor.AnchorProvider(connection, readOnlyWallet, { commitment: "confirmed" });
        const program = new anchor.Program(idl, new solanaWeb3.PublicKey(PROGRAM_ID), provider);

        const fixture = await program.account.fixture.fetchNullable(fixturePda);
        const liveState = await program.account.liveMatchState.fetchNullable(livePda);
        return { fixturePda, livePda, fixture, liveState };
    }

    function renderFixture(match) {
        const fixtureSection = document.getElementById("matchDisplay");
        if (!fixtureSection) return;
        fixtureSection.style.display = "block";

        if (!match) {
            fixtureSection.innerHTML = `
                <div style="padding:1rem; color:var(--text-dim); text-align:center;">
                    No hay fixture on-chain para este Match ID.
                </div>
            `;
            return;
        }

        const poolA = bnToNumber(match.poolA);
        const poolB = bnToNumber(match.poolB);
        const poolDraw = bnToNumber(match.poolDraw);
        const totalA = (poolA / 10 ** 9).toFixed(2);
        const totalB = (poolB / 10 ** 9).toFixed(2);
        const totalDraw = (poolDraw / 10 ** 9).toFixed(2);
        const totalPool = ((poolA + poolB + poolDraw) / 10 ** 9).toFixed(2);

        fixtureSection.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:1rem;">
                <div style="background:var(--secondary); padding:4px 12px; border-radius:20px; font-size:0.7rem; width:fit-content; margin:0 auto;">ON-CHAIN FIXTURE</div>
                <div style="display:flex; justify-content:space-between; padding:1rem; border-bottom:1px solid var(--border); font-weight:bold; font-size:1.2rem;">
                    <span>${match.teamA}</span>
                    <span style="color:var(--primary);">VS</span>
                    <span>${match.teamB}</span>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:1rem;">
                    <div style="text-align:center; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
                        <div style="font-size:0.7rem; color:var(--text-dim);">GANA A</div>
                        <div style="color:var(--primary); font-weight:bold;">${totalA}</div>
                    </div>
                    <div style="text-align:center; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
                        <div style="font-size:0.7rem; color:var(--text-dim);">EMPATE</div>
                        <div style="color:var(--primary); font-weight:bold;">${totalDraw}</div>
                    </div>
                    <div style="text-align:center; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;">
                        <div style="font-size:0.7rem; color:var(--text-dim);">GANA B</div>
                        <div style="color:var(--primary); font-weight:bold;">${totalB}</div>
                    </div>
                </div>
                <div style="margin-top:1rem; text-align:center;">
                    <span style="font-size:0.8rem; color:var(--text-dim);">POZO TOTAL: </span>
                    <span style="font-size:1rem; color:var(--primary); font-weight:bold;">${totalPool} SOL</span>
                </div>
            </div>
        `;
    }

    function renderLiveState(liveState, fixtureStatus) {
        const debugMatchState = document.getElementById("debugMatchState");
        if (!debugMatchState) return;

        if (liveState) {
            const minute = bnToNumber(liveState.minute);
            debugMatchState.innerText = `LIVE ${liveState.scoreA}-${liveState.scoreB} (MIN ${minute})`;
            debugMatchState.style.color = "var(--primary)";
            return;
        }

        const state = formatEnumValue(fixtureStatus);
        debugMatchState.innerText = `${state} (WAITING ORACLE LIVE STATE)`;
        debugMatchState.style.color = "var(--text-dim)";
    }

    async function refreshSelectedMatch() {
        const debugMatchId = document.getElementById("debugMatchId");
        const debugProgramId = document.getElementById("debugProgramId");
        const debugFixturePda = document.getElementById("debugFixturePda");
        const debugLivePda = document.getElementById("debugLivePda");
        if (!debugMatchId) return;

        debugMatchId.innerText = activeMatchId;
        if (debugProgramId) debugProgramId.innerText = PROGRAM_ID;

        const { fixturePda, livePda } = derivePDAs(activeMatchId);
        if (debugFixturePda) debugFixturePda.innerText = fixturePda.toBase58();
        if (debugLivePda) debugLivePda.innerText = livePda.toBase58();

        try {
            const payload = await loadFixtureData(activeMatchId);
            renderFixture(payload.fixture);
            renderLiveState(payload.liveState, payload.fixture?.status);
            logBracketEvent(`[RPC] Fixture ${activeMatchId} actualizado desde Devnet.`, "var(--primary)");
        } catch (err) {
            console.error("Error fetching fixture/live state:", err);
            renderFixture(null);
            renderLiveState(null, null);
            logBracketEvent(`[RPC] Error consultando ${activeMatchId}: ${err.message}`, "var(--danger)");
        }
    }

    function highlightMatch(matchId) {
        document.querySelectorAll(".bracket-match").forEach((el) => {
            el.style.borderColor = el.id === `match-${matchId}` ? "var(--primary)" : "rgba(255,255,255,0.05)";
        });
    }

    window.selectBracketMatch = async function selectBracketMatch(matchId) {
        activeMatchId = matchId;
        highlightMatch(matchId);
        logBracketEvent(`[System] Match seleccionado: ${matchId}`);
        await refreshSelectedMatch();
    };

    window.addEventListener("load", async () => {
        highlightMatch(activeMatchId);
        await refreshSelectedMatch();
        setInterval(() => {
            refreshSelectedMatch();
        }, 20_000);
    });
})();
