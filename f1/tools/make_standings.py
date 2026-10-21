#!/usr/bin/env python3
"""Static fallback standings per completed round: f1/standings/{season}-rNN.json (from Jolpica-F1)."""
import json, os, sys, time, urllib.request
F1 = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(F1, 'standings')


def get(u):
    for i in range(4):
        try:
            r = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'willemvroom-f1'}), timeout=30)
            return json.load(r)['MRData']['StandingsTable']['StandingsLists']
        except Exception as e:
            if i == 3:
                raise
            time.sleep(5 * (i + 1))


def done_rounds(season):
    r = urllib.request.urlopen(urllib.request.Request(f'https://api.jolpi.ca/ergast/f1/{season}/results/1.json?limit=100', headers={'User-Agent': 'willemvroom-f1'}), timeout=30)
    return [int(x['round']) for x in json.load(r)['MRData']['RaceTable']['Races']]


def main(seasons):
    os.makedirs(OUT, exist_ok=True)
    for s in seasons:
        for rnd in done_rounds(s):
            p = os.path.join(OUT, f'{s}-r{rnd:02d}.json')
            if os.path.exists(p):
                continue
            d = get(f'https://api.jolpi.ca/ergast/f1/{s}/{rnd}/driverStandings.json?limit=100'); time.sleep(0.6)
            c = get(f'https://api.jolpi.ca/ergast/f1/{s}/{rnd}/constructorStandings.json?limit=100'); time.sleep(0.6)
            if not d or not c:
                continue
            o = {'season': s, 'round': rnd,
                 'd': [[x.get('positionText', x.get('position')), x['Driver']['givenName'] + ' ' + x['Driver']['familyName'], (x.get('Constructors') or [{}])[-1].get('name', ''), x['points']] for x in d[0]['DriverStandings']],
                 'c': [[x.get('positionText', x.get('position')), x['Constructor']['name'], x['points']] for x in c[0]['ConstructorStandings']]}
            tmp = p + '.tmp'
            with open(tmp, 'w', encoding='utf-8') as f:
                json.dump(o, f, ensure_ascii=False, separators=(',', ':'))
            os.replace(tmp, p)
            print(s, rnd, len(o['d']), len(o['c']), flush=True)


if __name__ == '__main__':
    main(sys.argv[1:] or ['2025', '2026'])
