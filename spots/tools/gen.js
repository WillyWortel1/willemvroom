// ==== ALGEMEEN CONDITIEOVERZICHT (geen sportkeuze) ====
// Zeewaartse kustrichting uit /spots/coast.js; anders schatting uit wind- t.o.v. golfrichting.
function rel(k,i){const wd=F[k].hourly.wind_direction_10m[i],gd=M[k].hourly.wave_direction[i];const cb=(window.COAST||{})[spots[k].naam];
 if(cb&&cb[1]&&wd!=null){let d=Math.abs(wd-cb[0])%360;if(d>180)d=360-d;return d<=67.5?'on':d>=112.5?'off':'side';}
 if(wd==null||gd==null||M[k].hourly.wave_height[i]==null||M[k].hourly.wave_height[i]<0.5)return 'unk';
 let d=Math.abs(wd-gd)%360;if(d>180)d=360-d;return d<60?'on':d>120?'off':'side';}
const relL=o=>({on:T('aanlandig','onshore','auflandig'),side:T('zijwaarts','side-shore','sideshore'),off:T('aflandig','offshore','ablandig'),unk:T('richting t.o.v. kust onbekend','direction vs. coast unknown','Richtung zur Küste unbekannt')})[o];
function gIdx(k,date){const m=M[k].hourly;return day==0?m.time.indexOf(new Date(Date.now()+M[k].utc_offset_seconds*1000).toISOString().slice(0,13)+':00'):m.time.indexOf(date+'T13:00');}
// niveau 3 = aflandig (waarschuwing); overige niveaus worden niet getoond
function cond(k,date){const i=gIdx(k,date);if(i<0)return null;const w=F[k].hourly,m=M[k].hourly;
 const ws=w.wind_speed_10m[i],g=w.wind_gusts_10m[i],H=m.wave_height[i],o=rel(k,i);let l=0;
 if((ws!=null&&ws>=10)||(H!=null&&H>=0.8))l=1;
 if((ws!=null&&ws>=20)||(g!=null&&g>=30)||(H!=null&&H>=2))l=2;
 if(o=='off'&&ws!=null&&ws>=5)l=3;
 return {l,i,ws,g,H,P:m.wave_period[i],wd:w.wind_direction_10m[i],o,t:day==0?T('nu','now','jetzt')+' ('+m.time[i].slice(11)+')':'13:00'};}
const condCol=c=>'#111';
function condH(k,date){const c=cond(k,date);if(!c)return '<div class="rt">–</div>';
 let h=`<div class="rt"><small>${c.t}</small><br>💨 ${f(c.ws)}/${f(c.g)} kn ${card(c.wd)} · ${relL(c.o)} · 🌊 ${f(c.H,1)} m ${f(c.P)} s</div>`;
 if(c.l==3)h+=`<p class="info" style="color:#ffb4a8;font-weight:600;margin:0 0 8px">⚠️ ${T('Aflandige wind','Offshore wind','Ablandiger Wind')} (${card(c.wd)}, ${Math.round(c.ws)} kn${day?' · 13:00':''}) – ${T('je drijft van de kust af.','you drift away from the shore.','du treibst von der Küste weg.')}</p>`;
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
