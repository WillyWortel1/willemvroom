/* Boccaccio light show: Canvas 2D club scene (mega box, lasers, smoke, lamps). Follows the tempo of the playing track (BPM + player clock). */
(function(){
var root=document.getElementById('ls');if(!root)return;
var cv=document.getElementById('lsCv');if(!cv||!cv.getContext)return;
var ctx=cv.getContext('2d');
var $=function(id){return document.getElementById(id)};
var RM=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
var S={show:true,lasers:true,lamps:true,strobe:true,mega:true,vol:.75,hold:false,burstUntil:0};
var W=0,H=0,dpr=1,vis=false,running=false,raf=0,lastNow=0;
var PAL=['#ff2a3a','#2a6bff','#22ff88','#ffb400','#ff3df0','#00e5ff'];
var LASER=['#35ff6a','#ff2a3a','#2f7bff'];
function hex(c){return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]}
function rgba(c,a){var h=hex(c);return 'rgba('+h[0]+','+h[1]+','+h[2]+','+a+')'}
function fr(x){return x-Math.floor(x)}
function hash(n,i){return fr(Math.sin(n*12.9898+i*78.233)*43758.5453)}
function clamp(v,a,b){return v<a?a:v>b?b:v}

/* ---------- sizing ---------- */
function resize(){
  var r=cv.getBoundingClientRect();if(!r.width)return;
  dpr=Math.min(window.devicePixelRatio||1,1.5);W=r.width;H=r.height;
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  crowd=null;if(!running)frame(performance.now(),true);
}
if('ResizeObserver' in window)new ResizeObserver(resize).observe(cv);else window.addEventListener('resize',resize);

/* ---------- tempo / clock ---------- */
var custom={},anch=null,lastYt=-1,lastIdx=-9,tapTimes=[];
function idxNow(){var A=window.BocAudio;return A?A.track():-1}
function tempoFor(i){var c=custom[i]||custom['g'];if(c)return c;return {bpm:i>=80?122:118,off:0}}
function playing(){var A=window.BocAudio;try{return !!(A&&A.isPlaying())}catch(e){return false}}
function songTime(now){
  if(!playing()){anch=null;return null}
  var yt=window.BocAudio.time();
  if(!anch){anch={p:now,t:yt};lastYt=yt}
  var est=anch.t+(now-anch.p)/1000;
  if(Math.abs(yt-est)>.35){anch={p:now,t:yt};est=yt}
  else if(yt!==lastYt){anch.t+=(yt-est)*.08}
  lastYt=yt;return anch.t+(now-anch.p)/1000;
}
function rateOf(bpm){var r=bpm/60;return r>2.8?r/2:r}
var bpmEl=$('lsBpm');
function showBpm(){var i=idxNow();if(i===lastIdx&&bpmEl.textContent)return;lastIdx=i;bpmEl.textContent=Math.round(tempoFor(i).bpm)}
$('lsTap').addEventListener('click',function(){
  var now=performance.now();
  if(tapTimes.length&&now-tapTimes[tapTimes.length-1]>2000)tapTimes=[];
  tapTimes.push(now);if(tapTimes.length>7)tapTimes.shift();
  var i=idxNow(),key=i>=0?i:'g',cur=tempoFor(i),bpm=cur.bpm;
  if(tapTimes.length>1){var s=0;for(var k=1;k<tapTimes.length;k++)s+=tapTimes[k]-tapTimes[k-1];bpm=clamp(60000/(s/(tapTimes.length-1)),70,170)}
  var st=songTime(now);var off=cur.off;
  if(st!==null){var bl=60/bpm;off=st-Math.floor(st/bl)*bl}
  custom[key]={bpm:bpm,off:off};bpmEl.textContent=Math.round(bpm);
});

/* ---------- assets ---------- */
function sprite(c){
  var s=document.createElement('canvas');s.width=s.height=96;var g=s.getContext('2d'),h=hex(c);
  var gr=g.createRadialGradient(48,48,0,48,48,48);gr.addColorStop(0,'rgba('+h[0]+','+h[1]+','+h[2]+',.55)');gr.addColorStop(.5,'rgba('+h[0]+','+h[1]+','+h[2]+',.2)');gr.addColorStop(1,'rgba('+h[0]+','+h[1]+','+h[2]+',0)');
  g.fillStyle=gr;g.fillRect(0,0,96,96);return s;
}
var SPR=[sprite('#c9ccd6'),sprite('#7fffa8'),sprite('#ff7a85'),sprite('#7fa8ff')];
var parts=[],fog=.12,crowd=null;
function emit(n,burst){
  for(var i=0;i<n&&parts.length<110;i++){
    var fromMachine=burst||Math.random()<.35;
    parts.push({x:fromMachine?W*.93:Math.random()*W,y:fromMachine?H*.86:H*(.78+Math.random()*.14),vx:fromMachine?-(18+Math.random()*60):(Math.random()-.5)*14,vy:-(6+Math.random()*(fromMachine?46:14)),r:W*(.05+Math.random()*.05),g:W*(.02+Math.random()*.03),a:0,life:0,max:5+Math.random()*5,s:(Math.random()*4)|0,k:(Math.random()-.5)*.4,ay:-2});
  }
}
/* extra smoke sources: left machine (blows inward) and the truss (sinks down) */
function emitSide(n,side,burst){
  for(var i=0;i<n&&parts.length<170;i++){
    var left=side===1,sp=burst?1:.55;
    parts.push(left?{x:W*.115,y:H*(.845+Math.random()*.02),vx:(22+Math.random()*58)*sp,vy:-(4+Math.random()*34*sp),r:W*(.05+Math.random()*.05),g:W*(.02+Math.random()*.03),a:0,life:0,max:5+Math.random()*5,s:(Math.random()*4)|0,k:(Math.random()-.5)*.4,ay:-2,am:1.5}
      :{x:W*(.04+Math.random()*.92),y:H*.09,vx:(Math.random()-.5)*10,vy:3+Math.random()*12*sp,r:W*(.06+Math.random()*.06),g:W*(.03+Math.random()*.03),a:0,life:0,max:7+Math.random()*5,s:(Math.random()*4)|0,k:(Math.random()-.5)*.4,ay:9,am:2.2});
  }
}
function mkCrowd(){
  crowd=[];var n=Math.max(14,Math.round(W/20));
  for(var row=0;row<2;row++)for(var i=0;i<n;i++)crowd.push({x:(i+.5+(hash(i,row)-.5)*.6)*(W/n),row:row,r:W*(.014+hash(i,row+3)*.008),ph:hash(i,row+9)*6.28,arm:hash(i,row+5)<.28});
}

/* ---------- drawing ---------- */
var strobeA=0,lastStrobe=0,lastBeatN=-1,lvl=.3,t0=performance.now();
function frame(now,still){
  var dt=Math.min(.05,Math.max(0,(now-lastNow)/1000));lastNow=now;
  var rm=RM.matches,ms=rm?.4:1;
  var st=S.show&&!still?songTime(now):null,pl=st!==null;
  var tp=tempoFor(idxNow()),rate=rateOf(tp.bpm),beats,n,ph;
  if(pl){beats=(st-tp.off)*rate}else{beats=(now-t0)/1000*.45}
  n=Math.floor(beats);ph=beats-n;
  var kick=pl?Math.exp(-ph*4.6)*(rm?.5:1):.18+.1*Math.sin((now-t0)/900);
  var target=!S.show?0:pl?1:.3;lvl+=(target-lvl)*Math.min(1,dt*3);
  if(still)lvl=S.show?lvl:0;
  var sw=beats*(rm?.35:1);
  if(!W)return;
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  /* backdrop */
  var bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#04040a');bg.addColorStop(.7,'#0a0612');bg.addColorStop(1,'#030308');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  var floorY=H*.9,trussY=H*.075;
  /* smoke state */
  var rate2=(S.hold||now<S.burstUntil)&&S.show?1:0;
  if(S.show){
    if(rate2){var k=dt*34*(rm?.5:1);emitAcc+=k;var m=Math.floor(emitAcc);emitAcc-=m;emit(m,true);fog=Math.min(1,fog+dt*.35)}
    else{emitAcc2+=dt*3;var m2=Math.floor(emitAcc2);emitAcc2-=m2;emit(m2,false)}
    var kx=(rm?.5:1);
    accL+=dt*(rate2?24:4.5)*kx;var mL=Math.floor(accL);accL-=mL;emitSide(mL,1,!!rate2);
    accT+=dt*(rate2?18:4)*kx;var mT=Math.floor(accT);accT-=mT;emitSide(mT,2,!!rate2);
  }
  fog=Math.max(.1,fog-dt*.05);
  var beatPulse=pl&&n!==lastBeatN;if(pl)lastBeatN=n;
  /* mega box */
  drawBox(kick,ph,n,{cx:W*.2,by:H*.86,bw:W*.15,bh:H*.34,sh:.7,dim:.45,lamp:1});
  drawBox(kick,ph,n,{cx:W*.8,by:H*.86,bw:W*.15,bh:H*.34,sh:.7,dim:.45,lamp:-1});
  drawBox(kick,ph,n,{cx:W/2,by:H*.9,bw:W*.275,bh:H*.5,sh:1,dim:0,main:true});
  /* lamps */
  var inten=lvl*(S.lamps&&S.show?1:0);
  if(inten>.01)drawLamps(inten,kick,n,sw,pl);
  /* lasers */
  if(S.lasers&&S.show&&lvl>.01)drawLasers(kick,n,ph,sw,pl,rm);
  /* smoke */
  stepSmoke(dt*ms);
  /* crowd */
  if(!crowd)mkCrowd();drawCrowd(kick,n,sw,pl);
  /* truss + fixtures on top */
  drawTruss(trussY,n,kick,inten);
  /* strobe */
  if(S.strobe&&!rm&&S.show&&pl&&lvl>.7&&beatPulse&&now-lastStrobe>=420&&(n%2===0||rate<1.7)){strobeA=.8;lastStrobe=now}
  if(strobeA>.01){ctx.globalCompositeOperation='source-over';ctx.fillStyle='rgba(255,255,255,'+strobeA.toFixed(3)+')';ctx.fillRect(0,0,W,H);strobeA*=Math.pow(.0008,dt)}
  /* vignette */
  var vg=ctx.createRadialGradient(W/2,H*.55,H*.2,W/2,H*.55,H*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');ctx.globalCompositeOperation='source-over';ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
}
var emitAcc=0,emitAcc2=0,accL=0,accT=0;
function rrect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function drawBox(kick,ph,n,o){
  var on=S.mega&&S.show;var pump=on?kick*S.vol*lvl:0;
  var bw=o.bw,bh=o.bh,cx=o.cx,by=o.by,bx=cx-bw/2,top=by-bh+(pump*2.2*o.sh);
  ctx.save();
  if(pump>.03&&!RM.matches){var am=W*.0065*pump*o.sh;ctx.translate((Math.random()-.5)*2*am,(Math.random()-.5)*2*am*.7)}
  /* bass glow */
  if(on&&pump>.02){ctx.globalCompositeOperation='lighter';var g=ctx.createRadialGradient(cx,top+bh*.5,bw*.1,cx,top+bh*.5,bw*1.1);g.addColorStop(0,'rgba(255,42,58,'+(pump*.5).toFixed(3)+')');g.addColorStop(1,'rgba(255,42,58,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over'}
  /* cabinet */
  var cg=ctx.createLinearGradient(bx,0,bx+bw,0);cg.addColorStop(0,'#16161c');cg.addColorStop(.5,'#0c0c11');cg.addColorStop(1,'#16161c');
  rrect(bx,top,bw,bh,bw*.04);ctx.fillStyle=cg;ctx.fill();ctx.lineWidth=1.5;ctx.strokeStyle='#26262f';ctx.stroke();
  /* corner steel */
  ctx.fillStyle='#2a2a33';var cs=bw*.035;[[bx,top],[bx+bw-cs,top],[bx,top+bh-cs],[bx+bw-cs,top+bh-cs]].forEach(function(p){ctx.fillRect(p[0],p[1],cs,cs)});
  /* top horn */
  var hh=bh*.13,hy=top+bh*.05;rrect(bx+bw*.14,hy,bw*.72,hh,3);ctx.fillStyle='#050508';ctx.fill();
  ctx.fillStyle='#1b1b23';for(var i=0;i<8;i++)ctx.fillRect(bx+bw*.17+i*bw*.083,hy+hh*.2,bw*.045,hh*.6);
  /* woofers */
  var r=Math.min(bw*.36,bh*.2),c1=top+bh*.38,c2=top+bh*.76;
  [c1,c2].forEach(function(cy){
    ctx.beginPath();ctx.arc(cx,cy,r*1.08,0,6.2832);ctx.fillStyle='#050507';ctx.fill();
    ctx.beginPath();ctx.arc(cx,cy,r,0,6.2832);var sg=ctx.createRadialGradient(cx-r*.3,cy-r*.3,r*.1,cx,cy,r);sg.addColorStop(0,'#3a3a44');sg.addColorStop(1,'#111116');ctx.fillStyle=sg;ctx.fill();
    var cr=r*.84*(1+pump*.07);ctx.beginPath();ctx.arc(cx,cy,cr,0,6.2832);var cn=ctx.createRadialGradient(cx,cy,cr*.1,cx,cy,cr);cn.addColorStop(0,'#26262e');cn.addColorStop(.7,'#15151b');cn.addColorStop(1,'#08080b');ctx.fillStyle=cn;ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=1;for(var k=1;k<4;k++){ctx.beginPath();ctx.arc(cx,cy,cr*k/4,0,6.2832);ctx.stroke()}
    var dc=r*.3*(1+pump*.25);ctx.beginPath();ctx.arc(cx,cy,dc,0,6.2832);ctx.fillStyle='#0a0a0d';ctx.fill();
    if(pump>.05){ctx.beginPath();ctx.arc(cx,cy,r*1.02,0,6.2832);ctx.strokeStyle='rgba(255,42,58,'+(pump*.6).toFixed(3)+')';ctx.lineWidth=2;ctx.stroke()}
  });
  /* logo strip */
  ctx.fillStyle='rgba(255,42,58,'+(on?.55+pump*.4:.18)+')';ctx.fillRect(bx+bw*.38,top+bh*.93,bw*.24,Math.max(2,bh*.012));
  if(o.dim){ctx.fillStyle='rgba(4,4,12,'+o.dim+')';ctx.fillRect(bx,top,bw,bh);var hz=ctx.createLinearGradient(0,top,0,by);hz.addColorStop(0,'rgba(120,130,160,0)');hz.addColorStop(1,'rgba(120,130,160,'+(o.dim*.4)+')');ctx.fillStyle=hz;ctx.fillRect(bx,top,bw,bh)}
  if(o.lamp&&S.lamps&&S.show&&lvl>.01){
    var rm=RM.matches,I=Math.min(1,(rm?.3+.5*kick:.15+1.25*kick)*(.35+.65*lvl)),lr=bw*.07,ly=top-lr;
    rrect(cx-bw*.15,top-bw*.12,bw*.3,bw*.12,2);ctx.fillStyle='#16161d';ctx.fill();
    ctx.globalCompositeOperation='lighter';
        cone(cx,ly,Math.PI-o.lamp*.38,H*.62,W*.05,'#ffffff',.3*I);
    var gg=ctx.createRadialGradient(cx,ly,0,cx,ly,bw*(.55+.5*I));gg.addColorStop(0,'rgba(255,255,255,'+(.75*I).toFixed(3)+')');gg.addColorStop(.35,'rgba(255,255,255,'+(.22*I).toFixed(3)+')');gg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gg;ctx.fillRect(cx-bw*1.1,ly-bw*1.1,bw*2.2,bw*2.2);
    ctx.globalCompositeOperation='source-over';
    ctx.beginPath();ctx.arc(cx,ly,lr,0,6.2832);ctx.fillStyle='rgba(255,255,255,'+(.12+.88*I).toFixed(3)+')';ctx.fill();
  }
  ctx.restore();
  if(o.main){
  ctx.fillStyle='#101015';ctx.fillRect(W*.04,H*.84,W*.08,H*.06);ctx.fillStyle='#1d1d25';ctx.fillRect(W*.115,H*.845,W*.025,H*.02);ctx.fillStyle='rgba(255,42,58,'+((S.hold||performance.now()<S.burstUntil)?.9:.3)+')';ctx.fillRect(W*.06,H*.86,W*.012,H*.008);
  ctx.fillStyle='#101015';ctx.fillRect(W*.86,H*.84,W*.1,H*.06);ctx.fillStyle='#1d1d25';ctx.fillRect(W*.84,H*.855,W*.03,H*.02);ctx.fillStyle='rgba(255,42,58,'+((S.hold||performance.now()<S.burstUntil)?.9:.3)+')';ctx.fillRect(W*.88,H*.86,W*.012,H*.008);
  }
}
function cone(x,y,ang,len,spread,c,a){
  var ex=x+Math.sin(ang)*len,ey=y+Math.cos(ang)*len,nx=Math.cos(ang),ny=-Math.sin(ang);
  var g=ctx.createLinearGradient(x,y,ex,ey);g.addColorStop(0,rgba(c,a));g.addColorStop(1,rgba(c,0));
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(ex+nx*spread,ey+ny*spread);ctx.lineTo(ex-nx*spread,ey-ny*spread);ctx.closePath();ctx.fillStyle=g;ctx.fill();
}
function drawLamps(inten,kick,n,sw,pl){
  ctx.globalCompositeOperation='lighter';
  var y=H*.085,floor=H*.9,len=floor-y;
  for(var i=0;i<7;i++){
    var x=W*(i+1)/8,lit=pl?((i+n)%2===0?1:.35):.45+.2*Math.sin(sw*.8+i);
    var c=PAL[(n+i)%PAL.length];
    cone(x,y,0,len,W*.055,c,.34*inten*lit);
  }
  for(var j=0;j<3;j++){
    var hx=W*(.2+j*.3),ang=Math.sin(sw*.25*Math.PI+j*1.9)*.75*(j===1?.6:1)+(j-1)*.15;
    var c2=PAL[(Math.floor(n/8)+j*2)%PAL.length],a2=(.5+.5*kick)*inten;
    cone(hx,y+4,ang,len*1.15,W*.022,c2,.5*a2);
    var sx=hx+Math.sin(ang)*(floor-y),g=ctx.createRadialGradient(sx,floor,0,sx,floor,W*.07);g.addColorStop(0,rgba(c2,.45*a2));g.addColorStop(1,rgba(c2,0));ctx.fillStyle=g;ctx.save();ctx.translate(0,floor);ctx.scale(1,.25);ctx.translate(0,-floor);ctx.fillRect(sx-W*.07,floor-W*.07,W*.14,W*.14);ctx.restore();
  }
  ctx.globalCompositeOperation='source-over';
}
function drawLasers(kick,n,ph,sw,pl,rm){
  var pat=pl?Math.floor(n/8)%5:0,src=[.16,.38,.62,.84],y=H*.1,L=Math.max(W,H)*1.7;
  var vis=(.35+fog*.9)*lvl*(pl?1:.55);
  ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  for(var i=0;i<4;i++){
    var x=W*src[i],col=LASER[(i+pat)%3],B=pat===0?5:pat===4?2:3;
    if(!pl)B=2;
    if(pat===4&&!rm&&pl&&((n+i)%2===1)&&ph>.55)continue;
    for(var k=0;k<B;k++){
      var o=k-(B-1)/2,a;
      if(!pl||pat===0)a=Math.sin(sw*.5+i*1.2)*.5+o*(pl?.16:.1);
      else if(pat===1)a=Math.sin(sw*.35)*.9*(i%2?1:-1)+o*.05;
      else if(pat===2)a=(i<2?.55:-.55)+Math.sin(sw*.7+i)*.3+o*.07;
      else if(pat===3)a=(i-1.5)*.16+o*(.1+kick*.28);
      else{var e=clamp(ph*4,0,1);e=1-(1-e)*(1-e);a=(hash(n-1,i+k*7)*(1.1)-.55)*(1-e)+(hash(n,i+k*7)*1.1-.55)*e}
      a=clamp(a,-1.25,1.25);
      var ex=x+Math.sin(a)*L,ey=y+Math.cos(a)*L;
      ctx.strokeStyle=rgba(col,.1*vis);ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(ex,ey);ctx.stroke();
      ctx.strokeStyle=rgba(col,.28*vis);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(ex,ey);ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,'+(.75*Math.min(1,vis)).toFixed(3)+')';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(ex,ey);ctx.stroke();
    }
  }
  ctx.globalCompositeOperation='source-over';
}
function stepSmoke(dt){
  ctx.globalCompositeOperation='screen';
  for(var i=parts.length-1;i>=0;i--){
    var p=parts[i];p.life+=dt;if(p.life>p.max){parts.splice(i,1);continue}
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.6,dt);p.vy=p.vy*Math.pow(.7,dt)+p.ay*dt;p.vx+=Math.sin(p.life*.8+p.k*9)*3*dt;
    var u=p.life/p.max,r=p.r+(p.g*4)*u,al=Math.sin(Math.PI*Math.min(1,u))*.95*(.5+.5*Math.min(1,lvl+.3));
    ctx.globalAlpha=Math.min(1,al*.3*(p.am||1));ctx.drawImage(SPR[p.s],p.x-r,p.y-r,r*2,r*2);
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function drawCrowd(kick,n,sw,pl){
  for(var row=0;row<2;row++){
    var base=H*(row?.97:.935),sh=H*(row?.075:.06);
    ctx.fillStyle=row?'#020204':'#07070b';
    for(var i=0;i<crowd.length;i++){var c=crowd[i];if(c.row!==row)continue;
      var bob=pl?Math.sin(sw*Math.PI+c.ph)*kick*H*.012:Math.sin(sw*2+c.ph)*H*.003;
      var x=c.x,y=base-bob;
      ctx.beginPath();ctx.ellipse(x,y+sh*.55,c.r*2.3,sh*.7,0,Math.PI,0);ctx.fill();
      ctx.beginPath();ctx.arc(x,y-c.r*.4,c.r,0,6.2832);ctx.fill();
      if(c.arm&&pl&&lvl>.5){var aa=Math.sin(sw*Math.PI*.5+c.ph)*.5;ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=Math.max(2,c.r*.5);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x+c.r*1.4,y+c.r*.6);ctx.lineTo(x+c.r*(2.2+aa),y-sh*(.9+kick*.4));ctx.stroke()}
    }
  }
  ctx.fillRect(0,H*.985,W,H*.02);
}
function drawTruss(y,n,kick,inten){
  ctx.fillStyle='#14141a';ctx.fillRect(0,y-3,W,5);ctx.fillStyle='#22222b';ctx.fillRect(0,y-3,W,1);
  ctx.strokeStyle='#1c1c24';ctx.lineWidth=1;ctx.beginPath();for(var x=0;x<W;x+=14){ctx.moveTo(x,y+2);ctx.lineTo(x+7,y-3);ctx.lineTo(x+14,y+2)}ctx.stroke();
  ctx.globalCompositeOperation='lighter';
  for(var i=0;i<7;i++){var x=W*(i+1)/8,c=PAL[(n+i)%PAL.length],on=inten>.02&&S.lamps&&S.show,lit=on?(((i+n)%2===0)?1:.4):0;
    ctx.fillStyle=on?rgba(c,.25+.7*lit*inten):'#1a1a22';ctx.beginPath();ctx.arc(x,y+6,Math.max(3,W*.011),0,6.2832);ctx.fill();
    if(on){var g=ctx.createRadialGradient(x,y+6,0,x,y+6,W*.04);g.addColorStop(0,rgba(c,.5*lit*inten));g.addColorStop(1,rgba(c,0));ctx.fillStyle=g;ctx.fillRect(x-W*.04,y-W*.035,W*.08,W*.08)}}
  ctx.globalCompositeOperation='source-over';
  [.16,.38,.62,.84].forEach(function(f,i){ctx.fillStyle='#1d1d26';ctx.fillRect(W*f-5,y+4,10,7);var on=S.lasers&&S.show&&lvl>.02;ctx.fillStyle=on?LASER[(i+(Math.floor(n/8)%5))%3]:'#2a2a33';ctx.fillRect(W*f-2,y+9,4,3)});
  [.2,.5,.8].forEach(function(f){ctx.fillStyle='#262630';ctx.beginPath();ctx.arc(W*f,y+8,Math.max(3,W*.009),0,6.2832);ctx.fill()});
}

/* ---------- loop / visibility ---------- */
function loop(now){raf=0;if(!running)return;frame(now);showBpm();raf=requestAnimationFrame(loop)}
function setRun(){
  var want=vis&&!document.hidden&&S.show;
  if(want&&!running){running=true;lastNow=performance.now();raf=requestAnimationFrame(loop)}
  else if(!want&&running){running=false;if(raf)cancelAnimationFrame(raf);raf=0}
  if(!want&&W)frame(performance.now(),true);
}
if('IntersectionObserver' in window){new IntersectionObserver(function(e){vis=e[0].isIntersecting;setRun()},{rootMargin:'120px'}).observe(root)}else{vis=true;setRun()}
document.addEventListener('visibilitychange',setRun);
if(RM.addEventListener)RM.addEventListener('change',syncRM);

/* ---------- controls ---------- */
function bind(id,key){
  var b=$(id);b.addEventListener('click',function(){S[key]=!S[key];b.setAttribute('aria-pressed',S[key]);if(key==='show')setRun();else if(!running)frame(performance.now(),true)});
}
bind('lsShow','show');bind('lsLasers','lasers');bind('lsLamps','lamps');bind('lsStrobe','strobe');bind('lsMega','mega');
function syncRM(){var b=$('lsStrobe');if(RM.matches){b.disabled=true;b.setAttribute('aria-pressed','false')}else{b.disabled=false;b.setAttribute('aria-pressed',S.strobe)}}
syncRM();
$('lsVol').addEventListener('input',function(){S.vol=this.value/100;if(!running)frame(performance.now(),true)});
var smoke=$('lsSmoke'),sDown=0;
smoke.addEventListener('pointerdown',function(){S.hold=true;sDown=performance.now()});
function sUp(){if(!S.hold)return;S.hold=false;if(performance.now()-sDown<450)S.burstUntil=performance.now()+1800}
smoke.addEventListener('pointerup',sUp);smoke.addEventListener('pointercancel',sUp);smoke.addEventListener('pointerleave',sUp);
smoke.addEventListener('click',function(e){if(e.detail===0)S.burstUntil=performance.now()+1800});
showBpm();
})();
