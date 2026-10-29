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
