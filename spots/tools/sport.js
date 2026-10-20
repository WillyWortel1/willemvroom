const SPORTS=[
 {id:'foil',nl:'Foilassist',en:'Foil assist'},{id:'prone',nl:'Foilen (prone)',en:'Prone foiling'},{id:'supfoil',nl:'Supfoil',en:'SUP foiling'},{id:'surf',nl:'Golfsurfen',en:'Surfing'},{id:'wind',nl:'Windsurfen',en:'Windsurfing'},
 {id:'kite',nl:'Kitesurfen',en:'Kitesurfing'},{id:'kitefoil',nl:'Kitefoilen',en:'Kite foiling'},{id:'wing',nl:'Wingen',en:'Wing foiling'},{id:'parawing',nl:'Parawing',en:'Parawing'},{id:'sup',nl:'SUP',en:'SUP'}].map(x=>({...x,n:()=>T(x.nl,x.en,x.en)}));
let SPORT=(()=>{try{const v=localStorage.getItem('spots-sport');if(SPORTS.some(x=>x.id==v))return v}catch(e){}return 'foil'})();
const SP=()=>SPORTS.find(x=>x.id==SPORT);
function setSport(id){SPORT=id;try{localStorage.setItem('spots-sport',id)}catch(e){}closeFR();render();}
function sportNav(){document.getElementById('sports').innerHTML=SPORTS.map(x=>`<button class="${x.id==SPORT?'on':''}" onclick="setSport('${x.id}')">${x.n()}</button>`).join('');
 ['nl','en'].forEach(l=>{const e=document.getElementById('rules-'+l);if(e)e.innerHTML=rulesH(l)});}
