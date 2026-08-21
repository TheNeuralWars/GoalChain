(function () {
  /** Dynamic target domain detection (supports both goalworld.fun and goalchain.fun). */
  var host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : '';
  var defaultPlay = host.indexOf('goalworld') !== -1 ? 'https://play.goalworld.fun' : 'https://play.goalchain.fun';
  var PLAY = window.GOALCHAIN_PLAY_URL || defaultPlay;
  window.GOALCHAIN_PLAY_URL = PLAY;
  window.GOALCHAIN_PLAY_PATH = window.GOALCHAIN_PLAY_PATH || '/go/';

  /**
   * Resolve a /go/... (or bare path) to the canonical play URL.
   *   /go/         -> https://play.goalchain.fun/
   *   /go/estadio  -> https://play.goalchain.fun/estadio
   *   estadio      -> https://play.goalchain.fun/estadio
   */
  window.goalchainPlayUrl = function (path) {
    if (!path || path === '/go' || path === '/go/') return PLAY + '/';
    if (path.indexOf('/go/') === 0) path = path.slice(3);      // strip "/go"
    else if (path.indexOf('/go') === 0) path = path.slice(3);
    if (path.charAt(0) !== '/' && path.charAt(0) !== '#') path = '/' + path;
    return PLAY + path;
  };

  /** Global helper for inline onclick handlers. */
  window.goToPlay = function (path) {
    window.location.href = window.goalchainPlayUrl(path);
  };

  /** Docs that live on goalworld.fun — never hijack to Play. */
  var KEEP_PREFIXES = ['/go/reader'];

  function keepOnDocs(href) {
    if (!href) return false;
    var p = href.split('?')[0].split('#')[0];
    for (var i = 0; i < KEEP_PREFIXES.length; i++) {
      var k = KEEP_PREFIXES[i];
      if (p === k || p.indexOf(k + '/') === 0) return true;
    }
    return false;
  }

  /** Rewrite /go/... to Play, except Kindle /go/reader. */
  function rewriteLinks() {
    document.querySelectorAll('a[href^="/go"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (keepOnDocs(href)) return;
      a.href = window.goalchainPlayUrl(href);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', rewriteLinks);
  } else {
    rewriteLinks();
  }
})();
