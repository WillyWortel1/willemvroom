(()=>{const L=document.documentElement.lang==='en'?'en':'nl',dark=document.documentElement.classList.contains('dark');
const T={nl:{t:'Voer pincode in',e:'Onjuiste pincode',s:'Deze pagina is beveiligd.'},en:{t:'Enter PIN',e:'Wrong PIN',s:'This page is protected.'}}[L];
const d64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),e64=a=>btoa(String.fromCharCode(...new Uint8Array(a)));
const enc=JSON.parse(document.getElementById('dmenc').textContent),K='dmsokey';
async function derive(pin){const km=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveKey']);
return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:d64(enc.salt),iterations:enc.iter},km,{name:'AES-GCM',length:256},true,['decrypt'])}
async function dec(k){return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:d64(enc.iv)},k,d64(enc.ct))))}
function run(d){document.title=d.t;document.getElementById('dmenc').remove();const ls=document.currentScript;
document.body.insertAdjacentHTML('afterbegin',d.h);let i=0;(function next(){if(i>=d.s.length){document.dispatchEvent(new Event('dmso-unlocked'));return}
const x=d.s[i++],s=document.createElement('script');if(x.s){s.src=x.s;s.onload=s.onerror=next;document.body.appendChild(s)}else{s.textContent=x.c;document.body.appendChild(s);next()}})()}
async function start(){const sk=sessionStorage.getItem(K);if(sk){try{const k=await crypto.subtle.importKey('raw',d64(sk),'AES-GCM',false,['decrypt']);return run(await dec(k))}catch(e){sessionStorage.removeItem(K)}}
const st=document.createElement('style');const bg=dark?'#0d1117':'#f6f8f6',fg=dark?'#e6edf3':'#1b1f1c',bd=dark?'#30363d':'#cfd8d2',bt=dark?'#161b22':'#fff',g='#2e9e5b';
st.textContent=`#lock{position:fixed;inset:0;background:${bg};color:${fg};display:grid;place-items:center;z-index:9999;font-family:system-ui,sans-serif;transition:opacity .4s}#lock.out{opacity:0}#lock .lbox{text-align:center;width:280px}#lock .ltitle{font-size:26px;font-weight:700}#lock .lsub{opacity:.7;margin:6px 0 16px}#lock .dots{font-size:30px;letter-spacing:8px;min-height:40px}#lock .lerr{color:#d1453b;min-height:20px}#lock .pad{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:10px}#lock .pad button{background:${bt};border:1px solid ${bd};color:${fg};border-radius:50%;aspect-ratio:1;font-size:22px;cursor:pointer}#lock .pad button:active,#lock .pad button:focus-visible{border-color:${g};outline:2px solid ${g}}#lock .pad button[data-k=OK]{color:${g};font-size:17px;font-weight:700}#lock .shake{animation:lsh .35s}@keyframes lsh{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`;
document.head.appendChild(st);const o=document.createElement('div');o.id='lock';
o.innerHTML=`<div class="lbox"><div class="ltitle">DMSO</div><div class="lsub">${T.s}<br>${T.t}</div><div class="dots"></div><div class="lerr"></div><div class="pad">${[1,2,3,4,5,6,7,8,9,'⌫',0,'OK'].map(k=>`<button data-k="${k}">${k}</button>`).join('')}</div></div>`;
document.body.appendChild(o);let pin='',busy=false;const dots=o.querySelector('.dots'),err=o.querySelector('.lerr'),box=o.querySelector('.lbox');
const draw=()=>dots.textContent='•'.repeat(pin.length)||' ';draw();
async function ok(){if(busy||!pin)return;busy=true;try{const k=await derive(pin),d=await dec(k);sessionStorage.setItem(K,e64(await crypto.subtle.exportKey('raw',k)));o.classList.add('out');setTimeout(()=>o.remove(),400);run(d)}
catch(e){err.textContent=T.e;box.classList.remove('shake');void box.offsetWidth;box.classList.add('shake');pin='';draw()}busy=false}
const key=k=>{if(k==='OK'||k==='Enter')ok();else if(k==='⌫'||k==='Backspace'){pin=pin.slice(0,-1);draw()}else if(/^\d$/.test(k)&&pin.length<12){pin+=k;err.textContent='';draw()}};
o.querySelectorAll('button').forEach(b=>b.onclick=()=>key(b.dataset.k));document.addEventListener('keydown',e=>{if(document.getElementById('lock'))key(e.key)})}
start()})();
