#!/usr/bin/env python3
"""Build /workspace/x-data/data.json from a read_range dump (tabs Log, Mediaan, Kalender) + follower count.
usage: build.py SHEET_JSON FOLLOWERS [DATA_JSON]"""
import sys,json,csv,io,re,datetime as dt,statistics as st,zoneinfo
sheet,fol=sys.argv[1],int(sys.argv[2]);out=sys.argv[3] if len(sys.argv)>3 else "/workspace/x-data/data.json"
tz=zoneinfo.ZoneInfo("Europe/Amsterdam");now=dt.datetime.now(tz);today=now.date()
R={r["sheet"]:list(csv.DictReader(io.StringIO(r["content"]))) for r in json.load(open(sheet))["ranges"]}
def num(x):
  try:return float(str(x).replace(",","."))
  except:return 0.0
log=[r for r in R["Log"] if r.get("datum")]
posts=[{"datum":r["datum"],"type":r["type"],"onderwerp":r["onderwerp"],"url":r["url"],"views":int(num(r["weergaven"])),"likes":int(num(r["likes"])),"reacties":int(num(r["reacties"])),"reposts":int(num(r["reposts"])),"score":round(num(r["score_vs_mediaan"]),2)} for r in log]
ss=sorted(posts,key=lambda p:-p["score"])
M={r["meting"]:r for r in R["Mediaan"]}
weeks={}
for p in posts:
  y,w,_=dt.date.fromisoformat(p["datum"][:10]).isocalendar();weeks.setdefault(f"{y}-W{w:02d}",[]).append(p)
trend=[{"week":k,"n":len(v),"score_avg":round(st.mean(p["score"] for p in v),2),"views_med":st.median(p["views"] for p in v)} for k,v in sorted(weeks.items())]
MON={m:i+1 for i,m in enumerate("jan feb mrt apr mei jun jul aug sep okt nov dec".split())}
def pdates(s):
  y=re.search(r"20\d\d",s);ds=re.findall(r"(\d{1,2})\s*(jan|feb|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec)?",s.split("20")[0] if y else s)
  ms=re.findall(r"\b(jan|feb|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec)\b",s)
  if not y or not ds or not ms: return None,None
  y=int(y.group());d=[(int(a),b) for a,b in ds if a]
  first=d[0];m1=MON[first[1] or ms[0]];start=dt.date(y,m1,first[0])
  last=d[-1];end=dt.date(y,MON[last[1] or ms[-1]],last[0]) if len(d)>1 else start
  return start,end
cal=[]
for r in R["Kalender"]:
  s,e=pdates(r["datum"])
  if s and s<=today+dt.timedelta(days=7) and e>=today: cal.append({"datum":r["datum"],"onderwerp":r["onderwerp"],"waarom":r["waarom relevant"],"bron":r["bron (URL)"]})
lk=[p["likes"] for p in posts];byday={}
for p in posts: byday[p["datum"][:10]]=byday.get(p["datum"][:10],0)+p["likes"]
wk=[{"week":t["week"],"likes":sum(p["likes"] for p in weeks[t["week"]]),"avg":round(st.mean(p["likes"] for p in weeks[t["week"]]),2)} for t in trend]
try: old=json.load(open(out))
except: old={}
hist={h["d"]:h["n"] for h in old.get("followers",{}).get("history",[{"d":"2026-10-26","n":245}])}
hist[today.isoformat()]=fol
lh={h["d"]:h for h in old.get("likes",{}).get("history",[])}
lh[today.isoformat()]={"d":today.isoformat(),"total":sum(lk),"posts":len(lk)}
likes={"total":sum(lk),"avg":round(st.mean(lk),2) if lk else 0,"median":st.median(lk) if lk else 0,"with_likes":sum(1 for x in lk if x>0),"posts":len(lk),
 "avg_vs_median_views":round(sum(lk)/max(1,sum(p["views"] for p in posts))*1000,2),"top":sorted(posts,key=lambda p:-p["likes"])[:3],
 "byday":[{"d":k,"likes":v} for k,v in sorted(byday.items())],"byweek":wk,"history":[lh[k] for k in sorted(lh)]}
data={"updated":now.isoformat(timespec="minutes"),
 "followers":{"current":fol,"baseline":{"d":"2026-10-26","n":245},"goal":{"d":"2026-12-31","n":300},"history":[{"d":k,"n":v} for k,v in sorted(hist.items())]},
 "score":{"formula":M.get("scoreformule",{}).get("waarde",""),"note":M.get("scoreformule",{}).get("toelichting",""),"median_basis":num(M.get("mediaan score-basis (rijen >0)",{}).get("waarde")),"median_views":num(M.get("mediaan weergaven",{}).get("waarde")),"peildatum":M.get("peildatum",{}).get("waarde",""),"rows":len(posts),"top":ss[:5],"flop":[p for p in sorted(posts,key=lambda p:(p["score"],-p["views"]))][:5],"weeks":trend},
 "likes":likes,
 "tasks":[{"t":"08:30","nl":"Ochtendbriefing"},{"t":"19:00","nl":"Avondreacties"},{"t":"","nl":"Eén hoofdpost (reageer binnen de eerste 2 uur)"},{"t":"22:00","nl":"Postlog"},{"t":"ma","nl":"Volgerscheck (maandag)"}],
 "calendar":cal}
json.dump(data,open(out,"w"),ensure_ascii=False,indent=1);print("built",out,"followers",fol,"rows",len(posts),"cal",len(cal))
