---
modulo: 4
titolo: "Testo e link"
tags: [tipo/modulo, semantica, testo]
---
# 04 · Testo e link
> modulo 4 — *HTML* · rif. MDN

Gran parte del contenuto di una pagina è **testo**, e anche qui la scelta dell'elemento porta significato. La distinzione di fondo è tra elementi che dicono *cosa* è un pezzo di testo (l'importanza, una citazione, un termine tecnico) e quelli che ne cambiano solo l'aspetto. Preferire i primi è ciò che rende il testo comprensibile anche a chi non lo *vede*, ma lo ascolta da uno screen reader.

## Enfasi e significato: `<strong>`/`<em>` contro `<b>`/`<i>`

Sono la coppia che più spesso si usa a sproposito, perché a schermo rendono uguale (grassetto e corsivo) ma significano cose diverse:

- **`<strong>`** — **importanza** forte: un avviso, una parola da non ignorare. Uno screen reader può cambiare tono.
- **`<em>`** — **enfasi** che cambia il senso della frase, come l'intonazione della voce (*"non ho detto che l'ho fatto **io**"*).
- **`<b>`** — grassetto **stilistico** senza aggiungere importanza: una keyword, il nome di un prodotto.
- **`<i>`** — corsivo **stilistico**: un termine straniero, un nome scientifico, un pensiero.

