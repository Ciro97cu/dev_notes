---
modulo: 10
titolo: "Sfondi & effetti visivi"
tags: [tipo/modulo, sfondi]
---
# 10 · Sfondi & effetti visivi
> 🎨 modulo 10 — *CSS* · rif. MDN

Questo modulo raccoglie tutto ciò che dà "consistenza visiva" a un elemento oltre a colore e testo: **sfondi** (tinte, immagini, gradienti, layer multipli), **ombre** (`box-shadow`), **effetti sui pixel** (`filter` e `backdrop-filter`), l'adattamento di immagini e video (`object-fit`), il ritaglio della forma (`clip-path`, `mask`) e le peculiarità di **SVG**. Per i formati di colore (hex, `rgb()`, `hsl()`, `oklch()`) vedi [[07-colori]]; per unità e funzioni come `deg`, `turn`, percentuali e `calc()` vedi [[06-unita-valori-funzioni]].

## Le sotto-proprietà di `background`

`background` non è una singola proprietà ma una **famiglia**: ognuno dei livelli di sfondo è descritto da otto proprietà indipendenti, che poi lo shorthand riassume. Vale la pena conoscerle una a una, perché spesso si scrivono estese per chiarezza.

| Proprietà | Cosa controlla | Default |
|---|---|---|
| `background-color` | tinta piatta sotto tutto il resto | `transparent` |
| `background-image` | una o più immagini/gradienti | `none` |
| `background-position` | punto d'ancoraggio dell'immagine | `0% 0%` |
| `background-size` | dimensione dell'immagine | `auto auto` |
| `background-repeat` | se e come ripetere | `repeat` |
| `background-origin` | box da cui parte il disegno | `padding-box` |
| `background-clip` | box entro cui lo sfondo è visibile | `border-box` |
| `background-attachment` | comportamento allo scroll | `scroll` |

```css
.hero {
  background-color: #1c1c28;                 /* fallback sotto l'immagine */
  background-image: url("photo.jpg");
  background-position: center;               /* orizzontale + verticale */
  background-size: cover;                    /* vedi sotto */
  background-repeat: no-repeat;
}
```

### `background-size`: `cover` vs `contain`

I due valori chiave scalano l'immagine mantenendo le proporzioni, ma con obiettivi opposti:

- `cover` — l'immagine **riempie** tutto il box; l'eccedenza viene ritagliata. È lo standard per le hero image.
- `contain` — l'immagine **rientra** interamente nel box; restano bande vuote (letter/pillarboxing) se le proporzioni non combaciano.

Si possono anche dare misure esplicite (`background-size: 200px 100px`, oppure `100% auto`).

### `background-repeat`, `background-origin`, `background-clip`

