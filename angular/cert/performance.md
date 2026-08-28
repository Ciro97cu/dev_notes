---
titolo: "Performance"
tags: [tipo/cert, performance, legacy]
livello: [senior]
---
# Performance
> Cert Angular · tecniche di ottimizzazione dell'Angular *classico* (module-based, CD con Zone.js) — il vault moderno le tratta con signals e `@defer`

Le performance di un'app Angular si giocano su due assi: **quanto codice si scarica** (bundle, lazy loading) e **quanto lavoro fa la change detection** (CD) a ogni ciclo. La cert Senior chiede le leve *classiche* (`trackBy`, `OnPush` con dati immutabili, pure pipe, `PreloadingStrategy`, bundle budget) perché sono ciò che si trova (e si deve saper ottimizzare) in una codebase Zone.js pre-signal.

## `trackBy` in `*ngFor`
Senza `trackBy`, `*ngFor` identifica gli elementi della lista per **riferimento all'oggetto**: se la collezione viene rimpiazzata (es. dopo un fetch), Angular considera *tutti* gli item nuovi, distrugge e ricrea l'intero DOM. Una funzione `trackBy` fornisce una **chiave stabile** (di solito un `id`), così Angular riusa i nodi esistenti e tocca solo ciò che è cambiato.

```ts
@Component({
  selector: 'app-flight-list',
  template: `
    <li *ngFor="let flight of flights; trackBy: trackById">
      {{ flight.from }} → {{ flight.to }}
    </li>
  `,
})
export class FlightListComponent {
  flights: Flight[] = [];

  // firma richiesta: (index, item) => chiave stabile
  trackById(index: number, flight: Flight): number {
    return flight.id;
  }
}
```

> [!warning]
> `trackBy` deve restituire un valore **stabile e univoco** per item. Ritornare l'`index` vanifica il beneficio quando la lista viene riordinata o filtrata (l'indice cambia pur essendo lo stesso oggetto), e ritornare l'oggetto stesso equivale a non avere `trackBy`.

## `OnPush` + dati immutabili
Con la strategia di default ogni componente viene ricontrollato a ogni ciclo di CD. Con `ChangeDetectionStrategy.OnPush` Angular **salta il sottoalbero** del componente e lo ricontrolla solo quando: il **riferimento** di un `@Input` cambia, parte un evento dal componente o da un suo figlio, una `async` pipe nel template emette, oppure si invoca manualmente `markForCheck()`.

```ts
@Component({
  selector: 'app-flight-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h3>{{ flight.from }} → {{ flight.to }}</h3>`,
})
export class FlightCardComponent {
  @Input() flight!: Flight;
}
```

Il presupposto è lavorare con **dati immutabili**: aggiornare significa creare un **nuovo oggetto/array**, non mutare quello esistente.

```ts
// ❌ mutazione in place: il riferimento non cambia → OnPush NON rileva nulla
this.flight.from = 'FCO';

// ✅ nuovo riferimento → OnPush rileva il cambiamento
this.flight = { ...this.flight, from: 'FCO' };
```

> [!warning]
> L'insidia d'esame più frequente su `OnPush`: mutare in place un oggetto passato come `@Input` (es. `arr.push(...)` o `obj.prop = x`) e stupirsi che la view non si aggiorni. Senza cambio di **riferimento** il componente resta invisibile alla CD finché qualcos'altro non lo forza (`markForCheck()`).

## Pure pipe al posto di chiamate a metodo nel template
Un metodo invocato nell'interpolazione (`{{ formatName(passenger) }}`) viene rieseguito a **ogni** ciclo di CD, anche quando nulla di rilevante è cambiato. Una **pure pipe** (pipe *pura*: senza stato, output funzione solo dei suoi input) è invece memoizzata: `transform` gira di nuovo **solo se cambia il riferimento** di un argomento.

```ts
@Pipe({ name: 'fullName' }) // pure: true è il default
export class FullNamePipe implements PipeTransform {
  transform(passenger: Passenger): string {
    return `${passenger.firstName} ${passenger.lastName}`;
  }
}
```

```html
<!-- ❌ rieseguito a ogni CD -->
<span>{{ formatName(passenger) }}</span>

