/**
 * colab_app.js - Lógica del Portal (Pizarrón, Leaderboard, etc.)
 */

let colabState = {
    notes: [
        { user: 'Nico', text: 'Hay que revisar el pool de recompensas para los influencers de Latam.', time: 'Hace 2h' },
        { user: 'Hermano 1', text: 'El arte de los NFTs Genesis ya está en un 80%. Mañana subo previews.', time: 'Hace 5h' }
    ],
    influencers: [
        { name: 'CryptoFutbolista', content: 'TikTok: Review de GoalChain', views: '150K', tokens: '15,000 $GCH', status: 'Activo' },
        { name: 'SolanaDegen88', content: 'X Thread: Por qué $GCH va a explotar', views: '45K', tokens: '4,500 $GCH', status: 'Pendiente' },
        { name: 'GoalChain_Fan', content: 'Youtube: Tutorial Penaltis', views: '12K', tokens: '1,200 $GCH', status: 'Activo' }
    ],
    equity: [
        { name: 'Founder (Origin Recognition)', share: '1.0%', points: '250' },
        { name: 'Stripe Agent Fund (Operations + SaaS + Compute)', share: '10.0%', points: '2,500' },
        { name: 'Community Treasury / DAO', share: '89.0%', points: '8,900' }
    ]
};

function initColabApp() {
    renderNotes();
    renderInfluencers();
    renderEquity();
    updateOracle();
    setupTabs();
}

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    // Actualizar botones
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

    // Actualizar secciones
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    
    if (tabId === 'dev') document.getElementById('devSection').classList.add('active');
    if (tabId === 'influencers') document.getElementById('influencerSection').classList.add('active');
    if (tabId === 'partners') document.getElementById('partnerSection').classList.add('active');
    if (tabId === 'finance') document.getElementById('financeSection').classList.add('active');
    if (tabId === 'academy') document.getElementById('academySection').classList.add('active');
    if (tabId === 'guide') document.getElementById('guideSection').classList.add('active');
    if (tabId === 'ceo') {
        const ceoSection = document.getElementById('ceoLogSection');
        if (ceoSection) ceoSection.classList.add('active');
        if (window.initCeoChat) window.initCeoChat();
    }
    if (tabId === 'control') {
        const controlSection = document.getElementById('controlPanelSection');
        if (controlSection) controlSection.classList.add('active');
        renderControlActions();
    }
}

// --- DEV TEAM LOGIC ---
function renderNotes() {
    const container = document.getElementById('sharedBoard');
    container.innerHTML = colabState.notes.map(n => `
        <div class="note-card">
            <div style="font-weight: 700; margin-bottom: 4px;">${n.user} <span style="font-size: 0.7rem; color: var(--text-dim); font-weight: 400;">• ${n.time}</span></div>
            <div>${n.text}</div>
        </div>
    `).join('');
}

function addNote() {
    const input = document.getElementById('noteText');
    if (!input.value) return;

    colabState.notes.unshift({
        user: window.currentRole === 'dev' ? 'Nico' : 'Invitado', // En producción usaría el nombre real del dev
        text: input.value,
        time: 'Justo ahora'
    });

    input.value = '';
    renderNotes();
}

function renderEquity() {
    const list = document.getElementById('equityList');
    if (!list) return;
    list.innerHTML = colabState.equity.map(e => `
        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div><strong>${e.name}</strong></div>
            <div style="color: var(--primary); font-weight: 700;">${e.share} <span style="color: var(--text-dim); font-size: 0.7rem; font-weight: 400; margin-left: 5px;">(${e.points} pts)</span></div>
        </div>
    `).join('');
}

function updateOracle() {
    // Aquí se conectaría con el contrato de Solana en producción
    const burned = localStorage.getItem('burned_tokens') || '84,200';
    const jackpot = localStorage.getItem('jackpot_pool') || '125,400';
    
    if (document.getElementById('jackpotTotal')) document.getElementById('jackpotTotal').innerText = jackpot + ' $GCH';
    if (document.getElementById('burnedTotal')) document.getElementById('burnedTotal').innerText = burned + ' $GCH';
}
function renderInfluencers() {
    const table = document.getElementById('influencerTable');
    table.innerHTML = colabState.influencers.map(i => `
        <tr>
            <td><strong>${i.name}</strong></td>
            <td style="font-size: 0.8rem; color: var(--text-dim);">${i.content}</td>
            <td>${i.views}</td>
            <td style="color: var(--primary); font-weight: 700;">${i.tokens}</td>
            <td><span class="badge-status">${i.status}</span></td>
        </tr>
    `).join('');
}

window.initColabApp = initColabApp;
window.switchTab = switchTab;
window.addNote = addNote;

// === PANEL DE CONTROL (Mirror funcional de los botones de Discord) ===
let controlActionsLog = [];