// windrichting t.o.v. golfrichting als schatting voor aanlandig/aflandig (kustoriëntatie per spot zit er niet in)
function rel(k,i){const wd=F[k].hourly.wind_direction_10m[i],gd=M[k].hourly.wave_direction[i];const cb=(window.COAST||{})[spots[k].naam];
 if(cb&&cb[1]&&wd!=null){let d=Math.abs(wd-cb[0])%360;if(d>180)d=360-d;return d<=67.5?'on':d>=112.5?'off':'side';}
if(wd==null||gd==null||M[k].hourly.wave_height[i]==null||M[k].hourly.wave_height[i]<0.5)return 'unk';let d=Math.abs(wd-gd)%360;if(d>180)d=360-d;return d<60?'on':d>120?'off':'side';}
function common(k,i){const w=F[k].hourly,r=w.precipitation[i],wc=w.weather_code[i];let s=0;if(wc!=null&&wc>=95)s-=2;else if(r!=null){if(r>2)s-=1;else if(r>0.5)s-=0.5;}return s;}
function score(k,i){if(i<0)return null;if(SPORT=='foil')return scoreFoil(k,i);
 const m=M[k].hourly,w=F[k].hourly;if(w.is_day&&w.is_day[i]===0)return 0;
 const H=m.wave_height[i],P=m.wave_period[i],ws=w.wind_speed_10m[i],g=w.wind_gusts_10m[i],c=m.ocean_current_velocity[i]==null?null:m.ocean_current_velocity[i]/1.852,wt=m.sea_surface_temperature[i],o=rel(k,i);
 let s=5+common(k,i);
 if(SPORT=='surf'){
  if(H!=null){if(H<0.5)s-=3;else if(H<0.8)s-=1;else if(H>3.5)s-=2.5;else if(H>2.5)s-=1;
   if(H>=0.5&&P!=null){if(P<6)s-=1.5;else if(P<8)s-=1;else if(P<10)s-=0.5;}}
  if(ws!=null){if(ws>20)s-=2;else if(ws>12)s-=o=='on'?1.5:0.5;else if(ws>8&&o=='on')s-=0.5;}
  if(c!=null){if(c>1.5)s-=1;else if(c>0.8)s-=0.5;}
 }else if(SPORT=='prone'){
  if(H!=null){if(H<0.25)s-=3;else if(H<0.4)s-=1;else if(H>3)s-=2.5;else if(H>2)s-=1;
   if(H>=0.25&&P!=null){if(P<5)s-=1.5;else if(P<7)s-=1;}}
  if(ws!=null){if(ws>20)s-=2;else if(ws>12)s-=o=='on'?1.5:0.5;else if(ws>8&&o=='on')s-=0.5;}
  if(c!=null){if(c>1.5)s-=1;else if(c>0.8)s-=0.5;}
 }else if(SPORT=='supfoil'){
  if(H!=null){if(H<0.2)s-=2.5;else if(H<0.3)s-=1;else if(H>3)s-=2.5;else if(H>1.8)s-=1;
   if(H>=0.2&&P!=null&&P<6)s-=0.5;}
  if(ws!=null){if(ws>22)s-=3;else if(ws>15)s-=1.5;else if(ws>12&&o=='on')s-=1;if(o=='off'&&ws>8)s-=2;if(o=='unk'&&ws>8)s-=0.5;}
  if(c!=null&&c>1)s-=1;
 }else if(SPORT=='kitefoil'){
  if(ws!=null){if(ws<6)s-=4;else if(ws<10)s-=1;else if(ws>30)s-=3;else if(ws>25)s-=1.5;}
  if(g!=null&&ws!=null&&g-ws>15)s-=1;
  if(o=='off'&&ws!=null&&ws>=6)s-=2;if(o=='unk'&&ws!=null&&ws>=6)s-=1;
  if(H!=null&&H>2)s-=1;
  if(c!=null&&c>1.5)s-=1;
 }else if(SPORT=='parawing'){
  if(ws!=null){if(ws<8)s-=4;else if(ws<12)s-=1.5;else if(ws>30)s-=3;else if(ws>25)s-=1.5;}
  if(g!=null&&ws!=null&&g-ws>15)s-=1;
  if(o=='off'&&ws!=null&&ws>=8)s-=2;if(o=='unk'&&ws!=null&&ws>=8)s-=1;
  if(H!=null&&H>3)s-=1;
  if(c!=null&&c>1.5)s-=1;
 }else if(SPORT=='wind'||SPORT=='kite'||SPORT=='wing'){const lo=SPORT=='wing'?[7,11,1.5]:[8,12,2];
  if(ws!=null){if(ws<lo[0])s-=4;else if(ws<lo[1])s-=lo[2];else if(ws>35)s-=3;else if(ws>30)s-=1.5;}
  if(g!=null&&ws!=null){if(g-ws>15)s-=1;if(g>40)s-=1;}
  if(o=='off'&&ws!=null&&ws>=8)s-=SPORT=='wind'?1.5:2;if(o=='unk'&&ws!=null&&ws>=8)s-=SPORT=='wind'?0.5:1;
  if(H!=null&&H>3)s-=1;
  if(c!=null&&c>1.5)s-=1;
 }else if(SPORT=='sup'){
  if(H!=null){if(H>1)s-=3.5;else if(H>0.6)s-=2;else if(H>0.3)s-=1;}
  if(ws!=null){if(ws>18)s-=4;else if(ws>12)s-=2.5;else if(ws>8)s-=1;if(o=='off'&&ws>8)s-=2;if(o=='unk'&&ws>8)s-=0.5;}
  if(c!=null&&c>1)s-=1;
 }
 return Math.max(0,Math.min(5,s));}
