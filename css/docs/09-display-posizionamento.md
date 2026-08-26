---
modulo: 9
titolo: "Display & posizionamento"
tags: [tipo/modulo, layout, posizionamento]
---
# 09 · Display & posizionamento
> modulo 9 — *CSS* · rif. MDN

Prima di impilare gli elementi con Flexbox o Grid serve capire due leve fondamentali del layout: `display` (**che tipo di scatola** genera un elemento) e `position` — **come e rispetto a cosa** quella scatola viene collocata. Da qui discendono lo *stacking* (`z-index`), la gestione del contenuto che trabocca (`overflow`) e la tecnica storica del `float`. Il *box model* di ogni scatola è il prerequisito: vedi [[05-box-model]].

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
> `opacity` è l'unica delle tre a essere **animabile in modo continuo** (fade graduale); `display` e `visibility` cambiano a scatti. Oggi si può comunque transizionare *da/verso* `display: none` abbinando `transition-behavior: allow-discrete` e `@starting-style` — supporto recente, da verificare su [Can I Use](https://caniuse.com/mdn-css_properties_transition-behavior). *(verificato: 2026-08-13)*

### `flex` e `grid`

`display: flex` e `display: grid` cambiano il tipo **interno** della scatola, attivando i due sistemi di layout moderni per disporre i figli. Sono l'argomento di [[12-flexbox]] e [[13-grid]]; qui basti sapere che si impostano sul **contenitore** e che i loro item non collassano i margini (vedi [[05-box-model]]).

## `position`: collocare la scatola

`position` decide rispetto a **cosa** un elemento viene posizionato e se resta nel normale flusso ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/position)). Gli offset si esprimono con `top`/`right`/`bottom`/`left` oppure (forma moderna e più compatta) con lo shorthand `inset`.

