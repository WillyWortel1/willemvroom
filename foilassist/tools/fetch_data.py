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
def get(base, chunk):
    la = ",".join(str(a) for a, _ in chunk); lo = ",".join(str(b) for _, b in chunk)
    for i in range(5):
        try:
            with urllib.request.urlopen(f"{base}&latitude={la}&longitude={lo}", timeout=60) as r:
                d = json.load(r)
                return d if isinstance(d, list) else [d]
        except Exception as e:
            print("retry", i, e); time.sleep(10 * (i + 1))
    raise SystemExit("Open-Meteo niet bereikbaar")
def run(base):
    out = []
    for i in range(0, len(spots), 25):
        out += get(base, spots[i:i + 25]); time.sleep(2)
    for d in out:
        for k in ("generationtime_ms", "elevation", "hourly_units", "minutely_15_units", "timezone_abbreviation"):
            d.pop(k, None)
    return out
data = {"updated": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="minutes"),
        "coords": spots, "marine": run(MARINE), "forecast": run(FORE)}
(ROOT / "data.json").write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")
print("ok", len(spots))
