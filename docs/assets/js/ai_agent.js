/**
 * ai_agent.js - GoalChain AI Agent & SportsFi Predictor Hub
 * Implements interactive Rainmaker AI, Auto-Optimizer AI Agent, Emblem Vault Simulator and AI Agent Chat Terminal.
 */

let aiState = {
    betbotActive: false,
    autoOptimizerActive: false,
    selectedVaultPlayers: [],
    terminalHistory: [
        { sender: 'system', text: '🤖 GoalChain AI Agent Terminal initialized successfully.' },
        { sender: 'system', text: 'Connected to Solana Mainnet via Helius RPC. Pyth Feed active.' },
        { sender: 'system', text: 'Type `/help` to see available autonomous commands.' }
    ],
    agentLogs: [
        { time: '10:45 AM', event: 'Scan complete. Messi Stamina dropped to 28% -> Auto-swapped with fresh Mbappe. Stamina Efficiency maintained at 98%.' },
        { time: '12:15 PM', event: 'Stamina below threshold detected -> Burned 500 $GCH for stamina potion. Condition restored.' },
        { time: '02:30 PM', event: 'Claimed 452 $GCH daily yield -> Staked 100% in JitoSOL Pool (estimated +12% APR).' }
    ],
    matchPrediction: {
        team1: 'Argentina 🇦🇷',
        team2: 'Francia 🇫🇷',
        team1Prob: 74,
        drawProb: 12,
        team2Prob: 14,
        reasoning: 'El Oráculo de GoalChain reporta un boost de rendimiento del +12% para Argentina derivado del desempeño biométrico en tiempo real en la liga local. El clima en el MetLife Stadium es favorable para fútbol de posesión.'
    }
};

// Available mock players for Vault Bundler
const vaultMockPlayers = [
    { id: 1, name: 'Lionel Messi', rarity: 'Mythic', country: 'ARG', yield: 120 },
    { id: 2, name: 'Kylian Mbappé', rarity: 'Legendary', country: 'FRA', yield: 85 },
    { id: 3, name: 'Rodrigo De Paul', rarity: 'Rare', country: 'ARG', yield: 45 },
    { id: 4, name: 'Emiliano Martínez', rarity: 'Legendary', country: 'ARG', yield: 70 },
    { id: 5, name: 'Antoine Griezmann', rarity: 'Rare', country: 'FRA', yield: 40 }
];

function initAIView() {
    console.log("🤖 Initializing AI Agent Hub...");
    renderTerminal();
    renderAgentLogs();
    renderVaultSelection();
    simulatePythFeed();
}

// --- TERMINAL LOGIC ---
function renderTerminal() {
    const output = document.getElementById('terminalOutput');
    if (!output) return;
    
    output.innerHTML = aiState.terminalHistory.map(msg => {
        let colorClass = 'term-system';
        if (msg.sender === 'user') colorClass = 'term-user';
        if (msg.sender === 'agent') colorClass = 'term-agent';
        return `<div class="${colorClass}">[${msg.sender === 'system' ? 'SYSTEM' : msg.sender === 'user' ? 'YOU' : 'AGENT'}] ${msg.text}</div>`;
    }).join('');
    
    output.scrollTop = output.scrollHeight;
}