> [!tip]
> Regola pratica: se conta il **significato** (importanza, enfasi) usa `<strong>`/`<em>`; se è solo **convenzione tipografica** senza peso semantico usa `<b>`/`<i>`; se è **puro aspetto** (questo testo dev'essere grassetto perché sta bene), non è HTML — è CSS.

Altri elementi in linea che vale la pena conoscere, perché sostituiscono uno `<span>` anonimo con qualcosa di significativo: **`<code>`** (codice), **`<kbd>`** (tasti da premere), **`<abbr title="…">`** (sigla con spiegazione), **`<cite>`** (titolo di un'opera), **`<sub>`/`<sup>`** (pedice/apice), **`<small>`** (postille), **`<time datetime="…">`** (date leggibili dalla macchina).

## Le liste

Tre tipi, ognuno per un caso preciso:

- **`<ul>`** — lista **non ordinata**: l'ordine degli elementi non è significativo (un elenco di caratteristiche).
- **`<ol>`** — lista **ordinata**: l'ordine conta (i passi di una ricetta, una classifica). Attributi utili: `start`, `reversed`, `type`.
- **`<dl>`** (con `<dt>`/`<dd>`) — lista di **descrizioni**: coppie termine/definizione, come un glossario, una FAQ o coppie chiave-valore.

La decisione è semplice: si sceglie `<ol>` **solo** se cambiare l'ordine cambierebbe il senso; altrimenti `<ul>`.

## I link: `<a>`

L'ancora `<a>` con il suo `href` è ciò che rende il web una rete. L'`href` può puntare a una pagina (URL assoluto o relativo), a un punto della stessa pagina (`#sezione`), a un indirizzo email (`mailto:`) o a un numero (`tel:`).

```html
<a href="/guida">Leggi la guida completa</a>
<a href="rapporto.pdf" download>Scarica il rapporto (PDF)</a>
<a href="https://esterno.example" target="_blank" rel="noopener">Sito esterno</a>
```

Due decisioni contano più delle altre:

- **Il testo del link dev'essere descrittivo.** Gli screen reader permettono di elencare tutti i link di una pagina *fuori dal contesto*: una fila di "clicca qui" è inutile, mentre "Leggi la guida completa" si capisce da solo. Il testo deve descrivere la **destinazione**.
- **`target="_blank"` va accompagnato da `rel="noopener"`.** Aprire in una nuova scheda, senza questa precauzione, dà alla pagina di destinazione un riferimento (`window.opener`) alla tua — un rischio di sicurezza. I browser moderni lo sottintendono, ma esplicitarlo è buona prassi (`noreferrer` in più se non si vuole passare la provenienza).

## Tabelle: solo per dati, e accessibili

Una `<table>` serve a presentare **dati tabellari** — righe e colonne che si incrociano. **Non** è uno strumento di layout: disporre la pagina con le tabelle è un antipattern del passato, oggi si fa con CSS Grid e Flexbox (vedi <a href="../css/#/docs/13-grid" target="_blank" rel="noopener">CSS · Grid</a>). Una tabella di dati ben fatta ha alcune parti che la rendono navigabile da chi non la vede:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 560 214" role="img" aria-label="Anatomia di una tabella accessibile: caption, th con scope col e row, td" style="width:100%;max-width:560px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="150" y="48" width="300" height="24" rx="4" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="300" y="64" font-size="11" text-anchor="middle" font-style="italic">Orario dei turni</text><rect x="150" y="74" width="100" height="40" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><rect x="250" y="74" width="100" height="40" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="300" y="99" font-size="12" text-anchor="middle" font-weight="700">Lun</text><rect x="350" y="74" width="100" height="40" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="400" y="99" font-size="12" text-anchor="middle" font-weight="700">Mar</text><rect x="150" y="114" width="100" height="40" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="200" y="139" font-size="12" text-anchor="middle" font-weight="700">Mattina</text><rect x="250" y="114" width="100" height="40" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="300" y="139" font-size="12" text-anchor="middle">9–13</text><rect x="350" y="114" width="100" height="40" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="400" y="139" font-size="12" text-anchor="middle">9–13</text><rect x="150" y="154" width="100" height="40" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="200" y="179" font-size="12" text-anchor="middle" font-weight="700">Sera</text><rect x="250" y="154" width="100" height="40" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="300" y="179" font-size="12" text-anchor="middle">—</text><rect x="350" y="154" width="100" height="40" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="400" y="179" font-size="12" text-anchor="middle">15–19</text><line x1="130" y1="60" x2="150" y2="60" stroke="currentColor" stroke-width="1.2"/><text x="126" y="64" font-size="10.5" text-anchor="end">&lt;caption&gt;</text><line x1="450" y1="94" x2="468" y2="94" stroke="currentColor" stroke-width="1.2"/><text x="472" y="98" font-size="10.5">scope="col"</text><line x1="94" y1="134" x2="150" y2="134" stroke="currentColor" stroke-width="1.2"/><text x="90" y="138" font-size="10.5" text-anchor="end">scope="row"</text><line x1="450" y1="174" x2="468" y2="174" stroke="currentColor" stroke-width="1.2"/><text x="472" y="178" font-size="10.5">&lt;td&gt;</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Le parti di una tabella accessibile: il <code>&lt;caption&gt;</code> le dà un titolo; le celle di intestazione sono <code>&lt;th&gt;</code> con <code>scope="col"</code> (in alto) o <code>scope="row"</code> (a sinistra), che legano ogni cella <code>&lt;td&gt;</code> alle sue intestazioni. Così uno screen reader, letta "15–19", sa dire "Sera, Mar".</figcaption>
</figure>

- **`<caption>`** — il titolo della tabella, primo figlio di `<table>`, annunciato dagli screen reader.
- **`<thead>` / `<tbody>` / `<tfoot>`** — raggruppano intestazione, corpo e piè della tabella.
- **`<th>` contro `<td>`** — `<th>` è una cella di **intestazione**, `<td>` una cella di **dati**.
- **`scope="col"` / `scope="row"`** — dice se un `<th>` intesta una **colonna** o una **riga**. È il dettaglio che collega ogni dato alle sue intestazioni: senza, una tabella complessa diventa illeggibile per chi la ascolta.

## Ripasso lampo

<details>
<summary>Quando si usa <code>&lt;strong&gt;</code>/<code>&lt;em&gt;</code> e quando <code>&lt;b&gt;</code>/<code>&lt;i&gt;</code>?</summary>

`<strong>` (importanza) ed `<em>` (enfasi che cambia il senso) portano **significato**. `<b>` e `<i>` sono grassetto/corsivo **stilistici** senza peso semantico (keyword, nome prodotto, termine straniero). Se è puro aspetto, non è HTML ma CSS.

</details>

<details>
<summary>Quando <code>&lt;ol&gt;</code> e quando <code>&lt;ul&gt;</code>?</summary>

`<ol>` (ordinata) solo se l'ordine è **significativo** — cambiarlo cambierebbe il senso (passi, classifica). Altrimenti `<ul>` (non ordinata). Per coppie termine/descrizione c'è `<dl>`.

</details>

<details>
<summary>Perché il testo di un link non dovrebbe essere "clicca qui"?</summary>

Perché gli screen reader elencano i link **fuori contesto**: "clicca qui" ripetuto non dice nulla. Il testo deve descrivere la **destinazione** ("Leggi la guida completa"), così ha senso anche isolato.

</details>

<details>
<summary>Perché <code>target="_blank"</code> va con <code>rel="noopener"</code>?</summary>

Senza, la pagina aperta nella nuova scheda riceve un riferimento (`window.opener`) alla pagina di partenza, con un rischio di sicurezza. `noopener` lo impedisce. I browser moderni lo sottintendono, ma esplicitarlo è buona prassi.

</details>

<details>
<summary>A cosa serve <code>scope</code> in una tabella?</summary>

Dice se un `<th>` intesta una colonna (`scope="col"`) o una riga (`scope="row"`), collegando ogni cella `<td>` alle sue intestazioni. È ciò che rende la tabella comprensibile a uno screen reader. Le tabelle vanno usate per **dati**, non per il layout.

</details>

**In sintesi:**
- **Significato prima dell'aspetto**: `<strong>`/`<em>` (semantici) vs `<b>`/`<i>` (stilistici); il puro aspetto è CSS.
- Liste: `<ol>` solo se l'ordine conta, altrimenti `<ul>`; `<dl>` per coppie termine/descrizione.
- Link: testo **descrittivo** (a11y) e `rel="noopener"` con `target="_blank"` (sicurezza).
- Tabelle solo per **dati**, con `<caption>`, `<th>` e `scope` che le rendono accessibili — mai per il layout.
