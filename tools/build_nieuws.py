#!/usr/bin/env python3
"""Build nieuws/index.html from Creator's real files. Usage:
build_nieuws.py --title T --date 2026-11-08 --text voiceover.md --video FILE.mp4 [--poster P.png] [--vtt subs.srt]
Sources are hard-listed below from bronnen.md (verified). Refuses to run without a real video file."""
import argparse, html, os, re, shutil, sys
p=argparse.ArgumentParser();a=p.add_argument
a('--title',required=True);a('--date',required=True);a('--text',required=True);a('--video',required=True);a('--poster');a('--vtt')
o=p.parse_args()
if not os.path.isfile(o.video): sys.exit('video ontbreekt: '+o.video)
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));d=os.path.join(root,'nieuws');os.makedirs(d,exist_ok=True)
shutil.copy(o.video,os.path.join(d,'video.mp4'))
poster=''
if o.poster: shutil.copy(o.poster,os.path.join(d,'poster.png'));poster=' poster="/nieuws/poster.png"'
track=''
if o.vtt:
    s=open(o.vtt,encoding='utf-8').read().replace('\r','')
    s='WEBVTT\n\n'+re.sub(r'(\d\d:\d\d:\d\d),(\d\d\d)',r'\1.\2',s)
    open(os.path.join(d,'ondertitels.vtt'),'w',encoding='utf-8').write(s)
    track='<track kind="subtitles" srclang="nl" label="Nederlands" src="/nieuws/ondertitels.vtt" default>'
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
body=''.join(f'<p class="mt-4">{e(x)}</p>' for x in paras)
desc=e(paras[0][:155])
H=f'''<!DOCTYPE html>
<html lang="nl" class="antialiased"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{t} – Nieuws – Willem Vroom</title><meta name="description" content="{desc}">
<link rel="canonical" href="https://willemvroom.nl/nieuws/"><meta name="theme-color" content="#ffffff"><link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="stylesheet" href="/styles.css?v=20261018"><link rel="stylesheet" href="/site.css?v=20261021-sf">
<script>(function(){{try{{var t=localStorage.getItem("wv-theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches)){{document.documentElement.classList.add("dark");}}}}catch(e){{}}}})();</script>
<meta property="og:type" content="article"><meta property="og:url" content="https://willemvroom.nl/nieuws/"><meta property="og:title" content="{t}"><meta property="og:description" content="{desc}">
<style>.nw-v{{display:block;width:100%;height:auto;border-radius:16px;background:#000}}.nw-src{{font-size:.85rem;word-break:break-word}}.nw-src li{{margin:.35rem 0}}</style></head>
<body><div id="top" class="bg-bg text-fg">
<header class="wv-head"><a href="/" class="home">willemvroom.nl</a></header>
<main id="inhoud" class="landing"><article class="mx-auto max-w-3xl px-5 pt-16 pb-16 sm:px-8 sm:pt-24">
<p class="text-sm text-subtle">Nieuws van de dag · <time datetime="{o.date}">{nl}</time></p>
<h1 class="font-display mt-4 text-4xl sm:text-5xl">{t}</h1>
<figure class="mt-8"><video class="nw-v" controls preload="metadata" playsinline{poster} aria-label="Video: {t}"><source src="/nieuws/video.mp4" type="video/mp4">{track}Je browser kan deze video niet afspelen. <a href="/nieuws/video.mp4">Download de video</a>.</video>
<figcaption class="mt-2 text-sm text-subtle">Video met ondertitels. Kaartdata © OpenStreetMap-bijdragers.</figcaption></figure>
<div class="mt-8 text-lg">{body}</div>
<p class="mt-6 text-sm text-subtle">Getuigenverklaringen en reacties zijn parafrases, geen letterlijke citaten. Het aantal gewonden verschilt per bron (15 tot 17) en is daarom niet genoemd.</p>
<h2 class="mt-12 text-2xl">Bronnen</h2><ul class="nw-src mt-4">{src}</ul>
<p class="mt-10"><a href="/">← Terug naar willemvroom.nl</a></p>
</article></main>
<footer class="border-t border-line"><div class="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 py-8 text-center text-sm text-subtle sm:px-8"><p>willemvroom.nl</p><p>© 2026</p></div></footer>
</div><script src="/site.js?v=20261020-n2"></script></body></html>'''
open(os.path.join(d,'index.html'),'w',encoding='utf-8').write(H);print('ok',d)
