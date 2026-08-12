---
titolo: "Testing classico (Jasmine + Karma)"
tags: [tipo/cert, testing, legacy]
livello: [mid, senior]
---
# Testing classico (Jasmine + Karma)
> Cert Angular · non coperto dal *Modern Angular* (il vault testa con **Vitest**)

Per anni lo stack di test unitari di Angular è stato **Jasmine** (framework di asserzioni: `describe`/`it`/`expect`) eseguito da **Karma** (test runner che lancia un browser reale). Sopra ci sta il **`TestBed`**, il costrutto Angular che monta componenti e servizi sostituendo le dipendenze con dei mock. La cert lo chiede perché la stragrande maggioranza delle codebase esistenti usa ancora Jasmine, e perché i concetti (fixture, change detection manuale, test async con `fakeAsync`, mock HTTP) valgono a prescindere dal runner.

## Jasmine: suite, matcher, spie
Jasmine fornisce le funzioni globali `describe` (suite), `it` (caso), `beforeEach`/`afterEach`/`beforeAll`/`afterAll` (hook). Non si importano: sono rese globali dal runner. La fase di Assert usa `expect(...)` concatenato con un **matcher**.

```ts
describe('MathUtil', () => {
  let result: number;

  beforeEach(() => {
    result = add(1, 2);              // gira prima di OGNI it
  });

  it('adds two numbers', () => {
    expect(result).toBe(3);          // uguaglianza stretta (===)
    expect(result).toEqual(3);       // uguaglianza profonda (oggetti/array)
    expect(result).toBeTruthy();
    expect(result).toBeGreaterThan(0);
    expect([1, 2, 3]).toContain(2);
    expect(result).not.toBeNull();   // negazione
  });
});
```

> [!warning]
> `toBe` usa `===` (identità di riferimento): su oggetti e array confronta il **riferimento**, non il contenuto. Per il confronto strutturale serve **`toEqual`**. Confondere i due è un classico falso-negativo/positivo.

Le **spie** (`spyOn`) avvolgono un metodo esistente e ne registrano le chiamate; `jasmine.createSpyObj` genera un mock con più metodi-spia.

```ts
// spia su un metodo esistente, con valore di ritorno finto
spyOn(service, 'find').and.returnValue(of([flight1, flight2]));

service.find('Graz', 'Hamburg');
expect(service.find).toHaveBeenCalled();
expect(service.find).toHaveBeenCalledTimes(1);
expect(service.find).toHaveBeenCalledWith('Graz', 'Hamburg');

// mock completo di un service (oggetto di sole spie)
const serviceSpy = jasmine.createSpyObj<FlightService>('FlightService', ['find', 'save']);
serviceSpy.find.and.returnValue(of([]));
```

Configuratori della spia: `.and.returnValue(v)`, `.and.callThrough()` (delega al metodo reale registrando la chiamata), `.and.callFake(fn)` (comportamento custom), `.and.throwError('msg')`.

## `TestBed`: montare un componente
Il **`TestBed`** configura un modulo di test e istanzia i componenti. Nella forma classica i componenti/direttive/pipe vanno in **`declarations`** (non essendo standalone), i moduli richiesti dal template in **`imports`**, i provider in **`providers`**.

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { FlightSearchComponent } from './flight-search.component';
import { FlightService } from './flight.service';