function triggerControlAction(customId) {
    if (!currentRole || currentRole !== 'dev') {
        alert("Solo usuarios con rol 'dev' pueden disparar acciones desde este panel.");
        return;
    }

    const label = getActionLabel(customId);
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);

    const action = {
        id: Date.now(),
        customId: customId,
        wallet: currentWallet,
        time: now.toLocaleTimeString('es-AR'),
        status: 'Ejecutando en caliente + Intake'
    };

    controlActionsLog.unshift(action);

    // 1. Always generate the intake (audit + fallback, same as Discord path)
    const intakeContent = generateIntakeForDiscordAction(customId, currentWallet, timestamp);
    const filename = `web-action-${customId}-${timestamp}.md`;
    downloadTextFile(filename, intakeContent);

    // 2. Try hot execution (en caliente) - same effect as Discord button
    executeHotAction(customId, currentWallet, label);

    renderControlActions();
}

async function executeHotAction(customId, wallet, label) {
    const payload = {
        action: customId,
        wallet: wallet,
        source: "web-panel",
        timestamp: new Date().toISOString(),
        label: label
    };

    // Try the local multi-agent / Hermes control endpoint (same one the Manager uses internally)
    const endpoints = [
        "http://127.0.0.1:8790/control",
        "http://127.0.0.1:8080/api/control-action",
        "/api/control-action"
    ];

    let success = false;

    for (const url of endpoints) {
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Web-Panel": "true",
                    "X-Triggered-By": wallet
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                success = true;
                showToast(`🔥 ${label} ejecutado en caliente`);
                break;
            }
        } catch (err) {
            // endpoint not available, try next
        }
    }

    if (!success) {
        showToast(`⚠️ ${label} → Intake generado. No se encontró backend local en caliente. El Manager lo ejecutará cuando sueltes el archivo en docs/intake/ (igual que desde Discord).`);
    }
}

function generateIntakeForDiscordAction(customId, wallet, timestamp) {
    const label = getActionLabel(customId);
    const owner = mapCustomIdToOwner(customId);

    return `---
title: "[WEB] ${label}"
date: ${new Date().toISOString()}
source: web-panel
wallet: ${wallet}
custom_id: ${customId}
discord_mirror: true
---

## Objective
Ejecutar **exactamente** la misma acción que produce el botón "${label}" cuando se aprieta en Discord con el @GoalChain Manager.

## Owner
${owner}

## Priority
P0

## Context
Disparado desde el Panel de Control web (Colabs autenticado).
Debe comportarse idénticamente a la interacción de Discord (mismo custom_id / mismo flujo interno).

## Required output
- Misma respuesta/efecto que el botón en Discord
- Logs claros
- Cualquier tarea creada debe llevar label "source:web-panel"

## Workflow
- Procesar como si el Manager hubiera recibido el botón desde Discord
- Usar el mismo path (tmux session, FCC launch, system command, etc.)
`;
}

function mapCustomIdToOwner(customId) {
    if (customId.startsWith('grok_btn_')) return 'grok';
    if (customId.startsWith('fcc_btn_')) return 'opencode';
    if (customId.startsWith('sys_btn_')) return 'opencode';
    return 'grok';
}

function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function getActionLabel(customId) {
    const map = {
        'grok_btn_ceo': 'CEO (Grok)',
        'grok_btn_growth': 'Growth (Grok)',
        'grok_btn_developer': 'Dev (Grok)',
        'grok_btn_xscout': 'X-Scout',
        'fcc_btn_sonnet': 'FCC Sonnet (Nvidia)',
        'fcc_btn_opus': 'FCC Opus (Nvidia)',
        'fcc_btn_haiku': 'FCC Haiku (Nvidia)',
        'sys_btn_cancel': 'Cancelar Run',
        'sys_btn_reset': 'Limpiar',
        'sys_btn_solana': 'Solana Build',
        'sys_btn_restart_ceo': 'Restart CEO',
        'sys_btn_force_post': 'Force Post'
    };
    return map[customId] || customId;
}

function renderControlActions() {
    const container = document.getElementById('webActionsLog');
    if (!container) return;

    if (controlActionsLog.length === 0) {
        container.innerHTML = `<em style="color: #64748b;">Aún no se han disparado acciones desde este panel en esta sesión.</em>`;
        return;
    }

    container.innerHTML = controlActionsLog.slice(0, 8).map(a => {
        const label = getActionLabel(a.customId);
        return `<div style="margin-bottom: 6px; color: #cbd5e1;">
            <span style="color:#22c55e;">[${a.time}]</span> 
            <strong>${label}</strong> 
            <span style="color:#64748b;">(${a.wallet.slice(0,4)}...${a.wallet.slice(-4)})</span>
            <span style="color:#a78bfa;">→ ${a.status}</span>
        </div>`;
    }).join('');
}

window.triggerControlAction = triggerControlAction;
