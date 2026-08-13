---
modulo: 3
titolo: "Pseudo-classi & pseudo-elementi"
tags: [tipo/modulo, selettori]
---
# 03 · Pseudo-classi & pseudo-elementi
> modulo 3 — *CSS* · rif. MDN

I selettori visti finora individuano elementi **così come stanno nel markup** (modulo [[02-selettori-combinatori]]). Due famiglie li estendono oltre il DOM statico:

- una **pseudo-classe** (colon singolo, `:`) colpisce un elemento in un certo **stato** o **posizione** — al passaggio del mouse, se è il primo figlio, se un form è valido. L'elemento esiste già; si aggiunge una condizione.
- uno **pseudo-elemento** (doppio colon, `::`) stilizza — o **crea** — una **sotto-parte** dell'elemento che non ha un nodo proprio nel markup: la prima riga di un paragrafo, il bullet di una lista, un box decorativo generato dal nulla.

## Pseudo-classi di stato (interazione)

Descrivono la relazione **momentanea** tra utente ed elemento.

```css
a:hover        { color: crimson; }        /* puntatore sopra l'elemento */
button:active  { transform: scale(0.98); } /* mentre è premuto */
input:focus    { outline: 2px solid teal; } /* ha il focus (tastiera o click) */
```

Per gli anchor esiste un ordine che conta: quando più stati hanno la **stessa specificità**, vince l'ultimo dichiarato. La sequenza corretta è `:link`, `:visited`, `:hover`, `:active` — mnemonico **LoVe-HAte**. Scrivere `:hover` dopo `:active` renderebbe l'hover irraggiungibile sul link già premuto.

### `:focus-visible` — il focus ring intelligente

`:focus` scatta **sempre** che l'elemento riceva il focus, anche con un click del mouse: da qui il classico anello che molti sviluppatori rimuovevano (peggiorando l'accessibilità). `:focus-visible` invece scatta solo quando il browser, tramite euristica, ritiene che l'utente **abbia bisogno** di vedere dov'è il focus — tipicamente durante la navigazione da **tastiera**, non al click.

```css
/* anello personalizzato solo quando serve davvero */
button:focus-visible {
  outline: 2px solid crimson;
  outline-offset: 2px;
}
```

È il modo moderno per stilizzare il focus senza infastidire chi usa il mouse. Baseline: ampiamente disponibile dal 2022 ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)).

### `:focus-within` — il contenitore reagisce al figlio

Colpisce un elemento quando **esso stesso o un suo discendente** ha il focus. Utile per evidenziare un intero form o una card mentre l'utente digita in un campo interno:

```css
.form-field:focus-within {
  border-color: teal;   /* si accende il wrapper, non solo l'input */
}
```

> [!tip]
> `:hover` e `:focus` si sposano con le transizioni per un feedback fluido: vedi [[15-transizioni-animazioni]].

## Pseudo-classi strutturali (posizione nel DOM)

Selezionano in base alla posizione tra i **fratelli**, senza bisogno di classi ad hoc.

```css
li:first-child  { font-weight: bold; }  /* primo figlio del suo genitore */
li:last-child   { border-bottom: none; }/* ultimo figlio */
li:only-child   { list-style: none; }   /* unico figlio */
p:empty         { display: none; }       /* nessun contenuto, nemmeno testo */
```

### `:nth-child()` e la formula `An+B`

`:nth-child()` accetta una **microsintassi** `An+B`, dove `n` scorre gli interi da 0 in su:

- `A` è il **passo**, `B` l'**offset**.
- `:nth-child(2n)` → posizioni 2, 4, 6… (= parola chiave `even`).
- `:nth-child(2n+1)` → posizioni 1, 3, 5… (= parola chiave `odd`).
- `:nth-child(3n)` → ogni terzo elemento: 3, 6, 9…
- `:nth-child(-n+3)` → i **primi tre** (n=0,1,2 → 3,2,1).

```css
/* righe a zebra */
tr:nth-child(odd) { background: #f4f4f4; }

/* i primi 3 elementi di una griglia */
.card:nth-child(-n + 3) { border-top: 3px solid gold; }
```

> [!warning]
> `:nth-child()` conta **tutti** i fratelli, poi verifica il tipo del selettore a sinistra. `p:nth-child(2)` significa *"il secondo figlio, purché sia un `p`"* — se il secondo figlio è un `div`, non matcha nulla. Per contare **solo** gli elementi di un certo tipo serve `:nth-of-type()`.

### `:nth-of-type()` e `:first-of-type`

Contano solo i fratelli **dello stesso tag**, ignorando gli altri:

```css
p:first-of-type   { margin-top: 0; }   /* primo <p>, anche se preceduto da altro */
img:nth-of-type(2n) { float: right; }  /* ogni seconda immagine */
```

> [!info] Baseline
> La sintassi moderna `:nth-child(An+B of S)` filtra **prima** con un selettore, poi applica la formula: `tr:nth-child(even of :not([hidden]))` colora a zebra solo le righe visibili, cosa impossibile col conteggio classico. Recente (browser dal 2023 circa) ma già Baseline — utile verificarne il supporto sui target più datati ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:nth-child)).

## Negazione: `:not()`

Colpisce gli elementi che **non** corrispondono al selettore passato. La versione moderna accetta una **lista di selettori** separati da virgola (con la vecchia era ammesso un solo selettore semplice):

```css
/* tutti i bottoni tranne quelli primari e disabilitati */
button:not(.primary, :disabled) {
  opacity: 0.9;
}

/* spaziatura tra i paragrafi, escluso l'ultimo */
p:not(:last-child) { margin-bottom: 1rem; }
```

> [!tip]
> La specificità di `:not()` è quella del **selettore più specifico** al suo interno (come per `:is()` e `:has()`): la pseudo-classe in sé non aggiunge peso, contano gli argomenti. Dettagli in [[04-cascade-specificita-ereditarieta]].

## Pseudo-classi per i form

Riflettono lo **stato** dei controlli, spesso pilotato dagli attributi HTML di validazione (`required`, `type`, `pattern`…):

```css
input:checked  { accent-color: teal; }              /* checkbox/radio selezionati */
input:disabled { cursor: not-allowed; opacity: .6; } /* attributo disabled */
input:required { border-left: 3px solid orange; }    /* attributo required */

input:valid   { border-color: seagreen; }  /* supera i vincoli HTML */
input:invalid { border-color: crimson; }   /* non li supera */
```

`:placeholder-shown` matcha il campo **mentre mostra il placeholder** (quindi vuoto). Da non confondere con il pseudo-**elemento** `::placeholder`, che stilizza il *testo* del placeholder (vedi sotto). Insieme a `:not()` abilita il pattern della **floating label** senza JavaScript:

```css
/* etichetta "a riposo" finché il campo è vuoto */
.field label { transition: transform .15s; }

/* quando l'utente digita, il placeholder sparisce → l'etichetta sale */
.field input:not(:placeholder-shown) + label {
  transform: translateY(-1.4rem) scale(.85);
}
```

> [!warning]
> `:valid`/`:invalid` reagiscono **da subito**, anche su un campo `required` mai toccato: al primo caricamento l'intero form appare "sbagliato" in rosso. Spesso si combina con `:not(:placeholder-shown)`, oppure con `:has()`, o con lo stato `:user-invalid` (che attende l'interazione) per rimandare il feedback al momento giusto.

## `:has()` — il selettore relazionale

Storicamente CSS poteva scendere (figli, discendenti) ma **mai risalire**: non si poteva stilizzare un genitore in base ai suoi figli. `:has()` colma la lacuna — è il tanto atteso **parent selector**. Matcha l'elemento se al suo interno (o relativamente ad esso) esiste qualcosa che soddisfa la lista di selettori.

```css
/* una card che CONTIENE un'immagine si dispone diversamente */
.card:has(img) {
  grid-template-columns: auto 1fr;
}

/* stile al <figure> solo se ha una didascalia */
figure:has(figcaption) { border-bottom: 1px solid #ccc; }
```

Combinato con i combinatori diventa anche un selettore di **fratello precedente** — cosa altrimenti impossibile:

```css
/* un'etichetta che PRECEDE un campo non valido diventa rossa */
label:has(+ input:invalid) { color: crimson; }

/* form validation a livello di contenitore */
form:has(:invalid) button[type="submit"] {
  opacity: .5;
  pointer-events: none;   /* disabilita l'invio finché c'è un errore */
}
```

Logica combinabile: `:has(a, b)` è un **OR** (contiene a *oppure* b), mentre concatenando `:has(a):has(b)` si ottiene un **AND**.

> [!info] Baseline
> `:has()` è Baseline **ampiamente disponibile dal dicembre 2023** ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)). Come `:not()`, prende la specificità dell'argomento più specifico. Limiti: non è annidabile (`:has()` dentro `:has()`) e non accetta pseudo-elementi come argomento. A differenza di `:is()`/`:where()`, di per sé **non** è forgiving: un argomento non valido non viene silenziosamente scartato.

## Pseudo-elementi: `::` non `:`

Il doppio colon (`::`) distingue i pseudo-**elementi** dalle pseudo-**classi** (colon singolo). Non è un vezzo: rende esplicito che si sta stilizzando o generando una **porzione** dell'elemento, non l'elemento in un certo stato.

