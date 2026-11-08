export const JOSH_VIDEO='Vz1IQlRnrtg';
const idPattern=/^[A-Za-z0-9_-]{11}$/;
export function parseYouTubeURL(raw){
 if(typeof raw!=='string'||raw.length>4096||/[\\\u0000-\u0020\u007f]/.test(raw.trim()))return null;
 let u;try{u=new URL(raw.trim());}catch{return null;}
 const host=u.hostname.toLowerCase();if(!['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtu.be','www.youtu.be','youtube-nocookie.com','www.youtube-nocookie.com'].includes(host))return null;
 if(u.protocol!=='https:'||u.username||u.password||u.port)throw new Error('YOUTUBE_URL');
 const parts=u.pathname.split('/').filter(Boolean);let id;
 if(host.endsWith('youtu.be')&&parts.length===1)id=parts[0];
 else if(u.pathname==='/watch'&&u.searchParams.getAll('v').length===1)id=u.searchParams.get('v');
 else if(parts.length===2&&['embed','shorts','live'].includes(parts[0]))id=parts[1];
 if(!idPattern.test(id||''))throw new Error('YOUTUBE_URL');
 const stamp=u.searchParams.get('start')??u.searchParams.get('t')??u.searchParams.get('time_continue')??u.hash.replace(/^#(?:t=)?/,'');let start=0;
 if(stamp){if(/^\d+$/.test(stamp))start=Number(stamp);else{const m=stamp.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);if(!m||!m[0])throw new Error('YOUTUBE_URL');start=Number(m[1]||0)*3600+Number(m[2]||0)*60+Number(m[3]||0);}if(!Number.isSafeInteger(start)||start>86400)throw new Error('YOUTUBE_URL');}
 return {id,start,url:'https://www.youtube.com/watch?v='+id};
}
export function embedURL(video,origin){if(!idPattern.test(video.id)||!Number.isInteger(video.start)||video.start<0||video.start>86400)throw new Error('YOUTUBE_URL');const o=new URL(origin);if(!['http:','https:'].includes(o.protocol)||o.username||o.password)throw new Error('ORIGIN');const u=new URL('https://www.youtube-nocookie.com/embed/'+video.id);for(const [k,v]of Object.entries({enablejsapi:1,origin:o.origin,playsinline:1,rel:0,start:video.start}))u.searchParams.set(k,v);return u.href;}
let apiPromise;
function loadAPI(win,doc){if(win.YT?.Player)return Promise.resolve(win.YT);if(apiPromise)return apiPromise;apiPromise=new Promise((resolve,reject)=>{const script=doc.createElement('script');script.src='https://www.youtube.com/iframe_api';script.referrerPolicy='strict-origin-when-cross-origin';const previous=win.onYouTubeIframeAPIReady;const timer=setTimeout(()=>finish(new Error('API_TIMEOUT')),20000);function finish(error){clearTimeout(timer);script.onerror=null;error?reject(error):resolve(win.YT);}win.onYouTubeIframeAPIReady=()=>{if(typeof previous==='function')previous();finish();};script.onerror=()=>finish(new Error('API_NETWORK'));doc.head.append(script);}).catch(error=>{apiPromise=null;throw error;});return apiPromise;}
export function createYouTubeViewer(root,{onStatus=()=>{},apiLoader=loadAPI,win=window,doc=document,readyTimeout=30000}={}){
 let generation=0,player=null,ready=false,failed=false,timer=null;
 function destroy(){generation++;ready=false;failed=false;clearTimeout(timer);try{player?.destroy();}catch{}player=null;root.replaceChildren();}
 async function open(video,title){destroy();const token=generation;const frame=doc.createElement('iframe');frame.id='youtube-reference-frame';frame.title=title;frame.referrerPolicy='strict-origin-when-cross-origin';frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.src=embedURL(video,win.location.origin);root.append(frame);onStatus('loading');timer=setTimeout(()=>{if(token===generation)onStatus('timeout');},readyTimeout);
  try{const YT=await apiLoader(win,doc);if(token!==generation)return;player=new YT.Player(frame,{events:{onReady:()=>{if(token!==generation||failed)return;ready=true;clearTimeout(timer);onStatus('ready');},onStateChange:e=>{if(token!==generation||failed)return;onStatus(e.data===1?'playing':e.data===2?'paused':e.data===3?'buffering':'ready');},onError:e=>{if(token!==generation)return;failed=true;ready=false;clearTimeout(timer);onStatus('error',e.data);},onAutoplayBlocked:()=>{if(token===generation&&!failed)onStatus('ready');}}});}catch{if(token===generation){clearTimeout(timer);onStatus('apierror');}}
 }
 return {open,destroy,time(){if(!ready)return null;try{const t=player.getCurrentTime();return Number.isFinite(t)&&t>=0?t:null;}catch{return null;}},seek(t){if(!ready||!Number.isFinite(t)||t<0)return false;try{player.seekTo(t,true);return true;}catch{return false;}}};
}
