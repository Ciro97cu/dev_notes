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

Un **barrel** è un file — tipicamente un `index.ts` (o `index.js`) — che **ri-esporta** i costrutti pubblici di una cartella da un unico punto d'ingresso, così chi lo usa importa da un solo percorso invece di raggiungere i singoli file:

```ts
// feature/index.ts  ← il barrel
export * from './button';
export { Card } from './card';

// altrove: un solo import invece di tre
import { Button, Card } from './feature';
```

Serve a dare a un modulo una **public API** pulita, nascondendone la struttura interna. Ha però un costo noto: se usato senza attenzione **ostacola il tree-shaking** e il lazy-loading, perché importare un solo nome può trascinare nel bundle tutto ciò che il barrel ri-esporta.

Il meccanismo di ri-esportazione è spiegato in <a href="../typescript/#/docs/31-moduli-namespaces?id=re-export" target="_blank" rel="noopener">TypeScript · Moduli (Re-export)</a>; i trade-off e l'alternativa *barrel-less* (convenzione `internal/` + Sheriff) sono approfonditi in <a href="../angular/#/capitoli/08-sustainable-architectures" target="_blank" rel="noopener">Angular · Sustainable architectures</a>.
