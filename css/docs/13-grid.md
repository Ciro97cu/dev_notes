---
modulo: 13
titolo: "Grid"
tags: [tipo/modulo, grid, layout]
---
# 13 · Grid

> modulo 13 — *CSS* · rif. MDN

**CSS Grid** è il sistema di layout **bidimensionale** del CSS: dispone gli elementi su **righe e colonne insieme**, come una tabella ma senza markup di tabella. Si definisce una griglia sul contenitore e vi si posizionano i figli, per coordinate o per aree con nome. È lo strumento giusto per l'impianto complessivo di una pagina (header, sidebar, contenuto, footer); per una singola fila o colonna di elementi resta più comodo il [[12-flexbox]].

## Grid o Flexbox?

La differenza sta nel numero di assi che si controllano contemporaneamente.

- **Flexbox** è **unidimensionale**: gestisce **un asse alla volta** (una riga *oppure* una colonna). Gli elementi scorrono lungo quell'asse e vanno a capo (`flex-wrap`) senza allinearsi tra una riga e l'altra.
- **Grid** è **bidimensionale**: definisce righe **e** colonne in un colpo solo, così ogni elemento si aggancia a una cella precisa e le tracce restano allineate su entrambi gli assi.

> [!tip]
> Regola pratica: se il layout è "una fila di cose" (una toolbar, un gruppo di bottoni, i tag di un articolo) → Flexbox. Se è "una griglia di cose" o l'impianto di pagina con più regioni su righe e colonne → Grid. I due sistemi convivono: è normale un contenitore Grid con dei figli che al loro interno usano Flexbox.

Molte proprietà di allineamento (`justify-content`, `align-items`, `gap`, `place-*`) sono **condivise** dai due modelli — chi conosce Flexbox ritrova qui gli stessi nomi con semantica coerente. Dettagli in [[12-flexbox]].

## Definire la griglia

Si attiva Grid con `display: grid` sul **contenitore** (i figli diretti diventano *grid item*). Le tracce si dichiarano con `grid-template-columns` (colonne) e `grid-template-rows` (righe): ogni valore è la dimensione di una traccia.

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;  /* 3 colonne */
  grid-template-rows: 100px auto;        /* 2 righe */
  gap: 1rem;                             /* spazio tra le tracce */
}
```

Le dimensioni delle tracce accettano lunghezze (`px`, `rem`…), percentuali, la keyword `auto` e l'unità speciale `fr`:

- **`fr`** (*fraction*) rappresenta una **frazione dello spazio libero** rimasto dopo aver assegnato le tracce fisse. `1fr 1fr` divide lo spazio a metà; `2fr 1fr` lo divide in `2:1`. È il modo moderno per creare colonne fluide senza calcoli di percentuali.
- **`auto`** dimensiona la traccia in base al **contenuto** (si adatta a ciò che contiene). Combinata con `fr`, le tracce `auto` prendono lo spazio minimo necessario e le `fr` si spartiscono il resto.

### `repeat()` e `minmax()`

`repeat()` evita di ripetere a mano dichiarazioni identiche; `minmax(min, max)` fissa un limite inferiore e uno superiore alla dimensione di una traccia.

```css
.container {
  /* 12 colonne uguali: repeat(12, 1fr) invece di "1fr 1fr 1fr …" */
  grid-template-columns: repeat(12, 1fr);
}

