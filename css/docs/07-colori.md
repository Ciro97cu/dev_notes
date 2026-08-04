---
modulo: 7
titolo: "Colori"
tags: [tipo/modulo, colori]
---
# 07 · Colori
> 🎨 modulo 7 — *CSS* · rif. MDN

Un colore in CSS è un **valore** come un altro: si assegna a proprietà quali `color` (il testo), `background-color`, `border-color`, `box-shadow` e decine di altre. Esistono però tanti **modi di scriverlo** — parole chiave, esadecimale, `rgb()`, `hsl()`, e le notazioni moderne `oklch()`/`oklab()` — e ognuno appartiene a uno **spazio colore** diverso. Questo modulo copre come esprimere un colore oggi, quando conviene ciascuna notazione, e le funzioni che permettono di **derivare** e **mescolare** colori senza preprocessori.

I colori sono un `<color>`, un tipo di valore riutilizzabile ovunque una proprietà lo accetti (vedi il concetto di tipi di valore in [[06-unita-valori-funzioni]]).

## Named colors e keyword speciali

CSS definisce ~150 **named colors** — parole chiave come `red`, `crimson`, `rebeccapurple`, `tomato` — comode per prototipare ma poco adatte a una palette curata (i valori sono fissi e disomogenei). Riferimento: [named-color su MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/named-color).

Due keyword meritano attenzione perché non sono colori "fissi":

- **`transparent`** — nero completamente trasparente, equivale a `rgb(0 0 0 / 0)`. Utile per bordi/sfondi invisibili ma presenti nel layout.
- **`currentColor`** — risolve al valore **calcolato** della proprietà `color` dell'elemento. Poiché `color` si eredita, `currentColor` propaga la tinta del testo ad altre proprietà: un bordo o un `fill` SVG che "seguono" automaticamente il colore del testo.

```css
.badge {
  color: crimson;
  border: 2px solid currentColor;   /* il bordo diventa crimson */
  background: transparent;
}
```

> [!tip]
> `currentColor` è il modo più leggero per legare più proprietà a un'unica tinta: cambiando `color` si aggiorna tutto ciò che vi fa riferimento, senza ripetere il valore.

## Notazione esadecimale (`#rgb` / `#rrggbb` / `#rrggbbaa`)

L'esadecimale (*hex*) codifica i canali rosso, verde e blu in base 16:

```css
color: #ff0000;      /* rosso pieno: rr=ff, gg=00, bb=00 */
color: #f00;         /* forma corta: ogni cifra è raddoppiata → #ff0000 */
color: #ff000080;    /* 8 cifre: le ultime due sono l'alpha (80 ≈ 50%) */
color: #f008;        /* forma corta a 4 cifre → #ff000088 */
```

- **3 cifre** (`#rgb`) = forma abbreviata di `#rrggbb` (ogni cifra viene duplicata).
- **6 cifre** (`#rrggbb`) = notazione classica, un byte per canale (`00`–`ff`).
- **8 cifre** (`#rrggbbaa`) e **4 cifre** (`#rgba`) aggiungono il canale **alpha** come ultimo byte.

È compatta e universale, ma illeggibile per chi la scrive: da `#3a7bd5` non si intuisce né la tinta né quanto è chiara. Per palette ragionate conviene una notazione con canali dal significato esplicito (`hsl()`, meglio ancora `oklch()`).

## `rgb()` — canali con sintassi moderna

La forma attuale separa i tre canali (`0`–`255`, oppure percentuali) con **spazi**, e l'eventuale **alpha** dopo una **slash** `/`:

```css
color: rgb(255 0 0);          /* rosso opaco */
color: rgb(255 0 0 / 50%);    /* rosso al 50% di opacità */
color: rgb(30% 20% 50%);      /* canali in percentuale */
```

L'alpha si esprime come numero `0`–`1` (`/ 0.5`) o percentuale (`/ 50%`). Sintassi e ranges verificati su [rgb() — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/rgb).

