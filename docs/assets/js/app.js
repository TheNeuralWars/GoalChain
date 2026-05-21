document.addEventListener('DOMContentLoaded', () => {
    // ===== REFERRAL CAPTURING =====
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
        localStorage.setItem('goalchain_referrer', ref);
        console.log('Referrer captured:', ref);
    }

    // ===== FALLBACK: Emergency brake for infinite loading =====
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
        document.body.classList.add('loaded');
        console.log("⚠️ Page load finalized by safety timeout.");
    }, 3500);

    // ===== MOBILE MENU =====
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    window.closeMobile = function() {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    };

    // ===== NAV SCROLL =====
    const nav = document.getElementById('mainNav');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('nav-scrolled', window.scrollY > 40);
    });

    // ===== COUNTDOWN TO WORLD CUP 2026 OPENING: June 11, 2026 =====
    const WC_DATE = new Date('2026-06-11T17:00:00-05:00'); // Mexico City time
    function updateCountdown() {
        const now = Date.now();
        const dist = WC_DATE - now;
        const countdownContainer = document.getElementById('countdown');

        if (dist <= 0) {
            if (countdownContainer && !countdownContainer.dataset.kickoff) {
                countdownContainer.dataset.kickoff = "true";
                countdownContainer.style.animation = 'kickoffPulse 1.5s infinite';
                countdownContainer.innerHTML = `
                    <div style="grid-column: span 4; text-align:center; padding:15px; width: 100%;">
                        <span style="font-size:2.2rem; font-weight:900; color:var(--primary); text-shadow:0 0 25px var(--primary);">¡KICK-OFF!</span>
                        <p style="color:var(--secondary); margin-top:8px; font-size:1rem; font-weight: 800;">EL MUNDIAL 2026 YA EMPEZÓ ⚽🔥</p>
                    </div>`;
            }
            return;
        }

        const d = Math.floor(dist / 86400000);
        const h = Math.floor((dist % 86400000) / 3600000);
        const m = Math.floor((dist % 3600000) / 60000);
        const s = Math.floor((dist % 60000) / 1000);

        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minsEl = document.getElementById('minutes');
        const secsEl = document.getElementById('seconds');

        if (daysEl) daysEl.innerText = String(d).padStart(2, '0');
        if (hoursEl) hoursEl.innerText = String(h).padStart(2, '0');
        if (minsEl) minsEl.innerText = String(m).padStart(2, '0');
        if (secsEl) secsEl.innerText = String(s).padStart(2, '0');
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // ===== REVEAL ON SCROLL =====
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

    // ===== ROADMAP DATA =====
    const roadmapData = [
        {
            date: { es: 'ENE — MAR 2026', en: 'JAN — MAR 2026' },
            title_key: 'rm_q1_title', status: 'completed',
            items: [
                { text: { es: 'Concepto y diseño del proyecto GoalChain', en: 'GoalChain project concept and design' }, done: true },
                { text: { es: 'Desarrollo del smart contract en Solana (Anchor)', en: 'Solana smart contract development (Anchor)' }, done: true },
                { text: { es: 'Creación de mini-juego de penaltis (Unity)', en: 'Penalty mini-game creation (Unity)' }, done: true },
                { text: { es: 'Landing page v1 publicada', en: 'Landing page v1 published' }, done: true },
            ]
        },
        {
            date: { es: 'ABR — MAY 2026', en: 'APR — MAY 2026' },
            title_key: 'rm_q2_title', status: 'completed',
            items: [
                { text: { es: 'Migración a Anchor 1.0 y token_interface', en: 'Migration to Anchor 1.0 and token_interface' }, done: true },
                { text: { es: 'Lanzamiento de Infraestructura Social (Discord Oficial)', en: 'Social Infrastructure Launch (Official Discord)' }, done: true },
                { text: { es: 'Oracle de fixtures del Mundial integrado', en: 'World Cup fixture oracle integrated' }, done: true },
                { text: { es: 'Web mejorada con multilenguaje y fixture', en: 'Enhanced web with multilanguage and fixture' }, done: true },
            ]
        },
        {
            date: { es: 'MAY — JUN 2026 (2 semanas)', en: 'MAY — JUN 2026 (2 weeks)' },
            title_key: 'rm_q3_title', status: 'active',
            items: [
                { text: { es: 'Lanzamiento del token $GCH en Solana', en: '$GCH token launch on Solana' }, done: false },
                { text: { es: 'Colección de NFTs GoalChain Genesis', en: 'GoalChain Genesis NFT Collection' }, done: false },
                { text: { es: 'App web completa con wallet y apuestas', en: 'Complete web app with wallet and betting' }, done: false },
                { text: { es: 'Sistema de GoalPoints y airdrop activo', en: 'GoalPoints system and active airdrop' }, done: false },
                { text: { es: 'Deploy en devnet y pruebas públicas', en: 'Devnet deploy and public testing' }, done: false },
            ]
        },
        {
            date: { es: '11 JUN 2026', en: 'JUN 11, 2026' },
            title_key: 'rm_q4_title', status: 'upcoming',
            items: [
                { text: { es: '🚀 Lanzamiento oficial de la app GoalChain', en: '🚀 Official GoalChain app launch' }, done: false },
                { text: { es: 'Apuestas en vivo desde el primer partido del Mundial', en: 'Live betting from the first World Cup match' }, done: false },
                { text: { es: 'Torneos de penaltis con premios en SOL', en: 'Penalty tournaments with SOL prizes' }, done: false },
            ]
        },
        {
            date: { es: 'JUN — JUL 2026', en: 'JUN — JUL 2026' },
            title_key: 'rm_q5_title', status: 'upcoming',
            items: [
                { text: { es: 'Cobertura completa del Mundial 2026 (64 partidos)', en: 'Full World Cup 2026 coverage (64 matches)' }, done: false },
                { text: { es: 'Jackpot comunitario y eventos especiales', en: 'Community jackpot and special events' }, done: false },
                { text: { es: 'Versión PSG1 (PlaySolana) en beta', en: 'PSG1 (PlaySolana) version in beta' }, done: false },
            ]
        },
        {
            date: { es: '2027', en: '2027' },
            title_key: 'rm_q6_title', status: 'upcoming',
            items: [
                { text: { es: 'Modo multijugador 5 vs 5 competitivo', en: '5v5 competitive multiplayer mode' }, done: false },
                { text: { es: 'Expansión a ligas europeas y Champions League', en: 'Expansion to European leagues and Champions League' }, done: false },
                { text: { es: 'Marketplace de NFTs y skins de jugador', en: 'NFT marketplace and player skins' }, done: false },
                { text: { es: 'DAO de gobernanza con holders de $GCH', en: 'Governance DAO with $GCH holders' }, done: false },
            ]
        }
    ];

    function renderRoadmap() {
        const container = document.getElementById('roadmapTimeline');
        container.innerHTML = '';
        roadmapData.forEach((phase, i) => {
            const div = document.createElement('div');
            div.className = `roadmap-item ${phase.status}`;
            const lang = typeof currentLang !== 'undefined' ? currentLang : 'es';
            div.innerHTML = `
                <div class="roadmap-dot"></div>
                <div class="roadmap-date">${phase.date[lang] || phase.date.es}</div>
                <div class="roadmap-card">
                    <h4>${t(phase.title_key)}</h4>
                    <ul>${phase.items.map(it => `<li class="${it.done ? 'done' : ''}">${it.text[lang] || it.text.es}</li>`).join('')}</ul>
                </div>
            `;
            container.appendChild(div);
            setTimeout(() => div.classList.add('visible'), 100 + i * 150);
        });
    }

    // ===== WORLD CUP 2026 GROUPS =====
    const WC_GROUPS = {
        A: [['🇲🇽','México'],['🇿🇦','Sudáfrica'],['🇰🇷','Corea del Sur'],['🇨🇿','Rep. Checa']],
        B: [['🇨🇦','Canadá'],['🇨🇭','Suiza'],['🇶🇦','Catar'],['🇧🇦','Bosnia']],
        C: [['🇧🇷','Brasil'],['🇲🇦','Marruecos'],['🇭🇹','Haití'],['🏴󠁧󠁢󠁳󠁣󠁴󠁿','Escocia']],
        D: [['🇺🇸','Estados Unidos'],['🇵🇾','Paraguay'],['🇦🇺','Australia'],['🇹🇷','Turquía']],
        E: [['🇩🇪','Alemania'],['🇨🇼','Curazao'],['🇨🇮','Costa de Marfil'],['🇪🇨','Ecuador']],
        F: [['🇳🇱','Países Bajos'],['🇯🇵','Japón'],['🇹🇳','Túnez'],['🇸🇪','Suecia']],
        G: [['🇧🇪','Bélgica'],['🇪🇬','Egipto'],['🇮🇷','Irán'],['🇳🇿','Nueva Zelanda']],
        H: [['🇪🇸','España'],['🇨🇻','Cabo Verde'],['🇸🇦','Arabia Saudí'],['🇺🇾','Uruguay']],
        I: [['🇫🇷','Francia'],['🇸🇳','Senegal'],['🇳🇴','Noruega'],['🇮🇶','Irak']],
        J: [['🇦🇷','Argentina'],['🇩🇿','Argelia'],['🇦🇹','Austria'],['🇯🇴','Jordania']],
        K: [['🇵🇹','Portugal'],['🇨🇴','Colombia'],['🇺🇿','Uzbekistán'],['🇨🇩','RD Congo']],
        L: [['🏴󠁧󠁢󠁥󠁮󠁧󠁿','Inglaterra'],['🇭🇷','Croacia'],['🇬🇭','Ghana'],['🇵🇦','Panamá']]
    };

    const WC_GROUPS_EN = {
        A: [['🇲🇽','Mexico'],['🇿🇦','South Africa'],['🇰🇷','South Korea'],['🇨🇿','Czech Republic']],
        B: [['🇨🇦','Canada'],['🇨🇭','Switzerland'],['🇶🇦','Qatar'],['🇧🇦','Bosnia']],
        C: [['🇧🇷','Brazil'],['🇲🇦','Morocco'],['🇭🇹','Haiti'],['🏴󠁧󠁢󠁳󠁣󠁴󠁿','Scotland']],
        D: [['🇺🇸','United States'],['🇵🇾','Paraguay'],['🇦🇺','Australia'],['🇹🇷','Türkiye']],
        E: [['🇩🇪','Germany'],['🇨🇼','Curaçao'],['🇨🇮','Ivory Coast'],['🇪🇨','Ecuador']],
        F: [['🇳🇱','Netherlands'],['🇯🇵','Japan'],['🇹🇳','Tunisia'],['🇸🇪','Sweden']],
        G: [['🇧🇪','Belgium'],['🇪🇬','Egypt'],['🇮🇷','Iran'],['🇳🇿','New Zealand']],
        H: [['🇪🇸','Spain'],['🇨🇻','Cape Verde'],['🇸🇦','Saudi Arabia'],['🇺🇾','Uruguay']],
        I: [['🇫🇷','France'],['🇸🇳','Senegal'],['🇳🇴','Norway'],['🇮🇶','Iraq']],
        J: [['🇦🇷','Argentina'],['🇩🇿','Algeria'],['🇦🇹','Austria'],['🇯🇴','Jordan']],
        K: [['🇵🇹','Portugal'],['🇨🇴','Colombia'],['🇺🇿','Uzbekistan'],['🇨🇩','DR Congo']],
        L: [['🏴󠁧󠁢󠁥󠁮󠁧󠁿','England'],['🇭🇷','Croatia'],['🇬🇭','Ghana'],['🇵🇦','Panama']]
    };

    let activeGroupFilter = 'ALL';

    function renderFixtureTabs() {
        const tabs = document.getElementById('fixtureTabs');
        const groups = ['ALL', ...Object.keys(WC_GROUPS)];
        tabs.innerHTML = groups.map(g => {
            const label = g === 'ALL' ? t('fix_all') : `${t('fix_all') === 'All' ? 'Group' : 'Grupo'} ${g}`;
            return `<button class="fixture-tab ${g === activeGroupFilter ? 'active' : ''}" onclick="filterGroup('${g}')">${label}</button>`;
        }).join('');
    }

    window.filterGroup = function(g) {
        activeGroupFilter = g;
        renderFixtureTabs();
        renderGroups();
    };

    function renderGroups() {
        const grid = document.getElementById('groupGrid');
        const lang = typeof currentLang !== 'undefined' ? currentLang : 'es';
        const groups = lang === 'en' ? WC_GROUPS_EN : WC_GROUPS;
        const keys = activeGroupFilter === 'ALL' ? Object.keys(groups) : [activeGroupFilter];
        grid.innerHTML = keys.map(key => {
            const teams = groups[key];
            return `<div class="group-card reveal visible">
                <div class="group-header">${lang === 'en' ? 'GROUP' : 'GRUPO'} ${key}</div>
                ${teams.map(([flag, name]) => `<div class="group-team"><span class="team-flag">${flag}</span><span>${name}</span></div>`).join('')}
            </div>`;
        }).join('');
    }

    // ===== SOCIAL TASKS =====
    // ===== SOCIAL TASKS =====
    window.renderSocialTasks = function() {
        const grid = document.getElementById('socialGrid');
        if (!grid) return;

        const tasks = [
            { id: 't1', icon: '🐦', bg: '#1DA1F2', pts: 200, title: t('soc_t1_t') || 'Sigue a GoalChain', desc: t('soc_t1_d') || 'Únete a nuestra comunidad en X', link: 'https://twitter.com/intent/follow?screen_name=GoalChainDotFun' },
            { id: 't2', icon: '🔁', bg: '#17bf63', pts: 300, title: t('soc_t2_t') || 'Difunde la Palabra', desc: t('soc_t2_d') || 'Retuitea nuestro post fijado', link: 'https://twitter.com/intent/retweet?tweet_id=2055329044292411708' },
            { id: 't3', icon: '💬', bg: '#5865F2', pts: 250, title: t('soc_t3_t') || 'Discord Oficial', desc: t('soc_t3_d') || 'Entra a nuestro vestuario VIP', link: 'https://discord.gg/nzjHNBfSh' },
            { id: 't4', icon: '📸', bg: '#e4405f', pts: 200, title: t('soc_t4_t') || 'Instagram', desc: t('soc_t4_d') || 'Mira el arte de la Genesis Squad', link: 'https://instagram.com/goalchain.fun' },
            { id: 't5', icon: '🤝', bg: '#9945ff', pts: '100/ref', title: t('soc_t5_t') || 'Invita Amigos', desc: t('soc_t5_d') || 'Copia tu link de referido único', link: 'COPY_REF' },
            { id: 't6', icon: '⚽', bg: '#14f195', pts: 500, title: t('soc_t6_t') || 'Juega Penaltis', desc: t('soc_t6_d') || 'Haz tu primer tiro en el estadio', link: '#gameplay' },
        ];

        const completed = JSON.parse(localStorage.getItem('completed_tasks') || '[]');
        
        grid.innerHTML = tasks.map(task => `
            <div class="social-task ${completed.includes(task.id) ? 'done' : ''}" onclick="handleTask('${task.id}', '${task.link}', '${task.pts}')">
                <div class="social-icon" style="background:${task.bg}20;color:${task.bg};">${task.icon}</div>
                <div class="social-task-info">
                    <h4>${task.title}</h4>
                    <p>${task.desc}</p>
                </div>
                <div class="social-points">${completed.includes(task.id) ? '✅' : '+' + task.pts}</div>
            </div>
        `).join('');
    }

    window.handleTask = function(id, link, pts) {
        const wallet = localStorage.getItem('goalchain_wallet');
        if (!wallet && id !== 't6') {
            const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';
            alert(isEn ? 'Please connect your wallet before completing tasks to secure your points.' : 'Por favor, conecta tu wallet antes de realizar tareas sociales para asegurar tus puntos.');
            return;
        }

        if (link === 'COPY_REF') {
            const refLink = `${window.location.origin}/?ref=${wallet}`;
            navigator.clipboard.writeText(refLink);
            const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';
            alert(isEn ? 'Referral link copied! Share it to earn 100 GoalPoints per friend.' : '¡Enlace de referido copiado! Compártelo para ganar 100 GoalPoints por cada amigo.');
            return;
        }

        if (id === 't6') {
            location.href = link;
            return; // Los puntos de t6 se dan en penalty_game.js al tirar
        }
        
        window.open(link, '_blank');
        
        const completed = JSON.parse(localStorage.getItem('completed_tasks') || '[]');
        if (!completed.includes(id)) {
            completed.push(id);
            localStorage.setItem('completed_tasks', JSON.stringify(completed));
            
            const pointsNum = parseInt(pts);
            if (!isNaN(pointsNum)) {
                let total = parseInt(localStorage.getItem('goalpoints') || '0');
                total += pointsNum;
                localStorage.setItem('goalpoints', total);
                if (window.notifier) {
                    const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';
                    window.notifier.show(
                        isEn ? 'TASK COMPLETED!' : '¡TAREA COMPLETADA!', 
                        isEn ? `You have earned ${pointsNum} GoalPoints. Registered in global leaderboard!` : `Has ganado ${pointsNum} GoalPoints. ¡Registrado en el ranking global!`
                    );
                }
                
                // ☁️ Sincronizar puntos con el servidor de Google Sheets
                if (window.GoalPointsAPI) window.GoalPointsAPI.sync();
            }
            
            renderSocialTasks();
            updateGoalPoints();
        }
    };

    window.updateGoalPoints = function() {
        const pts = localStorage.getItem('goalpoints') || '0';
        const el = document.getElementById('totalPoints');
        if (el) el.innerText = parseInt(pts).toLocaleString();
        
        // Actualizar tier badge según puntos
        const tierEl = document.getElementById('userTierBadge');
        if (tierEl) {
            const p = parseInt(pts);
            let tier = 'COMMON', color = '#8a8a9a';
            if (p >= 10000) { tier = 'MYTHIC';    color = '#ffd700'; }
            else if (p >= 5000)  { tier = 'LEGENDARY'; color = '#a855f7'; }
            else if (p >= 2000)  { tier = 'EPIC';      color = '#00e5ff'; }
            else if (p >= 500)   { tier = 'RARE';      color = '#14f195'; }
            tierEl.innerText = tier;
            tierEl.style.color = color;
            tierEl.style.borderColor = color;
        }

        // Sincronizar Leaderboard
        if (window.updateLiveLeaderboard) window.updateLiveLeaderboard();
        
        // Generar link de referido si hay wallet conectada
        const wallet = localStorage.getItem('goalchain_wallet');
        const refDisplay = document.getElementById('referral-link-display');
        if (wallet && refDisplay) {
            const refLink = `${window.location.origin}/?ref=${wallet}`;
            refDisplay.innerText = refLink;
            refDisplay.style.color = 'var(--primary)';
        }
        
        // ☁️ Si hay wallet, cargar/restaurar puntos desde el servidor (una vez al iniciar)
        if (wallet && window.GoalPointsAPI && !window._gpLoaded) {
            window._gpLoaded = true;
            window.GoalPointsAPI.load(wallet);
        }
    }

    // ===== WHITELIST FORM =====
    const form = document.getElementById('whitelistForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const orig = btn.innerText;
            btn.innerText = currentLang === 'en' ? '✅ REGISTERED!' : '✅ ¡REGISTRADO!';
            btn.style.background = 'var(--secondary)';
            btn.disabled = true;
            setTimeout(() => { form.reset(); btn.innerText = orig; btn.style.background = ''; btn.disabled = false; }, 3000);
        });
    }

    // ===== INITIAL RENDER =====
    renderRoadmap();
    renderFixtureTabs();
    renderGroups();
    renderSocialTasks();
    updateGoalPoints();

    // Re-render on language change
    const origSetLang = window.setLang;
    window.setLang = function(lang) {
        origSetLang(lang);
        renderRoadmap();
        renderFixtureTabs();
        renderGroups();
        renderSocialTasks();
    };
});

