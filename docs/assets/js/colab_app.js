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
        { name: 'Builder Fund (Contributors + APIs + Marketing)', share: '10.0%', points: '2,500' },
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
        // Start live chat when tab is opened
        if (window.initCeoChat) window.initCeoChat();
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
