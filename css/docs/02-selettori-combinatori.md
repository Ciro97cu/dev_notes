---
modulo: 2
titolo: "Selettori & combinatori"
tags: [tipo/modulo, selettori]
---
# 02 · Selettori & combinatori

> 🎨 modulo 2 — *CSS* · fonte: corso M. Schwarzmüller + MDN

Un **selettore** individua gli elementi HTML a cui applicare un blocco di dichiarazioni (vedi [[01-fondamenti]]). Saperli scegliere bene significa colpire *esattamente* ciò che serve, con la minima **specificità** possibile — così le regole restano facili da sovrascrivere (la specificità è il tema di [[04-cascade-specificita-ereditarieta]]). Questo modulo copre i selettori base, quelli di attributo, i **combinatori** che mettono in relazione più elementi e le funzioni moderne `:is()`/`:where()`, chiudendo con il **nesting nativo**.

## Selettori base

Sono i quattro mattoni di partenza: colpiscono un elemento in base al tag, alla classe, all'id o a tutto.

```css
p        { line-height: 1.5; }   /* di tipo: ogni <p> */
.card    { padding: 1rem; }      /* di classe: class="card" */
#main    { max-inline-size: 60ch; } /* di id: id="main" */
*        { box-sizing: border-box; } /* universale: ogni elemento */
```

- **Tipo** (`p`, `h1`, `ul`…): tutti gli elementi di quel tag.
- **Classe** (`.card`): gli elementi con quella classe nell'attributo `class`. È il selettore di uso quotidiano — riutilizzabile su più elementi e con specificità contenuta.
- **Id** (`#main`): l'elemento con quell'`id`. Un `id` è **unico** nel documento.
- **Universale** (`*`): qualunque elemento. Utile nei reset o combinato con altri selettori (`.card *`).

> [!warning]
> Evitare di stilizzare tramite `#id`: la sua **specificità** è molto alta e diventa difficile da sovrascrivere senza scatenare guerre di `!important`. Per lo styling si preferiscono le **classi**; gli `id` restano per àncore, target di `<label for>` e hook JavaScript.

## Classi multiple e selettore combinato

Un elemento può avere **più classi**, separate da spazio nell'HTML:

```html
<button class="btn btn-primary is-loading">Invia</button>
```

Ciascuna classe è un selettore a sé (`.btn`, `.btn-primary`, `.is-loading`) e i loro stili si sommano. Concatenando due o più classi **senza spazio** si ottiene un **selettore combinato** che colpisce solo gli elementi che le hanno *tutte*:

```css
.btn.btn-primary {
  /* solo gli elementi con ENTRAMBE le classi btn e btn-primary */
  background: navy;
}
```

> [!warning]
> Lo spazio cambia tutto il significato: `.a.b` (nessuno spazio) = un elemento con *entrambe* le classi; `.a .b` (con spazio) = un `.b` *dentro* un `.a`. Quest'ultimo è un combinatore discendente, spiegato più sotto.

## Raggruppamento con la virgola

La **virgola** applica lo stesso blocco a più selettori indipendenti, evitando di ripeterlo:

```css
h1,
h2,
h3 {
  font-family: system-ui, sans-serif;
  text-wrap: balance;
}
```

Ogni selettore della lista è valutato per conto proprio: la regola qui sopra vale per *ogni* `h1`, *ogni* `h2` e *ogni* `h3`.

> [!warning]
> In una lista separata da virgole "classica", **un solo selettore non valido invalida l'intera regola**: il browser scarta tutto il blocco. È il motivo per cui esistono le liste *forgiving* di `:is()`/`:where()` (vedi sotto), che ignorano solo il pezzo non riconosciuto.

## Selettori di attributo

Selezionano gli elementi in base alla presenza o al **valore** di un attributo. Sono potenti per gli attributi HTML (`type`, `href`, `lang`, `data-*`…) senza bisogno di aggiungere classi.

