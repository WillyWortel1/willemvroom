// FOILASSIST! 3D-wereld (Three.js r160, lokaal). Spel-logica en HUD blijven in index.html.
import * as THREE from './three.module.min.js?v=1';
const cv=document.getElementById('g');
const R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:false,powerPreference:'high-performance'});
const PR=Math.min(window.devicePixelRatio||1,1.5);R.setPixelRatio(PR);
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0xbfe9ff,160,850);
const cam=new THREE.PerspectiveCamera(60,1,0.1,2000);cam.rotation.order='YXZ';scene.add(cam);
const C=(r,g,b)=>new THREE.Color(r,g,b),lerp=(a,b,k)=>a+(b-a)*k,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),sm=k=>k*k*(3-2*k);
function tex(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
const dot=tex(64,64,(g,w)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.4,'rgba(255,255,255,.6)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);});
// strepen + belletjes voor het golffront (additief)
const streak=tex(256,256,(g)=>{g.fillStyle='#000';g.fillRect(0,0,256,256);
 for(let i=0;i<70;i++){const x=Math.random()*256,w=1+Math.random()*3;g.strokeStyle=`rgba(255,255,255,${.15+Math.random()*.35})`;g.lineWidth=w;g.beginPath();g.moveTo(x,0);for(let y=0;y<=256;y+=16)g.lineTo(x+Math.sin(y*.05+i)*4,y);g.stroke();}
 for(let i=0;i<260;i++){g.fillStyle=`rgba(255,255,255,${.2+Math.random()*.5})`;g.beginPath();g.arc(Math.random()*256,Math.random()*256,.8+Math.random()*2.4,0,7);g.fill();}});
streak.wrapS=streak.wrapT=THREE.RepeatWrapping;
const soup=tex(256,256,(g)=>{g.fillStyle='#000';g.fillRect(0,0,256,256);for(let i=0;i<900;i++){const r=1+Math.random()*7;g.strokeStyle=`rgba(255,255,255,${.3+Math.random()*.6})`;g.lineWidth=1+Math.random()*1.5;g.beginPath();g.arc(Math.random()*256,Math.random()*256,r,0,7);g.stroke();if(Math.random()<.4){g.fillStyle='rgba(255,255,255,.5)';g.fill();}}});
soup.wrapS=soup.wrapT=THREE.RepeatWrapping;
// lucht
const skyG=new THREE.SphereGeometry(1200,24,16);const skyC=new Float32Array(skyG.attributes.position.count*3);skyG.setAttribute('color',new THREE.BufferAttribute(skyC,3));
const sky=new THREE.Mesh(skyG,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false}));sky.renderOrder=-10;scene.add(sky);
const sun=new THREE.Sprite(new THREE.SpriteMaterial({map:dot,color:0xfff3b0,fog:false,transparent:true,depthWrite:false}));sun.scale.set(160,160,1);scene.add(sun);
const cloudT=tex(256,128,(g)=>{g.fillStyle='#fff';[[70,80,50],[120,60,55],[175,78,45],[120,90,60]].forEach(([x,y,r])=>{const rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,'rgba(255,255,255,1)');rg.addColorStop(.7,'rgba(255,255,255,.8)');rg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=rg;g.beginPath();g.arc(x,y,r,0,7);g.fill();});});
const clouds=[];for(let i=0;i<14;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:cloudT,transparent:true,fog:false,depthWrite:false}));const a=i/14*Math.PI*2,d=900;s.userData={a,e:60+(i%4)*45};s.scale.set(260+(i%3)*90,130+(i%3)*45,1);scene.add(s);clouds.push(s);}
// zee
const SN=56,seaG=new THREE.PlaneGeometry(900,900,SN,SN);seaG.rotateX(-Math.PI/2);const seaP=seaG.attributes.position,seaBase=seaP.array.slice();const seaCol=new Float32Array(seaP.count*3);seaG.setAttribute('color',new THREE.BufferAttribute(seaCol,3));
const sea=new THREE.Mesh(seaG,new THREE.MeshBasicMaterial({vertexColors:true}));scene.add(sea);
const GL=220,glG=new THREE.BufferGeometry(),glP=new Float32Array(GL*3);glG.setAttribute('position',new THREE.BufferAttribute(glP,3));
const glints=new THREE.Points(glG,new THREE.PointsMaterial({map:dot,size:0.5,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,color:0xffffff}));scene.add(glints);const glS=[];for(let i=0;i<GL;i++)glS.push({x:(Math.random()-.5)*160,z:(Math.random()-.5)*160,ph:Math.random()*9});
// kust
const shore=new THREE.Group();scene.add(shore);
const sand=new THREE.Mesh(new THREE.BoxGeometry(3000,1.6,18),new THREE.MeshBasicMaterial({color:0xe9d39a}));sand.position.y=0.3;shore.add(sand);
const hillM=new THREE.MeshBasicMaterial({color:0x4f8a3a});for(let i=0;i<26;i++){const h=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),hillM);const s=30+Math.random()*50;h.scale.set(s*1.6,8+Math.random()*16,s);h.position.set((i-13)*110+Math.random()*40,0,-30-Math.random()*20);shore.add(h);}
// golven
const NX=97,XSa=[];for(let i=0;i<NX;i++){const u=i/(NX-1)*2-1;XSa.push(Math.sign(u)*Math.abs(u)**1.7*420);}
const UB=[1,.82,.66,.52,.4,.3,.21,.14,.08,.03],UF=[.02,.05,.09,.14,.2,.27,.35,.44,.54,.65,.77,.89,1];const NU=UB.length+1+UF.length;
const NL=8; // lip rijen
function grid(nx,nu){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(nx*nu*3),3));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(nx*nu*4),4));g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(nx*nu*2),2));
 const idx=[];for(let i=0;i<nx-1;i++)for(let j=0;j<nu-1;j++){const a=i*nu+j,b=a+nu;idx.push(a,b,a+1,b,b+1,a+1);}g.setIndex(idx);return g;}
