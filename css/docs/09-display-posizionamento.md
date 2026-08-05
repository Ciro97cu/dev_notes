---
modulo: 9
titolo: "Display & posizionamento"
tags: [tipo/modulo, layout, posizionamento]
---
# 09 · Display & posizionamento
> modulo 9 — *CSS* · rif. MDN

Prima di impilare gli elementi con Flexbox o Grid serve capire due leve fondamentali del layout: `display` — **che tipo di scatola** genera un elemento — e `position` — **come e rispetto a cosa** quella scatola viene collocata. Da qui discendono lo *stacking* (`z-index`), la gestione del contenuto che trabocca (`overflow`) e la tecnica storica del `float`. Il *box model* di ogni scatola è il prerequisito: vedi [[05-box-model]].

## `display`: il tipo di scatola

Ogni elemento genera una scatola con un **tipo esterno** (come si comporta rispetto ai vicini) e uno **interno** (come dispone i figli). La proprietà `display` li governa ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/display)). I valori base:

- **`block`** — scatola *block-level*: va a capo prima e dopo, occupa tutta la larghezza disponibile, rispetta `width`/`height` e tutti i margini/padding (anche verticali).
- **`inline`** — scatola *inline-level*: scorre nel testo senza andare a capo, **ignora** `width` e `height`, e i **margini/padding verticali non spingono via** le righe vicine (in orizzontale invece agiscono).
- **`inline-block`** — ibrido: scorre in linea come `inline`, ma rispetta `width`/`height` e **tutti** i margini/padding come `block`.
- **`none`** — l'elemento (e i suoi discendenti) non viene generato affatto: vedi sotto.

```css
nav a {
  display: inline-block;   /* link in linea, ma con width/height e padding verticale */
  padding: 8px 16px;
  width: 120px;
}
```

### Block-level vs inline: quali tag e cosa cambia

Ogni tag HTML ha un `display` di default. A grandi linee:

- **Block-level** (default `block`): `<div>`, `<p>`, `<h1>`–`<h6>`, `<section>`, `<article>`, `<header>`, `<footer>`, `<nav>`, `<ul>`/`<ol>`/`<li>`, `<form>`.
- **Inline-level** (default `inline`): `<span>`, `<a>`, `<strong>`, `<em>`, `<b>`, `<i>`, `<label>`, `<code>`.

La differenza pratica: su un elemento **inline** impostare `width: 200px` o `height` non ha effetto, e `margin-top`/`margin-bottom` non allontanano le righe adiacenti. Se serve controllarne le dimensioni verticali, si passa a `inline-block` (o lo si mette in un contesto flex/grid).

> [!tip]
> Gli elementi **replaced** (`<img>`, `<video>`, `<input>`) sono inline-level ma fanno eccezione: rispettano `width`/`height` perché il loro contenuto ha dimensioni proprie.

### Nascondere un elemento: `display:none` vs `visibility:hidden` vs `opacity:0`

Tre modi per "far sparire" qualcosa, con conseguenze molto diverse su spazio occupato, flusso e interattività:

| | occupa spazio | visibile | cliccabile / focusabile | letto dagli screen reader |
|---|:---:|:---:|:---:|:---:|
| `display: none` | no | no | no | no |
| `visibility: hidden` | **sì** | no | no | no |
| `opacity: 0` | **sì** | no | **sì** | **sì** |

- **`display: none`** rimuove del tutto la scatola dal flusso: nessuno spazio riservato, elemento e discendenti non renderizzati né esposti alle *assistive technologies* ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/display#none)).
- **`visibility: hidden`** rende invisibile l'elemento ma **ne conserva lo spazio** (resta un "buco" nel layout); non è interattivo. Un figlio può tornare visibile con `visibility: visible`.
- **`opacity: 0`** rende l'elemento trasparente ma per tutto il resto è **presente e attivo**: occupa spazio, resta cliccabile e viene comunque annunciato dagli screen reader. Da solo non basta per nascondere qualcosa in modo accessibile.

> [!warning]
> Un elemento a `opacity: 0` cattura ancora i click e riceve il focus da tastiera: è una trappola di accessibilità e di UX (bottoni "invisibili" ma premibili). Per un pannello che deve sparire davvero, usare `display: none` o combinare `opacity` con `visibility`/`pointer-events`.

> [!tip]
> `opacity` è l'unica delle tre a essere **animabile in modo continuo** (fade graduale); `display` e `visibility` cambiano a scatti. Oggi si può comunque transizionare *da/verso* `display: none` abbinando `transition-behavior: allow-discrete` e `@starting-style` — supporto recente, da verificare su [Can I Use](https://caniuse.com/mdn-css_properties_transition-behavior).

### `flex` e `grid`

