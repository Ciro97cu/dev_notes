---
modulo: 1
titolo: "Il documento e il DOM"
tags: [tipo/modulo, fondamenti]
---
# 01 · Il documento e il DOM
> modulo 1 — *HTML* · rif. MDN

HTML (*HyperText Markup Language*) è il linguaggio che dà **struttura e significato** al contenuto di una pagina web: non descrive come le cose *appaiono* — quello è compito del CSS — né cosa *fanno* — quello è JavaScript — ma **cos'è** ciascun pezzo di contenuto (un titolo, un paragrafo, un elenco, un'immagine). È il fondamento su cui gli altri due si appoggiano: senza una struttura chiara, stile e comportamento non hanno appigli solidi.

La divisione dei ruoli è netta e conviene tenerla a mente da subito: **HTML** dà la struttura, **CSS** la presentazione ([vedi il vault CSS](../css/)), **JavaScript** il comportamento. Tenere separate le tre cose è ciò che rende una pagina manutenibile.

## Lo scheletro di una pagina

Ogni documento HTML valido ha la stessa ossatura minima:

```html
<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8">
    <title>Pagina</title>
  </head>
  <body>
    <h1>Ciao</h1>
    <p>Testo</p>
  </body>
</html>
```

Quattro pezzi, ciascuno con un ruolo preciso:

- **`<!doctype html>`** — la prima riga, che dichiara al browser "questo è HTML moderno". Non è un tag vero e proprio ma un residuo storico: senza, il browser entra in *quirks mode* e imita il rendering buggato di vent'anni fa. Va sempre messo, così com'è.
- **`<html lang="it">`** — l'elemento radice che contiene tutto. L'attributo `lang` non è un dettaglio: dice la lingua del contenuto agli screen reader (che scelgono la pronuncia giusta) e ai motori di ricerca. Ometterlo è un errore di accessibilità comune.
- **`<head>`** — i **metadati**: informazioni *sulla* pagina che non compaiono nel corpo (codifica dei caratteri, titolo nella scheda del browser, collegamenti al CSS…). Se ne parla nel modulo [[02-head-metadati]].
- **`<body>`** — il **contenuto visibile**: tutto ciò che l'utente vede e con cui interagisce.

## Come si legge un elemento

Il mattone dell'HTML è l'**elemento**, di solito formato da un tag di apertura, un contenuto e un tag di chiusura:

```html
<p class="intro">Un paragrafo.</p>
```

Qui `<p>` apre, `</p>` chiude, e in mezzo sta il contenuto. `class="intro"` è un **attributo**: una coppia nome-valore che aggiunge informazioni all'elemento — un aggancio per il CSS, un dato di accessibilità, un comportamento.

Alcuni elementi non hanno contenuto né tag di chiusura: si chiamano **void element** e rappresentano qualcosa di autoconsistente, come `<img src="foto.jpg" alt="…">`, `<br>`, `<input>`, `<meta>`. Non si "chiudono" perché non c'è nulla da racchiudere.

> [!tip]
> Gli elementi vanno **annidati correttamente**, come scatole dentro scatole: quella aperta per ultima si chiude per prima. `<p><strong>testo</strong></p>` è corretto; `<p><strong>testo</p></strong>` no. Un annidamento sbagliato non sempre rompe la pagina — il browser prova a correggerlo — ma produce un albero diverso da quello che si intendeva.

## Dal markup all'albero: il DOM

