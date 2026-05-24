/** Canonical marketing site (read-only). Override with VITE_MARKETING_URL. */
export const MARKETING_BASE =
  (import.meta.env.VITE_MARKETING_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://goalchain.fun';

export type PlayNavItem = {
  id: string;
  label: string;
  /** In-app route (React Router). */
  to?: string;
  /** External marketing URL (full or path on MARKETING_BASE). */
  href?: string;
  external?: boolean;
};

export type PlayNavGroup = {
  id: string;
  label: string;
  items: PlayNavItem[];
};

/** Transactional sections — each maps to a Play route. */
export const PLAY_SECTIONS: PlayNavItem[] = [
  { id: 'hub', label: 'Classic Hub', to: '/' },
  { id: 'dashboard', label: 'Dashboard React', to: '/dashboard' },
  { id: 'ops', label: 'Ops', to: '/ops' },
  { id: 'fixtures', label: 'Fixtures', to: '/fixtures' },
  { id: 'trading', label: 'Trading', to: '/trading' },
  { id: 'squad', label: 'Squad', to: '/squad' },
  { id: 'vaults', label: 'Vaults', to: '/vaults' },
  { id: 'commentator', label: 'AI Commentator', to: '/commentator' },
  { id: 'feed', label: 'Live Feed', to: '/feed' },
];

/** Mirrors docs/index.html primary nav (marketing anchors). */
export const EXPLORE_SECTIONS: PlayNavItem[] = [
  { id: 'pitch', label: 'Sobre', href: `${MARKETING_BASE}/#pitch`, external: true },
  { id: 'gameplay', label: 'Mini-Juego', href: `${MARKETING_BASE}/#gameplay`, external: true },
  { id: 'nfts', label: 'Colección', href: `${MARKETING_BASE}/#nfts`, external: true },
  { id: 'manager', label: 'Manager', href: `${MARKETING_BASE}/#manager`, external: true },
  { id: 'stadiums', label: 'Estadios', href: `${MARKETING_BASE}/#stadiums`, external: true },
  { id: 'fixture-info', label: 'Fixture', href: `${MARKETING_BASE}/#fixture`, external: true },
  { id: 'roadmap', label: 'Roadmap', href: `${MARKETING_BASE}/#roadmap`, external: true },
  { id: 'economics', label: 'Economía', href: `${MARKETING_BASE}/#economics`, external: true },
  { id: 'social', label: 'Social', href: `${MARKETING_BASE}/#social`, external: true },
];

export const RESOURCE_LINKS: PlayNavItem[] = [
  { id: 'pitch-page', label: 'Pitch & Motivación', href: `${MARKETING_BASE}/pitch.html`, external: true },
  { id: 'mega-guide', label: 'Mega Guía v2', href: `${MARKETING_BASE}/mega-guide.html`, external: true },
  { id: 'mega-guide-v1', label: 'Mega Guía v1', href: `${MARKETING_BASE}/mega-guide-v1.html`, external: true },
  { id: 'colabs', label: 'Colaboraciones', href: `${MARKETING_BASE}/colabs.html`, external: true },
  { id: 'legal', label: 'Legal', href: `${MARKETING_BASE}/legal.html`, external: true },
];

export const PLAY_NAV_GROUPS: PlayNavGroup[] = [
  { id: 'play', label: 'Jugar', items: PLAY_SECTIONS },
  { id: 'explore', label: 'Explorar', items: EXPLORE_SECTIONS },
];
