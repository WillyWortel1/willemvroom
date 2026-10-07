(function () {
  var button = document.getElementById("theme");
  if (!button) return;
  var sun = button.querySelector('[data-show]');
  var moon = button.querySelectorAll(".icon-swap")[1];
  function paint() {
    var dark = document.documentElement.classList.contains("dark");
    // De knop heet "Donkere weergave": ingedrukt = donker aan.
    button.setAttribute("aria-pressed", dark ? "true" : "false");
    if (sun) sun.setAttribute("data-show", dark ? "false" : "true");
    if (moon) moon.setAttribute("data-show", dark ? "true" : "false");
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#0a0a0a" : "#ffffff");
  }
  paint();
  button.addEventListener("click", function () {
    var dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("wv-theme", dark ? "dark" : "light"); } catch (e) {}
    paint();
  });
})();