Quando il browser riceve il testo HTML non lo tiene come stringa: lo **analizza** (*parsing*) e lo trasforma in un albero di oggetti, il **DOM** (*Document Object Model*). Ogni elemento diventa un **nodo**, annidato dentro il nodo del suo genitore esattamente com'era nel markup; e anche il testo dentro un elemento diventa un nodo a sé, un **nodo di testo**.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 720 330" role="img" aria-label="Dal markup all'albero DOM" style="width:100%;max-width:640px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><path d="M335 64 L150 110" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M335 64 L520 110" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M150 144 L150 190" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M520 144 L430 190" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M520 144 L590 190" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M150 224 L150 268" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><path d="M430 224 L430 268" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><path d="M590 224 L590 268" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><rect x="289" y="30" width="92" height="34" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.7"/><text x="335" y="52" font-size="13" text-anchor="middle" font-weight="700" fill="currentColor">&lt;html&gt;</text><rect x="104" y="110" width="92" height="34" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.7"/><text x="150" y="132" font-size="13" text-anchor="middle" font-weight="700" fill="currentColor">&lt;head&gt;</text><rect x="474" y="110" width="92" height="34" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.7"/><text x="520" y="132" font-size="13" text-anchor="middle" font-weight="700" fill="currentColor">&lt;body&gt;</text><rect x="104" y="190" width="92" height="34" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.7"/><text x="150" y="212" font-size="13" text-anchor="middle" font-weight="700" fill="currentColor">&lt;title&gt;</text><rect x="384" y="190" width="92" height="34" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.7"/><text x="430" y="212" font-size="13" text-anchor="middle" font-weight="700" fill="currentColor">&lt;h1&gt;</text><rect x="544" y="190" width="92" height="34" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.7"/><text x="590" y="212" font-size="13" text-anchor="middle" font-weight="700" fill="currentColor">&lt;p&gt;</text><ellipse cx="150" cy="286" rx="46" ry="18" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><text x="150" y="290" font-size="12" text-anchor="middle" font-style="italic" fill="currentColor">"Pagina"</text><ellipse cx="430" cy="286" rx="42" ry="18" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><text x="430" y="290" font-size="12" text-anchor="middle" font-style="italic" fill="currentColor">"Ciao"</text><ellipse cx="590" cy="286" rx="42" ry="18" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><text x="590" y="290" font-size="12" text-anchor="middle" font-style="italic" fill="currentColor">"Testo"</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Il browser trasforma il markup in un <strong>albero DOM</strong>: ogni elemento diventa un nodo (rettangoli), e il testo dentro un elemento diventa a sua volta un <strong>nodo di testo</strong> (ellissi tratteggiate). CSS e JavaScript lavorano su quest'albero, non sul testo HTML.</figcaption>
</figure>

Questo passaggio è il concetto centrale del modulo, perché **CSS e JavaScript non lavorano sul testo HTML, ma su quest'albero**. Un selettore CSS come `body h1` naviga il DOM; una riga di JavaScript come `document.querySelector('p')` cerca un nodo nell'albero e può modificarlo, e ogni sua modifica si riflette subito sulla pagina. L'HTML che si scrive è quindi la *forma iniziale* di quell'albero — il punto di partenza che poi vive nel browser.

> [!tip]
> È il motivo per cui un markup ordinato e semanticamente corretto conta più di quanto sembri: un DOM pulito è più facile da stilare, da manipolare e da far leggere alle tecnologie assistive. La qualità della struttura si propaga a tutto il resto.

## Ripasso lampo

<details>
<summary>Qual è la divisione di ruoli tra HTML, CSS e JavaScript?</summary>

**HTML** dà struttura e significato al contenuto (cos'è ogni pezzo), **CSS** la presentazione (come appare), **JavaScript** il comportamento (cosa fa). Tenerli separati rende la pagina manutenibile.

</details>

<details>
<summary>A cosa serve <code>&lt;!doctype html&gt;</code> e cosa succede se manca?</summary>

Dichiara al browser che il documento è HTML moderno. Se manca, il browser entra in *quirks mode* e imita comportamenti di rendering datati. Va sempre messo, così com'è.

</details>

<details>
<summary>Perché l'attributo <code>lang</code> su <code>&lt;html&gt;</code> è importante?</summary>

Dichiara la lingua del contenuto: gli screen reader scelgono la pronuncia corretta e i motori di ricerca la usano. Ometterlo è un errore di accessibilità comune.

</details>

<details>
<summary>Cos'è il DOM e perché conta che il markup sia pulito?</summary>

Il **DOM** è l'albero di nodi in cui il browser trasforma il markup: ogni elemento (e ogni testo) diventa un nodo. CSS e JavaScript lavorano su quest'albero, non sul testo HTML — quindi un DOM pulito è più facile da stilare, manipolare e far leggere alle tecnologie assistive.

</details>

<details>
<summary>Cos'è un <em>void element</em>? Fai un esempio.</summary>

Un elemento senza contenuto né tag di chiusura, che rappresenta qualcosa di autoconsistente: `<img>`, `<br>`, `<input>`, `<meta>`.

</details>

**In sintesi:**
- **HTML = struttura**, CSS = presentazione, JS = comportamento: tre ruoli separati, ognuno nel suo posto.
- Ossatura minima: `<!doctype html>`, poi `<html lang>` che racchiude `<head>` (metadati) e `<body>` (contenuto).
- Il browser trasforma il markup in un **albero DOM** di nodi; CSS e JS lavorano su quell'albero, non sul testo — perciò un markup pulito e ben annidato si ripaga ovunque.
