(async()=>{const D=await HQUnlock();const $=s=>document.querySelector(s);
const day=s=>new Date(s+'T00:00:00Z'),dd=(a,b)=>Math.round((day(b)-day(a))/864e5);
const F=D.followers,b=F.baseline,today=D.updated.slice(0,10),span=dd(b.d,F.goal.d);
const plan=d=>b.n+(F.goal.n-b.n)*dd(b.d,d)/span,pt=plan(today),diff=F.current-pt;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const W=320,H=140,x=d=>10+(W-20)*dd(b.d,d)/span,y=n=>H-10-(H-20)*(n-240)/(F.goal.n-240);
const chart=`<svg viewBox="0 0 ${W} ${H}"><line x1="${x(b.d)}" y1="${y(b.n)}" x2="${x(F.goal.d)}" y2="${y(F.goal.n)}" stroke="#8b949e" stroke-dasharray="4 4"/>
<polyline fill="none" stroke="#3fb950" stroke-width="2.5" points="${F.history.map(h=>x(h.d)+','+y(h.n)).join(' ')}"/>${F.history.map(h=>`<circle cx="${x(h.d)}" cy="${y(h.n)}" r="3" fill="#3fb950"/>`).join('')}
<text x="10" y="12" fill="#8b949e" font-size="10">— werkelijk  - - plan</text><text x="${W-10}" y="${y(F.goal.n)+12}" fill="#8b949e" font-size="10" text-anchor="end">300 · 31-12</text></svg>`;
const S=D.score,row=p=>`<tr><td class="sc">${p.score.toFixed(2)}</td><td><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.onderwerp)}</a><div class="meta">${esc(p.datum)} · ${p.type} · ${p.views} weergaven</div></td></tr>`;
function likesSec(){const L=D.likes;if(!L)return '';setTimeout(()=>drawLikes('d'));
return `<section class="col"><h2>Likes<small>${L.posts} posts</small></h2><div class="big">${L.total}</div><div class="meta">likes totaal</div>
<div class="stats" style="grid-template-columns:repeat(3,1fr);margin:12px 0"><div class="stat"><b>${L.avg}</b><span>gem. per post</span></div><div class="stat"><b>${L.median}</b><span>mediaan per post</span></div><div class="stat"><b>${L.avg_vs_median_views}</b><span>per 1.000 weergaven</span></div></div>
<div class="meta">${L.with_likes} van ${L.posts} posts hebben likes</div>
<div class="chips" id="lper" style="margin:12px 0 4px">${[['d','Dag'],['w','Week'],['m','Maand'],['y','Jaar']].map(([k,t])=>`<button class="chip" data-p="${k}">${t}</button>`).join('')}</div>
<div id="lchart"></div>
<h3>Meeste likes</h3><table>${L.top.map(p=>`<tr><td class="sc">${p.likes}</td><td><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.onderwerp)}</a></td></tr>`).join('')}</table></section>`}
const MN=['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
function isoW(ds){const d=day(ds),n=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-n+3);const y=d.getUTCFullYear(),f=new Date(Date.UTC(y,0,4));return y+'-W'+String(1+Math.round(((d-f)/864e5-3+((f.getUTCDay()+6)%7))/7)).padStart(2,'0')}
function drawLikes(per){const L=D.likes,g={};const key={d:x=>x.d,w:x=>isoW(x.d),m:x=>x.d.slice(0,7),y:x=>x.d.slice(0,4)}[per];
L.byday.forEach(x=>{const k=key(x);g[k]=(g[k]||0)+x.likes});const E=Object.entries(g).sort();
const lab=k=>per==='d'?k.slice(8)+'-'+k.slice(5,7):per==='w'?k.slice(5):per==='m'?MN[+k.slice(5)-1]+' '+k.slice(2,4):k;
const mx=Math.max(1,...E.map(e=>e[1])),bw=300/E.length,cur=E.at(-1),tot=E.reduce((a,e)=>a+e[1],0);
const name={d:'Dag',w:'Week',m:'Maand',y:'Jaar'}[per];
document.querySelectorAll('#lper .chip').forEach(c=>{c.classList.toggle('on',c.dataset.p===per);c.onclick=()=>drawLikes(c.dataset.p)});
document.getElementById('lchart').innerHTML=`<div class="meta" style="display:block">Laatste ${name.toLowerCase()} (${lab(cur[0])}): <b style="color:#e6edf3">${cur[1]}</b> likes · ${E.length} ${per==='d'?'dagen met posts':'periodes'} · gem. ${(tot/E.length).toFixed(1)} per periode</div>
<svg viewBox="0 0 320 135">${E.map(([k,v],i)=>{const h=95*v/mx,x=10+i*bw,w=Math.max(2,bw-3);return `<rect x="${x}" y="${112-h}" width="${w}" height="${h}" rx="2" fill="#3fb950"><title>${lab(k)}: ${v}</title></rect>${v?`<text x="${x+w/2}" y="${108-h}" fill="#8b949e" font-size="8" text-anchor="middle">${v}</text>`:''}${(E.length<=8||i===0||i===E.length-1)?`<text x="${x+w/2}" y="126" fill="#8b949e" font-size="8" text-anchor="middle">${lab(k)}</text>`:''}`}).join('')}</svg>
<div class="meta">Likes geteld op de postdatum (bron: postlog)</div>`}
const nl=d=>new Date(d).toLocaleString('nl-NL',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Amsterdam'});
$('#sub').textContent='Bijgewerkt '+nl(D.updated)+' (Amsterdamse tijd)';
$('#app').innerHTML=`<section class="col"><h2>Volgers</h2><div class="big">${F.current}</div>
<div class="meta">Plan vandaag: ${pt.toFixed(1)} · <span class="${diff>=0?'ok':'bad'}">${diff>=0?'+':''}${diff.toFixed(1)} ${diff>=0?'voor':'achter'}</span> · nog ${F.goal.n-F.current} tot ${F.goal.n}</div>${chart}
<div class="meta">Plan = 245 + 55 × dagen sinds 26-10 ÷ 66</div>
<h2 style="margin-top:18px">Vandaag</h2>${D.tasks.map(t=>`<label class="item"><input type="checkbox"><div><div>${esc(t.nl)}</div>${t.t?`<div class="meta">${t.t}</div>`:''}</div></label>`).join('')}
<h2 style="margin-top:18px">Komende 7 dagen</h2>${D.calendar.length?D.calendar.map(c=>`<div class="item"><div><div>${esc(c.onderwerp)}</div><div class="meta">${esc(c.datum)}</div><div class="meta">${esc(c.waarom)}</div></div></div>`).join(''):'<div class="meta">Niets gepland</div>'}</section>
<section class="col"><h2>Accountscore<small>${S.rows} posts · peildatum ${esc(S.peildatum)}</small></h2>
<div class="formula">score = (likes + 7,6×(reacties+quotes) + 1,5×reposts) ÷ mediaan (${S.median_basis})</div>
<div class="meta" style="margin:6px 0">Mediaan weergaven: <b>${S.median_views}</b></div>
<h3>Top</h3><table>${S.top.map(row).join('')}</table><h3>Flop</h3><table>${S.flop.map(row).join('')}</table></section>
${likesSec()}<section class="col"><h2>Trend per week</h2><table><tr><th>Week</th><th>Posts</th><th>Gem. score</th><th>Med. weergaven</th></tr>${S.weeks.map(w=>`<tr><td>${w.week.slice(5)}</td><td>${w.n}</td><td>${w.score_avg}</td><td>${w.views_med}</td></tr>`).join('')}</table>
<div class="meta" style="margin-top:8px">${esc(S.note)}</div></section>`;})();
