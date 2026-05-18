/**
 * ai_agent.js - GoalChain AI Agent & SportsFi Predictor Hub v2.0
 * Rainmaker AI uses real WC2026 fixture data and players.json stats to compute dynamic predictions.
 */

let aiState = {
    betbotActive: false,
    autoOptimizerActive: false,
    selectedVaultPlayers: [],
    allPlayers: [],
    fixture: [],
    currentMatchIdx: 0,
    vaultPlayers: [],
    matchPrediction: null,
    terminalHistory: [
        { sender: 'system', text: '🤖 GoalChain AI Agent Terminal v2.0 initialized.' },
        { sender: 'system', text: '📡 Connecting to Helius RPC... Pyth Oracle Feed active.' },
        { sender: 'system', text: '⚽ WC2026 Fixture ready. Type /help for commands.' }
    ],
    agentLogs: [
        { time: '10:45', event: 'Roster scan: Satoshi Stamina at 28% → Auto-swapped. Efficiency: 98%.' },
        { time: '12:15', event: 'Stamina threshold hit → Burned 500 $GCH for stamina boost.' },
        { time: '14:30', event: 'Claimed 452 $GCH daily yield → Re-staked in Phi Protocol CLMM.' }
    ]
};

// Country stats cache
let countryStats = {};

// Load fixture + players, then boot UI
async function initAIView() {
    console.log("🤖 Initializing Rainmaker AI v2.0...");
    try {
        const [playersRes, fixtureRes] = await Promise.all([
            fetch(`assets/data/players.json?v=${Date.now()}`).then(r => r.json()),
            fetch(`assets/data/wc2026_fixture.json?v=${Date.now()}`).then(r => r.json())
        ]);
        aiState.allPlayers = playersRes;
        aiState.fixture = fixtureRes;
        buildCountryStats();
        populateVaultPlayers();
    } catch (e) {
        console.warn("Using defaults — fixture/players load failed:", e);
        // Fallback defaults
        aiState.matchPrediction = { team1: 'Argentina 🇦🇷', team2: 'Francia 🇫🇷', team1Prob: 74, drawProb: 12, team2Prob: 14 };
    }
    renderTerminal();
    renderAgentLogs();
    renderVaultSelection();
    renderFixturePredictor();
    simulatePythFeed();
}

// Build country power index from player stats
function buildCountryStats() {
    countryStats = {};
    for (const player of aiState.allPlayers) {
        const c = player.country;
        if (!countryStats[c]) countryStats[c] = { atk: 0, def: 0, hype: 0, count: 0 };
        countryStats[c].atk  += player.stats?.atk  || 50;
        countryStats[c].def  += player.stats?.def  || 50;
        countryStats[c].hype += player.stats?.hype || 50;
        countryStats[c].count++;
    }
    for (const c in countryStats) {
        const s = countryStats[c];
        s.atk  = Math.round(s.atk  / s.count);
        s.def  = Math.round(s.def  / s.count);
        s.hype = Math.round(s.hype / s.count);
        s.power = Math.round((s.atk * 0.4) + (s.def * 0.3) + (s.hype * 0.3));
    }
}

// Predict win probabilities for a match
function predictMatch(home, away) {
    const hPow = (countryStats[home]?.power || 55) + 5; // home boost
    const aPow = countryStats[away]?.power || 55;
    const total = hPow + aPow;
    const rawH = Math.round((hPow / total) * 100);
    const rawA = Math.round((aPow / total) * 100);
    const draw = Math.max(8, Math.min(20, 100 - rawH - rawA + 8));
    const h1 = Math.max(10, rawH - Math.floor(draw / 2));
    const a1 = Math.max(10, rawA - Math.floor(draw / 2));
    const sum = h1 + draw + a1;
    return {
        home: Math.round((h1 / sum) * 100),
        draw: Math.round((draw / sum) * 100),
        away: Math.round((a1 / sum) * 100),
        edgeValue: parseFloat((1 / (h1 / sum) * 0.9).toFixed(2))
    };
}

