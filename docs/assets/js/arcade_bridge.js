/**
 * GoalChain Arcade Bridge (v1.0)
 * ------------------------------------------------------------
 * Puente postMessage entre los minijuegos vanilla (docs/play/*.html)
 * embebidos como iframe y la webapp de React (goalchain_webapp).
 *
 * Estrategia NO INVASIVA: no modifica la lógica de los juegos.
 * Intercepta los mecanismos nativos de feedback (localStorage,
 * eventos DOM) y los reenvía al parent via postMessage, con un
 * namespace 'gc-arcade' para filtrar ruido.
 *
 * Convención del mensaje:
 *   { source: 'gc-arcade', game: 'penalty'|'pack'|'modifiers',
 *     event: 'goal'|'miss'|'pack:opened'|..., payload?: {...} }
 *
 * Seguridad: targetOrigin se limita a '*' solo en dev; en prod debe
 * configurarse con el origin real de la webapp.
 */
(function () {
  'use strict';

  var GAME = (document.documentElement.getAttribute('data-game') || 'unknown');

  /** Envía un evento al parent de forma segura. */
  function emit(event, payload) {
    var msg = { source: 'gc-arcade', game: GAME, event: event, payload: payload || {} };
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(msg, '*');
      }
    } catch (e) {
      console.warn('[arcade_bridge] postMessage falló', e);
    }
  }

  /** Expone el puente en window por si un juego quiere emitir directamente. */
  window.gcArcadeEmit = emit;

  /* ---- Escucha pasiva de localStorage (gch_balance, inventory) ----
     Los juegos guardan estado en localStorage. Detectamos cambios para
     notificar al parent sin acoplarnos a su lógica interna. */
  window.addEventListener('storage', function (e) {
    if (e.key === 'gch_balance') {
      emit('balance:change', { balance: parseInt(e.newValue || '0', 10) });
    }
    if (e.key === 'goalchain_inventory') {
      emit('inventory:update', { raw: e.newValue });
    }
  });

  /* ---- Bridge específico por juego ----
     Cada juego notifica de forma distinta. En lugar de parchear el
     código fuente, observamos sus efectos secundarios conocidos. */

  if (GAME === 'penalty') {
    // PenaltyGame guarda this.goals/saves en el estado interno.
    // Hacemos polling ligero del texto del canvas (no invasivo) y/o
    // escuchamos el patrón de localStorage de balance que muta al anotar.
    var lastBalance = parseInt(localStorage.getItem('gch_balance') || '0', 10);
    setInterval(function () {
      var bal = parseInt(localStorage.getItem('gch_balance') || '0', 10);
      if (bal !== lastBalance) {
        if (bal > lastBalance) emit('penalty:goal', { scored: bal - lastBalance });
        lastBalance = bal;
      }
    }, 500);
  }

  if (GAME === 'pack') {
    // pack_opener.js añade al inventory al guardar. Detectamos crecimiento.
    var lastInvLen = (JSON.parse(localStorage.getItem('goalchain_inventory') || '[]')).length;
    setInterval(function () {
      var inv = JSON.parse(localStorage.getItem('goalchain_inventory') || '[]');
      if (inv.length > lastInvLen) {
        var newest = inv[inv.length - 1];
        emit('pack:opened', { rarity: (newest && newest.rarity) || 'unknown', playerId: newest && newest.id });
        lastInvLen = inv.length;
      }
    }, 600);
  }

  /* ---- Señal de vida: avisa al parent que el juego cargó ---- */
  window.addEventListener('load', function () {
    emit('ready', { game: GAME, href: location.href });
  });
})();
