// Canonical TypeScript translations — mirrors docs/assets/js/i18n.js flat key structure
// Default language: EN (campaign match)

// ── ENGLISH ──────────────────────────────────────────────────
const en: Record<string, string> = {
  // NFT Marketplace (issue #858)
  NFT_MARKETPLACE_TITLE: "Genesis Squad Marketplace",
  BUY_WITH_CASH: "BUY WITH CASH",
  BUY_WITH_SOL: "BUY WITH SOL",
  PROCESSING: "PROCESSING...",
  NO_CARDS_LISTED: "No cards listed yet...",
  SUCCESS_PURCHASE: "SUCCESS! You have acquired:",
  TRANSACTION_FAILED: "The transaction was cancelled or failed.",
  // Dashboard
  DASHBOARD_HUB_TITLE: "Manager Dashboard",
  DASHBOARD_HUB_DESC: "Manage your team, control your Yield and dominate the transfer market.",
  DASHBOARD_GRID_TITLE: "Dashboard Overview",
  DASHBOARD_GRID_DESC: "Your Genesis Squad at a glance.",
  // AI agents
  AI_COACH_TITLE: "AI Coach",
  AI_COACH_DESC: "Smart formation suggestions based on opponent analysis.",
  AI_COMMENTATOR_TITLE: "AI Commentator",
  AI_COMMENTATOR_DESC: "Live match commentary powered by Grok.",
  // Classic hub
  CLASSIC_HUB_TITLE: "Classic Mode",
  CLASSIC_HUB_DESC: "Traditional football manager experience.",
  // Club portal
  CLUB_PORTAL_TITLE: "My Club",
  CLUB_PORTAL_DESC: "Roster & Manager — build your dream squad.",
  // Create user
  CREATE_USER_TITLE: "Create Your Profile",
  CREATE_USER_DESC: "Join the Genesis Manager community.",
  // Estadio portal
  ESTADIO_PORTAL_TITLE: "Stadium Portal",
  ESTADIO_PORTAL_DESC: "Betting & Live AI commentary.",
  // Swarm vaults
  SWARM_VAULTS_TITLE: "DeFi Swarm",
  SWARM_VAULTS_DESC: "Vibe Swap & Vaults — earn yield on your holdings.",
  // Navigation & UI
  NAV_MANAGER: "Manager",
  NAV_NFTS: "Collection",
  NAV_GAME: "Mini-Game",
  NAV_FIXTURE: "Fixture",
  NAV_ECONOMY: "Economy",
  NAV_SOCIAL: "Social",
  NAV_WALLET: "Connect Wallet",
  // Misc campaign-critical strings
  LOADING: "LOADING...",
  ERROR_GENERIC: "Something went wrong. Please try again.",
  SUCCESS: "SUCCESS!",
  CLAIM_REWARDS: "CLAIM REWARDS",
  VIEW_COLLECTION: "VIEW COLLECTION",
};

const es: Record<string, string> = {
  NFT_MARKETPLACE_TITLE: "Mercado Genesis Squad",
  BUY_WITH_CASH: "COMPRAR EN CASH",
  BUY_WITH_SOL: "COMPRAR CON SOL",
  PROCESSING: "PROCESANDO...",
  NO_CARDS_LISTED: "No hay cartas listadas...",
  SUCCESS_PURCHASE: "¡ÉXITO! Has adquirido:",
  TRANSACTION_FAILED: "La transacción fue cancelada o falló.",
  DASHBOARD_HUB_TITLE: "Dashboard del Manager",
  DASHBOARD_HUB_DESC: "Gestiona tu equipo, controla tu Yield y domina el mercado de transferencias.",
  DASHBOARD_GRID_TITLE: "Vista General del Dashboard",
  DASHBOARD_GRID_DESC: "Tu Genesis Squad de un vistazo.",
  AI_COACH_TITLE: "Entrenador IA",
  AI_COACH_DESC: "Sugerencias de formación inteligentes basadas en análisis del rival.",
  AI_COMMENTATOR_TITLE: "Comentario IA",
  AI_COMMENTATOR_DESC: "Cobertura en vivo de partidos impulsada por Grok.",
  CLASSIC_HUB_TITLE: "Modo Clásico",
  CLASSIC_HUB_DESC: "Experiencia tradicional de manager de fútbol.",
  CLUB_PORTAL_TITLE: "Mi Club",
  CLUB_PORTAL_DESC: "Plantel y Manager — construye tu equipo soñado.",
  CREATE_USER_TITLE: "Crea Tu Perfil",
  CREATE_USER_DESC: "Únete a la comunidad de Genesis Managers.",
  ESTADIO_PORTAL_TITLE: "Portal Estadio",
  ESTADIO_PORTAL_DESC: "Apuestas y Comentario IA en vivo.",
  SWARM_VAULTS_TITLE: "DeFi Swarm",
  SWARM_VAULTS_DESC: "Vibe Swap y Vaults — gana rendimiento sobre tus holdings.",
  NAV_MANAGER: "Manager",
  NAV_NFTS: "Colección",
  NAV_GAME: "Mini-Juego",
  NAV_FIXTURE: "Fixture",
  NAV_ECONOMY: "Economía",
  NAV_SOCIAL: "Social",
  NAV_WALLET: "Conectar Wallet",
  LOADING: "CARGANDO...",
  ERROR_GENERIC: "Algo salió mal. Intenta de nuevo.",
  SUCCESS: "¡ÉXITO!",
  CLAIM_REWARDS: "RECLAMAR RECOMPENSAS",
  VIEW_COLLECTION: "VER COLECCIÓN",
};

const defaultExport = { en, es };
export default defaultExport;
export { en, es };