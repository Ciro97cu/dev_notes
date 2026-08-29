# Tooling (ecosistema JavaScript)

Strumenti da riga di comando e di build che accompagnano lo sviluppo in JavaScript/Node.js.

## Babel

Babel è un **transpiler** JavaScript: converte codice scritto con sintassi moderne (ES2015+) in una versione precedente (es. ES5) compatibile con i browser più datati. Permette quindi di usare le funzionalità recenti del linguaggio senza rinunciare alla compatibilità.

```js
// input: sintassi moderna (arrow function + const)
const somma = (a, b) => a + b;

// output Babel (ES5): funzione classica + var, equivalente
var somma = function (a, b) { return a + b; };
```

Concetti chiave:
- **Transpilazione** — traduce da un linguaggio di alto livello a un altro (qui: da JS moderno a JS più vecchio ma equivalente). Diverso dalla **compilazione**, che traduce verso il linguaggio macchina.
- **Plugin e preset** — un *plugin* trasforma una singola funzionalità (es. le arrow function); un *preset* è un insieme di plugin (es. `preset-env` per lo standard più recente).
- **Configurabilità** — si sceglie con precisione cosa trasformare, ottimizzando l'output per il progetto.

## SWC

SWC (*Speedy Web Compiler*) è un transpiler/compilatore per JavaScript e TypeScript, nato come alternativa **più veloce** a Babel. La differenza chiave: è scritto in **Rust** (non in JavaScript), il che gli permette di sfruttare più core della CPU ed essere molto più performante.

Funzioni: transpilazione da JS moderno a ES5, rimozione dei tipi da TypeScript, minificazione e bundling.

**SWC vs Babel:**
- **SWC** quando la priorità è la **velocità** di build (progetti grandi). Adottato come compilatore predefinito da Next.js, Parcel, Deno.
- **Babel** quando serve il suo **ecosistema** di plugin, più maturo e ampio, per trasformazioni molto specifiche o sperimentali.

## NPM

NPM (*Node Package Manager*) è lo strumento per gestire i **pacchetti** in Node.js. Installa pacchetti da un registro online (npm registry), li aggiunge come dipendenze del progetto e li mantiene aggiornati. Viene installato insieme a Node.js.

```bash
npm install lodash            # aggiunge lodash a "dependencies" e lo scarica in node_modules
npm install --save-dev vitest # dipendenza di solo sviluppo → "devDependencies"
npm run build                 # esegue lo script "build" dichiarato in package.json
```

Dipendenze e script vivono in `package.json`; le versioni **esatte** installate sono bloccate in `package-lock.json`, così ogni macchina ricostruisce lo stesso albero di dipendenze.

## NPX

NPX è uno strumento fornito con NPM (dalla versione 5.2.0) per **eseguire** pacchetti. La differenza rispetto a NPM: può eseguire un pacchetto **senza installarlo prima**, utile per strumenti usati una tantum.

```bash
npx create-react-app my-app   # scarica ed esegue create-react-app senza installarlo globalmente
```

Può anche eseguire binari di pacchetti locali del progetto (quelli in `node_modules/.bin`).

## Yarn

Yarn è un gestore di pacchetti JavaScript, alternativa a NPM, che consuma anch'esso il registro npm. Nato in Facebook (con Google, Exponent, Tilde) per risolvere problemi storici di NPM su velocità e determinismo:
- **Cache locale** dei pacchetti già scaricati, per installazioni più rapide.
- **Lockfile** (`yarn.lock`): tutti gli sviluppatori installano le **stesse** versioni.
- **Compatibilità** con il registro npm.

> [!note]
> Le versioni moderne di NPM hanno colmato gran parte del divario (cache, `package-lock.json`), quindi oggi la scelta è spesso questione di preferenza o di ecosistema del progetto.

## NVM

**nvm** (*Node Version Manager*) è uno strumento per installare e gestire **più versioni di Node.js** sulla stessa macchina, passando dall'una all'altra secondo il progetto. Il problema che risolve è concreto: Node evolve con major version che portano breaking change — Node 18, 20, 22 hanno API diverse — e un progetto avviato anni fa può essere incompatibile con le versioni più recenti, mentre i progetti nuovi vogliono le ultime funzionalità. Con nvm si installa ciascuna versione in modo isolato e si sceglie quale è attiva, senza che le versioni si calpestino tra loro.

