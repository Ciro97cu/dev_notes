---
modulo: 11
titolo: "Responsive design"
tags: [tipo/modulo, responsive]
---
# 11 · Responsive design

> modulo 11 — *CSS* · rif. MDN

Il **responsive design** è la pratica di far adattare un'unica pagina a schermi di ogni dimensione — dal telefono al desktop — senza versioni separate. Gli strumenti sono tre, in ordine di potenza crescente: le **media query** (`@media`), che reagiscono al **viewport**; le **container query** (`@container`), che reagiscono al **contenitore** di un componente; e le funzioni **fluide** (`clamp()`, unità relative) che scalano di continuo senza soglie. La regola guida di tutto: i **breakpoint** nascono dal *contenuto*, non dal catalogo dei dispositivi.

## Il meta tag viewport — indispensabile

Su mobile il primo passo non è CSS ma HTML: senza questa riga nell'`<head>`, il layout responsive non funziona.

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

Il motivo è storico. I browser mobili nascono in un'epoca di siti pensati per il desktop: per non spaccarli, simulano un **viewport virtuale** largo circa `980px` e poi rimpiccioliscono tutto per farlo stare nello schermo. Il risultato è una pagina minuscola da ingrandire a pizzico. Con il meta tag si dice al browser di **non** fingere:

- `width=device-width` — imposta la larghezza del viewport di layout alla larghezza reale del dispositivo in **CSS pixel** (non fisici). Così `100vw` e le media query corrispondono davvero allo schermo.
- `initial-scale=1` — fissa lo zoom iniziale al 100%, senza rimpicciolimento di partenza.

Esistono anche `minimum-scale`, `maximum-scale` e `user-scalable`, ma toccarli è quasi sempre un errore.

> [!warning]
> **Non** disabilitare lo zoom con `maximum-scale=1, user-scalable=no`: impedire il pinch-to-zoom è una barriera di **accessibilità** grave per chi ha bisogno di ingrandire. Il viewport corretto è quasi sempre solo `width=device-width, initial-scale=1`. [MDN — Viewport meta tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Viewport_meta_element)

## Strategia mobile-first

**Mobile-first** significa scrivere gli stili **base** per lo schermo piccolo — fuori da ogni media query — e poi *aggiungere* complessità salendo di larghezza con `min-width` (o la range syntax `width >= …`).

```css
/* Base: mobile. Nessuna media query, vale ovunque */
.layout {
  display: grid;
  gap: 1rem;
}

/* Da tablet in su: si aggiunge una seconda colonna */
@media (width >= 48rem) {
  .layout {
    grid-template-columns: 1fr 1fr;
  }
}
```

Perché partire dal piccolo:

- Lo stile base è il **più semplice** (una colonna, contenuto in fila); le media query *aggiungono* invece di *disfare*, e il CSS resta più corto.
- Il caso mobile è il più comune e il più fragile: parte già ottimizzato anche sui dispositivi che ignorano le media query.
- Si evita di sovrascrivere: con `min-width` ogni breakpoint estende il precedente, in cascata naturale.

L'approccio opposto, **desktop-first** (base per lo schermo grande, poi `max-width` per rimpicciolire), resta valido ma tende a produrre più sovrascritture. La scelta è coerenza: mescolare `min-width` e `max-width` a caso rende difficile capire quale regola vince.

## Media query `@media`

Una media query applica un blocco di stili solo quando una condizione sul dispositivo o sul viewport è vera. La forma generale unisce un **media type** opzionale (`screen`, `print`, `all`) a una o più **feature** tra parentesi.

```css
@media screen and (width >= 600px) and (orientation: landscape) {
  /* schermo, viewport ≥ 600px E orientamento orizzontale */
}
```

