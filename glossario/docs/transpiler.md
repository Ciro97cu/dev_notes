# Transpiler

Strumenti che traducono JavaScript/TypeScript moderno in una forma più compatibile o più veloce da eseguire. Che cosa fanno dentro (togliere o riscrivere la sintassi, generare le source map) e come Node esegue da solo i file TypeScript è spiegato nel <a href="../node/#/docs/04-varianti-di-javascript?id=la-trasformazione-togliere-o-riscrivere" target="_blank" rel="noopener">vault Node, capitolo 04</a>.

## Babel

Babel è un **transpiler** JavaScript: converte codice scritto con la sintassi più recente in una forma equivalente che capiscono anche i browser meno aggiornati fra quelli scelti come **target**, di norma indicati con una query [browserslist](https://browsersl.ist/) come `defaults` (i browser più diffusi e ancora mantenuti). Permette quindi di usare le funzionalità recenti del linguaggio senza rinunciare alla compatibilità.

```js
// input: sintassi moderna (arrow function + const)
const somma = (a, b) => a + b;

// output Babel con un target che include browser molto datati (ES5): funzione classica + var, equivalente
var somma = function (a, b) { return a + b; };
```

Concetti chiave:
- **Transpilazione** — traduce da un linguaggio di alto livello a un altro (qui: da JS moderno a JS più vecchio ma equivalente). Diverso dalla **compilazione**, che traduce verso il linguaggio macchina.
- **Plugin e preset** — un *plugin* trasforma una singola funzionalità (es. le arrow function); un *preset* è un insieme di plugin (es. `preset-env` per lo standard più recente).
- **Configurabilità** — si sceglie con precisione cosa trasformare, ottimizzando l'output per il progetto.

> [!info|label:Legacy]
> Fino a Babel 7, in assenza di target espliciti, Babel trasformava tutto fino a ES5 (`targets: ">= 0%"`, cioè ogni browser esistente): da qui l'immagine classica di Babel come traduttore «da ES2015+ a ES5». Con **Babel 8**, stabile da giugno 2026, il default è diventato la query `defaults` di browserslist, così senza configurazione si compila per i browser moderni ([guida alla migrazione](https://babeljs.io/docs/v8-migration)). *(Aggiornato a ottobre 2026.)*

## SWC

SWC (*Speedy Web Compiler*) è un transpiler/compilatore per JavaScript e TypeScript, nato come alternativa **più veloce** a Babel. La differenza chiave: è scritto in **Rust** (non in JavaScript), il che gli permette di sfruttare più core della CPU ed essere molto più performante.

Funzioni: transpilazione verso versioni precedenti di JavaScript, rimozione dei tipi da TypeScript e minificazione. Offre anche un bundling, ma sperimentale e destinato a sparire nella [versione 2](https://swc.rs/docs/configuration/bundling) a favore dei bundler costruiti su SWC, come Rspack e Turbopack. Il suo parser TypeScript, compilato in WebAssembly, è inoltre quello che [Node usa](https://github.com/nodejs/amaro) per eseguire direttamente i file `.ts` (il *type stripping*, vedi <a href="../node/#/docs/04-varianti-di-javascript?id=typescript-in-node-il-type-stripping" target="_blank" rel="noopener">vault Node, capitolo 04</a>).

**SWC vs Babel:**
- **SWC** quando la priorità è la **velocità** di build (progetti grandi). Adottato come compilatore predefinito da Next.js, Parcel, Deno.
- **Babel** quando serve il suo **ecosistema** di plugin, più maturo e ampio, per trasformazioni molto specifiche o sperimentali.

## Oxc

[Oxc](https://oxc.rs/) (*JavaScript Oxidation Compiler*) è una raccolta di strumenti per JavaScript e TypeScript scritti in **Rust**: parser, trasformatore e minificatore, più un linter (Oxlint) e un formatter (Oxfmt). Come trasformatore fa lo stesso mestiere di Babel e SWC, cioè togliere i tipi di TypeScript, tradurre JSX e abbassare la sintassi, ed è quello che [Vite usa per TypeScript e JSX](https://vite.dev/guide/features#typescript) dalla versione 8, accanto a Rolldown per il bundling (vedi [Vite](docs/bundler.md?id=vite)). Di solito non lo si installa a mano: arriva dentro Vite.
