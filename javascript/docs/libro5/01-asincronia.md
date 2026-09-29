# Asincronia: adesso e dopo

Ogni programma non banale scritto in JavaScript deve gestire il gap temporale tra "ora" e "dopo": il momento in cui una richiesta viene avviata e il momento in cui la risposta arriva, il momento in cui un timer viene impostato e quello in cui scatta. Questo gap è il cuore dell'**asincronia** (async programming).

Il meccanismo tradizionale per gestirlo è il **callback** — una funzione passata come argomento che verrà chiamata in futuro quando un'operazione è pronta.

---

## Il programma in chunk

Un programma JS è composto da più **chunk** (frammenti): uno viene eseguito adesso, gli altri vengono eseguiti dopo in risposta a eventi. La forma più comune di chunk è la funzione.

```js
/* Ajax sincrono: non funziona come ci si aspetta */
var data = ajax("http://some.url.1");
console.log(data); /* undefined — la risposta non è ancora arrivata */

/* Ajax con callback: la risposta arriva nel chunk "dopo" */
ajax("http://some.url.1", function myCallback(data) {
    console.log(data); /* eseguito dopo, quando la risposta è pronta */
});
```

Il chunk "adesso" comprende la chiamata ad `ajax()` e la registrazione del callback. Il chunk "dopo" è il corpo del callback — separato nel tempo dall'evento "risposta ricevuta".

```js
function now() { return 21; }
function later() {
    answer = answer * 2;
    console.log("Meaning of life:", answer);
}
var answer = now();
setTimeout(later, 1000);

/* Chunk "adesso": definizioni + answer = 21 + setTimeout */
/* Chunk "dopo" (eseguito a 1000ms): answer = 42 + console.log */
```

**Async console**: `console.log()` non è parte dello standard JS — è fornito dall'ambiente host (browser, Node.js). In alcune condizioni, il browser può posticipare l'output di I/O in background. Se si fa `console.log(obj)` e poi si modifica `obj`, si potrebbe vedere la versione modificata nella console. Per ispezionare lo stato in un momento preciso, usare breakpoint o `JSON.stringify()` per serializzare il valore.

---

## Call stack e mono-thread

*➕ Fuori dal libro — YDKJS cita il call stack solo di sfuggita (come limite, «Maximum call stack size exceeded», e come stack frame parlando di tail call optimization nel capitolo sulla metaprogrammazione), senza mai ricostruirne il ruolo nel modello di esecuzione. Questa sezione colma quel passaggio, perché è la metà che rende comprensibile l'event loop qui sotto.*

Prima di vedere chi decide *quando* parte un chunk, conviene capire **come** un chunk viene eseguito. La struttura che se ne occupa è il **call stack** (la pila delle chiamate): l'elenco, sempre aggiornato, di quali funzioni sono in corso in questo istante e in quale ordine si sono chiamate a vicenda.

Il funzionamento è quello di una pila di piatti. A ogni chiamata di funzione il motore vi **impila** un *frame*, il blocchetto che custodisce parametri, variabili locali e il punto a cui tornare; quando la funzione restituisce, il frame viene **tolto dalla cima** e il controllo torna a chi l'aveva chiamata. L'ultimo entrato è il primo a uscire. Come quei frame occupino concretamente la memoria è descritto in <a href="../glossario/#/docs/memoria?id=memoria-stack-e-heap" target="_blank" rel="noopener">glossario · Stack e heap</a>.

```js
function bar() { console.log("dentro bar"); }
function foo() { bar(); }
foo();

/* Evoluzione della pila, con la cima a destra:
   [ main ]              → parte il programma
   [ main, foo ]         → foo() chiamata
   [ main, foo, bar ]    → bar() chiamata da foo
   [ main, foo ]         → bar ha restituito: frame rimosso
   [ main ]              → foo ha restituito
   [ ]                   → pila vuota                     */
```

Qui sta il significato della frase «JavaScript è **mono-thread**» (*single-threaded*): esiste **un solo call stack**, quindi si esegue **una cosa per volta**. Da questo discende direttamente il *run-to-completion* descritto più avanti — una funzione non può essere interrotta a metà, perché finché il suo frame sta sulla pila nessun altro codice può prenderne il posto.