- `background-repeat`: `repeat` (default), `repeat-x`, `repeat-y`, `no-repeat`, e i più raffinati `space` (ripete senza tagliare, distribuendo lo spazio) e `round` (riscala per far entrare un numero intero di tessere). ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat))
- `background-origin`: da dove **parte** l'immagine — `padding-box` (default), `border-box`, `content-box`.
- `background-clip`: fin dove lo sfondo è **visibile** — `border-box` (default), `padding-box`, `content-box`, e il valore moderno `text` (→ [gradient text](#testo-riempito-di-gradiente-background-clip-text)).

### `background-attachment`

Governa il comportamento durante lo scroll: `scroll` (default, lo sfondo scorre con l'elemento), `local` (scorre col contenuto interno dell'elemento) e `fixed` (resta ancorato al viewport, effetto "parallasse").

> [!warning]
> `background-attachment: fixed` è costoso da renderizzare (il browser ridipinge lo sfondo a ogni scroll) e su molti browser mobili viene ignorato. Per un vero effetto parallasse conviene una soluzione dedicata piuttosto che affidarsi a `fixed`.

## Lo shorthand `background`

Lo shorthand riassume tutte le sotto-proprietà in una dichiarazione. L'ordine consigliato da [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/background) è:

```css
background:
  <bg-image>
  <bg-position> / <bg-size>
  <repeat-style>
  <attachment>
  <bg-clip>
  <bg-origin>
  <bg-color>;
```

Regole pratiche:

- **Ogni valore omesso torna al suo default.** Scrivere `background: red` non azzera solo il colore: resetta *tutte* le altre sotto-proprietà (immagine → `none`, position → `0% 0%`, ecc.). Utile saperlo per non farsi sorprendere da uno shorthand che "cancella" impostazioni precedenti.
- **`background-size` va solo dopo `background-position`, separato da `/`.** Es. `center / cover`.
- L'ordine dei token è flessibile tranne quel vincolo position/size.

```css
/* Immagine centrata, coprente, non ripetuta, con colore di riserva */
.hero {
  background: url("photo.jpg") center / cover no-repeat #1c1c28;
}
```

## Sfondi multipli

`background-image` (e quindi lo shorthand) accetta una **lista separata da virgola**: si sovrappongono più layer. L'ordine di stacking è controintuitivo — **il primo della lista sta sopra**, l'ultimo sotto. Dove un layer superiore è trasparente, si vedono quelli sotto.

```css
.card {
  background:
    linear-gradient(rgb(0 0 0 / 60%), rgb(0 0 0 / 60%)),  /* velo scuro: SOPRA */
    url("photo.jpg") center / cover;                       /* foto: SOTTO */
}
```

> [!tip]
> Il **colore** di sfondo può stare solo nell'**ultimo** layer (è, di fatto, il fondale di tutti). Un pattern comune è sovrapporre un gradiente semitrasparente a una foto per garantire il contrasto del testo — proprio come nell'esempio sopra.

## Gradienti

Un gradiente è un'`<image>` generata da CSS: si usa ovunque serva un'immagine (`background-image`, `mask-image`, `border-image`), non come colore. Tutte le funzioni gradiente esistono anche in variante `repeating-*`.

### `linear-gradient()`

Transizione lungo una retta. La direzione è opzionale (**default `to bottom`**, cioè `180deg`) e si esprime come **angolo** o come **keyword**:

- Angolo: `0deg` = verso l'alto, `90deg` = verso destra, `180deg` = verso il basso, `270deg` = verso sinistra. Accetta anche `turn` e `rad`.
- Keyword: `to right`, `to bottom`, `to top left`…

I **color stop** possono avere una posizione (`%` o lunghezza). Due stop alla **stessa** posizione creano una transizione netta (hard stop) — utile per strisce e bandiere.

```css
/* Sfumatura diagonale */
.a { background: linear-gradient(135deg, #6a11cb, #2575fc); }

/* Con posizioni esplicite */
.b { background: linear-gradient(to right, red 20%, orange 40%, yellow 60%, green 80%); }

/* Hard stop: metà rosso, metà blu, senza sfumatura */
.c { background: linear-gradient(90deg, red 0 50%, blue 50% 100%); }
```

### `radial-gradient()`

Transizione che si irradia da un centro. Sintassi: `radial-gradient([forma] [dimensione] [at posizione], <color-stop>…)`.

- **Forma**: `circle` o `ellipse` (default `ellipse`).
- **Dimensione**: keyword `closest-side`, `closest-corner`, `farthest-side`, `farthest-corner` (default `farthest-corner`), oppure misure esplicite.
- **Posizione**: `at <position>` (default `center`).

```css
/* Cerchio, centro chiaro che sfuma verso il bordo */
.a { background: radial-gradient(circle, #ffd 0%, #360 100%); }

/* Ellisse dimensionata sul lato più vicino, decentrata in alto a destra */
.b { background: radial-gradient(closest-side at 100% 0, #3f87a6, #ebf8e1, #f69d3c); }
```

### `conic-gradient()`

I colori ruotano **attorno** a un centro (come le lancette di un orologio), invece di irradiarsi. Sintassi: `conic-gradient([from <angle>] [at <position>], <angular-color-stop>…)`, dove i color stop hanno posizioni **angolari**. È perfetto per grafici a torta, ruote di colore e "spinner".

```css
/* Ruota di colori */
.wheel { background: conic-gradient(red, orange, yellow, green, blue, purple, red); }

/* Grafico a torta con hard stop angolari */
.pie {
  background: conic-gradient(
    #e11 0deg 90deg,      /* 25% */
    #1a1 90deg 200deg,    /* ~30% */
    #14e 200deg 360deg    /* resto */
  );
  border-radius: 50%;
}
```

> [!info] Baseline
> `conic-gradient()` è **Baseline: widely available** (supportato ovunque da novembre 2020). ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient))

