---
modulo: 7
titolo: "Colori"
tags: [tipo/modulo, colori]
---
# 07 · Colori
> modulo 7 — *CSS* · rif. MDN

Un colore in CSS è un **valore** come un altro: si assegna a proprietà quali `color` (il testo), `background-color`, `border-color`, `box-shadow` e decine di altre. Esistono però tanti **modi di scriverlo** (parole chiave, esadecimale, `rgb()`, `hsl()`, e le notazioni moderne `oklch()`/`oklab()`) e ognuno appartiene a uno **spazio colore** diverso. Questo modulo copre come esprimere un colore oggi, quando conviene ciascuna notazione, e le funzioni che permettono di **derivare** e **mescolare** colori senza preprocessori.

I colori sono un `<color>`, un tipo di valore riutilizzabile ovunque una proprietà lo accetti (vedi il concetto di tipi di valore in [[06-unita-valori-funzioni]]).

## Named colors e keyword speciali

CSS definisce ~150 **named colors** (parole chiave come `red`, `crimson`, `rebeccapurple`, `tomato`) comode per prototipare ma poco adatte a una palette curata (i valori sono fissi e disomogenei). Riferimento: [named-color su MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/named-color).

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

Prima la sostanza, in parole semplici. Ogni colore ha una **luminosità**: quanto appare chiaro o scuro all'occhio. Il guaio di `hsl()` è che la sua `L` (lightness) **non coincide** con la luminosità che si percepisce davvero: prendendo un giallo e un blu **entrambi a `L` 50%**, il giallo sembra accecante e il blu quasi notturno — stesso numero, occhio ingannato. `oklch()` nasce proprio per questo: la sua `L` è **tarata sulla percezione umana**, così due colori con la stessa `L` appaiono davvero ugualmente chiari. È questo il senso di "**percettivamente uniforme**".

La differenza si vede a colpo d'occhio — in entrambe le strisce ogni tinta ha la **stessa** `L`, cambia solo la tinta (`H`):

<div style="margin:1.1rem 0">
  <div style="font-size:.82rem;opacity:.75;margin-bottom:.3rem"><code>hsl()</code> — tutte a <code>L 50%</code>: la luminosità "balla" (giallo e ciano sparano, blu e viola si spengono)</div>
  <div style="display:flex;height:46px;border-radius:8px;overflow:hidden">
    <span style="flex:1;background:hsl(30 95% 50%)"></span><span style="flex:1;background:hsl(60 95% 50%)"></span><span style="flex:1;background:hsl(140 95% 50%)"></span><span style="flex:1;background:hsl(200 95% 50%)"></span><span style="flex:1;background:hsl(260 95% 50%)"></span><span style="flex:1;background:hsl(320 95% 50%)"></span>
  </div>
  <div style="font-size:.82rem;opacity:.75;margin:.6rem 0 .3rem"><code>oklch()</code> — tutte a <code>L 0.65</code>: la luminosità percepita resta costante</div>
  <div style="display:flex;height:46px;border-radius:8px;overflow:hidden">
    <span style="flex:1;background:oklch(0.65 0.16 30)"></span><span style="flex:1;background:oklch(0.65 0.16 60)"></span><span style="flex:1;background:oklch(0.65 0.16 140)"></span><span style="flex:1;background:oklch(0.65 0.16 200)"></span><span style="flex:1;background:oklch(0.65 0.16 260)"></span><span style="flex:1;background:oklch(0.65 0.16 320)"></span>
  </div>
</div>

Per questo `oklch()` è oggi la notazione **da preferire** per palette e sfumature: si fissa `L` (e `C`), si ruota solo `H`, e i colori restano equilibrati, nessuno "salta" fuori; le varianti più chiare o più scure si ottengono muovendo solo `L`. Tecnicamente esprime il colore nello spazio **Oklab** in coordinate polari, con tre canali:

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

`color-scheme` dichiara quali schemi un elemento (di solito `:root`) sa rendere. Impostandolo, gli **elementi disegnati dallo user agent** (sfondo di base, scrollbar, controlli di form, colori di sistema) si adeguano automaticamente al tema del sistema operativo.

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

## `contrast-color()` — il colore di massimo contrasto

Scegliere il colore del testo sopra uno sfondo variabile (un badge tinto col colore di brand, una chip generata a runtime) è un problema ricorrente: su sfondi chiari serve testo scuro, su sfondi scuri testo chiaro. `contrast-color()` lo risolve in CSS puro: dato un colore, **restituisce automaticamente il bianco o il nero**, quello dei due che garantisce il contrasto migliore rispetto a quel colore.

```css
.badge {
  background: var(--brand);
  color: contrast-color(var(--brand));   /* bianco o nero, secondo lo sfondo */
}
```

