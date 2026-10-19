#!/usr/bin/env python3
"""prose-guard.py — verifica che una revisione di stile abbia toccato SOLO la prosa.
Confronta ogni file .md modificato con la versione in HEAD su: titoli, codice (blocchi e inline),
destinazioni dei link, tag HTML, SVG, callout, <details>/<summary>, struttura delle tabelle,
marcatori ⚠️ ➕ e numeri. Uso, dalla radice del repo: python3 scripts/prose-guard.py <cartella-vault>.
Istruzioni della revisione: scripts/revisione-stile.md."""
import re, subprocess, sys
from collections import Counter

def head(path):
    try: return subprocess.run(['git', 'show', f'HEAD:{path}'], capture_output=True, text=True, check=True).stdout
    except subprocess.CalledProcessError: return None

def strip_code(t):
    return re.sub(r'`[^`\n]*`', ' ', re.sub(r'```[\s\S]*?```', ' ', t))

def features(t):
    f = {}
    f['titoli'] = re.findall(r'^#{1,6} .*$', t, re.M)
    f['blocchi di codice'] = re.findall(r'```[\s\S]*?```', t)
    nf = re.sub(r'```[\s\S]*?```', ' ', t)
    f['codice inline'] = sorted(Counter(re.findall(r'`[^`\n]+`', nf)).elements())
    f['link (destinazioni)'] = sorted(re.findall(r'\]\(([^)\s]+)', nf) + re.findall(r'href="([^"]*)"', nf))
    f['wikilink'] = sorted(re.findall(r'\[\[[^\]]+\]\]', nf))
    f['svg'] = re.findall(r'<svg[\s\S]*?</svg>', t)
    f['tag html'] = sorted(re.findall(r'<(/?[a-zA-Z][a-zA-Z0-9]*)\b', re.sub(r'<svg[\s\S]*?</svg>', '', nf)))
    f['callout (apertura)'] = re.findall(r'^\s*>\s*\[![^\]]*\]', t, re.M)
    f['summary'] = re.findall(r'<summary>[\s\S]*?</summary>', t)
    rows = [l for l in t.split('\n') if re.match(r'^\s*\|.*\|\s*$', l)]
    f['tabelle (righe×colonne)'] = [len(re.findall(r'(?<!\\)\|', strip_code(r))) for r in rows]
    prose = strip_code(re.sub(r'<svg[\s\S]*?</svg>', ' ', t))
    prose = re.sub(r'\]\([^)]*\)|href="[^"]*"', ' ', prose)
    f['marcatori ⚠️ ➕'] = sorted(re.findall(r'⚠️|➕', prose))
    f['numeri'] = sorted(re.findall(r'\d+(?:[.,]\d+)*', prose))
    return f

def dashes(t):
    p = strip_code(re.sub(r'<svg[\s\S]*?</svg>', ' ', t))
    p = '\n'.join(l for l in p.split('\n') if not l.startswith('#'))
    return len(re.findall(r'[—–]', p))

vault = sys.argv[1].rstrip('/')
changed = subprocess.run(['git', 'diff', '--name-only', '--', vault], capture_output=True, text=True).stdout.split()
bad = 0
for path in [p for p in changed if p.endswith('.md')]:
    old, new = head(path), open(path, encoding='utf-8').read()
    if old is None: print(f'?  {path}: file nuovo'); continue
    fo, fn = features(old), features(new)
    errs = [k for k in fo if fo[k] != fn[k]]
    st = subprocess.run(['git', 'diff', '--numstat', '--', path], capture_output=True, text=True).stdout.split()
    d0, d1 = dashes(old), dashes(new)
    if errs:
        bad += 1; print(f'KO {path}: cambiati → {", ".join(errs)}')
        for k in errs:
            a, b = Counter(map(str, fo[k])), Counter(map(str, fn[k]))
            print(f'     {k}: tolti {list((a - b).elements())[:4]} · aggiunti {list((b - a).elements())[:4]}')
    else:
        print(f'ok {path}: +{st[0]} -{st[1]} righe · trattini {d0}→{d1}')
print(f'\n{len(changed)} file modificati, {bad} con violazioni')
sys.exit(1 if bad else 0)
