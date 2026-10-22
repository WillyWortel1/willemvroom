(function(){
var API="https://iptv-org.github.io/api/",$=function(i){return document.getElementById(i)};
var vid=$("vid"),list=$("list"),selC=$("country"),selK=$("cat"),q=$("q");
var all=[],view=[],cur=-1,hls=null,tryIdx=0,failT=null,skipT=null,osdT=null,numBuf="",numT=null;
var BAD=/lb\.iptvnetwork\.net/;
var LS={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
function j(n){return fetch(API+n+".json").then(function(r){return r.json()})}
Promise.all([j("channels"),j("streams"),j("logos"),j("categories"),j("countries"),j("blocklist").catch(function(){return[]})]).then(function(d){
 var block={};d[5].forEach(function(b){block[b.channel]=1});
 var st={};d[1].forEach(function(s){if(!s.channel||!/^https:/.test(s.url)||BAD.test(s.url)||s.referrer||s.user_agent)return;(st[s.channel]=st[s.channel]||[]).push(s.url)});
 var lg={};d[2].forEach(function(l){if(/^https:/.test(l.url)&&(!lg[l.channel]||!l.feed))lg[l.channel]=l.url});
 d[0].forEach(function(c){if(c.is_nsfw||c.closed||block[c.id]||!st[c.id])return;all.push({id:c.id,name:c.name,country:c.country,cats:c.categories||[],urls:st[c.id],logo:lg[c.id]})});
 all.sort(function(a,b){return a.name.localeCompare(b.name)});
 var has={};all.forEach(function(c){has[c.country]=1});
 var top=["NL","BE","GB","DE","US"],cn={};d[4].forEach(function(c){cn[c.code]=c});
 function opt(v,t){var o=document.createElement("option");o.value=v;o.textContent=t;return o}
 top.forEach(function(k){if(cn[k])selC.appendChild(opt(k,cn[k].flag+" "+cn[k].name))});
 selC.appendChild(opt("","🌍 Alle landen"));
 d[4].filter(function(c){return has[c.code]&&top.indexOf(c.code)<0}).sort(function(a,b){return a.name.localeCompare(b.name)}).forEach(function(c){selC.appendChild(opt(c.code,c.flag+" "+c.name))});
 d[3].forEach(function(c){selK.appendChild(opt(c.id,c.name))});
 selC.value=LS.get("tv-country")||"NL";selK.value=LS.get("tv-cat")||"";
 $("load").hidden=true;filter(LS.get("tv-last"));
}).catch(function(){$("load").textContent="Zenders konden niet geladen worden."});
function filter(keep,noTune){
 var c=selC.value,k=selK.value,s=q.value.trim().toLowerCase();
 view=all.filter(function(x){return(!c||x.country===c)&&(!k||x.cats.indexOf(k)>=0)&&(!s||x.name.toLowerCase().indexOf(s)>=0)});
 $("count").textContent=view.length+" zenders";
 list.textContent="";shown=0;more();
 var i=-1;if(keep)view.forEach(function(x,n){if(x.id===keep)i=n});
 if(i>=0){cur=i;if(!hls&&!vid.getAttribute("src"))tune(i,true);else mark(i)}else if(noTune){cur=-1}else if(view.length)tune(0,true);
}
var shown=0,io=new IntersectionObserver(function(e){if(e[0].isIntersecting)more()},{root:list});
function more(){var end=Math.min(view.length,shown+60),f=document.createDocumentFragment();
 for(;shown<end;shown++){var x=view[shown],li=document.createElement("li"),b=document.createElement("button");b.type="button";b.dataset.i=shown;
  b.innerHTML='<span class="n">'+(shown+1)+'</span>'+(x.logo?'<img loading="lazy" alt="" src="'+x.logo.replace(/"/g,"")+'">':'<span class="ph"></span>')+'<span class="nm"></span>';
  b.querySelector(".nm").textContent=x.name;var im=b.querySelector("img");if(im)im.onerror=function(){this.style.visibility="hidden"};
  li.appendChild(b);f.appendChild(li)}
 var old=list.querySelector(".sent");if(old)io.unobserve(old),old.classList.remove("sent");
 list.appendChild(f);if(list.lastChild&&shown<view.length){list.lastChild.classList.add("sent");io.observe(list.lastChild)}
 mark(cur)}
function mark(i){[].forEach.call(list.querySelectorAll(".on"),function(b){b.classList.remove("on")});var b=list.querySelector('[data-i="'+i+'"]');if(b)b.classList.add("on")}
list.onclick=function(e){var b=e.target.closest("button");if(b)tune(+b.dataset.i)};
function osd(){var x=view[cur];$("osdn").textContent=cur+1;$("osdname").textContent=x.name;$("osd").hidden=false;clearTimeout(osdT);osdT=setTimeout(function(){$("osd").hidden=true},3000)}
function tune(i,silent){if(!view.length)return;cur=(i+view.length)%view.length;tryIdx=0;LS.set("tv-last",view[cur].id);mark(cur);osd();
 while(shown<=cur&&shown<view.length)more();
 var b=list.querySelector('[data-i="'+cur+'"]');if(b&&!silent){var r=b.getBoundingClientRect(),lr=list.getBoundingClientRect();if(r.top<lr.top||r.bottom>lr.bottom)list.scrollTop+=r.top-lr.top-8}
 play()}
function play(){var x=view[cur],u=x.urls[tryIdx];$("nosig").hidden=true;stopNoise();clearTimeout(failT);clearTimeout(skipT);
 if(hls){hls.destroy();hls=null}vid.removeAttribute("src");
 failT=setTimeout(fail,12000);
 if(window.Hls&&Hls.isSupported()&&!vid.canPlayType("application/vnd.apple.mpegurl")){hls=new Hls({maxBufferLength:20});hls.on(Hls.Events.ERROR,function(e,d){if(d.fatal)fail()});hls.loadSource(u);hls.attachMedia(vid)}
 else{vid.src=u}
 var p=vid.play();if(p&&p.catch)p.catch(function(){})}
vid.onerror=function(){if(!hls&&vid.getAttribute("src"))fail()};
vid.onplaying=function(){clearTimeout(failT);$("nosig").hidden=true;stopNoise();$("unmute").hidden=!vid.muted};
function fail(){clearTimeout(failT);var x=view[cur];if(!x)return;if(tryIdx<x.urls.length-1){tryIdx++;return play()}
 if(hls){hls.destroy();hls=null}vid.removeAttribute("src");vid.load();$("nosig").hidden=false;startNoise();
 if($("autoskip").checked){$("nosigmsg").textContent="Deze zender is nu niet te ontvangen. Over 4 seconden naar de volgende.";skipT=setTimeout(function(){tune(cur+1)},4000)}
 else $("nosigmsg").textContent="Deze zender is nu niet te ontvangen."}
window.__tvFail=fail;
var nc=$("noise"),nx=nc.getContext("2d"),raf=0;
function startNoise(){if(raf)return;var im=nx.createImageData(160,90);(function f(){for(var i=0;i<im.data.length;i+=4){var v=Math.random()*255|0;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255}nx.putImageData(im,0,0);raf=requestAnimationFrame(f)})()}
function stopNoise(){cancelAnimationFrame(raf);raf=0}
$("skipbtn").onclick=function(){tune(cur+1)};
$("autoskip").checked=LS.get("tv-autoskip")!=="0";$("autoskip").onchange=function(){LS.set("tv-autoskip",this.checked?"1":"0");if(!this.checked)clearTimeout(skipT)};
$("chup").onclick=function(){tune(cur+1)};$("chdn").onclick=function(){tune(cur-1)};
function setMute(m){vid.muted=m;$("mute").textContent=m?"🔇":"🔊";$("unmute").hidden=!m||vid.paused}
$("mute").onclick=function(){setMute(!vid.muted)};$("unmute").onclick=function(){setMute(false);vid.play()};
var v=parseFloat(LS.get("tv-vol"));if(!isNaN(v))$("vol").value=v;vid.volume=+$("vol").value;
$("vol").oninput=function(){vid.volume=+this.value;LS.set("tv-vol",this.value);if(vid.muted&&+this.value>0)setMute(false)};
function fs(){var t=$("tv");if(document.fullscreenElement||document.webkitFullscreenElement){(document.exitFullscreen||document.webkitExitFullscreen).call(document)}else if(t.requestFullscreen)t.requestFullscreen();else if(t.webkitRequestFullscreen)t.webkitRequestFullscreen();else if(vid.webkitEnterFullscreen)vid.webkitEnterFullscreen()}
$("fs").onclick=fs;
selC.onchange=function(){LS.set("tv-country",selC.value);filter(view[cur]&&view[cur].id)};selK.onchange=function(){LS.set("tv-cat",selK.value);filter(view[cur]&&view[cur].id)};
var qt;q.oninput=function(){clearTimeout(qt);qt=setTimeout(function(){filter(view[cur]&&view[cur].id,true)},250)};
document.addEventListener("keydown",function(e){var t=e.target.tagName;if(t==="INPUT"||t==="SELECT"||t==="TEXTAREA"||e.metaKey||e.ctrlKey)return;
 if(e.key==="ArrowUp"){e.preventDefault();tune(cur+1)}else if(e.key==="ArrowDown"){e.preventDefault();tune(cur-1)}
 else if(e.key==="m"||e.key==="M")setMute(!vid.muted);else if(e.key==="f"||e.key==="F")fs();
 else if(/^[0-9]$/.test(e.key)){numBuf+=e.key;$("osdn").textContent=numBuf;$("osdname").textContent="";$("osd").hidden=false;clearTimeout(numT);numT=setTimeout(function(){var n=+numBuf;numBuf="";if(n>=1&&n<=view.length)tune(n-1);else $("osd").hidden=true},1200)}});
})();
