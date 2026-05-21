const USERS = ['Nico', 'Hermano 1', 'Hermano 2'];
const DAILY_TASKS = [
    { id: 'reel1', label: 'Publicar Reel #1 (Gameplay)', pts: 50 },
    { id: 'reel2', label: 'Publicar Reel #2 (Viral)', pts: 50 },
    { id: 'story1', label: 'Historia IG/X #1', pts: 20 },
    { id: 'story2', label: 'Historia IG/X #2', pts: 20 },
    { id: 'x_post', label: 'Post en X (Alpha Leak/Thread)', pts: 30 },
    { id: 'discord', label: 'Engagement Discord (30 min)', pts: 40 }
];

const MILESTONES = [
    { id: 'token_launch', label: 'Lanzamiento Token $GCH', pts: 500 },
    { id: 'nft_art', label: 'Arte Final Colección NFT', pts: 300 },
    { id: 'bet_contract', label: 'Smart Contract Apuestas (Mainnet)', pts: 400 },
    { id: 'unity_build', label: 'Beta 1.0 Unity Client', pts: 400 },
    { id: 'marketing_push', label: 'Campaña Influencers Cerrada', pts: 300 }
];

let state = {
    currentUser: 'Nico',
    points: { 'Nico': 0, 'Hermano 1': 0, 'Hermano 2': 0 },
    completedDaily: {}, // format: { '2026-05-11': { 'Nico': ['reel1'] } }
    completedMilestones: [],
    logs: []
};

function init() {
    const saved = localStorage.getItem('goalchain_hub_state');
    if (saved) state = JSON.parse(saved);
    render();
    setupTimer();
}

function save() {
    localStorage.setItem('goalchain_hub_state', JSON.stringify(state));
    render();
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

function selectUser(user) {
    state.currentUser = user;
    save();
}

function completeDaily(taskId) {
    const today = getToday();
    if (!state.completedDaily[today]) state.completedDaily[today] = {};
    if (!state.completedDaily[today][state.currentUser]) state.completedDaily[today][state.currentUser] = [];
    
    if (state.completedDaily[today][state.currentUser].includes(taskId)) return;

    const task = DAILY_TASKS.find(t => t.id === taskId);
    state.completedDaily[today][state.currentUser].push(taskId);
    state.points[state.currentUser] += task.pts;
    
    state.logs.unshift({
        user: state.currentUser,
        action: `Completó tarea diaria: ${task.label}`,
        pts: task.pts,
        time: new Date().toLocaleTimeString()
    });
    
    save();
}

function completeMilestone(msId) {
    if (state.completedMilestones.find(m => m.id === msId)) return;
    
    const ms = MILESTONES.find(m => m.id === msId);
    state.completedMilestones.push({ id: msId, user: state.currentUser });
    state.points[state.currentUser] += ms.pts;
    
    state.logs.unshift({
        user: state.currentUser,
        action: `HITO ALCANZADO: ${ms.label}`,
        pts: ms.pts,
        time: new Date().toLocaleTimeString()
    });
    
    save();
}

function render() {
    // Render user buttons
    const userContainer = document.getElementById('userSelector');
    userContainer.innerHTML = USERS.map(u => `
        <button class="user-btn ${state.currentUser === u ? 'active' : ''}" onclick="selectUser('${u}')">${u}</button>
    `).join('');

    // Render stats
    const totalPoints = Object.values(state.points).reduce((a, b) => a + b, 0);
    const statsContainer = document.getElementById('statsGrid');
    statsContainer.innerHTML = USERS.map(u => {
        const pts = state.points[u];
        const share = totalPoints > 0 ? ((pts / totalPoints) * 100).toFixed(1) : 0;
        return `
            <div class="stat-card">
                <div class="name">${u}</div>
                <div class="points">${pts} <small style="font-size:0.5em">PTS</small></div>
                <div class="share">${share}% DE EQUITY</div>
            </div>
        `;
    }).join('');

    // Render Daily Tasks
    const today = getToday();
    const userDoneToday = (state.completedDaily[today] && state.completedDaily[today][state.currentUser]) || [];
    const dailyContainer = document.getElementById('dailyTasks');
    dailyContainer.innerHTML = DAILY_TASKS.map(t => {
        const isDone = userDoneToday.includes(t.id);
        return `
            <li class="task-item">
                <div class="task-info">
                    <span class="task-points">+${t.pts}</span>
                    <span>${t.label}</span>
                </div>
                <button class="action-btn" ${isDone ? 'disabled' : ''} onclick="completeDaily('${t.id}')">
                    ${isDone ? 'HECHO ✓' : 'COMPLETAR'}
                </button>
            </li>
        `;
    }).join('');

    // Render Milestones
    const msContainer = document.getElementById('milestones');
    msContainer.innerHTML = MILESTONES.map(m => {
        const completion = state.completedMilestones.find(c => c.id === m.id);
        return `
            <li class="task-item" style="${completion ? 'opacity: 0.6' : ''}">
                <div class="task-info">
                    <span class="task-points" style="background:var(--secondary)">+${m.pts}</span>
                    <span>${m.label} ${completion ? `<br><small style="color:var(--primary)">Por: ${completion.user}</small>` : ''}</span>
                </div>
                ${!completion ? `<button class="action-btn" onclick="completeMilestone('${m.id}')">RECLAMAR</button>` : '🚩'}
            </li>
        `;
    }).join('');

    // Render Logs
    const logContainer = document.getElementById('logList');
    logContainer.innerHTML = state.logs.slice(0, 20).map(l => `
        <div class="log-item">
            <div>
                <span class="log-user">${l.user}</span> ${l.action}
            </div>
            <div style="text-align:right">
                <div style="color:var(--primary)">+${l.pts}</div>
                <div class="log-time">${l.time}</div>
            </div>
        </div>
    `).join('');
}

function setupTimer() {
    setInterval(() => {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const diff = tomorrow - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        document.getElementById('resetTimer').innerText = `REINICIO DIARIO EN: ${h}h ${m}m ${s}s`;
    }, 1000);
}

document.addEventListener('DOMContentLoaded', init);
window.selectUser = selectUser;
window.completeDaily = completeDaily;
window.completeMilestone = completeMilestone;
