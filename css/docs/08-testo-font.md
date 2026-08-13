---
modulo: 8
titolo: "Testo & font"
tags: [tipo/modulo, testo]
---
# 08 · Testo & font
> modulo 8 — *CSS* · rif. MDN

La tipografia è gran parte di ciò che rende leggibile una pagina. Questo modulo raccoglie le proprietà che scelgono il **carattere** (`font-*`), caricano i **web font** (`@font-face`) e governano la resa del **testo** (spaziatura, allineamento, decorazioni, a capo). La linea è *modern-first*: dove il CSS recente offre un controllo migliore — `font-display` per il caricamento, variable font, `text-wrap: balance`/`pretty` per gli a capo — quello è il default; il resto resta come nota di contesto.

## `font-family` e il fallback stack

`font-family` non prende un solo font, ma una **lista di preferenze**: il browser usa il primo disponibile sul sistema e, se manca, scala al successivo. L'ultimo valore deve sempre essere una **generic family** (una famiglia astratta che il browser sostituisce con un font di sistema), così c'è comunque un ripiego sensato.

```css
body {
  font-family: "Inter", system-ui, -apple-system, sans-serif;
}

code {
  font-family: "Fira Code", ui-monospace, monospace;
}
```

- I nomi con spazi o non-ASCII vanno tra **virgolette** (`"Fira Code"`); le generic family sono **keyword** e non si quotano mai.
- Generic family principali: `serif`, `sans-serif`, `monospace`, `cursive`, `fantasy`. A queste si aggiungono le moderne `system-ui` (il font di sistema dell'OS, così l'interfaccia si sente "nativa") e le varianti `ui-serif`/`ui-sans-serif`/`ui-monospace`/`ui-rounded`.
- L'ordine è una **catena di ripiego**: dal font ideale, ai font di sistema simili, alla generic family finale. Elencare più font evita di dipendere da un singolo file e copre l'attesa del web font (vedi `@font-face` più sotto).

> [!tip]
> Chiudere sempre lo stack con una generic family. Senza, se tutti i font elencati mancano il browser cade sul default del documento, spesso un serif indesiderato.

### La generic family `math`

Tra le generic family ne esiste una di nicchia, **`math`**, pensata per il rendering di contenuti **matematici** (MathML): seleziona un font ottimizzato per le formule — indici, radici, parentesi che si estendono su più righe, glifi a doppia barratura. Gli user agent la applicano di default agli elementi `<math>`, ma la si può richiamare anche esplicitamente:

```css
math { font-family: math; }
```

