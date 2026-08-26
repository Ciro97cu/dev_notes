# keyof e typeof

Con questo capitolo si entra nella programmazione a livello di tipo, cioè nella capacità di TypeScript di calcolare tipi a partire da altri tipi. I due operatori di base di questo dominio sono `keyof`, che estrae le chiavi di un tipo, e `typeof` usato in posizione di tipo, che ricava il tipo di un valore. Insieme agli indexed access type formano gli strumenti con cui i capitoli successivi costruiscono mapped type, conditional type e utility type.

## keyof

L'operatore `keyof`, applicato a un tipo, produce l'union dei suoi nomi di proprietà sotto forma di literal type. Il risultato descrive tutte e sole le chiavi ammesse per quel tipo.

```ts
interface Persona {
  nome: string;
  eta: number;
}

type ChiaviPersona = keyof Persona; // "nome" | "eta"
```

<figure style="margin:1rem 0;text-align:center">
<svg viewBox="0 0 420 148" role="img" aria-label="keyof produce l'union delle chiavi; l'indexed access recupera il tipo di una proprietà" style="width:100%;max-width:440px;height:auto;color:inherit"><g font-family="system-ui,Arial,sans-serif"><text x="95.0" y="39" font-size="10" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor" font-family="system-ui,Arial,sans-serif">Persona</text><rect x="20" y="44" width="150" height="42" rx="5" fill="none" stroke="currentColor" stroke-width="1.5" opacity="1"/><text x="29" y="61" font-size="10.5" text-anchor="start" font-weight="400" opacity=".9" fill="currentColor" font-family="ui-monospace,Menlo,Consolas,monospace">nome: string</text><text x="29" y="76" font-size="10.5" text-anchor="start" font-weight="400" opacity=".9" fill="currentColor" font-family="ui-monospace,Menlo,Consolas,monospace">eta: number</text><path d="M170 72 L238 72" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="1"/><path d="M246 72 L238 67 L238 77 Z" fill="currentColor"/><text x="208" y="64" font-size="9.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor" font-family="system-ui,Arial,sans-serif">keyof</text><rect x="256" y="52" width="64" height="20" rx="10" fill="var(--link,#3178c6)" fill-opacity=".16" stroke="var(--link,#3178c6)" stroke-width="1.5" opacity="1"/><text x="288.0" y="66" font-size="10.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor" font-family="ui-monospace,Menlo,Consolas,monospace">"nome"</text><text x="326" y="72" font-size="12" text-anchor="middle" font-weight="700" opacity=".6" fill="currentColor" font-family="system-ui,Arial,sans-serif">|</text><rect x="338" y="52" width="54" height="20" rx="10" fill="var(--link,#3178c6)" fill-opacity=".16" stroke="var(--link,#3178c6)" stroke-width="1.5" opacity="1"/><text x="365.0" y="66" font-size="10.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor" font-family="ui-monospace,Menlo,Consolas,monospace">"eta"</text><text x="20" y="118" font-size="11" text-anchor="start" font-weight="600" opacity="1" fill="currentColor" font-family="ui-monospace,Menlo,Consolas,monospace">Persona["eta"]</text><path d="M150 114 L210 114" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="1"/><path d="M218 114 L210 109 L210 119 Z" fill="currentColor"/><rect x="226" y="104" width="68" height="20" rx="10" fill="var(--link,#3178c6)" fill-opacity=".16" stroke="var(--link,#3178c6)" stroke-width="1.5" opacity="1"/><text x="260.0" y="118" font-size="10.5" text-anchor="middle" font-weight="700" opacity="1" fill="currentColor" font-family="ui-monospace,Menlo,Consolas,monospace">number</text></g></svg>
<figcaption style="font-size:.82rem;opacity:.7;margin-top:.3rem"><code>keyof T</code> produce l'<strong>union delle chiavi</strong> come literal type. L'<strong>indexed access</strong> <code>T["eta"]</code> recupera il <strong>tipo</strong> di quella proprietà.</figcaption>
</figure>

Poiché `keyof` restituisce un union di literal type, il compilatore può usarlo per vincolare un valore all'insieme esatto delle chiavi esistenti, respingendo qualsiasi nome non previsto.

```ts
let chiave: keyof Persona;
chiave = "nome"; // OK
chiave = "eta";  // OK
chiave = "indirizzo";
// Errore: Type '"indirizzo"' is not assignable to type 'keyof Persona'.
```

Quando `keyof` viene applicato a un tipo con index signature, restituisce il tipo delle chiavi ammesse da quella signature. Su `{ [k: string]: number }` il risultato è `string | number`, perché in JavaScript le chiavi numeriche vengono comunque normalizzate a stringhe e sono quindi anch'esse valide.

## typeof in posizione di tipo

La keyword `typeof` ha due impieghi distinti che è importante non confondere. In un'espressione, `typeof valore` è l'operatore JavaScript che restituisce a runtime una stringa come `"string"` o `"object"`. In posizione di tipo, invece, `typeof valore` è un type query: non produce alcun valore a runtime, ma comunica al compilatore di ricavare il tipo statico di quella variabile o costante.

```ts
const configurazione = {
  host: "localhost",
  porta: 8080,
};

// typeof in posizione di tipo: ricava la forma dell'oggetto
type Configurazione = typeof configurazione;
// { host: string; porta: number }
```

Questo strumento è prezioso quando la fonte di verità è un valore concreto (un oggetto di configurazione, un insieme di costanti) e si vuole derivarne il tipo senza riscriverlo a mano, mantenendo automaticamente l'allineamento fra valore e tipo.

## keyof typeof

I due operatori si combinano di frequente. Dato un valore, `typeof` ne ricava il tipo e `keyof` ne estrae le chiavi: la sequenza `keyof typeof valore` fornisce quindi l'union delle chiavi di un oggetto esistente, senza doverne dichiarare in anticipo il tipo.

```ts
const livelli = {
  info: 0,
  avviso: 1,
  errore: 2,
};

type Livello = keyof typeof livelli; // "info" | "avviso" | "errore"

function registra(livello: Livello, messaggio: string): void {
  console.log(`[${livello.toUpperCase()}] ${messaggio}`);
}

registra("errore", "connessione persa"); // OK
registra("debug", "...");
// Errore: Argument of type '"debug"' is not assignable to parameter of type 'Livello'.
```

## Indexed access types

Un indexed access type recupera il tipo di una proprietà indicandone la chiave fra parentesi quadre, con la stessa notazione usata per accedere ai valori a runtime ma applicata ai tipi. Passando come chiave un union, o l'intero `keyof`, si ottiene l'union dei tipi delle proprietà corrispondenti.

```ts
interface Prodotto {
  nome: string;
  prezzo: number;
  disponibile: boolean;
}

type TipoPrezzo = Prodotto["prezzo"];          // number
type NomeOPrezzo = Prodotto["nome" | "prezzo"]; // string | number
type TuttiIValori = Prodotto[keyof Prodotto];   // string | number | boolean
```

## Un getter type-safe

La combinazione di `keyof` e degli indexed access type permette di scrivere funzioni generiche che restano precise sui tipi. Un accesso a proprietà tipizzato vincola la chiave a `keyof T` e dichiara come tipo di ritorno `T[K]`, così il compilatore conosce il tipo esatto restituito per ogni chiave e rifiuta le chiavi inesistenti.

```ts
function proprieta<T, K extends keyof T>(oggetto: T, chiave: K): T[K] {
  return oggetto[chiave];
}

const persona: Persona = { nome: "Ada", eta: 36 };

const nome = proprieta(persona, "nome"); // tipo: string
const eta = proprieta(persona, "eta");   // tipo: number

proprieta(persona, "indirizzo");
// Errore: Argument of type '"indirizzo"' is not assignable to parameter of type 'keyof Persona'.
```

Il vincolo `K extends keyof T` è ciò che rende sicura la funzione: senza di esso si potrebbe passare una chiave qualsiasi, e il tipo di ritorno non potrebbe essere legato alla proprietà richiesta.

## Domande

<details>
<summary>Cosa produce `keyof` applicato a un tipo e di che natura è il risultato?</summary>

Produce l'union dei nomi delle proprietà del tipo, espressi come literal type. Ad esempio, su `interface Persona { nome: string; eta: number }`, `keyof Persona` è `"nome" | "eta"`. Trattandosi di un union di literal, il risultato può essere usato per vincolare una variabile o un parametro all'insieme esatto delle chiavi esistenti, facendo respingere dal compilatore qualsiasi nome non previsto. Su un tipo con index signature a chiavi stringa, `keyof` restituisce `string | number`, perché anche gli indici numerici sono chiavi valide.

</details>

<details>
<summary>Qual è la differenza tra `typeof` come operatore e `typeof` in posizione di tipo?</summary>

Sono due usi distinti della stessa keyword. In un'espressione, `typeof valore` è l'operatore JavaScript che a runtime restituisce una stringa che descrive il tipo del valore, come `"string"` o `"number"`. In posizione di tipo, `typeof valore` è un type query che non esegue nulla a runtime: chiede al compilatore di ricavare il tipo statico di quella variabile o costante. Il primo produce un valore, il secondo un tipo; il contesto in cui compare la keyword determina quale dei due significati si applica.

</details>

<details>
<summary>A cosa serve la combinazione `keyof typeof oggetto`?</summary>

Serve a ottenere l'union delle chiavi di un oggetto esistente senza doverne dichiarare esplicitamente il tipo. `typeof oggetto` ricava il tipo dell'oggetto a partire dal valore, e `keyof` ne estrae le chiavi. È particolarmente utile quando la fonte di verità è un valore concreto (ad esempio un dizionario di costanti) e si vuole derivarne l'insieme delle chiavi in modo automatico, così che aggiungendo o rimuovendo una proprietà dell'oggetto l'union dei tipi resti sempre allineata.

</details>

<details>
<summary>Perché nel getter type-safe è necessario il vincolo `K extends keyof T`?</summary>

Perché è ciò che collega la chiave richiesta all'insieme delle proprietà effettivamente esistenti e permette di dichiarare il tipo di ritorno come `T[K]`. Senza il vincolo, `K` potrebbe essere qualunque tipo, il compilatore non potrebbe garantire che la chiave esista sull'oggetto e non saprebbe determinare il tipo del valore restituito. Con `K extends keyof T` una chiave inesistente viene rifiutata già in compilazione, e per ogni chiave valida il tipo di ritorno corrisponde esattamente al tipo di quella proprietà.

</details>