A differenza di un programma normale, nvm **non è un eseguibile**: è una **funzione di shell** caricata nel profilo (`.zshrc` o `.bashrc`) che, quando invocata, modifica `$PATH` nella shell corrente per puntare alla cartella `~/.nvm/versions/node/<versione>/bin` della versione scelta. Questo ha una conseguenza pratica: `nvm use` vale **solo per la shell in cui lo si invoca**; aprire un nuovo terminale riporta alla versione di *default*. Inoltre, siccome Node è installato nella home dell'utente e non in una cartella di sistema, `npm install -g` funziona **senza `sudo`** — è una delle ragioni per cui nvm è raccomandato come setup di base.

| Comando | Cosa fa |
|---------|---------|
| `nvm install 22` | scarica e installa Node 22 |
| `nvm install --lts` | installa l'ultimo rilascio LTS disponibile |
| `nvm use 22` | attiva Node 22 nella shell corrente |
| `nvm alias default 22` | imposta Node 22 come versione di default per ogni nuova shell |
| `nvm ls` | elenca le versioni installate localmente |
| `nvm ls-remote` | elenca tutte le versioni scaricabili |
| `nvm current` | mostra la versione di Node attiva |

Per fissare la versione di Node di un singolo progetto si aggiunge un file **`.nvmrc`** alla radice del repo, contenente solo il numero di versione:

```
22
```

A quel punto `nvm use` senza argomenti, eseguito nella cartella del progetto, legge `.nvmrc` e attiva quella versione automaticamente. Aggiungendo al profilo di shell un hook apposito (documentato nel repo di nvm), l'attivazione avviene da sola ogni volta che si entra in una cartella che contiene un `.nvmrc` — senza doverlo invocare a mano.

> [!warning]
> I pacchetti installati globalmente con `npm install -g` sono **legati alla versione di Node attiva al momento dell'installazione**. Dopo un `nvm use 20`, il `$PATH` punta al `bin` di Node 20, dove quei pacchetti non sono stati installati: sembrano sparire. Non sono persi — vivono ancora sotto `~/.nvm/versions/node/<versione>/bin` — ma per usarli sulla nuova versione vanno reinstallati lì. Il motivo (PATH e npm prefix globale) è spiegato nel vault Terminale, [cap. 07 · Node, npm e il frontend](../terminale/#/docs/07-node-npm-frontend?id=le-versioni-di-node-nvm).

**Alternative:** **fnm** (*Fast Node Manager*, scritto in Rust) offre le stesse funzionalità di nvm con tempi di avvio sensibilmente più rapidi e supporto nativo a Windows, macOS e Linux. È considerato oggi una valida alternativa moderna; la scelta tra i due è spesso una questione di ecosistema e preferenza personale.

## Tarball (`.tgz`)

Un **tarball** è un file `.tar.gz` (spesso abbreviato **`.tgz`**): una **cartella impacchettata e compressa in un unico file**. Nasce da due strumenti della tradizione **Unix** (la famiglia di sistemi operativi da cui discendono Linux e macOS, dove nascono molti degli strumenti da riga di comando che si usano ancora oggi) messi in fila: **`tar`**, che unisce tanti file in un solo archivio (senza comprimere), e **`gzip`**, che poi lo comprime. È l'equivalente Unix di uno `.zip`, e si incontra ovunque, non solo con npm.

