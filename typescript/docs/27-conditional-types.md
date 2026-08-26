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

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 450 158" role="img" aria-label="Conditional type T extends U ? X : Y: se T è assegnabile a U il risultato è X, altrimenti Y" style="width:100%;max-width:380px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><rect x="150" y="24" width="150" height="34" rx="8" fill="var(--link,#3178c6)" fill-opacity=".14" stroke="var(--link,#3178c6)" stroke-width="1.5" opacity="1"/><text x="225" y="45" font-size="12" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor" font-family="ui-monospace,Menlo,Consolas,monospace">T extends U ?</text><path d="M190 58 L110 96" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="1"/><path d="M110 100 L105 92 L115 92 Z" fill="currentColor"/><text x="135" y="80" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor" font-family="system-ui,Arial,sans-serif">sì</text><path d="M260 58 L340 96" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="1"/><path d="M340 100 L335 92 L345 92 Z" fill="currentColor"/><text x="315" y="80" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor" font-family="system-ui,Arial,sans-serif">no</text><rect x="78" y="100" width="64" height="30" rx="6" fill="none" stroke="currentColor" stroke-width="1.5" opacity="1"/><text x="110" y="120" font-size="13" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor" font-family="ui-monospace,Menlo,Consolas,monospace">X</text><rect x="308" y="100" width="64" height="30" rx="6" fill="none" stroke="currentColor" stroke-width="1.5" opacity="1"/><text x="340" y="120" font-size="13" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor" font-family="ui-monospace,Menlo,Consolas,monospace">Y</text><text x="110" y="146" font-size="8" text-anchor="middle" font-weight="400" opacity=".65" fill="currentColor" font-family="system-ui,Arial,sans-serif">T assegnabile a U</text><text x="340" y="146" font-size="8" text-anchor="middle" font-weight="400" opacity=".65" fill="currentColor" font-family="system-ui,Arial,sans-serif">altrimenti</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Un <strong>conditional type</strong> è un ternario sui tipi: <code>T extends U ? X : Y</code> vale <code>X</code> se <code>T</code> è assegnabile a <code>U</code>, altrimenti <code>Y</code>.</figcaption>
</figure>

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

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 470 138" role="img" aria-label="Distributività: un conditional su un'union nuda si applica a ciascun membro e i risultati si ricombinano in union" style="width:100%;max-width:490px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><text x="230" y="22" font-size="12" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor" font-family="ui-monospace,Menlo,Consolas,monospace">(A | B | C) extends U ? X : Y</text><path d="M230 32 L230 52" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="1"/><path d="M230 56 L225 48 L235 48 Z" fill="currentColor"/><text x="300" y="48" font-size="9" text-anchor="start" font-weight="600" opacity=".75" fill="currentColor" font-family="system-ui,Arial,sans-serif">si distribuisce</text><rect x="40" y="66" width="120" height="30" rx="6" fill="none" stroke="currentColor" stroke-width="1.5" opacity="1"/><text x="100" y="86" font-size="10" text-anchor="middle" font-weight="600" opacity="1" fill="currentColor" font-family="ui-monospace,Menlo,Consolas,monospace">A extends U ?</text><text x="172" y="86" font-size="13" text-anchor="middle" font-weight="700" opacity=".6" fill="currentColor" font-family="system-ui,Arial,sans-serif">|</text><rect x="180" y="66" width="120" height="30" rx="6" fill="none" stroke="currentColor" stroke-width="1.5" opacity="1"/><text x="240" y="86" font-size="10" text-anchor="middle" font-weight="600" opacity="1" fill="currentColor" font-family="ui-monospace,Menlo,Consolas,monospace">B extends U ?</text><text x="312" y="86" font-size="13" text-anchor="middle" font-weight="700" opacity=".6" fill="currentColor" font-family="system-ui,Arial,sans-serif">|</text><rect x="320" y="66" width="120" height="30" rx="6" fill="none" stroke="currentColor" stroke-width="1.5" opacity="1"/><text x="380" y="86" font-size="10" text-anchor="middle" font-weight="600" opacity="1" fill="currentColor" font-family="ui-monospace,Menlo,Consolas,monospace">C extends U ?</text><text x="230" y="120" font-size="9.5" text-anchor="middle" font-weight="700" opacity=".8" fill="currentColor" font-family="system-ui,Arial,sans-serif">→ union dei risultati</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem">Quando il tipo è un parametro generico <em>nudo</em> istanziato con un'union, il conditional si applica a <strong>ciascun membro separatamente</strong> e i risultati si <strong>ricombinano in un'union</strong>. È la <strong>distributività</strong>.</figcaption>
</figure>

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

Un conditional type è distributivo quando il tipo sottoposto alla condizione è un parametro generico usato direttamente (un parametro "nudo"): in tal caso, se viene istanziato con un union, la condizione si applica separatamente a ciascun membro e i risultati vengono ricombinati in un nuovo union. Per esempio `InArray<string | number>` con `T extends unknown ? T[] : never` produce `string[] | number[]`. Per disattivare la distributività si racchiudono entrambi i lati della condizione fra parentesi quadre (`[T] extends [unknown]`), così l'union viene trattato come un tutto unico, ottenendo `(string | number)[]`.

</details>

<details>
<summary>Perché il comportamento di `never` nella distribuzione permette di definire `Exclude`?</summary>

Perché `never` è l'union vuoto: quando, durante la distribuzione, un membro dell'union produce `never`, quel membro scompare dal risultato finale. `Exclude<T, U>` è definito come `T extends U ? never : T`: distribuendo su ogni membro di `T`, quelli assegnabili a `U` vengono mappati a `never` e quindi eliminati, mentre gli altri restano invariati. Il risultato è l'union di partenza privato dei membri assegnabili a `U`, ad esempio `Exclude<"a" | "b" | "c", "b">` che vale `"a" | "c"`.

</details>
