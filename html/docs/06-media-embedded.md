---
modulo: 6
titolo: "Media e contenuti embedded"
tags: [tipo/modulo, media, accessibilita]
---
# 06 · Media e contenuti embedded
> modulo 6 — *HTML* · rif. MDN

Oltre al testo, una pagina ospita immagini, video, audio e contenuti presi da altri siti. Le decisioni qui ruotano attorno a due assi: l'**accessibilità** — che per le immagini vuol dire soprattutto il testo alternativo, e che ha il suo modulo dedicato in [[07-accessibilita-aria]] — e le **prestazioni** — immagini della misura giusta, caricate al momento giusto, senza far saltare il layout.

## Immagini: `<img>` e il testo alternativo

Un'immagine si inserisce con `<img>`, che ha due attributi non negoziabili: `src` (la sorgente) e **`alt`** (il testo alternativo). L'`alt` è una decisione, non un riempitivo:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 700 210" role="img" aria-label="Come scegliere il testo alternativo di un'immagine" style="width:100%;max-width:660px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="16" y="80" width="100" height="48" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="66" y="108" font-size="12" text-anchor="middle">Immagine</text><path d="M252 58 L366 104 L252 150 L138 104 Z" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="252" y="100" font-size="11" text-anchor="middle">Aggiunge</text><text x="252" y="115" font-size="11" text-anchor="middle">informazione?</text><rect x="440" y="54" width="250" height="44" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="565" y="80" font-size="11.5" text-anchor="middle">alt = descrizione del contenuto</text><rect x="440" y="138" width="250" height="52" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="565" y="159" font-size="11" text-anchor="middle">alt="" (vuoto):</text><text x="565" y="175" font-size="11" text-anchor="middle">lo screen reader la salta</text><path d="M116 104 L130 104" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M138 104 L130 99 L130 109 Z" fill="currentColor"/><path d="M366 104 L410 104 L410 76 L436 76" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M440 76 L432 71 L432 81 Z" fill="currentColor"/><text x="418" y="98" font-size="10.5">sì</text><path d="M252 150 L252 164 L436 164" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M440 164 L432 159 L432 169 Z" fill="currentColor"/><text x="262" y="160" font-size="10.5">no</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Il testo alternativo dipende dal <em>ruolo</em> dell'immagine: se porta informazione, l'<code>alt</code> la descrive; se è puramente decorativa, si usa <code>alt=""</code> (vuoto) così lo screen reader la salta. L'<code>alt</code> non va mai <strong>omesso</strong>: senza, lo screen reader ripiega sul nome del file.</figcaption>
</figure>