E da questo discende anche la regola che tiene insieme le due metà del modello, altrimenti invisibile: **l'event loop preleva il prossimo evento dalla coda solo quando il call stack è vuoto.** Un callback non si intromette mai in mezzo al codice in corso; aspetta che la pila si sia svuotata.

Resta l'equivoco più diffuso, che conviene sciogliere subito: **«JavaScript è mono-thread» non significa «il browser è mono-thread»**. Il motore JS ha una sola pila, ma l'ambiente che lo ospita no: timer, richieste di rete e ascolto degli eventi del DOM sono gestiti dal browser **altrove**, su thread propri. È esattamente per questo che l'asincronia è possibile senza che il linguaggio abbia i thread — quando si chiama `setTimeout`, il conteggio non avviene sulla pila ma nell'ambiente host, che alla scadenza si limita a **mettere il callback in coda**. Il codice JS non attende mai: delega e tira avanti.

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 600 330" role="img" aria-label="Il modello di esecuzione di JavaScript: un solo call stack con i frame impilati, le Web API del browser su altri thread, la coda dei callback e l'event loop che rifornisce la pila solo quando è vuota" style="width:100%;max-width:580px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif" fill="currentColor"><text x="300" y="22" font-size="12.5" text-anchor="middle" font-weight="700">Un solo call stack, e il loop che lo rifornisce quando è vuoto</text><rect x="36" y="64" width="156" height="166" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><text x="114" y="84" font-size="11" text-anchor="middle" font-weight="700">CALL STACK</text><text x="114" y="98" font-size="8.5" text-anchor="middle" opacity=".7">una cosa per volta</text><rect x="52" y="112" width="124" height="30" rx="5" fill="var(--link,#78716c)" fill-opacity=".18" stroke="currentColor" stroke-width="1.5"/><text x="114" y="132" font-size="10.5" text-anchor="middle" font-weight="700">bar()</text><rect x="52" y="148" width="124" height="30" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="114" y="168" font-size="10.5" text-anchor="middle">foo()</text><rect x="52" y="184" width="124" height="30" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="114" y="204" font-size="10.5" text-anchor="middle">main</text><rect x="392" y="64" width="172" height="92" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 3"/><text x="478" y="88" font-size="11" text-anchor="middle" font-weight="700">WEB API</text><text x="478" y="104" font-size="8.5" text-anchor="middle" opacity=".75">altri thread del browser</text><text x="478" y="130" font-size="9.5" text-anchor="middle">timer · rete · eventi DOM</text><path d="M192 120 L385 104" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M388 104 L380.3 108.1 L379.7 101.2 Z" fill="currentColor"/><text x="290" y="96" font-size="9" text-anchor="middle" font-weight="600">setTimeout, fetch…</text><path d="M478 158 L478 241" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M478 244 L474.5 236 L481.5 236 Z" fill="currentColor"/><text x="470" y="205" font-size="9" text-anchor="end" opacity=".85">quando è pronto</text><text x="400" y="242" font-size="9.5" text-anchor="middle" font-weight="600" opacity=".75">coda dei callback</text><rect x="236" y="250" width="328" height="52" rx="8" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.6"/><rect x="252" y="262" width="62" height="28" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="283" y="281" font-size="9.5" text-anchor="middle">cb1</text><rect x="322" y="262" width="62" height="28" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="353" y="281" font-size="9.5" text-anchor="middle">cb2</text><rect x="392" y="262" width="62" height="28" rx="5" fill="var(--bg,#ffffff)" stroke="currentColor" stroke-width="1.4"/><text x="423" y="281" font-size="9.5" text-anchor="middle">cb3</text><text x="492" y="282" font-size="12" text-anchor="middle" opacity=".7">…</text><path d="M232 276 C 170 276 118 272 112 242" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M112 234 L108.5 242 L115.5 242 Z" fill="currentColor"/><text x="168" y="300" font-size="10" text-anchor="middle" font-weight="700">event loop</text><text x="168" y="314" font-size="8.5" text-anchor="middle" opacity=".8">solo se lo stack è vuoto</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Sulla pila si esegue solo il frame in <strong>cima</strong> (evidenziato): gli altri attendono che torni. Le operazioni asincrone non stanno sulla pila — vengono affidate alle <strong>Web API</strong> del browser, che girano su altri thread e a operazione conclusa depositano il callback nella <strong>coda</strong>. L&apos;<strong>event loop</strong> la travasa nella pila un elemento per volta, e <strong>solo quando la pila è vuota</strong>.</figcaption>
</figure>

