# Complete site-style consolidation

Styling only; no analysis, copy, model, import, privacy or source-library behavior changes.
The old stylesheet is replaced, not followed by another override layer.

Source of truth (unchanged):
- `site.css`: system typography, shared header/theme, 760px composition, homepage
  `#werk` cards (16px radius, 18px padding, hairline border, 1px/2px soft shadow),
  section-title and card-heading weights and sizes.
- `f1/f1.css`: `.sw` selected red pills, `.calb` primary action, restrained metadata,
  chevron details and footer. Recipes only; this stylesheet is NOT imported globally.
- `nieuws/index.html`: `.nw-ls` outline-pill media controls and range styling.
- Existing `/styles.css`, `/site.css`, `/site.js`, `/textsize.js` remain shared.
  No PIN/news/site-global scripts or styles are changed.

Previous leftovers -> replacements:
- Large dark upload studio, arrow emblem, white/teal-toned microcopy -> normal light
  website card with inherited text, native file selector and neutral inset surface.
  Black appears only behind actual loaded video or actual checkpoint images.
- Duplicated font/body/root theme and accumulating competing overrides -> no app
  font-family, root theme, body or header definitions; actual website resources win.
- Studio eyebrow tracking, 10–12px labels, large metric chrome -> shared metadata,
  .875rem labels, .85rem helpers, .95rem card copy, site section/card heading hierarchy.
- Fragmented radii/shadows/padding -> one card recipe and 12/16/18/32px spacing rhythm.
- Mixed button/form treatments -> Nieuws outline controls, F1 primary/selected pills,
  consistent 44px controls and visible keyboard focus across URL/file/select/number/
  checkbox/range/textarea controls.
- Black empty checkpoint tiles -> neutral website tiles with red numbering.
- Compressed playback/ROI controls, two-column review mini-dashboard -> readable
  stacked site cards, wrapping control rows, clear form groups and single-column review.
- Bespoke plans/results/source library chrome -> same cards, typography, chevron
  disclosure rows and restrained footer through the entire page.

Browser acceptance (both NL/EN, empty AND loaded):
1. Compare homepage and app at same zoom/theme/text-size. Check page alignment,
   headings/labels/body, card surface/edges and all control states, not just header.
2. Scroll entire app: source input, empty upload, playback/ROI, settings, all four
   checkpoints, results, six review stages, generated plan, expanded 21-tip library,
   help and footer. Capture before/after top/middle/bottom screenshots.
3. Load local golf technical fixture or CORS flower fixture; verify canvas alignment,
   playback/speed/scrub, checkpoint editing, analysis/cancel, URL errors, replacement
   resets, generated plan/export and unchanged confidence/no-person handling.
4. Inspect dark theme and enlarged shared text size. Check wrapping, keyboard focus
   and narrow viewport if actual resize is available; do not claim 390px without it.

Automated checks are CSS structure/DOM/function tests, not visual browser approval.
