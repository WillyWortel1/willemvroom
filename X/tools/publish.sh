#!/usr/bin/env bash
# usage: X/tools/publish.sh [PIN_ENV_VAR=HQ_PIN]  — encrypt /workspace/x-data/data.json -> X/data.enc.json, commit, push
set -euo pipefail; V="${1:-HQ_PIN}"; cd /workspace/f1-work
[ -n "${!V:-}" ] || { echo "env $V not set" >&2; exit 1; }
HQ_PIN="${!V}" python3 hq/tools/encrypt.py /workspace/x-data/data.json X/data.enc.json
N="$(git log -1 --format=%an)"; E="$(git log -1 --format=%ae)"
git add X/data.enc.json; git diff --cached --quiet || git -c user.name="$N" -c user.email="$E" commit -qm "X: refresh data"
git -c user.name="$N" -c user.email="$E" pull -q --rebase; git push -q; git log -1 --format=%h
