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
// prima ❌ — l'aliquota "1.22" ripetuta: per cambiarla la devi rincorrere ovunque
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
