const EN=location.pathname.includes('/f1/en');const L=(nl,en)=>EN?en:nl;
const TZ={albert_park:'Australia/Melbourne',shanghai:'Asia/Shanghai',suzuka:'Asia/Tokyo',bahrain:'Asia/Bahrain',jeddah:'Asia/Riyadh',miami:'America/New_York',villeneuve:'America/Toronto',monaco:'Europe/Monaco',catalunya:'Europe/Madrid',madring:'Europe/Madrid',red_bull_ring:'Europe/Vienna',silverstone:'Europe/London',spa:'Europe/Brussels',hungaroring:'Europe/Budapest',zandvoort:'Europe/Amsterdam',monza:'Europe/Rome',imola:'Europe/Rome',baku:'Asia/Baku',sepang:'Asia/Kuala_Lumpur',marina_bay:'Asia/Singapore',americas:'America/Chicago',rodriguez:'America/Mexico_City',interlagos:'America/Sao_Paulo',vegas:'America/Los_Angeles',losail:'Asia/Qatar',yas_marina:'Asia/Dubai',portimao:'Europe/Lisbon',istanbul:'Europe/Istanbul',ricard:'Europe/Paris',kyalami:'Africa/Johannesburg'};
const SES=[['FirstPractice','VT1','FP1'],['SecondPractice','VT2','FP2'],['ThirdPractice','VT3','FP3'],['SprintQualifying','Sprintkwalificatie','Sprint Qualifying'],['Sprint','Sprint','Sprint'],['Qualifying','Kwalificatie','Qualifying'],[null,'Race','Race']];
const loc=EN?'en-GB':'nl-NL';
const fmt=(d,tz,o)=>new Intl.DateTimeFormat(loc,{timeZone:tz,...o}).format(d);
const off=(d,tz)=>{const p=new Intl.DateTimeFormat('en-US',{timeZone:tz,timeZoneName:'shortOffset'}).formatToParts(d).find(x=>x.type=='timeZoneName').value;return p.replace('GMT','UTC')=='UTC'?'UTC+0':p.replace('GMT','UTC')};
const pd=r=>{const o={day:'numeric',month:'short'};return fmt(new Date(r.start+'T12:00:00Z'),'UTC',{day:'numeric'})+'–'+fmt(new Date(r.date+'T12:00:00Z'),'UTC',o)};
const T=s=>new Date(s.date+'T'+(s.time||'12:00:00Z'));
async function get(u){const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw 0;return (await r.json()).MRData}
let TR=[],CR={};
const SEA=new URLSearchParams(location.search).get('s');
async function load(){let races,src='live';
 try{CR=await (await fetch('/f1/tracks/credits.json?v=20261020-f1h')).json();TR=Object.keys(CR)}catch(e){}
 document.getElementById('sw').innerHTML=['2026','2027'].map(y=>(SEA||'2026')==y?`<b>${y}</b>`:`<a href="?s=${y}">${y}</a>`).join(' ');
 if(SEA=='2027'){try{races=(await get('https://api.jolpi.ca/ergast/f1/2027.json')).RaceTable.Races}catch(e){}
  if(!races||!races.length){try{races=(await (await fetch('/f1/2027.json?v=20261020-f1h')).json()).MRData.RaceTable.Races;src='prov'}catch(e){}}
  if(!races||!races.length){document.getElementById('list').innerHTML='<p class=sub>'+L('Kalender 2027 nog niet bekend.','2027 calendar not yet published.')+'</p>';return}
  return render(races,{},src)}
 try{races=(await get('https://api.jolpi.ca/ergast/f1/current.json')).RaceTable.Races;
  const last=races[races.length-1];if(new Date()>new Date(T(last).getTime()+864e5)){try{const n=(await get('https://api.jolpi.ca/ergast/f1/'+(+last.season+1)+'.json')).RaceTable.Races;if(n.length)races=n}catch(e){}}}
 catch(e){races=(await (await fetch('/f1/fallback.json?v=20261020-f1h')).json()).MRData.RaceTable.Races;src='fb'}
 let win={};try{(await get('https://api.jolpi.ca/ergast/f1/'+races[0].season+'/results/1.json?limit=100')).RaceTable.Races.forEach(r=>win[r.round]=r.Results[0].Driver)}
 catch(e){try{(await (await fetch('/f1/winners.json?v=20261020-f1h')).json()).MRData.RaceTable.Races.forEach(r=>win[r.round]=r.Results[0].Driver)}catch(e){}}
 render(races,win,src)}
