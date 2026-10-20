#!/usr/bin/env python3
"""Bouwt spots/index.html en spots/en/index.html uit foilassist/index.html (alleen-lezen hergebruik van data)."""
import pathlib,re
R=pathlib.Path(__file__).resolve().parents[2]
s=(R/"foilassist/index.html").read_text(encoding="utf-8")
def rep(a,b,n=1):
    global s
    assert s.count(a)>=1,a[:80]
    s=s.replace(a,b) if n==0 else s.replace(a,b,n)
# taal: alleen nl/en
rep("try{if(['en','nl','de'].includes(q))localStorage.setItem('foilassist-lang',q);if(!l)l=localStorage.getItem('foilassist-lang')}catch(e){}","try{if(['en','nl','de'].includes(q))localStorage.setItem('spots-lang',q);if(!l)l=localStorage.getItem('spots-lang')}catch(e){}")
rep("function setLang(l){try{localStorage.setItem('foilassist-lang',l)}catch(e){}location.href='/foilassist/'+(l=='nl'?'?lang=nl':l+'/')}","function setLang(l){try{localStorage.setItem('spots-lang',l)}catch(e){}location.href='/spots/'+(l=='nl'?'?lang=nl':l+'/')}")
rep('<meta name="robots" content="noindex">','<meta name="robots" content="noindex,nofollow">')
rep("<title>Foilassist – condities per spot</title><script>if(LANG=='en')document.title='Foilassist – conditions per spot';if(LANG=='de')document.title='Foilassist – Bedingungen pro Spot'</script>","<title>Spots🤙 – condities per spot</title><script>if(LANG=='en')document.title='Spots🤙 – conditions per spot';if(LANG=='de')document.title='Spots🤙 – Bedingungen pro Spot'</script>")
# paden naar foilassist-data (alleen lezen)
rep('href="leaflet/leaflet.css','href="/foilassist/leaflet/leaflet.css')
rep('src="leaflet/leaflet.js','src="/foilassist/leaflet/leaflet.js')
rep('<script src="spots.js?v=20261014-42"></script>','<script src="/foilassist/spots.js?v=20261014-42"></script><script src="/spots/coast.js?v=2"></script>')
rep("tfetch('data.json?h=","tfetch('/foilassist/data.json?h=")
rep("const KEY='foilassist-cache-v1';","const KEY='spots-cache-v1';")
# kop
rep("""</span><h1>🏄 Foilassist spots</h1>""","""</span><h1>Spots🤙</h1>""")
rep("""<p><span class="nl">Golven,""","""<p class="pv" style="color:#ffc83d">⚙️ <span class="nl">Voorbeeldversie – nog niet openbaar.</span><span class="en">Preview – not public yet.</span><span class="de">Vorschauversion – noch nicht öffentlich.</span></p><p><span class="nl">Golven,""")
rep("""<nav class="days" id="lands"></nav><nav class="days" id="days" style="top:46px"></nav>""","""<nav class="days" id="sports"></nav><nav class="days" id="lands" style="top:46px"></nav><nav class="days" id="days" style="top:92px"></nav>""")
# footer: vervang 'hoe de sterren werken' door generiek blok
s=re.sub(r'<details><summary><b>Hoe de sterren werken</b></summary>.*?</details>','<div id="rules-nl"></div>',s,flags=re.S)
s=re.sub(r'<details><summary><b>How the stars work</b></summary>.*?</details>','<div id="rules-en"></div>',s,flags=re.S)
s=re.sub(r'<details><summary><b>So funktionieren die Sterne</b></summary>.*?</details>','<div id="rules-de"></div>',s,flags=re.S)
rep("Spots und Beschreibungen: foil.guide","Spots und Beschreibungen (ursprünglich für Foil Assist gesammelt): foil.guide")
rep("Spots en beschrijvingen: foil.guide","Spots en beschrijvingen (oorspronkelijk verzameld voor foil assist): foil.guide")
rep("Spots and descriptions: foil.guide","Spots and descriptions (originally collected for foil assist): foil.guide")
# scoring
rep("// ==== STERREN (indicatie voor foil assist) ====\nfunction score(k,i){","// ==== STERREN per sport ====\nfunction scoreFoil(k,i){")
rep("function rating(k,date){",open(R/"spots/tools/sport.js",encoding="utf-8").read()+"\nfunction rating(k,date){")
rep("""document.getElementById('lands').innerHTML=""","""sportNav();document.getElementById('lands').innerHTML=""")
rep(""".bindTooltip(`${spotName(s)} · ${R2(rating(k,curDate).v)??'–'}★`""",""".bindTooltip(`${spotName(s)} · ${R2(rating(k,curDate).v)??'–'}★ ${qual(rating(k,curDate).v)}`""")
rep("""<div class="rt">${stars(rating(k,date).v)} <small>${rating(k,date).t}</small></div>""","""<div class="rt">${stars(rating(k,date).v)} ${qualH(rating(k,date).v)} <small>${SP().n()} · ${rating(k,date).t}</small></div>${offW(k,date)}""")
rep("let on=false;if(wd!=null&&m.wave_direction[i]!=null){let d=Math.abs(wd-m.wave_direction[i])%360;if(d>180)d=360-d;on=d<60;}","let on=false;if(wd!=null&&m.wave_direction[i]!=null){let d=Math.abs(wd-m.wave_direction[i])%360;if(d>180)d=360-d;on=d<60;}{const _o=rel(k,i);if(_o!='unk')on=_o=='on';}")
rep("${row('Water',i=>","${row(T('Water','Water','Wasser'),i=>")
# lokale regels
rep("function frLabel(s){const f=s.foilregel;return","function frLabel(s){const f=s.foilregel;if(SPORT!='foil')return T('⚠️ Lokale regels','⚠️ Local rules','⚠️ Lokale Regeln');return")
rep("function openFR(k){const s=spots[k],f=s.foilregel,land=FRL[s.land];","function openFR(k){if(SPORT!='foil')return openGen(k);const s=spots[k],f=s.foilregel,land=FRL[s.land];")
rep("""${camsH(s).replace('margin:0 0 8px','') ||'<span></span>'}<span style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">${s.foilregel?frChip(k):''}</span>""","""${camsH(s).replace('margin:0 0 8px','') ||'<span></span>'}<span style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">${s.foilregel||SPORT!='foil'?frChip(k):''}</span>""")
rep("""${full?camsH(s):!(s.webcams&&s.webcams.length)&&!s.foilregel?'':""","""${full?camsH(s):!(s.webcams&&s.webcams.length)&&!s.foilregel&&SPORT=='foil'?'':""")
# info-tekst foil-specifiek: alleen bij foil tonen
rep("""${full&&s.info?`<p class="info">""","""${full&&s.info&&SPORT=='foil'?`<p class="info">""")
# formulier
rep("""<fieldset><legend>${T('Materiaal','Gear','Material')}</legend>""","""${SPORT=='foil'?'':`<input type="hidden" name="_x">`}<fieldset${SPORT=='foil'?'':' hidden disabled'}><legend>${T('Materiaal','Gear','Material')}</legend>""")
rep("""<fieldset><legend>${T('Batterij(en)','Battery/batteries','Akku(s)')}</legend>""","""<fieldset${SPORT=='foil'?'':' hidden disabled'}><legend>${T('Batterij(en)','Battery/batteries','Akku(s)')}</legend>""")
rep("""<h4>✍️ ${T('Ervaring delen','Share your session','Erfahrung teilen')} – ${esc(spotName(s))}</h4>""","""<h4>✍️ ${T('Ervaring delen','Share your session','Erfahrung teilen')} – ${esc(spotName(s))} · ${SP().n()}</h4>""")
rep("""if(!String(d.hoe_ging_het||'').trim())d.hoe_ging_het='–';""","""delete d._x;d.hoe_ging_het='['+SP().nl+'] '+(String(d.hoe_ging_het||'').trim()||'–');""")
out=R/"spots";(out/"en").mkdir(parents=True,exist_ok=True)
(out/"index.html").write_text(s,encoding="utf-8")
s=s.replace('?v=20261014-42','?v=20261020-spots3')
(out/"index.html").write_text(s,encoding="utf-8")
for l in ("en","de"):
    (out/l).mkdir(exist_ok=True);(out/l/"index.html").write_text(s.replace('<html lang="nl">',f'<html lang="{l}">',1),encoding="utf-8")
