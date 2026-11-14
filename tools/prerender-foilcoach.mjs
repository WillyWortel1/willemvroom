#!/usr/bin/env node
// Writes the initial UI text (data-copy / data-youtube / data-import) into both
// Prone foil HTML files, so the first paint already has its final size and
// app.mjs no longer pushes content down while it starts (layout shift / CLS).
// app.mjs still sets the same text at runtime; this only pre-fills it.
// Idempotent. Run after tools/sync-foilcoach.py (which calls it automatically).
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {copy} from '../foilcoach/copy.mjs';import {youtubeCopy} from '../foilcoach/youtube-copy.mjs';import {importCopy} from '../foilcoach/import-copy.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
for(const file of ['foilcoach/index.html','foilcoach/en/index.html']){
 const p=path.join(root,file);let html=fs.readFileSync(p,'utf8');
 const lang=/<html lang="nl"/.test(html)?'nl':'en';
 const tables={copy:{...copy[lang],privacy:importCopy[lang].privacy},youtube:youtubeCopy[lang],import:importCopy[lang]};
 let n=0;
 html=html.replace(/(<([a-z0-9]+)\b[^>]*\bdata-(copy|youtube|import)="([A-Za-z0-9_]+)"[^>]*>)[^<]*(<\/\2>)/g,(m,open,tag,kind,key,close)=>{
  const v=tables[kind][key];if(typeof v!=='string')return m;n++;return open+esc(v)+close;});
 fs.writeFileSync(p,html);console.log(file,lang,n,'text slots pre-filled');
}