function render(races,win,src){const now=Date.now();const el=document.getElementById('list');
 document.getElementById('season').textContent=races[0].season;
 const next=races.find(r=>T(r).getTime()+2*36e5>now);
 el.innerHTML=races.map(r=>{const c=r.Circuit,tz=TZ[c.circuitId]||'UTC',past=T(r).getTime()+2*36e5<now,isN=r===next;
  const rows=r.provisional?'':SES.map(([k,nl,en])=>{const s=k?r[k]:r;if(!s)return'';const d=T(s);
   return `<tr${k?'':' class=race'}><td>${L(nl,en)}</td><td>${fmt(d,tz,{weekday:'short',day:'numeric',month:'short'})} ${fmt(d,tz,{hour:'2-digit',minute:'2-digit'})}</td><td><b>${fmt(d,'Europe/Amsterdam',{weekday:'short',hour:'2-digit',minute:'2-digit'})}</b></td></tr>`}).join('');
  const w=win[r.round];
  return `<article class="${past?'past':''}${isN?' next':''}" id="r${r.round}"><div class=h><span class=rd>${r.round}</span><div><h2>${r.raceName.replace('Grand Prix','GP')}</h2><p>${c.circuitName} · ${c.Location.locality}, ${c.Location.country}</p></div></div>
  ${isN&&!r.provisional?`<p class=cd data-t="${T(r).toISOString()}"></p>`:''}${past&&w?`<p class=win>${L('Winnaar','Winner')}: ${w.givenName} ${w.familyName}</p>`:''}
  ${r.provisional?`<p class=prov>${pd(r)} · ${r.sprint?'Sprint · ':''}${L('Voorlopig, sessietijden nog niet bekend','Provisional, session times not yet published')}</p>`:`<details${isN?' open':''}><summary>${L('Tijden','Times')}</summary><table><tr><th></th><th>${L('Lokaal','Local')} (${off(T(r),tz)})</th><th>NL</th></tr>${rows}</table>
  </details>`}${TR.includes(c.circuitId)?`<details class=trk data-c="${c.circuitId}"><summary>${L('Plattegrond','Circuit map')}</summary><div class=tb></div></details>`:''}</article>`}).join('');
 if(src=='prov')document.getElementById('subt').textContent=L('Officiële racedata; sessietijden volgen zodra ze bekend zijn.','Official race dates; session times will follow once published.');
 if(src=='prov')document.getElementById('note').textContent=L('Bron: officiële kalender 2027 (formula1.com / FIA, 16-09-2026). Voorlopig; tijden volgen later.','Source: official 2027 calendar (formula1.com / FIA, 16 Sep 2026). Provisional; times to follow.');
 if(src=='fb')document.getElementById('note').textContent=L('Live data niet bereikbaar – opgeslagen kalender getoond.','Live data unavailable – showing saved calendar.');
 const map=L_.map('map',{scrollWheelZoom:false,attributionControl:false}).setView([25,10],1);L_.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:''}).addTo(map);L_.control.attribution({prefix:false}).addAttribution('© OpenStreetMap').addTo(map);
 const mk={};races.forEach(r=>{const c=r.Circuit,n=r===next;mk[r.round]=L_.circleMarker([+c.Location.lat,+c.Location.long],{radius:n?8:5,color:n?'#d62828':'#111',fillColor:n?'#d62828':(T(r)<now?'#999':'#111'),fillOpacity:1,weight:n?3:1}).addTo(map).bindPopup(`<b>${r.round}. ${r.raceName}</b><br>${c.circuitName}`)});
 el.addEventListener('toggle',e=>{const d=e.target;if(d.classList&&d.classList.contains('trk')&&d.open&&!d.dataset.l){d.dataset.l=1;d.querySelector('.tb').innerHTML=`<img src="/f1/tracks/${d.dataset.c}.svg?v=20261020-f1h" alt="${L('Plattegrond','Circuit map')}" loading=lazy><small>${(c=>`<a href="${c.u}" target=_blank rel=noopener>${c.a}</a>, ${c.l}, Wikimedia Commons`)(CR[d.dataset.c])}</small>`}},true);
 el.addEventListener('click',e=>{const a=e.target.closest('[data-r]');if(a){const m=mk[a.dataset.r];map.setView(m.getLatLng(),11);m.openPopup()}});
 const cd=document.querySelector('.cd');const tick=()=>{if(!cd)return;let s=Math.max(0,(new Date(cd.dataset.t)-Date.now())/1e3|0);const d=s/86400|0,h=s%86400/3600|0,m=s%3600/60|0;cd.textContent=L('Race over ','Race in ')+`${d}d ${h}u ${m}m`.replace('u',L('u','h'))};tick();setInterval(tick,3e4);
 if(next)setTimeout(()=>document.getElementById('r'+next.round).scrollIntoView({block:'start'}),50)}
const L_=window.L;load();
