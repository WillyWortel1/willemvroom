/* Audio-only tracklist via YouTube IFrame API (youtube-nocookie). Player iframe stays in the DOM (kept off-screen, or shown via "Toon speler"). */
(function(){
var root=document.getElementById('ap');if(!root)return;
var EN=root.getAttribute('data-lang')==='en';
var L=EN?{play:'Play',pause:'Pause',none:'Pick a track',now:'Now playing',seek:'Position in the track',of:'of',bad:'This track is not available, skipping to the next one.'}:{play:'Afspelen',pause:'Pauzeren',none:'Kies een nummer',now:'Nu aan het spelen',seek:'Positie in het nummer',of:'van',bad:'Dit nummer is niet beschikbaar, door naar het volgende.'};
var $=function(id){return document.getElementById(id)};
var tracks=Array.prototype.slice.call(root.querySelectorAll('.ap-t'));
var cur=-1,player=null,ready=false,apiLoading=false,pending=null,timer=null,errSkips=0,retried={};
var now=$('apNow');
function fmt(s){s=Math.max(0,Math.floor(s||0));return Math.floor(s/60)+':'+('0'+s%60).slice(-2)}
function setPlayingUI(on){
    tracks.forEach(function(b,i){b.setAttribute('aria-pressed',on&&i===cur?'true':'false');if(i===cur)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')});
}
var rowCur=null,tm=null,sk=null;
function meta(){
  if(cur<0)return;
  if(rowCur){rowCur.classList.remove('ap-act');rowCur.style.removeProperty('--ap-p');if(tm)tm.remove();if(sk)sk.remove()}
  var tb=tracks[cur],ti=tb.getAttribute('data-title');rowCur=tb.parentNode;rowCur.classList.add('ap-act');rowCur.style.setProperty('--ap-p','0%');
  tm=document.createElement('span');tm.className='ap-tm';tm.setAttribute('aria-hidden','true');tm.textContent='0:00';rowCur.querySelector('.ap-name').appendChild(tm);
  sk=document.createElement('span');sk.className='ap-sk';sk.setAttribute('role','slider');sk.tabIndex=0;sk.setAttribute('aria-label',L.seek+': '+ti);sk.setAttribute('aria-valuemin','0');sk.setAttribute('aria-valuemax','0');sk.setAttribute('aria-valuenow','0');sk.setAttribute('aria-valuetext','0:00');rowCur.insertBefore(sk,tb);
  now.textContent=L.now+': '+ti;
  try{if('mediaSession' in navigator)navigator.mediaSession.metadata=new MediaMetadata({title:tracks[cur].getAttribute('data-title'),artist:'Boccaccio Life',album:EN?'Listen to Boccaccio Life':'Luister naar Boccaccio Life'})}catch(e){}
}
function load(){
  if(apiLoading)return;apiLoading=true;
  window.onYouTubeIframeAPIReady=(function(prev){return function(){if(prev)try{prev()}catch(e){}create()}})(window.onYouTubeIframeAPIReady);
  if(window.YT&&window.YT.Player){create();return}
  if(!document.querySelector('script[src*="youtube.com/iframe_api"]')){var s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';document.head.appendChild(s)}
}
function create(){
  player=new YT.Player('apPlayer',{width:'200',height:'200',host:'https://www.youtube-nocookie.com',playerVars:{playsinline:1,rel:0,controls:0,disablekb:1,origin:location.origin},events:{
    onReady:function(){ready=true;if(pending!==null){var i=pending;pending=null;start(i)}},
    onStateChange:function(e){
      if(e.data===1){setPlayingUI(true);errSkips=0;tick();if(!timer)timer=setInterval(tick,500)}
      else if(e.data===2){setPlayingUI(false)}
      else if(e.data===0){setPlayingUI(false);step(1)}
    },
    onError:function(e){var c=e&&e.data;if(cur>=0&&(c===100||c===101||c===150||c===153)){if(!retried[cur]){retried[cur]=1;var r=cur;setTimeout(function(){if(cur===r)start(r)},900);return}tracks[cur].classList.add('bad');tracks[cur].setAttribute('title',L.bad)}if(++errSkips<=3)setTimeout(function(){step(1)},600);else setPlayingUI(false)}}});
}
function paint(t,d){if(rowCur&&d>0)rowCur.style.setProperty('--ap-p',Math.max(0,Math.min(100,t/d*100)).toFixed(2)+'%')}
function show(t,d){
  if(!(d>0)||!tm)return;paint(t,d);tm.textContent=fmt(t)+' / '+fmt(d);
  sk.setAttribute('aria-valuemax',Math.floor(d));sk.setAttribute('aria-valuenow',Math.floor(t));sk.setAttribute('aria-valuetext',fmt(t)+' '+L.of+' '+fmt(d));
}
function tick(){if(!ready||!player||dragging)return;try{show(player.getCurrentTime(),player.getDuration())}catch(e){}}
var dragging=false,suppressClick=0;
function seekBy(delta,abs){
  if(!ready||!player||cur<0)return;
  try{var d=player.getDuration(),t=player.getCurrentTime();if(!(d>0))return;var to=Math.max(0,Math.min(d-1,abs!==undefined?abs:t+delta));player.seekTo(to,true);show(to,d)}catch(e){}
}
function start(i){
  if(i<0||i>=tracks.length)return;cur=i;meta();
  if(!ready){pending=i;load();setPlayingUI(false);return}
  try{var tt=document.getElementById('tt');if(tt&&tt._tt&&tt._tt.player&&tt._tt.player())tt._tt.player().pauseVideo()}catch(e){}
  try{player.loadVideoById(tracks[i].getAttribute('data-id'))}catch(e){}
}
function step(d){var n=cur+d;if(n<0)n=0;if(n>=tracks.length){setPlayingUI(false);return}
  while(n>=0&&n<tracks.length&&tracks[n].classList.contains('bad'))n+=d;
  if(n>=0&&n<tracks.length)start(n)}
function toggle(){
  if(cur<0){start(0);return}
  if(!ready){return}
  try{var s=player.getPlayerState();if(s===1)player.pauseVideo();else player.playVideo()}catch(e){}
}
/* Swipe-to-seek on the active row: horizontal drag scrubs (right = forward), seek on release. Vertical drags are left to page scrolling (touch-action: pan-y on the row). */
(function(){
var g=null,bub=null;
function clean(){if(g&&g.row){g.row.classList.remove('ap-drag');try{g.row.releasePointerCapture(g.id)}catch(e){}}if(bub){bub.remove();bub=null}g=null;dragging=false}
root.addEventListener('pointerdown',function(e){
  if(e.pointerType==='mouse'&&e.button!==0)return;
  var row=e.target.closest&&e.target.closest('.ap-l li');
  if(!row||row!==rowCur||!ready||!player||e.target.closest('.ap-t'))return;
  var d=0,t=0;try{d=player.getDuration();t=player.getCurrentTime()}catch(x){}
  if(!(d>0))return;
  g={row:row,id:e.pointerId,x:e.clientX,y:e.clientY,t:t,d:d,w:Math.max(120,row.getBoundingClientRect().width),on:false,to:t};
});
root.addEventListener('pointermove',function(e){
  if(!g||e.pointerId!==g.id)return;
  var dx=e.clientX-g.x,dy=e.clientY-g.y;
  if(!g.on){
    if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){g=null;return}
    if(Math.abs(dx)<10||Math.abs(dx)<Math.abs(dy)*1.5)return;
    g.on=true;dragging=true;g.x=e.clientX;dx=0;
    g.row.classList.add('ap-drag');try{g.row.setPointerCapture(g.id)}catch(x){}
    bub=document.createElement('span');bub.className='ap-bub';bub.setAttribute('aria-hidden','true');g.row.appendChild(bub);
  }
  g.to=Math.max(0,Math.min(g.d-1,g.t+dx/g.w*g.d));
  show(g.to,g.d);bub.textContent=fmt(g.to)+' / '+fmt(g.d);
  if(e.cancelable)e.preventDefault();
});
function up(e){
  if(!g||e.pointerId!==g.id)return;
  if(g.on&&e.type==='pointerup'){try{player.seekTo(g.to,true)}catch(x){}suppressClick=Date.now()}
  else if(g.on){show(g.t,g.d)}
  clean();
}
root.addEventListener('pointerup',up);root.addEventListener('pointercancel',up);
})();
 tracks.forEach(function(b,i){b.parentNode.addEventListener('click',function(e){if(e.target!==b&&Date.now()-suppressClick>400)b.click()});b.addEventListener('click',function(){
  if(i===cur&&ready){try{var s=player.getPlayerState();if(s===1){player.pauseVideo()}else{player.playVideo()}}catch(e){}return}
  start(i)})});
try{if('mediaSession' in navigator){var ms=navigator.mediaSession;ms.setActionHandler('play',toggle);ms.setActionHandler('pause',toggle);ms.setActionHandler('previoustrack',function(){step(-1)});ms.setActionHandler('nexttrack',function(){step(1)})}}catch(e){}
/* Keyboard: with the playing row's button or its position slider focused, Left/Right seek 10 s, Home restarts. */
root.addEventListener('keydown',function(e){
  if(cur<0||!(e.target===sk||e.target===tracks[cur]))return;
  var k=e.key;if(k==='ArrowRight'||k==='ArrowUp'&&e.target===sk)seekBy(10);else if(k==='ArrowLeft'||k==='ArrowDown'&&e.target===sk)seekBy(-10);else if(k==='PageUp')seekBy(30);else if(k==='PageDown')seekBy(-30);else if(k==='Home')seekBy(0,0);else return;
  e.preventDefault();
});
/* Preload the YouTube API shortly before the list scrolls into view so the first tap can start playback inside the user gesture. */
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(en){if(en[0].isIntersecting){io.disconnect();load()}},{rootMargin:'800px 0px'});io.observe(root)}
})();
