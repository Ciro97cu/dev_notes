# javascript/ — regole specifiche

Guida a JavaScript: sintesi ragionata e traduzione IT della serie **You Don't Know JS** (Kyle Simpson), sei libri. Regole comuni: vedi [../CLAUDE.md](../CLAUDE.md). Qui solo le specifiche del vault.

Struttura: contenuti in `docs/libroN/` (`libro1`…`libro6`), **un capitolo per pagina**. Più `assets/` (immagini SVG + `styles.css`), `_sidebar.md`, `README.md`.

## Specifiche di contenuto
- Termini tecnici EN (scope, closure, hoisting, prototype, callback, promise, …) **non tradotti**: sono lo standard consolidato dell'ecosistema JavaScript.
- **`this` mai tradotto**: è una keyword del linguaggio, tradurla ne altera il significato.
- Fedeltà alla struttura originale della serie (i sei libri e l'ordine dei capitoli).
- **Correttezza prima di tutto**: sono temi profondi e insidiosi (coercizione, `this`, closure, async). Ogni claim, output di codice e sfumatura va **verificato sul PDF** (`Kyle_Simpson-All-6.pdf`); non semplificare al punto da alterare ciò che il libro afferma.

## Tono e chiarezza (registro professore)
Come nel vault Angular: si spiega come farebbe **un professore appassionato e chiaro**, con prosa **fluida e distesa**.
- **Registro impersonale** (*"si usa"*, *"si ottiene"*, *"conviene"*); **mai** la seconda persona (*"usi"*, *"puoi"*, *"vedi"*) nella teoria — l'imperativo solo nei passi operativi.
- Ogni sezione apre con una **frase-definizione in parole semplici**; ogni tecnicismo si introduce spiegandolo, senza però tagliare la profondità tecnica.
- **Prosa, non elenchi spezzati**; niente `→` come connettivo di prosa (si usano le congiunzioni).

## Struttura di ogni capitolo
1. **Spiegazione** del contenuto — sintetica ma completa, con esempi di codice.
2. **⚡ Ripasso veloce** — i punti chiave in poche righe con uno snippet minimo.
3. **Domande** — quiz a risposta nascosta per l'auto-valutazione.

## Checklist manutenzione (quando aggiungi/rinomini una nota)
- [ ] `_sidebar.md` — voce nel libro e nell'ordine giusto.
- [ ] `README.md` — se cambia la mappa dei sei libri.
- [ ] Sezioni **⚡ Ripasso veloce** e **Domande** presenti a fine capitolo.
- [ ] Eventuali diagrammi SVG in `assets/images/`.
