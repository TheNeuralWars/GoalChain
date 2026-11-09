/* GoalWorld site — minimal JS. Nav toggle, language switcher persistence,
   live feed, filters, FAQ search, legal TOC, 404 search, reader controls. */
(function () {
  var t = document.querySelector(".nav-toggle");
  var n = document.getElementById("site-nav");
  if (!t || !n) return;
  t.addEventListener("click", function () {
    var open = n.classList.toggle("open");
    t.setAttribute("aria-expanded", open ? "true" : "false");
  });
})();

/* Language switcher persistence (gw_lang + gc_lang in localStorage).
   Never auto-redirects bots or headless browsers. */
(function () {
  var docLang = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
  if (docLang !== "es" && docLang !== "it") docLang = "en";

  var links = document.querySelectorAll("[data-lang-switcher] [data-lang-choice]");
  links.forEach(function (link) {
    link.addEventListener("click", function () {
      var chosen = link.getAttribute("data-lang-choice");
      if (chosen) {
        try {
          localStorage.setItem("gw_lang", chosen);
          localStorage.setItem("gc_lang", chosen);
        } catch (e) {}
      }
    });
  });

  var ua = (navigator && navigator.userAgent) || "";
  var isBot =
    Boolean(navigator && navigator.webdriver) ||
    /bot|crawl|spider|slurp|lighthouse|headless|playwright|puppeteer|prerender/i.test(ua);

  if (!isBot) {
    try {
      var saved = localStorage.getItem("gw_lang") || localStorage.getItem("gc_lang");
      var sameOriginRef = false;
      if (document.referrer) {
        try {
          sameOriginRef = new URL(document.referrer).origin === location.origin;
        } catch (e) {}
      }
      if (
        (saved === "en" || saved === "es" || saved === "it") &&
        saved !== docLang &&
        !sameOriginRef
      ) {
        var targetLink = document.querySelector(
          '[data-lang-switcher] [data-lang-choice="' + saved + '"]'
        );
        if (targetLink && targetLink.getAttribute("href")) {
          location.replace(targetLink.getAttribute("href") + (location.hash || ""));
        }
      }
    } catch (e) {}
  }
})();

/* Runtime i18n dictionary for live feed, FAQ search, and 404 search */
var GW_RUNTIME_I18N = {
  en: {
    status: { wip: "In progress", submitted: "Submitted", shipped: "Live", hold: "On hold" },
    kind: { hackathon: "hackathon", book: "book", film: "film", product: "product", ops: "ops" },
    provisional: "provisional",
    details: "Details",
    deadline: "Deadline: ",
    updated: "Updated ",
    provisionalNote: " · provisional, may change",
    openProject: "Open project &rarr;",
    noLink: "No public link yet.",
    unavailable:
      'Live board unavailable right now — follow <a href="https://x.com/nicopez">@nicopez</a> for updates.',
    countProjects: function (shown, total) {
      return shown + " of " + total + " projects";
    },
    faqMatches: function (shown) {
      return shown + " matching question" + (shown === 1 ? "" : "s");
    },
    expandAll: "Expand all",
    collapseAll: "Collapse all",
    nfNoMatch: "No match — try lore, faq, press, roadmap, live, read or play.",
    dateLocale: "en-GB",
  },
  es: {
    status: { wip: "En curso", submitted: "Enviado", shipped: "Activo", hold: "En pausa" },
    kind: { hackathon: "hackathon", book: "libro", film: "cine", product: "producto", ops: "ops" },
    provisional: "provisional",
    details: "Detalles",
    deadline: "Fecha límite: ",
    updated: "Actualizado ",
    provisionalNote: " · provisional, sujeto a cambios",
    openProject: "Abrir proyecto &rarr;",
    noLink: "Aún sin enlace público.",
    unavailable:
      'El tablero en vivo no está disponible ahora — seguí a <a href="https://x.com/nicopez">@nicopez</a> para novedades.',
    countProjects: function (shown, total) {
      return shown + " de " + total + " proyectos";
    },
    faqMatches: function (shown) {
      return shown + (shown === 1 ? " pregunta coincidente" : " preguntas coincidentes");
    },
    expandAll: "Expandir todo",
    collapseAll: "Contraer todo",
    nfNoMatch: "Sin coincidencias — probá con lore, faq, prensa, ruta, vivo, leer o jugar.",
    dateLocale: "es-AR",
  },
  it: {
    status: { wip: "In corso", submitted: "Inviato", shipped: "Attivo", hold: "In pausa" },
    kind: { hackathon: "hackathon", book: "libro", film: "cinema", product: "prodotto", ops: "ops" },
    provisional: "provvisorio",
    details: "Dettagli",
    deadline: "Scadenza: ",
    updated: "Aggiornato ",
    provisionalNote: " · provvisorio, soggetto a modifiche",
    openProject: "Apri progetto &rarr;",
    noLink: "Nessun link pubblico disponibile.",
    unavailable:
      'La bacheca live non è disponibile al momento — segui <a href="https://x.com/nicopez">@nicopez</a> per gli aggiornamenti.',
    countProjects: function (shown, total) {
      return shown + " di " + total + " progetti";
    },
    faqMatches: function (shown) {
      return shown + (shown === 1 ? " domanda corrispondente" : " domande corrispondenti");
    },
    expandAll: "Espandi tutto",
    collapseAll: "Comprimi tutto",
    nfNoMatch: "Nessun risultato — prova con lore, faq, press, roadmap, live, leggi o gioca.",
    dateLocale: "it-IT",
  },
};

