---
titolo: "Direttive e pipe classiche"
tags: [tipo/cert, directives, templates, legacy]
livello: [junior, mid]
---
# Direttive e pipe classiche
> 🎓 Cert Angular · il control flow `*ngIf`/`*ngFor` pre-`@if`/`@for`, più directive attributo e pipe (invariati)

Prima del **control flow a blocchi** (`@if`/`@for`/`@switch`), la logica di template si esprimeva con le **structural directive** `*ngIf`/`*ngFor`/`*ngSwitch` di `CommonModule`. Le **directive attributo** custom e le **pipe** (built-in e custom, pure/impure, `async`) sono invece rimaste sostanzialmente invariate. La cert copre tutto questo perché è pervasivo nelle codebase esistenti.

## `*ngIf` con `then`/`else`
L'asterisco è **zucchero sintattico**: la direttiva aggiunge/rimuove un intero blocco dal DOM. La forma con `as` cattura il valore, e `then`/`else` puntano a `<ng-template>`.

```html
<div *ngIf="user$ | async as user; then loaded; else loading"></div>

<ng-template #loaded>Ciao {{ user.name }}</ng-template>
<ng-template #loading>Caricamento…</ng-template>
```

## `*ngFor` con variabili locali e `trackBy`
`*ngFor` espone variabili locali (`index`, `first`, `last`, `even`, `odd`) e accetta una funzione `trackBy`.

```html
<li
  *ngFor="let item of items;
          index as i;
          first as isFirst;
          last as isLast;
          even as isEven;
          odd as isOdd;
          trackBy: trackById">
  {{ i }} — {{ item.name }}
</li>
```

```ts
trackById(index: number, item: Item): number {
  return item.id;                 // chiave stabile per identificare l'elemento
}
```

Senza `trackBy`, Angular identifica gli elementi per **riferimento all'oggetto**: se la lista viene rimpiazzata da un nuovo array (tipico dopo una chiamata HTTP), distrugge e ricrea *tutti* i nodi DOM. `trackBy` fornisce una chiave stabile → Angular riusa i nodi esistenti (meglio per performance, focus, animazioni).

## `*ngSwitch`
`[ngSwitch]` è un **property binding** (senza `*`); i case sono structural (`*ngSwitchCase` / `*ngSwitchDefault`).

```html
<div [ngSwitch]="status">
  <p *ngSwitchCase="'active'">Attivo</p>
  <p *ngSwitchCase="'paused'">In pausa</p>
  <p *ngSwitchDefault>Sconosciuto</p>
</div>
```

## Il de-zuccheraggio `*` → `<ng-template>`
La sintassi `*direttiva` è una scorciatoia: Angular la espande in un `<ng-template>` con la direttiva applicata come property binding. Le due forme sono equivalenti.

```html
<!-- zucchero sintattico -->
<div *ngIf="show">Ciao</div>

<!-- forma de-zuccherata equivalente -->
<ng-template [ngIf]="show">
  <div>Ciao</div>
</ng-template>
```

Conseguenza: su uno stesso elemento può esserci **una sola** structural directive (`*`). Per combinarne due si annida un `<ng-container>`.

## `ngClass` / `ngStyle`
Direttive attributo che applicano classi o stili in blocco, in base a un oggetto/array/stringa.

```html
<div [ngClass]="{ active: isActive, disabled: isDisabled }"></div>
<div [ngClass]="['card', 'shadow']"></div>

<div [ngStyle]="{ color: textColor, 'font-size.px': size }"></div>
```

Per una singola classe/proprietà i binding nativi `[class.active]="isActive"` e `[style.color]="textColor"` sono più diretti; `ngClass`/`ngStyle` servono quando le chiavi sono molte o dinamiche.

## `<ng-container>`
Elemento logico che **non** produce alcun nodo nel DOM: utile per applicare una structural directive senza aggiungere un wrapper, o per annidare due strutturali.

