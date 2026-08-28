---
modulo: 15
titolo: "Transizioni & animazioni"
tags: [tipo/modulo, animazioni]
---
# 15 · Transizioni & animazioni

> modulo 15 — *CSS* · rif. MDN

Il movimento in CSS ha due strumenti complementari. Una **transizione** interpola un valore tra due stati (quello di partenza e quello nuovo) quando qualcosa scatena il cambiamento (un `:hover`, l'aggiunta di una classe, un focus). Un'**animazione** con `@keyframes` è invece autonoma: definisce una sequenza di tappe, parte da sola e può ripetersi all'infinito, senza bisogno di un trigger. Questo modulo copre entrambe, il modo giusto di sceglierle per non appesantire il rendering (privilegiando `transform` e `opacity`, vedi [[14-transforms]]), l'accessibilità con `prefers-reduced-motion` e le novità che permettono di animare anche l'entrata di un elemento e le transizioni tra viste.

## Transizioni: interpolare tra due stati

Una transizione osserva una proprietà e, quando il suo valore cambia, invece di scattare istantaneamente lo fa **scorrere** nel tempo. Si dichiara sullo stato "di riposo" dell'elemento; il nuovo valore arriva da un'altra regola (spesso una pseudo-classe).

```css
.btn {
  background: royalblue;
  transition: background 200ms ease;   /* la transizione vive qui */
}

.btn:hover {
  background: navy;                     /* il valore d'arrivo */
}
```

Al passaggio del mouse il colore non salta: transita da `royalblue` a `navy` in 200 ms, e torna indietro con la stessa durata quando il mouse esce. La transizione è **bidirezionale** per costruzione.

### Le proprietà della transizione

Lo shorthand `transition` racchiude quattro proprietà (cinque con `transition-behavior`, vista più avanti):

- **`transition-property`** — quali proprietà osservare. Un nome (`opacity`), una lista separata da virgole (`opacity, transform`), la parola chiave `all` (tutte quelle animabili) o `none`.
- **`transition-duration`** — quanto dura, in secondi (`0.2s`) o millisecondi (`200ms`). Senza durata non c'è transizione.
- **`transition-timing-function`** — la **curva** con cui il valore avanza nel tempo (vedi sotto). Default: `ease`.
- **`transition-delay`** — quanto attendere prima di iniziare. Un valore negativo fa "saltare" la transizione a metà corsa.

```css
.card {
  transition-property: transform, box-shadow;
  transition-duration: 250ms;
  transition-timing-function: ease-out;
  transition-delay: 0s;
}
```

> [!warning]
> Usare `transition: all` è comodo ma rischioso: anima *qualsiasi* proprietà cambi, incluse quelle costose per il rendering, con effetti a volte imprevisti (es. transizioni indesiderate al primo paint). Meglio elencare esplicitamente le proprietà da animare.

### Lo shorthand `transition`

L'ordine dei valori è flessibile perché vengono riconosciuti per tipo, con **una sola regola da ricordare**: il **primo** valore di tempo è la durata, il **secondo** è il delay.

```css
/* proprietà · durata · timing-function · delay */
transition: transform 250ms ease-out 50ms;

/* più transizioni indipendenti: una per riga, separate da virgola */
transition:
  opacity 200ms ease,
  transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1) 50ms;
```

Ogni voce della lista può avere durata, curva e delay propri. [MDN — transition](https://developer.mozilla.org/en-US/docs/Web/CSS/transition)

## Cosa si può animare (e cosa conviene)

Non tutte le proprietà sono animabili, e tra quelle che lo sono non tutte costano uguale. Le proprietà si dividono in due famiglie:

- **Interpolabili**: hanno valori intermedi calcolabili (`opacity`, `color`, `transform`, `width`, `margin`…). Sono quelle che transitano in modo fluido.
- **Discrete**: passano da un valore all'altro senza stati intermedi (`display`, `visibility`, `overlay`). Di norma **non** transitano — servono accorgimenti specifici, visti nella sezione su `@starting-style`.

Tra le interpolabili, la scelta ha un impatto enorme sulle prestazioni. Animare proprietà che cambiano la geometria (`width`, `height`, `top`, `left`, `margin`) costringe il browser a **ricalcolare il layout** (reflow) e a ridipingere, a ogni fotogramma: è la causa più comune di animazioni a scatti. Animare invece **`transform` e `opacity`** viene gestito dal **compositor**, spesso con accelerazione GPU, senza toccare layout né paint.

> [!tip]
> Regola d'oro: per muovere, scalare o ruotare qualcosa si usa `transform`; per farlo comparire/scomparire si usa `opacity`. Sono le due proprietà più economiche da animare. Per spostare un box si preferisce `transform: translate()` a `top`/`left` (dettagli in [[14-transforms]]).

## Timing functions: la curva del movimento

La *timing function* descrive come il progresso si distribuisce nel tempo — non *quanto* dura, ma se parte piano e accelera, se rallenta alla fine, se procede a scatti. Vale identica per transizioni (`transition-timing-function`) e animazioni (`animation-timing-function`).

I preset più usati:

- **`ease`** (default) — parte lenta, accelera, rallenta alla fine.
- **`linear`** — velocità costante, senza accelerazioni.
- **`ease-in`** — parte lenta e accelera fino alla fine.
- **`ease-out`** — parte veloce e decelera. Ottima per elementi che **entrano** (sensazione naturale di arrivo).
- **`ease-in-out`** — lenta agli estremi, veloce al centro.

Ognuno è in realtà una scorciatoia per una `cubic-bezier()`.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 468 118" role="img" aria-label="Curve delle timing function: linear, ease, ease-in, ease-out, ease-in-out (progresso in funzione del tempo)" style="width:100%;max-width:480px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><path d="M16 26 L16 84 L86 84" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".55"/><path d="M16 84.0 L86 26.0" fill="none" stroke="currentColor" stroke-width="1" opacity=".28" stroke-dasharray="3 3"/><path d="M16 84.0 L86 26.0" fill="none" stroke="var(--link,#1572b6)" stroke-width="2" stroke-linecap="round"/><text x="51.0" y="100" font-size="9.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">linear</text><path d="M108 26 L108 84 L178 84" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".55"/><path d="M108 84.0 L178 26.0" fill="none" stroke="currentColor" stroke-width="1" opacity=".28" stroke-dasharray="3 3"/><path d="M108.0 84.0 C 125.5 78.2 125.5 26.0 178.0 26.0" fill="none" stroke="var(--link,#1572b6)" stroke-width="2" stroke-linecap="round"/><text x="143.0" y="100" font-size="9.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">ease</text><path d="M200 26 L200 84 L270 84" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".55"/><path d="M200 84.0 L270 26.0" fill="none" stroke="currentColor" stroke-width="1" opacity=".28" stroke-dasharray="3 3"/><path d="M200.0 84.0 C 229.4 84.0 270.0 26.0 270.0 26.0" fill="none" stroke="var(--link,#1572b6)" stroke-width="2" stroke-linecap="round"/><text x="235.0" y="100" font-size="9.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">ease-in</text><path d="M292 26 L292 84 L362 84" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".55"/><path d="M292 84.0 L362 26.0" fill="none" stroke="currentColor" stroke-width="1" opacity=".28" stroke-dasharray="3 3"/><path d="M292.0 84.0 C 292.0 84.0 332.6 26.0 362.0 26.0" fill="none" stroke="var(--link,#1572b6)" stroke-width="2" stroke-linecap="round"/><text x="327.0" y="100" font-size="9.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">ease-out</text><path d="M384 26 L384 84 L454 84" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".55"/><path d="M384 84.0 L454 26.0" fill="none" stroke="currentColor" stroke-width="1" opacity=".28" stroke-dasharray="3 3"/><path d="M384.0 84.0 C 413.4 84.0 424.6 26.0 454.0 26.0" fill="none" stroke="var(--link,#1572b6)" stroke-width="2" stroke-linecap="round"/><text x="419.0" y="100" font-size="9.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">ease-in-out</text><text x="12" y="16" font-size="8" text-anchor="start" font-weight="400" opacity=".6" fill="currentColor">progresso</text><text x="454" y="102" font-size="8" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor"></text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Le <strong>timing function</strong>: progresso (asse verticale) in funzione del tempo (orizzontale). Il tratteggio è la retta <code>linear</code> di riferimento; <code>ease-in</code> parte piano, <code>ease-out</code> arriva piano, <code>ease-in-out</code> è lenta agli estremi.</figcaption>
</figure>

### `cubic-bezier()` — curve su misura

Definisce la curva con i due punti di controllo di una Bézier cubica: `cubic-bezier(x1, y1, x2, y2)`. Le **x devono stare in `[0, 1]`** (rappresentano il tempo), mentre le **y possono uscire** da quell'intervallo — è così che si ottiene un *overshoot*, cioè un piccolo scarto oltre il valore finale prima di assestarsi.

```css
/* overshoot elastico: y2 = 1.56 supera 1 e "rimbalza" oltre il target */
transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### `steps()` — movimento a scatti

`steps()` divide la transizione in un numero finito di **passi discreti** invece di renderla continua: indispensabile per le animazioni a sprite (spritesheet) o per effetti "a scatti".

```css
/* 5 passi netti; il salto avviene alla fine di ogni passo */
animation-timing-function: steps(5, jump-end);
```

Le posizioni del salto sono `jump-start`, `jump-end` (default), `jump-none`, `jump-both`; `start` e `end` ne sono gli alias storici. Esistono anche i preset `step-start` (= `steps(1, jump-start)`) e `step-end`.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 340 140" role="img" aria-label="cubic-bezier con overshoot (supera il valore 1 e rientra) e steps(5) a gradini" style="width:100%;max-width:360px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><path d="M24 26 L24 110 L134 110" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".55"/><path d="M24 110.0 L134 26.0" fill="none" stroke="currentColor" stroke-width="1" opacity=".28" stroke-dasharray="3 3"/><path d="M24 47.8 L134 47.8" fill="none" stroke="currentColor" stroke-width="1" opacity=".4" stroke-dasharray="4 3"/><text x="136" y="50.77777777777778" font-size="8" text-anchor="start" font-weight="400" opacity=".6" fill="currentColor">1</text><path d="M24.0 110.0 C 61.4 12.9 94.4 47.8 134.0 47.8" fill="none" stroke="var(--link,#1572b6)" stroke-width="2" stroke-linecap="round"/><text x="79.0" y="126" font-size="9" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">cubic-bezier — overshoot</text><path d="M200 26 L200 110 L310 110" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".55"/><path d="M200.0 110.0 L200.0 110.0 L222.0 110.0 L222.0 93.2 L244.0 93.2 L244.0 76.4 L266.0 76.4 L266.0 59.6 L288.0 59.6 L288.0 42.8 L310.0 42.8 L310.0 26.0" fill="none" stroke="var(--link,#1572b6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><text x="255.0" y="126" font-size="9" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">steps(5, jump-end)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Due curve particolari: <code>cubic-bezier(0.34, 1.56, 0.64, 1)</code> con <strong>overshoot</strong> (la y supera 1, il tratteggio, e poi rientra), e <code>steps(5, jump-end)</code> che avanza a <strong>5 gradini</strong> netti invece che con continuità.</figcaption>
</figure>

> [!tip]
> La funzione `linear()` (moderna) approssima curve arbitrarie elencando più punti di progresso — utile per effetti *spring/bounce* difficili da rendere con una singola Bézier: `linear(0, 0.25 40%, 1)`. Da non confondere con la *parola chiave* `linear`. [MDN — easing-function](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function)

### Cosa fa scattare una transizione

Una transizione parte a ogni cambio di valore, qualunque ne sia la causa: le pseudo-classi di stato come `:hover`, `:focus`, `:focus-visible`, `:active`, `:checked` (vedi [[03-pseudo-classi-elementi]]), l'aggiunta o rimozione di una classe via JavaScript, o una custom property che cambia. Non serve un evento speciale: basta che la proprietà osservata assuma un nuovo valore.

## Animazioni con `@keyframes`

Quando servono più di due stati, una ripetizione, o un movimento che parte da solo senza trigger, si passa alle animazioni. Il meccanismo è in due tempi: **definire** la sequenza con `@keyframes`, poi **applicarla** a un elemento con le proprietà `animation-*`.

### Definire i keyframe

Un blocco `@keyframes` ha un nome e una serie di tappe. Le tappe si esprimono con `from`/`to` (equivalenti a `0%`/`100%`) oppure con **percentuali** per avere tappe intermedie.

```css
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes pulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.08); }
  100% { transform: scale(1); }
}
```

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 448 150" role="img" aria-label="Timeline di @keyframes pulse: tappe a 0%, 50%, 100% con scale 1, 1.08, 1" style="width:100%;max-width:460px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><path d="M44 104 L404 104" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M44 100 L44 108" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="44" cy="70" r="10" fill="var(--link,#1572b6)" fill-opacity=".2" stroke="var(--link,#1572b6)" stroke-width="1.6"/><text x="44" y="122" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">0%</text><text x="44" y="135" font-size="8.5" text-anchor="middle" font-weight="400" opacity=".7" fill="currentColor">scale(1)</text><path d="M224.0 100 L224.0 108" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="224.0" cy="70" r="16" fill="var(--link,#1572b6)" fill-opacity=".2" stroke="var(--link,#1572b6)" stroke-width="1.6"/><text x="224.0" y="122" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">50%</text><text x="224.0" y="135" font-size="8.5" text-anchor="middle" font-weight="400" opacity=".7" fill="currentColor">scale(1.08)</text><path d="M404 100 L404 108" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="404" cy="70" r="10" fill="var(--link,#1572b6)" fill-opacity=".2" stroke="var(--link,#1572b6)" stroke-width="1.6"/><text x="404" y="122" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">100%</text><text x="404" y="135" font-size="8.5" text-anchor="middle" font-weight="400" opacity=".7" fill="currentColor">scale(1)</text><text x="224.0" y="24" font-size="11" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor">@keyframes pulse</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Un'animazione <code>@keyframes</code> è una sequenza di <strong>tappe</strong> nel tempo: qui <code>pulse</code> va da <code>scale(1)</code> a <code>scale(1.08)</code> a metà e torna a <code>scale(1)</code>. La timing function agisce <em>tra</em> una tappa e la successiva.</figcaption>
</figure>

Più percentuali possono condividere lo stesso blocco separandole con la virgola (`0%, 100% { … }`), utile quando inizio e fine coincidono.

### Applicare l'animazione: le proprietà

- **`animation-name`** — il nome del blocco `@keyframes` da usare.
- **`animation-duration`** — durata di un ciclo (obbligatoria perché si veda qualcosa).
- **`animation-timing-function`** — la curva, come per le transizioni. Si applica **tra un keyframe e il successivo**, non all'intera animazione.
- **`animation-delay`** — ritardo prima del primo ciclo.
- **`animation-iteration-count`** — quante volte ripetere: un numero, oppure `infinite`.
- **`animation-direction`** — il verso: `normal`, `reverse` (all'indietro), `alternate` (avanti/indietro alternati), `alternate-reverse`.
- **`animation-fill-mode`** — quali stili tenere **fuori** dal periodo di esecuzione: `forwards` mantiene l'ultimo keyframe a fine animazione, `backwards` applica il primo keyframe già durante il delay, `both` fa entrambe le cose, `none` (default) non ne conserva nessuno.
- **`animation-play-state`** — `running` o `paused`; cambiandola (via classe o JS) si mette in pausa e si riprende.

```css
.spinner {
  animation-name: spin;
  animation-duration: 1s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

> [!warning]
> Senza `animation-fill-mode: forwards`, a fine animazione l'elemento **torna di scatto** allo stato definito nel CSS (fuori dai keyframe): un `fade-in` senza `forwards` sparirebbe di nuovo all'ultimo fotogramma. Per un'animazione che entra e resta, serve `forwards`.

### Lo shorthand `animation`

Come per `transition`, l'ordine è flessibile e il **primo** tempo è la durata, il **secondo** il delay. Convenzione leggibile: durata, curva, delay, ripetizioni, direzione, fill-mode, play-state, nome.

```css
/* nome · durata · curva · delay · conteggio · direzione · fill-mode */
.card {
  animation: slide-in 400ms ease-out 100ms 1 normal both;
}

/* più animazioni sullo stesso elemento: separate da virgola */
.badge {
  animation:
    pulse 2s ease-in-out infinite,
    fade-in 300ms ease both;
}
```

[MDN — animation](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)

## Accessibilità: rispettare `prefers-reduced-motion`

Alcune persone soffrono di disturbi vestibolari: animazioni ampie (grandi spostamenti, zoom, parallasse) possono provocare nausea o vertigini. I sistemi operativi offrono un'opzione "riduci movimento"; CSS la legge con la media feature **`prefers-reduced-motion`** (le media query sono in [[11-responsive]]).

Il pattern corretto **non è togliere ogni movimento**, ma offrire un'alternativa sobria: preferire una dissolvenza di `opacity` a uno spostamento, o azzerare le durate. Un reset globale prudente:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

In alternativa, l'approccio *progressive enhancement*: attivare il movimento **solo** quando è esplicitamente gradito, con `@media (prefers-reduced-motion: no-preference)`.

> [!tip]
> Trattare il movimento come un miglioramento opzionale, non come un requisito: l'interfaccia deve restare pienamente usabile anche a durate azzerate. Il valore `reduce` equivale a scrivere `prefers-reduced-motion` da solo.

> [!info|label:Baseline]
> `prefers-reduced-motion` è **Baseline: Widely available** (dal 2020), supportata su tutti i browser principali. [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

## Moderno: animare l'entrata e i `display: none`

Storicamente non si poteva animare l'**apparizione** di un elemento appena inserito nel DOM, né una transizione da/verso `display: none` (proprietà discreta). Due feature recenti risolvono il problema insieme.

**`@starting-style`** definisce i valori **di partenza** da cui transitare la *prima* volta che l'elemento viene renderizzato (o quando riappare da `display: none`). **`transition-behavior: allow-discrete`** abilita la transizione anche sulle proprietà discrete come `display` e `overlay`, così che l'elemento resti visibile per tutta la durata dell'animazione (il cambio di `display` viene rimandato: al 100% in uscita, anticipato allo 0% in entrata).

```css
.dialog {
  opacity: 1;
  transition:
    opacity 300ms ease,
    display 300ms allow-discrete;    /* display transita grazie a allow-discrete */
}

/* stato "chiuso" */
.dialog[hidden] {
  opacity: 0;
  display: none;
}

/* stato di PARTENZA per l'entrata: si parte da opacity 0 */
@starting-style {
  .dialog {
    opacity: 0;
  }
}
```

Si ragiona quindi su **tre stati**: quello di partenza (`@starting-style`), quello a regime e quello finale. Per specificità pari, `@starting-style` va posto **dopo** la regola normale.

> [!info|label:Baseline]
> `@starting-style` e `transition-behavior: allow-discrete` sono **Baseline: Newly available** (da agosto 2024). Ottimi come *enhancement*; su browser più vecchi l'elemento appare senza animazione, senza rompersi. [MDN — @starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style) · [MDN — transition-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior) *(verificato: 2026-08-13)*

> [!warning]
> `@starting-style` riguarda **solo le transizioni**, non le animazioni `@keyframes` (che hanno già uno stato iniziale nei keyframe). Va inoltre incluso `display` (e `overlay` per popover/`<dialog>`) tra le proprietà in transizione, altrimenti l'uscita non si vede.

## Moderno: view transitions (cenno)

Le **View Transitions API** animano il passaggio tra due stati dell'interfaccia (o tra due pagine) facendo un "prima/dopo" automatico degli elementi, senza orchestrare a mano le singole transizioni. Il browser cattura lo stato vecchio e nuovo e li anima tramite gli pseudo-elementi `::view-transition-old()` / `::view-transition-new()`, abbinando gli elementi con la proprietà `view-transition-name`.

Ci sono due scenari:

- **Same-document** (cambi di vista nella stessa pagina, es. SPA): si avvia da JavaScript con `document.startViewTransition(() => { /* aggiorna il DOM */ })`.
- **Cross-document** (navigazione tra pagine dello stesso sito, MPA): si abilita in CSS, senza JS, con la at-rule `@view-transition`:

```css
@view-transition {
  navigation: auto;
}
```

> [!info|label:Baseline]
> Le view transitions **same-document** sono **Baseline: Newly available** (da fine 2025: Chrome/Edge dal 2023, Safari 18, Firefox 144). [MDN — startViewTransition()](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition) *(verificato: 2026-08-13)*

Mentre una transizione same-document è in corso, la radice del documento si può stilizzare con la pseudo-classe **`:active-view-transition`**, che matcha `:root` per tutta la durata dell'animazione e smette di farlo appena questa finisce. Serve ad applicare stili validi **solo** durante la transizione — per esempio bloccare temporaneamente l'interazione. La variante **`:active-view-transition-type(<type>)`** restringe il match a un tipo dichiarato (i type passati a `startViewTransition()`, o con `@view-transition { types: … }` nel caso cross-document), così si differenziano gli stili in base al tipo di navigazione:

```css
/* stili attivi solo mentre una view transition è in corso */
:active-view-transition {
  pointer-events: none;        /* niente click accidentali durante l'animazione */
}

/* stili condizionati al tipo di transizione */
:active-view-transition-type(forward) {
  /* regole specifiche per la navigazione "in avanti" */
}
```

> [!info|label:Baseline]
> `:active-view-transition` e `:active-view-transition-type()` fanno parte delle view transitions **same-document** e sono **Baseline: newly available**, completate a fine 2025 con Firefox 144 (Chrome/Edge dal 2023, Safari 18). [MDN — :active-view-transition](https://developer.mozilla.org/en-US/docs/Web/CSS/:active-view-transition) *(verificato: 2026-08-13)*

> [!warning]
> Le view transitions **cross-document** (`@view-transition`) hanno invece **disponibilità limitata**: al momento solo su Chrome/Edge, con Firefox e Safari in corso d'opera. Vanno adottate come progressive enhancement, verificando il supporto su [Can I Use](https://caniuse.com/view-transitions). L'approfondimento esula da questo modulo. [MDN — @view-transition](https://developer.mozilla.org/en-US/docs/Web/CSS/@view-transition) *(verificato: 2026-08-13)*

## Moderno emergente: scroll-driven animations

Di norma un'animazione avanza col **tempo**. Le *scroll-driven animations* la legano invece a un'altra "timeline": la **posizione dello scroll** o la **visibilità** di un elemento nel viewport. Il progresso non dipende più dai secondi ma da quanto si è scrollato — senza JavaScript e senza listener sullo `scroll`.

Si usa la proprietà **`animation-timeline`** con due funzioni anonime:

- **`scroll()`** — lega l'animazione all'avanzamento di un contenitore scrollabile.
- **`view()`** — lega l'animazione alla porzione di viewport attraversata dall'elemento (progress bar, reveal all'ingresso, effetti parallasse).

```css
@keyframes reveal {
  from { opacity: 0; transform: translateY(2rem); }
  to   { opacity: 1; transform: translateY(0); }
}

.card {
  animation: reveal linear both;
  animation-timeline: view();       /* progredisce mentre .card entra in vista */
  animation-range: entry 0% cover 40%;
}
```

Con `animation-range` si delimita *dove* lungo la timeline l'animazione si svolge. Per timeline nominate ci sono `scroll-timeline-name`/`view-timeline-name` sul contenitore e il relativo nome (`--nome`) su `animation-timeline`.

> [!warning]
> `animation-timeline` è **reset-only** nello shorthand `animation`: va dichiarata **dopo** l'eventuale shorthand, altrimenti viene riazzerata a `auto`.

> [!info|label:Baseline]
> Le scroll-driven animations hanno **disponibilità limitata** (non ancora Baseline): supportate su Chrome/Edge e Firefox recenti, non ancora su Safari. Da usare come *progressive enhancement* con feature detection, così i browser senza supporto mostrano il contenuto senza animazione. [MDN — animation-timeline](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline) *(verificato: 2026-08-13)*

```css
@supports (animation-timeline: scroll()) {
  /* l'effetto legato allo scroll si attiva solo dove è supportato */
}
```

Collegamenti: [[14-transforms]] · [[03-pseudo-classi-elementi]] · [[11-responsive]]

## Ripasso lampo

<details>
<summary>Qual è la differenza di fondo tra una transizione e un'animazione <code>@keyframes</code>?</summary>

Una **transizione** interpola tra due soli stati e ha bisogno di un **trigger** (un cambio di valore, es. `:hover` o una classe). Un'**animazione** definisce una sequenza di più tappe con `@keyframes`, **parte da sola** e può ripetersi (`infinite`) senza alcun trigger.

</details>

<details>
<summary>Perché per muovere o far comparire un elemento si preferiscono <code>transform</code> e <code>opacity</code>?</summary>

Perché sono gestite dal **compositor** (spesso su GPU) senza ricalcolare il layout né ridipingere. Animare `width`, `top`, `margin` ecc. forza reflow e repaint a ogni fotogramma → animazioni a scatti. Dettagli in [[14-transforms]].

</details>

<details>
<summary>Nello shorthand <code>transition: transform 300ms 50ms</code>, cosa sono <code>300ms</code> e <code>50ms</code>?</summary>

Il **primo** valore di tempo è sempre la **durata** (`transition-duration`), il **secondo** è il **delay** (`transition-delay`). Quindi 300 ms di durata e 50 ms di ritardo prima di partire.

</details>

<details>
<summary>Un <code>fade-in</code> con <code>@keyframes</code> da <code>opacity: 0</code> a <code>opacity: 1</code> sparisce di nuovo appena finisce. Perché, e come si risolve?</summary>

A fine animazione l'elemento torna allo stato definito nel CSS (fuori dai keyframe). Serve `animation-fill-mode: forwards` (o `both`) per **conservare** l'ultimo keyframe.

</details>

<details>
<summary>Come si rende accessibile un'interfaccia animata rispetto al movimento?</summary>

Rispettando `@media (prefers-reduced-motion: reduce)`: non togliere tutto, ma offrire un'alternativa sobria (dissolvenze al posto di grandi spostamenti) o azzerare le durate. È Baseline dal 2020.

</details>

<details>
<summary>A cosa servono <code>@starting-style</code> e <code>transition-behavior: allow-discrete</code>?</summary>

`@starting-style` fornisce i valori **di partenza** per animare l'**entrata** di un elemento (prima renderizzazione o ritorno da `display: none`); `allow-discrete` abilita la transizione sulle proprietà **discrete** come `display`/`overlay`, tenendo l'elemento visibile per tutta l'uscita. Riguardano solo le transizioni, non i `@keyframes`.

</details>

<details>
<summary>Cosa seleziona <code>:active-view-transition</code> e a cosa serve?</summary>

Matcha la radice del documento (`:root`) **mentre è in corso una view transition same-document**, e smette appena finisce: permette di applicare stili validi solo durante l'animazione (es. `pointer-events: none`). La variante `:active-view-transition-type(<type>)` limita il match a un tipo di transizione dichiarato. Baseline newly available da fine 2025.

</details>

**In sintesi:**
- **Transizioni**: interpolano tra due stati su un trigger; shorthand `transition: proprietà durata curva delay`, primo tempo = durata, secondo = delay. Evitare `all`.
- **Animazioni**: `@keyframes` (from/to o percentuali) + proprietà `animation-*`; `infinite`, `alternate` e soprattutto `fill-mode: forwards` per conservare lo stato finale.
- Animare **`transform`/`opacity`** (economiche); le **timing functions** (`ease`, `cubic-bezier()`, `steps()`, `linear()`) modellano la curva del movimento.
- **Accessibilità**: rispettare sempre `prefers-reduced-motion` (Baseline).
- **Moderno**: `@starting-style` + `allow-discrete` per animare entrata e `display:none` (Baseline 2024); **view transitions** same-document (Baseline fine 2025, con `:active-view-transition` per stilizzare la radice durante la transizione) e cross-document (limitate); **scroll-driven animations** (`animation-timeline: scroll()/view()`) come progressive enhancement con `@supports` (non ancora Baseline).
