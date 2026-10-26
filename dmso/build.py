#!/usr/bin/env python3
"""Generate dmso/data.js from src/library.json (Essential DMSO Protocol Library export)
and src/summaries.json (own NL/EN summaries + Dutch titles). Run: python3 dmso/build.py
Dosage text is copied verbatim from the source (steps + frequency); never edited or estimated."""
import json, re, pathlib
H = pathlib.Path(__file__).parent
lib = json.load(open(H/'src/library.json'))['entries']
S = json.load(open(H/'src/summaries.json'))
DOSE = re.compile(r'\d\s*(%|ml|mL|drops?|mg|g\b|cc|teaspoons?|tsp|tablespoons?|×|x/|times)|\b(teaspoon|tablespoon|drop|once|twice|daily|nightly|weekly)\b', re.I)
out, n = [], 0
for e, s in zip(lib, S['p']):
    assert e['title'] == s['t'], e['title']
    pr = e['protocol']; steps = pr.get('steps', []); fr = pr.get('frequency', '')
    has = any(DOSE.search(x) for x in steps) or (fr and fr != 'As directed / as tolerated')
    p = {k: s[k] for k in ('t', 'tn', 'c', 'en', 'nl') if k in s}
    if has:
        p['d'] = steps; p['fr'] = fr; n += 1
    out.append(p)
(H/'data.js').write_text('window.DM=' + json.dumps({'cats': S['cats'], 'p': out}, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(f'{len(out)} protocols, {n} with dosage, {len(out)-n} without')