```html
<!-- nessun <div> extra nel DOM -->
<ng-container *ngIf="ready">
  <h2>Titolo</h2>
  <p>Testo</p>
</ng-container>

<!-- due structural directive "logiche" senza elemento wrapper -->
<ng-container *ngFor="let row of rows">
  <tr *ngIf="row.visible">{{ row.label }}</tr>
</ng-container>
```

## Directive attributo custom
Una `@Directive` con selettore per attributo modifica comportamento/aspetto dell'elemento host. `ElementRef` dà accesso al nodo; `Renderer2` lo manipola in modo platform-agnostic; `@HostBinding`/`@HostListener` legano proprietà ed eventi dell'host; un `@Input` configura la direttiva.

```ts
import {
  Directive, ElementRef, Renderer2, HostBinding, HostListener, Input,
} from '@angular/core';

@Directive({
  selector: '[appHighlight]',                 // matcha l'attributo appHighlight
})
export class HighlightDirective {
  @Input('appHighlight') color = 'yellow';    // alias: <p [appHighlight]="'lime'">

  @HostBinding('style.cursor') cursor = 'pointer';   // binding a una prop dell'host

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {}

  @HostListener('mouseenter')                 // ascolta un evento dell'host
  onEnter() {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', this.color);
  }

  @HostListener('mouseleave')
  onLeave() {
    this.renderer.removeStyle(this.el.nativeElement, 'backgroundColor');
  }
}
```

```html
<p appHighlight="lime">Passaci sopra</p>
```

`Renderer2` è preferito all'accesso diretto a `nativeElement.style` perché astrae dal DOM (funziona con SSR e altri renderer) ed è più sicuro.

## Pipe
Una pipe trasforma un valore nell'interpolazione. Built-in comuni: `date`, `currency`, `number`, `percent`, `uppercase`/`lowercase`/`titlecase`, `slice`, `json`, `keyvalue`, `async`.

```html
{{ today | date:'dd/MM/yyyy' }}
{{ price | currency:'EUR' }}
{{ name  | uppercase }}
{{ items | slice:0:3 }}
```

### Pipe custom
Classe con `@Pipe` che implementa `PipeTransform`; i parametri seguono i due punti nel template.

```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'exclaim',
  pure: true,          // default; ricalcola solo al cambio di riferimento dell'input
})
export class ExclaimPipe implements PipeTransform {
  transform(value: string, times = 1): string {
    return value + '!'.repeat(times);
  }
}
```

```html
{{ msg | exclaim:3 }}
```

### Pure vs impure (`pure: false`)
- **Pura** (default): `transform` è richiamata **solo** quando cambia il **riferimento** dell'input (o di un parametro). Angular memoizza il risultato → efficiente.
- **Impura** (`pure: false`): richiamata a **ogni** ciclo di change detection, anche senza cambio di riferimento. Necessaria per input mutati in-place, ma costosa. `async` e `keyvalue` sono impure.

### `async` pipe
Sottoscrive un `Observable` (o `Promise`), restituisce l'ultimo valore emesso e **si disiscrive automaticamente** alla distruzione del componente → niente `unsubscribe` manuale, niente memory leak.

```html
<div>{{ time$ | async }}</div>

<ul>
  <li *ngFor="let u of users$ | async">{{ u.name }}</li>
</ul>
```

> [!warning]
> Insidie d'esame:
> - Due structural directive (`*`) sullo **stesso** elemento → errore di compilazione. Annidarle con `<ng-container>`.
> - `trackBy` dimenticato su liste che si rigenerano → DOM ricreato da zero: perdita di focus/stato e perf peggiore.
> - Pipe impura (`pure: false`) richiamata a ogni ciclo di CD → costosa; preferire pipe pure con input immutabili.
> - `[ngSwitch]` è un property binding, i suoi case sono strutturali (`*ngSwitchCase`): mischiare le sintassi è un errore comune.
> - `<ng-template>` da solo **non** renderizza nulla finché non viene istanziato (da una structural directive o da un `ViewContainerRef`); `<ng-container>` invece renderizza subito il suo contenuto.