<!-- ✅ ricalcolato solo se cambia il riferimento di passenger -->
<span>{{ passenger | fullName }}</span>
```

> [!warning]
> Una pipe **impura** (`@Pipe({ name: '...', pure: false })`) gira a ogni CD come una chiamata a metodo: si usa solo quando serve davvero (es. la `async` pipe è impura per costruzione). Non è una scorciatoia per aggirare i limiti delle pure pipe.

## Lazy loading e `PreloadingStrategy`
Il lazy loading via `loadChildren` (vedi [[ngmodules]]) rimanda lo scaricamento di un feature module al momento della navigazione. Il rovescio della medaglia è la latenza al primo accesso: la **preloading strategy** decide se e quando scaricare in anticipo i bundle lazy, dopo che l'app iniziale è partita.

```ts
import { PreloadAllModules, RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules, // scarica tutti i lazy bundle dopo il bootstrap
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```

- **`NoPreloading`** — default: niente preload, ogni modulo si carica alla prima navigazione.
- **`PreloadAllModules`** — precarica in background *tutti* i moduli lazy appena l'app è pronta.
- **Custom** — implementando l'interfaccia `PreloadingStrategy` si sceglie *cosa* precaricare (es. solo le rotte marcate in `data`):

```ts
@Injectable({ providedIn: 'root' })
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    return route.data?.['preload'] ? load() : of(null);
  }
}
```

```ts
// nelle rotte: { path: 'booking', loadChildren: ..., data: { preload: true } }
// nel forRoot: { preloadingStrategy: SelectivePreloadingStrategy }
```

## Code splitting per rotta
Ogni `loadChildren` (o `loadComponent`) definisce un **confine di splitting**: il bundler produce un chunk separato per quel ramo. Suddividere l'app **per rotta** è la forma di code splitting più naturale in Angular — il bundle iniziale resta piccolo (solo shell + rotte eager) e il resto arriva on-demand. Rimandare al lazy loading le aree pesanti (dashboard, editor, area admin) è la leva con l'impatto maggiore sul *time-to-interactive*.

## Bundle budget in `angular.json`
I **budget** impongono soglie di dimensione al build: la CLI emette un *warning* superata `maximumWarning` e **fa fallire il build** superata `maximumError`. Servono a impedire regressioni silenziose sul peso del bundle.

```json
// angular.json → projects.<app>.architect.build.configurations.production
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "500kb",
    "maximumError": "1mb"
  },
  {
    "type": "anyComponentStyle",
    "maximumWarning": "2kb",
    "maximumError": "4kb"
  }
]
```

- **`initial`** — JS/CSS necessari a bootstrappare l'app (il bundle iniziale).
- **`anyComponentStyle`** — soglia per il foglio di stile di *ogni singolo* componente.
- altri tipi utili: `all`, `allScript`, `anyScript`, `bundle` (con `name`), `any`. Le soglie accettano valori assoluti (`500kb`, `1mb`) o percentuali rispetto a un `baseline`.

## Evitare lavoro pesante nel template e nella CD
Tutto ciò che sta in un binding del template viene rivalutato a ogni ciclo di CD. Da evitare:
- **funzioni che restituiscono nuovi array/oggetti** nell'iterazione (`*ngFor="let x of filter(items)"`): creano un nuovo riferimento a ogni CD, e quindi ricreano il DOM;
- **getter che computano** (ordinamenti, riduzioni) usati come binding;
- catene di **chiamate a metodo** nell'interpolazione.

La regola: precalcolare nel componente quando l'input cambia, oppure spostare il calcolo in una **pure pipe** memoizzata.

## `detach` della CD per aggiornamenti ad alta frequenza
Per componenti che ricevono aggiornamenti molto frequenti (stream real-time, tick a ogni frame) far girare l'intera CD a ogni update è sprecato. `ChangeDetectorRef.detach()` **stacca** il componente dall'albero di CD; poi si ricontrolla manualmente a cadenza controllata con `detectChanges()`.

```ts
@Component({ /* ... */ })
export class TickerComponent implements OnInit, OnDestroy {
  private id!: ReturnType<typeof setInterval>;

  constructor(private cdr: ChangeDetectorRef, private ticks: TickService) {}

