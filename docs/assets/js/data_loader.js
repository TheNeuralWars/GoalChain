/**
 * data_loader.js — shared data fetch + JSON.parse for the play pages.
 *
 * Why this exists (perf): every players.json consumer (nft_registry, marketplace,
 * pack_opener, ai_agent, 3d_gallery) used to run its own
 * `fetch('assets/data/players.json?v=…').json()`. The identical URL already
 * deduped at the network / HTTP-cache layer (one wire fetch per page), but each
 * consumer still ran its OWN `response.json()` — i.e. N independent JSON.parse
 * passes over the same ~570 KB payload on the main thread per visit (3 on
 * /goalchain). That is pure repeated CPU work during boot.
 *
 * This module fetches + parses each data file ONCE and hands every consumer the
 * same parsed result. The expensive part — the network read + JSON.parse of the
 * 528-player object graph — now happens once per page, no matter how many
 * consumers ask for it.
 *
 * Mutation safety: consumers get a fresh SHALLOW array copy per call (cheap —
 * 528 reference slots), so a consumer that sorts/splices its own array cannot
 * disturb the others. The heavy parsed objects are shared; consumers must not
 * mutate individual player objects in place (they currently don't — they spread
 * `{ ...player }` when they need a modified copy).
 *
 * Pinned data refs — bump ?v= whenever the data file content changes (same
 * cache-busting discipline as the art refs and the script pins).
 *
 * Load order: this file must be included (as a plain <script>) BEFORE any
 * consumer script so `window.GWData` exists when they run.
 */
(function () {
  'use strict';

  // Pinned data refs — bump ?v= whenever the data file content changes.
  var PLAYERS_URL = 'assets/data/players.json?v=20261123';
  var FIXTURE_URL = 'assets/data/wc2026_fixture.json?v=20261117';

  var parsed = Object.create(null); // url -> Promise<Array|Object>

  function load(url) {
    if (!parsed[url]) {
      parsed[url] = fetch(url).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
        return res.json();
      });
      // Consumers handle failures in their own try/catch (they fall back to
      // defaults). This no-op keeps a rejection from surfacing as "unhandled"
      // on a page whose consumers haven't awaited it yet.
      parsed[url].catch(function () {});
    }
    return parsed[url];
  }

  // Share the parse, but hand each caller its own array so in-place
  // sort/splice stays local to that consumer. Non-array payloads (none today)
  // are shared read-only.
  function share(url) {
    return load(url).then(function (rows) {
      return Array.isArray(rows) ? rows.slice() : rows;
    });
  }

  window.GWData = {
    players: function () { return share(PLAYERS_URL); },
    fixture: function () { return share(FIXTURE_URL); },
    // QA / test hook: drop the memo so a page (or a unit test) can force a
    // fresh fetch and assert the single-parse behaviour.
    reset: function () { parsed = Object.create(null); }
  };
})();