const bodyM=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,side:THREE.DoubleSide,depthWrite:true});
const lipM=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,side:THREE.DoubleSide,depthWrite:false});
const strM=new THREE.MeshBasicMaterial({vertexColors:true,map:streak,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
const soupM=new THREE.MeshBasicMaterial({vertexColors:true,map:soup,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
const NF=UF.length+1;
const WV=[];function waveObj(i){if(WV[i])return WV[i];const o={body:new THREE.Mesh(grid(NX,NU),bodyM),lip:new THREE.Mesh(grid(NX,NL),lipM),str:new THREE.Mesh(grid(NX,NF),strM),soup:new THREE.Mesh(grid(NX,NF),soupM)};
 o.lip.renderOrder=3;o.str.renderOrder=2;o.soup.renderOrder=4;for(const k in o){o[k].frustumCulled=false;scene.add(o[k]);}WV[i]=o;return o;}
// spray / nevel bij de krul
const SPN=260,spG=new THREE.BufferGeometry(),spP=new Float32Array(SPN*3);spG.setAttribute('position',new THREE.BufferAttribute(spP,3));
const spray=new THREE.Points(spG,new THREE.PointsMaterial({map:dot,size:0.25,transparent:true,opacity:.7,depthWrite:false,color:0xf2fffd}));spray.frustumCulled=false;scene.add(spray);
const sp=[];for(let i=0;i<SPN;i++)sp.push({x:0,y:-99,z:0,vx:0,vy:0,vz:0,t:0});
// gevaren als sprites, getekend met canvas
function hz(fn,w,h){return tex(w,h,fn);}
const HT={fin:hz((g)=>{g.translate(64,110);g.fillStyle='#4b5563';g.beginPath();g.moveTo(-28,0);g.quadraticCurveTo(0,-68,20,-80);g.quadraticCurveTo(12,-28,32,0);g.fill();g.fillStyle='#fff';g.fillRect(-40,0,80,6);},128,128),
 gull:hz((g)=>{g.translate(64,64);g.scale(2,2);g.strokeStyle='#222';g.fillStyle='#fff';g.lineWidth=3;g.beginPath();g.moveTo(-30,-6);g.quadraticCurveTo(-14,-10,0,0);g.quadraticCurveTo(14,-10,30,-6);g.stroke();g.beginPath();g.ellipse(0,2,9,6,0,0,7);g.fill();g.stroke();g.fillStyle='#f59e0b';g.beginPath();g.moveTo(-3,6);g.lineTo(3,6);g.lineTo(0,13);g.fill();g.fillStyle='#000';g.fillRect(-5,-1,3,3);g.fillRect(2,-1,3,3);},128,128),
 surfer:hz((g)=>{g.translate(90,236);g.scale(1.6,1.6);g.fillStyle='#fde68a';g.beginPath();g.ellipse(0,-2,34,6,0,0,7);g.fill();g.strokeStyle='#1f2937';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(-10,-6);g.lineTo(-4,-30);g.lineTo(10,-6);g.moveTo(-4,-30);g.lineTo(0,-52);g.moveTo(-20,-46);g.lineTo(0,-46);g.lineTo(18,-56);g.stroke();g.fillStyle='#e0a96d';g.beginPath();g.arc(1,-62,9,0,7);g.fill();g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.moveTo(-4,-66);g.lineTo(0,-64);g.moveTo(6,-66);g.lineTo(2,-64);g.stroke();g.fillStyle='#fff';g.strokeStyle='#000';g.beginPath();g.roundRect(14,-118,100,30,8);g.fill();g.stroke();g.fillStyle='#000';g.font='bold 13px system-ui';g.fillText(window.__faShout||'Hé!',20,-98);},256,256)};
const hzS=[];function hzSprite(i,ty){let s=hzS[i];if(!s){s=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true}));scene.add(s);hzS[i]=s;}if(s.userData.ty!==ty){s.material.map=HT[ty];s.material.needsUpdate=true;s.userData.ty=ty;
 if(ty==='fin'){s.center.set(.5,.14);s.scale.set(2.2,2.2,1);}else if(ty==='gull'){s.center.set(.5,.5);s.scale.set(1.8,1.8,1);}else{s.center.set(.35,.08);s.scale.set(4.2,4.2,1);}}s.visible=true;return s;}
// barrel-buis (aan camera vast)
const TB=new THREE.CylinderGeometry(3.2,3.2,46,28,24,true,Math.PI*0.25,Math.PI*1.45);TB.rotateX(Math.PI/2);TB.translate(0,0,-23);
{const p=TB.attributes.position,c=new Float32Array(p.count*4);for(let i=0;i<p.count;i++){const z=-p.getZ(i)/46,y=p.getY(i)/3.2;const k=z**2;c[i*4]=lerp(.05,1,k*.95);c[i*4+1]=lerp(.35,1,k*.9)+(y>0?.08:0);c[i*4+2]=lerp(.42,.88,k);c[i*4+3]=lerp(.95,.55,k);}TB.setAttribute('color',new THREE.BufferAttribute(c,4));}
const tube=new THREE.Group();const tubeIn=new THREE.Mesh(TB,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,side:THREE.DoubleSide,fog:false,depthTest:false}));
const st2=streak.clone();st2.needsUpdate=true;st2.wrapS=st2.wrapT=THREE.RepeatWrapping;st2.repeat.set(4,3);
const tubeS=new THREE.Mesh(TB,new THREE.MeshBasicMaterial({map:st2,transparent:true,opacity:.18,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,depthTest:false,depthWrite:false}));
const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:dot,color:0xfffbe0,fog:false,depthTest:false,transparent:true}));glow.position.set(0,0.2,-44);
tubeIn.renderOrder=20;tubeS.renderOrder=21;glow.renderOrder=22;tube.add(tubeIn,tubeS,glow);tube.visible=false;cam.add(tube);
// ----
function setCol(a,i,c,al){a[i*4]=c.r;a[i*4+1]=c.g;a[i*4+2]=c.b;a[i*4+3]=al;}
const cDeep=C(.02,.24,.30),cTurq=C(.33,.86,.80),cBack=C(.09,.46,.62),cWhite=C(.95,.99,1),tmpC=new THREE.Color(),tmp2=new THREE.Color();
function buildWave(o,W,S){const top=W.top*2.2,peel=W.o.peel===undefined?-1e9:W.o.peel,sg=W.o.dir||1,ww=!!W.o.ww,al=W.o.alpha||0.97,z0=W.z,tm=S.tm,mood=S.mood;
 const Lf=top*2.4,Lb=top*7,prof=u=>{const L=u<0?Lf:Lb;return 0.5*(1+Math.cos(Math.PI*Math.min(1,Math.abs(u)/L)));};
 const bp=o.body.geometry.attributes,lp=o.lip.geometry.attributes,sp_=o.str.geometry.attributes,su=o.soup.geometry.attributes;
 const bP=bp.position.array,bC=bp.color.array,lP=lp.position.array,lC=lp.color.array,sP=sp_.position.array,sC=sp_.color.array,sU=sp_.uv.array,uP=su.position.array,uC=su.color.array,uU=su.uv.array;
 const lit=0.55+0.45*mood;
 for(let i=0;i<NX;i++){const x=XSa[i],q=(x-peel)*sg,k=clamp((q+18)/18,0,1),hx=top*(0.55+0.45*sm(k))*(1+0.1*Math.sin(x*0.045+tm*0.7)+0.05*Math.sin(x*0.13+1.3));
  const broken=ww||q<0,curl=ww?0:(q>=-2&&q<50?Math.pow(1-clamp(q,0,50)/50,0.8):0),X=-x;
  // romp: rug -> kam -> front
  for(let j=0;j<NU;j++){let u;if(j<UB.length)u=UB[j]*Lb;else if(j===UB.length)u=0;else u=-UF[j-UB.length-1]*Lf;
   const pr=prof(u),y=hx*pr+0.02,n=(i*NU+j);bP[n*3]=X;bP[n*3+1]=y;bP[n*3+2]=z0+u;
   if(u>0){tmpC.copy(cBack).lerp(cTurq,0.25*pr);tmpC.multiplyScalar(lit*(0.85+0.15*pr));setCol(bC,n,tmpC,al);}
   else{const tt=pr;tmpC.copy(cDeep).lerp(cTurq,Math.pow(tt,1.4));
    const shade=1-0.5*curl*sm(clamp((tt-0.45)/0.4,0,1)); // schaduw onder de lip
    tmpC.multiplyScalar(lit*shade);if(broken&&tt>0.25)tmpC.lerp(cWhite,0.35*(ww?1:sm(clamp(-q/12,0,1))));
    setCol(bC,n,tmpC,al*(0.98-0.22*Math.pow(tt,2)));}}
  // overlays op front (strepen + schuimsoep)
  for(let j=0;j<NF;j++){const u=j===0?0:-UF[j-1]*Lf,pr=prof(u),y=hx*pr+0.04,n=i*NF+j;
   sP[n*3]=uP[n*3]=X;sP[n*3+1]=uP[n*3+1]=y+0.01;sP[n*3+2]=uP[n*3+2]=z0+u-0.03;
   sU[n*2]=uU[n*2]=x/9;sU[n*2+1]=j/NF*1.6+tm*0.25;uU[n*2+1]=j/NF*2-tm*0.4;
   const face=sm(clamp(pr*1.3,0,1))*(1-sm(clamp((pr-0.9)/0.1,0,1))*0.5);const s=(broken?0.18:0.42)*face*lit;setCol(sC,n,tmp2.setRGB(s,s,s),1);
   const sb=broken?(ww?0.95:0.92*sm(clamp(-q/10,0,1)))*sm(clamp((pr-0.15)/0.5,0,1)):0;setCol(uC,n,tmp2.setRGB(lit,lit,lit),sb);}
  // lip: doorschijnende krul
  const r=0.24*hx*curl,phiM=curl*2.5;
  for(let j=0;j<NL;j++){const f=j/(NL-1),ph=f*phiM,n=i*NL+j;lP[n*3]=X;lP[n*3+1]=hx-r+r*Math.cos(ph)+0.03;lP[n*3+2]=z0-r*Math.sin(ph)-0.02;
   tmpC.copy(cTurq).lerp(C(.75,1,.9),0.35+0.4*f*mood);tmpC.multiplyScalar(lit);if(f>0.75)tmpC.lerp(cWhite,0.6*(f-0.75)/0.25);setCol(lC,n,tmpC,curl>0.02?(0.45+0.35*f):0);}
  // spray bij het breekpunt
  if(!ww&&Math.abs(q)<6&&Math.random()<0.5*S.dt*60){const s=sp[(sp.i=(sp.i||0)+1)%SPN];s.x=X+(Math.random()-.5)*3;s.y=hx;s.z=z0-0.3;s.vx=(Math.random()-.5)*1.5;s.vy=1.5+Math.random()*2.5;s.vz=(0.5+Math.random()*1.5);s.t=1.4;}
  if(ww&&Math.random()<0.08*S.dt*60){const s=sp[(sp.i=(sp.i||0)+1)%SPN];s.x=X;s.y=hx*0.9;s.z=z0-0.3;s.vx=(Math.random()-.5);s.vy=1+Math.random();s.vz=-1;s.t=1;}}
 for(const k of ['body','lip','str','soup']){const a=o[k].geometry.attributes;a.position.needsUpdate=true;a.color.needsUpdate=true;if(a.uv)a.uv.needsUpdate=true;o[k].visible=true;}}