Due conseguenze pratiche chiudono il quadro. La prima è il **blocco**: siccome il loop aspetta la pila vuota, un calcolo sincrono lungo tiene il proprio frame in cima e impedisce a *qualunque* altro evento di essere servito — clic e ridisegni compresi. È la ragione tecnica per cui una pagina «si congela», e il rimedio è la concorrenza cooperativa descritta più avanti. La seconda è lo **stack overflow**: la pila ha una profondità massima, decisa dal motore e non dalla specifica, quindi una ricorsione troppo profonda la esaurisce e produce il classico `RangeError: Maximum call stack size exceeded`.

---

## Event loop

Una claim sorprendente: fino a ES6, JavaScript **non aveva nozione nativa di asincronia**. Il JS engine esegue un chunk di codice alla volta, quando viene invocato. Chi lo invoca? L'ambiente host.

I browser (e Node.js) hanno un meccanismo chiamato **event loop** che gestisce l'esecuzione sequenziale di chunk nel tempo. In pseudocodice:

```js
var eventQueue = []; /* coda FIFO degli eventi in attesa */

while (true) {         /* il loop gira indefinitamente */
    if (eventQueue.length > 0) {
        var event = eventQueue.shift(); /* prende il prossimo evento */
        try { event(); }               /* lo esegue */
        catch(err) { reportError(err); }
    }
}
```

Ogni iterazione del loop si chiama **tick**. A ogni tick, se c'è un evento in coda, viene estratto ed eseguito.

**`setTimeout()` non inserisce direttamente nella coda**: imposta un timer nell'ambiente host. Quando il timer scade, l'host inserisce il callback nella coda degli eventi. Se la coda ha già 20 eventi, il callback aspetta. Questo spiega perché `setTimeout(fn, 100)` non garantisce esecuzione esatta a 100ms — garantisce solo che non parte prima di 100ms.

ES6 ha formalizzato la specifica dell'event loop direttamente nello standard JS (non più solo responsabilità dell'host), principalmente per supportare le Promise (Cap. 3).

---

## Parallelismo vs asincronia

**Async** riguarda il gap temporale tra ora e dopo. **Parallelismo** riguarda cose che accadono letteralmente nello stesso istante.

I thread paralleli condividono memoria e possono interleave a livello di singola istruzione macchina — questo porta a race condition a basso livello. JavaScript è **single-threaded**: non condivide mai memoria tra thread, eliminando questa categoria di problemi.

Ma JS ha comunque non-determinismo a livello di funzione: se due callback (`foo` e `bar`) sono registrati per due eventi Ajax, l'ordine in cui arrivano le risposte determina quale viene chiamato per primo.

```js
var a = 20;
function foo() { a = a + 1; }
function bar() { a = a * 2; }

ajax("http://url.1", foo);
ajax("http://url.2", bar);

/* Se foo prima: a = (20+1)*2 = 42 */
/* Se bar prima: a = (20*2)+1 = 41 */
```

Questo nondeterminismo a livello di funzione si chiama **race condition**.

### Run-to-completion

Ogni funzione in JS è **atomica**: una volta iniziata, viene eseguita per intero prima che qualsiasi altra funzione possa partire. Non c'è interruzione a metà (`foo` non può essere interrotta da `bar` nel mezzo di un'istruzione). Questo limita il nondeterminismo a solo 2 possibili outcome (foo-poi-bar o bar-poi-foo), invece dei miliardi possibili con i thread.

---

## Concorrenza

