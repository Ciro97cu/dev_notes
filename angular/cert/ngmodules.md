---
titolo: "NgModules"
tags: [tipo/cert, ngmodules, legacy, di, routing]
livello: [mid, senior]
---
# NgModules
> 🎓 Cert Angular · non coperto dal *Modern Angular* (il vault è standalone-only)

Un **NgModule** è un contenitore che raggruppa componenti, direttive, pipe e provider correlati e dichiara come si compongono con il resto dell'app. Prima dei **standalone component** era l'unità organizzativa obbligatoria: ogni componente doveva appartenere a esattamente un NgModule. La cert lo chiede perché la stragrande maggioranza delle codebase esistenti è ancora module-based, e perché lazy loading, DI e librerie storiche si ragionano in termini di moduli.

## Il decoratore `@NgModule`
La classe del modulo è vuota; tutto sta nei metadati del decoratore. I cinque campi principali:

```ts
// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FlightSearchComponent } from './flight-search/flight-search.component';

@NgModule({
  declarations: [AppComponent, FlightSearchComponent], // componenti/direttive/pipe di QUESTO modulo
  imports: [BrowserModule],                            // altri moduli di cui si usano gli export
  exports: [],                                         // cosa questo modulo rende visibile a chi lo importa
  providers: [],                                       // service (DI) offerti dal modulo
  bootstrap: [AppComponent],                           // componente radice (solo nel root module)
})
export class AppModule {}
```

- **`declarations`** — le classi *dichiarabili* (component, directive, pipe) che appartengono al modulo. Una dichiarabile sta in **un solo** NgModule.
- **`imports`** — altri **NgModule** (non componenti) dei cui `exports` si vuole usare il contenuto.
- **`exports`** — il sottoinsieme di dichiarabili/moduli che i moduli importatori possono usare. Senza export, ciò che è dichiarato resta privato al modulo.
- **`providers`** — i service registrati per la DI (vedi [[di-classic]]).
- **`bootstrap`** — il/i componente/i radice istanziati all'avvio; presente **solo** nel root module.

## Bootstrap classico
Senza `bootstrapApplication`, l'app parte istanziando il **root module**:

```ts
// src/main.ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
```

`platformBrowserDynamic` compila i template a runtime (JIT); il `bootstrap: [AppComponent]` del modulo dice quale componente montare nel `<app-root>` dell'`index.html`.

## Root module, feature module, shared module
- **Root module** (`AppModule`) — importa **`BrowserModule`** (una volta sola in tutta l'app) e ha il `bootstrap`.
- **Feature module** — raggruppa una funzionalità (es. `BookingModule`); importa **`CommonModule`** (non `BrowserModule`) per avere `ngIf`/`ngFor`/pipe comuni.
- **Shared module** — raccoglie dichiarabili riusabili e le **ri-esporta**, così i feature module importano un solo modulo invece di molti.

```ts
// booking.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [BookingListComponent],
  imports: [CommonModule],
  exports: [BookingListComponent],
})
export class BookingModule {}
```

> [!warning]
> Errori tipici da esame:
> - **`BrowserModule` in un feature module** → errore a runtime *"BrowserModule has already been loaded"*: va importato **solo** nel root module; altrove si usa `CommonModule`.
> - Stessa dichiarabile in due `declarations` → *"Type X is part of the declarations of 2 modules"*. Ogni component/directive/pipe appartiene a **un** modulo (o si esporta da uno shared module).
> - Usare un componente di un altro modulo **senza** che quel modulo lo `exports` → il template non lo riconosce.

## `forRoot()` / `forChild()`
Convenzione per i moduli che offrono **provider globali** (tipicamente librerie e il router): `forRoot()` registra i singleton e va chiamato **una sola volta** nel root; `forChild()` aggiunge solo configurazione (es. rotte figlie) senza ri-registrare i service.

```ts
@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes),   // root: registra il Router (singleton) + rotte top-level
    // nei feature module: RouterModule.forChild(featureRoutes)
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```

## Lazy loading di un modulo
Il router carica un feature module on-demand con `loadChildren`:

```ts
const routes: Routes = [
  {
    path: 'booking',
    loadChildren: () =>
      import('./booking/booking.module').then((m) => m.BookingModule),
  },
];
```

> [!warning]
> Un `providers` dichiarato in un **modulo lazy** crea un **injector figlio**: il service è una **nuova istanza**, non il singleton del root. È una domanda-trabocchetto classica. Per un vero singleton usare `providedIn: 'root'` (vedi [[di-classic]]).

> [!info] vs Modern
> L'equivalente moderno non usa moduli: componenti **standalone** (`imports` direttamente sul `@Component`), `bootstrapApplication(App, { providers: [...] })`, `provideRouter(routes)` con `loadComponent`/`loadChildren`, e `providedIn: 'root'` per i singleton. Tutto questo è nel vault → [[01-getting-started]] e [[04-router-navigation-lazy-loading]] (qui non ripetuto).

> [!info] Stato attuale
> Da Angular v17 il CLI genera app **standalone** e da v19 `standalone: true` è implicito. Gli NgModule **non sono deprecati**: restano pienamente supportati e interoperano con lo standalone (un modulo può importare componenti standalone, e un componente standalone può importare un NgModule). Per il codice nuovo si preferisce lo standalone.

## 🔁 Ripasso lampo

**1.** Qual è la differenza fra `imports` ed `exports` di un `@NgModule`?
> [!success]- Risposta
> `imports` elenca **altri NgModule** di cui si vogliono usare gli export dentro questo modulo. `exports` elenca cosa **questo** modulo rende visibile ai moduli che lo importano. Ciò che è solo `declarations` (senza export) resta privato.

**2.** Perché `BrowserModule` va importato una volta sola e cosa si usa nei feature module?
> [!success]- Risposta
> `BrowserModule` include i provider necessari all'avvio dell'app nel browser e va importato **solo nel root module**; reimportarlo altrove dà un errore a runtime. Nei feature module si importa **`CommonModule`**, che fornisce `ngIf`/`ngFor`/`ngSwitch` e le pipe comuni senza i provider di bootstrap.

**3.** Cosa succede ai `providers` di un modulo caricato in lazy loading?
> [!success]- Risposta
> Il modulo lazy ottiene un **injector figlio**: i suoi `providers` producono **istanze separate**, non i singleton del root injector. Per un singleton condiviso si usa `providedIn: 'root'`.

**4.** A cosa serve la convenzione `forRoot()`/`forChild()`?
> [!success]- Risposta
> A distinguere il modulo che **registra i provider globali** (`forRoot()`, una volta nel root) da chi aggiunge solo configurazione (`forChild()`, nei feature module) **senza** ri-registrare i service. Il caso tipico è `RouterModule`.

**In sintesi:**
- Un `@NgModule` raggruppa dichiarabili (`declarations`) e le espone (`exports`), importa altri moduli (`imports`), offre service (`providers`) e — nel root — indica il componente radice (`bootstrap`).
- `BrowserModule` solo nel root; `CommonModule` nei feature module; shared module per ri-esportare le dichiarabili comuni.
- Lazy loading via `loadChildren`; attenzione all'**injector figlio** che duplica i provider del modulo lazy.
- Equivalente moderno = standalone + `bootstrapApplication` + `provideRouter` → [[01-getting-started]]; NgModule non deprecati ma non più default.
