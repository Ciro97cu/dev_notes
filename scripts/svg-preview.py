#!/usr/bin/env python3
"""svg-preview.py — rende gli SVG inline di un file per l'ispezione VISIVA.

Perché esiste: un SVG scritto a mano ha coordinate "alla cieca". Overlap,
testo tagliato dal viewBox e collisioni tra elementi NON si vedono nel codice —
si vedono solo guardando l'immagine. Questo script rende gli SVG a PNG così da
poterli controllare con l'occhio PRIMA di committare (stessa logica con cui si
leggono a immagine le pagine di un PDF).

Uso:
    python3 scripts/svg-preview.py percorso/al/file.md   # estrae e rende tutti gli <svg> del markdown
    python3 scripts/svg-preview.py diagramma.svg          # rende un singolo file .svg
    python3 scripts/svg-preview.py a.md b.md              # più file insieme

Produce un unico PNG (gli SVG impilati su sfondo bianco) nella cartella temp di
sistema e ne stampa il percorso: va aperto/letto per verificare che non ci siano
sovrapposizioni, testo tagliato o etichette che collidono.

Requisiti: pymupdf, pillow  ->  pip install --user pymupdf pillow
Alternativa nativa su macOS per un singolo .svg:  qlmanage -t -s 1000 -o . file.svg
"""
import sys, re, os, tempfile

try:
    import pymupdf
    from PIL import Image
except ImportError:
    sys.exit("Servono pymupdf e pillow:  pip install --user pymupdf pillow")


def svgs_from(path):
    txt = open(path, encoding="utf-8").read()
    if path.endswith(".svg"):
        return [txt]
    return re.findall(r"<svg\b.*?</svg>", txt, flags=re.S)


def render(svg, dpi=160):
    # un SVG standalone ha bisogno del namespace, che negli inline spesso manca
    if "xmlns" not in svg.split(">", 1)[0]:
        svg = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ', 1)
    doc = pymupdf.open(stream=svg.encode("utf-8"), filetype="svg")
    pm = doc[0].get_pixmap(dpi=dpi, alpha=True)
    im = Image.frombytes("RGBA", (pm.width, pm.height), pm.samples)
    bg = Image.new("RGB", im.size, "white")            # sfondo bianco: currentColor esce scuro
    bg.paste(im, mask=im.split()[3])
    return bg


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    imgs = []
    for path in sys.argv[1:]:
        for svg in svgs_from(path):
            imgs.append(render(svg))
    if not imgs:
        sys.exit("Nessun <svg> trovato nei file indicati.")
    gap = 24
    w = max(i.width for i in imgs)
    h = sum(i.height for i in imgs) + gap * (len(imgs) - 1)
    sheet = Image.new("RGB", (w, h), "white")
    y = 0
    for i in imgs:
        sheet.paste(i, (0, y))
        y += i.height + gap
    out = os.path.join(tempfile.gettempdir(), "svg-preview.png")
    sheet.save(out)
    print(f"{len(imgs)} SVG resi -> {out}  ({w}x{h})")


if __name__ == "__main__":
    main()