// Render the live prediction panel
function renderFixturePredictor() {
    const matches = aiState.fixture.filter(m => m.phase === 'group');
    if (!matches.length) return;
    const match = matches[aiState.currentMatchIdx % matches.length];
    const pred = predictMatch(match.home, match.away);
    const hStats = countryStats[match.home] || {};
    const aStats = countryStats[match.away] || {};

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el[el.tagName === 'DIV' || el.tagName === 'SPAN' ? 'innerHTML' : 'style']['width' in el.style ? 'width' : 'innerText'] = val; };

    const t1 = document.getElementById('predTeam1Name');
    const t2 = document.getElementById('predTeam2Name');
    const bar1 = document.getElementById('barTeam1');
    const barD = document.getElementById('barDraw');
    const bar2 = document.getElementById('barTeam2');
    const txt1 = document.getElementById('txtTeam1');
    const txtD = document.getElementById('txtDraw');
    const txt2 = document.getElementById('txtTeam2');
    const reas = document.getElementById('predictReasoning');
    const venue = document.getElementById('predVenue');

    if (t1) t1.innerText = match.home;
    if (t2) t2.innerText = match.away;
    if (bar1) bar1.style.width = `${pred.home}%`;
    if (barD)  barD.style.width  = `${pred.draw}%`;
    if (bar2) bar2.style.width = `${pred.away}%`;
    if (txt1) txt1.innerText = `${pred.home}%`;
    if (txtD)  txtD.innerText  = `${pred.draw}%`;
    if (txt2) txt2.innerText = `${pred.away}%`;
    if (venue) venue.innerText = `📍 ${match.venue}, ${match.city} · ${match.date}`;
    if (reas) reas.innerText = `Rainmaker AI v2.0 — ${match.home} (Power:${hStats.power || '?'} ATK:${hStats.atk || '?'} DEF:${hStats.def || '?'}) vs ${match.away} (Power:${aStats.power || '?'} ATK:${aStats.atk || '?'} DEF:${aStats.def || '?'}). Home boost: +5pts. Valor de borde: ${pred.edgeValue}x en ${match.home}.`;

    aiState.matchPrediction = { team1: match.home, team2: match.away, team1Prob: pred.home, drawProb: pred.draw, team2Prob: pred.away };
}

function cycleNextMatch() {
    aiState.currentMatchIdx++;
    renderFixturePredictor();
    const f = aiState.fixture;
    const m = f[aiState.currentMatchIdx % f.length];
    addAgentLog(`Rainmaker rotó al siguiente partido: ${m?.home || '?'} vs ${m?.away || '?'}`);
}
window.cycleNextMatch = cycleNextMatch;

// Populate vault players from real data (top hype)
function populateVaultPlayers() {
    if (!aiState.allPlayers.length) return;
    const sorted = [...aiState.allPlayers].sort((a, b) => (b.stats?.hype || 0) - (a.stats?.hype || 0));
    aiState.vaultPlayers = sorted.slice(0, 8).map(p => ({
        id: p.id,
        name: p.name,
        rarity: p.rarity.charAt(0).toUpperCase() + p.rarity.slice(1),
        country: p.country.substring(0, 3).toUpperCase(),
        yield: p.base_yield_rate || Math.round((p.stats?.hype || 50) * 10)
    }));
}

// --- TERMINAL ---
function renderTerminal() {
    const output = document.getElementById('terminalOutput');
    if (!output) return;
    output.innerHTML = aiState.terminalHistory.map(msg => {
        const tag = msg.sender === 'system' ? 'SYSTEM' : msg.sender === 'user' ? 'YOU' : 'AGENT';
        const color = msg.sender === 'user' ? '#ffcc00' : msg.sender === 'agent' ? 'var(--primary)' : 'var(--text-dim)';
        return `<div style="margin-bottom:4px;font-size:0.65rem;line-height:1.4;"><span style="color:${color};font-weight:bold;">[${tag}]</span> <span>${msg.text}</span></div>`;
    }).join('');
    output.scrollTop = output.scrollHeight;
}