La **concorrenza** (concurrency) è quando due o più "processi" logici sono attivi nello stesso intervallo di tempo, anche se le singole operazioni avvengono in sequenza nell'event loop.

Esempio: un feed di notizie con scroll infinito ha due processi concorrenti — eventi `onscroll` che lanciano richieste Ajax, e callback Ajax che renderizzano le risposte. Questi si interleave nell'event loop:

```
onscroll → request 1
onscroll → request 2
response 1              ← arriva durante gli scroll
onscroll → request 3
response 2
response 3
onscroll → request 4
...
```

Notare che `response 6` e `response 5` potrebbero arrivare fuori ordine — l'ordine di completamento delle richieste HTTP non è garantito.

### Processi non interagenti

Se due processi concorrenti operano su dati separati, il nondeterminismo è accettabile — non è un bug:

```js
var res = {};
function foo(results) { res.foo = results; }
function bar(results) { res.bar = results; }

ajax("http://url.1", foo);
ajax("http://url.2", bar);
/* foo e bar non si toccano — qualsiasi ordine va bene */
```

### Interazione e gate pattern

Quando i processi condividono stato, serve coordinazione. Il **gate** (cancello) è un pattern che aspetta che tutte le condizioni necessarie siano soddisfatte prima di procedere:

```js
var a, b;
function foo(x) {
    a = x * 2;
    if (a && b) baz(); /* attende sia a che b */
}
function bar(y) {
    b = y * 2;
    if (a && b) baz(); /* attende sia a che b */
}
function baz() { console.log(a + b); }

ajax("http://url.1", foo);
ajax("http://url.2", bar);
```

### Latch pattern

Il **latch** (chiavistello) permette solo al primo processo che arriva di procedere, ignorando i successivi:

```js
var a;
function foo(x) {
    if (!a) { a = x * 2; baz(); } /* solo il primo vince */
}
function bar(x) {
    if (!a) { a = x / 2; baz(); } /* ignorato se a è già settata */
}
function baz() { console.log(a); }

ajax("http://url.1", foo);
ajax("http://url.2", bar);
```

---

## Cooperative concurrency

La **concorrenza cooperativa** si preoccupa non dell'interazione tra processi, ma di non monopolizzare l'event loop. Un processo long-running che tiene occupato il thread impedisce a qualsiasi altro evento (click, scroll, altre risposte Ajax) di essere processato.

La soluzione è spezzare il lavoro in **batch** e cedere il controllo all'event loop tra un batch e l'altro con `setTimeout(fn, 0)`:

```js
var res = [];
function response(data) {
    var chunk = data.splice(0, 1000); /* processa massimo 1000 elementi */
    res = res.concat(chunk.map(val => val * 2));

    if (data.length > 0) {
        /* cede il controllo all'event loop, poi riprende */
        setTimeout(() => response(data), 0);
    }
}

ajax("http://url.1", response);
ajax("http://url.2", response);
```

`setTimeout(fn, 0)` non inserisce immediatamente nell'event loop — imposta un timer con scadenza minima, che inserirà il callback alla prossima opportunità. Non garantisce ordinamento tra chiamate consecutive, ma è l'idioma standard per "cedi il controllo e riprendi dopo".

---

## Job queue (ES6)

ES6 introduce la **Job queue**, un livello di priorità superiore all'event loop queue. Ogni tick dell'event loop ha una Job queue associata: i Job vengono eseguiti **prima** del prossimo tick dell'event loop.

Analogia: la coda degli eventi è come fare la fila alle giostre (finita una, si torna in coda); la Job queue è come saltare la coda e risalire subito sulla stessa giostra.

```js
console.log("A");

setTimeout(function() {
    console.log("B"); /* enqueued nell'event loop */
}, 0);

/* schedule() = API ipotetica per la Job queue (simile a Promise) */
schedule(function() {
    console.log("C");
    schedule(function() {
        console.log("D"); /* Job aggiunto alla Job queue corrente */
    });
});

/* Output: A C D B */
/* C e D vanno prima di B perché la Job queue si svuota prima del prossimo tick */
```

