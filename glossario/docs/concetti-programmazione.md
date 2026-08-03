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

Di seguito i pattern più comuni, spiegati con un'analogia e il caso d'uso tipico. Per il catalogo completo, con diagrammi ed esempi in più linguaggi, il riferimento è [refactoring.guru](https://refactoring.guru/design-patterns/catalog).

### Singleton *(creazionale)*

Garantisce che di una classe esista **una sola istanza**, con un punto di accesso globale a essa.

- 🧩 **Analogia**: il governo di uno Stato — ce n'è uno solo, e tutti sanno come raggiungerlo.
- ✅ **Quando**: serve una risorsa condivisa unica (una cache, un pool di connessioni, la configurazione dell'app).
- ⚠️ Oggi è spesso considerato un **anti-pattern**: introduce stato globale e accoppiamento nascosto, e rende i test difficili. Nei framework moderni lo stesso risultato si ottiene meglio con la **dependency injection** (un servizio registrato una volta e iniettato dove serve → *Dependency Inversion* di SOLID). Esempio completo nel vault TypeScript: [Programmazione a oggetti](../../typescript/docs/16-oop.md).

```ts
class Config {
  static #istanza: Config;
  static get(): Config {
    return (Config.#istanza ??= new Config()); // creata una volta, poi riusata
  }
}
```

### Factory Method *(creazionale)*

Delega la **creazione** di un oggetto, così che il codice cliente lavori con un tipo astratto senza disseminare `new` di classi concrete: *cosa* creare si decide in un solo punto.

- 🧩 **Analogia**: si ordina "una pizza"; è la cucina a decidere come prepararla. Chi ordina non maneggia forni e impasti.
- ✅ **Quando**: il tipo concreto da istanziare dipende dal contesto o dalla configurazione, e si vuole poter aggiungere nuovi tipi senza toccare il cliente (rispetta *Open/Closed*).
- Nella forma GoF piena la scelta è affidata a **sottoclassi**; la versione quotidiana è una semplice funzione-fabbrica.

```ts
function creaLogger(dove: "file" | "console"): Logger {
  return dove === "file" ? new FileLogger() : new ConsoleLogger();
}
```

### Builder *(creazionale)*

Costruisce un oggetto complesso **un passo alla volta**, separando la costruzione dal risultato finale. Evita i costruttori con troppi parametri (il "telescoping constructor").

- 🧩 **Analogia**: comporre un panino da asporto scegliendo un ingrediente per volta, invece di elencarli tutti in un'unica ordinazione.
- ✅ **Quando**: un oggetto ha molte parti facoltative o va assemblato in fasi.

```ts
const query = new QueryBuilder()
  .select("nome")
  .from("utenti")
  .where("eta > 18")
  .build();
```

### Adapter *(strutturale)*

Fa da **traduttore** tra due interfacce incompatibili: avvolge un oggetto e ne espone una diversa, quella che il cliente si aspetta.

- 🧩 **Analogia**: l'adattatore di viaggio tra la spina italiana e la presa inglese.
- ✅ **Quando**: si integra una libreria esterna o un modulo datato la cui interfaccia non combacia con quella del proprio codice.

```ts
class PagamentoAdapter {
  constructor(private legacy: VecchioGateway) {}
  paga(euro: number) {
    this.legacy.fai_pagamento(euro * 100); // adatta euro → centesimi
  }
}
```

### Decorator *(strutturale)*

Aggiunge responsabilità a un oggetto **avvolgendolo** in un altro con la stessa interfaccia, a strati, senza modificarne la classe.

- 🧩 **Analogia**: vestirsi a strati — maglietta, poi maglione, poi giacca: ogni strato aggiunge qualcosa e si può togliere.
- ✅ **Quando**: servono combinazioni di funzionalità opzionali che, con la sola ereditarietà, esploderebbero in un numero ingestibile di sottoclassi (è *composition over inheritance* in azione).

```ts
let flusso = new FileStream(file);
flusso = new Compressione(flusso); // strato
flusso = new Cifratura(flusso);    // altro strato: stessa interfaccia
```

> [!warning]
> Da non confondere con i **decorator del linguaggio** (`@log`) di TypeScript/JavaScript: sono ispirati a questa idea ma sono una feature sintattica a sé. Vedi [Decorators](../../typescript/docs/29-decorators.md) nel vault TypeScript.

### Facade *(strutturale)*

Offre un'**interfaccia unica e semplice** verso un sottosistema complesso, nascondendone le parti interne al cliente.

- 🧩 **Analogia**: il pulsante "avvia" di un'automobile — dietro c'è un sistema complicato, ma si preme un solo bottone.
- ✅ **Quando**: si vuole dare un punto d'ingresso comodo a una libreria o a un gruppo di classi intricate, senza costringere il cliente a orchestrarle.

```ts
class VideoConverter {
  converti(file: File, formato: string) {
    /* dietro le quinte: codec, tracce audio, bitrate… */
  }
}
```

### Observer *(comportamentale)*

Un **subject** mantiene una lista di **osservatori** e li notifica automaticamente quando il suo stato cambia, senza conoscerli uno per uno.

- 🧩 **Analogia**: iscriversi a un canale — a ogni nuovo video tutti gli iscritti ricevono la notifica, e il canale non sa nulla di loro.
- ✅ **Quando**: più parti devono reagire a un cambiamento senza accoppiarsi alla sorgente.
- 💡 È il modello dietro gli **event listener** del DOM (`addEventListener`), gli **Observable** di RxJS e i **signal**/`effect` di Angular.

```ts
subject.subscribe(osservatore);
subject.notify(); // → richiama osservatore.update() su tutti gli iscritti
```

### Strategy *(comportamentale)*

Incapsula **algoritmi intercambiabili** dietro una stessa interfaccia, così da poterli scegliere o sostituire a runtime senza catene di `if/else`.

- 🧩 **Analogia**: un navigatore che calcola il percorso "in auto", "a piedi" o "in bici": stessa richiesta, strategie diverse selezionabili.
- ✅ **Quando**: esistono più modi di fare la stessa cosa (criteri di ordinamento, metodi di pagamento, formati di export) e si vuole poterli scambiare.
- 💡 In JavaScript/TypeScript una Strategy è spesso semplicemente una **funzione passata come argomento** (per esempio il comparatore di `Array.prototype.sort`).

```ts
const criteri = { crescente: (a, b) => a - b, decrescente: (a, b) => b - a };
lista.sort(criteri[modo]); // si sceglie la strategia a runtime
```

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