| Selettore | Colpisce quando l'attributo `attr`… |
|---|---|
| `[attr]` | esiste (qualsiasi valore, anche vuoto) |
| `[attr="v"]` | vale **esattamente** `v` |
| `[attr~="v"]` | è una lista separata da spazi e **una parola** è esattamente `v` |
| `[attr\|="v"]` | vale `v` **oppure** inizia con `v` seguito da un trattino (`v-…`) |
| `[attr^="v"]` | **inizia** con `v` (prefisso) |
| `[attr$="v"]` | **finisce** con `v` (suffisso) |
| `[attr*="v"]` | **contiene** `v` in un punto qualsiasi |

```css
a[target]              { /* i link con un attributo target */ }
input[type="email"]    { /* solo type esattamente "email" */ }
a[href^="https://"]    { /* link assoluti sicuri */ }
a[href$=".pdf"]        { /* link a un PDF */ }
a[href*="example"]     { /* href che contiene "example" */ }
[class~="logo"]        { /* class="brand logo": la parola "logo" nella lista */ }
[lang|="en"]           { /* lang="en" oppure "en-US", "en-GB"… */ }
```

Le tre varianti "a substring" (`^=`, `$=`, `*=`) sono le più usate nella pratica: filtrare i link per protocollo o estensione, o gli attributi `data-*`. Le varianti `~=` e `|=` hanno semantiche precise: `~=` ragiona per **parole intere** in una lista, `|=` nasce per i **sottocodici di lingua** (`en`, `en-US`).

> [!tip]
> Il confronto di valore si può rendere **case-insensitive** aggiungendo un flag `i` prima della `]`: `a[href$=".pdf" i]` colpisce anche `.PDF`. Il flag `s` forza invece il confronto **case-sensitive** (comportamento di default per la maggior parte dei valori). [MDN — Attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors)

## Combinatori

I **combinatori** mettono in relazione due selettori in base alla posizione nell'albero del DOM. Sono quattro.

```css
.menu a        { }  /* discendente: ogni <a> dentro .menu, a qualsiasi livello */
.menu > li     { }  /* figlio: solo i <li> figli DIRETTI di .menu */
h2 + p         { }  /* adiacente: il PRIMO <p> subito dopo un fratello h2 */
h2 ~ p         { }  /* generale: TUTTI i <p> fratelli che seguono un h2 */
```

Su questo markup:

```html
<div class="menu">
  <ul>
    <li>Uno</li>      <!-- .menu > ul > li, ma NON .menu > li -->
  </ul>
</div>
<h2>Titolo</h2>
<p>Primo</p>          <!-- h2 + p  e  h2 ~ p -->
<p>Secondo</p>        <!-- solo h2 ~ p -->
```

- **Discendente** (spazio): a qualunque profondità dentro l'antenato.
- **Figlio** (`>`): solo un livello sotto (figlio diretto).
- **Adiacente** (`+`): il fratello *immediatamente* successivo, se combacia col selettore.
- **Generale** (`~`): *tutti* i fratelli successivi che combaciano.

> [!tip]
> `+` e `~` guardano solo **in avanti** tra fratelli con lo stesso genitore: non esiste un combinatore "fratello precedente". Per reagire a un elemento in base a ciò che lo *segue* o a un discendente, si usa la pseudo-classe `:has()` (vedi [[03-pseudo-classi-elementi]]).

## `:is()` e `:where()` — raggruppare senza ripetere

`:is()` accetta una **lista di selettori** e colpisce l'elemento se combacia con *almeno uno* di essi. Serve a compattare selettori lunghi e ripetitivi:

```css
/* Verboso: ogni combinazione va scritta a mano */
header h1, main h1, article h1, aside h1 { font-size: 1.75rem; }

/* Con :is() — una sola volta */
:is(header, main, article, aside) h1 { font-size: 1.75rem; }
```

`:where()` fa **la stessa selezione**, ma con una differenza cruciale di **specificità**:

- `:is()` assume la specificità del suo argomento **più specifico**.
- `:where()` ha sempre specificità **zero**: qualsiasi regola successiva la sovrascrive facilmente.

