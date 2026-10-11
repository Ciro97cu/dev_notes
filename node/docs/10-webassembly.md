# 10 · Codice nativo con WebAssembly

**WebAssembly** (abbreviato **Wasm**) è un formato binario di istruzioni pensato per essere il **bersaglio di compilazione** di altri linguaggi: un programma scritto in Rust, C, C++ o Go non viene eseguito così com'è dal browser o da Node, ma viene tradotto prima in un file `.wasm` compatto, che entrambi sanno caricare ed eseguire a una velocità vicina a quella del *codice nativo*, cioè del codice macchina prodotto apposta per un processore. Non prende il posto di JavaScript: vive accanto a esso, come un modulo da cui il JavaScript importa funzioni. Per chi fa frontend conta per due ragioni. La prima è che permette di portare nel browser calcoli pesanti o intere librerie scritte in altri linguaggi; la seconda, meno visibile ma quotidiana, è che molti strumenti del tooling moderno hanno il cuore scritto in Rust o in Go e arrivano nel progetto come binari nativi o come moduli Wasm. Questo capitolo spiega com'è fatto un modulo, come lo si carica in Node e nel browser, quali toolchain lo producono e come si confronta con l'altra strada per il codice nativo in Node, gli addon Node-API.

## Un formato binario per una macchina virtuale

