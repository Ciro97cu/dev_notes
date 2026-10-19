# 11 · Runtime alternativi

Un **runtime alternativo** è un programma che, come Node, esegue JavaScript fuori dal browser, ma con scelte proprie sul motore che esegue il codice, sulle API messe a disposizione e sugli strumenti inclusi. Per oltre un decennio «JavaScript lato server» ha voluto dire Node; oggi accanto a lui ci sono **Deno**, che punta su sicurezza, TypeScript e API standard del web, **Bun**, che punta sulla velocità e riunisce in un solo eseguibile runtime, package manager, bundler e test runner, e i **runtime edge**, che eseguono piccole funzioni sui server di una rete distribuita, vicino a chi visita il sito. Per chi fa frontend la questione è concreta: il tooling quotidiano può girare su un runtime diverso da Node, uno script può nascere in TypeScript senza alcuna configurazione, e parte del codice di un'applicazione può finire su una piattaforma edge che di Node offre solo una porzione. Il capitolo mostra che cosa hanno in comune questi ambienti, dove divergono e che cosa resta portabile dall'uno all'altro.

## Che cosa fa un runtime

Il linguaggio JavaScript, da solo, non sa fare quasi nulla di utile: non prevede file, né rete, né timer. Un **runtime** è l'insieme dei pezzi che gli stanno attorno e lo trasformano in un ambiente in cui scrivere programmi veri, e i pezzi sono sempre quattro. Il **motore** (*engine*) legge il codice e lo esegue, ed è l'unica parte che conosce il linguaggio. Le **API** sono le funzioni e gli oggetti che il programma trova già pronti, come `fetch()` o `setTimeout()`, e decidono che cosa un programma può fare. L'**event loop** è il ciclo che raccoglie le operazioni terminate e riprende le callback e le Promise che le attendevano. Il **caricatore di moduli** (*module loader*), infine, trova e collega i file e i pacchetti nominati negli `import`. In Node questi ruoli spettano a V8, ai moduli `node:*`, a libuv e alle regole di risoluzione del [[02-moduli-e-pacchetti|capitolo 02]]; come collaborano dentro il processo è raccontato nel [[01-dentro-node|capitolo 01]].

La distinzione conta perché i quattro pezzi non cambiano allo stesso modo da un runtime all'altro. Il **linguaggio** è identico ovunque: tutti i motori seguono la stessa specifica ECMAScript (chi la scrive e come evolve è spiegato nel <a href="../javascript/#/docs/moderno/processo-tc39?id=chi-comanda-su-javascript-ecma-tc39-ecmascript" target="_blank" rel="noopener">vault JavaScript</a>), quindi una classe, un ciclo `for…of` o una Promise si comportano allo stesso modo in Node, in Deno e in Bun. Le **API**, invece, sono scelte di ciascun runtime: per leggere un file di testo Node offre `readFile()` di `node:fs/promises`, Deno [`Deno.readTextFile()`](https://docs.deno.com/api/deno/~/Deno.readTextFile), Bun [`Bun.file(percorso).text()`](https://bun.com/docs/runtime/file-io). Anche il motore può cambiare: Node e Deno usano **V8**, quello di Chrome, mentre Bun usa **JavaScriptCore**, quello di Safari (la mappa dei motori dei browser è nel <a href="../glossario/#/docs/web-browser?id=motori-del-browser-blink-webkit-gecko" target="_blank" rel="noopener">glossario alla voce sui motori del browser</a>).

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 680 330" role="img" aria-label="Node.js, Deno e Bun come tre pile affiancate: in cima lo stesso codice JavaScript; sotto le API (per Node le API di Node più quelle del web, per Deno e Bun prima le API del web, più le proprie e quelle di compatibilità con Node); poi il nucleo (C++ con libuv, Rust con Tokio, Rust); poi il motore (V8, V8, JavaScriptCore); alla base il sistema operativo" style="width:100%;max-width:680px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="40" y="16" width="600" height="44" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="340" y="36" font-size="12.5" text-anchor="middle" font-weight="700">lo stesso codice JavaScript</text><text x="340" y="51" font-size="10.5" text-anchor="middle" opacity=".75">il linguaggio (ECMAScript) è identico ovunque</text><text x="135" y="85" font-size="13" text-anchor="middle" font-weight="700">Node.js</text><text x="340" y="85" font-size="13" text-anchor="middle" font-weight="700">Deno</text><text x="545" y="85" font-size="13" text-anchor="middle" font-weight="700">Bun</text><rect x="40" y="96" width="190" height="50" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".1" stroke="currentColor" stroke-width="1.6"/><text x="135" y="116" font-size="11.5" text-anchor="middle" font-weight="700">API di Node</text><text x="135" y="134" font-size="10.5" text-anchor="middle" opacity=".8">node:* più fetch, URL…</text><rect x="245" y="96" width="190" height="50" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".1" stroke="currentColor" stroke-width="1.6"/><text x="340" y="116" font-size="11.5" text-anchor="middle" font-weight="700">prima le API del web</text><text x="340" y="134" font-size="10.5" text-anchor="middle" opacity=".8">più Deno.* e node:*</text><rect x="450" y="96" width="190" height="50" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".1" stroke="currentColor" stroke-width="1.6"/><text x="545" y="116" font-size="11.5" text-anchor="middle" font-weight="700">prima le API del web</text><text x="545" y="134" font-size="10.5" text-anchor="middle" opacity=".8">più Bun.* e node:*</text><rect x="40" y="156" width="190" height="50" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 3"/><text x="135" y="176" font-size="11.5" text-anchor="middle" font-weight="700">nucleo in C++</text><text x="135" y="194" font-size="10.5" text-anchor="middle" opacity=".8">libuv: event loop e I/O</text><rect x="245" y="156" width="190" height="50" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 3"/><text x="340" y="176" font-size="11.5" text-anchor="middle" font-weight="700">nucleo in Rust</text><text x="340" y="194" font-size="10.5" text-anchor="middle" opacity=".8">Tokio: event loop e I/O</text><rect x="450" y="156" width="190" height="50" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 3"/><text x="545" y="176" font-size="11.5" text-anchor="middle" font-weight="700">nucleo in Rust</text><text x="545" y="194" font-size="10.5" text-anchor="middle" opacity=".8">(in Zig fino alla 1.3)</text><rect x="40" y="216" width="190" height="50" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8"/><text x="135" y="237" font-size="13" text-anchor="middle" font-weight="700">V8</text><text x="135" y="255" font-size="10.5" text-anchor="middle" opacity=".8">motore di Chrome</text><rect x="245" y="216" width="190" height="50" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8"/><text x="340" y="237" font-size="13" text-anchor="middle" font-weight="700">V8</text><text x="340" y="255" font-size="10.5" text-anchor="middle" opacity=".8">motore di Chrome</text><rect x="450" y="216" width="190" height="50" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8"/><text x="545" y="237" font-size="13" text-anchor="middle" font-weight="700">JavaScriptCore</text><text x="545" y="255" font-size="10.5" text-anchor="middle" opacity=".8">motore di Safari</text><rect x="40" y="278" width="600" height="34" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="340" y="300" font-size="12" text-anchor="middle" font-weight="700">sistema operativo (file, rete, processi)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Tre runtime, tre pile. Il codice in cima è lo stesso; sotto cambiano le <strong>API</strong> (Node parte dalle sue <code>node:*</code>, Deno e Bun dalle API del web, con uno strato di compatibilità verso Node), il <strong>nucleo</strong> che gestisce event loop e input/output e il <strong>motore</strong>: V8 per Node e Deno, JavaScriptCore per Bun.</figcaption>
</figure>

