# Gestione delle risorse: using e await using

Molte risorse (file aperti, connessioni di rete, lock, sottoscrizioni) vanno rilasciate in modo deterministico quando non servono più, indipendentemente dal fatto che il codice termini normalmente o per un'eccezione. La tecnica tradizionale ricorre a `try...finally`, corretta ma verbosa e facile da dimenticare. Le dichiarazioni `using` e `await using` offrono un meccanismo dichiarativo per lo stesso scopo: legano una risorsa a uno scope e ne invocano automaticamente la logica di rilascio nel momento in cui quello scope termina.

## La dichiarazione using

Una dichiarazione `using` si comporta come `const`, con una differenza fondamentale: la risorsa assegnata deve possedere un metodo `[Symbol.dispose]()`, e quel metodo viene chiamato automaticamente all'uscita dallo scope che contiene la dichiarazione. Un oggetto che espone tale metodo è detto disposable e implementa l'interfaccia `Disposable`.

```ts
class RisorsaFile implements Disposable {
  constructor(private nome: string) {
    console.log(`apertura di ${nome}`);
  }

  [Symbol.dispose](): void {
    console.log(`chiusura di ${this.nome}`);
  }
}

function elabora(): void {
  using file = new RisorsaFile("dati.txt");
  console.log("elaborazione in corso");
  // all'uscita dal blocco viene invocato file[Symbol.dispose]()
}

elabora();
// apertura di dati.txt
// elaborazione in corso
// chiusura di dati.txt
```

Il rilascio avviene comunque, anche se il blocco termina a causa di un'eccezione: è la stessa garanzia di un `finally`, ma legata alla dichiarazione della risorsa anziché a un costrutto separato. Una dichiarazione `using` è ammessa solo all'interno di un blocco (il corpo di una funzione, un `if`, un ciclo), non al livello più esterno di uno script.

## Ordine di rilascio

Quando più risorse vengono dichiarate con `using` nello stesso scope, il rilascio segue l'ordine inverso rispetto alla dichiarazione (last-in, first-out): l'ultima risorsa acquisita è la prima a essere rilasciata. Questo riproduce il comportamento naturale di `try...finally` annidati e rispetta le dipendenze tipiche fra risorse, in cui quella creata più tardi può appoggiarsi a quella creata prima.

```ts
function apriDue(): void {
  using primo = new RisorsaFile("A");
  using secondo = new RisorsaFile("B");
  console.log("uso di entrambi");
}

apriDue();
// apertura di A
// apertura di B
// uso di entrambi
// chiusura di B
// chiusura di A
```

## await using per le risorse asincrone

Alcune risorse richiedono un rilascio asincrono, ad esempio lo svuotamento di un buffer o la chiusura ordinata di una connessione. In questi casi la risorsa implementa l'interfaccia `AsyncDisposable`, esponendo il metodo `[Symbol.asyncDispose]()` che restituisce una `Promise`, e la si dichiara con `await using`. Al termine dello scope il metodo di rilascio viene invocato e atteso. La dichiarazione `await using` è consentita solo dove è ammesso `await`, ovvero in una funzione `async` o al livello più esterno di un modulo.

```ts
class Connessione implements AsyncDisposable {
  async [Symbol.asyncDispose](): Promise<void> {
    console.log("chiusura della connessione");
    await Promise.resolve();
  }
}

async function interroga(): Promise<void> {
  await using conn = new Connessione();
  console.log("interrogazione in corso");
  // all'uscita dal blocco viene atteso conn[Symbol.asyncDispose]()
}
```

## Aggregare risorse con DisposableStack

Quando il numero di risorse non è noto staticamente, o quando occorre registrare azioni di cleanup che non corrispondono a un oggetto disposable, si usa `DisposableStack` (e la controparte `AsyncDisposableStack`). È a sua volta un disposable, quindi lo si dichiara con `using`, e raccoglie più risorse rilasciandole tutte, in ordine inverso, alla propria dismissione. Il metodo `use` registra un disposable esistente, mentre `defer` registra una funzione di cleanup arbitraria.

```ts
function elaboraTutto(): void {
  using pila = new DisposableStack();

  const file = pila.use(new RisorsaFile("config"));
  pila.defer(() => console.log("cleanup finale"));

  console.log("lavoro con le risorse raccolte");
  // all'uscita: prima "cleanup finale", poi "chiusura di config"
}
```

## Quando le eccezioni si sovrappongono

Se sia il corpo del blocco sia il metodo di rilascio sollevano un'eccezione, l'errore avvenuto durante il dispose non nasconde quello originario: i due vengono combinati in un unico `SuppressedError`, che espone la proprietà `error` con l'ultima eccezione e `suppressed` con quella precedente. In questo modo nessuna delle due informazioni va perduta, a differenza di quanto accadrebbe con un `finally` scritto senza cautela.

## Domande

<details>
<summary>Quale metodo deve esporre un oggetto per essere usato con `using`, e quando viene invocato?</summary>

Deve esporre il metodo `[Symbol.dispose]()`, cioè implementare l'interfaccia `Disposable`. Quel metodo viene invocato automaticamente all'uscita dallo scope che contiene la dichiarazione `using`, sia in caso di terminazione normale del blocco sia in caso di eccezione. È la stessa garanzia di rilascio di un blocco `finally`, ma espressa in modo dichiarativo e legata alla dichiarazione della risorsa. Per il rilascio asincrono si implementa invece `[Symbol.asyncDispose]()` (interfaccia `AsyncDisposable`) e si dichiara la risorsa con `await using`.

</details>

<details>
<summary>In quale ordine vengono rilasciate più risorse dichiarate con `using` nello stesso scope?</summary>

In ordine inverso rispetto alla dichiarazione, secondo una logica last-in, first-out: l'ultima risorsa acquisita è la prima a essere rilasciata. Questo riproduce il comportamento di più blocchi `try...finally` annidati e rispetta le dipendenze fra risorse, dato che una risorsa creata più tardi può fare affidamento su una creata prima e va quindi rilasciata per prima. Se, ad esempio, si dichiarano nell'ordine `A` e poi `B`, il rilascio avviene prima su `B` e poi su `A`.

</details>

<details>
<summary>Qual è la differenza tra `using` e `await using`?</summary>

`using` invoca il metodo sincrono `[Symbol.dispose]()` della risorsa all'uscita dallo scope, ed è utilizzabile in qualsiasi blocco. `await using` è pensato per le risorse che richiedono un rilascio asincrono: invoca `[Symbol.asyncDispose]()`, che restituisce una `Promise`, e ne attende il completamento prima di proseguire. Poiché comporta un `await`, la dichiarazione `await using` è ammessa solo dove `await` è consentito, cioè in una funzione `async` o al livello più esterno di un modulo. La risorsa corrispondente implementa `AsyncDisposable` anziché `Disposable`.

</details>

<details>
<summary>A cosa serve `DisposableStack`?</summary>

Serve ad aggregare più risorse quando il loro numero non è noto staticamente o quando occorre registrare azioni di cleanup che non corrispondono a un oggetto disposable. È esso stesso un disposable, quindi lo si dichiara con `using`, e alla propria dismissione rilascia in ordine inverso tutto ciò che ha raccolto. Il metodo `use` registra un disposable esistente e ne restituisce il riferimento, mentre `defer` registra una funzione di cleanup arbitraria. La controparte per le risorse asincrone è `AsyncDisposableStack`, da usare con `await using`.

</details>
