/**
 * Foilassist ervaringen – Apps Script web-app (gekoppeld aan de Sheet "Foilassist ervaringen").
 * doGet  → recente, niet-verborgen ervaringen als JSON (?spot=Naam optioneel, ?limit=50)
 * doPost → controleert en bewaart één ervaring (body = JSON, Content-Type text/plain)
 * Verbergen: vink 'verborgen' aan in de Sheet. Verwijderen: rij verwijderen.
 */
const SHEET_NAME = '';            // leeg = eerste tabblad
const SPOTS_URL = 'https://willemvroom.nl/foilassist/spots.js';
const MAX_PER_SPOT = 5, PER_SPOT_WINDOW_S = 600;   // max 5 per spot per 10 min
const MAX_PER_DAY = 100;                           // max 100 per dag in totaal
const MIN_FILL_MS = 5000;                          // formulier minstens 5 s open
const HEADERS = ['id','ontvangen','verborgen','spot','naam','sessie','hoe_ging_het','golven','wind','stroming','drukte','omstandigheden_tekst','merk_board','type_board','board','merk_foil','voorvleugel','mast','mastlengte','fuselage','foilassist','batterij_type','batterij_capaciteit','batterij_aantal','gebruiksduur','oefenen','beoordeling','taal'];
const LIMITS = {mastlengte:10, naam:40, hoe_ging_het:1500, omstandigheden_tekst:500, oefenen:300};  // overige tekstvelden: 100
const PICKS = {golven:['flat','klein','goed','groot','te groot'], wind:['geen','licht','matig','hard','te hard'], stroming:['geen','zwak','matig','sterk'], drukte:['leeg','rustig','druk','erg druk']};
const PUBLIC = ['id','ontvangen','spot','naam','sessie','hoe_ging_het','golven','wind','stroming','drukte','omstandigheden_tekst','merk_board','type_board','board','merk_foil','voorvleugel','mast','mastlengte','fuselage','foilassist','batterij_type','batterij_capaciteit','batterij_aantal','gebruiksduur','oefenen','beoordeling'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  else if (sh.getLastRow() === 1 && sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].join() !== HEADERS.join()) {
    sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), HEADERS.length)).clearContent();
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);    // kopregel bijwerken zolang er nog geen verslagen zijn
  }
  return sh;
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function clean_(v, max) {
  if (v == null) return '';
  let s = String(v);
  s = s.replace(/<[^>]*>/g, ' ')                                  // HTML weg
       .replace(/\b(?:https?:\/\/|www\.)\S+/gi, '[link verwijderd]') // links weg
       .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
       .replace(/^[=+\-@]+/, '')                                    // geen spreadsheet-formules
       .trim();
  return s.slice(0, max || 100);
}

function spots_() {
  const c = CacheService.getScriptCache(), hit = c.get('spots');
  if (hit) return JSON.parse(hit);
  const src = UrlFetchApp.fetch(SPOTS_URL, {muteHttpExceptions: true}).getContentText();
  const names = [], re = /naam:\s*"((?:[^"\\]|\\.)*)"/g; let m;
  while ((m = re.exec(src))) names.push(JSON.parse('"' + m[1] + '"'));
  if (names.length) c.put('spots', JSON.stringify(names), 21600);
  return names;
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  const limit = Math.min(200, Math.max(1, parseInt(p.limit, 10) || 50));
  const sh = sheet_(), n = sh.getLastRow();
  if (n < 2) return json_({ok: true, reports: []});
  const rows = sh.getRange(2, 1, n - 1, HEADERS.length).getValues();
  const out = [];
  for (let i = rows.length - 1; i >= 0 && out.length < limit; i--) {
    const r = {}; HEADERS.forEach((h, k) => r[h] = rows[i][k]);
    if (r.verborgen === true || String(r.verborgen).toUpperCase() === 'TRUE' || !r.spot) continue;
    if (p.spot && r.spot !== p.spot) continue;
    const o = {}; PUBLIC.forEach(h => o[h] = r[h] instanceof Date ? r[h].toISOString() : String(r[h]));
    out.push(o);
  }
  return json_({ok: true, reports: out});
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (x) { return json_({ok: false, error: 'bad_json'}); }
  if (d.website) return json_({ok: true});                          // honeypot: stil negeren
  if (!(Number(d.elapsed) >= MIN_FILL_MS)) return json_({ok: false, error: 'too_fast'});
  const spot = clean_(d.spot, 100);
  if (spots_().indexOf(spot) < 0) return json_({ok: false, error: 'unknown_spot'});
  const t = new Date(String(d.sessie || ''));
  const now = Date.now();
  if (isNaN(t) || t.getTime() > now + 36e5 * 24 || t.getTime() < now - 36e5 * 24 * 60) return json_({ok: false, error: 'bad_date'});
  const rating = Number(d.beoordeling);
  if (!(rating >= 0 && rating <= 5)) return json_({ok: false, error: 'bad_rating'});
  if (!clean_(d.hoe_ging_het, 1500)) return json_({ok: false, error: 'empty'});

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return json_({ok: false, error: 'busy'});
  try {
    const props = PropertiesService.getScriptProperties();
    const day = Utilities.formatDate(new Date(), 'Europe/Amsterdam', 'yyyy-MM-dd');
    const dayCount = Number(props.getProperty('day_' + day) || 0);
    if (dayCount >= MAX_PER_DAY) return json_({ok: false, error: 'rate_day'});
    const cache = CacheService.getScriptCache(), key = 'spot_' + Utilities.base64EncodeWebSafe(spot).slice(0, 200);
    const spotCount = Number(cache.get(key) || 0);
    if (spotCount >= MAX_PER_SPOT) return json_({ok: false, error: 'rate_spot'});

    const r = {id: Utilities.getUuid().slice(0, 8), ontvangen: new Date(), verborgen: false, spot: spot,
      sessie: Utilities.formatDate(t, 'UTC', "yyyy-MM-dd'T'HH:mm'Z'"), beoordeling: Math.round(rating * 2) / 2,
      taal: ['nl','en','de'].indexOf(d.taal) >= 0 ? d.taal : ''};
    HEADERS.forEach(h => { if (!(h in r)) r[h] = clean_(d[h], LIMITS[h] || 100); });
    if (r.mastlengte && !/^\d{2,3}$/.test(r.mastlengte)) r.mastlengte = '';
    Object.keys(PICKS).forEach(k => { if (r[k] && PICKS[k].indexOf(r[k]) < 0) r[k] = ''; });
    const sh = sheet_();
    sh.appendRow(HEADERS.map(h => r[h]));
    sh.getRange(sh.getLastRow(), HEADERS.indexOf('verborgen') + 1).insertCheckboxes();
    props.setProperty('day_' + day, String(dayCount + 1));
    cache.put(key, String(spotCount + 1), PER_SPOT_WINDOW_S);
    return json_({ok: true, id: r.id});
  } finally { lock.releaseLock(); }
}

/** Eenmalig handmatig uitvoeren (optioneel): zet selectievakjes in kolom 'verborgen' en test de spotlijst. */
function setup() {
  const sh = sheet_(), n = Math.max(sh.getLastRow(), 2);
  sh.getRange(2, HEADERS.indexOf('verborgen') + 1, n - 1, 1).insertCheckboxes();
  sh.setFrozenRows(1);
  Logger.log('Spots gevonden: ' + spots_().length);
}