### Gradienti ripetuti

`repeating-linear-gradient()`, `repeating-radial-gradient()` e `repeating-conic-gradient()` replicano il pattern definito dai color stop finché riempiono l'area. Ottimi per strisce, tessuti e scacchiere.

```css
/* Strisce diagonali a 45° */
.stripes {
  background: repeating-linear-gradient(45deg, #eee 0 10px, #ccc 10px 20px);
}
```

## Testo riempito di gradiente (`background-clip: text`)

`background-clip: text` ritaglia lo sfondo **sulla sagoma del testo**: combinato con un `color` trasparente, il gradiente riempie le glifi. È la tecnica moderna per il "gradient text".

```css
.title {
  background-image: linear-gradient(90deg, #6a11cb, #2575fc);
  -webkit-background-clip: text;   /* Safari e derivati WebKit */
  background-clip: text;
  color: transparent;              /* lascia trasparire il gradiente */
}
```

> [!warning]
> Il valore `text` richiede ancora il prefisso `-webkit-background-clip: text` per alcuni browser: scriverlo **prima** della versione standard. Poiché il testo diventa trasparente, prevedere un fallback di colore (o un `@supports (background-clip: text)`) per non lasciare il testo invisibile dove la feature manca. Curare inoltre il contrasto per l'accessibilità.

## `box-shadow`

Aggiunge una o più ombre al **box** dell'elemento (rispetta il `border-radius`). Ordine dei valori: `offset-x offset-y [blur] [spread] [color] [inset]`.

- `offset-x` / `offset-y` — spostamento (obbligatori); valori positivi = destra/basso.
- `blur` — sfocatura (default `0`); più è alto, più l'ombra è morbida e diffusa.
- `spread` — dilata (valore positivo) o restringe (negativo) l'ombra.
- `color` — può stare **prima o dopo** i numeri; default = `color` dell'elemento.
- `inset` — trasforma l'ombra in **interna** (incassata).

Ombre multiple: **lista separata da virgola**, la prima disegnata sopra.

```css
/* Ombra morbida sotto una card */
.card { box-shadow: 0 4px 12px rgb(0 0 0 / 15%); }

/* Ombra interna */
.well { box-shadow: inset 0 2px 6px rgb(0 0 0 / 30%); }

/* Più ombre: bordo colorato "solido" via spread + ombra reale */
.badge {
  box-shadow:
    0 0 0 3px #f4aab9,          /* anello */
    0 6px 16px rgb(0 0 0 / 25%); /* ombra */
}
```

> [!warning]
> Un `blur` (e `spread`) molto ampio è **costoso** da ridipingere, soprattutto se **animato**: il browser ricalcola la sfocatura a ogni frame. Per transizioni fluide conviene mettere l'ombra su uno pseudo-elemento sovrapposto e animarne l'`opacity` (che gira sulla GPU), invece di animare `box-shadow` direttamente.

> [!tip]
> `box-shadow` segue il **box rettangolare** (col raggio dei bordi). Per proiettare un'ombra che segua la **sagoma reale** — ad esempio una PNG con trasparenza o un elemento con `clip-path` — serve `filter: drop-shadow()` (vedi sotto).

## `filter`

`filter` applica effetti grafici ai **pixel** dell'elemento (contenuto + sfondo + bordi). Le funzioni si concatenano separate da spazio e vengono applicate **nell'ordine** in cui compaiono.

| Funzione | Argomento | Effetto |
|---|---|---|
| `blur()` | `<length>` (`5px`) | sfocatura gaussiana |
| `brightness()` | `<number>`/`%` | luminosità (`0` nero, `1`/`100%` invariato) |
| `contrast()` | `<number>`/`%` | contrasto |
| `grayscale()` | `<number>`/`%` | scala di grigi |
| `saturate()` | `<number>`/`%` | saturazione |
| `hue-rotate()` | `<angle>` (`90deg`) | rotazione della tinta |
| `invert()` | `<number>`/`%` | inversione colori |
| `sepia()` | `<number>`/`%` | viraggio seppia |
| `opacity()` | `<number>`/`%` | opacità (utile in catene di filtri) |
| `drop-shadow()` | `x y [blur] [color]` | ombra che segue la **sagoma** |

