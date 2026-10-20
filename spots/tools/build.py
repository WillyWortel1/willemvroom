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
rep('<script src="spots.js?v=20261014-42"></script>','<script src="/foilassist/spots.js?v=20261014-42"></script><script src="/spots/coast.js?v=3"></script>')
rep("tfetch('data.json?h=","tfetch('/foilassist/data.json?h=")
rep("const KEY='foilassist-cache-v1';","const KEY='spots-cache-v1';")
# kop
rep("""</span><h1>🏄 Foilassist spots</h1>""","""</span><h1>Spots🤙</h1>""")
rep("""<p><span class="nl">Golven,""","""<p class="pv" style="color:#ffc83d">⚙️ <span class="nl">Voorbeeldversie – nog niet openbaar.</span><span class="en">Preview – not public yet.</span><span class="de">Vorschauversion – noch nicht öffentlich.</span></p><p><span class="nl">Golven,""")
# footer: vervang 'hoe de sterren werken' door generiek blok
s=re.sub(r'<details><summary><b>Hoe de sterren werken</b></summary>.*?</details>','<div id="rules-nl"></div>',s,flags=re.S)
s=re.sub(r'<details><summary><b>How the stars work</b></summary>.*?</details>','<div id="rules-en"></div>',s,flags=re.S)
s=re.sub(r'<details><summary><b>So funktionieren die Sterne</b></summary>.*?</details>','<div id="rules-de"></div>',s,flags=re.S)
rep("Spots und Beschreibungen: foil.guide","Spots und Beschreibungen (ursprünglich für Foil Assist gesammelt): foil.guide")
rep("Spots en beschrijvingen: foil.guide","Spots en beschrijvingen (oorspronkelijk verzameld voor foil assist): foil.guide")
rep("Spots and descriptions: foil.guide","Spots and descriptions (originally collected for foil assist): foil.guide")
# algemeen overzicht i.p.v. sterren
rep("function rating(k,date){",open(R/"spots/tools/gen.js",encoding="utf-8").read()+"\nfunction rating(k,date){")
rep("""document.getElementById('lands').innerHTML=""","""genRules();document.getElementById('lands').innerHTML=""")
rep(""".map(k=>[k,rating(k,date).v??-1]).sort((a,b)=>b[1]-a[1]).map(([k])=>cardH(k,date,false))""",""".map(k=>cardH(k,date,false))""")
rep("""<span class="nl">Lijst – beste spot bovenaan</span><span class="en">List – best spot on top</span><span class="de">Liste – bester Spot oben</span>""","""<span class="nl">Lijst</span><span class="en">List</span><span class="de">Liste</span>""")
rep("""fillColor:scol(rating(k,curDate).v)""","""fillColor:condCol(cond(k,curDate))""")
rep(""".bindTooltip(`${spotName(s)} · ${R2(rating(k,curDate).v)??'–'}★`""",""".bindTooltip(`${spotName(s)} · ${(c=>c?LV()[c.l][0]:'–')(cond(k,curDate))}`""")
rep("""<div class="rt">${stars(rating(k,date).v)} <small>${rating(k,date).t}</small></div>""","""${condH(k,date)}""")
rep("${row('Water',i=>","${row(T('Water','Water','Wasser'),i=>")
# lokale regels: altijd generiek (functies in gen.js gaan voor; oude definities hernoemen)
rep("function frLabel(s){","function frLabelFoil(s){")
rep("function openFR(k){","function openFRFoil(k){")
rep("""${s.foilregel?frChip(k):''}</span>""","""${frChip(k)}</span>""")
rep("""${full?camsH(s):!(s.webcams&&s.webcams.length)&&!s.foilregel?'':""","""${full?camsH(s):""")
rep("""${full&&s.info?`<p class="info">""","""${false?`<p class="info">""")
# formulier: geen foil-materiaal/batterij
rep("""<fieldset><legend>${T('Materiaal','Gear','Material')}</legend>""","""<fieldset hidden disabled><legend>${T('Materiaal','Gear','Material')}</legend>""")
rep("""<fieldset><legend>${T('Batterij(en)','Battery/batteries','Akku(s)')}</legend>""","""<fieldset hidden disabled><legend>${T('Batterij(en)','Battery/batteries','Akku(s)')}</legend>""")
rep("""<input id="f_oef" name="oefenen" maxlength="300">""","""<input id="f_oef" name="oefenen" maxlength="300" hidden disabled>""")
rep("""<label for="f_oef">${T('Wat oefen je?','What are you practising?','Was übst du?')}</label>""","")
out=R/"spots";(out/"en").mkdir(parents=True,exist_ok=True)
s=s.replace('?v=20261014-42','?v=20261020-spots4')
(out/"index.html").write_text(s,encoding="utf-8")
for l in ("en","de"):
    (out/l).mkdir(exist_ok=True);(out/l/"index.html").write_text(s.replace('<html lang="nl">',f'<html lang="{l}">',1),encoding="utf-8")
