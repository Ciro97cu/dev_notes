# Indice completo

Appunti di studio su **Node.js per chi fa frontend**: il runtime che fa girare dev server, bundler, test, linter e package manager anche quando il codice dell'applicazione finisce nel browser. La struttura segue l'indice di *Modern Frontend Development with Node.js* (Florian Rappl, Packt, 2022); i contenuti sono rielaborazioni originali sulla documentazione ufficiale, aggiornate alla versione LTS di Node e **riviste ogni mese**.

> Versione di riferimento: **Node 24 LTS**. Quando una feature richiede una versione minima, è indicata accanto. Ciò che diventa superato con le nuove release non sparisce: passa in un box **Legacy** con la data.

## Parte 1 · Fondamenti

| # | Capitolo | Contenuto |
|---|----------|-----------|
| 01 | [Dentro Node.js](docs/01-dentro-node.md) | runtime e browser a confronto, V8 e libuv, un solo thread per il JavaScript, event loop e fasi, thread pool, bloccante vs non bloccante |
| 02 | [Moduli e pacchetti](docs/02-moduli-e-pacchetti.md) | CommonJS ed ES modules, `.mjs`/`.cjs` e campo `"type"`, prefisso `node:`, `import.meta`, `require(esm)`, `package.json`: `exports` e `imports` |
| 03 | [Scegliere un package manager](docs/03-package-manager.md) | le fasi di un'installazione, `node_modules` piatto, store di pnpm e Plug'n'Play di Yarn, lockfile e installazioni riproducibili, script di installazione, `packageManager`/`devEngines` e la fine di Corepack |

## Parte 2 · Tooling

| # | Capitolo | Contenuto |
|---|----------|-----------|
| 04 | [Le varianti di JavaScript](docs/04-varianti-di-javascript.md) | trasformare il codice (togliere o riscrivere), source map, type stripping di Node, il controllo dei tipi a parte, `tsx`, JSX |
| 05 | [Linter e formatter](docs/05-linter-e-formatter.md) | l'AST, ESLint e la flat config, typescript-eslint, Prettier, Stylelint, Biome e Oxc, EditorConfig, controlli in editor, pre-commit e CI |
| 06 | [Bundler: costruire le web app](docs/06-bundler.md) | il bundler come programma Node, dev server e HMR, build di produzione, configurazione, variabili d'ambiente, asset, plugin |
| 07 | [Strumenti di test](docs/07-strumenti-di-test.md) | unit/integration/end-to-end, stub/spy/mock, `node:test`, Vitest, Jest, Testing Library, Playwright, coverage |

## Parte 3 · Argomenti avanzati

| # | Capitolo | Contenuto |
|---|----------|-----------|
| 08 | [Pubblicare pacchetti npm](docs/08-pubblicare-pacchetti-npm.md) | preparare il `package.json`, controlli prima della pubblicazione, versioni e dist-tag, trusted publishing e provenance, rilasci automatici, ricetta di una libreria ESM |
| 09 | [Monorepo](docs/09-monorepo.md) | `apps/` e `packages/`, workspace di npm/pnpm/Yarn/Bun, grafo delle dipendenze, Turborepo e Nx, Changesets, project references di TypeScript |
| 10 | [Codice nativo con WebAssembly](docs/10-webassembly.md) | modulo e istanza, `.wat`/`.wasm`, caricamento in browser e Node, memoria lineare, toolchain, WASI, addon Node-API |
| 11 | [Runtime alternativi](docs/11-runtime-alternativi.md) | Deno e i permessi, Bun, runtime edge e isolate, WinterTC, codice portabile, confronto |

## ➕ Approfondimenti (fuori dall'indice del libro)

| | Capitolo | Contenuto |
|---|----------|-----------|
| ➕ | [Le API di base](docs/a1-api-di-base.md) | `node:fs/promises`, `node:path`, `node:url`, `process`: leggere uno script Node riga per riga |
