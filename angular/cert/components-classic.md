---
titolo: "Componenti classici (decoratori)"
tags: [tipo/cert, components, lifecycle, legacy]
livello: [mid]
---
# Componenti classici (decoratori)
> Cert Angular · l'API a decoratori che il *Modern Angular* rimpiazza con `input()`/`output()` e le signal query

Prima delle funzioni signal-based, la comunicazione fra componenti e l'accesso agli elementi del template si basavano su **decoratori** di proprietà: `@Input()`/`@Output()` per il flusso di dati tra padre e figlio, e le query `@ViewChild`/`@ContentChild` per ottenere riferimenti. La cert lo chiede perché è ciò che si trova in quasi tutte le codebase esistenti, e perché i **lifecycle hook** (che restano invariati) si ragionano insieme a queste API.

## `@Input()` — dati dal padre
Un `@Input()` è il canale con cui un componente riceve dati dall'esterno: il decoratore espone una proprietà della classe come attributo *bindabile* dal template del padre, che vi collega un valore con il property binding `[prop]`. La stessa proprietà può assumere forme diverse a seconda del bisogno: opzionale con un valore di default, dichiarata obbligatoria con `{ required: true }` (da Angular 16), rinominata verso l'esterno con un alias, oppure gestita da un setter quando serve intercettare e normalizzare ogni scrittura.

```ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-flight-card',
  template: `<h3>{{ from }} → {{ to }}</h3>`,
})
export class FlightCardComponent {
  @Input() from = '';                            // input opzionale con default
  @Input({ required: true }) to!: string;        // input obbligatorio (v16+)
  @Input('seat') seatNumber?: string;            // alias: nel template [seat]="..."

  // input con setter: intercetta ogni scrittura
  private _price = 0;
  @Input()
  set price(value: number) {
    this._price = Math.max(0, value);
  }
  get price(): number {
    return this._price;
  }
}
```

```html
<!-- template del padre -->
<app-flight-card [from]="'FCO'" [to]="'JFK'" [seat]="'12A'" [price]="299" />
```

## `@Output()` + `EventEmitter` — eventi verso il padre
Se l'`@Input()` porta i dati verso il basso, l'`@Output()` li fa risalire: è una proprietà di tipo `EventEmitter` con cui il figlio **notifica** il padre che è accaduto qualcosa. Il figlio chiama `.emit(payload)` per emettere un valore tipizzato, e il padre lo intercetta con un event binding `(evento)`, ricevendo il payload nella variabile speciale `$event`.

```ts
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-flight-card',
  template: `<button (click)="select.emit(id)">Seleziona</button>`,
})
export class FlightCardComponent {
  id = 'AZ123';
  @Output() select = new EventEmitter<string>();   // evento tipizzato
}
```

```html
<app-flight-card (select)="onSelect($event)" />
```

## Query: `@ViewChild` / `@ContentChild`
Le **query** servono a ottenere, da dentro la classe, un riferimento programmatico a un elemento del DOM, a una direttiva o a un componente del template — per esempio per dare il focus a un input o invocare un metodo di un figlio. La distinzione che conta è *dove* Angular cerca: una query **view** (`@ViewChild`/`@ViewChildren`) guarda il template del componente stesso, mentre una query **content** (`@ContentChild`/`@ContentChildren`) guarda il contenuto *proiettato* dall'esterno attraverso `<ng-content>`. Al singolare la query restituisce il primo match, al plurale una `QueryList` osservabile tramite `.changes`.

