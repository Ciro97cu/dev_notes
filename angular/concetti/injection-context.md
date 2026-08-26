---
titolo: "Injection context"
tags: [tipo/concetto, di]
aliases: [injection context, runInInjectionContext]
---
# Injection context

L'**injection context** è l'ambito in cui [[inject]] (ed `effect`, `toSignal`, ecc.) si possono usare, perché in quel momento esiste un `Injector` attivo. Sono injection context la **costruzione** di componenti, servizi e direttive, le **factory** dei provider, e il blocco eseguito dentro `runInInjectionContext(injector, fn)`.

```ts
constructor() {
  effect(() => ...);      // ok: injection context
}
ngOnInit() {
  // inject() qui fallisce → fuori dal context
  runInInjectionContext(this.injector, () => inject(X));
}
```

> [!warning]
> Chiamare `inject()` fuori contesto (per esempio in un callback asincrono o in un metodo di lifecycle) lancia un errore. Se l'`Injector` serve più tardi, lo si cattura prima con `inject(Injector)` e lo si riusa quando occorre.

**Usato in:** [[05-state-management-services-signals]]