## Perché sono nati altri runtime

Node è nato nel 2009, quando JavaScript non aveva ancora moduli standard né Promise e il web non aveva ancora `fetch`, e per colmare quei vuoti ha inventato soluzioni proprie: CommonJS, le callback con l'errore come primo argomento, i suoi moduli di rete. Lo standard è arrivato più tardi per altre strade, e Node si è trovato a far convivere le sue invenzioni con quelle ufficiali (il caso dei moduli è il tema del [[02-moduli-e-pacchetti|capitolo 02]]). Da qui parte Deno: il [post che annuncia Deno 1.0](https://deno.com/blog/v1) (maggio 2020) definisce Node «il nostro primo tentativo in questo campo», ricorda che fu progettato quando JavaScript era «un linguaggio molto diverso» e contesta due scelte di fondo, cioè la distribuzione delle librerie centralizzata nel registro npm e l'assenza di una **sandbox**, un ambiente chiuso in cui il codice non tocca file e rete senza permesso.

Bun nasce da un'altra domanda. Il [post di Bun 1.0](https://bun.com/blog/bun-v1.0) (settembre 2023) dichiara l'obiettivo di «eliminare lentezza e complessità» senza buttare via ciò che di buono ha JavaScript: un progetto frontend tipico accumula un runtime, un package manager, un transpiler, un bundler e un test runner, ciascuno con la sua configurazione, e Bun prova a sostituirli con un unico programma veloce. I runtime edge, infine, rispondono a un'esigenza di infrastruttura: eseguire codice in molti punti della rete, vicino agli utenti e con tempi di avvio quasi nulli, cosa che un processo Node per ogni applicazione non consente.

