/**
 * arcade.js — init page-local para arcade.html (Fase 1, P2.2).
 * IIFE namespaced. No globals declarados con const/let a nivel top-level.
 * Garantiza que penalty_game.js y pack_opener.js arranquen sin dependencias
 * cruzadas de index.html: sólo provee un window.notifier seguro (stub) y deja
 * que ambos scripts se autoinstancien en DOMContentLoaded.
 */
(function () {
  var notifier = window.notifier || {
    show: function (title, msg, type) {
      try { console.log('[' + (type || 'info') + '] ' + title + ': ' + msg); } catch (e) {}
    },
    play: function () {}
  };
  window.notifier = notifier;

  // Filtro de colección para el inventario de cartas obtenidas
  window.filterCollection = window.filterCollection || function (filter) {
    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.classList.remove('active');
      if (btn.getAttribute('onclick') && btn.getAttribute('onclick').indexOf(filter) !== -1) {
        btn.classList.add('active');
      }
    });
    if (typeof renderInventory === 'function') {
      renderInventory(filter);
    }
  };

  // Marca de página cargada (para depuración / observabilidad futura).
  window.__ARCADE_PAGE__ = true;
})();