```css
/* Foto in grigio che torna a colori al passaggio del mouse */
.thumb        { filter: grayscale(100%) contrast(110%); transition: filter .2s; }
.thumb:hover  { filter: none; }

/* Ombra sulla forma reale (rispetta la trasparenza del PNG) */
.logo { filter: drop-shadow(2px 4px 6px rgb(0 0 0 / 40%)); }
```

> [!info] Baseline
> `filter` è supportato ovunque dal 2016. **Attenzione all'ordine**: `hue-rotate` dopo un `drop-shadow` ne altera anche il colore. `filter` (come `opacity < 1` e `mask`) crea un contesto che può **interrompere** un `backdrop-filter` sovrastante. ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/filter))

## `backdrop-filter` — l'effetto vetro

Come `filter`, ma applicato a **ciò che sta dietro** l'elemento, non all'elemento stesso. È la base del *frosted glass*: perché si veda, l'elemento deve avere uno sfondo **parzialmente trasparente**.

```css
.glass {
  background-color: rgb(255 255 255 / 25%);  /* semitrasparente: lascia vedere dietro */
  backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid rgb(255 255 255 / 40%);
  border-radius: 12px;
}
```

> [!info] Baseline
> `backdrop-filter` è **Baseline** dal settembre 2024 (senza prefisso su tutti i browser moderni; Safari lo supportava già con `-webkit-`). Essendo relativamente recente, per contesti sensibili conviene un fallback tramite `@supports (backdrop-filter: blur(1px))`. ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter))

## `object-fit` e `object-position`

Su elementi **rimpiazzati** (`<img>`, `<video>`) con dimensioni fissate, `object-fit` decide come il contenuto riempie il proprio box — è il `background-size` dei media veri e propri.

- `fill` (default) — deforma per riempire, **ignora** le proporzioni.
- `contain` — rientra tutto, con bande vuote.
- `cover` — copre tutto, ritagliando l'eccedenza.
- `none` — dimensione intrinseca, nessun ridimensionamento.
- `scale-down` — il più piccolo tra `none` e `contain`.

`object-position` allinea il contenuto nel box (come `background-position`), utile per scegliere quale parte resta visibile con `cover`.

```css
.avatar {
  width: 80px;
  height: 80px;
  object-fit: cover;
  object-position: center top;  /* con ritaglio, tiene la parte alta (i volti) */
}
```

> [!info] Baseline
> `object-fit`/`object-position` sono **Baseline: widely available** (dal gennaio 2020). Risolvono in modo pulito il vecchio problema delle immagini stirate dentro contenitori di dimensioni fisse. ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit))

## Ritagliare la forma: `clip-path` e cenno a `mask`

`clip-path` definisce una **regione di ritaglio**: ciò che è dentro resta visibile, ciò che è fuori sparisce (taglio netto, binario). Si usano funzioni-forma:

```css
.circle   { clip-path: circle(50%); }
.diamond  { clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); }
.inset    { clip-path: inset(10px 20px round 8px); }
```

Funzioni disponibili: `circle()`, `ellipse()`, `polygon()`, `inset()`, `rect()`, `xywh()`, `path()` (sintassi SVG), eventualmente con una geometry-box (`content-box`, `border-box`…). `clip-path` è **Baseline: widely available** dal gennaio 2020. ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path))

`mask` è il cugino "morbido": invece di un taglio netto usa un'immagine (spesso un gradiente o una SVG) la cui **opacità/luminanza** decide quanto ogni pixel dell'elemento resta visibile. Serve per dissolvenze e mascherature complesse che `clip-path` non può fare.

```css
/* Dissolvenza del bordo inferiore di un'immagine */
.fade { mask: linear-gradient(black 70%, transparent); }
```

> [!info] Baseline
> `mask` è **Baseline** dal dicembre 2023; alcune varianti richiedono ancora il prefisso `-webkit-mask-*` per browser più vecchi. Regola pratica: **`clip-path`** per tagli geometrici netti (più economico), **`mask`** per transizioni graduali e maschere basate su immagine. ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/mask))

