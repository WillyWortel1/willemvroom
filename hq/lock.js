window.HQUnlock=(()=>{const L=document.documentElement.lang==='en'?'en':'nl';
const T={nl:{t:'Voer pincode in',e:'Onjuiste pincode'},en:{t:'Enter PIN',e:'Wrong PIN'}}[L];
const base=L==='en'?'../':'';const d64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function dec(enc,pin){const km=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveKey']);
const k=await crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:d64(enc.salt),iterations:enc.iter},km,{name:'AES-GCM',length:256},false,['decrypt']);
return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:d64(enc.iv)},k,d64(enc.ct))))}
return ()=>new Promise(async res=>{const enc=await (await fetch(base+'data.enc.json',{cache:'no-store'})).json();
const s=sessionStorage.getItem('hqpin');if(s){try{return res(await dec(enc,s))}catch(e){sessionStorage.removeItem('hqpin')}}
const o=document.createElement('div');o.id='lock';o.innerHTML=`<div class="lbox"><div class="ltitle">Willem HQ</div><div class="lsub">${T.t}</div><div class="dots"></div><div class="lerr"></div><div class="pad">${[1,2,3,4,5,6,7,8,9,'⌫',0,'OK'].map(k=>`<button data-k="${k}">${k}</button>`).join('')}</div></div>`;
document.body.appendChild(o);let pin='',busy=false;const dots=o.querySelector('.dots'),err=o.querySelector('.lerr'),box=o.querySelector('.lbox');
const draw=()=>dots.textContent='•'.repeat(pin.length)||' ';draw();
async function ok(){if(busy||!pin)return;busy=true;try{const d=await dec(enc,pin);sessionStorage.setItem('hqpin',pin);o.classList.add('out');setTimeout(()=>o.remove(),400);res(d)}
catch(e){err.textContent=T.e;box.classList.remove('shake');void box.offsetWidth;box.classList.add('shake');pin='';draw()}busy=false}
const key=k=>{if(k==='OK'||k==='Enter')ok();else if(k==='⌫'||k==='Backspace'){pin=pin.slice(0,-1);draw()}else if(/^\d$/.test(k)&&pin.length<12){pin+=k;err.textContent='';draw()}};
o.querySelectorAll('button').forEach(b=>b.onclick=()=>key(b.dataset.k));document.addEventListener('keydown',e=>{if(document.getElementById('lock'))key(e.key)})})})();
