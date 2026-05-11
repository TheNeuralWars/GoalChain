document.addEventListener('DOMContentLoaded', () => {

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
        if (dist <= 0) {
            document.getElementById('days').innerText = '🔥';
            document.getElementById('hours').innerText = '00';
            document.getElementById('minutes').innerText = '00';
            document.getElementById('seconds').innerText = '00';
            return;
        }
        const d = Math.floor(dist / 86400000);
        const h = Math.floor((dist % 86400000) / 3600000);
        const m = Math.floor((dist % 3600000) / 60000);
        const s = Math.floor((dist % 60000) / 1000);
        document.getElementById('days').innerText = String(d).padStart(2, '0');
        document.getElementById('hours').innerText = String(h).padStart(2, '0');
        document.getElementById('minutes').innerText = String(m).padStart(2, '0');
        document.getElementById('seconds').innerText = String(s).padStart(2, '0');
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
                { text: { es: 'Sistema de apuestas con pools dinámicos (5-2-3 split)', en: 'Betting system with dynamic pools (5-2-3 split)' }, done: true },
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
    function renderSocialTasks() {
        const grid = document.getElementById('socialGrid');
        const tasks = [
            { icon: '🐦', bg: '#1DA1F2', pts: 200, title: t('soc_t1_t'), desc: t('soc_t1_d'), action: 'follow' },
            { icon: '🔁', bg: '#17bf63', pts: 300, title: t('soc_t2_t'), desc: t('soc_t2_d'), action: 'retweet' },
            { icon: '💬', bg: '#5865F2', pts: 250, title: t('soc_t3_t'), desc: t('soc_t3_d'), action: 'discord' },
            { icon: '✈️', bg: '#0088cc', pts: 200, title: t('soc_t4_t'), desc: t('soc_t4_d'), action: 'telegram' },
            { icon: '🤝', bg: '#9945ff', pts: '100/ref', title: t('soc_t5_t'), desc: t('soc_t5_d'), action: 'referral' },
            { icon: '⚽', bg: '#14f195', pts: 500, title: t('soc_t6_t'), desc: t('soc_t6_d'), action: 'game' },
        ];
        grid.innerHTML = tasks.map(task => `
            <div class="social-task">
                <div class="social-icon" style="background:${task.bg}20;color:${task.bg};">${task.icon}</div>
                <div class="social-task-info">
                    <h4>${task.title}</h4>
                    <p>${task.desc}</p>
                </div>
                <div class="social-points">+${task.pts}</div>
            </div>
        `).join('');
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
