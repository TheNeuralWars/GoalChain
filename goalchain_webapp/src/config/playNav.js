/**
 * GoalChain — Navegación del Puerto de Mando (Fase 1 refactor)
 * ------------------------------------------------------------
 * Taxonomía de 5 zonas + dropdown de Recursos:
 *   🏟 MATCHDAY   → Dashboard / Fixtures / Live / Enzo Bit (futuro)
 *   📈 TRADING    → Terminal / Swarm Vaults
 *   🏦 DEFI       → Staking & Burn / Hermes Pilot
 *   🛡 CLUB       → My Club / Stadium
 *   🎮 ARCADE     → minijuegos en modal rápido (penalty, pack, modifiers) + Hub
 *   🏛 RESOURCES  → dropdown de links externos a docs/
 *
 * Regla i18n: cada item lleva una clave `i18n` que se resuelve vía
 * useTranslation(). Si no hay clave, se usa `label` como fallback.
 * Las etiquetas por defecto (label) están en INGLÉS, conforme al canon.
 */
/** Canonical marketing site (read-only). Override with VITE_MARKETING_URL. */
export const MARKETING_BASE = import.meta.env.VITE_MARKETING_URL?.replace(/\/$/, '') ||
    'https://goalchain.fun';
/* ============================================================
   ZONA 1 — 🏟 MATCHDAY
   ============================================================ */
const MATCHDAY_ITEMS = [
    { id: 'inicio', label: 'Dashboard', i18n: 'nav_dashboard', icon: '🏠', to: '/' },
    {
        id: 'fixtures',
        label: 'Fixtures',
        i18n: 'nav_fixtures',
        icon: '📅',
        to: '/estadio',
    },
    {
        id: 'live',
        label: 'Live Match',
        i18n: 'nav_live',
        icon: '🔴',
        to: '/',
        badge: true,
    },
];
/* ============================================================
   ZONA 2 — 📈 TRADING
   ============================================================ */
const TRADING_ITEMS = [
    { id: 'defi', label: 'Terminal', i18n: 'nav_terminal', icon: '📈', to: '/defi' },
    {
        id: 'swarm',
        label: 'Swarm Vaults',
        i18n: 'nav_swarm',
        icon: '🐝',
        href: `${MARKETING_BASE}/#economics`,
        external: true,
    },
];
/* ============================================================
   ZONA 3 — 🏦 DEFI
   ============================================================ */
const DEFI_ITEMS = [
    {
        id: 'staking',
        label: 'Staking & Burn',
        i18n: 'nav_staking',
        icon: '🔥',
        to: '/staking',
    },
    {
        id: 'marketing',
        label: 'Hermes Pilot',
        i18n: 'nav_hermes',
        icon: '📡',
        to: '/marketing-control',
    },
    {
        id: 'autopilot',
        label: 'Autopilot Corp',
        icon: '🤖',
        to: '/autopilot',
    },
    {
        id: 'agents',
        label: 'Tokenized Agents',
        i18n: 'nav_agents',
        icon: '🧬',
        to: '/agents',
    },
];
/* ============================================================
   ZONA 4 — 🛡 CLUB
   ============================================================ */
const CLUB_ITEMS = [
    { id: 'club', label: 'My Club', i18n: 'nav_myclub', icon: '🛡', to: '/club' },
    {
        id: 'estadio',
        label: 'Stadium',
        i18n: 'nav_stadium',
        icon: '🏟',
        to: '/estadio',
    },
];
/* ============================================================
   ZONA 5 — 🎮 ARCADE
   ============================================================ */
const ARCADE_ITEMS = [
    { id: 'arcade-penalty', label: 'Penalty', i18n: 'nav_arcade_penalty', icon: '🥅', arcade: 'penalty' },
    { id: 'arcade-pack', label: 'Pack Opener', i18n: 'nav_arcade_pack', icon: '🎁', arcade: 'pack' },
    {
        id: 'arcade-modifiers',
        label: 'Modifiers Lab',
        i18n: 'nav_arcade_modifiers',
        icon: '⚗️',
        arcade: 'modifiers',
    },
    { id: 'hub', label: 'Arcade Hub', i18n: 'nav_arcade_hub', icon: '🎮', to: '/hub' },
];
/* ============================================================
   DROPDOWN — 🏛 RESOURCES
   ============================================================ */
export const RESOURCE_LINKS = [
    {
        id: 'presskit',
        label: 'Clipper & Creator Kit',
        i18n: 'nav_res_presskit',
        to: '/presskit',
    },
    {
        id: 'pitch-page',
        label: 'Pitch & Motivation',
        i18n: 'nav_res_pitch',
        href: `${MARKETING_BASE}/pitch.html`,
        external: true,
    },
    {
        id: 'mega-guide',
        label: 'Mega Guide v2',
        i18n: 'nav_res_guide',
        href: `${MARKETING_BASE}/mega-guide.html`,
        external: true,
    },
    {
        id: 'colabs',
        label: 'Collaborations',
        i18n: 'nav_res_colabs',
        href: `${MARKETING_BASE}/colabs.html`,
        external: true,
    },
    {
        id: 'legal',
        label: 'Legal',
        i18n: 'nav_res_legal',
        href: `${MARKETING_BASE}/legal.html`,
        external: true,
    },
];
/* ============================================================
   GRUPOS — las 5 zonas del icon-rail / sidebar
   ============================================================ */
export const PLAY_NAV_GROUPS = [
    {
        id: 'matchday',
        label: 'Matchday',
        i18n: 'nav_zone_matchday',
        icon: '🏟',
        items: MATCHDAY_ITEMS,
    },
    {
        id: 'trading',
        label: 'Trading',
        i18n: 'nav_zone_trading',
        icon: '📈',
        items: TRADING_ITEMS,
    },
    {
        id: 'defi',
        label: 'DeFi',
        i18n: 'nav_zone_defi',
        icon: '🏦',
        items: DEFI_ITEMS,
    },
    {
        id: 'club',
        label: 'Club',
        i18n: 'nav_zone_club',
        icon: '🛡',
        items: CLUB_ITEMS,
    },
    {
        id: 'arcade',
        label: 'Arcade',
        i18n: 'nav_zone_arcade',
        icon: '🎮',
        items: ARCADE_ITEMS,
    },
];
/* ============================================================
   Legacy (compatibilidad) — eliminables tras migración completa
   ============================================================ */
/** @deprecated Usar PLAY_NAV_GROUPS. */
export const PLAY_SECTIONS = PLAY_NAV_GROUPS.flatMap((g) => g.items).filter((i) => i.to);