> [!info] Baseline
> La generic family `math` è **Baseline: newly available (2026)**: Chrome/Edge (dal 2023) e Firefox la supportavano da tempo, Safari 26.2 ha completato il supporto di recente. [MDN — font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family) · [Can I Use](https://caniuse.com/mdn-css_properties_font-family_math). *(verificato: 2026-08-13)*

## Dimensione, peso, stile

- **`font-size`** — la dimensione del testo. Da preferire l'unità **`rem`** (relativa alla dimensione di root), che scala con le preferenze di accessibilità dell'utente meglio dei `px` fissi; dettagli su unità relative e `clamp()` per la tipografia fluida in [[06-unita-valori-funzioni]].
- **`font-weight`** — lo spessore: keyword `normal` (= `400`) e `bold` (= `700`), oppure la scala numerica `100`–`900`. Esistono anche i relativi `lighter`/`bolder` (un gradino rispetto al genitore). Le variable font accettano qualsiasi valore intermedio (es. `625`).
- **`font-style`** — `normal`, `italic` (usa la variante corsiva disegnata dal font) oppure `oblique` (inclina il glifo, con angolo opzionale: `oblique 14deg`).
- **`font-variant`** — nella forma breve serve soprattutto `small-caps` (le minuscole rese come maiuscoletto). Le sotto-proprietà `font-variant-*` (ligature, cifre, ecc.) danno controllo fine ma non entrano nella shorthand `font`.
- **`line-height`** — l'altezza di riga, cioè l'interlinea. Va espressa preferibilmente come **numero senza unità** (`1.5`): viene interpretata come moltiplicatore del `font-size` dell'elemento, evitando i problemi di ereditarietà dei valori con unità.

```css
h1 {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.1;
}

p {
  font-size: 1rem;
  line-height: 1.6;   /* moltiplicatore: 1.6 × font-size */
}
```

> [!warning]
> Un `line-height` con unità (`line-height: 24px` o `1.5em`) eredita il **valore calcolato**, non il rapporto: figli con `font-size` diverso ricevono la stessa altezza assoluta e il testo grande si sovrappone. Il numero puro (`1.5`) eredita il fattore e si ricalcola per ogni elemento.

## `font` shorthand

La shorthand `font` condensa le proprietà del carattere in una dichiarazione. L'ordine è vincolato: eventuali `font-style`, `font-variant`, `font-weight` **prima** della dimensione, poi `font-size` seguito opzionalmente da `/line-height`, e infine `font-family`.

```css
p {
  /* style variant weight  size/line-height  family */
  font: italic small-caps 700 1rem/1.6 "Inter", sans-serif;
}
```

- **`font-size` e `font-family` sono obbligatori**; il resto è opzionale e, se omesso, torna al valore iniziale.
- `line-height` si attacca a `font-size` con lo **slash** (`1rem/1.6`); da solo non è ammesso.
- La shorthand **azzera** le proprietà che non può esprimere (tra cui `font-variant-*` e `font-variation-settings`): usarla dopo aver impostato quei longhand li resetta. Per questo spesso conviene impostare i singoli `font-*` invece della shorthand.

> [!warning]
> Un valore singolo come `font: caption` (o `icon`, `menu`, `message-box`, `small-caption`, `status-bar`) è una **keyword di font di sistema** che imposta tutto in blocco: non ammette altri valori (`font: caption 14px` è invalido).

## Web font con `@font-face`

`@font-face` registra un font caricato dal server e lo rende disponibile con un nome usabile in `font-family`. Il descrittore `src` elenca le sorgenti in ordine di preferenza; `format()` dice al browser il tipo di file così può scartare quelli che non sa leggere senza scaricarli.

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

- Formato consigliato oggi: **WOFF2** (`format("woff2")`), il più compresso e ampiamente supportato. `woff`, `truetype`, `opentype` sono ripieghi ormai raramente necessari.
- Si può indicare `local("Nome")` come prima sorgente per usare la copia già installata sul sistema ed evitare il download.
- I descrittori `font-weight`/`font-style` **dichiarano cosa contiene il file**, non lo applicano: servono al browser per abbinare il font giusto alle regole `font-weight: bold` ecc.

> [!info] Legacy
> Il supporto a IE richiedeva `format("embedded-opentype")` (`.eot`) e liste `src` prolisse con più formati. Fuori scope nel 2026: WOFF2 basta, con al più un fallback WOFF.

### `font-display` — governare il caricamento

Finché il web font non è scaricato, il browser deve decidere cosa mostrare. `font-display` controlla questo comportamento tramite due finestre temporali: il **block period** (testo invisibile, in attesa del font) e lo **swap period** (mostra un fallback e sostituisce il web font appena arriva).

| Valore | Block period | Swap period | Effetto |
|--------|--------------|-------------|---------|
| `auto` | — | — | Sceglie il browser (di norma simile a `block`) |
| `block` | breve | infinito | Testo invisibile per un attimo, poi il web font — rischio **FOIT** (*Flash Of Invisible Text*) |
| `swap` | quasi nullo | infinito | Fallback subito, swap al web font — **FOUT** (*Flash Of Unstyled Text*), ma testo sempre leggibile |
| `fallback` | quasi nullo | breve | Come `swap` ma dopo poco "congela" il fallback se il font tarda |
| `optional` | quasi nullo | nullo | Il browser può rinunciare al web font se non è pronto subito: zero reflow |

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter.woff2") format("woff2");
  font-display: swap;
}
```

> [!tip]
> `swap` è la scelta più comune per il testo di lettura (il contenuto è sempre visibile). `optional` è ideale per font "nice-to-have" dove conta di più evitare lo scatto di layout che avere per forza quel carattere.

### Variable font

Un **variable font** impacchetta in un unico file un intervallo continuo di variazioni (peso, larghezza, ecc.) invece di un file per ogni stile. In `@font-face` la variabilità si attiva dichiarando un **range** al posto di un valore singolo:

```css
@font-face {
  font-family: "Inter var";
  src: url("/fonts/inter-var.woff2") format("woff2");
  font-weight: 100 900;   /* range → il file è variabile */
  font-display: swap;
}

h1 {
  font-family: "Inter var", sans-serif;
  font-weight: 625;                    /* qualsiasi valore nel range */
}
```

Gli assi standard mappano su proprietà CSS normali — `wght` → `font-weight`, `wdth` → `font-width` (già `font-stretch`), `ital`/`slnt` → `font-style`, `opsz` → `font-optical-sizing`: usare quelle è sempre preferibile. Per assi non mappati o custom c'è `font-variation-settings`, che indirizza gli assi per **tag** di quattro lettere (minuscoli i registrati, maiuscoli i custom):

```css
h1 {
  font-optical-sizing: auto;
  font-variation-settings: "opsz" 32, "GRAD" 88;
}
```

> [!warning]
> `font-variation-settings` va usato solo per assi non esprimibili altrimenti: sovrascrive **tutti** gli assi insieme, quindi modificarne uno richiede di ridichiarare gli altri (o passarli da custom property).

## Spaziatura e trasformazione del testo

- **`letter-spacing`** — spazio extra tra i caratteri (`0.05em`); valori negativi stringono.
- **`word-spacing`** — spazio aggiuntivo tra le parole.
- **`text-indent`** — rientro della prima riga di un blocco.
- **`text-transform`** — cambia il *rendering* delle lettere senza toccare il testo: `uppercase`, `lowercase`, `capitalize`, `none`.
- **`text-align`** — allineamento orizzontale. Da preferire i valori **logici** `start`/`end` (si adattano a testi LTR e RTL) ai fisici `left`/`right`; restano `center` e `justify`.

```css
.lead {
  text-indent: 2rem;
  letter-spacing: 0.01em;
  text-align: start;
}

