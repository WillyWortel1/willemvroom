#!/usr/bin/env python3
"""Build nieuws/index.html from Creator's real files. Usage:
build_nieuws.py --title T --date 2026-11-08 --text voiceover.md --video FILE.mp4 [--poster P.png]
Sources are hard-listed below from bronnen.md (verified). Refuses to run without a real video file."""
import argparse, html, os, re, shutil, sys
p=argparse.ArgumentParser();a=p.add_argument
a('--title',required=True);a('--date',required=True);a('--text',required=True);a('--video');a('--poster');a('--assets')
o=p.parse_args()
if o.video and not os.path.isfile(o.video): sys.exit('video ontbreekt: '+o.video)
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));d=os.path.join(root,'nieuws');os.makedirs(d,exist_ok=True)
o.video and shutil.copy(o.video,os.path.join(d,'video.mp4'))
poster=''
if o.poster: shutil.copy(o.poster,os.path.join(d,'poster.png'));poster=' poster="/nieuws/poster.png"'
paras=[l.strip() for l in open(o.text,encoding='utf-8').read().split('\n') if l.strip() and not l.startswith('#')]
M=['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december']
y,m,dd=o.date.split('-');nl=f'{int(dd)} {M[int(m)-1]} {y}';e=html.escape;t=e(o.title)
S=[('Politie Małopolska (X), 7–8 november','https://x.com/kwpkrakow'),
('Poolse politie (X), reconstructie 8 november','https://x.com/PolskaPolicja/status/2119382978627248335'),
('Politie Świętokrzyskie (X), 7 november','https://x.com/SPolicja/status/2119173745713529094'),
('Pools openbaar ministerie (X), 8 november','https://x.com/PK_GOV_PL/status/2119367536441524417'),
('Gemeente Krakau: Strzały w centrum Krakowa','https://krakow.pl/aktualnosci/345151,29,komunikat,strzelanina_w_centrum_krakowa__sa_zabici_i_ranni.html'),
('Gemeente Krakau: nationale rouw 8 en 9 november','https://krakow.pl/aktualnosci/345178,29,komunikat,8_i_9_listopada_obowiazuje_zaloba_narodowa__.html'),
('Gemeente Krakau: stedelijke rouw tot 11 november','https://krakow.pl/aktualnosci/345157,29,komunikat,prezydent_miasta_oglosil_zalobe_na_terenie_krakowa__flagi_przepasane_kirem__miejskie_imprezy_odwolane.html'),
('Reuters (via Investing.com), 7 november','https://www.investing.com/news/world-news/polish-gunman-kills-four-women-and-two-men-in-krakows-main-square-5009995'),
('WP, getuigen, 7 november','https://wiadomosci.wp.pl/krakow/myslalem-ze-kreca-film-swiadkowie-o-strzelaninie-na-krakowskim-rynku-7348513298622944a'),
('PAP via Super Express, 8 november','https://www.se.pl/krakow/lzy-cisna-sie-do-oczu-poruszajace-slowa-o-bohaterze-strzelaniny-w-krakowie-dla-kuby-sluzba-byla-wszystkim-aa-42YR-AHUZ-WkV7.html'),
('RMF FM, Kunstacademie, 8 november','https://www.rmf.fm/magazyn/news,n1025324,zamach-w-krakowie-akademia-sztuk-pieknych-zegna-swoja-studentke-i-oglasza-zalobe.html'),
('Fakt, buren in Ostrowiec, 8 november','https://www.fakt.pl/wydarzenia/polska/sasiedzi-wspominaja-zamordowanych-bliskich-zamachowca-z-krakowa/gnp04kk'),
('Kaartdata: © OpenStreetMap-bijdragers (ODbL), Natural Earth','https://www.openstreetmap.org/copyright')]
src=''.join(f'<li><a href="{e(u)}" rel="noreferrer noopener" target="_blank">{e(n)}</a></li>' for n,u in S)
OSM='<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap-bijdragers</a>, ODbL'
FIGS=[('De stadsplattegrond laat','kaart-krakau.png','kaart-krakau.png',1920,1080,'Plattegrond van Krakau met punt 1 bij de Grote Markt en punt 2 bij Dietla en Stradomska.','Grote Markt (1): gebied van de schietpartij. Dietla/Stradomska (2): omgeving van de aanhouding. Markeringen duiden gebieden aan; geen exacte positie of gereden route. Kaart: '+OSM+'.'),
('Op de overzichtskaart van Polen','kaart-polen.png','kaart-polen.png',1920,1080,'Kaart van Polen met Krakau en punt 3 bij de andere stad Ostrowiec Świętokrzyski.','Krakau en Ostrowiec Świętokrzyski zijn verschillende steden. Punt 3 toont uitsluitend de stad waar drie lichamen werden gevonden, niet de woninglocatie. Kaart: <a href="https://www.naturalearthdata.com/about/terms-of-use/">Natural Earth</a> (publiek domein); stadsposities: OpenStreetMap en Pools PRNG.'),
('Polen houdt op acht en negen november','rouwfoto-candle-vela-cc0.jpg','kaars.jpg',1600,1200,'Brandende kaars tegen een donkere achtergrond; illustratieve foto.','Illustratieve foto; niet gemaakt bij deze gebeurtenis. Foto: <a href="https://commons.wikimedia.org/wiki/File:Candle-Vela.jpg">ViajeroExtraviado / Wikimedia Commons</a>, 11 juni 2018, <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0</a>.')]
out=[]
for x in paras:
    for pre,fsrc,dst,w,h,alt,cap in (FIGS if o.assets else []):
        if x.startswith(pre):
            sp=os.path.join(o.assets,fsrc);tp=os.path.join(d,dst)
            if dst.endswith('.jpg'): __import__("PIL.Image").Image.open(sp).convert("RGB").resize((1600,1200)).save(tp,quality=82,optimize=True)
            else: shutil.copy(sp,tp)
            out.append(f'</div><figure class="nw-m nw-f"><img src="/nieuws/{dst}" width="{w}" height="{h}" loading="lazy" decoding="async" alt="{e(alt)}"><figcaption class="mt-2 text-sm text-subtle">{cap}</figcaption></figure><div class="nw-w nw-m text-lg text-fg">')
    out.append(f'<p>{e(x)}</p>')