function submitTerminalCommand() {
    const input = document.getElementById('terminalInput');
    if (!input || !input.value.trim()) return;
    const cmd = input.value.trim();
    input.value = '';
    aiState.terminalHistory.push({ sender: 'user', text: cmd });
    renderTerminal();

    const output = document.getElementById('terminalOutput');
    const thinkId = 'think_' + Date.now();
    output.innerHTML += `<div id="${thinkId}" style="color:var(--text-dim);font-size:0.65rem;">[AGENT] Procesando... ⏳</div>`;
    output.scrollTop = output.scrollHeight;

    setTimeout(() => {
        document.getElementById(thinkId)?.remove();
        const lc = cmd.toLowerCase();
        let response = '';

        if (lc === '/help' || lc === 'help') {
            response = `Comandos:<br>• <b>/optimize</b> — Escanear roster<br>• <b>/predict</b> — Ver predicción actual<br>• <b>/fixture</b> — Ver próximos partidos WC2026<br>• <b>/vault</b> — Estado del Vault bundler<br>• <b>/status</b> — Estado completo<br>• <b>/burn [n]</b> — Quemar $GCH<br>• <b>/clear</b> — Limpiar`;
        } else if (lc.startsWith('/optimize')) {
            const tired = aiState.allPlayers.filter(p => (p.current_stamina || 100) < 40 && !p.is_eliminated)[0];
            if (tired) {
                response = `🟢 [Optimización OK] <b>${tired.name}</b> (Stamina: ${tired.current_stamina}%) → Auto-swap ejecutado. Eficiencia: 98%.`;
                addAgentLog(`Auto-swap: ${tired.name} (${tired.current_stamina}%) reemplazado.`);
            } else {
                response = '🟢 Roster en excelente estado. Stamina promedio > 85%.';
            }
        } else if (lc.startsWith('/predict')) {
            const p = aiState.matchPrediction;
            response = `🔮 <b>${p?.team1 || 'Argentina'} vs ${p?.team2 || 'Francia'}</b><br>• Local: <b>${p?.team1Prob || 74}%</b> · Empate: <b>${p?.drawProb || 12}%</b> · Visitante: <b>${p?.team2Prob || 14}%</b>`;
        } else if (lc.startsWith('/fixture')) {
            const next5 = aiState.fixture.slice(0, 5);
            response = `📋 [WC2026 — Próximos partidos]<br>` + (next5.length ? next5.map(m => `• ${m.date}: <b>${m.home} vs ${m.away}</b> @ ${m.city}`).join('<br>') : 'Fixture no cargado.');
        } else if (lc.startsWith('/vault')) {
            const total = aiState.selectedVaultPlayers.reduce((acc, id) => {
                const p = aiState.vaultPlayers.find(x => x.id === id);
                return acc + (p?.yield || 0);
            }, 0);
            response = `📦 Jugadores: <b>${aiState.selectedVaultPlayers.length}/3</b> · Yield: <b>+${total} $GCH/día</b>`;
        } else if (lc.startsWith('/status')) {
            response = `📊 Betbot: <b>${aiState.betbotActive ? '🟢' : '🔴'}</b> · Optimizer: <b>${aiState.autoOptimizerActive ? '🟢' : '🔴'}</b> · Jugadores: <b>${aiState.allPlayers.length}</b> · Partidos WC2026: <b>${aiState.fixture.length}</b>`;
        } else if (lc.startsWith('/burn')) {
            const amount = parseInt(cmd.split(' ')[1]) || 100;
            response = `🔥 Quemados <b>${amount} $GCH</b>. Suministro reducido. APR del Vault: +0.3%.`;
            addAgentLog(`Manual burn: ${amount} $GCH.`);
        } else if (lc === '/clear') {
            aiState.terminalHistory = [{ sender: 'system', text: 'Terminal limpiada.' }];
            renderTerminal();
            return;
        } else {
            response = `Soy tu Agente IA de GoalChain. Gestiono tu roster, predigo partidos del WC2026 y optimizo el yield de forma autónoma. Escribe <b>/help</b>. ⚽🤖`;
        }

        aiState.terminalHistory.push({ sender: 'agent', text: response });
        renderTerminal();
    }, 600);
}

// --- AGENT LOGS ---
function renderAgentLogs() {
    const container = document.getElementById('agentLogContainer');
    if (!container) return;
    container.innerHTML = aiState.agentLogs.map(log =>
        `<div style="display:flex;gap:10px;margin-bottom:10px;font-size:0.7rem;border-bottom:1px solid rgba(255,255,255,0.03);padding-bottom:8px;">
            <span style="color:var(--secondary);font-weight:bold;white-space:nowrap;">[${log.time}]</span>
            <span style="color:var(--text-dim);">${log.event}</span>
        </div>`
    ).join('');
}