```css
:is(section.card, aside.card) a { color: red; }   /* pesa come una classe */
:where(section.card, aside.card) a { color: red; } /* pesa 0 */

a { color: blue; } /* vince su :where() (parità → conta l'ordine), perde su :is() */
```

Per questo `:where()` è ideale per **stili di default** in un design system o in un reset: definiscono una base che l'utente della libreria sovrascrive senza combattere con la specificità. `:is()` invece serve quando la scorciatoia deve mantenere il peso naturale del selettore. Il dettaglio del calcolo è in [[04-cascade-specificita-ereditarieta]].

> [!tip]
> Entrambe usano una **forgiving selector list**: se un selettore nella lista è sconosciuto o non valido, viene **ignorato** e il resto continua a funzionare. Al contrario di una lista con virgole "classica", dove un pezzo invalido butta via tutta la regola.

```css
/* Se :unsupported non è riconosciuto, :is() applica comunque :valid */
:is(:valid, :unsupported) { border-color: green; }
```

> [!info] Baseline
> `:is()` e `:where()` sono **Baseline: Widely available** (supportati su tutti i browser principali da gennaio 2021). [MDN — :is()](https://developer.mozilla.org/en-US/docs/Web/CSS/:is) · [MDN — :where()](https://developer.mozilla.org/en-US/docs/Web/CSS/:where)

> [!warning]
> Né `:is()` né `:where()` accettano **pseudo-elementi**: `:is(p::before)` non funziona. I `::before`/`::after` vanno scritti esplicitamente (vedi [[03-pseudo-classi-elementi]]).

## Nesting nativo con `&`

Il **nesting** permette di annidare le regole dentro il selettore genitore, tenendo vicino ciò che è logicamente vicino. Fino a poco fa richiedeva un preprocessore (Sass); oggi è **CSS nativo** e Baseline.

```css
.card {
  padding: 1rem;
  border: 1px solid silver;

  h2 {
    margin-block-start: 0;    /* → .card h2 (discendente) */
  }

  &:hover {
    border-color: navy;       /* → .card:hover */
  }

  &.featured {
    border-width: 2px;        /* → .card.featured (stesso elemento) */
  }

  & > img {
    inline-size: 100%;        /* → .card > img (figlio diretto) */
  }
}
```

Il carattere `&` rappresenta il **selettore genitore**. Le regole d'oro:

- **Senza `&`**, un selettore annidato diventa **discendente**: dentro `.card`, la regola `h2 { … }` equivale a `.card h2`. Il browser inserisce implicitamente uno spazio.
- **Con `&` attaccato** (nessuno spazio) si crea un **selettore combinato** sullo *stesso* elemento: `&:hover` → `.card:hover`, `&.featured` → `.card.featured`. Per pseudo-classi e classi concatenate `&` è **obbligatorio** — senza, `.featured` diventerebbe `.card .featured` (discendente).
- **`&` con un combinatore** propaga la relazione: `& > img`, `& + .card`, `& ~ p`.
- **`&` posposto** ribalta il contesto: dentro `h2`, la regola `.featured & { … }` diventa `.featured h2` — utile per variare uno stile in base a un antenato.

Si possono annidare anche le at-rule come `@media` e `@container`:

```css
.sidebar {
  display: none;

  @media (min-width: 48rem) {
    display: block;    /* la media query resta legata a .sidebar */
  }
}
```

> [!warning]
> Il nesting nativo **non concatena stringhe** come faceva Sass: `&__title` (stile BEM) **non** è valido. Il `&` è un riferimento al genitore, non un frammento di testo. Per costruire nomi BEM si scrivono i selettori per intero. Inoltre la specificità del `&` è quella di `:is()` sull'insieme dei selettori genitori (rilevante quando la regola genitore ha più selettori separati da virgola).

> [!info] Baseline
> Il **nesting nativo** è **Baseline** (Chrome/Edge 120, Firefox 117, Safari 17.2 — dal dicembre 2023). Ampiamente utilizzabile a metà 2026 senza preprocessore. [MDN — Using CSS nesting](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting/Using_CSS_nesting)

## Cenno a `:scope`

La pseudo-classe **`:scope`** rappresenta il *punto di riferimento* rispetto al quale un selettore è valutato. In un foglio di stile normale coincide con `:root` (l'elemento `<html>`). Diventa davvero utile in due contesti: dentro la at-rule **`@scope`**, dove `:scope` è la radice dello scope dichiarato; e nelle API DOM come `element.querySelectorAll(":scope > div")`, dove indica l'elemento su cui è chiamato il metodo.

```css
@scope (.widget) {
  :scope { padding: 1rem; }   /* la radice .widget */
  a { color: indigo; }        /* i link dentro lo scope */
}
```

> [!info] Baseline
> `:scope` è Baseline (dal 2020). La at-rule `@scope`, invece, è più recente: verificarne il supporto su [Can I Use](https://caniuse.com/css-cascade-scope) prima di usarla in produzione, o adottarla come progressive enhancement.

Collegamenti: [[01-fondamenti]] · [[03-pseudo-classi-elementi]] · [[04-cascade-specificita-ereditarieta]]

## 🔁 Ripasso lampo

**1.** Che differenza c'è tra `.a.b` e `.a .b`?
> [!success]- Risposta
> `.a.b` (senza spazio) colpisce **un unico elemento** che ha *entrambe* le classi. `.a .b` (con spazio) è un combinatore discendente: colpisce un `.b` che sta *dentro* un `.a`.

**2.** Come si selezionano tutti i link che finiscono in `.pdf`, ignorando maiuscole/minuscole?
> [!success]- Risposta
> Con il selettore di attributo "suffisso" e il flag case-insensitive: `a[href$=".pdf" i]`.

**3.** Qual è la differenza tra i combinatori `+` e `~`?
> [!success]- Risposta
> `h2 + p` colpisce **solo il primo** `<p>` immediatamente successivo a un fratello `h2`. `h2 ~ p` colpisce **tutti** i `<p>` fratelli che seguono un `h2`. Entrambi guardano solo in avanti tra fratelli dello stesso genitore.

**4.** `:is()` e `:where()` selezionano allo stesso modo: perché sceglierne uno o l'altro?
> [!success]- Risposta
> Per la **specificità**. `:is()` prende quella del suo argomento più specifico; `:where()` vale sempre **zero**, quindi è facilissimo da sovrascrivere. `:where()` è perfetto per stili di default/reset; `:is()` quando serve mantenere il peso del selettore.

**5.** Nel nesting nativo, perché `&.active` e `& .active` danno risultati diversi?
> [!success]- Risposta
> `&.active` (attaccato) → `.parent.active`: lo *stesso* elemento con la classe `active`. `& .active` (con spazio) → `.parent .active`: un discendente. Per pseudo-classi e classi sullo stesso elemento il `&` è obbligatorio.

**6.** Cosa significa che le liste di `:is()`/`:where()` sono "forgiving"?
> [!success]- Risposta
> Se un selettore nella lista è invalido o non supportato, viene **ignorato** e gli altri continuano a valere. In una lista separata da virgole classica, invece, un solo selettore invalido scarta l'intera regola.

**In sintesi:**
- I mattoni base sono **tipo**, **classe** (uso quotidiano), **id** (evitare per lo stile, alta specificità) e **universale** `*`; concatenando classi senza spazio (`.a.b`) si combinano più condizioni sullo stesso elemento.
- I **selettori di attributo** filtrano per presenza o valore, con le varianti `^=` `$=` `*=` (substring), `~=` (parola) e `|=` (lingua) e i flag `i`/`s`; i **combinatori** legano gli elementi: spazio (discendente), `>` (figlio), `+` (adiacente), `~` (generale).
- `:is()`/`:where()` compattano selettori lunghi con liste *forgiving*: `:is()` conserva la specificità, **`:where()` la azzera** — ideale per i default.
- Il **nesting nativo** con `&` (Baseline) annida le regole senza preprocessore: `&` = genitore, spazio implicito = discendente, `&`+combinatore = relazione esplicita.
