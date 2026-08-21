(function () {
  if (window.__gwShell) return;
  window.__gwShell = true;

  var path = location.pathname.replace(/\/+$/, '') || '/';
  var depth = path.split('/').filter(Boolean).length;
  var root = depth <= 1 ? '' : new Array(depth).join('../');
  if (!root) root = '';

  var PLAY = window.goalworld_PLAY_URL || window.GOALCHAIN_PLAY_URL || 'https://play.goalworld.fun';
  function play(p) {
    return PLAY + (p || '/');
  }

  var items = [
    { href: root + 'index.html', abs: '/', label: 'World', id: 'world' },
    { href: play('/goalworld'), label: 'Lore', id: 'lore' },
    { href: root + 'go/reader/index.html', abs: '/go/reader', label: 'Books', id: 'books' },
    { href: root + 'goalchain.html', abs: '/goalchain.html', label: 'Matchday', id: 'match' },
    { href: play('/estadio'), label: 'Bet', id: 'bet' },
    { href: play('/'), label: 'Play', id: 'play' },
    { href: play('/defi'), label: 'DeFi', id: 'defi' },
    { href: root + 'map.html', abs: '/map.html', label: 'Map', id: 'map' }
  ];

  function currentId() {
    if (/\/go\/reader|\/reader/.test(path)) return 'books';
    if (/goalchain/.test(path)) return 'match';
    if (/\/map/.test(path)) return 'map';
    if (/play\.(goalworld|goalchain)/.test(location.host)) {
      if (/goalworld/.test(path)) return 'lore';
      if (/estadio/.test(path)) return 'bet';
      if (/defi/.test(path)) return 'defi';
      return 'play';
    }
    if (path === '' || path === '/' || /index\.html$/.test(path)) return 'world';
    return '';
  }

  var cur = currentId();
  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = (root || '') + 'assets/css/gw-shell.css';
  document.head.appendChild(css);

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
    if (it.id === 'world') a.className = 'mark';
    if (it.id === cur) a.setAttribute('aria-current', 'page');
    nav.appendChild(a);
  });
  document.documentElement.classList.add('gw-has-dock');
  function mount() {
    document.body.classList.add('gw-has-dock');
    document.body.appendChild(nav);
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
