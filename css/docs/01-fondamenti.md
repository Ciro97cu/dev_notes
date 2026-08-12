---
modulo: 1
titolo: "Fondamenti"
tags: [tipo/modulo, fondamenti]
---
# 01 · Fondamenti
> modulo 1 — *CSS* · rif. MDN

**CSS** (*Cascading Style Sheets*) è il linguaggio che descrive l'**aspetto** di un documento HTML: colori, tipografia, spaziature, layout. Separa la **presentazione** dal **contenuto** (l'HTML), così la stessa struttura può cambiare veste senza toccare il markup, e più pagine possono condividere un unico foglio di stile.

## Anatomia di una regola

Una regola CSS associa uno o più **selettori** (cosa stilizzare) a un **blocco di dichiarazioni** (come stilizzarlo). Ogni dichiarazione è una coppia `property: value`, chiusa da `;`.

```css
h1 {
  color: crimson;       /* proprietà: valore */
  font-size: 2rem;
}
```

- Il **selettore** (`h1`) individua gli elementi bersaglio.
- Le **dichiarazioni** stanno tra graffe `{ }`; il `;` finale separa le dichiarazioni ed è buona norma metterlo anche sull'ultima, così aggiungerne un'altra non rompe nulla.
- Gli spazi e gli a-capo sono liberi: servono solo alla leggibilità.

> [!tip]
> I **commenti** si scrivono solo con `/* … */` (non esiste `//` in CSS, nemmeno per una riga singola). Valgono ovunque, anche a metà di una dichiarazione.

## Come si aggiunge il CSS a una pagina

Ci sono tre modi; in pratica se ne usa **uno** — il foglio esterno.

### Foglio esterno (`<link>`) — il modo standard

Il CSS sta in un file `.css` separato, collegato nell'`<head>` con `<link>`:

```html
<head>
  <link rel="stylesheet" href="styles.css" />
</head>
```

È l'approccio consigliato: tiene lo stile fuori dal markup, lo rende **riutilizzabile** su più pagine e permette al browser di metterlo in **cache** (scaricato una volta, riusato ovunque).

### Stile interno (`<style>`)

Un blocco `<style>` nell'`<head>` vale per l'**intera** pagina, ma solo per quella:

```html
<head>
  <style>
    body { margin: 0; }
  </style>
</head>
```

Utile per prototipi o pagine singole; non riusabile altrove.

### Stile inline (attributo `style`) — da evitare

Lo stile si scrive direttamente sull'elemento:

```html
<p style="color: gray;">Testo</p>
```

Mescola presentazione e contenuto, non è riutilizzabile e ha una **specificità** altissima (difficile da sovrascrivere, vedi [[04-cascade-specificita-ereditarieta]]). Si riserva a casi limitati (es. stili calcolati via JavaScript, email HTML).

> [!info] Legacy
> Esiste anche `@import url("altro.css");` dentro un file CSS per includerne un altro. Si evita per il **CSS di produzione**: gli `@import` si scaricano in **serie** (uno dopo l'altro, non in parallelo), rallentando il rendering. Meglio più `<link>`, oppure un bundler. Un uso ancora valido è `@import` con *media query* o *layer* (`@import "x.css" layer(base);`).

## Il modello mentale: HTML struttura, CSS veste

Il browser costruisce l'albero degli elementi dall'HTML, poi applica le regole CSS per calcolare l'aspetto finale di ognuno. Quando più regole toccano lo stesso elemento, entrano in gioco **cascade**, **specificità** ed **ereditarietà** — i meccanismi che decidono quale valore vince (modulo [[04-cascade-specificita-ereditarieta]]).

Collegamenti: [[02-selettori-combinatori]] · [[04-cascade-specificita-ereditarieta]]

## Ripasso lampo

<details>
<summary>Da cosa è composta una regola CSS?</summary>

Da un **selettore** (quali elementi colpire) e da un **blocco di dichiarazioni** tra `{ }`, dove ogni dichiarazione è una coppia `property: value;`.

</details>

<details>
<summary>Perché il foglio esterno con <code><link></code> è preferito a stile interno e inline?</summary>

Separa stile e contenuto, è **riutilizzabile** su più pagine ed è **cacheabile** dal browser. Lo stile interno vale per una sola pagina; l'inline mescola tutto ed è difficilissimo da sovrascrivere (specificità altissima).

</details>

<details>
<summary>Come si scrive un commento in CSS? Esiste il commento di riga <code>//</code>?</summary>

Solo `/* … */`. Il `//` **non** esiste in CSS puro (è una feature di preprocessori come Sass).

</details>

<details>
<summary>Perché si sconsiglia <code>@import</code> per il CSS di produzione?</summary>

Gli `@import` si scaricano in serie invece che in parallelo, ritardando il rendering. Meglio più `<link>` o un bundler; `@import` resta utile solo con media query o cascade layer.

</details>

**In sintesi:**
- CSS descrive la **presentazione**; l'HTML il **contenuto**. Una regola = selettore + dichiarazioni `property: value;`.
- Tre modi per applicarlo — esterno (`<link>`, lo standard), interno (`<style>`), inline (`style`, da evitare).
- Commenti solo con `/* … */`; quando più regole competono, decidono cascade, specificità ed ereditarietà.