Nell'ecosistema JavaScript conta perché **un pacchetto npm *è* un tarball**: il registry non è che un magazzino di `.tgz`. Lo stesso file passa per tre verbi:

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 720 158" role="img" aria-label="Flusso di un pacchetto npm: i tuoi file con npm pack diventano un .tgz, che raggiunge node_modules o direttamente (install del file) o via registry (publish poi install per nome)" style="width:100%;max-width:700px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="18" y="96" width="104" height="48" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="70" y="124" font-size="11" text-anchor="middle">i tuoi file</text><rect x="176" y="96" width="92" height="48" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.7"/><text x="222" y="117" font-size="12.5" text-anchor="middle" font-weight="700">.tgz</text><text x="222" y="132" font-size="8.5" text-anchor="middle" opacity=".65">pacchetto</text><rect x="344" y="22" width="120" height="44" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 3"/><text x="404" y="49" font-size="11" text-anchor="middle">registry npm</text><rect x="566" y="96" width="134" height="48" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="633" y="124" font-size="11" text-anchor="middle">node_modules</text><path d="M122 120 L170 120" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M176 120 L168 115 L168 125 Z" fill="currentColor"/><text x="148" y="112" font-size="9.5" text-anchor="middle">npm pack</text><path d="M255 96 L352 68" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M358 66 L349 64 L352 73 Z" fill="currentColor"/><text x="292" y="76" font-size="9.5" text-anchor="middle">publish</text><path d="M462 68 L560 97" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M566 99 L557 98 L560 89 Z" fill="currentColor"/><text x="524" y="72" font-size="9.5" text-anchor="middle">install &lt;nome&gt;</text><path d="M268 126 L560 126" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M566 126 L558 121 L558 131 Z" fill="currentColor"/><text x="416" y="143" font-size="9.5" text-anchor="middle">install ./file.tgz  (a mano)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Lo stesso <code>.tgz</code> raggiunge <code>node_modules</code> in due modi: <strong>a mano</strong> (installando il file) o <strong>via registry</strong> (<code>publish</code> e poi <code>install &lt;nome&gt;</code>). Il registry è solo un magazzino di questi file.</figcaption>
</figure>

