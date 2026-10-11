# Indice completo

Appunti di studio su **Node.js per chi fa frontend**: il runtime che fa girare dev server, bundler, test, linter e package manager anche quando il codice dell'applicazione finisce nel browser. La struttura segue l'indice di *Modern Frontend Development with Node.js* (Florian Rappl, Packt, 2022); i contenuti sono rielaborazioni originali sulla documentazione ufficiale, aggiornate alla versione LTS di Node e **riviste ogni mese**.

> Versione di riferimento: **Node 24 LTS**. Quando una feature richiede una versione minima, è indicata accanto. Ciò che diventa superato con le nuove release non sparisce: passa in un box **Legacy** con la data.

## Parte 1 · Fondamenti

| # | Capitolo | Contenuto |
|---|----------|-----------|
| 01 | [Dentro Node.js](docs/01-dentro-node.md) | runtime e browser a confronto, V8 e libuv, un solo thread per il JavaScript, event loop e fasi, thread pool, bloccante vs non bloccante |
| 02 | [Moduli e pacchetti](docs/02-moduli-e-pacchetti.md) | CommonJS ed ES modules, `.mjs`/`.cjs` e campo `"type"`, prefisso `node:`, `import.meta`, `require(esm)`, `package.json`: `exports` e `imports` |
| 03 | Scegliere un package manager *(in arrivo)* | npm, pnpm, Yarn, Bun; lockfile e workspace |

## Parte 2 · Tooling

| # | Capitolo | Contenuto |
|---|----------|-----------|
| 04 | Le varianti di JavaScript *(in arrivo)* | TypeScript in Node, transpiler, JSX |
| 05 | Linter e formatter *(in arrivo)* | ESLint, Prettier, Biome |
| 06 | Bundler *(in arrivo)* | Vite, Rolldown, esbuild, webpack |
| 07 | Strumenti di test *(in arrivo)* | test runner di Node, Vitest, Jest, Playwright |

## Parte 3 · Argomenti avanzati

| # | Capitolo | Contenuto |
|---|----------|-----------|
| 08 | Pubblicare pacchetti npm *(in arrivo)* | versioni, `exports`, pubblicazione e provenance |
| 09 | Monorepo *(in arrivo)* | workspace, task runner |
| 10 | Codice nativo con WebAssembly *(in arrivo)* | Wasm in Node e nel browser |
| 11 | Runtime alternativi *(in arrivo)* | Deno, Bun |

## ➕ Approfondimenti (fuori dall'indice del libro)

| | Capitolo | Contenuto |
|---|----------|-----------|
| ➕ | Le API di base *(in arrivo)* | `node:fs`, `node:path`, `process`: leggere uno script Node riga per riga |