```ts
import {
  Component, ViewChild, ViewChildren, ContentChild, ContentChildren,
  ElementRef, QueryList, AfterViewInit, AfterContentInit,
} from '@angular/core';

@Component({ /* ... */ })
export class PanelComponent implements AfterViewInit, AfterContentInit {
  // elemento del PROPRIO template, individuato da una template reference variable
  @ViewChild('title') titleRef!: ElementRef<HTMLHeadingElement>;

  // componente figlio; { static: false } (default) → risolto dopo l'init della view
  @ViewChild(ChildComponent, { static: false }) child!: ChildComponent;

  // tutti i figli che matchano: è una QueryList osservabile (.changes)
  @ViewChildren(ItemComponent) items!: QueryList<ItemComponent>;

  // contenuto PROIETTATO via <ng-content>
  @ContentChild(HeaderDirective) header!: HeaderDirective;
  @ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;

  ngAfterContentInit() {
    // qui i @ContentChild / @ContentChildren sono risolti
    console.log(this.tabs.length);
  }

  ngAfterViewInit() {
    // qui i @ViewChild (static:false) / @ViewChildren sono risolti
    this.titleRef.nativeElement.focus();
  }
}
```

### L'opzione `{ static }`
L'opzione `static` di una `@ViewChild` decide **quando** Angular risolve la query, e quindi in quale lifecycle hook il riferimento è già disponibile.

- `{ static: true }` — la query è risolta **prima** della prima change detection, quindi è già disponibile in `ngOnInit`. Funziona **solo** se il target è sempre presente nel template (non dietro `*ngIf`/`*ngFor`).
- `{ static: false }` — **default** da Angular 9; la query è risolta **dopo** l'inizializzazione della view, disponibile in `ngAfterViewInit`. Obbligatoria se il target è condizionale o dinamico.

## Template reference variables
Una **template reference variable** `#nome` dà un nome a un elemento direttamente nel markup, così lo si può riferire altrove *nello stesso template* senza passare dalla classe. Su un elemento HTML la variabile punta al nodo DOM nativo, mentre su un componente o una direttiva punta all'istanza della relativa classe, di cui si possono leggere proprietà e invocare metodi.

```html
<input #box (keyup)="onKey(box.value)" />
<button (click)="box.focus()">Focus</button>

<app-counter #counter></app-counter>
<button (click)="counter.reset()">Reset</button>
```

## Lifecycle hook e ordine di esecuzione
Angular chiama gli hook (interfacce `OnInit`, `OnChanges`, …) in un ordine fisso. `ngOnChanges` riceve una mappa `SimpleChanges` con `previousValue`, `currentValue` e `firstChange` per ogni input cambiato.

```ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

export class GreetingComponent implements OnChanges {
  @Input() name = '';

  ngOnChanges(changes: SimpleChanges) {
    const c = changes['name'];
    if (c && !c.firstChange) {
      console.log(`name: ${c.previousValue} → ${c.currentValue}`);
    }
  }
}
```

Ordine al primo render (poi i `…Checked` si ripetono a ogni ciclo di CD):

1. **`ngOnChanges(changes)`** — prima di `ngOnInit` e a ogni cambio di un `@Input` bound dal template.
2. **`ngOnInit()`** — una volta, dopo il primo `ngOnChanges`. Init della logica, fetch dati.
3. **`ngDoCheck()`** — a ogni ciclo di CD; change detection custom oltre a quella di default.
4. **`ngAfterContentInit()`** — una volta, dopo la proiezione del contenuto; qui i `@ContentChild` sono risolti.
5. **`ngAfterContentChecked()`** — dopo ogni check del contenuto proiettato.
6. **`ngAfterViewInit()`** — una volta, dopo l'init della view del componente e delle view figlie; qui i `@ViewChild` (static:false) sono risolti.
7. **`ngAfterViewChecked()`** — dopo ogni check della view del componente.
8. **`ngOnDestroy()`** — subito prima della distruzione; cleanup (unsubscribe, timer, listener).

> [!warning]
> Insidie d'esame:
> - `ngOnChanges` scatta **solo** se il componente ha `@Input` bound dal template. Se muti un oggetto/array in-place (`this.data.push(x)`) senza cambiarne il riferimento, `ngOnChanges` **non** lo rileva: cambia solo il riferimento (`this.data = [...]`) a farlo scattare.
> - Confondere `@ViewChild` e `@ContentChild`: un `@ViewChild` **non** vede il contenuto proiettato via `<ng-content>` (quello è `@ContentChild`), e viceversa.
> - `{ static: true }` su un target dietro `*ngIf`/`*ngFor`: il riferimento resta `undefined`.
> - Dimenticare l'`unsubscribe` in `ngOnDestroy` per gli `Observable` non gestiti dalla `async` pipe è un classico memory leak.

