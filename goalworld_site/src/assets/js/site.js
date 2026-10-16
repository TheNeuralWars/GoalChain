/* GoalWorld site — minimal JS. Nav toggle + waitlist form enhancement; everything works without JS. */
(function () {
  var t = document.querySelector(".nav-toggle");
  var n = document.getElementById("site-nav");
  if (!t || !n) return;
  t.addEventListener("click", function () {
    var open = n.classList.toggle("open");
    t.setAttribute("aria-expanded", open ? "true" : "false");
  });
})();

(function () {
  var f = document.querySelector(".waitlist-form");
  if (!f) return;
  var msg = document.querySelector(".waitlist-msg");
  var q = new URLSearchParams(location.search).get("waitlist");
  if (q && msg) msg.textContent = q === "ok" ? "You're in! Check your inbox." : "Something went wrong. Please try again.";
  f.addEventListener("submit", function (e) {
    if (!window.fetch) return;
    e.preventDefault();
    var b = f.querySelector("button"); b.disabled = true; msg.textContent = "Joining…";
    fetch(f.action, { method: "POST", headers: { accept: "application/json" }, body: new FormData(f) })
      .then(function (r) { return r.json().then(function (d) { return { s: r.status, d: d }; }); })
      .then(function (x) {
        if (x.d.ok) { msg.textContent = x.d.already ? "You're already on the list. Thanks!" : "You're in! Check your inbox."; f.reset(); }
        else msg.textContent = x.s === 429 ? "Too many tries. Please wait a bit." : "That email doesn't look right.";
      })
      .catch(function () { msg.textContent = "Network error. Please try again."; })
      .then(function () { b.disabled = false; });
  });
})();
