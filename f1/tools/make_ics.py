#!/usr/bin/env python3
"""Generate F1 iCalendar feeds (season + per race) from Jolpica-F1, fallback to local JSON."""
import json, os, urllib.request
from datetime import datetime, timedelta, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
F1 = os.path.dirname(HERE)
DUR = {'FirstPractice': 60, 'SecondPractice': 60, 'ThirdPractice': 60, 'SprintQualifying': 44, 'Sprint': 60, 'Qualifying': 60, 'Race': 120}
NAME = {'FirstPractice': 'FP1', 'SecondPractice': 'FP2', 'ThirdPractice': 'FP3', 'SprintQualifying': 'Sprint Qualifying', 'Sprint': 'Sprint', 'Qualifying': 'Qualifying', 'Race': 'Race'}
UIDK = {'FirstPractice': 'fp1', 'SecondPractice': 'fp2', 'ThirdPractice': 'fp3', 'SprintQualifying': 'sq', 'Sprint': 'sprint', 'Qualifying': 'quali', 'Race': 'race'}
ORDER = ['FirstPractice', 'SecondPractice', 'ThirdPractice', 'SprintQualifying', 'Sprint', 'Qualifying', 'Race']
ALARM = {'Qualifying', 'Sprint', 'Race'}
STAMP = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')


def esc(s):
    return s.replace('\\', '\\\\').replace(';', '\\;').replace(',', '\\,').replace('\n', '\\n')


def fold(line):
    b = line.encode('utf-8')
    out, cur = [], b''
    for ch in line:
        e = ch.encode('utf-8')
        lim = 75 if not out else 74
        if len(cur) + len(e) > lim:
            out.append(cur)
            cur = b''
        cur += e
    out.append(cur)
    return b'\r\n '.join(out).decode('utf-8')


def cal(name, events):
    L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//willemvroom.nl//F1 kalender//NL', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
         'X-WR-CALNAME:' + esc(name), 'X-WR-TIMEZONE:UTC', 'REFRESH-INTERVAL;VALUE=DURATION:P1D', 'X-PUBLISHED-TTL:P1D']
    for e in events:
        L += e
    L.append('END:VCALENDAR')
    return ''.join(fold(x) + '\r\n' for x in L)


def gp(r):
    return r['raceName'].replace('Grand Prix', 'GP')


def loc(c):
    l = c['Location']
    return [ 'LOCATION:' + esc(f"{c['circuitName']}, {l['locality']}, {l['country']}"), f"GEO:{float(l['lat']):.4f};{float(l['long']):.4f}"]


def timed(r):
    ev = []
    for k in ORDER:
        s = r if k == 'Race' else r.get(k)
        if not s or 'time' not in s:
            continue
        st = datetime.strptime(s['date'] + 'T' + s['time'].rstrip('Z'), '%Y-%m-%dT%H:%M:%S')
        en = st + timedelta(minutes=DUR[k])
        e = ['BEGIN:VEVENT', f"UID:{r['season']}-r{int(r['round']):02d}-{UIDK[k]}@willemvroom.nl", 'DTSTAMP:' + STAMP,
             'DTSTART:' + st.strftime('%Y%m%dT%H%M%SZ'), 'DTEND:' + en.strftime('%Y%m%dT%H%M%SZ'),
             'SUMMARY:' + esc(f"🏁 F1 {NAME[k]} – {gp(r)}"), *loc(r['Circuit']),
             'DESCRIPTION:' + esc(f"Ronde {r['round']} – {r['raceName']}. Bron: Jolpica-F1. https://willemvroom.nl/f1/"), 'URL:https://willemvroom.nl/f1/']
        if k in ALARM:
            e += ['BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(f"F1 {NAME[k]} – {gp(r)}"), 'TRIGGER:-PT15M', 'END:VALARM']
        ev.append(e + ['END:VEVENT'])
    return ev


def allday(uid, start, end_incl, summary, desc, circ=None):
    s = datetime.strptime(start, '%Y-%m-%d')
    e = datetime.strptime(end_incl, '%Y-%m-%d') + timedelta(days=1)
    v = ['BEGIN:VEVENT', f'UID:{uid}@willemvroom.nl', 'DTSTAMP:' + STAMP, 'DTSTART;VALUE=DATE:' + s.strftime('%Y%m%d'),
         'DTEND;VALUE=DATE:' + e.strftime('%Y%m%d'), 'SUMMARY:' + esc(summary)] + (loc(circ) if circ else []) + \
        ['DESCRIPTION:' + esc(desc), 'TRANSP:TRANSPARENT', 'URL:https://willemvroom.nl/f1/?s=2027', 'END:VEVENT']
    return [v]


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'willemvroom-f1-ics'})
    return json.load(urllib.request.urlopen(req, timeout=30))['MRData']['RaceTable']['Races']


def write(path, text):
    tmp = path + '.tmp'
    with open(tmp, 'w', encoding='utf-8', newline='') as f:
        f.write(text)
    os.replace(tmp, path)


def main():
    os.makedirs(os.path.join(F1, 'ics'), exist_ok=True)
    counts = {}
    for year, fb in (('2025', '2025.json'), ('2026', 'fallback.json')):
        try:
            races = fetch(f'https://api.jolpi.ca/ergast/f1/{year}.json?limit=100')
            assert races
        except Exception:
            with open(os.path.join(F1, fb), encoding='utf-8') as f:
                races = json.load(f)['MRData']['RaceTable']['Races']
        allev = []
        for r in races:
            ev = timed(r)
            allev += ev
            write(os.path.join(F1, 'ics', f"{year}-r{int(r['round']):02d}.ics"), cal(f"F1 {year} – {gp(r)}", ev))
        write(os.path.join(F1, f'f1-{year}.ics'), cal(f'F1 {year}', allev))
        counts[year] = len(allev)

    with open(os.path.join(F1, '2027.json'), encoding='utf-8') as f:
        r27 = json.load(f)['MRData']['RaceTable']['Races']
    D = 'Voorlopig, tijden volgen. Provisional, times to follow. Bron/source: formula1.com / FIA (16-09-2026).'
    test = []
    bah = next(r['Circuit'] for r in r27 if r['Circuit']['circuitId'] == 'bahrain')
    for i, d in enumerate(['2027-02-24', '2027-02-25', '2027-02-26', '2027-02-27'], 1):
        test += allday(f'2027-test-d{i}', d, d, f'🏁 F1 Wintertest dag {i} / Pre-season testing day {i}', D, bah)
    write(os.path.join(F1, 'ics', '2027-test.ics'), cal('F1 2027 – Wintertest', test))
    all27 = list(test)
    for r in r27:
        ev = allday(f"2027-r{int(r['round']):02d}-weekend", r['start'], r['date'], f"🏁 F1 {gp(r)}" + (' (Sprint)' if r.get('sprint') else ''), D, r['Circuit'])
        all27 += ev
        write(os.path.join(F1, 'ics', f"2027-r{int(r['round']):02d}.ics"), cal(f"F1 2027 – {gp(r)}", ev))
    write(os.path.join(F1, 'f1-2027.ics'), cal('F1 2027', all27))
    print(counts, '| 2027 events', len(all27))


if __name__ == '__main__':
    main()
