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
