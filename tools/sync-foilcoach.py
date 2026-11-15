#!/usr/bin/env python3
"""Generate English HTML on the same .nl site; all behavioral assets stay shared."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=root/'foilcoach/index.html'
target=root/'foilcoach/en/index.html'
s=source.read_text().replace('lang="nl"','lang="en"',1).replace('Prone foil — Videoanalyse','Prone foil — Video analysis').replace('Analyseer je eigen foilvideo. Lokale houdingsherkenning, vier meetmomenten en een heldere 2D-vergelijking.','Explore your own prone-foil footage. Private on-device pose tracking, four checkpoints and clear 2D observations.').replace('rel="canonical" href="https://willemvroom.nl/foilcoach/"','rel="canonical" href="https://willemvroom.nl/foilcoach/en/"').replace('href="/foilcoach/en/" lang="en">EN','href="/foilcoach/" lang="nl">NL')
s=s.replace('data-current-language>NL','data-current-language>EN').replace('aria-label="Thema wisselen"','aria-label="Change theme"').replace('aria-label="Tekstgrootte"','aria-label="Text size"').replace('aria-label="Kleinere tekst"','aria-label="Smaller text"').replace('aria-label="Grotere tekst"','aria-label="Larger text"')
target.parent.mkdir(exist_ok=True)
target.write_text(s)
print(target)
# Pre-fill the initial UI text in both locales (prevents layout shift on load).
import subprocess
subprocess.run(['node',str(root/'tools/prerender-foilcoach.mjs')],check=True)