`display: flex` e `display: grid` cambiano il tipo **interno** della scatola, attivando i due sistemi di layout moderni per disporre i figli. Sono l'argomento di [[12-flexbox]] e [[13-grid]]; qui basti sapere che si impostano sul **contenitore** e che i loro item non collassano i margini (vedi [[05-box-model]]).

## `position`: collocare la scatola

`position` decide rispetto a **cosa** un elemento viene posizionato e se resta nel normale flusso ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/position)). Gli offset si esprimono con `top`/`right`/`bottom`/`left` oppure — forma moderna e più compatta — con lo shorthand `inset`.

- **`static`** (default) — l'elemento sta nel flusso normale; gli offset e `z-index` **non hanno effetto**.
- **`relative`** — resta nel flusso (lo spazio originale è conservato), ma può essere spostato con gli offset **rispetto a sé stesso**. Usato spesso solo per fare da riferimento a un figlio `absolute`.
- **`absolute`** — **estratto dal flusso** (non lascia spazio); posizionato rispetto all'**antenato posizionato più vicino** (il primo con `position` diverso da `static`), o all'*initial containing block* se non ce n'è.
- **`fixed`** — estratto dal flusso e ancorato al **viewport**: resta fermo allo scroll. Crea sempre uno stacking context (vedi sotto).
- **`sticky`** — ibrido: si comporta come `relative` finché lo scroll non raggiunge una soglia, poi "si incolla" come `fixed` dentro il suo contenitore di scorrimento.

```css
.parent   { position: relative; }        /* riferimento per il figlio */
.badge    {
  position: absolute;
  inset: 8px 8px auto auto;               /* top:8 right:8 bottom:auto left:auto */
}

.header   {
  position: sticky;
  top: 0;                                 /* soglia: si incolla a 0 dal top */
}
```

### `inset`: lo shorthand moderno degli offset

`inset` imposta `top`/`right`/`bottom`/`left` in un colpo solo, con la stessa regola a 1–4 valori (TRBL) di `margin` ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/inset)). È **Baseline** dal 2021.

```css
.overlay {
  position: absolute;
  inset: 0;            /* top:0 right:0 bottom:0 left:0 → riempie il contenitore */
}
```

L'idioma `inset: 0` con `width`/`height` a `auto` **stira** l'elemento fino a riempire il containing block: comodo per overlay e sfondi. Aggiungendo `margin: auto` si ottiene anche il centraggio perfetto nei due assi.

> [!warning]
> **`sticky` richiede una soglia**: almeno uno tra `top`/`right`/`bottom`/`left` (o il corrispondente `inset-*`) deve essere impostato, altrimenti l'elemento resta semplicemente `relative` e non si incolla mai. Attenzione anche agli antenati con `overflow: hidden`, che possono "tagliare" lo scorrimento dell'elemento sticky.

### Containing block: le tre regole sulla larghezza in %

Quando la posizione o una `width`/`height` sono espresse in **percentuale**, il valore si calcola sul *containing block* — e quale sia dipende dal `position`:

1. **`fixed`** → il **viewport** (la finestra). `width: 50%` = metà della larghezza visibile.
2. **`absolute`** → l'**antenato posizionato più vicino**, misurato sul suo **padding box** (il padding dell'antenato è incluso nell'area di riferimento).
3. **`static` / `relative`** → il **genitore diretto** (il *content box* dell'antenato block più vicino).

```css
/* fixed: 50% del viewport */
.modal   { position: fixed;    width: 50%; }

/* absolute: 50% del .parent posizionato, padding incluso */
.parent  { position: relative; padding: 40px; }
.child   { position: absolute; width: 50%; }
```

> [!warning]
> Un antenato con `transform`, `filter` o `perspective` diversi da `none` diventa il containing block anche per i discendenti `fixed`: un elemento `fixed` "aggrappato al viewport" può quindi restare intrappolato dentro quel genitore. È una causa frequente di `fixed` che "non funziona". ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/position#fixed))

## `z-index` e stacking context

Quando le scatole si sovrappongono, l'ordine sull'asse z è deciso dal **contesto di impilamento** (*stacking context*). `z-index` (un intero, anche negativo) ordina gli elementi **solo all'interno del proprio stacking context** — non a livello globale ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)).

Un nuovo stacking context nasce, tra gli altri casi, quando un elemento ha:

- `position: relative`/`absolute` **con `z-index` diverso da `auto`**;
- `position: fixed` o `position: sticky` (sempre);
- `opacity` minore di `1`;
- `transform`, `filter`, `clip-path`, `mask`, `perspective` diversi da `none`;
- `isolation: isolate`;
- `mix-blend-mode` diverso da `normal`, oppure `will-change` su una di queste proprietà.

Il punto chiave: **uno stacking context è atomico**. Una volta che un elemento ne crea uno, tutti i suoi discendenti sono impilati *dentro* di esso e non possono "scavalcare" un fratello del genitore, per quanto alto sia il loro `z-index`.

```css
.a { position: relative; z-index: 1; opacity: 0.9; }  /* crea uno stacking context */
.a .inner { position: relative; z-index: 9999; }       /* confinato dentro .a */

.b { position: relative; z-index: 2; }                 /* fratello di .a */
/* .b sta SOPRA .inner, benché 2 < 9999: .inner è prigioniero di .a (z-index 1 < 2) */
```

> [!tip]
> `z-index` che "non funziona" è quasi sempre questo: l'elemento è chiuso in uno stacking context creato da un antenato (spesso da un `opacity` o un `transform` insospettabili). Prima di alzare i numeri, individuare **dove nasce** il contesto. `isolation: isolate` è il modo pulito per creare di proposito un contesto senza altri effetti collaterali.

## `overflow`: contenuto che trabocca

`overflow` decide cosa succede quando il contenuto eccede la scatola ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow)). È lo shorthand di `overflow-x` e `overflow-y`:

