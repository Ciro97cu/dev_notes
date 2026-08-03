# Concetti di programmazione

Concetti trasversali, non legati a un linguaggio o framework specifico.

## Interoperabilità

L'interoperabilità è la capacità di sistemi, dispositivi o programmi diversi di **lavorare insieme** scambiando dati o servizi, tipicamente appoggiandosi a standard o protocolli comuni. Componenti interoperabili comunicano e collaborano senza attriti anche se sviluppati da parti diverse o con tecnologie diverse (es. un client JavaScript e un backend Java che dialogano via JSON su HTTP).

## Funzione pura

Una funzione pura rispetta due condizioni:
1. **Stesso input → stesso output**: dato lo stesso argomento restituisce sempre lo stesso risultato.
2. **Nessun side effect**: non modifica stato esterno e non dipende da stato esterno mutabile.

```js
// pura: dipende solo dagli argomenti, non tocca nulla fuori
const somma = (a, b) => a + b;

// impura: dipende da stato esterno e lo modifica
let totale = 0;
const aggiungi = (x) => { totale += x; };
```

La purezza rende il codice **prevedibile** e facile da testare (nessun contesto da simulare). È un pilastro della programmazione funzionale ed è alla base, ad esempio, dei *reducer* di Redux/NgRx.

## Immutabilità

L'immutabilità è il principio per cui un oggetto, una volta creato, **non viene modificato**: invece di alterarlo, si crea un **nuovo** oggetto con le modifiche desiderate.

```js
// invece di mutare:  stato.nome = 'nuovo'
const nuovoStato = { ...stato, nome: 'nuovo' }; // nuovo riferimento
```

Rende lo stato prevedibile e abilita confronti veloci per **riferimento** (*shallow comparison*): se il riferimento è cambiato, lo stato è cambiato — senza ispezionare ogni proprietà. È il motivo per cui librerie come Redux/NgRx richiedono un nuovo oggetto a ogni aggiornamento.

> [!tip]
> Nel contesto Angular/signals questo tema è approfondito nel concetto [equality-immutability](../../angular/concetti/equality-immutability.md).

## SOLID

Cinque principi di design per il codice **object-oriented** (raccolti da Robert C. Martin) per renderlo più manutenibile, estensibile e testabile:

