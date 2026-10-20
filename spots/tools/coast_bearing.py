import json,math
from global_land_mask import globe
sp=json.load(open('/tmp/sp.json'));out={};rows=[]
for n,lat,lon in sp:
    cl=math.cos(math.radians(lat));vx=vy=0;cnt=0;tot=0
    for r in (2,3.5,5):
        for a in range(0,360,10):
            la=lat+r*math.cos(math.radians(a))/111;lo=lon+r*math.sin(math.radians(a))/(111*cl)
            tot+=1
            if not globe.is_land(la,lo):cnt+=1;vx+=math.sin(math.radians(a));vy+=math.cos(math.radians(a))
    if cnt==0:rows.append((n,None));continue
    br=round((math.degrees(math.atan2(vx,vy))+360)%360);frac=cnt/tot;conc=math.hypot(vx,vy)/cnt
    ok=0.25<=frac<=0.7 and conc>=0.45
    out[n]=[br,ok];rows.append((n,br,ok,round(frac,2),round(conc,2)))
for r in rows:print(r)
js='// Zeewaartse richting van de kust per spot (graden: waar de zee ligt), afgeleid uit een land/zee-masker (GLOBE 1 km, pakket global-land-mask): richting van het zeegedeelte binnen 2–5 km.\n// [richting, zeker]; zeker=false (baai, eiland, landtong, lagune of onduidelijke kust) → Spots valt terug op wind- t.o.v. golfrichting. Alleen voor /spots; /foilassist gebruikt dit niet.\nwindow.COAST='+json.dumps(out,ensure_ascii=False)+';\n'
open('/workspace/willemvroom/spots/coast.js','w').write(js)
print('sure',sum(v[1] for v in out.values()),'of',len(sp))
