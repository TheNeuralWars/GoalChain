// ===== GoalChain i18n - Spanish / English =====
const TRANSLATIONS = {
    es: {
        nav_about: "Sobre", nav_game: "Mini-Juego", nav_fixture: "Fixture", nav_roadmap: "Roadmap", nav_social: "Social",
        nav_wallet: "Conectar Wallet",
        hero_badge: "FIFA WORLD CUP 2026 — YA CASI AQUÍ",
        hero_title: "Domina el Campo.<br><span style='background: linear-gradient(90deg, #14f195, #9945ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'>Gana en Solana.</span>",
        hero_sub: "Eres el agente de las leyendas. Apuesta en vivo, juega penaltis con recompensas reales y cobra sueldos del Mundial 2026. El fútbol ya nunca será igual.",
        hero_btn_app: "ABRIR DASHBOARD",
        hero_play: "Jugar Penaltis YA",
        hero_hype_label: "HYPE GLOBAL",
        hero_hype_agents: "Agentes conectados",
        cd_days: "DÍAS", cd_hours: "HORAS", cd_min: "MIN", cd_sec: "SEG",
        
        ticker_match: "⚽ ARG 2-1 FRA • ",
        ticker_live: "EN VIVO",
        ticker_next_match: "Próximo: BRA vs POR • 18:00",
        carousel_hint_generic: "← Desliza para explorar →",
        
        pitch_title: "El Fútbol ha Evolucionado",
        pitch_sub: "No es solo un juego. Es un ecosistema completo donde tu conocimiento se convierte en recompensas reales en Solana.",
        pitch_feat1_t: "Mercados Predictivos", pitch_feat1_d: "Apuestas parimutuel descentralizadas en cada partido del Mundial 2026. <br><br> <b>Cuotas orgánicas</b> y pagos automatizados por smart contracts.",
        pitch_feat2_t: "Economía Real", pitch_feat2_d: "Modelo deflacionario real. <br><br> El <b>10% de cada apuesta</b> se retira para alimentar el Jackpot Comunitario y el tesoro.",
        pitch_feat3_t: "Cromos 3D", pitch_feat3_d: "100 leyendas Genesis Squad. <br><br> Cada NFT genera <b>Yield diario</b> y dividendos basados en el rendimiento real del jugador.",
        pitch_feat4_t: "Minijuegos PvP", pitch_feat4_d: "Acción inmediata. <br><br> Reta a la comunidad en el <b>Minijuego de Penaltis</b> o forma tu equipo 5v5 para torneos.",
        pitch_feat5_t: "100% On-Chain", pitch_feat5_d: "Transparencia Total. <br><br> Lógica en <b>Rust/Anchor</b>. Sin servidores ocultos manipulando resultados ni cuotas.",
        
        game_title: "Mini-Juego de Penaltis", 
        game_sub: "Prueba la mecánica de tiro diseñada para la PSG1 directamente desde tu navegador. Toca una zona del arco para patear.",
        game_daily_title: "DESAFÍO DIARIO:",
        game_daily_desc: "5 goles seguidos hoy",
        game_daily_reward: "Recompensa extra:",
        game_bet_label: "APUESTA POR TIRO:",
        game_bag_label: "TU BOLSA:",
        game_share_btn: "COMPARTIR EN 𝕏 ⚽",
        game_how_title: "¿Cómo Funciona?",
        game_step1: "Elige una zona del arco para disparar",
        game_step2: "El arquero se lanza a una posición aleatoria",
        game_step3: "Acumula goles y mejora tu racha",
        game_step4: "En el lanzamiento, tus rachas valdrán puntos reales",
        game_soon_title: "🎮 Próximamente",
        game_soon_desc: "Modo multijugador 5v5, torneos con premios en SOL y apuestas integradas durante los partidos del Mundial.",
        stat_goals: "GOLES", stat_saves: "ATAJADAS", stat_streak: "RACHA",
        
        fix_title: "Fixture — Mundial 2026",
        fix_sub: "48 selecciones, 12 grupos. Toda la acción del torneo integrada en GoalChain para apuestas en tiempo real.",
        fix_all: "Todos",
        
        rm_title: "Hoja de Ruta",
        rm_sub: "Desliza horizontalmente para ver nuestro plan de desarrollo.",
        
        econ_badge: "ECONOMÍA SOSTENIBLE",
        econ_title: "Tokenomics 2.0",
        econ_sub: "Un ecosistema diseñado para durar. Transparente, circular y rentable.",
        econ_flow_title: "FLUJO ECONÓMICO:",
        econ_flow_desc: "Apostadores → Pools Parimutuel (Solana) → 90% Ganadores / 10% Comisiones <br> Distribución → 40% Jackpot 🏆 / 30% Infinity Buy-back (Yield SOL/BTC) 🔥 / 30% Desarrollo 🛠️",
        econ_feat1_t: "Emisión Controlada", econ_feat1_d: "Sí, el token es inflacionario para recompensar la participación (Yield de NFTs y premios). Esta emisión incentiva la entrada constante de nuevos usuarios al ecosistema.",
        econ_feat2_t: "Quema Deflacionaria", econ_feat2_d: "El 10% de CADA APUESTA se quema o va al Jackpot. Mientras más juegue la comunidad, mayor es la reducción de liquidez circulante, contrarrestando la inflación.",
        econ_feat3_t: "Sumideros de Mantenimiento", econ_feat3_d: "Los NFTs 'Genesis' se cansan. Los usuarios DEBEN gastar tokens para recuperar la energía (stamina) de sus jugadores si quieren seguir cobrando recompensas.",
        econ_feat4_t: "El Equilibrio Perfecto", econ_feat4_d: "La inflación atrae capital nuevo. El juego incentiva el gasto constante. El resultado es una economía circular donde el valor del token se sostiene por la utilidad real.",
        
        pack_badge: "MARKETPLACE",
        pack_title: "Abre tus Sobres Genesis",
        pack_sub: "Prueba tu suerte y consigue a los capitanes del Mundial 2026.",
        pack_open_btn: "ABRIR SOBRE MYSTERY PACK",
        pack_sim: "Simulador oficial • 100% gratis",
        pack_opening: "¡ABRIENDO SOBRE...",
        pack_reveal_btn: "REVELAR CARTA",
        pack_congrats: "¡FELICIDADES!",
        pack_obtained: "Obtuviste:",
        pack_real_version: "(En la versión real esto mintaría en Solana)",
        
        nft_badge: "COLECCIÓN GENESIS",
        nft_title: "Genesis Squad NFT Collection",
        nft_desc: "Explora los 1,248 cracks del Mundial. Desliza horizontalmente la galería 3D.",
        nft_dream_title: "Arma tu Dream XI",
        nft_dream_yield: "Yield estimado:",
        nft_filter_all: "Todos",
        nft_search_ph: "Buscar jugador...",
        nft_sort_id_asc: "Número (Bajo-Alto)",
        nft_sort_id_desc: "Número (Alto-Bajo)",
        nft_sort_rarity: "Más Raros Primero",
        nft_sort_atk: "Mejor Ataque",
        nft_sort_def: "Mejor Defensa",
        nft_favs: "❤️ Favoritos",
        nft_pos_all: "TODOS",
        nft_pos_gk: "PORTEROS",
        nft_pos_def: "DEFENSAS",
        nft_pos_mid: "MEDIOS",
        nft_pos_fwd: "DELANTEROS",
        nft_sync: "Iniciando Sincronización con la Blockchain...",
        nft_btn: "UNIRSE A LA WHITELIST",
        
        soc_title: "Gana GoalPoints",
        soc_sub: "Completa tareas sociales para acumular puntos antes del lanzamiento. Los puntos se convertirán en tokens $GCH en el airdrop oficial.",
        soc_your_pts: "TUS GOALPOINTS",
        soc_connect_info: "Conecta tu wallet para comenzar",
        soc_ref_label: "Tu enlace de referidos:",
        soc_ref_placeholder: "Conecta tu wallet para generar...",
        soc_t1_t: "Seguir en X (Twitter)", soc_t1_d: "Síguenos en @GoalChainDotFun",
        soc_t2_t: "Compartir Tweet", soc_t2_d: "Comparte nuestro tweet fijado",
        soc_t3_t: "Unirse a Discord", soc_t3_d: "Únete a la comunidad",
        soc_t4_t: "Sigue en Instagram", soc_t4_d: "Nuestro perfil oficial",
        soc_t5_t: "Invitar Amigos", soc_t5_d: "100 pts por cada referido",
        soc_t6_t: "Jugar Mini-Juego", soc_t6_d: "Pon a prueba tu puntería",
        
        team_title: "El Equipo",
        team_sub: "Tres hermanos, una pasión: el fútbol y la blockchain.",
        team1_name: "Nico Pez", team1_role: "The Mastermind - Visionario & Fundador. Recorrido blockchain desde 2016. Artista, matemático y padre.",
        team2_name: "Lucas Bello", team2_role: "The Artist - Incansable geek, control de estética y pruebas de estrés para un sistema indestructible.",
        team3_name: "Lara Lo Beluzzo", team3_role: "Senior Dev - El ojo agudo. Experta técnica que asegura la perfección en cada línea de código.",
        
        wl_title: "Únete a la Revolución",
        wl_sub: "Regístrate para recibir acceso anticipado y beneficios exclusivos.",
        wl_email: "Conecta tu wallet para unirte...",
        wl_btn: "Anotarme en la Whitelist",
        wl_note: "Tu wallet será tu identidad. Integración con Phantom.",
        
        cta_title: "¿Listo para el Kick-Off?",
        cta_sub: "El Mundial 2026 se acerca. No te quedes fuera.",
        cta_share: "Compartir en X (Twitter)",
        
        trust_title: "Respaldado por los Mejores",
        trust_sub: "Seguridad institucional y liquidez global para el futuro del fútbol.",
        trust_discord: "Discord DAO",
        trust_twitter: "𝕏 Twitter Oficial",
        trust_instagram: "📸 Instagram",
        trust_audit: "AUDITORÍA Y COMUNIDAD",
        
        footer_built: "Desarrollado en Solana",
        footer_colabs: "Portal Colaboradores",
        
        cookies_text: "Utilizamos cookies para asegurar que GoalChain funcione correctamente y para analizar el tráfico. Al continuar, aceptas nuestra política de privacidad.",
        cookies_btn: "Aceptar",
        
        alpha_title: "ACCESO ALPHA - MODO DEMO",
        alpha_sub: "Estás entrando en una demostración técnica de <b>GoalChain Ecosystem</b>.<br><br>Las funcionalidades de <b>Trading (Drift)</b>, <b>Finanzas (Lending)</b> y <b>Cantera (cNFTs)</b> están en modo SIMULACIÓN para pruebas de arquitectura.<br><br><span style='color:white; font-weight:bold;'>No se requiere ni se utiliza capital real en esta fase.</span>",
        alpha_back: "VOLVER",
        alpha_enter: "ENTRAR AL ECOSISTEMA",
        
        rm_q1_title: "Q1 - Concepción",
        rm_q2_title: "Q2 - Infraestructura",
        rm_q3_title: "Q3 - Pre-Lanzamiento",
        rm_q4_title: "Q4 - Lanzamiento",
        rm_q5_title: "Mundial 2026",
        rm_q6_title: "Post-Mundial",
    },
    en: {
        nav_about: "About", nav_game: "Mini-Game", nav_fixture: "Fixture", nav_roadmap: "Roadmap", nav_social: "Social",
        nav_wallet: "Connect Wallet",
        hero_badge: "FIFA WORLD CUP 2026 — ALMOST HERE",
        hero_title: "Own the Pitch.<br><span style='background: linear-gradient(90deg, #14f195, #9945ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'>Win on Solana.</span>",
        hero_sub: "You are the legends' agent. Bet live, play penalty shootouts with real rewards, and earn World Cup 2026 salaries. Football will never be the same.",
        hero_btn_app: "OPEN DASHBOARD",
        hero_play: "Play Penalties NOW",
        hero_hype_label: "GLOBAL HYPE",
        hero_hype_agents: "Agents connected",
        cd_days: "DAYS", cd_hours: "HOURS", cd_min: "MIN", cd_sec: "SEC",
        
        ticker_match: "⚽ ARG 2-1 FRA • ",
        ticker_live: "LIVE",
        ticker_next_match: "Next: BRA vs POR • 18:00",
        carousel_hint_generic: "← Swipe to explore →",
        
        pitch_title: "Football has Evolved",
        pitch_sub: "It's not just a game. It's a complete ecosystem where your knowledge turns into real rewards on Solana.",
        pitch_feat1_t: "Predictive Markets", pitch_feat1_d: "Decentralized parimutuel betting on every World Cup 2026 match. <br><br> <b>Organic Odds</b> and automated payouts by smart contracts.",
        pitch_feat2_t: "Real Economy", pitch_feat2_d: "Real deflationary model. <br><br> <b>10% of every bet</b> is removed to fuel the Community Jackpot and treasury.",
        pitch_feat3_t: "3D Cards", pitch_feat3_d: "100 Genesis Squad legends. <br><br> Each NFT generates <b>Daily Yield</b> and dividends based on real player performance.",
        pitch_feat4_t: "PvP Minigames", pitch_feat4_d: "Immediate action. <br><br> Challenge the community in the <b>Penalty Minigame</b> or build your 5v5 team for tournaments.",
        pitch_feat5_t: "100% On-Chain", pitch_feat5_d: "Total Transparency. <br><br> Logic in <b>Rust/Anchor</b>. No hidden servers manipulating results or odds.",
        
        game_title: "Penalty Mini-Game", 
        game_sub: "Test the shooting mechanics designed for PSG1 directly from your browser. Tap a zone on the goal to kick.",
        game_daily_title: "DAILY CHALLENGE:",
        game_daily_desc: "5 goals in a row today",
        game_daily_reward: "Extra reward:",
        game_bet_label: "BET PER SHOT:",
        game_bag_label: "YOUR BAG:",
        game_share_btn: "SHARE ON 𝕏 ⚽",
        game_how_title: "How It Works",
        game_step1: "Choose a goal zone to shoot at",
        game_step2: "The goalkeeper dives to a random position",
        game_step3: "Score goals and build your streak",
        game_step4: "At launch, your streaks will be worth real points",
        game_soon_title: "🎮 Coming Soon",
        game_soon_desc: "5v5 multiplayer mode, tournaments with SOL prizes, and integrated betting during World Cup matches.",
        stat_goals: "GOALS", stat_saves: "SAVES", stat_streak: "STREAK",
        
        fix_title: "Fixture — World Cup 2026",
        fix_sub: "48 teams, 12 groups. All tournament action integrated into GoalChain for real-time betting.",
        fix_all: "All",
        
        rm_title: "Roadmap",
        rm_sub: "Swipe horizontally to see our development plan.",
        
        econ_badge: "SUSTAINABLE ECONOMY",
        econ_title: "Tokenomics 2.0",
        econ_sub: "An ecosystem designed to last. Transparent, circular, and profitable.",
        econ_flow_title: "ECONOMIC FLOW:",
        econ_flow_desc: "Bettors → Parimutuel Pools (Solana) → 90% Winners / 10% Fees <br> Distribution → 40% Jackpot 🏆 / 30% Infinity Buy-back (SOL/BTC Yield) 🔥 / 30% Development 🛠️",
        econ_feat1_t: "Controlled Emission", econ_feat1_d: "Yes, the token is inflationary to reward participation (NFT Yield and prizes). This emission encourages constant entry of new users into the ecosystem.",
        econ_feat2_t: "Deflationary Burn", econ_feat2_d: "10% of EVERY BET is burned or goes to the Jackpot. The more the community plays, the greater the reduction in circulating liquidity, countering inflation.",
        econ_feat3_t: "Maintenance Sinks", econ_feat3_d: "Genesis NFTs get tired. Users MUST spend tokens to recover their players' energy (stamina) if they want to continue collecting rewards.",
        econ_feat4_t: "The Perfect Balance", econ_feat4_d: "Inflation attracts new capital. The game encourages constant spending. The result is a circular economy where token value is sustained by real utility.",
        
        pack_badge: "MARKETPLACE",
        pack_title: "Open Your Genesis Packs",
        pack_sub: "Try your luck and get the World Cup 2026 captains.",
        pack_open_btn: "OPEN MYSTERY PACK",
        pack_sim: "Official Simulator • 100% free",
        pack_opening: "OPENING PACK...",
        pack_reveal_btn: "REVEAL CARD",
        pack_congrats: "CONGRATULATIONS!",
        pack_obtained: "You got:",
        pack_real_version: "(In the real version this would mint on Solana)",
        
        nft_badge: "GENESIS COLLECTION",
        nft_title: "Genesis Squad NFT Collection",
        nft_desc: "Explore the 1,248 stars of the World Cup. Swipe horizontally through the 3D gallery.",
        nft_dream_title: "Build your Dream XI",
        nft_dream_yield: "Estimated Yield:",
        nft_filter_all: "All",
        nft_search_ph: "Search player...",
        nft_sort_id_asc: "Number (Low-High)",
        nft_sort_id_desc: "Number (High-Low)",
        nft_sort_rarity: "Rarest First",
        nft_sort_atk: "Best Attack",
        nft_sort_def: "Best Defense",
        nft_favs: "❤️ Favorites",
        nft_pos_all: "ALL",
        nft_pos_gk: "KEEPERS",
        nft_pos_def: "DEFENDERS",
        nft_pos_mid: "MIDFIELDERS",
        nft_pos_fwd: "FORWARDS",
        nft_sync: "Starting Blockchain Sync...",
        nft_btn: "JOIN THE WHITELIST",
        
        soc_title: "Earn GoalPoints",
        soc_sub: "Complete social tasks to accumulate points before launch. Points will be converted into $GCH tokens in the official airdrop.",
        soc_your_pts: "YOUR GOALPOINTS",
        soc_connect_info: "Connect your wallet to start",
        soc_ref_label: "Your referral link:",
        soc_ref_placeholder: "Connect your wallet to generate...",
        soc_t1_t: "Follow on X (Twitter)", soc_t1_d: "Follow us @GoalChainDotFun",
        soc_t2_t: "Share Tweet", soc_t2_d: "Share our pinned tweet",
        soc_t3_t: "Join Discord", soc_t3_d: "Join the community",
        soc_t4_t: "Follow on Instagram", soc_t4_d: "Our official profile",
        soc_t5_t: "Invite Friends", soc_t5_d: "100 pts per referral",
        soc_t6_t: "Play Mini-Game", soc_t6_d: "Test your aim",
        
        team_title: "The Team",
        team_sub: "Three brothers, one passion: football and blockchain.",
        team1_name: "Nico Pez", team1_role: "The Mastermind - Visionary & Founder. Blockchain journey since 2016. Artist, mathematician, and father.",
        team2_name: "Lucas Bello", team2_role: "The Artist - Tireless geek, aesthetic control and stress testing for an indestructible system.",
        team3_name: "Lara Lo Beluzzo", team3_role: "Senior Dev - The sharp eye. Technical expert ensuring perfection in every line of code.",
        
        wl_title: "Join the Revolution",
        wl_sub: "Register for early access and exclusive benefits.",
        wl_email: "Connect your wallet to join...",
        wl_btn: "Join the Whitelist",
        wl_note: "Your wallet will be your identity. Phantom integration.",
        
        cta_title: "Ready for Kick-Off?",
        cta_sub: "The 2026 World Cup is approaching. Don't be left out.",
        cta_share: "Share on X (Twitter)",
        
        trust_title: "Backed by the Best",
        trust_sub: "Institutional security and global liquidity for the future of football.",
        trust_discord: "Discord DAO",
        trust_twitter: "𝕏 Official Twitter",
        trust_instagram: "📸 Instagram",
        trust_audit: "AUDIT & COMMUNITY",
        
        footer_built: "Developed on Solana",
        footer_colabs: "Collabs Portal",
        
        cookies_text: "We use cookies to ensure GoalChain works correctly and to analyze traffic. By continuing, you accept our privacy policy.",
        cookies_btn: "Accept",
        
        alpha_title: "ALPHA ACCESS - DEMO MODE",
        alpha_sub: "You are entering a technical demonstration of the <b>GoalChain Ecosystem</b>.<br><br><b>Trading (Drift)</b>, <b>Finance (Lending)</b>, and <b>Academy (cNFTs)</b> features are in SIMULATION mode for architecture testing.<br><br><span style='color:white; font-weight:bold;'>No real capital is required or used in this phase.</span>",
        alpha_back: "BACK",
        alpha_enter: "ENTER ECOSYSTEM",
        
        rm_q1_title: "Q1 - Conception",
        rm_q2_title: "Q2 - Infrastructure",
        rm_q3_title: "Q3 - Pre-Launch",
        rm_q4_title: "Q4 - Launch",
        rm_q5_title: "World Cup 2026",
        rm_q6_title: "Post-World Cup",
    }
};

let currentLang = localStorage.getItem('gc_lang') || 'es';

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('gc_lang', lang);
    const btnEs = document.getElementById('langEs');
    const btnEn = document.getElementById('langEn');
    if(btnEs) btnEs.classList.toggle('active', lang === 'es');
    if(btnEn) btnEn.classList.toggle('active', lang === 'en');
    document.documentElement.lang = lang;
    applyTranslations();
}

function t(key) {
    return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) || key;
}

function applyTranslations() {
    const dict = TRANSLATIONS[currentLang];
    if (!dict) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (dict[key]) el.innerHTML = dict[key];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (dict[key]) el.placeholder = dict[key];
    });
}

// Apply on load
document.addEventListener('DOMContentLoaded', () => {
    setLang(currentLang);
});
