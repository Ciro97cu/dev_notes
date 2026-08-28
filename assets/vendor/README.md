# assets/vendor/ — dipendenze self-hosted

Copie **locali e versionate in git** delle librerie che prima arrivavano da CDN. Servono a rendere i vault indipendenti da `cdn.jsdelivr.net`: se il CDN è irraggiungibile o si è offline, i siti si aprono lo stesso. Sono file di terze parti, minificati: **non si modificano a mano**, si ri-scaricano. **Unica eccezione**: `docsify-flexible-alerts.min.js`, che porta una patch locale (vedi *Patch locali* in fondo) — ri-scaricandolo la si perde.

## Cosa c'è e da dove viene
Ogni file è stato scaricato da `https://cdn.jsdelivr.net/npm/…`:

| File locale | Sorgente (jsdelivr `/npm/…`) |
| --- | --- |
| `docsify.min.js` | `docsify@4/lib/docsify.min.js` |
| `vue.css` | `docsify@4/lib/themes/vue.css` |
| `docsify-search.min.js` | `docsify@4/lib/plugins/search.min.js` |
| `docsify-copy-code.min.js` | `docsify-copy-code@2` |
| `docsify-pagination.min.js` | `docsify-pagination@2/dist/docsify-pagination.min.js` |
| `docsify-flexible-alerts.min.js` | `docsify-plugin-flexible-alerts` ⚠️ *patchato, vedi sotto* |
| `mermaid.min.js` | `mermaid@11/dist/mermaid.min.js` |
| `prism-*.min.js` | `prismjs@1/components/prism-*.min.js` |
| `fonts.css` + `fonts/*.woff2` | Google Fonts (Hanken Grotesk, JetBrains Mono) |

## Come aggiornare una libreria
Si ri-scarica il file dalla sua sorgente e si sostituisce, ad esempio:

```bash
curl -fsSL -o assets/vendor/docsify.min.js https://cdn.jsdelivr.net/npm/docsify@4/lib/docsify.min.js
```

L'aggiornamento è **manuale e deliberato**: nessun update silenzioso, a differenza dei link CDN.

## Patch locali
### `docsify-flexible-alerts.min.js` — caratteri ammessi nel `label:`
Il plugin riconosce un titolo custom **solo** con la sintassi a pipe `> [!info|label:Titolo]`. La sua regex, però, accetta nel titolo un set di caratteri ristretto (niente `+`, `?`, `(`, `)`, `@`, `{`, `}`, `/`, …): i titoli tipo `Angular 22+ · @Service({ … })` o `Migrare o ricreare?` la rompevano, degradando il callout a blockquote grezzo. La patch **allarga a "qualsiasi carattere tranne `]` e `|`"** le due classi di caratteri che filtrano il `label:` (la regex `afterEach` che estrae il tag e la funzione `l()` che ne legge le opzioni): `[\w*:[.…]` → `[^\]|]`.

⚠️ **Ri-scaricando il file la patch si perde** e tutti i titoli con `+`/`?`/`(`… tornano rotti. Se si aggiorna il plugin, **riapplicare** la stessa sostituzione sulle due classi (l'operazione è in un commit di git, cercabile per `[^\]|]`).

## Eccezione: Monaco (playground)
L'editor **Monaco** (playground di JS/TS/CSS) **resta su CDN** (`cdn.jsdelivr.net/npm/monaco-editor@0.52.2`, in ogni `assets/playground.js`): è grande e non essenziale. Se il suo CDN cade si rompe solo il playground, non le note. Per questo le CSP di quei tre vault tengono ancora `cdn.jsdelivr.net`; git/glossario/angular no.
