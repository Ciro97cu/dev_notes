# Transpiler

Strumenti che traducono JavaScript/TypeScript moderno in una forma più compatibile o più veloce da eseguire.

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

