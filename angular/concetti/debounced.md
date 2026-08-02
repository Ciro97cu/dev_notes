---
titolo: "debounced()"
tags: [tipo/concetto, signals, reactivity, angular-22]
aliases: [debounced, debounce signal]
---
# debounced()

L'helper **`debounced()`** (**Angular 22**) dà ai [[signal]] una nozione di **tempo** che di per sé non hanno: a differenza degli Observable, i signal non offrono operatori come `debounceTime` o `throttle`. `debounced(sig, ms)` prende un signal e restituisce una **[[resource]]** il cui valore **insegue** quello del signal con un ritardo configurabile, aggiornandosi solo dopo che il signal è rimasto stabile per `ms` millisecondi.

```ts
import { debounced, effect, signal } from '@angular/core';

const filter = signal('');
const debouncedFilter = debounced(filter, 300); // 300ms

effect(() => console.log(debouncedFilter.value()));
```

Mentre `filter` cambia subito, `debouncedFilter.value()` lo raggiunge solo dopo la pausa. Durante l'attesa `status()` vale `'loading'`, comodo per mostrare un indicatore discreto finché il valore non si è assestato.

> [!tip]
> Da non confondere con l'helper `debounce()` di Signal Forms (da `@angular/forms/signals`): quello è **per-campo**, si applica sullo schema di una `form()` ed è il modo idiomatico per il debounce dell'input di un form prima di una ricerca o di una validazione. Vedi [[glossario#debounce-debouncing|debounce]].

**Usato in:** [[03-reactive-design-with-signals]] · [[05-state-management-services-signals]]
