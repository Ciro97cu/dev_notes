---
titolo: "delegatedSignal()"
tags: [tipo/concetto, signals, reactivity, state-management]
aliases: [delegatedSignal, delegated signal, signal delegato]
---
# delegatedSignal()

Signal **scrivibile** che non tiene il valore al proprio interno ma **delega** (affida ad altri) sia la lettura sia la scrittura — tipicamente a uno store. Risolve la perdita di reattività del [[linked-signal]]: con `linkedSignal` l'override tocca solo la copia locale, quindi serve un'azione esplicita (es. un bottone *Search*) per propagare il valore; `delegatedSignal` invece riscrive **subito** alla sorgente a ogni update.

Accetta due funzioni: una di **lettura** (come `linkedSignal`) e una di **scrittura**, invocata a ogni update per riscrivere il nuovo valore.

```ts
protected readonly filter = delegatedSignal(
  () => ({ from: this.store.from(), to: this.store.to() }), // read
  (value) => this.store.updateFilter(value.from, value.to), // write
);
```

> [!warning]
> **Non fa (ancora) parte di Angular** — ci sono discussioni in corso per aggiungerlo. Nell'example project del libro è in `delegated-signal.ts` (cartella `shared/util-common`), implementato come `linkedSignal` che fa override di `set`/`update`. Legandolo a una `form()`, conviene fare [[glossario#debounce-debouncing|debounce]] dell'input (via schema della form) per non ritriggerare la resource a ogni tasto.

**Usato in:** [[05-state-management-services-signals]]
