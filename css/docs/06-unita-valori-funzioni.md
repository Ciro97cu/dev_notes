---
modulo: 6
titolo: "Unità, valori & funzioni"
tags: [tipo/modulo, unita]
---
# 06 · Unità, valori & funzioni

> modulo 6 — *CSS* · rif. MDN

Ogni dichiarazione CSS ha la forma `property: value`, e il **valore** ha un tipo: una keyword predefinita, un colore, una lunghezza, un numero, una percentuale, il risultato di una funzione. Questo modulo mette a fuoco le **unità di misura** (assolute e relative), le **funzioni matematiche** (`calc()`, `clamp()`, `min()`, `max()`) e le **custom properties** — lo strumento con cui il CSS moderno rende i valori dinamici e riutilizzabili.

## Tipi di valore

A seconda della proprietà, un valore può essere:

- **keyword predefinite** — parole chiave che la proprietà accetta: `display: flex`, `position: absolute`, `color: red`. Sono l'insieme *chiuso* di valori validi per quella proprietà.
- **lunghezze** (`<length>`) — una misura seguita da un'**unità**: `16px`, `1.5rem`, `50vh`. Il numero da solo non basta (tranne dove la proprietà lo prevede): `margin: 10` è invalido, serve `margin: 10px`.
- **numeri** (`<number>` / `<integer>`) — valori *senza* unità dove la proprietà lo richiede: `opacity: 0.5`, `z-index: 10`, `line-height: 1.5`.
- **percentuali** (`<percentage>`) — relative a una grandezza di riferimento che **dipende dalla proprietà** (vedi sotto).
- **funzioni** — `calc()`, `var()`, `clamp()`, `linear-gradient()`, `rgb()`… restituiscono un valore calcolato.

> [!tip]
> La distinzione **lunghezza vs numero** è la fonte di errori più comune all'inizio: `line-height: 1.5` (numero, si moltiplica per il font-size) è diverso da `line-height: 1.5rem` (lunghezza fissa). Il primo scala con la tipografia, il secondo no.

## Unità assolute

Un'unità **assoluta** rappresenta una misura fissa, indipendente dal contesto. In pratica sul web se ne usa **una sola**: `px`.

