# JavaScript moderno — oltre YDKJS

La serie *You Don't Know JS* si ferma a **ES6 (ES2015)** e alle prime proposte che la seguirono (`async`/`await`, l'operatore `**`, spread/rest sugli oggetti, `Array.prototype.includes`), trattate nel capitolo [Oltre ES6](/docs/libro6/08-oltre-es6.md). Da lì in poi TC39 ha adottato un ciclo di rilascio **annuale**: ogni giugno una nuova edizione dello standard raccoglie le proposte che hanno raggiunto lo **Stage 4** (finalizzate e implementate).

Questa sezione è **distaccata** dalla guida al libro: raccoglie le funzionalità entrate nel linguaggio **dopo** ciò che YDKJS copre, una pagina per edizione, verificate sulla documentazione ufficiale [MDN](https://developer.mozilla.org/) e sulla lista delle [finished proposals di TC39](https://github.com/tc39/proposals/blob/main/finished-proposals.md). Vale la stessa regola dell'*unica fonte di verità*: ciò che è già spiegato nel libro non viene riscritto qui, ma richiamato con un link.

> [!tip]
> Il modello annuale ha reso l'etichetta di versione meno importante del **supporto effettivo** nell'ambiente target. In pratica si ragiona per singola feature: ogni pagina indica l'edizione in cui la feature è stata standardizzata, ma la maggior parte è disponibile da anni in tutti i motori evergreen (V8, SpiderMonkey, JavaScriptCore) e in Node.js recente.

## Le edizioni

| Edizione | Anno | Temi principali |
|---|---|---|
| [ES2017](es2017.md) | ES8 | `async`/`await`, `Object.entries`/`values`, string padding, `SharedArrayBuffer`/`Atomics` |
| [ES2018](es2018.md) | ES9 | async iteration, `Promise.finally`, spread/rest su oggetti, novità RegExp |
| [ES2019](es2019.md) | ES10 | `Array.flat`/`flatMap`, `Object.fromEntries`, `trimStart`/`trimEnd`, sort stabile |
| [ES2020](es2020.md) | ES11 | `BigInt`, optional chaining `?.`, nullish `??`, `Promise.allSettled`, dynamic `import()`, `globalThis` |
| [ES2021](es2021.md) | ES12 | `Promise.any`, logical assignment, separatori numerici, `replaceAll`, `WeakRef` |
| [ES2022](es2022.md) | ES13 | class fields e private `#`, static block, top-level `await`, `.at()`, `Object.hasOwn`, `Error.cause` |
| [ES2023](es2023.md) | ES14 | `findLast`/`findLastIndex`, metodi *change-by-copy*, hashbang, Symbol come chiavi WeakMap |
| [ES2024](es2024.md) | ES15 | `Object.groupBy`/`Map.groupBy`, `Promise.withResolvers`, RegExp flag `v`, resizable `ArrayBuffer` |
| [ES2025](es2025.md) | ES16 | iterator helpers, metodi di `Set`, import attributes, `Promise.try`, `RegExp.escape`, `Float16Array` |
| [ES2026](es2026.md) | ES17 | `Temporal`, resource management (`using`/`await using`), `Iterator.zip`, `Atomics.pause` |

## Convenzioni

Le convenzioni sono quelle del resto del vault: prosa impersonale in italiano, termini tecnici e keyword in inglese, ogni claim non ovvio ancorato a MDN. Ogni pagina segue lo schema **spiegazione → Ripasso veloce → Domande**.
