#!/usr/bin/env python3
"""Merge X search_posts_all result files into elon/data.json (dedupe by post id).
usage: python3 elon/tools/update.py FILE [FILE ...]
Each FILE is a raw search_posts_all response (expansions=author_id); trailing tool text is ignored."""
import json, sys, os, re, datetime as dt
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data.json')
ORIGIN = '2114798781778862589'
PHRASE = re.compile(r'investigate\s+elon', re.I)
def load(p):
    s = open(p).read(); return json.loads(s[s.index('{'):s.rindex('}') + 1])
data = json.load(open(D)) if os.path.exists(D) else {"posts": {}}
added = 0
for f in sys.argv[1:]:
    d = load(f)
    users = {u['id']: u for u in d.get('includes', {}).get('users', [])}
    for p in d.get('data', []):
        if p.get('text', '').startswith('RT @') or not PHRASE.search(p.get('text', '')):
            continue
        u = users.get(p.get('author_id'), {})
        m = p.get('public_metrics', {})
        rec = {"t": p['created_at'], "text": p['text'][:280], "user": u.get('username', '?'), "name": u.get('name', ''),
               "verified": bool(u.get('verified')), "vtype": u.get('verified_type', ''),
               "followers": u.get('public_metrics', {}).get('followers_count', 0),
               "views": m.get('impression_count', 0), "likes": m.get('like_count', 0)}
        if p['id'] not in data['posts']: added += 1
        data['posts'][p['id']] = rec
posts = data['posts']
data['origin'] = ORIGIN
data['total'] = len(posts)
data['accounts'] = len({v['user'] for v in posts.values()})
data['newest_id'] = max(posts, key=int) if posts else None
data['updated'] = dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
json.dump(data, open(D, 'w'), indent=0, sort_keys=True, ensure_ascii=False)
print(f"ok +{added} total={data['total']} accounts={data['accounts']} newest_id={data['newest_id']}")
