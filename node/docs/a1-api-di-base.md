# ➕ Le API di base: file, percorsi, processo

Le **API di base** di Node sono quei pochi moduli integrati che compaiono in quasi ogni script: `node:fs` per leggere e scrivere file e cartelle, `node:path` e `node:url` per costruire i percorsi che portano a quei file, e l'oggetto `process`, che rappresenta il programma in esecuzione e permette di leggere gli argomenti della riga di comando e le variabili d'ambiente, di scrivere sul terminale e di chiudere segnalando successo o errore. Con questi strumenti sono scritti gli script di build, i generatori di file e i piccoli programmi di servizio che popolano la cartella `scripts/` di tanti progetti frontend. Chi li riconosce può aprire uno di quei file e seguirlo dall'inizio alla fine: il capitolo li presenta uno per uno e chiude leggendo riga per riga uno script vero di questo repository.

*➕ Fuori dall'indice del libro: questo capitolo non corrisponde a nessun capitolo di «Modern Frontend Development with Node.js», ma raccoglie le API su cui poggiano gli esempi degli altri. Moduli, prefisso `node:` e `import.meta` sono spiegati nel [[02-moduli-e-pacchetti|capitolo 02]] e qui si danno per noti.*

## Leggere e scrivere file: `node:fs/promises`

Il modulo `node:fs` (da *file system*, il sistema che organizza file e cartelle sul disco) offre tutte le operazioni sui file; il suo punto d'ingresso `node:fs/promises` le espone in forma di Promise, da attendere con `await`, ed è quello da usare nel codice nuovo (le altre forme sono descritte nel [[02-moduli-e-pacchetti#i-moduli-integrati-e-il-prefisso-node|capitolo 02]]). Le due funzioni che si incontrano più spesso sono `readFile()`, che legge un file intero, e `writeFile()`, che lo scrive.

