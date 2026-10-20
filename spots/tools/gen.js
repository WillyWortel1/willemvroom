// ==== ALGEMEEN CONDITIEOVERZICHT (geen sportkeuze) ====
// Zeewaartse kustrichting uit /spots/coast.js; anders schatting uit wind- t.o.v. golfrichting.
function rel(k,i){const wd=F[k].hourly.wind_direction_10m[i],gd=M[k].hourly.wave_direction[i];const cb=(window.COAST||{})[spots[k].naam];
 if(cb&&cb[1]&&wd!=null){let d=Math.abs(wd-cb[0])%360;if(d>180)d=360-d;return d<=67.5?'on':d>=112.5?'off':d>90?'sideoff':'side';} // zijwaarts 67,5–90°, zijaflandig 90–112,5°, aflandig ≥112,5°
 if(cb&&!cb[1]&&wd!=null){let d=Math.abs(wd-cb[0])%360;if(d>180)d=360-d;if(d>=120)return 'off';if(d<=45)return 'on';} // onzekere kust: alleen duidelijke gevallen
 if(wd==null||gd==null||M[k].hourly.wave_height[i]==null||M[k].hourly.wave_height[i]<0.5)return 'unk';
 let d=Math.abs(wd-gd)%360;if(d>180)d=360-d;return d<60?'on':d>120?'off':'side';}
const relL=o=>({on:T('aanlandig','onshore','auflandig'),side:T('zijwaarts','side-shore','sideshore'),off:T('aflandig','offshore','ablandig'),sideoff:T('zijaflandig','side-offshore','schräg ablandig'),unk:T('richting t.o.v. kust onbekend','direction vs. coast unknown','Richtung zur Küste unbekannt')})[o];
function gIdx(k,date){const m=M[k].hourly;return day==0?m.time.indexOf(new Date(Date.now()+M[k].utc_offset_seconds*1000).toISOString().slice(0,13)+':00'):m.time.indexOf(date+'T13:00');}
// niveau 3 = aflandig (waarschuwing); overige niveaus worden niet getoond
function cond(k,date){const i=gIdx(k,date);if(i<0)return null;const w=F[k].hourly,m=M[k].hourly;
 const ws=w.wind_speed_10m[i],g=w.wind_gusts_10m[i],H=m.wave_height[i],o=rel(k,i);let l=0;
 if((ws!=null&&ws>=10)||(H!=null&&H>=0.8))l=1;
 if((ws!=null&&ws>=20)||(g!=null&&g>=30)||(H!=null&&H>=2))l=2;
 if(o=='off'&&ws!=null&&ws>=5)l=3;
 return {l,i,ws,g,H,P:m.wave_period[i],wd:w.wind_direction_10m[i],o,t:day==0?T('nu','now','jetzt')+' ('+m.time[i].slice(11)+')':'13:00'};}
// kleur stip: algemene kwaliteit q 0..1 (1 = groen, 0 = rood). Indicatie, geen veiligheidsadvies.
function condQ(k,c){if(!c)return null;const i=c.i,w=F[k].hourly,m=M[k].hourly,ws=c.ws,g=c.g,H=c.H,P=c.P;
 if(c.l==3)return 0;                                             // aflandig ≥5 kn
 if((ws!=null&&ws>32)||(g!=null&&g>40)||(H!=null&&H>3.5))return 0; // extreem
 if((ws==null||ws<6)&&(H==null||H<0.3))return 0;                 // niets: geen wind en geen golven
 let wq=0;if(ws!=null){wq=ws<6?0:ws<12?(ws-6)/6:ws<=25?1:1-(ws-25)/7*0.7;}
 let vq=0;if(H!=null){vq=H<0.3?0:H<0.6?(H-0.3)/0.3:H<=2?1:1-(H-2)/1.5*0.7;vq*=P==null?0.8:P<5?0.5:P<7?0.75:P<9?0.9:1;}
 let q=Math.max(wq,vq);
 if(c.o=='sideoff'&&ws!=null&&ws>=5)q=Math.min(q,0.45);           // zijaflandig: nooit groen
 if(c.o=='unk'&&ws!=null&&ws>=10)q=Math.min(q,0.6);               // richting t.o.v. kust onbekend: voorzichtig
 if(g!=null&&ws!=null&&g-ws>15)q-=0.15;                         // zeer vlagerig
 if(c.o=='on'&&ws!=null&&ws>15&&H!=null&&H>1&&P!=null&&P<6)q-=0.2; // korte aanlandige chop
 const cu=m.ocean_current_velocity[i]==null?null:m.ocean_current_velocity[i]/1.852;if(cu!=null){if(cu>1.5)q-=0.25;else if(cu>0.8)q-=0.1;}
 const wc=w.weather_code[i],r=w.precipitation[i];if(wc!=null&&wc>=95)q-=0.5;else if(r!=null){if(r>2)q-=0.2;else if(r>0.5)q-=0.1;}
 if(w.is_day&&w.is_day[i]===0)q-=0.4;                            // donker
 return Math.max(0,Math.min(1,q));}