function submitTerminalCommand() {
    const input = document.getElementById('terminalInput');
    if (!input || !input.value.trim()) return;
    
    const cmd = input.value.trim();
    input.value = '';
    
    // Add user command to history
    aiState.terminalHistory.push({ sender: 'user', text: cmd });
    renderTerminal();
    
    // Play sound effect or click feeling
    
    // Process command
    const output = document.getElementById('terminalOutput');
    const thinkingId = 'thinking_' + Date.now();
    output.innerHTML += `<div id="${thinkingId}" class="term-system">[AGENT] Analyzing protocol telemetry and scanning blockchain... 🤖⏳</div>`;
    output.scrollTop = output.scrollHeight;
    
    setTimeout(() => {
        const thinkingEl = document.getElementById(thinkingId);
        if (thinkingEl) thinkingEl.remove();
        
        let response = "";
        const lowerCmd = cmd.toLowerCase();
        
        if (lowerCmd === 'help' || lowerCmd === '/help') {
            response = `Available commands:<br>
            • <b>/optimize</b> - Scan roster and execute autonomous swaps for fatigue.<br>
            • <b>/predict</b> - Run real-time Rainmaker sports betting predictions.<br>
            • <b>/vault</b> - Bundle active Starting XI cards into a single transferable vault.<br>
            • <b>/status</b> - Get full Jito staking and yield telemetry details.<br>
            • <b>/clear</b> - Clear terminal history.`;
        } else if (lowerCmd.startsWith('/optimize')) {
            response = `🟢 [Autonomous Action Success]<br>
            Roster scanned. Found fatigued player: <b>Rodrigo De Paul</b> (Stamina: 24%).<br>
            Swapped with fresh backup: <b>Alexis Mac Allister</b> (Stamina: 100%).<br>
            Stamina efficiency successfully restored to <b>99%</b>. Daily $GCH yield stabilized!`;
            // Add a log
            addAgentLog("Roster optimization triggered by terminal. Swapped De Paul (24%) with Mac Allister (100%).");
        } else if (lowerCmd.startsWith('/predict')) {
            response = `🔮 [Rainmaker Sports Predictor Edge]<br>
            Match: <b>Argentina 🇦🇷 vs Francia 🇫🇷</b><br>
            • Argentina win probability: <b>${aiState.matchPrediction.team1Prob}%</b><br>
            • Draw probability: <b>${aiState.matchPrediction.drawProb}%</b><br>
            • Francia win probability: <b>${aiState.matchPrediction.team2Prob}%</b><br>
            • <b>Oracle telemetries:</b> Real-time Pyth oracles report extreme physical condition boost (+12%) for Argentina starting XI. Recommend allocating $GCH on Argentina (Edge value: 1.34).`;
        } else if (lowerCmd.startsWith('/vault')) {
            response = `📦 [Emblem Vault Bundler]<br>
            Packaging Starting XI roster into a single cross-chain transferable NFT vault...<br>
            • Included: 3 active players (Messi, Mbappé, De Paul).<br>
            • Estimated emissions: <b>+250 $GCH/day</b>.<br>
            • Status: <b>Ready to Mint</b>. Run button above or type <b>/mint_vault</b> to finalize (requires 200 $GCH fee).`;
        } else if (lowerCmd.startsWith('/status')) {
            response = `📊 [GoalChain AI Agent Status]<br>
            • Roster Optimizer: <b>${aiState.autoOptimizerActive ? 'ACTIVE' : 'INACTIVE'}</b><br>
            • Active Roster: <b>11 Players</b> (Stamina: 98%)<br>
            • $GCH Balance: <b>1,240 $GCH</b><br>
            • Jito Staking: <b>45.2 SOL</b> in Smart Treasury<br>
            • Active Betbot: <b>${aiState.betbotActive ? 'ACTIVE' : 'INACTIVE'}</b>`;
        } else if (lowerCmd === '/clear') {
            aiState.terminalHistory = [{ sender: 'system', text: 'Terminal cleared.' }];
            renderTerminal();
            return;
        } else if (lowerCmd.startsWith('/mint_vault')) {
            response = `🎉 [Emblem Vault Minted]<br>
            Success! Burned 200 $GCH fee.<br>
            A new GoalChain Championship Portfolio Vault NFT has been minted and sent to your Phantom wallet.<br>
            Transaction Hash: <a href="#" style="color:var(--primary);">SolanaTx_3a8f9c1e...b40d7e</a>`;
            addAgentLog("Emblem Vault minted containing Starting XI. Burned 200 $GCH.");
        } else {
            response = `Hello! I am your GoalChain autonomous AI Agent manager. I am connected to Solana Mainnet, Helius, Pyth, and Jito. I can autonomously optimize your Starting XI roster and stake your daily yields. Type <b>/help</b> to see all commands. Let's make some yield! ⚽🚀`;
        }
        
        aiState.terminalHistory.push({ sender: 'agent', text: response });
        renderTerminal();
    }, 800);
}

// --- AGENT LOGS ---
function renderAgentLogs() {
    const container = document.getElementById('agentLogContainer');
    if (!container) return;
    
    container.innerHTML = aiState.agentLogs.map(log => `
        <div class="log-row" style="display: flex; gap: 10px; margin-bottom: 12px; font-size: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 8px;">
            <span style="color: var(--secondary); font-weight: bold; white-space: nowrap;">[${log.time}]</span>
            <span style="color: var(--text-dim);">${log.event}</span>
        </div>
    `).join('');
}

function addAgentLog(eventText) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    aiState.agentLogs.unshift({ time: timeStr, event: eventText });
    if (aiState.agentLogs.length > 8) aiState.agentLogs.pop();
    renderAgentLogs();
}