Gli operatori logici combinano le condizioni: `and` (tutte vere), la **virgola** (almeno una vera, cioè un OR), `not` (nega l'intera query).

### Feature principali

| Feature | Cosa interroga | Valori tipici |
|---|---|---|
| `width` / `height` | larghezza/altezza del viewport | lunghezze (`600px`, `40rem`) |
| `orientation` | forma del viewport | `portrait`, `landscape` |
| `resolution` | densità di pixel dello schermo | `2x` (alias di `dppx`), `min-resolution: 2x` per i display "retina" |
| `aspect-ratio` | rapporto larghezza/altezza del viewport | `16 / 9` |
| `prefers-color-scheme` | tema preferito dall'utente | `light`, `dark` |
| `prefers-reduced-motion` | preferenza sul movimento | `no-preference`, `reduce` |
| `prefers-contrast` | preferenza sul contrasto | `no-preference`, `more`, `less`, `custom` |

### Range syntax — la forma moderna

Per le feature che rappresentano un intervallo (`width`, `height`, `resolution`, `aspect-ratio`) la sintassi moderna usa gli **operatori di confronto** `<`, `>`, `<=`, `>=`, più leggibili dei prefissi `min-`/`max-`.

```css
@media (width >= 600px)          { /* = (min-width: 600px) */ }
@media (width <= 900px)          { /* = (max-width: 900px) */ }
@media (400px <= width <= 900px) { /* un intervallo, in una sola query */ }
```

Le equivalenze con la sintassi storica:

| Range syntax (moderna) | Prefissi (legacy) |
|---|---|
| `(width >= 600px)` | `(min-width: 600px)` |
| `(width <= 900px)` | `(max-width: 900px)` |
| `(400px <= width <= 900px)` | `(min-width: 400px) and (max-width: 900px)` |

Il vantaggio più netto è l'**intervallo chiuso** in una parentesi sola: niente più due condizioni in `and`. Un altro è la coerenza dei confini — con `min-`/`max-` a soglie adiacenti (`max-width: 600px` e `min-width: 600px`) si rischia la sovrapposizione a esattamente `600px`; con `<` e `>=` il confine è netto.

> [!info] Baseline
> La **range syntax** è **Baseline: Widely available** (Chrome/Edge 104, Firefox 102, Safari 16.4; ampiamente disponibile da settembre 2025). La sintassi `min-`/`max-` resta valida e più prudente per browser molto vecchi. [MDN — Using media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries) · [Can I Use](https://caniuse.com/mdn-css_at-rules_media_range_syntax)

### Media query sulle preferenze utente

Alcune feature non descrivono lo schermo ma le **preferenze di sistema** dell'utente: sono la base di un'esperienza accessibile.

```css
/* Dark mode: reagisce al tema scelto dall'utente nel sistema operativo */
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #111;
    --fg: #eee;
  }
}

/* Rispetta chi ha chiesto meno movimento */
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Rinforza i bordi per chi vuole più contrasto */
@media (prefers-contrast: more) {
  .card { border: 2px solid; }
}
```

- **`prefers-color-scheme`** è il modo dichiarativo di supportare il tema chiaro/scuro. Spesso basta però la proprietà `color-scheme` per far adattare i widget nativi (input, scrollbar): il tema colori è trattato in [[07-colori]].
- **`prefers-reduced-motion: reduce`** segnala che l'utente ha ridotto le animazioni a livello di sistema: si smorzano transizioni ed effetti (dettagli in [[15-transizioni-animazioni]]).
- **`prefers-contrast`** ha quattro valori (`no-preference`, `more`, `less`, `custom`); `more` è quello di uso più comune, per irrobustire bordi e separatori.

> [!info] Baseline
> `prefers-color-scheme`, `prefers-reduced-motion` e `prefers-contrast` sono **Baseline: Widely available** (`prefers-contrast` da maggio 2022, gli altri due da prima). [MDN — prefers-contrast](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast)

## Vincoli di dimensione sugli elementi

Indipendentemente dalle media query, ogni elemento può auto-limitarsi con `min-width`, `max-width`, `min-height`, `max-height`. Servono a rendere un layout **flessibile ma con dei limiti**: cresce con lo spazio, ma non oltre (o non sotto) una soglia.

```css
.container {
  width: 100%;        /* fluido: prende tutta la larghezza disponibile… */
  max-width: 70rem;   /* …ma non supera 70rem sui monitor larghi */
  margin-inline: auto;
}

.thumb {
  min-width: 8rem;    /* non scende sotto una soglia leggibile */
}
```

Il pattern `width: 100%` + `max-width` è il più diffuso: un contenitore centrato che riempie i piccoli schermi e si ferma su quelli grandi, **senza media query**. In alternativa moderna, la stessa logica si esprime in una riga con `min()`: `width: min(100%, 70rem)` (le funzioni matematiche sono in [[06-unita-valori-funzioni]]).

> [!tip]
> Esistono anche gli equivalenti **logici** `min-inline-size`, `max-inline-size`, `min-block-size`, `max-block-size`, che ragionano per asse *inline*/*block* invece di larghezza/altezza fisiche — utili per il supporto multilingua (scritture verticali o da destra a sinistra).

## Container query `@container` — reattività al contenitore

Le media query hanno un limite di fondo: guardano **solo il viewport**. Ma un componente riutilizzabile — una card, un box prodotto — non sa *dove* verrà messo: la stessa card può stare in una `main` larga o in una `sidebar` stretta, e alla stessa larghezza di viewport dovrebbe apparire diversa nei due posti. Le **container query** risolvono esattamente questo: un elemento reagisce alla dimensione del **proprio contenitore**, non della finestra.

Servono due pezzi. Primo, dichiarare un elemento come **contenitore di query**:

```css
.card-wrapper {
  container-type: inline-size;   /* interroga la dimensione inline (larghezza) */
  container-name: card;          /* opzionale: un nome per mirare la query */
}

/* shorthand equivalente: nome / tipo */
.card-wrapper {
  container: card / inline-size;
}
```

Secondo, scrivere la query con `@container`, che stila i **discendenti** in base alla larghezza di quel contenitore:

```css
/* Quando il contenitore (non il viewport!) è ≥ 400px */
@container (width >= 400px) {
  .card {
    display: grid;
    grid-template-columns: 8rem 1fr;   /* immagine a sinistra, testo a destra */
  }
}

/* Mirata a un contenitore con un nome specifico */
@container card (width >= 400px) {
  .card__title { font-size: 1.5rem; }
}
```

I valori di `container-type`:

- **`inline-size`** — il caso quasi sempre giusto: interroga la sola dimensione *inline* (la larghezza in scrittura orizzontale). Il contenitore resta libero di crescere in altezza col contenuto.
- **`size`** — interroga entrambe le dimensioni, ma richiede un'**altezza esplicita** sul contenitore, altrimenti collassa; raro.
- **`normal`** — nessuna query di dimensione (default).

### Unità di container query

Dentro un `@container` (e non solo) si possono usare unità **relative al contenitore**, analoghe a `vw`/`vh` ma riferite al box di query invece che al viewport:

| Unità | Significato |
|---|---|
| `cqw` / `cqh` | 1% della larghezza / altezza del contenitore |
| `cqi` / `cqb` | 1% della dimensione *inline* / *block* |
| `cqmin` / `cqmax` | la minore / maggiore fra `cqi` e `cqb` |

`cqi` è la più utile: una tipografia che scala con la larghezza del **componente**, non della finestra — perfetta per un titolo di card che deve stare bene sia nella colonna stretta sia in quella larga.

```css
.card__title {
  font-size: max(1.25rem, 4cqi);   /* scala con la larghezza del contenitore */
}
```

> [!tip]
> Non si può interrogare un elemento su sé stesso: `@container` guarda l'**antenato contenitore più vicino** e stila i discendenti. Per questo la card sta dentro un `.card-wrapper` che fa da contenitore — il wrapper si misura, la card si adatta. È il motivo per cui le container query superano le media query per i **componenti**: rendono un pezzo di UI davvero riutilizzabile, reattivo al posto in cui vive.

> [!info] Baseline
> Le **container query** (dimensione + unità `cq*`) sono **Baseline: Widely available** (Chrome 105/106, Safari 16, Firefox 110; ampiamente disponibili da agosto 2025). [MDN — Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)

*➕ Approfondimento — esistono anche le **style query** (`@container style(--tema: scuro)`), che reagiscono al valore di una custom property del contenitore invece che alla sua dimensione: supporto più recente, da verificare su Can I Use.*

## Rapporto d'aspetto con `aspect-ratio`

La proprietà `aspect-ratio` fissa il **rapporto larghezza/altezza** di un box: data una dimensione, l'altra si calcola da sola. Risolve in modo pulito i contenitori di media che devono restare proporzionati mentre la larghezza cambia.

```css
.video {
  width: 100%;
  aspect-ratio: 16 / 9;   /* l'altezza segue la larghezza mantenendo 16:9 */
}

.avatar {
  inline-size: 4rem;
  aspect-ratio: 1;        /* quadrato: rapporto 1 / 1 */
}
```

Perché abbia effetto, **almeno una** delle due dimensioni deve restare automatica: se sia `width` sia `height` sono fisse, il rapporto viene ignorato.

> [!info] Legacy
> Prima di `aspect-ratio` si usava l'hack del **padding percentuale**: un contenitore con `padding-top: 56.25%` (cioè 9/16) e il contenuto in `position: absolute`. Funziona ancora, ma `aspect-ratio` lo rende superfluo. `aspect-ratio` è **Baseline: Widely available** da settembre 2021. [MDN — aspect-ratio](https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio)

## Tipografia fluida con `clamp()`

I breakpoint fanno "scattare" i valori a soglie discrete; `clamp()` invece li fa **scorrere di continuo** tra un minimo e un massimo, spesso eliminando del tutto le media query sulla tipografia.

```css
h1 {
  /* min 1.5rem, ideale che scala col viewport, max 3rem */
  font-size: clamp(1.5rem, 1rem + 3vw, 3rem);
}
```

`clamp(MIN, IDEALE, MAX)` restituisce il valore *ideale* (qui legato a `vw`, quindi al viewport) ma non scende mai sotto `MIN` né sale sopra `MAX`. È l'alternativa fluida ai breakpoint per i font, e si combina bene con essi: soglie discrete per il *layout*, scala continua per la *tipografia*. Dentro un componente si sostituisce `vw` con `cqi` per legare la scala al contenitore. Il dettaglio di `clamp()`, `min()`, `max()` e delle unità è in [[06-unita-valori-funzioni]].

## Filosofia dei breakpoint

Il breakpoint giusto **non** è la larghezza di un iPhone o di un iPad: i dispositivi cambiano ogni anno e inseguirli è una battaglia persa. Il breakpoint si mette **dove il contenuto si rompe** — quando una riga diventa troppo lunga per leggersi, quando due colonne si stringono troppo. Si allarga la finestra e si aggiunge un breakpoint solo nel punto in cui il layout comincia a stare male.

Alcune conseguenze pratiche:

- Esprimere i breakpoint in `rem`/`em`, non in `px`: così rispondono allo zoom e alla dimensione del font di base scelta dall'utente.
- Preferire, dove possibile, la reattività **intrinseca** che non richiede alcun breakpoint: `flex-wrap` che manda a capo gli item quando non ci stanno (→ [[12-flexbox]]) e la griglia `grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr))`, che crea da sé quante colonne servono (→ [[13-grid]]). Meno breakpoint da mantenere, layout più robusti.
- Usare le **container query** per i componenti e le **media query** per l'impostazione globale di pagina: sono complementari, non alternative.

Collegamenti: [[06-unita-valori-funzioni]] · [[07-colori]] · [[12-flexbox]] · [[13-grid]] · [[15-transizioni-animazioni]]

## Ripasso lampo

**1.** A cosa serve `<meta name="viewport" content="width=device-width, initial-scale=1">` e cosa succede senza?
> [!success]- Risposta
> Dice al browser mobile di usare la larghezza **reale** del dispositivo come viewport di layout (`width=device-width`) allo zoom 100% (`initial-scale=1`). Senza, il browser simula un viewport virtuale largo ~980px e rimpicciolisce tutto: le media query e `100vw` non corrispondono allo schermo e la pagina appare minuscola.

**2.** Perché si preferisce l'approccio mobile-first con `min-width`?
> [!success]- Risposta
> Lo stile base (mobile) è il più semplice e le media query *aggiungono* complessità salendo di larghezza, invece di disfarla. Si evita di sovrascrivere, il CSS resta più corto e il caso mobile — il più comune e fragile — parte già ottimizzato.

**3.** Come si riscrive `(min-width: 400px) and (max-width: 900px)` in range syntax?
> [!success]- Risposta
> `@media (400px <= width <= 900px)` — un intervallo chiuso in una sola parentesi, senza `and`.

**4.** Qual è il limite delle media query che le container query superano, e come?
> [!success]- Risposta
> Le media query reagiscono **solo al viewport**, quindi un componente non può adattarsi al posto in cui è inserito. Con `container-type: inline-size` sul contenitore e `@container (width >= …)` sui discendenti, il componente reagisce alla larghezza del **proprio contenitore** — diventa davvero riutilizzabile in sidebar strette o colonne larghe.

**5.** Perché `aspect-ratio: 16 / 9` a volte "non fa niente"?
> [!success]- Risposta
> Perché ha effetto solo se **almeno una** dimensione resta automatica. Se sia `width` sia `height` sono fissate, il rapporto viene ignorato.

**6.** Dove si mette un breakpoint, e in quale unità?
> [!success]- Risposta
> Dove il **contenuto** si rompe (righe troppo lunghe, colonne troppo strette), non alla larghezza di un dispositivo specifico. Meglio in `rem`/`em`, così rispondono a zoom e font-size di base.

**In sintesi:**
- Il meta **viewport** (`width=device-width, initial-scale=1`) è il prerequisito HTML del responsive; non disabilitare mai lo zoom.
- **Mobile-first**: stili base per il piccolo, poi `min-width` / `width >= …` per salire. La **range syntax** (`width >= 600px`, `400px <= width <= 900px`) è la forma moderna e Baseline delle media query.
- Le media query sulle **preferenze** (`prefers-color-scheme`, `prefers-reduced-motion`, `prefers-contrast`) sono la base dell'accessibilità; i vincoli `min/max-width|height` rendono i box flessibili ma limitati.
- Le **container query** (`@container` + `container-type: inline-size`, unità `cqi`) rendono i componenti reattivi al contenitore, non al viewport. `aspect-ratio` fissa le proporzioni; `clamp()` dà tipografia fluida. I breakpoint seguono il **contenuto**, non i dispositivi.