Il colore passato è di norma lo stesso usato come sfondo: così, se `--brand` cambia (tema, override locale), anche il testo si riadatta da sé, senza calcoli manuali né JavaScript. È lo strumento ideale per componenti "tematizzabili", dove il colore di sfondo non è noto in anticipo.

> [!info] Baseline
> `contrast-color()` è **Baseline: newly available** (dal 10 aprile 2026): Chrome/Edge 147, Firefox 146, Safari 26. Usabile ma non ancora "widely available" (prevista per il 2028), quindi nei progetti che devono coprire browser più datati conviene proteggerla con `@supports (color: contrast-color(red))` o affiancarle un fallback esplicito. Riferimenti: [contrast-color() — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/contrast-color) · [Can I Use](https://caniuse.com/?search=contrast-color). *(verificato: 2026-08-13)*

> [!info] Legacy
> Una proposta precedente si chiamava `color-contrast()` e aveva sintassi diversa: accettava un colore di base **più una lista di candidati** tra cui scegliere il più contrastante. Non è mai stata standardizzata in quella forma; nel codice nuovo si usa `contrast-color()`, che sceglie semplicemente tra bianco e nero.

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

## Ripasso lampo

<details>
<summary>Come si scrive un rosso semitrasparente con la sintassi moderna di <code>rgb()</code>, e qual è la forma legacy equivalente?</summary>

Moderna: `rgb(255 0 0 / 50%)` (canali separati da spazi, alpha dopo `/`). Legacy: `rgba(255, 0, 0, 0.5)` con le virgole. Oggi `rgba()` è solo un alias di `rgb()`.

</details>

<details>
<summary>Perché <code>oklch()</code> è preferibile a <code>hsl()</code> per costruire una palette?</summary>

Perché è **percettivamente uniforme**: a parità di `L` (lightness) tinte diverse appaiono ugualmente chiare, quindi ruotare solo `H` dà colori bilanciati. In più copre un **gamut più ampio** (Display P3), oltre l'sRGB di `hsl()`.

</details>

<details>
<summary>Che differenza c'è tra <code>background: rgb(0 0 0 / .5)</code> e <code>opacity: .5</code> sullo stesso elemento?</summary>

L'alpha nel colore rende semitrasparente **solo lo sfondo**; testo e bordi restano opachi. `opacity` sbiadisce l'**intero elemento** (figli compresi) e crea un nuovo stacking context.

</details>

<details>
<summary>A cosa serve <code>color-mix(in oklch, var(--brand), white 20%)</code>?</summary>

A mescolare `--brand` con il 20% di bianco nello spazio `oklch`, ottenendo una variante più chiara del colore di brand senza preprocessori.

</details>

<details>
<summary>Cosa fa <code>oklch(from var(--brand) l c h / 50%)</code> e cos'è <code>currentColor</code>?</summary>

La *relative color syntax* prende `--brand`, ne estrae i canali `l c h` e li riemette invariati ma con alpha al 50% — cioè la stessa tinta semitrasparente. `currentColor` invece risolve al valore calcolato della proprietà `color`, così bordi/sfondi/SVG possono "seguire" il colore del testo.

</details>

<details>
<summary>A cosa serve impostare <code>color-scheme: light dark</code> su <code>:root</code>?</summary>

Dichiara che la pagina supporta entrambi i temi: gli elementi resi dallo user agent (scrollbar, controlli di form, colori di sistema) si adeguano al tema del SO, e si sblocca la funzione `light-dark()` per scegliere due colori senza media query.

</details>

<details>
<summary>A cosa serve <code>color: contrast-color(var(--brand))</code>?</summary>

Restituisce automaticamente il **bianco o il nero** (quello di contrasto maggiore rispetto a `--brand`) così il testo resta leggibile su uno sfondo che cambia (temi, colori generati a runtime) senza calcoli manuali. È Baseline newly available dal 2026: da proteggere con `@supports` sui target più datati.

</details>

**In sintesi:**
- Un colore si può scrivere in molti modi; per palette curate preferire **`oklch()`** (uniforme e wide-gamut), tenendo hex/`rgb()`/`hsl()` per casi comuni e valori ereditati.
- Sintassi moderna di `rgb()`/`hsl()`: **spazi** tra i canali e **alpha dopo `/`**; la forma con **virgole** (`rgba()`/`hsla()`) è legacy ma valida.
- `color-mix()` mescola, la **relative color syntax** deriva varianti: gestione della palette in CSS puro, senza Sass.
- **Alpha** = trasparenza di un singolo colore; **`opacity`** = trasparenza dell'intero elemento. `color-scheme` + `light-dark()` per il tema chiaro/scuro; `contrast-color()` per il testo di massimo contrasto su sfondi variabili; `accent-color` per i controlli di form.
