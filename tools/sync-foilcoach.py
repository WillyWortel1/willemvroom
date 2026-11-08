#!/usr/bin/env python3
"""Render the English site from the same Foilcoach core; no build dependencies."""
from pathlib import Path
import shutil,sys
source=Path(__file__).resolve().parents[1]/'foilcoach'
target=Path(sys.argv[1]).resolve()/'foilcoach'
if source==target: raise SystemExit('Choose the English-site repository as target')
shutil.copytree(source,target,dirs_exist_ok=True)
p=target/'index.html'
s=p.read_text().replace('lang="nl"','lang="en"',1).replace('Prone foil — Videoanalyse','Prone foil — Video analysis').replace('Analyseer je eigen foilvideo. Lokale houdingsherkenning, vier meetmomenten en een heldere 2D-vergelijking.','Explore your own prone-foil footage. Private on-device pose tracking, four checkpoints and clear 2D observations.').replace('https://willemvroom.com/foilcoach/" lang="en">EN ↗','https://willemvroom.nl/foilcoach/" lang="nl">NL ↗').replace('>willemvroom.nl</a>','>willemvroom.com</a>')
p.write_text(s)
print(target)
