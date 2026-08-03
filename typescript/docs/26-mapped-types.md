# Mapped types

Un mapped type costruisce un nuovo tipo iterando sulle chiavi di un tipo esistente e stabilendo, per ciascuna, quale tipo assegnare alla proprietà corrispondente. È l'equivalente a livello di tipo di un ciclo che ricrea un oggetto trasformandone le voci: partendo dalle chiavi di un tipo sorgente si genera un tipo destinazione, eventualmente modificandone i modificatori, i nomi delle chiavi o i tipi dei valori. Molti degli utility type visti nel capitolo dedicato sono, sotto la superficie, semplici mapped type.

## La forma base

La sintassi ricalca quella di una index signature, ma al posto di un tipo di chiave generico usa la clausola `K in ...`, dove `K` scorre un union di chiavi, tipicamente ottenuto con `keyof`. Per ogni chiave prodotta dall'iterazione si indica il tipo della proprietà.

```ts
interface Persona {
  nome: string;
  eta: number;
}

// Mapped type identità: ricrea Persona chiave per chiave
type Copia = {
  [K in keyof Persona]: Persona[K];
};
// { nome: string; eta: number }
```

Reso generico, lo stesso schema diventa uno strumento riutilizzabile. La combinazione `[K in keyof T]` con l'indexed access `T[K]` è l'ossatura ricorrente di quasi tutti i mapped type.

```ts
type Contenitore<T> = {
  [K in keyof T]: T[K][];
};

type Persona = { nome: string; eta: number };
type PersonaInArray = Contenitore<Persona>;
// { nome: string[]; eta: number[] }
```

## Modificatori: readonly e opzionalità

Durante la mappatura si possono applicare i modificatori `readonly` e `?`, esattamente come in una normale dichiarazione di proprietà. È così che la standard library definisce utility come `Partial` e `Readonly`.

```ts
type Parziale<T> = {
  [K in keyof T]?: T[K];
};

type SolaLettura<T> = {
  readonly [K in keyof T]: T[K];
};
```

La vera novità dei mapped type è la possibilità di **rimuovere** un modificatore, non solo di aggiungerlo, anteponendogli il segno `-`. Il prefisso `+`, ammesso per simmetria, indica esplicitamente l'aggiunta ma è di norma superfluo. In questo modo si costruiscono le trasformazioni inverse: rendere mutabile un tipo `readonly`, oppure rendere obbligatorie tutte le proprietà opzionali.

```ts
// Rimuove readonly da ogni proprietà
type Mutabile<T> = {
  -readonly [K in keyof T]: T[K];
};

// Rimuove l'opzionalità: ogni proprietà diventa obbligatoria
type Obbligatorio<T> = {
  [K in keyof T]-?: T[K];
};

interface Impostazioni {
  readonly tema?: string;
  readonly lingua?: string;
}

type ImpostazioniModificabili = Mutabile<Impostazioni>;
// { tema?: string; lingua?: string }  — non più readonly
type ImpostazioniComplete = Obbligatorio<Impostazioni>;
// { readonly tema: string; readonly lingua: string }  — non più opzionali
```

## Rinominare e filtrare le chiavi con as

Una clausola `as` posta dopo `K in ...` permette di **rimappare** la chiave, cioè di calcolare un nuovo nome per ogni voce. Combinata con i template literal type, trattati nel capitolo successivo, consente di derivare nomi di proprietà a partire da quelli esistenti, come nella generazione automatica di getter.

```ts
type Getter<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Utente {
  nome: string;
  eta: number;
}

type UtenteGetter = Getter<Utente>;
// { getNome: () => string; getEta: () => number }
```

La rimappatura serve anche a **filtrare** le chiavi: assegnando `never` come nuovo nome, la proprietà viene esclusa dal tipo risultante. Unita a un conditional type, l'argomento del capitolo che segue, permette di selezionare solo le proprietà che soddisfano una condizione sul loro tipo.

```ts
// Conserva soltanto le proprietà il cui valore è una stringa
type SoloStringhe<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

interface Misto {
  nome: string;
  eta: number;
  citta: string;
}

type CampiTesto = SoloStringhe<Misto>;
// { nome: string; citta: string }
```

## Domande

<details>
<summary>Qual è lo schema ricorrente alla base della maggior parte dei mapped type?</summary>

È la combinazione `[K in keyof T]` con l'indexed access `T[K]`. La clausola `K in keyof T` fa scorrere `K` su tutte le chiavi del tipo sorgente, mentre `T[K]` recupera il tipo della proprietà corrispondente. Iterando su ogni chiave e ricostruendo la proprietà con il suo tipo si ottiene, nel caso più semplice, una copia identica del tipo; introducendo variazioni sul tipo del valore, sui modificatori o sul nome della chiave si ottengono invece le trasformazioni desiderate. È lo stesso schema con cui sono definiti utility type come `Partial` e `Readonly`.

</details>

<details>
<summary>Come si rimuove un modificatore in un mapped type e a cosa serve?</summary>

Si antepone il segno `-` al modificatore da rimuovere: `-readonly` elimina la sola lettura, `-?` elimina l'opzionalità rendendo la proprietà obbligatoria. Esiste anche il prefisso `+` per indicare esplicitamente l'aggiunta, ma è di norma superfluo perché l'aggiunta è il comportamento predefinito. La rimozione dei modificatori serve a costruire le trasformazioni inverse rispetto a `Partial` e `Readonly`: per esempio un tipo `Mutabile<T>` che toglie `readonly` da ogni proprietà, o un tipo `Required` che rende obbligatorie tutte le proprietà opzionali.

</details>

<details>
<summary>Che cosa permette la clausola `as` nella rimappatura delle chiavi?</summary>

Permette di calcolare un nuovo nome per ciascuna chiave durante la mappatura. Combinata con i template literal type consente di derivare nomi a partire da quelli esistenti, ad esempio anteponendo `get` e capitalizzando la chiave per generare una famiglia di getter. Assegnando invece `never` come nuovo nome, la proprietà viene esclusa dal tipo risultante: unita a un conditional type, questa tecnica realizza un vero e proprio filtro, che conserva solo le chiavi le cui proprietà soddisfano una determinata condizione sul loro tipo.

</details>