> [!info] vs Modern
> Il control flow strutturale è ora **nativo** nel template: `@if`/`@else`, `@for` (con `track` **obbligatorio**, l'equivalente di `trackBy`) e `@switch` sostituiscono `*ngIf`/`*ngFor`/`*ngSwitch` → [[02-signal-based-components]]. Le structural directive **custom** (con `TemplateRef` e `ViewContainerRef`) restano attuali e sono trattate nel vault → [[11-directives-templates-containers]] (qui non ripetute). Directive attributo e pipe non cambiano.

> [!info] Stato attuale
> Da Angular v17 il control flow a blocchi (`@if`/`@for`/`@switch`) è la forma raccomandata; `NgIf`/`NgFor`/`NgSwitch` restano supportati ma sconsigliati per il codice nuovo, con migration automatica (`ng generate @angular/core:control-flow`). `NgClass`/`NgStyle`, le directive attributo custom e le pipe **non sono deprecate**. → [angular.dev/guide/templates/control-flow](https://angular.dev/guide/templates/control-flow)

## 🔁 Ripasso lampo

**1.** A cosa serve `trackBy` in `*ngFor`?
> [!success]- Risposta
> Fornisce una chiave stabile per identificare gli elementi. Senza, Angular li identifica per riferimento e, se l'array viene rimpiazzato, ricrea tutti i nodi DOM. Con `trackBy` riusa i nodi esistenti: meglio per performance, focus e animazioni.

**2.** Qual è la differenza fra pipe pura e impura? Quando serve un'impura?
> [!success]- Risposta
> La pura ricalcola **solo** al cambio di riferimento dell'input (memoizzata, efficiente). L'impura (`pure: false`) ricalcola a **ogni** ciclo di CD. Serve quando l'input muta in-place senza cambiare riferimento (es. filtrare un array mutato), ma è costosa.

**3.** Come si annidano due structural directive sullo stesso elemento?
> [!success]- Risposta
> Non si può: su un elemento c'è al massimo un `*`. Si usa un `<ng-container>` come wrapper logico (senza nodo DOM) per ospitare la seconda direttiva, es. `<ng-container *ngFor="...">` con dentro `<tr *ngIf="...">`.

**4.** Cosa fa la pipe `async` oltre a mostrare il valore?
> [!success]- Risposta
> Sottoscrive automaticamente l'`Observable`/`Promise`, ne mostra l'ultimo valore emesso e **si disiscrive** alla distruzione del componente. Elimina la gestione manuale di `subscribe`/`unsubscribe` e i relativi memory leak.

**5.** Differenza fra `<ng-container>` e `<ng-template>`?
> [!success]- Risposta
> `<ng-container>` è un raggruppamento logico renderizzato subito, che **non** aggiunge nodi al DOM. `<ng-template>` definisce un blocco che **non** viene renderizzato finché non è istanziato (da una structural directive o da un `ViewContainerRef`).

**In sintesi:**
- `*ngIf` (con `then`/`else`), `*ngFor` (`index`/`first`/`last`/`even`/`odd` + `trackBy`) e `*ngSwitch` sono zucchero sui `<ng-template>`; un solo `*` per elemento, `<ng-container>` per annidarli senza wrapper.
- `ngClass`/`ngStyle` applicano classi/stili in blocco; per il singolo valore i binding `[class.x]`/`[style.y]` sono più diretti.
- Directive attributo custom: `@Directive` + `ElementRef`/`Renderer2` + `@HostBinding`/`@HostListener` + `@Input`.
- Pipe: pure (default, memoizzate) vs impure (`pure: false`, ogni ciclo); `async` sottoscrive e si disiscrive da solo.
- Equivalente moderno = `@if`/`@for`/`@switch` → [[02-signal-based-components]]; structural directive custom → [[11-directives-templates-containers]].
