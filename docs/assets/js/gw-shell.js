(function () {
  if (window.__gwShell) return;
  window.__gwShell = true;

  function mount() {
    if (!document.body) return;
    if (document.body.classList.contains('pitch-mode')) return;

    var origin = location.origin;
    var PLAY = window.goalworld_PLAY_URL || window.GOALCHAIN_PLAY_URL || 'https://play.goalworld.fun';

    var items = [
      { href: origin + '/', label: 'World', id: 'world' },
      { href: origin + '/goalworld.html', label: 'Lore', id: 'lore' },
      { href: origin + '/go/reader', label: 'Books', id: 'books' },
      { href: origin + '/goalchain', label: 'Matchday', id: 'match' },
      { href: PLAY + '/estadio', label: 'Bet', id: 'bet' },
      { href: PLAY + '/', label: 'Play', id: 'play' },
      { href: PLAY + '/defi', label: 'DeFi', id: 'defi' },
      { href: origin + '/map', label: 'Map', id: 'map' }
    ];

    var path = location.pathname.replace(/\/+$/, '') || '/';
    function currentId() {
      if (path === '' || path === '/' || /\/index\.html$/.test(path)) return 'world';
      if (/goalworld/.test(path) && !/play\./.test(location.host)) return 'lore';
      if (/\/go\/reader|\/reader/.test(path)) return 'books';
      if (/goalchain/.test(path)) return 'match';
      if (/\/map/.test(path)) return 'map';
      if (/play\.(goalworld|goalchain)/.test(location.host)) {
        if (/estadio/.test(path)) return 'bet';
        if (/defi/.test(path)) return 'defi';
        return 'play';
      }
      return '';
    }

    var cur = currentId();
    if (!document.querySelector('link[data-gw-shell]')) {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.setAttribute('data-gw-shell', '1');
      css.href = origin + '/assets/css/gw-shell.css';
      document.head.appendChild(css);
    }

    var nav = document.createElement('nav');
    nav.className = 'gw-dock';
    nav.setAttribute('aria-label', 'GoalWorld shortcuts');
    items.forEach(function (it) {
      var a = document.createElement('a');
      a.href = it.href;
      var t = document.createElement('span');
      t.className = 'txt';
      t.textContent = it.label;
      a.appendChild(t);
      if (it.id === 'world') a.classList.add('mark');
      if (it.id === cur) a.setAttribute('aria-current', 'page');
      nav.appendChild(a);
    });
    document.body.classList.add('gw-has-dock');
    document.body.appendChild(nav);
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
