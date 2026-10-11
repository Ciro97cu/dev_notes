# 02 · Moduli e pacchetti

Un **modulo** è un file di codice che tiene private le proprie variabili ed espone all'esterno solo ciò che decide di **esportare**; un altro file, per usarlo, lo **importa** in modo esplicito. Un **pacchetto** è un passo più in là: una cartella di moduli accompagnata da un file `package.json` che la descrive, con un nome, una versione e i punti d'ingresso da cui la si usa. Sono i due mattoni con cui si organizza qualunque progetto Node, e anche il motivo per cui, aprendo uno script, si incontrano righe come `import { readFile } from 'node:fs/promises'` o `import.meta.url`. Questo capitolo le scioglie una per una.

## Perché servono i moduli

Nel browser delle origini ogni file JavaScript incluso con un tag `<script>` finiva nello stesso **spazio globale**: una variabile dichiarata in un file poteva scontrarsi con una omonima di un altro, e l'ordine dei tag decideva che cosa esistesse in un dato momento. I moduli risolvono il problema dando a ogni file il **proprio ambito** e rendendo esplicite le dipendenze: si vede, in cima al file, da dove arriva ogni cosa.

JavaScript non ebbe un sistema di moduli standard fino a ECMAScript 2015, e Node, nato prima, ne adottò uno suo: **CommonJS**. Lo standard arrivato dopo si chiama **ES modules** (ESM) ed è lo stesso del browser. Node li [supporta entrambi](https://nodejs.org/en/learn/getting-started/differences-between-nodejs-and-the-browser): l'ESM è la strada di oggi, comune a browser e Node, mentre CommonJS resta in moltissimo codice e in molti pacchetti npm. La sintassi di `import` ed `export` in sé è trattata nel <a href="../javascript/#/docs/libro6/03-organizzazione" target="_blank" rel="noopener">vault JavaScript</a>; qui interessa come Node la applica.

## CommonJS: `require` e `module.exports`

In **CommonJS** un modulo espone ciò che assegna a `module.exports`, e un altro file lo ottiene chiamando la funzione `require()`.

```js
// somma.cjs
function somma(a, b) { return a + b; }
module.exports = { somma };

// main.cjs
const { somma } = require('./somma.cjs');
console.log(somma(2, 3));   // 5
```

`require()` è una funzione normale, eseguita mentre il programma gira: legge il file, lo esegue **subito** (in modo sincrono) e restituisce il suo `module.exports`, che poi resta in memoria così il modulo viene eseguito una volta sola. Ogni file CommonJS riceve inoltre alcune variabili pronte, fra cui `__filename` (il percorso del file stesso) e `__dirname` (la sua cartella). Proprio perché `require()` si risolve solo eseguendo il codice, i bundler faticano ad analizzarlo: il perché, e le conseguenze sul *tree-shaking*, sono spiegati nel <a href="../glossario/#/docs/moduli-e-bundling?id=commonjs" target="_blank" rel="noopener">glossario alla voce CommonJS</a>.

## ES modules: `import` ed `export`

Negli **ES modules** le dipendenze si dichiarano con `import` ed `export`.

```js
// somma.mjs
export function somma(a, b) { return a + b; }

// main.mjs
import { somma } from './somma.mjs';
console.log(somma(2, 3));   // 5
```

Le dichiarazioni `import` stanno in cima al file e sono **statiche**: Node le legge e risolve tutto il grafo dei moduli prima di eseguire una sola riga, e questo permette agli strumenti di analizzarlo senza eseguirlo. Negli ES modules si può inoltre usare `await` direttamente al livello più esterno del file (*top-level await*), senza racchiuderlo in una funzione `async`. In Node c'è una differenza pratica rispetto a CommonJS che fa inciampare spesso: nei percorsi relativi l'**estensione è obbligatoria**, quindi si scrive `'./somma.mjs'` e non `'./somma'`.

## Come Node sceglie fra i due

Un file `.js` può contenere l'uno o l'altro sistema, quindi Node deve sapere come trattarlo. Le [regole](https://nodejs.org/api/packages.html#determining-module-system) guardano due cose: l'estensione del file e il campo `"type"` del `package.json` più vicino, risalendo le cartelle.

| File | Come lo tratta Node |
|---|---|
| `.mjs` | sempre ES module |
| `.cjs` | sempre CommonJS |
| `.js`, con `"type": "module"` nel `package.json` più vicino | ES module |
| `.js`, con `"type": "commonjs"` | CommonJS |
| `.js`, senza campo `"type"` (o senza `package.json`) | CommonJS; ma se il file contiene sintassi ESM, Node la riconosce e lo esegue come ES module |

L'ultima riga è il **rilevamento della sintassi** (*syntax detection*), [attivo di default da Node 22.7 e 20.19](https://nodejs.org/api/packages.html#syntax-detection): Node prova a eseguire il file come CommonJS e, se incontra sintassi che solo un ES module ammette (come `import` ed `export`), lo riesegue come ESM. È una rete di sicurezza, non una scelta: la documentazione raccomanda di dichiarare sempre `"type"`, così Node e gli strumenti di build non devono indovinare.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 680 300" role="img" aria-label="Come Node sceglie il sistema di moduli: un file .mjs è sempre ES module, un .cjs sempre CommonJS; per un .js si guarda il campo type del package.json più vicino: module dà ES module, commonjs dà CommonJS; se manca, CommonJS a meno che il file contenga sintassi ESM" style="width:100%;max-width:680px;height:auto;color:inherit"><defs><marker id="n02-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="270" y="16" width="140" height="36" rx="18" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="340" y="39" font-size="12" text-anchor="middle" font-weight="700">estensione?</text><line x1="290" y1="52" x2="104" y2="96" stroke="currentColor" stroke-width="1.4" marker-end="url(#n02-a)"/><text x="182" y="66" font-size="11" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">.mjs</text><line x1="340" y1="52" x2="340" y2="96" stroke="currentColor" stroke-width="1.4" marker-end="url(#n02-a)"/><text x="356" y="80" font-size="11" font-family="ui-monospace,Menlo,monospace">.js</text><line x1="390" y1="52" x2="576" y2="96" stroke="currentColor" stroke-width="1.4" marker-end="url(#n02-a)"/><text x="498" y="66" font-size="11" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">.cjs</text><rect x="30" y="100" width="150" height="36" rx="8" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8"/><text x="105" y="123" font-size="12" text-anchor="middle" font-weight="700">ES module</text><rect x="500" y="100" width="150" height="36" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><text x="575" y="123" font-size="12" text-anchor="middle" font-weight="700">CommonJS</text><rect x="240" y="100" width="200" height="44" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="340" y="119" font-size="11.5" text-anchor="middle" font-weight="700">campo "type" del</text><text x="340" y="135" font-size="11.5" text-anchor="middle" font-weight="700">package.json più vicino?</text><line x1="270" y1="146" x2="138" y2="192" stroke="currentColor" stroke-width="1.4" marker-end="url(#n02-a)"/><text x="186" y="160" font-size="11" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">"module"</text><line x1="340" y1="146" x2="340" y2="192" stroke="currentColor" stroke-width="1.4" marker-end="url(#n02-a)"/><text x="350" y="176" font-size="11">assente</text><line x1="410" y1="146" x2="542" y2="192" stroke="currentColor" stroke-width="1.4" marker-end="url(#n02-a)"/><text x="500" y="160" font-size="11" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">"commonjs"</text><rect x="60" y="196" width="150" height="36" rx="8" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8"/><text x="135" y="219" font-size="12" text-anchor="middle" font-weight="700">ES module</text><rect x="470" y="196" width="150" height="36" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><text x="545" y="219" font-size="12" text-anchor="middle" font-weight="700">CommonJS</text><rect x="240" y="196" width="200" height="74" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 3"/><text x="340" y="217" font-size="11.5" text-anchor="middle" font-weight="700">CommonJS…</text><text x="340" y="235" font-size="10.5" text-anchor="middle" opacity=".8">…ma se il file contiene</text><text x="340" y="250" font-size="10.5" text-anchor="middle" opacity=".8">sintassi ESM, ES module</text><text x="340" y="264" font-size="9.5" text-anchor="middle" opacity=".65">(Node 22.7+ / 20.19+)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">La decisione di Node. Le estensioni <code>.mjs</code> e <code>.cjs</code> sono definitive; per un <code>.js</code> decide il campo <code>"type"</code>. Il caso tratteggiato, senza <code>"type"</code>, è quello che la documentazione invita a evitare dichiarando sempre il tipo del pacchetto.</figcaption>
</figure>

## I moduli integrati e il prefisso `node:`

Node porta con sé una serie di **moduli integrati** (*built-in*), disponibili senza installare nulla: `fs` per i file, `path` per i percorsi, `url`, `http`, `crypto`, `os`, `child_process` e altri. Si possono importare con il nome nudo (`'fs'`) oppure con il prefisso **`node:`** (`'node:fs'`), che la documentazione descrive come uno [schema di URL](https://nodejs.org/api/esm.html#node-imports) per riferirsi ai moduli integrati con un indirizzo assoluto. La forma con il prefisso è quella da preferire: rende evidente a colpo d'occhio che il modulo viene da Node e non da `node_modules`, e alcuni moduli recenti, come il test runner `node:test`, esistono **solo** con il prefisso.

Alcuni moduli hanno più punti d'ingresso. `node:fs` offre l'interfaccia classica, con le versioni a callback e quelle `Sync`, mentre `node:fs/promises` offre le stesse operazioni sotto forma di Promise, da usare con `await`: è la scelta normale per il codice nuovo (la differenza fra bloccante e non bloccante è nel [[01-dentro-node#bloccante-e-non-bloccante|capitolo 01]]).

```js
import { readFile, writeFile, readdir } from 'node:fs/promises';   // file, versione a Promise
import { existsSync } from 'node:fs';                              // controllo sincrono, comodo all'avvio
import { dirname, join, basename } from 'node:path';               // manipolazione di percorsi (solo stringhe)
import { fileURLToPath } from 'node:url';                          // da URL file:// a percorso normale
```

## Dove si trova il modulo: `import.meta`

In CommonJS `__dirname` e `__filename` dicono a un modulo dove si trova su disco. Negli ES modules [queste variabili non esistono](https://nodejs.org/api/esm.html#no-__filename-or-__dirname); al loro posto c'è l'oggetto **`import.meta`**, che contiene informazioni sul modulo corrente. La proprietà storica è **`import.meta.url`**: l'indirizzo del file in forma di URL `file:`, [definito esattamente come nel browser](https://nodejs.org/api/esm.html#importmetaurl). Da Node 20.11 e 21.2 si aggiungono **`import.meta.filename`** e **`import.meta.dirname`**, che restituiscono direttamente il percorso del file e della sua cartella e che da Node 24 [non sono più sperimentali](https://nodejs.org/api/esm.html#importmetadirname).

```js
import { join } from 'node:path';

console.log(import.meta.url);        // file:///Users/…/progetto/scripts/build.mjs
console.log(import.meta.dirname);    // /Users/…/progetto/scripts

// un file accanto allo script, qualunque sia la cartella da cui lo si lancia
const config = join(import.meta.dirname, 'config.json');
```

Sapere dove si trova lo script conta più di quanto sembri. Un percorso relativo passato alle funzioni di `node:fs`, come `readFile('config.json')`, viene risolto rispetto alla **cartella di lavoro** del processo (`process.cwd()`), cioè la cartella da cui è stato lanciato il comando, **non** rispetto alla cartella dello script. Lo stesso script lanciato dalla radice del progetto o dalla sua sottocartella cercherebbe il file in due posti diversi; costruendo il percorso a partire da `import.meta.dirname` lo trova sempre.

> [!info|label:Legacy]
> Prima di Node 20.11 la cartella dello script si ricavava a mano, convertendo l'URL in percorso e prendendone la cartella: `dirname(fileURLToPath(import.meta.url))`, con `fileURLToPath` da `node:url` e `dirname` da `node:path`. È ancora molto diffuso e funziona ovunque; con Node 24 `import.meta.dirname` fa la stessa cosa in un colpo solo.

> [!info|label:Nel repo]
> `scripts/sync-setup.mjs` usa proprio l'idioma classico, risalendo poi di una cartella per arrivare alla radice del progetto: `const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');`. Così il file `sync.json` finisce nella radice anche se lo script viene lanciato da un'altra cartella.

## Far convivere i due mondi

ESM e CommonJS non vivono separati: un progetto moderno usa l'ESM ma dipende spesso da pacchetti CommonJS, e viceversa.

Da un ES module si può importare un modulo CommonJS: Node fornisce il suo `module.exports` come **export di default**, e quando riesce a ricavarli con un'analisi statica offre anche gli export con nome ([documentazione](https://nodejs.org/api/esm.html#commonjs-namespaces)). Il percorso inverso, cioè chiamare `require()` su un ES module, per anni ha dato errore; oggi [funziona senza opzioni da Node 22.12 e 20.19 ed è stabile da Node 24.15](https://nodejs.org/api/modules.html#loading-ecmascript-modules-using-require), con un limite preciso: il modulo richiesto non deve usare il top-level await, altrimenti `require()` fallisce con `ERR_REQUIRE_ASYNC_MODULE`. In quel caso, e in generale quando si vuole caricare un modulo solo al bisogno, c'è l'**import dinamico** `await import('./modulo.mjs')`, che funziona da entrambi i sistemi.

```js
// main.mjs (ESM) che usa un pacchetto CommonJS
import vecchio from './vecchio.cjs';      // vecchio === il module.exports di vecchio.cjs

// main.cjs (CommonJS) che usa un ES module senza top-level await
const { somma } = require('./somma.mjs'); // possibile da Node 22.12 / 20.19
```

## Dal modulo al pacchetto: `package.json`

Un **pacchetto** è una cartella con un file `package.json`. Molti dei suoi campi riguardano le dipendenze e gli script, raccontati nel <a href="../glossario/#/docs/anatomia-progetto" target="_blank" rel="noopener">glossario alla voce sull'anatomia di un progetto</a>; qui contano quelli che decidono **come il pacchetto si presenta ai moduli** che lo importano.

```json
{
  "name": "mia-libreria",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./utils": "./dist/utils.js"
  },
  "imports": {
    "#config": "./src/config.js"
  }
}
```

Il campo **`"type"`** è quello visto sopra. Il campo **`"exports"`** elenca i **punti d'ingresso pubblici**: chi installa il pacchetto può importare `mia-libreria` e `mia-libreria/utils`, e nient'altro. È un vero confine: [con `"exports"` definito](https://nodejs.org/api/packages.html#package-entry-points) qualunque altro percorso interno, come `mia-libreria/dist/interno.js`, viene rifiutato con l'errore `ERR_PACKAGE_PATH_NOT_EXPORTED`. Così l'autore può riorganizzare i file interni senza rompere il codice di chi lo usa. Le **condizioni** dentro un punto d'ingresso scelgono il file in base a come lo si carica: `"import"` per `import`, `"require"` per `require()`, e `"default"` come ripiego generico, da mettere sempre per ultimo.

Il campo **`"imports"`**, infine, crea alias **privati**, validi solo all'interno del pacchetto stesso: devono cominciare con `#`, e permettono di scrivere `import config from '#config'` invece di una lunga catena di `../../`.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 660 250" role="img" aria-label="Incapsulamento con exports: il pacchetto mia-libreria ha due porte pubbliche, il punto d'ingresso principale e ./utils, che portano a dist/index.js e dist/utils.js; i file interni come dist/interno.js restano dietro il confine e un import diretto viene rifiutato con ERR_PACKAGE_PATH_NOT_EXPORTED" style="width:100%;max-width:660px;height:auto;color:inherit"><defs><marker id="n02-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="100" y="24" font-size="11" text-anchor="middle" font-weight="700" opacity=".75">chi usa il pacchetto</text><rect x="20" y="40" width="160" height="36" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="100" y="63" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">'mia-libreria'</text><rect x="20" y="92" width="160" height="36" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="100" y="115" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">'mia-libreria/utils'</text><rect x="20" y="168" width="160" height="50" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 3"/><text x="100" y="188" font-size="10" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">'mia-libreria/</text><text x="100" y="204" font-size="10" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">dist/interno.js'</text><rect x="250" y="30" width="390" height="200" rx="12" fill="var(--link,#5fa04e)" fill-opacity=".08" stroke="currentColor" stroke-width="1.8"/><text x="445" y="52" font-size="12" text-anchor="middle" font-weight="700">mia-libreria</text><rect x="250" y="44" width="16" height="22" fill="var(--link,#5fa04e)" fill-opacity=".45" stroke="currentColor" stroke-width="1.2"/><rect x="250" y="98" width="16" height="22" fill="var(--link,#5fa04e)" fill-opacity=".45" stroke="currentColor" stroke-width="1.2"/><line x1="182" y1="58" x2="246" y2="56" stroke="currentColor" stroke-width="1.4" marker-end="url(#n02-b)"/><line x1="182" y1="110" x2="246" y2="109" stroke="currentColor" stroke-width="1.4" marker-end="url(#n02-b)"/><text x="296" y="60" font-size="10.5" font-family="ui-monospace,Menlo,monospace">"."</text><text x="296" y="113" font-size="10.5" font-family="ui-monospace,Menlo,monospace">"./utils"</text><line x1="330" y1="56" x2="452" y2="72" stroke="currentColor" stroke-width="1.3" marker-end="url(#n02-b)"/><line x1="370" y1="109" x2="452" y2="112" stroke="currentColor" stroke-width="1.3" marker-end="url(#n02-b)"/><rect x="456" y="62" width="160" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="536" y="81" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">dist/index.js</text><rect x="456" y="98" width="160" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="536" y="117" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">dist/utils.js</text><rect x="456" y="168" width="160" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3" opacity=".6"/><text x="536" y="187" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" opacity=".7">dist/interno.js</text><line x1="182" y1="193" x2="240" y2="193" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/><line x1="241" y1="183" x2="257" y2="203" stroke="currentColor" stroke-width="2.4"/><line x1="257" y1="183" x2="241" y2="203" stroke="currentColor" stroke-width="2.4"/><text x="352" y="218" font-size="10" text-anchor="middle" opacity=".8">ERR_PACKAGE_PATH_NOT_EXPORTED</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Il campo <code>"exports"</code> funziona come un muro con poche porte: si entra solo dai punti d'ingresso dichiarati (<code>"."</code> e <code>"./utils"</code>), e ogni altro percorso interno viene rifiutato. L'autore resta libero di spostare i file dietro il muro senza rompere nulla a chi usa il pacchetto.</figcaption>
</figure>

> [!info|label:Legacy]
> Prima di `"exports"` il punto d'ingresso unico era il campo **`"main"`** (per esempio `"main": "index.js"`), e tutti i file interni restavano raggiungibili con un percorso diretto. `"main"` si incontra ancora ovunque e viene letto quando `"exports"` manca; se ci sono entrambi, [prevale `"exports"`](https://nodejs.org/api/packages.html#main-entry-point-export).

> [!tip]
> Per il codice nuovo: ES modules con `"type": "module"` dichiarato, moduli integrati con il prefisso `node:`, percorsi costruiti da `import.meta.dirname` e, nei pacchetti, punti d'ingresso pubblici elencati in `"exports"`.

## Ripasso lampo

<details>
<summary>Come decide Node se un file <code>.js</code> è un ES module o CommonJS?</summary>

Guarda il campo `"type"` del `package.json` più vicino: `"module"` vuol dire ES module, `"commonjs"` (o, in linea di principio, l'assenza del campo) CommonJS. Senza `"type"`, da Node 22.7 e 20.19 c'è anche il rilevamento della sintassi: se il file contiene `import`/`export`, viene eseguito come ES module. Le estensioni `.mjs` e `.cjs` invece valgono sempre, indipendentemente da `"type"`.

</details>

<details>
<summary>Perché in uno script ES module non si può usare <code>__dirname</code>, e che cosa si usa al suo posto?</summary>

Perché `__dirname` e `__filename` sono variabili che Node fornisce solo ai moduli CommonJS. Negli ES modules si usa `import.meta`: `import.meta.dirname` (da Node 20.11 e 21.2, non più sperimentale da Node 24) oppure, nel codice meno recente, `dirname(fileURLToPath(import.meta.url))`.

</details>

<details>
<summary>Che cosa cambia scrivere <code>'node:fs'</code> invece di <code>'fs'</code>?</summary>

Entrambi caricano il modulo integrato, ma il prefisso `node:` è un indirizzo assoluto che non si può confondere con un pacchetto omonimo in `node_modules` e rende evidente l'origine. Alcuni moduli recenti, come `node:test`, esistono solo con il prefisso.

</details>

<details>
<summary>Perché <code>readFile('config.json')</code> può non trovare un file che sta accanto allo script?</summary>

Perché i percorsi relativi di `node:fs` si risolvono rispetto alla cartella di lavoro del processo (`process.cwd()`), cioè da dove si lancia il comando, non rispetto alla cartella dello script. Costruendo il percorso con `join(import.meta.dirname, 'config.json')` lo si trova sempre.

</details>

<details>
<summary>A che cosa serve il campo <code>"exports"</code> di un <code>package.json</code>?</summary>

Dichiara i punti d'ingresso pubblici del pacchetto, eventualmente con file diversi per `import` e `require()`, e incapsula tutto il resto: un import diretto di un file interno viene rifiutato con `ERR_PACKAGE_PATH_NOT_EXPORTED`. È il successore del campo `"main"`, che indicava un solo punto d'ingresso e lasciava raggiungibile ogni file.

</details>