Un altro accorgimento importante: indicare **`width` e `height`** (o l'`aspect-ratio` in CSS). Così il browser riserva lo spazio dell'immagine prima ancora di scaricarla, ed evita il fastidioso "salto" del layout quando l'immagine arriva (il *Cumulative Layout Shift*).

## Immagini responsive: `srcset`/`sizes` e `<picture>`

Servire a un telefono la stessa immagine da 2000px pensata per il desktop è uno spreco. HTML offre due strumenti, per due problemi diversi:

```html
<!-- stessa immagine, più risoluzioni: sceglie il browser -->
<img src="foto-800.jpg"
     srcset="foto-400.jpg 400w, foto-800.jpg 800w, foto-1200.jpg 1200w"
     sizes="(max-width: 600px) 100vw, 600px"
     alt="Pane appena sfornato">

<!-- immagini o formati diversi: scegli tu le condizioni -->
<picture>
  <source srcset="foto.avif" type="image/avif">
  <source srcset="foto.webp" type="image/webp">
  <img src="foto.jpg" alt="Pane appena sfornato">
</picture>
```

- **`srcset` + `sizes`** — la **stessa** immagine in più misure; il browser sceglie la più adatta a schermo e densità di pixel. Per il caso comune "voglio servire l'immagine giusta a ogni dispositivo".
- **`<picture>` + `<source>`** — quando servono immagini **diverse** (un ritaglio verticale su mobile, la *art direction*) o **formati** diversi con ripiego (AVIF/WebP, e in fondo sempre un `<img>` come garanzia). Il browser prende la prima `<source>` che sa gestire.

A completare il quadro, **`loading="lazy"`** rimanda il caricamento delle immagini fuori schermo finché non servono.

## Video e audio

`<video>` e `<audio>` incorporano contenuti multimediali, con `controls` per i comandi nativi e `<source>` multipli per offrire più formati. Per il video conta un elemento in più:

```html
<video controls poster="anteprima.jpg" width="640">
  <source src="video.webm" type="video/webm">
  <source src="video.mp4" type="video/mp4">
  <track kind="captions" src="sottotitoli.vtt" srclang="it" label="Italiano">
</video>
```

Il **`<track kind="captions">`** aggiunge sottotitoli/didascalie: è la parte di accessibilità del video, indispensabile per chi non sente l'audio.

## Contenuti esterni: `<iframe>`

L'`<iframe>` incorpora un'altra pagina (una mappa, un video di terze parti). Tre attributi contano:

- **`title`** — descrive il contenuto dell'iframe agli screen reader: un iframe senza `title` è un buco muto nella pagina.
- **`sandbox`** — **limita** cosa il contenuto incorporato può fare (script, form, popup): una difesa importante quando si incorpora roba di terzi.
- **`loading="lazy"`** — carica l'iframe solo quando serve.

## SVG: inline o come `<img>`?

Un'immagine vettoriale SVG si può usare in due modi, ed è una piccola decisione ricorrente:

- **`<svg>` inline** nel markup — stilabile con CSS (compreso `currentColor`, che fa ereditare il colore del testo) e manipolabile con JavaScript. La scelta per **icone che cambiano colore o si animano** (come i diagrammi di questi appunti).
- **`<img src="icona.svg">`** — più semplice e messo in cache come qualsiasi immagine, ma "sigillato": non lo si stila dall'esterno. La scelta per **immagini statiche**.

## Ripasso lampo

<details>
<summary>Quando <code>alt</code> descrittivo, quando <code>alt=""</code>, e perché mai ometterlo?</summary>

`alt` descrittivo se l'immagine porta **informazione**; `alt=""` (vuoto) se è **decorativa**, così lo screen reader la salta. Non va mai **omesso**: senza `alt`, molti screen reader leggono il nome del file, inutile e confuso.

</details>

<details>
<summary>Che differenza c'è tra <code>srcset</code>/<code>sizes</code> e <code>&lt;picture&gt;</code>?</summary>

`srcset`/`sizes` servono la **stessa** immagine in più risoluzioni, lasciando scegliere al browser. `<picture>` con `<source>` serve immagini **diverse** (art direction) o **formati** diversi con ripiego (AVIF/WebP → JPG), decidendo tu le condizioni.

</details>

<details>
<summary>Perché indicare <code>width</code> e <code>height</code> sull'immagine?</summary>

Così il browser riserva lo spazio prima di scaricarla ed evita il salto del layout (Cumulative Layout Shift) quando l'immagine arriva.

</details>

<details>
<summary>Cosa rende accessibile un <code>&lt;video&gt;</code> e cosa un <code>&lt;iframe&gt;</code>?</summary>

Il video: il `<track kind="captions">` con i sottotitoli, per chi non sente l'audio. L'iframe: l'attributo `title`, che ne descrive il contenuto agli screen reader (e `sandbox` per la sicurezza).

</details>

<details>
<summary>Quando conviene un <code>&lt;svg&gt;</code> inline invece di <code>&lt;img src="…svg"&gt;</code>?</summary>

Inline quando l'icona deve essere **stilata** (anche con `currentColor`) o **animata/scriptata**. Come `<img>` quando è un'immagine **statica**: più semplice e cacheable, ma non modificabile dall'esterno.

</details>

**In sintesi:**
- `<img>` sempre con **`alt`**: descrittivo se informativa, `alt=""` se decorativa, mai omesso; `width`/`height` per non far saltare il layout.
- **`srcset`/`sizes`** per la stessa immagine a più misure, **`<picture>`** per formati o ritagli diversi; `loading="lazy"` per ciò che è fuori schermo.
- `<video>` accessibile col **`<track>`** dei sottotitoli; `<iframe>` con **`title`** e **`sandbox`**.
- SVG **inline** se va stilato/animato, come **`<img>`** se è statico.
