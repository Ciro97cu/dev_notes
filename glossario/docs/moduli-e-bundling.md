# Moduli e bundling

Come JavaScript organizza il codice in moduli e come i bundler ne sfruttano la struttura per ridurre e spezzare il codice spedito al browser.

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

È questa la radice di ciò che le voci [tree-shaking](docs/moduli-e-bundling.md?id=tree-shaking) e [lazy loading](docs/moduli-e-bundling.md?id=lazy-loading) davano per scontato: siccome il target di `require` e la forma di `module.exports` si conoscono **solo eseguendo il codice**, un bundler non può ricostruire il grafo dei moduli dal solo sorgente. Gli `import`/`export` dell'ESM sono invece **sintassi statica**, risolta prima di eseguire: il grafo è noto a build-time, e con esso diventano possibili tree-shaking e code-splitting.

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

Serve a dare a un modulo una **public API** pulita, nascondendone la struttura interna. Ha però un costo noto: se usato senza attenzione **ostacola il [tree-shaking](docs/moduli-e-bundling.md?id=tree-shaking) e il [lazy loading](docs/moduli-e-bundling.md?id=lazy-loading)**. Il motivo è che rende *un intero gruppo di moduli raggiungibile da un solo import*: chiedere un nome soltanto (`import { Button } from './feature'`) costringe il bundler a considerare tutto il grafo ri-esportato dal barrel, e a scartarne i pezzi inutilizzati **solo se riesce a dimostrarli privi di side-effect**. Quando non ci riesce (moduli con effetti collaterali, `"sideEffects"` non dichiarato, o ESM degradato a [CommonJS](docs/moduli-e-bundling.md?id=commonjs)), nel bundle o in un chunk lazy finisce molto più del necessario.

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

Nel bundle finale resta **solo `add`**: `sub` e `mul` sono rami morti e vengono tagliati. Con i [CommonJS](docs/moduli-e-bundling.md?id=commonjs) non sarebbe possibile, perché `require()` è una normale chiamata che può ricevere un percorso calcolato a runtime e `module.exports` un oggetto qualunque: il grafo non è analizzabile in anticipo e il bundler, per prudenza, tiene tutto.

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

`false` significa «nessuno: puoi scartare liberamente ciò che non uso», ed è ciò che abilita il tree-shaking pieno; in alternativa si elencano i file che invece li hanno, per esempio `"sideEffects": ["*.css", "./src/polyfills.js"]`. Due conseguenze pratiche: gli **export nominali** si scuotono bene, mentre importare un intero oggetto (`export default { add, sub, mul }`) porta con sé tutto, perché lo si usa per intero; e un [barrel](docs/moduli-e-bundling.md?id=barrel-barrel-file) di un pacchetto senza `"sideEffects"` dichiarato allarga il grafo raggiungibile e finisce spesso nel bundle molto più del dovuto.

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

Anche qui va tenuto d'occhio il [barrel](docs/moduli-e-bundling.md?id=barrel-barrel-file): se il modulo caricato in lazy importa *attraverso* un barrel che ri-esporta venti cose, quel singolo `import` può trascinare tutti e venti dentro il chunk lazy — o farli issare in un chunk condiviso caricato subito — gonfiando ciò che doveva restare leggero. Importare dal file specifico, non dal barrel, tiene netto il confine.

> [!tip]
> Riferimento: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import" target="_blank" rel="noopener">MDN · <code>import()</code></a>. In Angular il lazy loading delle route è il tema di <a href="../angular/#/capitoli/04-router-navigation-lazy-loading" target="_blank" rel="noopener">ch04 · Navigation &amp; Lazy Loading</a>, il code-splitting per rotta in <a href="../angular/#/cert/performance" target="_blank" rel="noopener">cert · Performance</a>.
