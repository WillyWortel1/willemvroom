#!/usr/bin/env python3
"""Rebuild + encrypt the DMSO site. Plaintext lives OUTSIDE the repo in /workspace/dmso-plain
(pages, src/*.json, data.js, disclaimer.js, build.py, check_nl.py). Edit there, then run:
    python3 /workspace/f1-work/dmso/tools/publish.py      (PIN from env HQ_PIN, same as /hq)
Steps: build.py -> data.js, check_nl.py (exit on mismatch), then every page body (incl. data.js
and disclaimer.js inlined) is AES-256-GCM encrypted (PBKDF2-SHA256 600k) into a lock shell page."""
import os, sys, re, json, base64, subprocess, pathlib, html
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
PLAIN = pathlib.Path(os.environ.get('DMSO_PLAIN', '/workspace/dmso-plain'))
OUT = pathlib.Path(__file__).resolve().parent.parent
pin = os.environ.get('HQ_PIN') or sys.exit('HQ_PIN not set')
for s in ('build.py', 'check_nl.py'):
    subprocess.run([sys.executable, str(PLAIN/s)], check=True)
IT = 600000; SALT_F = PLAIN/'.salt'
if not SALT_F.exists(): SALT_F.write_bytes(os.urandom(16))
salt = SALT_F.read_bytes()
key = AESGCM(PBKDF2HMAC(hashes.SHA256(), 32, salt, IT).derive(pin.encode()))
b = lambda x: base64.b64encode(x).decode()
INLINE = {'data.js', 'disclaimer.js'}
def enc(obj):
    iv = os.urandom(12)
    return json.dumps({'v': 1, 'iter': IT, 'salt': b(salt), 'iv': b(iv),
                       'ct': b(key.encrypt(iv, json.dumps(obj, ensure_ascii=False).encode(), None))})
ver = None; n = 0
for f in sorted(PLAIN.rglob('index.html')):
    rel = f.relative_to(PLAIN); src = f.read_text()
    head, rest = src.split('<body', 1)
    battr, body = rest.split('>', 1); body = body.rsplit('</body>', 1)[0]
    title = re.search(r'<title>(.*?)</title>', head, re.S).group(1)
    head = head.replace(f'<title>{title}</title>', '<title>DMSO</title>')
    head = re.sub(r'<meta name="?description"?[^>]*>', '', head)
    scripts = []
    def grab(m):
        attrs, code = m.group(1), m.group(2)
        sm = re.search(r'src="?([^" >]+)', attrs)
        if sm:
            name = sm.group(1).split('?')[0].rsplit('/', 1)[-1]
            scripts.append({'c': (PLAIN/name).read_text()} if name in INLINE else {'s': sm.group(1)})
        else: scripts.append({'c': code})
        return ''
    body = re.sub(r'<script([^>]*)>(.*?)</script>', grab, body, flags=re.S)
    v = re.search(r'\?v=([\w-]+)', src); ver = v.group(1) if v else ver
    payload = enc({'t': html.unescape(title), 'h': body, 's': scripts})
    shell = (f'{head}<body{battr}>\n<script type="application/json" id="dmenc">{payload}</script>\n'
             f'<script src="/dmso/lock.js?v={ver}"></script>\n</body></html>\n')
    o = OUT/rel; o.parent.mkdir(parents=True, exist_ok=True); o.write_text(shell); n += 1
for name in ('app.js', 'dmso.css', 'wat.css'):
    (OUT/name).write_bytes((PLAIN/name).read_bytes())
for leak in ('data.js', 'disclaimer.js', 'build.py', 'check_nl.py'):
    (OUT/leak).unlink(missing_ok=True)
subprocess.run(['rm', '-rf', str(OUT/'src')])
print(f'encrypted {n} pages -> {OUT}')
