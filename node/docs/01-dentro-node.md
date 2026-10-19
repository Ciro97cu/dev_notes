# 01 · Dentro Node.js

**Node.js** è un *runtime* JavaScript, cioè un programma che esegue codice JavaScript **fuori dal browser**: sul proprio computer, su un server, dentro uno script lanciato dal terminale. Nato nel 2009, è il motivo per cui oggi lo stesso linguaggio delle pagine web serve anche a scrivere programmi da riga di comando. Per chi fa frontend è una presenza costante anche quando non lo si nomina: il dev server, il bundler, i test, il linter e il package manager sono tutti programmi scritti in JavaScript che girano su Node, mentre il codice dell'applicazione finirà nel browser. Capire com'è fatto dentro spiega molti comportamenti che altrimenti restano oscuri, a partire dalla sua caratteristica più famosa: fare molte cose insieme con un solo thread.

## Stesso linguaggio, ambiente diverso

Il JavaScript che Node esegue è lo stesso del browser, ma l'**ambiente** che lo circonda è un altro, e la [documentazione ufficiale](https://nodejs.org/en/learn/getting-started/differences-between-nodejs-and-the-browser) riassume le differenze in pochi punti. Nel browser il codice vive dentro una pagina: ha il DOM, `window`, `document`, i cookie, e non può toccare i file del computer. In Node non c'è nessuna pagina, quindi niente DOM né `window`; in cambio ci sono le API che il browser non concede, come la lettura e la scrittura di file, l'avvio di altri processi, l'apertura di connessioni di rete come server.

C'è poi una differenza di controllo. Nel browser non si sceglie con quale motore verrà eseguito il codice: ogni visitatore ha il suo. In Node, invece, la versione la decide chi esegue il programma, e quindi si può usare tutto il JavaScript moderno che quella versione supporta senza preoccuparsi della compatibilità.

