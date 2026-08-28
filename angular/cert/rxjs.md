---
titolo: "RxJS"
tags: [tipo/cert, rxjs, reactivity, legacy]
livello: [mid, senior]
---
# RxJS
> Cert Angular · trattato solo di sfuggita nel *Modern Angular* (il vault ragiona in signals)

**RxJS** (Reactive Extensions for JavaScript) è la libreria di programmazione reattiva su cui Angular ha storicamente fondato l'asincronia: `HttpClient`, `Router`, `EventEmitter`, `valueChanges` delle reactive forms ([[forms-reactive]]) espongono tutti `Observable`. L'esame la considera core knowledge Senior: l'`Observable` come stream, i `Subject` per il multicasting, gli operator pipeable e, soprattutto, i pattern corretti di **unsubscribe**.

## `Observable`, `Observer`, `Subscription`
Un **`Observable`** è uno stream **pigro (lazy)** e **freddo (cold)**: il codice produttore non parte finché qualcuno non si iscrive, e ogni sottoscrizione avvia un'esecuzione **indipendente**. Un `Observer` è l'insieme dei tre callback di consumo; `subscribe` ritorna una `Subscription` che serve a fermare lo stream.

```ts
import { Observable } from 'rxjs';

const clock$ = new Observable<number>((subscriber) => {
  let n = 0;
  const id = setInterval(() => subscriber.next(n++), 1000);
  return () => clearInterval(id); // teardown: eseguito allo unsubscribe/complete
});

const sub = clock$.subscribe({
  next: (v) => console.log(v), // 0, 1, 2, ...
  error: (err) => console.error(err),
  complete: () => console.log('done'),
});

sub.unsubscribe(); // ferma lo stream ed esegue il teardown
```

Un `Observable` emette zero o più valori con `next`, e termina con **`complete`** (successo) **o** `error` — mai entrambi; dopo la terminazione non emette più nulla. `next`/`error`/`complete` sono i tre metodi dell'`Observer`.

## Creazione
Nella pratica un `Observable` si costruisce di rado a mano con `new`: la libreria offre una serie di **funzioni factory** che coprono i casi ricorrenti (partire da valori noti, da un array o una Promise, da eventi del DOM, oppure dal tempo) restituendo lo stream già pronto all'uso.

```ts
import { of, from, fromEvent, interval, timer } from 'rxjs';

of(1, 2, 3);                              // emette 1,2,3 in sequenza poi completa
from([1, 2, 3]);                          // da array/Promise/iterable
from(fetch('/api'));                      // da una Promise
fromEvent(document, 'click');             // da eventi DOM (hot: vedi sotto)
interval(1000);                           // 0,1,2,... ogni secondo (non completa)
timer(2000);                              // emette 0 dopo 2s poi completa
timer(0, 1000);                           // come interval ma con delay iniziale
```

## `Subject` e varianti (multicasting)
Un `Observable` cold ripete l'esecuzione per ogni subscriber; un **`Subject`** è invece sia `Observer` sia `Observable` e fa **multicasting**: un unico flusso condiviso fra tutti gli iscritti (è quindi *hot*). Si usa per trasmettere eventi da una sorgente a molti consumatori.

```ts
import { Subject, BehaviorSubject, ReplaySubject, AsyncSubject } from 'rxjs';

const s = new Subject<number>();
s.subscribe((v) => console.log('A', v));
s.next(1);                 // A 1
s.subscribe((v) => console.log('B', v));
s.next(2);                 // A 2, B 2  (B NON riceve l'1 emesso prima)
```

| Variante | Comportamento |
| --- | --- |
| `Subject` | nessun valore iniziale; i nuovi iscritti ricevono **solo** le emissioni successive |
| `BehaviorSubject` | richiede un **valore iniziale**; a ogni nuovo iscritto emette **l'ultimo** valore; ha `.value` |
| `ReplaySubject` | rigioca gli **ultimi N** valori (buffer configurabile) ai nuovi iscritti |
| `AsyncSubject` | emette **solo l'ultimo** valore, e **solo** al `complete` |

`BehaviorSubject` è la scelta classica per uno "stato corrente" osservabile (es. un lightweight store pre-signals).

