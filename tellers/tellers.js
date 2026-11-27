(function () {
  "use strict";
  var API = "https://willem-preview.tail3d2af.ts.net/tellers-api/stats";
  var TOKEN_KEY = "wv-tellers-token";
  var form = document.getElementById("pin-form");
  var pinInput = document.getElementById("pin");
  var errorEl = document.getElementById("pin-error");
  var gate = document.getElementById("tellers-gate");
  var dash = document.getElementById("tellers-dash");
  var submitBtn = document.getElementById("pin-submit");
  var refreshBtn = document.getElementById("tellers-refresh");
  var logoutBtn = document.getElementById("tellers-logout");
  var stampEl = document.getElementById("tellers-stamp");
  var sitesEl = document.getElementById("tellers-sites");

  function token() {
    try { return sessionStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; }
  }
  function setToken(value) {
    try {
      if (value) sessionStorage.setItem(TOKEN_KEY, value);
      else sessionStorage.removeItem(TOKEN_KEY);
    } catch (e) {}
  }
  function showError(msg) {
    errorEl.textContent = msg || "";
    errorEl.hidden = !msg;
  }
  function formatNumber(n) {
    return new Intl.NumberFormat("nl-NL").format(n);
  }
  function formatPercent(n) {
    return new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 1 }).format(n) + "%";
  }
  function formatStamp(iso) {
    try {
      var d = new Date(iso);
      return new Intl.DateTimeFormat("nl-NL", {
        timeZone: "Europe/Amsterdam",
        dateStyle: "long",
        timeStyle: "short"
      }).format(d) + " (Nederlandse tijd)";
    } catch (e) {
      return iso;
    }
  }
  function formatDay(isoDate) {
    var parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    return Number(parts[2]) + " " + ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"][Number(parts[1]) - 1];
  }

  function request(body, bearer) {
    var headers = { "Content-Type": "application/json", Accept: "application/json" };
    if (bearer) headers.Authorization = "Bearer " + bearer;
    return fetch(API, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body || {}),
      cache: "no-store"
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        return { status: res.status, data: data };
      });
    });
  }

  function emptyCell(text) {
    var p = document.createElement("p");
    p.className = "tellers-empty";
    p.textContent = text;
    return p;
  }

  function metricsTable(rows, numeric) {
    var wrap = document.createElement("div");
    wrap.className = "tellers-table-wrap";
    var table = document.createElement("table");
    table.className = "tellers-table";
    var thead = document.createElement("thead");
    var hr = document.createElement("tr");
    rows[0].forEach(function (cell, i) {
      var th = document.createElement("th");
      th.scope = "col";
      if (numeric && i > 0) th.className = "num";
      th.textContent = cell;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    var tbody = document.createElement("tbody");
    rows.slice(1).forEach(function (row) {
      var tr = document.createElement("tr");
      row.forEach(function (cell, i) {
        var el = document.createElement(i === 0 ? "th" : "td");
        if (i === 0) el.scope = "row";
        if (numeric && i > 0) el.className = "num";
        el.textContent = cell;
        tr.appendChild(el);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(thead);
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  function namedTable(title, items, nameLabel, emptyText) {
    var block = document.createElement("div");
    block.className = "tellers-block";
    var h = document.createElement("h3");
    h.textContent = title;
    block.appendChild(h);
    if (!items || !items.length) {
      block.appendChild(emptyCell(emptyText));
      return block;
    }
    var rows = [[nameLabel, "Aantal"]];
    items.forEach(function (item) {
      rows.push([item.name || "(onbekend)", formatNumber(item.count || 0)]);
    });
    block.appendChild(metricsTable(rows, true));
    return block;
  }

  function chart(series) {
    var block = document.createElement("div");
    block.className = "tellers-block tellers-chart-wrap";
    var h = document.createElement("h3");
    h.textContent = "Paginaweergaven, 30 dagen";
    block.appendChild(h);
    if (!series || !series.length) {
      block.appendChild(emptyCell("Nog geen reeks om te tonen."));
      return block;
    }
    var max = 0;
    series.forEach(function (d) { if (d.pageviews > max) max = d.pageviews; });
    if (max < 1) max = 1;
    var w = 640, hgt = 200, padL = 36, padR = 8, padT = 12, padB = 36;
    var innerW = w - padL - padR, innerH = hgt - padT - padB;
    var n = series.length;
    function x(i) { return padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW); }
    function y(v) { return padT + innerH - (v / max) * innerH; }
    var points = series.map(function (d, i) { return x(i) + "," + y(d.pageviews); }).join(" ");
    var area = padL + "," + (padT + innerH) + " " + points + " " + x(n - 1) + "," + (padT + innerH);
    var first = series[0], mid = series[Math.floor((n - 1) / 2)], last = series[n - 1];
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "tellers-chart");
    svg.setAttribute("viewBox", "0 0 " + w + " " + hgt);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Paginaweergaven per dag over 30 dagen, piek " + formatNumber(max));
    svg.innerHTML =
      '<line class="grid" x1="' + padL + '" y1="' + y(0) + '" x2="' + (w - padR) + '" y2="' + y(0) + '"></line>' +
      '<line class="grid" x1="' + padL + '" y1="' + y(max) + '" x2="' + (w - padR) + '" y2="' + y(max) + '"></line>' +
      '<polygon class="area" points="' + area + '"></polygon>' +
      '<polyline class="line" points="' + points + '"></polyline>' +
      '<text class="axis" x="' + padL + '" y="' + (hgt - 10) + '">' + formatDay(first.date) + '</text>' +
      '<text class="axis" x="' + (w / 2) + '" y="' + (hgt - 10) + '" text-anchor="middle">' + formatDay(mid.date) + '</text>' +
      '<text class="axis" x="' + (w - padR) + '" y="' + (hgt - 10) + '" text-anchor="end">' + formatDay(last.date) + '</text>' +
      '<text class="axis" x="' + (padL - 6) + '" y="' + (y(max) + 4) + '" text-anchor="end">' + formatNumber(max) + '</text>' +
      '<text class="axis" x="' + (padL - 6) + '" y="' + (y(0) + 4) + '" text-anchor="end">0</text>';
    block.appendChild(svg);
    return block;
  }

  function tiles(range30) {
    var wrap = document.createElement("div");
    wrap.className = "tellers-tiles";
    [
      ["Bezoekers, 30 dagen", formatNumber(range30.visitors)],
      ["Paginaweergaven, 30 dagen", formatNumber(range30.pageviews)],
      ["Bezoeken, 30 dagen", formatNumber(range30.visits)],
      ["Bounce, 30 dagen", formatPercent(range30.bounce_rate)]
    ].forEach(function (item) {
      var tile = document.createElement("div");
      tile.className = "tellers-tile";
      var lab = document.createElement("p");
      lab.className = "tellers-tile-label";
      lab.textContent = item[0];
      var val = document.createElement("p");
      val.className = "tellers-tile-value";
      val.textContent = item[1];
      tile.appendChild(lab);
      tile.appendChild(val);
      wrap.appendChild(tile);
    });
    return wrap;
  }

  function siteSection(site) {
    var section = document.createElement("section");
    section.className = "tellers-site";
    section.setAttribute("aria-labelledby", "site-" + site.domain.replace(/\./g, "-"));
    var h2 = document.createElement("h2");
    h2.className = "section-title";
    h2.id = "site-" + site.domain.replace(/\./g, "-");
    h2.textContent = site.name;
    section.appendChild(h2);
    var r = site.ranges || {};
    var today = r.today || {};
    var d7 = r["7d"] || {};
    var d30 = r["30d"] || {};
    section.appendChild(tiles(d30));
    var periods = document.createElement("div");
    periods.className = "tellers-periods";
    periods.appendChild(metricsTable([
      ["", "Vandaag", "7 dagen", "30 dagen"],
      ["Bezoekers", formatNumber(today.visitors || 0), formatNumber(d7.visitors || 0), formatNumber(d30.visitors || 0)],
      ["Paginaweergaven", formatNumber(today.pageviews || 0), formatNumber(d7.pageviews || 0), formatNumber(d30.pageviews || 0)],
      ["Bezoeken", formatNumber(today.visits || 0), formatNumber(d7.visits || 0), formatNumber(d30.visits || 0)],
      ["Bounce", formatPercent(today.bounce_rate || 0), formatPercent(d7.bounce_rate || 0), formatPercent(d30.bounce_rate || 0)]
    ], true));
    section.appendChild(periods);
    section.appendChild(chart(site.pageviews_daily || []));
    section.appendChild(namedTable("Meest bekeken pagina’s", site.top_pages, "Pagina", "Nog geen pagina’s in deze periode."));
    section.appendChild(namedTable("Verwijzende sites", site.top_referrers, "Bron", "Nog geen verwijzingen in deze periode."));
    section.appendChild(namedTable("Landen", site.countries, "Land", "Nog geen landen in deze periode."));
    section.appendChild(namedTable("Apparaten", site.devices, "Apparaat", "Nog geen apparaten in deze periode."));
    return section;
  }

  function showDash(data) {
    gate.hidden = true;
    dash.hidden = false;
    stampEl.textContent = data.generated_at ? "Bijgewerkt: " + formatStamp(data.generated_at) : "";
    sitesEl.replaceChildren();
    (data.sites || []).forEach(function (site) {
      sitesEl.appendChild(siteSection(site));
    });
    var heading = document.getElementById("tellers-heading");
    if (heading) heading.focus();
  }

  function showGate(msg) {
    dash.hidden = true;
    gate.hidden = false;
    showError(msg);
    if (pinInput) {
      pinInput.value = "";
      pinInput.focus();
    }
  }

  function load(body, bearer) {
    showError("");
    if (submitBtn) submitBtn.disabled = true;
    if (refreshBtn) refreshBtn.disabled = true;
    return request(body, bearer).then(function (res) {
      if (res.status === 200 && res.data && res.data.sites) {
        if (res.data.token) setToken(res.data.token);
        showDash(res.data);
        return;
      }
      setToken("");
      if (res.status === 429) showGate("Te veel pogingen. Probeer het over een kwartier opnieuw.");
      else if (res.status === 401) showGate(body && body.pin ? "Die pincode klopt niet." : "De sessie is verlopen. Vul de pincode opnieuw in.");
      else showGate("De tellers zijn nu niet bereikbaar. Probeer het later opnieuw.");
    }).catch(function () {
      showGate("De tellers zijn nu niet bereikbaar. Probeer het later opnieuw.");
    }).then(function () {
      if (submitBtn) submitBtn.disabled = false;
      if (refreshBtn) refreshBtn.disabled = false;
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var pin = (pinInput && pinInput.value || "").trim();
      if (!pin) {
        showError("Vul de pincode in.");
        pinInput.focus();
        return;
      }
      load({ pin: pin }, "");
    });
  }
  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      var t = token();
      if (!t) { showGate("De sessie is verlopen. Vul de pincode opnieuw in."); return; }
      load({}, t);
    });
  }
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      setToken("");
      showGate("");
    });
  }

  var existing = token();
  if (existing) load({}, existing);
  else if (pinInput) pinInput.focus();
})();
