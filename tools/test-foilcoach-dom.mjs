const {JSDOM}=await import(process.env.JSDOM_MODULE||'jsdom');
const appBase=new URL('../foilcoach/',import.meta.url);
import fs from 'node:fs';import assert from 'node:assert/strict';
const {mountReview}=await import(new URL('review-ui.mjs',appBase));
const {mountLibrary,libraryGroups}=await import(new URL('library.mjs',appBase));
for(const lang of ['nl','en']){
 const dom=new JSDOM('<div id="r"></div><div id="l"></div>',{url:'http://localhost/'});global.document=dom.window.document;global.Option=dom.window.Option;
 const review=mountReview(document.querySelector('#r'),lang,()=>{},()=>[{t:1.25}]);mountLibrary(document.querySelector('#l'),lang);
 assert.equal(document.querySelectorAll('.review-tabs button').length,6);assert.equal(document.querySelectorAll('#l .library-group').length,6);
 document.querySelectorAll('.review-tabs button')[2].click();const pressure=document.querySelector('#review-pressure');pressure.value='focus';pressure.dispatchEvent(new dom.window.Event('change'));const evidence=pressure.parentElement.querySelectorAll('select')[1];evidence.value='0';evidence.dispatchEvent(new dom.window.Event('change'));document.querySelector('#r>button.primary').click();assert.ok(document.querySelector('.plan-focus'));assert.ok(document.querySelector('.plan-focus').textContent.includes('1.25'));
 assert.equal(review.state().priority,'pressure');assert.equal(review.state().generatedPlan.focus.id,'pressure');assert.equal(review.state().generatedPlan.linkedEvidence.timeSeconds,1.25);assert.ok(review.state().generatedPlan.renderedText.length>100);assert.equal(review.state().generatedPlan.provenance.automaticTechniqueVerdict,false);review.reset();assert.deepEqual(review.state().answers,{});assert.equal(document.querySelector('.plan-focus'),null);assert.equal(review.state().generatedPlan,null);
 console.log(lang,'guided review / evidence / plan / reset and library DOM passed');
}
for(const lang of ['nl','en']){
 const page=lang==='en'&&fs.existsSync(new URL('en/index.html',appBase))?'en/index.html':'index.html';const html=fs.readFileSync(new URL(page,appBase),'utf8').replace('lang="nl"',`lang="${lang}"`);const dom=new JSDOM(html,{url:'http://localhost/foilcoach/'});
 global.document=dom.window.document;global.window=dom.window;global.Option=dom.window.Option;global.Image=dom.window.Image;global.requestAnimationFrame=()=>0;global.ResizeObserver=class{observe(){}};
 await import(new URL(`app.mjs?domtest=${lang}`,appBase));
 assert.equal(document.querySelector('h1').textContent,'Prone foil');assert.ok(document.querySelector('#selectRider').textContent);assert.equal(document.querySelectorAll('#roiFields input').length,4);assert.equal(document.querySelectorAll('.checkpoint').length,4);assert.equal(document.querySelector('#analyse').disabled,true);assert.equal(document.querySelectorAll('#discipline option').length,1);
 document.querySelectorAll('.review-tabs button')[2].click();const pressure=document.querySelector('#review-pressure');pressure.value='focus';pressure.dispatchEvent(new dom.window.Event('change',{bubbles:true}));document.querySelector('#review>button.primary').click();assert.equal(document.querySelector('#export').disabled,false);let exportedBlob;global.URL.createObjectURL=blob=>{exportedBlob=blob;return 'blob:test';};global.URL.revokeObjectURL=()=>{};dom.window.HTMLAnchorElement.prototype.click=()=>{};document.querySelector('#export').click();const data=JSON.parse(await exportedBlob.text());assert.equal(data.generatedPlan.focus.id,'pressure');assert.ok(data.generatedPlan.renderedText.length>100);assert.equal(data.method,'manual visual review only; no pose measurement available');assert.equal(data.generatedPlan.provenance.automaticTechniqueVerdict,false);console.log(lang,'actual entrypoint and manual-only generated-plan JSON export passed');
}
console.log('Reference tips:',libraryGroups.flatMap(g=>g[2]).length);