body=''.join(out)
desc=e(paras[0][:155])
fig=bool(o.video)
H=f'''<!DOCTYPE html>
<html lang="nl" class="antialiased"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{t} – Nieuws – Willem Vroom</title><meta name="description" content="{desc}">
<link rel="canonical" href="https://willemvroom.nl/nieuws/"><meta name="theme-color" content="#ffffff"><link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preload" href="/fonts/ibm-plex-sans-latin-wght-normal-IvpUvPa2.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css?v=20261018"><link rel="stylesheet" href="/site.css?v=20261021-sf">
<script>(function(){{try{{var t=localStorage.getItem("wv-theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches)){{document.documentElement.classList.add("dark");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","#0b0b0b");}}}}catch(e){{}}}})();</script>
<meta property="og:type" content="article"><meta property="og:url" content="https://willemvroom.nl/nieuws/"><meta property="og:title" content="{t}"><meta property="og:description" content="{desc}">
<style>.nw-v{{display:block;width:100%;height:auto;border-radius:16px;background:#000}}.nw-w{{max-width:42rem}}.nw-m{{margin-top:2.5rem}}.nw-w p+p{{margin-top:1.1em}}.text-lg{{line-height:1.65}}figure.nw-m{{max-width:56rem}}.nw-f img{{display:block;width:100%;height:auto;border-radius:16px}}.nw-f a,figcaption a{{color:inherit;text-decoration:underline}}.nw-src a{{color:var(--accent)}}.nw-src{{font-size:.875rem;word-break:break-word}}.nw-src li{{margin:.35rem 0}}</style></head>
<body><div id="top" class="bg-bg text-fg">
<a class="skip" href="#inhoud">Naar inhoud</a>
<header class="wv-head"><a href="/" class="home">willemvroom.nl</a><nav><button id="thm" type="button" aria-label=""><svg class="moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg><svg class="sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button></nav></header>
<main id="inhoud"><article class="mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28">
<p class="text-sm text-subtle">Nieuws van de dag · <time datetime="{o.date}">{nl}</time></p>
<h1 class="section-title nw-w mt-3">{t}</h1>
{{FIG_START}}<video class="nw-v" controls preload="metadata" playsinline{poster} aria-label="Video: {t}"><source src="/nieuws/video.mp4" type="video/mp4">Je browser kan deze video niet afspelen. <a href="/nieuws/video.mp4">Download de video</a>.</video>
<figcaption class="mt-2 text-sm text-subtle">Kaartdata © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap-bijdragers</a> (ODbL); landsgrenzen Natural Earth. Gesproken tekst is synthetisch (computerstem).</figcaption></figure>{{FIG_END}}
<div class="nw-w nw-m text-lg text-fg">{body}</div>
<p class="nw-w nw-m text-sm text-subtle">Getuigenverklaringen en reacties zijn parafrases, geen letterlijke citaten. Het aantal gewonden verschilt per bron (15 tot 17) en is daarom niet genoemd.</p>
<div class="nw-w border-t border-line pt-4 nw-m"><h2 class="font-display text-2xl leading-tight font-medium tracking-tight">Bronnen</h2><ul class="nw-src mt-4">{src}</ul></div>
<p class="nw-m"><a class="link-line press inline-flex min-h-11 items-center text-sm font-medium" href="/">← Terug naar willemvroom.nl</a></p>
</article></main>
<footer class="border-t border-line"><div class="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 py-8 text-center text-sm text-subtle sm:px-8"><p>willemvroom.nl</p><p>© 2026</p></div></footer>
</div><script src="/site.js?v=20261020-n2"></script></body></html>'''
H=re.sub(r'\{FIG_START\}.*?\{FIG_END\}','',H,flags=re.S) if not fig else H.replace('{FIG_START}','<figure class="nw-m">').replace('{FIG_END}','')
m=re.search(r'<ul class="nw-src mt-4">(.*?)</ul>',H,re.S)
got=re.findall(r'<li><a href="([^"]+)"',m.group(1) if m else '')
want=[html.escape(u) for _,u in S]
if got!=want: sys.exit(f'BRONNEN-CONTROLE MISLUKT: {len(got)} van {len(want)} links')
print('bronnen ok',len(got))
if re.search(r'<track|\.vtt|\.srt|ondertitel',H,re.I): sys.exit('ONDERTITEL-CONTROLE MISLUKT')
open(os.path.join(d,'index.html'),'w',encoding='utf-8').write(H);print('ok',d)