function addAgentLog(eventText) {
    const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    aiState.agentLogs.unshift({ time: t, event: eventText });
    if (aiState.agentLogs.length > 8) aiState.agentLogs.pop();
    renderAgentLogs();
}

// --- BETBOT & OPTIMIZER TOGGLES ---
function toggleBetbot() {
    aiState.betbotActive = !aiState.betbotActive;
    const btn = document.getElementById('betbotToggleBtn');
    const ind = document.getElementById('betbotIndicator');
    if (aiState.betbotActive) {
        if (btn) { btn.innerText = 'DESACTIVAR BETBOT'; btn.className = (btn.className || '').replace('btn-secondary', '') + ' btn-primary'; }
        if (ind) ind.innerHTML = `🟢 <span style="color:var(--primary);">ACTIVO</span> (Monitoreando ${aiState.fixture.length} partidos WC2026...)`;
        addAgentLog('Rainmaker Betbot ACTIVADO.');
        aiState.terminalHistory.push({ sender: 'agent', text: '🟢 Rainmaker Betbot desplegado. Analizando valor en WC2026.' });
    } else {
        if (btn) { btn.innerText = 'ACTIVAR AUTONOMOUS BETBOT'; btn.className = (btn.className || '').replace('btn-primary', '') + ' btn-secondary'; }
        if (ind) ind.innerHTML = `🔴 <span style="color:#ff4d6a;">INACTIVO</span>`;
        addAgentLog('Rainmaker Betbot DESACTIVADO.');
        aiState.terminalHistory.push({ sender: 'agent', text: '🔴 Rainmaker Betbot retirado.' });
    }
    renderTerminal();
}

function toggleOptimizer() {
    aiState.autoOptimizerActive = !aiState.autoOptimizerActive;
    const btn = document.getElementById('optimizerToggleBtn');
    const ind = document.getElementById('optimizerIndicator');
    if (aiState.autoOptimizerActive) {
        if (btn) { btn.innerText = 'DESACTIVAR AUTO-MANAGER'; btn.className = (btn.className || '').replace('btn-secondary', '') + ' btn-primary'; }
        if (ind) ind.innerHTML = `🟢 <span style="color:var(--primary);">ACTIVO</span> (Optimizando ${aiState.allPlayers.length} cromos...)`;
        addAgentLog(`Auto-Optimizer ACTIVADO para ${aiState.allPlayers.length} jugadores.`);
        aiState.terminalHistory.push({ sender: 'agent', text: '🟢 Auto-Optimizer activo. Roster, stamina y yield gestionados.' });
    } else {
        if (btn) { btn.innerText = 'ACTIVAR AUTO-OPTIMIZER AGENT'; btn.className = (btn.className || '').replace('btn-primary', '') + ' btn-secondary'; }
        if (ind) ind.innerHTML = `🔴 <span style="color:#ff4d6a;">INACTIVO</span>`;
        addAgentLog('Auto-Optimizer DESACTIVADO.');
        aiState.terminalHistory.push({ sender: 'agent', text: '🔴 Auto-Optimizer deactivado.' });
    }
    renderTerminal();
}

// --- VAULT BUNDLER ---
function renderVaultSelection() {
    const container = document.getElementById('vaultPlayerSelection');
    if (!container) return;
    const players = aiState.vaultPlayers || [];
    if (!players.length) {
        container.innerHTML = '<div style="color:var(--text-dim);font-size:0.7rem;padding:10px;">Cargando jugadores del roster...</div>';
        return;
    }
    container.innerHTML = players.map(p => {
        const sel = aiState.selectedVaultPlayers.includes(p.id);
        const rc = { 'Mythic': 'var(--gold)', 'Legendary': 'var(--secondary)', 'Epic': '#9945ff', 'Rare': 'var(--accent)' }[p.rarity] || '#aaa';
        return `<div onclick="toggleVaultPlayer(${p.id})" style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:${sel ? 'rgba(20,241,149,0.08)' : 'rgba(255,255,255,0.02)'};border:1px solid ${sel ? 'var(--primary)' : 'rgba(255,255,255,0.05)'};border-radius:10px;margin-bottom:8px;cursor:pointer;transition:all 0.2s;">
            <div style="display:flex;align-items:center;gap:8px;">
                <span>👤</span>
                <div>
                    <div style="font-size:0.8rem;font-weight:700;color:#fff;">${p.name}</div>
                    <div style="font-size:0.6rem;color:${rc};font-weight:bold;">${p.rarity} [${p.country}]</div>
                </div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:0.75rem;color:var(--primary);font-weight:bold;">+${p.yield} $GCH/d</div>
                <div style="font-size:0.65rem;color:var(--text-dim);">${sel ? '✅ Seleccionado' : '➕ Añadir'}</div>
            </div>
        </div>`;
    }).join('');
    updateVaultSummary();
}

