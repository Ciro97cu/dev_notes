---
titolo: "untracked()"
tags: [tipo/concetto, signals, reactivity]
aliases: [untracked]
---
# untracked()

`untracked()` permette di **leggere il valore di un signal senza creare una dipendenza** nel contesto reattivo corrente ([[reactive-context]]). Serve dentro un [[computed]] o un [[effect]] quando si vuole usare il valore attuale di un signal ma non si vuole che le sue variazioni future facciano rieseguire il calcolo o l'effetto.

```ts
effect(() => {
  const c = count();              // dipendenza → ri-esegue al cambio
  untracked(() => log(user()));   // legge user senza dipenderne
});
```

> [!tip]
> È utile, per esempio, per loggare o accedere a un dato di contesto ausiliario senza legare l'effetto a quel signal.

**Usato in:** [[03-reactive-design-with-signals]]
