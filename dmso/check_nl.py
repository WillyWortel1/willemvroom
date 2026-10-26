#!/usr/bin/env python3
"""Check that NL dosage translations keep every number, unit and symbol of the EN source.
Run: python3 dmso/check_nl.py  -> exits 1 on any mismatch."""
import json, re, sys, pathlib, collections
H = pathlib.Path(__file__).parent
EW = {'one':'1','two':'2','three':'3','four':'4','five':'5','six':'6','seven':'7','eight':'8','nine':'9','ten':'10','once':'1×','twice':'2×','thrice':'3×','half':'½'}
NW = {'één':'1','een':None,'ene':'1','twee':'2','drie':'3','vier':'4','vijf':'5','zes':'6','zeven':'7','acht':'8','negen':'9','tien':'10','eenmaal':'1×','tweemaal':'2×','driemaal':'3×','half':'½','halve':'½'}
EU = {'tsp':'TL','teaspoon':'TL','teaspoons':'TL','tbsp':'EL','tablespoon':'EL','tablespoons':'EL','drop':'DR','drops':'DR','ml':'ml','mg':'mg','cc':'cc','ppm':'ppm','oz':'oz','kg':'kg','g':'g','mcg':'mcg','µg':'mcg','iu':'IE','l':'l'}
NU = {'tl':'TL','theelepel':'TL','theelepels':'TL','el':'EL','eetlepel':'EL','eetlepels':'EL','druppel':'DR','druppels':'DR','ml':'ml','mg':'mg','cc':'cc','ppm':'ppm','oz':'oz','kg':'kg','g':'g','mcg':'mcg','µg':'mcg','ie':'IE','iu':'IE','l':'l'}
SYM = '%×≤≥<>½¼¾⅓₂₃'
NUMW = r'one|two|three|four|five|six|seven|eight|nine|ten'
def toks(s, W, U):
    s = s.replace('e.g.', '')
    s = re.sub(r'\b(%s)\s+times\b' % NUMW, lambda m: W[m.group(1).lower()] + '×', s, flags=re.I)
    s = re.sub(r'\bonce\b(?!\s+(daily|a\b|per\b|or\b|weekly|every|each|monthly|in\b))', '', s, flags=re.I)  # conjunction "once"
    s = re.sub(r'(\d)\s*(sprays?|spray)\b', r'\1×', s, flags=re.I)
    s = re.sub(r'(\d)\s*times\b', r'\1×', s, flags=re.I)          # EN "3 times" -> 3×
    s = re.sub(r'(\d)\s*(keer|maal)\b', r'\1×', s, flags=re.I)      # NL "3 keer" -> 3×
    s = re.sub(r'(\d)x\b', r'\1×', s)
    out = []; prev = False
    for m in re.finditer(r'\d+(?:[.,]\d+)?|[%s]|[A-Za-zÀ-ÿµ]+' % re.escape(SYM), s):
        t = m.group(0); lo = t.lower()
        isnum = False
        if re.match(r'\d', t): out.append(t.replace(',', '.')); isnum = True
        elif t in SYM: out.append(t); isnum = t in '½¼¾⅓'
        elif lo in W and W[lo]: out.extend(list(re.findall(r'\d+|×|½', W[lo]))); isnum = True
        elif lo in U and prev: out.append(U[lo])  # units only count right after a quantity
        prev = isnum
    return collections.Counter(out)
def main():
    lib = json.load(open(H/'src/library.json'))['entries']
    nl = json.load(open(H/'src/dosage_nl.json'))
    bad = 0; n = 0
    for e in lib:
        pr = e['protocol']
        for en in pr['steps'] + [pr['frequency']]:
            n += 1
            if en not in nl: print('MISSING', repr(en)); bad += 1; continue
            a, b = toks(en, EW, EU), toks(nl[en], NW, NU)
            if a != b: bad += 1; print('MISMATCH', e['id'], '\n EN', en, '\n NL', nl[en], '\n only-EN', dict(a-b), 'only-NL', dict(b-a))
    print(f'checked {n} strings, {bad} mismatches'); return bad
if __name__ == '__main__': sys.exit(1 if main() else 0)
