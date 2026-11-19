/* Audio-only tracklist via YouTube IFrame API (youtube-nocookie). Player iframe stays in the DOM (kept off-screen, or shown via "Toon speler"). */
(function(){
var root=document.getElementById('ap');if(!root)return;
var EN=root.getAttribute('data-lang')==='en';
var L=EN?{play:'Play',pause:'Pause',none:'Pick a track',on:'on YouTube',bad:'This track is not available, skipping to the next one.'}:{play:'Afspelen',pause:'Pauzeren',none:'Kies een nummer',on:'op YouTube',bad:'Dit nummer is niet beschikbaar, door naar het volgende.'};
var $=function(id){return document.getElementById(id)};
var tracks=Array.prototype.slice.call(root.querySelectorAll('.ap-t'));
var cur=-1,player=null,ready=false,apiLoading=false,pending=null,timer=null,errSkips=0,retried={};
var bar=root.querySelector('.ap-bar'),yl=$('apYl'),chT=$('apCh');
var playBtn=$('apPlay'),seek=$('apSeek'),now=$('apNow'),curT=$('apCur'),durT=$('apDur'),vidBtn=$('apVid'),yt=$('apYt');
function fmt(s){s=Math.max(0,Math.floor(s||0));return Math.floor(s/60)+':'+('0'+s%60).slice(-2)}
function setPlayingUI(on){
  playBtn.textContent=on?'❚❚':'▶\ufe0e';playBtn.classList.toggle('on',!!on);playBtn.setAttribute('aria-label',on?L.pause:L.play);
  tracks.forEach(function(b,i){b.setAttribute('aria-pressed',on&&i===cur?'true':'false');if(i===cur)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')});
}
function meta(){
  if(cur<0)return;var tb=tracks[cur],ti=tb.getAttribute('data-title'),ch=tb.getAttribute('data-ch');now.textContent=ti;
  yl.href='https://www.youtube.com/watch?v='+tb.getAttribute('data-id');yl.setAttribute('aria-label',ti+' '+L.on+' ('+ch+')');yl.title=ch;chT.textContent=' · '+ch;yl.hidden=false;
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
      if(e.data===1){setPlayingUI(true);errSkips=0;seek.disabled=false;tick();if(!timer)timer=setInterval(tick,500)}
      else if(e.data===2){setPlayingUI(false)}
      else if(e.data===0){setPlayingUI(false);step(1)}
    },
    onError:function(e){var c=e&&e.data;if(cur>=0&&(c===100||c===101||c===150||c===153)){if(!retried[cur]){retried[cur]=1;var r=cur;setTimeout(function(){if(cur===r)start(r)},900);return}tracks[cur].classList.add('bad');tracks[cur].setAttribute('title',L.bad)}if(++errSkips<=3)setTimeout(function(){step(1)},600);else setPlayingUI(false)}}});
}
function tick(){if(!ready||!player)return;try{var d=player.getDuration(),t=player.getCurrentTime();if(d>0){seek.max=Math.floor(d);if(!seeking)seek.value=Math.floor(t);durT.textContent=fmt(d);curT.textContent=fmt(t)}}catch(e){}}
var seeking=false;
seek.addEventListener('input',function(){seeking=true;curT.textContent=fmt(seek.value)});
seek.addEventListener('change',function(){seeking=false;try{player.seekTo(+seek.value,true)}catch(e){}});
function start(i){
  if(i<0||i>=tracks.length)return;cur=i;meta();seek.value=0;curT.textContent='0:00';durT.textContent='0:00';
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
tracks.forEach(function(b,i){b.parentNode.addEventListener('click',function(e){if(e.target!==b)b.click()});b.addEventListener('click',function(){
  if(i===cur&&ready){try{var s=player.getPlayerState();if(s===1){player.pauseVideo()}else{player.playVideo()}}catch(e){}return}
  start(i)})});
playBtn.addEventListener('click',toggle);
$('apPrev').addEventListener('click',function(){if(ready&&cur>=0){try{if(player.getCurrentTime()>3){player.seekTo(0,true);return}}catch(e){}}step(-1)});
$('apNext').addEventListener('click',function(){if(cur<0)start(0);else step(1)});
vidBtn.addEventListener('click',function(){var on=!yt.classList.contains('on');yt.classList.toggle('on',on);vidBtn.setAttribute('aria-expanded',on);vidBtn.textContent=on?vidBtn.getAttribute('data-hide'):vidBtn.getAttribute('data-show')});
try{if('mediaSession' in navigator){var ms=navigator.mediaSession;ms.setActionHandler('play',toggle);ms.setActionHandler('pause',toggle);ms.setActionHandler('previoustrack',function(){step(-1)});ms.setActionHandler('nexttrack',function(){step(1)})}}catch(e){}
/* Preload the YouTube API shortly before the list scrolls into view so the first tap can start playback inside the user gesture. */
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(en){if(en[0].isIntersecting){io.disconnect();load()}},{rootMargin:'800px 0px'});io.observe(root)}
})();
