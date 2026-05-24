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
        <Link to="/dashboard" className="play-classic-back">
          Dashboard React (devnet) →
        </Link>
        <span className="play-classic-label">Classic Hub — diseño completo pre-migración</span>
      </div>
      <iframe
        title="GoalChain Classic Dashboard"
        src="/classic-dashboard.html"
        className="play-classic-frame"
      />
    </div>
  );
}