> [!info] vs Modern
> Il moderno sostituisce i decoratori con funzioni signal-based: `input()` / `input.required()`, `output()` e `model()` per il two-way binding, tutti spiegati in [[02-signal-based-components]]. Le query diventano `viewChild()` / `viewChildren()` / `contentChild()` / `contentChildren()`, che ritornano signal e non hanno più l'opzione `{ static }`, trattate in [[10-signal-queries-component-communication]]. Qui non ripetuti.

> [!info] Stato attuale
> `@Input()` / `@Output()` e i decoratori query **non sono deprecati** e restano pienamente supportati; convivono con le API signal-based nello stesso componente. Per il codice nuovo la documentazione raccomanda `input()` / `output()` / `viewChild()`. I lifecycle hook sono validi in entrambi i mondi (vedi [angular.dev/guide/components/lifecycle](https://angular.dev/guide/components/lifecycle)).

## Ripasso lampo

<details>
<summary>In quale hook sono garantiti risolti i <code>@ViewChild</code> con <code>{ static: false }</code>? E i <code>@ContentChild</code>?</summary>

I `@ViewChild` (static:false) in **`ngAfterViewInit`**; i `@ContentChild` in **`ngAfterContentInit`**. Con `{ static: true }` un `@ViewChild` è già disponibile in `ngOnInit`, ma solo se il target non è condizionale.

</details>

<details>
<summary>Quando *non* scatta <code>ngOnChanges</code>?</summary>

Quando il componente non ha `@Input` bound dal template, o quando si muta un oggetto/array **in-place** senza cambiarne il riferimento. `ngOnChanges` reagisce al cambio di **riferimento** dell'input, non alle mutazioni interne.

</details>

<details>
<summary>Qual è la differenza fra <code>@ViewChild</code> e <code>@ContentChild</code>?</summary>

`@ViewChild` interroga la **view** del componente, cioè gli elementi/componenti del suo template. `@ContentChild` interroga il **contenuto proiettato** dall'esterno tramite `<ng-content>`. Sono due alberi distinti.

</details>

<details>
<summary>Qual è l'ordine degli hook al primo render?</summary>

Nell'ordine: `ngOnChanges`, `ngOnInit`, `ngDoCheck`, `ngAfterContentInit`, `ngAfterContentChecked`, `ngAfterViewInit`, `ngAfterViewChecked`; `ngOnDestroy` alla distruzione. Gli hook `…Checked` si ripetono a ogni ciclo di CD.

</details>

<details>
<summary>A cosa serve <code>{ static: true }</code> in una query e quando non si può usare?</summary>

Risolve la query **prima** della change detection, rendendola disponibile già in `ngOnInit`. Non si può usare se il target è dietro `*ngIf`/`*ngFor` o è dinamico: in quel caso sarà `undefined` e serve `{ static: false }`.

</details>

**In sintesi:**
- `@Input()` (con alias, `required`, setter) porta i dati dal padre; `@Output()` + `EventEmitter.emit()` mandano eventi al padre.
- Query **view** (`@ViewChild`/`@ViewChildren`) = template proprio; query **content** (`@ContentChild`/`@ContentChildren`) = contenuto proiettato. `{ static }` decide se la risoluzione avviene prima della CD (`ngOnInit`) o dopo l'init della view (`ngAfterViewInit`).
- Lifecycle: `ngOnChanges → ngOnInit → ngDoCheck → AfterContent(Init/Checked) → AfterView(Init/Checked) → ngOnDestroy`; `ngOnChanges` riceve `SimpleChanges`.
- Equivalente moderno = `input()`/`output()`/`model()` + signal query, in [[02-signal-based-components]] e [[10-signal-queries-component-communication]]; i decoratori non sono deprecati.
