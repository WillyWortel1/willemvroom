/* Technics SL-1200 MKII demo — Boccaccio / Flesh 33⅓ +8. Audio via YouTube IFrame API, no audio files in repo. */
(function(){
var root=document.getElementById('tt');if(!root)return;
var EN=document.documentElement.lang==='en';
var L=EN?{deck:'Technics SL-1200 MKII turntable',startStop:'Start / stop',r33:'33 rpm',r45:'45 rpm',pick:'Choose a record',lay0:'Put A Split-Second – Flesh on the turntable',lay1:'Put Phantasia – Inner Light on the turntable',alt1:'Sleeve of Phantasia – Inner Light (1991)',start:'▶ Start',stop:'■ Stop',pitchAria:'Pitch from −8 to +8 percent',slider:'Pitch slider on the turntable',step0:'Press Start; the page then tests which speeds YouTube allows on this device.',boc:'Boccaccio setting: 33⅓ +8',orig:'45 original',reset:'Reset',dRpm:'Speed (rpm)',dPitch:'Pitch',dReal:'Real turntable',dYt:'YouTube plays at',dBpm:'BPM (turntable)',dBpmYt:'BPM (what you hear)',notePre:'YouTube speeds in the list: ',notLoaded:'not loaded yet',notePost:'; you hear the nearest step. YouTube keeps the pitch of the sound constant; on a real turntable the pitch drops with the speed, which is why Flesh sounded so heavy and dark in Boccaccio.',p0:'+0.0%',r0:'1.000×',cr0:'Video: A Split Second – Flesh (Full 12" Version), official video on YouTube (channel Abstructure).',cr1:'Video: Phantasia - Inner Light [1991], on YouTube (channel statenhal).',custom:'YouTube follows the pitch in steps of 0.05× (nearest: see below).',coarse1:'This device only plays YouTube at ',coarse2:', so here you hear the pitch in coarse steps.'}:{deck:'Technics SL-1200 MKII draaitafel',startStop:'Start / stop',r33:'33 toeren',r45:'45 toeren',pick:'Kies een plaat',lay0:'Leg A Split-Second – Flesh op de draaitafel',lay1:'Leg Phantasia – Inner Light op de draaitafel',alt1:'Hoes van Phantasia – Inner Light (1991)',start:'▶ Start',stop:'■ Stop',pitchAria:'Pitch van −8 tot +8 procent',slider:'Pitch-schuif op de draaitafel',step0:'Druk op Start; daarna test de pagina welke snelheden YouTube op dit apparaat toestaat.',boc:'Boccaccio-stand: 33⅓ +8',orig:'45 origineel',reset:'Reset',dRpm:'Toerental',dPitch:'Pitch',dReal:'Echte draaitafel',dYt:'YouTube speelt af op',dBpm:'BPM (draaitafel)',dBpmYt:'BPM (wat je hoort)',notePre:'YouTube-snelheden in de lijst: ',notLoaded:'nog niet geladen',notePost:'; je hoort de dichtstbijzijnde stap. YouTube houdt de toonhoogte gelijk; op een echte draaitafel zakt de toon mee, daardoor klonk Flesh in Boccaccio zo zwaar en donker.',p0:'+0,0%',r0:'1,000×',cr0:'Video: A Split Second – Flesh (Full 12" Version), officiële video op YouTube (kanaal Abstructure).',cr1:'Video: Phantasia - Inner Light [1991], op YouTube (kanaal statenhal).',custom:'YouTube volgt de pitch in stappen van 0,05× (dichtstbij: zie hieronder).',coarse1:'Dit apparaat speelt YouTube alleen af op ',coarse2:', dus je hoort de pitch hier in grove stappen.'};
var RECS=[{vid:'-FDy-RVeI-A',bpm:130,a:'A SPLIT-SECOND',t:'FLESH',sub:'45 RPM · ANTLER',name:'A Split-Second – Flesh',credit:L.cr0},{vid:'FHRUPhPNKGA',bpm:null,a:'PHANTASIA',t:'INNER LIGHT',sub:'1991',name:'Phantasia – Inner Light',credit:L.cr1}];
var rec=0,VID=RECS[0].vid,BPM0=RECS[0].bpm;
var S='http://www.w3.org/2000/svg';
var dots='';for(var i=0;i<4;i++){dots+='<circle cx="235" cy="205" r="'+(181-i*4)+'" fill="none" stroke="#c9c9c9" stroke-width="2.2" stroke-dasharray="1.6 '+(2*Math.PI*(181-i*4)/180-1.6).toFixed(3)+'"/>';}
var grooves='';for(var r=64;r<158;r+=5)grooves+='<circle cx="235" cy="205" r="'+r+'" fill="none" stroke="#222" stroke-width="'+(r%15?0.6:1.4)+'"/>';
root.innerHTML=
'<div class="tt-wrap"><div class="tt-deck"><svg viewBox="0 0 520 400" class="tt-svg" role="img" aria-label="'+L.deck+'">'+
'<defs><linearGradient id="ttAl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eeeeee"/><stop offset=".5" stop-color="#c4c4c4"/><stop offset="1" stop-color="#e2e2e2"/></linearGradient>'+
'<radialGradient id="ttRec" cx="50%" cy="50%" r="50%"><stop offset=".4" stop-color="#111"/><stop offset="1" stop-color="#050505"/></radialGradient>'+
'<radialGradient id="ttRed"><stop offset="0" stop-color="#ff5a5a"/><stop offset="1" stop-color="#ff1f2f" stop-opacity="0"/></radialGradient></defs>'+
'<rect x="2" y="2" width="516" height="396" rx="14" fill="url(#ttAl)" stroke="#999"/>'+
'<circle cx="42" cy="42" r="20" fill="#d8d8d8" stroke="#888"/><circle cx="42" cy="42" r="13" fill="#bbb"/>'+
'<g id="ttPlat"><circle cx="235" cy="205" r="186" fill="#2a2a2a"/>'+dots+
'<circle cx="235" cy="205" r="166" fill="#151515"/><text x="235" y="96" text-anchor="middle" font-family="Georgia,serif" font-size="30" font-weight="700" fill="#4d5560">Technics</text>'+
'<circle cx="235" cy="205" r="158" fill="url(#ttRec)"/>'+grooves+
'<path d="M235 47 A158 158 0 0 1 380 140" stroke="rgba(255,255,255,.08)" stroke-width="40" fill="none"/>'+
'<circle cx="235" cy="205" r="50" fill="#e8e2d0"/><circle cx="235" cy="205" r="50" fill="none" stroke="#111" stroke-width="1"/>'+
'<text x="235" y="190" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" font-weight="700" fill="#111" id="ttLa1">A SPLIT-SECOND</text>'+
'<text x="235" y="230" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#c8102e" id="ttLa2">FLESH</text>'+
'<text x="235" y="243" text-anchor="middle" font-family="Arial,sans-serif" font-size="6.5" fill="#333" id="ttLa3">45 RPM · ANTLER</text></g>'+
'<circle cx="235" cy="205" r="4" fill="#ddd" stroke="#777"/>'+
'<defs><clipPath id="ttLitC"><circle cx="73" cy="286" r="28"/></clipPath><radialGradient id="ttBeamG" cx="73" cy="286" r="34" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ff2a3a" stop-opacity=".55"/><stop offset="1" stop-color="#ff2a3a" stop-opacity="0"/></radialGradient><linearGradient id="ttConeG" x1="44" y1="300" x2="78" y2="283" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ff3b4a" stop-opacity=".85"/><stop offset="1" stop-color="#ff2a3a" stop-opacity=".15"/></linearGradient></defs>'+'<g id="ttBeam" style="pointer-events:none"><polygon points="41.3,294.6 61.4,262.7 84.6,309.3 46.7,305.4" fill="url(#ttConeG)"/><circle cx="73" cy="286" r="34" fill="url(#ttBeamG)"/><g clip-path="url(#ttLitC)"><g id="ttLit">'+dots.replace(/#c9c9c9/g,'#ff3b4a')+'</g></g></g>'+'<circle id="ttStrobe" cx="44" cy="300" r="20" fill="url(#ttRed)" opacity=".35"/><circle cx="44" cy="300" r="9" fill="#333" stroke="#777"/><circle cx="44" cy="300" r="3.5" fill="#ff2a3a"/>'+
'<g id="ttStart" class="tt-btn" role="button" tabindex="0" aria-label="'+L.startStop+'"><rect x="18" y="335" width="58" height="50" rx="3" fill="#f4f4f4" stroke="#777"/><text x="47" y="377" text-anchor="middle" font-size="7" font-family="Arial" fill="#333">START·STOP</text></g>'+
'<g id="tt33" class="tt-btn" role="button" tabindex="0" aria-label="'+L.r33+'"><rect x="80" y="371" width="28" height="14" rx="2" fill="#f4f4f4" stroke="#777"/><text x="92" y="381" text-anchor="middle" font-size="8" font-family="Arial" fill="#333">33</text><rect id="tt33l" x="98" y="374" width="8" height="3" fill="#ff2a3a"/></g>'+
'<g id="tt45" class="tt-btn" role="button" tabindex="0" aria-label="'+L.r45+'"><rect x="111" y="371" width="28" height="14" rx="2" fill="#f4f4f4" stroke="#777"/><text x="123" y="381" text-anchor="middle" font-size="8" font-family="Arial" fill="#333">45</text><rect id="tt45l" x="129" y="374" width="8" height="3" fill="#ff2a3a"/></g>'+
'<text x="400" y="388" font-family="Georgia,serif" font-size="13" font-weight="700" fill="#333">Technics</text><text x="400" y="396" font-size="5" font-family="Arial" fill="#555">SL-1200MK2 DIRECT DRIVE</text>'+
'<rect x="462" y="225" width="14" height="140" rx="2" fill="#2b2b2b"/><line x1="469" y1="232" x2="469" y2="358" stroke="#555"/>'+
'<g font-size="6" font-family="Arial" fill="#333"><text x="448" y="234">+8</text><text x="450" y="298">0</text><text x="448" y="362">−8</text></g><circle cx="482" cy="295" r="2.5" fill="#2ecc40" id="ttZero"/>'+
'<g id="ttKnob"><rect x="455" y="288" width="28" height="14" rx="2" fill="#e9e9e9" stroke="#666"/><line x1="455" y1="295" x2="483" y2="295" stroke="#c8102e" stroke-width="1.5"/></g>'+
'<text x="455" y="378" font-size="6" font-family="Arial" fill="#333">PITCH ADJ</text>'+
'<circle cx="455" cy="85" r="44" fill="#d0d0d0" stroke="#999"/><circle cx="455" cy="85" r="30" fill="#bdbdbd" stroke="#888"/>'+
'<circle cx="425" cy="36" r="9" fill="#111"/>'+
'<g id="ttArm" style="transform-origin:455px 85px"><rect x="449" y="40" width="12" height="34" rx="3" fill="#555"/><line x1="455" y1="85" x2="455" y2="300" stroke="#cfcfcf" stroke-width="6" stroke-linecap="round"/><line x1="455" y1="85" x2="455" y2="300" stroke="#8a8a8a" stroke-width="1.5"/><g transform="rotate(18 455 312)"><rect x="446" y="296" width="18" height="34" rx="2" fill="#1d1d1d"/><rect x="451" y="318" width="8" height="8" fill="#777"/></g></g>'+
'<circle cx="455" cy="85" r="12" fill="#999" stroke="#666"/><rect x="483" y="140" width="8" height="40" rx="2" fill="#ccc" stroke="#888"/>'+
'<rect id="ttPitchHit" x="440" y="218" width="60" height="154" fill="transparent" role="slider" tabindex="0" aria-label="'+L.slider+'" aria-valuemin="-8" aria-valuemax="8" aria-valuenow="0"/>'+'</svg></div>'+
'<div class="tt-sleeves"><button type="button" class="tt-sleeve-box ttSl on" id="ttBox0" data-rec="0" aria-pressed="true" aria-label="'+L.lay0+'"><span class="tt-sleeve-rec" aria-hidden="true"></span><span class="tt-sleeve" aria-hidden="true"><span class="tt-s1">A SPLIT-SECOND</span><span class="tt-s2">FLESH</span><span class="tt-s3">12" MAXI · ANTLER</span></span></button><button type="button" class="tt-sleeve-box ttSl" id="ttBox1" data-rec="1" aria-pressed="false" aria-label="'+L.lay1+'"><span class="tt-sleeve-rec" aria-hidden="true"></span><span class="tt-sleeve tt-sleeve-pic"><picture><source srcset="/boccaccio/inner-light-hoes.avif" type="image/avif"><source srcset="/boccaccio/inner-light-hoes.webp" type="image/webp"><img src="/boccaccio/inner-light-hoes.jpg" width="320" height="312" loading="lazy" decoding="async" alt="'+L.alt1+'"></picture></span></button></div></div>'+
'<div class="tt-ctrl"><div class="tt-row" role="group" aria-label="'+L.pick+'"><button type="button" class="tt-b ttRec" data-rec="0" aria-pressed="true">A Split-Second – Flesh</button><button type="button" class="tt-b ttRec" data-rec="1" aria-pressed="false">Phantasia – Inner Light</button></div><div class="tt-row"><button type="button" id="ttPlay" class="tt-b">'+L.start+'</button><button type="button" id="ttB33" class="tt-b">33⅓</button><button type="button" id="ttB45" class="tt-b">45</button></div>'+
'<label class="tt-lab" for="ttPitch">Pitch <b id="ttPv">'+L.p0+'</b></label><input id="ttPitch" type="range" min="-8" max="8" step="0.1" value="0" aria-label="'+L.pitchAria+'"><p class="tt-note" id="ttStep" aria-live="polite">'+L.step0+'</p>'+
'<div class="tt-row"><button type="button" id="ttZ" class="tt-b">0</button><button type="button" id="ttBoc" class="tt-b tt-hot">'+L.boc+'</button><button type="button" id="ttOrig" class="tt-b">'+L.orig+'</button><button type="button" id="ttReset" class="tt-b">'+L.reset+'</button></div>'+
'<dl class="tt-dl"><div><dt>'+L.dRpm+'</dt><dd id="ttRpm">45</dd></div><div><dt>'+L.dPitch+'</dt><dd id="ttPp">'+L.p0+'</dd></div><div><dt>'+L.dReal+'</dt><dd id="ttReal">'+L.r0+'</dd></div><div><dt>'+L.dYt+'</dt><dd id="ttYt">—</dd></div><div><dt>'+L.dBpm+'</dt><dd id="ttBpm">≈130</dd></div><div><dt>'+L.dBpmYt+'</dt><dd id="ttBpmYt">—</dd></div></dl>'+
'<p class="tt-note">'+L.notePre+'<span id="ttRates">'+L.notLoaded+'</span>'+L.notePost+'</p>'+

'<div class="tt-yt"><div id="ttPlayer"></div></div><p class="tt-note" id="ttCredit">'+L.cr0+'</p></div>';

var $=function(id){return document.getElementById(id)};
var st={on:false,rpm:45,pitch:0,ang:0,cur:0,arm:0},ARM_OUT=25,ARM_IN=46,player=null,ready=false,rates=[1];
function speed(){return st.rpm/45*(1+st.pitch/100)}
var custom=null;/* null = onbekend, true = YouTube accepteert 0,05-stappen */
function nearest(v){if(custom!==false){return Math.min(2,Math.max(.25,Math.round(v*20)/20))}var b=rates[0];rates.forEach(function(r){if(Math.abs(r-v)<Math.abs(b-v))b=r});return b}
function probe(){if(!ready||custom!==null)return;try{player.setPlaybackRate(1.05);setTimeout(function(){try{var g=player.getPlaybackRate();custom=Math.abs(g-1.05)<.001;$('ttStep').textContent=custom?L.custom:L.coarse1+rates.map(function(r){return nl(r,2)+'×'}).join(', ')+L.coarse2;root.setAttribute('data-custom',custom);upd()}catch(e){}},700)}catch(e){}}
function nl(n,d){var t=n.toFixed(d);return EN?t:t.replace('.',',')}
function upd(){
  var s=speed(),ap=nearest(s),p=(st.pitch>=0?'+':'−')+nl(Math.abs(st.pitch),1)+'%';
  $('ttRpm').textContent=st.rpm===45?'45':'33⅓';$('ttPp').textContent=p;$('ttPv').textContent=p;
  $('ttReal').textContent=nl(s,3)+'×';$('ttBpm').textContent=BPM0?'≈'+Math.round(BPM0*s):'—';
  $('ttYt').textContent=(ready?nl(ap,2)+'×':'—');
  $('ttBpmYt').textContent=(ready&&BPM0?'≈'+Math.round(BPM0*ap):'—');
  $('ttBoc').hidden=!BPM0;
  $('ttKnob').setAttribute('transform','translate(0,'+(-st.pitch/8*63)+')');
  $('ttPitchHit').setAttribute('aria-valuenow',st.pitch);$('ttZero').style.opacity=st.pitch===0?1:.2;
  $('tt33l').style.opacity=st.rpm!==45?1:0;$('tt45l').style.opacity=st.rpm===45?1:0;
  $('ttB33').setAttribute('aria-pressed',st.rpm!==45);$('ttB45').setAttribute('aria-pressed',st.rpm===45);
  $('ttPlay').textContent=st.on?L.stop:L.start;$('ttPlay').setAttribute('aria-pressed',st.on);
  if(st.on&&st.arm<ARM_OUT)st.arm=ARM_OUT;if(!st.on||st.arm<=ARM_OUT)$('ttArm').classList.remove('trk');$('ttArm').style.transform='rotate('+st.arm+'deg)';
  $('ttStrobe').setAttribute('opacity',st.on?1:.35);$('ttBeam').setAttribute('opacity',st.on?1:.6);
  if(ready){try{if(custom!==null)player.setPlaybackRate(ap);}catch(e){}}
}
function loop(t){var tgt=st.on?st.rpm*(1+st.pitch/100)*6/1000:0;st.cur+=(tgt-st.cur)*0.08;if(loop.t)st.ang=(st.ang+st.cur*(t-loop.t))%360;loop.t=t;var tr='rotate('+st.ang.toFixed(2)+' 235 205)';$('ttPlat').setAttribute('transform',tr);$('ttLit').setAttribute('transform',tr);requestAnimationFrame(loop)}
requestAnimationFrame(loop);
function toggle(){st.on=!st.on;
  if(ready){try{st.on?player.playVideo():player.pauseVideo()}catch(e){}if(st.on)setTimeout(probe,600)}
  upd()}
function rpm(v){st.rpm=v;upd()}
function pitch(v){v=Math.round(v*10)/10;if(Math.abs(v)<0.35)v=0;st.pitch=v;$('ttPitch').value=v;upd()}
function act(el,f){el.addEventListener('click',f);el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();f()}})}
act($('ttStart'),toggle);act($('tt33'),function(){rpm(100/3)});act($('tt45'),function(){rpm(45)});
$('ttPlay').onclick=toggle;$('ttB33').onclick=function(){rpm(100/3)};$('ttB45').onclick=function(){rpm(45)};
$('ttPitch').addEventListener('input',function(){pitch(+this.value)});$('ttPitch').addEventListener('change',function(){pitch(+this.value)});$('ttZ').onclick=function(){pitch(0)};
$('ttBoc').onclick=function(){st.rpm=100/3;pitch(8);if(!st.on)toggle()};
function pick(i){if(i===rec)return;rec=i;var r=RECS[i];VID=r.vid;BPM0=r.bpm;if(st.on)toggle();st.arm=0;st.rpm=45;
  $('ttLa1').textContent=r.a;$('ttLa2').textContent=r.t;$('ttLa3').textContent=r.sub;$('ttCredit').textContent=r.credit;
  Array.prototype.forEach.call(root.querySelectorAll('[data-rec]'),function(b){var on=+b.getAttribute('data-rec')===i;b.setAttribute('aria-pressed',on);if(b.classList.contains('ttSl'))b.classList.toggle('on',on)});
  pitch(0);if(ready){try{player.cueVideoById(r.vid)}catch(e){}}}
