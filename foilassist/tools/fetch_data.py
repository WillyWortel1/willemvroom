#!/usr/bin/env python3
"""Haalt Open-Meteo data op voor alle actieve spots en schrijft foilassist/data.json.
Draait elk uur via GitHub Actions, zodat bezoekers Open-Meteo niet zelf belasten."""
import json, re, time, urllib.request, pathlib, datetime
ROOT = pathlib.Path(__file__).resolve().parents[1]
src = (ROOT / "spots.js").read_text(encoding="utf-8")
spots = []
for m in re.finditer(r"\blat:\s*(-?[\d.]+),\s*lon:\s*(-?[\d.]+),\s*actief:\s*(true|false)", src):
    if m.group(3) == "true":
        spots.append((float(m.group(1)), float(m.group(2))))
MARINE = "https://marine-api.open-meteo.com/v1/marine?hourly=wave_height,wave_period,wave_direction,ocean_current_velocity,ocean_current_direction,sea_surface_temperature&minutely_15=sea_level_height_msl&forecast_days=5&timezone=auto"
FORE = "https://api.open-meteo.com/v1/forecast?hourly=temperature_2m,precipitation,weather_code,is_day,wind_speed_10m,wind_gusts_10m,wind_direction_10m&wind_speed_unit=kn&forecast_days=5&timezone=auto"
try:  # vorige data als vangnet als een blok spots blijft falen
    OLD = json.loads((ROOT / "data.json").read_text(encoding="utf-8"))
except Exception:
    OLD = {}
OLDIDX = {tuple(c): i for i, c in enumerate(OLD.get("coords", []))}
failed = 0
def get(base, chunk, label):
    la = ",".join(str(a) for a, _ in chunk); lo = ",".join(str(b) for _, b in chunk)
    for i in range(4):
        try:
            with urllib.request.urlopen(f"{base}&latitude={la}&longitude={lo}", timeout=45) as r:
                d = json.loads(r.read())
                d = d if isinstance(d, list) else [d]
                if len(d) == len(chunk):
                    return d
                raise ValueError(f"{len(d)} resultaten voor {len(chunk)} spots")
        except Exception as e:
            print(label, "retry", i, e); time.sleep(5 * 2 ** i)  # 5, 10, 20, 40 s
    return None
def run(base, key):
    global failed
    out = []
    for i in range(0, len(spots), 25):
        chunk = spots[i:i + 25]
        d = get(base, chunk, f"{key}[{i}:{i + len(chunk)}]")
        if d is None:  # val terug op vorige data voor deze spots
            prev = OLD.get(key, [])
            d = [prev[OLDIDX[c]] for c in chunk if c in OLDIDX and OLDIDX[c] < len(prev)]
            if len(d) != len(chunk):
                raise SystemExit(f"Open-Meteo niet bereikbaar ({key}[{i}]) en geen vorige data")
            print(f"::warning::{key}[{i}:{i + len(chunk)}] mislukt, vorige data hergebruikt")
            failed += 1
        out += d; time.sleep(2)
    for d in out:
        for k in ("generationtime_ms", "elevation", "hourly_units", "minutely_15_units", "timezone_abbreviation"):
            d.pop(k, None)
    return out
data = {"updated": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="minutes"),
        "coords": spots, "marine": run(MARINE, "marine"), "forecast": run(FORE, "forecast")}
(ROOT / "data.json").write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")
print("ok", len(spots), "blokken met oude data:", failed)