// --- Whitelist Logic ---
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxYeoWdEQl-zksyL71U2ksAGWNfphWYzvs7Hyd8jx7I_rYjS-CZwL06iE0jsKVqmnVmCQ/exec';

const wlForm = document.getElementById('whitelistForm');
if(wlForm) {
    wlForm.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = wlForm.querySelector('button');
        
        // Use translate keys or generic text
        const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';
        submitBtn.innerText = isEn ? 'SENDING...' : 'ENVIANDO...';
        submitBtn.disabled = true;

        const emailInput = wlForm.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value : '';
        const wallet = localStorage.getItem('goalchain_wallet') || '';

        const data = {
            email: email,
            wallet: wallet,
            interest: 'Web Whitelist',
            referrer: localStorage.getItem('goalchain_referrer') || ''
        };

        try {
            await fetch(GOOGLE_SHEET_URL, {
                method: 'POST',
                mode: 'no-cors',
                cache: 'no-cache',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            // Show success message
            wlForm.innerHTML = `<div style="text-align:center;color:var(--primary);padding:20px;font-weight:bold;">
                ${isEn ? '🎉 Registration Successful!' : '🎉 ¡Registro Exitoso!'}
            </div>`;

        } catch (error) {
            console.error('Error:', error);
            alert(isEn ? 'There was a problem. Please try again.' : 'Hubo un problema. Inténtalo de nuevo.');
            submitBtn.disabled = false;
            submitBtn.innerText = isEn ? 'Join the Whitelist' : 'Anotarme en la Whitelist';
        }
    }
}

// --- Horizontal Carousel Scrolling ---
window.scrollCarousel = function(containerId, direction) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Calcula la cantidad de scroll basada en el ancho del primer hijo, o por defecto 320px
    const firstChild = container.firstElementChild ? container.firstElementChild.firstElementChild || container.firstElementChild : null;
    let scrollAmount = 320; 
    if (firstChild && firstChild.offsetWidth) {
        scrollAmount = firstChild.offsetWidth + 16; // ancho + gap aproximado
    }
    
    container.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
};

// --- Dynamic Glare Effect on Scroll ---
const nftContainer = document.getElementById('nftTrackContainer');
if (nftContainer) {
    nftContainer.addEventListener('scroll', () => {
        const cards = nftContainer.querySelectorAll('.nft-card-3d');
        const containerRect = nftContainer.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;

        cards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const distanceFromCenter = cardCenter - containerCenter;
            
            // Calculamos el desplazamiento del brillo (glare)
            const glare = card.querySelector('.glare');
            if (glare) {
                const moveX = (distanceFromCenter / containerRect.width) * 100;
                glare.style.background = `linear-gradient(${135 + (moveX / 2)}deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)`;
                glare.style.transform = `translateX(${moveX}px)`;
            }
        });
    });
}