`readFile()` restituisce il contenuto in due forme diverse, a seconda che si indichi o no una **codifica** (*encoding*), cioè la regola che traduce i byte del file in caratteri. Senza codifica, [la Promise si risolve con un `Buffer`](https://nodejs.org/api/fs.html#fspromisesreadfilepath-options): una sequenza di byte grezzi, rappresentata da una classe di Node che [estende `Uint8Array`](https://nodejs.org/api/buffer.html#buffer), l'array di byte che esiste anche nel browser. Con `'utf8'` come secondo argomento si ottiene invece una stringa. La regola pratica segue la natura del file: i file di testo (JSON, Markdown, HTML, CSS, JavaScript) si leggono con `'utf8'`, quelli binari (immagini, font, archivi) senza codifica, come `Buffer`. Per un file JSON serve un passaggio in più, perché `readFile()` restituisce il testo e la conversione in oggetto spetta a `JSON.parse()`.

`writeFile()` fa il percorso inverso: accetta una stringa, che codifica in UTF-8 per impostazione predefinita, oppure un `Buffer`, e [crea il file se non esiste o lo sostituisce per intero se esiste già](https://nodejs.org/api/fs.html#fspromiseswritefilefile-data-options). Per aggiungere in coda senza cancellare il contenuto precedente c'è `appendFile()`, che [crea il file se manca](https://nodejs.org/api/fs.html#fspromisesappendfilepath-data-options): è la scelta naturale per un file di log.

```js
import { readFile, writeFile, appendFile } from 'node:fs/promises';

const testo = await readFile('note.md', 'utf8');   // stringa
const logo = await readFile('logo.png');           // Buffer: i byte così come sono
console.log(logo);                                 // <Buffer 89 50 4e 47 0d 0a …>

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
await writeFile('report.json', JSON.stringify(pkg, null, 2) + '\n');   // crea o sovrascrive
await appendFile('build.log', `build ${new Date().toISOString()}\n`);  // aggiunge in coda
```

Due avvertenze accompagnano queste funzioni. La prima: i percorsi relativi come `'note.md'` [vengono risolti rispetto alla cartella di lavoro](https://nodejs.org/api/fs.html#string-paths) del processo, non rispetto alla cartella dello script, un dettaglio che conta abbastanza da avere una sezione propria più avanti ([[a1-api-di-base#la-cartella-di-lavoro-processcwd|la cartella di lavoro]]). La seconda: `readFile()` carica tutto il file in memoria in un colpo solo, e per file molto grandi la documentazione [suggerisce gli *stream*](https://nodejs.org/api/fs.html#fsreadfilepath-options-callback), che lo leggono un pezzo alla volta.

## Cartelle e altre operazioni

Oltre a leggere e scrivere, uno script di build passa il tempo a creare cartelle, elencarne il contenuto, copiare, spostare e cancellare. Le funzioni di `node:fs/promises` ricalcano i comandi della shell descritti nel <a href="../terminale/#/docs/04-file-e-cartelle" target="_blank" rel="noopener">vault terminale</a>, con qualche opzione da conoscere.

`mkdir()` crea una cartella. Con l'opzione `recursive: true` si comporta come `mkdir -p`: crea anche le cartelle intermedie che mancano e, soprattutto, [non dà errore se la cartella esiste già](https://nodejs.org/api/fs.html#fspromisesmkdirpath-options), così la si può chiamare senza controlli preliminari all'inizio di ogni build.

`readdir()` elenca il contenuto di una cartella e restituisce un array di nomi, [esclusi `.` e `..`](https://nodejs.org/api/fs.html#fspromisesreaddirpath-options). Due opzioni ne cambiano il risultato. Con `withFileTypes: true` (da Node 10.11) al posto dei nomi arrivano oggetti `Dirent` (*directory entry*, voce di cartella), che hanno la proprietà `name` e i metodi `isFile()` e `isDirectory()`, così si distinguono file e sottocartelle senza altre chiamate. Con `recursive: true` (da Node 20.1 e 18.17) l'elenco scende in tutte le sottocartelle e i nomi diventano percorsi relativi alla cartella di partenza. Combinando le due opzioni, ogni `Dirent` indica la cartella in cui si trova con la proprietà `parentPath`, [stabile da Node 24](https://nodejs.org/api/fs.html#direntparentpath).

Le altre operazioni sono più semplici. `rename()` rinomina o sposta un file; `copyFile()` copia un singolo file e [sovrascrive la destinazione se esiste](https://nodejs.org/api/fs.html#fspromisescopyfilesrc-dest-mode); `cp()` copia anche intere cartelle con `recursive: true` ed è [stabile da Node 22.3](https://nodejs.org/api/fs.html#fspromisescpsrc-dest-options); `rm()` cancella un file e, con `recursive: true`, una cartella con tutto il suo contenuto, mentre `force: true` [ignora l'errore se il percorso non esiste](https://nodejs.org/api/fs.html#fspromisesrmpath-options). Infine `stat()` restituisce un oggetto `fs.Stats` con le informazioni su un file o una cartella: i metodi `isFile()` e `isDirectory()`, la dimensione in byte (`size`) e la data dell'ultima modifica (`mtime`).

```js
import { mkdir, readdir, copyFile, rename, stat, rm } from 'node:fs/promises';
import { join } from 'node:path';

await mkdir('dist/assets/img', { recursive: true });   // crea la catena; nessun errore se c'è già

const voci = await readdir('src', { withFileTypes: true });
for (const voce of voci) {
  console.log(voce.name, voce.isDirectory() ? '(cartella)' : '(file)');
}

await readdir('src', { recursive: true });
// [ 'components', 'index.html', 'index.js', 'components/Button.js' ]

const tutte = await readdir('src', { recursive: true, withFileTypes: true });
const file = tutte.filter((d) => d.isFile()).map((d) => join(d.parentPath, d.name));
// [ 'src/index.html', 'src/index.js', 'src/components/Button.js' ]

await copyFile('src/index.html', 'dist/index.html');
await rename('dist/index.html', 'dist/home.html');
const info = await stat('dist/home.html');
console.log(info.isFile(), info.size, info.mtime);      // true 14 2026-10-11T12:21:23.271Z

await rm('dist', { recursive: true, force: true });     // via la cartella e tutto il contenuto
```

> [!warning]
> `rm(percorso, { recursive: true, force: true })` è l'equivalente di `rm -rf`: cancella una cartella e tutto ciò che contiene senza chiedere conferma e senza passare dal Cestino. Un percorso costruito male (un segmento vuoto, un `..` di troppo) può colpire molto più del previsto, quindi conviene ricavarlo da una base certa, come la radice del progetto, e mai da un input non controllato. Le stesse cautele valgono per il comando della shell, descritte nel <a href="../terminale/#/docs/04-file-e-cartelle?id=cancellare-con-prudenza" target="_blank" rel="noopener">vault terminale</a>.

## Quando qualcosa va storto: `err.code`

Qualunque operazione sui file può fallire: il file non c'è, la cartella esiste già, mancano i permessi. Con `await` il fallimento si presenta come un'eccezione (la Promise viene *rifiutata*) e si intercetta con un normale `try`/`catch`. L'oggetto errore porta con sé la proprietà **`code`**, una breve etichetta testuale che identifica il tipo di problema; secondo la documentazione è [il modo più stabile di riconoscere un errore](https://nodejs.org/api/errors.html#errorcode), perché cambia solo fra versioni principali di Node, mentre il testo di `message` può cambiare in qualunque versione. I codici dei file vengono dal sistema operativo, e quelli che si incontrano più spesso sono [questi](https://nodejs.org/api/errors.html#common-system-errors):

| Codice | Significato | Caso tipico |
|---|---|---|
| `ENOENT` | *No such file or directory*: il percorso non esiste | leggere un file che non c'è |
| `EEXIST` | *File exists*: il bersaglio esiste già | `mkdir()` senza `recursive` su una cartella esistente |
| `EACCES` | *Permission denied*: permessi insufficienti | scrivere in una cartella di sistema |
| `EISDIR` | *Is a directory*: serviva un file, c'è una cartella | `readFile()` su una cartella |
| `ENOTDIR` | *Not a directory*: serviva una cartella, c'è un file | `readdir()` su un file |

Lo schema tipico gestisce il caso previsto e lascia risalire tutti gli altri:

```js
import { readFile } from 'node:fs/promises';

async function leggiConfig(percorso) {
  try {
    return JSON.parse(await readFile(percorso, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return {};   // il file non c'è: configurazione vuota
    throw err;                              // ogni altro problema risale
  }
}
```

L'ultima riga del `catch` è importante quanto la prima. Inghiottire ogni errore restituendo `{}` nasconderebbe problemi veri: un file illeggibile per i permessi (`EACCES`) o un JSON malformato, che `JSON.parse()` segnala con un `SyntaxError` privo di `code`. Si gestisce solo ciò che si sa gestire, e il resto prosegue verso chi può occuparsene.

## Il file esiste? Meglio provarci

Prima di leggere o creare un file viene spontaneo chiedersi se esiste già. Node offre più modi di porre la domanda, ciascuno con i suoi pregi, e la documentazione aggiunge un'avvertenza che vale per tutti.

| Modo | Pro | Contro |
|---|---|---|
| `existsSync(p)` da `node:fs` | restituisce un booleano, si legge benissimo | è sincrono; fra il controllo e l'uso il file può cambiare |
| `await access(p)` | è asincrono, e con `constants.R_OK` o `W_OK` verifica anche i permessi | risponde con un'eccezione invece che con un booleano; stessa finestra di tempo scoperta |
| `await stat(p, { throwIfNoEntry: false })` | è asincrono, restituisce `undefined` se manca e altrimenti dice anche se è file o cartella | da Node 25.7 e 24.15; stessa finestra di tempo scoperta |
| agire e gestire `ENOENT` o `EEXIST` | il controllo e l'azione coincidono, nessuna finestra scoperta | un `try`/`catch` in più |

```js
import { access } from 'node:fs/promises';
import { existsSync } from 'node:fs';

if (existsSync('.env')) console.log('il file esiste');

try {
  await access('.env');                  // si risolve se il file è raggiungibile
  console.log('il file esiste');
} catch {
  console.log('il file non esiste (o non è accessibile)');
}
```

L'avvertenza riguarda il tempo che passa fra la domanda e l'azione. Fra il controllo e la lettura (o la scrittura) un altro processo può creare, cancellare o modificare il file, e la risposta appena ottenuta non è più vera: è una **race condition** (*condizione di corsa*), un difetto in cui il risultato dipende da chi arriva prima. Per questo la documentazione [sconsiglia di controllare con `access()` prima di aprire un file](https://nodejs.org/api/fs.html#fspromisesaccesspath-mode) e raccomanda di agire direttamente gestendo l'errore: leggere e intercettare `ENOENT`, come fa `leggiConfig()` qui sopra, oppure creare il file con il flag `'wx'`, che [fallisce se il percorso esiste già](https://nodejs.org/api/fs.html#file-system-flags). Così il controllo e l'azione diventano un'unica operazione, e nessun altro può infilarsi in mezzo.

```js
import { writeFile } from 'node:fs/promises';

try {
  await writeFile('config.json', '{}\n', { flag: 'wx' });   // crea solo se non esiste
} catch (err) {
  if (err.code !== 'EEXIST') throw err;                     // c'era già: lo si lascia com'è
}
```

In uno script di build lanciato a mano da una persona sola il rischio è trascurabile, e un `existsSync()` all'avvio va benissimo; in un server, o dove più processi lavorano sugli stessi file, la strada giusta è agire e gestire l'errore.

> [!info|label:Legacy]
> `fs.exists(percorso, callback)` è [deprecato da Node 1.0](https://nodejs.org/api/fs.html#fsexistspath-callback): la sua callback riceve solo un booleano, a differenza di tutte le altre callback di Node, che ricevono per primo l'errore. La versione sincrona `existsSync()`, invece, [non è deprecata](https://nodejs.org/api/fs.html#fsexistssyncpath). Nel codice meno recente si incontra anche `require('fs').promises` (o `import { promises as fs } from 'fs'`): è la stessa API a Promise, che da Node 14 è raggiungibile anche come modulo a sé, [`fs/promises`](https://nodejs.org/api/fs.html#promises-api). Le funzioni a callback in generale sono nel box Legacy del [[01-dentro-node#bloccante-e-non-bloccante|capitolo 01]].

## Le versioni `Sync`

Ogni funzione di `node:fs/promises` ha una gemella sincrona in `node:fs`, con lo stesso nome più il suffisso `Sync`: `readFileSync()`, `writeFileSync()`, `mkdirSync()`, `readdirSync()`, oltre alla già vista `existsSync()`. Le versioni sincrone [bloccano l'event loop finché l'operazione non è conclusa](https://nodejs.org/api/fs.html#synchronous-example) e restituiscono il risultato direttamente, senza Promise, mentre gli errori arrivano come eccezioni da intercettare con `try`/`catch`. Il perché del blocco, e quando pesa davvero, è spiegato nel [[01-dentro-node#bloccante-e-non-bloccante|capitolo 01]]: in un server non si usano mai durante la gestione di una richiesta, mentre in uno script da riga di comando, o per leggere una configurazione all'avvio prima di fare qualunque altra cosa, vanno benissimo.

```js
import { readFileSync, existsSync } from 'node:fs';

// all'avvio di uno script: niente altro da servire nel frattempo, il blocco non costa nulla
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const haEnv = existsSync('.env');
```

## Costruire percorsi: `node:path`

Un percorso è soltanto una stringa, ma costruirlo incollando pezzi con `+` e `'/'` è fragile: si rischiano barre doppie, segmenti `..` da risolvere a mano e, su Windows, il separatore sbagliato. Il modulo `node:path` fa questo lavoro in modo corretto, ma lavora solo sulle stringhe: non tocca il disco e non controlla che un percorso esista, tanto che `path.join('non', 'esiste', 'davvero.txt')` restituisce tranquillamente `'non/esiste/davvero.txt'`. L'unica informazione esterna che può usare è la cartella di lavoro, nel caso di `resolve()`. I concetti di percorso assoluto e relativo sono nel <a href="../terminale/#/docs/03-navigare-filesystem?id=percorsi-assoluti-e-relativi" target="_blank" rel="noopener">vault terminale</a>.

```js
import path from 'node:path';   // oppure: import { join, resolve, dirname } from 'node:path'

path.join('src', 'components', '..', 'utils', 'date.js');  // 'src/utils/date.js'
path.resolve('src', 'index.js');            // '/Users/ciro/progetto/src/index.js' (da process.cwd())
path.dirname('/progetto/src/app.ts');       // '/progetto/src'
path.basename('/progetto/src/app.ts');      // 'app.ts'
path.basename('/progetto/src/app.ts', '.ts');   // 'app'
path.extname('archivio.tar.gz');            // '.gz' (solo l'ultima estensione)
path.relative('/progetto/src', '/progetto/dist/app.js');   // '../dist/app.js'

path.parse('/progetto/src/app.ts');
// { root: '/', dir: '/progetto/src', base: 'app.ts', ext: '.ts', name: 'app' }
path.format({ dir: '/progetto/dist', name: 'app', ext: '.js' });   // '/progetto/dist/app.js'
```

`dirname()`, `basename()` ed `extname()` estraggono le parti di un percorso: la cartella, il nome del file (eventualmente senza un suffisso indicato) e l'estensione. `relative()` calcola il percorso che porta da una cartella a un'altra. [`parse()`](https://nodejs.org/api/path.html#pathparsepath) scompone un percorso in un oggetto con tutte le parti insieme, e `format()` fa l'operazione inversa: è comodo per cambiare l'estensione di un file mantenendo cartella e nome.

### `join()` e `resolve()`

Le due funzioni più usate si somigliano, ma rispondono a domande diverse. `join()` [unisce i segmenti con il separatore del sistema e normalizza il risultato](https://nodejs.org/api/path.html#pathjoinpaths), cioè risolve `.` e `..` e toglie le barre doppie; se il primo segmento è relativo, anche il risultato resta relativo. `resolve()` invece produce **sempre un percorso assoluto**: [elabora i segmenti da destra verso sinistra](https://nodejs.org/api/path.html#pathresolvepaths), anteponendo ciascuno al precedente finché non ottiene un percorso assoluto, e se esaurisce i segmenti senza averne trovato uno parte dalla cartella di lavoro. Ne discende una differenza che sorprende: un segmento assoluto a metà fa ripartire `resolve()` da lì, mentre `join()` lo tratta come un pezzo qualunque, quindi `resolve('src', '/tmp', 'a.js')` vale `'/tmp/a.js'` e `join('src', '/tmp', 'a.js')` vale `'src/tmp/a.js'`.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 680 260" role="img" aria-label="join e resolve a confronto: gli stessi segmenti 'src', '..' e 'dist/app.js' entrano in path.join, che restituisce il percorso relativo dist/app.js, e in path.resolve, che usa anche la cartella di lavoro process.cwd() e restituisce il percorso assoluto /Users/ciro/progetto/dist/app.js" style="width:100%;max-width:680px;height:auto;color:inherit"><defs><marker id="na1-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="196" y="28" width="76" height="28" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="234" y="47" font-size="11.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">'src'</text><rect x="284" y="28" width="56" height="28" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="312" y="47" font-size="11.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">'..'</text><rect x="352" y="28" width="132" height="28" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="418" y="47" font-size="11.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">'dist/app.js'</text><rect x="520" y="28" width="144" height="28" rx="6" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 3"/><text x="592" y="47" font-size="11.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">process.cwd()</text><line x1="300" y1="58" x2="196" y2="97" stroke="currentColor" stroke-width="1.4" marker-end="url(#na1-a)"/><line x1="380" y1="58" x2="484" y2="97" stroke="currentColor" stroke-width="1.4" marker-end="url(#na1-a)"/><line x1="592" y1="58" x2="566" y2="97" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 3" marker-end="url(#na1-a)"/><rect x="60" y="100" width="220" height="40" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="170" y="125" font-size="13" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">path.join(…)</text><rect x="400" y="100" width="220" height="40" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".1" stroke="currentColor" stroke-width="1.6"/><text x="510" y="125" font-size="13" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">path.resolve(…)</text><line x1="170" y1="142" x2="170" y2="176" stroke="currentColor" stroke-width="1.4" marker-end="url(#na1-a)"/><line x1="510" y1="142" x2="511" y2="176" stroke="currentColor" stroke-width="1.4" marker-end="url(#na1-a)"/><rect x="60" y="180" width="220" height="36" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="170" y="203" font-size="12" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">dist/app.js</text><rect x="364" y="180" width="296" height="36" rx="8" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8"/><text x="512" y="203" font-size="11.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">/Users/ciro/progetto/dist/app.js</text><text x="170" y="238" font-size="10.5" text-anchor="middle" opacity=".75">relativo: dipende da dove lo si usa</text><text x="512" y="238" font-size="10.5" text-anchor="middle" opacity=".75">assoluto: ancorato alla cartella di lavoro</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Gli stessi tre segmenti, due risultati. <code>join()</code> li unisce e risolve il <code>..</code>, ma il percorso resta <strong>relativo</strong> e il suo significato dipende da chi lo userà. <code>resolve()</code> non trova segmenti assoluti e allora parte dalla <strong>cartella di lavoro</strong> (tratteggiata, perché è un'informazione che viene dal processo e non dagli argomenti), restituendo un percorso <strong>assoluto</strong>.</figcaption>
</figure>

La regola pratica discende dalla figura. `join()` serve a comporre pezzi a partire da una base già certa, come la cartella dello script o la radice del progetto; `resolve()` serve a trasformare in assoluto un percorso che arriva dall'esterno (un argomento della riga di comando, un campo di configurazione), ancorandolo alla cartella da cui l'utente ha lanciato il comando.

### POSIX e Windows

macOS e Linux seguono le convenzioni **POSIX**, la famiglia di standard dei sistemi derivati da Unix: percorsi con la barra `/` e un'unica radice. Windows usa invece la barra rovesciata `\` e le lettere di unità come `C:`. Il modulo [si adatta al sistema su cui gira](https://nodejs.org/api/path.html#windows-vs-posix): `path.sep` vale `'/'` su POSIX e `'\'` su Windows, e `join()` usa il separatore locale. Quando serve una convenzione precisa indipendentemente dal sistema ci sono le due varianti `path.posix` e `path.win32`, con le stesse funzioni: `path.posix.join()`, per esempio, produce sempre barre `/`, come serve quando il percorso finirà in un URL. Su Windows le API dei file accettano entrambe le barre, ma [i metodi di `node:path` aggiungono solo `\`](https://nodejs.org/api/path.html#pathsep).

```js
path.win32.join('C:\\progetto', 'src', 'app.ts');   // C:\progetto\src\app.ts, su qualunque sistema
path.posix.join('assets', 'img', 'logo.svg');       // assets/img/logo.svg, anche su Windows
```

## Da URL a percorso: `node:url`

Negli ES modules la posizione dello script arriva sotto forma di URL, con `import.meta.url`, come spiega il [[02-moduli-e-pacchetti#dove-si-trova-il-modulo-importmeta|capitolo 02]]. Un URL `file:` e un percorso descrivono lo stesso file, ma non sono la stessa stringa: l'URL codifica i caratteri speciali (uno spazio diventa `%20`, un `#` diventa `%23`) e su Windows ha una forma come `file:///C:/progetto/…`, diversa da `C:\progetto\…`. Il modulo `node:url` offre le due conversioni: **`fileURLToPath()`** passa dall'URL al percorso, [decodificando i caratteri e producendo un percorso valido per il sistema](https://nodejs.org/api/url.html#urlfileurltopathurl-options), e **`pathToFileURL()`** fa il [cammino opposto](https://nodejs.org/api/url.html#urlpathtofileurlpath-options). È invece un errore comune prendere la proprietà `pathname` di un URL e usarla come percorso: resta codificata e, su Windows, sbagliata.

```js
import { fileURLToPath, pathToFileURL } from 'node:url';

// script in /Users/ciro/I miei progetti/app/scripts/build.mjs
import.meta.url;                   // 'file:///Users/ciro/I%20miei%20progetti/app/scripts/build.mjs'
new URL(import.meta.url).pathname; // '/Users/ciro/I%20miei%20progetti/app/scripts/build.mjs' (ancora codificato)
fileURLToPath(import.meta.url);    // '/Users/ciro/I miei progetti/app/scripts/build.mjs'

pathToFileURL('/tmp/report #1.html').href;   // 'file:///tmp/report%20%231.html'
```

La classe **`URL`** è la stessa del browser: Node la [implementa secondo lo standard WHATWG](https://nodejs.org/api/url.html#class-url) (il gruppo che mantiene standard del web come HTML e URL) e la rende disponibile come globale da Node 10, senza importazioni. Oltre a scomporre un indirizzo web nelle sue parti (`hostname`, `pathname`, `searchParams`), sa risolvere un indirizzo relativo rispetto a una base: `new URL('./dati.json', import.meta.url)` è l'URL di un file accanto allo script. Siccome le funzioni di `node:fs` [accettano anche oggetti `URL` con protocollo `file:`](https://nodejs.org/api/fs.html#file-paths), quell'URL si può passare direttamente a `readFile()`, in alternativa a `join(import.meta.dirname, 'dati.json')`.

```js
import { readFile } from 'node:fs/promises';

const dati = new URL('./dati.json', import.meta.url);   // relativo allo script, non alla cartella di lavoro
const testo = await readFile(dati, 'utf8');             // fs accetta l'oggetto URL

const u = new URL('https://api.github.com/gists/abc123?per_page=10');
u.hostname;                       // 'api.github.com'
u.searchParams.get('per_page');   // '10'
```

> [!info|label:Legacy]
> Prima della classe `URL`, Node aveva un'API propria per scomporre gli indirizzi, `url.parse()`. Non segue lo standard e il suo comportamento si presta a errori con conseguenze sulla sicurezza: è [deprecata](https://nodejs.org/api/deprecations.html#dep0169-insecure-urlparse) e da Node 24 stampa un avviso a runtime quando la si chiama dal codice dell'applicazione (non da quello in `node_modules`). Al suo posto si usa `new URL()`.

## Il processo: `process`

L'oggetto **`process`** rappresenta il programma Node in esecuzione e [offre informazioni e controllo](https://nodejs.org/api/process.html) su di esso: gli argomenti con cui è stato lanciato, le variabili d'ambiente, la cartella di lavoro, i canali di ingresso e di uscita, il modo in cui termina. È un globale, quindi lo si usa senza importarlo; la documentazione lo importa comunque in modo esplicito da `node:process` (`import process from 'node:process'`, oppure le singole parti, come `import { argv, env } from 'node:process'`), e le due forme si equivalgono.

### Gli argomenti: `process.argv`

Quando si lancia `node scripts/build.mjs src --minify --out=dist`, tutto ciò che segue il nome dello script arriva al programma in `process.argv`, un array di stringhe. I primi due elementi però non appartengono all'utente: [il primo è il percorso dell'eseguibile di Node, il secondo il percorso assoluto dello script](https://nodejs.org/api/process.html#processargv). Per questo quasi ogni script comincia con `process.argv.slice(2)`, che tiene solo gli argomenti veri.

```js
console.log(process.argv);
// [ '/usr/local/bin/node',
//   '/Users/ciro/progetto/scripts/build.mjs',
//   'src', '--minify', '--out=dist' ]

const args = process.argv.slice(2);   // [ 'src', '--minify', '--out=dist' ]
```

Node non interpreta questi argomenti: `--out=dist` è una stringa come le altre, e la distinzione fra opzioni e argomenti, descritta nel <a href="../terminale/#/docs/01-cos-e-il-terminale?id=l39anatomia-di-una-riga-di-comando" target="_blank" rel="noopener">vault terminale</a>, è una convenzione che lo script deve applicare da sé. Per gli script semplici bastano `includes()` e `startsWith()`; quando le opzioni crescono si usa **`parseArgs()`** di `node:util`, [stabile da Node 20](https://nodejs.org/api/util.html#utilparseargsconfig). Si descrivono le opzioni attese, ciascuna di tipo `'boolean'` o `'string'`, con un eventuale alias di una lettera (`short`) e un valore predefinito (`default`); la funzione restituisce i valori delle opzioni in `values` e gli argomenti *posizionali* (quelli senza trattino) in `positionals`. Con `allowNegative: true` (da Node 22.4 e 20.16) accetta anche la forma `--no-…` per spegnere un'opzione booleana. Un'opzione sconosciuta, per impostazione predefinita, provoca un errore che ferma lo script.

```js
import { parseArgs } from 'node:util';

const { values, positionals } = parseArgs({
  options: {
    out:   { type: 'string', short: 'o', default: 'dist' },
    check: { type: 'boolean', default: true },
  },
  allowPositionals: true,
  allowNegative: true,   // accetta --no-check
});

// node build.mjs src --out=build --no-check
// values: { out: 'build', check: false }   positionals: [ 'src' ]
```

### Le variabili d'ambiente: `process.env`

Le variabili d'ambiente, descritte nel <a href="../terminale/#/docs/05-variabili-ambiente-path?id=leggere-e-impostare-una-variabile" target="_blank" rel="noopener">vault terminale</a>, arrivano allo script nell'oggetto `process.env`, una proprietà per variabile: `process.env.HOME`, `process.env.PATH`, `process.env.NODE_ENV`. I valori sono **sempre stringhe**: un numero va convertito con `Number()`, un interruttore si confronta con una stringa come `'1'` o `'true'`, e assegnare a `process.env` un valore che non è una stringa [lo converte implicitamente, un comportamento deprecato](https://nodejs.org/api/process.html#processenv). Le modifiche a `process.env` restano dentro il processo: la shell che lo ha lanciato non le vede.

```js
const porta = Number(process.env.PORT ?? 3000);   // stringa da convertire, con un ripiego
const debug = process.env.DEBUG === '1';          // confronto fra stringhe
```

Per impostare una variabile solo per un comando basta anteporla al comando stesso. Quando le variabili sono tante si raccolgono in un file **`.env`**, che non si committa, come spiega il <a href="../glossario/#/docs/anatomia-progetto?id=i-file-e-le-cartelle-col-punto-davanti" target="_blank" rel="noopener">glossario</a>, e Node sa caricarlo da sé. L'opzione **`--env-file`** (da Node 20.6, [stabile da Node 24.10](https://nodejs.org/api/cli.html#--env-filefile)) legge il file, cercandolo nella cartella di lavoro, e ne mette le coppie `CHIAVE=valore` in `process.env`; sono ammessi commenti con `#` e valori fra virgolette, e se una variabile esiste già nell'ambiente prevale quella. Se il file manca Node si ferma con un errore, mentre la variante `--env-file-if-exists` (da Node 22.9) [prosegue senza](https://nodejs.org/api/cli.html#--env-file-if-existsfile). Dall'interno dello script si ottiene lo stesso effetto con **`process.loadEnvFile()`** (da Node 21.7 e 20.12, [stabile da Node 24.10](https://nodejs.org/api/process.html#processloadenvfilepath)), che senza argomenti legge `./.env`.

```bash
PORT=8080 node server.mjs            # variabile solo per questo comando
node --env-file=.env server.mjs      # carica .env in process.env prima di partire
```

```js
process.loadEnvFile();               // stesso effetto dall'interno dello script: legge ./.env
```

Prima che Node offrisse queste opzioni il compito spettava al pacchetto npm `dotenv`, che si incontra ancora in moltissimi progetti.

### La cartella di lavoro: `process.cwd()`

`process.cwd()` (da *current working directory*) [restituisce la **cartella di lavoro**](https://nodejs.org/api/process.html#processcwd) del processo: la cartella in cui ci si trovava quando si è lanciato il comando. È il punto di partenza di tutti i percorsi relativi, sia quelli passati a `node:fs` sia quelli risolti da `path.resolve()`. La cartella in cui sta lo script è un'altra cosa e si ottiene con `import.meta.dirname`, come spiega il [[02-moduli-e-pacchetti#dove-si-trova-il-modulo-importmeta|capitolo 02]]: le due coincidono solo se si lancia lo script dalla sua stessa cartella.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 680 272" role="img" aria-label="Cartella di lavoro e cartella dello script: lanciando node scripts/build.mjs dalla cartella progetto, readFile('config.json') cerca progetto/config.json, che non esiste, mentre join(import.meta.dirname, 'config.json') trova progetto/scripts/config.json" style="width:100%;max-width:680px;height:auto;color:inherit"><defs><marker id="na1-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="30" y="16" width="620" height="32" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="48" y="37" font-size="12.5" font-family="ui-monospace,Menlo,monospace">~/progetto % node scripts/build.mjs</text><g font-family="ui-monospace,Menlo,monospace" font-size="13"><text x="48" y="86" font-weight="700">progetto/</text><text x="48" y="116">├─ package.json</text><rect x="66" y="131" width="98" height="22" rx="5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3" opacity=".7"/><text x="48" y="146" opacity=".5">├─ config.json</text><text x="48" y="176" font-weight="700">└─ scripts/</text><text x="71" y="206">├─ build.mjs</text><rect x="89" y="221" width="96" height="22" rx="5" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.2"/><text x="71" y="236">└─ config.json</text></g><text x="134" y="86" font-size="11" font-weight="700">← process.cwd()</text><text x="148" y="176" font-size="11" font-weight="700">← import.meta.dirname</text><rect x="370" y="124" width="290" height="32" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="515" y="145" font-size="11.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">readFile('config.json')</text><line x1="368" y1="140" x2="168" y2="142" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 3" marker-end="url(#na1-b)"/><text x="515" y="174" font-size="10.5" text-anchor="middle" opacity=".75">dalla cartella di lavoro: ENOENT</text><rect x="370" y="204" width="290" height="32" rx="8" fill="var(--link,#5fa04e)" fill-opacity=".1" stroke="currentColor" stroke-width="1.5"/><text x="515" y="225" font-size="11" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">join(import.meta.dirname, 'config.json')</text><line x1="368" y1="220" x2="189" y2="231" stroke="currentColor" stroke-width="1.4" marker-end="url(#na1-b)"/><text x="515" y="254" font-size="10.5" text-anchor="middle" opacity=".75">dalla cartella dello script: trovato</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Lo stesso nome, due posti. Il comando è lanciato da <code>progetto/</code>, che diventa la <strong>cartella di lavoro</strong>: il percorso relativo di <code>readFile()</code> parte da lì e cerca un <code>config.json</code> che non esiste (tratteggiato). Costruendo il percorso dalla <strong>cartella dello script</strong> si arriva invece al file che gli sta accanto, da qualunque cartella si lanci il comando.</figcaption>
</figure>

La scelta fra le due basi dipende da chi fornisce il percorso. Un percorso scritto dall'utente sulla riga di comando, come `--out=report.json`, va risolto rispetto alla cartella di lavoro, perché è da lì che l'utente lo ha pensato; un file che appartiene allo script, come un template o una configurazione che gli sta accanto, va cercato a partire dalla cartella dello script. Negli script del `package.json` la questione si semplifica: npm [esegue gli script dalla radice del pacchetto](https://docs.npmjs.com/cli/commands/npm-run/), qualunque sia la cartella da cui si lancia `npm run`, quindi lì la cartella di lavoro è sempre la radice del progetto.

### Come finisce: i codici di uscita

Quando un processo termina restituisce al sistema operativo un numero, il **codice di uscita** (*exit code*): per convenzione `0` significa successo e qualunque altro valore un fallimento. La shell lo conserva nella variabile `$?` e lo usa negli operatori come `&&`, che esegue il comando successivo solo se il precedente è riuscito: è così che uno script `"build": "node check.mjs && vite build"` si ferma al primo errore, e che una pipeline di integrazione continua segna un passaggio come fallito. Node [esce con `0`](https://nodejs.org/api/process.html#exit-codes) quando non ha più nulla da fare e con `1` quando un'eccezione non viene gestita; da Node 15 anche una Promise rifiutata e mai gestita [è trattata come un'eccezione non gestita](https://nodejs.org/api/cli.html#--unhandled-rejectionsmode), e produce quindi anch'essa il codice `1`.

Per scegliere il codice da sé ci sono due strade. **`process.exitCode = 1`** imposta il codice e lascia che il processo finisca da solo, quando l'event loop non ha più nulla da attendere. **`process.exit(1)`** invece termina subito, [anche se ci sono operazioni asincrone ancora in corso, comprese le scritture su `process.stdout` e `process.stderr`](https://nodejs.org/api/process.html#processexitcode). Siccome in certe situazioni quelle scritture sono asincrone (per esempio quando l'uscita va in una pipe, su macOS e Linux), un `process.exit()` subito dopo un messaggio può troncarlo. Per questo la documentazione raccomanda di impostare [`process.exitCode`](https://nodejs.org/api/process.html#processexitcode-1) e lasciar terminare il processo in modo naturale; e se si deve interrompere per un errore, osserva che lanciare un'eccezione non gestita è più sicuro di `process.exit()`.

```js
const errori = await validaTutto();      // una funzione che restituisce i file non validi
if (errori.length > 0) {
  console.error(`${errori.length} file non validi`);
  process.exitCode = 1;                  // il processo finirà da solo, con codice 1
}
```

```bash
node check.mjs; echo $?      # 1
node check.mjs && echo ok    # "ok" non compare: && si ferma al fallimento
```

### I tre canali: stdin, stdout, stderr

Ogni processo nasce con tre canali di comunicazione standard, descritti dal punto di vista della shell nel <a href="../terminale/#/docs/08-comandi-di-tutti-i-giorni?id=comporre-i-comandi-la-pipe" target="_blank" rel="noopener">vault terminale</a>: lo **stdin**, da cui legge, lo **stdout**, su cui scrive i risultati, e lo **stderr**, riservato a errori e diagnostica. Il sistema operativo li identifica con un *file descriptor*, un piccolo numero che indica un canale aperto dal processo: `0`, `1` e `2`. In Node sono gli stream [`process.stdin`](https://nodejs.org/api/process.html#processstdin), [`process.stdout`](https://nodejs.org/api/process.html#processstdout) e `process.stderr`, e la `console` ci scrive sopra: [`console.log()` su stdout](https://nodejs.org/api/console.html#consolelogdata-args), [`console.error()` su stderr](https://nodejs.org/api/console.html#consoleerrordata-args), e così anche `console.warn()`, che ne è un alias.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 680 260" role="img" aria-label="I tre canali standard di un processo Node collegati al terminale: la tastiera manda i dati nello stdin, file descriptor 0, process.stdin; il processo scrive i risultati sullo stdout, fd 1, con console.log, e gli errori sullo stderr, fd 2, con console.error, che finiscono entrambi sullo schermo" style="width:100%;max-width:680px;height:auto;color:inherit"><defs><marker id="na1-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="135" y="28" font-size="12" text-anchor="middle" font-weight="700">terminale (TTY)</text><rect x="30" y="40" width="210" height="204" rx="10" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><line x1="30" y1="122" x2="240" y2="122" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3" opacity=".6"/><text x="135" y="86" font-size="12.5" text-anchor="middle">tastiera</text><text x="135" y="188" font-size="12.5" text-anchor="middle">schermo</text><rect x="440" y="60" width="210" height="170" rx="10" fill="var(--link,#5fa04e)" fill-opacity=".1" stroke="currentColor" stroke-width="1.8"/><text x="545" y="136" font-size="13" text-anchor="middle" font-weight="700">processo Node</text><text x="545" y="155" font-size="10.5" text-anchor="middle" opacity=".75" font-family="ui-monospace,Menlo,monospace">node script.mjs</text><line x1="242" y1="90" x2="436" y2="90" stroke="currentColor" stroke-width="1.6" marker-end="url(#na1-c)"/><text x="339" y="80" font-size="11" text-anchor="middle" font-weight="700">stdin · fd 0</text><text x="339" y="106" font-size="10" text-anchor="middle" opacity=".75" font-family="ui-monospace,Menlo,monospace">process.stdin</text><line x1="438" y1="152" x2="244" y2="152" stroke="currentColor" stroke-width="1.6" marker-end="url(#na1-c)"/><text x="339" y="142" font-size="11" text-anchor="middle" font-weight="700">stdout · fd 1</text><text x="339" y="168" font-size="10" text-anchor="middle" opacity=".75" font-family="ui-monospace,Menlo,monospace">console.log()</text><line x1="438" y1="208" x2="244" y2="208" stroke="currentColor" stroke-width="1.6" stroke-dasharray="6 4" marker-end="url(#na1-c)"/><text x="339" y="198" font-size="11" text-anchor="middle" font-weight="700">stderr · fd 2</text><text x="339" y="224" font-size="10" text-anchor="middle" opacity=".75" font-family="ui-monospace,Menlo,monospace">console.error()</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Lanciato a mano in una finestra di terminale, il processo ha i tre canali collegati al TTY: legge dalla tastiera attraverso lo <strong>stdin</strong> e scrive sullo schermo attraverso <strong>stdout</strong> e <strong>stderr</strong>, che a schermo si mescolano ma restano due canali distinti (qui il tratteggio). Con <code>&gt; file</code> si dirotta solo lo stdout; con una pipe, o in una pipeline di integrazione continua, dall'altra parte non c'è più un terminale.</figcaption>
</figure>

Con `node report.mjs > report.txt` la redirezione cattura solo lo stdout, così il file contiene i dati puliti mentre avvisi ed errori restano visibili a schermo; in una pipe, allo stesso modo, passa al comando successivo soltanto lo stdout. Per questo i risultati vanno su stdout con `console.log()`, e tutto ciò che è rivolto alla persona (avvisi, errori, avanzamento) su stderr con `console.error()`. Quando serve scrivere senza andare a capo, per esempio un messaggio di attesa che verrà completato sulla stessa riga, si usa direttamente `process.stdout.write()`, che scrive il testo così com'è.

```js
console.log('risultato');                  // stdout: finisce nel file con > report.txt
console.error('2 file ignorati');          // stderr: resta a schermo
process.stdout.write('Caricamento… ');     // nessun a capo
process.stdout.write('fatto\n');           // completa la stessa riga
```

### Il terminale: TTY e modalità raw

**TTY** è la sigla di *teletypewriter*, la telescrivente: i primi terminali erano macchine da scrivere collegate al computer, e il nome è rimasto a indicare un **terminale testuale** collegato a un programma. Oggi quel ruolo lo svolge la finestra dell'<a href="../terminale/#/docs/01-cos-e-il-terminale?id=emulatore-di-terminale-shell-e-prompt" target="_blank" rel="noopener">emulatore di terminale</a>. Un processo lanciato a mano in quella finestra ha i suoi canali collegati al TTY, quindi legge dalla tastiera e scrive sullo schermo. Se invece l'ingresso arriva da una pipe, l'uscita è rediretta su un file o lo script gira in una pipeline automatica, dall'altra parte non c'è nessun terminale.

Node segnala la differenza con la proprietà `isTTY` degli stream: quando Node rileva un terminale, `process.stdin`, `process.stdout` e `process.stderr` [diventano stream di tipo TTY e `isTTY` vale `true`](https://nodejs.org/api/tty.html#tty); negli altri casi la proprietà non esiste e vale quindi `undefined`. Su questo controllo si appoggiano due comportamenti comuni: stampare colori e animazioni solo se `process.stdout.isTTY`, e fare domande interattive solo se `process.stdin.isTTY`, ripiegando altrimenti su argomenti o variabili d'ambiente.

Normalmente il terminale lavora **a righe**: mostra a schermo ciò che si digita (l'*eco*), gestisce da sé il tasto Backspace e consegna al programma l'intera riga solo quando si preme Invio; inoltre trasforma Ctrl-C in `SIGINT`, un *segnale*, cioè una notifica che il sistema operativo recapita al processo e che di norma lo termina. È il comportamento giusto per rispondere a una domanda, ma non basta quando si vuole reagire a un singolo tasto o leggere una password senza mostrarla. Per questi casi `process.stdin`, quando è un TTY, offre **`setRawMode(true)`**: in **modalità raw** (grezza) [ogni carattere arriva al programma appena viene digitato, l'eco è disattivato e Ctrl-C non genera più `SIGINT`](https://nodejs.org/api/tty.html#readstreamsetrawmodemode). Tutto ciò che prima faceva il terminale passa allo script: il tasto Invio arriva come `'\r'`, Backspace di solito come `'\u007f'`, Ctrl-C come il carattere `'\u0003'` e le frecce come brevi sequenze che cominciano con il carattere di escape (`'\u001b[A'` per la freccia su). Il metodo esiste solo quando lo stdin è davvero un terminale, quindi va preceduto da un controllo su `isTTY`, e alla fine va sempre chiamato `setRawMode(false)` per restituire al terminale il suo comportamento normale.

```js
import { stdin, stdout } from 'node:process';

if (!stdin.isTTY) {
  console.error('Serve un terminale interattivo.');
  process.exitCode = 1;
} else {
  stdin.setRawMode(true);        // ogni tasto arriva subito, senza eco
  stdin.setEncoding('utf8');     // stringhe invece di Buffer
  stdout.write('Premere un tasto (q per uscire)\n');
  stdin.on('data', (tasto) => {
    if (tasto === 'q' || tasto === '\u0003') {   // q oppure Ctrl-C
      stdin.setRawMode(false);
      stdin.pause();                             // niente più da attendere: il processo termina
      return;
    }
    stdout.write(`tasto: ${JSON.stringify(tasto)}\n`);   // per esempio "a" oppure "\u001b[A"
  });
}
```

Per una domanda normale, con la risposta visibile, la modalità raw è superflua: il modulo `node:readline/promises`, [stabile da Node 24](https://nodejs.org/api/readline.html#promises-api), offre `rl.question()`, che restituisce una Promise con la riga digitata. La modalità raw serve quando il terminale non deve fare il suo lavoro, cioè per leggere un tasto alla volta o per nascondere ciò che si digita.

```js
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = createInterface({ input, output });
const nome = await rl.question('Nome del progetto? ');
rl.close();
```

## Leggere uno script vero, riga per riga

> [!info|label:Nel repo]
> `scripts/sync-setup.mjs` prepara la sincronizzazione personale dell'hub tramite un GitHub Gist: chiede un token GitHub, l'ID del gist e una passphrase, verifica token e gist su GitHub e scrive il file `sync.json` con i dati cifrati. Sono poco più di cento righe che usano quasi tutte le API di questo capitolo. La parte crittografica (PBKDF2, AES-GCM) è spiegata nella <a href="../glossario/#/docs/crittografia" target="_blank" rel="noopener">voce del glossario sulla crittografia</a> e qui si tralascia.

### Intestazione e importazioni

La prima riga, `#!/usr/bin/env node`, è lo *shebang*: quando il file viene eseguito direttamente come programma, dopo averlo reso eseguibile con `chmod +x` (il permesso è descritto nel <a href="../terminale/#/docs/08-comandi-di-tutti-i-giorni?id=un-cenno-ai-permessi" target="_blank" rel="noopener">vault terminale</a>), dice al sistema di affidarlo a `node`. Lanciandolo con `node scripts/sync-setup.mjs` la riga non ha effetto. Dopo un lungo commento iniziale con le istruzioni d'uso arrivano le importazioni:

```js
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { webcrypto as wc } from 'node:crypto';
```

Ognuna corrisponde a un pezzo del capitolo: `writeFile` per salvare il risultato, `fileURLToPath` per convertire `import.meta.url`, tre funzioni di `node:path` per costruire i percorsi. L'ultima importa la [Web Crypto API](https://nodejs.org/api/webcrypto.html), la stessa interfaccia crittografica del browser, e con `as` la rinomina `wc` solo per abbreviare.

### La radice del progetto e le opzioni

```js
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
```

La riga si legge dall'interno verso l'esterno, e ogni passaggio trasforma la stringa:

```text
import.meta.url      'file:///Users/ciro/dev_notes/scripts/sync-setup.mjs'
fileURLToPath(…)     '/Users/ciro/dev_notes/scripts/sync-setup.mjs'
dirname(…)           '/Users/ciro/dev_notes/scripts'
join(…, '..')        '/Users/ciro/dev_notes'
```

`join()` normalizza il `..` finale, cioè risale di una cartella, e così `ROOT` è la radice del repository qualunque sia la cartella da cui si lancia lo script. Con Node 24 la stessa riga si scriverebbe `join(import.meta.dirname, '..')`, come ricorda il box Legacy del [[02-moduli-e-pacchetti#dove-si-trova-il-modulo-importmeta|capitolo 02]].

Le opzioni si leggono a mano da `process.argv`:

```js
const args = process.argv.slice(2);
const NO_CHECK = args.includes('--no-check');
const OUT = resolve((args.find((a) => a.startsWith('--out=')) || '').slice(6) || join(ROOT, 'sync.json'));
```

`NO_CHECK` è un semplice interruttore, che vale `true` se fra gli argomenti compare `--no-check`. `OUT` è più densa e conviene scomporla. `args.find()` cerca il primo argomento che comincia con `--out=` e, se non c'è, `|| ''` lo sostituisce con una stringa vuota; `.slice(6)` toglie i sei caratteri di `--out=` e lascia il nome del file; se il risultato è vuoto (opzione assente, o scritta `--out=` senza valore), il secondo `||` ripiega su `join(ROOT, 'sync.json')`. Infine `resolve()` rende tutto assoluto, ed è qui che si vede la regola delle due basi: un `--out=prova.json` relativo viene risolto rispetto alla **cartella di lavoro**, cioè dove l'utente ha digitato il comando, mentre il percorso predefinito è già ancorato alla radice del progetto e `resolve()` lo lascia com'è.

Con `parseArgs()` le stesse due opzioni si dichiarerebbero così, guadagnando anche la forma `--out prova.json` con lo spazio, che la versione manuale non riconosce:

```js
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    out:   { type: 'string' },
    check: { type: 'boolean', default: true },
  },
  allowNegative: true,                  // --no-check imposta check a false
});
const NO_CHECK = !values.check;
const OUT = resolve(values.out || join(ROOT, 'sync.json'));
```

### Una domanda con risposta nascosta: `ask()`

La funzione `ask()` chiede un valore all'utente, e comincia dai casi in cui non può farlo:

```js
function ask(label, { hidden = false, env } = {}) {
  if (env && process.env[env]) return Promise.resolve(process.env[env]);
  const input = process.stdin;
  if (!input.isTTY) {
    console.error(`Nessun terminale interattivo: passare ${env} come variabile d'ambiente.`);
    process.exit(1);
  }
```

Se il chiamante ha indicato una variabile d'ambiente (`SYNC_TOKEN`, `SYNC_GIST` o `SYNC_PASSPHRASE`) e questa è impostata, la risposta è già lì e non serve chiedere: è ciò che permette di usare lo script anche senza tastiera, con `SYNC_TOKEN=… node scripts/sync-setup.mjs`. Altrimenti serve un terminale, e se `process.stdin.isTTY` non è vero (input da una pipe, esecuzione automatica) lo script spiega il problema su stderr ed esce con codice `1`. Segue la lettura della risposta, in modalità raw:

```js
  return new Promise((done) => {
    process.stdout.write(label);
    input.setRawMode(true); input.resume(); input.setEncoding('utf8');
    let buf = '';
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n' || ch === '\u0004') {          // Invio / Ctrl-D
          input.setRawMode(false); input.pause(); input.removeListener('data', onData);
          process.stdout.write('\n'); done(buf.trim()); return;
        }
        if (ch === '\u0003') { input.setRawMode(false); process.stdout.write('\n'); process.exit(1); }   // Ctrl-C
        if (ch === '\u007f' || ch === '\b') { if (buf) { buf = buf.slice(0, -1); if (!hidden) process.stdout.write('\b \b'); } continue; }
        if (ch >= ' ') { buf += ch; if (!hidden) process.stdout.write(ch); }
      }
    };
    input.on('data', onData);
  });
}
```

Il tutto è racchiuso in una `new Promise()`, così `main()` può scrivere `await ask(…)` e attendere la risposta. `process.stdout.write(label)` stampa la domanda senza andare a capo, in modo che il cursore resti sulla stessa riga. Seguono tre impostazioni: la modalità raw, `resume()` per cominciare a leggere, perché lo stdin [parte in pausa](https://nodejs.org/api/process.html#processstdin), e `setEncoding('utf8')`, perché i dati arrivino come stringhe invece che come `Buffer`.

Ogni volta che arriva un blocco di caratteri (*chunk*), `onData` lo scorre con `for…of` un carattere alla volta, perché un blocco può contenerne più d'uno, per esempio quando si incolla un token. I controlli seguono un ordine preciso:

- **Invio o Ctrl-D** (`'\r'`, `'\n'`, `'\u0004'`): la risposta è completa. Lo script rimette il terminale in modalità normale, mette in pausa lo stdin, che così non tiene più acceso il processo, e toglie il proprio ascoltatore con `removeListener()`, altrimenti alla domanda successiva gli ascoltatori sarebbero due. Poi va a capo e risolve la Promise con il testo raccolto.
- **Ctrl-C** (`'\u0003'`): in modalità raw non genera più `SIGINT`, quindi tocca allo script interrompersi. Ripristina il terminale ed esce con `process.exit(1)`; qui l'uscita immediata è voluta, perché bisogna abbandonare il flusso a metà, con una Promise ancora in attesa.
- **Backspace** (`'\u007f'` o `'\b'`): toglie l'ultimo carattere dal buffer. Se la risposta è visibile, `'\b \b'` lo cancella anche a schermo: sposta il cursore indietro, scrive uno spazio sopra il carattere e torna indietro di nuovo.
- **Caratteri stampabili** (`ch >= ' '`): i caratteri di controllo hanno codici inferiori a quello dello spazio e vengono scartati, gli altri si aggiungono al buffer e, solo se la domanda non è nascosta, si mostrano. Con `hidden: true` a schermo non compare nulla, perché la modalità raw ha già spento l'eco del terminale. Il controllo del Backspace deve precedere questo, perché `'\u007f'` viene dopo lo spazio nell'ordine dei caratteri e altrimenti finirebbe nel buffer.

### La chiamata a GitHub

```js
async function github(method, gist, token, body) {
  const r = await fetch('https://api.github.com/gists/' + gist, {
    method,
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, json: await r.json().catch(() => ({})) };
}
```

`fetch()` è [la stessa funzione del browser](https://nodejs.org/api/globals.html#fetch), globale e stabile da Node 21: qui legge o modifica un gist con il metodo indicato, il token nell'intestazione `Authorization` e, se c'è, un corpo JSON. La funzione restituisce lo stato HTTP e il corpo già convertito, mentre il `.catch(() => ({}))` ripiega su un oggetto vuoto se la risposta non è JSON valido. Nel `main()` il risultato si usa così:

```js
    process.stdout.write('Verifico token e gist su GitHub… ');
    const g = await github('GET', gist, token);
    if (g.status !== 200) {
      console.error(`\nGitHub ha risposto ${g.status}: controllare l'ID del gist e che il token abbia il permesso «Gists».`);
      process.exit(1);
    }
```

`process.stdout.write()` lascia il messaggio di attesa sulla riga, e più avanti un `console.log('ok')` lo completa. Se GitHub risponde con uno stato diverso da `200`, l'errore va su stderr, con un `\n` iniziale per non attaccarsi al messaggio di attesa, e lo script esce con `1`.

### Il salvataggio e la chiusura

```js
  await writeFile(OUT, JSON.stringify(out, null, 2) + '\n');
```

`writeFile()` riceve una stringa, quindi la scrive in UTF-8, e se `sync.json` esiste già lo sostituisce per intero. `OUT` è il percorso assoluto calcolato all'inizio; se la cartella non esiste o mancano i permessi, la Promise viene rifiutata con `ENOENT` o `EACCES`, e l'errore risale fino all'ultima riga del file:

```js
main().catch((e) => { console.error(e); process.exit(1); });
```

`main()` è una funzione `async`, quindi restituisce una Promise, e qualunque errore al suo interno (la rete che cade durante `fetch()`, un permesso negato a `writeFile()`) la rifiuta. Il `catch()` stampa l'errore su stderr ed esce con codice `1`, così la shell sa che qualcosa è andato storto. Senza questa riga Node arriverebbe comunque al codice `1`, trattando la Promise rifiutata come un'eccezione non gestita, ma la gestione esplicita dichiara l'intenzione e decide che cosa stampare.

Lo script usa `process.exit(1)` in più punti invece di `process.exitCode`. In un piccolo programma interattivo, che deve fermarsi a metà flusso, è una scelta comprensibile: i messaggi sono brevi e, quando l'uscita va a un terminale, su macOS e Linux [le scritture sono sincrone](https://nodejs.org/api/process.html#a-note-on-process-io), quindi nulla va perso prima dell'uscita. In una libreria o in un server la strada raccomandata resta `process.exitCode`, oppure un'eccezione.

## Riepilogo delle API

| API | Cosa fa |
|---|---|
| `readFile(p, 'utf8')` | legge un file intero come stringa (senza codifica: `Buffer`) |
| `writeFile(p, dati)` | crea o sovrascrive un file; con `{ flag: 'wx' }` fallisce se esiste |
| `appendFile(p, dati)` | aggiunge in coda, creando il file se manca |
| `mkdir(p, { recursive: true })` | crea la cartella e le intermedie; nessun errore se esiste |
| `readdir(p, { withFileTypes, recursive })` | elenca una cartella, con tipi e sottocartelle a richiesta |
| `rename(da, a)` · `copyFile(da, a)` · `cp(da, a, { recursive: true })` | sposta o rinomina · copia un file · copia una cartella |
| `rm(p, { recursive: true, force: true })` | cancella file o cartelle, senza conferma |
| `stat(p)` | informazioni su un file: `isFile()`, `isDirectory()`, `size`, `mtime` |
| `access(p)` · `existsSync(p)` | verifica che un percorso esista (con il limite della race condition) |
| `err.code` | etichetta stabile dell'errore: `ENOENT`, `EEXIST`, `EACCES`… |
| `path.join(…)` | unisce e normalizza segmenti; il risultato può restare relativo |
| `path.resolve(…)` | produce un percorso assoluto, partendo se serve da `process.cwd()` |
| `path.dirname` · `basename` · `extname` · `relative` · `parse` · `format` | scompongono e ricompongono un percorso |
| `fileURLToPath(url)` · `pathToFileURL(p)` | convertono fra URL `file:` e percorso |
| `new URL(rel, base)` | scompone un indirizzo o ne risolve uno relativo, come nel browser |
| `process.argv` · `parseArgs()` | argomenti della riga di comando, grezzi o interpretati |
| `process.env` · `--env-file` · `process.loadEnvFile()` | variabili d'ambiente, anche caricate da un file `.env` |
| `process.cwd()` | la cartella di lavoro, base dei percorsi relativi |
| `process.exitCode` · `process.exit()` | codice di uscita, con chiusura naturale o immediata |
| `console.log` · `console.error` · `process.stdout.write` | scrivono su stdout, su stderr, su stdout senza a capo |
| `process.stdin.isTTY` · `setRawMode(true)` | verifica la presenza di un terminale · legge un tasto alla volta, senza eco |

> [!tip]
> I percorsi relativi partono dalla cartella di lavoro, non dallo script: ciò che appartiene allo script si costruisce da `import.meta.dirname`, ciò che arriva dall'utente si rende assoluto con `resolve()`. Sui file conviene agire e gestire `err.code` invece di controllare prima; i risultati vanno su stdout e i messaggi su stderr; il codice di uscita si imposta con `process.exitCode`.

## Ripasso lampo

<details>
<summary>Perché <code>await readFile('dati.json')</code>, senza secondo argomento, non restituisce una stringa?</summary>

Perché senza codifica `readFile()` restituisce un `Buffer`, cioè i byte grezzi del file (una sottoclasse di `Uint8Array`). Per avere il testo si indica la codifica, `readFile('dati.json', 'utf8')`, e per un JSON si passa poi il testo a `JSON.parse()`.

</details>

<details>
<summary>Che differenza c'è fra <code>path.join()</code> e <code>path.resolve()</code>?</summary>

`join()` unisce i segmenti e normalizza il risultato, che resta relativo se il primo segmento è relativo. `resolve()` produce sempre un percorso assoluto: elabora i segmenti da destra a sinistra e, se nessuno è assoluto, parte da `process.cwd()`. Un segmento assoluto a metà fa ripartire `resolve()` da lì, mentre `join()` lo tratta come un pezzo qualunque.

</details>

<details>
<summary>Perché la documentazione sconsiglia di controllare con <code>access()</code> che un file esista prima di aprirlo?</summary>

Perché fra il controllo e l'apertura un altro processo può creare, cancellare o modificare il file: è una race condition. Conviene agire direttamente e gestire l'errore, intercettando `ENOENT` in lettura, oppure creare con il flag `'wx'`, che fallisce con `EEXIST` se il file c'è già.

</details>

<details>
<summary>Perché è preferibile <code>process.exitCode = 1</code> a <code>process.exit(1)</code>?</summary>

`process.exit()` termina subito, anche con operazioni asincrone in corso, comprese le scritture su stdout e stderr, che in alcuni casi (per esempio verso una pipe) sono asincrone e possono andare perse. `process.exitCode` imposta il codice e lascia finire il processo in modo naturale, quando l'event loop non ha più nulla da fare.

</details>

<details>
<summary>Che cosa cambia <code>process.stdin.setRawMode(true)</code>, e perché uno script che lo usa deve gestire Ctrl-C da sé?</summary>

In modalità raw il terminale smette di lavorare a righe: ogni carattere arriva subito al programma, l'eco è disattivato e Backspace e Invio arrivano come caratteri da interpretare. Anche Ctrl-C non genera più il segnale `SIGINT`, ma arriva come carattere `'\u0003'`: se lo script non lo riconosce e non esce da sé, non c'è modo di interromperlo con la tastiera. Il metodo esiste solo se `process.stdin.isTTY` è vero.

</details>
