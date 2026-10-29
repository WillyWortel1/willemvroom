(function(){
var box=document.getElementById('bcRoom');if(!box)return;var started=false;
function go(){if(started)return;started=true;var b=document.getElementById('bcStart');if(b)b.textContent='Laden…';
import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js').then(init).catch(function(){if(b)b.textContent='Kon 3D niet laden'})}
document.getElementById('bcStart').addEventListener('click',go);
if('IntersectionObserver'in window){new IntersectionObserver(function(e,o){if(e[0].isIntersecting){o.disconnect();go()}},{rootMargin:'200px'}).observe(box)}
function init(T){
var mob=matchMedia('(max-width:640px)').matches||/iPhone|Android/.test(navigator.userAgent);
var r=new T.WebGLRenderer({antialias:!mob,powerPreference:'high-performance'});r.setPixelRatio(Math.min(devicePixelRatio,mob?1.5:2));
box.innerHTML='';box.appendChild(r.domElement);var hud=document.createElement('div');hud.className='bc3d-hud';box.appendChild(hud);
var S=new T.Scene();S.fog=new T.FogExp2(0x0a0004,0.018);S.background=new T.Color(0x030002);
var cam=new T.PerspectiveCamera(65,1,.1,200);
function size(){var w=box.clientWidth,h=box.clientHeight;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}size();addEventListener('resize',size);
function M(c,o){return new T.MeshStandardMaterial(Object.assign({color:c,roughness:.5,metalness:.2},o||{}))}
function box3(w,h,d,m,x,y,z){var k=new T.Mesh(new T.BoxGeometry(w,h,d),m);k.position.set(x,y,z);S.add(k);return k}
S.add(new T.AmbientLight(0x331018,1.2));var hemi=new T.HemisphereLight(0x4060ff,0x200008,.5);S.add(hemi);
// room 40x30, height 9
var marble=M(0xd8d2cc,{roughness:.15,metalness:.1});box3(40,.2,30,marble,0,-.1,0);
var mirror=M(0x111118,{roughness:.05,metalness:1});box3(40,.2,30,mirror,0,9,0);
var wall=M(0x0d0a12,{roughness:.8});box3(40,9,.3,wall,0,4.5,-15);box3(40,9,.3,wall,0,4.5,15);box3(.3,9,30,wall,-20,4.5,0);box3(.3,9,30,wall,20,4.5,0);
// dancefloor: lit tiles
var tiles=[],tg=new T.BoxGeometry(1.45,.1,1.45);
for(var i=-6;i<6;i++)for(var j=-4;j<4;j++){var m=new T.MeshBasicMaterial({color:0x000000});var t=new T.Mesh(tg,m);t.position.set(i*1.5+.75,.06,j*1.5+.75+1);S.add(t);tiles.push(t)}
// neon strips red/blue around walls & ceiling
var neons=[];function neon(w,h,d,c,x,y,z){var n=box3(w,h,d,new T.MeshBasicMaterial({color:c}),x,y,z);neons.push(n);return n}
[[-14.8,0xff1030],[14.8,0x2050ff]].forEach(function(a){neon(39,.12,.12,a[1],0,8.6,a[0]);neon(39,.12,.12,a[1],0,.6,a[0])});
neon(.12,.12,29,0xff1030,-19.8,8.6,0);neon(.12,.12,29,0x2050ff,19.8,8.6,0);
// rings over dancefloor
for(var k=0;k<3;k++){var ring=new T.Mesh(new T.TorusGeometry(4+k*2,.06,8,64),new T.MeshBasicMaterial({color:k%2?0x2050ff:0xff1030}));ring.rotation.x=Math.PI/2;ring.position.set(0,8.2-k*.3,1);S.add(ring);neons.push(ring)}
// DJ booth 10m wide at back
var gold=M(0xc9a040,{metalness:1,roughness:.25});
box3(10,1.3,2.2,M(0x18121a,{metalness:.6,roughness:.3}),0,1.25,-12);box3(10.2,.08,2.4,gold,0,1.95,-12);box3(10,.6,3,M(0x221a22),0,.3,-12.2);
neon(10,.06,.06,0xff1030,0,.62,-10.75);
var platters=[];[-1.3,1.3].forEach(function(x){box3(.9,.12,.7,M(0x9a9aa0,{metalness:.9,roughness:.3}),x,2.05,-12);var p=new T.Mesh(new T.CylinderGeometry(.3,.3,.03,32),M(0x050505,{roughness:.3}));p.position.set(x-.08,2.13,-12);S.add(p);platters.push(p);var dot=box3(.03,.02,.03,new T.MeshBasicMaterial({color:0xff2030}),x-.4,2.13,-11.75);neons.push(dot)});
box3(.7,.12,.5,M(0x222),0,2.05,-12);
// speaker stacks
[-6.5,6.5].forEach(function(x){for(var y=0;y<3;y++)box3(1.6,1.4,1.4,M(0x0a0a0a,{roughness:.9}),x,.7+y*1.45,-12.5)});
// bars left & right: gold counters with copper back
[-1,1].forEach(function(s){box3(1.4,1.2,12,M(0x2a1a10,{metalness:.5}),s*17.5,.6,0);box3(1.6,.08,12.2,gold,s*17.5,1.24,0);neon(.06,.06,12,0xffb040,s*16.75,1.1,0);box3(.2,3,12,M(0xb87333,{metalness:1,roughness:.2}),s*19.6,2.5,0);
for(var q=-5;q<=5;q+=1.25){var g=new T.Mesh(new T.CylinderGeometry(.06,.05,.18,8),new T.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.4,metalness:1,roughness:0}));g.position.set(s*19.3,2.1,q);S.add(g)}
for(var q2=-5;q2<=5;q2+=1.6)box3(.45,.8,.45,M(0x700010,{roughness:.9}),s*16,.4,q2)});
// marble stairs + waterfall at front
for(var st=0;st<5;st++)box3(8,.3,.7,marble,0,.15+st*.3,14.4-st*.7);
var wf=new T.Mesh(new T.PlaneGeometry(6,6),new T.MeshBasicMaterial({color:0x6aa8ff,transparent:true,opacity:.35,side:T.DoubleSide}));wf.position.set(-9,3,14.8);S.add(wf);
var wfc=document.createElement('canvas');wfc.width=64;wfc.height=256;var wx=wfc.getContext('2d'),wtex=new T.CanvasTexture(wfc);wtex.wrapT=T.RepeatWrapping;wf.material.map=wtex;
for(var z=0;z<300;z++){wx.fillStyle='rgba(255,255,255,'+Math.random()*.6+')';wx.fillRect(Math.random()*64,Math.random()*256,1,8+Math.random()*24)}wtex.needsUpdate=true;
var wf2=wf.clone();wf2.position.x=9;S.add(wf2);
// mirror columns
for(var c=-1;c<=1;c+=2)for(var d=-1;d<=1;d+=2){var col=new T.Mesh(new T.CylinderGeometry(.5,.5,9,16),mirror);col.position.set(c*11,4.5,d*7);S.add(col)}
// mirror ball
var ball=new T.Mesh(new T.IcosahedronGeometry(.8,2),new T.MeshStandardMaterial({color:0xffffff,metalness:1,roughness:.05,flatShading:true}));ball.position.set(0,6.8,1);S.add(ball);
// moving heads (spot lights) + laser beams (additive cones)
var spots=[],cols=[0xff1030,0x2050ff,0xffffff,0xff30c0,0x30ff80,0xffb040];
for(var h=0;h<6;h++){var sl=new T.SpotLight(cols[h],mob?30:50,30,.25,.5,1.2);sl.position.set(-10+h*4,8.7,h%2?6:-4);sl.target.position.set(0,0,1);S.add(sl);S.add(sl.target);spots.push(sl)}
var beams=[],add={transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide};
var bg=new T.CylinderGeometry(.02,.35,14,12,1,true);bg.translate(0,-7,0);
spots.forEach(function(s,i){var bm=new T.Mesh(bg,new T.MeshBasicMaterial(Object.assign({color:cols[i],opacity:.12},add)));bm.position.copy(s.position);S.add(bm);beams.push(bm)});
var lasers=[],lg=new T.CylinderGeometry(.015,.015,40,4,1,true);lg.rotateZ(Math.PI/2);lg.translate(20,0,0);
var lcols=[0xff0020,0x00ff40,0x2060ff];
for(var l=0;l<(mob?9:15);l++){var lm=new T.Mesh(lg,new T.MeshBasicMaterial(Object.assign({color:lcols[l%3],opacity:.8},add)));lm.position.set(0,2.6,-10.6);S.add(lm);lasers.push(lm)}
// haze sprites
var hz=document.createElement('canvas');hz.width=hz.height=64;var hx=hz.getContext('2d'),gr=hx.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');hx.fillStyle=gr;hx.fillRect(0,0,64,64);
var hzt=new T.CanvasTexture(hz),haze=[];
for(var n=0;n<(mob?18:36);n++){var sp=new T.Sprite(new T.SpriteMaterial({map:hzt,color:0x884466,transparent:true,opacity:.25,depthWrite:false}));sp.position.set((Math.random()-.5)*30,1+Math.random()*5,(Math.random()-.5)*22);var sc=6+Math.random()*6;sp.scale.set(sc,sc,1);S.add(sp);haze.push(sp)}
var strobe=new T.PointLight(0xffffff,0,40);strobe.position.set(0,8,1);S.add(strobe);
// crowd silhouettes
var cg=new T.CapsuleGeometry(.22,1.1,3,6),cm=M(0x050305,{roughness:1}),crowd=[];
for(var p2=0;p2<(mob?40:80);p2++){var cp=new T.Mesh(cg,cm);cp.position.set((Math.random()-.5)*17,.8,(Math.random()-.5)*11+1);cp.userData.o=Math.random()*6;S.add(cp);crowd.push(cp)}
// controls: orbit-ish look + walk
var yaw=0,pitch=-.2,pos=new T.Vector3(0,3.2,10.5),keys={},drag=null,pinch=0;
var el=r.domElement;
el.addEventListener('pointerdown',function(e){drag={x:e.clientX,y:e.clientY};el.setPointerCapture(e.pointerId)});
el.addEventListener('pointermove',function(e){if(!drag||tc>1)return;yaw-=(e.clientX-drag.x)*.005;pitch=Math.max(-1.2,Math.min(1.2,pitch-(e.clientY-drag.y)*.005));drag={x:e.clientX,y:e.clientY}});
el.addEventListener('pointerup',function(){drag=null});
var tc=0;function dist(t){return Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY)}
el.addEventListener('touchstart',function(e){tc=e.touches.length;if(tc==2)pinch=dist(e.touches)},{passive:true});
el.addEventListener('touchmove',function(e){if(e.touches.length==2){var d=dist(e.touches);move((d-pinch)*.03);pinch=d}},{passive:true});
el.addEventListener('touchend',function(e){tc=e.touches.length},{passive:true});
el.addEventListener('wheel',function(e){e.preventDefault();move(-e.deltaY*.01)},{passive:false});
el.tabIndex=0;el.addEventListener('keydown',function(e){keys[e.key.toLowerCase()]=1;if(/arrow/.test(e.key.toLowerCase()))e.preventDefault()});el.addEventListener('keyup',function(e){keys[e.key.toLowerCase()]=0});
function move(f){pos.x-=Math.sin(yaw)*f;pos.z-=Math.cos(yaw)*f;pos.x=Math.max(-18,Math.min(18,pos.x));pos.z=Math.max(-10,Math.min(11,pos.z))}
var vis=true;new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(box);
var clock=new T.Clock(),beatT=0,idleBpm=118;
function loop(){requestAnimationFrame(loop);if(!vis)return;var dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
var s=window.ttState,on=s&&s.on,bpm=on?130*(s.rpm/45)*(1+s.pitch/100):idleBpm;
beatT+=dt*bpm/60;var ph=beatT%1,pulse=on?Math.pow(1-ph,3):.25+.15*Math.sin(t),bar=Math.floor(beatT);
hud.textContent=on?('♫ '+Math.round(bpm)+' BPM — lichten op de beat'):'Start de Technics voor de beat';
if(keys['arrowup']||keys['w'])move(4*dt);if(keys['arrowdown']||keys['s'])move(-4*dt);if(keys['arrowleft']||keys['a'])yaw+=1.5*dt;if(keys['arrowright']||keys['d'])yaw-=1.5*dt;
cam.position.copy(pos);cam.rotation.set(0,0,0);cam.rotation.order='YXZ';cam.rotation.y=yaw;cam.rotation.x=pitch;
tiles.forEach(function(tl,i){var x=i%8,y=(i/8|0),v=((x+y+bar)%4==0)?pulse:.08*pulse;tl.material.color.setHSL(((x*7+y*3+bar*5)%12)/12,1,.05+.45*v)});

spots.forEach(function(sl,i){var a=t*(on?.9:.4)+i*1.1;sl.target.position.set(Math.sin(a)*8,0,1+Math.cos(a*1.3)*5);sl.intensity=(mob?30:50)*(.3+.7*pulse);
var bm=beams[i];bm.lookAt(sl.target.position);bm.rotateX(-Math.PI/2);bm.material.opacity=.05+.15*pulse});
var showL=on?(bar%16<8):(Math.sin(t*.3)>.3);
lasers.forEach(function(lm,i){lm.visible=showL;lm.rotation.set(0,-Math.PI/2+(i-lasers.length/2)*.09+Math.sin(t*.7)*.4,Math.sin(t*1.1+i)*.08-.03)});
strobe.intensity=on&&bar%8==7&&(ph*4%1)<.25?120:0;
ball.rotation.y+=dt*.5;platters.forEach(function(p){if(on)p.rotation.y-=dt*(s.rpm/60)*2*Math.PI*(1+s.pitch/100)});
wtex.offset.y-=dt*.8;haze.forEach(function(h,i){h.position.x+=Math.sin(t*.1+i)*dt*.2;h.material.opacity=.15+.15*pulse});
crowd.forEach(function(c){c.position.y=.8+(on?.12*Math.abs(Math.sin((beatT+c.userData.o*.05)*Math.PI)):0);c.rotation.y=Math.sin(t+c.userData.o)*.4});
r.render(S,cam)}
loop();}
})();