Array.prototype.forEach.call(root.querySelectorAll('[data-rec]'),function(b){b.onclick=function(){pick(+b.getAttribute('data-rec'))}});
$('ttOrig').onclick=function(){st.rpm=45;pitch(0);if(!st.on)toggle()};
$('ttReset').onclick=function(){if(st.on)toggle();st.arm=0;upd();st.rpm=45;pitch(0);if(ready){try{player.seekTo(0,true);player.pauseVideo()}catch(e){}}};
(function(){var h=$('ttPitchHit'),svg=h.ownerSVGElement,drag=false;
 function at(e){var pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;var y=pt.matrixTransform(svg.getScreenCTM().inverse()).y;pitch(Math.max(-8,Math.min(8,(295-y)/63*8)))}
 h.addEventListener('pointerdown',function(e){drag=true;try{h.setPointerCapture(e.pointerId)}catch(x){}at(e);e.preventDefault()});
 h.addEventListener('pointermove',function(e){if(drag){at(e);e.preventDefault()}});
 ['pointerup','pointercancel'].forEach(function(n){h.addEventListener(n,function(){drag=false})});
 h.addEventListener('keydown',function(e){if(e.key==='ArrowUp'||e.key==='ArrowRight'){pitch(Math.min(8,st.pitch+.1));e.preventDefault()}if(e.key==='ArrowDown'||e.key==='ArrowLeft'){pitch(Math.max(-8,st.pitch-.1));e.preventDefault()}});
})();
setInterval(function(){if(!st.on||!ready)return;try{var d=player.getDuration(),t=player.getCurrentTime();if(d>0){st.arm=ARM_OUT+(ARM_IN-ARM_OUT)*Math.min(1,t/d);$('ttArm').classList.add('trk');$('ttArm').style.transform='rotate('+st.arm+'deg)'}}catch(e){}},250);
root._tt={st:st,player:function(){return player},speed:speed};




window.onYouTubeIframeAPIReady=function(){player=new YT.Player('ttPlayer',{videoId:VID,width:'100%',height:'100%',host:'https://www.youtube-nocookie.com',playerVars:{playsinline:1,rel:0,modestbranding:1},events:{onReady:function(){ready=true;try{rates=player.getAvailablePlaybackRates()||[1]}catch(e){}$('ttRates').textContent=rates.map(function(r){return nl(r,2)+'×'}).join(', ');root.setAttribute('data-rates',rates.join(','));upd()},
 onStateChange:function(e){if(e.data===1&&!st.on){st.on=true;upd()}if(e.data===2&&st.on){st.on=false;upd()}if(e.data===0){st.on=false;st.arm=0;upd()}}}})};
var sc=document.createElement('script');sc.src='https://www.youtube.com/iframe_api';document.head.appendChild(sc);
upd();
})();