/* 2026-10 redesign: scroll reveal (IntersectionObserver), live feed (runtime fetch of
   same-origin /data/live-feed.json — update the JSON, no UI redeploy needed),
   expand/collapse panels. Zero dependencies; respects prefers-reduced-motion. */
(function () {
  var lang = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
  if (lang !== "es" && lang !== "it") lang = "en";
  var L = GW_RUNTIME_I18N[lang] || GW_RUNTIME_I18N.en;

  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var els = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  document.querySelectorAll("[data-expand]").forEach(function (b) {
    b.addEventListener("click", function () {
      var p = document.getElementById(b.getAttribute("aria-controls"));
      var open = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", open ? "true" : "false");
      if (p) p.classList.toggle("open", open);
      var l = b.querySelector(".lbl"); if (l) l.textContent = open ? b.dataset.less : b.dataset.more;
    });
  });

  var boards = document.querySelectorAll("[data-live-feed]");
  if (!boards.length) return;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmtDeadline(d) {
    if (!d) return "";
    try { return new Date(d).toLocaleString(L.dateLocale, { timeZone: "Europe/Rome", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) + " Rome"; } catch (e) { return d; }
  }
  function localizeUrl(u) {
    if (!u || lang === "en") return u;
    if (/^\/[a-z0-9-]+\.html/i.test(u)) return "/" + lang + u;
    return u;
  }
  fetch("/data/live-feed.json", { cache: "no-cache" }).then(function (r) {
    if (!r.ok) throw new Error(r.status); return r.json();
  }).then(function (data) {
    var order = { wip: 0, submitted: 1, shipped: 2, hold: 3 };
    var items = (data.items || []).slice().sort(function (a, b) { return (order[a.status] - order[b.status]) || String(b.updated).localeCompare(String(a.updated)); });
    boards.forEach(function (board) {
      var max = parseInt(board.dataset.max || "99", 10);
      var filter = board.dataset.kind;
      var list = items.filter(function (i) { return !filter || i.kind === filter; }).slice(0, max);
      if (board.hasAttribute("data-detail")) {
        board.innerHTML = list.map(function (i) {
          var title = (lang !== "en" && i["title_" + lang]) || i.title;
          var blurb = (lang !== "en" && i["blurb_" + lang]) || i.blurb;
          var url = localizeUrl(i.url);
          var kindLabel = (L.kind && L.kind[i.kind]) || i.kind;
          return '<details class="live-item status-' + esc(i.status) + '" data-kind="' + esc(i.kind) + '" data-status="' + esc(i.status) + '"><summary>' +
            '<div class="live-meta"><span class="live-dot"></span>' + esc(L.status[i.status] || i.status) + ' · <span class="live-kind">' + esc(kindLabel) + "</span>" + (i.provisional ? ' · <span class="faint">' + esc(L.provisional) + "</span>" : "") + "</div>" +
            "<h3>" + esc(title) + "</h3><p>" + esc(blurb) + '</p><p class="more">' + esc(L.details) + ' <span class="chev" aria-hidden="true">&#9662;</span></p></summary><div class="live-body">' +
            (i.deadline ? '<p class="live-deadline">' + esc(L.deadline) + esc(fmtDeadline(i.deadline)) + "</p>" : "") +
            '<p class="live-upd">' + esc(L.updated) + esc(i.updated) + (i.provisional ? esc(L.provisionalNote) : "") + "</p>" +
            (url ? '<p style="margin-top:.6rem"><a href="' + esc(url) + '" rel="noopener">' + L.openProject + "</a></p>" : '<p class="faint" style="margin-top:.6rem">' + esc(L.noLink) + "</p>") +
            "</div></details>";
        }).join("");
        board.setAttribute("aria-busy", "false");
        return;
      }
      board.innerHTML = list.map(function (i) {
        var title = (lang !== "en" && i["title_" + lang]) || i.title;
        var blurb = (lang !== "en" && i["blurb_" + lang]) || i.blurb;
        var url = localizeUrl(i.url);
        var kindLabel = (L.kind && L.kind[i.kind]) || i.kind;
        var tag = url ? "a" : "div";
        var href = url ? ' href="' + esc(url) + '"' : "";
        return "<" + tag + ' class="live-item reveal in status-' + esc(i.status) + '"' + href + ">" +
          '<div class="live-meta"><span class="live-dot"></span>' + esc(L.status[i.status] || i.status) +
          ' · <span class="live-kind">' + esc(kindLabel) + "</span>" + (i.provisional ? ' · <span class="faint">' + esc(L.provisional) + "</span>" : "") + "</div>" +
          "<h3>" + esc(title) + "</h3><p>" + esc(blurb) + "</p>" +
          (i.deadline ? '<p class="live-deadline">' + esc(L.deadline) + esc(fmtDeadline(i.deadline)) + "</p>" : "") +
          '<p class="live-upd">' + esc(L.updated) + esc(i.updated) + "</p></" + tag + ">";
      }).join("");
      board.setAttribute("aria-busy", "false");
    });
    document.querySelectorAll("[data-live-updated]").forEach(function (e) { e.textContent = data.updated || ""; });
  }).catch(function () {
    boards.forEach(function (b) { b.innerHTML = '<p class="muted">' + L.unavailable + "</p>"; b.setAttribute("aria-busy", "false"); });
  });
})();

/* PASS2: nav close, live filters + detail panels, roadmap tabs, FAQ search/expand,
   legal TOC, 404 quick search. */
(function () {
  var lang = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
  if (lang !== "es" && lang !== "it") lang = "en";
  var L = GW_RUNTIME_I18N[lang] || GW_RUNTIME_I18N.en;
  var prefix = lang === "en" ? "" : "/" + lang;

  var n = document.getElementById("site-nav"), t = document.querySelector(".nav-toggle");
  if (n && t) {
    n.addEventListener("click", function (e) { if (e.target.closest("a")) { n.classList.remove("open"); t.setAttribute("aria-expanded", "false"); } });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && n.classList.contains("open")) { n.classList.remove("open"); t.setAttribute("aria-expanded", "false"); t.focus(); } });
  }
  function press(group, btn) { group.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); }); }

  // Live board filters (applied after the runtime feed renders)
  var bar = document.querySelector("[data-live-filters]");
  if (bar) {
    var kinds = [].slice.call(bar.querySelectorAll("[data-f-kind]")), sts = [].slice.call(bar.querySelectorAll("[data-f-status]"));
    var st = { kind: "", status: "" };
    var apply = function () {
      var items = document.querySelectorAll("[data-live-feed] .live-item"), shown = 0;
      items.forEach(function (i) { var ok = (!st.kind || i.dataset.kind === st.kind) && (!st.status || i.dataset.status === st.status); i.hidden = !ok; if (ok) shown++; });
      var c = document.querySelector("[data-live-count]"); if (c && items.length) c.textContent = L.countProjects(shown, items.length);
    };
    kinds.forEach(function (b) { b.addEventListener("click", function () { st.kind = b.dataset.fKind; press(kinds, b); apply(); }); });
    sts.forEach(function (b) { b.addEventListener("click", function () { st.status = b.dataset.fStatus; press(sts, b); apply(); }); });
    var fb = document.querySelector("[data-live-feed]");
    if (fb && "MutationObserver" in window) new MutationObserver(apply).observe(fb, { childList: true });
  }

  // Roadmap stage tabs
  var rt = document.querySelector("[data-roadmap-tabs]");
  if (rt) {
    var tabs = [].slice.call(rt.querySelectorAll("[data-stage]"));
    tabs.forEach(function (b) { b.addEventListener("click", function () {
      press(tabs, b);
      document.querySelectorAll("[data-stage-section]").forEach(function (s) { s.hidden = !!b.dataset.stage && s.dataset.stageSection !== b.dataset.stage; });
    }); });
  }

  // FAQ search + expand all
  var fq = document.querySelector("[data-faq-search]");
  if (fq) {
    var qs = [].slice.call(document.querySelectorAll("details.faq-item"));
    var cnt = document.querySelector("[data-faq-count]");
    fq.addEventListener("input", function () {
      var v = fq.value.trim().toLowerCase(), shown = 0;
      qs.forEach(function (d) { var ok = !v || d.textContent.toLowerCase().indexOf(v) > -1; d.hidden = !ok; if (ok) { shown++; if (v) d.open = true; } });
      cnt.textContent = v ? L.faqMatches(shown) : "";
    });
    var all = document.querySelector("[data-faq-all]");
    if (all) all.addEventListener("click", function () {
      var open = all.getAttribute("data-expanded") !== "true";
      qs.forEach(function (d) { d.open = open; });
      all.setAttribute("data-expanded", open ? "true" : "false");
      all.textContent = open ? L.collapseAll : L.expandAll;
    });
    if (location.hash) { var h = document.getElementById(location.hash.slice(1)); if (h && h.tagName === "DETAILS") h.open = true; }
  }

  // Legal TOC
  var toc = document.querySelector("[data-toc] ol"), src = document.querySelector("[data-toc-src]");
  if (toc && src) {
    src.querySelectorAll("h2").forEach(function (h, i) {
      if (!h.id) h.id = "s-" + (h.textContent.toLowerCase().replace(/^\d+\.\s*/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || i);
      var li = document.createElement("li"), a = document.createElement("a");
      a.href = "#" + h.id; a.textContent = h.textContent.replace(/^\d+\.\s*/, ""); li.appendChild(a); toc.appendChild(li);
    });
  }

  // 404 quick search
  var nf = document.querySelector("[data-nf-search]");
  if (nf) {
    var MAP = [
      ["lore|about|story|character|neo|book|studio|historia|storia|personajes|personaggi|universo", prefix + "/about.html"],
      ["faq|question|help|wallet|token|preguntas|domande|ayuda|aiuto|billetera", prefix + "/faq.html"],
      ["press|logo|kit|media|asset|prensa|stampa", prefix + "/press.html"],
      ["roadmap|plan|next|hoja|ruta|piano", prefix + "/roadmap.html"],
      ["live|hackathon|status|project|vivo|estado|stato|proyecto|progetto", prefix + "/live.html"],
      ["read|reader|fractured|leer|leggi|libro", prefix + "/book.html#sample"],
      ["play|game|match|goalchain|jugar|gioca|juego|gioco", "https://play.goalworld.fun/"],
      ["privacy|data|cookie|privacidad|datos|dati", prefix + "/privacy.html"],
      ["terms|legal|terminos|términos|termini|legale", prefix + "/terms.html"]
    ];
    nf.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = nf.querySelector("input").value.toLowerCase();
      for (var i = 0; i < MAP.length; i++) if (new RegExp(MAP[i][0]).test(v)) { location.href = MAP[i][1]; return; }
      nf.querySelector("[data-nf-hint]").textContent = L.nfNoMatch;
    });
  }

  // Book #sample reader font-size controls + sticky CTA auto-hide while reading (A-013, A-020)
  var rBtns = [].slice.call(document.querySelectorAll("[data-reader-font]"));
  var rProse = document.querySelector("[data-reader-prose]");
  if (rBtns.length && rProse) {
    rBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        press(rBtns, btn);
        rProse.style.setProperty("--reader-fs", btn.dataset.readerFont);
      });
    });
  }
  var sampleSec = document.getElementById("sample");
  var siteFooter = document.querySelector(".site-footer");
  var stickyBar = document.querySelector("[data-sticky-cta]");
  if (stickyBar && "IntersectionObserver" in window) {
    var activeZones = new Set();
    var hideObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) activeZones.add(entry.target);
        else activeZones.delete(entry.target);
      });
      stickyBar.classList.toggle("is-hidden", activeZones.size > 0);
    }, { threshold: 0.08 });
    if (sampleSec) hideObs.observe(sampleSec);
    if (siteFooter) hideObs.observe(siteFooter);
  }
})();
