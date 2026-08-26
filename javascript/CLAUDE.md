# javascript/ — regole specifiche

Guida a JavaScript: sintesi ragionata e traduzione IT della serie **You Don't Know JS** (Kyle Simpson), sei libri. Regole comuni: vedi [../CLAUDE.md](../CLAUDE.md). Qui solo le specifiche del vault.

Struttura: contenuti in `docs/libroN/` (`libro1`…`libro6`), **un capitolo per pagina**. Più `assets/` (immagini SVG + `styles.css`), `_sidebar.md`, `README.md`.

## Specifiche di contenuto
- Termini tecnici EN (scope, closure, hoisting, prototype, callback, promise, …) **non tradotti**: sono lo standard consolidato dell'ecosistema JavaScript.
- **`this` mai tradotto**: è una keyword del linguaggio, tradurla ne altera il significato.
- Fedeltà alla struttura originale della serie (i sei libri e l'ordine dei capitoli).
- **Correttezza prima di tutto**: sono temi profondi e insidiosi (coercizione, `this`, closure, async). Ogni claim, output di codice e sfumatura va **verificato sul PDF** (`Kyle_Simpson-All-6.pdf`); non semplificare al punto da alterare ciò che il libro afferma.
- **Quando il libro è superato**: se un'affermazione di YDKJS (2015, fino a ES6) **oggi non è più vera** perché il linguaggio è cambiato, e se ne è **certi al 100%**, si corregge e si **segnala** con un callout `> [!info] Oggi` che contrappone *"il libro dice X; oggi vale Y"*. Se invece è solo una semplificazione ancora valida, si resta **fedeli** al libro (non si "corregge" il libro).
- **Novità post-libro**: le feature JS non coperte da YDKJS (da ES2016 in poi) **non** si infilano nei capitoli fedeli al libro, ma vanno nella sezione dedicata e distaccata `docs/moderno/` ("JavaScript moderno — oltre YDKJS"), organizzata **per versione ES** e verificata su [MDN](https://developer.mozilla.org/).
- **Marcatore ➕ "fuori-serie" (moderno/)**: essendo `docs/moderno/` interamente al di fuori del PDF (YDKJS si ferma a ES2015), **ogni pagina** apre (subito dopo l'H1) con la stessa nota in corsivo ➕ che lo dichiara (come si fa in Angular per il contenuto extra-libro). Testo standard: `*➕ Fuori dalla serie YDKJS — l'intera sezione «JavaScript moderno» raccoglie le feature aggiunte al linguaggio dopo ES2015 (dove i sei libri si fermano), verificate su [MDN](https://developer.mozilla.org/).*`. Le singole feature dentro la pagina **non** si marcano una per una: basta il banner in testa.

## Tono e chiarezza
Vale la **voce "professore"** del [root](../CLAUDE.md): prosa narrativa e distesa, impersonale, ogni tecnicismo spiegato. Qui conta soprattutto **non tagliare la profondità tecnica** su temi insidiosi (coercizione, `this`, closure, async): accessibile è *come* si spiega, non *quanto* si semplifica.

## Struttura di ogni capitolo
1. **Spiegazione** del contenuto — sintetica ma completa, con esempi di codice.
2. **Ripasso veloce** — i punti chiave in poche righe con uno snippet minimo.
3. **Domande** — quiz a risposta nascosta per l'auto-valutazione.

## Checklist manutenzione (quando aggiungi/rinomini una nota)
- [ ] `_sidebar.md` — voce nel libro e nell'ordine giusto.
- [ ] `README.md` — se cambia la mappa dei sei libri.
- [ ] Sezioni **Ripasso veloce** e **Domande** presenti a fine capitolo.
- [ ] Eventuali diagrammi SVG in `assets/images/`.
