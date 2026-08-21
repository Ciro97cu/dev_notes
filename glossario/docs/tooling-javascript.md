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

NVM (*Node Version Manager*) permette di installare e gestire **più versioni di Node.js** sulla stessa macchina, passando dall'una all'altra secondo il progetto. Comodo quando progetti diversi richiedono versioni diverse del runtime.

```bash
nvm install 20    # installa Node 20
nvm use 20        # attiva Node 20 nella shell corrente
```

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

## module.exports

`module.exports` è la proprietà con cui un modulo **CommonJS** (il sistema di moduli storico di Node.js) espone funzioni, oggetti o valori verso l'esterno. In Node ogni file è un modulo e il suo contenuto è privato per default: per condividerlo va assegnato a `module.exports` e importato altrove con `require()`.

```js
// myModule.js
function saluta(nome) { return `Ciao ${nome}`; }
module.exports = saluta;

// app.js
const saluta = require('./myModule');
```

> [!tip]
> È la controparte CommonJS di `export` / `import` degli **ES Modules** (lo standard moderno). Vedi <a href="../javascript/#/docs/libro6/03-organizzazione" target="_blank" rel="noopener">ES6 Modules</a> nel vault JavaScript.

## Barrel (barrel file)

Un **barrel** è un file, tipicamente un `index.ts` (o `index.js`), che **ri-esporta** i [costrutti](docs/concetti-programmazione.md?id=costrutto) pubblici di una cartella da un unico punto d'ingresso, così chi lo usa importa da un solo percorso invece di raggiungere i singoli file:

```ts
// feature/index.ts  ← il barrel
export * from './button';
export { Card } from './card';

// altrove: un solo import invece di tre
import { Button, Card } from './feature';
```

Serve a dare a un modulo una **public API** pulita, nascondendone la struttura interna. Ha però un costo noto: se usato senza attenzione **ostacola il [tree-shaking](docs/tooling-javascript.md?id=tree-shaking) e il [lazy loading](docs/tooling-javascript.md?id=lazy-loading)**. Il motivo è che rende *un intero gruppo di moduli raggiungibile da un solo import*: chiedere un nome soltanto (`import { Button } from './feature'`) costringe il bundler a considerare tutto il grafo ri-esportato dal barrel, e a scartarne i pezzi inutilizzati **solo se riesce a dimostrarli privi di side-effect**. Quando non ci riesce — moduli con effetti collaterali, `"sideEffects"` non dichiarato, o ESM degradato a CommonJS — nel bundle (o in un chunk caricato in lazy) finisce molto più del necessario.

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

Nel bundle finale resta **solo `add`**: `sub` e `mul` sono rami morti e vengono tagliati. Con i CommonJS non sarebbe possibile, perché `require()` è una normale chiamata che può ricevere un percorso calcolato a runtime e `module.exports` un oggetto qualunque: il grafo non è analizzabile in anticipo e il bundler, per prudenza, tiene tutto.

C'è però una condizione: un export inutilizzato si può togliere **solo se non ha side-effect**, cioè non fa nulla di osservabile al momento dell'import (scrivere su `window`, registrare un listener, importare un CSS…).

```js
// analytics.js — ha un side-effect: gira già all'import
window.__initAnalytics();          // ← effetto osservabile
export const track = () => { /* … */ };
```

Qui il bundler **non può** scartare `analytics.js` neppure se `track` non viene usato: toglierlo salterebbe quella riga e cambierebbe il comportamento del programma. Per distinguere i casi, un pacchetto dichiara nel proprio `package.json` se i suoi file hanno effetti collaterali:

```json
{ "sideEffects": false }
```

`false` significa «nessuno: puoi scartare liberamente ciò che non uso», ed è ciò che abilita il tree-shaking pieno; in alternativa si elencano i file che invece li hanno, per esempio `"sideEffects": ["*.css", "./src/polyfills.js"]`. Due conseguenze pratiche: gli **export nominali** si scuotono bene, mentre importare un intero oggetto (`export default { add, sub, mul }`) porta con sé tutto, perché lo si usa per intero; e un [barrel](docs/tooling-javascript.md?id=barrel-barrel-file) di un pacchetto senza `"sideEffects"` dichiarato allarga il grafo raggiungibile e finisce spesso nel bundle molto più del dovuto.

> [!tip]
> Riferimento: <a href="https://webpack.js.org/guides/tree-shaking/" target="_blank" rel="noopener">webpack · Tree Shaking</a>. In Angular il tema torna nei **provider tree-shakable** e nei barrel, in <a href="../angular/#/capitoli/08-sustainable-architectures" target="_blank" rel="noopener">ch08 · Sustainable architectures</a>.

## Lazy loading

Il **lazy loading** («caricamento pigro») è la strategia di **caricare una risorsa solo quando serve davvero**, invece che tutta all'avvio, per alleggerire il primo caricamento. Nel frontend ha due facce. La più semplice riguarda **le risorse statiche** (immagini, `iframe`), rimandate con un attributo nativo dell'HTML, senza JavaScript: il browser scarica l'immagine solo quando sta per entrare nello schermo.

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

Visto l'`import()`, il bundler produce accanto al file principale (`main.js`) un chunk tipo `chart-a1b2c3.js`; a runtime una richiesta lo scarica al momento del bisogno, e tutto ciò che serve solo lì viaggia in quel chunk invece che nel caricamento iniziale. I framework impacchettano questo stesso meccanismo: in Angular una route si carica in lazy con `loadComponent: () => import('./report').then(m => m.Report)`, in React con `lazy(() => import('./Report'))` dentro `<Suspense>` — sotto è sempre lo stesso `import()` dinamico.

Anche qui va tenuto d'occhio il [barrel](docs/tooling-javascript.md?id=barrel-barrel-file): se il modulo caricato in lazy importa *attraverso* un barrel che ri-esporta venti cose, quel singolo `import` può trascinare tutti e venti dentro il chunk lazy — o farli issare in un chunk condiviso caricato subito — gonfiando ciò che doveva restare leggero. Importare dal file specifico, non dal barrel, tiene netto il confine.

> [!tip]
> Riferimento: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import" target="_blank" rel="noopener">MDN · <code>import()</code></a>. In Angular il lazy loading delle route è il tema di <a href="../angular/#/capitoli/04-router-navigation-lazy-loading" target="_blank" rel="noopener">ch04 · Navigation &amp; Lazy Loading</a>, il code-splitting per rotta in <a href="../angular/#/cert/performance" target="_blank" rel="noopener">cert · Performance</a>.
