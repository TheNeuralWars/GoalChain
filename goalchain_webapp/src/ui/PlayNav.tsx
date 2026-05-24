import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  PLAY_NAV_GROUPS,
  RESOURCE_LINKS,
  type PlayNavItem,
} from '../config/playNav';

function useStoredUserLink(): { to: string; label: string } {
  const [userNav, setUserNav] = useState({ to: '/crear-usuario', label: '✨ Crear cuenta' });

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

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `play-nav-link${isActive ? ' play-nav-link--active' : ''}`;

function NavItem({ item }: { item: PlayNavItem }) {
  if (item.to) {
    return (
      <NavLink to={item.to} end={item.to === '/'} className={navLinkClass}>
        {item.label}
      </NavLink>
    );
  }
  if (item.href) {
    return (
      <a
        href={item.href}
        className="play-nav-link"
        target={item.external ? '_blank' : undefined}
        rel={item.external ? 'noopener noreferrer' : undefined}
      >
        {item.label}
        {item.external ? <span className="play-nav-ext" aria-hidden> ↗</span> : null}
      </a>
    );
  }
  return null;
}

export function PlayNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const location = useLocation();
  const userNav = useStoredUserLink();

  useEffect(() => {
    setMobileOpen(false);
    setResourcesOpen(false);
  }, [location.pathname]);

  return (
    <nav className="play-nav" aria-label="Navegación principal">
      <div className="play-nav-top">
        <Link to="/" className="play-nav-brand">
          <span className="play-nav-brand-mark">⚽</span>
          <span>
            Goal<span className="play-nav-brand-accent">Chain</span> Play
          </span>
        </Link>
        <button
          type="button"
          className="play-nav-toggle"
          aria-expanded={mobileOpen}
          aria-controls="play-nav-menu"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      <div id="play-nav-menu" className={`play-nav-menu${mobileOpen ? ' play-nav-menu--open' : ''}`}>
        {PLAY_NAV_GROUPS.map((group) => (
          <div key={group.id} className="play-nav-group">
            <span className="play-nav-group-label">{group.label}</span>
            <div className="play-nav-group-links">
              {group.items.map((item) => (
                <NavItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}

        <div className="play-nav-group play-nav-group--dropdown">
          <span className="play-nav-group-label">Recursos</span>
          <button
            type="button"
            className="play-nav-dropdown-btn"
            aria-expanded={resourcesOpen}
            onClick={() => setResourcesOpen((o) => !o)}
          >
            Docs &amp; guías ▾
          </button>
          {resourcesOpen ? (
            <div className="play-nav-dropdown">
              {RESOURCE_LINKS.map((item) => (
                <NavItem key={item.id} item={item} />
              ))}
            </div>
          ) : null}
        </div>

        <div className="play-nav-group play-nav-group--account">
          <span className="play-nav-group-label">Cuenta</span>
          <NavLink to={userNav.to} className={navLinkClass}>
            {userNav.label}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
