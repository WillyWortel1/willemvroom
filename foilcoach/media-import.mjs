export const MAX_MEDIA_BYTES=200_000_000;
export class MediaImportError extends Error{constructor(code){super(code);this.name='MediaImportError';this.code=code;}}
const fail=code=>{throw new MediaImportError(code);};
const social=['youtube.com','youtu.be','youtube-nocookie.com','googlevideo.com','vimeo.com','x.com','twitter.com','instagram.com','tiktok.com','facebook.com','fb.watch','threads.net','dailymotion.com','reddit.com','bsky.app','twitch.tv'];
export function validateMediaURL(raw){
 if(typeof raw!=='string'||raw.trim().length>4096||/[\\\u0000-\u0020\u007f]/.test(raw.trim()))fail('URL');let u;try{u=new URL(raw.trim());}catch{fail('URL');}
 if(u.protocol!=='https:'||u.username||u.password||(u.port&&u.port!=='443'))fail('URL');
 const h=u.hostname.toLowerCase().replace(/\.$/,'');
 // DNS-looking public hosts only. Blocks all IPv4/IPv6 literals, including normalized numeric forms.
 if(!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z][a-z0-9-]*$/.test(h)||/(?:^|\.)(?:localhost|local|internal|intranet|lan|home|test|invalid|example|onion|arpa)$/.test(h))fail('URL');
 if(social.some(domain=>h===domain||h.endsWith('.'+domain)))fail('SOCIAL');u.hash='';return u;
}
function signature(bytes){if(bytes.length>=12&&String.fromCharCode(...bytes.slice(4,8))==='ftyp')return 'video/mp4';if(bytes.length>=4&&bytes[0]===0x1a&&bytes[1]===0x45&&bytes[2]===0xdf&&bytes[3]===0xa3)return 'video/webm';if(bytes.length>=4&&String.fromCharCode(...bytes.slice(0,4))==='OggS')return 'video/ogg';return null;}
export async function fetchMedia(raw,{signal,onProgress=()=>{},fetchImpl=fetch,maxBytes=MAX_MEDIA_BYTES,timeoutMs=60000}={}){
 const u=validateMediaURL(raw);if(signal?.aborted)fail('CANCELLED');const control=new AbortController();let timedOut=false,reader;
 const abort=()=>control.abort();signal?.addEventListener('abort',abort,{once:true});const timer=setTimeout(()=>{timedOut=true;control.abort();},timeoutMs);
 try{
  const response=await fetchImpl(u.href,{method:'GET',mode:'cors',credentials:'omit',redirect:'error',referrerPolicy:'no-referrer',cache:'no-store',signal:control.signal,headers:{Accept:'video/*,application/octet-stream;q=0.5'}});
  if(signal?.aborted)fail('CANCELLED');if(response.redirected||response.type==='opaqueredirect')fail('REDIRECT');if(!response.ok)fail('HTTP');
  if(response.url&&validateMediaURL(response.url).href!==u.href)fail('REDIRECT');
  const mime=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
  if(!['video/mp4','video/webm','video/ogg','video/quicktime','video/x-m4v','application/octet-stream'].includes(mime))fail('TYPE');
  const total=Number(response.headers.get('content-length'))||0;if(total>maxBytes)fail('SIZE');if(!response.body?.getReader)fail('STREAM');reader=response.body.getReader();const chunks=[];let size=0;
  while(true){if(control.signal.aborted)fail(timedOut?'TIMEOUT':'CANCELLED');const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes)fail('SIZE');chunks.push(value);onProgress(size,total);}
  if(control.signal.aborted)fail(timedOut?'TIMEOUT':'CANCELLED');if(!size)fail('EMPTY');const prefix=new Uint8Array(await new Blob(chunks).slice(0,16).arrayBuffer());const type=signature(prefix);if(control.signal.aborted)fail(timedOut?'TIMEOUT':'CANCELLED');if(!type)fail('TYPE');
  const blob=new Blob(chunks,{type});return {blob,name:'linked-video.'+(type==='video/mp4'?'mp4':type==='video/webm'?'webm':'ogv'),source:{kind:'https-video',origin:u.origin,bytes:size,mime:type,credentials:'omitted',redirects:'rejected'}};
 }catch(error){control.abort();if(timedOut)fail('TIMEOUT');if(signal?.aborted)fail('CANCELLED');if(error instanceof MediaImportError)throw error;fail('NETWORK');}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);if(reader){try{await reader.cancel();}catch{}try{reader.releaseLock();}catch{}}}
}