- **`static`** (default) — l'elemento sta nel flusso normale; gli offset e `z-index` **non hanno effetto**.
- **`relative`** — resta nel flusso (lo spazio originale è conservato), ma può essere spostato con gli offset **rispetto a sé stesso**. Usato spesso solo per fare da riferimento a un figlio `absolute`.
- **`absolute`** — **estratto dal flusso** (non lascia spazio); posizionato rispetto all'**antenato posizionato più vicino** (il primo con `position` diverso da `static`), o all'*initial containing block* se non ce n'è.
- **`fixed`** — estratto dal flusso e ancorato al **viewport**: resta fermo allo scroll. Crea sempre uno stacking context (vedi sotto).
- **`sticky`** — ibrido: si comporta come `relative` finché lo scroll non raggiunge una soglia, poi "si incolla" come `fixed` dentro il suo contenitore di scorrimento.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 466 272" role="img" aria-label="I cinque valori di position: static, relative, absolute, fixed, sticky" style="width:100%;max-width:480px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><rect x="8" y="20" width="124" height="86" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3" opacity=".8"/><rect x="20" y="32" width="100" height="15" rx="4" fill="none" stroke="currentColor" stroke-width="1.4" opacity="1"/><rect x="20" y="52" width="100" height="15" rx="4" fill="var(--link,#1572b6)" fill-opacity=".2" stroke="var(--link,#1572b6)" stroke-width="1.4" opacity="1"/><rect x="20" y="72" width="100" height="15" rx="4" fill="none" stroke="currentColor" stroke-width="1.4" opacity="1"/><text x="70.0" y="122" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">static</text><rect x="158" y="20" width="124" height="86" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3" opacity=".8"/><rect x="170" y="32" width="100" height="15" rx="4" fill="none" stroke="currentColor" stroke-width="1.4" opacity="1"/><rect x="170" y="52" width="100" height="15" rx="4" fill="none" stroke="currentColor" stroke-width="1.4" opacity="1" stroke-dasharray="4 3"/><rect x="170" y="72" width="100" height="15" rx="4" fill="none" stroke="currentColor" stroke-width="1.4" opacity="1"/><rect x="186" y="60" width="100" height="15" rx="4" fill="var(--link,#1572b6)" fill-opacity=".2" stroke="var(--link,#1572b6)" stroke-width="1.4" opacity="1"/><path d="M220 59 L228 63" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/><text x="220.0" y="122" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">relative</text><rect x="308" y="20" width="124" height="86" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3" opacity=".8"/><text x="370.0" y="31" font-size="7.5" text-anchor="middle" font-weight="600" opacity=".6" fill="currentColor">parent</text><rect x="320" y="50" width="100" height="15" rx="4" fill="none" stroke="currentColor" stroke-width="1.4" opacity="1"/><rect x="320" y="70" width="100" height="15" rx="4" fill="none" stroke="currentColor" stroke-width="1.4" opacity="1"/><rect x="386" y="38" width="34" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".2" stroke="var(--link,#1572b6)" stroke-width="1.4" opacity="1"/><text x="370.0" y="122" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">absolute</text><rect x="83" y="150" width="124" height="86" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3" opacity=".8"/><rect x="83" y="150" width="124" height="12" rx="6" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".6"/><circle cx="91" cy="156" r="1.6" fill="currentColor" opacity=".5"/><circle cx="98" cy="156" r="1.6" fill="currentColor" opacity=".5"/><circle cx="105" cy="156" r="1.6" fill="currentColor" opacity=".5"/><path d="M95 174 L195 174" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".18"/><path d="M95 186 L195 186" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".18"/><path d="M95 198 L195 198" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".18"/><path d="M95 210 L195 210" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".18"/><path d="M95 222 L195 222" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".18"/><rect x="161" y="206" width="34" height="18" rx="4" fill="var(--link,#1572b6)" fill-opacity=".2" stroke="var(--link,#1572b6)" stroke-width="1.4" opacity="1"/><path d="M101 208 L101 224" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity="1"/><path d="M101 205 L98 210 L104 210 Z" fill="currentColor"/><path d="M101 227 L98 222 L104 222 Z" fill="currentColor"/><text x="145.0" y="252" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">fixed</text><rect x="233" y="150" width="124" height="86" rx="6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3" opacity=".8"/><path d="M245 190 L345 190" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".18"/><path d="M245 202 L345 202" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".18"/><path d="M245 214 L345 214" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".18"/><path d="M245 226 L345 226" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".18"/><rect x="245" y="164" width="100" height="17" rx="4" fill="var(--link,#1572b6)" fill-opacity=".2" stroke="var(--link,#1572b6)" stroke-width="1.4" opacity="1"/><path d="M343 185.0 L343 201.0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity="1"/><path d="M343 182.0 L340 187.0 L346 187.0 Z" fill="currentColor"/><path d="M343 204.0 L340 199.0 L346 199.0 Z" fill="currentColor"/><text x="295.0" y="252" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">sticky</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem"><code>position</code>: <strong>static</strong> nel flusso normale; <strong>relative</strong> spostato ma con lo spazio originale <em>conservato</em> (tratteggio); <strong>absolute</strong> tolto dal flusso e posizionato nel genitore posizionato; <strong>fixed</strong> ancorato al viewport (fermo allo scroll); <strong>sticky</strong> incollato a una soglia durante lo scroll.</figcaption>
</figure>

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

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 430 228" role="img" aria-label="Stacking context: .b copre .inner perché confinato in .a" style="width:100%;max-width:460px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><rect x="40" y="60" width="200" height="118" rx="10" fill="var(--link,#1572b6)" fill-opacity=".10" stroke="var(--link,#1572b6)" stroke-width="1.6"/><text x="56" y="80" font-size="12" text-anchor="start" font-weight="700" opacity="1" fill="var(--link,#1572b6)">.a</text><text x="56" y="96" font-size="10" text-anchor="start" font-weight="400" opacity=".8" fill="currentColor">z-index: 1</text><text x="56" y="110" font-size="9" text-anchor="start" font-weight="400" opacity=".6" fill="currentColor">opacity 0.9 → contesto</text><rect x="66" y="116" width="150" height="56" rx="8" fill="var(--link,#1572b6)" fill-opacity=".30" stroke="var(--link,#1572b6)" stroke-width="1.6"/><text x="141" y="140" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">.inner</text><text x="141" y="156" font-size="9.5" text-anchor="middle" font-weight="400" opacity=".85" fill="currentColor">z-index: 9999</text><rect x="190" y="98" width="196" height="118" rx="10" fill="var(--bg,#ffffff)" fill-opacity="1" stroke="var(--link,#1572b6)" stroke-width="2"/><text x="288" y="90" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="var(--link,#1572b6)">.b — z-index: 2</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Contesti di impilamento: <code>.b</code> (<code>z-index: 2</code>) copre <code>.inner</code> (<code>z-index: 9999</code>) perché <code>.inner</code> è confinato nel contesto creato da <code>.a</code> (che lo genera con <code>opacity</code>). Uno stacking context è <strong>atomico</strong>: i figli non ne scavalcano i fratelli, per quanto alto sia il loro z-index.</figcaption>
</figure>

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
> Con `overflow: auto`/`scroll` la comparsa della scrollbar può spostare il layout. `scrollbar-gutter: stable` **riserva sempre** lo spazio della scrollbar, evitando lo "sfarfallio" quando appare o scompare ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-gutter)). Supporto recente (Safari da fine 2024): verificare su [Can I Use](https://caniuse.com/mdn-css_properties_scrollbar-gutter). *(verificato: 2026-08-13)*

## `content-visibility` e `contain-intrinsic-size` — saltare il rendering fuori schermo

`content-visibility: auto` è un'ottimizzazione di rendering: dice al browser di **non disegnare il contenuto di un elemento finché non serve**, cioè finché è lontano dal viewport. Il contenuto fuori schermo viene "saltato" (niente layout né paint dei figli) e renderizzato solo quando si avvicina allo scroll, alleggerendo il primo caricamento di pagine lunghe.

C'è però un effetto collaterale: un elemento il cui contenuto non è ancora stato calcolato non ha altezza propria, così la barra di scorrimento "salta" quando quel contenuto compare. `contain-intrinsic-size` lo evita fornendo una **dimensione segnaposto** da usare finché il contenuto resta saltato, mantenendo il layout stabile.

```css
.section {
  content-visibility: auto;
  contain-intrinsic-size: auto 400px;   /* alta ~400px finché non è renderizzata */
}
```

Il valore accetta una o due lunghezze (larghezza e altezza) e la keyword `auto`: con `auto <length>` il browser **ricorda** la dimensione reale dopo il primo rendering dell'elemento, usando la lunghezza indicata solo come stima iniziale. Più la stima è vicina al vero, meno si percepisce lo spostamento dello scroll.

> [!info] Baseline
> `content-visibility` e `contain-intrinsic-size` sono **Baseline: newly available** (da settembre 2024, con Safari 18 a completare il supporto; Chrome/Edge e Firefox da prima). Sono un *enhancement* di performance: dove non supportati, il contenuto viene semplicemente renderizzato subito. [MDN — content-visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility) · [Can I Use](https://caniuse.com/css-content-visibility). *(verificato: 2026-08-13)*

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

Ancorare un elemento a un altro (un *tooltip* sotto un bottone, un menu accanto al suo trigger) ha sempre richiesto JavaScript per calcolare le coordinate. L'**anchor positioning** lo rende dichiarativo in CSS: si nomina un'ancora con `anchor-name`, la si collega con `position-anchor` e si posiziona l'elemento con la funzione `anchor()` (o con `position-area`); `position-try-fallbacks` sposta l'elemento se sta per uscire dallo schermo ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning/Using)).

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
> Supporto **non ancora Baseline** (a metà 2026): implementato in Chromium (Chrome/Edge), ma Firefox e Safari sono indietro. Va usato come *progressive enhancement*, con un fallback e una verifica `@supports`. Controllare lo stato su [Can I Use](https://caniuse.com/css-anchor-positioning) prima di adottarlo in produzione. *(verificato: 2026-08-13)*

Collegamenti: [[05-box-model]] · [[10-sfondi-effetti]] · [[12-flexbox]] · [[13-grid]]

## Ripasso lampo

<details>
<summary>Che differenza c'è tra <code>display: none</code>, <code>visibility: hidden</code> e <code>opacity: 0</code>?</summary>

`display: none` rimuove la scatola dal flusso (nessuno spazio, non renderizzata, non interattiva, invisibile agli screen reader). `visibility: hidden` la nasconde ma **ne conserva lo spazio** e non è interattiva. `opacity: 0` la rende trasparente ma **resta presente e attiva**: occupa spazio, è cliccabile/focusabile e viene letta dagli screen reader.

</details>

<details>
<summary>Rispetto a cosa si posiziona un elemento <code>absolute</code>, e come si calcola una sua <code>width: 50%</code>?</summary>

Rispetto all'**antenato posizionato più vicino** (primo con `position` diverso da `static`), sul suo **padding box**. `width: 50%` è quindi metà della larghezza di quel containing block. Con `fixed` il riferimento è il **viewport**; con `static`/`relative` è il **genitore diretto**.

</details>

<details>
<summary>Ho messo <code>z-index: 9999</code> su un elemento ma resta dietro a un altro con <code>z-index: 2</code>. Perché?</summary>

L'elemento è confinato in uno **stacking context** creato da un suo antenato (spesso per un `opacity < 1`, un `transform`, o un `position` con `z-index`). Il `9999` conta solo *dentro* quel contesto: se il contesto padre ha z-index più basso del rivale, il figlio non lo scavalca. Va corretto il livello dove nasce il contesto.

</details>

<details>
<summary>Qual è la differenza tra <code>overflow: hidden</code> e <code>overflow: clip</code>?</summary>

Entrambi tagliano il contenuto in eccesso, ma `hidden` crea uno *scroll container* (scorrimento possibile via script/tastiera), mentre `clip` no — è solo un ritaglio, più leggero e senza scorrimento.

</details>

<details>
<summary>Cosa serve perché un <code>position: sticky</code> si incolli davvero?</summary>

Almeno una soglia di offset (`top`, `bottom`, ecc.), altrimenti resta `relative`. E nessun antenato deve avere un `overflow` che ne tagli lo scorrimento.

</details>

<details>
<summary>Come si contengono i float in un contenitore, oggi?</summary>

Con **`display: flow-root`** sul contenitore (Baseline): crea un block formatting context che ingloba i float. Sostituisce il vecchio **clearfix** (`::after { content: ""; display: block; clear: both; }`).

</details>

<details>
<summary>A cosa serve <code>contain-intrinsic-size</code> insieme a <code>content-visibility: auto</code>?</summary>

`content-visibility: auto` salta il rendering del contenuto fuori schermo per alleggerire il caricamento, ma un elemento non renderizzato non ha altezza: la scrollbar "salta" quando il contenuto compare. `contain-intrinsic-size` fornisce una **dimensione segnaposto** (es. `contain-intrinsic-size: auto 400px`) che tiene stabile il layout finché il contenuto è saltato. Baseline newly available (2024).

</details>

**In sintesi:**
- `display` sceglie il tipo di scatola: **block** (va a capo, rispetta width/height), **inline** (scorre nel testo, ignora width/height e margini verticali), **inline-block** (ibrido), **none** (sparisce dal flusso). `flex`/`grid` → [[12-flexbox]]/[[13-grid]].
- Nascondere: `display:none` toglie tutto, `visibility:hidden` lascia lo spazio, `opacity:0` lascia spazio **e** interattività (trappola di accessibilità).
- `position`: `static` (default), `relative` (offset da sé, resta nel flusso), `absolute` (dall'antenato posizionato), `fixed` (viewport), `sticky` (con soglia). Offset moderni con `inset`; la larghezza % dipende dal **containing block** (le tre regole).
- `z-index` ordina **solo dentro il proprio stacking context**: quando "non funziona", cercare dove nasce il contesto (spesso `opacity`/`transform`).
- `overflow`: `visible`/`hidden`/`scroll`/`auto`/`clip`, per asse con `overflow-x`/`-y`; `scrollbar-gutter: stable` evita lo sfarfallio.
- **`content-visibility: auto`** salta il rendering del contenuto fuori schermo (performance); `contain-intrinsic-size` gli dà una dimensione segnaposto per non far saltare lo scroll (Baseline 2024).
- **Float** è legacy per il layout (sì per il testo attorno alle immagini); float contenuti con `display: flow-root`. **Anchor positioning** è la via moderna per tooltip/popover ancorati, ma non ancora Baseline: usarlo come progressive enhancement.
