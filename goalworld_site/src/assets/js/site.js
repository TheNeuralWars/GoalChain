/* GoalWorld site — minimal JS. Nav toggle only; everything else is native HTML. */
(function () {
  var t = document.querySelector(".nav-toggle");
  var n = document.getElementById("site-nav");
  if (!t || !n) return;
  t.addEventListener("click", function () {
    var open = n.classList.toggle("open");
    t.setAttribute("aria-expanded", open ? "true" : "false");
  });
})();

/* 2026-10 redesign: scroll reveal (IntersectionObserver), live feed (runtime fetch of
   same-origin /data/live-feed.json — update the JSON, no UI redeploy needed),
   expand/collapse panels. Zero dependencies; respects prefers-reduced-motion. */
(function () {
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
  var LABEL = { wip: "In progress", submitted: "Submitted", shipped: "Live", hold: "On hold" };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmtDeadline(d) {
    if (!d) return "";
    try { return new Date(d).toLocaleString("en-GB", { timeZone: "Europe/Rome", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) + " Rome"; } catch (e) { return d; }
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
          return '<details class="live-item status-' + esc(i.status) + '" data-kind="' + esc(i.kind) + '" data-status="' + esc(i.status) + '"><summary>' +
            '<div class="live-meta"><span class="live-dot"></span>' + esc(LABEL[i.status] || i.status) + ' · <span class="live-kind">' + esc(i.kind) + "</span>" + (i.provisional ? ' · <span class="faint">provisional</span>' : "") + "</div>" +
            "<h3>" + esc(i.title) + "</h3><p>" + esc(i.blurb) + '</p><p class="more">Details <span class="chev" aria-hidden="true">&#9662;</span></p></summary><div class="live-body">' +
            (i.deadline ? '<p class="live-deadline">Deadline: ' + esc(fmtDeadline(i.deadline)) + "</p>" : "") +
            '<p class="live-upd">Updated ' + esc(i.updated) + (i.provisional ? " · provisional, may change" : "") + "</p>" +
            (i.url ? '<p style="margin-top:.6rem"><a href="' + esc(i.url) + '" rel="noopener">Open project &rarr;</a></p>' : '<p class="faint" style="margin-top:.6rem">No public link yet.</p>') +
            "</div></details>";
        }).join("");
        board.setAttribute("aria-busy", "false");
        return;
      }
      board.innerHTML = list.map(function (i) {
        var tag = i.url ? "a" : "div";
        var href = i.url ? ' href="' + esc(i.url) + '"' : "";
        return "<" + tag + ' class="live-item reveal in status-' + esc(i.status) + '"' + href + ">" +
          '<div class="live-meta"><span class="live-dot"></span>' + esc(LABEL[i.status] || i.status) +
          ' · <span class="live-kind">' + esc(i.kind) + "</span>" + (i.provisional ? ' · <span class="faint">provisional</span>' : "") + "</div>" +
          "<h3>" + esc(i.title) + "</h3><p>" + esc(i.blurb) + "</p>" +
          (i.deadline ? '<p class="live-deadline">Deadline: ' + esc(fmtDeadline(i.deadline)) + "</p>" : "") +
          '<p class="live-upd">Updated ' + esc(i.updated) + "</p></" + tag + ">";
      }).join("");
      board.setAttribute("aria-busy", "false");
    });
    document.querySelectorAll("[data-live-updated]").forEach(function (e) { e.textContent = data.updated || ""; });
  }).catch(function () {
    boards.forEach(function (b) { b.innerHTML = '<p class="muted">Live board unavailable right now — follow <a href="https://x.com/nicopez">@nicopez</a> for updates.</p>'; b.setAttribute("aria-busy", "false"); });
  });
})();

/* PASS2: nav close, live filters + detail panels, roadmap tabs, FAQ search/expand,
   legal TOC, 404 quick search. */
(function () {
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
      var c = document.querySelector("[data-live-count]"); if (c && items.length) c.textContent = shown + " of " + items.length + " projects";
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
      cnt.textContent = v ? shown + " matching question" + (shown === 1 ? "" : "s") : "";
    });
    var all = document.querySelector("[data-faq-all]");
    if (all) all.addEventListener("click", function () {
      var open = all.textContent.indexOf("Expand") === 0;
      qs.forEach(function (d) { d.open = open; });
      all.textContent = open ? "Collapse all" : "Expand all";
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
    var MAP = [["lore|about|story|character|neo|book|studio", "/about.html"], ["faq|question|help|wallet|token", "/faq.html"], ["press|logo|kit|media|asset", "/press.html"], ["roadmap|plan|next", "/roadmap.html"], ["live|hackathon|status|project", "/live.html"], ["read|reader|fractured", "https://goalworld.fun/go/reader/"], ["play|game|match|goalchain", "https://play.goalworld.fun/"], ["privacy|data|cookie", "/privacy.html"], ["terms|legal", "/terms.html"]];
    nf.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = nf.querySelector("input").value.toLowerCase();
      for (var i = 0; i < MAP.length; i++) if (new RegExp(MAP[i][0]).test(v)) { location.href = MAP[i][1]; return; }
      nf.querySelector("[data-nf-hint]").textContent = "No match — try lore, faq, press, roadmap, live, read or play.";
    });
  }
})();