- **`npm pack`** crea il `.tgz` in locale (eseguendo prima l'eventuale build);
- **`npm publish`** carica quello stesso `.tgz` sul registry;
- **`npm install`** scarica un `.tgz`, dal registry (`install <nome>`) o da un file locale, e lo scompatta in `node_modules`.

Per questo, quando **non si può pubblicare sul registry** (libreria interna o ad-hoc, ambiente isolato), si distribuisce il pacchetto **a mano** come `.tgz` e lo si installa direttamente:

```bash
npm install ./util-auth-1.0.0.tgz
# oppure in package.json:  "util-auth": "file:./libs/util-auth-1.0.0.tgz"
```

> [!tip]
> Cosa c'è **dentro** (`tar -tzf file.tgz` per sbirciare senza estrarre): l'**output di build** (JavaScript già transpilato, spesso *bundlato*, con i tipi `.d.ts`), **non** il sorgente originale del developer. E di norma **non** è minificato: la minificazione è compito del bundler dell'*applicazione* finale (vedi [Minificazione e ottimizzazione](docs/react.md?id=minificazione-e-ottimizzazione)), non della libreria. A volte un pacchetto include anche i *source map* per risalire al sorgente, a volte no.

## CommonJS

**CommonJS** (CJS) è il sistema di moduli **storico di Node.js** (dal 2009, prima che JavaScript ne avesse uno nativo). Ogni file è un modulo con contenuto privato per default: per esporre qualcosa lo si assegna a **`module.exports`**, e per usarlo altrove lo si carica con **`require()`**, che restituisce proprio quell'oggetto.

```js
// myModule.js
function saluta(nome) { return `Ciao ${nome}`; }
module.exports = saluta;              // esporta: rimpiazza l'oggetto exports

// app.js
const saluta = require('./myModule'); // importa: riceve module.exports
saluta('Ada');
```

`exports` è solo una **scorciatoia** che punta allo stesso oggetto di `module.exports`: `exports.foo = …` aggiunge una proprietà, ma **riassegnare** `module.exports = …` (come sopra) spezza quel legame — un inciampo classico.

### Sincrono e dinamico: perché conta per i bundler

Due proprietà di `require()` lo separano nettamente dagli `import` ESM. È **sincrono**: blocca l'esecuzione finché il modulo non è caricato, eseguito e restituito (poi resta in cache, così gira una volta sola). Ed è **dinamico**: `require` è una normale *funzione*, quindi il suo argomento può essere calcolato a runtime e la chiamata può comparire ovunque, anche dentro un `if` o a metà funzione.

```js
// il percorso si decide mentre il programma gira
const plugin = require('./plugins/' + nomeScelto);

// e la chiamata può essere condizionale
if (serveI18n) { const t = require('./i18n'); /* … */ }
```

È questa la radice di ciò che le voci [tree-shaking](docs/tooling-javascript.md?id=tree-shaking) e [lazy loading](docs/tooling-javascript.md?id=lazy-loading) davano per scontato: siccome il target di `require` e la forma di `module.exports` si conoscono **solo eseguendo il codice**, un bundler non può ricostruire il grafo dei moduli dal solo sorgente. Gli `import`/`export` dell'ESM sono invece **sintassi statica**, risolta prima di eseguire: il grafo è noto a build-time, e con esso diventano possibili tree-shaking e code-splitting.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 560 250" role="img" aria-label="Statico (ESM) vs dinamico (CommonJS): con l'ESM il grafo dei moduli è noto a build-time, con CommonJS il target di require si conosce solo a runtime" style="width:100%;max-width:560px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="280" y="20" font-size="12.5" text-anchor="middle" font-weight="700">Quando si conosce il grafo dei moduli</text><path d="M280 40 L280 214" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 4" opacity=".4"/><text x="145" y="46" font-size="11" text-anchor="middle" font-weight="700">ESM · a build-time</text><rect x="112" y="62" width="66" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="145" y="81" font-size="11" text-anchor="middle" font-weight="700">app</text><rect x="40" y="128" width="64" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="72" y="147" font-size="11" text-anchor="middle">a.js</text><rect x="186" y="128" width="64" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="218" y="147" font-size="11" text-anchor="middle">b.js</text><path d="M131 92 L83 124" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M78 127 L87 126 L84 118 Z" fill="currentColor"/><path d="M159 92 L207 124" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M212 127 L206 118 L203 126 Z" fill="currentColor"/><text x="145" y="188" font-size="9.5" text-anchor="middle" opacity=".75">import/export: grafo noto senza eseguire</text><text x="415" y="46" font-size="11" text-anchor="middle" font-weight="700">CommonJS · a runtime</text><rect x="382" y="62" width="66" height="30" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="415" y="81" font-size="11" text-anchor="middle" font-weight="700">app</text><rect x="382" y="128" width="66" height="30" rx="6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 3"/><text x="415" y="150" font-size="16" text-anchor="middle" font-weight="700" opacity=".8">?</text><path d="M415 92 L415 122" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M415 128 L411 119 L419 119 Z" fill="currentColor"/><text x="462" y="112" font-size="9.5" text-anchor="start" font-weight="600">require(x)</text><text x="415" y="188" font-size="9.5" text-anchor="middle" opacity=".75">require(x): il target si sa solo eseguendo</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">A sinistra l'ESM: gli <code>import</code> sono statici, quindi il grafo dei moduli è noto già a build-time. A destra CommonJS: <code>require(x)</code> è una chiamata risolta a runtime, e il target (con quali export servono) si scopre solo eseguendo &mdash; ecco perché sui CommonJS il tree-shaking non è possibile.</figcaption>
</figure>

### CommonJS vs ES Modules

| | CommonJS | ES Modules |
|---|---|---|
| Sintassi | `require()` / `module.exports` | `import` / `export` |
| Risoluzione | **dinamica**, a runtime | **statica**, prima dell'esecuzione |
| Caricamento | **sincrono** | **asincrono** |
| Cosa ricevi | il valore al momento del `require` (no *live binding*) | **live binding**: riflette le riassegnazioni |
| Analisi statica | no: niente tree-shaking | sì: tree-shaking e code-splitting |

I due sistemi convivono e **interoperano**, con qualche attrito. Da un modulo ESM si può `import`are un CJS: Node ne espone il `module.exports` come **export di default**. Al contrario, un `require()` di un modulo ESM storicamente dava errore (`ERR_REQUIRE_ESM`) e imponeva l'`import()` dinamico; le versioni recenti di Node lo consentono per i moduli ESM **sincroni** (fallisce solo se c'è un *top-level await*). Quale sistema usa un file lo decide l'estensione (`.cjs` è CommonJS, `.mjs` è ESM), oppure, per i `.js`, il campo `"type"` del `package.json` più vicino (`"module"` per l'ESM).

