import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Full pre-Vercel Play dashboard (sidebar, 9 tabs, activity feed).
 * Static HTML served from /classic-dashboard.html; assets load from goalchain.fun.
 */
export function ClassicHub() {
  return (
    <div className="play-classic-wrap">
      <div className="play-classic-toolbar">
        <Link to="/" className="play-classic-back">
          ← Dashboard principal
        </Link>
        <span className="play-classic-label">Classic Hub — Features recuperadas (AI Hub, Player Market, Minigames Lab, LP, Manager Profile)</span>
        <span className="simulation-badge">RECOVERED</span>
      </div>
      <iframe
        title="GoalChain Classic Dashboard"
        src="/classic-dashboard.html"
        className="play-classic-frame"
      />
    </div>
  );
}