> [!info] Legacy
> La vecchia forma separa i valori con **virgole** e usa la funzione dedicata `rgba()` per l'alpha:
> ```css
> color: rgb(255, 0, 0);
> color: rgba(255, 0, 0, 0.5);
> ```
> Oggi `rgba()` è un semplice **alias** di `rgb()`: la sintassi moderna con spazi e `/` copre anche l'alpha, quindi `rgba()` non serve più. La forma con virgole resta valida (ed è ciò che i browser restituiscono quando serializzano un colore via JavaScript).

## `hsl()` — tinta, saturazione, luminosità

`hsl()` descrive il colore in modo più intuitivo: **H**ue (angolo sulla ruota, `0`–`360`), **S**aturation e **L**ightness (percentuali). Stessa sintassi moderna con spazi e `/ alpha`:

```css
color: hsl(200 100% 50%);        /* azzurro pieno */
color: hsl(200 100% 50% / .5);   /* stesso colore, alpha 0.5 */
```

Ruotare `H` a parità di `S`/`L` genera una gamma di tinte "coordinate" — comodo per temi. Il limite di `hsl()` è la **non uniformità percettiva**: a `L` costante alcune tinte (il giallo) appaiono molto più chiare di altre (il blu), quindi una palette costruita solo variando `H` risulta squilibrata. Il problema lo risolve `oklch()` (più sotto). Dettagli su [hsl() — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl).

> [!info] Legacy
> Come per `rgb`, esiste la forma con virgole e l'alias `hsla()`:
> ```css
> color: hsl(200, 100%, 50%);
> color: hsla(200, 100%, 50%, 0.5);
> ```
> Nella forma con virgole `%` è obbligatorio su `S` e `L`; nella moderna le unità sono opzionali.

`hwb()` è una variante nello stesso spazio sRGB: **H**ue più **W**hiteness e **B**lackness in percentuale (quanto bianco/nero mescolare). `hwb(H 0% 0%)` equivale a `hsl(H 100% 50%)`. Baseline dal 2022 ([hwb() — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hwb)).

```css
background: hwb(194 0% 0%);       /* azzurro pieno */
background: hwb(0 100% 0% / 50%); /* bianco al 50% */
```

## `oklch()` / `oklab()` — colore percettivamente uniforme

`oklch()` è oggi la notazione **da preferire** per definire palette e sfumature. Esprime il colore nello spazio **Oklab** in coordinate polari, con tre canali:

```css
color: oklch(0.7 0.15 200);        /* L=0.7  C=0.15  H=200 */
color: oklch(70% 0.15 200 / 50%);  /* stessa tinta, alpha 50% */
```

- **L** (*lightness*) — luminosità percepita, da `0` (nero) a `1` (bianco); accetta anche `0%`–`100%`.
- **C** (*chroma*) — intensità del colore: `0` è grigio, verso l'alto è più saturo. Non ha un tetto rigido; in pratica si arriva a ~`0.37`–`0.4` (con `100%` = `0.4`).
- **H** (*hue*) — angolo di tinta `0`–`360` (gli angoli **non** coincidono con quelli di `hsl()`).

Due vantaggi rispetto a `hsl()`:

1. **Uniformità percettiva** — a parità di `L`, tinte diverse appaiono ugualmente chiare. Una palette costruita fissando `L` e `C` e ruotando `H` risulta bilanciata: nessun colore "salta" fuori. Idem per generare varianti (schiarire/scurire) muovendo solo `L`.
2. **Gamut ampio** — copre anche i colori **Display P3**, più vivi di quelli esprimibili in sRGB (`rgb`/`hsl`): su schermi wide-gamut si ottengono tinte più sature.

`oklab()` è la stessa cosa in coordinate cartesiane (`L a b`, con `a`/`b` = assi verde-rosso e blu-giallo): raramente si scrive a mano, serve soprattutto come **spazio di interpolazione** per gradienti e mescolanze. Riferimenti: [oklch()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch) e [oklab()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklab) su MDN. Baseline da maggio 2023.

> [!tip]
> Per una sfumatura tra due tinte, interpolare in `oklch`/`oklab` evita la "zona grigia" tipica dell'interpolazione in sRGB (dove il punto medio si smorza). Vale sia per `color-mix()` sia per i gradienti (`linear-gradient(in oklch, …)`, vedi [[10-sfondi-effetti]]).

## `color-mix()` — mescolare due colori