Le **Promise** (Cap. 3) usano la Job queue — i loro callback hanno priorità rispetto agli eventi nell'event loop queue, il che è fondamentale per comprendere il loro comportamento di scheduling.

---

## Riordinamento degli statement

Il JS engine può riordinare gli statement durante la compilazione per ottimizzare, purché il risultato osservabile sia identico. Questo avviene sotto il cofano — non dovrebbe mai essere percepibile dall'esterno.

```js
var a = 10;
var b = 30;
a = a + 1;
b = b + 1;
console.log(a + b); // 42

/* L'engine potrebbe eseguire questo come: */
console.log(42); /* se a e b non vengono più usati dopo */
```

Il riordinamento è sicuro solo quando non ci sono side effect osservabili (chiamate a funzione, getter, I/O). Con side effect, l'engine è costretto a rispettare l'ordine dichiarato.

Questo concetto (operazioni atomicamente sicure che però possono essere riordinate internamente) è una metafora utile per pensare alla concorrenza e al nondeterminismo nell'async JS.

---

## Ripasso veloce

**Now vs Later**: ogni programma è diviso in chunk "adesso" e chunk "dopo". Il callback è il meccanismo base per eseguire codice "dopo".

**Call stack**: una sola pila, quindi una funzione per volta — a ogni chiamata si impila un frame, al `return` si toglie. L'event loop preleva il prossimo evento **solo a pila vuota**: da qui il run-to-completion, e il fatto che un calcolo lungo congeli la pagina. Mono-thread è il **linguaggio**, non il browser: timer, rete ed eventi DOM girano su altri thread dell'host.

**Event loop**: l'ambiente host (browser/Node.js) mantiene una coda di eventi. Il JS engine esegue un chunk per tick. `setTimeout` inserisce nella coda solo allo scadere del timer — non immediatamente.

**Single-threaded**: JS non ha race condition a livello di istruzione. Ha però nondeterminismo a livello di funzione (quale callback viene chiamato prima).

**Run-to-completion**: ogni funzione si esegue per intero prima che un'altra possa iniziare.

**Concorrenza**: due processi logici attivi nello stesso intervallo di tempo, interleaved nell'event loop.
- **Gate**: `if (a && b)` — aspetta che tutte le condizioni siano pronte.
- **Latch**: `if (!a)` — lascia passare solo il primo.

**Cooperative concurrency**: spezzare task lunghi in batch con `setTimeout(fn, 0)` per non monopolizzare l'event loop.

**Job queue**: i Job (usati dalle Promise) si eseguono prima del prossimo tick dell'event loop — priorità superiore all'event queue normale.

```js
/* Gate pattern */
var a, b;
function foo(x) { a = x; if (a && b) done(); }
function bar(y) { b = y; if (a && b) done(); }

/* Latch pattern */
var first;
function foo(x) { if (!first) { first = x; done(); } }

/* Cooperative batching */
function processChunk(data) {
    var chunk = data.splice(0, 1000);
    /* ...processa chunk... */
    if (data.length > 0) setTimeout(() => processChunk(data), 0);
}

/* Job queue (Promise) vs Event queue (setTimeout) */
Promise.resolve().then(() => console.log("Job — prima"));
setTimeout(() => console.log("Event — dopo"), 0);
/* "Job — prima" stampa prima */
```

---

## Domande

<details>
<summary>Se JavaScript è mono-thread, come riesce a fare più cose insieme?</summary>

L'equivoco sta nel soggetto: mono-thread è il **motore JavaScript**, non l'ambiente che lo ospita. Il motore ha un solo <code>call stack</code>, quindi esegue una funzione per volta e non può essere interrotto a metà. Le operazioni che richiedono attesa, però, non vengono svolte sulla pila: `setTimeout`, le richieste di rete e l'ascolto degli eventi del DOM sono affidati alle **Web API** del browser, che hanno thread propri. Il codice JS delega e prosegue immediatamente; quando l'operazione è conclusa, l'host deposita il callback nella coda, e l'event loop lo travasa sulla pila — ma **solo quando la pila è vuota**. Il parallelismo quindi esiste davvero, ma sta nell'ambiente; il codice JavaScript resta sequenziale.