const qual=v=>v==null?'':v>=3.5?T('goed','good'):v>=2?T('matig','fair'):T('slecht','poor');
const qualH=v=>v==null?'':`<span style="font-size:.75rem;font-weight:600;padding:1px 7px;border-radius:9px;background:${v>=3.5?'#2ecc71':v>=2?'#f0ad4e':'#d9534f'};color:#032">${qual(v)}</span>`;
function openGen(k){const s=spots[k];
 document.getElementById('frc').innerHTML=`<h4>⚠️ ${T('Lokale regels','Local rules')} – ${esc(spotName(s))}</h4>
 <p>${T('Voor '+SP().nl.toLowerCase()+' hebben we voor deze spot geen gecontroleerde lokale regels. Check ter plaatse de borden, zones (zwem-, surf- en watersportzones, seizoensregels) en vraag bij twijfel de lifeguards of de lokale club.','For '+SP().en.toLowerCase()+' we have no verified local rules for this spot. Check the signs and zones on site (swimming, surf and water-sports zones, seasonal rules) and ask the lifeguards or the local club if in doubt.')}</p>
 <p>${T('Houd rekening met andere watergebruikers: geef ruimte, ken de voorrangsregels en blijf uit de buurt van zwemmers.','Be considerate of other water users: give space, know the right-of-way rules and keep clear of swimmers.')}</p>
 <p><b>${T('De beoordeling is een indicatie, geen veiligheidsadvies. Beoordeel altijd zelf ter plaatse.','The rating is an indication, not safety advice. Always judge for yourself on site.')}</b></p>
 <p style="text-align:right"><button class="btn" onclick="closeFR()">${T('Sluiten','Close')}</button></p>`;
 document.getElementById('frm').classList.add('open');}
