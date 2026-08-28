---
titolo: "Routing classico"
tags: [tipo/cert, routing, legacy]
livello: [mid]
---
# Routing classico
> Cert Angular · il Router in forma *module-based* — `RouterModule.forRoot`, guard/resolver class-based, `snapshot`; il setup moderno è nel vault ([[04-router-navigation-lazy-loading]])

Nel Router classico la configurazione si registra con `RouterModule.forRoot`/`forChild` dentro gli `@NgModule`, guard e resolver sono **classi** `@Injectable` che implementano un'interfaccia, e i parametri si leggono spesso via `ActivatedRoute.snapshot`. La cert lo richiede perché è così che è cablata la maggior parte delle app esistenti, e perché il ciclo di navigazione (prima i guard, poi il resolve dei dati, infine l'attivazione) è materia d'esame.

## `RouterModule.forRoot` / `forChild`
Il root module registra le route top-level e il servizio `Router` (singleton) con `forRoot`; i feature module aggiungono le proprie route con `forChild`, che **non** ri-registra i service.

```ts
// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomeComponent },
  { path: '**', redirectTo: 'home' },   // catch-all: sempre ultimo
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // ExtraOptions: es. useHash, preloadingStrategy, bindToComponentInputs
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],   // ri-esporta le directive (router-outlet, routerLink…)
})
export class AppRoutingModule {}
```

```ts
// booking-routing.module.ts (feature module)
@NgModule({
  imports: [RouterModule.forChild(bookingRoutes)],
  exports: [RouterModule],
})
export class BookingRoutingModule {}
```

Il secondo argomento di `forRoot` è un `ExtraOptions`: tra le opzioni utili `useHash: true` (attiva `HashLocationStrategy`), `preloadingStrategy`, `bindToComponentInputs: true` (equivalente module-based di `withComponentInputBinding`), `paramsInheritanceStrategy`, `onSameUrlNavigation`.

`<router-outlet>` (il placeholder in cui il Router monta il componente attivato), `routerLink` e `routerLinkActive` funzionano **identici** al moderno; in un'app module-based sono forniti da `RouterModule` (ri-esportato) invece di essere importati singolarmente. Dettagli e regole di default route/matching sono in [[04-router-navigation-lazy-loading]].

## Navigazione programmatica
Si fa injection del `Router` e si naviga con `navigate` (array di segmenti + `NavigationExtras`) o `navigateByUrl` (URL come stringa già formata).

```ts
constructor(private router: Router) {}

goHome(): void {
  this.router.navigate(['/booking', 'flight-edit', 17], { queryParams: { expertMode: true } });
  // oppure, con l'URL già pronto:
  this.router.navigateByUrl('/booking/flight-edit/17?expertMode=true');
}
```

`navigate` compone l'URL dai segmenti (URL-encoding automatico, supporto ai path relativi via `relativeTo`); `navigateByUrl` prende un URL assoluto e non fa composizione.

## Lettura parametri: `snapshot` vs `paramMap`
`ActivatedRoute` espone i parametri in due forme. Lo **snapshot** dà il valore **una tantum** al momento dell'attivazione; gli **Observable** (`paramMap`, `queryParamMap`, `fragment`, `data`) emettono a ogni cambiamento **senza** ricreare il componente.

```ts
constructor(private route: ActivatedRoute) {}

ngOnInit(): void {
  // snapshot: comodo, ma NON si aggiorna se resti sullo stesso componente
  const id = this.route.snapshot.paramMap.get('id');

  // Observable: reagisce ai cambi di parametro
  this.route.paramMap.subscribe((pm) => {
    this.id = Number(pm.get('id'));
  });
}
```

> [!warning]
> Se una route naviga verso lo **stesso componente** con un parametro diverso (per esempio da `/flight/1` a `/flight/2`), Angular **riusa l'istanza** e non chiama di nuovo `ngOnInit`: lo `snapshot` resta al valore vecchio. In questi casi va usato l'**Observable** `paramMap` per reagire al cambio. I parametri sono inoltre **sempre stringhe**, quindi la conversione va fatta a mano.

## Child routes e lazy loading di moduli
Le **child route** modellano le viste annidate: una route può portare un array `children`, e il componente che la serve espone un proprio `<router-outlet>` interno in cui il Router monta la vista figlia. Così l'URL finisce per rispecchiare la gerarchia della UI (i dettagli sono in [[04-router-navigation-lazy-loading]]).

```ts
{
  path: 'booking',
  component: BookingComponent,
  children: [
    { path: '', pathMatch: 'full', redirectTo: 'flights' },
    { path: 'flights', component: FlightSearchComponent },
    { path: 'flight-edit/:id', component: FlightEditComponent },
  ],
}
```

Nel classico il lazy loading carica un **NgModule** (non una route/component): `loadChildren` punta a un dynamic `import()` che risolve la classe del modulo, il quale registra le proprie route con `forChild`.

