#!/usr/bin/env python3
"""svg-preview.py — verifica gli SVG inline di un file: XML + resa VISIVA fedele.

Perché esiste: un SVG scritto a mano ha coordinate "alla cieca". Due classi di
difetti non si vedono nel codice:
  1. XML non valido — una `&` o un `<` grezzi nel testo rompono il parsing (WebKit
     smette di disegnare l'SVG; il browser mostra un errore). Vanno scritti `&amp;`/`&lt;`.
  2. Layout — testo tagliato dal viewBox, frecce/etichette sovrapposte: dipendono
     dai FONT del motore di rendering, quindi si vedono solo guardando l'immagine
     resa dallo STESSO motore del browser.

Questo script fa entrambe le verifiche:
  - **valida l'XML** di ogni SVG (minidom) e segnala quelli malformati;
  - li **renderizza con `qlmanage`** (Quick Look di macOS = motore **WebKit**, cioè
    quello che vede l'utente), impila i risultati in un PNG da ispezionare a occhio.

⚠️ NON usare PyMuPDF per la verifica: le sue metriche dei font non sono quelle del
browser, e il suo parser è permissivo con l'XML → i difetti sfuggono. WebKit è fedele.

Uso:
    python3 scripts/svg-preview.py percorso/al/file.md   # tutti gli <svg> del markdown
    python3 scripts/svg-preview.py diagramma.svg          # un singolo .svg
    python3 scripts/svg-preview.py a.md b.md              # più file insieme

Requisiti: macOS (`qlmanage`) + Pillow. Fuori da macOS lo script valida comunque
l'XML ma avvisa che non può fare la resa fedele.
"""
import sys, re, os, tempfile, subprocess, shutil
import xml.dom.minidom as minidom

try:
    from PIL import Image, ImageChops, ImageDraw
except ImportError:
    Image = None


def svgs_from(path):
    txt = open(path, encoding="utf-8").read()
    if path.endswith(".svg"):
        return [txt]
    return re.findall(r"<svg\b.*?</svg>", txt, flags=re.S)


def with_ns(svg):
    if "xmlns" not in svg.split(">", 1)[0]:
        svg = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ', 1)
    return svg


def xml_error(svg):
    """None se l'SVG è XML valido, altrimenti il messaggio d'errore (riga/colonna)."""
    try:
        minidom.parseString(with_ns(svg))
        return None
    except Exception as e:
        return str(e)


def crop_white(im):
    im = im.convert("RGBA")
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
    bg.alpha_composite(im)
    im = bg.convert("RGB")
    diff = ImageChops.difference(im, Image.new("RGB", im.size, (255, 255, 255)))
    bb = diff.getbbox()
    if bb:
        p = 6
        im = im.crop((max(0, bb[0]-p), max(0, bb[1]-p),
                      min(im.width, bb[2]+p), min(im.height, bb[3]+p)))
    return im


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)

    entries = []                      # (label, svg)
    for path in sys.argv[1:]:
        svgs = svgs_from(path)
        base = os.path.basename(path)
        for i, s in enumerate(svgs, 1):
            entries.append((f"{base} [{i}/{len(svgs)}]", s))
    if not entries:
        sys.exit("Nessun <svg> trovato.")

    # 1) validazione XML — la parte che intercetta &/< grezzi
    print(f"— {len(entries)} SVG —")
    invalid = 0
    for lab, s in entries:
        err = xml_error(s)
        if err:
            invalid += 1
            print(f"  ✗ XML NON VALIDO  {lab}: {err}")
    print(f"XML: {len(entries)-invalid} validi, {invalid} invalidi"
          + ("  → correggere (&→&amp;, <→&lt;) prima di committare" if invalid else ""))

    # 2) resa fedele con qlmanage (WebKit)
    if Image is None:
        print("Pillow non disponibile: salto la resa visiva."); return
    ql = shutil.which("qlmanage")
    if not ql:
        print("qlmanage non disponibile (non-macOS): salto la resa fedele. "
              "Valuta un browser headless; NON usare PyMuPDF (non è fedele)."); return

    tmp = tempfile.mkdtemp(prefix="svgprev-")
    paths = []
    for i, (lab, s) in enumerate(entries):
        p = os.path.join(tmp, f"s{i:02d}.svg")
        open(p, "w", encoding="utf-8").write(with_ns(s))
        paths.append((lab, p))
    subprocess.run([ql, "-t", "-s", "1100", "-o", tmp] + [p for _, p in paths],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    imgs = []
    for lab, p in paths:
        png = p + ".png"
        if os.path.exists(png):
            im = crop_white(Image.open(png))
            if im.width > 760:
                im = im.resize((760, int(im.height*760/im.width)))
            imgs.append((lab, im))
    if not imgs:
        print("qlmanage non ha prodotto immagini."); return

    LBL, PAD = 20, 8
    W = max(im.width for _, im in imgs) + 2*PAD
    H = sum(im.height + LBL + PAD for _, im in imgs) + PAD
    sheet = Image.new("RGB", (W, H), (236, 236, 236))
    dr = ImageDraw.Draw(sheet); y = PAD
    for lab, im in imgs:
        dr.rectangle([0, y, W, y+LBL], fill=(25, 25, 25))
        dr.text((PAD, y+5), lab, fill="white")
        sheet.paste(im, (PAD, y+LBL)); y += LBL + im.height + PAD
    out = os.path.join(tempfile.gettempdir(), "svg-preview.png")
    sheet.save(out)
    shutil.rmtree(tmp, ignore_errors=True)
    print(f"Resa WebKit → {out}  ({W}x{H}) — aprilo e controlla a occhio "
          "(testo tagliato, frecce/etichette sovrapposte).")


if __name__ == "__main__":
    main()