| Unità | Cos'è | Conversione |
|-------|-------|-------------|
| `px`  | pixel CSS (unità di riferimento, vedi [DPR](#hardware-pixel-vs-css-pixel-e-dpr)) | `1in = 96px` |
| `pt`  | punto tipografico | `1pt = 1in / 72` |
| `pc`  | pica | `1pc = 12pt` |
| `in`  | pollice | `1in = 2.54cm = 96px` |
| `cm`  | centimetro | `1cm = 96px / 2.54` |
| `mm`  | millimetro | `1mm = 1cm / 10` |

`pt`, `cm`, `mm`, `in`, `pc` hanno senso solo quando l'output ha dimensioni fisiche note — cioè nella **stampa** (fogli di stile `@media print`). Su schermo si usa `px`, perché è l'unità mappata sul sistema di rendering del browser.

> [!warning]
> Le unità assolute **non scalano** con le preferenze dell'utente. Se il font di base è fissato in `px`, chi ha impostato un testo più grande nel browser non viene rispettato. Per la tipografia si preferiscono le unità relative (`rem`) — vedi [Quando usare cosa](#quando-usare-cosa).

## Unità relative

Un'unità **relativa** si calcola rispetto a *qualcos'altro*: il font di un elemento, quello della root, o le dimensioni del viewport. È ciò che rende un layout scalabile.

### `%` — relativa al contenitore

La percentuale si riferisce a una grandezza del **genitore**, ma *quale* grandezza dipende dalla proprietà: `width: 50%` è metà della larghezza del contenitore, `line-height: 150%` è 1,5× il font-size, `padding: 10%` (anche verticale) è sempre relativo alla **larghezza** del blocco contenitore.

### `em` — relativa al font dell'elemento

`1em` = font-size **calcolato dell'elemento stesso**. Su `font-size`, però, `em` si riferisce al font-size **ereditato** dal genitore (altrimenti si autoreferenzierebbe). Ottima per spaziature legate al testo: un `padding: 1em` su un bottone cresce insieme al suo testo.

```css
.card {
  font-size: 1.25rem;
  padding: 1em;      /* = 1.25rem, cioè legato al font della card */
}
```

> [!warning]
> `em` **si compone** lungo l'albero: se un genitore ha `font-size: 1.2em` e il figlio pure, il figlio risulta `1.2 × 1.2 = 1.44em` rispetto al nonno. In gerarchie annidate (liste dentro liste) la dimensione può esplodere o rimpicciolirsi a valanga. Per la dimensione del testo `rem` evita il problema.

### `rem` — relativa alla root

`1rem` = font-size dell'elemento **root** (`<html>`), di default `16px` nei browser. A differenza di `em` **non si compone**: `1.5rem` vale lo stesso ovunque nel documento. È l'unità di riferimento per tipografia e spaziature scalabili.

```css
html { font-size: 100%; }   /* rispetta l'impostazione dell'utente: 16px di default */

h1   { font-size: 2rem; }   /* 32px, ma scala se l'utente ingrandisce */
.stack > * + * { margin-block-start: 1rem; }
```

### `vw` / `vh` — relative al viewport

`1vw` = 1% della **larghezza** del viewport; `1vh` = 1% della sua **altezza**. Utili per elementi che devono occupare una frazione dello schermo (hero a tutta pagina, tipografia fluida).

### `vmin` / `vmax`

`1vmin` = 1% del lato **più corto** del viewport; `1vmax` = 1% del lato **più lungo**. Seguono l'orientamento del dispositivo: `vmin` è ottimo per elementi che devono restare interamente visibili sia in verticale sia in orizzontale.

### `ch` / `ex` — relative alla forma del carattere

`1ch` è la larghezza del glifo `0` (zero) del font corrente; `1ex` è la **x-height** (altezza della `x` minuscola). `ch` è preziosa per limitare la **misura di riga**: `max-width: 65ch` produce righe lunghe circa 65 caratteri, la finestra di leggibilità consigliata.

```css
article { max-width: 70ch; }   /* righe leggibili senza dipendere dai px */
```

### `lh` / `rlh` — relative all'altezza di riga

`1lh` è la **`line-height` calcolata dell'elemento corrente**; `1rlh` è la `line-height` dell'elemento **root** (`<html>`). Stanno a `line-height` come `em`/`rem` stanno a `font-size`: la prima segue il testo locale, la seconda un riferimento globale. Servono a dimensionare qualcosa in "numero di righe" invece che in pixel — l'altezza esatta di una riga per un badge o un'icona inline, o spaziature verticali agganciate al *ritmo* tipografico della pagina.

```css
.badge {
  height: 1lh;                 /* alto esattamente quanto una riga di testo */
  display: inline-flex;
  align-items: center;
}

.note {
  padding-block: 0.5rlh;       /* mezza riga sopra e sotto, coerente col root */
}
```

> [!info|label:Baseline]
> `lh`/`rlh` sono **Baseline: widely available**: Chrome/Edge 109 (gennaio 2023), Safari 16.4 (marzo 2023), Firefox 120 (novembre 2023). Ormai utilizzabili senza fallback ([Can I Use](https://caniuse.com/mdn-css_types_length_lh)). *(verificato: 2026-08-13)*

## Unità viewport dinamiche (`dvh`/`svh`/`lvh`)

Su mobile `100vh` ha un difetto storico: **non tiene conto della barra degli indirizzi** che appare e scompare durante lo scroll. Un `height: 100vh` risulta *più alto* dell'area realmente visibile quando la barra è presente, tagliando il contenuto in fondo. Per risolverlo il CSS definisce **tre misure** del viewport, ciascuna con la famiglia completa (`vh`/`vw`/`vmin`/`vmax`/`vi`/`vb`):

- **`svh` / `svw` — small viewport**: il viewport **più piccolo**, cioè con le barre del browser *espanse*. Sicuro: il contenuto non viene mai coperto, ma può lasciare spazio vuoto quando le barre si ritraggono.
- **`lvh` / `lvw` — large viewport**: il viewport **più grande**, con le barre *ritratte*. `vh` classico equivale oggi a `lvh`.
- **`dvh` / `dvw` — dynamic viewport**: si **adatta in tempo reale** al comparire/sparire delle barre. Il valore cambia durante lo scroll, quindi è quello che tiene sempre l'elemento a filo dell'area visibile.

```css
.hero {
  min-height: 100svh;   /* riempie l'area visibile anche con la barra espansa */
}

.overlay {
  height: 100dvh;       /* segue la UI del browser mentre l'utente scorre */
}
```

> [!info|label:Baseline]
> Le unità viewport dinamiche (`svh`/`lvh`/`dvh` e famiglia) sono **Baseline "widely available"**: Chrome/Edge 108+, Firefox 101+, Safari 15.4+ ([Can I Use](https://caniuse.com/viewport-unit-variants)). Utilizzabili senza fallback nella baseline di metà 2026.

> [!warning]
> `dvh` fa **ricalcolare il layout** a ogni cambio di UI durante lo scroll: può risultare "nervoso". Per una hero statica spesso `svh` (stabile e mai troppo alto) è la scelta migliore; `dvh` si riserva a elementi che devono davvero inseguire l'area visibile.

## Quando usare cosa

Non esiste l'unità "giusta" in assoluto: si sceglie in base a *cosa deve scalare con cosa*.

| Serve… | Unità consigliata | Perché |
|--------|-------------------|--------|
| Tipografia e spaziature globali | `rem` | Scala con la preferenza dell'utente, non si compone |
| Spaziatura legata al testo locale (padding di un bottone) | `em` | Cresce con il font dell'elemento |
| Larghezze di layout | `%`, `fr` (grid), `vw` | Relative al contenitore o al viewport |
| Altezze piene su mobile | `svh` / `dvh` | Gestiscono la barra indirizzi |
| Misura di riga leggibile | `ch` | Legata alla larghezza dei caratteri |
| Bordi sottili, valori fissi 1:1 con lo schermo | `px` | Non devono scalare |

## Hardware pixel vs CSS pixel e DPR

Il `px` del CSS **non** è un pixel fisico dello schermo: è un **pixel di riferimento** (o *software pixel*), un'unità logica indipendente dal dispositivo. Sugli schermi ad alta densità (Retina e simili) un pixel CSS viene reso da **più pixel fisici**.

Il rapporto tra i due è il **device pixel ratio** (DPR), leggibile in JavaScript con `window.devicePixelRatio`:

```
pixel fisici = pixel CSS × devicePixelRatio
```

- **DPR 1** — schermo classico: 1 px CSS = 1 pixel fisico.
- **DPR 2** — Retina/HiDPI: 1 px CSS = una griglia 2×2 di pixel fisici (4 in tutto), stessa dimensione visiva ma più nitido.
- **DPR 3** — display di fascia alta: griglia 3×3.

Grazie a questo meccanismo `width: 100px` occupa lo stesso spazio visivo su tutti i dispositivi, mentre lo schermo ad alta densità aggiunge nitidezza. La conseguenza pratica: le **immagini raster** vanno fornite a risoluzione maggiore (2×, 3×) per non apparire sfocate — questione ripresa in [[11-responsive]].

## `calc()` — aritmetica tra unità

`calc()` esegue calcoli nel valore, e soprattutto permette di **mischiare unità diverse** — cosa impossibile con un valore statico: "il 100% meno 2rem" si esprime solo così.

```css
.sidebar {
  width: calc(100% - 250px);   /* tutto tranne la colonna fissa */
}

.title {
  font-size: calc(1.5rem + 1vw);
}
```

Operatori: `+`, `-`, `*`, `/`, con la precedenza usuale.

> [!warning]
> Attorno a `+` e `-` gli **spazi sono obbligatori**: `calc(100% - 20px)` è valido, `calc(100%-20px)` **no** (il parser legge `-20px` come numero negativo). Per `*` e `/` gli spazi sono opzionali ma consigliati.

`calc()` si annida (i `calc()` interni valgono come parentesi) e lavora naturalmente con le custom properties: `calc(var(--gap) * 2)`.

## `clamp()`, `min()`, `max()` — dimensioni fluide

Queste tre funzioni matematiche portano il *responsive* dentro il valore, spesso **eliminando le media query**.

- `min(a, b, …)` → il valore **più piccolo** della lista.
- `max(a, b, …)` → il valore **più grande**.
- `clamp(MIN, PREFERITO, MAX)` → vincola il valore *preferito* tra un minimo e un massimo. Equivale esattamente a `max(MIN, min(PREFERITO, MAX))`.

`min()`/`max()` accettano **unità miste** e semplici espressioni aritmetiche senza bisogno di `calc()`.

```css
/* Mai più larga di 40rem, ma si restringe sotto quella soglia */
.container { width: min(100%, 40rem); }

/* Almeno 60ch di larghezza, ma libera di crescere */
.reader { width: max(60ch, 50%); }
```

Il caso d'uso principe è la **tipografia fluida**: un font-size che cresce col viewport ma resta entro limiti leggibili, senza breakpoint.

```css
h1 {
  /* min 2rem · preferito 5vw · max 4rem */
  font-size: clamp(2rem, 5vw, 4rem);
}
```

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 430 232" role="img" aria-label="clamp(2rem, 5vw, 4rem): il font-size segue 5vw ma resta tra 2rem e 4rem" style="width:100%;max-width:440px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><path d="M70 50 L70 180 L390 180" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/><path d="M70 143.6 L390 143.6" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity=".4" stroke-dasharray="4 3"/><text x="64" y="147.6" font-size="9" text-anchor="end" font-weight="600" opacity=".8" fill="currentColor">2rem</text><path d="M70 91.6 L390 91.6" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity=".4" stroke-dasharray="4 3"/><text x="64" y="95.6" font-size="9" text-anchor="end" font-weight="600" opacity=".8" fill="currentColor">4rem</text><path d="M70.0 143.6 L159.6 143.6 L287.6 91.6 L390.0 91.6" fill="none" stroke="var(--link,#1572b6)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><text x="114.80000000000001" y="195" font-size="8.5" text-anchor="middle" font-weight="600" opacity=".75" fill="currentColor">resta 2rem</text><text x="223.60000000000002" y="195" font-size="8.5" text-anchor="middle" font-weight="600" opacity=".75" fill="currentColor">= 5vw</text><text x="338.8" y="195" font-size="8.5" text-anchor="middle" font-weight="600" opacity=".75" fill="currentColor">resta 4rem</text><text x="390" y="210" font-size="9" text-anchor="end" font-weight="400" opacity=".7" fill="currentColor">larghezza viewport →</text><text x="30" y="52" font-size="9" text-anchor="start" font-weight="400" opacity=".7" fill="currentColor">font-size</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem"><code>clamp(2rem, 5vw, 4rem)</code>: il <code>font-size</code> segue il valore <strong>preferito</strong> (<code>5vw</code>, cresce col viewport) ma non scende sotto <strong>2rem</strong> né supera <strong>4rem</strong> — la curva si appiattisce ai due limiti.</figcaption>
</figure>

> [!tip]
> Per rispettare lo zoom al 200% (accessibilità), nella tipografia il valore **max** dovrebbe essere almeno il doppio del **min** ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp)). `clamp(1rem, 2.5vw, 2rem)` va bene; un max troppo vicino al min blocca l'ingrandimento.

## Custom properties (`--nome` + `var()`)

Le **custom properties** (dette anche *variabili CSS*) sono il cardine del CSS moderno: valori con un nome, che si dichiarano una volta e si riusano ovunque, si sovrascrivono nella cascade e si leggono/scrivono anche da JavaScript.

Si dichiarano con il prefisso `--` e si leggono con `var()`:

```css
:root {
  --brand: #1166ff;
  --space: 1rem;
  --radius: 8px;
}

.button {
  background: var(--brand);
  padding: var(--space) calc(var(--space) * 2);
  border-radius: var(--radius);
}
```

Punti chiave:

- **Scope ed ereditarietà**: una custom property è definita sull'elemento che la dichiara e viene **ereditata** dai discendenti. Dichiararla su `:root` (l'`<html>`) la rende globale; ridichiararla su un contenitore più interno la **ridefinisce** per quel sottoalbero.
- **Override runtime**: cambiare una variabile su un contenitore aggiorna a cascata tutti i figli che la usano — base per temi, varianti e dark mode.
- **Fallback**: `var(--x, valore)` usa `valore` quando `--x` non è definita.
- **Case-sensitive**: `--brand` e `--Brand` sono due proprietà distinte.

```css
.card { --pad: 2rem; }
.card--compact { --pad: 1rem; }   /* override locale, il resto del CSS non cambia */
.card { padding: var(--pad, 1.5rem); }   /* 1.5rem se --pad non fosse definita */
```

**Con JavaScript** si leggono e scrivono via CSSOM, ideale per temi e valori calcolati a runtime:

```js
// lettura del valore calcolato
getComputedStyle(el).getPropertyValue('--brand');
// scrittura (aggiorna tutto ciò che usa var(--brand) sotto a el)
el.style.setProperty('--brand', '#e11');
```

> [!tip]
> Se un `var()` risolve a un valore non valido per quella proprietà, scatta il *guaranteed-invalid value*: si usa il fallback di `var()` se presente, altrimenti la proprietà torna al suo valore iniziale/ereditato. Utile per degradare con eleganza.

> [!info|label:Legacy]
> Prima delle custom properties, l'unico modo per avere "variabili" era un **preprocessore** (Sass/Less). Quelle però sono risolte *a build-time*: producono valori fissi, non cambiabili a runtime né da JS. Le custom properties CSS sono *vive* nel browser — un vantaggio che i preprocessori non hanno (cfr. [[16-future-proof]]).

## `@property` — custom properties tipizzate

Una custom property "normale" è, per il browser, un semplice **flusso di testo**: non ne conosce il tipo, quindi **non sa interpolarla** in un'animazione. L'at-rule `@property` (parte delle CSS Houdini API) la **registra** con un tipo, rendendola animabile e validabile.

```css
@property --angle {
  syntax: "<angle>";       /* il tipo del valore */
  inherits: false;         /* se ereditare ai discendenti */
  initial-value: 0deg;     /* valore di partenza */
}

.spinner {
  transform: rotate(var(--angle));
  animation: turn 1s linear infinite;
}

@keyframes turn {
  to { --angle: 360deg; }   /* ora interpolabile: rotazione fluida */
}
```

Descrittori:

- **`syntax`** (obbligatorio) — il tipo, tra virgolette: `"<color>"`, `"<length>"`, `"<number>"`, `"<angle>"`, `"<percentage>"`… con combinatori (`"<length> | <percentage>"`) o `"*"` (qualsiasi valore).
- **`inherits`** (obbligatorio) — `true`/`false`.
- **`initial-value`** — **obbligatorio** salvo quando `syntax` è `"*"`; deve essere *computazionalmente indipendente* (es. `200px` va bene, `3em` no perché dipende dal font).

Senza `@property`, animare `--angle` da `0deg` a `360deg` produrrebbe uno **scatto** (interpolazione *discrete*); registrandola, il browser sa che è un `<angle>` e la interpola con continuità. Lo stesso vale per animare un `<color>` o una `<length>` dentro una variabile — utile per gradienti animati (cfr. [[10-sfondi-effetti]]).

> [!info|label:Baseline]
> `@property` è **Baseline "widely available" (2024)** ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@property)). L'equivalente JavaScript è `CSS.registerProperty({ name, syntax, inherits, initialValue })`.

## Funzioni che compaiono altrove

Molte funzioni CSS producono valori specifici di un dominio e sono trattate nei moduli dedicati: `rgb()`/`hsl()`/`oklch()`/`color-mix()` per i [[07-colori]]; `linear-gradient()`/`radial-gradient()` e simili in [[10-sfondi-effetti]]; `translate()`/`rotate()`/`scale()` in [[14-transforms]]; `minmax()`/`repeat()`/`fit-content()` in [[13-grid]].

Collegamenti: [[05-box-model]] · [[07-colori]] · [[10-sfondi-effetti]] · [[11-responsive]]

## Ripasso lampo

<details>
<summary>Qual è la differenza tra <code>em</code> e <code>rem</code>, e quando si preferisce l'una all'altra?</summary>

`em` è relativa al font-size dell'**elemento** (e **si compone** nelle gerarchie annidate); `rem` è relativa al font-size della **root** (`<html>`) e **non si compone**. Per la tipografia e le spaziature globali si usa `rem` (prevedibile); `em` per spaziature che devono seguire il testo locale (es. padding di un bottone).

</details>

<details>
<summary>Perché <code>100vh</code> dà problemi su mobile e cosa lo risolve?</summary>

`vh` (≡ `lvh`) non tiene conto della barra degli indirizzi che appare/scompare durante lo scroll, quindi `100vh` risulta più alto dell'area visibile. Si usano le unità dinamiche: `svh` (viewport minimo, sicuro e stabile), `lvh` (massimo) e `dvh` (si adatta in tempo reale alla UI del browser).

</details>

<details>
<summary>Cosa significa <code>clamp(2rem, 5vw, 4rem)</code> e a cosa equivale con <code>min()</code>/<code>max()</code>?</summary>

Un valore fluido: preferito `5vw`, ma mai sotto `2rem` né sopra `4rem`. Equivale a `max(2rem, min(5vw, 4rem))`. Serve per tipografia/spaziatura fluida senza media query.

</details>

<details>
<summary>Cosa distingue una custom property da una variabile di Sass?</summary>

La custom property CSS (`--nome`, letta con `var()`) è **viva nel browser**: eredita nella cascade, si sovrascrive per sottoalbero e si legge/scrive da JavaScript a runtime. Le variabili Sass sono risolte a build-time e producono valori fissi.

</details>

<details>
<summary>Perché serve <code>@property</code> per animare una variabile?</summary>

Una custom property non registrata è per il browser un flusso di testo di tipo *discrete*: passa a scatti. `@property` la registra con un `syntax` (es. `"<angle>"`), così il browser sa interpolarla e l'animazione diventa fluida. Richiede `syntax` e `inherits`, più `initial-value` (salvo `syntax: "*"`).

</details>

<details>
<summary>Il <code>px</code> del CSS è un pixel fisico dello schermo?</summary>

No: è un pixel **di riferimento** (logico). Su schermi ad alta densità il **device pixel ratio** (DPR) mappa 1 px CSS su più pixel fisici (DPR 2 → griglia 2×2). `pixel fisici = pixel CSS × devicePixelRatio`.

</details>

<details>
<summary>Cosa valgono <code>1lh</code> e <code>1rlh</code>, e quando tornano utili?</summary>

`1lh` è la `line-height` **calcolata dell'elemento corrente**; `1rlh` quella dell'elemento **root** (stanno a `line-height` come `em`/`rem` a `font-size`). Servono a misurare in "numero di righe" invece che in pixel: `height: 1lh` per un badge alto quanto una riga, `padding-block: 0.5rlh` per spaziature agganciate al ritmo tipografico. Baseline widely available.

</details>

**In sintesi:**
- I valori hanno un **tipo** (keyword, lunghezza, numero, percentuale, funzione); numero ≠ lunghezza (`line-height: 1.5` vs `1.5rem`).
- Su schermo l'unica assoluta utile è `px`; le relative scalano: `rem` (tipografia/spaziatura), `em` (relativa al testo), `%`/`vw`/`vh` (layout), `svh`/`dvh` (altezze mobile), `ch` (misura di riga), `lh`/`rlh` (altezza di riga).
- `calc()` mischia unità (spazi obbligatori attorno a `+`/`-`); `clamp()`/`min()`/`max()` danno dimensioni fluide senza media query.
- Le **custom properties** (`--nome` + `var(--nome, fallback)`) sono variabili vive: ereditano, si sovrascrivono nella cascade e si pilotano da JS; `@property` le tipizza per poterle **animare**.
