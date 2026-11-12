import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './ui/App';
import { initAnalytics } from './analytics/client';
import './index.css';

// PostHog: installs a tiny pre-SDK error buffer now; the SDK itself is
// lazy-loaded on idle after `load` so it never competes with first paint.
initAnalytics();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register PWA service worker (non-blocking — don't crash if SW is unavailable)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('[SW] Registered:', reg.scope))
      .catch((err) => console.warn('[SW] Registration failed (non-fatal):', err));
  });
}