> [!info] Legacy
> I quattro pseudo-elementi storici (`::before`, `::after`, `::first-letter`, `::first-line`) sono ancora accettati col colon singolo (`:before`…) per retrocompatibilità. Nel codice nuovo si usa **sempre** `::`; il colon singolo su un pseudo-elemento è solo un residuo da riconoscere nel codice esistente.

## `::before` e `::after` — contenuto generato

Inseriscono un box **figlio virtuale** rispettivamente prima e dopo il contenuto dell'elemento. Richiedono **obbligatoriamente** la proprietà `content`: senza di essa il pseudo-elemento non viene renderizzato.

```css
/* icona decorativa prima del link */
a.external::after {
  content: " ↗";
}

/* box puramente grafico: content vuoto ma presente */
.tooltip::before {
  content: "";
  position: absolute;
  border: 6px solid transparent;
  border-bottom-color: #333;   /* la classica "freccetta" del tooltip */
}
```

`content: ""` (stringa vuota) è la chiave dei box decorativi: crea l'elemento senza aggiungere testo, poi lo si dimensiona e sfonda a piacere.

> [!warning]
> Il contenuto generato è **presentazione**: il supporto degli screen reader è incostante e non selezionabile/copiabile in modo affidabile. Non veicolare mai informazione essenziale via `content` (testo di senso, dati). Riservarlo a icone e decorazioni.

## Pseudo-elementi tipografici

Stilizzano porzioni di testo senza wrapparle in markup aggiuntivo.

```css
/* capolettera */
p::first-letter {
  font-size: 3rem;
  float: left;
  line-height: 1;
}

/* prima riga renderizzata, qualunque sia la sua lunghezza */
p::first-line {
  font-variant: small-caps;
}
```

`::marker` mira al **bullet o numero** di un list item (`<li>`, `<summary>`, o qualsiasi `display: list-item`). Accetta un set **limitato** di proprietà — soprattutto `color`, le proprietà `font-*` e `content`:

```css
li::marker {
  color: teal;
  font-weight: bold;
}

/* marcatore personalizzato su una lista di task */
li.done::marker { content: "✓ "; }
```

> [!warning]
> `::marker` non è ancora pienamente Baseline: MDN lo segnala a **disponibilità limitata**, perché il set di proprietà supportate varia tra browser (gli usi comuni con `color` e `font-*` funzionano ovunque). Per personalizzazioni spinte del bullet, verificare il supporto ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/::marker)). Alternativa storica: `list-style-type` / `list-style-image`. *(verificato: 2026-08-13)*

### `@counter-style` — marcatori di lista su misura

Dove `::marker` ritocca solo colore e font del bullet, l'at-rule **`@counter-style`** definisce un marcatore di lista **completamente personalizzato**, poi riutilizzabile come valore di `list-style` (o `list-style-type`). Si dà un nome allo stile e si descrive come generare ogni simbolo:

```css
@counter-style pollici {
  system: cyclic;      /* ripete in ciclo i simboli elencati */
  symbols: "👍";       /* il/i simbolo/i del marcatore */
  suffix: " ";         /* cosa segue il simbolo (default: ". ") */
}

ul.valutazioni {
  list-style: pollici;
}
```

I descrittori principali:

- **`system`** — l'algoritmo di numerazione: `cyclic` (ripete i simboli in ciclo), `numeric`, `alphabetic`, `fixed` (usa i simboli una volta, poi ripiega), `additive` (sistemi come i numeri romani).
- **`symbols`** — la lista dei simboli (stringhe, immagini o identificatori).
- **`prefix`** / **`suffix`** — testo prima e dopo ogni marcatore.
- **`range`** — l'intervallo di valori per cui lo stile è valido; fuori da lì interviene il `fallback`.
- **`fallback`** — lo stile a cui delegare quando questo non sa rappresentare un valore (default `decimal`).

> [!info] Baseline
> `@counter-style` è **Baseline: widely available** (dal settembre 2023, con Safari 17 a completare il supporto; Chrome/Edge e Firefox da molto prima). [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@counter-style) · [Can I Use](https://caniuse.com/css-at-counter-style). *(verificato: 2026-08-13)*

## `::selection`, `::placeholder` e cenno a `::backdrop`

`::selection` stilizza la porzione di testo **evidenziata** dall'utente (accetta poche proprietà: `color`, `background-color`, `text-decoration`…):

```css
::selection {
  background: gold;
  color: black;
}
```

`::placeholder` stilizza il **testo segnaposto** di input e textarea (è il pseudo-elemento gemello della pseudo-classe `:placeholder-shown` vista sopra):

```css
input::placeholder {
  color: #999;
  font-style: italic;
}
```

`::backdrop` è il velo che copre il resto della pagina dietro un elemento nel **top layer**: un `<dialog>` aperto con `showModal()`, un popover, o un elemento in fullscreen. Baseline dal 2022 ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/::backdrop)).

