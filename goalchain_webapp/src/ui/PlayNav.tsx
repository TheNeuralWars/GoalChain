import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  PLAY_NAV_GROUPS,
  RESOURCE_LINKS,
  type PlayNavItem,
  type ArcadeGameId,
} from '../config/playNav';
import { LanguageToggle } from '../components/LanguageToggle';
import { useTranslation } from '../i18n';
import { gameBus } from '../hooks/useGameBus';

/* ----------------------------------
   Hook: link de cuenta (localStorage)
   ---------------------------------- */
function useStoredUserLink(): { to: string; label: string } {
  const [userNav, setUserNav] = useState({
    to: '/crear-usuario',
    label: '✨ Create account',
  });

  useEffect(() => {
    const raw = localStorage.getItem('goalchain_user');
    if (!raw) return;
    try {
      const user = JSON.parse(raw) as { username?: string; avatar?: string };
      if (user.username) {
        setUserNav({
          to: `/perfil/${user.username}`,
          label: `${user.avatar || '👤'} @${user.username}`,
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  return userNav;
}

/* ----------------------------------
   Render de un item de navegación
   ---------------------------------- */
function NavItem({ item, collapsed }: { item: PlayNavItem; collapsed: boolean }) {
  const { t } = useTranslation();
  const label = item.i18n ? t(item.i18n as never) : item.label;

  const badge = item.badge ? (
    item.badge === true ? (
      <span className="gc-nav-badge gc-nav-badge--dot" aria-hidden />
    ) : (
      <span className="gc-nav-badge">{item.badge}</span>
    )
  ) : null;

  // Item de ARCADE → abre modal vía bus, no cambia la ruta.
  if (item.arcade) {
    const openGame = () => gameBus.emit('arcade:open', { game: item.arcade as ArcadeGameId });
    return (
      <button
        type="button"
        className={`gc-nav-link gc-nav-link--arcade ${collapsed ? 'gc-nav-link--icon' : ''}`}
        onClick={openGame}
        title={label}
        aria-label={label}
      >
        <span className="gc-nav-link-icon" aria-hidden>{item.icon}</span>
        {!collapsed && <span className="gc-nav-link-label">{label}</span>}
        {badge}
      </button>
    );
  }

  const className = ({ isActive }: { isActive: boolean }) =>
    `gc-nav-link${isActive ? ' gc-nav-link--active' : ''}${
      collapsed ? ' gc-nav-link--icon' : ''
    }`;

  const inner = (
    <>
      <span className="gc-nav-link-icon" aria-hidden>{item.icon}</span>
      {!collapsed && <span className="gc-nav-link-label">{label}</span>}
      {item.external && !collapsed ? (
        <span className="gc-nav-ext" aria-hidden> ↗</span>
      ) : null}
      {badge}
    </>
  );

  if (item.to) {
    return (
      <NavLink to={item.to} end={item.to === '/'} className={className} title={label}>
        {inner}
      </NavLink>
    );
  }
  if (item.href) {
    return (
      <a
        href={item.href}
        className={`gc-nav-link${collapsed ? ' gc-nav-link--icon' : ''}`}
        target={item.external ? '_blank' : undefined}
        rel={item.external ? 'noopener noreferrer' : undefined}
        title={label}
      >
        {inner}
      </a>
    );
  }
  return null;
}

/* ----------------------------------
   Render de un grupo (zona) acordeón
   ---------------------------------- */
function NavGroup({
  group,
  collapsed,
  expanded,
  onToggle,
}: {
  group: (typeof PLAY_NAV_GROUPS)[number];
  collapsed: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const label = group.i18n ? t(group.i18n as never) : group.label;

  return (
    <div className={`gc-nav-group ${expanded ? 'gc-nav-group--expanded' : ''}`}>
      <button
        type="button"
        className={`gc-nav-group-head ${collapsed ? 'gc-nav-group-head--icon' : ''}`}
        aria-expanded={expanded}
        onClick={onToggle}
        title={label}
      >
        <span className="gc-nav-group-icon" aria-hidden>{group.icon}</span>
        {!collapsed && (
          <>
            <span className="gc-nav-group-label">{label}</span>
            <span className={`gc-nav-group-chevron ${expanded ? 'gc-nav-group-chevron--open' : ''}`} aria-hidden>
              ⌄
            </span>
          </>
        )}
      </button>
      {!collapsed && expanded ? (
        <div className="gc-nav-group-items">
          {group.items.map((item) => (
            <NavItem key={item.id} item={item} collapsed={false} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ================================================
   SIDEBAR / ICON-RAIL (desktop + tablet)
   ================================================ */
export function PlayNav({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const userNav = useStoredUserLink();

  // Grupo expandido en el acordeón. Persistente.
  const [openGroup, setOpenGroup] = useState<string>(() => {
    return localStorage.getItem('gc_nav_open') || 'matchday';
  });

  // Dropdown de Recursos (sólo modo expandido).
  const [resourcesOpen, setResourcesOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('gc_nav_open', openGroup);
  }, [openGroup]);

  // Cerrar submenús al cambiar de ruta (feedback de navegación).
  useEffect(() => {
    setResourcesOpen(false);
  }, [location.pathname]);

  const toggleGroup = (id: string) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenGroup(id);
    } else {
      setOpenGroup((cur) => (cur === id ? '' : id));
    }
  };

  return (
    <nav
      className={`gc-rail ${collapsed ? 'gc-rail--collapsed' : 'gc-rail--expanded'}`}
      aria-label={t('nav_main' as never) || 'Main navigation'}
    >
      {/* --- Top: brand + toggle --- */}
      <div className="gc-rail-top">
        <Link to="/" className="gc-rail-brand" title="GoalChain Play">
          <span className="gc-rail-brand-mark" aria-hidden>⚽</span>
          {!collapsed && (
            <span className="gc-rail-brand-text">
              Goal<span className="gc-rail-brand-accent">Chain</span>
            </span>
          )}
        </Link>
        <button
          type="button"
          className="gc-rail-toggle"
          aria-label={collapsed ? 'Expand' : 'Collapse'}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? '☰' : '⮜'}
        </button>
      </div>

      {/* --- Zonas (acordeón) --- */}
      <div className="gc-rail-zones">
        {PLAY_NAV_GROUPS.map((group) => (
          <NavGroup
            key={group.id}
            group={group}
            collapsed={collapsed}
            expanded={openGroup === group.id}
            onToggle={() => toggleGroup(group.id)}
          />
        ))}
      </div>

      {/* --- Recursos (dropdown, modo expandido) --- */}
      {!collapsed && (
        <div className={`gc-rail-resources ${resourcesOpen ? 'gc-rail-resources--open' : ''}`}>
          <button
            type="button"
            className="gc-nav-group-head"
            aria-expanded={resourcesOpen}
            onClick={() => setResourcesOpen((o) => !o)}
          >
            <span className="gc-nav-group-icon" aria-hidden>🏛</span>
            <span className="gc-nav-group-label">
              {t('nav_zone_resources' as never) || 'Resources'}
            </span>
            <span className={`gc-nav-group-chevron ${resourcesOpen ? 'gc-nav-group-chevron--open' : ''}`} aria-hidden>
              ⌄
            </span>
          </button>
          {resourcesOpen ? (
            <div className="gc-nav-group-items">
              {RESOURCE_LINKS.map((item) => (
                <NavItem key={item.id} item={item} collapsed={false} />
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* --- Footer: cuenta + idioma --- */}
      <div className="gc-rail-footer">
        {!collapsed ? (
          <>
            <NavLink to={userNav.to} className="gc-nav-link gc-nav-link--account">
              <span className="gc-nav-link-icon" aria-hidden>👤</span>
              <span className="gc-nav-link-label">{userNav.label}</span>
            </NavLink>
            <div className="gc-rail-footer-lang">
              <LanguageToggle />
            </div>
          </>
        ) : (
          <>
            <NavLink to={userNav.to} className="gc-nav-link gc-nav-link--icon" title={userNav.label}>
              <span className="gc-nav-link-icon" aria-hidden>👤</span>
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

/* ================================================
   BOTTOM-TAB BAR (móvil <768px)
   ================================================ */
export function PlayBottomTab() {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Un icono representativo por zona (primer item de cada grupo).
  const tabItems = PLAY_NAV_GROUPS.map((g) => {
    const label = g.i18n ? t(g.i18n as never) : g.label;
    const first = g.items[0];
    return {
      id: g.id,
      label,
      icon: g.icon,
      to: first?.to,
      href: first?.href,
      external: first?.external,
      arcade: first?.arcade,
    };
  });

  return (
    <>
      <nav className="gc-bottom-tab" aria-label="Mobile navigation">
        {tabItems.map((it) => {
          const baseClass = 'gc-bottom-tab-item';
          if (it.arcade) {
            return (
              <button
                key={it.id}
                type="button"
                className={baseClass}
                onClick={() => gameBus.emit('arcade:open', { game: it.arcade as ArcadeGameId })}
                aria-label={it.label}
              >
                <span aria-hidden>{it.icon}</span>
              </button>
            );
          }
          if (it.to) {
            return (
              <NavLink
                key={it.id}
                to={it.to}
                end={it.to === '/'}
                className={({ isActive }) => `${baseClass}${isActive ? ` ${baseClass}--active` : ''}`}
              >
                <span aria-hidden>{it.icon}</span>
              </NavLink>
            );
          }
          return (
            <a key={it.id} href={it.href} className={baseClass} aria-label={it.label}>
              <span aria-hidden>{it.icon}</span>
            </a>
          );
        })}
      </nav>

      {/* Drawer móvil para submenús (opcional, abre desde una tab) */}
      {drawerOpen ? null : null}
    </>
  );
}