## SVG negli sfondi e nel markup

**SVG** (*Scalable Vector Graphics*) descrive la grafica con formule geometriche in XML anziché con una griglia di pixel. Vantaggi: è **scalabile** senza perdita di qualità (ideale per icone e loghi su schermi ad alta densità), **leggero** per forme semplici e **stilizzabile/animabile** con CSS. Due modi d'uso principali:

- **Inline** (`<svg>…</svg>` nel markup): il DOM dell'SVG è accessibile, quindi si possono stilizzare i singoli tracciati con CSS (`fill`, `stroke`) e animarli. È la via per icone interattive e grafici che cambiano stato.
- **Come immagine di sfondo** (`background-image: url("icon.svg")` o `<img src>`): comodo e cacheabile, ma l'SVG è "chiuso" — dall'esterno non se ne stilizzano le parti interne.

```css
/* Icona SVG di sfondo, dimensionata come una qualsiasi background-image */
.icon-search {
  background: url("search.svg") no-repeat center / 20px;
}
```

```css
/* SVG inline: si colora il tracciato via CSS */
.logo-inline path { fill: currentColor; transition: fill .2s; }
.logo-inline:hover path { fill: #2575fc; }
```

> [!tip]
> Per un'icona che deve **ereditare il colore del testo** o cambiarlo allo stato `:hover`, serve l'SVG **inline** con `fill: currentColor`. Da `background-image` questo non è possibile.

Collegamenti: [[07-colori]] · [[06-unita-valori-funzioni]]

## 🔁 Ripasso lampo

**1.** In una lista di sfondi multipli separati da virgola, quale layer viene disegnato sopra?
> [!success]- Risposta
> Il **primo** della lista sta in cima; l'ultimo fa da fondale. Il colore (`background-color`) può stare solo nell'ultimo layer.

**2.** Che differenza c'è tra `background-size: cover` e `contain`?
> [!success]- Risposta
> Entrambi mantengono le proporzioni. `cover` **riempie** il box tagliando l'eccedenza; `contain` fa **rientrare** tutta l'immagine, lasciando eventuali bande vuote.

**3.** Come si ottiene un testo riempito da un gradiente?
> [!success]- Risposta
> `background-image` con un gradiente + `background-clip: text` (con `-webkit-background-clip: text` per Safari) + `color: transparent`. Prevedere un fallback di colore.

**4.** Quando serve `filter: drop-shadow()` invece di `box-shadow`?
> [!success]- Risposta
> Quando l'ombra deve seguire la **sagoma reale** (PNG con trasparenza, elemento con `clip-path`) e non il box rettangolare. `box-shadow` rispetta solo il box e il suo `border-radius`.

**5.** Perché un `backdrop-filter` a volte "non si vede"?
> [!success]- Risposta
> Perché serve uno sfondo **parzialmente trasparente** sull'elemento per lasciar vedere ciò che sta dietro; inoltre un `opacity < 1`, un `filter` o una `mask` su un antenato possono interrompere l'effetto creando un contesto isolato.

**6.** `clip-path` o `mask` per una dissolvenza graduale del bordo?
> [!success]- Risposta
> `mask` (con un gradiente `black → transparent`): fa un ritaglio **morbido** basato su opacità/luminanza. `clip-path` produce solo tagli **netti** su forme geometriche.

**In sintesi:**
- `background` è una famiglia di 8 sotto-proprietà; lo shorthand azzera al default tutto ciò che si omette e vuole `position / size`. Sfondi multipli: virgola, **il primo sta sopra**.
- Gradienti come immagini generate: `linear-`, `radial-`, e il moderno `conic-gradient()` (Baseline), tutti in variante `repeating-*`.
- Effetti sui pixel: `box-shadow` (segue il box), `filter` con `drop-shadow()` (segue la sagoma), `backdrop-filter` per il vetro smerigliato (Baseline 2024, richiede sfondo semitrasparente).
- Media e forme: `object-fit`/`object-position` adattano `<img>`/`<video>`; `clip-path` taglia netto, `mask` sfuma. **SVG** inline è stilizzabile via CSS, come background no.
