(async()=>{const L=document.documentElement.lang==='en'?'en':'nl';
const T={nl:{w:'Wacht op jou',d:'Vandaag',a:'Bezig',k:'Vandaag klaar',u:'Bijgewerkt',all:'Alle bots',team:'Team',now:'Nu',next:'Volgende',wt:'wachtend',ac:'actief',dn:'klaar',nu:'Volgende stappen',tasks:'Taken',ip:'Bezig',fin:'Klaar',idle:'geen recente activiteit',today:'Vandaag'},
en:{w:'Waiting on you',d:'Due today',a:'In progress',k:'Done today',u:'Updated',all:'All bots',team:'Team',now:'Now',next:'Next',wt:'waiting',ac:'active',dn:'done',nu:'Next up',tasks:'Tasks',ip:'In progress',fin:'Done',idle:'no recent activity',today:'Today'}}[L];
const D=await (await fetch((L==='en'?'../':'')+'data.json',{cache:'no-store'})).json();
const B=Object.fromEntries(D.bots.map(b=>[b.id,b]));let f='all';const $=s=>document.querySelector(s);
const dot=id=>`<span class="dot" style="background:${B[id].color}">${B[id].name[0]}</span>`;
const who=id=>`<span class="meta">${dot(id)}${B[id].name}</span>`;
const today=D.updated.slice(0,10);const isToday=t=>t.when.en==='Today';
$('#stats').innerHTML=[[D.waiting.length,T.w],[D.waiting.filter(x=>x.due==='today').length,T.d],[D.tasks.filter(t=>t.status==='active').length,T.a],[D.tasks.filter(t=>t.status==='done'&&isToday(t)).length,T.k],[new Date(D.updated).toLocaleTimeString(L,{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Amsterdam'}),T.u+' '+new Date(D.updated).toLocaleDateString(L,{day:'numeric',month:'short',timeZone:'Europe/Amsterdam'})]].map(([v,l])=>`<div class="stat"><b>${v}</b><span>${l}</span></div>`).join('');
function chips(){$('#chips').innerHTML=`<button class="chip ${f==='all'?'on':''}" data-b="all">${T.all}</button>`+D.bots.map(b=>`<button class="chip ${f===b.id?'on':''}" data-b="${b.id}">${dot(b.id)}${b.name}</button>`).join('');
document.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{f=c.dataset.b;render()})}
const ok=x=>f==='all'||x.bot===f;
function render(){chips();const W=D.waiting.filter(ok),Tk=D.tasks.filter(ok);
$('#wait').innerHTML=`<h2>${T.w}<small>${W.length}</small></h2>`+W.map(x=>`<label class="item"><input type="checkbox"><div>${who(x.bot)}<div>${x[L]}</div>${x.due?`<span class="badge">${T.today}</span>`:''}</div></label>`).join('');
const cards=D.bots.filter(b=>f==='all'||b.id===f).map(b=>{const w=D.waiting.filter(x=>x.bot===b.id).length,a=D.tasks.filter(t=>t.bot===b.id&&t.status==='active').length,d=D.tasks.filter(t=>t.bot===b.id&&t.status==='done').length;const idle=!b.now;
return `<div class="card">${who(b.id)}<div class="meta">${b.role[L]}</div>${idle?`<div class="idle">${T.idle}</div>`:`<div class="lbl">${T.now}</div><div>${b.now[L]}</div><div class="lbl">${T.next}</div><div>${b.next[L]}</div>`}<div class="cnt">${w} ${T.wt} · ${a} ${T.ac} · ${d} ${T.dn}</div></div>`}).join('');
$('#team').innerHTML=`<h2>${T.team}</h2><div class="board">${cards}</div><h3>${T.nu}</h3>`+W.map(x=>`<div class="item"><div>${who(x.bot)}<div>${x[L]}</div></div></div>`).join('');
const li=t=>`<div class="item ${t.status}"><div>${who(t.bot)}<div class="t">${t[L]}</div><div class="meta">${t.when[L]}</div></div></div>`;
$('#tasks').innerHTML=`<h2>${T.tasks}<small>${Tk.filter(t=>t.status==='active').length} / ${Tk.filter(t=>t.status==='done').length}</small></h2><h3>${T.ip}</h3>`+Tk.filter(t=>t.status==='active').map(li).join('')+`<h3>${T.fin}</h3>`+Tk.filter(t=>t.status==='done').map(li).join('')}
render()})();