  ngOnInit(): void {
    this.cdr.detach(); // fuori dalla CD automatica
    this.id = setInterval(() => {
      // aggiorna lo stato ad alta frequenza senza ridisegnare...
      this.cdr.detectChanges(); // ...poi ricontrolla solo qui, ogni secondo
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.id);
  }
}
```

> [!warning]
> Un componente `detach`ato **non** si aggiorna più da solo: dimenticare `detectChanges()` (o `reattach()`) lascia la view congelata. È lo strumento giusto solo per casi ad alta frequenza misurati, non un'ottimizzazione da applicare a tappeto.

> [!info|label:vs Modern]
> Con i **signal** la CD diventa granulare e i signal-based component si aggiornano solo quando cambia un signal letto nel template, rendendo di fatto obsoleti `markForCheck`/`detach` manuali, come spiegato in [[03-reactive-design-with-signals]]. Nel control flow moderno `@for` **richiede** l'espressione `track` (equivalente di `trackBy`, ma obbligatoria) e il caricamento differito passa da `@defer` con SSR/hydration incrementale, in [[17-defer-ssr-hydration]]. Qui non si ripetono.

> [!info|label:Stato attuale]
> `trackBy`, `OnPush`, pure pipe, `PreloadingStrategy`, bundle budget e `detach` **non sono deprecati** e restano validi su Angular 22. Con lo standalone la preloading strategy si configura via `provideRouter(routes, withPreloading(PreloadAllModules))` invece di `RouterModule.forRoot`; i budget in `angular.json` sono invariati. `OnPush` resta utile finché convivono componenti Zone.js: nelle app *zoneless* + signals la sua rilevanza cala.

## Ripasso lampo

<details>
<summary>Perché aggiungere <code>trackBy</code> a un <code>*ngFor</code> migliora le performance?</summary>

Senza `trackBy` Angular identifica gli item per riferimento all'oggetto: rimpiazzando la collezione considera tutto nuovo e ricrea l'intero DOM. `trackBy` fornisce una chiave stabile (es. `id`), così Angular riusa i nodi esistenti e aggiorna solo gli item effettivamente cambiati.

</details>

<details>
<summary>Un <code>@Input</code> con <code>OnPush</code> viene mutato in place e la view non si aggiorna: perché?</summary>

`OnPush` ricontrolla il componente solo quando cambia il **riferimento** dell'input (oltre a eventi, `async` pipe, `markForCheck`). Mutare in place (`obj.prop = x`, `arr.push(...)`) non cambia il riferimento, quindi la CD salta il componente. Serve creare un nuovo oggetto/array (dati immutabili).

</details>

<details>
<summary>Quando conviene una pure pipe al posto di una chiamata a metodo nel template?</summary>

Quasi sempre per trasformazioni di visualizzazione: un metodo nell'interpolazione gira a **ogni** ciclo di CD, mentre una pure pipe è memoizzata e riesegue `transform` **solo** se cambia il riferimento di un input. Una pipe *impura* invece perde questo vantaggio e gira come una chiamata a metodo.

</details>

<details>
<summary>Cosa fanno <code>NoPreloading</code>, <code>PreloadAllModules</code> e una strategy custom?</summary>

`NoPreloading` (default) non precarica nulla: ogni modulo lazy arriva alla prima navigazione. `PreloadAllModules` scarica in background tutti i bundle lazy dopo il bootstrap. Una strategy custom implementa `PreloadingStrategy.preload(route, load)` e decide caso per caso cosa precaricare (es. solo le rotte con `data: { preload: true }`).

</details>

<details>
<summary>A cosa servono i bundle budget in <code>angular.json</code> e cosa succede al superamento?</summary>

Impongono soglie di dimensione (es. `type: "initial"`, `anyComponentStyle`): superata `maximumWarning` la CLI mostra un warning, superata `maximumError` il **build fallisce**. Prevengono regressioni silenziose sul peso del bundle.

</details>

**In sintesi:**
- **Meno DOM ricreato**: `trackBy` (chiave stabile) in `*ngFor`.
- **Meno CD**: `OnPush` con dati **immutabili** (nuovo riferimento a ogni update), pure pipe al posto di metodi nel template, niente funzioni/getter pesanti nei binding; `detach` + `detectChanges()` per stream ad alta frequenza.
- **Meno codice scaricato**: lazy loading (code splitting per rotta) + `PreloadingStrategy` (`NoPreloading`/`PreloadAllModules`/custom), bundle budget in `angular.json` a guardia del peso.
- Equivalente moderno = CD signal-based ([[03-reactive-design-with-signals]]) e `@defer`/SSR/hydration ([[17-defer-ssr-hydration]]); nel control flow nuovo `track` è obbligatorio.

---
Fonti: [Runtime performance](https://angular.dev/best-practices/runtime-performance) · [Skipping subtrees (OnPush)](https://angular.dev/best-practices/skipping-subtrees) · [Preloading](https://angular.dev/guide/routing/common-router-tasks) · [Size budgets](https://angular.dev/tools/cli/build) — angular.dev.