| | Browser | Node.js |
|---|---|---|
| Oggetto globale | `window` (e `globalThis`) | `globalThis` (niente `window`) |
| Pagina e DOM | sì: `document`, eventi, rendering | no |
| File del computer | no (solo tramite input dell'utente) | sì: `node:fs` |
| Processo e ambiente | no | sì: `process` (argomenti, variabili d'ambiente, uscita) |
| Versione del motore | la sceglie il visitatore | la sceglie chi esegue il programma |
| Moduli | ES modules (`import`) | ES modules e CommonJS (`require`), vedi [[02-moduli-e-pacchetti]] |

## Com'è fatto: V8, libuv e le API

Node è costruito a **strati**, e ognuno ha un compito preciso.

Alla base c'è il **sistema operativo**, l'unico che sa davvero leggere un file o aprire una connessione. Sopra stanno i due motori di Node. Il primo è **V8**, il motore JavaScript di Google, lo stesso di Chrome: legge il codice JavaScript e lo [compila al volo in codice macchina](https://nodejs.org/en/learn/getting-started/the-v8-javascript-engine) mentre il programma gira (*compilazione JIT*, *just-in-time*). V8 però sa soltanto eseguire JavaScript: non sa nulla di file o di rete. Questo compito spetta al secondo motore, **libuv**, una libreria scritta in C che offre l'**event loop** e un modo uniforme di fare operazioni di input/output (I/O) su macOS, Linux e Windows, nascondendo le differenze fra i sistemi.

Fra i motori e il codice dell'utente stanno le **API di Node**: i moduli integrati come `node:fs`, `node:path`, `node:http`, `node:crypto`. Sono in parte scritti in JavaScript e in parte in C++ (i *binding*), che fanno da ponte verso V8 e libuv. Quando uno script chiama `readFile()`, la richiesta scende lungo questi strati fino al sistema operativo e il risultato risale fino al codice.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 640 300" role="img" aria-label="Architettura di Node.js a strati: in cima il tuo codice JavaScript, sotto le API di Node come node:fs e node:http, sotto i binding C++, poi affiancati V8 che esegue il JavaScript e libuv con event loop, I/O asincrono e thread pool, alla base il sistema operativo" style="width:100%;max-width:640px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="70" y="20" width="500" height="44" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="320" y="40" font-size="12.5" text-anchor="middle" font-weight="700">il tuo codice JavaScript</text><text x="320" y="55" font-size="10.5" text-anchor="middle" opacity=".75">script, dev server, bundler, test…</text><rect x="70" y="76" width="500" height="44" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".1" stroke="currentColor" stroke-width="1.6"/><text x="320" y="96" font-size="12.5" text-anchor="middle" font-weight="700">API di Node</text><text x="320" y="111" font-size="10.5" text-anchor="middle" opacity=".75" font-family="ui-monospace,Menlo,monospace">node:fs · node:path · node:http · node:crypto…</text><rect x="70" y="132" width="500" height="34" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 3"/><text x="320" y="154" font-size="11.5" text-anchor="middle">binding C++ (il ponte verso i motori)</text><rect x="70" y="178" width="240" height="58" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8"/><text x="190" y="202" font-size="13" text-anchor="middle" font-weight="700">V8</text><text x="190" y="221" font-size="10.5" text-anchor="middle" opacity=".8">esegue il JavaScript (JIT)</text><rect x="330" y="178" width="240" height="58" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8"/><text x="450" y="202" font-size="13" text-anchor="middle" font-weight="700">libuv</text><text x="450" y="221" font-size="10.5" text-anchor="middle" opacity=".8">event loop · I/O · thread pool</text><rect x="70" y="248" width="500" height="36" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="320" y="271" font-size="12" text-anchor="middle" font-weight="700">sistema operativo (file, rete, processi)</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Gli strati di Node. Il codice parla con le <strong>API di Node</strong>; sotto, <strong>V8</strong> esegue il JavaScript e <strong>libuv</strong> si occupa di event loop e input/output, e solo il <strong>sistema operativo</strong> tocca davvero file e rete. È lo stesso V8 di Chrome: ciò che cambia rispetto al browser sono gli strati intorno.</figcaption>
</figure>

## Un solo thread per il JavaScript

Un *thread* è una linea di esecuzione: una sequenza di istruzioni che il processore porta avanti una dopo l'altra. In Node **tutto il JavaScript gira su un unico thread**, il *thread principale*: mentre una funzione è in esecuzione, nessun'altra riga di JavaScript del programma può partire. È lo stesso modello del browser, ed è il motivo per cui un ciclo infinito blocca tutto.

Eppure un server Node gestisce migliaia di richieste contemporaneamente. Ci riesce perché il thread principale **non aspetta** le operazioni lente. Quando il codice chiede di leggere un file o di interrogare un database, Node passa la richiesta a libuv e prosegue subito con altro; quando il risultato è pronto, libuv lo segnala e Node esegue la funzione che doveva gestirlo, la *callback*. L'attesa c'è comunque, ma avviene fuori dal thread del JavaScript, che resta libero. Questo modello si chiama **I/O non bloccante**, e il meccanismo che decide quale callback eseguire e quando è l'event loop.

## L'event loop, giro per giro

L'**event loop** è il ciclo che tiene in vita un programma Node: finché ci sono operazioni in sospeso (un timer, un file in lettura, un server in ascolto), il ciclo continua a girare e, a ogni giro, esegue le callback le cui operazioni sono terminate. Quando non resta più nulla da attendere, il ciclo si ferma e il processo termina da solo: per questo uno script che legge un file e lo stampa finisce appena ha finito, mentre un server resta acceso.

Ogni giro attraversa alcune [fasi](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick), ciascuna con la sua coda di callback:

| Fase | Che cosa esegue |
|---|---|
| **timers** | le callback di `setTimeout()` e `setInterval()` scadute |
| **pending callbacks** | alcune callback di I/O rimandate dal giro precedente |
| **idle, prepare** | uso interno di Node |
| **poll** | recupera i nuovi eventi di I/O ed esegue le loro callback; se non c'è altro da fare, attende qui |
| **check** | le callback di `setImmediate()` |
| **close callbacks** | le callback di chiusura, per esempio `socket.on('close', …)` |

Fra un'operazione e l'altra, prima di passare oltre, Node svuota due code prioritarie: quella di `process.nextTick()`, che la documentazione precisa [non far parte tecnicamente dell'event loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick), e quella delle **Promise** risolte (i *microtask*). È il motivo per cui il codice dopo un `await` riparte prima di qualunque timer, anche di un `setTimeout(…, 0)`.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 680 330" role="img" aria-label="L'event loop come ciclo di sei fasi: timers, pending callbacks, idle e prepare, poll, check, close callbacks; al centro il thread del JavaScript; a destra il thread pool di libuv con quattro thread che svolgono file system, crypto pesante e compressione e consegnano i risultati alla fase poll" style="width:100%;max-width:680px;height:auto;color:inherit"><defs><marker id="n01-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><circle cx="230" cy="165" r="112" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 4" opacity=".5"/><rect x="180" y="20" width="100" height="34" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="230" y="42" font-size="11.5" text-anchor="middle" font-weight="700">timers</text><rect x="318" y="80" width="118" height="34" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="377" y="102" font-size="11" text-anchor="middle">pending callbacks</text><rect x="318" y="216" width="118" height="34" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4" opacity=".75"/><text x="377" y="238" font-size="11" text-anchor="middle">idle, prepare</text><rect x="180" y="276" width="100" height="34" rx="8" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8"/><text x="230" y="298" font-size="11.5" text-anchor="middle" font-weight="700">poll</text><rect x="24" y="216" width="118" height="34" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="83" y="238" font-size="11" text-anchor="middle">check</text><rect x="24" y="80" width="118" height="34" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="83" y="102" font-size="11" text-anchor="middle">close callbacks</text><path d="M282 42 C 330 48, 360 62, 372 76" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#n01-a)"/><path d="M380 116 C 392 150, 392 180, 380 212" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#n01-a)"/><path d="M372 252 C 360 270, 320 288, 284 293" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#n01-a)"/><path d="M178 293 C 140 288, 100 272, 88 254" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#n01-a)"/><path d="M80 214 C 68 180, 68 150, 80 118" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#n01-a)"/><path d="M88 78 C 100 60, 140 46, 176 40" fill="none" stroke="currentColor" stroke-width="1.4" marker-end="url(#n01-a)"/><text x="230" y="160" font-size="12" text-anchor="middle" font-weight="700">thread del</text><text x="230" y="176" font-size="12" text-anchor="middle" font-weight="700">JavaScript</text><text x="230" y="194" font-size="10" text-anchor="middle" opacity=".7">uno solo</text><rect x="490" y="110" width="170" height="150" rx="10" fill="var(--link,#5fa04e)" fill-opacity=".1" stroke="currentColor" stroke-width="1.6"/><text x="575" y="132" font-size="12" text-anchor="middle" font-weight="700">thread pool di libuv</text><rect x="508" y="146" width="62" height="26" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.2"/><text x="539" y="163" font-size="10" text-anchor="middle">thread 1</text><rect x="580" y="146" width="62" height="26" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.2"/><text x="611" y="163" font-size="10" text-anchor="middle">thread 2</text><rect x="508" y="180" width="62" height="26" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.2"/><text x="539" y="197" font-size="10" text-anchor="middle">thread 3</text><rect x="580" y="180" width="62" height="26" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.2"/><text x="611" y="197" font-size="10" text-anchor="middle">thread 4</text><text x="575" y="226" font-size="10" text-anchor="middle" opacity=".8">file system · crypto pesante</text><text x="575" y="241" font-size="10" text-anchor="middle" opacity=".8">compressione · dns.lookup</text><path d="M488 230 C 420 270, 340 292, 284 296" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="5 3" marker-end="url(#n01-a)"/><text x="470" y="286" font-size="10" text-anchor="middle" opacity=".75">risultati pronti</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Il ciclo delle fasi gira attorno all'unico <strong>thread del JavaScript</strong>, che esegue una callback alla volta. Il lavoro lento o pesante (file, hashing, compressione) lo svolge il <strong>thread pool</strong> di libuv, quattro thread per impostazione predefinita, che consegna i risultati: le loro callback vengono poi eseguite nella fase <strong>poll</strong>.</figcaption>
</figure>

## Chi fa il lavoro pesante: il thread pool

Non tutte le operazioni lente si possono delegare al sistema operativo in modo asincrono. Le connessioni di rete sì, ma per i file, spiega la [documentazione di progetto di libuv](https://docs.libuv.org/en/v1.x/design.html), non esistono primitive asincrone su cui contare in modo uniforme fra i sistemi. Per questi casi libuv tiene pronto un **thread pool**, un gruppo di thread di supporto che svolgono il lavoro in parallelo al thread principale. Secondo la [documentazione di libuv](https://docs.libuv.org/en/v1.x/threadpool.html) i thread sono **4** per impostazione predefinita, e il numero si cambia all'avvio con la variabile d'ambiente `UV_THREADPOOL_SIZE`.

Secondo la [guida ufficiale](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop), passano dal thread pool le API asincrone di `node:fs` (tranne gli osservatori di file e le versioni sincrone), `dns.lookup()`, le funzioni di `node:crypto` che richiedono molto calcolo (`pbkdf2()`, `scrypt()`, `randomBytes()`, `generateKeyPair()`) e quelle di `node:zlib` per la compressione. Fra queste c'è PBKDF2, la derivazione di una chiave da una password descritta nel <a href="../glossario/#/docs/crittografia?id=dalla-password-alla-chiave-pbkdf2-salt-e-iterazioni" target="_blank" rel="noopener">glossario alla voce sulla crittografia</a>: è lenta per scelta, e proprio per questo Node la esegue fuori dal thread principale.

## Bloccante e non bloccante

Quasi ogni operazione di I/O di Node esiste in due versioni, e la differenza è la stessa vista sopra. La versione **sincrona**, riconoscibile dal suffisso `Sync`, **blocca** il thread principale finché l'operazione non è finita; la versione **asincrona** la avvia, lascia libero il thread e restituisce il risultato più tardi, oggi sotto forma di **Promise** da attendere con `await`.

```js
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

const a = readFileSync('dati.json', 'utf8');      // blocca finché il file non è letto
const b = await readFile('dati.json', 'utf8');    // non blocca: il thread resta libero durante la lettura
```

La scelta dipende dal contesto. In un **server**, una chiamata sincrona dentro la gestione di una richiesta ferma tutte le altre richieste per il tempo dell'operazione, quindi si usa sempre la versione asincrona. In uno **script** che fa una cosa sola, all'avvio o da riga di comando, non c'è nient'altro da servire nel frattempo, e la versione sincrona è accettabile: rende il codice più lineare senza costi reali.

> [!info|label:Legacy]
> Prima delle Promise, l'unica forma asincrona era quella a **callback**: `fs.readFile('dati.json', 'utf8', (err, testo) => { … })`, con l'eventuale errore come primo argomento. È ancora supportata e la si incontra in molto codice esistente, ma per il codice nuovo la strada è `node:fs/promises` con `await`, che evita l'annidamento delle callback e gestisce gli errori con un normale `try`/`catch`.

> [!info|label:Nel repo]
> Lo script `scripts/sync-setup.mjs` di questo progetto è scritto tutto in forma asincrona: `await fetch()` per chiedere a GitHub se il token è valido e `await writeFile()` da `node:fs/promises` per salvare il risultato. Mentre aspetta la risposta di rete il thread principale resta libero, anche se in uno script così piccolo non ha altro da fare.

> [!tip]
> Il JavaScript di Node gira su un solo thread, quindi le operazioni lente si **delegano**: le API asincrone affidano l'attesa a libuv (e, dove serve, al suo thread pool), e l'event loop riprende la callback o la Promise quando il risultato è pronto.

## Ripasso lampo

<details>
<summary>Che differenza c'è fra V8 e libuv?</summary>

V8 è il motore che **esegue il JavaScript**, compilandolo in codice macchina mentre il programma gira; è lo stesso di Chrome. libuv è la libreria in C che offre l'**event loop** e l'I/O asincrono (file, rete) in modo uniforme sui diversi sistemi operativi, più il thread pool. V8 da solo non saprebbe leggere un file.

</details>

<details>
<summary>Se il JavaScript di Node gira su un solo thread, come fa un server a gestire molte richieste insieme?</summary>

Perché il thread principale non aspetta le operazioni lente: le passa a libuv (rete al sistema operativo, file e calcoli pesanti al thread pool) e intanto esegue altro. Quando un'operazione termina, l'event loop esegue la sua callback. L'attesa avviene fuori dal thread del JavaScript.

</details>

<details>
<summary>Quando termina da solo un processo Node?</summary>

Quando l'event loop non ha più nulla da attendere: nessun timer attivo, nessuna operazione di I/O in corso, nessun server in ascolto. Per questo uno script finisce appena ha fatto il suo lavoro, mentre un server resta acceso.

</details>

<details>
<summary>Perché <code>readFileSync()</code> va evitato in un server ma è accettabile in uno script?</summary>

Perché blocca il thread principale fino alla fine della lettura. In un server, mentre è bloccato non può rispondere a nessun'altra richiesta. In uno script che fa una cosa sola non c'è nient'altro da servire nel frattempo, quindi il blocco non costa nulla e il codice resta più lineare.

</details>

<details>
<summary>Quali operazioni passano dal thread pool di libuv, e quanti thread ha?</summary>

Le API asincrone di `node:fs`, `dns.lookup()`, le funzioni pesanti di `node:crypto` (`pbkdf2()`, `scrypt()`, `randomBytes()`, `generateKeyPair()`) e la compressione di `node:zlib`. I thread sono 4 per impostazione predefinita, modificabili all'avvio con `UV_THREADPOOL_SIZE`.

</details>