.gallery {
  /* ogni colonna non scende sotto 200px e per il resto cresce fino a 1fr */
  grid-template-columns: repeat(3, minmax(200px, 1fr));
}
```

### `gap`, `row-gap`, `column-gap`

`gap` definisce lo spazio **tra** le tracce (le *gutter*), senza aggiungerlo ai bordi esterni della griglia. Con due valori si separano riga e colonna; `row-gap` e `column-gap` agiscono su un singolo asse.

```css
.container {
  gap: 1rem;             /* stesso spazio tra righe e tra colonne */
  gap: 20px 40px;        /* 20px tra le righe, 40px tra le colonne */
  row-gap: 1rem;
  column-gap: 2rem;
}
```

> [!info] Baseline
> `gap` (e `row-gap`/`column-gap`) è **Baseline: widely available** — supportato in modo diffuso [dal 2017 circa](https://developer.mozilla.org/en-US/docs/Web/CSS/gap). È lo standard: rende superflui i margini sugli item per spaziarli.

> [!info] Legacy
> Le prime versioni della specifica chiamavano queste proprietà `grid-gap`, `grid-row-gap`, `grid-column-gap`. I browser le accettano ancora come **alias** di `gap`/`row-gap`/`column-gap` per compatibilità, ma nel codice nuovo si usano i nomi senza prefisso (validi anche in Flexbox). [Fonte MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/gap).

## Nomi di linea

Le **linee** che separano le tracce sono numerate da `1` (a sinistra/in alto) in poi, ma si possono anche **nominare** mettendo il nome tra parentesi quadre `[ ]` nel punto della linea, dentro `grid-template-columns`/`grid-template-rows`:

```css
.container {
  display: grid;
  grid-template-columns: [col-1-start] 150px [col-1-end] 180px auto;
}
```

Qui la linea prima dei `150px` si chiama `col-1-start`, quella dopo `col-1-end`; le linee restanti (dopo `180px` e dopo `auto`) restano **senza nome** e si usano per numero. Una stessa linea può avere **più nomi**: `[main-start sidebar-end] 1fr`. Riferirsi a un nome invece che a un numero rende il posizionamento leggibile e resistente all'aggiunta di nuove tracce.

## Posizionare gli item: il punto di vista della cella

Di default gli item riempiono le celle nell'ordine del DOM, una per cella. Per collocare un item su celle precise si dichiarano le linee di inizio e fine, **per nome** (se assegnato) o **per numero**:

```css
.item {
  grid-column-start: col-1-start;  /* o un numero di linea: 1 */
  grid-column-end:   col-1-end;    /* o: 3 */
  grid-row-start: 1;
  grid-row-end:   3;               /* dalla linea 1 alla linea 3 → 2 righe */
}
```

Le **shorthand** `grid-column` e `grid-row` uniscono start ed end con uno slash `/`:

```css
.item {
  grid-column: col-1-start / col-1-end;   /* per nome */
  grid-row: 1 / 3;                         /* per numero */
}
```

### `span`: quante celle occupare

Invece di indicare la linea finale, si può dire **quante tracce** occupare con `span`. Utile quando non interessa *dove* finisce l'item ma *quanto* è largo/alto.

```css
.item {
  grid-column: 2 / span 2;      /* parte dalla linea 2 e copre 2 colonne */
  grid-row-start: 1;
  grid-row-end: span 3;         /* copre 3 righe a partire dalla riga 1 */
}
```

> [!tip]
> Gli item **possono sovrapporsi**: se due item vengono piazzati sulle stesse celle, coesistono nello stesso spazio. L'ordine di impilamento si controlla con `z-index`, esattamente come per gli elementi posizionati (vedi [[09-display-posizionamento]]). Grid è quindi anche un modo pulito per costruire *overlay* senza `position: absolute`.

## Aree con nome

Per i layout d'impianto è spesso più chiaro **disegnare** la griglia con `grid-template-areas`: si scrivono le celle come una mappa ASCII di stringhe (una stringa per riga), assegnando a ciascuna cella il nome di un'area. Poi ogni item si aggancia con `grid-area: <nome>`.

```css
.page {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;
  grid-template-rows: auto auto 1fr auto;
  grid-template-areas:
    "header  header header"
    "sidebar title  title "
    "sidebar text1  text2 "
    "footer  footer footer";
  gap: 1rem;
  min-height: 100dvh;
}

.page > header  { grid-area: header; }
.page > .side   { grid-area: sidebar; }
.page > h1      { grid-area: title; }
.page > .text-a { grid-area: text1; }
.page > .text-b { grid-area: text2; }
.page > footer  { grid-area: footer; }
```

Ripetere lo stesso nome su celle adiacenti fa **estendere** l'area su più righe/colonne: qui `header` e `footer` coprono tutte e tre le colonne, `sidebar` copre due righe. Un **punto** `.` indica una cella deliberatamente **vuota**:

```css
grid-template-areas:
  "header header ."
  "nav    main   aside";
```

> [!warning]
> Le stringhe devono formare un **rettangolo pieno**: stesso numero di celle per ogni riga e ogni area con nome deve essere anch'essa rettangolare (niente aree a "L"). Una mappa malformata rende `grid-template-areas` invalida e viene ignorata.

## Allineamento

Grid distingue due livelli di allineamento: quello degli **item dentro le proprie celle** e quello dell'**intera griglia dentro il contenitore** (quando le tracce non riempiono tutto lo spazio disponibile).

### Item nelle celle — `justify-items` / `align-items`

Impostate sul contenitore, governano come **ogni item** si dispone nella sua area. `justify-items` agisce sull'**asse inline** (orizzontale, in scrittura LTR), `align-items` sull'**asse block** (verticale). Valori: `start`, `center`, `end`, `stretch` (default: l'item si allarga a riempire la cella).

```css
.container {
  justify-items: center;   /* item centrati orizzontalmente nelle celle */
  align-items: start;      /* e allineati in alto */
}

