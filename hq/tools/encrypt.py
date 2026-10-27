#!/usr/bin/env python3
"""Encrypt HQ data: python3 encrypt.py [plain.json|-] [out.enc.json]. PIN from env HQ_PIN."""
import os,sys,json,base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
pin=os.environ.get("HQ_PIN")
if not pin: sys.exit("HQ_PIN not set")
src=sys.argv[1] if len(sys.argv)>1 else "/workspace/hq-data/data.json"
out=sys.argv[2] if len(sys.argv)>2 else os.path.join(os.path.dirname(__file__),"..","data.enc.json")
raw=sys.stdin.buffer.read() if src=="-" else open(src,"rb").read()
json.loads(raw)
salt,iv=os.urandom(16),os.urandom(12);it=600000
key=PBKDF2HMAC(hashes.SHA256(),32,salt,it).derive(pin.encode())
ct=AESGCM(key).encrypt(iv,raw,None)
b=lambda x:base64.b64encode(x).decode()
json.dump({"v":1,"kdf":"PBKDF2-SHA256","iter":it,"salt":b(salt),"iv":b(iv),"ct":b(ct)},open(out,"w"))
print("wrote",os.path.normpath(out))
