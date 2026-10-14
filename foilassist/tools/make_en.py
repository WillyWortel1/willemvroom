#!/usr/bin/env python3
"""Maakt foilassist/en/index.html (vaste Engelse URL) uit foilassist/index.html. Na elke wijziging van index.html opnieuw draaien."""
import pathlib
R=pathlib.Path(__file__).resolve().parents[1]
h=(R/"index.html").read_text(encoding="utf-8")
h=h.replace('<meta charset="utf-8">','<meta charset="utf-8">\n<base href="/foilassist/">',1).replace('<html lang="nl">','<html lang="en">',1)
(R/"en").mkdir(exist_ok=True);(R/"en"/"index.html").write_text(h,encoding="utf-8")
