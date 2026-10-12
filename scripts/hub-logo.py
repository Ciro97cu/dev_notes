#!/usr/bin/env python3
"""
hub-logo.py — rigenera il logo «Dev Notes» dell'hub (stile adesivo, come angular.dev/?uwu=).

Il logo è un SVG a tracciati: il testo viene convertito in curve, così la pagina non deve caricare
alcun font. Le lettere vengono da Fredoka (latino) e M PLUS Rounded 1c (katakana), entrambi con
licenza SIL Open Font License 1.1, che permette di incorporarne i contorni.

Uso (strumento una tantum, non fa parte del sito):
  1. scaricare in una cartella i due font da github.com/google/fonts:
       ofl/fredoka/Fredoka[wdth,wght].ttf  (salvato come Fredoka.ttf)
       ofl/mplusrounded1c/MPLUSRounded1c-ExtraBold.ttf
  2. pip install fonttools   (meglio in un ambiente virtuale)
  3. python3 scripts/hub-logo.py <cartella-font> logo.svg
  4. incollare il contenuto di logo.svg dentro <h1 class="wordmark"> in index.html

Per cambiare colori o disposizione si modificano C e ITEMS qui sotto: ogni elemento è disegnato in
tre strati (ombra estrusa, bordo bianco, riempimento), come un adesivo.
"""
import math, sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

SRC = sys.argv[1]; OUT = sys.argv[2]
fred = instantiateVariableFont(TTFont(f'{SRC}/Fredoka.ttf'), {'wght': 700, 'wdth': 100})
mplus = TTFont(f'{SRC}/MPLUSRounded1c-ExtraBold.ttf')
FONTS = {'fred': fred, 'jp': mplus}

C = dict(a='#e2365f', b='#cc46c4', n='#cc46c4', shadow='#c43ab8', md='#3d6fc0')
ITEMS = [
    dict(t='D', x=74,  y=152, s=158, r=-7, fill=C['a']),
    dict(t='E', x=170, y=130, s=136, r=5,  fill=C['b']),
    dict(t='V', x=264, y=152, s=152, r=-4, fill=C['a']),
    dict(t='N', x=344, y=250, s=118, r=6,  fill=C['n']),
    dict(t='O', x=430, y=228, s=124, r=-5, fill=C['b']),
    dict(t='T', x=504, y=258, s=112, r=4,  fill=C['n']),
    dict(t='E', x=570, y=234, s=118, r=-6, fill=C['a']),
    dict(t='S', x=636, y=256, s=120, r=5,  fill=C['b']),
    dict(t='appunti', x=500, y=58, s=46, r=-9, fill=C['b']),
    dict(t='di studio', x=558, y=110, s=42, r=-9, fill=C['a']),
    dict(t='デヴ・ノーツ', x=170, y=232, s=42, r=-4, font='jp', fill=C['n']),
    dict(rect=(54, 54), x=378, y=120, r=-8, rx=9, fill=C['md']),
    dict(t='MD', x=378, y=131, s=30, r=-8, fill='#ffffff'),
    dict(t='{{ note }}', x=250, y=312, s=40, r=-6, fill=C['a']),
    dict(t='</>', x=72, y=306, s=52, r=-8, fill=C['n']),
]
W, SDX, SDY = 18, 6, 8

def text_path(it):
    f = FONTS[it.get('font', 'fred')]
    upm = f['head'].unitsPerEm; cmap = f.getBestCmap(); gs = f.getGlyphSet(); hmtx = f['hmtx']
    names = [cmap[ord(ch)] for ch in it['t']]
    total = sum(hmtx[n][0] for n in names)
    k = it['s'] / upm; a = math.radians(it.get('r', 0)); ca, sa = math.cos(a), math.sin(a)
    pen = SVGPathPen(gs, ntos=lambda v: f'{v:.1f}'.rstrip('0').rstrip('.'))
    xoff = -total / 2
    for n in names:
        # font (y in su) -> scala k, ribalta y, ruota r, trasla (x, y)
        m = (k * ca, k * sa, k * sa, -k * ca, it['x'] + k * ca * xoff, it['y'] + k * sa * xoff)
        gs[n].draw(TransformPen(pen, m))
        xoff += hmtx[n][0]
    return pen.getCommands()

defs, ids = [], []
for i, it in enumerate(ITEMS):
    pid = f'dn{i}'
    if 'rect' in it:
        w, h = it['rect']
        defs.append(f'<rect id="{pid}" x="{-w/2:g}" y="{-h/2:g}" width="{w}" height="{h}" rx="{it["rx"]}" transform="translate({it["x"]} {it["y"]}) rotate({it["r"]})"/>')
    else:
        defs.append(f'<path id="{pid}" d="{text_path(it)}"/>')
    ids.append((pid, it['fill']))

uses = lambda extra='': ''.join(f'<use href="#{p}"{extra}/>' for p, _ in ids)
svg = (f'<svg class="dn-logo" viewBox="-14 -14 744 356" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="dn-logo-t">'
       f'<title id="dn-logo-t">Dev Notes</title><defs>{"".join(defs)}</defs>'
       f'<g transform="translate({SDX} {SDY})" fill="{C["shadow"]}" stroke="{C["shadow"]}" stroke-width="{W}" stroke-linejoin="round">{uses()}</g>'
       f'<g fill="#fff" stroke="#fff" stroke-width="{W}" stroke-linejoin="round">{uses()}</g>'
       '<g>' + ''.join('<use href="#%s" fill="%s"/>' % (p, c) for p, c in ids) + '</g></svg>')
open(OUT, 'w', encoding='utf-8').write(svg)
print(len(svg), 'bytes')
