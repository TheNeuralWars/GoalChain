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
    ]
};

function initColabApp() {
    renderNotes();
    renderInfluencers();
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

// --- INFLUENCER LOGIC ---
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
