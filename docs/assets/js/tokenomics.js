/**
 * tokenomics.js — init page-local para tokenomics.html (Fase 1, P2.3).
 * IIFE namespaced. Sin const/let top-level. Provee un window.notifier seguro
 * para que burn_tracker.js / economy_observability.js no crasheen fuera del
 * contexto de index.html, y deja que ambos scripts se autoinstancien.
 */
(function () {
  window.notifier = window.notifier || {
    show: function (title, msg, type) {
      try { console.log('[' + (type || 'info') + '] ' + title + ': ' + msg); } catch (e) {}
    },
    play: function () {}
  };
  window.__TOKENOMICS_PAGE__ = true;
})();
