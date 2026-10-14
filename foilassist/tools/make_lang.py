#!/usr/bin/env python3
"""Maakt de vaste taal-URL's foilassist/en/ en foilassist/de/ uit foilassist/index.html.
Na elke wijziging van index.html opnieuw draaien."""
import pathlib
R=pathlib.Path(__file__).resolve().parents[1]
src=(R/"index.html").read_text(encoding="utf-8")
for l in ("en","de"):
    h=src.replace('<meta charset="utf-8">','<meta charset="utf-8">\n<base href="/foilassist/">',1).replace('<html lang="nl">',f'<html lang="{l}">',1)
    (R/l).mkdir(exist_ok=True);(R/l/"index.html").write_text(h,encoding="utf-8")
