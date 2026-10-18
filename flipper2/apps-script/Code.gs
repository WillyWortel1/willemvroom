/**
 * FLIPPER! II – gedeelde top 10 – Apps Script web-app (gekoppeld aan de Sheet "FLIPPER! II scores").
 * doGet  → top 10 (niet-verborgen) als JSON: {ok:true, top:[{n,s,l,d}]}
 * doPost → controleert en bewaart één score (body = JSON, Content-Type text/plain):
 *          {name, score, level, elapsed, website}
 * Verbergen: vink 'verborgen' aan in de Sheet. Verwijderen: rij verwijderen.
 * Er wordt geen e-mailadres of IP opgeslagen of getoond.
 */
const SHEET_NAME = '';                 // leeg = eerste tabblad
const HEADERS = ['id','ontvangen','verborgen','naam','score','niveau','speelduur_s'];
const KEEP_ROWS = 100;                 // alleen de beste 100 scores bewaren
const MAX_SCORE = 50000000;            // hoger = niet geloofwaardig
const MAX_LEVEL = 50;
const MAX_POINTS_PER_S = 40000;        // sneller scoren kan niet (normaal spel: < 10.000/s)
const MIN_GAME_MS = 15000;             // een spel duurt minstens 15 s
const MAX_PER_NAME = 3, PER_NAME_WINDOW_S = 600;   // max 3 per naam per 10 min
const MAX_PER_DAY = 500;               // max 500 per dag in totaal
const CACHE_TOP_S = 60;                // top 10 een minuut in de cache

// Eenvoudig scheldwoordenfilter (NL/EN). Lange woorden: komt voor in de naam; korte: alleen als los woord.
const BAD_PARTS = ['kanker','tering','tyfus','klootzak','neuk','hoer','kut','fuck','shit','bitch','cunt','nigger','nigga','hitler','nazi','slet','penis','vagina','porno','kkr','pedo','whore','asshole','retard','mongool'];
const BAD_WORDS = ['lul','pik','sex','seks','cock','dick','fag','homo','tits','anus','gay','kk','sukkel'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
  if (sh.getLastRow() === 0) { sh.appendRow(HEADERS); sh.setFrozenRows(1); }
  return sh;
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function cleanName_(v) {
  return String(v == null ? '' : v)
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u001F\u007F<>]/g, '')
    .replace(/^[=+\-@]+/, '')            // geen spreadsheet-formules
    .replace(/\s+/g, ' ')
    .trim().slice(0, 12);
}
function isRude_(name) {
  const lower = name.toLowerCase();
  const norm = lower.replace(/[0@4]/g, m => m === '0' ? 'o' : 'a').replace(/1|!|\|/g, 'i').replace(/3/g, 'e').replace(/[5$]/g, 's').replace(/7/g, 't');
  const squash = norm.replace(/[^a-z]/g, '').replace(/(.)\1+/g, '$1');
  if (BAD_PARTS.some(w => squash.indexOf(w.replace(/(.)\1+/g, '$1')) >= 0)) return true;
  const words = norm.split(/[^a-z]+/).filter(Boolean);
  return words.some(w => BAD_WORDS.indexOf(w) >= 0) || BAD_WORDS.indexOf(squash) >= 0;
}

function readTop_(sh, limit) {
  const n = sh.getLastRow();
  if (n < 2) return [];
  const rows = sh.getRange(2, 1, n - 1, HEADERS.length).getValues();
  return rows
    .filter(r => !(r[2] === true || String(r[2]).toUpperCase() === 'TRUE') && Number(r[4]) > 0 && r[3])
    .map(r => ({n: String(r[3]), s: Number(r[4]), l: Number(r[5]) || 1,
                d: r[1] instanceof Date ? Utilities.formatDate(r[1], 'Europe/Amsterdam', 'yyyy-MM-dd') : ''}))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit);
}

function doGet(e) {
  const cache = CacheService.getScriptCache(), hit = cache.get('top10');
  if (hit) return json_({ok: true, top: JSON.parse(hit)});
  const top = readTop_(sheet_(), 10);
  cache.put('top10', JSON.stringify(top), CACHE_TOP_S);
  return json_({ok: true, top: top});
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (x) { return json_({ok: false, error: 'bad_json'}); }
  if (d.website) return json_({ok: true});                        // honeypot: stil negeren
  const name = cleanName_(d.name);
  if (name.length < 1) return json_({ok: false, error: 'name'});
  if (isRude_(name)) return json_({ok: false, error: 'name_rude'});
  const score = Number(d.score), level = Number(d.level), ms = Number(d.elapsed);
  if (typeof d.score !== 'number' || !Number.isInteger(score) || score < 1 || score > MAX_SCORE || score % 10 !== 0) return json_({ok: false, error: 'score'});
  if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) return json_({ok: false, error: 'level'});
  if (!(ms >= MIN_GAME_MS) || score / (ms / 1000) > MAX_POINTS_PER_S) return json_({ok: false, error: 'implausible'});

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return json_({ok: false, error: 'busy'});
  try {
    const props = PropertiesService.getScriptProperties();
    const day = Utilities.formatDate(new Date(), 'Europe/Amsterdam', 'yyyy-MM-dd');
    const dayCount = Number(props.getProperty('day_' + day) || 0);
    if (dayCount >= MAX_PER_DAY) return json_({ok: false, error: 'rate_day'});
    const cache = CacheService.getScriptCache(), key = 'name_' + Utilities.base64EncodeWebSafe(name.toLowerCase()).slice(0, 200);
    const nameCount = Number(cache.get(key) || 0);
    if (nameCount >= MAX_PER_NAME) return json_({ok: false, error: 'rate_name'});

    const sh = sheet_();
    sh.appendRow([Utilities.getUuid().slice(0, 8), new Date(), false, name, score, level, Math.round(ms / 1000)]);
    sh.getRange(sh.getLastRow(), 3).insertCheckboxes();
    // alleen de beste KEEP_ROWS bewaren (op score aflopend sorteren, rest verwijderen)
    const n = sh.getLastRow() - 1;
    if (n > KEEP_ROWS) {
      sh.getRange(2, 1, n, HEADERS.length).sort({column: 5, ascending: false});
      sh.deleteRows(KEEP_ROWS + 2, n - KEEP_ROWS);
    }
    props.setProperty('day_' + day, String(dayCount + 1));
    cache.put(key, String(nameCount + 1), PER_NAME_WINDOW_S);
    cache.remove('top10');
    const top = readTop_(sh, 10);
    const rank = top.findIndex(t => t.n === name && t.s === score);
    return json_({ok: true, rank: rank, top: top});
  } finally { lock.releaseLock(); }
}

/** Eenmalig handmatig uitvoeren (optioneel): kopregel + selectievakjes; test het filter. */
function setup() {
  const sh = sheet_(), n = Math.max(sh.getLastRow(), 2);
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sh.getRange(2, 3, n - 1, 1).insertCheckboxes();
  sh.setFrozenRows(1);
  Logger.log('Filter test (true, true, false): ' + [isRude_('K4nker'), isRude_('fuuuck'), isRude_('Willem')].join(', '));
}