- **S — Single Responsibility**: una classe ha **una sola responsabilità**, cioè un solo motivo per cambiare. ❌ `class User { save() {} sendEmail() {} }` → ✅ `User` + `UserRepository` (persistenza) + `Mailer` (invio).
- **O — Open/Closed**: aperta all'**estensione**, chiusa alla **modifica** (si aggiunge comportamento senza riscrivere quello esistente). ❌ `if (s.tipo === 'cerchio') … else if (s.tipo === 'quadrato') …` → ✅ ogni forma implementa `area()`: una forma nuova si aggiunge senza toccare il codice esistente.
- **L — Liskov Substitution**: un sottotipo deve poter **sostituire** il tipo base senza rompere la correttezza del programma. ❌ `class Penguin extends Bird { fly() { throw } }` → ✅ non ereditare `fly()` se il pinguino non vola.
- **I — Interface Segregation**: meglio interfacce **piccole e mirate** che una grande e generica; un client non deve dipendere da metodi che non usa. ❌ `interface Machine { print(); scan(); fax(); }` → ✅ `Printer` / `Scanner` / `Fax` separate.
- **D — Dependency Inversion**: dipendere da **astrazioni**, non da implementazioni concrete (alto e basso livello dipendono entrambi da un'interfaccia). È il principio dietro la **dependency injection**. ❌ `new EmailSender()` dentro la classe → ✅ `constructor(sender: MessageSender)` iniettato.

Sono linee guida, non dogmi: si applicano dove riducono davvero la complessità.

## DRY (Don't Repeat Yourself)

Ogni pezzo di **conoscenza** (una regola di business, una formula, una decisione) dovrebbe avere **una sola rappresentazione autorevole** nel sistema (Hunt & Thomas, *The Pragmatic Programmer*). In pratica: niente logica duplicata copia-incollata → la si estrae in una funzione/modulo, così una modifica si fa in **un punto solo**.

```js
// prima ❌ — l'aliquota "1.22" ripetuta: per cambiarla va rincorsa ovunque
const totaleCarrello = prezzo * 1.22;
const totaleFattura  = imponibile * 1.22;

// dopo ✅ — una sola fonte di verità: la si cambia in un punto solo
const IVA = 0.22;
const conIva = (n) => n * (1 + IVA);
const totaleCarrello = conIva(prezzo);
const totaleFattura  = conIva(imponibile);
```

> [!warning]
> DRY riguarda la duplicazione di **conoscenza**, non di semplice testo. Unificare a forza due frammenti che *sembrano* uguali ma cambiano per ragioni diverse crea accoppiamento dannoso: a volte "un po' di duplicazione costa meno dell'astrazione sbagliata". Utile la **rule of three**: si astrae alla terza ripetizione, non alla prima.

## KISS (Keep It Simple, Stupid)

La soluzione più semplice che risolve il problema è quasi sempre la migliore: meno parti, meno astrazioni premature, meno "intelligenza" nascosta. Il codice semplice si legge, si corregge e si cambia con meno fatica. Complicare in previsione di scenari ipotetici è tra le cause più comuni di codice fragile: prima si fa funzionare la cosa semplice, poi — solo se serve — la si evolve.

## YAGNI (You Aren't Gonna Need It)

Non si costruisce una funzionalità finché non serve davvero. Aggiungere opzioni di configurazione, generalizzazioni o livelli di astrazione "perché un giorno potrebbero servire" produce codice non usato che va comunque mantenuto, testato e compreso. Si implementa ciò che il requisito attuale richiede; l'estensione arriva quando il bisogno è concreto. È il complemento di KISS applicato alle *feature*.

## Separation of Concerns (SoC)

Ogni parte del sistema si occupa di **una** preoccupazione ben delimitata, il più possibile indipendente dalle altre: presentazione, logica di business e accesso ai dati separati; nel web, la struttura (HTML), l'aspetto (CSS) e il comportamento (JS). Separare permette di capire e modificare ogni parte in isolamento e riduce l'effetto domino di una modifica. È il principio dietro l'architettura a livelli e, alla scala della singola classe, coincide con la **Single Responsibility** di SOLID.

## Composition over Inheritance

Per riusare comportamento, comporre oggetti piccoli e focalizzati è di norma preferibile a ereditare da una gerarchia di classi. L'ereditarietà lega rigidamente il figlio al genitore (relazione "è un") e diventa fragile quando la gerarchia cresce o quando servono combinazioni di capacità. La composizione assembla invece capacità indipendenti (relazione "ha un" / "sa fare") che si combinano liberamente.

```js
// ereditarietà: rigida, e le combinazioni esplodono in sottoclassi
class AnatraCheNuotaEVola extends Animale { /* … */ }

// composizione: capacità indipendenti, assemblate al bisogno
const anatra = { ...saNuotare(), ...saVolare() };
```

È lo spirito di diversi design pattern (Strategy, Decorator) e il motivo per cui i framework moderni preferiscono comporre — hook, funzioni, servizi iniettati — invece di gerarchie di classi profonde.

## Design pattern

Un **design pattern** è una soluzione collaudata a un problema **ricorrente** di progettazione del software: non un pezzo di codice da copiare, ma uno *schema* riutilizzabile che descrive come organizzare classi e oggetti per risolvere quel problema. Il riferimento storico è il libro della **Gang of Four** (GoF, 1994), che ne cataloga 23 in tre famiglie:

- **Creazionali** — riguardano *come si creano* gli oggetti (Singleton, Factory Method, Builder…).
- **Strutturali** — *come si compongono* in strutture più grandi (Adapter, Decorator, Facade…).
- **Comportamentali** — *come collaborano e si distribuiscono le responsabilità* (Observer, Strategy…).

> [!tip]
> Molti pattern GoF oggi sono "invisibili" perché **incorporati** nel linguaggio o nel framework: l'Iterator è il `for...of`, l'Observer sono gli event listener e i signal, la Strategy è spesso solo una funzione passata come argomento. Conoscerli serve comunque a **dare un nome** a soluzioni che già si usano — e a comunicarle con una parola sola.

Di seguito i pattern più comuni. Per ciascuno: l'idea in breve, un'analogia, il **problema** concreto che affronta (con il codice *prima*) e la **soluzione** che il pattern introduce (il codice *dopo*). Per il catalogo completo, con diagrammi ed esempi in più linguaggi, il riferimento è [refactoring.guru](https://refactoring.guru/design-patterns/catalog).

### Singleton *(creazionale)*

Garantisce che di una classe esista **una sola istanza** condivisa in tutta l'applicazione, con un punto di accesso unico a essa.

🧩 **Analogia**: il governo di uno Stato — ce n'è uno solo, e tutti sanno come raggiungerlo.

❗ **Il problema**: serve una singola configurazione condivisa, ma se ogni modulo fa `new Config()` si ottengono **copie scollegate**: una modifica su una non si riflette sulle altre.

```ts
// prima ❌ — ogni modulo crea la propria Config: copie divergenti
const a = new Config(); a.tema = "scuro";
const b = new Config();  // b non sa nulla di a → b.tema è ancora "chiaro"
```

✅ **La soluzione**: è la classe stessa a custodire l'unica istanza e a restituirla sempre; il costruttore non si usa dall'esterno.

```ts
class Config {
  static #istanza: Config;        // l'unica istanza, privata
  tema = "chiaro";
  private constructor() {}        // vietato il `new` dall'esterno
  static get(): Config {
    return (Config.#istanza ??= new Config()); // creata una volta, poi riusata
  }
}

Config.get().tema = "scuro";
Config.get().tema; // "scuro" — è sempre lo stesso identico oggetto
```

⚠️ Oggi è spesso considerato un **anti-pattern**: è stato globale mascherato, accoppia tutto a `Config.get()` e complica i test (non si può sostituire con una versione finta). I framework moderni preferiscono la **dependency injection** — un servizio registrato una volta sola e **iniettato** dove serve (→ *Dependency Inversion* di SOLID). Esempio completo nel vault TypeScript: [Programmazione a oggetti](../../typescript/docs/16-oop.md).

### Factory Method *(creazionale)*

Sposta la **creazione** di un oggetto in un punto dedicato (una funzione o un metodo), così che il resto del codice — il **cliente**, cioè chi usa l'oggetto — lavori con un tipo astratto senza sapere quale classe concreta viene istanziata.

🧩 **Analogia**: si ordina "una pizza"; è la cucina a decidere come prepararla. Chi ordina non maneggia forni e impasti.

❗ **Il problema**: la scelta del tipo concreto è sparsa nel codice, ripetuta con `new` e `if` ovunque serva. Aggiungere un nuovo tipo obbliga a ritrovare e modificare tutti quei punti.

```ts
// prima ❌ — la stessa logica di scelta duplicata in ogni punto che crea un logger
if (cfg === "file") logger = new FileLogger();
else                logger = new ConsoleLogger();
// …più avanti, un altro punto ripete lo stesso if…
```

✅ **La soluzione**: una sola fabbrica decide; il cliente chiede l'astrazione `Logger` e non sa (né gli importa) quale classe sia. Un tipo nuovo si aggiunge in un punto solo (rispetta *Open/Closed*).

```ts
interface Logger { log(m: string): void; }

function creaLogger(dove: "file" | "console"): Logger {
  return dove === "file" ? new FileLogger() : new ConsoleLogger();
}

const logger = creaLogger(cfg);
logger.log("avvio"); // il cliente parla solo con l'interfaccia Logger
```

Nella forma GoF piena la scelta è affidata a **sottoclassi** che ridefiniscono il metodo-fabbrica; la funzione qui sopra è la versione quotidiana (*simple factory*).

### Builder *(creazionale)*

Costruisce un oggetto complesso **un pezzo alla volta**, con metodi che si concatenano, invece di passare tutto a un unico costruttore.

🧩 **Analogia**: comporre un panino da asporto scegliendo un ingrediente per volta, invece di elencarli tutti in un'unica ordinazione.

❗ **Il problema**: un costruttore con molti parametri (spesso facoltativi) diventa illeggibile e fragile — non si capisce cosa sia cosa, e i valori "vuoti" vanno passati comunque, nell'ordine giusto.

```ts
// prima ❌ — cosa sono null, true, 30? e per saltarne uno bisogna comunque metterlo
new Query("utenti", ["nome"], "eta > 18", null, true, 30);
```

✅ **La soluzione**: ogni opzione ha un metodo dal nome parlante; si impostano solo quelle che servono, in qualsiasi ordine, e si chiude con `build()`.

```ts
const query = new QueryBuilder()
  .from("utenti")
  .select("nome")
  .where("eta > 18")
  .build();            // le opzioni non impostate restano ai loro default
```

✅ **Quando**: un oggetto ha molte parti facoltative o va assemblato in fasi.

### Adapter *(strutturale)*

Fa da **traduttore** tra due interfacce incompatibili: avvolge un oggetto ed espone i metodi che il **cliente** si aspetta, convertendo le chiamate verso quelli reali dell'oggetto avvolto.

🧩 **Analogia**: l'adattatore di viaggio tra la spina italiana e la presa inglese.

❗ **Il problema**: il proprio codice vorrebbe chiamare `paga(euro)`, ma la libreria di pagamento esterna espone `fai_pagamento(centesimi)`. Le firme non combaciano, e legarsi ovunque a quella della libreria significa dover cambiare tutto il codice se un domani si cambia fornitore.

```ts
// prima ❌ — il codice è "sposato" alla firma della libreria esterna, ovunque paga
gatewayEsterno.fai_pagamento(euro * 100);
```

✅ **La soluzione**: un adapter incapsula la libreria ed espone l'interfaccia comoda `Pagamenti`; il resto del codice parla solo con l'adapter.

```ts
interface Pagamenti { paga(euro: number): void; }

class StripeAdapter implements Pagamenti {
  constructor(private esterno: VecchioGateway) {}
  paga(euro: number) {
    this.esterno.fai_pagamento(euro * 100); // traduce euro → centesimi
  }
}

const pagamenti: Pagamenti = new StripeAdapter(gateway);
pagamenti.paga(19.9); // per cambiare fornitore basta scrivere un altro adapter
```

### Decorator *(strutturale)*

Aggiunge funzionalità a un oggetto **avvolgendolo** in un altro che espone la **stessa interfaccia**: ogni strato aggiunge qualcosa e delega il resto all'oggetto che avvolge.

🧩 **Analogia**: vestirsi a strati — maglietta, poi maglione, poi giacca: ognuno aggiunge qualcosa e si può togliere in modo indipendente.

❗ **Il problema**: servono combinazioni di funzionalità opzionali — un flusso di dati che può essere compresso, cifrato, entrambi, in qualunque ordine. Con la sola ereditarietà servirebbe una sottoclasse per ogni combinazione: un'esplosione.

```ts
// prima ❌ — una sottoclasse per ogni combinazione possibile, ingestibile
class FlussoCompresso extends FileStream {}
class FlussoCifrato extends FileStream {}
class FlussoCompressoECifrato extends FileStream {} // …e tutte le altre
```

✅ **La soluzione**: ogni funzionalità è un decoratore che avvolge un flusso ed è a sua volta un flusso (stessa interfaccia). Si impilano liberamente, in qualsiasi ordine.

```ts
let flusso: Flusso = new FileStream(file);
flusso = new Compressione(flusso); // strato 1
flusso = new Cifratura(flusso);    // strato 2 — sempre di tipo Flusso
flusso.scrivi(dati);               // cifra → comprime → scrive su file
```

È *composition over inheritance* in azione: capacità assemblate a strati invece di gerarchie rigide.

> [!warning]
> Da non confondere con i **decorator del linguaggio** (`@log`) di TypeScript/JavaScript: sono ispirati a questa idea ma sono una feature sintattica a sé. Vedi [Decorators](../../typescript/docs/29-decorators.md) nel vault TypeScript.

### Facade *(strutturale)*

Offre un'**interfaccia unica e semplice** verso un sottosistema complesso, nascondendone le parti interne al **cliente**.

🧩 **Analogia**: il pulsante "avvia" di un'automobile — dietro c'è un sistema complicato, ma si preme un solo bottone.

❗ **Il problema**: per convertire un video il cliente dovrebbe conoscere e coordinare a mano decine di classi (codec, tracce audio, bitrate…), nell'ordine esatto. Troppa complessità esposta, e ogni cliente la ripete.

```ts
// prima ❌ — il cliente deve orchestrare tutto il sottosistema, passo per passo
const codec = CodecFactory.estrai(file);
const audio = new AudioMixer().sistema(file, codec);
const bitrate = new BitrateReader().leggi(file, codec);
// …altri dieci passaggi, in ordine preciso…
```

✅ **La soluzione**: una facciata espone un solo metodo e orchestra il sottosistema al posto del cliente.

```ts
class VideoConverter {
  converti(file: File, formato: string): File {
    /* dietro le quinte: codec, audio, bitrate… nell'ordine giusto */
    return risultato;
  }
}

new VideoConverter().converti(file, "mp4"); // il cliente vede soltanto questo
```

### Observer *(comportamentale)*

Prima il gergo: il **subject** (il "soggetto osservato") è l'oggetto il cui stato cambia; gli **observer** (osservatori) sono gli oggetti interessati a quei cambiamenti. Il pattern: il subject tiene una lista di observer e, quando cambia, li **notifica** tutti — senza sapere chi siano né cosa faranno.

🧩 **Analogia**: un canale YouTube (il *subject*) e i suoi iscritti (gli *observer*). A ogni nuovo video tutti gli iscritti ricevono la notifica; il canale non conosce i singoli iscritti, si limita a "pubblicare".

❗ **Il problema**: quando un dato cambia, più parti dell'app devono aggiornarsi (un grafico, un contatore, un log). Se è il dato stesso a chiamarle una per una, resta **accoppiato** a tutte, e aggiungere un nuovo interessato costringe a modificarlo.

```ts
// prima ❌ — lo store conosce e chiama esplicitamente ogni interessato
class Store {
  set(v) {
    this.v = v;
    grafico.aggiorna(v);   // ← accoppiato al grafico
    contatore.aggiorna(v); // ← e al contatore
    logger.scrivi(v);      // ← e al logger… e a ogni nuovo arrivato
  }
}
```

✅ **La soluzione**: gli interessati si **iscrivono** (subscribe) al subject; il subject li notifica in blocco senza conoscerli. Aggiungerne uno non tocca lo store.

```ts
class Store {
  #observers: ((v: number) => void)[] = [];        // la lista di osservatori
  subscribe(fn: (v: number) => void) { this.#observers.push(fn); }
  set(v: number) {
    this.v = v;
    this.#observers.forEach((notifica) => notifica(v)); // avvisa tutti
  }
}

const store = new Store();
store.subscribe((v) => grafico.aggiorna(v));   // ognuno si iscrive per conto suo
store.subscribe((v) => contatore.aggiorna(v));
store.set(42); // grafico e contatore si aggiornano da soli, lo store non li conosce
```

💡 È il modello dietro gli **event listener** del DOM (`addEventListener` = "iscrivi un observer a un evento"), gli **Observable** di RxJS e i **signal**/`effect` di Angular.

### Strategy *(comportamentale)*

Raccoglie **algoritmi intercambiabili** dietro una stessa interfaccia, così da poterli scegliere o sostituire a runtime, senza catene di `if/else` sparse.

🧩 **Analogia**: un navigatore che calcola il percorso "in auto", "a piedi" o "in bici": stessa richiesta, strategie diverse selezionabili.

❗ **Il problema**: una funzione decide il comportamento con un `if/else` che cresce a ogni nuovo caso; ogni aggiunta la ingrossa e rischia di romperla.

```ts
// prima ❌ — un ramo per ogni metodo di spedizione, tutti nella stessa funzione
function costo(peso, metodo) {
  if (metodo === "standard") return peso * 1.5;
  if (metodo === "express")  return peso * 3 + 5;
  if (metodo === "ritiro")   return 0;
  // …e la funzione si allarga a ogni novità
}
```

✅ **La soluzione**: ogni algoritmo è una strategia a sé; si sceglie quella giusta e la si applica. Aggiungerne una non tocca le altre.

```ts
const strategie = {
  standard: (peso: number) => peso * 1.5,
  express:  (peso: number) => peso * 3 + 5,
  ritiro:   () => 0,
};
const costo = strategie[metodo](peso); // la strategia si sceglie a runtime
```

💡 In JavaScript/TypeScript una Strategy è spesso semplicemente una **funzione passata come argomento** (per esempio il comparatore di `Array.prototype.sort`).

### Gli altri pattern GoF

Per completare il catalogo, una riga a testa (dettaglio e diagrammi su [refactoring.guru](https://refactoring.guru/design-patterns/catalog)):

| Categoria | Pattern | In una riga |
|---|---|---|
| Creazionale | **Abstract Factory** | crea **famiglie** di oggetti correlati senza fissarne le classi concrete |
| Creazionale | **Prototype** | crea nuovi oggetti **clonando** un esemplare esistente |
| Strutturale | **Bridge** | separa un'astrazione dalla sua implementazione, così che varino in modo indipendente |
| Strutturale | **Composite** | tratta oggetti singoli e gruppi (strutture ad albero) in modo **uniforme** |
| Strutturale | **Flyweight** | condivide lo stato comune tra molti oggetti per **risparmiare memoria** |
| Strutturale | **Proxy** | un sostituto che controlla l'accesso a un oggetto (lazy loading, cache, permessi) |
| Comportamentale | **Chain of Responsibility** | passa una richiesta lungo una **catena** di gestori finché uno la gestisce |
| Comportamentale | **Command** | incapsula una richiesta come **oggetto** (abilita undo/redo, code, log) |
| Comportamentale | **Interpreter** | definisce una grammatica e come interpretarla, per piccoli linguaggi o espressioni |
| Comportamentale | **Iterator** | scorre gli elementi di una collezione senza esporne la struttura interna (→ `for...of`) |
| Comportamentale | **Mediator** | centralizza la comunicazione tra più oggetti in un unico **mediatore** |
| Comportamentale | **Memento** | cattura e ripristina lo **stato** interno di un oggetto (snapshot per l'undo) |
| Comportamentale | **State** | l'oggetto cambia comportamento al variare del suo **stato interno** |
| Comportamentale | **Template Method** | definisce lo **scheletro** di un algoritmo, lasciando alcuni passi alle sottoclassi |
| Comportamentale | **Visitor** | aggiunge operazioni a una struttura di oggetti **senza modificarne** le classi |