```css
dialog::backdrop {
  background: rgb(0 0 0 / 0.5);
  backdrop-filter: blur(2px);
}
```

Collegamenti: [[02-selettori-combinatori]] · [[04-cascade-specificita-ereditarieta]] · [[15-transizioni-animazioni]]

## Ripasso lampo

<details>
<summary>Qual è la differenza tra <code>:</code> e <code>::</code>, e perché esiste?</summary>

Il colon singolo (`:`) introduce una **pseudo-classe** (stato o posizione di un elemento esistente: `:hover`, `:first-child`). Il doppio colon (`::`) introduce un **pseudo-elemento** (una sotto-parte o un box generato: `::before`, `::marker`). Il `::` rende esplicito che si stilizza una porzione, non l'elemento intero; i quattro pseudo-elementi storici accettano ancora `:` per retrocompatibilità.

</details>

<details>
<summary>Cosa rende speciale <code>:has()</code> e come si scrive una card che contiene un'immagine?</summary>

È il **parent selector**: permette di stilizzare un elemento in base ai suoi discendenti/relativi, cosa prima impossibile in CSS. Esempio: `.card:has(img) { … }`. Con i combinatori seleziona anche un fratello precedente (`label:has(+ input:invalid)`). Baseline dal dicembre 2023.

</details>

<details>
<summary><code>:nth-child(2n+1)</code> a cosa equivale, e in che cosa differisce da <code>:nth-of-type()</code>?</summary>

`2n+1` equivale a `odd`: posizioni 1, 3, 5… `:nth-child()` conta **tutti** i fratelli (poi filtra per tipo del selettore), mentre `:nth-of-type()` conta solo i fratelli **dello stesso tag**.

</details>

<details>
<summary>Perché preferire <code>:focus-visible</code> a <code>:focus</code>?</summary>

`:focus` mostra il focus ring sempre, anche al click del mouse (spesso considerato invadente e rimosso a scapito dell'accessibilità). `:focus-visible` lo mostra solo quando serve davvero — tipicamente da tastiera — grazie a un'euristica del browser. È il modo moderno di stilizzare il focus senza rinunciare all'accessibilità.

</details>

<details>
<summary>Differenza tra <code>:placeholder-shown</code> e <code>::placeholder</code>?</summary>

`:placeholder-shown` è una **pseudo-classe**: matcha il *campo* mentre mostra il placeholder (cioè vuoto). `::placeholder` è un **pseudo-elemento**: stilizza il *testo* del placeholder (colore, corsivo…).

</details>

<details>
<summary>Cosa matcha <code>button:not(.primary, :disabled)</code> e quanta specificità aggiunge <code>:not()</code>?</summary>

Tutti i `button` che **non** hanno classe `.primary` e **non** sono `:disabled` (il moderno `:not()` accetta liste di selettori). La pseudo-classe in sé non aggiunge peso: la specificità è quella del selettore più specifico al suo interno (qui, una classe).

</details>

<details>
<summary>Quando serve <code>@counter-style</code> invece di <code>::marker</code>?</summary>

`::marker` permette solo di ritoccare colore e font del bullet esistente; `@counter-style` definisce un marcatore **completamente personalizzato** (i suoi simboli, `prefix`/`suffix`, `range`, `fallback`) da richiamare con `list-style`. Esempio: `@counter-style pollici { system: cyclic; symbols: "👍"; suffix: " "; }` e poi `ul { list-style: pollici; }`. Baseline widely available.

</details>

**In sintesi:**
- **Pseudo-classi** (`:`) = stato/posizione di un elemento esistente; **pseudo-elementi** (`::`) = sotto-parte o box generato. Nel codice nuovo, sempre `::` sui pseudo-elementi.
- `:has()` (Baseline 2023) è la grande novità: **parent selector** e selettore di fratello precedente, ideale per layout condizionali e form validation a livello di contenitore.
- Sintassi moderna in primo piano: `:not()` con liste di selettori, `:focus-visible` per il focus ring accessibile, `:nth-child(… of S)` per contare filtrando.
- `::before`/`::after` richiedono `content` (anche `""`) e servono solo a decorare, mai a veicolare contenuto essenziale. `::marker` mira al bullet; `@counter-style` definisce marcatori di lista su misura (Baseline).
