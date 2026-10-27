(function(){
var L=document.documentElement.lang=='en',T=L?{acc:'unique accounts',since:'since Padilla\'s post on 26 Oct 2026, 20:18 (Amsterdam)',hour:'Posts per hour',day:'Posts per day',top:'Most viewed',latest:'Latest',views:'views',upd:'Updated',note:'Counts original posts, replies and quotes on X containing “investigate Elon” (reposts excluded). Includes people mocking the call.',gov:'government'}:{acc:'unieke accounts',since:'sinds de post van Padilla op 26 okt 2026, 20:18',hour:'Posts per uur',day:'Posts per dag',top:'Meest bekeken',latest:'Nieuwste',views:'weergaven',upd:'Bijgewerkt',note:'Telt posts, replies en quotes op X met “investigate Elon” (reposts niet meegeteld). Ook mensen die erom lachen tellen mee.',gov:'overheid'};
var nf=new Intl.NumberFormat(L?'en-GB':'nl-NL'),tz='Europe/Amsterdam';
function f(t,o){return new Date(t).toLocaleString(L?'en-GB':'nl-NL',Object.assign({timeZone:tz},o))}
function esc(s){return s.replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
fetch("/elon/data.json?'+Date.now()).then(function(r){return r.json()}).then(function(d){
var P=Object.keys(d.posts).map(function(k){var p=d.posts[k];p.id=k;return p});
document.getElementById('n').textContent=nf.format(d.total);
document.getElementById('acc').textContent=nf.format(d.accounts)+' '+T.acc+' · '+T.since;
document.getElementById('upd').textContent=T.upd+': '+f(d.updated,{dateStyle:'medium',timeStyle:'short'});
function bars(el,key,lab){var m={};P.forEach(function(p){var k=key(p);m[k]=(m[k]||0)+1});var ks=Object.keys(m).sort(),mx=Math.max.apply(0,ks.map(function(k){return m[k]}));
el.innerHTML=ks.map(function(k){return '<div class=b title="'+lab(k)+': '+m[k]+'"><i style="height:'+(m[k]/mx*100)+'%"></i><span>'+m[k]+'</span></div>'}).join('')+'';
el.nextElementSibling.textContent=lab(ks[0])+' → '+lab(ks[ks.length-1])}
var hk=function(p){var x=new Date(p.t);x.setUTCMinutes(0,0,0);return x.toISOString()};
bars(document.getElementById('hc'),hk,function(k){return f(k,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})});
bars(document.getElementById('dc'),function(p){return f(p.t,{year:'numeric',month:'2-digit',day:'2-digit'}).split('/').reverse().join('-')},function(k){return k});
function li(p){var b=p.vtype=='government'?'<em class=gov>'+T.gov+'</em>':p.vtype=='business'?'<em class=biz>✓</em>':p.verified?'<em>✓</em>':'';
return '<li class="'+(p.id==d.origin?'org':'')+'"><a href="https://x.com/'+p.user+'/status/'+p.id+'" target=_blank rel=noopener><b>@'+esc(p.user)+'</b> '+b+' <small>'+f(p.t,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+' · '+nf.format(p.views)+' '+T.views+'</small><br>'+esc(p.text)+'</a></li>'}
document.getElementById('top').innerHTML=P.slice().sort(function(a,b){return b.views-a.views}).slice(0,15).map(li).join('');
document.getElementById('lat').innerHTML=P.slice().sort(function(a,b){return b.t<a.t?-1:1}).slice(0,20).map(li).join('');
document.querySelectorAll('[data-t]').forEach(function(e){e.textContent=T[e.dataset.t]});
})})();