// --- BETBOT AND OPTIMIZER TOGGLES ---
function toggleBetbot() {
    aiState.betbotActive = !aiState.betbotActive;
    const btn = document.getElementById('betbotToggleBtn');
    const indicator = document.getElementById('betbotIndicator');
    
    if (aiState.betbotActive) {
        btn.innerText = "DESACTIVAR BETBOT";
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
        indicator.innerHTML = `🟢 <span style="color: var(--primary);">ACTIVO</span> (Monitoreando partidos del Mundial...)`;
        indicator.style.animation = "pulse 2s infinite";
        addAgentLog("Rainmaker Autonomous Betbot ACTIVATED. Analyzing fixture win opportunities.");
        aiState.terminalHistory.push({ sender: 'agent', text: '🟢 Rainmaker AI Betbot deployed successfully. Allocating dynamic capital.' });
    } else {
        btn.innerText = "ACTIVAR AUTONOMOUS BETBOT";
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
        indicator.innerHTML = `🔴 <span style="color: var(--danger);">INACTIVO</span>`;
        indicator.style.animation = "none";
        addAgentLog("Rainmaker Autonomous Betbot DEACTIVATED.");
        aiState.terminalHistory.push({ sender: 'agent', text: '🔴 Rainmaker AI Betbot recalled.' });
    }
    renderTerminal();
}

function toggleOptimizer() {
    aiState.autoOptimizerActive = !aiState.autoOptimizerActive;
    const btn = document.getElementById('optimizerToggleBtn');
    const indicator = document.getElementById('optimizerIndicator');
    
    if (aiState.autoOptimizerActive) {
        btn.innerText = "DESACTIVAR AUTO-MANAGER";
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
        indicator.innerHTML = `🟢 <span style="color: var(--primary);">ACTIVO</span> (Optimizando Roster y Stamina...)`;
        addAgentLog("GoalChain Auto-Optimizer AI Agent ACTIVATED. Squad monitoring enabled.");
        aiState.terminalHistory.push({ sender: 'agent', text: '🟢 Auto-Optimizer AI Agent active. Roster, stamina, and yield are fully managed.' });
    } else {
        btn.innerText = "ACTIVAR AUTO-OPTIMIZER AGENT";
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
        indicator.innerHTML = `🔴 <span style="color: var(--danger);">INACTIVO</span>`;
        addAgentLog("GoalChain Auto-Optimizer AI Agent DEACTIVATED.");
        aiState.terminalHistory.push({ sender: 'agent', text: '🔴 Auto-Optimizer AI Agent deactivated.' });
    }
    renderTerminal();
}

// --- EMBLEM VAULT SIMULATOR ---
function renderVaultSelection() {
    const container = document.getElementById('vaultPlayerSelection');
    if (!container) return;
    
    container.innerHTML = vaultMockPlayers.map(p => {
        const isSelected = aiState.selectedVaultPlayers.includes(p.id);
        const rarityColor = p.rarity === 'Mythic' ? 'var(--gold)' : p.rarity === 'Legendary' ? 'var(--secondary)' : 'var(--accent)';
        return `
            <div class="vault-player-pill" onclick="toggleVaultPlayer(${p.id})" style="display:flex; justify-content:space-between; align-items:center; padding: 10px; background:${isSelected ? 'rgba(20, 241, 149, 0.08)' : 'rgba(255,255,255,0.02)'}; border: 1px solid ${isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}; border-radius: 10px; margin-bottom: 8px; cursor:pointer; transition:all 0.2s;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:1rem;">👤</span>
                    <div>
                        <div style="font-size:0.8rem; font-weight:700; color:#fff;">${p.name}</div>
                        <div style="font-size:0.6rem; color:${rarityColor}; font-weight:bold;">${p.rarity} [${p.country}]</div>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:0.75rem; color:var(--primary); font-weight:bold;">+${p.yield} $GCH/d</div>
                    <div style="font-size:0.65rem; color:var(--text-dim);">${isSelected ? '✅ Seleccionado' : '➕ Añadir'}</div>
                </div>
            </div>
        `;
    }).join('');
    
    updateVaultSummary();
}

function toggleVaultPlayer(id) {
    const idx = aiState.selectedVaultPlayers.indexOf(id);
    if (idx > -1) {
        aiState.selectedVaultPlayers.splice(idx, 1);
    } else {
        if (aiState.selectedVaultPlayers.length >= 3) {
            alert("Máximo 3 jugadores colaterales por Vault en esta Beta.");
            return;
        }
        aiState.selectedVaultPlayers.push(id);
    }
    renderVaultSelection();
}

