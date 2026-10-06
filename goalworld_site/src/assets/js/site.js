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
