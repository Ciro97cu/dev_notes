# Dev Notes

Hub unico degli appunti di sviluppo. Sito statico, **zero dipendenze**, pubblicato con GitHub Pages.

L'hub (`index.html`) raggiunge cinque raccolte, ognuna un sito [docsify](https://docsify.js.org/) indipendente nella propria sottocartella:

| Sezione | Cartella | Contenuto |
|---|---|---|
| Git | [`git/`](git/) | Controllo di versione, da zero ad avanzato |
| JavaScript | [`javascript/`](javascript/) | Guida completa (basata su *You Don't Know JS*) |
| TypeScript | [`typescript/`](typescript/) | Guida completa (TypeScript 6.0) |
| Angular | [`angular/`](angular/) | Modern Angular 2ª ed. — signals e oltre |
| Glossario | [`glossario/`](glossario/) | Termini trasversali: web, tooling, React, concetti |

## Come funziona

- La root serve una landing HTML statica con cinque card.
- Ogni sottocartella mantiene il **proprio** `index.html` docsify, tema e plugin: nessuna configurazione condivisa da riconciliare.
- Docsify usa hash-routing, quindi ogni sottocartella è una SPA autonoma servita sotto lo stesso repo/URL.
- Un link 🏠 in ogni sezione riporta all'hub.

## Sviluppo locale

Serve un web server statico qualsiasi dalla root:

```bash
npx serve .
# oppure
python3 -m http.server
```

Poi apri `http://localhost:<porta>/`.

> **Nota:** i PDF sorgente (libri) sono `.gitignore`d — restano solo in locale, non pubblicati.