function toggleVaultPlayer(id) {
    const idx = aiState.selectedVaultPlayers.indexOf(id);
    if (idx > -1) {
        aiState.selectedVaultPlayers.splice(idx, 1);
    } else {
        if (aiState.selectedVaultPlayers.length >= 3) {
            if (window.notifier) window.notifier.show('⚠️ LÍMITE', 'Máximo 3 jugadores por Vault en esta Beta.', 'warning');
            else alert('Máximo 3 jugadores por Vault en esta Beta.');
            return;
        }
        aiState.selectedVaultPlayers.push(id);
    }
    renderVaultSelection();
}

function updateVaultSummary() {
    const sumEl = document.getElementById('vaultEstimatedEmissions');
    const countEl = document.getElementById('vaultSelectedCount');
    const mintBtn = document.getElementById('mintVaultBtn');
    let total = 0;
    aiState.selectedVaultPlayers.forEach(id => {
        const p = aiState.vaultPlayers.find(x => x.id === id);
        if (p) total += p.yield;
    });
    if (sumEl) sumEl.innerText = `+${total} $GCH/día`;
    if (countEl) countEl.innerText = `${aiState.selectedVaultPlayers.length} / 3 cromos`;
    if (mintBtn) mintBtn.disabled = aiState.selectedVaultPlayers.length === 0;
}

function mintVaultPortfolio() {
    if (!aiState.selectedVaultPlayers.length) return;
    const mintBtn = document.getElementById('mintVaultBtn');
    if (mintBtn) { mintBtn.innerText = 'MINTEANDO VAULT CARD... 🔮⚡'; mintBtn.disabled = true; }
    aiState.terminalHistory.push({ sender: 'system', text: '📦 Bundling players into Emblem Vault...' });
    renderTerminal();
    setTimeout(() => {
        if (mintBtn) { mintBtn.innerText = 'MINT VAULT PORTFOLIO NFT'; mintBtn.disabled = false; }
        addAgentLog(`Emblem Vault minteado: ${aiState.selectedVaultPlayers.length} jugadores. Quemados 200 $GCH.`);
        if (window.confetti) confetti({ particleCount: 80, spread: 70, colors: ['#9945ff', '#14f195', '#ffcc00'] });
        if (window.notifier) window.notifier.show('🎉 VAULT MINTED', `NFT de portfolio minted con ${aiState.selectedVaultPlayers.length} cromos!`, 'success');
        aiState.terminalHistory.push({ sender: 'agent', text: '🟢 Emblem Vault Mint OK. NFT registrado en Solana.' });
        renderTerminal();
        aiState.selectedVaultPlayers = [];
        renderVaultSelection();
    }, 2000);
}

// --- PYTH FEED (live drift) ---
function simulatePythFeed() {
    setInterval(() => {
        if (aiState.betbotActive && aiState.matchPrediction) {
            const drift = Math.floor(Math.random() * 5) - 2;
            aiState.matchPrediction.team1Prob = Math.min(90, Math.max(30, aiState.matchPrediction.team1Prob + drift));
            aiState.matchPrediction.team2Prob = Math.max(5, 100 - aiState.matchPrediction.team1Prob - aiState.matchPrediction.drawProb);
            renderFixturePredictor();
        }
    }, 4000);
}

// Expose globals
window.initAIView = initAIView;
window.submitTerminalCommand = submitTerminalCommand;
window.toggleBetbot = toggleBetbot;
window.toggleOptimizer = toggleOptimizer;
window.toggleVaultPlayer = toggleVaultPlayer;
window.mintVaultPortfolio = mintVaultPortfolio;
window.cycleNextMatch = cycleNextMatch;
