# Conditional types e infer

Un conditional type sceglie fra due tipi in base a una condizione, espressa come relazione di assegnabilità fra tipi. Ha la forma `T extends U ? X : Y` e si legge come un operatore ternario applicato ai tipi: se `T` è assegnabile a `U`, il tipo risultante è `X`, altrimenti è `Y`. Insieme alla keyword `infer`, che permette di catturare un tipo annidato all'interno della condizione, i conditional type sono lo strumento con cui la standard library definisce utility come `ReturnType`, `Parameters`, `NonNullable` ed `Exclude`.

## La forma base

La condizione non confronta valori ma tipi: `T extends U` è vera quando ogni valore di `T` sarebbe accettato dove è atteso un `U`.

```ts
type ÈStringa<T> = T extends string ? true : false;

type A = ÈStringa<"ciao">; // true
type B = ÈStringa<number>; // false
```

Il costrutto diventa espressivo quando `T` è un parametro generico, perché consente di far dipendere il tipo restituito da una funzione o da un alias dalla forma del tipo ricevuto.

```ts
type NomeTipo<T> = T extends string
  ? "stringa"
  : T extends number
    ? "numero"
    : "altro";

type X = NomeTipo<boolean>; // "altro"
type Y = NomeTipo<42>;      // "numero"
```

## Estrarre tipi con infer

All'interno della clausola `extends` di un conditional type si può introdurre una variabile di tipo con la keyword `infer`, che cattura una porzione del tipo confrontato e la rende disponibile nel ramo positivo. È il meccanismo con cui si "aprono" i tipi composti per estrarne una parte.

```ts
// Estrae il tipo degli elementi di un array
type Elemento<T> = T extends (infer U)[] ? U : T;

type A = Elemento<number[]>; // number
type B = Elemento<string>;   // string (T non è un array: si prende il ramo else)
```

Lo stesso schema permette di ricavare il tipo di ritorno di una funzione o il valore contenuto in una `Promise`, catturando con `infer` la posizione che interessa.

```ts
// Tipo di ritorno di una funzione
type Ritorno<F> = F extends (...args: any[]) => infer R ? R : never;
type R = Ritorno<() => number>; // number

// Valore risolto da una Promise
type Risolto<T> = T extends Promise<infer V> ? V : T;
type V = Risolto<Promise<string>>; // string
```

## Conditional type distributivi

Quando il tipo sottoposto alla condizione è un parametro generico "nudo", cioè usato direttamente come `T extends ...`, e viene istanziato con un union, il conditional type si applica **a ciascun membro dell'union separatamente**, e i risultati vengono ricombinati in un nuovo union. Questo comportamento si chiama distributività.

```ts
type InArray<T> = T extends unknown ? T[] : never;

type Distribuito = InArray<string | number>;
// La condizione è valutata su string e su number separatamente:
// string[] | number[]
```

La distributività è spesso il comportamento desiderato, ma non sempre. Per disattivarla si racchiudono entrambi i lati della condizione fra parentesi quadre, trasformando il parametro nudo in una tupla di un elemento: in questa forma l'union viene trattata come un tutto unico.

```ts
type InArrayNonDistr<T> = [T] extends [unknown] ? T[] : never;

type NonDistribuito = InArrayNonDistr<string | number>;
// L'union non viene scomposta: (string | number)[]
```

Un aspetto importante della distribuzione riguarda `never`, che è l'union vuoto: quando un membro dell'union produce `never`, quel membro semplicemente scompare dal risultato. È questa proprietà a rendere possibile la definizione di `Exclude`, che rimuove da un union i membri assegnabili a un altro tipo.

```ts
type Escludi<T, U> = T extends U ? never : T;

type Rimasti = Escludi<"a" | "b" | "c", "b">;
// "a" e "c" restano, "b" diventa never e sparisce: "a" | "c"
```

## Ricostruire alcuni utility type

I conditional type con `infer` rivelano la natura di diversi utility type della standard library, illustrati nel [capitolo dedicato](24-utility-types.md). Riscriverli è un esercizio utile per fissarne il meccanismo.

```ts
// Rimuove null e undefined da un tipo
type NonNullo<T> = T extends null | undefined ? never : T;
type S = NonNullo<string | null>; // string

// Tipo dei parametri di una funzione, come tupla
type Parametri<F> = F extends (...args: infer P) => unknown ? P : never;
type P = Parametri<(a: number, b: string) => void>; // [a: number, b: string]

// Seleziona da un union i soli membri assegnabili a U
type Estrai<T, U> = T extends U ? T : never;
type E = Estrai<string | number | boolean, boolean>; // boolean
```

## Domande

<details>
<summary>Come si legge un conditional type `T extends U ? X : Y`?</summary>

Si legge come un operatore ternario applicato ai tipi: se `T` è assegnabile a `U`, cioè se ogni valore di `T` sarebbe accettato dove è atteso un `U`, il tipo risultante è `X`, altrimenti è `Y`. La condizione non confronta valori a runtime ma verifica una relazione di assegnabilità fra tipi in fase di compilazione. Diventa realmente utile quando `T` è un parametro generico, perché permette di far dipendere il tipo prodotto dalla forma del tipo ricevuto in ingresso.

</details>

<details>
<summary>A cosa serve la keyword `infer` e dove può comparire?</summary>

`infer` introduce una variabile di tipo all'interno della clausola `extends` di un conditional type, catturando una porzione del tipo confrontato e rendendola disponibile nel ramo positivo. Serve a "estrarre" un tipo annidato: ad esempio, in `T extends (infer U)[] ? U : T`, la variabile `U` cattura il tipo degli elementi di un array. Con lo stesso schema si ricavano il tipo di ritorno di una funzione (`(...args: any[]) => infer R`), il tipo dei suoi parametri o il valore risolto da una `Promise` (`Promise<infer V>`). `infer` può comparire soltanto nella condizione di un conditional type.

</details>

<details>
<summary>Cos'è la distributività e come si disattiva?</summary>

Un conditional type è distributivo quando il tipo sottoposto alla condizione è un parametro generico usato direttamente (un parametro "nudo"): in tal caso, se viene istanziato con un union, la condizione si applica separatamente a ciascun membro e i risultati vengono ricombinati in un nuovo union. Per esempio `InArray<string | number>` con `T extends unknown ? T[] : never` produce `string[] | number[]`. Per disattivare la distributività si racchiudono entrambi i lati della condizione fra parentesi quadre — `[T] extends [unknown]` — così l'union viene trattato come un tutto unico, ottenendo `(string | number)[]`.

</details>

<details>
<summary>Perché il comportamento di `never` nella distribuzione permette di definire `Exclude`?</summary>

Perché `never` è l'union vuoto: quando, durante la distribuzione, un membro dell'union produce `never`, quel membro scompare dal risultato finale. `Exclude<T, U>` è definito come `T extends U ? never : T`: distribuendo su ogni membro di `T`, quelli assegnabili a `U` vengono mappati a `never` e quindi eliminati, mentre gli altri restano invariati. Il risultato è l'union di partenza privato dei membri assegnabili a `U`, ad esempio `Exclude<"a" | "b" | "c", "b">` che vale `"a" | "c"`.

</details>