.label {
  text-transform: uppercase;
  letter-spacing: 0.08em;   /* le maiuscole "respirano" meglio spaziate */
}
```

## A capo: `text-wrap` e gestione dell'overflow

`text-wrap` sceglie l'**algoritmo di ritorno a capo**. Due valori moderni migliorano la tipografia quasi a costo zero in markup:

- **`text-wrap: balance`** — bilancia il numero di caratteri sulle righe. Pensato per **testi brevi** (titoli, didascalie, citazioni): i browser lo applicano solo entro un tetto di righe (≈6 su Chromium, ≈10 su Firefox) perché è costoso.
- **`text-wrap: pretty`** — come il wrapping normale ma con un algoritmo più curato che evita soprattutto le **righe orfane** (l'ultima riga con una sola parola). Adatto ai **paragrafi** lunghi.

```css
h1, h2, h3 {
  text-wrap: balance;   /* titoli: righe di lunghezza simile */
}

p {
  text-wrap: pretty;    /* paragrafi: niente parola isolata a fine blocco */
}
```

> [!info] Baseline
> `text-wrap: balance`/`pretty` è **Baseline dal 2024**: ampiamente supportato. È additivo — dove non è disponibile il testo va semplicemente a capo in modo normale, senza rotture. ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap))

Per le **parole troppo lunghe** che sfondano il contenitore (URL, token) ci sono tre leve distinte:

- **`overflow-wrap: break-word`** — spezza una parola solo se **da sola** non ci sta: è l'opzione gentile, rispetta i confini di parola finché può.
- **`word-break: break-all`** — spezza a qualsiasi carattere pur di riempire la riga (più aggressivo); `keep-all` invece impedisce di spezzare il testo CJK.
- **`hyphens: auto`** — inserisce trattini di sillabazione secondo le regole della lingua; richiede l'attributo `lang` sull'elemento per funzionare bene.

```css
.comment {
  overflow-wrap: break-word;   /* prima scelta per contenuti utente */
  hyphens: auto;
}
```

## `white-space` e troncamento con ellissi

`white-space` decide se gli spazi vengono **collassati** e se il testo va **a capo**:

| Valore | Spazi/tab | A capo automatico | Newline nel sorgente |
|--------|-----------|-------------------|----------------------|
| `normal` | collassati | sì | ignorate |
| `nowrap` | collassati | no | ignorate |
| `pre` | preservati | no | preservate |
| `pre-wrap` | preservati | sì | preservate |
| `pre-line` | collassati | sì | preservate |

Il troncamento con puntini di sospensione è il caso d'uso classico di `nowrap`. `text-overflow: ellipsis` **non** forza da solo l'overflow: serve il pattern a tre proprietà — nascondere l'eccesso, impedire l'a capo, poi chiedere l'ellissi.

```css
.ellipsis {
  overflow: hidden;        /* diverso da visible, altrimenti niente troncamento */
  white-space: nowrap;     /* una sola riga */
  text-overflow: ellipsis; /* … al posto del testo tagliato */
}
```

> [!tip]
> Per troncare su **più righe** si usa il pattern `line-clamp` (Baseline): `display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden;`. Nonostante il prefisso `-webkit-`, funziona su tutti i browser attuali.

## `text-decoration`

`text-decoration` è la shorthand delle linee decorative del testo. I longhand danno controllo granulare:

- **`text-decoration-line`** — quale linea: `underline`, `overline`, `line-through`, `none` (e combinazioni, es. `underline overline`).
- **`text-decoration-color`** — il colore della linea (default `currentcolor`, cioè eredita dal testo → [[07-colori]]).
- **`text-decoration-style`** — l'aspetto: `solid`, `double`, `dotted`, `dashed`, `wavy`.
- **`text-decoration-thickness`** — lo spessore: `auto`, `from-font`, o una lunghezza.
- **`text-underline-offset`** — la distanza tra sottolineatura e testo (non fa parte della shorthand, ma si abbina spesso).

```css
a {
  text-decoration: underline;                 /* forma minima */
}

