import re

# ============================================================
# GoalChain i18n Full Audit & Patch Script
# Fixes all hardcoded Spanish strings in index.html
# and adds corresponding English keys to i18n.js
# ============================================================

def patch_html():
    filepath = "docs/index.html"
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Each replacement is (old_string, new_string)
    replacements = [
        # --- NAV (lines 105-108) ---
        ('<a href="#nfts" data-i18n="nav_nfts">Colección</a>',
         '<a href="#nfts" data-i18n="nav_nfts">Colección</a>'),  # already has i18n
        ('<a href="#manager">Estadios</a>',
         '<a href="#manager" data-i18n="nav_manager">Manager</a>'),
        ('<a href="#stadiums">Estadios</a>',
         '<a href="#stadiums" data-i18n="nav_stadiums">Estadios</a>'),

        # --- TICKER (line 166-168) ---
        ('<span class="ticker-item">🏟️ <b>Lusail Arena</b> reporta +45k asistentes digitales...</span>',
         '<span class="ticker-item" data-i18n="ticker_1">🏟️ Lusail Arena reporta +45k asistentes digitales...</span>'),
        ('<span class="ticker-item">🔥 <b>The Vault</b> ejecutando recompra masiva de $GCH...</span>',
         '<span class="ticker-item" data-i18n="ticker_2">🔥 The Vault ejecutando recompra masiva de $GCH...</span>'),
        ('<span class="ticker-item">💎 <b>Legendary Vini Jr</b> minteado en el Pack #882...</span>',
         '<span class="ticker-item" data-i18n="ticker_3">💎 Legendary Vini Jr minteado en el Pack #882...</span>'),

        # --- CAROUSEL HINT (line 222) ---
        ('data-i18n="carousel_hint_pillars">\n            ← Desliza para explorar Pilares →',
         'data-i18n="carousel_hint_pillars">\n            ← Desliza para explorar Pilares →'),

        # --- ZEALY SECTION (lines 272-294) hardcoded Spanish ---
        ('>CAMPAÑA ACTIVA</span>',
         ' data-i18n="zealy_badge">CAMPAÑA ACTIVA</span>'),
        ('>TEMPORADA 1</span>',
         ' data-i18n="zealy_season">TEMPORADA 1</span>'),
        ('Entra a nuestra plataforma oficial de Zealy, completa misiones diarias y semanales, interactúa en redes sociales y sube de nivel para multiplicar tu asignación del Airdrop de $GCH.',
         '<span data-i18n="zealy_desc">Entra a nuestra plataforma oficial de Zealy, completa misiones diarias y semanales, interactúa en redes sociales y sube de nivel para multiplicar tu asignación del Airdrop de $GCH.</span>'),
        ('<b>Social Quests:</b> Follow, Like, Repost en 𝕏',
         '<span data-i18n="zealy_q1"><b>Social Quests:</b> Follow, Like, Repost en 𝕏</span>'),
        ('<b>Discord Quests:</b> Consigue roles exclusivos de Degen',
         '<span data-i18n="zealy_q2"><b>Discord Quests:</b> Consigue roles exclusivos de Degen</span>'),
        ('<b>Game Quests:</b> Comparte tus rachas de Penaltis',
         '<span data-i18n="zealy_q3"><b>Game Quests:</b> Comparte tus rachas de Penaltis</span>'),
        ('🔗 IR A ZEALY QUESTROOM',
         '<span data-i18n="zealy_cta">🔗 IR A ZEALY QUESTROOM</span>'),

        # --- DISCORD COLUMN (lines 301-304) ---
        ('>COMUNIDAD REAL-TIME</h4>',
         ' data-i18n="discord_label">COMUNIDAD REAL-TIME</h4>'),
        ('>Únete al Servidor de Discord</h3>',
         ' data-i18n="discord_title">Únete al Servidor de Discord</h3>'),
        ('La trinchera de los degens. Debate fixture, recibe alertas en tiempo real, participa en trivias y reclama tu rol de Genesis Manager.',
         '<span data-i18n="discord_desc">La trinchera de los degens. Debate fixture, recibe alertas en tiempo real, participa en trivias y reclama tu rol de Genesis Manager.</span>'),

        # --- GAME SECTION (line 393-394) ---
        ('>En el campo:</span>',
         ' data-i18n="game_on_field">En el campo:</span>'),
        ('>CARGANDO...</span>',
         ' data-i18n="game_loading">CARGANDO...</span>'),

        # --- FUTURE GAMES data-desc attributes (lines 431-448) ---
        ('data-desc="Apuestas ultrarrápidas durante partidos reales. Predice penales, córners y goles en vivo con liquidación instantánea."',
         'data-desc-es="Apuestas ultrarrápidas durante partidos reales. Predice penales, córners y goles en vivo con liquidación instantánea." data-desc-en="Ultra-fast betting during real matches. Predict penalties, corners, and live goals with instant settlement."'),
        ('data-desc="Simulador táctico 11v11. Construye tu formación ideal con tus NFTs y compite en ligas globales por el ranking de Managers."',
         'data-desc-es="Simulador táctico 11v11. Construye tu formación ideal con tus NFTs y compite en ligas globales por el ranking de Managers." data-desc-en="11v11 tactical simulator. Build your ideal formation with your NFTs and compete in global leagues for the Manager ranking."'),
        ('data-desc="Fútbol callejero arcade 3v3. Partidos de alta intensidad en favelas digitales donde las habilidades especiales marcan la diferencia."',
         'data-desc-es="Fútbol callejero arcade 3v3. Partidos de alta intensidad en favelas digitales donde las habilidades especiales marcan la diferencia." data-desc-en="3v3 arcade street football. High-intensity matches in digital favelas where special skills make the difference."'),
        ('data-desc="Gestiona y personaliza tu propio estadio RWA. Alquila vallas publicitarias virtuales y genera ingresos pasivos reales."',
         'data-desc-es="Gestiona y personaliza tu propio estadio RWA. Alquila vallas publicitarias virtuales y genera ingresos pasivos reales." data-desc-en="Manage and customize your own RWA stadium. Rent virtual billboards and generate real passive income."'),

        # --- MANAGER SECTION (lines 598-631) ---
        ('>Manager <span>Dashboard</span></h2>',
         ' data-i18n-html="mgr_title">Manager <span>Dashboard</span></h2>'),
        ('>Gestiona tu equipo, controla tu Yield y domina el mercado de transferencias.</p>',
         ' data-i18n="mgr_sub">Gestiona tu equipo, controla tu Yield y domina el mercado de transferencias.</p>'),
        ('>Progreso de Nivel:</p>',
         ' data-i18n="mgr_progress">Progreso de Nivel:</p>'),
        ('>+12.5% vs ayer</p>',
         ' data-i18n="mgr_yield_change">+12.5% vs ayer</p>'),
        ('>Equipos + Jugadores</p>',
         ' data-i18n="mgr_assets_label">Equipos + Jugadores</p>'),

        # --- STADIUMS SECTION (lines 639-671) ---
        ('>RWA <span>Stadiums</span></h2>',
         ' data-i18n-html="stad_title">RWA <span>Stadiums</span></h2>'),
        ('>Sé el dueño de la sede del Mundial. Genera ingresos por cada entrada digital vendida.</p>',
         ' data-i18n="stad_sub">Sé el dueño de la sede del Mundial. Genera ingresos por cada entrada digital vendida.</p>'),
        ('>Sede de la Gran Final. Máximo tráfico de usuarios y multiplicador de apuestas.</p>',
         ' data-i18n="stad_lusail_desc">Sede de la Gran Final. Máximo tráfico de usuarios y multiplicador de apuestas.</p>'),
        ('>Histórica sede renovada con oráculos de asistencia en tiempo real.</p>',
         ' data-i18n="stad_azteca_desc">Histórica sede renovada con oráculos de asistencia en tiempo real.</p>'),
        ('>Sede principal de los partidos de la costa este. Alta estabilidad de rentas.</p>',
         ' data-i18n="stad_metlife_desc">Sede principal de los partidos de la costa este. Alta estabilidad de rentas.</p>'),
        ('>EXPLORAR ACCIONES</button>',
         ' data-i18n="stad_explore_btn">EXPLORAR ACCIONES</button>'),

        # --- REVEAL / COLLECTION (lines 684, 691-707) ---
        ('AGREGAR A MI COLECCIÓN',
         '<span data-i18n="reveal_add">AGREGAR A MI COLECCIÓN</span>'),
        ('>Tu Galería Genesis Squad</h2>',
         ' data-i18n="coll_title">Tu Galería Genesis Squad</h2>'),
        ('>Gestioná tus jugadores y prepará tu alineación para el World Cup 2026.</p>',
         ' data-i18n="coll_sub">Gestioná tus jugadores y prepará tu alineación para el World Cup 2026.</p>'),
        ('>Tu inventario está vacío.</p>',
         ' data-i18n="coll_empty">Tu inventario está vacío.</p>'),
        ('>Los jugadores que obtengas en el Mystery Pack aparecerán aquí.</p>',
         ' data-i18n="coll_empty_hint">Los jugadores que obtengas en el Mystery Pack aparecerán aquí.</p>'),

        # --- PACK ODDS (line 519) ---
        ('>Probabilidad Mythic: 0.1% | Legendary: 0.9% | Epic: 9%</p>',
         ' data-i18n="pack_odds_text">Probabilidad Mythic: 0.1% | Legendary: 0.9% | Epic: 9%</p>'),
        ('>GUARDAR EN COLECCIÓN</button>',
         ' data-i18n="pack_save_btn">GUARDAR EN COLECCIÓN</button>'),

        # --- ROADMAP & TOKENOMICS DUPLICATE (lines 754-781) ---
        ('>Estrategia de Lanzamiento</h2>',
         ' data-i18n="launch_title">Estrategia de Lanzamiento</h2>'),
        ('>Nuestra hoja de ruta hacia el Mundial 2026.</p>',
         ' data-i18n="launch_sub">Nuestra hoja de ruta hacia el Mundial 2026.</p>'),
        ('>DISTRIBUCIÓN INICIAL DE $GCH</h4>',
         ' data-i18n="dist_title">DISTRIBUCIÓN INICIAL DE $GCH</h4>'),
        ('Un ecosistema diseñado para durar. Transparente, circular y rentable.\n                    </p>',
         '<span data-i18n="infinity_desc">Un ecosistema diseñado para durar. Transparente, circular y rentable.</span>\n                    </p>'),

        # --- MANIFESTO LABEL (line 875) ---
        ('>LEER MANIFIESTO ➔</div>',
         ' data-i18n="team_manifesto_link">LEER MANIFIESTO ➔</div>'),

        # --- NOTIFICATION INBOX (lines 1003-1004) ---
        ('>Recibe alertas de goles y apuestas directamente en tu wallet.</p>',
         ' data-i18n="notif_optin_desc">Recibe alertas de goles y apuestas directamente en tu wallet.</p>'),
        ('>SUSCRIBIRSE</button>',
         ' data-i18n="notif_optin_btn">SUSCRIBIRSE</button>'),
    ]

    for old, new in replacements:
        if old in content:
            content = content.replace(old, new, 1)  # Replace only first occurrence
            print(f"  ✅ Patched: {old[:60]}...")
        else:
            print(f"  ⚠️ Not found: {old[:60]}...")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("\n✅ HTML patching complete.")