const RULES={
 foil:['Golven 0,8–1,5 m ideaal, periode ≥9 s; lichte of aflandige wind; aftrek bij aanlandige wind &gt;8 kn, wind &gt;25 kn, stroming &gt;0,8 kn.','Waves 0.8–1.5 m ideal, period ≥9 s; light or offshore wind; deductions for onshore wind &gt;8 kn, wind &gt;25 kn, current &gt;0.8 kn.'],
 prone:['Golven 0,4–2 m ideaal (&lt;0,25 m −3; 0,25–0,4 m −1; 2–3 m −1; &gt;3 m −2,5); periode &lt;5 s −1,5, 5–7 s −1. Wind &gt;20 kn −2; 12–20 kn −1,5 aanlandig (anders −0,5); 8–12 kn aanlandig −0,5. Stroming &gt;0,8 kn −0,5, &gt;1,5 kn −1.','Waves 0.4–2 m ideal (&lt;0.25 m −3; 0.25–0.4 m −1; 2–3 m −1; &gt;3 m −2.5); period &lt;5 s −1.5, 5–7 s −1. Wind &gt;20 kn −2; 12–20 kn −1.5 onshore (else −0.5); 8–12 kn onshore −0.5. Current &gt;0.8 kn −0.5, &gt;1.5 kn −1.'],
 supfoil:['Golven/bulten 0,3–1,8 m ideaal (&lt;0,2 m −2,5; 0,2–0,3 m −1; 1,8–3 m −1; &gt;3 m −2,5); periode &lt;6 s −0,5. Wind &gt;15 kn −1,5, &gt;22 kn −3; aanlandig 12–15 kn −1; geschat aflandig &gt;8 kn −2 extra. Stroming &gt;1 kn −1.','Waves/bumps 0.3–1.8 m ideal (&lt;0.2 m −2.5; 0.2–0.3 m −1; 1.8–3 m −1; &gt;3 m −2.5); period &lt;6 s −0.5. Wind &gt;15 kn −1.5, &gt;22 kn −3; onshore 12–15 kn −1; estimated offshore &gt;8 kn −2 extra. Current &gt;1 kn −1.'],
 surf:['Golven 0,8–2,5 m ideaal (&lt;0,5 m −3; 0,5–0,8 m −1; 2,5–3,5 m −1; &gt;3,5 m −2,5); periode &lt;6 s −1,5, 6–8 s −1, 8–10 s −0,5. Wind &gt;20 kn −2; 12–20 kn −1,5 aanlandig (anders −0,5); 8–12 kn aanlandig −0,5. Stroming &gt;0,8 kn −0,5, &gt;1,5 kn −1.','Waves 0.8–2.5 m ideal (&lt;0.5 m −3; 0.5–0.8 m −1; 2.5–3.5 m −1; &gt;3.5 m −2.5); period &lt;6 s −1.5, 6–8 s −1, 8–10 s −0.5. Wind &gt;20 kn −2; 12–20 kn −1.5 onshore (else −0.5); 8–12 kn onshore −0.5. Current &gt;0.8 kn −0.5, &gt;1.5 kn −1.'],
 wind:['Wind 12–30 kn ideaal (&lt;8 kn −4; 8–12 kn −2; 30–35 kn −1,5; &gt;35 kn −3). Vlagen meer dan 15 kn boven de wind −1, vlagen &gt;40 kn −1. Geschat aflandig −1,5; bij golven &lt;0,5 m onbekend: −0,5. Golven &gt;3 m −1, stroming &gt;1,5 kn −1.','Wind 12–30 kn ideal (&lt;8 kn −4; 8–12 kn −2; 30–35 kn −1.5; &gt;35 kn −3). Gusts more than 15 kn above the wind −1, gusts &gt;40 kn −1. Estimated offshore −1.5; with waves &lt;0.5 m unknown: −0.5. Waves &gt;3 m −1, current &gt;1.5 kn −1.'],
 kite:['Wind 12–30 kn ideaal (&lt;8 kn −4; 8–12 kn −2; 30–35 kn −1,5; &gt;35 kn −3). Vlagen meer dan 15 kn boven de wind −1, vlagen &gt;40 kn −1. Geschat aflandig −2 (aflandig kiten is gevaarlijk); zonder kustrichting en bij golven &lt;0,5 m onbekend: −1. Golven &gt;3 m −1, stroming &gt;1,5 kn −1.','Wind 12–30 kn ideal (&lt;8 kn −4; 8–12 kn −2; 30–35 kn −1.5; &gt;35 kn −3). Gusts more than 15 kn above the wind −1, gusts &gt;40 kn −1. Estimated offshore −2 (offshore kiting is dangerous); without coast bearing and waves &lt;0.5 m unknown: −1. Waves &gt;3 m −1, current &gt;1.5 kn −1.'],
 kitefoil:['Wind 10–25 kn ideaal (&lt;6 kn −4; 6–10 kn −1; 25–30 kn −1,5; &gt;30 kn −3). Vlagen meer dan 15 kn boven de wind −1. Aflandig −2 (met waarschuwing); onbekende richting −1. Golven &gt;2 m −1, stroming &gt;1,5 kn −1.','Wind 10–25 kn ideal (&lt;6 kn −4; 6–10 kn −1; 25–30 kn −1.5; &gt;30 kn −3). Gusts more than 15 kn above the wind −1. Offshore −2 (with warning); unknown direction −1. Waves &gt;2 m −1, current &gt;1.5 kn −1.'],
 wing:['Wind ca. 11–30 kn ideaal (&lt;7 kn −4; 7–11 kn −1,5; 30–35 kn −1,5; &gt;35 kn −3). Vlagen meer dan 15 kn boven de wind −1, vlagen &gt;40 kn −1. Geschat aflandig −2 (aflandig afdrijven is gevaarlijk); bij golven &lt;0,5 m onbekend: −1. Golven &gt;3 m −1, stroming &gt;1,5 kn −1.','Wind about 11–30 kn ideal (&lt;7 kn −4; 7–11 kn −1.5; 30–35 kn −1.5; &gt;35 kn −3). Gusts more than 15 kn above the wind −1, gusts &gt;40 kn −1. Estimated offshore −2 (drifting offshore is dangerous); with waves &lt;0.5 m unknown: −1. Waves &gt;3 m −1, current &gt;1.5 kn −1.'],
 parawing:['Wind 12–25 kn ideaal (&lt;8 kn −4; 8–12 kn −1,5; 25–30 kn −1,5; &gt;30 kn −3). Vlagen meer dan 15 kn boven de wind −1. Aflandig −2 (met waarschuwing); onbekende richting −1. Deining tot 3 m geen aftrek, &gt;3 m −1. Stroming &gt;1,5 kn −1.','Wind 12–25 kn ideal (&lt;8 kn −4; 8–12 kn −1.5; 25–30 kn −1.5; &gt;30 kn −3). Gusts more than 15 kn above the wind −1. Offshore −2 (with warning); unknown direction −1. Swell up to 3 m no deduction, &gt;3 m −1. Current &gt;1.5 kn −1.'],
 sup:['Vlak water en weinig wind ideaal: golven 0,3–0,6 m −1, 0,6–1 m −2, &gt;1 m −3,5; wind 8–12 kn −1, 12–18 kn −2,5, &gt;18 kn −4; geschat aflandig &gt;8 kn −2 extra (onbekend bij golven &lt;0,5 m: −0,5). Stroming &gt;1 kn −1.','Flat water and little wind ideal: waves 0.3–0.6 m −1, 0.6–1 m −2, &gt;1 m −3.5; wind 8–12 kn −1, 12–18 kn −2.5, &gt;18 kn −4; estimated offshore &gt;8 kn −2 extra (unknown with waves &lt;0.5 m: −0.5). Current &gt;1 kn −1.']};