.spellcheck {
  text-decoration: red wavy underline;        /* shorthand con più valori */
}

.fancy-link {
  text-decoration-line: underline;
  text-decoration-color: crimson;
  text-decoration-thickness: 2px;
  text-underline-offset: 0.2em;               /* sottolineatura più ariosa */
}
```

> [!info] Legacy
> Il valore `blink` (testo lampeggiante) esiste nella storia di `text-decoration-line` ma è **deprecato** e i browser non lo rendono più: da non usare.

## Scrittura e direzione (logical)

Per lingue verticali o RTL, `writing-mode` cambia l'orientamento del flusso (`horizontal-tb` di default, `vertical-rl`, `vertical-lr`) e `direction` imposta `ltr`/`rtl`. In un layout che deve adattarsi a più direzioni conviene ragionare in **termini logici** (`start`/`end`, come già per `text-align`) invece che fisici (`left`/`right`), così lo stile si specchia da solo.

```css
.vertical-label {
  writing-mode: vertical-rl;
}
```

Collegamenti: [[06-unita-valori-funzioni]] · [[07-colori]]

## Ripasso lampo

<details>
<summary>Perché <code>font-family</code> elenca più font e deve finire con una generic family?</summary>

È una **catena di ripiego**: il browser usa il primo font disponibile e scala al successivo se manca. Elencare più font copre l'attesa del web font e le diverse piattaforme; la **generic family** finale (`sans-serif`, `serif`…) garantisce sempre un ripiego sensato invece del default del documento.

</details>

<details>
<summary>Qual è l'ordine della shorthand <code>font</code> e quali componenti sono obbligatori?</summary>

`font-style font-variant font-weight` (opzionali, prima) → `font-size[/line-height]` → `font-family`. **`font-size` e `font-family` sono obbligatori**; `line-height` si attacca alla size con lo slash (`1rem/1.6`). La shorthand azzera i longhand che non può esprimere (es. `font-variation-settings`).

</details>

<details>
<summary>Differenza tra <code>font-display: swap</code> e <code>optional</code>?</summary>

`swap` mostra subito un fallback e sostituisce il web font appena arriva (FOUT, ma testo sempre leggibile) — buono per il testo di lettura. `optional` dà una finestra minima e poi **può rinunciare** al web font se non è pronto: zero scatti di layout, ideale per font non essenziali.

</details>

<details>
<summary>Quando usare <code>text-wrap: balance</code> e quando <code>pretty</code>?</summary>

`balance` per **testi brevi** (titoli, didascalie): bilancia i caratteri per riga, ma solo entro poche righe. `pretty` per **paragrafi** lunghi: wrapping curato che evita soprattutto la riga orfana finale.

</details>

<details>
<summary>Quali tre proprietà servono per l'ellissi su una riga sola?</summary>

`overflow: hidden;` (diverso da `visible`), `white-space: nowrap;` (una sola riga) e `text-overflow: ellipsis;`. Da sola `text-overflow` non forza alcun troncamento.

</details>

<details>
<summary>Come si dichiara e usa un variable font sul peso?</summary>

In `@font-face` si mette un **range** (`font-weight: 100 900`): questo attiva la variabilità. Poi si usa `font-weight` con qualsiasi valore del range (es. `625`). Per assi non mappati si ricorre a `font-variation-settings: "opsz" 32` (tag di 4 lettere), ma le proprietà standard sono preferibili.

</details>

<details>
<summary>Cos'è la generic family <code>math</code> in <code>font-family</code>?</summary>

È una generic family di nicchia pensata per i contenuti **matematici** (MathML): richiede al browser un font ottimizzato per le formule (indici, radici, parentesi multiriga). Si usa con `math { font-family: math; }`. Baseline newly available (2026), completata da Safari 26.2.

</details>

**In sintesi:**
- `font-family` è uno **stack di ripiego** che chiude su una generic family (`sans-serif`, `system-ui`… e la specialistica `math` per le formule); `font-size` in `rem`, `line-height` come **numero puro**.
- La shorthand `font` ha ordine fisso (`size`/`family` obbligatori) e resetta i longhand non espressi.
- I web font si caricano con `@font-face` + **WOFF2**; **`font-display`** ne governa la comparsa (`swap` per il testo, `optional` per l'accessorio); le **variable font** si attivano con un range di peso.
- La tipografia moderna sfrutta **`text-wrap: balance/pretty`** (Baseline 2024) per gli a capo; overflow gestito con il pattern `overflow: hidden` + `white-space: nowrap` + `text-overflow: ellipsis`.
- `text-decoration` è una shorthand con longhand fini (`-line`, `-color`, `-style` wavy/dotted…, `-thickness`) più `text-underline-offset`.
