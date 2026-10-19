# 04 · Le varianti di JavaScript

Una **variante** di JavaScript (in inglese *flavor*) è un linguaggio o un'estensione che somiglia a JavaScript, e spesso lo contiene per intero, ma che il motore non sa eseguire così com'è: TypeScript con le sue annotazioni di tipo, JSX con i tag simili all'HTML scritti dentro il codice, le proposte di sintassi non ancora entrate nello standard. Per chi fa frontend sono la norma: un componente Angular è scritto in TypeScript, uno React in JSX o TSX, e nessuno dei due arriva al browser nella forma in cui lo si scrive. In mezzo c'è sempre uno strumento che **trasforma** il sorgente in JavaScript puro, e quello strumento gira su Node. Questo capitolo spiega in che cosa consiste la trasformazione, come le source map collegano il codice prodotto a quello scritto e come Node, dalle versioni 22.18 e 23.6, esegua da solo i file TypeScript con il **type stripping**; si chiude con un confronto fra le strade per far girare TypeScript in un progetto.

## Che cosa capisce il motore, e che cosa no

V8, il motore JavaScript di Node e di Chrome descritto nel [[01-dentro-node|capitolo 01]], esegue **ECMAScript**, cioè il JavaScript definito dallo standard, nella misura in cui la sua versione lo implementa. Tutto il resto è, per il motore, un errore di sintassi (*SyntaxError*): legge il file, incontra un simbolo che la grammatica di JavaScript non prevede e si ferma prima di eseguire una sola riga. Le varianti che si incontrano in un progetto frontend appartengono a tre famiglie.

| Famiglia | Esempio | Che cosa trova il motore |
|---|---|---|
| tipi statici | TypeScript: `function saluta(u: Utente): string` | annotazioni `: Utente` che la grammatica non prevede |
| markup nel codice | JSX: `return <h1>Ciao</h1>;` | un `<` dove si aspetta un'espressione |
| sintassi futura | decoratori: `@Component({ … })` | una `@` che lo standard non definisce ancora |