- **`visible`** (default) — il contenuto **deborda** ed è visibile fuori dalla scatola.
- **`hidden`** — il contenuto in eccesso è **tagliato**; niente scrollbar, ma resta scrollabile via script/tastiera (l'elemento è un *scroll container*).
- **`scroll`** — sempre tagliato e con scrollbar **sempre presenti**, anche se non serve scorrere.
- **`auto`** — tagliato, con scrollbar **solo quando servono**. È la scelta usuale per aree scrollabili.
- **`clip`** — come `hidden` ma **non crea uno scroll container**: nessuno scorrimento possibile, nemmeno da script. Più leggero quando si vuole solo ritagliare. Baseline dal 2022 circa.

```css
.card   { overflow: hidden; }           /* entrambi gli assi */
.table  { overflow-x: auto;             /* scroll orizzontale solo se serve */
          overflow-y: hidden; }
.chip   { overflow: clip; }             /* ritaglio secco, nessuno scroll */
```

Impostando i due assi con un solo valore misto vale la scorciatoia `overflow: hidden auto` (prima X, poi Y). Un valore diverso da `visible`/`clip` su una scatola crea un *block formatting context*, utile anche per **contenere i float** e per fermare il *margin collapsing* (vedi [[05-box-model]]).

> [!tip]
> Con `overflow: auto`/`scroll` la comparsa della scrollbar può spostare il layout. `scrollbar-gutter: stable` **riserva sempre** lo spazio della scrollbar, evitando lo "sfarfallio" quando appare o scompare ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-gutter)). Supporto recente (Safari da fine 2024): verificare su [Can I Use](https://caniuse.com/mdn-css_properties_scrollbar-gutter).

## Float

> [!info] Legacy
> Il `float` nasce per un solo scopo tipografico: far **scorrere il testo attorno a un'immagine** (impaginazione stile rivista). Per anni è stato però piegato a costruire **layout a colonne**, in mancanza di alternative — con tutti i grattacapi del caso. Oggi per il layout si usano Flexbox e Grid ([[12-flexbox]], [[13-grid]]): il `float` resta valido solo per il suo uso originario e per capire codice datato.

I valori sono `float: left`, `float: right`, `float: none` (default) e le varianti logiche `inline-start`/`inline-end`. Un elemento *floated* viene spinto a lato del contenitore e **tolto dal flusso normale**, mentre il contenuto seguente gli scorre intorno:

```css
img.wrap {
  float: left;
  margin-inline-end: 1rem;   /* stacca il testo dall'immagine */
}
```

**Il problema del collasso.** Un contenitore i cui figli sono *tutti* floated collassa ad altezza zero (i float non contano nel calcolo dell'altezza del genitore). Storicamente si risolveva con il **clearfix**, uno pseudo-elemento che "chiude" i float con la proprietà `clear` (`left`/`right`/`both`):

```css
/* clearfix legacy */
.container::after {
  content: "";
  display: block;
  clear: both;      /* scende sotto i float precedenti */
}
```

> [!tip]
> La sostituzione moderna del clearfix è **`display: flow-root`** sul contenitore: crea un nuovo *block formatting context* che **contiene i float** senza pseudo-elementi né hack. È Baseline ed è la via da preferire nel codice nuovo ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/display-box#flow-root)).

## Anchor positioning (emergente)

Ancorare un elemento a un altro — un *tooltip* sotto un bottone, un menu accanto al suo trigger — ha sempre richiesto JavaScript per calcolare le coordinate. L'**anchor positioning** lo rende dichiarativo in CSS: si nomina un'ancora con `anchor-name`, la si collega con `position-anchor` e si posiziona l'elemento con la funzione `anchor()` (o con `position-area`); `position-try-fallbacks` sposta l'elemento se sta per uscire dallo schermo ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning/Using)).