La concorrenza ha fatto bene anche a Node, che negli anni ha assorbito molte idee nate altrove: `fetch` globale [non più sperimentale da Node 21](https://nodejs.org/docs/latest-v24.x/api/globals.html#fetch), Web Crypto globale stabile da Node 23, l'esecuzione diretta di TypeScript [stabile da Node 24.12](https://nodejs.org/api/typescript.html#type-stripping) (il tema del [[04-varianti-di-javascript|capitolo 04]]), un modello a permessi stabile da Node 23.5 e 22.13. Oggi, quindi, la scelta del runtime è fra compromessi diversi.

## Deno

**Deno** è un runtime per JavaScript, TypeScript e WebAssembly [costruito su V8, Rust e Tokio](https://github.com/denoland/deno#readme): V8 è lo stesso motore di Node, Rust è il linguaggio in cui è scritto il resto, e Tokio è la libreria Rust per l'I/O asincrono, con un ruolo simile a quello che libuv ha in Node. Deno pubblica una nuova versione *minor* (2.1, 2.2…) [ogni dodici settimane](https://docs.deno.com/runtime/fundamentals/stability_and_releases/); la più recente, a ottobre 2026, è la **2.9**, che è anche la linea **LTS** (*long-term support*, a supporto prolungato), mantenuta con le correzioni critiche fino al 31 gennaio 2027. La svolta è stata [Deno 2](https://deno.com/blog/v2.0) (ottobre 2024), che ha reso il runtime compatibile con Node e npm: prima adottare Deno significava rinunciare all'ecosistema esistente, ora lo si può usare.

Tre idee distinguono Deno da Node. La prima è la **sicurezza per impostazione predefinita**, trattata nella prossima sezione. La seconda è **TypeScript come linguaggio di prima classe**: un file `.ts` [si esegue direttamente](https://docs.deno.com/runtime/fundamentals/typescript/), senza `tsconfig.json` e senza passi di compilazione. Come in Node, però, l'esecuzione **toglie i tipi senza controllarli**, e un errore di tipo non ferma il programma. Il controllo vero si chiede a parte, con `deno check` (che fa lo stesso lavoro di `tsc --noEmit`) oppure con `deno run --check`; `deno test`, invece, controlla i tipi di suo. La terza idea è la preferenza per le **API della piattaforma web**: la documentazione dichiara di usare [API standard come `fetch` e WebSocket al posto di API proprietarie](https://docs.deno.com/runtime/reference/web_platform_apis/), così lo stesso codice gira nel browser e in Deno. Un server HTTP, per esempio, riceve un oggetto `Request` e restituisce un `Response`, gli stessi oggetti che si usano con `fetch()`.

Accanto al runtime c'è una **toolchain integrata**: lo stesso eseguibile `deno` fa da formatter, linter, test runner e compilatore, compiti che in un progetto Node spettano a pacchetti separati (formatter e linter sono il tema del [[05-linter-e-formatter|capitolo 05]], i test del [[07-strumenti-di-test|capitolo 07]]). I comandi principali, secondo la [guida della CLI](https://docs.deno.com/runtime/reference/cli/):

| Comando | Effetto |
|---|---|
| `deno run main.ts` | esegue un file JavaScript o TypeScript |
| `deno serve server.ts` | avvia il server HTTP esportato dal file (porta predefinita 8000) |
| `deno task build` | esegue un task di `deno.json` o uno script di `package.json` |
| `deno fmt` | formatta il codice |
| `deno lint` | analizza il codice con il linter integrato |
| `deno test` | esegue i test, controllando anche i tipi |
| `deno check` | controlla i tipi senza eseguire il programma |
| `deno compile main.ts` | produce un eseguibile autonomo, con il runtime incluso |
| `deno add npm:zod` | aggiunge una dipendenza (in `package.json` se c'è, altrimenti in `deno.json`) |

## I permessi: Deno sicuro di default, e Node

In Deno ogni programma parte dentro la sandbox: [senza un permesso esplicito](https://docs.deno.com/runtime/fundamentals/security/) non può leggere né scrivere file, aprire connessioni di rete, leggere le variabili d'ambiente o avviare altri processi. I permessi si concedono all'avvio con i flag `--allow-*`, e ciascuno può essere generico oppure limitato a un elenco preciso di risorse.

| Flag | Che cosa concede |
|---|---|
| `--allow-read`, `-R` | lettura del file system; `--allow-read=./dati` solo quella cartella |
| `--allow-write`, `-W` | scrittura del file system, anch'essa limitabile a percorsi |
| `--allow-net`, `-N` | accesso alla rete; `--allow-net=api.github.com` solo quell'host |
| `--allow-env`, `-E` | lettura delle variabili d'ambiente; `--allow-env=API_KEY` solo quella |
| `--allow-run` | avvio di sottoprocessi; `--allow-run=git` solo quel programma |
| `--allow-sys`, `-S` | informazioni sul sistema operativo |
| `--allow-ffi` | caricamento di librerie native, compresi gli addon di Node |
| `--allow-import` | import di codice da host remoti oltre a quelli ammessi di default |
| `--allow-all`, `-A` | tutto: la sandbox è spenta |

Ogni permesso ha anche il suo contrario, `--deny-*`, che [prevale sul corrispondente `--allow-*`](https://docs.deno.com/runtime/reference/permissions/): `--allow-read --deny-read=/etc` concede la lettura di tutto tranne `/etc`. Quando il programma tenta un'operazione non concessa e gira in un terminale interattivo, Deno si ferma e **chiede** se permetterla; altrimenti, o con `--no-prompt`, l'operazione fallisce con un errore `NotCapable` che indica il flag mancante.

```ts
// conta.ts
import { readFile } from 'node:fs/promises';

const testo = await readFile('./dati/note.txt', 'utf8');
const risposta = await fetch('https://api.github.com/zen');
console.log(testo.length, await risposta.text());
```

```sh
deno run --allow-read=./dati --allow-net=api.github.com conta.ts
```

Lo stesso script lanciato con il solo `--allow-read=./dati` si fermerebbe sulla `fetch()`. Il vantaggio riguarda soprattutto il codice scritto da altri: uno script scaricato o una dipendenza compromessa non può leggere le chiavi SSH della macchina né spedire dati altrove, se nessuno gliel'ha concesso.

Anche **Node** ha un meccanismo simile, il [modello a permessi](https://nodejs.org/docs/latest-v24.x/api/permissions.html), stabile da Node 23.5 e 22.13 e quindi pienamente utilizzabile in Node 24. La differenza di partenza è che in Node è **opzionale**: si attiva con `--permission`, e da quel momento risultano bloccati il file system, i processi figli, i worker thread, gli addon nativi, WASI e l'inspector, ciascuno da riaprire con il proprio flag (`--allow-fs-read`, `--allow-fs-write`, `--allow-child-process`, `--allow-worker`, `--allow-addons`, `--allow-wasi`). Lo script principale resta comunque leggibile, e dal codice si può verificare che cosa è concesso con `process.permission.has('fs.write')`.

```sh
node --permission --allow-fs-read=./dati conta.ts   # lo stesso file: Node 24 toglie i tipi ed esegue
```

Restano due differenze sostanziali. In Node 24 la **rete** non fa parte del modello: `fetch()` funziona anche con `--permission` attivo, e il flag `--allow-net` arriva solo con [Node 25](https://nodejs.org/api/cli.html#--allow-net), dove è ancora in sviluppo attivo. Inoltre la documentazione stessa descrive il modello come una «cintura di sicurezza» (*seat belt*): impedisce al codice fidato di toccare per errore risorse non concesse, ma [non protegge da codice malevolo](https://nodejs.org/docs/latest-v24.x/api/permissions.html), che può aggirarlo. Da Node 24.20 c'è anche [`--permission-audit`](https://nodejs.org/docs/latest-v24.x/api/cli.html#--permission-audit), che registra le violazioni senza bloccarle: è utile per scoprire di che cosa ha bisogno un programma prima di stringere i permessi.

> [!info|label:Legacy]
> In Node 20 il modello a permessi era sperimentale e si attivava con `--experimental-permission`; da Node 23.5 e 22.13 è stabile e il flag è `--permission`. Node 20 è a fine vita da aprile 2026, quindi il vecchio nome si incontra ormai solo in articoli e script datati.

## Deno e l'ecosistema di Node

Da Deno 2 si può usare buona parte del mondo Node. I moduli integrati si importano con il prefisso `node:`, lo stesso raccomandato nel [[02-moduli-e-pacchetti|capitolo 02]], mentre i pacchetti npm si possono usare in due modi: direttamente nell'`import`, con lo **specificatore** `npm:` (un prefisso che dice a Deno da dove prendere il modulo), oppure tramite `package.json`, come in un progetto Node.

```ts
import { readFile } from 'node:fs/promises';   // modulo integrato di Node
import { z } from 'npm:zod@4';                 // pacchetto npm, senza installazione preliminare
```

Con lo specificatore `npm:` Deno scarica il pacchetto in una cache globale, senza creare `node_modules` nel progetto. In un progetto che ha già un `package.json`, invece, Deno [lo legge](https://docs.deno.com/runtime/fundamentals/node/): `deno install` crea la cartella `node_modules` come farebbe npm, `deno task` esegue gli script, e il campo `"type"` viene rispettato come in Node. Anche CommonJS è supportato.

La compatibilità è ampia ma non totale: secondo la stessa documentazione, da Deno 2.8 oltre il 75% della suite di test di Node passa anche in Deno, coprendo quasi tutti i moduli `node:`. Due punti richiedono attenzione. Gli **script di ciclo di vita** dei pacchetti (come `postinstall`, che npm esegue subito dopo l'installazione) non partono di default, per sicurezza: chi ne ha bisogno li autorizza pacchetto per pacchetto, per esempio con `deno install --allow-scripts=npm:duckdb`. Gli **addon nativi**, cioè moduli compilati da C o C++ con estensione `.node` che dialogano con il runtime attraverso l'interfaccia **Node-API**, funzionano solo con una cartella `node_modules` locale e con il permesso `--allow-ffi`.

## Bun

**Bun** si presenta come [un toolkit tutto in uno](https://bun.com/docs) per applicazioni JavaScript e TypeScript, distribuito come un unico eseguibile chiamato `bun`. Al centro c'è un runtime pensato come **sostituto diretto di Node** (*drop-in replacement*), basato su **JavaScriptCore**, il motore di Safari, invece che su V8. Fino alla 1.3 Bun era scritto in Zig, un linguaggio di programmazione di sistema; con la [versione 1.4](https://bun.com/blog/bun-v1.4) (agosto 2026) il codice è stato [riscritto in Rust](https://bun.com/blog/bun-in-rust), e la 1.3.14 è stata l'ultima versione in Zig. La più recente, a ottobre 2026, è la **1.4.3**.

L'argomento principale di Bun è la velocità: la sua documentazione dichiara che [su Linux si avvia circa 4 volte più in fretta di Node](https://bun.com/docs/runtime) e presenta il package manager come un sostituto di npm [«drasticamente più veloce»](https://bun.com/docs/pm/cli/install). Sono misure del produttore, da verificare sul proprio progetto; in un frontend la differenza si sente soprattutto dove si ripetono molti avvii brevi, cioè installazioni, script e test. Lo stesso eseguibile offre anche gli strumenti che in Node sono pacchetti separati:

| Comando | Effetto |
|---|---|
| `bun run index.tsx` | esegue un file JavaScript, TypeScript o JSX, senza configurazione |
| `bun run dev` | esegue lo script `dev` del `package.json` |
| `bun install` | installa le dipendenze del `package.json` in `node_modules` (lockfile testuale `bun.lock`) |
| `bun test` | esegue i test con un runner compatibile con l'API di Jest |
| `bun build ./index.tsx --outdir ./out` | crea il bundle per il browser (con `--target` anche per Bun o per Node) |
| `bunx vite` | esegue il comando di un pacchetto, come `npx` |
| `bun check` | controlla i tipi del progetto |

Come Deno e Node, Bun [esegue TypeScript senza controllare i tipi](https://bun.com/docs/typescript) e rimanda a `bun check` per il controllo. Per le dipendenze legge il normale `package.json`, quindi può affiancare Node in un progetto esistente anche solo come package manager (il confronto con npm, pnpm e Yarn è nel [[03-package-manager|capitolo 03]]). E anche Bun, come Deno, [non esegue gli script di ciclo di vita delle dipendenze](https://bun.com/docs/pm/cli/install): i pacchetti autorizzati si elencano nel campo `trustedDependencies` del `package.json`.

Sulla compatibilità l'obiettivo è dichiarato senza giri di parole: [«se un pacchetto funziona in Node ma non in Bun, lo consideriamo un bug di Bun»](https://bun.com/docs/runtime/nodejs-compat). La pagina di stato elenca la maggior parte dei moduli `node:` come implementati per intero (`node:fs`, `node:http`, `node:path`, `node:stream`…), alcuni come parziali (`node:child_process`, `node:crypto`, `node:worker_threads`, `node:cluster`…) e `node:sea` come non implementato. Gli addon nativi Node-API sono [supportati](https://bun.com/docs/runtime/node-api): Bun ha reimplementato l'interfaccia da zero e la maggior parte delle estensioni esistenti funziona senza modifiche. Bun non ha invece un modello di permessi a runtime: come Node senza `--permission`, un programma può fare tutto ciò che può fare l'utente che lo lancia.

> [!tip]
> Molti strumenti del frontend sono pacchetti npm il cui eseguibile comincia con la riga `#!/usr/bin/env node`, lo *shebang*, che indica al sistema con quale programma aprirlo. [`bunx` la rispetta](https://bun.com/docs/pm/bunx) e li lancia comunque con Node; per farli girare sul runtime di Bun si aggiunge `--bun` prima del nome del comando: `bunx --bun vite`.

## Runtime edge: isolate invece di processi

*➕ Fuori dall'indice del libro, che fra i runtime alternativi tratta Deno e Bun: i runtime edge sono oggi il terzo grande ambiente in cui gira JavaScript lato server.*

L'**edge** (letteralmente il «bordo» della rete) è l'insieme dei server di una rete distribuita più vicini agli utenti, gli stessi che in una CDN consegnano i file statici (la CDN è descritta nel <a href="../glossario/#/docs/rendering-web?id=ssg-static-site-generation" target="_blank" rel="noopener">glossario alla voce sull'SSG</a>). Un **runtime edge** permette di eseguire su quei server anche del codice: piccole funzioni che ricevono una richiesta HTTP e restituiscono una risposta, per esempio un reindirizzamento, un controllo di autenticazione o una pagina personalizzata, nel punto della rete più vicino a chi la chiede.

Per farlo su moltissimi server e per moltissimi clienti diversi non si può avviare un processo Node per ogni applicazione. Cloudflare Workers, il caso più noto, usa un modello diverso, descritto nella [documentazione ufficiale](https://developers.cloudflare.com/workers/reference/how-workers-works/): un solo processo del runtime ospita **centinaia o migliaia di isolate**. Un **isolate** è un contesto di esecuzione leggero creato da V8, con una memoria completamente separata da quella degli altri, anche se vive nello stesso processo. Poiché il runtime è già acceso, un isolate parte, secondo Cloudflare, circa cento volte più in fretta di un processo Node in un container o in una macchina virtuale, e all'avvio consuma un ordine di grandezza meno memoria.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 680 280" role="img" aria-label="Confronto fra due modelli: a sinistra un processo per applicazione, tre riquadri ciascuno con un runtime intero e il codice di un'applicazione; a destra un solo processo del runtime V8 che contiene sei isolate, ciascuno con il codice di un'applicazione diversa" style="width:100%;max-width:680px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="170" y="28" font-size="12.5" text-anchor="middle" font-weight="700">un processo per applicazione</text><text x="510" y="28" font-size="12.5" text-anchor="middle" font-weight="700">un processo, tanti isolate</text><rect x="30" y="44" width="280" height="58" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><rect x="44" y="55" width="124" height="36" rx="6" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.3"/><text x="106" y="77" font-size="11" text-anchor="middle">runtime intero</text><rect x="178" y="55" width="118" height="36" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="237" y="77" font-size="11.5" text-anchor="middle" font-weight="700">app A</text><rect x="30" y="112" width="280" height="58" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><rect x="44" y="123" width="124" height="36" rx="6" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.3"/><text x="106" y="145" font-size="11" text-anchor="middle">runtime intero</text><rect x="178" y="123" width="118" height="36" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="237" y="145" font-size="11.5" text-anchor="middle" font-weight="700">app B</text><rect x="30" y="180" width="280" height="58" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><rect x="44" y="191" width="124" height="36" rx="6" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.3"/><text x="106" y="213" font-size="11" text-anchor="middle">runtime intero</text><rect x="178" y="191" width="118" height="36" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="237" y="213" font-size="11.5" text-anchor="middle" font-weight="700">app C</text><text x="170" y="262" font-size="10.5" text-anchor="middle" opacity=".75">ogni avvio carica un runtime completo</text><rect x="370" y="44" width="280" height="194" rx="12" fill="var(--link,#5fa04e)" fill-opacity=".08" stroke="currentColor" stroke-width="1.8"/><text x="510" y="66" font-size="11.5" text-anchor="middle" font-weight="700">runtime con V8, già acceso</text><rect x="386" y="80" width="78" height="62" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="425" y="103" font-size="9.5" text-anchor="middle" opacity=".7">isolate</text><text x="425" y="124" font-size="11.5" text-anchor="middle" font-weight="700">app A</text><rect x="471" y="80" width="78" height="62" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="510" y="103" font-size="9.5" text-anchor="middle" opacity=".7">isolate</text><text x="510" y="124" font-size="11.5" text-anchor="middle" font-weight="700">app B</text><rect x="556" y="80" width="78" height="62" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="595" y="103" font-size="9.5" text-anchor="middle" opacity=".7">isolate</text><text x="595" y="124" font-size="11.5" text-anchor="middle" font-weight="700">app C</text><rect x="386" y="156" width="78" height="62" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="425" y="179" font-size="9.5" text-anchor="middle" opacity=".7">isolate</text><text x="425" y="200" font-size="11.5" text-anchor="middle" font-weight="700">app D</text><rect x="471" y="156" width="78" height="62" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="510" y="179" font-size="9.5" text-anchor="middle" opacity=".7">isolate</text><text x="510" y="200" font-size="11.5" text-anchor="middle" font-weight="700">app E</text><rect x="556" y="156" width="78" height="62" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3"/><text x="595" y="179" font-size="9.5" text-anchor="middle" opacity=".7">isolate</text><text x="595" y="200" font-size="11.5" text-anchor="middle" font-weight="700">app F</text><text x="510" y="262" font-size="10.5" text-anchor="middle" opacity=".75">memoria separata, avvio molto più rapido</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">A sinistra il modello classico: ogni applicazione ha il proprio processo, spesso dentro un container, con un <strong>runtime intero</strong> da avviare e da tenere in memoria. A destra il modello dei runtime edge: un solo processo, con il runtime già acceso, ospita molti <strong>isolate</strong>, contesti di V8 con memoria separata, ciascuno con il codice di un cliente diverso.</figcaption>
</figure>

Il prezzo di questa leggerezza è un ambiente più ristretto. Ogni isolate ha [limiti stretti](https://developers.cloudflare.com/workers/platform/limits/), come 128 MB di memoria e, nel piano gratuito, 10 millisecondi di CPU per richiesta; e non c'è un disco vero: il `node:fs` dei Workers è un [file system virtuale in memoria](https://developers.cloudflare.com/workers/runtime-apis/nodejs/fs/), con una cartella `/tmp` che dura il tempo di una singola richiesta. Le API di partenza sono quelle del web, e un Worker ha la forma di un gestore di richieste che riceve un `Request` e restituisce un `Response`:

```js
export default {
  async fetch(request, env, ctx) {
    return new Response('Ciao dal Worker!');
  },
};
```

Il runtime che esegue i Workers è open source con il nome di [`workerd`](https://github.com/cloudflare/workerd), scritto in C++, e un Worker si prova in locale con `npx wrangler dev`. Verso le API di Node la piattaforma si è aperta gradualmente: con il flag di compatibilità `nodejs_compat` sono disponibili `Buffer`, `node:crypto`, `node:stream` e molti altri moduli, alcuni sono solo segnaposto che si importano ma non funzionano (come `node:child_process`), e per i progetti con *compatibility date* (la data che fissa la versione del comportamento della piattaforma) dal 2026-08-04 la [compatibilità con Node è attiva di default](https://developers.cloudflare.com/workers/runtime-apis/nodejs/).

Gli altri fornitori seguono lo stesso schema, con varianti. Le [Edge Functions di Netlify](https://docs.netlify.com/build/edge-functions/overview/) girano su un runtime basato su Deno. L'[Edge runtime di Vercel](https://vercel.com/docs/functions/runtimes/edge) è costruito su V8 con ambienti isolati, offre un sottoinsieme delle API web e non permette di leggere o scrivere file, né di usare `eval()` o `require()`; oggi però Vercel stessa raccomanda di passare alle funzioni Node per prestazioni e affidabilità, e da Next.js 16.3 l'opzione `runtime = 'edge'` non è più supportata. L'edge resta lo strumento giusto per logica piccola e vicina all'utente, non un sostituto generale del server.

## WinterTC: la API minima comune

*➕ Fuori dall'indice del libro: lo standard è del 2025, successivo all'edizione del libro.*

Con tanti runtime diversi, il rischio è che ognuno inventi la propria versione delle stesse cose e che una libreria vada riscritta per ciascuno. Per evitarlo, nel maggio 2022 è nato **WinterCG**, un *Community Group* del W3C che riuniva chi sviluppa questi runtime. Un Community Group, però, non può pubblicare standard, e così a dicembre 2024 il lavoro è passato a un comitato tecnico di Ecma International, l'ente che pubblica anche lo standard di JavaScript: il **TC55**, chiamato informalmente **WinterTC** (*Technical Committee on Web-interoperable Server Runtimes*). Secondo le [FAQ ufficiali](https://wintertc.org/faq), vi partecipano oggi membri di Bloomberg, Cloudflare, Deno, Igalia e Node.js.

Il primo risultato è lo standard [**ECMA-429**](https://ecma-international.org/publications-and-standards/standards/ecma-429/), *Minimum common web API*, prima edizione di dicembre 2025. Definisce la **API minima comune**: un [sottoinsieme delle API della piattaforma web](https://min-common-api.proposal.wintertc.org/) che ogni runtime lato server «interoperabile con il web» dovrebbe esporre sull'oggetto globale, con lo stesso comportamento che hanno nel browser. Lo standard non introduce API nuove: è una selezione di API già definite dagli enti che scrivono gli standard del web, limitata alle parti che hanno senso anche senza una pagina. Per chi scrive codice la promessa è che ciò che usa solo queste API funzioni ovunque, browser compreso.

| Ambito | API comprese (estratto) |
|---|---|
| Rete | `fetch`, `Request`, `Response`, `Headers`, `FormData` |
| URL | `URL`, `URLSearchParams`, `URLPattern` |
| Testo e dati binari | `TextEncoder`, `TextDecoder`, `Blob`, `File`, `atob`, `btoa` |
| Stream | `ReadableStream`, `WritableStream`, `TransformStream`, `CompressionStream` |
| Crittografia | `crypto`, `SubtleCrypto`, `CryptoKey` |
| Eventi e annullamento | `EventTarget`, `Event`, `AbortController`, `AbortSignal` |
| Tempo e utilità | `setTimeout`, `setInterval`, `queueMicrotask`, `structuredClone`, `performance`, `console` |
| WebAssembly | `WebAssembly.instantiate`, `WebAssembly.Module` e il resto dell'API (trattata nel [[10-webassembly|capitolo 10]]) |

Avere uno standard non significa che ogni runtime lo implementi già alla perfezione. In Node 24, per esempio, `URLPattern` è globale ma ancora [sperimentale](https://nodejs.org/docs/latest-v24.x/api/globals.html#urlpattern).

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 660 310" role="img" aria-label="Due insiemi sovrapposti: a sinistra la piattaforma web del browser, con DOM, document, window e history; a destra i runtime server, con file, processi, socket e le API proprie node:*, Deno.* e Bun.*; nell'intersezione la API minima comune con fetch, URL, Web Crypto, Streams e TextEncoder, standardizzata da ECMA-429" style="width:100%;max-width:660px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><circle cx="255" cy="150" r="130" fill="var(--link,#5fa04e)" fill-opacity=".1" stroke="currentColor" stroke-width="1.6"/><circle cx="405" cy="150" r="130" fill="var(--link,#5fa04e)" fill-opacity=".1" stroke="currentColor" stroke-width="1.6"/><text x="198" y="126" font-size="12.5" text-anchor="middle" font-weight="700">browser</text><text x="198" y="150" font-size="10.5" text-anchor="middle" opacity=".85">DOM · document</text><text x="198" y="168" font-size="10.5" text-anchor="middle" opacity=".85">window · history</text><text x="462" y="126" font-size="12.5" text-anchor="middle" font-weight="700">runtime server</text><text x="462" y="150" font-size="10.5" text-anchor="middle" opacity=".85">file · processi · socket</text><text x="462" y="168" font-size="9.5" text-anchor="middle" opacity=".85" font-family="ui-monospace,Menlo,monospace">node:* Deno.* Bun.*</text><text x="330" y="96" font-size="11.5" text-anchor="middle" font-weight="700">API minima</text><text x="330" y="111" font-size="11.5" text-anchor="middle" font-weight="700">comune</text><text x="330" y="136" font-size="10" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">fetch</text><text x="330" y="152" font-size="10" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">URL</text><text x="330" y="168" font-size="10.5" text-anchor="middle">Web Crypto</text><text x="330" y="184" font-size="10.5" text-anchor="middle">Streams</text><text x="330" y="200" font-size="10" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">TextEncoder</text><line x1="330" y1="262" x2="330" y2="282" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/><text x="330" y="298" font-size="10.5" text-anchor="middle" opacity=".8">l'intersezione è lo standard ECMA-429</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">La <strong>API minima comune</strong> è l'intersezione fra due mondi: le API della piattaforma web che hanno senso anche su un server. Restano fuori, a sinistra, ciò che serve solo a una pagina (DOM, <code>window</code>, la cronologia di navigazione) e, a destra, ciò che serve solo a un server, comprese le API proprie di ciascun runtime.</figcaption>
</figure>

## La compatibilità in pratica

La regola pratica discende direttamente dalla figura: più il codice si appoggia agli ES modules e alla API minima comune, più viaggia da un runtime all'altro; più usa API proprie di un runtime, più resta legato a quello. La funzione seguente calcola l'impronta SHA-256 di un testo (un *hash*, cioè una sorta di firma di lunghezza fissa del contenuto) usando solo `TextEncoder` e `crypto.subtle`, entrambi nella API minima comune (la differenza fra hash e cifratura è nel <a href="../glossario/#/docs/crittografia?id=codifica-hash-e-cifratura-tre-cose-diverse" target="_blank" rel="noopener">glossario alla voce sulla crittografia</a>): gira identica nel browser, in Node 24, in Deno, in Bun e in un Worker.

```js
// hash.js: solo API della piattaforma web
export async function sha256(testo) {
  const dati = new TextEncoder().encode(testo);
  const digest = await crypto.subtle.digest('SHA-256', dati);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
```

Lo stesso vale, a livello di forma, per un piccolo server. Deno, Bun e Cloudflare Workers accettano tutti un modulo che esporta di default un oggetto con un metodo `fetch`, che riceve un `Request` e restituisce un `Response`: Deno lo avvia con [`deno serve`](https://docs.deno.com/runtime/reference/cli/serve/), Bun [lo passa da solo a `Bun.serve`](https://bun.com/docs/runtime/http/server) quando lo trova nel file, i Workers hanno esattamente questa forma.

```js
// server.js
export default {
  fetch(request) {
    const url = new URL(request.url);
    return Response.json({ percorso: url.pathname });
  },
};
```

| Runtime | Comando |
|---|---|
| Deno | `deno serve server.js` (il permesso di rete per la porta è concesso in automatico) |
| Bun | `bun run server.js` |
| Cloudflare Workers | `npx wrangler dev`, con il file indicato nella configurazione di Wrangler |

Node è l'eccezione: il suo `node:http` lavora con oggetti propri (`IncomingMessage` per la richiesta, `ServerResponse` per la risposta), non con `Request` e `Response`, e per usare la stessa forma serve una libreria che faccia da adattatore. Ciò che invece di solito **non** viaggia:

- **le API specifiche di Node** come `node:child_process`, `node:worker_threads` o un file system reale: Deno e Bun le offrono attraverso i loro strati di compatibilità, mentre i runtime edge non le hanno o le offrono solo come segnaposto (e il file system solo in memoria);
- **gli addon nativi** (file `.node` scritti in C o C++): Bun ne supporta la maggior parte, Deno solo con `node_modules` locale e `--allow-ffi`, mentre sull'edge si eseguono solo JavaScript e WebAssembly;
- **i globali di un singolo runtime**, come `Deno.*` e `Bun.*`, e su alcune piattaforme edge anche `require()` ed `eval()`;
- **gli script di installazione** dei pacchetti, come `postinstall`, che Deno e Bun non eseguono senza un'autorizzazione esplicita: un pacchetto che li usa per scaricare un binario può sembrare installato e poi non funzionare.

> [!info|label:Nel repo]
> `scripts/sync-setup.mjs` mostra bene il confine. La parte crittografica (`subtle.deriveKey()` e `subtle.encrypt()` di Web Crypto, con `TextEncoder`) e la verifica del token con `fetch()` usano API della piattaforma web, quindi appartengono al minimo comune; la scrittura di `sync.json` con `writeFile()`, la lettura dal terminale con `process.stdin`, le variabili d'ambiente di `process.env` e `Buffer` sono invece API di Node. Deno e Bun offrono queste ultime attraverso i loro strati di compatibilità (in Deno concedendo esplicitamente rete, file e variabili d'ambiente), mentre su un runtime edge uno script del genere non avrebbe senso: non c'è un terminale da cui leggere né un disco su cui salvare.

## Node, Deno, Bun ed edge a confronto

| | Node.js 24 | Deno 2.9 | Bun 1.4 | Edge (Cloudflare Workers) |
|---|---|---|---|---|
| Motore | V8 | V8 | JavaScriptCore | V8, con un isolate per applicazione |
| Scritto in | C++ e JavaScript | Rust | Rust (Zig fino alla 1.3) | C++ (`workerd`) |
| TypeScript | toglie i tipi senza controllarli (stabile da 24.12), solo la sintassi che si può cancellare: niente `enum` | nativo; controllo con `deno check` | nativo; controllo con `bun check` | di prima classe; Wrangler crea il bundle con esbuild |
| Package manager | npm incluso; pnpm e Yarn a parte | `deno install`, `deno add`, specificatori `npm:` | `bun install`, compatibile con `package.json` | quello del progetto; si pubblica un bundle |
| Permessi | opzionali con `--permission`; rete esclusa in Node 24 | sandbox di default, flag `--allow-*` | nessun modello di permessi a runtime | isolamento della piattaforma; nessun disco reale |
| API di Node | complete | ampio strato di compatibilità | obiettivo: sostituto diretto | parziali, con `nodejs_compat` |
| Supporto | LTS: Node 24 fino al 2028-04-30 | LTS: linea 2.9 fino al 2027-01-31 | rilasci frequenti, nessun canale LTS | servizio gestito, comportamento fissato dalla *compatibility date* |

Per un progetto di lavoro la riga decisiva è spesso l'ultima. Il [calendario ufficiale di Node](https://github.com/nodejs/Release) garantisce a ogni versione pari, da quando entra in LTS, dodici mesi di supporto attivo e diciotto di manutenzione, e su questa promessa si appoggia tutto l'ecosistema; il canale LTS di Deno copre una linea per circa sei mesi; Bun pubblica [nuove versioni a ritmo serrato](https://github.com/oven-sh/bun/releases) e chiede di seguire l'ultima.

## Quando conviene un runtime alternativo

Per il cuore di un progetto frontend, cioè dev server, build e test, **Node resta la scelta predefinita**. Gli strumenti del frontend nascono come pacchetti npm pensati per Node, e la loro documentazione indica come requisito una versione di Node: quella di Vite, per esempio, [richiede Node 20.19+ o 22.12+](https://vite.dev/guide/), anche se elenca fra i comandi per creare un progetto pure `bun create vite` e `deno init --npm vite`. Node ha il supporto più lungo e la compatibilità completa con i pacchetti npm, compresi quelli con addon nativi o script di installazione. Cambiare runtime per l'intero progetto ha senso solo se il guadagno è misurato e se tutta la catena di strumenti lo regge.

**Bun** conviene soprattutto come acceleratore, introdotto un pezzo alla volta: `bun install` al posto di npm per installazioni più rapide, `bun run` per gli script, `bun test` per una suite di test compatibile con Jest, e `bunx --bun` per provare uno strumento sul suo runtime. Il rischio da tenere d'occhio sono le API di Node implementate solo in parte: se qualcosa si rompe, Node è sempre lì come ripiego. **Deno** dà il meglio negli **script autonomi**: un file TypeScript che si esegue senza configurazione, con permessi che dicono esattamente che cosa può toccare (una cartella, un host), formattato e analizzato dagli strumenti integrati, e distribuibile come eseguibile unico con `deno compile`. È anche il runtime sotto le Edge Functions di Netlify.

I **runtime edge** entrano in gioco al momento del deploy, quando una parte della logica (reindirizzamenti, controlli di accesso, personalizzazione, piccole API) trae vantaggio dal girare vicino all'utente. Lì conviene scrivere contro la API minima comune fin dall'inizio, evitando le API di Node, così lo stesso codice resta spostabile fra fornitori e runtime; e conviene ricordare che non è una scelta sempre migliore, come mostra il passo indietro di Vercel verso le funzioni Node.

> [!tip]
> Un runtime è motore più API più event loop più caricatore di moduli: il linguaggio è lo stesso ovunque, le API no. Node resta il riferimento per il tooling, Deno porta sicurezza e TypeScript senza configurazione, Bun porta velocità e strumenti in un solo eseguibile, l'edge porta il codice vicino all'utente. Il codice scritto sulla API minima comune di WinterTC viaggia fra tutti.

## Ripasso lampo

<details>
<summary>Se il linguaggio è lo stesso, che cosa cambia davvero fra Node, Deno e Bun?</summary>

Cambiano le parti attorno al linguaggio: le **API** disponibili (`node:*`, `Deno.*`, `Bun.*`, più quelle web comuni), il **nucleo** che gestisce event loop e I/O (libuv, Tokio, il nucleo di Bun), gli strumenti inclusi e in parte il **motore**, che è V8 per Node e Deno e JavaScriptCore per Bun. La specifica ECMAScript garantisce che il linguaggio si comporti allo stesso modo ovunque.

</details>

<details>
<summary>Che cosa succede se uno script Deno chiama <code>fetch()</code> senza <code>--allow-net</code>?</summary>

L'operazione non è concessa: in un terminale interattivo Deno si ferma e chiede se permetterla; altrimenti, o con `--no-prompt`, fallisce con un errore `NotCapable` che indica il flag da aggiungere. Il permesso si può limitare a un host preciso, per esempio `--allow-net=api.github.com`.

</details>

<details>
<summary>In che cosa il modello a permessi di Node 24 differisce dalla sandbox di Deno?</summary>

In Node è opzionale (si attiva con `--permission`), mentre in Deno la sandbox è attiva di default. In Node 24 non copre la rete (`--allow-net` arriva con Node 25) e la documentazione lo descrive come una «cintura di sicurezza» contro gli errori del codice fidato, non come una protezione da codice malevolo.

</details>

<details>
<summary>Perché una funzione su Cloudflare Workers parte molto più in fretta di un server Node in un container?</summary>

Perché non avvia un processo né un runtime: il processo con V8 è già acceso e ospita centinaia o migliaia di **isolate**, contesti leggeri con memoria separata. Creare un isolate costa molto meno che avviare un processo Node; in cambio l'ambiente è ristretto (limiti di memoria e CPU, niente disco reale, API di Node parziali).

</details>

<details>
<summary>Che cos'è la «API minima comune» di WinterTC e perché conviene scrivere codice che la usa?</summary>

È lo standard ECMA-429 (dicembre 2025) del comitato TC55 di Ecma, detto WinterTC: un sottoinsieme di API della piattaforma web, come `fetch`, `URL`, `TextEncoder`, gli stream e Web Crypto, che i runtime lato server dovrebbero offrire con lo stesso comportamento del browser. Il codice che si limita a queste API gira senza modifiche nel browser, in Node, in Deno, in Bun e sulle piattaforme edge.

</details>