> [!tip]
> La trattazione **storica** (dal *module pattern* con IIFE fino all'ESM) è nel vault JavaScript, in <a href="../javascript/#/docs/libro6/03-organizzazione" target="_blank" rel="noopener">Organizzazione del codice</a>. Dettagli su moduli e `require(esm)`: <a href="https://nodejs.org/api/modules.html" target="_blank" rel="noopener">Node.js · CommonJS modules</a>.

## Barrel (barrel file)

Un **barrel** è un file, tipicamente un `index.ts` (o `index.js`), che **ri-esporta** i [costrutti](docs/concetti-programmazione.md?id=costrutto) pubblici di una cartella da un unico punto d'ingresso, così chi lo usa importa da un solo percorso invece di raggiungere i singoli file:

```ts
// feature/index.ts  ← il barrel
export * from './button';
export { Card } from './card';

// altrove: un solo import invece di tre
import { Button, Card } from './feature';
```

Serve a dare a un modulo una **public API** pulita, nascondendone la struttura interna. Ha però un costo noto: se usato senza attenzione **ostacola il [tree-shaking](docs/tooling-javascript.md?id=tree-shaking) e il [lazy loading](docs/tooling-javascript.md?id=lazy-loading)**. Il motivo è che rende *un intero gruppo di moduli raggiungibile da un solo import*: chiedere un nome soltanto (`import { Button } from './feature'`) costringe il bundler a considerare tutto il grafo ri-esportato dal barrel, e a scartarne i pezzi inutilizzati **solo se riesce a dimostrarli privi di side-effect**. Quando non ci riesce (moduli con effetti collaterali, `"sideEffects"` non dichiarato, o ESM degradato a [CommonJS](docs/tooling-javascript.md?id=commonjs)), nel bundle o in un chunk lazy finisce molto più del necessario.

Il meccanismo di ri-esportazione è spiegato in <a href="../typescript/#/docs/31-moduli-namespaces?id=re-export" target="_blank" rel="noopener">TypeScript · Moduli (Re-export)</a>; i trade-off e l'alternativa *barrel-less* (convenzione `internal/` + Sheriff) sono approfonditi in <a href="../angular/#/capitoli/08-sustainable-architectures" target="_blank" rel="noopener">Angular · Sustainable architectures</a>.

## Tree-shaking

Il **tree-shaking** è l'eliminazione automatica, in fase di *build*, del codice che nessuno usa: il bundler parte dai punti d'ingresso dell'applicazione, segue gli `import` per costruire il grafo dei moduli e **tiene fuori dal bundle finale tutto ciò che non è agganciato** — l'immagine è quella di scuotere l'albero e far cadere ciò che non è appeso a un ramo. È nato con Rollup ed è oggi in ogni bundler (webpack, esbuild, Vite).

### Come funziona, passo per passo

Il tree-shaking è possibile **grazie alla struttura statica degli ES Module**: `import` ed `export` si risolvono a *compile-time* — i nomi importati sono noti prima ancora di eseguire il codice — quindi il bundler può dire con certezza quali export sono raggiungibili e quali no.

```js
// math.js — tre export nominali
export const add = (a, b) => a + b;
export const sub = (a, b) => a - b;
export const mul = (a, b) => a * b;   // ← nessuno lo importa

// app.js — se ne usa uno solo
import { add } from './math.js';
console.log(add(2, 3));
```

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 560 250" role="img" aria-label="Tree-shaking" style="width:100%;max-width:560px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="280" y="20" font-size="12.5" text-anchor="middle" font-weight="700">Tree-shaking: nel bundle entra solo ciò che è importato</text><rect x="40" y="42" width="152" height="150" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="116" y="60" font-size="11" text-anchor="middle" font-weight="700">math.js</text><rect x="58" y="72" width="116" height="26" rx="6" fill="var(--link,#78716c)" fill-opacity=".16" stroke="currentColor" stroke-width="1.5"/><text x="116" y="89" font-size="11.5" text-anchor="middle" font-weight="700">add</text><rect x="58" y="106" width="116" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3"/><text x="116" y="123" font-size="11.5" text-anchor="middle" opacity=".7">sub</text><rect x="58" y="140" width="116" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3"/><text x="116" y="157" font-size="11.5" text-anchor="middle" opacity=".7">mul</text><path d="M192 85 L360 110" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M366 111 L357 108 L359 117 Z" fill="currentColor"/><text x="272" y="82" font-size="9.5" text-anchor="middle" font-weight="600">import { add }</text><rect x="366" y="96" width="152" height="64" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="442" y="114" font-size="11" text-anchor="middle" font-weight="700">bundle.js</text><rect x="384" y="122" width="116" height="26" rx="6" fill="var(--link,#78716c)" fill-opacity=".16" stroke="currentColor" stroke-width="1.5"/><text x="442" y="139" font-size="11.5" text-anchor="middle" font-weight="700">add</text><path d="M116 166 L116 208" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3" opacity=".55"/><path d="M116 214 L112 205 L120 205 Z" fill="currentColor" opacity=".55"/><text x="116" y="234" font-size="9.5" text-anchor="middle" opacity=".7">sub, mul: rami morti, scartati</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Importando il solo <code>add</code>, nel <code>bundle.js</code> entra quell'unico export; <code>sub</code> e <code>mul</code>, mai raggiunti, restano fuori — a patto che siano privi di side-effect.</figcaption>
</figure>

Nel bundle finale resta **solo `add`**: `sub` e `mul` sono rami morti e vengono tagliati. Con i [CommonJS](docs/tooling-javascript.md?id=commonjs) non sarebbe possibile, perché `require()` è una normale chiamata che può ricevere un percorso calcolato a runtime e `module.exports` un oggetto qualunque: il grafo non è analizzabile in anticipo e il bundler, per prudenza, tiene tutto.

C'è però una condizione: un export inutilizzato si può togliere **solo se non ha side-effect**, cioè non fa nulla di osservabile al momento dell'import (scrivere su `window`, registrare un listener, importare un CSS…).

```js
// analytics.js — ha un side-effect: gira già all'import
window.__initAnalytics();                  // ← effetto osservabile: sempre tenuto
export const track  = () => { /* … */ };   // se importato e usato → tenuto
export const format = (n) => n.toFixed(2); // puro e mai importato → scartato
```

Qui il bundler **non può** scartare `analytics.js` neppure se nessuno dei suoi export viene usato: toglierlo salterebbe quella riga e cambierebbe il comportamento del programma. L'effetto però **non contagia gli altri export**: `format`, puro e mai importato, viene comunque scartato — il tree-shaking lavora *export per export*. Ciò che il side-effect impedisce non è tenere i singoli export puri, ma **saltare del tutto il modulo** (*module elision*) quando viene raggiunto, ed è proprio questo che `"sideEffects": false` riabilita.

Per distinguere i casi, un pacchetto dichiara nel proprio `package.json` se i suoi file hanno effetti collaterali:

```json
{ "sideEffects": false }
```

`false` significa «nessuno: puoi scartare liberamente ciò che non uso», ed è ciò che abilita il tree-shaking pieno; in alternativa si elencano i file che invece li hanno, per esempio `"sideEffects": ["*.css", "./src/polyfills.js"]`. Due conseguenze pratiche: gli **export nominali** si scuotono bene, mentre importare un intero oggetto (`export default { add, sub, mul }`) porta con sé tutto, perché lo si usa per intero; e un [barrel](docs/tooling-javascript.md?id=barrel-barrel-file) di un pacchetto senza `"sideEffects"` dichiarato allarga il grafo raggiungibile e finisce spesso nel bundle molto più del dovuto.

> [!tip]
> Riferimento: <a href="https://webpack.js.org/guides/tree-shaking/" target="_blank" rel="noopener">webpack · Tree Shaking</a>. In Angular il tema torna nei **provider tree-shakable** e nei barrel, in <a href="../angular/#/capitoli/08-sustainable-architectures" target="_blank" rel="noopener">ch08 · Sustainable architectures</a>.

## Lazy loading

Il **lazy loading** («caricamento pigro») è la strategia di **caricare una risorsa solo quando serve davvero**, invece che tutta all'avvio, per alleggerire il primo caricamento. Nel frontend ha due facce. La più semplice riguarda **le risorse statiche** (immagini, <a href="../html/#/docs/06-media-embedded" target="_blank" rel="noopener"><code>iframe</code></a>), rimandate con un attributo nativo dell'HTML, senza JavaScript: il browser scarica l'immagine solo quando sta per entrare nello schermo.

```html
<img src="foto.jpg" loading="lazy" alt="…">
```

### Come funziona il code-splitting

La seconda faccia riguarda **il codice**, e si ottiene spezzando il bundle in più pezzi (*code-splitting*). Il meccanismo è l'`import()` **dinamico**: a differenza dell'`import` statico in cima al file — che lega il modulo allo stesso bundle, caricato subito — `import()` è una *funzione* che restituisce una `Promise` e segnala al bundler «qui c'è un confine». Il modulo richiesto, con le sue dipendenze, finisce in un **chunk separato**, scaricato via rete solo quando quella riga viene eseguita.

```js
// statico: Chart entra nel bundle iniziale, caricato all'avvio
import { Chart } from './chart.js';

// dinamico: './chart.js' diventa un chunk a parte,
// scaricato solo al primo click sul pulsante
button.addEventListener('click', async () => {
  const { Chart } = await import('./chart.js'); // ← confine di split
  new Chart(canvas).render();
});
```

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 580 236" role="img" aria-label="Code-splitting" style="width:100%;max-width:560px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="290" y="20" font-size="12.5" text-anchor="middle" font-weight="700">Code-splitting: import() dinamico = chunk a parte</text><rect x="34" y="90" width="112" height="54" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="90" y="122" font-size="12" text-anchor="middle" font-weight="700">app.js</text><path d="M146 106 L352 82" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M358 81 L349 79 L351 88 Z" fill="currentColor"/><text x="252" y="64" font-size="9.5" text-anchor="middle" font-weight="600">import statico</text><rect x="358" y="56" width="196" height="52" rx="8" fill="var(--link,#78716c)" fill-opacity=".16" stroke="currentColor" stroke-width="1.6"/><text x="456" y="78" font-size="12" text-anchor="middle" font-weight="700">main.js</text><text x="456" y="95" font-size="9.5" text-anchor="middle" opacity=".7">caricato all&apos;avvio</text><text x="258" y="120" font-size="9.5" text-anchor="middle" font-weight="600">import('./chart')</text><text x="258" y="132" font-size="8.5" text-anchor="middle" opacity=".65">confine di split</text><path d="M146 130 L352 174" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 3"/><path d="M358 175 L349 172 L350 181 Z" fill="currentColor"/><rect x="358" y="150" width="196" height="52" rx="8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 3"/><text x="456" y="172" font-size="11.5" text-anchor="middle" font-weight="700">chart-a1b2c3.js</text><text x="456" y="189" font-size="9.5" text-anchor="middle" opacity=".7">caricato al bisogno (click)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">L'<code>import</code> statico mette <code>Chart</code> nel bundle iniziale (<code>main.js</code>); l'<code>import()</code> dinamico fa di <code>./chart</code> un chunk separato, scaricato solo quando quella riga viene eseguita.</figcaption>
</figure>

Visto l'`import()`, il bundler produce accanto al file principale (`main.js`) un chunk tipo `chart-a1b2c3.js`; a runtime una richiesta lo scarica al momento del bisogno, e tutto ciò che serve solo lì viaggia in quel chunk invece che nel caricamento iniziale. I framework impacchettano questo stesso meccanismo: in Angular una route si carica in lazy con `loadComponent: () => import('./report').then(m => m.Report)`, in React con `lazy(() => import('./Report'))` dentro `<Suspense>` — sotto è sempre lo stesso `import()` dinamico.

Anche qui va tenuto d'occhio il [barrel](docs/tooling-javascript.md?id=barrel-barrel-file): se il modulo caricato in lazy importa *attraverso* un barrel che ri-esporta venti cose, quel singolo `import` può trascinare tutti e venti dentro il chunk lazy — o farli issare in un chunk condiviso caricato subito — gonfiando ciò che doveva restare leggero. Importare dal file specifico, non dal barrel, tiene netto il confine.

> [!tip]
> Riferimento: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import" target="_blank" rel="noopener">MDN · <code>import()</code></a>. In Angular il lazy loading delle route è il tema di <a href="../angular/#/capitoli/04-router-navigation-lazy-loading" target="_blank" rel="noopener">ch04 · Navigation &amp; Lazy Loading</a>, il code-splitting per rotta in <a href="../angular/#/cert/performance" target="_blank" rel="noopener">cert · Performance</a>.
