---
modulo: 3
titolo: "Semantica e struttura"
tags: [tipo/modulo, semantica, accessibilita]
---
# 03 · Semantica e struttura
> modulo 3 — *HTML* · rif. MDN

Fare HTML **semantico** significa scegliere gli elementi per il loro **significato**, non per come appaiono. `<div>` non dice nulla: è una scatola neutra. `<nav>`, `<article>`, `<header>` invece dichiarano *cos'è* quella porzione di pagina — e questa informazione la leggono in tre: il browser, i motori di ricerca e, soprattutto, le tecnologie assistive. Scegliere l'elemento giusto è la decisione più importante che si prende scrivendo HTML, perché tutto il resto — accessibilità, SEO, manutenibilità — ne discende.

## I landmark: l'ossatura della pagina

Un piccolo gruppo di elementi definisce le **regioni** principali di una pagina, i cosiddetti *landmark* (punti di riferimento): si chiamano così perché uno screen reader permette di saltare direttamente dall'uno all'altro, come segnaposti.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 640 410" role="img" aria-label="I landmark di una pagina: header, nav, main con article e section, aside, footer" style="width:100%;max-width:600px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="24" y="20" width="592" height="376" rx="6" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="5 4" opacity=".5"/><rect x="40" y="34" width="560" height="44" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="52" y="61" font-size="13" font-weight="700">&lt;header&gt;</text><rect x="40" y="86" width="560" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="52" y="106" font-size="13" font-weight="700">&lt;nav&gt;</text><rect x="40" y="124" width="386" height="212" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="52" y="143" font-size="13" font-weight="700">&lt;main&gt;</text><rect x="54" y="152" width="358" height="96" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="64" y="170" font-size="12" font-weight="600">&lt;article&gt;</text><rect x="54" y="256" width="358" height="72" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="64" y="274" font-size="12" font-weight="600">&lt;section&gt;</text><rect x="434" y="124" width="166" height="212" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="446" y="143" font-size="13" font-weight="700">&lt;aside&gt;</text><rect x="40" y="344" width="560" height="44" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="52" y="371" font-size="13" font-weight="700">&lt;footer&gt;</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">I landmark strutturano la pagina: <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, un unico <code>&lt;main&gt;</code> (che qui contiene un <code>&lt;article&gt;</code> e una <code>&lt;section&gt;</code>), <code>&lt;aside&gt;</code> e <code>&lt;footer&gt;</code>. Uno screen reader salta direttamente da un landmark all'altro.</figcaption>
</figure>

- **`<header>`** — l'intestazione: logo, titolo, spesso la navigazione principale. Può comparire anche dentro un `<article>` (l'intestazione dell'articolo).
- **`<nav>`** — un blocco di **link di navigazione** importanti (menu principale, breadcrumb). Non ogni gruppo di link è un `<nav>`: si riserva a quelli strutturali.
- **`<main>`** — il **contenuto principale** della pagina. Ce n'è **uno solo**, ed è irripetibile per ogni pagina: non deve contenere ciò che si ripete ovunque (header, nav, footer).
- **`<aside>`** — contenuto **collaterale**: barra laterale, richiami, box correlati. Legato al contenuto ma non essenziale a capirlo.
- **`<footer>`** — il piè di pagina: copyright, contatti, link secondari.

## Sezionare il contenuto: `<article>` e `<section>`

Dentro `<main>` il contenuto si organizza con due elementi che si confondono spesso:

- **`<article>`** — un blocco **autosufficiente**, che avrebbe senso anche estratto dalla pagina e messo altrove: un post, una notizia, una scheda prodotto, un commento. Il test: "starebbe in piedi da solo in un feed?".
- **`<section>`** — un **raggruppamento tematico** di contenuto, di solito con un proprio titolo. Non è autosufficiente come l'article: è una *parte* di qualcosa (i capitoli di un articolo, le aree di una dashboard).

> [!tip]
> Regola pratica: se il blocco ha senso **da solo**, è un `<article>`; se è una **parte tematica** di un tutto, è una `<section>`; se serve solo a **raggruppare e stilare** senza significato, è un `<div>`. E ogni `<section>` dovrebbe avere un titolo: se non riesci a darglielo, probabilmente era un `<div>`.

## I titoli e l'outline

Gli elementi da `<h1>` a `<h6>` non sono "testo grande": costruiscono l'**outline** del documento, la scaletta gerarchica che gli screen reader usano per farsi un'idea della pagina e per navigarla (molti utenti saltano di titolo in titolo). Due regole che contano davvero:

