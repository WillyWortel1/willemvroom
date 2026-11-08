import fs from 'node:fs';import assert from 'node:assert/strict';
const {JSDOM}=await import(process.env.JSDOM_MODULE||'jsdom');
const css=fs.readFileSync(new URL('../foilcoach/style.css',import.meta.url),'utf8');
const dom=new JSDOM(`<style>${css}</style>`);const sheet=dom.window.document.querySelector('style').sheet;
assert.ok(sheet.cssRules.length>100,'complete CSS parses');
assert.ok(!/font-family|@font-face|:root\s*\{|body\s*\{|header\s*\{|--bg:|--ink:|--stage:|\.large\b/.test(css),'no duplicate typography, theme, header or legacy studio tokens');
const rules=[...sheet.cssRules].filter(r=>r.selectorText);
for(const selector of ['.stage','.empty','.checkpoint .shot','.file-row','.controls','.roi-tools','.roi-fields','.scrub','.panel','.range','.status','.results','.review-context','.review-tabs','.review-items','.review-plan-controls','.plan-grid','.source-library','.library-group','.help-grid','.wrap footer'])assert.ok(rules.some(r=>r.selectorText.includes(selector)),selector+' has a consolidated component rule');
const stage=rules.find(r=>r.selectorText==='.stage');assert.equal(stage.style.background,'var(--color-bg)');assert.equal(parseFloat(stage.style.border),0);
assert.equal(rules.find(r=>r.selectorText==='.stage video').style.background,'rgb(0, 0, 0)','letterboxing only on actual media');
assert.ok(css.includes('::file-selector-button'));assert.ok(css.includes(':focus-visible'));assert.ok(css.includes('min-height:44px'));assert.ok(css.includes('prefers-reduced-motion'));
for(const lang of ['nl','en']){const file=lang==='nl'?'index.html':'en/index.html';const html=fs.readFileSync(new URL('../foilcoach/'+file,import.meta.url),'utf8');for(const path of ['/styles.css?','/site.css?','/site.js?','/textsize.js?','/foilcoach/style.css'])assert.ok(html.includes(path));assert.ok(!html.includes('<style>'),'no per-locale style drift');}
console.log('Complete shared-site component CSS parses; all component groups covered; no legacy theme/header/font overrides; locale resources identical.');
