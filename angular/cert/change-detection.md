---
titolo: "Change detection (Zone.js)"
tags: [tipo/cert, performance, change-detection, legacy]
livello: [mid, senior]
---
# Change detection (Zone.js)
> Cert Angular · il modello Zone.js, che il *Modern Angular* supera con signal + zoneless

La **change detection** (CD) è il processo con cui Angular sincronizza lo stato dei componenti con il DOM. Nel modello classico è **Zone.js** a decidere *quando* farla partire, la strategia (`Default` vs `OnPush`) a decidere *quali* componenti controllare, e `ChangeDetectorRef`/`NgZone` a intervenire manualmente. La cert lo chiede perché è il modello di gran lunga più diffuso nelle app esistenti.

## Zone.js: cosa fa e quando triggera la CD
Zone.js fa **monkey-patch** (sostituzione a runtime) delle API asincrone del browser: `setTimeout`/`setInterval`, gli event listener del DOM, le `Promise`, `XHR`/`fetch`. Quando uno di questi callback finisce e la coda dei microtask si svuota, Angular (via `NgZone.onMicrotaskEmpty`) lancia un ciclo di CD sull'intero albero dei componenti.

È il motivo per cui, nel modello classico, **non** serve dire manualmente ad Angular di aggiornare la view: basta mutare una proprietà dentro un handler async e la view si ridisegna.

## L'albero di CD
La CD parte dalla radice e scende **top-down**, un componente alla volta, in un unico passaggio (flusso unidirezionale). Per ogni componente confronta le espressioni del template col valore precedente e aggiorna il DOM dove differiscono.

```
AppComponent            (root — la CD parte qui)
├─ HeaderComponent
├─ ListComponent
│  ├─ ItemComponent
│  └─ ItemComponent
└─ FooterComponent
```

## Strategie: `Default` vs `OnPush`
Se Zone.js decide *quando* far partire la change detection, la **strategia** del singolo componente decide *se* quel componente vada davvero ricontrollato. È la leva principale con cui, nel modello classico, si evita di far lavorare la CD dove non serve. La si imposta con il metadato `changeDetection` del decoratore `@Component`, che accetta uno dei due valori dell'enum `ChangeDetectionStrategy`.

```ts
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `{{ item.name }}`,
})
export class ItemComponent {
  @Input() item!: Item;
}
```

- **`Default`** — a ogni ciclo Angular ricontrolla il componente, sempre.
- **`OnPush`** — Angular **salta** il componente e il suo sottoalbero, controllandolo **solo** quando si verifica una di queste condizioni:
  1. cambia il **riferimento** di un `@Input` (non la mutazione in-place di un oggetto/array);
  2. parte un **evento dal template** del componente (o di un suo figlio);
  3. una **`async` pipe** presente nel template emette un nuovo valore;
  4. si chiama esplicitamente **`markForCheck()`** sul suo `ChangeDetectorRef`.

`OnPush` di fatto impone di lavorare con input **immutabili**: cambiare un dato significa creare un nuovo riferimento invece di mutare l'oggetto esistente. Il vincolo ripaga, perché Angular esegue molti meno controlli e il flusso dei dati diventa più prevedibile, oltre che più veloce.

## `ChangeDetectorRef`
Quando la change detection automatica non basta — tipicamente con `OnPush`, dopo un aggiornamento che Angular non ha modo di intercettare da solo — si interviene a mano tramite `ChangeDetectorRef`, il servizio che dà a ogni componente il controllo esplicito sul proprio ciclo di detection. Lo si inietta nel costruttore e da lì si può marcare il componente come "da controllare", forzare subito un controllo, oppure staccarlo del tutto dall'albero.

```ts
import { ChangeDetectorRef } from '@angular/core';

constructor(private cdr: ChangeDetectorRef) {}
```

- **`markForCheck()`** — marca il componente e i suoi **antenati** come da controllare al **prossimo** ciclo. È ciò che si usa con `OnPush` dopo un aggiornamento asincrono.
- **`detectChanges()`** — esegue **subito** la CD su questo componente e i suoi figli.
- **`detach()`** — stacca il componente dall'albero di CD: non verrà più controllato automaticamente (utile per aggiornamenti ad altissima frequenza gestiti a mano).
- **`reattach()`** — lo riattacca all'albero.

## `NgZone`
`NgZone` è il servizio che rappresenta la zone di Angular, cioè il contesto di esecuzione dentro cui Zone.js intercetta l'async e fa scattare la CD. Iniettandolo si può deliberatamente **uscire** da quel contesto per eseguire codice che non deve innescare la detection, e poi **rientrarvi** solo nei momenti in cui serve davvero aggiornare la view.

```ts
import { NgZone } from '@angular/core';

constructor(private zone: NgZone) {}

startPolling() {
  this.zone.runOutsideAngular(() => {         // fuori da Angular: NON triggera CD
    setInterval(() => {
      this.frame++;                           // aggiornato ma la view non si ridisegna
      if (this.frame % 60 === 0) {
        this.zone.run(() => this.render());   // rientra: riattiva la CD per la view
      }
    }, 16);
  });
}
```