function lc(a,b,k){return tmpC.copy(a).lerp(b,k);}
const skyTopB=C(.24,.27,.32),skyTopG=C(.18,.56,.88),skyHB=C(.54,.58,.61),skyHG=C(.85,.95,1),seaB=C(.2,.3,.36),seaG2=C(.06,.5,.68),seaFarG=C(.42,.75,.85);
function frame(S){
 if(cv.width!==Math.round(S.W*PR)||cv.height!==Math.round(S.H*PR))R.setSize(S.W,S.H,false);cv.style.width=S.W+'px';cv.style.height=S.H+'px';
 cam.aspect=S.W/S.H;cam.fov=2*Math.atan(S.H/2/S.F)*180/Math.PI;cam.updateProjectionMatrix();
 cam.position.set(S.shake?S.shake[0]:0,S.camH,0);cam.rotation.set(-Math.atan((S.H*0.5-S.hz)/S.F),Math.PI-S.th,S.roll);
 const m=S.mood;
 // lucht
 {const p=skyG.attributes.position;const hzc=lc(skyHB,skyHG,m).clone(),tpc=lc(skyTopB,skyTopG,m).clone();for(let i=0;i<p.count;i++){const y=clamp(p.getY(i)/1200,0,1);tmp2.copy(hzc).lerp(tpc,Math.pow(y,0.6));skyC[i*3]=tmp2.r;skyC[i*3+1]=tmp2.g;skyC[i*3+2]=tmp2.b;}skyG.attributes.color.needsUpdate=true;scene.fog.color.copy(hzc);R.setClearColor(hzc);}
 sun.position.set(-Math.sin(0.7)*900,260,Math.cos(0.7)*900);sun.material.opacity=clamp((m-0.3)*2,0,1);
 clouds.forEach((s,i)=>{const a=s.userData.a+S.tm*0.004*(i%3+1);s.position.set(-Math.sin(a)*900,s.userData.e,Math.cos(a)*900);s.material.color.setScalar(m<0.4?0.42+m*0.4:1);s.visible=i<5+(1-m)*9;});
 // zee met kleine chop
 {const a=seaP.array,rz=S.rz;const near=lc(seaB,seaG2,m).clone(),far=lc(C(.36,.45,.5),seaFarG,m).clone();
  for(let i=0;i<seaP.count;i++){const x=seaBase[i*3],z=seaBase[i*3+2];const ch=0.06*Math.sin(x*0.35+S.tm*1.8)+0.05*Math.sin((z+rz)*0.5-S.tm*1.3)+0.03*Math.sin((x+z)*0.9+S.tm*2.6);a[i*3+1]=ch-0.05;
   const d=Math.min(1,Math.hypot(x,z)/420);const k=0.5+ch*3;tmp2.copy(near).lerp(far,d).multiplyScalar(0.9+0.2*k);seaCol[i*3]=tmp2.r;seaCol[i*3+1]=tmp2.g;seaCol[i*3+2]=tmp2.b;}
  seaP.needsUpdate=true;seaG.attributes.color.needsUpdate=true;}
 // glinsteringen
 for(let i=0;i<GL;i++){const g=glS[i];const s=Math.sin(S.tm*4+g.ph);const zz=((g.z-S.rz)%160+240)%160-80;glP[i*3]=g.x;glP[i*3+1]=s>0.7?0.06:-5;glP[i*3+2]=zz;}glG.attributes.position.needsUpdate=true;glints.material.opacity=0.3+0.7*m;
 shore.position.z=S.shoreZ;sand.material.color.copy(lc(C(.36,.42,.29),C(.91,.83,.6),m));hillM.color.copy(lc(C(.25,.29,.21),C(.31,.54,.23),m));
 // golven
 WV.forEach(o=>{for(const k in o)o[k].visible=false;});
 S.waves.forEach((w,i)=>buildWave(waveObj(i),w,S));
 for(const s of sp){if(s.t<=0){s.y=-99;continue;}s.t-=S.dt;s.vy-=4*S.dt;s.x+=s.vx*S.dt;s.y+=s.vy*S.dt;s.z+=s.vz*S.dt;}
 for(let i=0;i<SPN;i++){const s=sp[i];spP[i*3]=s.x;spP[i*3+1]=s.t>0?s.y:-99;spP[i*3+2]=s.z;}spG.attributes.position.needsUpdate=true;
 // gevaren
 hzS.forEach(s=>s.visible=false);(S.haz||[]).forEach((h,i)=>{const s=hzSprite(i,h.type);s.position.set(-h.x,h.type==='gull'?Math.max(1.2,h.y):0,h.z);});
 // barrel
 tube.visible=!!S.barrel;if(S.barrel){const b=S.barrel,g=Math.min(1,b.t/3.2);glow.scale.setScalar(6+g*22);glow.material.opacity=0.6+0.4*g;st2.offset.y=-S.tm*1.4;st2.offset.x=S.tm*0.2;tube.rotation.z=(S.th>0?1:-1)*0.15+Math.sin(S.tm*1.3)*0.03;}
 R.render(scene,cam);}
window.F3D={ok:true,frame};
