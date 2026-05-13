// ===== GoalChain i18n - Spanish / English =====
const TRANSLATIONS = {
    es: {
        nav_about: "Sobre", nav_game: "Mini-Juego", nav_fixture: "Fixture", nav_roadmap: "Roadmap", nav_social: "Social",
        nav_wallet: "Conectar Wallet",
        hero_badge: "FIFA WORLD CUP 2026 — PRÓXIMAMENTE",
        hero_title: "Domina el Campo.<br>Gana en Solana.",
        hero_sub: "GoalChain es la primera plataforma de fútbol Play-to-Earn en Solana. Apuesta en vivo en el Mundial 2026, juega mini-juegos de penaltis y gana tokens $GCH.",
        cd_days: "DÍAS", cd_hours: "HORAS", cd_min: "MIN", cd_sec: "SEG",
        hero_play: "Jugar Ahora",
        pitch_title: "Nuestra Visión: El Futuro del Fútbol",
        pitch_sub: "Dominar el deporte más grande del mundo mediante la descentralización. GoalChain es la infraestructura definitiva para el fanático del fútbol del siglo XXI.",
        feat1_t: "Apuestas en Vivo", feat1_d: "Apuesta en tiempo real en los partidos del Mundial 2026. Cuotas dinámicas impulsadas por smart contracts en Solana.",
        feat2_t: "Play-to-Earn", feat2_d: "Compite en mini-juegos de penaltis y torneos globales. Gana tokens $GCH y NFTs exclusivos.",
        feat3_t: "100% On-Chain", feat3_d: "Toda la lógica de apuestas y recompensas vive en la blockchain de Solana. Transparencia total, sin intermediarios.",
        pitch_feat1_t: "Mercados Predictivos", pitch_feat1_d: "Apuestas parimutuel descentralizadas en cada partido del Mundial 2026. <br><br><b>Transparencia Total:</b> Las cuotas son orgánicas, calculadas en tiempo real por el volumen de la pool. Sin manipulaciones externas, con pagos automatizados garantizados por la red de Solana.",
        pitch_feat2_t: "Infinity Burn", pitch_feat2_d: "Modelo de sostenibilidad perpetua. <br><br><b>Flujo Circular:</b> El 30% de los ingresos se bloquea en contratos inamovibles que generan yield mediante <b>LST (Jito/Marinade)</b>. Solo el interés generado se usa para recomprar $GCH, protegiendo el capital principal para siempre.",
        pitch_feat3_t: "Cromos 3D", pitch_feat3_d: "1,248 leyendas únicas de la Genesis Squad listas para el juego. <br><br><b>Activos Productivos:</b> Cada NFT genera Yield diario financiado por el tesoro. Evoluciona a tus jugadores y mejora sus estadísticas mediante la participación activa.",
        pitch_feat4_t: "Minijuegos PvP", pitch_feat4_d: "Acción inmediata sin esperas. Reta a la comunidad global en cualquier momento. <br><br><b>Competición:</b> Domina el Minijuego de Penaltis o forma tu equipo 5v5 para torneos exclusivos con premios masivos para los mejores del ranking.",
        pitch_feat5_t: "Seguridad Inmutable", pitch_feat5_d: "Protocolo autónomo. Toda la lógica reside en el smart contract con autoridad revocada. <br><br><b>Verificabilidad:</b> Sin servidores ocultos. Los oráculos de datos deportivos alimentan los resultados, asegurando un entorno de juego justo e inalterable.",
        econ_badge: "ECONOMÍA SOSTENIBLE",
        econ_sub: "Un ecosistema diseñado para durar. Transparente, circular y rentable.",
        econ_flow_title: "FLUJO ECONÓMICO:",
        econ_flow_desc: "Apostadores → Pools (Solana) → 90% Ganadores / 10% Comisiones <br> Distribución → 40% Jackpot 🏆 / 30% World Reserve 🔥 / 30% Desarrollo 🛠️",
        econ_feat1_t: "Emisión Controlada", econ_feat1_d: "Sí, el token es inflacionario para recompensar la participación (Yield de NFTs y premios). Esta emisión incentiva la entrada constante de nuevos usuarios al ecosistema.",
        econ_feat2_t: "Quema Deflacionaria", econ_feat2_d: "El 10% de CADA APUESTA se quema o va al Jackpot. Mientras más juegue la comunidad, mayor es la reducción de liquidez circulante, contrarrestando la inflación.",
        econ_feat3_t: "Sumideros de Mantenimiento", econ_feat3_d: "Los NFTs 'Genesis' se cansan. Los usuarios DEBEN gastar tokens para recuperar la energía (stamina) de sus jugadores si quieren seguir cobrando recompensas.",
        econ_feat4_t: "Tesorería Inteligente", econ_feat4_d: "El capital del tesoro se deposita en protocolos de staking líquido (Jito/Marinade), generando un flujo de SOL constante que el contrato inmutable utiliza para recomprar y quemar $GCH perpetuamente.",
        game_title: "Mini-Juego de Penaltis", game_sub: "Prueba la mecánica de tiro diseñada para la PSG1 directamente desde tu navegador. Toca una zona del arco para patear.",
        game_hint: "TOCA UNA ZONA PARA PATEAR",
        stat_goals: "GOLES", stat_saves: "ATAJADAS", stat_streak: "RACHA",
        game_how_title: "¿Cómo Funciona?",
        game_step1: "Elige una zona del arco para disparar",
        game_step2: "El arquero se lanza a una posición aleatoria",
        game_step3: "Acumula goles y mejora tu racha",
        game_step4: "En el lanzamiento, tus rachas valdrán puntos reales",
        game_soon_title: "🎮 Próximamente",
        game_soon_desc: "Modo multijugador 5v5, torneos con premios en SOL y apuestas integradas durante los partidos del Mundial.",
        fix_title: "Fixture — Mundial 2026",
        fix_sub: "48 selecciones, 12 grupos. Toda la acción del torneo integrada en GoalChain para apuestas en tiempo real.",
        rm_title: "Hoja de Ruta",
        rm_sub: "Nuestro plan de desarrollo con hitos reales y tiempos concretos.",
        soc_title: "Gana GoalPoints",
        soc_sub: "Completa tareas sociales para acumular puntos antes del lanzamiento. Los puntos se convertirán en tokens $GCH en el airdrop oficial.",
        soc_your_pts: "TUS GOALPOINTS",
        soc_connect_info: "Conecta tu wallet para comenzar",
        soc_ref_label: "Tu enlace de referidos:",
        soc_ref_placeholder: "Conecta tu wallet para generar...",
        team_title: "Fundadores", team_sub: "Tres pilares, una pasión: el fútbol y la blockchain.",
        team1_name: "Nico Pez", team1_role: "The Mastermind - Visionario & Fundador. Recorrido blockchain desde 2016. Artista, matemático y padre.",
        team2_name: "Lucas Bello", team2_role: "The Artist - Incansable geek, control de estética y pruebas de estrés para un sistema indestructible.",
        team3_name: "Lara Lo Beluzzo", team3_role: "Senior Dev - El ojo agudo. Experta técnica que asegura la perfección en cada línea de código.",
        wl_title: "Únete a la Revolución",
        wl_sub: "Regístrate para recibir acceso anticipado y beneficios exclusivos.",
        wl_email: "Tu correo electrónico",
        wl_btn: "Anotarme en la Whitelist",
        wl_note: "Tu wallet será tu identidad. Integración con Phantom.",
        cta_title: "¿Listo para el Kick-Off?",
        cta_sub: "El Mundial 2026 se acerca. No te quedes fuera.",
        cta_share: "Compartir en X (Twitter)",
        footer_built: "Desarrollado en Solana",
        // NFTs
        nft_badge: 'COLECCIÓN GENESIS',
        nft_title: 'Genesis Squad NFT Collection',
        nft_desc: 'Explora los 1,248 cracks del Mundial. Cada NFT es un activo productivo que genera yield perpetuo.',
        nft_btn: 'UNIRSE A LA WHITELIST',
        pack_badge: "MARKETPLACE",
        pack_title: "Abre tus Sobres Genesis",
        pack_sub: "Prueba tu suerte y consigue a los capitanes del Mundial 2026.",
        pack_open_btn: "ABRIR SOBRE (100 $GCH)",
        nft_price_label: "PRECIO NFT",
        nft_buy_btn: "COMPRAR",
        nft_contract_title: "CONTRATO PROFESIONAL",
        // Social tasks
        soc_t1_t: "Seguir en X (Twitter)", soc_t1_d: "Síguenos en @GoalChain",
        soc_t2_t: "Compartir Tweet", soc_t2_d: "Comparte nuestro tweet fijado",
        soc_t3_t: "Unirse a Discord", soc_t3_d: "Únete a la comunidad",
        soc_t4_t: "Unirse a Telegram", soc_t4_d: "Únete al canal oficial",
        soc_t5_t: "Invitar Amigos", soc_t5_d: "100 pts por cada referido",
        soc_t6_t: "Jugar Mini-Juego", soc_t6_d: "Marca 10+ goles consecutivos",
        // Roadmap
        rm_q1_title: "Fundación", rm_q2_title: "Infraestructura",
        rm_q3_title: "Pre-Lanzamiento", rm_q4_title: "Lanzamiento App",
        rm_q5_title: "Mundial 2026", rm_q6_title: "Expansión",
        // Fixture tabs
        fix_all: "Todos", fix_fav: "Favoritos",
    },
    en: {
        nav_about: "About", nav_game: "Mini-Game", nav_fixture: "Fixture", nav_roadmap: "Roadmap", nav_social: "Social",
        nav_wallet: "Connect Wallet",
        hero_badge: "FIFA WORLD CUP 2026 — COMING SOON",
        hero_title: "Own the Pitch.<br>Win on Solana.",
        hero_sub: "GoalChain is the first Play-to-Earn football platform on Solana. Bet live on the 2026 World Cup, play penalty mini-games and earn $GCH tokens.",
        cd_days: "DAYS", cd_hours: "HOURS", cd_min: "MIN", cd_sec: "SEC",
        hero_play: "Play Now",
        pitch_title: "Our Vision: The Future of Football",
        pitch_sub: "Dominating the world's biggest sport through decentralization. GoalChain is the ultimate infrastructure for the 21st-century football fan.",
        feat1_t: "Live Betting", feat1_d: "Bet in real-time on World Cup 2026 matches. Dynamic odds powered by Solana smart contracts.",
        feat2_t: "Play-to-Earn", feat2_d: "Compete in penalty mini-games and global tournaments. Earn $GCH tokens and exclusive NFTs.",
        feat3_t: "100% On-Chain", feat3_d: "All betting logic and rewards live on the Solana blockchain. Full transparency, no middlemen.",
        pitch_feat1_t: "Predictive Markets", pitch_feat1_d: "Decentralized parimutuel betting on every World Cup 2026 match. <br><br><b>Full Transparency:</b> Odds are organic, calculated in real-time by pool volume. No external manipulation, with automated payouts guaranteed by the Solana network.",
        pitch_feat2_t: "Infinity Burn", pitch_feat2_d: "Perpetual sustainability model. <br><br><b>Circular Flow:</b> 30% of revenue is locked in immutable contracts generating yield via <b>LST (Jito/Marinade)</b>. Only the generated interest is used to buy back $GCH, protecting the principal capital forever.",
        pitch_feat3_t: "3D Cards", pitch_feat3_d: "1,248 unique Genesis Squad legends ready for action. <br><br><b>Productive Assets:</b> Each NFT generates daily Yield fueled by the treasury. Evolve your players and boost their stats through active participation.",
        pitch_feat4_t: "PvP Minigames", pitch_feat4_d: "Immediate action with no waiting. Challenge the global community at any time. <br><br><b>Competition:</b> Master the Penalty Minigame or build your 5v5 team for exclusive tournaments with massive prizes for the top rankers.",
        pitch_feat5_t: "Immutable Security", pitch_feat5_d: "Autonomous protocol. All logic resides in the smart contract with revoked authority. <br><br><b>Verifiability:</b> No hidden servers. Sports data oracles feed results, ensuring a fair and unalterable gaming environment.",
        econ_badge: "SUSTAINABLE ECONOMY",
        econ_sub: "An ecosystem designed to last. Transparent, circular, and profitable.",
        econ_flow_title: "ECONOMIC FLOW:",
        econ_flow_desc: "Bettors → Pools (Solana) → 90% Winners / 10% Commissions <br> Distribution → 40% Jackpot 🏆 / 30% World Reserve 🔥 / 30% Development 🛠️",
        econ_feat1_t: "Controlled Emission", econ_feat1_d: "Yes, the token is inflationary to reward participation (NFT Yield and prizes). This emission incentivizes the constant entry of new users into the ecosystem.",
        econ_feat2_t: "Deflationary Burn", econ_feat2_d: "10% of EVERY BET is burned or goes to the Jackpot. The more the community plays, the greater the reduction in circulating liquidity, countering inflation.",
        econ_feat3_t: "Maintenance Sinks", econ_feat3_d: "Genesis NFTs get tired. Users MUST spend tokens to recover their players' energy (stamina) if they want to continue collecting rewards.",
        econ_feat4_t: "Smart Treasury", econ_feat4_d: "Treasury capital is deposited into liquid staking protocols (Jito/Marinade), generating a constant SOL flow that the immutable contract uses to buy back and burn $GCH perpetually.",
        game_title: "Penalty Mini-Game", game_sub: "Try the shooting mechanic designed for PSG1 right from your browser. Tap a zone in the goal to shoot.",
        game_hint: "TAP A ZONE TO SHOOT",
        stat_goals: "GOALS", stat_saves: "SAVES", stat_streak: "STREAK",
        game_how_title: "How It Works",
        game_step1: "Choose a zone in the goal to shoot at",
        game_step2: "The keeper dives to a random position",
        game_step3: "Score goals and build your streak",
        game_step4: "At launch, streaks will earn real points",
        game_soon_title: "🎮 Coming Soon",
        game_soon_desc: "5v5 multiplayer mode, tournaments with SOL prizes and integrated betting during World Cup matches.",
        fix_title: "Fixture — World Cup 2026",
        fix_sub: "48 teams, 12 groups. All tournament action integrated into GoalChain for real-time betting.",
        rm_title: "Roadmap",
        rm_sub: "Our development plan with real milestones and concrete timelines.",
        soc_title: "Earn GoalPoints",
        soc_sub: "Complete social tasks to accumulate points before launch. Points will convert to $GCH tokens in the official airdrop.",
        soc_your_pts: "YOUR GOALPOINTS",
        soc_connect_info: "Connect your wallet to start",
        soc_ref_label: "Your referral link:",
        soc_ref_placeholder: "Connect your wallet to generate...",
        team_title: "Founders", team_sub: "Three pillars, one passion: football and blockchain.",
        team1_name: "Nico Pez", team1_role: "The Mastermind - Visionary & Founder. Blockchain journey since 2016. Artist, mathematician, and father.",
        team2_name: "Lucas Bello", team2_role: "The Artist - Tireless geek, aesthetic control and stress testing for an indestructible system.",
        team3_name: "Lara Lo Beluzzo", team3_role: "Senior Dev - The sharp eye. Technical expert ensuring perfection in every line of code.",
        wl_title: "Join the Revolution",
        wl_sub: "Sign up for early access and exclusive benefits.",
        wl_email: "Your email address",
        wl_btn: "Join the Whitelist",
        wl_note: "Your wallet is your identity. Phantom integration.",
        cta_title: "Ready for Kick-Off?",
        cta_sub: "World Cup 2026 is coming. Don't miss out.",
        cta_share: "Share on X (Twitter)",
        footer_built: "Built on Solana",
        pack_badge: "MARKETPLACE",
        pack_title: "Open Your Genesis Packs",
        pack_sub: "Try your luck and get the 2026 World Cup captains.",
        pack_open_btn: "OPEN PACK (100 $GCH)",
        nft_price_label: "NFT PRICE",
        nft_buy_btn: "BUY NOW",
        nft_contract_title: "PROFESSIONAL CONTRACT",
        soc_t1_t: "Follow on X (Twitter)", soc_t1_d: "Follow us @GoalChain",
        soc_t2_t: "Share Tweet", soc_t2_d: "Share our pinned tweet",
        soc_t3_t: "Join Discord", soc_t3_d: "Join the community",
        soc_t4_t: "Join Telegram", soc_t4_d: "Join the official channel",
        soc_t5_t: "Invite Friends", soc_t5_d: "100 pts per referral",
        soc_t6_t: "Play Mini-Game", soc_t6_d: "Score 10+ consecutive goals",
        rm_q1_title: "Foundation", rm_q2_title: "Infrastructure",
        rm_q3_title: "Pre-Launch", rm_q4_title: "App Launch",
        rm_q5_title: "World Cup 2026", rm_q6_title: "Expansion",
        fix_all: "All", fix_fav: "Favorites",
    }
};

let currentLang = localStorage.getItem('gc_lang') || 'es';

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('gc_lang', lang);
    document.getElementById('langEs').classList.toggle('active', lang === 'es');
    document.getElementById('langEn').classList.toggle('active', lang === 'en');
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