describe('FlightSearchComponent', () => {
  let component: FlightSearchComponent;
  let fixture: ComponentFixture<FlightSearchComponent>;
  let serviceSpy: jasmine.SpyObj<FlightService>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('FlightService', ['find']);
    serviceSpy.find.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [FlightSearchComponent],       // componente module-based
      imports: [ReactiveFormsModule],              // moduli necessari al template
      providers: [
        { provide: FlightService, useValue: serviceSpy },   // mock del service
      ],
    }).compileComponents();                        // compila template/stili esterni

    fixture = TestBed.createComponent(FlightSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();                       // triggera ngOnInit + primo binding
  });

  it('is created', () => {
    expect(component).toBeTruthy();
  });
});
```

`createComponent` ritorna una **`ComponentFixture<T>`** che espone i vari aspetti del componente:
- `componentInstance` — l'istanza della classe.
- `nativeElement` — il nodo DOM radice del componente.
- `debugElement` — wrapper con query DOM e accesso all'injector del componente.
- `detectChanges()` — esegue la **change detection** (aggiorna il DOM dai dati).
- `whenStable()` — `Promise` che si risolve quando i task async pendenti nella zona della fixture si sono conclusi.

> [!warning]
> Nei test la change detection **non** è automatica: va chiamata a mano con **`fixture.detectChanges()`**. La **prima** chiamata scatena `ngOnInit` e il primo data binding; senza, il template resta vuoto e i lifecycle hook non partono. (In produzione ci pensa Zone.js — vedi [[change-detection]].)

## Query sul DOM: `DebugElement` + `By.css`
Per verificare cosa il componente ha davvero renderizzato si interroga il suo `debugElement`, il wrapper con cui Angular avvolge il DOM della fixture. Le sue query accettano un **selettore CSS** tramite `By.css`, oppure il tipo di una direttiva o di un componente tramite `By.directive`, e restituiscono altri `DebugElement` da cui si raggiunge il nodo nativo e l'injector locale.

```ts
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

const el: DebugElement = fixture.debugElement.query(By.css('.result'));
expect(el.nativeElement.textContent).toContain('Graz');

const rows = fixture.debugElement.queryAll(By.css('tr'));   // tutti i match
expect(rows.length).toBe(3);

const card = fixture.debugElement.query(By.directive(FlightCardComponent));

// simulare l'input dell'utente: aggiorno il DOM e notifico Angular
const input: HTMLInputElement =
  fixture.debugElement.query(By.css('input[name=from]')).nativeElement;
input.value = 'Graz';
input.dispatchEvent(new Event('input'));   // necessario: notifica il cambio ad Angular
fixture.detectChanges();
```

Per gli eventi c'è anche `debugElement.triggerEventHandler('click', null)`, che invoca l'handler bindato nel template senza passare dal DOM reale.

## Test asincroni: `fakeAsync`/`tick`/`flush` e `waitForAsync`
`fakeAsync` esegue il corpo del test in una zona a **tempo virtuale**: i timer non attendono davvero, li si fa avanzare con `tick(ms)` (avanza di `ms`) o `flush()` (svuota **tutti** i timer/macrotask pendenti). È il modo più deterministico per testare `setTimeout`, `debounceTime`, ecc.

```ts
import { fakeAsync, tick, flush } from '@angular/core/testing';

it('debounces the search', fakeAsync(() => {
  component.onQueryChange('Graz');
  tick(300);                       // avanza il tempo virtuale di 300ms → scade il debounce
  fixture.detectChanges();
  expect(serviceSpy.find).toHaveBeenCalledWith('Graz');
  flush();                         // esegue eventuali timer ancora pendenti
}));
```

`waitForAsync` (ex `async()`, rinominato in Angular 10) attende invece i task async **reali** ed è tipicamente usato con `fixture.whenStable()`.

```ts
import { waitForAsync } from '@angular/core/testing';