```ts
// app.routes / app-routing.module
{
  path: 'booking',
  loadChildren: () =>
    import('./booking/booking.module').then((m) => m.BookingModule),
}
```

> [!warning]
> La vecchia sintassi a **stringa** `loadChildren: './booking/booking.module#BookingModule'` è stata **rimossa** con Ivy (Angular v9): oggi vale solo la forma con dynamic `import()`. Ricorda inoltre che il segmento del path (`booking`) viene **prefissato** a tutte le route del modulo lazy.

## Guard class-based
Un guard classico è una classe `@Injectable` che implementa una delle interfacce del Router. Un guard può restituire `boolean`, un `UrlTree` (per **redirigere**), o un `Observable`/`Promise` di questi.

```ts
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot, CanActivate, CanActivateChild,
  Router, RouterStateSnapshot, UrlTree,
} from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree {
    // redirige restituendo un UrlTree, invece di navigate()+return false
    return this.auth.isLoggedIn() ? true : this.router.createUrlTree(['/login']);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(route, state);
  }
}
```

`CanDeactivate<T>` è **generico** sul tipo di componente da cui si esce (tipicamente per confermare l'abbandono di un form sporco):

```ts
export interface CanComponentDeactivate {
  canDeactivate(): boolean | Observable<boolean>;
}

@Injectable({ providedIn: 'root' })
export class PendingChangesGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(component: CanComponentDeactivate): boolean | Observable<boolean> {
    return component.canDeactivate();
  }
}
```

`CanMatch` decide se una route (incluso il suo bundle lazy) **matcha affatto**: se restituisce `false`, il Router prova la route successiva. Sostituisce `CanLoad`.

```ts
@Injectable({ providedIn: 'root' })
export class FeatureFlagGuard implements CanMatch {
  canMatch(route: Route, segments: UrlSegment[]): boolean {
    return this.flags.enabled('newBooking');
  }
}
```

Registrazione nelle route (array, perché più guard possono concorrere):

```ts
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [AuthGuard],
  canActivateChild: [AuthGuard],
  canDeactivate: [PendingChangesGuard],
},
{
  path: 'booking',
  canMatch: [FeatureFlagGuard],
  loadChildren: () => import('./booking/booking.module').then((m) => m.BookingModule),
},
```

> [!warning]
> `CanLoad` (deprecato) impediva solo il **caricamento del bundle** ma non faceva ri-valutare la route: con più route sullo stesso path non permetteva un fallback. `CanMatch`, valutato nel matching, se `false` fa **provare la route successiva**: è quindi più potente e va preferito.

## Resolver class-based
Un **resolver** (`Resolve<T>`) sposta il caricamento dei dati *prima* dell'attivazione della route: il Router attende che il dato sia risolto e solo allora monta il componente, che così lo trova già pronto invece di dover gestire da sé uno stato di caricamento iniziale.

```ts
@Injectable({ providedIn: 'root' })
export class FlightResolver implements Resolve<Flight> {
  constructor(private service: FlightService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Flight> {
    return this.service.findById(route.paramMap.get('id')!);
  }
}
```

```ts
// route
{ path: 'flight/:id', component: FlightEdit, resolve: { flight: FlightResolver } }

// nel componente: i dati risolti stanno in route.data (Observable) o snapshot.data
this.route.data.subscribe((d) => (this.flight = d['flight']));
```

## Router events
Il `Router` pubblica su un Observable `events` l'intero ciclo di ogni navigazione, dall'inizio alla fine (o all'annullamento). Iscrivendovisi si reagisce in modo trasversale a ciò che accade durante il routing, tipicamente per mostrare uno spinner globale, tracciare analytics o registrare log.

```ts
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

this.router.events
  .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
  .subscribe((e) => console.log('navigato a', e.urlAfterRedirects));
```

Tra gli eventi principali, nell'ordine: `NavigationStart`, `RoutesRecognized`, `GuardsCheckStart`/`End`, `ResolveStart`/`End`, `NavigationEnd`, e in caso di stop `NavigationCancel` / `NavigationError`.

> [!warning]
> Altre insidie: `forRoot` va chiamato **una sola volta** (root); ripeterlo in un feature module duplica il `Router`. E un guard che redirige dovrebbe restituire un **`UrlTree`** (via `createUrlTree`), non fare `this.router.navigate(...)` seguito da `return false`: il ritorno di `UrlTree` è la forma canonica, atomica e senza race.

> [!info|label:vs Modern]
> Nel moderno il Router si registra con `provideRouter(routes, ...features)` invece di `RouterModule.forRoot`, e le **feature** (`withComponentInputBinding`, `withPreloading`, `withHashLocation`, `withDebugTracing`) sostituiscono gli `ExtraOptions`; il lazy loading usa `loadComponent`/`loadChildren` di **route** (non di NgModule). Guard e resolver diventano **funzioni** (`CanActivateFn`, `CanMatchFn`, `ResolveFn`) con [[inject]] al posto delle classi `@Injectable`. Outlet, `routerLink`, parametri e child routes sono **identici** e già spiegati nel vault, in [[04-router-navigation-lazy-loading]] (setup, `withComponentInputBinding`, lazy) e [[12-initialization-route-changes]] (guard/resolver funzionali, router events). Qui non ripetuti.

> [!info|label:Stato attuale]
> Le **interfacce** dei guard/resolver class-based (`CanActivate`, `CanActivateChild`, `CanDeactivate`, `CanMatch`, `Resolve`) sono **deprecate dalla v15.2** in favore dei guard/resolver **funzionali**; `CanLoad` è deprecato ancora prima in favore di `CanMatch`. Una classe `@Injectable` resta comunque riusabile da un guard funzionale in migrazione (`canActivate: [() => inject(AuthGuard).canActivate(route, state)]`) o con gli helper `mapToCanActivate` & co. `RouterModule.forRoot`/`forChild` **non** sono deprecati e valgono per le app module-based. Fonte: [angular.dev/guide/routing](https://angular.dev/guide/routing) e l'issue di deprecazione [angular#50234](https://github.com/angular/angular/issues/50234).

## Ripasso lampo

<details>
<summary>Differenza tra <code>RouterModule.forRoot</code> e <code>forChild</code>?</summary>

`forRoot(routes, options)` va chiamato **una sola volta** nel root module: registra il servizio `Router` (singleton), le route top-level e le `ExtraOptions`. `forChild(routes)` va nei feature module: aggiunge solo route **senza** ri-registrare i service. Entrambi ri-esportano `RouterModule` per rendere disponibili le directive (`router-outlet`, `routerLink`).

</details>

<details>
<summary><code>snapshot</code> vs <code>paramMap</code> Observable: quando usare l'uno o l'altro?</summary>

Lo `snapshot` dà il valore del parametro **una tantum** all'attivazione: comodo, ma se si naviga verso lo **stesso componente** con un parametro diverso Angular riusa l'istanza, non richiama `ngOnInit` e lo snapshot resta vecchio. L'Observable `paramMap` (e `queryParamMap`, `data`, `fragment`) **emette a ogni cambio** senza ricreare il componente, quindi va usato quando il parametro può cambiare a componente montato.

</details>

<details>
<summary>Perché <code>CanMatch</code> è preferito a <code>CanLoad</code>?</summary>

`CanLoad` (deprecato) impediva solo il **caricamento del bundle lazy** ma non faceva ri-valutare la route, quindi non consentiva un fallback ad altre route sullo stesso path. `CanMatch` è valutato durante il **matching**: se restituisce `false` il Router **prova la route successiva**, ed è quindi più flessibile (route condizionali, A/B su feature flag).

</details>

<details>
<summary>Come si scrive e registra un <code>CanDeactivate<T></code> class-based?</summary>

È una classe `@Injectable` che implementa `CanDeactivate<T>`, generica sul tipo del componente da cui si esce; il metodo `canDeactivate(component: T)` riceve l'istanza e restituisce `boolean`/`UrlTree`/`Observable`/`Promise`. Si registra nella route con `canDeactivate: [PendingChangesGuard]`. Tipicamente `T` è un'interfaccia (`CanComponentDeactivate`) implementata dai componenti-form.

</details>

<details>
<summary>Come si carica lazy un modulo e qual è la vecchia sintassi rimossa?</summary>

Con `loadChildren: () => import('./x/x.module').then((m) => m.XModule)`; il modulo registra le sue route con `RouterModule.forChild`. La vecchia sintassi a **stringa** (`loadChildren: './x/x.module#XModule'`) è stata **rimossa con Ivy (v9)**. Il segmento del path viene prefissato a tutte le route del modulo lazy.

</details>

**In sintesi:**
- Setup classico via `RouterModule.forRoot(routes, options)` (una volta, root) + `forChild` nei feature module; `ExtraOptions` per hash location, preloading, input binding.
- Parametri via `ActivatedRoute`: `snapshot` una tantum, Observable `paramMap` per reagire ai cambi sullo stesso componente.
- Guard/resolver = classi `@Injectable` (`CanActivate`/`CanActivateChild`/`CanDeactivate<T>`/`CanMatch`/`Resolve<T>`); `CanMatch` sostituisce `CanLoad`; redirigere con `UrlTree`.
- Lazy loading di **NgModule** via `loadChildren` + dynamic `import()`; `Router.events` per il ciclo di navigazione.
- Moderno = `provideRouter` + feature, guard/resolver **funzionali**, `loadComponent`, in [[04-router-navigation-lazy-loading]] e [[12-initialization-route-changes]].
