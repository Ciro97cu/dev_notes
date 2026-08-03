# Template literal types

I template literal type portano a livello di tipo la sintassi dei template literal di JavaScript: usando i backtick e l'interpolazione `${...}`, permettono di descrivere e comporre tipi stringa a partire da altri tipi. Consentono di esprimere formati testuali precisi, di generare famiglie di nomi correlati e, combinati con `infer`, di estrarre porzioni da una stringa a livello di tipo. Sono la base su cui poggiano molte trasformazioni delle chiavi viste nei mapped type.

## Comporre tipi stringa

Un template literal type interpola altri tipi all'interno di una stringa. Interpolando un tipo largo come `string` si descrive un pattern che qualunque stringa di quella forma soddisfa.

```ts
type Saluto = `Ciao, ${string}!`;

const a: Saluto = "Ciao, Ada!";   // OK
const b: Saluto = "Ciao, mondo!"; // OK
const c: Saluto = "Buongiorno";
// Errore: Type '"Buongiorno"' is not assignable to type '`Ciao, ${string}!`'.
```

Quando invece si interpola un union di literal, il compilatore genera il prodotto cartesiano di tutte le combinazioni possibili, producendo un union di literal type.

```ts
type Dimensione = "piccolo" | "grande";
type Stato = "attivo" | "spento";

type Classe = `${Dimensione}-${Stato}`;
// "piccolo-attivo" | "piccolo-spento" | "grande-attivo" | "grande-spento"
```

Questa espansione automatica rende i template literal type adatti a descrivere insiemi finiti ma numerosi di stringhe strutturate, come nomi di classi, chiavi di eventi o identificatori convenzionali.

## I tipi di manipolazione delle stringhe

La standard library mette a disposizione quattro tipi speciali che trasformano i literal stringa a livello di tipo: `Uppercase`, `Lowercase`, `Capitalize` e `Uncapitalize`. Sono integrati direttamente nel compilatore e si usano spesso all'interno dei template literal type.

```ts
type A = Uppercase<"ciao">;     // "CIAO"
type B = Lowercase<"CIAO">;     // "ciao"
type C = Capitalize<"rosso">;   // "Rosso"
type D = Uncapitalize<"Rosso">; // "rosso"
```

Un impiego tipico è la generazione dei nomi dei gestori di eventi a partire dai nomi degli eventi, capitalizzando ciascun nome e anteponendo un prefisso.

```ts
type Evento = "click" | "focus" | "blur";
type Gestore = `on${Capitalize<Evento>}`;
// "onClick" | "onFocus" | "onBlur"
```

Come mostrato nel capitolo sui [mapped types](26-mapped-types.md), questa tecnica si combina con la rimappatura delle chiavi per derivare i nomi delle proprietà di un tipo da quelli di un altro.

## Estrarre porzioni con infer

I template literal type possono comparire anche nella condizione di un conditional type, dove `infer` cattura la parte della stringa che corrisponde a un segnaposto. Si ottiene così un parsing di stringhe a livello di tipo, utile ad esempio per ricavare i parametri di un pattern di rotta.

```ts
type ParametroRotta<T> = T extends `${string}/:${infer P}` ? P : never;

type P1 = ParametroRotta<"/utente/:id">;       // "id"
type P2 = ParametroRotta<"/prodotti/lista">;    // never (nessun parametro)
```

Con più segnaposto si possono estrarre più parti contemporaneamente, scomponendo una stringa nei suoi componenti.

```ts
type Dividi<T> = T extends `${infer Testa}.${infer Coda}`
  ? [Testa, ...Dividi<Coda>]
  : [T];

type Parti = Dividi<"a.b.c">; // ["a", "b", "c"]
```

## Caratteri Unicode

L'inferenza dei template literal type ragiona in termini di code point Unicode: un carattere astral, cioè fuori dal Basic Multilingual Plane come molte emoji, viene trattato come una singola unità e non come la coppia di code unit UTF-16 che lo rappresenta internamente. Questo rende coerente la manipolazione dei tipi stringa con la percezione intuitiva dei caratteri, senza sorprese sulle stringhe che contengono simboli complessi.

## Domande

<details>
<summary>Cosa accade quando si interpola un union di literal in un template literal type?</summary>

Il compilatore genera il prodotto cartesiano di tutte le combinazioni possibili, producendo un union di literal type. Ad esempio, con `Dimensione = "piccolo" | "grande"` e `Stato = "attivo" | "spento"`, il tipo `` `${Dimensione}-${Stato}` `` diventa l'union delle quattro stringhe `"piccolo-attivo" | "piccolo-spento" | "grande-attivo" | "grande-spento"`. Interpolando invece un tipo largo come `string`, non si genera un union ma un pattern che qualunque stringa di quella forma soddisfa.

</details>

<details>
<summary>Quali sono i tipi intrinseci di manipolazione delle stringhe e a cosa servono?</summary>

Sono `Uppercase`, `Lowercase`, `Capitalize` e `Uncapitalize`, integrati direttamente nel compilatore. Trasformano i literal stringa a livello di tipo, rispettivamente in maiuscolo, minuscolo, con l'iniziale maiuscola o con l'iniziale minuscola. Si usano tipicamente all'interno dei template literal type per derivare nomi da altri nomi, come nella generazione dei gestori di eventi (`` `on${Capitalize<Evento>}` ``) o, in combinazione con la rimappatura delle chiavi nei mapped type, per costruire i nomi delle proprietà di un tipo a partire da quelli di un altro.

</details>

<details>
<summary>Come si estrae una porzione di stringa a livello di tipo?</summary>

Si usa un template literal type nella condizione di un conditional type, inserendo `infer` in corrispondenza della parte da catturare. Ad esempio, `T extends `${string}/:${infer P}` ? P : never` cattura in `P` ciò che segue `/:`, permettendo di ricavare il nome di un parametro da un pattern di rotta come `"/utente/:id"`. Con più segnaposto si possono estrarre più parti nello stesso confronto, e ricorrendo sul resto della stringa si può scomporre un intero testo nei suoi componenti, per esempio dividendo `"a.b.c"` nella tupla `["a", "b", "c"]`.

</details>