La [definizione ufficiale](https://webassembly.org/) descrive WebAssembly come un formato binario di istruzioni per una **macchina virtuale basata su pila**, e ogni parola ha un peso. Una *macchina virtuale* è un processore immaginario, definito da una specifica invece che dal silicio: ha un suo insieme di istruzioni, che nessuna CPU reale esegue così come sono, e un motore che le traduce nel codice macchina del processore su cui si trova. Il vantaggio è la portabilità: lo stesso file `.wasm` gira su un Mac con processore ARM, su un server Linux x86 o su un telefono, perché la traduzione finale la fa il motore del posto. In Node e in Chrome quel motore è **V8**, lo stesso che esegue il JavaScript e che è descritto nel [[01-dentro-node|capitolo 01]]: secondo la [documentazione di V8](https://v8.dev/docs/wasm-compilation-pipeline) ogni funzione Wasm viene compilata prima con **Liftoff**, un compilatore a passata singola che produce subito codice eseguibile, e le funzioni chiamate più spesso vengono poi ricompilate in background dall'ottimizzatore **TurboFan**.

*Basata su pila* (*stack-based*) descrive il modo in cui lavorano le istruzioni. Invece di nominare registri o variabili, ogni istruzione [prende i propri operandi da una pila di valori e vi deposita il risultato](https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Understanding_the_text_format#stack_machines): per sommare due numeri si mettono sulla pila il primo e il secondo, poi l'istruzione `i32.add` li toglie entrambi e lascia al loro posto la somma. I valori su cui si lavora sono pochi e di tipo fisso: interi a 32 e a 64 bit (`i32`, `i64`) e numeri in virgola mobile a 32 e a 64 bit (`f32`, `f64`). Non esistono stringhe, oggetti o array nel senso di JavaScript: tutto ciò che è più complesso di un numero vive come sequenza di byte in memoria, come si vedrà fra poco.

Resta il *formato binario*. Il file `.wasm` non è testo da analizzare come un sorgente JavaScript, ma una sequenza di byte già strutturata, compatta da scaricare e veloce da decodificare. E proprio perché è un bersaglio di compilazione, [non è pensato per essere scritto a mano](https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Concepts): lo si ottiene compilando un linguaggio come Rust, C/C++, Go o AssemblyScript. La specifica è uno standard aperto sviluppato nel W3C; la versione in vigore, **Wasm 3.0**, è stata [pubblicata il 17 settembre 2025](https://webassembly.org/news/2025-09-17-wasm-3.0/) e aggiunge, fra l'altro, la memoria a 64 bit, più memorie nello stesso modulo, la garbage collection e la gestione nativa delle eccezioni.

> [!info|label:Legacy]
> Prima di WebAssembly l'unico modo di portare C o C++ nel browser era compilarli **in JavaScript**, e la forma più veloce era **asm.js**, un sottoinsieme di JavaScript annotato perché il motore potesse ottimizzarlo in modo aggressivo. Funzionava, ma restava testo da analizzare. WebAssembly ne ha preso il posto ed è [disponibile in tutti i browser principali da ottobre 2017](https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/instantiate_static). Com'era fatto asm.js e come si è arrivati a Wasm è raccontato nel vault JavaScript: <a href="../javascript/#/docs/libro5/05-performance?id=asmjs" target="_blank" rel="noopener">asm.js</a> e <a href="../javascript/#/docs/libro6/08-oltre-es6?id=webassembly-wasm" target="_blank" rel="noopener">l'arrivo di WebAssembly</a>.

## Perché esiste, e che cosa non è

WebAssembly nasce per tre obiettivi, che la [pagina dei concetti di MDN](https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Concepts) mette in fila. Il primo è la **velocità**: un codice già compilato e con tipi fissi si traduce in codice macchina efficiente senza le congetture che un motore JavaScript deve fare su valori che possono cambiare tipo in qualunque momento, e raggiunge così prestazioni vicine al nativo. Il secondo è la **sicurezza**: un modulo gira in una *sandbox*, un ambiente isolato dal resto del programma. Secondo il [modello di sicurezza](https://webassembly.org/docs/security/) un modulo deve dichiarare in anticipo tutte le funzioni esterne che userà, ogni accesso alla sua memoria viene controllato perché non esca dai limiti, e il codice compilato non si può leggere né modificare mentre gira. Il terzo è la **portabilità**: lo stesso binario funziona su ogni sistema e processore che abbia un motore Wasm, nel browser come fuori.

Altrettanto importante è ciò che WebAssembly **non** è. Non è un sostituto di JavaScript: MDN precisa che è pensato per affiancarlo e completarlo, non per rimpiazzarlo. Non ha accesso diretto al DOM né alle altre API del browser: può soltanto chiamare funzioni JavaScript, che a loro volta parlano con la pagina. E non è automaticamente più veloce: il JavaScript moderno, compilato al volo da V8, è già rapido nel lavoro ordinario, e ogni passaggio di dati fra i due mondi ha un costo. Wasm conviene quando c'è molto calcolo concentrato in poche chiamate (elaborare immagini o audio, comprimere, analizzare un sorgente, simulare) oppure quando esiste già una libreria matura in un altro linguaggio, come [SQLite, che il progetto stesso distribuisce in versione Wasm](https://sqlite.org/wasm/doc/trunk/index.md) per usarla nel browser.

## Modulo, istanza, import ed export

Il modello di WebAssembly si regge su pochi concetti, che la [documentazione MDN](https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Concepts) e la [guida di Node](https://nodejs.org/en/learn/getting-started/nodejs-with-webassembly) definiscono allo stesso modo. Il **modulo** (`WebAssembly.Module`) è il binario compilato: codice senza stato che dichiara che cosa importa e che cosa esporta, proprio come un ES module. L'**istanza** (`WebAssembly.Instance`) è un modulo messo in funzione, cioè il modulo più tutto lo stato che gli serve mentre gira: la sua memoria, le sue tabelle, i valori ricevuti dall'esterno. Dallo stesso modulo si possono creare più istanze, ognuna con la propria memoria, un po' come da una classe si creano più oggetti.

Gli **import** sono ciò che il modulo chiede all'esterno: funzioni (ma anche memorie, tabelle o valori) che deve ricevere al momento dell'istanziazione. Hanno un nome a due livelli, un modulo e un campo, per esempio `env.stampa`; chi istanzia passa un *oggetto degli import* con la stessa forma, e se manca una funzione richiesta l'istanziazione [fallisce con un `WebAssembly.LinkError`](https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/instantiateStreaming_static). Gli **export** sono ciò che il modulo offre: dal lato JavaScript compaiono nell'oggetto `instance.exports`, e una funzione esportata è una [vera funzione JavaScript](https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Exported_functions) che, quando la si chiama, converte gli argomenti nei tipi di Wasm (un numero JavaScript, per esempio, diventa un intero a 32 bit), esegue il codice del modulo e riconverte il risultato. Completano il quadro la **memoria** (`WebAssembly.Memory`), descritta più avanti, e la **tabella** (`WebAssembly.Table`), un array di riferimenti, tipicamente a funzioni, che per ragioni di sicurezza non si possono conservare come semplici byte in memoria.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 700 270" role="img" aria-label="Il percorso di un modulo WebAssembly: il sorgente in Rust, C/C++, Go o AssemblyScript passa per una toolchain che produce il file .wasm, cioè il modulo; l'ospite, browser o Node, lo istanzia con instantiate; dentro l'ospite il JavaScript passa all'istanza le funzioni da importare e riceve da essa le funzioni esportate" style="width:100%;max-width:700px;height:auto;color:inherit"><defs><marker id="n10-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="30" y="20" width="180" height="64" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="120" y="42" font-size="12.5" text-anchor="middle" font-weight="700">sorgente</text><text x="120" y="59" font-size="10.5" text-anchor="middle" opacity=".75">Rust · C/C++</text><text x="120" y="74" font-size="10.5" text-anchor="middle" opacity=".75">Go · AssemblyScript</text><rect x="260" y="20" width="180" height="64" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="350" y="42" font-size="12.5" text-anchor="middle" font-weight="700">toolchain</text><text x="350" y="59" font-size="10.5" text-anchor="middle" opacity=".75">wasm-pack · Emscripten</text><text x="350" y="74" font-size="10.5" text-anchor="middle" opacity=".75">asc · go build</text><rect x="490" y="20" width="180" height="64" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8"/><text x="580" y="42" font-size="12.5" text-anchor="middle" font-weight="700">file .wasm</text><text x="580" y="59" font-size="10.5" text-anchor="middle" opacity=".8">il modulo</text><text x="580" y="74" font-size="10.5" text-anchor="middle" opacity=".8">(binario portabile)</text><line x1="212" y1="52" x2="256" y2="52" stroke="currentColor" stroke-width="1.4" marker-end="url(#n10-a)"/><line x1="442" y1="52" x2="486" y2="52" stroke="currentColor" stroke-width="1.4" marker-end="url(#n10-a)"/><line x1="580" y1="86" x2="580" y2="126" stroke="currentColor" stroke-width="1.4" marker-end="url(#n10-a)"/><text x="570" y="111" font-size="10.5" text-anchor="end" font-family="ui-monospace,Menlo,monospace">instantiate()</text><rect x="30" y="130" width="640" height="124" rx="12" fill="var(--link,#5fa04e)" fill-opacity=".08" stroke="currentColor" stroke-width="1.8"/><text x="50" y="152" font-size="12" font-weight="700">ospite: browser o Node</text><rect x="60" y="166" width="200" height="66" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="160" y="194" font-size="12.5" text-anchor="middle" font-weight="700">codice JavaScript</text><text x="160" y="213" font-size="9.5" text-anchor="middle" opacity=".8" font-family="ui-monospace,Menlo,monospace">instance.exports.somma()</text><rect x="440" y="166" width="200" height="66" rx="9" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8"/><text x="540" y="189" font-size="12.5" text-anchor="middle" font-weight="700">istanza</text><text x="540" y="206" font-size="10.5" text-anchor="middle" opacity=".8">modulo + memoria</text><text x="540" y="221" font-size="10.5" text-anchor="middle" opacity=".8">+ import ricevuti</text><line x1="262" y1="186" x2="436" y2="186" stroke="currentColor" stroke-width="1.4" marker-end="url(#n10-a)"/><text x="349" y="179" font-size="10.5" text-anchor="middle">import: funzioni JS</text><line x1="438" y1="212" x2="264" y2="212" stroke="currentColor" stroke-width="1.4" marker-end="url(#n10-a)"/><text x="351" y="228" font-size="10.5" text-anchor="middle">export: funzioni Wasm</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Dal sorgente all'istanza. La <strong>toolchain</strong> trasforma il codice in un file <code>.wasm</code>, il <strong>modulo</strong>, uguale per ogni piattaforma; l'ospite lo istanzia e da quel momento il dialogo passa solo da due porte: gli <strong>import</strong>, che il JavaScript fornisce all'istanza, e gli <strong>export</strong>, che l'istanza offre al JavaScript.</figcaption>
</figure>

## Il formato testuale: `.wat` e `.wasm`

Accanto al formato binario esiste una [rappresentazione testuale](https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Understanding_the_text_format), il **WAT** (*WebAssembly Text format*, file `.wat`), che descrive lo stesso modulo in una forma leggibile dalle persone. È scritto in *S-espressioni*, una notazione antica e minimale per rappresentare alberi in cui ogni nodo sta fra parentesi tonde: il modulo è la parentesi più esterna, e dentro stanno le funzioni, la memoria, gli import e gli export. Il formato testuale non serve a scrivere programmi veri, che si compilano da altri linguaggi, ma a **capire** che cosa c'è dentro un binario, a fare esperimenti e a scrivere esempi minimi come quello che segue.

```wat
(module
  (func (export "somma") (param $a i32) (param $b i32) (result i32)
    local.get $a      ;; mette $a sulla pila
    local.get $b      ;; mette $b sulla pila
    i32.add))         ;; toglie i due valori e lascia la loro somma
```

Si legge dall'esterno verso l'interno: un modulo con una funzione esportata con il nome `somma`, che riceve due interi a 32 bit e ne restituisce uno. Il corpo è il meccanismo della pila visto sopra: le due istruzioni `local.get` depositano i parametri, `i32.add` li consuma e il valore rimasto in cima diventa il risultato della funzione. Per passare dal testo al binario e viceversa si usa la [WABT](https://github.com/WebAssembly/wabt) (*WebAssembly Binary Toolkit*), la raccolta di strumenti del gruppo WebAssembly; su npm ne esiste una versione JavaScript, il pacchetto `wabt`, che si può lanciare con `npx` senza installare nulla.

| Comando | Effetto |
|---|---|
| `npx -p wabt wat2wasm somma.wat` | compila il testo e scrive `somma.wasm` (43 byte) |
| `npx -p wabt wasm2wat somma.wasm` | fa il contrario: stampa il testo di un binario, anche di uno prodotto da un compilatore |
| `npx -p wabt wasm-objdump -h somma.wasm` | elenca le sezioni del binario (tipi, funzioni, export, codice) |

## Caricare un modulo nel browser e in Node

In JavaScript esiste un oggetto globale `WebAssembly`, identico nel browser e in Node, con le funzioni per compilare e istanziare un modulo. Nel **browser** la strada raccomandata è [`WebAssembly.instantiateStreaming()`](https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/instantiateStreaming_static), che riceve direttamente la risposta di un `fetch()` e compila il modulo mentre i byte stanno ancora arrivando dalla rete. Ha un requisito preciso: il server deve inviare il file con il tipo MIME `application/wasm`, altrimenti la Promise viene rifiutata con un `TypeError`.

```js
// nel browser: il server deve rispondere con Content-Type: application/wasm
const { instance } = await WebAssembly.instantiateStreaming(fetch('/somma.wasm'));
console.log(instance.exports.somma(2, 3));   // 5
```

In **Node** un file locale non passa da una risposta di rete: lo si legge da disco con `node:fs/promises` e se ne passano i byte a [`WebAssembly.instantiate()`](https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/instantiate_static). Questa funzione ha due forme. Se riceve dei byte, compila e istanzia in un colpo solo e restituisce un oggetto con due campi, `module` e `instance`; se riceve un `WebAssembly.Module` già compilato, restituisce direttamente l'istanza. Per provarla non serve alcuno strumento: i 43 byte del modulo `somma` si possono scrivere nel codice, e i commenti mostrano come si dividono nelle sezioni del formato binario.

```js
// somma-inline.mjs: il modulo Wasm scritto byte per byte, senza strumenti
const bytes = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d,                          // "\0asm": il numero magico che apre ogni .wasm
  0x01, 0x00, 0x00, 0x00,                          // versione 1 del formato binario
  0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f,   // sezione type: (i32, i32) => i32
  0x03, 0x02, 0x01, 0x00,                          // sezione function: una funzione di quel tipo
  0x07, 0x09, 0x01, 0x05, 0x73, 0x6f, 0x6d, 0x6d, 0x61, 0x00, 0x00,   // sezione export: "somma" = funzione 0
  0x0a, 0x09, 0x01, 0x07, 0x00,                    // sezione code: un corpo, senza variabili locali…
  0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b,              // …local.get 0, local.get 1, i32.add, end
]);

console.log(WebAssembly.validate(bytes));          // true: i byte formano un modulo valido
const { instance } = await WebAssembly.instantiate(bytes);
const { somma } = instance.exports;
console.log(somma(2, 3));                          // 5
console.log(somma(2.9, 1));                        // 3: 2.9 entra come l'intero 2
```

L'ultima riga mostra la conversione dei tipi descritta prima: la funzione dichiara parametri `i32`, quindi il numero JavaScript `2.9` viene troncato all'intero `2` prima di entrare nel modulo. Con un file vero, prodotto da `wat2wasm` o da un compilatore, cambia solo la provenienza dei byte. Il percorso si costruisce a partire da `import.meta.dirname`, così lo script trova il file qualunque sia la cartella da cui lo si lancia (il perché è nel [[02-moduli-e-pacchetti#dove-si-trova-il-modulo-importmeta|capitolo 02]]).

```js
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const bytes = await readFile(join(import.meta.dirname, 'somma.wasm'));
const { module, instance } = await WebAssembly.instantiate(bytes);

console.log(WebAssembly.Module.exports(module));   // [ { name: 'somma', kind: 'function' } ]
console.log(instance.exports.somma(40, 2));        // 42
```

## La memoria lineare

La **memoria lineare** è il magazzino dei dati di un'istanza: un unico blocco contiguo di byte, numerati da zero in su, che il codice Wasm legge e scrive indicando la posizione di ciascun byte (il suo *indirizzo*, o *offset*). MDN la descrive come [un grande array di byte grezzi, contiguo e modificabile, che può crescere nel tempo](https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Understanding_the_text_format#webassembly_memory). Cresce a **pagine** da 64 KiB, con il metodo `grow()`, e dal lato JavaScript è un oggetto [`WebAssembly.Memory`](https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/Memory) la cui proprietà `buffer` è un normale `ArrayBuffer`, lo stesso oggetto su cui lavorano gli array tipizzati. Ne segue che JavaScript può guardare dentro la memoria dell'istanza con un `Uint8Array` o un `DataView` e leggere o scrivere gli stessi byte che vede il codice Wasm. Chi conosce la distinzione fra stack e heap (spiegata nel <a href="../glossario/#/docs/memoria?id=memoria-stack-e-heap" target="_blank" rel="noopener">glossario alla voce Memoria</a>) può pensare alla memoria lineare come all'heap privato del modulo: linguaggi come C e Rust vi sistemano le proprie strutture dati e le gestiscono da sé.

La memoria lineare è anche il confine della sandbox. Il codice Wasm non può toccare nient'altro: un accesso fuori dai limiti provoca una *trap*, un errore che interrompe l'esecuzione. Il [modello di sicurezza](https://webassembly.org/docs/security/) avverte però che il controllo avviene sull'intera regione, non sui singoli oggetti: un errore di programmazione in C, come scrivere oltre la fine di un array, può ancora sovrascrivere dati vicini **dentro** la memoria del modulo, senza però uscirne.

Dato che Wasm conosce solo numeri, una stringa passa da un mondo all'altro come [una coppia di numeri](https://developer.mozilla.org/en-US/docs/WebAssembly/Guides/Understanding_the_text_format#webassembly_memory): l'indirizzo in cui comincia e la sua lunghezza in byte. Il modulo seguente, scritto nel formato testuale visto sopra, tiene in memoria la frase «Ciao da Wasm» e, quando si chiama `saluta()`, la consegna a una funzione `stampa` che si aspetta di ricevere da JavaScript.

```wat
(module
  (import "env" "stampa" (func $stampa (param i32 i32)))  ;; chiede a JavaScript una funzione
  (memory (export "memory") 1)                             ;; una pagina di memoria, esportata
  (data (i32.const 0) "Ciao da Wasm")                      ;; 12 byte, dall'indirizzo 0
  (func (export "saluta")
    i32.const 0       ;; dove comincia il testo
    i32.const 12      ;; quanti byte è lungo
    call $stampa))
```

Dal lato JavaScript la funzione `stampa` riceve i due numeri, costruisce un `Uint8Array` che guarda proprio quella porzione di memoria e trasforma i byte in testo con `TextDecoder`.

```js
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

let memoria;   // la memoria dell'istanza, assegnata dopo l'istanziazione

const imports = {
  env: {
    // Wasm passa due numeri: dove comincia il testo e quanti byte è lungo
    stampa(inizio, lunghezza) {
      const byte = new Uint8Array(memoria.buffer, inizio, lunghezza);
      console.log(new TextDecoder().decode(byte));
    },
  },
};

const bytes = await readFile(join(import.meta.dirname, 'saluto.wasm'));
const { instance } = await WebAssembly.instantiate(bytes, imports);
memoria = instance.exports.memory;

instance.exports.saluta();                 // Ciao da Wasm
console.log(memoria.buffer.byteLength);    // 65536: una pagina da 64 KiB
```

Il codice rilegge `memoria.buffer` a ogni chiamata invece di conservarlo in una variabile, e non per caso: quando la memoria cresce, il vecchio `ArrayBuffer` viene [staccato](https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/Memory) e diventa inutilizzabile. Questo lavoro di trasporto, cioè copiare stringhe e oggetti dentro e fuori dalla memoria, è esattamente ciò che le toolchain generano in automatico sotto forma di *codice di raccordo* (*glue code*) JavaScript, come si vedrà più avanti.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 700 290" role="img" aria-label="La sandbox di un'istanza Wasm: dentro ci sono il codice Wasm e la memoria lineare, una fila di byte numerati da 0 che contiene la frase Ciao da Wasm; fuori c'è il JavaScript, che chiama la funzione esportata saluta, riceve la chiamata alla funzione importata stampa e legge gli stessi byte attraverso memory.buffer" style="width:100%;max-width:700px;height:auto;color:inherit"><defs><marker id="n10-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><rect x="24" y="50" width="150" height="64" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="99" y="77" font-size="12.5" text-anchor="middle" font-weight="700">JavaScript</text><text x="99" y="96" font-size="10" text-anchor="middle" opacity=".8" font-family="ui-monospace,Menlo,monospace">stampa()</text><rect x="250" y="16" width="426" height="258" rx="12" fill="var(--link,#5fa04e)" fill-opacity=".06" stroke="currentColor" stroke-width="1.6" stroke-dasharray="6 4"/><text x="463" y="40" font-size="12" text-anchor="middle" font-weight="700">sandbox dell'istanza</text><rect x="300" y="56" width="180" height="56" rx="9" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="390" y="80" font-size="12.5" text-anchor="middle" font-weight="700">codice Wasm</text><text x="390" y="99" font-size="10" text-anchor="middle" opacity=".8" font-family="ui-monospace,Menlo,monospace">saluta()</text><line x1="176" y1="72" x2="296" y2="72" stroke="currentColor" stroke-width="1.4" marker-end="url(#n10-b)"/><text x="213" y="64" font-size="10.5" text-anchor="middle">export</text><line x1="298" y1="96" x2="178" y2="96" stroke="currentColor" stroke-width="1.4" marker-end="url(#n10-b)"/><text x="213" y="112" font-size="10.5" text-anchor="middle">import</text><line x1="390" y1="114" x2="390" y2="168" stroke="currentColor" stroke-width="1.4" marker-end="url(#n10-b)"/><text x="398" y="145" font-size="10" opacity=".8">scrive i byte</text><g font-family="ui-monospace,Menlo,monospace"><rect x="300" y="172" width="26" height="34" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.1"/><text x="313" y="194" font-size="12" text-anchor="middle">C</text><rect x="326" y="172" width="26" height="34" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.1"/><text x="339" y="194" font-size="12" text-anchor="middle">i</text><rect x="352" y="172" width="26" height="34" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.1"/><text x="365" y="194" font-size="12" text-anchor="middle">a</text><rect x="378" y="172" width="26" height="34" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.1"/><text x="391" y="194" font-size="12" text-anchor="middle">o</text><rect x="404" y="172" width="26" height="34" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.1"/><rect x="430" y="172" width="26" height="34" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.1"/><text x="443" y="194" font-size="12" text-anchor="middle">d</text><rect x="456" y="172" width="26" height="34" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.1"/><text x="469" y="194" font-size="12" text-anchor="middle">a</text><rect x="482" y="172" width="26" height="34" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.1"/><rect x="508" y="172" width="26" height="34" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.1"/><text x="521" y="194" font-size="12" text-anchor="middle">W</text><rect x="534" y="172" width="26" height="34" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.1"/><text x="547" y="194" font-size="12" text-anchor="middle">a</text><rect x="560" y="172" width="26" height="34" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.1"/><text x="573" y="194" font-size="12" text-anchor="middle">s</text><rect x="586" y="172" width="26" height="34" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.1"/><text x="599" y="194" font-size="12" text-anchor="middle">m</text><rect x="612" y="172" width="26" height="34" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.1" opacity=".6"/><rect x="638" y="172" width="26" height="34" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.1" opacity=".6"/><g font-size="9" text-anchor="middle" opacity=".7"><text x="313" y="221">0</text><text x="339" y="221">1</text><text x="365" y="221">2</text><text x="391" y="221">3</text><text x="417" y="221">4</text><text x="443" y="221">5</text><text x="469" y="221">6</text><text x="495" y="221">7</text><text x="521" y="221">8</text><text x="547" y="221">9</text><text x="573" y="221">10</text><text x="599" y="221">11</text></g></g><text x="482" y="250" font-size="11" text-anchor="middle">memoria lineare: un array di byte, a pagine da 64 KiB</text><path d="M99 116 V189 H296" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 3" marker-end="url(#n10-b)"/><text x="108" y="150" font-size="10" opacity=".8">legge i byte</text><text x="108" y="164" font-size="9.5" opacity=".8" font-family="ui-monospace,Menlo,monospace">memory.buffer</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">La sandbox di un'istanza. Il <strong>codice Wasm</strong> lavora solo sulla propria <strong>memoria lineare</strong> e comunica con l'esterno attraverso import ed export. Il JavaScript chiama <code>saluta()</code>, riceve la chiamata a <code>stampa(0, 12)</code> e, poiché la memoria è esportata, legge i dodici byte della frase direttamente da <code>memory.buffer</code>.</figcaption>
</figure>

## Importare `.wasm` come ES module

Le righe di caricamento viste sopra si ripetono identiche in ogni progetto, ed è per questo che esiste una proposta di standard, la [ES Module Integration](https://github.com/webassembly/esm-integration), che permette di trattare un file `.wasm` come un modulo qualsiasi e di importarne le funzioni con `import`. Nel [processo di standardizzazione di WebAssembly](https://github.com/WebAssembly/proposals) la proposta è in **fase 3**, quella dell'implementazione. Node la supporta e, secondo la [documentazione](https://nodejs.org/api/esm.html#wasm-modules), **da Node 24.5 e 22.19 non richiede più alcuna opzione**: basta un normale `import` con il percorso del file, estensione compresa come sempre negli ES modules.

```js
// main.mjs, accanto a somma.wasm
import { somma } from './somma.wasm';

console.log(somma(2, 3));   // 5
```

La funzionalità però non è ancora stabile: l'import delle istanze è classificato come *in sviluppo attivo* (stabilità 1.1), e in Node 24 l'esecuzione stampa un `ExperimentalWarning`. Esiste poi una seconda forma, l'**import di fase sorgente** (*source phase import*), aggiunta in Node 24.0 e già al livello di [*release candidate*](https://nodejs.org/api/esm.html#wasm-source-phase-imports) (stabilità 1.2). Con la parola chiave `import source` non si riceve un'istanza pronta ma il `WebAssembly.Module` compilato, da cui creare una o più istanze passando import personalizzati.

```js
import source modulo from './somma.wasm';   // un WebAssembly.Module, non ancora istanziato

const a = await WebAssembly.instantiate(modulo);   // con un Module si ottiene subito l'istanza
const b = await WebAssembly.instantiate(modulo);   // una seconda istanza, indipendente
console.log(a.exports.somma(1, 2), a !== b);       // 3 true
```

Nel mondo del frontend la stessa idea arriva attraverso il bundler, argomento del [[06-bundler|capitolo 06]]: la [documentazione di Vite](https://vite.dev/guide/features.html#webassembly) prevede sia l'import diretto di un `.wasm`, ispirato alla stessa proposta, sia il suffisso `?init`, che restituisce una funzione per istanziare il modulo quando serve.

> [!info|label:Legacy]
> Fino a Node 24.5 (e 22.19) l'import di un file `.wasm` funzionava solo lanciando Node con l'opzione `--experimental-wasm-modules`. Oggi l'opzione non serve più, ma la si incontra ancora in script e guide meno recenti.

## Dai linguaggi a Wasm: le toolchain

Una **toolchain** è la catena di strumenti che porta da un sorgente al prodotto finale: il compilatore e tutto ciò che gli sta intorno. Per WebAssembly ogni linguaggio ha la sua, e la differenza fra un modulo grezzo e uno comodo da usare sta soprattutto nel **codice di raccordo** che la toolchain genera: il JavaScript che copia le stringhe nella memoria lineare, converte gli oggetti, carica il `.wasm` e presenta il tutto come un normale modulo con funzioni dai tipi ricchi.

Per **Rust** il riferimento è [`wasm-bindgen`](https://wasm-bindgen.github.io/wasm-bindgen/), una libreria e uno strumento da riga di comando che rendono possibile lo scambio di stringhe, oggetti e classi fra Rust e JavaScript e l'uso da Rust delle API del browser, DOM compreso (sempre tramite JavaScript). Basta annotare una funzione con `#[wasm_bindgen]` perché diventi esportabile con i tipi di JavaScript; il crate (il pacchetto di Rust) va compilato come libreria dinamica, con `crate-type = ["cdylib"]` nel `Cargo.toml`.

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn saluta(nome: &str) -> String {
    format!("Ciao, {nome}!")
}
```

Sopra `wasm-bindgen` lavora [`wasm-pack`](https://wasm-bindgen.github.io/wasm-pack/book/commands/build.html), che compila il crate, genera il codice di raccordo e impacchetta il risultato in una cartella `pkg/` pronta per npm. L'opzione `--target` sceglie per chi preparare il pacchetto: `bundler` (il valore predefinito) per i bundler, `web` per un import diretto nel browser, `nodejs` per Node. Con `--target web` il modulo generato esporta come default una funzione di inizializzazione da attendere prima dell'uso: `import init, { saluta } from './pkg/saluti.js'`, poi `await init()`, poi `saluta('mondo')`. Nel 2025 l'organizzazione GitHub `rustwasm` che li ospitava è stata [dismessa](https://blog.rust-lang.org/inside-rust/2025/07/21/sunsetting-the-rustwasm-github-org), e oggi entrambi gli strumenti vivono nell'organizzazione `wasm-bindgen`.

Per **C e C++** c'è [Emscripten](https://emscripten.org/), una toolchain completa basata su LLVM (l'infrastruttura di compilazione usata anche da Clang e da Rust) che porta su Wasm progetti esistenti, emulando le API di sistema che si aspettano: POSIX, i thread, SDL, e OpenGL tradotto in WebGL. Il suo compilatore `emcc` produce il `.wasm` insieme a un file JavaScript che fa da runtime e lo carica. [AssemblyScript](https://www.assemblyscript.org/introduction.html) prende una strada diversa: è una variante di TypeScript con i tipi di WebAssembly (`i32`, `f64`…) al posto di `number`, pensata per chi vuole scrivere direttamente un modulo senza imparare un linguaggio di sistema; non supporta tutto TypeScript, perché il codice va tipizzato in modo rigoroso e compilato in anticipo, ed è ancora in versione 0.x ([0.28 su npm](https://www.npmjs.com/package/assemblyscript) nel 2026). Anche **Go** compila in Wasm con il proprio compilatore, come spiega la [wiki di Go](https://go.dev/wiki/WebAssembly).

| Comando | Effetto |
|---|---|
| `wasm-pack build --target web` | compila un crate Rust in `pkg/`: il `.wasm`, il JavaScript di raccordo e un `package.json` |
| `emcc hello_world.c` | compila un sorgente C in `a.out.wasm` più `a.out.js`, il runtime che lo carica; `node a.out.js` lo esegue ([tutorial](https://emscripten.org/docs/getting_started/Tutorial.html)) |
| `npx asinit .` | prepara un progetto AssemblyScript nella cartella corrente |
| `npm run asbuild` | nel progetto AssemblyScript, emette binari, binding e tipi nella cartella `build/` |
| `GOOS=js GOARCH=wasm go build -o main.wasm` | compila Go per il browser; serve anche il file di raccordo `wasm_exec.js` fornito con Go |
| `GOOS=wasip1 GOARCH=wasm go build -o main.wasm` | compila Go per WASI (da Go 1.21), descritto nella prossima sezione |

## WASI: Wasm fuori dal browser

Un modulo Wasm, da solo, non sa fare nulla che coinvolga il sistema: non legge file, non conosce l'ora, non scrive sul terminale. Nel browser va bene così, perché tutto passa dal JavaScript; fuori dal browser serve invece un modo standard per chiedere queste cose all'ospite. È il ruolo di **WASI** (*WebAssembly System Interface*), che il [sito ufficiale](https://wasi.dev/) definisce come un insieme di specifiche di API per software compilato in WebAssembly: le funzioni di sistema diventano **import** con nomi standard, che ogni ospite compatibile fornisce. Il modello di sicurezza è *a capacità* (*capability-based*): un modulo parte senza alcun potere e può fare solo ciò che l'ospite gli concede esplicitamente, per esempio l'accesso a una singola cartella.

WASI ha avuto tre tappe. La 0.1, detta anche **Preview 1**, lavora con i moduli normali ed è quella implementata da Node e dal target `wasip1` di Go; la [0.2](https://wasi.dev/releases/wasi-p2), del 25 gennaio 2024, ha ricostruito WASI sopra il Component Model descritto nella prossima sezione; la [0.3](https://wasi.dev/releases/wasi-p3), dell'11 giugno 2026, vi ha aggiunto l'asincronia nativa. Il runtime più noto fuori dal browser è [Wasmtime](https://docs.wasmtime.dev/), citato anche dalla [guida di Node](https://nodejs.org/en/learn/getting-started/nodejs-with-webassembly), ma anche Node ha un suo modulo integrato, [`node:wasi`](https://nodejs.org/api/wasi.html), che implementa la Preview 1: le sole versioni accettate dall'opzione `version`, obbligatoria da Node 20, sono `'preview1'` e la più vecchia `'unstable'`. Il modulo è ancora **sperimentale** (stabilità 1, anche in Node 26) e in Node 24 stampa un `ExperimentalWarning`.

Il modulo seguente è il «ciao mondo» di WASI. Importa da `wasi_snapshot_preview1` una sola funzione, `fd_write`, l'equivalente WASI di «scrivi questi byte su un *file descriptor*» (il numero con cui il sistema identifica un file aperto, dove `1` è lo standard output), e la chiama dalla funzione `_start`, che WASI considera il punto d'ingresso di un programma.

```wat
(module
  (import "wasi_snapshot_preview1" "fd_write"
    (func $fd_write (param i32 i32 i32 i32) (result i32)))
  (memory (export "memory") 1)
  (data (i32.const 8) "Ciao da WASI\n")              ;; il testo, dall'indirizzo 8
  (func (export "_start")
    (i32.store (i32.const 0) (i32.const 8))          ;; all'indirizzo 0: dove comincia il testo…
    (i32.store (i32.const 4) (i32.const 13))         ;; …e quanti byte è lungo
    (call $fd_write
      (i32.const 1)      ;; 1 = standard output
      (i32.const 0)      ;; indirizzo della coppia inizio/lunghezza
      (i32.const 1)      ;; quante coppie
      (i32.const 20))    ;; dove scrivere il numero di byte scritti
    drop))
```

Compilato con `npx -p wabt wat2wasm ciao-wasi.wat`, lo si esegue in Node creando un oggetto `WASI`, che fornisce gli import con `getImportObject()` e avvia il programma con `start()`.

```js
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { WASI } from 'node:wasi';

const wasi = new WASI({ version: 'preview1' });

const bytes = await readFile(join(import.meta.dirname, 'ciao-wasi.wasm'));
const module = await WebAssembly.compile(bytes);
const instance = await WebAssembly.instantiate(module, wasi.getImportObject());

wasi.start(instance);   // chiama _start: stampa «Ciao da WASI»
```

Per concedere l'accesso a una cartella si aggiunge l'opzione `preopens`, che associa un percorso visto dal modulo a una cartella reale; allo stesso modo `args` ed `env` passano al modulo gli argomenti e le variabili d'ambiente.

> [!warning]
> Le capacità di `node:wasi` **non** sono una barriera di sicurezza. La [documentazione](https://nodejs.org/api/wasi.html) avverte che il modulo non offre l'isolamento del file system di altri runtime WASI, che la sandbox sulle cartelle si può aggirare e che non va usato per eseguire codice non fidato. Per quello servono runtime dedicati come Wasmtime.

## Il Component Model

Un modulo normale, detto *core module*, scambia con l'esterno solo numeri e byte in memoria, e ogni toolchain inventa il proprio codice di raccordo per il resto: un modulo prodotto da Rust e uno prodotto da Go non sanno passarsi una stringa senza aiuto. Il **Component Model** affronta il problema definendo i **componenti**: involucri attorno ai moduli che dichiarano la propria interfaccia con tipi ricchi (stringhe, liste, record) in un linguaggio di descrizione chiamato **WIT**, così che componenti scritti in linguaggi diversi si possano comporre senza raccordi scritti a mano. È la [base di WASI 0.2 e 0.3](https://component-model.bytecodealliance.org/) ed è supportato da Wasmtime, ma come standard è ancora giovane: nel processo del W3C è una proposta in [fase 1](https://github.com/WebAssembly/proposals), sviluppata in modo incrementale attraverso le versioni di WASI. Né i browser né Node eseguono componenti in modo nativo (`node:wasi` si ferma alla Preview 1); per usarli da JavaScript c'è [jco](https://github.com/bytecodealliance/jco), che traduce un componente in ES modules eseguibili in Node e nel browser.

## Codice nativo senza Wasm: gli addon Node-API

WebAssembly non è l'unico modo di eseguire codice nativo da Node. Il più antico è l'**addon**: secondo la [documentazione](https://nodejs.org/api/addons.html), una libreria condivisa a collegamento dinamico (un file con estensione `.node`, scritto di solito in C o C++) che si carica con `require()` come un modulo qualsiasi e fa da ponte fra JavaScript e codice nativo. Delle tre strade per scriverne uno (le altre due sono la libreria `nan` e l'uso diretto delle parti interne di V8, libuv e Node), quella raccomandata è [**Node-API**](https://nodejs.org/api/n-api.html), un'interfaccia mantenuta da Node stesso e indipendente da V8. Il suo pregio principale è la stabilità dell'*ABI* (*Application Binary Interface*, il contratto a livello di codice compilato): un addon compilato per una versione principale di Node continua a funzionare nelle successive senza essere ricompilato. Chi scrive in Rust usa di solito [NAPI-RS](https://napi.rs/), un framework per costruire addon Node-API precompilati, adottato fra gli altri da SWC e Rollup.

Il prezzo dell'addon è la **distribuzione**. Un file `.node` contiene codice macchina per un sistema operativo e un processore precisi, quindi lo stesso pacchetto ha bisogno di un binario diverso per macOS ARM, Linux x86, Windows e così via. La strada storica è compilarlo durante l'installazione con [`node-gyp`](https://nodejs.org/api/n-api.html#building), che è incluso in npm ma richiede che sulla macchina di chi installa ci siano Python e un compilatore C/C++: una fonte classica di installazioni fallite. Per evitarlo si pubblicano [binari precompilati](https://nodejs.org/api/n-api.html#uploading-precompiled-binaries), e lo schema oggi più diffuso sfrutta npm stesso. Il pacchetto principale elenca fra le sue [`optionalDependencies`](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#optionaldependencies) un pacchetto per ogni piattaforma, e ciascuno di questi dichiara nei campi [`os` e `cpu`](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#os) (e, su Linux, `libc`) dove può girare. npm installa solo quello compatibile con `process.platform` e `process.arch` e salta gli altri senza errori, perché le dipendenze opzionali possono fallire.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 700 240" role="img" aria-label="Due modi di distribuire codice nativo: a sinistra un addon Node-API, il pacchetto lightningcss con optionalDependencies verso tre pacchetti per piattaforma, darwin-arm64, linux-x64-gnu e win32-x64-msvc, di cui npm installa solo quello adatto alla macchina; a destra un pacchetto Wasm con un solo file .wasm che gira su macOS, Linux, Windows e nel browser" style="width:100%;max-width:700px;height:auto;color:inherit"><defs><marker id="n10-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="180" y="24" font-size="12" text-anchor="middle" font-weight="700">addon nativo (Node-API)</text><rect x="95" y="38" width="170" height="46" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="180" y="57" font-size="11" text-anchor="middle" font-weight="700" font-family="ui-monospace,Menlo,monospace">lightningcss</text><text x="180" y="74" font-size="9.5" text-anchor="middle" opacity=".75" font-family="ui-monospace,Menlo,monospace">optionalDependencies</text><line x1="150" y1="86" x2="76" y2="130" stroke="currentColor" stroke-width="1.4" marker-end="url(#n10-c)"/><line x1="180" y1="86" x2="180" y2="130" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" opacity=".55" marker-end="url(#n10-c)"/><line x1="210" y1="86" x2="284" y2="130" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3" opacity=".55" marker-end="url(#n10-c)"/><rect x="20" y="134" width="100" height="36" rx="7" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8"/><text x="70" y="156" font-size="9.5" text-anchor="middle" font-family="ui-monospace,Menlo,monospace">darwin-arm64</text><rect x="130" y="134" width="100" height="36" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3" stroke-dasharray="5 3" opacity=".6"/><text x="180" y="156" font-size="9.5" text-anchor="middle" opacity=".7" font-family="ui-monospace,Menlo,monospace">linux-x64-gnu</text><rect x="240" y="134" width="100" height="36" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.3" stroke-dasharray="5 3" opacity=".6"/><text x="290" y="156" font-size="9.5" text-anchor="middle" opacity=".7" font-family="ui-monospace,Menlo,monospace">win32-x64-msvc</text><text x="180" y="196" font-size="10.5" text-anchor="middle" opacity=".8">npm installa solo il binario</text><text x="180" y="211" font-size="10.5" text-anchor="middle" opacity=".8">adatto a os e cpu della macchina</text><line x1="355" y1="16" x2="355" y2="224" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 4" opacity=".4"/><text x="527" y="24" font-size="12" text-anchor="middle" font-weight="700">WebAssembly</text><rect x="442" y="38" width="170" height="46" rx="8" fill="var(--link,#5fa04e)" fill-opacity=".22" stroke="currentColor" stroke-width="1.8"/><text x="527" y="57" font-size="11" text-anchor="middle" font-weight="700">pacchetto Wasm</text><text x="527" y="74" font-size="9.5" text-anchor="middle" opacity=".8">un solo file .wasm</text><line x1="497" y1="86" x2="415" y2="130" stroke="currentColor" stroke-width="1.4" marker-end="url(#n10-c)"/><line x1="517" y1="86" x2="491" y2="130" stroke="currentColor" stroke-width="1.4" marker-end="url(#n10-c)"/><line x1="537" y1="86" x2="565" y2="130" stroke="currentColor" stroke-width="1.4" marker-end="url(#n10-c)"/><line x1="557" y1="86" x2="639" y2="130" stroke="currentColor" stroke-width="1.4" marker-end="url(#n10-c)"/><rect x="380" y="134" width="66" height="36" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="413" y="156" font-size="10.5" text-anchor="middle">macOS</text><rect x="456" y="134" width="66" height="36" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="489" y="156" font-size="10.5" text-anchor="middle">Linux</text><rect x="532" y="134" width="66" height="36" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="565" y="156" font-size="10.5" text-anchor="middle">Windows</text><rect x="608" y="134" width="66" height="36" rx="7" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.5"/><text x="641" y="156" font-size="10.5" text-anchor="middle">browser</text><text x="527" y="196" font-size="10.5" text-anchor="middle" opacity=".8">lo stesso file gira ovunque</text><text x="527" y="211" font-size="10.5" text-anchor="middle" opacity=".8">ci sia un motore Wasm</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Due modi di distribuire codice nativo. L'<strong>addon</strong> richiede un binario per ogni combinazione di sistema e processore, e npm sceglie fra le dipendenze opzionali quello giusto (qui su un Mac con processore ARM). Il <strong>modulo Wasm</strong> è un file solo, valido su ogni piattaforma e anche nel browser, al prezzo di un po' di velocità e di un accesso al sistema mediato dall'ospite.</figcaption>
</figure>

Le due strade si confrontano così.

| | Addon Node-API | WebAssembly |
|---|---|---|
| Velocità | piena velocità nativa del processore | vicina al nativo; ogni passaggio fra JavaScript e Wasm ha un costo |
| Accesso al sistema | completo: file, rete, thread, librerie del sistema | solo ciò che l'ospite concede tramite gli import (o WASI) |
| Distribuzione | un binario per ogni combinazione di sistema e processore | un solo file `.wasm` per tutte le piattaforme |
| Installazione | compilazione con Python e C/C++, oppure binari precompilati per piattaforma | nessuna toolchain: è un file come un altro |
| Dove gira | Node, non nel browser | browser, Node e ogni ospite con un motore Wasm |
| Sicurezza | gira con tutti i permessi del processo | isolato nella sandbox della propria memoria |

## Perché conta per chi fa frontend

Il motivo più concreto per conoscere questi meccanismi è che il tooling quotidiano ne è pieno, e i due modelli convivono spesso nello stesso strumento. [SWC](https://swc.rs/docs/usage/wasm), il compilatore in Rust descritto nel <a href="../glossario/#/docs/transpiler?id=swc" target="_blank" rel="noopener">glossario alla voce SWC</a>, arriva in Node come addon nativo: il pacchetto `@swc/core` installa un file `.node` per la piattaforma della macchina, mentre `@swc/wasm-web` ne offre una versione WebAssembly per trasformare il codice direttamente nel browser. [Lightning CSS](https://lightningcss.dev/), il parser e minificatore CSS scritto in Rust, fa lo stesso: il pacchetto `lightningcss` installa l'addon adatto alla piattaforma, mentre `lightningcss-wasm` [funziona in Deno e nel browser](https://lightningcss.dev/docs.html#from-deno-or-in-browser), con qualche API in meno. Da Rollup 4 anche Rollup include codice nativo installato come dipendenza opzionale e, sui sistemi per cui non esiste un binario, la [guida alla migrazione](https://rollupjs.org/migration/#general-changes) indica `@rollup/wasm-node` come sostituto indipendente dalla piattaforma.

esbuild, descritto nel <a href="../glossario/#/docs/bundler?id=esbuild" target="_blank" rel="noopener">glossario alla voce esbuild</a>, è scritto in Go e segue lo stesso schema con un eseguibile nativo per piattaforma, come `@esbuild/darwin-arm64`. Offre anche il pacchetto `esbuild-wasm`, ma la sua [documentazione](https://esbuild.github.io/getting-started/#wasm) è netta: la versione WebAssembly è molto più lenta, spesso di un ordine di grandezza, e va usata solo quando non ci sono alternative. È la regola che emerge da tutti questi esempi: **il binario nativo è la strada principale in Node**, Wasm è la versione portabile per il browser e per le piattaforme non coperte.

Questo spiega anche alcuni errori tipici. Se `node_modules` viene copiato da una macchina a un'altra (da un Mac a un container Linux, per esempio) o installato con `npm install --omit=optional`, il binario della piattaforma giusta manca e lo strumento si ferma all'avvio lamentando un modulo nativo mancante. La soluzione è reinstallare le dipendenze sulla macchina che le userà, così che npm scelga il pacchetto adatto. Come si comportano gli altri runtime, Deno e Bun, è argomento del [[11-runtime-alternativi|capitolo 11]].

> [!tip]
> WebAssembly è un bersaglio di compilazione portabile e isolato: un modulo dichiara import ed export, lavora su una memoria lineare che JavaScript può leggere, e non tocca né il DOM né il sistema se non tramite l'ospite. In Node lo si carica con `readFile()` più `WebAssembly.instantiate()` (o, da Node 24.5, con un `import` diretto ancora sperimentale), nel browser con `instantiateStreaming()`. Per il codice nativo in Node la strada principale restano i binari precompilati per piattaforma (addon Node-API o eseguibili, scelti da npm fra le dipendenze opzionali); Wasm è la versione che gira ovunque.

## Ripasso lampo

<details>
<summary>Che cosa significa che WebAssembly è un formato binario per una macchina virtuale basata su pila?</summary>

Che un file `.wasm` contiene istruzioni per un processore immaginario, definito dalla specifica, che il motore del posto (V8 in Node e in Chrome) traduce nel codice macchina reale: per questo lo stesso binario gira ovunque. *Basata su pila* vuol dire che le istruzioni prendono gli operandi da una pila di valori e vi lasciano il risultato, come `i32.add` che toglie due interi e deposita la somma.

</details>

<details>
<summary>Che differenza c'è fra modulo e istanza, e che ruolo hanno import ed export?</summary>

Il modulo è il binario compilato, senza stato; l'istanza è il modulo in funzione, con la propria memoria e i valori ricevuti. Gli import sono ciò che il modulo chiede all'esterno (per esempio funzioni JavaScript) e vanno forniti all'istanziazione, pena un `WebAssembly.LinkError`; gli export sono ciò che offre, e compaiono in `instance.exports` come normali funzioni JavaScript.

</details>

<details>
<summary>Se Wasm conosce solo numeri, come passa una stringa a JavaScript?</summary>

Scrive i byte della stringa nella propria memoria lineare e passa due numeri: l'indirizzo d'inizio e la lunghezza. JavaScript legge quei byte con un `Uint8Array` costruito su `memory.buffer` e li decodifica con `TextDecoder`. Le toolchain come `wasm-bindgen` ed Emscripten generano in automatico questo codice di raccordo.

</details>

<details>
<summary>Perché nel browser si usa <code>instantiateStreaming()</code> e in Node, per un file locale, <code>instantiate()</code>?</summary>

`instantiateStreaming()` riceve la risposta di un `fetch()` e compila mentre i byte arrivano dalla rete, purché il server invii il tipo MIME `application/wasm`. In Node un file locale non passa dalla rete: lo si legge con `readFile()` di `node:fs/promises` e se ne passano i byte a `WebAssembly.instantiate()`. Da Node 24.5 c'è anche l'import diretto `import { somma } from './somma.wasm'`, ancora sperimentale.

</details>

<details>
<summary>Perché esbuild o Lightning CSS installano un pacchetto diverso per ogni piattaforma, e quando conviene la loro versione Wasm?</summary>

Perché il codice nativo (un eseguibile Go per esbuild, un addon Node-API per Lightning CSS) è compilato per un sistema e un processore precisi: il pacchetto principale li elenca come `optionalDependencies` e npm installa solo quello adatto a `os` e `cpu` della macchina. La versione Wasm è un file unico che gira ovunque, anche nel browser, ma è più lenta: si usa nel browser o sulle piattaforme senza binario nativo.

</details>