const condCol=(c,k)=>{const q=condQ(k,c);return q==null?'#888':`hsl(${Math.round(120*q)},80%,45%)`};
function condH(k,date){const c=cond(k,date);if(!c)return '<div class="rt">–</div>';
 let h=`<div class="rt"><small>${c.t}</small><br>💨 ${f(c.ws)}/${f(c.g)} kn ${card(c.wd)} · ${relL(c.o)} · 🌊 ${f(c.H,1)} m ${f(c.P)} s</div>`;
 if(c.l==3)h+=`<p class="info" style="color:#ffb4a8;font-weight:600;margin:0 0 8px">⚠️ ${T('Aflandige wind','Offshore wind','Ablandiger Wind')} (${card(c.wd)}, ${Math.round(c.ws)} kn${day?' · 13:00':''}) – ${T('je drijft van de kust af.','you drift away from the shore.','du treibst von der Küste weg.')}</p>`;
 if(c.l!=3&&c.o=='sideoff'&&c.ws!=null&&c.ws>=5)h+=`<p class="info" style="color:#ffc89a;font-weight:600;margin:0 0 8px">⚠️ ${T('Zijaflandige wind','Side-offshore wind','Schräg ablandiger Wind')} (${card(c.wd)}, ${Math.round(c.ws)} kn${day?' · 13:00':''}) – ${T('je kunt van de kust af drijven.','you can drift away from the shore.','du kannst von der Küste abtreiben.')}</p>`;
 return h}
function frLabel(){return T('⚠️ Lokale regels','⚠️ Local rules','⚠️ Lokale Regeln')}
function openFR(k){const s=spots[k];
 document.getElementById('frc').innerHTML=`<h4>⚠️ ${T('Lokale regels','Local rules','Lokale Regeln')} – ${esc(spotName(s))}</h4>
 <p>${T('Check ter plaatse de borden en zones (zwem-, surf- en watersportzones, seizoensregels) en vraag bij twijfel de lifeguards of de lokale club.','Check the signs and zones on site (swimming, surf and water-sports zones, seasonal rules) and ask the lifeguards or the local club if in doubt.','Prüfe vor Ort Schilder und Zonen (Bade-, Surf- und Wassersportzonen, saisonale Regeln) und frag im Zweifel die Rettungsschwimmer oder den lokalen Club.')}</p>
 <p>${T('Houd rekening met andere watergebruikers: geef ruimte, ken de voorrangsregels en blijf uit de buurt van zwemmers.','Be considerate of other water users: give space, know the right-of-way rules and keep clear of swimmers.','Nimm Rücksicht auf andere Wassernutzer: halte Abstand, kenne die Vorfahrtsregeln und halte dich von Schwimmern fern.')}</p>
 <p><b>${T('Het overzicht is een indicatie, geen veiligheidsadvies. Beoordeel altijd zelf ter plaatse.','The overview is an indication, not safety advice. Always judge for yourself on site.','Die Übersicht ist eine Orientierung, kein Sicherheitsrat. Beurteile immer selbst vor Ort.')}</b></p>
 <p style="text-align:right"><button class="btn" onclick="closeFR()">${T('Sluiten','Close','Schließen')}</button></p>`;
 document.getElementById('frm').classList.add('open');}
function genRules(){const t={
 nl:'<p><b>Indicatie, geen veiligheidsadvies.</b> Vandaag: het huidige uur; andere dagen: 13:00. Aanlandig/zijwaarts/aflandig: windrichting t.o.v. de kust per spot (waar de kust onduidelijk is geschat uit wind- t.o.v. golfrichting). Beoordeel altijd zelf ter plaatse.</p>',
 en:'<p><b>Indication, not safety advice.</b> Today: the current hour; other days: 13:00. Onshore/side/offshore: wind direction vs. the coast per spot (estimated from wind vs. wave direction where the coastline is unclear). Always judge for yourself on site.</p>',
 de:'<p><b>Orientierung, kein Sicherheitsrat.</b> Heute: die aktuelle Stunde; andere Tage: 13:00. Auflandig/sideshore/ablandig: Windrichtung zur Küste pro Spot (wo die Küste unklar ist, aus Wind- gegenüber Wellenrichtung geschätzt). Beurteile immer selbst vor Ort.</p>'};
 ['nl','en','de'].forEach(l=>{const e=document.getElementById('rules-'+l);if(e)e.innerHTML=t[l]});}
try{localStorage.removeItem('spots-sport')}catch(e){}
// kaartstip met windpijl (pijl wijst waar de wind heen waait)
function seaB(k,c){const cb=(window.COAST||{})[spots[k].naam];if(cb)return cb[0];const wv=c?M[k].hourly.wave_direction[c.i]:null;return wv!=null?wv:270;}
function dotIcon(k,c){const z=map&&map._loaded?map.getZoom():5;const sz=z<5?12:z<7?16:z<9?20:24,as=Math.round(sz*1.1),W=sz*4;const col=condCol(c,k),wd=c?c.wd:null;
 const b=seaB(k,c)*Math.PI/180,dist=sz/2+as/2+1,ax=W/2+Math.sin(b)*dist-as/2,ay=W/2-Math.cos(b)*dist-as/2;
 const ar=wd==null?'':`<svg class="hit" viewBox="-10 -10 20 20" width="${as}" height="${as}" style="position:absolute;left:${ax}px;top:${ay}px;transform:rotate(${(wd+180)%360}deg)"><path d="M0,-9 L6,1 L2,1 L2,9 L-2,9 L-2,1 L-6,1 Z" fill="#000" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
 return L.divIcon({className:'wdot',iconSize:[W,W],iconAnchor:[W/2,W/2],tooltipAnchor:[0,-sz/2],html:`<div class="hit" style="position:absolute;left:${W/2-sz/2}px;top:${W/2-sz/2}px;width:${sz}px;height:${sz}px;border-radius:50%;background:${col};border:2px solid #fff;box-sizing:border-box;box-shadow:0 0 2px rgba(0,0,0,.5)"></div>${ar}`});}
const miniArrow=c=>c&&c.wd!=null?`<span aria-hidden="true" style="display:inline-block;transform:rotate(${(c.wd+180)%360}deg);font-size:.9em;margin-right:4px">↑</span>`:'';