/* override per un singolo item */
.special {
  justify-self: end;
  align-self: center;
}
```

`justify-self`/`align-self` fanno l'override su un item specifico; la shorthand `place-items: <align> <justify>` imposta entrambi gli assi in una riga.

### Intera griglia nel contenitore — `justify-content` / `align-content`

Quando le tracce **non riempiono** il contenitore (es. colonne fisse più strette del container), queste proprietà distribuiscono lo **spazio avanzato** attorno alle tracce. `justify-content` lungo le colonne, `align-content` lungo le righe. Valori: `start`, `end`, `center`, `stretch`, più i tre di distribuzione `space-around`, `space-between`, `space-evenly`.

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 100px);  /* tracce fisse, spazio avanza */
  justify-content: space-between;  /* spinge le colonne ai bordi, spazio in mezzo */
  align-content: center;           /* blocco di righe centrato in verticale */
}
```

`place-content: <align-content> <justify-content>` è la shorthand dei due.

## Griglia implicita e layout responsive

Se un item finisce **fuori** dalle tracce dichiarate (o ci sono più item che celle), Grid crea tracce **implicite** per contenerli. La loro dimensione si controlla con `grid-auto-rows` / `grid-auto-columns`, e il verso in cui vengono create con `grid-auto-flow`.

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(120px, auto);  /* righe implicite alte almeno 120px */
  grid-auto-flow: row;                  /* default: riempie per righe */
}
```

`grid-auto-flow` accetta `row` (default), `column` (riempie per colonne) e la keyword `dense`, che **ricompatta i buchi** portando avanti item più piccoli per riempire spazi lasciati liberi (`grid-auto-flow: row dense`) — a costo di alterare l'ordine visivo rispetto al DOM.

### Pattern responsive: `auto-fill` / `auto-fit` + `minmax()`

Il modo idiomatico per una griglia che **si adatta da sola** al numero di colonne, senza media query, combina `repeat()` con una delle due keyword `auto-fill`/`auto-fit` e `minmax()`:

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}
```

Grid crea **quante più colonne** possibile larghe almeno `200px`, che per il resto crescono fino a `1fr` ciascuna; al restringersi del contenitore le colonne calano di numero e vanno a capo. La differenza tra le due keyword riguarda le **tracce vuote**:

