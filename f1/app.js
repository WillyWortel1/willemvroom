(function(){
const EN=location.pathname.includes('/f1/en');const L=(nl,en)=>EN?en:nl;
const TZ={albert_park:'Australia/Melbourne',shanghai:'Asia/Shanghai',suzuka:'Asia/Tokyo',bahrain:'Asia/Bahrain',jeddah:'Asia/Riyadh',miami:'America/New_York',villeneuve:'America/Toronto',monaco:'Europe/Monaco',catalunya:'Europe/Madrid',madring:'Europe/Madrid',red_bull_ring:'Europe/Vienna',silverstone:'Europe/London',spa:'Europe/Brussels',hungaroring:'Europe/Budapest',zandvoort:'Europe/Amsterdam',monza:'Europe/Rome',imola:'Europe/Rome',baku:'Asia/Baku',sepang:'Asia/Kuala_Lumpur',marina_bay:'Asia/Singapore',americas:'America/Chicago',rodriguez:'America/Mexico_City',interlagos:'America/Sao_Paulo',vegas:'America/Los_Angeles',losail:'Asia/Qatar',yas_marina:'Asia/Dubai',portimao:'Europe/Lisbon',istanbul:'Europe/Istanbul',ricard:'Europe/Paris',kyalami:'Africa/Johannesburg'};
const SES=[['FirstPractice','VT1','FP1'],['SecondPractice','VT2','FP2'],['ThirdPractice','VT3','FP3'],['SprintQualifying','Sprintkwalificatie','Sprint Qualifying'],['Sprint','Sprint','Sprint'],['Qualifying','Kwalificatie','Qualifying'],[null,'Race','Race']];
const loc=EN?'en-GB':'nl-NL';
const fmt=(d,tz,o)=>new Intl.DateTimeFormat(loc,{timeZone:tz,...o}).format(d);
const off=(d,tz)=>{const p=new Intl.DateTimeFormat('en-US',{timeZone:tz,timeZoneName:'shortOffset'}).formatToParts(d).find(x=>x.type=='timeZoneName').value;return p.replace('GMT','UTC')=='UTC'?'UTC+0':p.replace('GMT','UTC')};
const W={weekday:'short',day:'numeric',month:'short'};const pd=r=>fmt(new Date(r.start+'T12:00:00Z'),'UTC',W)+' – '+fmt(new Date(r.date+'T12:00:00Z'),'UTC',W);
const wr=(r,tz)=>{const a=r.FirstPractice||r;return fmt(T(a),tz,W)+' – '+fmt(T(r),tz,W)};
const T=s=>new Date(s.date+'T'+(s.time||'12:00:00Z'));
async function get(u){const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw 0;return (await r.json()).MRData}
let TR=[],CR={},CN=null;
const CAL='<svg viewBox="0 0 24 24" width=16 height=16 fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><rect x=3 y=5 width=18 height=16 rx=2 /><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
const SEA=new URLSearchParams(location.search).get('s');
function calUI(y){const b=document.getElementById('cal');if(!b)return;const f=`willemvroom.nl/f1/f1-${y}.ics`;
 b.innerHTML=`<button type=button class=calb aria-expanded=false>${CAL}<span>${L('Zet in je agenda','Add to calendar')}</span></button><div class=calsheet hidden><a href="webcal://${f}">${L('Abonneren (iPhone/Mac)','Subscribe (iPhone/Mac)')}</a><a href="https://calendar.google.com/calendar/r?cid=webcal://${f}" target=_blank rel=noopener>${L('Google Agenda','Google Calendar')}</a><a href="/f1/f1-${y}.ics?v=20261021-f1u">Download .ics</a><p>${L('Abonneren houdt tijden automatisch bij.','Subscribing keeps times up to date automatically.')}${y=='2027'?' '+L('2027: voorlopige weekenddata, tijden volgen.','2027: provisional weekend dates, times to follow.'):''}</p></div>`;
 const bt=b.querySelector('.calb'),sh=b.querySelector('.calsheet');bt.onclick=()=>{sh.hidden=!sh.hidden;bt.setAttribute('aria-expanded',!sh.hidden)}}
async function load(){let races,src='live';calUI(SEA=='2027'?'2027':'2026');
 try{CR=await (await fetch('/f1/tracks/credits.json?v=20261021-f1u')).json();TR=Object.keys(CR)}catch(e){}
 document.getElementById('sw').innerHTML=['2026','2027'].map(y=>(SEA||'2026')==y?`<b>${y}</b>`:`<a href="?s=${y}">${y}</a>`).join(' ');
 if(SEA=='2027'){try{races=(await get('https://api.jolpi.ca/ergast/f1/2027.json')).RaceTable.Races}catch(e){}
  if(!races||!races.length){try{races=(await (await fetch('/f1/2027.json?v=20261021-f1u')).json()).MRData.RaceTable.Races;src='prov'}catch(e){}}
  if(!races||!races.length){document.getElementById('list').innerHTML='<p class=sub>'+L('Kalender 2027 nog niet bekend.','2027 calendar not yet published.')+'</p>';return}
  return render(races,{},src)}
 try{races=(await get('https://api.jolpi.ca/ergast/f1/current.json')).RaceTable.Races;
  const last=races[races.length-1];if(new Date()>new Date(T(last).getTime()+864e5)){try{const n=(await get('https://api.jolpi.ca/ergast/f1/'+(+last.season+1)+'.json')).RaceTable.Races;if(n.length)races=n}catch(e){}}}
 catch(e){races=(await (await fetch('/f1/fallback.json?v=20261021-f1u')).json()).MRData.RaceTable.Races;src='fb'}
 let win={};try{(await get('https://api.jolpi.ca/ergast/f1/'+races[0].season+'/results/1.json?limit=100')).RaceTable.Races.forEach(r=>win[r.round]=r.Results[0].Driver)}
 catch(e){try{(await (await fetch('/f1/winners.json?v=20261021-f1u')).json()).MRData.RaceTable.Races.forEach(r=>win[r.round]=r.Results[0].Driver)}catch(e){}}
 render(races,win,src)}
function provTimes(r,tz){const d0=new Date(r.start+'T12:00:00Z'),day=i=>new Date(d0.getTime()+i*864e5);
 const S=r.sprint?[['VT1','FP1',0],['Sprintkwalificatie','Sprint Qualifying',0],['Sprint','Sprint',1],['Kwalificatie','Qualifying',1],['Race','Race',2]]:[['VT1','FP1',0],['VT2','FP2',0],['VT3','FP3',1],['Kwalificatie','Qualifying',1],['Race','Race',2]];
 const ref=day(2),tbc=L('nog niet bekend','TBC');
 return `<details><summary>${L('Tijden','Times')}</summary><table><tr><th></th><th>${L('Lokaal','Local')} (${off(ref,tz)})</th><th>NL (${off(ref,'Europe/Amsterdam')})</th></tr>${S.map(([nl,en,i])=>`<tr${en=='Race'?' class=race':''}><td>${L(nl,en)}</td><td>${fmt(day(i),'UTC',W)}* · ${tbc}</td><td>${tbc}</td></tr>`).join('')}</table><p class=note>* ${L('Verwacht op basis van het standaard F1-weekendformat; het officiële 2027-schema is nog niet gepubliceerd.','Expected, based on the standard F1 weekend format; the official 2027 schedule has not been published yet.')}</p></details>`}
function testCard(){const dd=['24','25','26','27'].map((d,i)=>`<tr><td>${L('Dag','Day')} ${i+1}</td><td>${fmt(new Date(`2027-02-${d}T12:00:00Z`),'UTC',{weekday:'short',day:'numeric',month:'short'})} · ${L('nog niet bekend','TBC')}</td><td>${L('nog niet bekend','TBC')}</td></tr>`).join('');
 return `<article class=test><div class=h><span class=rd>T</span><a class=ical href="/f1/ics/2027-test.ics?v=20261021-f1u" aria-label="${L('In agenda','Add to calendar')}" title="${L('In agenda','Add to calendar')}">${CAL}</a><div><h2>${L('Wintertest','Pre-season testing')}</h2><p>Bahrain International Circuit · Sakhir, Bahrain</p></div></div><p class=prov>${fmt(new Date('2027-02-24T12:00:00Z'),'UTC',W)} – ${fmt(new Date('2027-02-27T12:00:00Z'),'UTC',W)} · ${L('Bron','Source')}: FIA / formula1.com</p>
 <details><summary>${L('Tijden','Times')}</summary><table><tr><th></th><th>${L('Lokaal','Local')} (${off(new Date('2027-02-25T12:00:00Z'),'Asia/Bahrain')})</th><th>NL (${off(new Date('2027-02-25T12:00:00Z'),'Europe/Amsterdam')})</th></tr>${dd}</table></details>${TR.includes('bahrain')?`<details class=trk data-c="bahrain"><summary>${L('Plattegrond','Circuit map')}</summary><div class=tb></div></details>`:''}</article>`}
function render(races,win,src){const now=Date.now();const el=document.getElementById('list');
 document.getElementById('season').textContent=races[0].season;
 const next=races.find(r=>T(r).getTime()+2*36e5>now);
 const card=r=>{const c=r.Circuit,tz=TZ[c.circuitId]||'UTC',past=T(r).getTime()+2*36e5<now,isN=r===next;
  const rows=r.provisional?'':SES.map(([k,nl,en])=>{const s=k?r[k]:r;if(!s)return'';const d=T(s);
   return `<tr${k?'':' class=race'}><td>${L(nl,en)}</td><td>${fmt(d,tz,{weekday:'short',day:'numeric',month:'short'})} ${fmt(d,tz,{hour:'2-digit',minute:'2-digit'})}</td><td><b>${fmt(d,'Europe/Amsterdam',{weekday:'short',day:'numeric',month:'short'})} ${fmt(d,'Europe/Amsterdam',{hour:'2-digit',minute:'2-digit'})}</b></td></tr>`}).join('');
  const w=win[r.round];
  return `<article class="${past?'past':''}${isN?' next':''}" id="r${r.round}"><div class=h><span class=rd>${r.round}</span><a class=ical href="/f1/ics/${r.season}-r${String(r.round).padStart(2,'0')}.ics?v=20261021-f1u" aria-label="${L('In agenda','Add to calendar')}: ${r.raceName}" title="${L('In agenda','Add to calendar')}">${CAL}</a><div><h2>${r.raceName.replace('Grand Prix','GP')}</h2><p>${c.circuitName} · ${c.Location.locality}, ${c.Location.country}</p>${r.provisional?'':`<p class=wk>${wr(r,tz)}</p>`}</div></div>
  ${isN&&!r.provisional?`<p class=cd data-t="${T(r).toISOString()}"></p>`:''}${past&&w?`<p class=win>${L('Winnaar','Winner')}: ${w.givenName} ${w.familyName}</p>`:''}
  ${r.provisional?`<p class=prov>${pd(r)} · ${r.sprint?'Sprint · ':''}${L('Voorlopig, sessietijden nog niet bekend','Provisional, session times not yet published')}</p>${provTimes(r,tz)}`:`<details${isN?' open':''}><summary>${L('Tijden','Times')}</summary><table><tr><th></th><th>${L('Lokaal','Local')} (${off(T(r),tz)})</th><th>NL</th></tr>${rows}</table>
  </details>`}${TR.includes(c.circuitId)?`<details class=trk data-c="${c.circuitId}"><summary>${L('Plattegrond','Circuit map')}</summary><div class=tb></div></details>`:''}</article>`};
 const isPast=r=>T(r).getTime()+2*36e5<now,pr=races.filter(isPast),up=races.filter(r=>!isPast(r));
 el.innerHTML=(races[0].season=='2027'?testCard():'')+(pr.length?`<details class=pastgrp${up.length?'':' open'}><summary>${L('Verreden races','Past races')} (${pr.length})</summary><div class=pastl>${pr.map(card).join('')}</div></details>`:'')+(up.length?card(up[0]):'')+(up.length>1?`<details class=pastgrp><summary>${L('Volgende races','Later races')} (${up.length-1})</summary><div class=pastl>${up.slice(1).map(card).join('')}</div></details>`:'');
 if(src=='prov')document.getElementById('subt').textContent=L('Officiële racedatums; sessietijden volgen zodra ze bekend zijn.','Official race dates; session times will follow once published.');
 if(src=='prov')document.getElementById('note').textContent=L('Bron: officiële kalender 2027 (formula1.com / FIA, 16-09-2026). Voorlopig; tijden volgen later.','Source: official 2027 calendar (formula1.com / FIA, 16 Sep 2026). Provisional; times to follow.');
 if(src=='fb')document.getElementById('note').textContent=L('Live data niet bereikbaar – opgeslagen kalender getoond.','Live data unavailable – showing saved calendar.');
 const map=L_.map('map',{scrollWheelZoom:false,attributionControl:false}).setView([25,10],1);L_.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:''}).addTo(map);L_.control.attribution({prefix:false}).addAttribution('© OpenStreetMap').addTo(map);
 const mk={};races.forEach(r=>{const c=r.Circuit,n=r===next;mk[r.round]=L_.circleMarker([+c.Location.lat,+c.Location.long],{radius:n?8:5,color:n?'#d62828':'#111',fillColor:n?'#d62828':(T(r)<now?'#999':'#111'),fillOpacity:1,weight:n?3:1,className:n?'mk nx':(T(r)<now?'mk ps':'mk up')}).addTo(map).bindPopup(`<b>${r.round}. ${r.raceName}</b><br>${c.circuitName}`)});
 el.addEventListener('toggle',async e=>{const d=e.target;if(!(d.classList&&d.classList.contains('trk')&&d.open&&!d.dataset.l))return;d.dataset.l=1;const tb=d.querySelector('.tb'),id=d.dataset.c,cr=CR[id];
  const cap=`<small><a href="${cr.u}" target=_blank rel=noopener>${cr.a}</a>, ${cr.l}, Wikimedia Commons</small>`;
  try{if(!CN)CN=(await (await fetch('/f1/tracks/corners.json?v=20261021-f1u')).json()).circuits;}catch(x){CN={}}
  try{const tx=await (await fetch(`/f1/tracks/${id}.svg?v=20261021-f1u`)).text();tb.innerHTML='<div class=sv></div><div class=tip hidden></div>'+cap;const sv=tb.querySelector('.sv');sv.innerHTML=tx.replace(/<\?xml[^>]*>|<!DOCTYPE[^>]*>/g,'');
   const g=sv.querySelector('svg');if(!g.getAttribute('viewBox')){const w=parseFloat(g.getAttribute('width')),h=parseFloat(g.getAttribute('height'));if(w&&h)g.setAttribute('viewBox',`0 0 ${w} ${h}`)}g.removeAttribute('width');g.removeAttribute('height');
   const nm=CN[id]||{},tip=tb.querySelector('.tip'),seen=new Set();
   const M=g.getScreenCTM().inverse(),sc=1/g.getScreenCTM().a,P=(x,y)=>{const p=g.createSVGPoint();p.x=x;p.y=y;return p.matrixTransform(M)};
   g.querySelectorAll('text').forEach(t=>{const n=t.textContent.trim();if(!/^\d{1,2}$/.test(n)||seen.has(+n))return;let q;try{const tc=t.textContent,k=t.getNumberOfChars();if(!k)return;let i0=tc.search(/\d/),i1=tc.length-1-[...tc].reverse().join('').search(/\d/);if(k!=tc.length){i0=0;i1=k-1}const e0=t.getExtentOfChar(i0),e1=t.getExtentOfChar(i1),m=t.getScreenCTM(),pt=(x,y)=>{const p=g.createSVGPoint();p.x=x;p.y=y;return p.matrixTransform(m)},A=pt(e0.x,e0.y),B=pt(e1.x+e1.width,e1.y+e1.height);q={x:Math.min(A.x,B.x),y:Math.min(A.y,B.y),width:Math.abs(B.x-A.x),height:Math.abs(B.y-A.y)}}catch(x){return}if(!q.width)return;const c=P(q.x+q.width/2,q.y+q.height/2);const r=document.createElementNS('http://www.w3.org/2000/svg','circle');
    r.setAttribute('cx',c.x);r.setAttribute('cy',c.y);r.setAttribute('r',Math.max(q.width,q.height,26)/2*sc*1.2);r.setAttribute('fill','transparent');r.setAttribute('class','hit');r.dataset.n=n;g.appendChild(r);seen.add(+n);
    r.addEventListener('click',ev=>{ev.stopPropagation();const q=r.getBoundingClientRect(),o=tb.getBoundingClientRect();tip.innerHTML=`<b>${L('Bocht','Turn')} ${n}</b>${nm[n]?' · '+nm[n]:''}`;tip.hidden=false;tip.style.left=Math.min(Math.max(q.left-o.left+q.width/2,80),o.width-80)+'px';tip.style.top=(q.top-o.top)+'px'})});
   sv.addEventListener('click',()=>tip.hidden=true);
   const ks=Object.keys(nm).filter(k=>seen.has(+k)).sort((a,b)=>a-b);if(ks.length)tb.insertAdjacentHTML('beforeend',`<div class=bl><b>${L('Bochten','Corners')}</b><ol>${ks.map(k=>`<li><span>${k}</span>${nm[k]}</li>`).join('')}</ol></div>`);
  }catch(x){tb.innerHTML=`<img src="/f1/tracks/${id}.svg?v=20261021-f1u" alt="">`+cap}},true);
 el.addEventListener('click',e=>{const a=e.target.closest('[data-r]');if(a){const m=mk[a.dataset.r];map.setView(m.getLatLng(),11);m.openPopup()}});
 const cd=document.querySelector('.cd');const tick=()=>{if(!cd)return;let s=Math.max(0,(new Date(cd.dataset.t)-Date.now())/1e3|0);const d=s/86400|0,h=s%86400/3600|0,m=s%3600/60|0;cd.textContent=L('Race over ','Race in ')+`${d}d ${h}u ${m}m`.replace('u',L('u','h'))};tick();setInterval(tick,3e4);
 if(next)setTimeout(()=>document.getElementById('r'+next.round).scrollIntoView({block:'start'}),50)}
const L_=window.L;
load().catch(e=>{console.error(e);const el=document.getElementById('list');if(el)el.innerHTML='<p class=sub>'+L('Kalender kon niet laden. Probeer het later opnieuw.','Calendar could not load. Please try again later.')+'</p>'});

})();