function updateVaultSummary() {
    const sumEmissions = document.getElementById('vaultEstimatedEmissions');
    const selectedCount = document.getElementById('vaultSelectedCount');
    const mintBtn = document.getElementById('mintVaultBtn');
    
    let totalYield = 0;
    aiState.selectedVaultPlayers.forEach(id => {
        const player = vaultMockPlayers.find(p => p.id === id);
        if (player) totalYield += player.yield;
    });
    
    if (sumEmissions) sumEmissions.innerText = `+${totalYield} $GCH/día`;
    if (selectedCount) selectedCount.innerText = `${aiState.selectedVaultPlayers.length} / 3 cromos`;
    
    if (mintBtn) {
        mintBtn.disabled = aiState.selectedVaultPlayers.length === 0;
    }
}

function mintVaultPortfolio() {
    if (aiState.selectedVaultPlayers.length === 0) return;
    
    const mintBtn = document.getElementById('mintVaultBtn');
    mintBtn.innerText = "MINTEANDO VAULT CARD... 🔮⚡";
    mintBtn.disabled = true;
    
    // Play dynamic animations in the terminal
    aiState.terminalHistory.push({ sender: 'system', text: '📦 Emblem Vault integration initialized...' });
    aiState.terminalHistory.push({ sender: 'system', text: 'Bundling Starting XI elements and metadata into a secure RWA contract...' });
    renderTerminal();
    
    setTimeout(() => {
        mintBtn.innerText = "MINT VAULT PORTFOLIO NFT";
        mintBtn.disabled = false;
        
        // Add log
        addAgentLog(`Emblem Vault minted containing ${aiState.selectedVaultPlayers.length} player assets. Burned 200 $GCH.`);
        
        // Success message
        alert("¡Éxito! Un NFT de portafolio Emblem Vault ha sido creado. Has agrupado a tus jugadores para crear un activo de alto rendimiento negociable de una sola vez.");
        
        aiState.terminalHistory.push({ sender: 'agent', text: '🟢 [Emblem Vault Mint Success] New bundled NFT registered on Solana Mainnet.' });
        renderTerminal();
        
        // Reset selection
        aiState.selectedVaultPlayers = [];
        renderVaultSelection();
    }, 2000);
}

// --- PYTH FEED SIMULATOR ---
function simulatePythFeed() {
    const predictorMetric = document.getElementById('predictReasoning');
    if (!predictorMetric) return;
    
    setInterval(() => {
        if (aiState.betbotActive) {
            // Dynamically alter probabilities slightly to simulate live tracking
            const drift = Math.floor(Math.random() * 5) - 2; // -2 to +2
            aiState.matchPrediction.team1Prob = Math.min(90, Math.max(50, aiState.matchPrediction.team1Prob + drift));
            aiState.matchPrediction.team2Prob = 100 - aiState.matchPrediction.team1Prob - aiState.matchPrediction.drawProb;
            
            // Update UI bars
            const bar1 = document.getElementById('barTeam1');
            const barDraw = document.getElementById('barDraw');
            const barTeam2 = document.getElementById('barTeam2');
            
            const txt1 = document.getElementById('txtTeam1');
            const txtDraw = document.getElementById('txtDraw');
            const txtTeam2 = document.getElementById('txtTeam2');
            
            if (bar1) bar1.style.width = `${aiState.matchPrediction.team1Prob}%`;
            if (barDraw) barDraw.style.width = `${aiState.matchPrediction.drawProb}%`;
            if (barTeam2) barTeam2.style.width = `${aiState.matchPrediction.team2Prob}%`;
            
            if (txt1) txt1.innerText = `${aiState.matchPrediction.team1Prob}%`;
            if (txtDraw) txtDraw.innerText = `${aiState.matchPrediction.drawProb}%`;
            if (txtTeam2) txtTeam2.innerText = `${aiState.matchPrediction.team2Prob}%`;
        }
    }, 4000);
}

// Expose functions globally
window.initAIView = initAIView;
window.submitTerminalCommand = submitTerminalCommand;
window.toggleBetbot = toggleBetbot;
window.toggleOptimizer = toggleOptimizer;
window.toggleVaultPlayer = toggleVaultPlayer;
window.mintVaultPortfolio = mintVaultPortfolio;
