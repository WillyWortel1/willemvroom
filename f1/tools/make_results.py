#!/usr/bin/env python3
"""Static race results per completed round: f1/results/{season}-rNN.json (from Jolpica-F1)."""
import json, os, sys, time, urllib.request
F1 = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(F1, 'results')


def races(season):
    out, off = [], 0
    while True:
        for i in range(4):
            try:
                u = f'https://api.jolpi.ca/ergast/f1/{season}/results.json?limit=100&offset={off}'
                m = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'willemvroom-f1'}), timeout=30))['MRData']
                break
            except Exception:
                if i == 3:
                    raise
                time.sleep(5 * (i + 1))
        for r in m['RaceTable']['Races']:
            if out and out[-1]['round'] == r['round']:
                out[-1]['Results'] += r['Results']
            else:
                out.append(r)
        off += int(m['limit'])
        if off >= int(m['total']):
            return out
        time.sleep(0.6)


def main(seasons):
    os.makedirs(OUT, exist_ok=True)
    for s in seasons:
        for r in races(s):
            res = r['Results']
            fl = next((x for x in res if x.get('FastestLap', {}).get('rank') == '1'), None)
            o = {'season': s, 'round': int(r['round']), 'race': r['raceName'],
                 'r': [[x['positionText'], x['Driver']['givenName'] + ' ' + x['Driver']['familyName'], x['Constructor']['name'],
                        x.get('Time', {}).get('time') or x['status'], x['points']] for x in res],
                 'fl': [fl['Driver']['givenName'] + ' ' + fl['Driver']['familyName'], fl['FastestLap']['Time']['time'], fl['FastestLap']['lap']] if fl else None}
            p = os.path.join(OUT, f"{s}-r{int(r['round']):02d}.json")
            new = json.dumps(o, ensure_ascii=False, separators=(',', ':'))
            if os.path.exists(p) and open(p, encoding='utf-8').read() == new:
                continue
            with open(p + '.tmp', 'w', encoding='utf-8') as f:
                f.write(new)
            os.replace(p + '.tmp', p)
            print(s, r['round'], len(res), flush=True)


if __name__ == '__main__':
    main(sys.argv[1:] or ['2026'])
