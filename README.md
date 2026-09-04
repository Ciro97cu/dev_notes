# Dev Notes

Hub unico degli appunti di sviluppo: un **sito statico** pubblicato con GitHub Pages, **senza build** — nessun bundler, nessun passo di compilazione, i file si servono così come sono.

L'hub (`index.html` nella root) raggiunge dieci raccolte, ognuna un sito [docsify](https://docsify.js.org/) indipendente nella propria sottocartella:

| Sezione | Cartella | Contenuto |
|---|---|---|
| HTML | [`html/`](html/) | Semantica, form e accessibilità — il markup che conta |
| CSS | [`css/`](css/) | CSS moderno, dai fondamenti a Grid e animazioni |
| JavaScript | [`javascript/`](javascript/) | Guida completa (basata su *You Don't Know JS*) |
| TypeScript | [`typescript/`](typescript/) | Guida completa (validata su TypeScript 7.0) |
| Angular | [`angular/`](angular/) | Modern Angular 3ª ed. (Angular 22) — signals e oltre |
| AWS | [`aws/`](aws/) | Solutions Architect Associate (SAA-C03): teoria, decisioni e laboratori guidati |
| Git | [`git/`](git/) | Controllo di versione, da zero ad avanzato |
| Terminale | [`terminale/`](terminale/) | La riga di comando: shell (bash/zsh), filesystem, PATH e pacchetti globali |
| Code | [`code/`](code/) | Come funziona un computer, dal bit alla CPU (Petzold, «Code» 2ª ed.) |
| Glossario | [`glossario/`](glossario/) | Termini trasversali: web, tooling, React, concetti |

## Architettura

Il progetto è **zero-build** e **client-side**: non esiste un passo di compilazione, si aprono i file HTML e il resto avviene nel browser. Ogni vault è fatto a strati, dal contenuto al motore:

1. **Contenuto** — file **Markdown** (`docs/`, `capitoli/`, `labs/`, …): sono gli appunti veri e propri, l'unica cosa che si scrive davvero. Il vault AWS separa inoltre teoria, matrice d'esame e laboratori, ma continua a servire tutto come file statici.
2. **Motore** — **docsify** (`assets/vendor/docsify.min.js`): un singolo script che, nel browser, legge il Markdown e lo trasforma in HTML **a runtime** (rendering lato client, CSR — vedi [glossario · Rendering](glossario/docs/rendering-web.md)). Non è un framework applicativo ma un lettore di Markdown; usa hash-routing (`#/percorso`), quindi ogni sottocartella è una SPA autonoma servita dallo stesso repo.
3. **Estensioni** — plugin docsify (ricerca, copy-code, pagination, callout), **Prism** per il colore del codice e **Mermaid** per i diagrammi.
4. **Codice del progetto** — `assets/shared/*.js` con le feature comuni (progresso di studio, preferiti, evidenziatore, ricerca, tema) e i vari `assets/styles.css` / `app.js` per aspetto e configurazione di ciascun vault. L'hub ha in più i propri `assets/hub*.js` (landing, **ricerca globale** e backup/QR) e `assets/version.js` (versione **SemVer** dell'hub, mostrata nel footer e linkata ai tag GitHub: si bumpa a ogni push — con il tag git `vX.Y.Z` corrispondente — per confermare, a hard-refresh, che il deploy è salito). La **ricerca dell'hub** (`assets/hub-search.js`, command palette ⌘K) costruisce a runtime un indice full-text di tutti i vault — leggendo i loro `_sidebar.md` e i Markdown linkati — e lo mette in cache in `localStorage` legandolo a `DN_VERSION`, così si rigenera a ogni release; è tutto same-origin, quindi non richiede modifiche alla CSP.
5. **Dipendenze** — tutte **self-hosted** in [`assets/vendor/`](assets/vendor/), scaricate e versionate in git invece che prese da un CDN: così i vault si aprono anche offline o se un CDN è irraggiungibile. Provenienza e istruzioni di aggiornamento in [`assets/vendor/README.md`](assets/vendor/README.md), dove è documentata anche l'**unica patch locale** a una libreria (il plugin dei callout `docsify-flexible-alerts`, ampliato per accettare qualsiasi carattere nel titolo `label:`). **Unica eccezione self-hosting**: l'editor **Monaco** del playground (JS/TS/CSS) resta su CDN perché grande e non essenziale — se il suo CDN cade si rompe solo il playground, non le note.

Caricamento di una pagina, in ordine: il browser apre `<vault>/index.html`, carica docsify insieme ai plugin e agli script condivisi (tutti locali), docsify ricava dall'URL quale Markdown servire e lo rende in HTML, infine gli script del progetto agganciano progresso, preferiti ed evidenziatore.

## Perché questa architettura (e non altre)

La scelta è deliberata: per appunti personali contano **semplicità e zero attrito** più di qualsiasi ottimizzazione.

- **Non un generatore SSG con build** (Docusaurus, VitePress, MkDocs, Astro): darebbe SEO e prima pittura migliori, ma qui non servono (note personali, non un sito pubblico da indicizzare) e costerebbero una build più una pipeline CI da mantenere. Il vantaggio non ripaga.
- **Non un bundler** (Webpack, Vite): docsify è un motore **a runtime**, non c'è codice da compilare o impacchettare. Un bundler sposterebbe file già pronti aggiungendo una toolchain a vuoto.
- **Non un framework** (React, Vue, Svelte, Angular): trasformerebbe delle note in Markdown in un'applicazione, con build e complessità proporzionate a un prodotto, non a un quaderno di studio.
- **Dipendenze in locale invece che da CDN**: elimina il single-point-of-failure del CDN e le richieste a terzi (privacy) **senza** introdurre alcuna build. L'unico compromesso è aggiornarle a mano, che è anche un pregio, perché non arrivano aggiornamenti silenziosi che rompono le cose.

In sintesi, rendering client-side più dipendenze self-hosted è il punto giusto sulla curva costo/beneficio **per questo scopo**. Se il progetto cambiasse natura — documentazione pubblica con esigenze di SEO, molti contributori, contenuto dinamico — converrebbe passare a un SSG con build, che però è un cambio di categoria e non un semplice ritocco.

## Sviluppo locale

Serve un web server statico qualsiasi, avviato dalla root:

```bash
npx serve .
# oppure
python3 -m http.server
```

Poi si apre `http://localhost:<porta>/`.

> **Nota:** i PDF sorgente (libri) sono `.gitignore`d — restano solo in locale, non pubblicati.
