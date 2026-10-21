/* Willem: n.v.t.-schakelaar per stap (alleen weergave, berekening blijft gelijk) */
(function () {
  var K = "wv-nvt-stap-", KH = "wv-nvt-verberg";
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} }
  function stepNr(sec) {
    var p = sec.querySelector(":scope>details>summary>div.min-w-0>p");
    var m = p && /Stap\s+(\d+)/i.exec(p.textContent || "");
    return m ? m[1] : null;
  }
  function apply(sec, n) {
    var on = get(K + n) === "1", d = sec.querySelector(":scope>details");
    sec.classList.toggle("wv-nvt", on);
    var b = sec.querySelector(".wv-nvt-btn");
    if (b) b.setAttribute("aria-checked", on ? "true" : "false");
    if (on && d && d.open) d.open = false;
  }
  function link() {
    var any = document.querySelector("section.wv-nvt"), l = document.getElementById("wv-nvt-link");
    var first = document.querySelector("section[id]");
    if (!first) return;
    if (!l) {
      l = document.createElement("button");
      l.type = "button"; l.id = "wv-nvt-link";
      l.addEventListener("click", function () { put(KH, get(KH) === "1" ? null : "1"); upd(); });
      first.parentElement.insertAdjacentElement("afterend", l);
    }
    function upd() {
      var h = get(KH) === "1";
      document.documentElement.classList.toggle("wv-nvt-hide", h);
      l.textContent = h ? "Toon n.v.t.-stappen" : "Verberg n.v.t.-stappen";
    }
    upd();
    l.hidden = !any;
  }
  function scan() {
    document.querySelectorAll("section[id]").forEach(function (sec) {
      var n = stepNr(sec); if (!n) return;
      var s = sec.querySelector(":scope>details>summary");
      if (!s.querySelector(".wv-nvt-btn")) {
        var b = document.createElement("span");
        b.className = "wv-nvt-btn"; b.setAttribute("role", "switch"); b.tabIndex = 0;
        b.setAttribute("aria-label", "Stap " + n + " niet van toepassing");
        b.innerHTML = '<span class="wv-nvt-track"><span class="wv-nvt-knob"></span></span><span class="wv-nvt-txt">n.v.t.</span>';
        function flip(e) {
          e.preventDefault(); e.stopPropagation();
          put(K + n, get(K + n) === "1" ? null : "1"); apply(sec, n); link();
        }
        b.addEventListener("click", flip);
        b.addEventListener("keydown", function (e) { if (e.key === " " || e.key === "Enter") flip(e); });
        var svg = s.querySelector(":scope>svg");
        s.insertBefore(b, svg || null);
      }
      if (!sec.dataset.wvNvt) {
        sec.dataset.wvNvt = "1";
        s.addEventListener("click", function (e) {
          if (sec.classList.contains("wv-nvt") && !e.target.closest(".wv-nvt-btn")) e.preventDefault();
        }, true);
        sec.querySelector(":scope>details").addEventListener("toggle", function (e) {
          if (sec.classList.contains("wv-nvt") && e.target.open) e.target.open = false;
        });
      }
      apply(sec, n);
    });
    link();
  }
  /* Wissen = alles weer 100%: n.v.t. en verbergen ook terug */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("button");
    if (!b || (b.textContent || "").trim() !== "Wissen" || b.closest("section[id]")) return; /* Wissen binnen box 3 wist alleen box 3 */
    try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf(K) === 0 || k === KH) localStorage.removeItem(k); }); } catch (x) {}
    setTimeout(scan, 0);
  }, true);
  var t;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(scan, 30); })
    .observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["open"] });
  scan();
})();
/* Willem: site-kop (willemvroom.nl + thema) zoals de rest van de site */
(function () {
  function appBtn() { return document.querySelector('header button[aria-label$="thema"]'); }
  function isDark() { return document.documentElement.classList.contains("dark"); }
  function head() {
    if (document.querySelector(".wv-head")) return;
    var h = document.querySelector("header.sticky");
    if (!h) return;
    var d = document.createElement("div");
    d.className = "wv-head";
    d.innerHTML = '<a href="/" class="home">willemvroom.nl</a><button id="thm" type="button" aria-label="Thema wisselen"><svg class="moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg><svg class="sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button>';
    h.parentNode.insertBefore(d, h);
    d.querySelector("#thm").addEventListener("click", function () {
      var b = appBtn();
      if (b) b.click(); else document.documentElement.classList.toggle("dark");
      setTimeout(function () {
        var t = isDark() ? "dark" : "light";
        try { localStorage.setItem("wv-theme", t); localStorage.setItem("aangifte-theme", t); } catch (e) {}
        var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", t === "dark" ? "#0b0b0b" : "#f6f6f6");
      }, 0);
    });
  }
  function foot() {
    var a = document.querySelector('a[href="https://www.willemvroom.nl"]');
    if (!a || document.querySelector(".wv-copy")) return;
    var p = document.createElement("p"); p.className = "wv-copy"; p.textContent = "© 2026";
    (a.parentElement || a).insertAdjacentElement("afterend", p);
  }
  /* site-thema (wv-theme) volgen als de app iets anders toont */
  function sync() {
    var w; try { w = localStorage.getItem("wv-theme"); } catch (e) {}
    if (!w) return;
    if ((w === "dark") !== isDark()) { var b = appBtn(); if (b) b.click(); else document.documentElement.classList.toggle("dark", w === "dark"); }
  }
  var done = false;
  function run() { head(); foot(); if (!done && appBtn()) { done = true; sync(); } }
  function start() { setTimeout(function () { new MutationObserver(run).observe(document.body, { childList: true, subtree: true }); run(); }, 400); }
  if (document.readyState === "complete") start(); else window.addEventListener("load", start);
})();