## Operator pipeable
Gli **operator** sono funzioni pure che, dentro `.pipe(...)`, trasformano un `Observable` in un altro senza mutare l'originale. Categorie principali:

```ts
import { map, filter, tap, take, scan, startWith } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs';

source$.pipe(
  filter((x) => x > 0),              // lascia passare solo ciò che soddisfa il predicato
  map((x) => x * 2),                 // trasforma ogni valore
  distinctUntilChanged(),            // ignora emissioni uguali alla precedente
  debounceTime(300),                 // emette solo dopo 300ms di silenzio (input, ricerche)
  take(5),                           // prende i primi 5 valori poi completa
  scan((acc, x) => acc + x, 0),      // accumulatore (come reduce, ma emette ogni step)
  startWith(0),                      // antepone un valore iniziale
  tap((x) => console.log(x)),        // side-effect senza alterare lo stream
);
```

**Combinazione di stream:**

```ts
import { combineLatest, forkJoin, withLatestFrom } from 'rxjs';

combineLatest([a$, b$]);             // emette [a,b] a ogni emissione di UNO qualsiasi (dopo il primo di ciascuno)
forkJoin([a$, b$]);                  // attende che TUTTI completino, poi emette l'ultimo di ciascuno (stile Promise.all)
a$.pipe(withLatestFrom(b$));         // a ogni emissione di a, allega l'ULTIMO valore di b
```

**Gestione errori e resilienza:**

```ts
import { catchError, retry, of } from 'rxjs';

http$.pipe(
  retry(2),                          // ri-sottoscrive fino a 2 volte in caso di error
  catchError((err) => of(fallback)), // intercetta l'error e prosegue con uno stream di ripiego
);
```

> [!warning]
> Un `error` **termina** lo stream: dopo, niente più emissioni né `complete`. Se dopo un errore serve continuare (es. una search box che non deve "morire" al primo 500), il `catchError` va messo sull'**inner observable** dentro lo `switchMap`, non sull'outer, altrimenti l'intera pipeline si spegne.

> [!warning]
> `combineLatest` come **operator pipeable** è **deprecato** (RxJS 7+): usare la funzione statica `combineLatest([...])` oppure l'operator `combineLatestWith`. Analogamente `merge`/`concat`/`zip` in forma pipeable sono deprecati a favore delle factory statiche.

## Higher-order mapping: `switchMap` / `mergeMap` / `concatMap` / `exhaustMap`
Sono i **flattening operator**: mappano ogni valore a un **inner Observable** e ne appiattiscono le emissioni nell'output. Differiscono per come gestiscono un inner ancora attivo quando ne arriva uno nuovo:

| Operator | Strategia | Caso d'uso tipico |
| --- | --- | --- |
| `switchMap` | **annulla** l'inner precedente e passa al nuovo | ricerca/typeahead: conta solo l'ultima query |
| `mergeMap` | esegue **tutti** gli inner in parallelo | richieste indipendenti senza ordine (`flatMap` è l'alias) |
| `concatMap` | **accoda** gli inner, uno alla volta in ordine | scritture che devono restare ordinate |
| `exhaustMap` | **ignora** i nuovi finché l'inner corrente non completa | submit/login: evita doppi invii |

```ts
import { switchMap, debounceTime, distinctUntilChanged } from 'rxjs';

this.searchTerm$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap((term) => this.api.search(term)), // annulla la ricerca precedente
);
```

## Hot vs cold
La differenza sta in **dove vive il produttore** dei valori, e di conseguenza se ogni sottoscrizione ottiene una propria esecuzione oppure ne condivide una sola.

- **Cold** — il produttore è creato *dentro* l'Observable, così ogni `subscribe` ne avvia uno nuovo e indipendente. È il default della gran parte delle factory (`of`, `from`, `interval`, `http.get`): due iscritti a `http.get` sono due richieste HTTP separate, ciascuna col proprio flusso dall'inizio.
- **Hot** — il produttore è *esterno* e preesistente, e i subscriber si limitano ad agganciarsi a un flusso già in corso, perdendo ciò che è passato prima della loro iscrizione. Un `Subject` è hot perché non ha una sorgente propria: ritrasmette solo ciò che gli si spinge dentro. `fromEvent(document, 'click')` è intrinsecamente hot perché i click del DOM avvengono comunque, a prescindere dalle sottoscrizioni, e l'Observable è soltanto una finestra su una sorgente che esiste già.

Un cold si **condivide** (multicast) fra più iscritti con `share()`, che interpone un `Subject` e trasforma N esecuzioni in una sola. `shareReplay` fa lo stesso ma **rigioca** gli ultimi valori ai subscriber tardivi, utile come cache di una risposta HTTP consumata in più punti della UI:

```ts
import { shareReplay } from 'rxjs';

const config$ = this.http.get<Config>('/api/config').pipe(
  shareReplay({ bufferSize: 1, refCount: true }), // una sola richiesta, l'ultimo valore rigiocato ai nuovi iscritti
);
```

> [!warning]
> `shareReplay(1)` **senza** `refCount: true` tiene viva la sottoscrizione alla sorgente anche quando gli iscritti scendono a zero: su uno stream che non completa è un memory leak. Per flussi infiniti si usa `shareReplay({ bufferSize: 1, refCount: true })`, così la sorgente si chiude quando l'ultimo consumatore si disiscrive.

Sotto, il multicasting nasce sempre da un `Subject` condiviso. La primitiva a basso livello è [`connectable(source)`](https://rxjs.dev/api/index/function/connectable), un Observable multicast che **non parte** finché non si chiama `.connect()` — uno stato "warm" (condiviso ma inerte fino al via), utile per iscrivere tutti i consumatori *prima* di avviare la sorgente. Gli operator storici `multicast`/`publish`/`refCount` fanno la stessa cosa ma sono **deprecati** in RxJS 7, a favore di `connectable` e di `share`/`shareReplay`.

## Pattern di unsubscribe
Una sottoscrizione non chiusa su uno stream che non completa (`interval`, `valueChanges`, un `Subject`) è un **memory leak**: il callback resta appeso al componente distrutto. Tre pattern corretti:

**1. `takeUntilDestroyed()`** — il modo idiomatico odierno. Completa lo stream quando il contesto (component/directive/service) viene distrutto; va chiamato in un **injection context** (es. nei field initializer) o con un `DestroyRef` esplicito.

```ts
import { inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class Search {
  private readonly api = inject(FlightApi);

  // in injection context (field initializer): niente DestroyRef esplicito
  private readonly results$ = this.control.valueChanges.pipe(
    switchMap((q) => this.api.search(q)),
    takeUntilDestroyed(),
  );

  // fuori dall'injection context: passare il DestroyRef
  private readonly destroyRef = inject(DestroyRef);
  ngOnInit(): void {
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(/* ... */);
  }
}
```

**2. `takeUntil()` + subject di destroy** — il pattern classico pre-`takeUntilDestroyed`, ancora frequentissimo nelle codebase e chiesto all'esame:

```ts
import { Subject, takeUntil } from 'rxjs';

export class Legacy implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    interval(1000)
      .pipe(takeUntil(this.destroy$)) // completa quando destroy$ emette
      .subscribe(/* ... */);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**3. `async` pipe** — la sottoscrizione la gestisce il template: si iscrive al mount, **si disiscrive da solo** alla distruzione. Zero gestione manuale.

```html
@if (results$ | async; as results) {
  <flight-list [flights]="results" />
}
```

> [!warning]
> `takeUntil` va messo **ultimo** nella `pipe` (o comunque dopo gli operator che creano nuove sottoscrizioni), altrimenti un inner observable a valle può restare attivo dopo il destroy. Regola pratica: `takeUntil`/`takeUntilDestroyed` per ultimo.

> [!info|label:vs Modern]
> Il vault ragiona in **signals**: stato reattivo sincrono senza sottoscrizioni da chiudere. Per interoperare con codice RxJS esistente ci sono `toSignal` (da Observable a signal, con unsubscribe automatico) e `toObservable` (da signal a Observable). Reactive design, resource e interop sono in [[03-reactive-design-with-signals]] (qui non ripetuto). RxJS resta rilevante per HTTP, eventi e stream veri.

> [!info|label:Stato attuale]
> RxJS **non è deprecato** né rimosso: `HttpClient`, `Router` ed `EventEmitter` restano Observable-based e i Signal Forms convivono con gli stream. Angular 22 gira su RxJS 7.x; l'interop `toSignal`/`toObservable` è stabile e `takeUntilDestroyed` è stabile dalla v19. Per il codice nuovo si preferiscono i signal per lo **stato**, riservando RxJS agli **eventi/stream** ([rxjs.dev/guide/observable](https://rxjs.dev/guide/observable) · [rxjs.dev/guide/subject](https://rxjs.dev/guide/subject) · [takeUntilDestroyed](https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed)).

## Ripasso lampo

<details>
<summary>Cosa significa che un <code>Observable</code> è "cold" e come si vede la differenza con un <code>Subject</code>?</summary>

Cold = il produttore vive dentro l'Observable e **ogni** subscribe avvia un'esecuzione indipendente (due iscritti a `http.get` sono due richieste distinte). Un `Subject` è hot/multicast: un solo flusso condiviso, e i nuovi iscritti ricevono solo le emissioni successive alla loro sottoscrizione.

</details>

<details>
<summary>Che differenza c'è fra <code>switchMap</code>, <code>mergeMap</code>, <code>concatMap</code> ed <code>exhaustMap</code>?</summary>

Tutti mappano un valore a un inner Observable. `switchMap` annulla l'inner precedente (typeahead); `mergeMap` li esegue tutti in parallelo; `concatMap` li accoda in ordine; `exhaustMap` ignora i nuovi finché l'inner corrente non completa (evita doppi submit).

</details>

<details>
<summary>Quando scegliere <code>BehaviorSubject</code> invece di <code>Subject</code>?</summary>

Quando serve uno "stato corrente" con valore iniziale, da leggere anche in ritardo: `BehaviorSubject` richiede un valore iniziale, emette **l'ultimo** valore a ogni nuovo iscritto ed espone `.value`. Un `Subject` puro non ha valore iniziale né replay.

</details>

<details>
<summary>Come si evita un memory leak da sottoscrizione in un componente?</summary>

Chiudendo lo stream alla distruzione: `takeUntilDestroyed()` (idiomatico, richiede injection context o `DestroyRef`), oppure il classico `takeUntil(destroy$)` con un `Subject` chiuso in `ngOnDestroy`, oppure delegando all'`async` pipe che si disiscrive da sola.

</details>

<details>
<summary>Cosa succede allo stream dopo un <code>error</code>, e dove va messo <code>catchError</code> in una search box?</summary>

L'`error` **termina** lo stream: nessuna emissione successiva. In una search box il `catchError` va sull'**inner observable** dentro lo `switchMap` (per non spegnere la pipeline esterna); metterlo sull'outer farebbe morire l'intera ricerca al primo errore.

</details>

**In sintesi:**
- `Observable` = stream lazy/cold; `Observer` (`next`/`error`/`complete`) consuma, `Subscription.unsubscribe()` ferma; terminazione con `complete` **o** `error`, mai entrambi.
- Creazione con `of`/`from`/`fromEvent`/`interval`/`timer`; **multicasting** con `Subject` e varianti (`BehaviorSubject` per lo stato, `ReplaySubject`, `AsyncSubject`).
- Operator pipeable per trasformare (`map`/`filter`/`scan`), temporizzare (`debounceTime`/`distinctUntilChanged`), combinare (`combineLatest`/`forkJoin`/`withLatestFrom`) e resistere agli errori (`catchError`/`retry`); flattening con `switchMap`/`mergeMap`/`concatMap`/`exhaustMap`.
- **Unsubscribe** obbligatorio sugli stream infiniti: `takeUntilDestroyed`, `takeUntil(destroy$)`, o `async` pipe.
- Equivalente moderno per lo **stato** = signals + interop `toSignal`/`toObservable`, in [[03-reactive-design-with-signals]]; RxJS resta per eventi/stream, non deprecato.