</details>

<details>
<summary>Perché un ciclo sincrono molto lungo «congela» la pagina?</summary>

Perché l'event loop preleva il prossimo evento dalla coda **soltanto quando il call stack è vuoto**. Un calcolo sincrono lungo mantiene il proprio frame in cima alla pila per tutta la durata, quindi la pila non si svuota mai e il loop non arriva mai a servire ciò che si è accumulato in coda: clic, scroll, risposte Ajax e persino i ridisegni dell'interfaccia restano in attesa. La pagina non è «rotta», è in fila dietro al calcolo. Il rimedio è la **cooperative concurrency**: spezzare il lavoro in batch e cedere il controllo tra un batch e l'altro con `setTimeout(fn, 0)`, così la pila si svuota a intervalli regolari e gli altri eventi trovano spazio.

</details>

<details>
<summary>Perché `setTimeout(fn, 100)` non garantisce l'esecuzione esatta a 100ms?</summary>

`setTimeout` non inserisce il callback direttamente nella coda degli eventi — imposta un timer nell'ambiente host. Quando il timer scade, l'host inserisce il callback nella coda. Se in quel momento la coda ha già altri eventi in attesa, il callback deve aspettare il proprio turno. Il risultato è che il callback non parte prima di 100ms (la garanzia minima), ma può partire dopo — dipende da quanto lavoro c'è davanti nella coda. In pratica, `setTimeout(fn, 0)` significa "inserisci nella coda appena possibile, non immediatamente".

</details>

<details>
<summary>Qual è la differenza tra async e parallelismo?</summary>

**Async** descrive il gap temporale tra l'avvio di un'operazione e il suo completamento — la stessa operazione procede in modo non-bloccante, il controllo torna al chiamante mentre il risultato arriva in un secondo momento. **Parallelismo** descrive operazioni che accadono letteralmente nello stesso istante, su processori o core diversi. JavaScript è async ma single-threaded: non esegue mai due funzioni in parallelo (non c'è interleaving di istruzioni). La concorrenza in JS è task-level (quale callback parte prima), non instruction-level (due funzioni che girano contemporaneamente sullo stesso dato).

</details>

<details>
<summary>Cos'è il gate pattern e quando serve?</summary>

Il gate è un pattern di coordinazione per processi concorrenti che condividono dati ma non hanno garanzie su quale completa prima. Consiste in un controllo condizionale che verifica che tutte le condizioni necessarie siano soddisfatte prima di procedere: `if (a && b) doSomething()`. Ogni processo, quando completa, setta la propria variabile e poi controlla se anche l'altra è pronta. Il gate si "apre" solo quando entrambe le condizioni sono vere. Senza gate, chiamare `doSomething()` prima che tutti i dati siano disponibili produce errori o risultati incompleti.

</details>

<details>
<summary>Cos'è la Job queue e come differisce dall'event loop queue?</summary>

L'event loop queue è la coda principale: ogni tick del loop estrae un evento e lo esegue. La Job queue è una coda secondaria associata a ogni tick: i Job vengono eseguiti alla fine del tick corrente, prima che il loop proceda al tick successivo. È come avere priorità assoluta sulla coda normale. Le Promise usano la Job queue per i loro callback `.then()` — questo spiega perché una Promise già risolta notifica il suo handler prima che un `setTimeout(fn, 0)` registrato nello stesso tick possa eseguire.

</details>

<details>
<summary>Perché la cooperative concurrency con `setTimeout(fn, 0)` è utile per task lunghi?</summary>

Un task long-running che occupa il thread per molti secondi (es. processare 10 milioni di record) blocca l'intero event loop: nessun altro evento può essere processato, nessun UI update, nessun click dell'utente. Spezzare il lavoro in batch con `setTimeout(fn, 0)` tra un batch e l'altro cede il controllo all'event loop tra ogni batch, permettendo agli altri eventi di essere processati. Il task riprende al prossimo tick disponibile. Il costo è un overhead minimo (il roundtrip nell'event loop), ma il beneficio è un'interfaccia reattiva e un sistema che non "congela".

</details>