- **`auto-fill`** crea tutte le tracce che entrano nel contenitore, **anche se restano vuote**: le colonne vuote continuano a occupare spazio.
- **`auto-fit`** parte come `auto-fill` ma poi **collassa a `0` le tracce vuote** ([MDN: *"any empty repeated tracks are collapsed"*](https://developer.mozilla.org/en-US/docs/Web/CSS/repeat)), così i pochi item presenti si **allargano** a riempire tutta la riga.

> [!tip]
> In pratica: `auto-fit` per far **espandere** gli item e occupare tutta la larghezza quando sono pochi; `auto-fill` per mantenere costante la **dimensione** delle celle lasciando spazi vuoti. Approfondimento sul responsive senza media query in [[11-responsive]].

## Moderno: subgrid

Di norma la griglia di un item **annidato** è indipendente da quella del genitore: le tracce non si allineano tra livelli diversi. **`subgrid`** risolve proprio questo: assegnato a `grid-template-columns` e/o `grid-template-rows` di un item che è a sua volta contenitore grid, fa **ereditare le tracce del genitore** invece di crearne di nuove — comprese le **linee con nome** e i `gap`.

Caso tipico: allineare header, corpo e footer di più *card* affiancate anche se hanno contenuti di lunghezza diversa.

```css
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto 1fr auto;   /* header, corpo, footer */
  gap: 1rem;
}

.card {
  display: grid;
  grid-row: span 3;            /* la card occupa le 3 righe del genitore… */
  grid-template-rows: subgrid; /* …e ne eredita l'altezza, riga per riga */
}
```

Così le tre righe interne di ogni card sono ancorate alle stesse righe del genitore: tutti gli header sono allineati tra loro, e così corpi e footer.

> [!info] Baseline
> `subgrid` è **Baseline**: disponibile in tutti i motori principali [da settembre 2023](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid), ed entrato nella soglia *widely available* verso metà 2026. Utilizzabile in produzione; per contesti molto vecchi resta prudente un fallback con [[11-responsive|media/container query]] o layout non annidato.

## Emergente: masonry

Il layout **masonry** (a "mattoni", stile Pinterest) tiene un asse a griglia regolare — di solito le colonne — mentre sull'altro asse gli item **risalgono a riempire i buchi** lasciati da quelli più corti, senza righe rigide. In CSS Grid è la funzionalità di **Grid Level 3**.

```css
.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-template-rows: masonry;   /* SPERIMENTALE — sintassi non definitiva */
  gap: 1rem;
}
```

> [!warning]
> masonry è **sperimentale, non Baseline**: [MDN lo segnala come *limited availability*](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Masonry_layout). A metà 2026 la **sintassi è ancora in discussione**: alla proposta originale `grid-template-rows: masonry` (implementata per prima in Safari) si affianca la direzione più recente del CSS Working Group verso un valore dedicato di `display` (`display: grid-lanes`, già `display: masonry`). Chrome e Firefox lo espongono solo dietro flag. Da non usare in produzione senza un fallback; se serve, incapsularlo con `@supports` così i browser privi di supporto ricadono sul layout grid normale:
>
> ```css
> @supports (grid-template-rows: masonry) {
>   .masonry { grid-template-rows: masonry; }
> }
> ```

Collegamenti: [[12-flexbox]] · [[11-responsive]] · [[05-box-model]] · [[09-display-posizionamento]]

## Ripasso lampo

**1.** Qual è la differenza di fondo tra Grid e Flexbox?
> [!success]- Risposta
> Grid è **bidimensionale** (controlla righe **e** colonne insieme), Flexbox è **unidimensionale** (un asse alla volta, riga *o* colonna). Grid per l'impianto a griglia/di pagina, Flexbox per una singola fila/colonna di elementi. Vedi [[12-flexbox]].

**2.** Cosa rappresenta l'unità `fr` e come interagisce con `auto` e le tracce fisse?
> [!success]- Risposta
> `fr` è una **frazione dello spazio libero** rimasto dopo aver assegnato tracce fisse (`px`) e tracce `auto` (dimensionate sul contenuto). `1fr 1fr` divide a metà lo spazio residuo; `2fr 1fr` in rapporto `2:1`.

**3.** In `repeat(auto-fit, minmax(200px, 1fr))` cosa cambia usando `auto-fill` al posto di `auto-fit`?
> [!success]- Risposta
> `auto-fill` crea tutte le colonne che entrano **anche se vuote** (restano a occupare spazio); `auto-fit` **collassa a `0` le tracce vuote**, così gli item presenti si allargano fino a riempire la riga.

**4.** Come si fa a far occupare a un item 2 colonne senza sapere la linea finale? E se due item si sovrappongono, cosa decide chi sta sopra?
> [!success]- Risposta
> Con `span`: `grid-column: 2 / span 2` (oppure `grid-column-end: span 2`). Se gli item si sovrappongono, lo stacking si controlla con `z-index` ([[09-display-posizionamento]]).

**5.** A cosa servono `justify-items`/`align-items` rispetto a `justify-content`/`align-content`?
> [!success]- Risposta
> Il primo gruppo allinea **ogni item dentro la propria cella** (`start`/`center`/`end`/`stretch`, sugli assi inline e block). Il secondo allinea l'**intera griglia dentro il contenitore** quando le tracce non lo riempiono, con in più `space-between`/`space-around`/`space-evenly`.

**6.** Cosa fa `subgrid` e qual è il suo stato di supporto?
> [!success]- Risposta
> Fa **ereditare a un grid annidato le tracce (e le linee con nome e i `gap`) del genitore**, invece di crearne di proprie — così i livelli restano allineati (es. header/corpo/footer di più card). È **Baseline** dal 2023, usabile in produzione.

**In sintesi:**
- Grid è il layout **bidimensionale**: `display: grid` sul contenitore, tracce con `grid-template-columns`/`-rows`, unità `fr`, più `repeat()` e `minmax()`; spaziatura con `gap`.
- Gli item si posizionano per **numero o nome di linea** (`grid-column`/`grid-row`, `span`) o per **area** (`grid-template-areas` + `grid-area`); possono sovrapporsi e impilarsi con `z-index`.
- Allineamento a due livelli: `justify-items`/`align-items` (item nelle celle) e `justify-content`/`align-content` (griglia nel container); griglia implicita con `grid-auto-rows`/`-columns` e `grid-auto-flow`.
- Pattern responsive senza media query: `repeat(auto-fit|auto-fill, minmax(200px, 1fr))`. **subgrid** è Baseline; **masonry** è ancora sperimentale (sintassi non definitiva) → dietro `@supports`.