it('loads flights', waitForAsync(() => {
  component.load();
  fixture.whenStable().then(() => {      // attende le Promise pendenti
    fixture.detectChanges();
    expect(component.flights.length).toBe(2);
  });
}));
```

> [!warning]
> `fakeAsync` **non** può avvolgere una vera richiesta XHR (lancia *"Cannot make XHR..."*): va usato con dati mockati (es. `HttpTestingController`, che è sincrono). Per il codice con Promise/observable "reali" si usa `waitForAsync` + `whenStable`.

## Mock HTTP: `HttpTestingController`
Per testare service o componenti che fanno HTTP senza toccare la rete si usano i mock provider dell'`HttpClient`. La chiamata resta **in pausa** finché il test non risponde con `flush(...)`.

```ts
import {
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

describe('FlightService', () => {
  let service: FlightService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FlightService,
        provideHttpClient(),           // client reale…
        provideHttpClientTesting(),    // …ma con backend mock (intercetta le richieste)
      ],
    });
    service = TestBed.inject(FlightService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();       // fallisce se restano richieste non gestite
  });

  it('GETs flights', () => {
    let result: Flight[] = [];
    service.find('Graz', 'Hamburg').subscribe((flights) => (result = flights));

    const req = httpMock.expectOne('/flight?from=Graz&to=Hamburg');
    expect(req.request.method).toBe('GET');
    req.flush([flight1, flight2]);       // risposta fake → sblocca la subscribe

    expect(result.length).toBe(2);
  });

  it('handles a server error', () => {
    let error: unknown;
    service.find('Graz', 'Hamburg').subscribe({ error: (e) => (error = e) });

    httpMock
      .expectOne('/flight?from=Graz&to=Hamburg')
      .flush('boom', { status: 500, statusText: 'Server Error' });

    expect(error).toBeTruthy();
  });
});
```

- `expectOne(url | predicate)` — si aspetta **esattamente una** richiesta corrispondente e la restituisce (esistono `expectNone` e `match`).
- `req.flush(body, opts)` — invia la risposta fake; per gli errori si passa uno `status` >= 400 o si usa `req.error(new ProgressEvent('error'))`.
- `verify()` — lancia se restano richieste **senza risposta** (tipicamente in `afterEach`).

> [!info] Modo classico
> Prima delle API funzionali si importava il modulo **`HttpClientTestingModule`** in `imports`. È **deprecato** da Angular v18 a favore di `provideHttpClient()` + `provideHttpClientTesting()` ([angular.dev](https://angular.dev/guide/http/testing)). Il resto dell'API (`HttpTestingController`, `expectOne`/`flush`/`verify`) è invariato.

## Mock di service e di componenti figli
Per testare un componente in isolamento occorre rimpiazzarne le dipendenze reali con sostituti controllabili, e i casi tipici sono due: i service da cui dipende e i componenti figli che compaiono nel suo template.

- **Service** — si sostituisce via provider: `{ provide: X, useValue: mock }` (oggetto/spia), `{ provide: X, useClass: FakeX }`, oppure `jasmine.createSpyObj`.
- **Componenti figli** — per isolare il componente sotto test (*shallow testing*) si sostituisce il figlio con uno **stub** che ha **stesso selector, stessi `@Input`/`@Output`**. In alternativa si aggiunge `NO_ERRORS_SCHEMA` (o `CUSTOM_ELEMENTS_SCHEMA`) allo `schemas` del `TestBed`, che fa ignorare gli elementi/attributi sconosciuti nel template.

```ts
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';

// stub del figlio: stesso selector e stessi input, template vuoto
@Component({ selector: 'app-flight-card', template: '' })
class FlightCardStubComponent {
  @Input() item!: Flight;
}