- **Non saltare i livelli**: dopo un `<h2>` viene un `<h3>`, non un `<h4>`. I salti confondono la scaletta.
- **La gerarchia è semantica, non visiva**: se un titolo deve *sembrare* più piccolo, lo si fa col CSS, non scegliendo un `<h4>` al posto di un `<h2>`. Il livello racconta la *struttura*, non la dimensione.

## Altri elementi semantici utili

Oltre ai landmark, alcuni elementi danno significato a contenuti specifici ed evitano un `<div>` generico:

- **`<figure>` / `<figcaption>`** — un'illustrazione (immagine, diagramma, snippet) con la sua didascalia legata.
- **`<time datetime="2026-08-19">`** — una data/ora in formato leggibile dalla macchina, oltre che dall'utente.
- **`<details>` / `<summary>`** — un blocco a comparsa **nativo** (come le domande del *Ripasso lampo* di questi appunti), senza una riga di JavaScript.
- **`<blockquote>` / `<q>`** — una citazione, rispettivamente a blocco e in linea.
- **`<mark>`** — testo evidenziato per pertinenza (per esempio i termini cercati).

## Quando `<div>` e `<span>`

`<div>` e `<span>` restano legittimi, ma sono l'**ultima scelta**: si usano quando **nessun** elemento semantico calza e serve solo un contenitore per stilare o agganciare JavaScript. `<div>` raggruppa a blocco, `<span>` in linea (una porzione di testo). Non hanno significato — ed è esattamente il punto: non aggiungerne dove non ce n'è.

> [!warning]
> L'antipattern più comune è la **"divite"**: costruire tutto con `<div>` e ricreare a mano, con ARIA e CSS, ciò che un elemento nativo darebbe gratis. Un `<button>` è preferibile a un `<div onclick>`, un `<nav>` a un `<div class="nav">`. Vale la regola d'oro dell'accessibilità — *use the right element* — approfondita nel modulo Accessibilità e ARIA.

## Ripasso lampo

<details>
<summary>Cosa vuol dire scrivere HTML "semantico"?</summary>

Scegliere gli elementi per il loro **significato** (cos'è quel contenuto) e non per come appaiono. Elementi come `<nav>` o `<article>` dichiarano il ruolo della porzione di pagina a browser, motori di ricerca e tecnologie assistive; `<div>` non dice nulla.

</details>

<details>
<summary>Quanti <code>&lt;main&gt;</code> ci possono essere in una pagina, e cosa non deve contenere?</summary>

Uno solo. Contiene il contenuto principale e irripetibile della pagina, e **non** ciò che si ripete ovunque (header, nav, footer).

</details>

<details>
<summary>Che differenza c'è tra <code>&lt;article&gt;</code> e <code>&lt;section&gt;</code>?</summary>

`<article>` è **autosufficiente**: avrebbe senso estratto e messo altrove (un post, una scheda). `<section>` è un **raggruppamento tematico**, una parte di un tutto, di solito con un titolo. Se il blocco serve solo a raggruppare senza significato, è un `<div>`.

</details>

<details>
<summary>Perché non si devono saltare i livelli dei titoli (<code>h1</code>…<code>h6</code>)?</summary>

Perché i titoli costruiscono l'**outline** del documento, che gli screen reader usano per navigare. Saltare da `<h2>` a `<h4>` rompe la scaletta. Il livello indica la struttura, non la dimensione: per il "quanto grande" c'è il CSS.

</details>

<details>
<summary>Quando è giusto usare <code>&lt;div&gt;</code>?</summary>

Solo quando nessun elemento semantico calza e serve un contenitore neutro per stilare o agganciare JavaScript. È l'ultima scelta, non la prima: aggiungerlo dove esiste un elemento con significato è l'antipattern della "divite".

</details>

**In sintesi:**
- **Semantica = scegliere per significato**, non per aspetto: è la base di accessibilità, SEO e manutenibilità.
- I **landmark** (`<header>`, `<nav>`, `<main>` unico, `<aside>`, `<footer>`) danno l'ossatura navigabile della pagina.
- `<article>` = autosufficiente, `<section>` = parte tematica con titolo, `<div>`/`<span>` = contenitori senza significato, da usare per ultimi.
- I titoli `<h1>`–`<h6>` formano l'**outline**: non saltare i livelli, la gerarchia è semantica non visiva.