`color-mix()` fonde due colori in uno **spazio di interpolazione** dichiarato con `in <spazio>`. Ogni colore può avere una percentuale; se omesse, il mix è 50/50.

```css
/* 50% brand + 50% bianco → versione più chiara */
background: color-mix(in oklch, var(--brand), white);

/* pesi espliciti: 80% brand, 20% nero → versione più scura */
background: color-mix(in oklch, var(--brand) 80%, black 20%);

/* tinta di accento smorzata verso il grigio di sfondo */
border-color: color-mix(in oklch, var(--brand) 30%, canvas);
```

Lo spazio conta: `in oklch`/`in oklab` dà transizioni più naturali di `in srgb`. Per gli spazi polari (`hsl`, `hwb`, `lch`, `oklch`) si può indicare la direzione dell'angolo di tinta con `shorter hue` (default), `longer hue`, `increasing hue`, `decreasing hue`. Baseline da maggio 2023 ([color-mix() — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix)).

## Relative color syntax — derivare varianti

La *relative color syntax* costruisce un colore **a partire da un altro**: dopo `from <colore>`, i canali di quel colore diventano disponibili come parole chiave (`r g b`, oppure `l c h`, ecc.) da riusare o modificare con `calc()`.

```css
:root { --brand: oklch(0.62 0.17 250); }

/* stesso brand ma semitrasparente */
.overlay { background: oklch(from var(--brand) l c h / 50%); }

/* variante più chiara: +0.1 di lightness */
.hover  { background: oklch(from var(--brand) calc(l + 0.1) c h); }

/* colore complementare: hue +180 */
.accent { background: oklch(from var(--brand) l c calc(h + 180)); }
```

I canali risolvono a `<number>` (le percentuali diventano numeri, la tinta un valore `0`–`360`): quindi nei `calc()` si sommano numeri puri, non si mescolano numero e percentuale. La sorgente e la funzione d'uscita possono differire (`rgb(from <colore-oklch> …)` converte automaticamente). Guida: [Using relative colors — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors).

> [!info] Baseline
> La *relative color syntax* è **Baseline: newly available** (dal 2024, con Firefox 128 a completare il supporto): usabile ma non ancora "widely available". Nei progetti che devono coprire browser più vecchi, proteggerla con `@supports`:
> ```css
> @supports (color: oklch(from white l c h)) {
>   /* uso sicuro della relative color syntax */
> }
> ```

## Alpha nel colore vs `opacity`

Sono due cose diverse, spesso confuse:

- L'**alpha** fa parte del **valore di colore** (`/ 50%`, `#rrggbbaa`) e agisce **solo su quella proprietà**. `background: rgb(0 0 0 / .5)` rende trasparente **lo sfondo**, lasciando testo e bordi opachi.
- **`opacity`** è una **proprietà a sé** e si applica all'**intero elemento** come gruppo, **figli inclusi**: `opacity: .5` sbiadisce testo, sfondo e contenuti insieme, e per giunta crea un nuovo *stacking context* (vedi [[09-display-posizionamento]]).

```css
/* solo lo sfondo è semitrasparente, il testo resta pieno */
.a { background: hsl(0 0% 0% / 0.5); }

/* tutto l'elemento (testo compreso) è al 50% */
.b { opacity: 0.5; }
```

Regola pratica: per rendere trasparente **un singolo colore**, usare l'alpha; `opacity` solo quando si vuole sbiadire l'elemento **per intero**. Dettagli: [opacity — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/opacity).

## `color-scheme` e `light-dark()` — temi chiaro/scuro

`color-scheme` dichiara quali schemi un elemento (di solito `:root`) sa rendere. Impostandolo, gli **elementi disegnati dallo user agent** — sfondo di base, scrollbar, controlli di form, colori di sistema — si adeguano automaticamente al tema del sistema operativo.

```css
:root {
  color-scheme: light dark;   /* la pagina supporta entrambi */
}
```

Con `light dark` attivo si sblocca la funzione **`light-dark()`**, che sceglie tra due colori in base allo schema attivo — senza scrivere una media query:

```css
:root { color-scheme: light dark; }

body {
  color: light-dark(#1a1a1a, #eaeaea);
  background: light-dark(white, #14201a);
}
```

