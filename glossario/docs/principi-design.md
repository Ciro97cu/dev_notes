# Principi di design

Linee guida per scrivere codice manutenibile: gli acronimi che riassumono le buone pratiche di progettazione e due principi trasversali di organizzazione.

## SOLID

Cinque principi di design per il codice **object-oriented** (raccolti da Robert C. Martin) per renderlo più manutenibile, estensibile e testabile:

- **S — Single Responsibility**: una classe ha **una sola responsabilità**, cioè un solo motivo per cambiare. Invece di accorpare tutto in `class User { save() {} sendEmail() {} }`, si separano le responsabilità in `User`, `UserRepository` (persistenza) e `Mailer` (invio).
- **O — Open/Closed**: aperta all'**estensione**, chiusa alla **modifica**, cioè si aggiunge comportamento senza riscrivere quello esistente. Invece di uno switch come `if (s.tipo === 'cerchio') … else if (s.tipo === 'quadrato') …`, conviene che ogni forma implementi `area()`, così una forma nuova si aggiunge senza toccare il codice esistente.
- **L — Liskov Substitution**: un sottotipo deve poter **sostituire** il tipo base senza rompere la correttezza del programma. Un `class Penguin extends Bird { fly() { throw } }` viola il principio, perché conviene non ereditare `fly()` quando il pinguino non vola.
- **I — Interface Segregation**: meglio interfacce **piccole e mirate** che una grande e generica, perché un client non deve dipendere da metodi che non usa. Invece di un'unica `interface Machine { print(); scan(); fax(); }`, si separano `Printer`, `Scanner` e `Fax`.
- **D — Dependency Inversion**: dipendere da **astrazioni**, non da implementazioni concrete, con alto e basso livello che dipendono entrambi da un'interfaccia. È il principio dietro la **dependency injection**: invece di istanziare `new EmailSender()` dentro la classe, si inietta il servizio con un `constructor(sender: MessageSender)`.

Sono linee guida, non dogmi: si applicano dove riducono davvero la complessità.

## DRY (Don't Repeat Yourself)

Ogni pezzo di **conoscenza** (una regola di business, una formula, una decisione) dovrebbe avere **una sola rappresentazione autorevole** nel sistema (Hunt & Thomas, *The Pragmatic Programmer*). In pratica niente logica duplicata copia-incollata: la si estrae in una funzione o in un modulo, così una modifica si fa in **un punto solo**.

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

La soluzione più semplice che risolve il problema è quasi sempre la migliore: meno parti, meno astrazioni premature, meno "intelligenza" nascosta. Il codice semplice si legge, si corregge e si cambia con meno fatica. Complicare in previsione di scenari ipotetici è tra le cause più comuni di codice fragile: prima si fa funzionare la cosa semplice, poi la si evolve solo se serve.

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

È lo spirito di diversi design pattern (Strategy, Decorator) e il motivo per cui i framework moderni preferiscono comporre (hook, funzioni, servizi iniettati) invece di gerarchie di classi profonde.
