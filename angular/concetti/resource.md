---
titolo: "resource / httpResource / rxResource"
tags: [tipo/concetto, signals, reactivity, http, angular-22]
aliases: [resource, httpResource, rxResource]
---
# resource()

Le **resource** sono una famiglia di primitive per gestire i **dati asincroni in modo reattivo**. Una resource lega una richiesta ad alcuni signal sorgente: quando questi cambiano, la richiesta si **rilancia** da sola, e lo stato del caricamento è esposto come signal — `value()`, `status()`, `error()` e `isLoading()`. Ne esistono tre varianti, con la stessa interfaccia ma un "motore" diverso:

- **`httpResource`** — la più dichiarativa, basata su `HttpClient`: si passa una URL o una request reattiva.
- **`rxResource`** — basata su un `loader` che restituisce un `Observable`.
- **`resource`** — la più generica, con un `loader` basato su `Promise` (e un `abortSignal`).

```ts
const id = signal(1);
const flight = httpResource<Flight>(() => `/api/flight/${id()}`);
// flight.value(), flight.isLoading(), flight.error(), flight.reload()
```

> [!warning]
> La richiesta riparte a ogni cambio delle dipendenze lette nella funzione sorgente. `httpResource` è pensata per le **GET/read**; per le mutazioni (create/update/delete) si usa `HttpClient` o le mutations dello store.

> [!info|label:Angular 21.2+ · Snapshots]
> Ogni resource espone un signal **`snapshot()`** che impacchetta `status` e `value` in un unico oggetto. Lo si può trasformare con un [[linked-signal]] e ri-convertire in resource con **`resourceFromSnapshots`**, ottenendo resource **derivate** da altre resource (prima era possibile solo per una singola proprietà).
> ```ts
> // mantiene l'ultimo valore valido durante un reload
> const derived = linkedSignal<ResourceSnapshot<T>, ResourceSnapshot<T>>({
>   source: input.snapshot,
>   computation: (snap, previous) =>
>     snap.status === 'loading' && previous?.value?.status === 'resolved'
>       ? { ...snap, value: previous.value.value }
>       : snap,
> });
> return resourceFromSnapshots(derived);
> ```

> [!info|label:Angular 22+ · debounced]
> I signal non hanno una nozione di tempo. **`debounced(sig, ms)`** prende un signal e restituisce una *resource* che insegue il signal con un ritardo configurabile (`status()` vale `'loading'` mentre il valore si assesta). Per i form c'è l'helper dedicato `debounce()` di `@angular/forms/signals` (vedi [[06-signal-forms]]).
> ```ts
> const debouncedFilter = debounced(filter, 300); // 300ms
> ```

**Usato in:** [[02-signal-based-components]], [[03-reactive-design-with-signals]], [[09-ngrx-signal-store]]
