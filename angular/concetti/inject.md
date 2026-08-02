---
titolo: "inject()"
tags: [tipo/concetto, di, services, angular-22]
aliases: [inject, dependency injection]
---
# inject()

La funzione **`inject()`** consente di ottenere una dipendenza dal sistema di Dependency Injection **senza passarla nel costruttore**: la si chiama direttamente dove serve. Va usata dentro un [[injection-context]] (i campi di una classe, il costruttore, le factory dei provider, o `runInInjectionContext`).

```ts
export class FlightService {
  private http = inject(HttpClient);
  private cfg = inject(APP_CONFIG);
}
```

> [!tip]
> È più componibile dei parametri del costruttore, perché abilita funzioni helper riusabili (guardie, resolver, le cosiddette "injectable functions"). Cosa sia effettivamente disponibile dipende dalla gerarchia dei [[providers]]; i servizi si dichiarano con [[service|@Service()]].

> [!info] Angular 22+ · injectAsync
> **`injectAsync(() => import(...).then(m => m.Svc))`** inietta un servizio in modo **lazy**: il bundle viene caricato solo alla prima chiamata della funzione restituita (che dà una `Promise`). L'opzione `prefetch` (es. `onIdle()`) permette di pre-caricarlo quando il browser è a riposo. Il servizio di destinazione dev'essere auto-provided ([[service|@Service()]]).
> ```ts
> private readonly upgradeService = injectAsync(
>   () => import('./upgrade-service').then((m) => m.UpgradeService),
>   { prefetch: () => onIdle() },
> );
> // ...
> const svc = await this.upgradeService();
> ```

**Usato in:** [[05-state-management-services-signals]], [[12-initialization-route-changes]]