- **`runOutsideAngular(fn)`** — esegue `fn` **fuori** dalla zone: i callback async al suo interno non scatenano la CD (ideale per animazioni/polling ad alta frequenza).
- **`run(fn)`** — **rientra** nella zone e riattiva la CD, per aggiornare la view da codice partito fuori-zone.

## `ExpressionChangedAfterItHasBeenCheckedError`
In modalità **dev** Angular esegue un secondo giro di CD subito dopo il primo per verificare la stabilità delle espressioni. Se un valore letto nel template cambia fra i due giri — tipicamente perché un hook come `ngAfterViewInit` modifica una proprietà già controllata — lancia `ExpressionChangedAfterItHasBeenCheckedError` (**NG0100**). Compare solo in dev; in produzione il secondo giro non viene eseguito.

Rimedi: spostare l'aggiornamento a un momento precedente (es. `ngOnInit`), forzare un nuovo ciclo con `cdr.detectChanges()`, oppure differire con `Promise.resolve().then(() => …)`.

> [!warning]
> Insidie d'esame:
> - Con `OnPush`, mutare un `@Input` **in-place** (`this.items.push(x)`) **non** aggiorna la view: serve cambiarne il riferimento (`this.items = [...this.items, x]`) o chiamare `markForCheck()`.
> - `detectChanges()` vs `markForCheck()`: il primo esegue la CD **subito** sul sottoalbero corrente; il secondo **marca** (risalendo agli antenati) e aspetta il **prossimo** ciclo. Confonderli è un classico.
> - `runOutsideAngular` non "spegne" la reattività dei signal: in zoneless la CD è comunque notificata dai signal letti nel template.

> [!info] vs Modern
> Il moderno combina **signal + `OnPush` + zoneless**: i signal notificano puntualmente i soli componenti che li leggono, quindi la CD diventa granulare e non serve più né Zone.js né, spesso, il `markForCheck()` manuale. Il modello reattivo signal-based è già spiegato nel vault, in [[03-reactive-design-with-signals]] e [[02-signal-based-components]] (qui non ripetuto).

> [!info] Stato attuale
> Da Angular **v20.2** l'API zoneless è **stabile** (`provideZonelessChangeDetection()`) e da **v21** le nuove app sono **zoneless di default** (Zone.js non più incluso). Senza Zone.js la CD è guidata dalle notifiche dei signal, da `markForCheck()`, dagli eventi del template e dalla `async` pipe — di fatto le stesse condizioni di `OnPush`. Il modello Zone.js resta pienamente supportato per le app esistenti (vedi [angular.dev/guide/zoneless](https://angular.dev/guide/zoneless)).

## Ripasso lampo

**1.** Cosa fa Zone.js e come fa scattare la change detection?
> [!success]- Risposta
> Fa monkey-patch delle API asincrone (`setTimeout`, eventi DOM, `Promise`, `XHR`). Al termine di un callback async, quando la coda dei microtask si svuota, notifica Angular (`onMicrotaskEmpty`) che lancia un ciclo di CD sull'intero albero: per questo non serve segnalare a mano gli aggiornamenti.

**2.** Quali sono le condizioni che fanno controllare un componente `OnPush`?
> [!success]- Risposta
> (1) cambio di **riferimento** di un `@Input`; (2) **evento** dal template del componente o di un figlio; (3) emissione di una **`async` pipe** nel template; (4) chiamata esplicita a **`markForCheck()`**. Altrimenti il componente e il suo sottoalbero vengono saltati.

**3.** Differenza fra `markForCheck()` e `detectChanges()`?
> [!success]- Risposta
> `markForCheck()` **marca** il componente e i suoi antenati come da controllare al **prossimo** ciclo (tipico con `OnPush` dopo un update async). `detectChanges()` esegue la CD **immediatamente** sul componente e i suoi figli.

**4.** A cosa serve `runOutsideAngular`?
> [!success]- Risposta
> A eseguire codice async **fuori** dalla zone di Angular, così i suoi callback non scatenano la CD: utile per lavori ad alta frequenza (animazioni, polling). Per aggiornare la view si rientra con `NgZone.run()`.

**5.** Quando appare `ExpressionChangedAfterItHasBeenCheckedError` e come si risolve?
> [!success]- Risposta
> Solo in dev, quando un valore usato nel template cambia fra il primo e il secondo giro di CD (es. modificato in `ngAfterViewInit`). Si risolve spostando l'update prima (`ngOnInit`), forzando `cdr.detectChanges()`, o differendo con `Promise.resolve().then(...)`.

**In sintesi:**
- **Zone.js** intercetta l'async e fa partire la CD sull'intero albero, che scende **top-down** dalla radice.
- **`Default`** controlla sempre; **`OnPush`** salta il sottoalbero e ricontrolla solo su cambio riferimento di `@Input`, evento dal template, emissione `async` o `markForCheck()`.
- `ChangeDetectorRef`: `markForCheck` (prossimo ciclo, risale agli antenati) / `detectChanges` (subito) / `detach`+`reattach`. `NgZone`: `runOutsideAngular` / `run`.
- In dev, `ExpressionChangedAfterItHasBeenCheckedError` (NG0100) segnala un valore mutato dopo il check.
- Moderno = signal + `OnPush` + **zoneless** (stabile da v20.2, default da v21), in [[03-reactive-design-with-signals]] e [[02-signal-based-components]].
