(function () {
  /**
   * GoalWorld shared top chrome.
   * Purpose: one nav on every marketing HTML page except pitch-mode.
   * Items (fixed order): World | Matchday | Books | Lore | Play.
   * Tokens: Outfit, #14f195, logo_3d_clean. All hrefs are absolute.
   * Edge cases: body.pitch-mode is a no-op; Matchday keeps its own .main-nav
   * (this file only offsets it via gw-shell.css — do not restyle Matchday).
   */
  if (window.__gwShell) return;
  window.__gwShell = true;

  function mount() {
    if (!document.body) return;
    if (document.body.classList.contains('pitch-mode')) return;
    if (document.querySelector('.gw-chrome')) return;

    var origin = location.origin;
    var PLAY =
      window.goalworld_PLAY_URL ||
      window.GOALCHAIN_PLAY_URL ||
      'https://play.goalworld.fun';

    var items = [
      { href: origin + '/', label: 'World', id: 'world' },
      { href: origin + '/goalchain', label: 'Matchday', id: 'match' },
      { href: origin + '/go/reader', label: 'Books', id: 'books' },
      { href: origin + '/goalworld.html', label: 'Lore', id: 'lore' },
      { href: PLAY + '/', label: 'Play', id: 'play' }
    ];

    var path = location.pathname.replace(/\/+$/, '') || '/';
    function currentId() {
      if (path === '' || path === '/' || /\/index\.html$/.test(path)) return 'world';
      if (/\/go\/reader|\/reader/.test(path)) return 'books';
      if (/goalchain/.test(path)) return 'match';
      if (
        (/goalworld/.test(path) || /\/studio/.test(path)) &&
        !/play\./.test(location.host)
      ) {
        return 'lore';
      }
      if (/play\.(goalworld|goalchain)/.test(location.host)) return 'play';
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

    var hasOutfit = false;
    var links = document.querySelectorAll('link[href]');
    for (var i = 0; i < links.length; i++) {
      if (/Outfit/.test(links[i].href)) {
        hasOutfit = true;
        break;
      }
    }
    if (!hasOutfit && !document.querySelector('link[data-gw-outfit]')) {
      var font = document.createElement('link');
      font.rel = 'stylesheet';
      font.setAttribute('data-gw-outfit', '1');
      font.href =
        'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap';
      document.head.appendChild(font);
    }

    var header = document.createElement('header');
    header.className = 'gw-chrome gw-dock';
    header.setAttribute('role', 'banner');

    var brand = document.createElement('a');
    brand.className = 'gw-chrome-brand';
    brand.href = origin + '/';
    var img = document.createElement('img');
    img.src = origin + '/assets/img/logo_3d_clean.png';
    img.alt = '';
    img.width = 32;
    img.height = 32;
    var name = document.createElement('strong');
    name.appendChild(document.createTextNode('Goal'));
    var hi = document.createElement('span');
    hi.textContent = 'World';
    name.appendChild(hi);
    brand.appendChild(img);
    brand.appendChild(name);

    var nav = document.createElement('nav');
    nav.className = 'gw-chrome-nav';
    nav.setAttribute('aria-label', 'GoalWorld');
    items.forEach(function (it) {
      var a = document.createElement('a');
      a.href = it.href;
      a.textContent = it.label;
      a.setAttribute('data-gw-id', it.id);
      if (it.id === 'play') a.className = 'gw-chrome-play';
      if (it.id === cur) a.setAttribute('aria-current', 'page');
      nav.appendChild(a);
    });

    header.appendChild(brand);
    header.appendChild(nav);
    document.body.insertBefore(header, document.body.firstChild);
    document.body.classList.add('gw-has-chrome', 'gw-has-dock');
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