function rulesH(l){const x=SP(),r=RULES[SPORT][l=='en'?1:0];return l=='en'
 ?`<details><summary><b>How the rating works – ${x.en}</b></summary><p>An <b>indication</b> for ${x.en.toLowerCase()}, not safety advice. Today: the current hour; other days: best of 9, 13 and 17 h. Start at 5 stars, then deductions. Good ≥3.5, fair 2–3.5, poor &lt;2.</p><p>${r}</p><p>All sports: rain &gt;0.5 mm/h −0.5, &gt;2 mm/h −1; thunderstorm −2; dark 0. Onshore/side/offshore: wind direction vs. the seaward direction of the coast per spot (derived from the OpenStreetMap coastline; onshore ≤67.5°, offshore ≥112.5°). Where the coastline is unclear, it is estimated from wind vs. wave direction. Shallows, rips, zones and crowds are not included.</p></details>`
 :`<details><summary><b>Hoe de beoordeling werkt – ${x.nl}</b></summary><p>Een <b>indicatie</b> voor ${x.nl.toLowerCase()}, geen veiligheidsadvies. Vandaag: het huidige uur; andere dagen: het beste van 9, 13 en 17 uur. Start op 5 sterren, daarna aftrek. Goed ≥3,5, matig 2–3,5, slecht &lt;2.</p><p>${r}</p><p>Alle sporten: regen &gt;0,5 mm/u −0,5, &gt;2 mm/u −1; onweer −2; donker 0. Aanlandig/zijwaarts/aflandig: windrichting t.o.v. de zeewaartse richting van de kust per spot (afgeleid uit de OpenStreetMap-kustlijn; aanlandig ≤67,5°, aflandig ≥112,5°). Waar de kustlijn onduidelijk is, wordt het geschat uit wind- t.o.v. golfrichting. Ondieptes, muistromen, zones en drukte zitten er niet in.</p></details>`}
function offW(k,date){if(!['wind','kite','kitefoil','wing','parawing','sup','supfoil'].includes(SPORT))return '';const m=M[k].hourly;let i;
 if(day==0)i=m.time.indexOf(new Date(Date.now()+M[k].utc_offset_seconds*1000).toISOString().slice(0,13)+':00');else i=m.time.indexOf(date+'T13:00');
 if(i<0)return '';const ws=F[k].hourly.wind_speed_10m[i];if(rel(k,i)!='off'||ws==null||ws<5)return '';
 return `<p class="info" style="color:#ffb4a8;font-weight:600;margin:0 0 8px">⚠️ ${T('Aflandige wind','Offshore wind')} (${card(F[k].hourly.wind_direction_10m[i])}, ${Math.round(ws)} kn${day?' · 13:00':''}) – ${T('je drijft van de kust af. Niet zonder begeleiding of rescue.','you drift away from the shore. Not without supervision or rescue.')}</p>`}
