---
titolo: "@Service decorator"
tags: [tipo/concetto, di, services, angular-22]
aliases: [Service, autoProvided, Injectable vs Service]
---
# @Service()

Il decoratore **`@Service()`** (introdotto con **Angular 22**) marca una classe come **servizio iniettabile**. Di default la registra nel root injector, cioè ne crea un'unica istanza (**singleton**) condivisa da tutta l'app, senza bisogno di scrivere `providedIn: 'root'`. È la forma usata in tutto il libro dalla 3ª edizione.

```ts
import { Service } from '@angular/core';

@Service()                       // singleton in root, default
export class FlightClient {}

@Service({ autoProvided: false }) // NON registrato in root: va fornito via providers
export class BrowserLanguageService implements LanguageService {}
```

> [!info] Angular 22+
> `@Service()` sostituisce `@Injectable({ providedIn: 'root' })`. La **semantica è identica**, solo più concisa. Mappa rispetto a prima della 22:
> - `@Service()` ≡ `@Injectable({ providedIn: 'root' })`
> - `@Service({ autoProvided: false })` ≡ `@Injectable()` (senza `providedIn`, da fornire a mano)
>
> Si usa `autoProvided: false` per i servizi **scambiabili** tramite [[providers]] (per esempio dietro una classe astratta usata come token).

> [!tip]
> Un `@Service()` semplice è un singleton di root. Attenzione però alla lazy injection con `injectAsync`: lì il servizio **deve** essere auto-provided, cioè un `@Service()` senza `autoProvided: false`. Vedi [[inject]] e [[providers]].

**Usato in:** [[05-state-management-services-signals]], [[09-ngrx-signal-store]], [[12-initialization-route-changes]], [[08-sustainable-architectures]]
