/** Canonical marketing site (read-only). Override with VITE_MARKETING_URL. */
export const MARKETING_BASE =
  (import.meta.env.VITE_MARKETING_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://goalchain.fun';

export type PlayNavItem = {
  id: string;
  /** Translation key for the label (resolved via t() in components). */
  labelKey: string;
  /** In-app route (React Router). */
  to?: string;
  /** External marketing URL (full or path on MARKETING_BASE). */
  href?: string;
  external?: boolean;
};

export type PlayNavGroup = {
  id: string;
  labelKey: string;
  items: PlayNavItem[];
};

/** Translation keys for transactional sections — each maps to a Play route. */
export const PLAY_SECTIONS: PlayNavItem[] = [
  { id: 'inicio', labelKey: 'portal_inicio', to: '/' },
  { id: 'estadio', labelKey: 'portal_estadio', to: '/estadio' },
  { id: 'defi', labelKey: 'portal_defi', to: '/defi' },
  { id: 'club', labelKey: 'portal_club', to: '/club' },
  { id: 'guias', labelKey: 'nav_manuals', to: '/guias' },
];

/** Mirrors docs/index.html primary nav (marketing anchors). */
export const EXPLORE_SECTIONS: PlayNavItem[] = [
  { id: 'pitch', labelKey: 'nav_about', href: `${MARKETING_BASE}/#pitch`, external: true },
  { id: 'gameplay', labelKey: 'nav_game', href: `${MARKETING_BASE}/#gameplay`, external: true },
  { id: 'nfts', labelKey: 'nav_nfts', href: `${MARKETING_BASE}/#nfts`, external: true },
  { id: 'manager', labelKey: 'nav_manager', href: `${MARKETING_BASE}/#manager`, external: true },
  { id: 'stadiums', labelKey: 'nav_stadiums', href: `${MARKETING_BASE}/#stadiums`, external: true },
  { id: 'fixture-info', labelKey: 'nav_fixture', href: `${MARKETING_BASE}/#fixture`, external: true },
  { id: 'roadmap', labelKey: 'nav_roadmap', href: `${MARKETING_BASE}/#roadmap`, external: true },
  { id: 'economics', labelKey: 'nav_economy', href: `${MARKETING_BASE}/#economics`, external: true },
  { id: 'social', labelKey: 'nav_social', href: `${MARKETING_BASE}/#social`, external: true },
];

export const RESOURCE_LINKS: PlayNavItem[] = [
  { id: 'pitch-page', labelKey: 'nav_pitch_link', href: `${MARKETING_BASE}/pitch.html`, external: true },
  { id: 'mega-guide', labelKey: 'nav_guide_v2', href: `${MARKETING_BASE}/mega-guide.html`, external: true },
  { id: 'mega-guide-v1', labelKey: 'nav_guide_v1', href: `${MARKETING_BASE}/mega-guide-v1.html`, external: true },
  { id: 'colabs', labelKey: 'nav_colabs_link', href: `${MARKETING_BASE}/colabs.html`, external: true },
  { id: 'legal', labelKey: 'nav_legal', href: `${MARKETING_BASE}/legal.html`, external: true },
];

export const PLAY_NAV_GROUPS: PlayNavGroup[] = [
  { id: 'play', labelKey: 'nav_play', items: PLAY_SECTIONS },
  { id: 'explore', labelKey: 'nav_explore', items: EXPLORE_SECTIONS },
];
