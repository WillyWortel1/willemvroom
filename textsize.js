/* Tekstgrootte, overgenomen van willemvroom.com/textsize.js (zelfde stappen, opslag en gedrag). */
(function(){
var S=[87.5,100,112.5,125,137.5,150],K="wv-textsize",d=document.documentElement,nl=(d.lang||"nl").slice(0,2)!=="en";
var L=nl?["Tekstgrootte","Kleinere tekst","Grotere tekst"]:["Text size","Smaller text","Larger text"];
function get(){try{var v=parseFloat(localStorage.getItem(K));return S.indexOf(v)>-1?v:100}catch(e){return 100}}
function set(v){d.style.fontSize=v===100?"":v+"%";try{v===100?localStorage.removeItem(K):localStorage.setItem(K,v)}catch(e){}}
set(get());
function css(){if(document.getElementById("ts-css"))return;var s=document.createElement("style");s.id="ts-css";s.textContent=
'body{font-size:.9375rem}#ts{display:inline-flex;align-items:center;margin-right:12px;gap:0}'+
'#ts button{background:none;border:0;color:#111;font-weight:700;cursor:pointer;line-height:1.5;padding:0 1px;min-width:0;min-height:0;position:relative;display:inline-flex;align-items:center;justify-content:center}'+
'#ts button::after{content:"";position:absolute;inset:-12px -6px}'+
'#ts .ts-s{font-size:11px}#ts .ts-l{font-size:15px}'+
'#ts .ts-sep{padding:0 4px;color:#111;font-size:14.4px}'+
'html.dark #ts button,html.dark #ts .ts-sep{color:#fff}'+
'#ts button:disabled{opacity:.35;cursor:default}'+
'#ts button:focus-visible{outline:3px solid #ff2a3a;outline-offset:2px;border-radius:8px}'+
'#top>header.wv-head,#top>header.wv-head *{white-space:nowrap}';
document.head.appendChild(s);}
function ui(){var head=document.querySelector(".wv-head");if(!head||document.getElementById("ts"))return;
 var nav=head.querySelector("nav");if(!nav){nav=document.createElement("nav");head.appendChild(nav);}
 css();
 var w=document.createElement("span");w.id="ts";w.setAttribute("role","group");w.setAttribute("aria-label",L[0]);
 w.innerHTML='<button type="button" data-d="-1" aria-label="'+L[1]+'" class="ts-s">A</button><span class="ts-sep" aria-hidden="true">|</span><button type="button" data-d="1" aria-label="'+L[2]+'" class="ts-l">A</button>';
 nav.insertBefore(w,nav.firstChild);
 function upd(){var i=S.indexOf(get());w.children[0].disabled=i<=0;w.children[2].disabled=i>=S.length-1;}
 w.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;var i=S.indexOf(get())+ +b.getAttribute("data-d");if(i<0||i>=S.length)return;set(S[i]);upd();});
 upd();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ui);else ui();
})();