await TestBed.configureTestingModule({
  declarations: [FlightSearchComponent, FlightCardStubComponent],
  // in alternativa allo stub:
  schemas: [NO_ERRORS_SCHEMA],
}).compileComponents();
```

> [!warning]
> `NO_ERRORS_SCHEMA` è comodo ma **pericoloso**: silenzia **tutti** gli errori di template (anche un binding scritto male o un componente davvero mancante), non solo quelli dei figli non dichiarati. Uno stub tipizzato è più sicuro perché verifica anche il contratto (`@Input`/`@Output`) del figlio.

## Karma: il test runner
**Karma** è il runner storico: legge `karma.conf.js`, avvia un browser reale (Chrome, oppure `ChromeHeadless` in CI), vi serve il bundle di test, esegue le spec (via `karma-jasmine`) e raccoglie i risultati. È il motore dietro `ng test` nelle versioni classiche della CLI.

> [!info] vs Modern
> Il vault moderno testa con **Vitest** (il runner di default della CLI): stessa filosofia AAA e stesso `TestBed`/`HttpTestingController`, ma componenti **standalone** in `imports` (niente `declarations`), globali di Vitest (`describe`/`it`/`vi`), spie `vi.spyOn`, mock HTTP con `provideHttpClientTesting`, fake timer `vi.useFakeTimers()` al posto di `fakeAsync`/`tick`, e locator ARIA (`page.getByRole`) al posto di `By.css`. Tutto in [[07-testing-with-vitest]] (qui non ripetuto).

> [!info] Stato attuale
> **Karma è deprecato** (pubblicato su npm come *deprecated* dall'aprile 2023: non riceve più feature né bugfix generali) e Angular ha **rimosso il builder Karma** in v20; da **Angular 21 Vitest è il test runner di default** dei nuovi progetti ([angular.dev](https://angular.dev/guide/testing/migrating-to-vitest)). **Jasmine** come framework di asserzioni non è deprecato ma non è più il default. Nelle codebase esistenti Karma+Jasmine restano finché non si migra a Vitest (big-bang o progressiva).

## Ripasso lampo

<details>
<summary>Differenza tra <code>toBe</code> e <code>toEqual</code>, e a cosa servono <code>spyOn</code> e <code>jasmine.createSpyObj</code>?</summary>

`toBe` confronta con `===` (identità di riferimento); `toEqual` fa un confronto **strutturale/profondo** (per oggetti e array si guarda il contenuto). `spyOn(obj, 'metodo')` avvolge un metodo **esistente** registrandone le chiamate (con `.and.returnValue`/`.and.callThrough`/`.and.callFake`); `jasmine.createSpyObj('Nome', ['a', 'b'])` crea da zero un **mock** con più metodi-spia, utile per sostituire un intero service.

</details>

<details>
<summary>Cosa contiene una <code>ComponentFixture</code> e perché serve <code>fixture.detectChanges()</code>?</summary>

Espone `componentInstance` (l'istanza della classe), `nativeElement` (nodo DOM), `debugElement` (query + injector), `detectChanges()` (change detection) e `whenStable()` (Promise sui task async). Serve `detectChanges()` perché nei test la CD **non** è automatica: la prima chiamata scatena `ngOnInit` e il primo binding; senza, il DOM resta vuoto.

</details>

<details>
<summary>Quando si usa <code>fakeAsync</code>/<code>tick</code> e quando <code>waitForAsync</code>/<code>whenStable</code>? Qual è il limite di <code>fakeAsync</code>?</summary>

`fakeAsync` esegue il test a **tempo virtuale**: si fanno avanzare i timer con `tick(ms)`/`flush()` — ideale per debounce e `setTimeout`, in modo deterministico. `waitForAsync` + `fixture.whenStable()` attende invece i task async **reali** (Promise). Limite: `fakeAsync` **non** funziona con una vera richiesta XHR, quindi va usato con dati mockati (es. `HttpTestingController`, sincrono).

</details>

<details>
<summary>Come si testa una chiamata HTTP con <code>HttpTestingController</code> e cosa fanno <code>expectOne</code>/<code>flush</code>/<code>verify</code>?</summary>

Si forniscono `provideHttpClient()` + `provideHttpClientTesting()` (un tempo `HttpClientTestingModule`, ora deprecato). Ci si sottoscrive al metodo, poi `httpMock.expectOne(url)` recupera la richiesta attesa, `req.flush(body)` invia la risposta fake sbloccando la subscribe, e `httpMock.verify()` (in `afterEach`) fallisce se restano richieste non gestite.

</details>

<details>
<summary>Come si isola un componente dai suoi figli e perché <code>NO_ERRORS_SCHEMA</code> va usato con cautela?</summary>

Con lo **shallow testing**: si sostituisce il figlio con uno **stub** che ha stesso selector e stessi `@Input`/`@Output`, oppure si aggiunge `NO_ERRORS_SCHEMA` allo `schemas`. `NO_ERRORS_SCHEMA` è rischioso perché silenzia **tutti** gli errori di template (anche binding sbagliati o componenti davvero mancanti); lo stub tipizzato è più sicuro perché verifica il contratto del figlio.

</details>

**In sintesi:**
- **Jasmine** dà `describe`/`it`/`beforeEach` e `expect` + matcher (`toBe` = `===`, `toEqual` = profondo), più `spyOn`/`jasmine.createSpyObj` per spie e mock; **Karma** è il runner che li esegue in un browser reale.
- Il **`TestBed`** monta i componenti (`declarations`/`imports`/`providers`, con `createComponent` che restituisce una `ComponentFixture`); la change detection è **manuale** (`fixture.detectChanges()`), le query DOM passano da `debugElement` + `By.css`.
- Async: **`fakeAsync`/`tick`/`flush`** (tempo virtuale, no XHR reali) o **`waitForAsync`/`whenStable`**; HTTP mockato con **`HttpTestingController`** (`provideHttpClientTesting`, `expectOne`/`flush`/`verify`).
- Equivalente moderno = **Vitest**, in [[07-testing-with-vitest]]; Karma è deprecato e non più il default (Vitest da Angular 21), `HttpClientTestingModule` deprecato da v18.