def patch_i18n():
    filepath = "docs/assets/js/i18n.js"
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # --- SPANISH KEYS to add before the closing of the ES block ---
    es_new_keys = """
        // NEW: Full i18n audit keys
        nav_nfts: "Colección",
        nav_manager: "Manager",
        nav_stadiums: "Estadios",
        ticker_1: "🏟️ Lusail Arena reporta +45k asistentes digitales...",
        ticker_2: "🔥 The Vault ejecutando recompra masiva de $GCH...",
        ticker_3: "💎 Legendary Vini Jr minteado en el Pack #882...",
        carousel_hint_pillars: "← Desliza para explorar Pilares →",
        zealy_badge: "CAMPAÑA ACTIVA",
        zealy_season: "TEMPORADA 1",
        zealy_desc: "Entra a nuestra plataforma oficial de Zealy, completa misiones diarias y semanales, interactúa en redes sociales y sube de nivel para multiplicar tu asignación del Airdrop de $GCH.",
        zealy_q1: "<b>Social Quests:</b> Follow, Like, Repost en 𝕏",
        zealy_q2: "<b>Discord Quests:</b> Consigue roles exclusivos de Degen",
        zealy_q3: "<b>Game Quests:</b> Comparte tus rachas de Penaltis",
        zealy_cta: "🔗 IR A ZEALY QUESTROOM",
        discord_label: "COMUNIDAD REAL-TIME",
        discord_title: "Únete al Servidor de Discord",
        discord_desc: "La trinchera de los degens. Debate fixture, recibe alertas en tiempo real, participa en trivias y reclama tu rol de Genesis Manager.",
        game_on_field: "En el campo:",
        game_loading: "CARGANDO...",
        mgr_title: "Manager <span>Dashboard</span>",
        mgr_sub: "Gestiona tu equipo, controla tu Yield y domina el mercado de transferencias.",
        mgr_progress: "Progreso de Nivel:",
        mgr_yield_change: "+12.5% vs ayer",
        mgr_assets_label: "Equipos + Jugadores",
        stad_title: "RWA <span>Stadiums</span>",
        stad_sub: "Sé el dueño de la sede del Mundial. Genera ingresos por cada entrada digital vendida.",
        stad_lusail_desc: "Sede de la Gran Final. Máximo tráfico de usuarios y multiplicador de apuestas.",
        stad_azteca_desc: "Histórica sede renovada con oráculos de asistencia en tiempo real.",
        stad_metlife_desc: "Sede principal de los partidos de la costa este. Alta estabilidad de rentas.",
        stad_explore_btn: "EXPLORAR ACCIONES",
        reveal_add: "AGREGAR A MI COLECCIÓN",
        coll_title: "Tu Galería Genesis Squad",
        coll_sub: "Gestioná tus jugadores y prepará tu alineación para el World Cup 2026.",
        coll_empty: "Tu inventario está vacío.",
        coll_empty_hint: "Los jugadores que obtengas en el Mystery Pack aparecerán aquí.",
        pack_odds_text: "Probabilidad Mythic: 0.1% | Legendary: 0.9% | Epic: 9%",
        pack_save_btn: "GUARDAR EN COLECCIÓN",
        launch_title: "Estrategia de Lanzamiento",
        launch_sub: "Nuestra hoja de ruta hacia el Mundial 2026.",
        dist_title: "DISTRIBUCIÓN INICIAL DE $GCH",
        infinity_desc: "Un ecosistema diseñado para durar. Transparente, circular y rentable.",
        team_manifesto_link: "LEER MANIFIESTO ➔",
        notif_optin_desc: "Recibe alertas de goles y apuestas directamente en tu wallet.",
        notif_optin_btn: "SUSCRIBIRSE","""

    en_new_keys = """
        // NEW: Full i18n audit keys
        nav_nfts: "Collection",
        nav_manager: "Manager",
        nav_stadiums: "Stadiums",
        ticker_1: "🏟️ Lusail Arena reports +45k digital attendees...",
        ticker_2: "🔥 The Vault executing massive $GCH buyback...",
        ticker_3: "💎 Legendary Vini Jr minted in Pack #882...",
        carousel_hint_pillars: "← Swipe to explore Pillars →",
        zealy_badge: "ACTIVE CAMPAIGN",
        zealy_season: "SEASON 1",
        zealy_desc: "Enter our official Zealy platform, complete daily and weekly missions, interact on social media and level up to multiply your $GCH Airdrop allocation.",
        zealy_q1: "<b>Social Quests:</b> Follow, Like, Repost on 𝕏",
        zealy_q2: "<b>Discord Quests:</b> Earn exclusive Degen roles",
        zealy_q3: "<b>Game Quests:</b> Share your Penalty streaks",
        zealy_cta: "🔗 GO TO ZEALY QUESTROOM",
        discord_label: "REAL-TIME COMMUNITY",
        discord_title: "Join the Discord Server",
        discord_desc: "The degen trench. Debate fixtures, get real-time alerts, join trivia games and claim your Genesis Manager role.",
        game_on_field: "On the field:",
        game_loading: "LOADING...",
        mgr_title: "Manager <span>Dashboard</span>",
        mgr_sub: "Manage your team, control your Yield and dominate the transfer market.",
        mgr_progress: "Level Progress:",
        mgr_yield_change: "+12.5% vs yesterday",
        mgr_assets_label: "Teams + Players",
        stad_title: "RWA <span>Stadiums</span>",
        stad_sub: "Own a World Cup venue. Earn revenue from every digital ticket sold.",
        stad_lusail_desc: "Grand Final venue. Maximum user traffic and betting multiplier.",
        stad_azteca_desc: "Historic renovated venue with real-time attendance oracles.",
        stad_metlife_desc: "Main east coast match venue. High rental stability.",
        stad_explore_btn: "EXPLORE SHARES",
        reveal_add: "ADD TO MY COLLECTION",
        coll_title: "Your Genesis Squad Gallery",
        coll_sub: "Manage your players and prepare your lineup for the World Cup 2026.",
        coll_empty: "Your inventory is empty.",
        coll_empty_hint: "Players you obtain from the Mystery Pack will appear here.",
        pack_odds_text: "Mythic Probability: 0.1% | Legendary: 0.9% | Epic: 9%",
        pack_save_btn: "SAVE TO COLLECTION",
        launch_title: "Launch Strategy",
        launch_sub: "Our roadmap towards the 2026 World Cup.",
        dist_title: "INITIAL $GCH DISTRIBUTION",
        infinity_desc: "An ecosystem designed to last. Transparent, circular, and profitable.",
        team_manifesto_link: "READ MANIFESTO ➔",
        notif_optin_desc: "Receive goal and bet alerts directly in your wallet.",
        notif_optin_btn: "SUBSCRIBE","""

    # Insert ES keys before the closing of the ES block
    es_marker = "        manager_architect: \"Architect Signature\"\n    },"
    if es_marker in content:
        content = content.replace(es_marker, es_new_keys + "\n" + es_marker)
        print("✅ Spanish keys added to i18n.js")
    else:
        print("❌ Could not find ES insertion point")

    # Insert EN keys before the closing of the EN block (second occurrence)
    en_marker = '        manager_architect: "Architect Signature"\n    }\n};'
    if en_marker in content:
        content = content.replace(en_marker, en_new_keys + "\n" + en_marker)
        print("✅ English keys added to i18n.js")
    else:
        print("❌ Could not find EN insertion point")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("\n✅ i18n.js patching complete.")


if __name__ == "__main__":
    print("🔍 GoalChain Full i18n Audit & Patch\n")
    print("=" * 50)
    print("Phase 1: Patching index.html...")
    print("=" * 50)
    patch_html()
    print("\n" + "=" * 50)
    print("Phase 2: Patching i18n.js...")
    print("=" * 50)
    patch_i18n()
    print("\n🏁 Full i18n audit complete!")