`color-scheme` è Baseline dal 2022; `light-dark()` è **newly available** dal 2024 e **richiede** che `color-scheme` sia impostato. Riferimenti: [color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme) e [light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) su MDN.

## `accent-color` — tinta dei controlli di form

`accent-color` re-tinta i controlli nativi (`checkbox`, `radio`, `range`, `<progress>`) con il colore del brand, mantenendone l'aspetto di sistema:

```css
:root {
  accent-color: oklch(0.62 0.17 250);
}
```

Il valore di default `auto` usa la tinta della piattaforma. È supportato da tutti i browser moderni (dal 2021–2022 circa), ma MDN **non** lo classifica come Baseline pieno perché alcuni dettagli di resa (es. il contrasto garantito) variano tra browser ([accent-color — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/accent-color)).

## Reagire alla preferenza dell'utente

Per applicare colori diversi in base al tema scelto dall'utente si usa la media query `@media (prefers-color-scheme: dark | light)`. Insieme a `color-scheme` è la base del dark mode: la trattazione completa è nel modulo [[11-responsive]].

Collegamenti: [[06-unita-valori-funzioni]] · [[10-sfondi-effetti]] · [[11-responsive]]

## 🔁 Ripasso lampo

**1.** Come si scrive un rosso semitrasparente con la sintassi moderna di `rgb()`, e qual è la forma legacy equivalente?
> [!success]- Risposta
> Moderna: `rgb(255 0 0 / 50%)` (canali separati da spazi, alpha dopo `/`). Legacy: `rgba(255, 0, 0, 0.5)` con le virgole. Oggi `rgba()` è solo un alias di `rgb()`.

**2.** Perché `oklch()` è preferibile a `hsl()` per costruire una palette?
> [!success]- Risposta
> Perché è **percettivamente uniforme**: a parità di `L` (lightness) tinte diverse appaiono ugualmente chiare, quindi ruotare solo `H` dà colori bilanciati. In più copre un **gamut più ampio** (Display P3), oltre l'sRGB di `hsl()`.

**3.** Che differenza c'è tra `background: rgb(0 0 0 / .5)` e `opacity: .5` sullo stesso elemento?
> [!success]- Risposta
> L'alpha nel colore rende semitrasparente **solo lo sfondo**; testo e bordi restano opachi. `opacity` sbiadisce l'**intero elemento** (figli compresi) e crea un nuovo stacking context.

**4.** A cosa serve `color-mix(in oklch, var(--brand), white 20%)`?
> [!success]- Risposta
> A mescolare `--brand` con il 20% di bianco nello spazio `oklch`, ottenendo una variante più chiara del colore di brand senza preprocessori.

**5.** Cosa fa `oklch(from var(--brand) l c h / 50%)` e cos'è `currentColor`?
> [!success]- Risposta
> La *relative color syntax* prende `--brand`, ne estrae i canali `l c h` e li riemette invariati ma con alpha al 50% — cioè la stessa tinta semitrasparente. `currentColor` invece risolve al valore calcolato della proprietà `color`, così bordi/sfondi/SVG possono "seguire" il colore del testo.

**6.** A cosa serve impostare `color-scheme: light dark` su `:root`?
> [!success]- Risposta
> Dichiara che la pagina supporta entrambi i temi: gli elementi resi dallo user agent (scrollbar, controlli di form, colori di sistema) si adeguano al tema del SO, e si sblocca la funzione `light-dark()` per scegliere due colori senza media query.

**In sintesi:**
- Un colore si può scrivere in molti modi; per palette curate preferire **`oklch()`** (uniforme e wide-gamut), tenendo hex/`rgb()`/`hsl()` per casi comuni e valori ereditati.
- Sintassi moderna di `rgb()`/`hsl()`: **spazi** tra i canali e **alpha dopo `/`**; la forma con **virgole** (`rgba()`/`hsla()`) è legacy ma valida.
- `color-mix()` mescola, la **relative color syntax** deriva varianti: gestione della palette in CSS puro, senza Sass.
- **Alpha** = trasparenza di un singolo colore; **`opacity`** = trasparenza dell'intero elemento. `color-scheme` + `light-dark()` per il tema chiaro/scuro; `accent-color` per i controlli di form.