```css
.btn     { anchor-name: --trigger; }
.tooltip {
  position: fixed;
  position-anchor: --trigger;
  top: anchor(bottom);      /* allineato al bordo inferiore dell'ancora */
  left: anchor(center);
  margin-top: 8px;
}
```

> [!warning]
> Supporto **non ancora Baseline** (a metà 2026): implementato in Chromium (Chrome/Edge), ma Firefox e Safari sono indietro. Va usato come *progressive enhancement*, con un fallback e una verifica `@supports`. Controllare lo stato su [Can I Use](https://caniuse.com/css-anchor-positioning) prima di adottarlo in produzione.

Collegamenti: [[05-box-model]] · [[10-sfondi-effetti]] · [[12-flexbox]] · [[13-grid]]

## Ripasso lampo

**1.** Che differenza c'è tra `display: none`, `visibility: hidden` e `opacity: 0`?
> [!success]- Risposta
> `display: none` rimuove la scatola dal flusso (nessuno spazio, non renderizzata, non interattiva, invisibile agli screen reader). `visibility: hidden` la nasconde ma **ne conserva lo spazio** e non è interattiva. `opacity: 0` la rende trasparente ma **resta presente e attiva**: occupa spazio, è cliccabile/focusabile e viene letta dagli screen reader.

**2.** Rispetto a cosa si posiziona un elemento `absolute`, e come si calcola una sua `width: 50%`?
> [!success]- Risposta
> Rispetto all'**antenato posizionato più vicino** (primo con `position` diverso da `static`), sul suo **padding box**. `width: 50%` è quindi metà della larghezza di quel containing block. Con `fixed` il riferimento è il **viewport**; con `static`/`relative` è il **genitore diretto**.

**3.** Ho messo `z-index: 9999` su un elemento ma resta dietro a un altro con `z-index: 2`. Perché?
> [!success]- Risposta
> L'elemento è confinato in uno **stacking context** creato da un suo antenato (spesso per un `opacity < 1`, un `transform`, o un `position` con `z-index`). Il `9999` conta solo *dentro* quel contesto: se il contesto padre ha z-index più basso del rivale, il figlio non lo scavalca. Va corretto il livello dove nasce il contesto.

**4.** Qual è la differenza tra `overflow: hidden` e `overflow: clip`?
> [!success]- Risposta
> Entrambi tagliano il contenuto in eccesso, ma `hidden` crea uno *scroll container* (scorrimento possibile via script/tastiera), mentre `clip` no — è solo un ritaglio, più leggero e senza scorrimento.

**5.** Cosa serve perché un `position: sticky` si incolli davvero?
> [!success]- Risposta
> Almeno una soglia di offset (`top`, `bottom`, ecc.), altrimenti resta `relative`. E nessun antenato deve avere un `overflow` che ne tagli lo scorrimento.

**6.** Come si contengono i float in un contenitore, oggi?
> [!success]- Risposta
> Con **`display: flow-root`** sul contenitore (Baseline): crea un block formatting context che ingloba i float. Sostituisce il vecchio **clearfix** (`::after { content: ""; display: block; clear: both; }`).

**In sintesi:**
- `display` sceglie il tipo di scatola: **block** (va a capo, rispetta width/height), **inline** (scorre nel testo, ignora width/height e margini verticali), **inline-block** (ibrido), **none** (sparisce dal flusso). `flex`/`grid` → [[12-flexbox]]/[[13-grid]].
- Nascondere: `display:none` toglie tutto, `visibility:hidden` lascia lo spazio, `opacity:0` lascia spazio **e** interattività (trappola di accessibilità).
- `position`: `static` (default), `relative` (offset da sé, resta nel flusso), `absolute` (dall'antenato posizionato), `fixed` (viewport), `sticky` (con soglia). Offset moderni con `inset`; la larghezza % dipende dal **containing block** (le tre regole).
- `z-index` ordina **solo dentro il proprio stacking context**: quando "non funziona", cercare dove nasce il contesto (spesso `opacity`/`transform`).
- `overflow`: `visible`/`hidden`/`scroll`/`auto`/`clip`, per asse con `overflow-x`/`-y`; `scrollbar-gutter: stable` evita lo sfarfallio.
- **Float** è legacy per il layout (sì per il testo attorno alle immagini); float contenuti con `display: flow-root`. **Anchor positioning** è la via moderna per tooltip/popover ancorati, ma non ancora Baseline: usarlo come progressive enhancement.
