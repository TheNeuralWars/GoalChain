(function () {
  /** Shared dual-DOM language toggle for long-form content pages.
   *
   *  Persists gc_lang, sets <html lang>, toggles .active on every
   *  <div class="lang-toggle"><button data-lang="en|es">…</button></div>.
   *  Works alongside docs/assets/js/i18n.js (which owns the separate
   *  `setLang` global for the data-i18n attribute system); this module
   *  exposes a UNIQUELY-NAMED global `gcSetLang` to avoid collisions.
   *
   *  Pages using this helper must define:
   *    [lang="es"] .lang-en { display: none !important; }
   *    [lang="en"] .lang-es { display: none !important; }
   *  and mark the two language variants with class="lang-en"/class="lang-es".
   */
  function apply(lang) {
    if (lang !== 'es' && lang !== 'en') lang = 'en';
    try { localStorage.setItem('gc_lang', lang); } catch (e) {}
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-toggle button[data-lang]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
  }
  window.gcSetLang = apply;

  function init() {
    var lang = 'en';
    try { lang = localStorage.getItem('gc_lang') || 'en'; } catch (e) {}
    apply(lang);
    document.querySelectorAll('.lang-toggle button[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-lang')); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