TypeScript è un *superset* di JavaScript, cioè lo estende senza toglierne nulla, come spiega il <a href="../typescript/#/docs/01-introduzione?id=superset-di-javascript" target="_blank" rel="noopener">vault TypeScript</a>: qualunque file JavaScript è già TypeScript valido, mentre il contrario non vale. JSX è un'[estensione di sintassi](https://react.dev/learn/writing-markup-with-jsx) per scrivere markup simile all'HTML dentro un file JavaScript, ed è trattato più avanti in questo capitolo. I **decoratori**, infine, sono una proposta di TC39, il comitato che fa evolvere lo standard: TypeScript li implementa da anni (ne tratta il <a href="../typescript/#/docs/29-decorators" target="_blank" rel="noopener">capitolo sui decorators</a>) e Angular li usa su ogni componente, ma la proposta non è ancora nello standard, e l'[elenco ufficiale di TC39](https://github.com/tc39/proposals) oggi la colloca allo Stage 2.7, mentre l'ingresso nello standard avviene solo allo [Stage 4](https://tc39.es/process-document/).

Il comportamento di Node con queste varianti è facile da verificare. Un file con JSX viene rifiutato subito:

```js
// app.js
const titolo = <h1>Ciao</h1>;

// $ node app.js
// SyntaxError: Unexpected token '<'
```

C'è poi un quarto uso degli stessi strumenti, che non riguarda una variante: tradurre JavaScript **moderno** in JavaScript più vecchio, per i browser che non conoscono ancora la sintassi recente. È il compito per cui è nato Babel, descritto nel <a href="../glossario/#/docs/transpiler?id=babel" target="_blank" rel="noopener">glossario alla voce Babel</a>.

> [!info|label:Legacy]
> **Flow**, il type checker presentato da Facebook (oggi Meta) [nel 2014](https://engineering.fb.com/2014/11/18/web/flow-a-new-static-type-checker-for-javascript/), è stato per anni l'alternativa principale a TypeScript: anche lì annotazioni di tipo dentro il codice, da togliere prima dell'esecuzione con un plugin di Babel o con il piccolo strumento `flow-remove-types`, come spiega la [guida ufficiale](https://flow.org/en/docs/getting-started/). Meta continua a rilasciarlo, ma nel resto dell'ecosistema la scelta è caduta su TypeScript: è TypeScript, e non Flow, che Node esegue in modo nativo e che dev server come Vite trasformano senza configurazione. Flow si incontra ancora in codice meno recente; per un progetto nuovo non è più una strada da considerare.

## La trasformazione: togliere o riscrivere

Qualunque sia la variante, il lavoro dello strumento ha la stessa forma. Legge il sorgente e lo scompone in un **AST** (*abstract syntax tree*, albero sintattico astratto), una rappresentazione ad albero in cui ogni nodo è un pezzo del programma: una dichiarazione, una chiamata di funzione, un'annotazione di tipo. Poi interviene sui nodi che il motore non capirebbe e infine ristampa l'albero come testo JavaScript. Il nome generico del processo è **transpilazione**, una traduzione da sorgente a sorgente; la differenza con la compilazione in senso stretto è spiegata nel <a href="../glossario/#/docs/transpiler?id=babel" target="_blank" rel="noopener">glossario</a>.

Gli interventi possibili sono di due gradi. Il più leggero è **togliere** (*strip*): se la sintassi estranea non ha alcun effetto sull'esecuzione, come un'annotazione `: string`, basta cancellarla e il programma resta identico. Il più pesante è **riscrivere** (*transform*): alcuni costrutti producono codice quando vengono eseguiti, e vanno sostituiti con il JavaScript equivalente. Un `enum` di TypeScript diventa un oggetto, un tag JSX diventa una chiamata di funzione. A questi due si aggiunge, quando serve, l'**abbassamento di versione** (*downleveling*): riscrivere la sintassi moderna in una forma più vecchia per i motori datati.

C'è invece un lavoro che il trasformatore **non** fa: controllare i tipi. Gli strumenti veloci lavorano su **un file alla volta**, senza guardare il resto del progetto (è la *transpilazione file per file* a cui si riferisce l'opzione [`isolatedModules`](https://www.typescriptlang.org/tsconfig/#isolatedModules) di TypeScript), e quindi non possono sapere se `saluta(42)` passa un numero a una funzione che si aspetta una stringa. La documentazione di Vite lo dice in modo esplicito: Vite [traduce i file `.ts` ma non ne controlla i tipi](https://vite.dev/guide/features#transpile-only). Il **type checking** è un secondo lavoro, separato, che richiede di analizzare l'intero programma, ed è il compito del compilatore `tsc` descritto nel <a href="../typescript/#/docs/02-compilatore" target="_blank" rel="noopener">vault TypeScript</a>.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 680 268" role="img" aria-label="Due lavori distinti a partire dallo stesso sorgente .ts, .tsx o .jsx: in alto il trasformatore toglie o riscrive la sintassi e produce il JavaScript da eseguire più, facoltativa, la source map che lo collega al sorgente; in basso il type checker, cioè tsc con --noEmit, legge lo stesso sorgente e produce soltanto un elenco di errori di tipo, nessun file" style="width:100%;max-width:680px;height:auto;color:inherit"><defs><marker id="n04-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="24" y="96" width="150" height="76" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><text x="99" y="126" font-size="13" text-anchor="middle" font-weight="700">sorgente</text><text x="99" y="148" font-size="11" text-anchor="middle" font-family="ui-monospace,Menlo,Consolas,monospace" opacity=".8">.ts · .tsx · .jsx</text><rect x="256" y="28" width="176" height="68" rx="10" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8"/><text x="344" y="56" font-size="13" text-anchor="middle" font-weight="700">trasformatore</text><text x="344" y="76" font-size="10.5" text-anchor="middle" opacity=".8">toglie o riscrive la sintassi</text><rect x="256" y="172" width="176" height="68" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.8"/><text x="344" y="200" font-size="13" text-anchor="middle" font-weight="700">type checker</text><text x="344" y="220" font-size="11" text-anchor="middle" font-family="ui-monospace,Menlo,Consolas,monospace" opacity=".8">tsc --noEmit</text><rect x="510" y="18" width="150" height="44" rx="8" fill="var(--link,#5fa04e)" fill-opacity=".1" stroke="currentColor" stroke-width="1.6"/><text x="585" y="37" font-size="12" text-anchor="middle" font-weight="700">JavaScript</text><text x="585" y="53" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,Consolas,monospace" opacity=".8">main.js</text><rect x="510" y="74" width="150" height="44" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 3"/><text x="585" y="93" font-size="12" text-anchor="middle" font-weight="700">source map</text><text x="585" y="109" font-size="10.5" text-anchor="middle" font-family="ui-monospace,Menlo,Consolas,monospace" opacity=".8">main.js.map</text><rect x="510" y="184" width="150" height="44" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 3"/><text x="585" y="203" font-size="12" text-anchor="middle" font-weight="700">errori di tipo</text><text x="585" y="219" font-size="10.5" text-anchor="middle" opacity=".75">nessun file prodotto</text><path d="M176 118 C 210 104, 226 80, 252 66" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#n04-a)"/><path d="M176 150 C 210 164, 226 188, 252 202" fill="none" stroke="currentColor" stroke-width="1.5" marker-end="url(#n04-a)"/><line x1="434" y1="54" x2="506" y2="42" stroke="currentColor" stroke-width="1.5" marker-end="url(#n04-a)"/><line x1="434" y1="72" x2="506" y2="92" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3" marker-end="url(#n04-a)"/><line x1="434" y1="206" x2="506" y2="206" stroke="currentColor" stroke-width="1.5" marker-end="url(#n04-a)"/><text x="214" y="136" font-size="10.5" text-anchor="middle" opacity=".7">due lavori</text><text x="214" y="150" font-size="10.5" text-anchor="middle" opacity=".7">separati</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Dallo stesso sorgente partono due lavori indipendenti. Il <strong>trasformatore</strong> toglie o riscrive la sintassi e produce il JavaScript da eseguire, più, se richiesta, la <strong>source map</strong> che lo collega al sorgente; il <strong>type checker</strong> legge gli stessi file e produce soltanto un elenco di errori. Il primo può lavorare file per file, il secondo deve vedere tutto il progetto.</figcaption>
</figure>

Gli strumenti che fanno la trasformazione sono parecchi e seguono tutti la stessa idea; a distinguerli sono soprattutto il linguaggio in cui sono scritti e la velocità. **Babel**, scritto in JavaScript, è il più vecchio dei quattro e ha l'ecosistema di plugin più ampio; **SWC**, scritto in Rust, è nato come alternativa più rapida (entrambi sono descritti nel <a href="../glossario/#/docs/transpiler" target="_blank" rel="noopener">glossario alla voce Transpiler</a>), e il suo parser TypeScript, compilato in WebAssembly, è lo stesso che Node usa per il type stripping. **esbuild**, scritto in Go, unisce trasformazione e bundling (lo descrive il <a href="../glossario/#/docs/bundler?id=esbuild" target="_blank" rel="noopener">glossario</a>) ed è il motore di tsx e della CLI di Angular; [**Oxc**](https://oxc.rs/), anch'esso in Rust, è il trasformatore che Vite usa per [TypeScript](https://vite.dev/guide/features#typescript) e [JSX](https://vite.dev/guide/features#jsx). Il loro ruolo dentro i bundler è il tema del [[06-bundler|capitolo 06]].

## Le source map

Quando il trasformatore riscrive il codice, righe e colonne del JavaScript prodotto non corrispondono più a quelle del sorgente: un errore segnalato alla riga 3 del file `.js` può nascere alla riga 4 del `.ts`. Una **source map** è un file JSON che registra la corrispondenza fra le posizioni del codice generato e quelle del sorgente originale, così gli strumenti di debug possono mostrare il codice scritto invece di quello eseguito ([MDN](https://developer.mozilla.org/en-US/docs/Glossary/Source_map)). Il formato è uno standard Ecma, [ECMA-426](https://tc39.es/ecma426/), la cui prima edizione risale al dicembre 2024.

Compilando con `tsc` e l'opzione `sourceMap` attiva (descritta nel <a href="../typescript/#/docs/03-tsconfig?id=sourcemap" target="_blank" rel="noopener">vault TypeScript</a>), accanto a ogni file `.js` compare il suo `.js.map`. Dato questo sorgente:

```ts
// src/main.ts
import { saluta, type Utente } from './tipi.ts';

const ada: Utente = { nome: 'Ada', eta: 36 };
console.log(saluta(ada));
```

il compilatore produce il JavaScript e la sua mappa:

```js
// dist/main.js
import { saluta } from './tipi.js';
const ada = { nome: 'Ada', eta: 36 };
console.log(saluta(ada));
//# sourceMappingURL=main.js.map
```

```json
{
  "version": 3,
  "file": "main.js",
  "sourceRoot": "",
  "sources": ["../src/main.ts"],
  "names": [],
  "mappings": "AAAA,OAAO,EAAE,MAAM,EAAe,MAAM,WAAW,CAAC;AAEhD,MAAM,GAAG,GAAW,EAAE,IAAI,EAAE,KAAK,EAAE,GAAG,EAAE,EAAE,EAAE,CAAC;AAC7C,OAAO,CAAC,GAAG,CAAC,MAAM,CAAC,GAAG,CAAC,CAAC,CAAC"
}
```

Il commento finale `//# sourceMappingURL=` dice dove trovare la mappa; il campo `sources` elenca i file originali, e `mappings` contiene, in una codifica compatta basata su base64, la riga e la colonna del sorgente da cui proviene ogni pezzo del codice generato. Nell'esempio la trasformazione ha tolto le annotazioni, eliminato una riga vuota e cambiato `'./tipi.ts'` in `'./tipi.js'`: senza la mappa, ogni posizione del file prodotto sarebbe un indizio sbagliato.

I DevTools del browser leggono le source map da soli, quando trovano il commento. Node invece le usa solo su richiesta, con l'opzione `--enable-source-maps`, [non più sperimentale da Node 15.11](https://nodejs.org/api/cli.html#--enable-source-maps): gli stack trace, cioè l'elenco delle chiamate stampato insieme a un errore, citano allora il file e la riga del sorgente. Per esempio, con un `src/boom.ts` che lancia un errore alla riga 4, compilato in `dist/boom.js`:

| Comando | Effetto |
|---|---|
| `node dist/boom.js` | lo stack trace indica `dist/boom.js:3:15`, la posizione nel codice generato |
| `node --enable-source-maps dist/boom.js` | lo stesso errore indica `src/boom.ts:4:24`, la posizione nel sorgente |

La documentazione avverte che l'opzione ha un costo quando il programma legge spesso `Error.stack`, perché ogni volta deve tradurre le posizioni: in un ambiente di sviluppo è irrilevante, in un servizio che genera molti errori va considerato.

## TypeScript in Node: il type stripping

Il **type stripping** («rimozione dei tipi») è il modo in cui Node esegue direttamente un file `.ts`: prima di passarlo a V8 cancella la sintassi di tipo, sostituendola con spazi bianchi, senza controllare i tipi e senza riscrivere nient'altro ([documentazione](https://nodejs.org/api/typescript.html#type-stripping)). Non serve alcuna opzione:

```bash
node main.ts
```

La funzionalità è arrivata per gradi, e la [cronologia ufficiale](https://nodejs.org/api/typescript.html) aiuta a capire che cosa aspettarsi da ciascuna versione.

| Versione | Che cosa cambia |
|---|---|
| 22.6 | compare, dietro l'opzione `--experimental-strip-types` |
| 23.6 e 22.18 | attiva di default: `node file.ts` funziona senza opzioni |
| 24.3 e 22.18 | sparisce l'avviso «sperimentale» |
| 25.2 e 24.12 | diventa **stabile** |
| 26.0 | viene rimossa l'opzione `--experimental-transform-types` (se ne parla nel box *Legacy* più sotto) |

In Node 24 LTS, dalla 24.12, e in Node 26 il type stripping è quindi una funzionalità stabile, che si disattiva solo esplicitamente con `--no-strip-types`. Il lavoro lo fa [Amaro](https://github.com/nodejs/amaro), una libreria del progetto Node che incapsula il parser TypeScript di SWC compilato in WebAssembly. Due fatti vanno tenuti a mente fin da subito: Node **ignora `tsconfig.json`**, quindi nessuna opzione del compilatore ha effetto sull'esecuzione, e **non controlla i tipi**, come si vedrà nella sezione dedicata.

Gli spazi bianchi hanno uno scopo preciso: sostituendo ogni carattere di tipo con uno spazio, ogni istruzione rimasta conserva la sua riga e la sua colonna, quindi gli stack trace indicano posizioni corrette anche senza source map, e infatti Node [non ne genera](https://nodejs.org/api/typescript.html#source-maps).

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 680 372" role="img" aria-label="Il type stripping di Node: in alto il sorgente main.ts con la sintassi di tipo evidenziata, cioè la riga import type e le annotazioni : Utente e : string; in basso il codice che esegue V8, dove quegli stessi caratteri sono diventati spazi bianchi, così ogni istruzione resta alla stessa riga e alla stessa colonna" style="width:100%;max-width:680px;height:auto;color:inherit"><defs><marker id="n04-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="30" y="20" width="440" height="146" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="46" y="42" font-size="12" font-weight="700">main.ts · il sorgente</text><text x="58" y="68" font-size="10" text-anchor="end" opacity=".45" font-family="ui-monospace,Menlo,Consolas,monospace">1</text><rect x="74.0" y="55" width="304.0" height="18" rx="3" fill="var(--link,#5fa04e)" fill-opacity=".28"/><text x="74.0" y="68" font-size="12.5" font-family="ui-monospace,Menlo,Consolas,monospace" textLength="304.0">import type { Utente } from './tipi.ts';</text><text x="58" y="89" font-size="10" text-anchor="end" opacity=".45" font-family="ui-monospace,Menlo,Consolas,monospace">2</text><text x="58" y="110" font-size="10" text-anchor="end" opacity=".45" font-family="ui-monospace,Menlo,Consolas,monospace">3</text><rect x="203.2" y="97" width="60.8" height="18" rx="3" fill="var(--link,#5fa04e)" fill-opacity=".28"/><rect x="271.6" y="97" width="60.8" height="18" rx="3" fill="var(--link,#5fa04e)" fill-opacity=".28"/><text x="74.0" y="110" font-size="12.5" font-family="ui-monospace,Menlo,Consolas,monospace" textLength="273.6">function saluta(u: Utente): string {</text><text x="58" y="131" font-size="10" text-anchor="end" opacity=".45" font-family="ui-monospace,Menlo,Consolas,monospace">4</text><text x="89.2" y="131" font-size="12.5" font-family="ui-monospace,Menlo,Consolas,monospace" textLength="197.6">return `Ciao, ${u.nome}!`;</text><text x="58" y="152" font-size="10" text-anchor="end" opacity=".45" font-family="ui-monospace,Menlo,Consolas,monospace">5</text><text x="74.0" y="152" font-size="12.5" font-family="ui-monospace,Menlo,Consolas,monospace" textLength="7.6">}</text><rect x="30" y="206" width="440" height="146" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="46" y="228" font-size="12" font-weight="700">ciò che riceve V8</text><text x="58" y="254" font-size="10" text-anchor="end" opacity=".45" font-family="ui-monospace,Menlo,Consolas,monospace">1</text><rect x="75.0" y="241" width="302.0" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 2" opacity=".6"/><text x="58" y="275" font-size="10" text-anchor="end" opacity=".45" font-family="ui-monospace,Menlo,Consolas,monospace">2</text><text x="58" y="296" font-size="10" text-anchor="end" opacity=".45" font-family="ui-monospace,Menlo,Consolas,monospace">3</text><rect x="204.2" y="283" width="58.8" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 2" opacity=".6"/><rect x="272.6" y="283" width="58.8" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 2" opacity=".6"/><text x="74.0" y="296" font-size="12.5" font-family="ui-monospace,Menlo,Consolas,monospace" textLength="129.2">function saluta(u</text><text x="264.0" y="296" font-size="12.5" font-family="ui-monospace,Menlo,Consolas,monospace" textLength="7.6">)</text><text x="340.0" y="296" font-size="12.5" font-family="ui-monospace,Menlo,Consolas,monospace" textLength="7.6">{</text><text x="58" y="317" font-size="10" text-anchor="end" opacity=".45" font-family="ui-monospace,Menlo,Consolas,monospace">4</text><text x="89.2" y="317" font-size="12.5" font-family="ui-monospace,Menlo,Consolas,monospace" textLength="197.6">return `Ciao, ${u.nome}!`;</text><text x="58" y="338" font-size="10" text-anchor="end" opacity=".45" font-family="ui-monospace,Menlo,Consolas,monospace">5</text><text x="74.0" y="338" font-size="12.5" font-family="ui-monospace,Menlo,Consolas,monospace" textLength="7.6">}</text><line x1="250" y1="168" x2="250" y2="202" stroke="currentColor" stroke-width="1.5" marker-end="url(#n04-b)"/><text x="262" y="190" font-size="11" opacity=".8">type stripping</text><rect x="498" y="58" width="22" height="14" rx="3" fill="var(--link,#5fa04e)" fill-opacity=".28"/><text x="528" y="69" font-size="11">sintassi di tipo</text><text x="498" y="96" font-size="10.5" opacity=".75">cancellabile: non</text><text x="498" y="111" font-size="10.5" opacity=".75">cambia il programma</text><rect x="498" y="244" width="22" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 2" opacity=".6"/><text x="528" y="255" font-size="11">spazi bianchi</text><text x="498" y="282" font-size="10.5" opacity=".75">stesse righe,</text><text x="498" y="297" font-size="10.5" opacity=".75">stesse colonne</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Il type stripping non riscrive nulla: sostituisce con spazi la riga <code>import type</code> e le annotazioni <code>: Utente</code> e <code>: string</code>. Il resto del codice resta carattere per carattere dov'era, così un errore alla riga 4, colonna 10, del codice eseguito è anche alla riga 4, colonna 10, del sorgente.</figcaption>
</figure>

Il risultato si può osservare con la funzione `stripTypeScriptTypes()` di `node:module`, che applica la stessa trasformazione a una stringa. È ancora in fase di *release candidate* (stabilità 1.2) e stampa un avviso sperimentale, ma per capire il meccanismo basta:

```js
// prova.mjs
import { stripTypeScriptTypes } from 'node:module';

console.log(stripTypeScriptTypes('const a: number = 1;'));
// const a         = 1;
```

### Solo sintassi cancellabile

Node accetta soltanto la sintassi TypeScript **cancellabile** (*erasable*), quella che si può togliere senza cambiare il programma. Ci rientra quasi tutto ciò che si scrive ogni giorno: annotazioni, `interface`, `type`, generics, `as`, `satisfies`, l'operatore `!` di non-null, `declare`, i modificatori di classi e campi (`private`, `readonly`, `abstract`), gli `import type` e i `namespace` che contengono solo tipi. Restano fuori i costrutti che [producono codice](https://nodejs.org/api/typescript.html#typescript-features), e lì Node si ferma con un errore preciso:

```
SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript enum is not supported in strip-only mode
```

| Costrutto | Perché non si può cancellare | Alternativa cancellabile |
|---|---|---|
| `enum Direzione { Su, Giu }` | crea un oggetto a runtime | union di literal o oggetto `as const` (<a href="../typescript/#/docs/13-enum?id=alternative-moderne-union-di-literal-e-oggetti-as-const" target="_blank" rel="noopener">vault TypeScript</a>) |
| `namespace A { export let x = 1 }` | crea un oggetto con i suoi membri | moduli ES (<a href="../typescript/#/docs/31-moduli-namespaces?id=namespaces" target="_blank" rel="noopener">vault TypeScript</a>) |
| `constructor(public x: number) {}` (parameter properties) | genera l'assegnazione `this.x = x` | dichiarare il campo e assegnarlo nel costruttore (<a href="../typescript/#/docs/15-classi?id=shorthand-initialization" target="_blank" rel="noopener">vault TypeScript</a>) |
| `import fs = require('node:fs')` (import alias) | genera una dichiarazione | un normale `import` |
| `<number>valore` | Node non accetta l'asserzione con le parentesi angolari | `valore as number` |
| `@log class A {}` (decoratori) | proposta non ancora nel motore, che Node non trasforma: errore di sintassi | un trasformatore che li supporti, come `tsc` o Babel |

> [!info|label:Legacy]
> Da Node 22.7 esiste l'opzione `--experimental-transform-types`, che oltre a togliere i tipi riscrive anche `enum`, parameter properties e namespace, attivando in automatico le source map. In Node 24 è ancora disponibile, in stato di [*release candidate*](https://nodejs.org/docs/latest-v24.x/api/cli.html#--experimental-transform-types), ma **Node 26 l'ha rimossa** ([note di rilascio della 26.0.0](https://nodejs.org/en/blog/release/v26.0.0), maggio 2026). Per il codice nuovo la strada è restare nella sintassi cancellabile; per il codice esistente che usa `enum` e simili, un runner come tsx o un passo di build.

### Import ed estensioni

Sugli `import` Node impone due regole che il compilatore, da solo, non chiedeva.

La prima riguarda gli import di soli tipi, che vanno **marcati con `type`**. Poiché lavora un file alla volta, leggendo `import { Utente } from './tipi.ts'` Node non ha modo di sapere se `Utente` è un tipo da cancellare o un valore da importare, perché per saperlo dovrebbe aprire `tipi.ts`: lo tratta quindi come un valore, e l'import [fallisce durante l'esecuzione](https://nodejs.org/api/typescript.html#importing-types-without-type-keyword). La marcatura si scrive in due forme equivalenti, sull'intera dichiarazione o sul singolo nome:

```ts
// tipi.ts
export interface Utente {
  nome: string;
  eta: number;
}

export function saluta(u: Utente): string {
  return `Ciao, ${u.nome}!`;
}
```

```ts
// main.ts
import { saluta, type Utente } from './tipi.ts';   // oppure: import type { Utente } from './tipi.ts';

const ada: Utente = { nome: 'Ada', eta: 36 };
console.log(saluta(ada));   // Ciao, Ada!

// senza «type» davanti a Utente:
// SyntaxError: The requested module './tipi.ts' does not provide an export named 'Utente'
```

La seconda regola è che l'**estensione è obbligatoria**, ed è quella vera: si scrive `'./tipi.ts'`, non `'./tipi'` e nemmeno `'./tipi.js'`. È la stessa regola degli ES modules vista nel [[02-moduli-e-pacchetti#es-modules-import-ed-export|capitolo 02]], e vale anche per `require('./tipi.ts')`. Il sistema di moduli, infine, si sceglie con le estensioni come per i file JavaScript:

| Estensione | Come la tratta Node |
|---|---|
| `.ts` | come un `.js`: decide il campo `"type"` del `package.json` più vicino |
| `.mts` | sempre ES module, come `.mjs` |
| `.cts` | sempre CommonJS, come `.cjs` |
| `.tsx` | non supportata |

Per i dettagli sul campo `"type"` si rimanda al [[02-moduli-e-pacchetti#come-node-sceglie-fra-i-due|capitolo 02]]. Ci sono poi due limiti che sorprendono chi arriva da un progetto con un bundler. Gli alias definiti con l'opzione `paths` del `tsconfig.json` (come `@/utils`) non funzionano, perché Node non legge quel file: l'equivalente nativo sono gli [import privati con `#`](https://nodejs.org/api/typescript.html#paths-aliases) del campo `"imports"`, descritti nel [[02-moduli-e-pacchetti#dal-modulo-al-pacchetto-packagejson|capitolo 02]]. E Node [si rifiuta di togliere i tipi](https://nodejs.org/api/typescript.html#type-stripping-in-dependencies) ai file che stanno dentro `node_modules`, con l'errore `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`: è una scelta voluta per scoraggiare la pubblicazione di pacchetti in TypeScript, quindi una libreria va sempre distribuita come JavaScript, accompagnato dai file di tipi `.d.ts` (il tema del [[08-pubblicare-pacchetti-npm|capitolo 08]]).

### Il `tsconfig.json` che rispecchia Node

Node ignora `tsconfig.json`, ma l'editor e `tsc` lo leggono: conviene quindi configurarlo perché il compilatore segnali **in anticipo**, mentre si scrive, proprio ciò che Node rifiuterebbe all'esecuzione. La documentazione di Node raccomanda TypeScript 5.8 o successivo e una [configurazione precisa](https://nodejs.org/api/typescript.html#type-stripping), riportata qui con un'aggiunta per TypeScript 7.0:

```json
{
  "compilerOptions": {
    "noEmit": true,
    "target": "esnext",
    "module": "nodenext",
    "rewriteRelativeImportExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "types": ["node"]
  }
}
```

| Opzione | Da TypeScript | Che cosa fa |
|---|---|---|
| [`erasableSyntaxOnly`](https://www.typescriptlang.org/tsconfig/#erasableSyntaxOnly) | [5.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html) | segnala come errore ogni costrutto non cancellabile: `enum`, namespace con codice, parameter properties, `import =` ed `export =`, asserzioni `<T>` |
| [`verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax) | 5.0 | gli import senza `type` restano, quelli con `type` spariscono: obbliga a marcare gli import di soli tipi, come vuole Node |
| [`rewriteRelativeImportExtensions`](https://www.typescriptlang.org/tsconfig/#rewriteRelativeImportExtensions) | [5.7](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-7.html#path-rewriting-for-relative-paths) | consente gli import con `.ts` e, se si emette JavaScript, riscrive i percorsi relativi da `'./tipi.ts'` a `'./tipi.js'` |
| `module: "nodenext"` | | applica le regole di risoluzione dei moduli di Node, estensioni obbligatorie comprese |
| `noEmit` | | `tsc` non produce file e fa solo da type checker; si toglie se si vuole distribuire JavaScript |
| `types: ["node"]` | 7.0 | include i tipi di Node (pacchetto `@types/node`), che da TypeScript 7.0 non vengono più caricati da soli |

L'ultima riga è l'aggiunta: in TypeScript 7.0 l'opzione `types` vale `[]` per impostazione predefinita, come spiega il <a href="../typescript/#/docs/02-compilatore?id=compilare-un-intero-progetto-con-tsconfigjson" target="_blank" rel="noopener">vault TypeScript</a>. Quanto a `rewriteRelativeImportExtensions`, attivarla accende di riflesso anche [`allowImportingTsExtensions`](https://www.typescriptlang.org/tsconfig/#allowImportingTsExtensions), l'opzione più vecchia che permette di importare con l'estensione `.ts`. Con questa configurazione `tsc` segnala, prima ancora di lanciare Node, gli stessi problemi visti sopra:

```
enum.ts(1,6): error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
notype.ts(1,18): error TS1484: 'Utente' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
```

> [!info|label:Nel repo]
> Questo progetto è *zero-build* per scelta e non ha nemmeno un `package.json`; il suo script Node, `scripts/sync-setup.mjs`, è JavaScript puro e usa solo moduli integrati. Con Node 24 potrebbe diventare `sync-setup.mts`, con le annotazioni di tipo, e girare ancora con un semplice `node scripts/sync-setup.mts`: il type stripping aggiunge i tipi senza aggiungere una build. Per **controllarli**, però, servirebbero `typescript` e `@types/node` installati, cioè proprio le dipendenze che il repo evita.

## Il controllo dei tipi resta a parte

Il type stripping cancella i tipi senza guardarli, quindi un file pieno di errori di tipo viene eseguito comunque, finché resta JavaScript valido una volta tolte le annotazioni:

```ts
// errore.ts
const n: number = 'non sono un numero';
console.log(n);

// $ node errore.ts
// non sono un numero
```

È la stessa divisione dei compiti vista nella figura all'inizio del capitolo: Node fa il trasformatore, e il type checker va lanciato a parte. La [guida ufficiale](https://nodejs.org/en/learn/typescript/run-natively) indica proprio `tsc` con l'opzione `--noEmit`, che controlla i tipi dell'intero progetto senza produrre file.

| Comando | Effetto |
|---|---|
| `node src/main.ts` | esegue il programma, senza controllare i tipi |
| `npx tsc --noEmit` | controlla i tipi di tutto il progetto e non produce file; su `errore.ts` segnala `TS2322: Type 'string' is not assignable to type 'number'` |
| `npx tsc --noEmit --watch` | lo stesso controllo, ripetuto a ogni salvataggio |

In un progetto i due comandi diventano script del `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "start": "node src/main.ts",
    "typecheck": "tsc --noEmit"
  }
}
```

Il controllo dei tipi trova così tre posti naturali: l'editor, che lo esegue di continuo mentre si scrive; `npm run typecheck` prima di un commit; la pipeline di integrazione continua, descritta nel <a href="../glossario/#/docs/ci-cd-pipeline" target="_blank" rel="noopener">glossario</a>, che blocca le modifiche con errori. Da TypeScript 7.0 il compilatore è un binario nativo scritto in Go, circa dieci volte più rapido del precedente, come racconta il <a href="../typescript/#/docs/02-compilatore?id=il-compilatore-nativo" target="_blank" rel="noopener">vault TypeScript</a>, e un controllo completo a ogni commit costa molto meno di un tempo.

## Quando la sintassi cancellabile non basta: tsx

**tsx** (*TypeScript Execute*) è un programma che si usa al posto di `node` per eseguire TypeScript, e la stessa [documentazione di Node](https://nodejs.org/api/typescript.html#full-typescript-support) lo indica come esempio di supporto completo. A differenza del type stripping trasforma davvero ogni file, al volo e con esbuild (la sua unica dipendenza), quindi accetta anche `enum`, parameter properties, import senza estensione e alias `paths`. Come Node, però, non controlla i tipi: la sua [documentazione](https://github.com/privatenumber/tsx/blob/master/docs/typescript.md) dà per scontato che il controllo avvenga a parte, con `tsc --noEmit`.

| Comando | Effetto |
|---|---|
| `npx tsx main.ts` | esegue il file con la trasformazione completa |
| `npx tsx watch main.ts` | lo riesegue a ogni salvataggio |
| `node --import=tsx main.ts` | usa tsx come estensione del comando `node` |

Prima di tsx lo strumento di riferimento era ts-node, che però, ricorda la [documentazione di tsx](https://github.com/privatenumber/tsx/blob/master/docs/index.md), non supportava gli ES modules ed era complicato da usare. L'uso di tsx in un progetto, con la modalità watch, è descritto nel <a href="../typescript/#/docs/04-progetto?id=server-di-sviluppo-e-runtime" target="_blank" rel="noopener">vault TypeScript</a>; qui basta la regola di scelta: se il codice resta nella sintassi cancellabile basta `node`, se usa costrutti che vanno riscritti serve tsx.

## JSX: markup dentro il codice

**JSX** è un'[estensione di sintassi per JavaScript](https://react.dev/learn/writing-markup-with-jsx) che permette di scrivere, dentro un file di codice, markup simile all'HTML. Non fa parte di ECMAScript, quindi nessun motore lo esegue: Node rifiuta i file `.jsx` e `.tsx` con l'errore `ERR_UNKNOWN_FILE_EXTENSION`, e un tag JSX dentro un `.js` produce il `SyntaxError` visto all'inizio del capitolo. Nemmeno il type stripping può aiutare, perché JSX non è cancellabile: ogni tag va **riscritto** in una chiamata di funzione. Come spiega l'[annuncio della nuova trasformazione di React](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html), i browser non capiscono JSX e serve un compilatore come Babel o TypeScript.

```jsx
// App.jsx: ciò che si scrive
function App() {
  return <h1>Ciao</h1>;
}
```

```js
// ciò che produce la trasformazione (runtime automatico di React)
import { jsx as _jsx } from 'react/jsx-runtime';

function App() {
  return _jsx('h1', { children: 'Ciao' });
}
```

L'`import` in cima viene aggiunto dal trasformatore, non da chi scrive il componente; la forma più vecchia, con le chiamate a `React.createElement`, e le varie modalità dell'opzione `jsx` di TypeScript sono descritte nel <a href="../typescript/#/docs/03-tsconfig?id=jsx" target="_blank" rel="noopener">vault TypeScript</a>. JSX e React, del resto, [sono due cose distinte](https://react.dev/learn/writing-markup-with-jsx#jsx-putting-markup-into-javascript): JSX è una sintassi, React una libreria (i termini dell'ecosistema React sono raccolti nel <a href="../glossario/#/docs/react?id=codice-dichiarativo" target="_blank" rel="noopener">glossario</a>).

In un progetto frontend la trasformazione di JSX non si configura quasi mai a mano: la fa il dev server, che in Vite [supporta `.jsx` e `.tsx` senza configurazione](https://vite.dev/guide/features#jsx). Lo stesso vale per i test runner che devono eseguire componenti in Node, argomento del [[07-strumenti-di-test|capitolo 07]]; per uno script isolato, tsx sa trasformare anche `.jsx` e `.tsx`.

## Come eseguire TypeScript in un progetto frontend

Le strade viste nel capitolo coprono ciascuna un pezzo diverso dello stesso progetto.

| Strada | Comando tipico | Sintassi accettata | Controlla i tipi | Adatta a |
|---|---|---|---|---|
| type stripping di Node | `node script.ts` | solo cancellabile, niente JSX | no | script di build e di utilità, piccoli servizi, strumenti interni (Node 22.18+) |
| tsx | `npx tsx script.ts` | tutta, anche JSX e `paths` | no | script che usano `enum` e simili, codice esistente |
| bundler e dev server | `vite`, `vite build` | tutta, JSX e TSX compresi, salvo i costrutti che `isolatedModules` vieta | no | l'applicazione che va nel browser |
| build con `tsc` | `tsc`, poi `node dist/main.js` | tutta | sì | librerie da pubblicare (`.js` più `.d.ts`), servizi che non vogliono strumenti all'esecuzione |

In un progetto reale convivono quasi sempre. L'applicazione passa dal dev server, che per Vite traduce i file [senza controllarne i tipi](https://vite.dev/guide/features#transpile-only) e consiglia di affiancare `tsc --noEmit` alla build di produzione; gli script della cartella `scripts/` girano con `node` grazie al type stripping; un eventuale pacchetto condiviso viene compilato con `tsc` per pubblicare JavaScript e tipi. L'unica costante è che il controllo dei tipi è un passo a sé, tranne nella build con `tsc`, dove trasformazione e controllo avvengono insieme.

> [!tip]
> Una variante di JavaScript va sempre **trasformata** prima che un motore la esegua. Per TypeScript in Node la strada di oggi è il type stripping (`node file.ts`, stabile da Node 24.12): sintassi cancellabile, `import type`, estensioni `.ts` esplicite e un `tsconfig.json` con `erasableSyntaxOnly` e `verbatimModuleSyntax`. Il controllo dei tipi resta un lavoro separato, con `tsc --noEmit`.

## Ripasso lampo

<details>
<summary>Perché <code>node app.ts</code> funziona e <code>node app.tsx</code> no?</summary>

Perché il type stripping di Node toglie solo la sintassi cancellabile, cioè i tipi, sostituendoli con spazi. JSX non è cancellabile: ogni tag va riscritto in una chiamata di funzione, quindi Node non supporta `.tsx` (e nemmeno `.jsx`). Per JSX serve un trasformatore: il dev server (Vite), tsx, esbuild, Babel o `tsc`.

</details>

<details>
<summary>Perché il type stripping non ha bisogno di source map?</summary>

Perché sostituisce ogni carattere di tipo con uno spazio invece di eliminarlo: il codice rimasto conserva riga e colonna, quindi gli stack trace indicano già le posizioni del sorgente. Le source map servono quando la trasformazione sposta il codice, come fanno `tsc` o un bundler; in Node si attivano con `--enable-source-maps`.

</details>

<details>
<summary>Perché <code>import { Utente } from './tipi.ts'</code> può fallire con Node anche se il codice è corretto per TypeScript?</summary>

Se `Utente` è solo un tipo, Node, che lavora un file alla volta, non può saperlo: tratta l'import come un valore e fallisce con «does not provide an export named 'Utente'». Va scritto `import type { Utente }` oppure `import { type Utente }`; l'opzione `verbatimModuleSyntax` fa segnalare l'errore già a `tsc`.

</details>

<details>
<summary>Un <code>enum</code> provoca <code>ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX</code>: quali strade ci sono?</summary>

Riscriverlo in sintassi cancellabile, con una union di literal o un oggetto `as const`, ed è la scelta da preferire, che `erasableSyntaxOnly` aiuta a rispettare. In alternativa si esegue il codice con tsx o lo si compila prima con `tsc`. L'opzione `--experimental-transform-types` esiste ancora in Node 24, ma Node 26 l'ha rimossa.

</details>

<details>
<summary>Se Node esegue già il TypeScript, a che cosa serve ancora <code>tsc</code>?</summary>

A controllare i tipi, che Node non guarda affatto: un file con errori di tipo viene eseguito comunque. Si lancia `tsc --noEmit` nell'editor, prima del commit e in CI. `tsc` serve inoltre a produrre JavaScript e file `.d.ts` quando si pubblica una libreria, perché Node non toglie i tipi ai file dentro `node_modules`.

</details>
